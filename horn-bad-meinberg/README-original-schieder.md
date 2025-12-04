# Bürger-App Schieder-Schwalenberg

Eine moderne digitale Stadtverwaltungsplattform für die Stadt Schieder-Schwalenberg.

## 🌟 Features

- **Aktuelles** - Neuigkeiten und Bekanntmachungen
- **Veranstaltungen** - Lokale Events und Termine
- **Rathaus & Verwaltung** - Ämter und Behörden
- **Bürger-Services** - Dienstleistungen für Bürger
- **Mängelmelder** - Probleme und Schäden melden
- **Abfall & Termine** - Abfallkalender
- **Notfall & Störungen** - Warnungen und Alerts
- **Tourismus & Freizeit** - Sehenswürdigkeiten und POIs
- **Bildung & Familie** - Schulen und Kitas
- **Wirtschaft & Bauen** - Wirtschaftsinformationen
- **Ratsinfos & Politik** - Ratssitzungen und Politik
- **Kontakt & Anliegen** - Kontaktformular
- **Schwalenbot** - KI-gestützter Assistent

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, tRPC
- **Database**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **Auth**: OAuth 2.0
- **Build**: Vite, esbuild
- **Deployment**: Netlify

## 📦 Installation

### Voraussetzungen

- Node.js 22.x oder höher
- pnpm
- PostgreSQL Datenbank (Supabase empfohlen)

### Setup

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd buergerapp-schieder
   ```

2. **Dependencies installieren**
   ```bash
   pnpm install
   ```

3. **Umgebungsvariablen konfigurieren**
   ```bash
   cp .env.netlify.example .env
   ```
   
   Bearbeiten Sie `.env` und fügen Sie Ihre Werte ein:
   - `DATABASE_URL` - Supabase PostgreSQL Connection String
   - `JWT_SECRET` - Sicherer JWT Secret
   - Weitere Konfigurationen nach Bedarf

4. **Datenbank migrieren**
   ```bash
   pnpm db:push
   ```

5. **Entwicklungsserver starten**
   ```bash
   pnpm dev
   ```

   Die Anwendung ist nun unter `http://localhost:3000` erreichbar.

## 🏗️ Build

```bash
pnpm build
```

Erstellt einen Production Build in `dist/`.

## 🌐 Deployment auf Netlify

### Automatisches Deployment

1. **Netlify Account erstellen** auf [netlify.com](https://netlify.com)

2. **Repository mit Netlify verbinden**
   - "Add new site" → "Import an existing project" klicken
   - GitHub auswählen
   - Repository auswählen
   - Import bestätigen

3. **Umgebungsvariablen setzen**
   
   In Netlify Site Settings → Environment Variables:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-secret
   VITE_APP_ID=proj_buergerapp_schieder
   VITE_APP_TITLE=Bürger-App Schieder-Schwalenberg
   OAUTH_SERVER_URL=https://vidabiz.butterfly-effect.dev
   VITE_OAUTH_PORTAL_URL=https://vida.butterfly-effect.dev
   ```

4. **Deploy**
   - Netlify deployed automatisch bei jedem Push auf `main`
   - Oder manuell über Netlify Dashboard

### Supabase Setup

1. **Supabase Project erstellen** auf [supabase.com](https://supabase.com)

2. **Connection String kopieren**
   - Project Settings → Database → Connection string
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

3. **In Vercel einfügen**
   - Als `DATABASE_URL` Environment Variable

4. **Datenbank migrieren**
   ```bash
   pnpm db:push
   ```

## 📝 Scripts

- `pnpm dev` - Entwicklungsserver starten
- `pnpm build` - Production Build erstellen
- `pnpm start` - Production Server starten
- `pnpm db:push` - Datenbank-Schema migrieren
- `pnpm check` - TypeScript Type-Checking
- `pnpm format` - Code formatieren mit Prettier

## 🗄️ Datenbank

Die Anwendung verwendet PostgreSQL mit Drizzle ORM. Das Schema definiert 15 Tabellen:

- `users` - Benutzer
- `news` - Neuigkeiten
- `events` - Veranstaltungen
- `departments` - Ämter
- `issueReports` - Mängelmeldungen
- `wasteSchedule` - Abfallkalender
- `alerts` - Warnungen
- `pois` - Points of Interest
- `institutions` - Bildungseinrichtungen
- `councilMeetings` - Ratssitzungen
- `mayorInfo` - Bürgermeister-Infos
- `chatLogs` - Chatbot-Logs
- `userPreferences` - Benutzer-Einstellungen
- `contactMessages` - Kontaktnachrichten
- `pushNotifications` - Push-Benachrichtigungen

## 🔐 Sicherheit

- JWT-basierte Authentifizierung
- OAuth 2.0 Integration
- Sichere Umgebungsvariablen
- HTTPS in Production

## 📄 Lizenz

MIT

## 🤝 Contributing

Contributions sind willkommen! Bitte erstellen Sie einen Pull Request.

## 📧 Kontakt

Bei Fragen oder Problemen erstellen Sie bitte ein Issue im Repository.

---

**Entwickelt für die Stadt Schieder-Schwalenberg**

