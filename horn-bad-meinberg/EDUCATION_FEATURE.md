# Bildung & Familie - Feature Dokumentation

## ✅ ERFOLGREICH IMPLEMENTIERT UND GETESTET

Die **Bildung & Familie**-Seite ist vollständig funktionsfähig und zeigt alle Kindergärten, Schulen und Büchereien in Schieder-Schwalenberg an.

---

## 📊 Übersicht

### **10 Einrichtungen in 3 Kategorien:**

| Kategorie | Icon | Farbe | Anzahl | Status |
|-----------|------|-------|--------|--------|
| 👶 **Kindergärten** | Baby | Pink | 6 | ✅ Getestet |
| 🎓 **Schulen** | GraduationCap | Indigo | 2 | ✅ Getestet |
| 📚 **Stadtbücherei** | BookOpen | Emerald | 2 | ✅ Getestet |
| **GESAMT** | | | **10** | ✅ |

---

## 📋 Importierte Einrichtungen

### **Kindergärten (6)**

1. **AWO - Kindertagesstätte "Drachennest"**
   - Tulpenstraße 16, 32816 Schieder-Schwalenberg
   - Tel: 05233 / 93795

2. **DRK Kindergarten "Wurzelhöhle"**
   - Ahornweg 5, 32816 Schieder-Schwalenberg
   - Tel: 05233 / 93971

3. **Kindergarten "Wildblume" der Evangelisch-reformierten Kirchengemeinde Schwalenberg**
   - Auf der Höhe 8, 32816 Schieder-Schwalenberg
   - Tel: 05284 / 331

4. **Katholischer Kindergarten St. Joseph**
   - Domäne 9, 32816 Schieder-Schwalenberg
   - Tel: 05282 / 8246

5. **Städtischer Kindergarten "Rappelkiste"**
   - Schubertstraße 10, 32816 Schieder-Schwalenberg
   - Tel: 05282 / 6342

6. **Tageseinrichtung im SOS-Kinderdorf Lippe**
   - Forstweg 1, 32816 Schieder-Schwalenberg
   - Tel: 05284 / 94 27 16

### **Schulen (2)**

1. **Grundschule am Schloßpark**
   - Parkallee 7, 32816 Schieder-Schwalenberg
   - Tel: 05282 / 601-700
   - Fax: 05282 / 601-9700

2. **Alexander-Zeiß-Grundschule**
   - Brinkfeldweg 2, 32816 Schieder-Schwalenberg
   - Tel: 05282 / 601-600
   - Fax: 05282 / 601-9600

### **Stadtbücherei (2)**

1. **Bücherei Schieder**
   - 32816 Schieder-Schwalenberg
   - Tel: 05282 / 60160

2. **Bücherei Wöbbel**
   - Kastanienweg 7, 32816 Schieder-Schwalenberg
   - Tel: 05233 / 954286

---

## 🔧 Technische Implementierung

### **Datenbank-Tabellen:**

```sql
-- Kategorien
CREATE TABLE education_categories (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  color VARCHAR(50) NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, name)
);

-- Einrichtungen
CREATE TABLE education_facilities (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id),
  category_id INTEGER NOT NULL REFERENCES education_categories(id),
  name VARCHAR(255) NOT NULL,
  address TEXT,
  phone VARCHAR(50),
  fax VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(255),
  opening_hours TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(tenant_id, name)
);
```

### **API-Endpoint:**

- **URL:** `/api/education?tenant=schieder`
- **Methode:** GET
- **Response:** JSON mit Kategorien und Einrichtungen

### **Frontend-Komponente:**

- **Pfad:** `client/src/pages/Education.tsx`
- **Framework:** React mit Wouter (Routing)
- **Icons:** Lucide React
- **Styling:** Tailwind CSS

### **Scraping-Script:**

- **Pfad:** `scripts/scrape-schieder-education.ts`
- **Technologie:** Playwright + Cheerio
- **Quellen:**
  - https://www.schieder-schwalenberg.de/Familie-und-Soziales/Bildung/Kindergärten
  - https://www.schieder-schwalenberg.de/Familie-und-Soziales/Bildung/Schulen
  - https://www.schieder-schwalenberg.de/Familie-und-Soziales/Bildung/Stadtbücherei

---

## ✅ Funktionen

### **Frontend (Getestet im Browser)**

- ✅ **Kategorie-Tabs** mit farbigen Icons (Baby, GraduationCap, BookOpen)
- ✅ **Anzahl der Einrichtungen** pro Kategorie
- ✅ **Kategorie-Wechsel** funktioniert perfekt
- ✅ **Vollständige Kontaktdaten:**
  - Name
  - Adresse
  - Telefon
  - Fax
  - E-Mail (wenn vorhanden)
  - Website (wenn vorhanden)
  - Öffnungszeiten (wenn vorhanden)
- ✅ **Klickbare Links** für Telefon (tel:)
- ✅ **Responsive Grid-Layout** (1-2-3 Spalten)
- ✅ **Farbcodierung** pro Kategorie (Pink, Indigo, Emerald)

### **Backend**

- ✅ API-Endpoint `/api/education?tenant=schieder` funktioniert
- ✅ Daten werden korrekt gruppiert nach Kategorien
- ✅ Multi-Tenant-Unterstützung

### **Automatisierung**

- ✅ Scraping-Script läuft erfolgreich
- ✅ Importiert alle 10 Einrichtungen
- ✅ Duplikat-Vermeidung durch UNIQUE-Constraint
- ⏰ **Kann in Cron-Job integriert werden** (alle 2 Tage)

---

## 🚀 Verwendung

### **Scraping-Script ausführen:**

```bash
cd /home/ubuntu/multi_tenant_app/schieder-multi-tenant
npx tsx scripts/scrape-schieder-education.ts
```

### **API testen:**

```bash
curl "http://localhost:3000/api/education?tenant=schieder" | jq
```

### **Seite im Browser öffnen:**

```
http://localhost:3000/education?tenant=schieder
```

---

## 📁 Dateien

### **Neu erstellt:**

1. **`server/routes/education.ts`** - API-Route für Bildungseinrichtungen
2. **`scripts/scrape-schieder-education.ts`** - Scraping-Script
3. **`client/src/pages/Education.tsx`** - Frontend-Komponente (überschrieben)
4. **`EDUCATION_FEATURE.md`** - Diese Dokumentation

### **Modifiziert:**

1. **`server/_core/index.ts`** - Education-Route hinzugefügt
2. **`server/cron-jobs.ts`** - Kann um Education-Scraping erweitert werden

### **Datenbank:**

- **`education_categories`** - 3 Kategorien
- **`education_facilities`** - 10 Einrichtungen

---

## 🔄 Automatisches Update (Optional)

Um die Daten automatisch zu aktualisieren, fügen Sie in `server/cron-jobs.ts` hinzu:

```typescript
// Education scraping - every 2 days at 1:40 AM
cron.schedule('0 40 1 */2 * *', async () => {
  console.log('Running education scraping...');
  try {
    execSync('npx tsx scripts/scrape-schieder-education.ts', {
      cwd: process.cwd(),
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('Education scraping failed:', error);
  }
});
console.log('✓ Education scraping scheduled: Every 2 days at 1:40 AM');
```

---

## 📸 Screenshots

Siehe Browser-Screenshots:
- Kindergärten-Kategorie mit 6 Einrichtungen
- Schulen-Kategorie mit 2 Einrichtungen
- Stadtbücherei-Kategorie mit 2 Einrichtungen

---

## ✅ Status

**PRODUKTIONSBEREIT**

Alle Funktionen wurden erfolgreich getestet:
- ✅ Scraping funktioniert
- ✅ Datenbank-Import funktioniert
- ✅ API liefert korrekte Daten
- ✅ Frontend zeigt alle Einrichtungen an
- ✅ Kategorie-Wechsel funktioniert
- ✅ Kontaktdaten sind klickbar

---

## 📝 Nächste Schritte (Optional)

1. ✨ **Öffnungszeiten** für Büchereien hinzufügen (wenn auf Website verfügbar)
2. 📧 **E-Mail-Adressen** extrahieren (wenn auf Website verfügbar)
3. 🌐 **Websites** verlinken (wenn auf Website verfügbar)
4. 🗺️ **Karte** mit Standorten hinzufügen
5. 🔍 **Suchfunktion** implementieren
6. ⏰ **Cron-Job** für automatische Updates aktivieren

---

**Datum:** 23. November 2025  
**Version:** 1.0  
**Status:** ✅ Produktionsbereit
