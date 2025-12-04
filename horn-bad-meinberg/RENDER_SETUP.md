# Render.com Setup - OpenAI API Integration

## 🔑 Environment Variables auf Render.com einrichten

### Schritt 1: Render.com Dashboard öffnen
1. Gehe zu https://dashboard.render.com
2. Wähle dein **Schiederapp** Service aus

### Schritt 2: Environment Variables hinzufügen
1. Klicke auf **"Environment"** im linken Menü
2. Füge folgende Environment Variables hinzu:

#### **OPENAI_API_KEY** (WICHTIG!)
```
sk-proj-DEIN_OPENAI_API_KEY_HIER
```

⚠️ **Hinweis:** Trage hier deinen echten OpenAI API Key ein (beginnt mit `sk-proj-...`)

#### **OPENAI_BASE_URL** (Optional)
```
https://api.openai.com
```

### Schritt 3: Service neu deployen
1. Klicke auf **"Manual Deploy"** → **"Deploy latest commit"**
2. Warte ca. 2-5 Minuten auf das Deployment

---

## ✅ **Was passiert dann?**

Der Manus Chat-Bot nutzt dann:
- ✅ **OpenAI GPT-4o-mini** (aktuelles Modell)
- ✅ **Aktuelles Weltwissen** (Friedrich Merz als Bundeskanzler, etc.)
- ✅ **Bessere Antworten** auf allgemeine Fragen

---

## 🔒 **Sicherheit**

⚠️ **WICHTIG:** Die `.env` Datei ist in `.gitignore` und wird **NICHT** zu GitHub gepusht!

Der API Key ist nur:
- Lokal in der `.env` Datei (für Development)
- Auf Render.com als Environment Variable (für Production)

---

## 📊 **Kosten**

OpenAI GPT-4o-mini Preise (Stand 2025):
- **Input:** $0.15 / 1M tokens
- **Output:** $0.60 / 1M tokens

Durchschnittliche Chat-Anfrage: ~500 tokens = **$0.0004** (weniger als 1 Cent!)

---

## 🧪 **Testen**

Nach dem Deployment kannst du den Bot testen mit:
- "Wer ist der aktuelle Bundeskanzler?" → Sollte "Friedrich Merz" antworten
- "Wann kommt die Müllabfuhr?" → Sollte auf /waste verweisen

---

**Erstellt am:** 20. November 2025  
**Von:** Manus AI Assistant
