# 🚀 Multi-Tenant Aktivierungs-Anleitung

Diese Anleitung erklärt Schritt für Schritt, wie du die Multi-Tenant Version aktivierst und testest.

## ✅ Voraussetzungen

- PostgreSQL installiert und läuft
- Node.js 18+ installiert
- Git installiert
- Repository geklont

## 📋 Schritt-für-Schritt Aktivierung

### 1. Datenbank vorbereiten

```bash
# PostgreSQL Datenbank erstellen
createdb buerger_app

# Oder mit psql:
psql -U postgres
CREATE DATABASE buerger_app;
\q
```

### 2. Environment-Variablen setzen

```bash
cd multi-tenant-buerger-app

# .env Datei erstellen
cp .env.example .env

# .env bearbeiten:
# DATABASE_URL=postgresql://user:password@localhost:5432/buerger_app
```

### 3. Dependencies installieren

```bash
npm install
```

### 4. Multi-Tenant Schema aktivieren

```bash
# Backup des Original-Schemas erstellen
cp drizzle/schema.ts drizzle/schema-original-backup.ts

# Multi-Tenant Schema aktivieren
cp drizzle/schema-multi-tenant.ts drizzle/schema.ts

# Datenbank-Schema pushen
npm run db:push
```

### 5. Multi-Tenant Router aktivieren

```bash
# Backup der Original-Router erstellen
cp server/routers.ts server/routers-original-backup.ts

# Multi-Tenant Router aktivieren
cp server/routers-multi-tenant.ts server/routers.ts
```

### 6. Context-Datei aktualisieren

Die `server/_core/context.ts` wurde bereits aktualisiert und enthält:
- Tenant-Middleware Integration
- Tenant-Information im Context

Keine Aktion erforderlich - bereits fertig! ✅

### 7. Test-Daten einfügen

```bash
# SQL-Seed-Script ausführen
psql -U postgres -d buerger_app -f drizzle/seed-multi-tenant.sql

# Oder mit psql:
psql -U postgres -d buerger_app
\i drizzle/seed-multi-tenant.sql
\q
```

**Ergebnis:**
- ✅ 2 Tenants: Schieder-Schwalenberg, Musterstadt
- ✅ Je 2 News-Artikel
- ✅ Je 1-2 Events
- ✅ Je 1-2 Ämter
- ✅ Bürgermeister-Info
- ✅ Abfallkalender
- ✅ Alerts
- ✅ POIs, Institutionen, Vereine
- ✅ Ratssitzungen

### 8. App starten

```bash
npm run dev
```

Die App läuft auf: `http://localhost:5000`

### 9. Multi-Tenancy testen

**Schieder-Schwalenberg:**
```
http://localhost:5000?tenant=schieder
```

**Musterstadt:**
```
http://localhost:5000?tenant=musterstadt
```

**Tenant-Wechsel:**
- Nutze den Query-Parameter `?tenant=slug`
- Später: Subdomain-basiert (schieder.buerger-app.de)

---

## 🧪 Test-Checkliste

### Daten-Isolation testen

- [ ] Schieder zeigt nur Schieder-News
- [ ] Musterstadt zeigt nur Musterstadt-News
- [ ] Events sind getrennt
- [ ] Ämter sind getrennt
- [ ] Keine Überschneidungen

### Branding testen

- [ ] Schieder: Blau (#0066CC)
- [ ] Musterstadt: Pink (#E91E63)
- [ ] Stadt-Name ändert sich
- [ ] Chatbot-Name ändert sich (Schwalenbot vs. MusterBot)

### Features testen

- [ ] News-Liste lädt
- [ ] Events-Liste lädt
- [ ] Ämter-Liste lädt
- [ ] Abfallkalender lädt
- [ ] Wetter zeigt richtige Stadt
- [ ] Chatbot funktioniert
- [ ] Alerts werden angezeigt

### API testen

```bash
# Tenant-Info abrufen
curl "http://localhost:5000/api/trpc/tenant.current?tenant=schieder"

# News abrufen
curl "http://localhost:5000/api/trpc/news.list?tenant=schieder"

# Events abrufen
curl "http://localhost:5000/api/trpc/events.list?tenant=musterstadt"
```

---

## 🔄 Zurück zur Original-Version

Falls du zur Original-Version zurückkehren möchtest:

```bash
# Schema zurücksetzen
cp drizzle/schema-original-backup.ts drizzle/schema.ts
npm run db:push

# Router zurücksetzen
cp server/routers-original-backup.ts server/routers.ts

# Context zurücksetzen
git checkout server/_core/context.ts

# App neu starten
npm run dev
```

---

## 🐛 Troubleshooting

### Problem: Datenbank-Verbindung fehlgeschlagen

**Lösung:**
```bash
# PostgreSQL Status prüfen
sudo systemctl status postgresql

# PostgreSQL starten
sudo systemctl start postgresql

# Datenbank existiert?
psql -U postgres -l
```

### Problem: Tenant nicht gefunden

**Lösung:**
```bash
# Tenants in Datenbank prüfen
psql -U postgres -d buerger_app -c "SELECT slug, name FROM tenants;"

# Seed-Script erneut ausführen
psql -U postgres -d buerger_app -f drizzle/seed-multi-tenant.sql
```

### Problem: Schema-Fehler

**Lösung:**
```bash
# Datenbank neu erstellen
dropdb buerger_app
createdb buerger_app

# Schema pushen
npm run db:push

# Seed-Daten einfügen
psql -U postgres -d buerger_app -f drizzle/seed-multi-tenant.sql
```

### Problem: Frontend zeigt keine Daten

**Lösung:**
```bash
# Browser-Cache leeren
# Oder Inkognito-Modus verwenden

# tRPC-Cache prüfen
# In Browser DevTools: Application > Clear Storage
```

---

## 📊 Nächste Schritte

Nach erfolgreicher Aktivierung:

1. **Weitere Test-Städte hinzufügen**
   - SQL-Insert in `tenants` Tabelle
   - Seed-Daten für neue Stadt erstellen

2. **Subdomain-Routing einrichten**
   - Nginx/Apache konfigurieren
   - DNS-Einträge erstellen
   - SSL-Zertifikate generieren

3. **Production-Deployment**
   - Hetzner Server einrichten
   - CI/CD Pipeline konfigurieren
   - Monitoring einrichten

4. **Admin-Panel**
   - Tenant-Verwaltung
   - Content-Management
   - User-Management

---

## 💬 Support

Bei Fragen oder Problemen:
- GitHub Issues: https://github.com/torstenbublies-droid/multi-tenant-buerger-app/issues
- Dokumentation: Siehe `FINAL_IMPLEMENTATION_GUIDE.md`

---

**Viel Erfolg! 🚀**
