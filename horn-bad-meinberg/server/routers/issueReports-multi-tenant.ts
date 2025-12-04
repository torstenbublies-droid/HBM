import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { issueReports, InsertIssueReport } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export const issueReportsRouter = router({
  /**
   * List all issue reports for current tenant
   */
  list: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
      limit: z.number().default(100),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      let query = db
        .select()
        .from(issueReports)
        .where(eq(issueReports.tenantId, ctx.tenant.id))
        .orderBy(desc(issueReports.createdAt))
        .limit(input.limit);

      if (input.category || input.status) {
        const conditions = [eq(issueReports.tenantId, ctx.tenant.id)];
        if (input.category) conditions.push(eq(issueReports.category, input.category));
        if (input.status) conditions.push(eq(issueReports.status, input.status));

        query = db
          .select()
          .from(issueReports)
          .where(and(...conditions))
          .orderBy(desc(issueReports.createdAt))
          .limit(input.limit);
      }

      return await query;
    }),

  /**
   * Get single issue report by ID (tenant-filtered)
   */
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const result = await db
        .select()
        .from(issueReports)
        .where(
          and(
            eq(issueReports.id, input.id),
            eq(issueReports.tenantId, ctx.tenant.id)
          )
        )
        .limit(1);

      return result[0] || null;
    }),

  /**
   * Create issue report (public, but tenant-scoped)
   */
  create: publicProcedure
    .input(z.object({
      category: z.string(),
      title: z.string(),
      description: z.string(),
      location: z.string().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      imageUrl: z.string().optional(),
      reporterName: z.string().optional(),
      reporterEmail: z.string().optional(),
      reporterPhone: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const id = nanoid();
      const reportData: InsertIssueReport = {
        id,
        tenantId: ctx.tenant.id,
        category: input.category,
        title: input.title,
        description: input.description,
        location: input.location || null,
        latitude: input.latitude || null,
        longitude: input.longitude || null,
        imageUrl: input.imageUrl || null,
        reporterName: input.reporterName || null,
        reporterEmail: input.reporterEmail || null,
        reporterPhone: input.reporterPhone || null,
        status: 'open',
        createdAt: new Date(),
      };

      await db.insert(issueReports).values(reportData);

      return { id };
    }),

  /**
   * Update issue report status (tenant-admin or admin only, tenant-filtered)
   */
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.string(),
      status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
      adminNotes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || (ctx.user.role !== 'admin' && ctx.user.role !== 'tenant_admin')) {
        throw new Error('Unauthorized: Admin or Tenant Admin role required');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verify report belongs to current tenant
      const existing = await db
        .select()
        .from(issueReports)
        .where(
          and(
            eq(issueReports.id, input.id),
            eq(issueReports.tenantId, ctx.tenant.id)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        throw new Error('Issue report not found or does not belong to your tenant');
      }

      await db
        .update(issueReports)
        .set({
          status: input.status,
          adminNotes: input.adminNotes || null,
        })
        .where(eq(issueReports.id, input.id));

      return { success: true };
    }),

  /**
   * Delete issue report (admin only, tenant-filtered)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.role !== 'admin') {
        throw new Error('Unauthorized: Admin role required');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      // Verify report belongs to current tenant
      const existing = await db
        .select()
        .from(issueReports)
        .where(
          and(
            eq(issueReports.id, input.id),
            eq(issueReports.tenantId, ctx.tenant.id)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        throw new Error('Issue report not found or does not belong to your tenant');
      }

      await db
        .delete(issueReports)
        .where(eq(issueReports.id, input.id));

      return { success: true };
    }),
});
