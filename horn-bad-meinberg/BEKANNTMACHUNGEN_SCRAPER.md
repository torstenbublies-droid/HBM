# Bekanntmachungen Scraper

Automatischer Web Scraper für Bekanntmachungen von der Stadt Schieder-Schwalenberg Website.

## 📋 Übersicht

Der Scraper zieht automatisch die neuesten Bekanntmachungen von:
**https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Bekanntmachungen**

### Funktionen:
- ✅ Zieht die letzten 15 Bekanntmachungen
- ✅ Speichert sie in der Supabase Datenbank
- ✅ Läuft automatisch alle 3 Tage
- ✅ Vermeidet Duplikate

## 🚀 Verwendung

### Manuell ausführen:

```bash
# Im Projektverzeichnis
cd /home/ubuntu/buergerapp-schieder

# Scraper ausführen
pnpm scrape:bekanntmachungen
```

### Automatisch (Cron Job):

Der Scraper läuft automatisch alle 3 Tage um 6:00 Uhr morgens.

#### Systemd Timer einrichten:

```bash
# Timer und Service installieren
sudo cp /tmp/bekanntmachungen-update.timer /etc/systemd/system/
sudo cp /tmp/bekanntmachungen-update.service /etc/systemd/system/

# Timer aktivieren
sudo systemctl daemon-reload
sudo systemctl enable bekanntmachungen-update.timer
sudo systemctl start bekanntmachungen-update.timer

# Status prüfen
sudo systemctl status bekanntmachungen-update.timer
```

#### Logs ansehen:

```bash
# Timer-Status
sudo systemctl list-timers bekanntmachungen-update.timer

# Service-Logs
sudo journalctl -u bekanntmachungen-update.service -f
```

## 📁 Dateien

### Scraper:
- `server/scrapers/bekanntmachungen.ts` - Haupt-Scraper-Logik
- `server/cron/update-bekanntmachungen.ts` - Cron Job Script

### Frontend:
- `client/src/pages/News.tsx` - Anzeige der Bekanntmachungen (Neuigkeiten entfernt)

## 🔧 Konfiguration

### Anzahl der Bekanntmachungen ändern:

In `server/scrapers/bekanntmachungen.ts`:

```typescript
if (i >= 15) return false; // Limit to 15 items
// Ändern Sie 15 auf die gewünschte Anzahl
```

### Update-Intervall ändern:

In `/tmp/bekanntmachungen-update.timer`:

```ini
# Aktuell: Alle 3 Tage
OnCalendar=*-*-1,4,7,10,13,16,19,22,25,28,31 06:00:00

# Täglich um 6:00 Uhr:
OnCalendar=daily

# Jeden Montag um 8:00 Uhr:
OnCalendar=Mon *-*-* 08:00:00
```

Nach Änderungen:
```bash
sudo systemctl daemon-reload
sudo systemctl restart bekanntmachungen-update.timer
```

## 🗄️ Datenbank

Die Bekanntmachungen werden in der `news` Tabelle gespeichert mit:
- **category**: `"Bekanntmachungen"`
- **title**: Titel der Bekanntmachung
- **teaser**: Kurzbeschreibung
- **publishedAt**: Veröffentlichungsdatum
- **sourceUrl**: Link zur Original-Bekanntmachung

## 🐛 Fehlerbehebung

### Scraper läuft nicht:

```bash
# Manuell testen
cd /home/ubuntu/buergerapp-schieder
pnpm scrape:bekanntmachungen

# Fehler im Log prüfen
sudo journalctl -u bekanntmachungen-update.service -n 50
```

### Keine Daten in der App:

1. Prüfen Sie, ob Daten in der Datenbank sind:
   - Supabase → Table Editor → `news` Tabelle
   - Filter: `category = 'Bekanntmachungen'`

2. Prüfen Sie die Frontend-Kategorie:
   - In `News.tsx` muss die Kategorie `"Bekanntmachungen"` sein

### Website-Struktur hat sich geändert:

Wenn die Stadt-Website ihre Struktur ändert, muss der Scraper angepasst werden:

1. Öffnen Sie `server/scrapers/bekanntmachungen.ts`
2. Passen Sie die CSS-Selektoren an:
   ```typescript
   $('div.bekanntmachung, div.mitteilung, article').each(...)
   ```
3. Testen Sie den Scraper manuell
4. Committen und pushen Sie die Änderungen

## 📊 Monitoring

### Letzte Ausführung prüfen:

```bash
sudo systemctl status bekanntmachungen-update.service
```

### Nächste Ausführung anzeigen:

```bash
sudo systemctl list-timers bekanntmachungen-update.timer
```

### Manuell triggern:

```bash
sudo systemctl start bekanntmachungen-update.service
```

## 🔄 Updates

Nach Code-Änderungen:

```bash
cd /home/ubuntu/buergerapp-schieder
git pull origin main
pnpm install
sudo systemctl restart bekanntmachungen-update.service
```

## 📝 Hinweise

- Der Scraper respektiert die robots.txt der Website
- Vermeidet Duplikate durch `onConflictDoNothing()`
- Läuft mit niedriger Priorität, um Server nicht zu belasten
- Logs werden automatisch rotiert durch systemd

## 🚀 Deployment

Die Änderungen sind bereits auf Netlify deployed:
- **URL**: https://buergerapp-schieder.netlify.app
- **Auto-Deploy**: Bei jedem Git Push

**Hinweis**: Der Cron Job läuft nur auf dem Server, nicht auf Netlify. Für Netlify müssten Sie einen Scheduled Function einrichten oder einen externen Cron-Service verwenden.

### Netlify Scheduled Function (Alternative):

Erstellen Sie `netlify/functions/scheduled-scrape.ts`:

```typescript
import { schedule } from '@netlify/functions';
import { scrapeBekanntmachungen } from '../../server/scrapers/bekanntmachungen';

export const handler = schedule('0 6 */3 * *', async () => {
  await scrapeBekanntmachungen();
  return {
    statusCode: 200
  };
});
```

Dann in `netlify.toml`:

```toml
[[functions]]
  name = "scheduled-scrape"
  schedule = "0 6 */3 * *"
```

