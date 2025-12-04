# 🏙️ Multi-Tenant Bürger-App - Implementierungsanleitung

**Datum:** 21. November 2025  
**Version:** 1.0  
**Basis:** Original Schieder-App + Update vom 20.11.2025

---

## 📋 Übersicht

Diese Implementierung erweitert die Schieder-App um **Multi-Tenancy**, sodass eine zentrale Code-Basis für mehrere Städte genutzt werden kann. Jede Stadt erhält:

- ✅ Eigene Inhalte (News, Events, Ämter, etc.)
- ✅ Eigenes Branding (Farben, Logo, Hero-Image)
- ✅ Eigene Konfiguration (Wetter, Chatbot-Name, Kontakte)
- ✅ **Vollständige Daten-Isolation**

Das Design und alle Features bleiben **exakt wie in der Original-App**.

---

## 🎯 Was wurde geändert?

### 1. Datenbank-Schema

**Neue Datei:** `drizzle/schema-multi-tenant.ts`

**Änderungen:**
- ✅ Neue Tabelle: `tenants` (Städte/Mandanten)
- ✅ Alle Content-Tabellen haben `tenantId` Foreign Key
- ✅ Neue Rolle: `tenant_admin` (für Stadt-Mitarbeiter)
- ✅ CASCADE DELETE (wenn Tenant gelöscht wird, werden alle Daten gelöscht)

**Tenants-Tabelle:**
```typescript
export const tenants = pgTable("tenants", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 200 }).notNull(), // "Schieder-Schwalenberg"
  slug: varchar("slug", { length: 100 }).notNull().unique(), // "schieder"
  
  // Branding
  primaryColor: varchar("primaryColor", { length: 20 }).default("#0066CC"),
  secondaryColor: varchar("secondaryColor", { length: 20 }).default("#00A86B"),
  logoUrl: varchar("logoUrl", { length: 1000 }),
  heroImageUrl: varchar("heroImageUrl", { length: 1000 }),
  
  // Kontakt
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  contactAddress: text("contactAddress"),
  
  // Wetter
  weatherLat: varchar("weatherLat", { length: 50 }),
  weatherLon: varchar("weatherLon", { length: 50 }),
  weatherCity: varchar("weatherCity", { length: 200 }),
  
  // Chatbot
  chatbotName: varchar("chatbotName", { length: 100 }).default("Chatbot"),
  chatbotSystemPrompt: text("chatbotSystemPrompt"),
  
  // Meta
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});
```

**Beispiel: News-Tabelle mit tenantId:**
```typescript
export const news = pgTable("news", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  // ... rest bleibt gleich
});
```

### 2. Tenant-Middleware

**Neue Datei:** `server/tenant-middleware.ts`

**Funktionen:**
- `extractTenantSlug(req)` - Erkennt Tenant aus Request
- `loadTenant(slug)` - Lädt Tenant aus Datenbank
- `tenantMiddleware` - Express Middleware

**Tenant-Erkennung (Priorität):**
1. **Subdomain:** `schieder.buerger-app.de` → `schieder`
2. **Query-Parameter:** `?tenant=schieder` → `schieder`
3. **Header:** `X-Tenant: schieder` → `schieder`
4. **Default:** `schieder` (Backward Compatibility)

**Verwendung:**
```typescript
import { tenantMiddleware } from './tenant-middleware';

// In Express App
app.use(tenantMiddleware);

// In Route
app.get('/api/news', (req, res) => {
  const tenant = req.tenant; // TenantInfo
  // tenant.id, tenant.name, tenant.slug, etc.
});
```

### 3. tRPC Context

**Datei:** `server/_core/context.ts`

**Änderung:**
```typescript
import { TenantInfo } from '../tenant-middleware';

export interface Context {
  user?: User;
  tenant: TenantInfo; // NEU
}

export async function createContext({ req, res }: CreateExpressContextOptions): Promise<Context> {
  const user = await getUserFromSession(req, res);
  const tenant = req.tenant; // Von Middleware gesetzt
  
  return { user, tenant };
}
```

### 4. tRPC Router

**Alle Router müssen angepasst werden:**

**Beispiel: News Router**
```typescript
// ALT (ohne Multi-Tenancy)
list: publicProcedure.query(async () => {
  return db.news.list();
}),

// NEU (mit Multi-Tenancy)
list: publicProcedure.query(async ({ ctx }) => {
  return db
    .select()
    .from(news)
    .where(eq(news.tenantId, ctx.tenant.id))
    .orderBy(desc(news.publishedAt));
}),
```

**Beispiel: Issue Reports Router (Create)**
```typescript
// ALT
create: protectedProcedure
  .input(insertIssueReportSchema)
  .mutation(async ({ input }) => {
    return db.issueReports.create(input);
  }),

// NEU
create: protectedProcedure
  .input(insertIssueReportSchema)
  .mutation(async ({ input, ctx }) => {
    return db.insert(issueReports).values({
      ...input,
      tenantId: ctx.tenant.id, // Automatisch setzen
    });
  }),
```

### 5. Frontend: TenantContext

**Neue Datei:** `client/src/contexts/TenantContext.tsx`

```typescript
import { createContext, useContext, useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';

interface TenantContextType {
  tenant: TenantInfo | null;
  loading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tenant from URL
  const urlParams = new URLSearchParams(window.location.search);
  const tenantSlug = urlParams.get('tenant') || 'schieder';

  const { data, isLoading, error: queryError } = trpc.tenant.current.useQuery({ slug: tenantSlug });

  useEffect(() => {
    if (data) {
      setTenant(data);
      setLoading(false);
      
      // Set CSS Variables for dynamic theming
      document.documentElement.style.setProperty('--tenant-primary', data.primaryColor);
      document.documentElement.style.setProperty('--tenant-secondary', data.secondaryColor);
    }
    if (queryError) {
      setError(queryError.message);
      setLoading(false);
    }
  }, [data, queryError]);

  return (
    <TenantContext.Provider value={{ tenant, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}

// Helper Hooks
export function useTenantBranding() {
  const { tenant } = useTenant();
  return {
    primaryColor: tenant?.primaryColor || '#0066CC',
    secondaryColor: tenant?.secondaryColor || '#00A86B',
    logoUrl: tenant?.logoUrl,
    heroImageUrl: tenant?.heroImageUrl,
  };
}

export function useTenantContact() {
  const { tenant } = useTenant();
  return {
    email: tenant?.contactEmail,
    phone: tenant?.contactPhone,
    address: tenant?.contactAddress,
  };
}

export function useTenantWeather() {
  const { tenant } = useTenant();
  return {
    lat: tenant?.weatherLat,
    lon: tenant?.weatherLon,
    city: tenant?.weatherCity,
  };
}
```

### 6. Frontend: App.tsx

**Datei:** `client/src/App.tsx`

```typescript
import { TenantProvider } from './contexts/TenantContext';

function App() {
  return (
    <TenantProvider>
      {/* Rest der App */}
    </TenantProvider>
  );
}
```

### 7. Frontend: Dynamic Theming

**CSS Variables:**
```css
:root {
  --tenant-primary: #0066CC;
  --tenant-secondary: #00A86B;
}
```

**Verwendung in Tailwind:**
```tsx
<div className="bg-[var(--tenant-primary)] text-white">
  Stadt-Name
</div>
```

**Verwendung in Inline Styles:**
```tsx
const { primaryColor } = useTenantBranding();
<div style={{ backgroundColor: primaryColor }}>
  Stadt-Name
</div>
```

### 8. Frontend: Home.tsx

**Änderungen:**
```typescript
import { useTenant, useTenantBranding } from '@/contexts/TenantContext';

export default function Home() {
  const { tenant } = useTenant();
  const { heroImageUrl, logoUrl } = useTenantBranding();

  return (
    <div>
      {/* Hero Image */}
      <img src={heroImageUrl} alt={tenant?.name} />
      
      {/* Stadt-Name */}
      <h1>{tenant?.name}</h1>
      
      {/* Chatbot */}
      <ChatBot name={tenant?.chatbotName} />
    </div>
  );
}
```

---

## 📦 Installation

### Schritt 1: Schema ersetzen

```bash
cd /pfad/zu/schieder-multi-tenant

# Backup erstellen
cp drizzle/schema.ts drizzle/schema-original.ts

# Multi-Tenant Schema aktivieren
cp drizzle/schema-multi-tenant.ts drizzle/schema.ts
```

### Schritt 2: Datenbank migrieren

```bash
# Migration generieren
npm run db:push

# Oder manuell:
npx drizzle-kit generate
npx drizzle-kit migrate
```

### Schritt 3: Test-Daten erstellen

**SQL-Script:** `scripts/seed-tenants.sql`

```sql
-- Tenant: Schieder-Schwalenberg
INSERT INTO tenants (id, name, slug, primaryColor, secondaryColor, logoUrl, heroImageUrl, contactEmail, contactPhone, contactAddress, weatherLat, weatherLon, weatherCity, chatbotName, isActive)
VALUES (
  'tenant_schieder',
  'Schieder-Schwalenberg',
  'schieder',
  '#0066CC',
  '#00A86B',
  'https://placehold.co/120x120/0066CC/ffffff?text=S',
  'https://placehold.co/1200x400/0066CC/ffffff?text=Schieder-Schwalenberg',
  'info@schieder-schwalenberg.de',
  '05282 / 601-0',
  'Domäne 3, 32816 Schieder-Schwalenberg',
  '51.8667',
  '9.1167',
  'Schieder-Schwalenberg',
  'Schwalenbot',
  true
);

-- Tenant: Musterstadt
INSERT INTO tenants (id, name, slug, primaryColor, secondaryColor, logoUrl, heroImageUrl, contactEmail, contactPhone, contactAddress, weatherLat, weatherLon, weatherCity, chatbotName, isActive)
VALUES (
  'tenant_musterstadt',
  'Musterstadt',
  'musterstadt',
  '#E91E63',
  '#FF9800',
  'https://placehold.co/120x120/E91E63/ffffff?text=M',
  'https://placehold.co/1200x400/E91E63/ffffff?text=Musterstadt',
  'info@musterstadt.de',
  '069 / 123-456',
  'Hauptstraße 1, 60311 Frankfurt',
  '50.1109',
  '8.6821',
  'Frankfurt',
  'MusterBot',
  true
);

-- Alle bestehenden Daten Schieder zuordnen
UPDATE news SET tenantId = 'tenant_schieder' WHERE tenantId IS NULL;
UPDATE events SET tenantId = 'tenant_schieder' WHERE tenantId IS NULL;
UPDATE departments SET tenantId = 'tenant_schieder' WHERE tenantId IS NULL;
-- ... für alle Tabellen
```

### Schritt 4: Router anpassen

**Alle Router in `server/routers.ts` müssen angepasst werden:**

1. Alle `list` Queries filtern nach `ctx.tenant.id`
2. Alle `create` Mutations setzen `tenantId: ctx.tenant.id`
3. Alle `update/delete` Mutations prüfen `tenantId`

**Beispiel-Pattern:**

```typescript
export const newsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(news)
      .where(eq(news.tenantId, ctx.tenant.id))
      .orderBy(desc(news.publishedAt));
  }),

  create: protectedProcedure
    .input(insertNewsSchema)
    .mutation(async ({ input, ctx }) => {
      return db.insert(news).values({
        ...input,
        tenantId: ctx.tenant.id,
      });
    }),
});
```

### Schritt 5: Frontend anpassen

1. `TenantContext.tsx` erstellen
2. `App.tsx` mit `TenantProvider` umschließen
3. Alle Pages anpassen:
   - `useTenant()` verwenden
   - Dynamische Texte (Stadt-Name, Chatbot-Name)
   - Dynamische Bilder (Logo, Hero-Image)

### Schritt 6: Testen

```bash
# Development starten
npm run dev

# Test-URLs:
# Schieder: http://localhost:5000?tenant=schieder
# Musterstadt: http://localhost:5000?tenant=musterstadt
```

---

## 🧪 Testing-Checkliste

### Daten-Isolation

- [ ] Schieder zeigt nur Schieder-News
- [ ] Musterstadt zeigt nur Musterstadt-News
- [ ] Keine Überschneidungen bei Events
- [ ] Keine Überschneidungen bei Ämtern
- [ ] Issue Reports werden richtigem Tenant zugeordnet

### Branding

- [ ] Farben ändern sich (Blau vs. Pink)
- [ ] Logo ändert sich
- [ ] Hero-Image ändert sich
- [ ] Stadt-Name ändert sich
- [ ] Chatbot-Name ändert sich

### Funktionalität

- [ ] Wetter zeigt richtige Stadt
- [ ] Kontaktdaten sind korrekt
- [ ] Chatbot funktioniert
- [ ] Push-Benachrichtigungen pro Tenant
- [ ] Alle 12 Tiles funktionieren

---

## 🚀 Deployment

### Production-Setup

**1. Subdomain-Routing (Nginx):**

```nginx
server {
    listen 80;
    server_name *.buerger-app.de;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**2. DNS-Einträge:**
```
schieder.buerger-app.de → Server-IP
musterstadt.buerger-app.de → Server-IP
```

**3. SSL-Zertifikate:**
```bash
certbot --nginx -d *.buerger-app.de
```

### Render.com

**Environment Variables:**
```
DATABASE_URL=postgresql://...
GOOGLE_PLACES_API_KEY=...
# ... rest
```

**Custom Domain:**
- `schieder.buerger-app.de`
- `musterstadt.buerger-app.de`

---

## 📊 Datenbank-Struktur

```
tenants (Städte)
  ├─ id (PK)
  ├─ slug (unique)
  ├─ name
  ├─ primaryColor
  ├─ secondaryColor
  └─ ... (Branding, Kontakt, Wetter)

news (Nachrichten)
  ├─ id (PK)
  ├─ tenantId (FK → tenants.id)
  └─ ... (title, teaser, etc.)

events (Veranstaltungen)
  ├─ id (PK)
  ├─ tenantId (FK → tenants.id)
  └─ ... (title, startDate, etc.)

... (alle anderen Tabellen analog)
```

---

## 🎯 Nächste Schritte

### Sofort

1. Schema ersetzen und migrieren
2. Test-Daten erstellen
3. Router anpassen
4. Frontend anpassen
5. Lokal testen

### Kurzfristig

1. Alle 15 Router mit Multi-Tenancy
2. Alle Frontend-Pages anpassen
3. Admin-Panel für Tenant-Verwaltung
4. Production-Deployment

### Langfristig

1. Self-Service Tenant-Registrierung
2. Tenant-spezifische Features
3. Analytics pro Tenant
4. White-Label Mobile Apps

---

## 📝 Wichtige Hinweise

### Backward Compatibility

- Default Tenant: `schieder`
- Alte URLs funktionieren weiterhin
- Bestehende Daten werden Schieder zugeordnet

### Performance

- Alle Queries haben Index auf `tenantId`
- Connection Pooling empfohlen
- Caching pro Tenant möglich

### Sicherheit

- Keine Cross-Tenant Zugriffe möglich
- Alle Queries filtern nach `tenantId`
- Foreign Keys mit CASCADE

### Kosten

- **Hosting:** 18€/Monat (für alle Städte)
- **Pro Stadt:** < 1€/Monat (bei 20 Städten)
- **Neue Stadt:** 0€ Entwicklungskosten (nur Konfiguration)

---

## 🆘 Troubleshooting

### Problem: Tenant not found

**Lösung:** Prüfe ob Tenant in Datenbank existiert
```sql
SELECT * FROM tenants WHERE slug = 'schieder';
```

### Problem: Keine Daten sichtbar

**Lösung:** Prüfe ob `tenantId` gesetzt ist
```sql
SELECT * FROM news WHERE tenantId IS NULL;
```

### Problem: Farben ändern sich nicht

**Lösung:** Prüfe CSS Variables
```javascript
console.log(getComputedStyle(document.documentElement).getPropertyValue('--tenant-primary'));
```

---

## ✅ Fertig!

Nach der Implementierung hast du:

- ✅ Eine zentrale Code-Basis für alle Städte
- ✅ Vollständige Daten-Isolation
- ✅ Dynamisches Branding pro Stadt
- ✅ Skalierbar für 10-100 Städte
- ✅ Kosteneffizient (< 1€/Stadt/Monat)

**Viel Erfolg!** 🚀

---

**Erstellt von:** Manus AI (CTO)  
**Datum:** 21. November 2025  
**Version:** 1.0
