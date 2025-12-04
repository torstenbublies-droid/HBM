# Multi-Tenant Router Wrapper

## Übersicht

Dieses Dokument beschreibt, wie die bestehenden Router mit Multi-Tenancy erweitert werden können, ohne die Original-Struktur zu zerstören.

## Strategie

Da die Original-App `db.*` Helper-Funktionen verwendet, gibt es zwei Ansätze:

### Ansatz 1: DB-Helper anpassen (empfohlen für Production)

Alle `db.*` Funktionen erhalten einen zusätzlichen `tenantId` Parameter:

```typescript
// Vorher
export async function getAllNews(limit: number) {
  const db = await getDb();
  return db.select().from(news).limit(limit);
}

// Nachher
export async function getAllNews(tenantId: string, limit: number) {
  const db = await getDb();
  return db
    .select()
    .from(news)
    .where(eq(news.tenantId, tenantId))
    .limit(limit);
}
```

**Router-Anpassung:**

```typescript
// Vorher
list: publicProcedure.query(async () => {
  return db.getAllNews(50);
}),

// Nachher
list: publicProcedure.query(async ({ ctx }) => {
  return db.getAllNews(ctx.tenant.id, 50);
}),
```

### Ansatz 2: Direkte Drizzle-Queries (schneller für Migration)

Router verwenden direkt Drizzle ORM statt DB-Helper:

```typescript
import { getDb } from "../db";
import { news } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

list: publicProcedure.query(async ({ ctx }) => {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  return await db
    .select()
    .from(news)
    .where(eq(news.tenantId, ctx.tenant.id))
    .orderBy(desc(news.publishedAt))
    .limit(50);
}),
```

## Implementierungs-Reihenfolge

### Phase 1: Kritische Router (sofort)

1. **tenant** - Tenant-Informationen abrufen (NEU)
2. **news** - Nachrichten
3. **events** - Veranstaltungen
4. **departments** - Ämter

### Phase 2: Wichtige Router (Woche 1)

5. **issueReports** - Mängelmelder
6. **wasteSchedule** - Abfallkalender
7. **alerts** - Notfall & Störungen
8. **mayorInfo** - Bürgermeister-Info

### Phase 3: Weitere Router (Woche 2)

9. **pois** - Tourismus & Freizeit
10. **institutions** - Bildung & Familie
11. **councilMeetings** - Ratssitzungen
12. **clubs** - Vereine
13. **contactMessages** - Kontaktformular
14. **pushNotifications** - Push-Benachrichtigungen
15. **userNotifications** - User-Benachrichtigungen

## Code-Beispiele

### News Router (vollständig)

```typescript
// server/routers/news-multi-tenant.ts
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { news } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export const newsRouter = router({
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
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'tenant_admin') {
        throw new Error('Unauthorized');
      }

      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const id = nanoid();
      await db.insert(news).values({
        id,
        tenantId: ctx.tenant.id,
        ...input,
      });

      return { id };
    }),
});
```

### Events Router (vollständig)

```typescript
// server/routers/events-multi-tenant.ts
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { events } from "../../drizzle/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { nanoid } from "nanoid";

export const eventsRouter = router({
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
});
```

## Integration in routers.ts

```typescript
// server/routers.ts
import { tenantRouter } from "./routers/tenant";

export const appRouter = router({
  system: systemRouter,
  stadtInfo: stadtInfoRouter,
  tenant: tenantRouter, // NEU

  // Bestehende Router bleiben erstmal
  // Werden nach und nach durch Multi-Tenant Versionen ersetzt
  news: newsRouter,
  events: eventsRouter,
  // ...
});
```

## Testing

Nach jeder Router-Anpassung testen:

```bash
# Test mit Tenant-Parameter
curl "http://localhost:5000/api/trpc/news.list?tenant=schieder"

# Test mit anderem Tenant
curl "http://localhost:5000/api/trpc/news.list?tenant=musterstadt"

# Ergebnis: Unterschiedliche Daten pro Tenant
```

## Rollback

Falls Probleme auftreten:

```bash
# Schema zurücksetzen
cp drizzle/schema-original-backup.ts drizzle/schema.ts

# Context zurücksetzen
git checkout server/_core/context.ts

# Router zurücksetzen
git checkout server/routers.ts
```

## Nächste Schritte

1. Tenant-Router in routers.ts integrieren
2. News-Router anpassen (Beispiel oben)
3. Events-Router anpassen (Beispiel oben)
4. Departments-Router anpassen
5. Weitere Router nach Priorität

## Hinweise

- Immer `ctx.tenant.id` für Tenant-Filtering verwenden
- Bei Mutations immer `tenantId` setzen
- Bei Updates/Deletes immer Tenant-Zugehörigkeit prüfen
- Indizes auf `tenantId` nicht vergessen
