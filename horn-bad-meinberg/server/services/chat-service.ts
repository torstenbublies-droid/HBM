import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'buergerapp',
  user: 'buergerapp_user',
  password: 'buergerapp_dev_2025',
});

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '';
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  messages: ChatMessage[];
  lastActivity: number;
}

interface TenantData {
  id: string;
  name: string;
  slug: string;
  contactEmail: string | null;
  contactPhone: string | null;
  contactAddress: string | null;
  chatbotName: string | null;
  weatherLat: string | null;
  weatherLon: string | null;
  mayorName: string | null;
  mayorOfficeHours: string | null;
}

// In-memory session storage
const sessions = new Map<string, ChatSession>();

// Clean up old sessions (older than 1 hour)
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity > oneHour) {
      sessions.delete(sessionId);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes

/**
 * Question types for routing
 */
type QuestionType = 'proximity' | 'local' | 'global';

/**
 * Determine question type: proximity search, local city info, or general
 * 
 * - proximity: Umkreissuche (Zahnarzt, Apotheke, Restaurant) -> Google Places API
 * - local: Lokale Stadt-Infos (Bürgermeister, Öffnungszeiten, Vereine) -> Perplexity mit Domain-Filter
 * - global: Allgemeine Fragen (Bundeskanzler, Bitcoin) -> Perplexity ohne Filter
 */
function getQuestionType(message: string, cityName: string): QuestionType {
  const lowerMessage = message.toLowerCase();
  
  // Shopping/retail questions should use proximity search
  const shoppingKeywords = [
    'einkaufsmöglichkeit',
    'einkaufen',
    'geschäft',
    'laden',
    'supermarkt',
    'markt',
    'shopping',
    'lebensmittel',
    'discounter',
    'discount',
    'aldi',
    'lidl',
    'penny',
    'netto',
    'rewe',
    'edeka',
  ];
  
  const hasShoppingKeyword = shoppingKeywords.some(keyword => lowerMessage.includes(keyword));
  
  // If it's a shopping question with location context, use proximity
  if (hasShoppingKeyword) {
    return 'proximity';
  }
  
  // Local city information keywords
  const localKeywords = [
    'bürgermeister',
    'öffnungszeit',
    'geöffnet',
    'rathaus',
    'verwaltung',
    'kontakt',
    'telefon',
    'email',
    'adresse',
    'kontaktieren',
    'erreichen',
    'anrufen',
    'schreiben',
    'verein',
    'club',
    'schule',
    'kindergarten',
    'kita',
    'bildung',
    'sehenswürdigkeit',
    'sehenswürdigkeiten',
    'ausflug',
    'ausflüge',
    'aktivität',
    'aktivitäten',
    'attraktionen',
    'attraktion',
    'was kann man',
    'was gibt es zu',
    'tipps',
    'empfehlung',
    'empfehlungen',
    'interessant',
    'besichtigen',
    'besuchen',
    'erleben',
    'unternehmen',
  ];
  
  const hasLocalKeyword = localKeywords.some(keyword => lowerMessage.includes(keyword));
  
  // If it's a local question, treat as local
  if (hasLocalKeyword) {
    return 'local';
  }
  
  // Proximity search keywords (Umkreissuche)
  const proximityKeywords = [
    'zahnarzt',
    'arzt',
    'apotheke',
    'krankenhaus',
    'restaurant',
    'café',
    'cafe',
    'tankstelle',
    'supermarkt',
    'einkaufen',
    'laden',
    'geschäft',
    'bank',
    'geldautomat',
    'atm',
    'frisör',
    'friseur',
    'hotel',
    'übernachtung',
  ];
  
  // Check for proximity search
  const hasProximityKeyword = proximityKeywords.some(keyword => lowerMessage.includes(keyword));
  const hasProximityPhrase = [
    'wo finde',
    'wo gibt es',
    'wo ist der nächste',
    'wo ist die nächste',
    'nächste',
    'nächster',
    'nächstes',
    'in der nähe',
  ].some(phrase => lowerMessage.includes(phrase));
  
  if (hasProximityKeyword && hasProximityPhrase) {
    return 'proximity';
  }
  
  // Global keywords - topics clearly not related to local city
  const globalKeywords = [
    'bundeskanzler',
    'bundesregierung',
    'bundestag',
    'bundesrat',
    'bundespräsident',
    'minister',
    'kanzler',
    'bitcoin',
    'kryptowährung',
    'aktie',
    'börse',
    'dax',
    'weltweit',
    'international',
    'europa',
    'usa',
    'china',
    'russland',
    'krieg',
    'konflikt',
    'eiffelturm',
    'paris',
    'london',
    'berlin',
    'hauptstadt',
    'präsident',
    'könig',
    'queen',
    'weltkrieg',
    'geschichte',
    'erfinder',
    'entdecker',
    'wissenschaftler',
    'einstein',
    'newton',
  ];
  
  const hasGlobalKeyword = globalKeywords.some(keyword => lowerMessage.includes(keyword));
  const lowerCity = cityName.toLowerCase();
  
  if (hasGlobalKeyword && !lowerMessage.includes(lowerCity)) {
    return 'global';
  }
  
  // Default: local
  return 'local';
}

/**
 * Determine if question is about local city or general (DEPRECATED - use getQuestionType)
 * 
 * WICHTIG: Lokale Fragen werden standardmäßig angenommen, es sei denn,
 * es handelt sich eindeutig um eine globale Frage (z.B. Bundeskanzler, Bitcoin)
 */
function isLocalQuestion(message: string, cityName: string): boolean {
  const lowerMessage = message.toLowerCase();
  const lowerCity = cityName.toLowerCase();
  
  // Eindeutig globale Keywords (Politik, Wirtschaft, Wissenschaft, etc.)
  const globalKeywords = [
    'bundeskanzler',
    'bundesregierung',
    'bundestag',
    'bundesrat',
    'bundespräsident',
    'minister',
    'kanzler',
    'deutschland',
    'berlin',
    'hauptstadt',
    'bitcoin',
    'kryptowährung',
    'aktie',
    'börse',
    'dax',
    'euro',
    'dollar',
    'währung',
    'weltweit',
    'international',
    'europa',
    'usa',
    'china',
    'russland',
    'krieg',
    'konflikt',
    'wissenschaft',
    'forschung',
    'universum',
    'planet',
    'wie funktioniert',
    'was bedeutet',
    'wer ist',
    'wer war',
    'geschichte von',
    'erfinder',
    'entdecker',
  ];

  // Prüfe ob eindeutig globale Frage
  const hasGlobalKeyword = globalKeywords.some(keyword => lowerMessage.includes(keyword));
  
  // Wenn globales Keyword gefunden UND kein Stadt-Name erwähnt -> Global
  if (hasGlobalKeyword && !lowerMessage.includes(lowerCity)) {
    return false;
  }

  // Keywords die auf lokale Fragen hinweisen
  const localKeywords = [
    lowerCity,
    'schieder',
    'schwalenberg',
    'hier',
    'bei uns',
    'unsere stadt',
    'in der stadt',
    'stadt',
    'rathaus',
    'bürgermeister',
    'verwaltung',
    'amt',
    'abteilung',
    'behörde',
    'bürgerbüro',
    'veranstaltung',
    'event',
    'termin',
    'öffnungszeiten',
    'kontakt',
    'ansprechpartner',
    'telefon',
    'adresse',
    'news',
    'nachrichten',
    'aktuell',
    'verein',
    'club',
    'schule',
    'kindergarten',
    'kita',
    'bücherei',
    'bibliothek',
    'freibad',
    'schwimmbad',
    'badeanstalt',
    'sporthalle',
    'sportplatz',
    'friedhof',
    'kirche',
    'museum',
    'theater',
    'kino',
    'restaurant',
    'café',
    'arzt',
    'zahnarzt',
    'apotheke',
    'krankenhaus',
    'polizei',
    'feuerwehr',
    'notfall',
    'tankstelle',
    'parkplatz',
    'bahnhof',
    'bushaltestelle',
    'müll',
    'abfall',
    'recycling',
    'sperrmüll',
    'gelbe tonne',
    'biotonne',
    'nächste',
    'nächster',
    'nächstes',
    'wo finde',
    'wo gibt es',
    'wo ist',
    'wie komme ich',
    'wie erreiche',
  ];

  const hasLocalKeyword = localKeywords.some(keyword => lowerMessage.includes(keyword));
  
  if (hasLocalKeyword) {
    return true;
  }

  // WICHTIG: Standardmäßig als LOKAL behandeln
  // Nur wenn eindeutig global (siehe oben) -> false
  return true;
}

/**
 * Load tenant data from database
 */
async function getTenantData(tenantId: string): Promise<TenantData | null> {
  try {
    const result = await pool.query(
      'SELECT id, name, slug, "contactEmail", "contactPhone", "contactAddress", "chatbotName", "weatherLat", "weatherLon", mayor_name, mayor_office_hours FROM tenants WHERE id = $1',
      [tenantId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      contactEmail: row.contactEmail,
      contactPhone: row.contactPhone,
      contactAddress: row.contactAddress,
      chatbotName: row.chatbotName,
      weatherLat: row.weatherLat,
      weatherLon: row.weatherLon,
      mayorName: row.mayor_name,
      mayorOfficeHours: row.mayor_office_hours,
    };
  } catch (error) {
    console.error('[Chat] Error loading tenant data:', error);
    return null;
  }
}

/**
 * Load local context data (news, events, departments, employees, clubs)
 */
async function getLocalContext(tenantId: string): Promise<string> {
  try {
    const [newsResult, eventsResult, departmentsResult, clubsResult] = await Promise.all([
      // Latest 5 news
      pool.query(
        'SELECT title, "bodyMD" as content, "publishedAt" as published_at FROM news WHERE "tenantId" = $1 ORDER BY "publishedAt" DESC LIMIT 5',
        [tenantId]
      ),
      
      // Upcoming 5 events
      pool.query(
        'SELECT title, description, start_date, location FROM events WHERE tenant_id = $1 AND start_date >= NOW() ORDER BY start_date ASC LIMIT 5',
        [tenantId]
      ),
      
      // All departments
      pool.query(
        'SELECT name FROM departments WHERE tenant_id = $1',
        [tenantId]
      ),
      
      // All clubs
      pool.query(
        'SELECT c.name, c.contact_person, c.phone, c.email, c.website, cc.name as category FROM clubs c LEFT JOIN club_categories cc ON c.category_id = cc.id WHERE c.tenant_id = $1',
        [tenantId]
      ),
    ]);
    
    const newsData = newsResult.rows;
    const eventsData = eventsResult.rows;
    const departmentsData = departmentsResult.rows;
    const clubsData = clubsResult.rows;

    let context = '';

    // Format news
    if (newsData.length > 0) {
      context += '\n=== AKTUELLE NACHRICHTEN ===\n';
      newsData.forEach(n => {
        context += `📰 ${n.title}\n`;
        if (n.published_at) {
          context += `   Datum: ${formatDate(n.published_at)}\n`;
        }
        if (n.content) {
          const preview = n.content.substring(0, 200).replace(/\n/g, ' ');
          context += `   ${preview}...\n`;
        }
        context += '\n';
      });
    }

    // Format events
    if (eventsData.length > 0) {
      context += '\n=== KOMMENDE VERANSTALTUNGEN ===\n';
      eventsData.forEach(e => {
        context += `📅 ${e.title}\n`;
        if (e.start_date) {
          context += `   Datum: ${formatDate(e.start_date)}\n`;
        }
        if (e.location) {
          context += `   📍 Ort: ${e.location}\n`;
        }
        if (e.description) {
          const preview = e.description.substring(0, 150).replace(/\n/g, ' ');
          context += `   ${preview}...\n`;
        }
        context += '\n';
      });
    }

    // Format departments
    if (departmentsData.length > 0) {
      context += '\n=== ÄMTER & ABTEILUNGEN ===\n';
      departmentsData.forEach(d => {
        context += `🏛️ ${d.name}\n`;
        context += '\n';
      });
    }

    // Format clubs
    if (clubsData.length > 0) {
      context += '\n=== VEREINE ===\n';
      const categories = [...new Set(clubsData.map(c => c.category).filter(Boolean))];
      categories.forEach(category => {
        context += `\n${category}:\n`;
        const categoryClubs = clubsData.filter(c => c.category === category);
        categoryClubs.forEach(club => {
          context += `  🏆 ${club.name}\n`;
          if (club.contact_person) {
            context += `     Ansprechpartner: ${club.contact_person}\n`;
          }
          if (club.phone) {
            context += `     📞 ${club.phone}\n`;
          }
          if (club.email) {
            context += `     📧 ${club.email}\n`;
          }
          if (club.website) {
            context += `     🌐 ${club.website}\n`;
          }
        });
      });
    }

    return context;
  } catch (error) {
    console.error('[Chat] Error loading local context:', error);
    return '';
  }
}

/**
 * Format date to German format
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Create system prompt for local questions
 */
function createLocalSystemPrompt(tenantData: TenantData, contextData: string): string {
  const chatbotName = tenantData.chatbotName || 'Stadtbot';
  const cityName = tenantData.name;
  
  return `Du bist "${chatbotName}", der digitale Assistent für ${cityName}.

=== DEINE GRUNDREGELN ===

1. **Lokaler Bezug - SEHR WICHTIG:**
   - Du beantwortest Fragen IMMER im Kontext von ${cityName}
   - Wenn jemand fragt "Wie heißt der Bürgermeister?" ist IMMER der Bürgermeister von ${cityName} gemeint
   - Wenn jemand fragt "Öffnungszeiten Freibad" ist IMMER das Freibad in ${cityName} gemeint
   - Wenn jemand fragt "Wo finde ich einen Zahnarzt?" sind Zahnärzte im Umkreis von ca. 8km um ${cityName} gemeint
   - Du musst NICHT explizit nach dem Stadt-Namen fragen - der lokale Bezug ist IMMER implizit

2. **Umkreissuche (8km Radius):**
   - Fragen nach Ärzten, Zahnärzten, Apotheken, Restaurants, Tankstellen, etc. beziehen sich auf den Umkreis von ca. 8km
   - Nutze die bereitgestellten Daten oder empfehle eine Suche auf Google Maps
   - Format: "In ${cityName} und Umgebung finden Sie..."

3. **Hilfreiche Antworten - SEHR WICHTIG:**
   - Du hast Zugriff auf das Internet und kannst AKTIV recherchieren
   - Gib IMMER **konkrete, detaillierte Informationen** aus deiner Recherche
   - NIEMALS nur auf Webseiten oder Kontaktstellen verweisen
   - NIEMALS sagen "Ich empfehle dir, die Website zu besuchen" oder "Kontaktiere die Touristinfo"
   - Wenn du Informationen findest, präsentiere sie DIREKT und VOLLSTÄNDIG
   - Nutze die bereitgestellten **AKTUELLEN INFORMATIONEN** für präzise Antworten
   - Wenn du trotz Recherche keine konkreten Infos findest, sage das ehrlich, aber gib trotzdem allgemeine Tipps

3a. **ANTI-HALLUZINATION - ABSOLUT KRITISCH:**
   - NIEMALS Informationen erfinden oder raten
   - NIEMALS konkrete Adressen, Öffnungszeiten oder Namen nennen, die du nicht verifiziert hast
   - Wenn du keine verifizierten Daten findest, sage EHRLICH: "Ich habe keine aktuellen Informationen gefunden"
   - Bei Fragen nach konkreten Orten (Geschäfte, Restaurants, etc.) NUR verifizierte Daten aus deiner Recherche verwenden
   - Lieber KEINE Antwort als eine FALSCHE Antwort

4. **Formatierung:**
   - Nutze IMMER Icons für bessere Lesbarkeit:
     * 📍 für Adressen
     * 🕐 für Öffnungszeiten
     * 📞 für Telefonnummern
     * 📧 für E-Mail-Adressen
     * 📅 für Termine/Veranstaltungen
     * 🏛️ für Rathaus/Verwaltung
     * 👥 für Personen/Ansprechpartner
     * 🏆 für Vereine
     * 📰 für News
   - Strukturiere Antworten mit Aufzählungen und Absätzen

5. **Sprache & Ton:**
   - Antworte auf Deutsch, freundlich, hilfsbereit und gut verständlich
   - Duze die Bürger (wie in der App üblich)
   - Sei ehrlich, wenn du etwas nicht weißt - das ist besser als falsche Informationen

=== STADT-INFORMATIONEN (VERIFIZIERTE DATEN - IMMER VERWENDEN!) ===

⚠️ WICHTIG: Diese Informationen sind OFFIZIELL und AKTUELL aus der Datenbank.
Verwende AUSSCHLIESSLICH diese Daten für Fragen zu Rathaus, Bürgermeister und Öffnungszeiten!
Suche NICHT im Web nach diesen Informationen - die Daten hier sind die einzige Wahrheit!

- **Stadt:** ${cityName}
${tenantData.mayorName ? `- **Bürgermeister:** ${tenantData.mayorName}` : ''}
- **Rathaus-Adresse:** ${tenantData.contactAddress || 'Nicht verfügbar'}
- **Telefon:** ${tenantData.contactPhone || 'Nicht verfügbar'}
- **E-Mail:** ${tenantData.contactEmail || 'Nicht verfügbar'}
${tenantData.mayorOfficeHours ? `- **Öffnungszeiten Rathaus:** ${tenantData.mayorOfficeHours}` : ''}
${tenantData.weatherLat && tenantData.weatherLon ? `- **Koordinaten:** ${tenantData.weatherLat}, ${tenantData.weatherLon}` : ''}

=== AKTUELLE DATEN ===
${contextData || 'Keine aktuellen Daten verfügbar.'}

Antworte jetzt auf die Frage des Bürgers. Denke daran: Der lokale Bezug zu ${cityName} ist IMMER implizit!`;
}

/**
 * Create system prompt for global questions
 */
function createGlobalSystemPrompt(tenantData: TenantData): string {
  const chatbotName = tenantData.chatbotName || 'Stadtbot';
  const cityName = tenantData.name;
  
  return `Du bist "${chatbotName}", ein hilfreicher Assistent.

Beantworte die Frage präzise und informativ:
- Nutze aktuelle Informationen aus dem Web
- Gib direkte, klare Antworten ohne unnötige Vorbemerkungen
- Sei objektiv und faktisch korrekt
- Antworte auf Deutsch in einem freundlichen, natürlichen Ton
- Duze den Nutzer

Antworte jetzt auf die Frage.`;
}

/**
 * Call Perplexity API
 */
async function callPerplexity(messages: ChatMessage[], searchDomains?: string | string[]): Promise<string> {
  try {
    const body: any = {
      model: 'sonar',
      messages: messages,
      temperature: 0.2,
      max_tokens: 2000,
    };

    // Add search_domain_filter for local questions
    if (searchDomains) {
      body.search_domain_filter = Array.isArray(searchDomains) ? searchDomains : [searchDomains];
    }

    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Chat] Perplexity API error: ${response.status} - ${errorText}`);
      
      // Return user-friendly error message instead of throwing
      if (response.status === 429) {
        return 'Entschuldigung, ich bin gerade überlastet. Bitte versuche es in ein paar Sekunden erneut.';
      } else if (response.status === 400) {
        return 'Entschuldigung, ich konnte deine Frage nicht verarbeiten. Bitte formuliere sie anders.';
      } else {
        return 'Entschuldigung, es gab einen Fehler bei der Verarbeitung deiner Anfrage. Bitte versuche es erneut.';
      }
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('[Chat] Invalid Perplexity response:', data);
      return 'Entschuldigung, ich habe keine Antwort erhalten. Bitte versuche es erneut.';
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('[Chat] Perplexity API error:', error);
    return 'Entschuldigung, es gab einen technischen Fehler. Bitte versuche es in ein paar Sekunden erneut.';
  }
}

/**
 * Get chat response
 */
export async function getChatResponse(
  tenantId: string,
  tenantName: string,
  tenantWebsite: string,
  chatbotName: string,
  message: string,
  sessionId: string
): Promise<string> {
  try {
    // Load tenant data
    const tenantData = await getTenantData(tenantId);
    if (!tenantData) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }

    // Get or create session
    let session = sessions.get(sessionId);
    if (!session) {
      session = {
        messages: [],
        lastActivity: Date.now(),
      };
      sessions.set(sessionId, session);
    }

    // Update last activity
    session.lastActivity = Date.now();

    // Determine question type FIRST (before adding to session)
    const questionType = getQuestionType(message, tenantName);

    // For proximity searches, clear session to avoid using old context
    if (questionType === 'proximity') {
      session.messages = [];
    }

    // Add user message
    session.messages.push({
      role: 'user',
      content: message,
    });

    // Keep only last 6 messages (3 exchanges) to avoid context overflow
    if (session.messages.length > 6) {
      session.messages = session.messages.slice(-6);
    }

    console.log(`[Chat] Question type: ${questionType.toUpperCase()} - "${message}"`);

    let systemPrompt: string;
    let searchDomain: string | undefined;
    let response: string;

    if (questionType === 'proximity') {
      // PROXIMITY SEARCH - Use Google Places API
      const cityName = tenantData.name;
      
      // Import Google Places functions
      const { searchNearbyPlaces, extractPlaceType, mapPlaceType, formatPlacesForChatbot } = await import('./google-places');
      
      // Extract place type from message
      const germanPlaceType = extractPlaceType(message);
      
      if (!germanPlaceType) {
        // Fallback to Google Maps link if we can't determine place type
        const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(message)}+near+${encodeURIComponent(cityName)}`;
        response = `📍 Ich konnte den gesuchten Ort-Typ nicht genau bestimmen. Hier ist ein Google Maps Link:

🗺️ [Auf Google Maps suchen](${googleMapsUrl})`;
      } else {
        // Get coordinates from tenant data
        const latitude = parseFloat(tenantData.weatherLat || '51.9');
        const longitude = parseFloat(tenantData.weatherLon || '9.0');
        
        // Map German type to Google Places API type
        const placeType = mapPlaceType(germanPlaceType);
        
        try {
          // Search nearby places (8km radius)
          const places = await searchNearbyPlaces(latitude, longitude, 8000, placeType, 5);
          
          // Format results for chatbot
          response = formatPlacesForChatbot(places, cityName);
        } catch (error) {
          console.error('[Chat] Error searching places:', error);
          // Fallback to Google Maps link on error
          const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(germanPlaceType)}+near+${encodeURIComponent(cityName)}`;
          response = `📍 Entschuldigung, es gab einen Fehler bei der Suche. Hier ist ein Google Maps Link:

🗺️ [Auf Google Maps suchen](${googleMapsUrl})`;
        }
      }
      
    } else if (questionType === 'local') {
      // LOCAL QUESTION - First try database search
      const { searchLocalDatabase } = await import('./local-search-service');
      const localResults = await searchLocalDatabase(tenantId, message);
      
      if (localResults.length > 0) {
        // We found local data - use it directly without Perplexity
        console.log(`[Chat] Found ${localResults.length} local results in database`);
        
        // Format results
        let formattedResponse = '';
        
        if (localResults.length === 1) {
          // Single result - show directly
          formattedResponse = localResults[0].content;
        } else {
          // Multiple results - show as list
          formattedResponse = 'Hier sind die Informationen, die ich gefunden habe:\n\n';
          localResults.forEach((result, index) => {
            formattedResponse += `**${result.title}**\n${result.content}\n\n`;
          });
        }
        
        response = formattedResponse;
      } else {
        // No local data found - fallback to Perplexity
        console.log('[Chat] No local results found, using Perplexity');
        const contextData = await getLocalContext(tenantId);
        systemPrompt = createLocalSystemPrompt(tenantData, contextData);
      
      // Use search_domain_filter for local questions
      // For Schieder-Schwalenberg, use official website + related sites
      let searchDomains: string[] = [];
      if (tenantWebsite) {
        searchDomains.push(tenantWebsite.replace(/^https?:\/\//, '').replace(/\/$/, ''));
      } else if (tenantData.slug === 'schieder') {
        searchDomains = [
          'www.schieder-schwalenberg.de',
          'freibad-schieder-schwalenberg.net',
          'tourismus.schieder-schwalenberg.de',
        ];
      }
      
      // For Perplexity, send only system + current user message
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ];
      
      response = await callPerplexity(messages, searchDomains.length > 0 ? searchDomains : undefined);
      }
      
    } else {
      // GLOBAL QUESTION - General web search
      systemPrompt = createGlobalSystemPrompt(tenantData);
      
      // For Perplexity, we need to ensure messages alternate correctly
      // If this is the first message, we only send system + user
      // Perplexity will handle it correctly
      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }, // Send only current message
      ];
      
      response = await callPerplexity(messages);
    }

    // Add assistant response to session
    session.messages.push({
      role: 'assistant',
      content: response,
    });

    return response;
  } catch (error) {
    console.error('[Chat] Error generating response:', error);
    throw error;
  }
}
