/**
 * Multi-Tenant App Router
 * 
 * This is the main router that combines all multi-tenant routers.
 * It replaces the original routers.ts with tenant-aware versions.
 * 
 * All routers automatically filter by tenant and enforce data isolation.
 */

import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { performWebSearch, requiresWebSearch } from "./web-search";
import { performImprovedWebSearch } from "./web-search-improved";
import { performPerplexitySearch } from "./perplexity-search";
import { getCurrentWeather, getWeatherForecast } from "./open-meteo-weather";
import { isProximityQuery, searchNearbyPlaces, formatPlacesForPrompt } from "./google-places";
import { nanoid } from "nanoid";

// Import Multi-Tenant Routers
import { tenantRouter } from "./routers/tenant";
import { newsRouter } from "./routers/news-multi-tenant";
import { eventsRouter } from "./routers/events-multi-tenant";
import { departmentsRouter } from "./routers/departments-multi-tenant";
import { issueReportsRouter } from "./routers/issueReports-multi-tenant";
import {
  wasteScheduleRouter,
  alertsRouter,
  mayorInfoRouter,
  poisRouter,
  institutionsRouter,
  clubsRouter,
  councilMeetingsRouter,
  contactMessagesRouter,
  pushNotificationsRouter,
  userNotificationsRouter,
} from "./routers/all-remaining-routers";
import { chatRouter } from "./routers/chat";
import { directusRouter } from "./routers/directus";

export const appRouter = router({
  system: systemRouter,

  // Tenant Router (new)
  tenant: tenantRouter,

  // Auth Router (unchanged)
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Multi-Tenant Content Routers
  news: newsRouter,
  events: eventsRouter,
  departments: departmentsRouter,
  issueReports: issueReportsRouter,
  waste: wasteScheduleRouter,
  alerts: alertsRouter,
  mayor: mayorInfoRouter,
  pois: poisRouter,
  institutions: institutionsRouter,
  clubs: clubsRouter,
  council: councilMeetingsRouter,
  contact: contactMessagesRouter,
  pushNotifications: pushNotificationsRouter,
  notifications: userNotificationsRouter,

  // Chat Router (tenant-aware version)
  chat: chatRouter,

  // Directus CMS Router (tenant-aware)
  directus: directusRouter,

  // Old Chat Router (deprecated, keeping for backward compatibility)
  chatOld: router({
    send: publicProcedure
      .input(z.object({
        message: z.string(),
        sessionId: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { isLocalQuery, searchLocalContext, formatContextForPrompt, createLocalSystemPrompt, createGlobalSystemPrompt, generateDeepLinks } = await import('./chat-service');
          
          // Get tenant-specific chatbot name
          const chatbotName = ctx.tenant.chatbotName || 'Chatbot';
          const systemPromptOverride = ctx.tenant.chatbotSystemPrompt;
          
          // Prüfe, ob es eine lokale oder globale Frage ist
          const isLocal = isLocalQuery(input.message);
          
          let systemPrompt: string;
          let webSearchResults = '';
          
          // Prüfe, ob es eine Umkreissuche ist (Google Places)
          const isProximity = isProximityQuery(input.message);
          let placesResults = '';
          
          if (isProximity) {
            console.log('[Chat] Proximity search triggered for:', input.message);
            const placesData = await searchNearbyPlaces(input.message);
            if (placesData) {
              placesResults = formatPlacesForPrompt(placesData);
              console.log('[Chat] Places results:', placesResults.substring(0, 200));
            }
          }
          
          // Prüfe, ob Web-Suche benötigt wird
          const needsWebSearch = requiresWebSearch(input.message);
          
          if (needsWebSearch) {
            console.log('[Chat] Web search triggered for:', input.message);
            
            webSearchResults = await performPerplexitySearch(input.message);
            
            if (!webSearchResults) {
              console.log('[Chat] Perplexity returned no results, trying Google scraping...');
              webSearchResults = await performImprovedWebSearch(input.message);
            }
            
            if (!webSearchResults) {
              console.log('[Chat] Google scraping returned no results, trying DuckDuckGo...');
              webSearchResults = await performWebSearch(input.message);
            }
            
            console.log('[Chat] Web search results:', webSearchResults.substring(0, 200));
          }
          
          if (isLocal) {
            // Lokale Frage: Durchsuche Datenbank (tenant-filtered)
            const localContext = await searchLocalContext(input.message, ctx.tenant.id);
            const formattedContext = formatContextForPrompt(localContext);
            
            let contextWithExtras = formattedContext;
            
            if (placesResults) {
              contextWithExtras += '\n\n' + placesResults;
            }
            
            if (webSearchResults) {
              contextWithExtras += '\n\n**AKTUELLE INFORMATIONEN AUS DEM INTERNET:**\n' + webSearchResults;
            }
            
            const contextWithWebSearch = contextWithExtras;
            
            systemPrompt = systemPromptOverride || createLocalSystemPrompt(chatbotName, ctx.tenant.name);
            
            const response = await invokeLLM({
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Kontext:\n${contextWithWebSearch}\n\nFrage: ${input.message}` }
              ],
              temperature: 0.7,
            });
            
            const deepLinks = generateDeepLinks(response, localContext);
            
            // Save chat log (tenant-scoped)
            // TODO: Implement chat log saving with tenantId
            
            return {
              response,
              deepLinks,
              isLocal: true,
            };
          } else {
            // Globale Frage: Nutze LLM mit Web-Suche
            let contextWithWebSearch = '';
            
            if (placesResults) {
              contextWithWebSearch += placesResults + '\n\n';
            }
            
            if (webSearchResults) {
              contextWithWebSearch += '**AKTUELLE INFORMATIONEN AUS DEM INTERNET:**\n' + webSearchResults;
            }
            
            systemPrompt = systemPromptOverride || createGlobalSystemPrompt(chatbotName);
            
            const userMessage = contextWithWebSearch 
              ? `Kontext:\n${contextWithWebSearch}\n\nFrage: ${input.message}`
              : input.message;
            
            const response = await invokeLLM({
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
              ],
              temperature: 0.8,
            });
            
            // Save chat log (tenant-scoped)
            // TODO: Implement chat log saving with tenantId
            
            return {
              response,
              deepLinks: [],
              isLocal: false,
            };
          }
        } catch (error) {
          console.error('[Chat] Error:', error);
          throw new Error('Fehler beim Verarbeiten der Nachricht');
        }
      }),
  }),

  // Weather Router (unchanged, uses tenant coordinates from context)
  weather: router({
    current: publicProcedure
      .input(z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      }).optional())
      .query(async ({ input, ctx }) => {
        // Use tenant coordinates if not provided
        const lat = input?.latitude || parseFloat(ctx.tenant.weatherLat || '51.8667');
        const lon = input?.longitude || parseFloat(ctx.tenant.weatherLon || '9.1167');
        
        return getCurrentWeather(lat, lon);
      }),
    
    forecast: publicProcedure
      .input(z.object({
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        days: z.number().default(7),
      }).optional())
      .query(async ({ input, ctx }) => {
        // Use tenant coordinates if not provided
        const lat = input?.latitude || parseFloat(ctx.tenant.weatherLat || '51.8667');
        const lon = input?.longitude || parseFloat(ctx.tenant.weatherLon || '9.1167');
        const days = input?.days || 7;
        
        return getWeatherForecast(lat, lon, days);
      }),
  }),
});

export type AppRouter = typeof appRouter;
