import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { tenants } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const tenantRouter = router({
  /**
   * Get current tenant info
   */
  current: publicProcedure.query(async ({ ctx }) => {
    return ctx.tenant;
  }),

  /**
   * List all active tenants
   */
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    return await db
      .select()
      .from(tenants)
      .where(eq(tenants.isActive, true))
      .orderBy(tenants.name);
  }),

  /**
   * Get tenant by slug
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      const result = await db
        .select()
        .from(tenants)
        .where(eq(tenants.slug, input.slug))
        .limit(1);

      return result[0] || null;
    }),
});
