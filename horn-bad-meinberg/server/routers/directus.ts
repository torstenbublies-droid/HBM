import { z } from 'zod';
import { router, publicProcedure } from '../_core/trpc';
import { directusService } from '../directus-service';
import { directusDbService } from '../directus-db-service';

// Map tenant slug to Directus tenant_id
const TENANT_SLUG_TO_ID: Record<string, number> = {
  'schieder': 1,
  'barntrup': 2,
};

function getDirectusTenantId(tenantSlug: string): number {
  const id = TENANT_SLUG_TO_ID[tenantSlug];
  if (!id) {
    throw new Error(`No Directus tenant_id mapping found for slug: ${tenantSlug}`);
  }
  return id;
}

export const directusRouter = router({
  // News
  getNews: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.tenant) {
      throw new Error('Tenant not found');
    }
    const directusTenantId = getDirectusTenantId(ctx.tenant.slug);
    return directusService.getNews(directusTenantId);
  }),

  getNewsById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant) {
        throw new Error('Tenant not found');
      }
      const directusTenantId = getDirectusTenantId(ctx.tenant.slug);
      return directusService.getNewsById(input.id, directusTenantId);
    }),

  // Events
  getEvents: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.tenant) {
      throw new Error('Tenant not found');
    }
    const directusTenantId = getDirectusTenantId(ctx.tenant.slug);
    return directusService.getEvents(directusTenantId);
  }),

  getEventById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant) {
        throw new Error('Tenant not found');
      }
      const directusTenantId = getDirectusTenantId(ctx.tenant.slug);
      return directusService.getEventById(input.id, directusTenantId);
    }),

  // Departments
  getDepartments: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.tenant) {
      throw new Error('Tenant not found');
    }
    const directusTenantId = getDirectusTenantId(ctx.tenant.slug);
    return directusService.getDepartments(directusTenantId);
  }),

  getDepartmentById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant) {
        throw new Error('Tenant not found');
      }
      const directusTenantId = getDirectusTenantId(ctx.tenant.slug);
      return directusService.getDepartmentById(input.id, directusTenantId);
    }),

  // Push Notifications (using direct DB access)
  getPushNotifications: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.tenant) {
      throw new Error('Tenant not found');
    }
    const directusTenantId = getDirectusTenantId(ctx.tenant.slug);
    return directusDbService.getPushNotifications(directusTenantId);
  }),

  getPushNotificationById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.tenant) {
        throw new Error('Tenant not found');
      }
      const directusTenantId = getDirectusTenantId(ctx.tenant.slug);
      return directusDbService.getPushNotificationById(input.id, directusTenantId);
    }),
});
