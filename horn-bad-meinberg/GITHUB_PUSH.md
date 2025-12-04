# GitHub Push Anleitung

Da die Authentifizierung in der Sandbox schwierig ist, hier die Schritte, um den Code von Ihrem lokalen Computer zu pushen:

## Option 1: Projekt herunterladen und lokal pushen

### Schritt 1: Projekt-Archiv herunterladen
Das Projekt ist bereits als `.tar.gz` verfügbar. Laden Sie es herunter und entpacken Sie es auf Ihrem Computer.

### Schritt 2: Auf Ihrem Computer
```bash
# Entpacken
tar -xzf buergerapp-schieder-deploy.tar.gz
cd buergerapp-schieder

# Remote hinzufügen (falls noch nicht vorhanden)
git remote add origin https://github.com/torstenbublies-droid/buergerapp-schieder.git

# Pushen
git push -u origin main
```

Bei der Authentifizierung:
- **Username**: torstenbublies-droid
- **Password**: Verwenden Sie einen **Personal Access Token** (nicht Ihr GitHub-Passwort!)

## Option 2: Personal Access Token erstellen

GitHub erlaubt keine Passwort-Authentifizierung mehr. Sie benötigen einen Token:

### Token erstellen:
1. Gehen Sie zu: https://github.com/settings/tokens
2. Klicken Sie auf "Generate new token" → "Generate new token (classic)"
3. Name: `buergerapp-deploy`
4. Expiration: 90 days (oder nach Wunsch)
5. Scopes: Wählen Sie **`repo`** (voller Zugriff auf Repositories)
6. Klicken Sie auf "Generate token"
7. **KOPIEREN SIE DEN TOKEN SOFORT** (wird nur einmal angezeigt!)

### Token verwenden:
```bash
# Beim Git Push nach Password gefragt
Username: torstenbublies-droid
Password: [IHR-PERSONAL-ACCESS-TOKEN]
```

## Option 3: SSH Key (empfohlen für die Zukunft)

### SSH Key erstellen:
```bash
ssh-keygen -t ed25519 -C "torsten.bublies@gmail.com"
# Drücken Sie Enter für Standard-Speicherort
# Geben Sie optional ein Passwort ein
```

### Public Key zu GitHub hinzufügen:
```bash
# Public Key anzeigen
cat ~/.ssh/id_ed25519.pub
```

1. Kopieren Sie den gesamten Output
2. Gehen Sie zu: https://github.com/settings/keys
3. Klicken Sie auf "New SSH key"
4. Title: `Mein Computer`
5. Key: Fügen Sie den kopierten Public Key ein
6. Klicken Sie auf "Add SSH key"

### Repository-URL auf SSH ändern:
```bash
cd buergerapp-schieder
git remote set-url origin git@github.com:torstenbublies-droid/buergerapp-schieder.git
git push -u origin main
```

## Aktueller Status

✅ Repository auf GitHub erstellt: https://github.com/torstenbublies-droid/buergerapp-schieder
✅ Code ist lokal committed und bereit
✅ Remote ist konfiguriert
⏳ Warte auf Push

## Nach dem Push

Sobald der Code auf GitHub ist:

1. **Netlify einrichten** (siehe DEPLOYMENT_GUIDE.md)
2. **Supabase einrichten** (siehe DEPLOYMENT_GUIDE.md)
3. **Automatisches Deployment genießen!** 🚀

---

**Hinweis**: Aus Sicherheitsgründen sollten Sie Ihr GitHub-Passwort ändern, da Sie es in einem Chat geteilt haben. Verwenden Sie in Zukunft immer Personal Access Tokens für Git-Operationen.

