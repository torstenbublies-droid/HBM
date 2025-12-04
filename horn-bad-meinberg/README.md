# HBM - Horn-Bad Meinberg Multi-Tenant Bürger-App

Eine moderne Multi-Tenant Web-Anwendung für Städte und Gemeinden, entwickelt für Horn-Bad Meinberg.

## Features

- 🏛️ **Multi-Tenant Architektur** - Unterstützt mehrere Städte/Gemeinden
- 💬 **Intelligenter Chatbot** - Mit lokaler Datenbanksuche und Perplexity AI Integration
- 📰 **News & Events** - Aktuelle Nachrichten und Veranstaltungen
- 🏫 **Bildungseinrichtungen** - Schulen, Kindergärten, Kitas
- 🎭 **Vereine** - Übersicht aller lokalen Vereine
- 🗺️ **Tourismus** - Sehenswürdigkeiten und Ortsteile
- 🗑️ **Abfallkalender** - Müllabfuhr-Termine
- 📋 **Bürger-Services** - Online-Formulare und Anträge
- 🔔 **Benachrichtigungen** - Push-Benachrichtigungen für wichtige Updates

## Tech Stack

- **Frontend:** React + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js + Express + tRPC
- **Database:** PostgreSQL mit Drizzle ORM
- **AI:** Perplexity API, Google Places API
- **Deployment:** Nginx Reverse Proxy + systemd

## Installation

```bash
# Dependencies installieren
pnpm install

# Datenbank migrieren
pnpm run db:push

# Development Server starten
pnpm run dev

# Production Build
pnpm run build
```

## Umgebungsvariablen

Erstelle eine `.env` Datei:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
PERPLEXITY_API_KEY=your_key_here
GOOGLE_PLACES_API_KEY=your_key_here
```

## Deployment

Die App läuft als systemd Service mit Nginx Reverse Proxy.

## Lizenz

Proprietary - Alle Rechte vorbehalten
