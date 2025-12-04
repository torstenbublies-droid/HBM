import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { stadtWebsiteScraper } from '../services/stadtWebsiteScraper';

export const stadtInfoRouter = router({
  /**
   * Holt aktuelle Mitteilungen von der Stadt-Website
   */
  getMitteilungen: publicProcedure.query(async () => {
    const mitteilungen = await stadtWebsiteScraper.getMitteilungen();
    return mitteilungen;
  }),

  /**
   * Holt Veranstaltungen von der Stadt-Website
   */
  getVeranstaltungen: publicProcedure.query(async () => {
    const veranstaltungen = await stadtWebsiteScraper.getVeranstaltungen();
    return veranstaltungen;
  }),

  /**
   * Sucht nach Informationen auf der Stadt-Website
   */
  searchInfo: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const results = await stadtWebsiteScraper.searchInfo(input.query);
      return results;
    }),

  /**
   * Holt Informationen zu einem bestimmten Thema
   */
  getThemaInfo: publicProcedure
    .input(z.object({ thema: z.string() }))
    .query(async ({ input }) => {
      const info = await stadtWebsiteScraper.getThemaInfo(input.thema);
      return info;
    }),

  /**
   * Löscht den Cache
   */
  clearCache: publicProcedure.mutation(() => {
    stadtWebsiteScraper.clearCache();
    return { success: true };
  }),
});

