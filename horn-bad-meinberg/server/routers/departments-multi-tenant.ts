import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { departments, InsertDepartment } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export const departmentsRouter = router({
  /**
   * List all departments for current tenant
   */
  list: publicProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      return await db
        .select()
        .from(departments)
        .where(eq(departments.tenantId, ctx.tenant.id))
        .orderBy(departments.name);
    }),

  /**
   * Get single department by ID (tenant-filtered)
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db
        .select()
        .from(departments)
        .where(
          and(
            eq(departments.id, input.id),
            eq(departments.tenantId, ctx.tenant.id)
          )
        )
        .limit(1);

      return result[0] || null;
    }),

  /**
   * Create department (tenant-admin or admin only)
   */
  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
      contactPerson: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      openingHours: z.string().optional(),
      website: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || (ctx.user.role !== 'admin' && ctx.user.role !== 'tenant_admin')) {
        throw new Error('Unauthorized: Admin or Tenant Admin role required');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const id = nanoid();
      const deptData: InsertDepartment = {
        id,
        tenantId: ctx.tenant.id,
        name: input.name,
        description: input.description || null,
        contactPerson: input.contactPerson || null,
        email: input.email || null,
        phone: input.phone || null,
        address: input.address || null,
        openingHours: input.openingHours || null,
        website: input.website || null,
      };

      await db.insert(departments).values(deptData);

      return { id };
    }),

  /**
   * Update department (tenant-admin or admin only, tenant-filtered)
   */
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      contactPerson: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      openingHours: z.string().optional(),
      website: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || (ctx.user.role !== 'admin' && ctx.user.role !== 'tenant_admin')) {
        throw new Error('Unauthorized: Admin or Tenant Admin role required');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verify department belongs to current tenant
      const existing = await db
        .select()
        .from(departments)
        .where(
          and(
            eq(departments.id, input.id),
            eq(departments.tenantId, ctx.tenant.id)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        throw new Error('Department not found or does not belong to your tenant');
      }

      const { id, ...updateData } = input;
      await db
        .update(departments)
        .set(updateData)
        .where(eq(departments.id, id));

      return { success: true };
    }),

  /**
   * Delete department (tenant-admin or admin only, tenant-filtered)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || (ctx.user.role !== 'admin' && ctx.user.role !== 'tenant_admin')) {
        throw new Error('Unauthorized: Admin or Tenant Admin role required');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verify department belongs to current tenant
      const existing = await db
        .select()
        .from(departments)
        .where(
          and(
            eq(departments.id, input.id),
            eq(departments.tenantId, ctx.tenant.id)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        throw new Error('Department not found or does not belong to your tenant');
      }

      await db
        .delete(departments)
        .where(eq(departments.id, input.id));

      return { success: true };
    }),
});
