import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { news, InsertNews } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export const newsRouter = router({
  /**
   * List all news for current tenant
   */
  list: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      limit: z.number().default(50),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      let query = db
        .select()
        .from(news)
        .where(eq(news.tenantId, ctx.tenant.id))
        .orderBy(desc(news.publishedAt))
        .limit(input.limit);

      if (input.category) {
        query = db
          .select()
          .from(news)
          .where(
            and(
              eq(news.tenantId, ctx.tenant.id),
              eq(news.category, input.category)
            )
          )
          .orderBy(desc(news.publishedAt))
          .limit(input.limit);
      }

      return await query;
    }),

  /**
   * Get single news by ID (tenant-filtered)
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db
        .select()
        .from(news)
        .where(
          and(
            eq(news.id, input.id),
            eq(news.tenantId, ctx.tenant.id)
          )
        )
        .limit(1);

      return result[0] || null;
    }),

  /**
   * Create news (tenant-admin or admin only)
   */
  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      teaser: z.string().optional(),
      bodyMD: z.string().optional(),
      imageUrl: z.string().optional(),
      category: z.string().optional(),
      publishedAt: z.date(),
      sourceUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || (ctx.user.role !== 'admin' && ctx.user.role !== 'tenant_admin')) {
        throw new Error('Unauthorized: Admin or Tenant Admin role required');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const id = nanoid();
      const newsData: InsertNews = {
        id,
        tenantId: ctx.tenant.id,
        title: input.title,
        teaser: input.teaser || null,
        bodyMD: input.bodyMD || null,
        imageUrl: input.imageUrl || null,
        category: input.category || null,
        publishedAt: input.publishedAt,
        sourceUrl: input.sourceUrl || null,
      };

      await db.insert(news).values(newsData);

      return { id };
    }),

  /**
   * Update news (tenant-admin or admin only, tenant-filtered)
   */
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      teaser: z.string().optional(),
      bodyMD: z.string().optional(),
      imageUrl: z.string().optional(),
      category: z.string().optional(),
      publishedAt: z.date().optional(),
      sourceUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || (ctx.user.role !== 'admin' && ctx.user.role !== 'tenant_admin')) {
        throw new Error('Unauthorized: Admin or Tenant Admin role required');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verify news belongs to current tenant
      const existing = await db
        .select()
        .from(news)
        .where(
          and(
            eq(news.id, input.id),
            eq(news.tenantId, ctx.tenant.id)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        throw new Error('News not found or does not belong to your tenant');
      }

      const { id, ...updateData } = input;
      await db
        .update(news)
        .set(updateData)
        .where(eq(news.id, id));

      return { success: true };
    }),

  /**
   * Delete news (tenant-admin or admin only, tenant-filtered)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || (ctx.user.role !== 'admin' && ctx.user.role !== 'tenant_admin')) {
        throw new Error('Unauthorized: Admin or Tenant Admin role required');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verify news belongs to current tenant
      const existing = await db
        .select()
        .from(news)
        .where(
          and(
            eq(news.id, input.id),
            eq(news.tenantId, ctx.tenant.id)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        throw new Error('News not found or does not belong to your tenant');
      }

      await db
        .delete(news)
        .where(eq(news.id, input.id));

      return { success: true };
    }),
});
