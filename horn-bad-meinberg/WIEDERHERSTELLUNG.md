# Bürger-App Schieder-Schwalenberg - Wiederherstellung

## Status

✅ **Die Anwendung wurde erfolgreich wiederhergestellt!**

## Zugriff

Die Anwendung ist jetzt verfügbar unter:

**https://3000-inl8tacp6y8oylbthspft-4692b5cf.manusvm.computer/**

## Durchgeführte Schritte

### 1. Datenbank-Setup
- MySQL Server installiert und gestartet
- Datenbank `buergerapp` erstellt
- Datenbankschema mit Drizzle ORM migriert
- 15 Tabellen erfolgreich angelegt

### 2. Umgebungskonfiguration
- `.env` Datei erstellt mit allen erforderlichen Variablen
- OAuth-Konfiguration für Benutzer-Authentifizierung
- Datenbankverbindung konfiguriert

### 3. Dependencies Installation
- Alle npm-Pakete mit pnpm installiert
- React, Express, tRPC, Drizzle ORM und weitere Dependencies

### 4. Build & Deployment
- Production Build erstellt
- Server im Produktionsmodus gestartet
- Port 3000 öffentlich zugänglich gemacht

## Technische Details

### Anwendungsarchitektur
- **Frontend**: React 19 mit TypeScript, Tailwind CSS, shadcn/ui Komponenten
- **Backend**: Express.js mit tRPC für typsichere API-Kommunikation
- **Datenbank**: MySQL mit Drizzle ORM
- **Authentifizierung**: OAuth 2.0 über Butterfly Effect Platform
- **Build-Tool**: Vite für Frontend, esbuild für Backend

### Funktionen
Die App bietet folgende Bereiche:
1. **Aktuelles** - Neuigkeiten und Bekanntmachungen
2. **Veranstaltungen** - Lokale Events und Termine
3. **Rathaus & Verwaltung** - Ämter und Behörden
4. **Bürger-Services** - Dienstleistungen für Bürger
5. **Mängelmelder** - Probleme und Schäden melden
6. **Abfall & Termine** - Abfallkalender
7. **Notfall & Störungen** - Warnungen und Alerts
8. **Tourismus & Freizeit** - Sehenswürdigkeiten und POIs
9. **Bildung & Familie** - Schulen und Kitas
10. **Wirtschaft & Bauen** - Wirtschaftsinformationen
11. **Ratsinfos & Politik** - Ratssitzungen und Politik
12. **Kontakt & Anliegen** - Kontaktformular

### Chatbot
- **Schwalenbot** - KI-gestützter Assistent für Bürgeranfragen

## Server-Verwaltung

### Server starten
```bash
cd /home/ubuntu/buergerapp-schieder
NODE_ENV=production node dist/index.js
```

### Entwicklungsmodus
```bash
cd /home/ubuntu/buergerapp-schieder
pnpm dev
```

### Neu bauen
```bash
cd /home/ubuntu/buergerapp-schieder
pnpm build
```

## Datenbank

### Verbindungsdetails
- Host: localhost
- Port: 3306
- Datenbank: buergerapp
- Benutzer: root
- Passwort: password

### Migrationen ausführen
```bash
pnpm db:push
```

## Hinweise

- Die Anwendung läuft aktuell im **Produktionsmodus**
- Der Server ist unter Port 3000 erreichbar
- Die Datenbank ist leer - es wurden noch keine Inhalte eingefügt
- OAuth-Authentifizierung ist konfiguriert und funktionsfähig

## Nächste Schritte

Um die Anwendung vollständig zu nutzen:

1. **Inhalte hinzufügen**: News, Events, Departments etc. über die Admin-Oberfläche oder API
2. **Bilder hochladen**: Für News, Events und POIs
3. **Benutzer anlegen**: Admin-Benutzer für die Verwaltung
4. **Chatbot konfigurieren**: OpenAI API-Key in .env eintragen (falls gewünscht)

## Wiederhergestellt am

22. Oktober 2025, 01:41 Uhr

