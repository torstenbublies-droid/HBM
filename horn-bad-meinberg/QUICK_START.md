# Quick Start: 5 Minuten bis Live! ⚡

## Schritt 1: GitHub Repository (1 Min)

```bash
cd /home/ubuntu/buergerapp-schieder
gh repo create buergerapp-schieder --public --source=. --remote=origin --push
```

Oder manuell: [github.com/new](https://github.com/new) → Repository erstellen → Code pushen

---

## Schritt 2: Supabase (2 Min)

1. [supabase.com](https://supabase.com) → Sign up mit GitHub
2. "New Project" → Name: `buergerapp-schieder`
3. Passwort generieren & speichern!
4. Region wählen → "Create"
5. Settings → Database → Connection String kopieren

```
postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

---

## Schritt 3: Netlify (2 Min)

1. [netlify.com](https://netlify.com) → Sign up mit GitHub
2. "Add new site" → "Import an existing project"
3. GitHub → Repository `buergerapp-schieder` auswählen
4. Environment Variables hinzufügen:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
JWT_SECRET=ihr-sicherer-secret-mindestens-32-zeichen
VITE_APP_ID=proj_buergerapp_schieder
VITE_APP_TITLE=Bürger-App Schieder-Schwalenberg
OAUTH_SERVER_URL=https://vidabiz.butterfly-effect.dev
VITE_OAUTH_PORTAL_URL=https://vida.butterfly-effect.dev
```

5. "Deploy site" klicken

---

## ✅ Fertig!

Ihre App ist jetzt live unter: `https://your-site-name.netlify.app`

**Automatisches Deployment:**
```bash
git add .
git commit -m "Meine Änderung"
git push origin main
```

→ Automatisch live in 1-2 Minuten! 🚀

---

Ausführliche Anleitung: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

