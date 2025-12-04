/**
 * Multi-Tenant Routers - Remaining Content Routers
 * 
 * This file contains all remaining content routers with tenant-filtering.
 * Each router follows the same pattern:
 * - List: Filter by ctx.tenant.id
 * - GetById: Filter by ctx.tenant.id
 * - Create: Set tenantId from ctx.tenant.id
 * - Update: Verify tenant ownership
 * - Delete: Verify tenant ownership
 * 
 * Routers included:
 * - wasteSchedule
 * - alerts
 * - mayorInfo
 * - pois
 * - institutions
 * - clubs
 * - councilMeetings
 * - contactMessages
 * - pushNotifications
 * - userNotifications
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { 
  wasteSchedule, 
  alerts, 
  mayorInfo, 
  pois, 
  institutions, 
  clubs, 
  councilMeetings,
  contactMessages,
  pushNotifications,
  userNotifications,
} from "../../drizzle/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { nanoid } from "nanoid";

// ===== WASTE SCHEDULE ROUTER =====
export const wasteScheduleRouter = router({
  list: publicProcedure
    .input(z.object({
      upcoming: z.boolean().default(true),
      limit: z.number().default(100),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      if (input.upcoming) {
        return await db
          .select()
          .from(wasteSchedule)
          .where(
            and(
              eq(wasteSchedule.tenantId, ctx.tenant.id),
              gte(wasteSchedule.collectionDate, new Date())
            )
          )
          .orderBy(wasteSchedule.collectionDate)
          .limit(input.limit);
      }

      return await db
        .select()
        .from(wasteSchedule)
        .where(eq(wasteSchedule.tenantId, ctx.tenant.id))
        .orderBy(desc(wasteSchedule.collectionDate))
        .limit(input.limit);
    }),

  create: protectedProcedure
    .input(z.object({
      wasteType: z.string(),
      collectionDate: z.date(),
      district: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || (ctx.user.role !== 'admin' && ctx.user.role !== 'tenant_admin')) {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const id = nanoid();
      await db.insert(wasteSchedule).values({
        id,
        tenantId: ctx.tenant.id,
        ...input,
      });

      return { id };
    }),
});

// ===== ALERTS ROUTER =====
export const alertsRouter = router({
  list: publicProcedure
    .input(z.object({
      active: z.boolean().default(true),
      limit: z.number().default(50),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      if (input.active) {
        return await db
          .select()
          .from(alerts)
          .where(
            and(
              eq(alerts.tenantId, ctx.tenant.id),
              eq(alerts.isActive, true)
            )
          )
          .orderBy(desc(alerts.createdAt))
          .limit(input.limit);
      }

      return await db
        .select()
        .from(alerts)
        .where(eq(alerts.tenantId, ctx.tenant.id))
        .orderBy(desc(alerts.createdAt))
        .limit(input.limit);
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      message: z.string(),
      severity: z.enum(['info', 'warning', 'critical']),
      category: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || (ctx.user.role !== 'admin' && ctx.user.role !== 'tenant_admin')) {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const id = nanoid();
      await db.insert(alerts).values({
        id,
        tenantId: ctx.tenant.id,
        ...input,
        isActive: true,
        createdAt: new Date(),
      });

      return { id };
    }),

  deactivate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || (ctx.user.role !== 'admin' && ctx.user.role !== 'tenant_admin')) {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const existing = await db
        .select()
        .from(alerts)
        .where(
          and(
            eq(alerts.id, input.id),
            eq(alerts.tenantId, ctx.tenant.id)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        throw new Error('Alert not found or does not belong to your tenant');
      }

      await db
        .update(alerts)
        .set({ isActive: false })
        .where(eq(alerts.id, input.id));

      return { success: true };
    }),
});

// ===== MAYOR INFO ROUTER =====
export const mayorInfoRouter = router({
  info: publicProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db
        .select()
        .from(mayorInfo)
        .where(eq(mayorInfo.tenantId, ctx.tenant.id))
        .limit(1);

      return result[0] || null;
    }),

  update: protectedProcedure
    .input(z.object({
      name: z.string(),
      title: z.string().optional(),
      bio: z.string().optional(),
      imageUrl: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || (ctx.user.role !== 'admin' && ctx.user.role !== 'tenant_admin')) {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const existing = await db
        .select()
        .from(mayorInfo)
        .where(eq(mayorInfo.tenantId, ctx.tenant.id))
        .limit(1);

      if (existing.length === 0) {
        // Create new
        const id = nanoid();
        await db.insert(mayorInfo).values({
          id,
          tenantId: ctx.tenant.id,
          ...input,
        });
      } else {
        // Update existing
        await db
          .update(mayorInfo)
          .set(input)
          .where(eq(mayorInfo.id, existing[0].id));
      }

      return { success: true };
    }),
});

// ===== POIS ROUTER =====
export const poisRouter = router({
  list: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      limit: z.number().default(100),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      if (input.category) {
        return await db
          .select()
          .from(pois)
          .where(
            and(
              eq(pois.tenantId, ctx.tenant.id),
              eq(pois.category, input.category)
            )
          )
          .limit(input.limit);
      }

      return await db
        .select()
        .from(pois)
        .where(eq(pois.tenantId, ctx.tenant.id))
        .limit(input.limit);
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      category: z.string(),
      latitude: z.number(),
      longitude: z.number(),
      address: z.string().optional(),
      imageUrl: z.string().optional(),
      website: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || (ctx.user.role !== 'admin' && ctx.user.role !== 'tenant_admin')) {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const id = nanoid();
      await db.insert(pois).values({
        id,
        tenantId: ctx.tenant.id,
        ...input,
      });

      return { id };
    }),
});

// ===== INSTITUTIONS ROUTER =====
export const institutionsRouter = router({
  list: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      limit: z.number().default(100),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      if (input.category) {
        return await db
          .select()
          .from(institutions)
          .where(
            and(
              eq(institutions.tenantId, ctx.tenant.id),
              eq(institutions.category, input.category)
            )
          )
          .limit(input.limit);
      }

      return await db
        .select()
        .from(institutions)
        .where(eq(institutions.tenantId, ctx.tenant.id))
        .limit(input.limit);
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      category: z.string(),
      description: z.string().optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      website: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || (ctx.user.role !== 'admin' && ctx.user.role !== 'tenant_admin')) {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const id = nanoid();
      await db.insert(institutions).values({
        id,
        tenantId: ctx.tenant.id,
        ...input,
      });

      return { id };
    }),
});

// ===== CLUBS ROUTER =====
export const clubsRouter = router({
  list: publicProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      return await db
        .select()
        .from(clubs)
        .where(eq(clubs.tenantId, ctx.tenant.id))
        .orderBy(clubs.name);
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      category: z.string().optional(),
      contactPerson: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      website: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || (ctx.user.role !== 'admin' && ctx.user.role !== 'tenant_admin')) {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const id = nanoid();
      await db.insert(clubs).values({
        id,
        tenantId: ctx.tenant.id,
        ...input,
      });

      return { id };
    }),
});

// ===== COUNCIL MEETINGS ROUTER =====
export const councilMeetingsRouter = router({
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
          .from(councilMeetings)
          .where(
            and(
              eq(councilMeetings.tenantId, ctx.tenant.id),
              gte(councilMeetings.meetingDate, new Date())
            )
          )
          .orderBy(councilMeetings.meetingDate)
          .limit(input.limit);
      }

      return await db
        .select()
        .from(councilMeetings)
        .where(eq(councilMeetings.tenantId, ctx.tenant.id))
        .orderBy(desc(councilMeetings.meetingDate))
        .limit(input.limit);
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      meetingDate: z.date(),
      location: z.string().optional(),
      agendaUrl: z.string().optional(),
      minutesUrl: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || (ctx.user.role !== 'admin' && ctx.user.role !== 'tenant_admin')) {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const id = nanoid();
      await db.insert(councilMeetings).values({
        id,
        tenantId: ctx.tenant.id,
        ...input,
      });

      return { id };
    }),
});

// ===== CONTACT MESSAGES ROUTER =====
export const contactMessagesRouter = router({
  list: protectedProcedure
    .input(z.object({
      limit: z.number().default(100),
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user || (ctx.user.role !== 'admin' && ctx.user.role !== 'tenant_admin')) {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      return await db
        .select()
        .from(contactMessages)
        .where(eq(contactMessages.tenantId, ctx.tenant.id))
        .orderBy(desc(contactMessages.createdAt))
        .limit(input.limit);
    }),

  create: publicProcedure
    .input(z.object({
      name: z.string(),
      email: z.string(),
      subject: z.string(),
      message: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const id = nanoid();
      await db.insert(contactMessages).values({
        id,
        tenantId: ctx.tenant.id,
        ...input,
        createdAt: new Date(),
      });

      return { id };
    }),
});

// ===== PUSH NOTIFICATIONS ROUTER =====
export const pushNotificationsRouter = router({
  active: publicProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(pushNotifications)
        .where(
          and(
            eq(pushNotifications.tenantId, ctx.tenant.id),
            eq(pushNotifications.isActive, true)
          )
        )
        .orderBy(desc(pushNotifications.createdAt))
        .limit(10);
    }),

  send: protectedProcedure
    .input(z.object({
      title: z.string(),
      body: z.string(),
      targetAudience: z.enum(['all', 'specific']).default('all'),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || (ctx.user.role !== 'admin' && ctx.user.role !== 'tenant_admin')) {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const id = nanoid();
      await db.insert(pushNotifications).values({
        id,
        tenantId: ctx.tenant.id,
        ...input,
        sentAt: new Date(),
      });

      // TODO: Implement actual push notification sending logic

      return { id };
    }),

  list: protectedProcedure
    .input(z.object({
      limit: z.number().default(50),
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user || (ctx.user.role !== 'admin' && ctx.user.role !== 'tenant_admin')) {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      return await db
        .select()
        .from(pushNotifications)
        .where(eq(pushNotifications.tenantId, ctx.tenant.id))
        .orderBy(desc(pushNotifications.sentAt))
        .limit(input.limit);
    }),
});

// ===== USER NOTIFICATIONS ROUTER =====
export const userNotificationsRouter = router({
  list: protectedProcedure
    .input(z.object({
      unreadOnly: z.boolean().default(false),
      limit: z.number().default(50),
    }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      if (input.unreadOnly) {
        return await db
          .select()
          .from(userNotifications)
          .where(
            and(
              eq(userNotifications.tenantId, ctx.tenant.id),
              eq(userNotifications.userId, ctx.user.id),
              eq(userNotifications.isRead, false)
            )
          )
          .orderBy(desc(userNotifications.createdAt))
          .limit(input.limit);
      }

      return await db
        .select()
        .from(userNotifications)
        .where(
          and(
            eq(userNotifications.tenantId, ctx.tenant.id),
            eq(userNotifications.userId, ctx.user.id)
          )
        )
        .orderBy(desc(userNotifications.createdAt))
        .limit(input.limit);
    }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db
        .update(userNotifications)
        .set({ isRead: true })
        .where(
          and(
            eq(userNotifications.id, input.id),
            eq(userNotifications.userId, ctx.user.id),
            eq(userNotifications.tenantId, ctx.tenant.id)
          )
        );

      return { success: true };
    }),
});
