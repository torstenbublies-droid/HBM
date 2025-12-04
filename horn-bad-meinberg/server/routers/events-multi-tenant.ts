import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { events, InsertEvent } from "../../drizzle/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { nanoid } from "nanoid";

export const eventsRouter = router({
  /**
   * List all events for current tenant
   */
  list: publicProcedure
    .input(z.object({
      upcoming: z.boolean().default(true),
      limit: z.number().default(50),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      if (input.upcoming) {
        return await db
          .select()
          .from(events)
          .where(
            and(
              eq(events.tenantId, ctx.tenant.id),
              gte(events.startDate, new Date())
            )
          )
          .orderBy(events.startDate)
          .limit(input.limit);
      }

      return await db
        .select()
        .from(events)
        .where(eq(events.tenantId, ctx.tenant.id))
        .orderBy(desc(events.startDate))
        .limit(input.limit);
    }),

  /**
   * Get single event by ID (tenant-filtered)
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db
        .select()
        .from(events)
        .where(
          and(
            eq(events.id, input.id),
            eq(events.tenantId, ctx.tenant.id)
          )
        )
        .limit(1);

      return result[0] || null;
    }),

  /**
   * Create event (tenant-admin or admin only)
   */
  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      startDate: z.date(),
      endDate: z.date().optional(),
      location: z.string().optional(),
      imageUrl: z.string().optional(),
      category: z.string().optional(),
      organizerName: z.string().optional(),
      organizerContact: z.string().optional(),
      registrationUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || (ctx.user.role !== 'admin' && ctx.user.role !== 'tenant_admin')) {
        throw new Error('Unauthorized: Admin or Tenant Admin role required');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const id = nanoid();
      const eventData: InsertEvent = {
        id,
        tenantId: ctx.tenant.id,
        title: input.title,
        description: input.description || null,
        startDate: input.startDate,
        endDate: input.endDate || null,
        location: input.location || null,
        imageUrl: input.imageUrl || null,
        category: input.category || null,
        organizerName: input.organizerName || null,
        organizerContact: input.organizerContact || null,
        registrationUrl: input.registrationUrl || null,
      };

      await db.insert(events).values(eventData);

      return { id };
    }),

  /**
   * Update event (tenant-admin or admin only, tenant-filtered)
   */
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      location: z.string().optional(),
      imageUrl: z.string().optional(),
      category: z.string().optional(),
      organizerName: z.string().optional(),
      organizerContact: z.string().optional(),
      registrationUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || (ctx.user.role !== 'admin' && ctx.user.role !== 'tenant_admin')) {
        throw new Error('Unauthorized: Admin or Tenant Admin role required');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verify event belongs to current tenant
      const existing = await db
        .select()
        .from(events)
        .where(
          and(
            eq(events.id, input.id),
            eq(events.tenantId, ctx.tenant.id)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        throw new Error('Event not found or does not belong to your tenant');
      }

      const { id, ...updateData } = input;
      await db
        .update(events)
        .set(updateData)
        .where(eq(events.id, id));

      return { success: true };
    }),

  /**
   * Delete event (tenant-admin or admin only, tenant-filtered)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || (ctx.user.role !== 'admin' && ctx.user.role !== 'tenant_admin')) {
        throw new Error('Unauthorized: Admin or Tenant Admin role required');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verify event belongs to current tenant
      const existing = await db
        .select()
        .from(events)
        .where(
          and(
            eq(events.id, input.id),
            eq(events.tenantId, ctx.tenant.id)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        throw new Error('Event not found or does not belong to your tenant');
      }

      await db
        .delete(events)
        .where(eq(events.id, input.id));

      return { success: true };
    }),
});
