# Perplexity Search API Setup

## 📋 **Was ist Perplexity?**

Perplexity AI ist eine fortschrittliche Suchmaschine, die Web-Suche mit KI kombiniert um präzise, aktuelle Antworten zu liefern.

---

## ✅ **Vorteile für den Manus Bot:**

1. **Bessere lokale Suchen**
   - Findet Apotheken, Ärzte, Restaurants in Schieder-Schwalenberg
   - Aktuelle Veranstaltungen und Events
   - Öffnungszeiten und Kontaktdaten

2. **Strukturierte Ergebnisse**
   - Titel, Snippet, URL
   - Quellenangaben
   - Zuverlässige Daten

3. **Automatischer lokaler Kontext**
   - "Apotheke" → "Apotheke in Schieder-Schwalenberg"
   - "Weihnachtsmarkt" → "Weihnachtsmarkt in Schieder-Schwalenberg"

4. **Günstig**
   - $5 per 1.000 Anfragen
   - Bei 1.000 Chats/Monat: ~$5
   - Bei 10.000 Chats/Monat: ~$50

---

## 🔧 **Setup auf Render.com:**

### 1. Environment Variable hinzufügen:

1. Gehe zu: https://dashboard.render.com
2. Wähle: **Schiederapp** Service
3. Klicke: **Environment** → **Add Environment Variable**
4. Füge hinzu:
   - **Key:** `PERPLEXITY_API_KEY`
   - **Value:** `<your_perplexity_api_key>`
5. Klicke: **Save Changes**
6. Warte auf automatisches Redeploy (~2-5 Min.)

---

## 🧪 **Testen:**

Nach dem Deployment teste folgende Fragen:

### **Lokale Fragen:**
- ✅ "wo ist die nächste Apotheke?"
- ✅ "wo finde ich einen Arzt?"
- ✅ "wann ist weihnachtsmarkt in wöbbel?"
- ✅ "was ist los am schiedersee?"
- ✅ "öffnungszeiten freibad?"

### **Globale Fragen:**
- ✅ "wer ist der bundeskanzler?"
- ✅ "wie heißt die aktuelle bauministerin?"
- ✅ "wetter in berlin?"

---

## 📊 **Wie es funktioniert:**

### **1. Automatische Kontext-Erkennung:**

```typescript
// Nutzer fragt: "wo ist die nächste Apotheke?"
// Bot erkennt: "apotheke" = lokale Frage
// Bot sucht: "Apotheke in Schieder-Schwalenberg"
```

### **2. Fallback-System:**

```
1. Versuche Perplexity (beste Qualität)
   ↓ Keine Ergebnisse?
2. Versuche Google-Scraping
   ↓ Keine Ergebnisse?
3. Versuche DuckDuckGo
```

### **3. Strukturierte Ergebnisse:**

```
**Apotheke am Markt**
Hauptstraße 15, 32816 Schieder-Schwalenberg
Tel: 05282 / 12345
Öffnungszeiten: Mo-Fr 8-18 Uhr, Sa 9-13 Uhr
Quelle: https://apotheke-am-markt.de
```

---

## 💰 **Kosten-Übersicht:**

| Nutzung | Kosten/Monat |
|---------|--------------|
| 1.000 Chats | ~$5 |
| 5.000 Chats | ~$25 |
| 10.000 Chats | ~$50 |
| 20.000 Chats | ~$100 |

**Hinweis:** Nicht jeder Chat löst eine Suche aus! Nur Fragen die aktuelle Informationen benötigen.

---

## 🔍 **Logs prüfen:**

Auf Render.com solltest du sehen:

```
[Perplexity Search] Original: "wo ist die nächste Apotheke?" 
                  → Enhanced: "Apotheke in Schieder-Schwalenberg"
[Perplexity] Found 5 results
[Chat] Web search results: **Apotheke am Markt**...
```

---

## ⚠️ **Wichtig:**

- API Key **NIEMALS** in Git committen!
- Nur in `.env` (lokal) und Render.com Environment Variables
- `.env` ist bereits in `.gitignore`

---

**Erstellt:** 20. November 2025  
**Autor:** Manus AI Assistant
