# Deployment Guide: Netlify + Supabase + GitHub

Diese Anleitung führt Sie Schritt für Schritt durch das Deployment der Bürger-App auf Netlify mit Supabase als Datenbank und automatischem Deployment über GitHub.

## 📋 Übersicht

Nach diesem Setup:
- ✅ Code liegt auf GitHub
- ✅ Automatisches Deployment bei jedem Git Push
- ✅ PostgreSQL Datenbank auf Supabase
- ✅ Production-ready auf Netlify

---

## 1️⃣ GitHub Repository erstellen

### Option A: Mit GitHub CLI (gh)

```bash
# Im Projektverzeichnis
cd /home/ubuntu/buergerapp-schieder

# Repository erstellen und pushen
gh repo create buergerapp-schieder --public --source=. --remote=origin --push
```

### Option B: Manuell über GitHub Website

1. Gehen Sie zu [github.com/new](https://github.com/new)
2. Repository Name: `buergerapp-schieder`
3. Beschreibung: "Digitale Stadtverwaltung für Schieder-Schwalenberg"
4. Wählen Sie **Public** oder **Private**
5. **NICHT** "Initialize with README" ankreuzen
6. Klicken Sie auf "Create repository"

7. Dann im Terminal:
```bash
cd /home/ubuntu/buergerapp-schieder
git remote add origin https://github.com/IHR-USERNAME/buergerapp-schieder.git
git push -u origin main
```

---

## 2️⃣ Supabase Projekt erstellen

### Schritt 1: Account erstellen
1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Klicken Sie auf "Start your project"
3. Melden Sie sich mit GitHub an (empfohlen)

### Schritt 2: Neues Projekt erstellen
1. Klicken Sie auf "New Project"
2. **Organization**: Wählen Sie Ihre Organisation
3. **Project Name**: `buergerapp-schieder`
4. **Database Password**: Generieren Sie ein sicheres Passwort (WICHTIG: Speichern Sie es!)
5. **Region**: Wählen Sie die nächstgelegene Region (z.B. Frankfurt)
6. **Pricing Plan**: Free (ausreichend für den Start)
7. Klicken Sie auf "Create new project"

⏱️ Die Projekterstellung dauert ca. 2 Minuten.

### Schritt 3: Connection String kopieren
1. Gehen Sie zu **Project Settings** (Zahnrad-Symbol links unten)
2. Klicken Sie auf **Database** im Menü
3. Scrollen Sie zu "Connection string"
4. Wählen Sie **URI** Tab
5. Kopieren Sie den Connection String

Format:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
```

⚠️ Ersetzen Sie `[YOUR-PASSWORD]` mit Ihrem Datenbank-Passwort!

---

## 3️⃣ Netlify Projekt erstellen

### Schritt 1: Account erstellen
1. Gehen Sie zu [netlify.com](https://netlify.com)
2. Klicken Sie auf "Sign Up"
3. Melden Sie sich mit **GitHub** an (wichtig!)
4. Autorisieren Sie Netlify für GitHub

### Schritt 2: Neues Projekt erstellen
1. Klicken Sie auf "Add new site" → "Import an existing project"
2. Wählen Sie **GitHub**
3. Autorisieren Sie Netlify (falls noch nicht geschehen)
4. Wählen Sie Ihr Repository `buergerapp-schieder`

### Schritt 3: Build Settings konfigurieren

Netlify erkennt die Settings automatisch aus `netlify.toml`, aber prüfen Sie:

- **Branch to deploy**: `main`
- **Build command**: `pnpm build`
- **Publish directory**: `dist/public`
- **Functions directory**: `netlify/functions`

### Schritt 4: Environment Variables setzen

Klicken Sie auf "Site settings" → "Environment variables" → "Add a variable"

Fügen Sie folgende Variablen hinzu:

```env
# Datenbank (von Supabase)
DATABASE_URL
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Security
JWT_SECRET
ihr-super-sicherer-jwt-secret-mindestens-32-zeichen

# App Configuration
VITE_APP_ID
proj_buergerapp_schieder

VITE_APP_TITLE
Bürger-App Schieder-Schwalenberg

VITE_APP_LOGO
https://placehold.co/40x40/3b82f6/ffffff?text=S

# OAuth
OAUTH_SERVER_URL
https://vidabiz.butterfly-effect.dev

VITE_OAUTH_PORTAL_URL
https://vida.butterfly-effect.dev

# Optional: Analytics
VITE_ANALYTICS_ENDPOINT
https://umami.dev.ops.butterfly-effect.dev

VITE_ANALYTICS_WEBSITE_ID
analytics_proj_buergerapp_schieder
```

**Wichtig**: 
- Ersetzen Sie `[PASSWORD]` und `[PROJECT-REF]` mit Ihren Supabase-Werten
- Generieren Sie einen sicheren `JWT_SECRET` (z.B. mit `openssl rand -base64 32`)

### Schritt 5: Deploy
1. Klicken Sie auf "Deploy site"
2. ⏱️ Der erste Build dauert ca. 2-3 Minuten
3. Nach erfolgreichem Build erhalten Sie eine URL: `https://your-site-name.netlify.app`

---

## 4️⃣ Datenbank initialisieren

### Methode 1: Über Supabase Dashboard

1. Gehen Sie zu Ihrem Supabase Projekt
2. Klicken Sie auf **SQL Editor** im Menü
3. Klicken Sie auf "New query"
4. Führen Sie folgendes SQL aus:

```sql
-- Erstelle Enums
CREATE TYPE role AS ENUM ('user', 'admin');
CREATE TYPE issue_status AS ENUM ('eingegangen', 'in_bearbeitung', 'erledigt');
CREATE TYPE priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE contact_status AS ENUM ('neu', 'in_bearbeitung', 'erledigt');
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'danger', 'event');
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');
```

5. Dann führen Sie die Tabellen-Erstellung aus (siehe `drizzle/schema.ts`)

### Methode 2: Mit Drizzle Push (empfohlen)

```bash
# Lokal ausführen mit Supabase DATABASE_URL
cd /home/ubuntu/buergerapp-schieder

# .env mit Supabase DATABASE_URL aktualisieren
echo "DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" > .env

# Datenbank-Schema pushen
pnpm db:push
```

---

## 5️⃣ Automatisches Deployment testen

### Änderung vornehmen und pushen

```bash
cd /home/ubuntu/buergerapp-schieder

# Änderung machen (z.B. README bearbeiten)
echo "\n## Live auf Netlify! 🚀" >> README.md

# Commit und Push
git add .
git commit -m "Test: Automatisches Deployment"
git push origin main
```

### Deployment verfolgen

1. Gehen Sie zu Ihrem Netlify Dashboard
2. Sie sehen automatisch einen neuen Deployment-Prozess unter "Deploys"
3. Nach ca. 1-2 Minuten ist die Änderung live!

---

## 6️⃣ Custom Domain einrichten (optional)

### In Netlify:

1. Gehen Sie zu Ihrem Site → **Domain settings**
2. Klicken Sie auf "Add custom domain"
3. Geben Sie Ihre Domain ein (z.B. `buergerapp-schieder.de`)
4. Folgen Sie den Anweisungen zur DNS-Konfiguration

### Bei Ihrem Domain-Anbieter:

Netlify zeigt Ihnen die DNS-Einträge an, die Sie hinzufügen müssen:

**Für Apex Domain (buergerapp-schieder.de):**
```
Type: A
Name: @
Value: 75.2.60.5
```

**Für www Subdomain:**
```
Type: CNAME
Name: www
Value: your-site-name.netlify.app
```

### SSL-Zertifikat

Netlify aktiviert automatisch ein kostenloses SSL-Zertifikat (Let's Encrypt) für Ihre Domain!

⏱️ DNS-Propagierung dauert 5 Minuten bis 48 Stunden.

---

## 7️⃣ Workflow für Änderungen

Ab jetzt ist der Workflow super einfach:

```bash
# 1. Änderungen vornehmen
# Bearbeiten Sie Dateien in /home/ubuntu/buergerapp-schieder

# 2. Commit
git add .
git commit -m "Beschreibung der Änderung"

# 3. Push
git push origin main

# 4. Automatisches Deployment auf Netlify! ✨
```

**Das war's!** Netlify deployed automatisch jede Änderung auf `main`.

---

## 🔧 Nützliche Befehle

### Lokal entwickeln

```bash
# Development Server
pnpm dev

# Build testen
pnpm build

# Type-Checking
pnpm check
```

### Netlify CLI (optional)

```bash
# Netlify CLI installieren
npm i -g netlify-cli

# Login
netlify login

# Lokal mit Netlify-Umgebung testen
netlify dev

# Manuell deployen
netlify deploy --prod
```

### Logs anzeigen

1. Gehen Sie zu Netlify Dashboard
2. Wählen Sie Ihr Site
3. Klicken Sie auf "Deploys"
4. Wählen Sie einen Deploy
5. Sehen Sie die Build-Logs

---

## 🐛 Troubleshooting

### Build schlägt fehl

**Problem**: "Module not found" oder ähnliche Fehler

**Lösung**:
1. Prüfen Sie `package.json` auf fehlende Dependencies
2. Führen Sie lokal `pnpm build` aus, um Fehler zu identifizieren
3. Prüfen Sie die Netlify Build Logs im Dashboard
4. Stellen Sie sicher, dass `pnpm-lock.yaml` committed ist

### Datenbank-Verbindung schlägt fehl

**Problem**: "Connection refused" oder "Authentication failed"

**Lösung**:
1. Prüfen Sie `DATABASE_URL` in Netlify Environment Variables
2. Stellen Sie sicher, dass das Passwort korrekt ist
3. Prüfen Sie, ob Supabase-Projekt aktiv ist
4. Testen Sie die Verbindung lokal:
   ```bash
   psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

### Environment Variables werden nicht übernommen

**Problem**: Änderungen an Environment Variables haben keine Wirkung

**Lösung**:
1. Gehen Sie zu Netlify → Site settings → Environment variables
2. Ändern Sie die Variable
3. **Wichtig**: Triggern Sie ein neues Deployment:
   - Option 1: Gehen Sie zu Deploys → Trigger deploy → Deploy site
   - Option 2: Git Push:
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push origin main
   ```

### Functions funktionieren nicht

**Problem**: API-Aufrufe schlagen fehl

**Lösung**:
1. Prüfen Sie, ob `netlify.toml` korrekt ist
2. Prüfen Sie Function Logs: Netlify Dashboard → Functions
3. Stellen Sie sicher, dass `serverless-http` installiert ist
4. Prüfen Sie, ob die Build erfolgreich war

### Deployment dauert zu lange

**Problem**: Build hängt oder dauert > 10 Minuten

**Lösung**:
1. Prüfen Sie Netlify Build Logs auf Fehler
2. Canceln Sie das Deployment: Deploys → Cancel deploy
3. Versuchen Sie es erneut: Trigger deploy → Deploy site
4. Prüfen Sie, ob `pnpm-lock.yaml` committed ist

---

## 📊 Monitoring & Analytics

### Netlify Analytics

1. Gehen Sie zu Ihrem Site → **Analytics**
2. Aktivieren Sie "Netlify Analytics" ($9/Monat, optional)
3. Oder nutzen Sie Google Analytics (kostenlos)

### Supabase Monitoring

1. Gehen Sie zu Ihrem Supabase Projekt → **Database**
2. Sehen Sie Verbindungen, Queries und Performance
3. Nutzen Sie **Logs** für Debugging

---

## 🔒 Sicherheit

### Wichtige Sicherheitsmaßnahmen:

1. **Niemals** `.env` Dateien committen
2. **JWT_SECRET** sollte mindestens 32 Zeichen lang sein
3. **Supabase Row Level Security (RLS)** aktivieren:
   ```sql
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   
   -- Policy für authentifizierte Benutzer
   CREATE POLICY "Users can view their own data"
     ON users FOR SELECT
     USING (auth.uid() = id);
   ```
4. **Netlify Environment Variables** sind verschlüsselt gespeichert
5. **HTTPS** ist automatisch aktiviert (Let's Encrypt)
6. **Deploy Previews** für Pull Requests aktivieren

---

## 💰 Kosten

### Free Tier Limits:

**Netlify (Starter - Free)**:
- ✅ 100 GB Bandwidth/Monat
- ✅ 300 Build-Minuten/Monat
- ✅ Unbegrenzte Sites
- ✅ Automatisches HTTPS
- ✅ Custom Domains
- ✅ Serverless Functions (125.000 Requests/Monat)

**Supabase (Free)**:
- ✅ 500 MB Datenbank
- ✅ 1 GB File Storage
- ✅ 50.000 monatliche aktive Benutzer
- ✅ 2 GB Bandwidth

Für die meisten Städte ist der Free Tier ausreichend!

---

## 🚀 Performance-Optimierung

### Build-Zeit reduzieren

1. **Caching aktivieren**: Netlify cached automatisch `node_modules`
2. **Dependencies optimieren**: Entfernen Sie ungenutzte Pakete
3. **Build-Plugins nutzen**: Z.B. `@netlify/plugin-lighthouse`

### Ladezeit verbessern

1. **Asset Optimization**: Netlify optimiert automatisch Bilder
2. **CDN**: Netlify nutzt ein globales CDN
3. **Prerendering**: Für statische Seiten

---

## 📞 Support

- **Netlify Docs**: [docs.netlify.com](https://docs.netlify.com)
- **Netlify Community**: [answers.netlify.com](https://answers.netlify.com)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **GitHub Issues**: Erstellen Sie ein Issue im Repository

---

## ✅ Checkliste

- [ ] GitHub Repository erstellt
- [ ] Supabase Projekt erstellt
- [ ] DATABASE_URL kopiert
- [ ] Netlify Site erstellt
- [ ] Environment Variables gesetzt
- [ ] Erstes Deployment erfolgreich
- [ ] Datenbank initialisiert
- [ ] Automatisches Deployment getestet
- [ ] Custom Domain eingerichtet (optional)
- [ ] SSL-Zertifikat aktiv

---

## 🎯 Netlify-spezifische Features

### Deploy Previews
- Automatische Preview-URLs für Pull Requests
- Testen Sie Änderungen vor dem Merge

### Branch Deploys
- Deployen Sie verschiedene Branches
- Z.B. `staging` Branch für Tests

### Split Testing
- A/B Testing direkt in Netlify
- Verschiedene Versionen parallel testen

### Forms
- Netlify Forms für Kontaktformulare
- Spam-Schutz inklusive

### Identity
- Netlify Identity für Benutzer-Authentifizierung
- Alternative zu OAuth (optional)

---

**Herzlichen Glückwunsch! 🎉**

Ihre Bürger-App ist jetzt live auf Netlify und wird bei jedem Git Push automatisch aktualisiert!

