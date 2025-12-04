# 🗺️ Google Places API Integration

## ✅ Was wurde integriert?

Die **Google Places API** wurde in den Schwalenbot integriert für:

- 🍽️ **Restaurants & Cafés**
- 🛒 **Supermärkte & Geschäfte**
- 💊 **Apotheken & Ärzte**
- ⛽ **Tankstellen & Werkstätten**
- 🏨 **Hotels & Unterkünfte**
- 🎭 **Freizeiteinrichtungen**

## 🎯 Wie funktioniert es?

Der Bot erkennt automatisch **Umkreissuchen** wie:

- "Wo finde ich ein Restaurant in der Nähe?"
- "Gibt es eine Apotheke in Schieder?"
- "Tankstellen in der Umgebung"
- "Supermärkte hier"

**Alle anderen Bot-Funktionen bleiben unverändert:**
- Lokale Datenbank-Suche (News, Events, Verwaltung)
- Perplexity API für aktuelle Informationen
- Web-Suche für globale Fragen

## 🔧 Setup

### 1. Environment Variable setzen

**Render.com:**
1. Gehe zu: https://dashboard.render.com/
2. Wähle dein Service: **schiederapp**
3. **Environment** → **Add Environment Variable**
4. Name: `GOOGLE_PLACES_API_KEY`
5. Value: `AIzaSyAN1Ja48XR6Jn0UNQqqPp0-31yBh0KRFm4`
6. **Save Changes**

### 2. Service neu starten

Nach dem Hinzufügen der Environment Variable startet Render.com automatisch neu.

## 📋 Unterstützte Kategorien

### Gastronomie
- Restaurant, Café, Bar, Kneipe
- Pizza, Burger, Döner, Imbiss

### Einkaufen
- Supermarkt, Geschäft, Laden
- Bäckerei, Metzger

### Gesundheit
- Apotheke, Arzt, Zahnarzt
- Krankenhaus, Klinik

### Auto & Verkehr
- Tankstelle, Werkstatt
- Parkplatz

### Unterkunft
- Hotel, Pension, Ferienwohnung

### Freizeit
- Kino, Museum, Park
- Schwimmbad, Fitnessstudio

### Sonstiges
- Bank, Geldautomat
- Post, Friseur

## 🧪 Testen

**Beispiel-Fragen:**

```
"Wo finde ich ein Restaurant in Schieder?"
"Gibt es eine Apotheke in der Nähe?"
"Tankstellen in der Umgebung"
"Supermärkte hier"
"Hotels in Schieder-Schwalenberg"
```

**Erwartete Antwort:**

```
ORTE IN DER NÄHE (Google Places):
Kategorie: restaurant
Gefunden: 10 Orte

1. **Restaurant Schiedersee**
   📍 Adresse: Schiederseestraße 1, Schieder-Schwalenberg
   ⭐ Bewertung: 4.5/5 (120 Bewertungen)
   🕐 Jetzt geöffnet

2. **Café am Markt**
   📍 Adresse: Marktplatz 3, Schieder-Schwalenberg
   ⭐ Bewertung: 4.2/5 (85 Bewertungen)
   🕐 Jetzt geschlossen
```

## 🔒 API-Limits

**Google Places API:**
- **Kostenlos:** 28.500 Anfragen/Monat
- **Nearby Search:** $32 pro 1.000 Anfragen (nach Free Tier)
- **Details:** $17 pro 1.000 Anfragen

**Empfehlung:** Monitoring aktivieren um Kosten zu überwachen.

## 📝 Code-Dateien

- `server/google-places.ts` - Google Places API Integration
- `server/routers.ts` - Chat-Endpoint mit Places-Integration
- `server/chat-service.ts` - Unverändert (lokale Suche)

## 🚀 Deployment

1. **Commit & Push:**
   ```bash
   git add .
   git commit -m "Add Google Places API for proximity search"
   git push origin main
   ```

2. **Environment Variable setzen** (siehe oben)

3. **Testen!**

## ✅ Fertig!

Die Google Places API ist jetzt integriert und verbessert die Umkreissuche erheblich! 🎉
