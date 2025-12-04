var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/services/google-places.ts
var google_places_exports = {};
__export(google_places_exports, {
  extractPlaceType: () => extractPlaceType,
  formatPlacesForChatbot: () => formatPlacesForChatbot,
  mapPlaceType: () => mapPlaceType,
  searchNearbyPlaces: () => searchNearbyPlaces2
});
async function searchNearbyPlaces2(latitude, longitude, radius, placeType, maxResults = 10) {
  if (!GOOGLE_PLACES_API_KEY2) {
    console.error("[Google Places] API key not configured");
    return [];
  }
  try {
    const url = "https://places.googleapis.com/v1/places:searchNearby";
    const requestBody = {
      includedTypes: [placeType],
      maxResultCount: Math.min(maxResults, 20),
      locationRestriction: {
        circle: {
          center: {
            latitude,
            longitude
          },
          radius: Math.min(radius, 5e4)
        }
      }
    };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY2,
        "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.googleMapsUri"
      },
      body: JSON.stringify(requestBody)
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Google Places] API error:", response.status, errorText);
      return [];
    }
    const data = await response.json();
    return data.places || [];
  } catch (error) {
    console.error("[Google Places] Error searching nearby places:", error);
    return [];
  }
}
function mapPlaceType(germanType) {
  const typeMap = {
    "lebensmittel": "supermarket",
    "discounter": "supermarket",
    "discount": "supermarket",
    "aldi": "supermarket",
    "lidl": "supermarket",
    "penny": "supermarket",
    "netto": "supermarket",
    "rewe": "supermarket",
    "edeka": "supermarket",
    "einkaufsm\xF6glichkeit": "store",
    "einkaufsm\xF6glichkeiten": "store",
    "einkaufen": "store",
    "shopping": "shopping_mall",
    "gesch\xE4ft": "store",
    "gesch\xE4fte": "store",
    "laden": "store",
    "l\xE4den": "store",
    "zahnarzt": "dentist",
    "zahn\xE4rzte": "dentist",
    "arzt": "doctor",
    "\xE4rzte": "doctor",
    "apotheke": "pharmacy",
    "apotheken": "pharmacy",
    "krankenhaus": "hospital",
    "restaurant": "restaurant",
    "restaurants": "restaurant",
    "caf\xE9": "cafe",
    "cafe": "cafe",
    "tankstelle": "gas_station",
    "tankstellen": "gas_station",
    "supermarkt": "supermarket",
    "superm\xE4rkte": "supermarket",
    "bank": "bank",
    "banken": "bank",
    "geldautomat": "atm",
    "atm": "atm",
    "fris\xF6r": "hair_care",
    "friseur": "hair_care",
    "hotel": "lodging",
    "hotels": "lodging"
  };
  const lowerType = germanType.toLowerCase();
  return typeMap[lowerType] || "point_of_interest";
}
function extractPlaceType(message) {
  const lowerMessage = message.toLowerCase();
  const placeTypes = [
    "lebensmittel",
    "discounter",
    "discount",
    "einkaufsm\xF6glichkeit",
    "einkaufsm\xF6glichkeiten",
    "einkaufen",
    "shopping",
    "gesch\xE4ft",
    "gesch\xE4fte",
    "laden",
    "l\xE4den",
    "zahnarzt",
    "zahn\xE4rzte",
    "arzt",
    "\xE4rzte",
    "apotheke",
    "apotheken",
    "krankenhaus",
    "restaurant",
    "restaurants",
    "caf\xE9",
    "cafe",
    "tankstelle",
    "tankstellen",
    "supermarkt",
    "superm\xE4rkte",
    "bank",
    "banken",
    "geldautomat",
    "atm",
    "fris\xF6r",
    "friseur",
    "hotel",
    "hotels"
  ];
  for (const type of placeTypes) {
    if (lowerMessage.includes(type)) {
      return type;
    }
  }
  return null;
}
function formatPlacesForChatbot(places, cityName) {
  if (places.length === 0) {
    return `Leider konnte ich keine passenden Orte in der N\xE4he von ${cityName} finden. Versuche es mit einer Google Maps Suche.`;
  }
  let response = `\u{1F5FA}\uFE0F Hier sind die Ergebnisse in der N\xE4he von ${cityName}:

`;
  places.slice(0, 5).forEach((place, index) => {
    response += `${index + 1}. **${place.displayName?.text || place.name}**
`;
    if (place.formattedAddress) {
      response += `   \u{1F4CD} ${place.formattedAddress}
`;
    }
    if (place.rating && place.userRatingCount) {
      response += `   \u2B50 ${place.rating}/5 (${place.userRatingCount} Bewertungen)
`;
    }
    if (place.nationalPhoneNumber || place.internationalPhoneNumber) {
      response += `   \u{1F4DE} ${place.nationalPhoneNumber || place.internationalPhoneNumber}
`;
    }
    if (place.websiteUri) {
      response += `   \u{1F310} [Website \xF6ffnen](${place.websiteUri})
`;
    }
    if (place.googleMapsUri) {
      response += `   \u{1F5FA}\uFE0F [In Google Maps \xF6ffnen](${place.googleMapsUri})
`;
    }
    response += "\n";
  });
  if (places.length > 5) {
    response += `_... und ${places.length - 5} weitere Ergebnisse_
`;
  }
  return response;
}
var GOOGLE_PLACES_API_KEY2;
var init_google_places = __esm({
  "server/services/google-places.ts"() {
    "use strict";
    GOOGLE_PLACES_API_KEY2 = process.env.GOOGLE_PLACES_API_KEY || "AIzaSyAj-cTa8x15rpSC-RfoaNnaCxPZaRRID6g";
  }
});

// server/services/local-search-service.ts
var local_search_service_exports = {};
__export(local_search_service_exports, {
  searchLocalDatabase: () => searchLocalDatabase
});
import pg from "pg";
async function searchLocalDatabase(tenantId, query) {
  const results = [];
  const keywords = extractKeywords(query);
  try {
    const tenantResult = await pool.query(
      `SELECT name, "contactEmail", "contactPhone", "contactAddress", mayor_name, opening_hours 
       FROM tenants WHERE id = $1`,
      [tenantId]
    );
    if (tenantResult.rows.length > 0) {
      const tenant = tenantResult.rows[0];
      if (containsKeywords(query, ["b\xFCrgermeister", "mayor", "oberb\xFCrgermeister"])) {
        results.push({
          title: "B\xFCrgermeister",
          content: `Der B\xFCrgermeister von ${tenant.name} ist ${tenant.mayor_name || "Michael Ruttner"}.`,
          source: "tenant_info"
        });
      }
      if (containsKeywords(query, ["\xF6ffnungszeit", "ge\xF6ffnet", "\xF6ffnet", "rathaus", "\xF6ffnung", "wann hat", "wann ist"])) {
        const openingHours = tenant.opening_hours || `Montag: 08:00 - 12:00 Uhr, 14:00 - 16:00 Uhr
Dienstag: 08:00 - 12:00 Uhr, 14:00 - 18:00 Uhr
Mittwoch: 08:00 - 12:00 Uhr
Donnerstag: 08:00 - 12:00 Uhr, 14:00 - 16:00 Uhr
Freitag: 08:00 - 12:00 Uhr`;
        results.push({
          title: "\xD6ffnungszeiten Rathaus",
          content: `Das Rathaus ${tenant.name} hat folgende \xD6ffnungszeiten:

${openingHours}`,
          source: "tenant_info"
        });
      }
      if (containsKeywords(query, ["kontakt", "telefon", "email", "adresse", "anschrift", "erreichbar", "erreichen", "kontaktieren", "anrufen"])) {
        let contactInfo = `Kontaktinformationen ${tenant.name}:

`;
        if (tenant.contactAddress) contactInfo += `\u{1F4CD} ${tenant.contactAddress}
`;
        if (tenant.contactPhone) contactInfo += `\u{1F4DE} ${tenant.contactPhone}
`;
        if (tenant.contactEmail) contactInfo += `\u{1F4E7} ${tenant.contactEmail}
`;
        results.push({
          title: "Kontaktinformationen",
          content: contactInfo,
          source: "tenant_info"
        });
      }
    }
    if (containsKeywords(query, ["nachricht", "news", "aktuell", "neu", "information"])) {
      const newsResult = await pool.query(
        `SELECT title, content, published_at 
         FROM news_articles 
         WHERE tenant_id = $1 
         ORDER BY published_at DESC 
         LIMIT 5`,
        [tenantId]
      );
      for (const news2 of newsResult.rows) {
        results.push({
          title: news2.title,
          content: news2.content?.substring(0, 300) || "",
          source: "news"
        });
      }
    }
    if (containsKeywords(query, ["schule", "kindergarten", "kita", "bildung", "grundschule"])) {
      const eduResult = await pool.query(
        `SELECT name, category, address, phone, email, website, description 
         FROM education_institutions 
         WHERE tenant_id = $1`,
        [tenantId]
      );
      for (const edu of eduResult.rows) {
        let content = `${edu.category || "Bildungseinrichtung"}

`;
        if (edu.address) content += `\u{1F4CD} ${edu.address}
`;
        if (edu.phone) content += `\u{1F4DE} ${edu.phone}
`;
        if (edu.email) content += `\u{1F4E7} ${edu.email}
`;
        if (edu.website) content += `\u{1F310} ${edu.website}
`;
        if (edu.description) content += `
${edu.description}`;
        results.push({
          title: edu.name,
          content,
          source: "education"
        });
      }
    }
    if (containsKeywords(query, ["sehensw\xFCrdigkeit", "attraktion", "besichtigen", "besuchen", "tourismus", "ausflug"])) {
      const attractionResult = await pool.query(
        `SELECT name, category, address, description, opening_hours, phone, website 
         FROM attractions 
         WHERE tenant_id = $1 
         LIMIT 10`,
        [tenantId]
      );
      for (const attr of attractionResult.rows) {
        let content = `${attr.category || "Sehensw\xFCrdigkeit"}

`;
        if (attr.description) content += `${attr.description}

`;
        if (attr.address) content += `\u{1F4CD} ${attr.address}
`;
        if (attr.opening_hours) content += `\u{1F550} ${attr.opening_hours}
`;
        if (attr.phone) content += `\u{1F4DE} ${attr.phone}
`;
        if (attr.website) content += `\u{1F310} ${attr.website}
`;
        results.push({
          title: attr.name,
          content,
          source: "attractions"
        });
      }
    }
    if (containsKeywords(query, ["verein", "club", "sport", "hobby", "freizeit"])) {
      const clubResult = await pool.query(
        `SELECT c.name, c.contact_person, c.phone, c.email, c.website, cc.name as category 
         FROM clubs c 
         LEFT JOIN club_categories cc ON c.category_id = cc.id 
         WHERE c.tenant_id = $1 
         LIMIT 10`,
        [tenantId]
      );
      for (const club of clubResult.rows) {
        let content = `${club.category || "Verein"}

`;
        if (club.contact_person) content += `\u{1F465} ${club.contact_person}
`;
        if (club.phone) content += `\u{1F4DE} ${club.phone}
`;
        if (club.email) content += `\u{1F4E7} ${club.email}
`;
        if (club.website) content += `\u{1F310} ${club.website}
`;
        results.push({
          title: club.name,
          content,
          source: "clubs"
        });
      }
    }
    if (containsKeywords(query, ["mitarbeiter", "ansprechpartner", "kontakt", "zust\xE4ndig", "abteilung"])) {
      const empResult = await pool.query(
        `SELECT name, position, phone, email, department 
         FROM employees 
         WHERE tenant_id = $1 
         LIMIT 10`,
        [tenantId]
      );
      for (const emp of empResult.rows) {
        let content = "";
        if (emp.position) content += `${emp.position}
`;
        if (emp.department) content += `Abteilung: ${emp.department}
`;
        if (emp.phone) content += `\u{1F4DE} ${emp.phone}
`;
        if (emp.email) content += `\u{1F4E7} ${emp.email}
`;
        results.push({
          title: emp.name,
          content,
          source: "employees"
        });
      }
    }
  } catch (error) {
    console.error("[LocalSearch] Error searching database:", error);
  }
  return results;
}
function extractKeywords(query) {
  const stopWords = ["der", "die", "das", "ein", "eine", "ist", "sind", "wie", "was", "wo", "wer", "wann", "hat", "haben"];
  return query.toLowerCase().split(/\s+/).filter((word) => word.length > 2 && !stopWords.includes(word));
}
function containsKeywords(query, keywords) {
  const lowerQuery = query.toLowerCase();
  return keywords.some((keyword) => lowerQuery.includes(keyword.toLowerCase()));
}
var Pool, pool;
var init_local_search_service = __esm({
  "server/services/local-search-service.ts"() {
    "use strict";
    ({ Pool } = pg);
    pool = new Pool({
      host: "127.0.0.1",
      port: 5432,
      database: "buergerapp",
      user: "buergerapp_user",
      password: "buergerapp_dev_2025"
    });
  }
});

// server/services/stadtWebsiteScraper.ts
import axios3 from "axios";
import * as cheerio from "cheerio";
var StadtWebsiteScraper, stadtWebsiteScraper;
var init_stadtWebsiteScraper = __esm({
  "server/services/stadtWebsiteScraper.ts"() {
    "use strict";
    StadtWebsiteScraper = class {
      baseUrl = "https://www.schieder-schwalenberg.de";
      cache = /* @__PURE__ */ new Map();
      cacheTimeout = 1e3 * 60 * 30;
      // 30 Minuten Cache
      /**
       * Holt aktuelle Mitteilungen von der Startseite
       */
      async getMitteilungen() {
        const cacheKey = "mitteilungen";
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
        try {
          const response = await axios3.get(this.baseUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; BuergerBot/1.0)"
            },
            timeout: 1e4
          });
          const $ = cheerio.load(response.data);
          const mitteilungen = [];
          $(".mitteilung, .bekanntmachung, article").each((_, element) => {
            const $el = $(element);
            const title = $el.find("h2, h3, .title").first().text().trim();
            const content = $el.find("p, .text, .content").first().text().trim();
            const link = $el.find("a").first().attr("href");
            const date = $el.find(".date, time").first().text().trim();
            if (title && content) {
              mitteilungen.push({
                title,
                content,
                url: link ? this.makeAbsoluteUrl(link) : this.baseUrl,
                category: "Mitteilung",
                date
              });
            }
          });
          this.cache.set(cacheKey, { data: mitteilungen, timestamp: Date.now() });
          return mitteilungen;
        } catch (error) {
          console.error("Fehler beim Abrufen der Mitteilungen:", error);
          return [];
        }
      }
      /**
       * Holt Veranstaltungen von der Website
       */
      async getVeranstaltungen() {
        const cacheKey = "veranstaltungen";
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data;
        }
        try {
          const response = await axios3.get(this.baseUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; BuergerBot/1.0)"
            },
            timeout: 1e4
          });
          const $ = cheerio.load(response.data);
          const veranstaltungen = [];
          $(".veranstaltung, .event").each((_, element) => {
            const $el = $(element);
            const title = $el.find("h2, h3, .title").first().text().trim();
            const content = $el.find("p, .text, .description").first().text().trim();
            const link = $el.find("a").first().attr("href");
            const date = $el.find(".date, time").first().text().trim();
            if (title) {
              veranstaltungen.push({
                title,
                content: content || "",
                url: link ? this.makeAbsoluteUrl(link) : this.baseUrl,
                category: "Veranstaltung",
                date
              });
            }
          });
          this.cache.set(cacheKey, { data: veranstaltungen, timestamp: Date.now() });
          return veranstaltungen;
        } catch (error) {
          console.error("Fehler beim Abrufen der Veranstaltungen:", error);
          return [];
        }
      }
      /**
       * Sucht nach spezifischen Informationen auf der Website
       */
      async searchInfo(query) {
        try {
          const searchUrl = `${this.baseUrl}/suche`;
          const response = await axios3.get(searchUrl, {
            params: { q: query },
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; BuergerBot/1.0)"
            },
            timeout: 1e4
          });
          const $ = cheerio.load(response.data);
          const results = [];
          $(".search-result, .result-item").each((_, element) => {
            const $el = $(element);
            const title = $el.find("h2, h3, .title").first().text().trim();
            const content = $el.find("p, .snippet, .text").first().text().trim();
            const link = $el.find("a").first().attr("href");
            if (title) {
              results.push({
                title,
                content: content || "",
                url: link ? this.makeAbsoluteUrl(link) : this.baseUrl,
                category: "Suchergebnis"
              });
            }
          });
          return results;
        } catch (error) {
          console.error("Fehler bei der Suche:", error);
          return [];
        }
      }
      /**
       * Holt Informationen zu einem bestimmten Thema
       */
      async getThemaInfo(thema) {
        const themaUrls = {
          "\xF6ffnungszeiten": "/rathaus/mitarbeiter",
          "b\xFCrgermeister": "/rathaus/buergermeister",
          "standesamt": "/rathaus/standesamt",
          "formulare": "/rathaus/formulare",
          "m\xFCll": "/bauen-und-wirtschaft/abfallberatung",
          "abfall": "/bauen-und-wirtschaft/abfallberatung",
          "bauen": "/bauen-und-wirtschaft",
          "kindergarten": "/familie-und-soziales/kindergaerten",
          "schule": "/familie-und-soziales/schulen",
          "freibad": "/familie-und-soziales/freibad-schieder",
          "tourismus": "/tourismus",
          "veranstaltungen": "/veranstaltungen"
        };
        const url = themaUrls[thema.toLowerCase()];
        if (!url) {
          return null;
        }
        try {
          const response = await axios3.get(this.makeAbsoluteUrl(url), {
            headers: {
              "User-Agent": "Mozilla/5.0 (compatible; BuergerBot/1.0)"
            },
            timeout: 1e4
          });
          const $ = cheerio.load(response.data);
          const title = $("h1").first().text().trim();
          const content = $(".content, .main-content, article").first().text().trim();
          return {
            title: title || thema,
            content: content || "Keine Informationen verf\xFCgbar",
            url: this.makeAbsoluteUrl(url),
            category: "Thema"
          };
        } catch (error) {
          console.error(`Fehler beim Abrufen von Thema "${thema}":`, error);
          return null;
        }
      }
      /**
       * Macht relative URLs absolut
       */
      makeAbsoluteUrl(url) {
        if (url.startsWith("http")) {
          return url;
        }
        if (url.startsWith("/")) {
          return `${this.baseUrl}${url}`;
        }
        return `${this.baseUrl}/${url}`;
      }
      /**
       * Löscht den Cache
       */
      clearCache() {
        this.cache.clear();
      }
    };
    stadtWebsiteScraper = new StadtWebsiteScraper();
  }
});

// server/knowledge-base.ts
function getKnowledgeBaseContext(tenantSlug) {
  if (tenantSlug !== "schieder") {
    return "(Keine spezifische Wissensdatenbank verf\xFCgbar)";
  }
  return `
# Wissensdatenbank Schieder-Schwalenberg

## Rathaus
- **Name**: ${knowledgeBase.rathaus.name}
- **Adresse**: ${knowledgeBase.rathaus.adresse}
- **Telefon**: ${knowledgeBase.rathaus.telefon}
- **Fax**: ${knowledgeBase.rathaus.fax}
- **\xD6ffnungszeiten**:
  - Montag bis Freitag: ${knowledgeBase.rathaus.oeffnungszeiten["Montag bis Freitag"]}
  - Donnerstag: ${knowledgeBase.rathaus.oeffnungszeiten["Donnerstag"]}
- **Bankverbindung**: ${knowledgeBase.rathaus.bankverbindung.bank}, IBAN: ${knowledgeBase.rathaus.bankverbindung.iban}

## B\xFCrgermeister
- **Name**: ${knowledgeBase.buergermeister.name}
- **Titel**: ${knowledgeBase.buergermeister.titel}
- **Partei**: ${knowledgeBase.buergermeister.partei}
- **Amtsantritt**: ${knowledgeBase.buergermeister.amtsantritt}
- **Wahl**: ${knowledgeBase.buergermeister.wahl}
- **Vorg\xE4nger**: ${knowledgeBase.buergermeister.vorgaenger}
- **Adresse**: ${knowledgeBase.buergermeister.adresse}
- **Telefon**: ${knowledgeBase.buergermeister.telefon}
- **\xD6ffnungszeiten**:
  - Montag bis Freitag: ${knowledgeBase.buergermeister.oeffnungszeiten["Montag bis Freitag"]}
  - Donnerstag: ${knowledgeBase.buergermeister.oeffnungszeiten["Donnerstag"]}

## Freibad Schieder
- **Name**: ${knowledgeBase.freibad.name}
- **Beschreibung**: ${knowledgeBase.freibad.beschreibung}
- **\xD6ffnungszeiten**:
  - Saison: ${knowledgeBase.freibad.oeffnungszeiten.saison}
  - Regul\xE4r: ${knowledgeBase.freibad.oeffnungszeiten.regulaer}
  - Schulferien NRW: ${knowledgeBase.freibad.oeffnungszeiten.schulferien}
  - Fr\xFChschwimmen f\xFCr Mitglieder: ${knowledgeBase.freibad.oeffnungszeiten.fruehschwimmen}
- **Kontakt**:
  - Adresse: ${knowledgeBase.freibad.kontakt.adresse}
  - Telefon: ${knowledgeBase.freibad.kontakt.telefon}
  - Website: ${knowledgeBase.freibad.kontakt.website}
- **Ausstattung**: ${knowledgeBase.freibad.ausstattung.join(", ")}
- **Besonderheiten**: ${knowledgeBase.freibad.besonderheiten.join("; ")}
- **F\xF6rderverein**: ${knowledgeBase.freibad.foerderverein.name}, ${knowledgeBase.freibad.foerderverein.adresse}, Tel: ${knowledgeBase.freibad.foerderverein.telefon}

## Stadt Schieder-Schwalenberg
- **Name**: ${knowledgeBase.stadt.name}
- **Kreis**: ${knowledgeBase.stadt.kreis}
- **Bundesland**: ${knowledgeBase.stadt.bundesland}
- **PLZ**: ${knowledgeBase.stadt.plz}
- **Ortsteile**: ${knowledgeBase.stadt.ortsteile.join(", ")}
- **Besonderheiten**: ${knowledgeBase.stadt.besonderheiten.join("; ")}

## Tourismus & Freizeit
- **Sehensw\xFCrdigkeiten**: ${knowledgeBase.tourismus.sehenswuerdigkeiten.join(", ")}
- **Freizeitangebote**: ${knowledgeBase.tourismus.freizeitangebote.join(", ")}

## Bildung
- **Schulen**: ${knowledgeBase.bildung.schulen.join("; ")}
- **Weitere Bildungseinrichtungen**: Kinderg\xE4rten, Volkshochschule, Stadtb\xFCcherei

## Sport
- **Einrichtungen**: ${knowledgeBase.sport.einrichtungen.join(", ")}
- **Vereine**: ${knowledgeBase.sport.vereine}

## Notfallnummern
- **Feuerwehr/Rettungsdienst**: ${knowledgeBase.kontakte.notfaelle.feuerwehr_rettungsdienst}
- **Polizei**: ${knowledgeBase.kontakte.notfaelle.polizei}
- **\xC4rztlicher Notdienst**: ${knowledgeBase.kontakte.notfaelle.aerztlicher_notdienst}

## Stadtverwaltung Kontakt
- **Zentrale**: ${knowledgeBase.kontakte.stadtverwaltung.zentrale}
- **Fax**: ${knowledgeBase.kontakte.stadtverwaltung.fax}
`;
}
var knowledgeBase;
var init_knowledge_base = __esm({
  "server/knowledge-base.ts"() {
    "use strict";
    knowledgeBase = {
      rathaus: {
        name: "Rathaus Schieder-Schwalenberg",
        adresse: "Dom\xE4ne 3, 32816 Schieder-Schwalenberg",
        telefon: "05282 / 601-0",
        fax: "05282 / 601-35",
        oeffnungszeiten: {
          "Montag bis Freitag": "08:00 - 12:00 Uhr",
          "Donnerstag": "14:00 - 17:00 Uhr"
        },
        bankverbindung: {
          bank: "Sparkasse Paderborn-Detmold-H\xF6xter",
          iban: "DE78 4765 0130 0000 5207 91",
          bic: "WELADE3LXXX"
        }
      },
      buergermeister: {
        name: "Marco M\xFCllers",
        titel: "B\xFCrgermeister",
        partei: "Parteilos (Independent)",
        amtsantritt: "1. November 2025",
        wahl: "Gew\xE4hlt in der Stichwahl am 28. September 2025",
        vorgaenger: "J\xF6rg Bierwirth (2020 - 31. Oktober 2025)",
        adresse: "Dom\xE4ne 3, 32816 Schieder-Schwalenberg",
        telefon: "05282 / 601-0",
        fax: "05282 / 601-35",
        oeffnungszeiten: {
          "Montag bis Freitag": "08:00 - 12:00 Uhr",
          "Donnerstag": "14:00 - 17:00 Uhr"
        },
        website: "www.wirliebenschieder-schwalenberg.de"
      },
      freibad: {
        name: "Freibad Schieder",
        beschreibung: "Das sch\xF6nste Freibad im Kreis Lippe befindet sich in Schieder in unmittelbarer N\xE4he des SchiederSees. Es ist ein st\xE4dtisches Freibad, welches von Ehrenamtlichen in Form einer gGmbH gef\xFChrt wird.",
        ausstattung: [
          "Vier 50m-Bahnen f\xFCr Schwimmer",
          "Nichtschwimmerbecken mit Rutsche",
          "Planschbecken f\xFCr die ganz Kleinen",
          "Solarthermieanlage f\xFCr angenehme Wassertemperaturen",
          "\xDCberdachte Terrasse",
          "Weitl\xE4ufige Liegewiesen zum Verweilen und Ausruhen",
          "Beach-Volleyballfeld",
          "Torwand f\xFCr sportliche Aktivit\xE4ten",
          "Gro\xDFes B\xFCcherangebot f\xFCr Leseratten",
          "Matschanlage mit verschiedenen Spielger\xE4ten f\xFCr Kinder",
          "Kiosk mit Speisen und Getr\xE4nken (s\xFC\xDF und herzhaft, hei\xDF und kalt)"
        ],
        oeffnungszeiten: {
          saison: "Mitte Mai bis Mitte September",
          regulaer: "12:00 - 19:00 Uhr",
          schulferien: "11:00 - 19:00 Uhr (in den Schulferien NRW)",
          fruehschwimmen: "06:00 - 10:00 Uhr (nur f\xFCr Mitglieder des F\xF6rdervereins)",
          schlechtwetter: "Bei schlechter Witterung f\xFCr Vereinsmitglieder ge\xF6ffnet"
        },
        kontakt: {
          adresse: "Parkstra\xDFe 22, 32816 Schieder-Schwalenberg",
          telefon: "05282/9839",
          website: "www.freibad-schieder-schwalenberg.net",
          facebook: "Facebook",
          instagram: "Instagram"
        },
        besonderheiten: [
          "Seepferdchen-Kurs f\xFCr Kinder: Montags bis samstags 10:00 - 11:00 Uhr w\xE4hrend der Sommerferien",
          "Sp\xE4tschwimmen (regelm\xE4\xDFige Veranstaltung)",
          "Von Ehrenamtlichen in Form einer gGmbH gef\xFChrt",
          "Unterst\xFCtzt durch den F\xF6rderverein Freibad Schieder-Schwalenberg e.V.",
          "In den letzten Jahren umfassend modernisiert und erweitert"
        ],
        foerderverein: {
          name: "F\xF6rderverein Freibad Schieder-Schwalenberg e.V.",
          adresse: "L\xF6nsstra\xDFe 8, 32816 Schieder-Schwalenberg",
          telefon: "05282/4001-65",
          kontaktform: "Kontaktformular verf\xFCgbar"
        }
      },
      stadt: {
        name: "Schieder-Schwalenberg",
        kreis: "Kreis Lippe",
        bundesland: "Nordrhein-Westfalen",
        plz: "32816",
        besonderheiten: [
          "SchiederSee - beliebtes Naherholungsgebiet",
          "Historische Altstadt Schwalenberg mit Fachwerkh\xE4usern",
          "K\xFCnstlerstadt mit aktiver K\xFCnstlerkolonie",
          "Staatlich anerkannter Erholungsort",
          "L\xE4ndlich gepr\xE4gte Stadt mit hoher Lebensqualit\xE4t"
        ],
        ortsteile: [
          "Schieder",
          "Schwalenberg",
          "Glash\xFCtte",
          "Lothe",
          "Siekholz",
          "W\xF6bbel"
        ]
      },
      tourismus: {
        sehenswuerdigkeiten: [
          "SchiederSee mit Wassersportm\xF6glichkeiten",
          "Historische Altstadt Schwalenberg",
          "Burg Schwalenberg",
          "K\xFCnstlerkolonie Schwalenberg",
          "Freibad Schieder"
        ],
        freizeitangebote: [
          "Freibad Schieder mit umfangreicher Ausstattung",
          "Wassersport am SchiederSee (Segeln, Surfen, Schwimmen)",
          "Wandern und Radfahren in der Umgebung",
          "Kunst und Kultur in Schwalenberg",
          "Wellness und Gesundheitszentrum"
        ]
      },
      bildung: {
        kindergaerten: "Mehrere Kinderg\xE4rten in den Ortsteilen",
        schulen: [
          "Alexander-Zei\xDF-Grundschule Schwalenberg (ausgezeichnet als MINT-freundliche Schule und Digitale Schule)",
          "Weitere Schulen in der Stadt"
        ],
        volkshochschule: "VHS-Angebote verf\xFCgbar",
        stadtbuecherei: "Stadtb\xFCcherei mit umfangreichem Angebot"
      },
      sport: {
        einrichtungen: [
          "Freibad Schieder",
          "Beach-Volleyballfeld im Freibad",
          "Sportanlagen in verschiedenen Ortsteilen",
          "Wellness- und Gesundheitszentrum"
        ],
        vereine: "Zahlreiche Sportvereine aktiv (Fu\xDFball, Tennis, Turnen, etc.)",
        paktFuerDenSport: "Stadt engagiert sich im Pakt f\xFCr den Sport"
      },
      kontakte: {
        notfaelle: {
          feuerwehr_rettungsdienst: "112",
          polizei: "110",
          aerztlicher_notdienst: "116 117"
        },
        stadtverwaltung: {
          zentrale: "05282 / 601-0",
          fax: "05282 / 601-35"
        }
      }
    };
  }
});

// server/chat-service.ts
var chat_service_exports = {};
__export(chat_service_exports, {
  createGlobalSystemPrompt: () => createGlobalSystemPrompt2,
  createLocalSystemPrompt: () => createLocalSystemPrompt2,
  formatContextForPrompt: () => formatContextForPrompt,
  generateDeepLinks: () => generateDeepLinks,
  isLocalQuery: () => isLocalQuery,
  searchLocalContext: () => searchLocalContext
});
function isLocalQuery(query) {
  const lowerQuery = query.toLowerCase();
  const localKeywords = [
    "schieder",
    "schwalenberg",
    "rathaus",
    "b\xFCrgermeister",
    "stadt",
    "\xF6ffnungszeiten",
    "veranstaltung",
    "event",
    "termin",
    "m\xFCll",
    "abfall",
    "st\xF6rung",
    "notfall",
    "warnung",
    "badeanstalt",
    "schwimmbad",
    "freibad",
    "bibliothek",
    "kita",
    "schule",
    "amt",
    "beh\xF6rde",
    "verwaltung",
    "b\xFCrgerb\xFCro",
    "m\xE4ngelmelder",
    "schadensmeldung",
    "hier",
    "bei uns",
    "in der stadt",
    "marco",
    "m\xFCllers",
    "lothe",
    "ruensiek",
    "w\xF6bbel",
    "glash\xFCtte"
  ];
  const globalKeywords = [
    "bundeskanzler",
    "bundesregierung",
    "deutschland",
    "politiker",
    "politik",
    "partei",
    "welt",
    "europa",
    "land",
    "staat",
    "geschichte",
    "wissenschaft",
    "technik",
    "wie hoch",
    "wie gro\xDF",
    "wie alt",
    "wann wurde",
    "wo liegt",
    "was ist",
    "wer ist",
    "wer war",
    "rechne",
    "berechne"
  ];
  const hasLocalKeyword = localKeywords.some((keyword) => lowerQuery.includes(keyword));
  const hasGlobalKeyword = globalKeywords.some((keyword) => lowerQuery.includes(keyword));
  if (hasLocalKeyword) {
    return true;
  }
  if (hasGlobalKeyword && !hasLocalKeyword) {
    return false;
  }
  return true;
}
async function searchLocalContext(query) {
  const lowerQuery = query.toLowerCase();
  const results = {
    stadtWebsite: {
      mitteilungen: [],
      veranstaltungen: []
    }
  };
  try {
    const [mitteilungen, veranstaltungen] = await Promise.all([
      stadtWebsiteScraper.getMitteilungen(),
      stadtWebsiteScraper.getVeranstaltungen()
    ]);
    results.stadtWebsite.mitteilungen = mitteilungen.slice(0, 5);
    results.stadtWebsite.veranstaltungen = veranstaltungen.slice(0, 5);
  } catch (error) {
    console.error("Fehler beim Abrufen der Stadt-Website-Daten:", error);
  }
  return results;
}
function formatContextForPrompt(context) {
  let formatted = "";
  if (context.stadtWebsite) {
    if (context.stadtWebsite.mitteilungen && context.stadtWebsite.mitteilungen.length > 0) {
      formatted += "\n**OFFIZIELLE MITTEILUNGEN VON SCHIEDER-SCHWALENBERG.DE:**\n";
      context.stadtWebsite.mitteilungen.forEach((m) => {
        formatted += `- ${m.title}`;
        if (m.date) formatted += ` (${m.date})`;
        formatted += "\n";
        if (m.content) formatted += `  ${m.content.substring(0, 200)}...
`;
        if (m.url) formatted += `  Link: ${m.url}
`;
      });
    }
    if (context.stadtWebsite.veranstaltungen && context.stadtWebsite.veranstaltungen.length > 0) {
      formatted += "\n**VERANSTALTUNGEN VON SCHIEDER-SCHWALENBERG.DE:**\n";
      context.stadtWebsite.veranstaltungen.forEach((v) => {
        formatted += `- ${v.title}`;
        if (v.date) formatted += ` (${v.date})`;
        formatted += "\n";
        if (v.content) formatted += `  ${v.content.substring(0, 150)}...
`;
      });
    }
  }
  if (!formatted) {
    formatted = "\n(Keine aktuellen Daten verf\xFCgbar)\n";
  }
  return formatted;
}
function generateDeepLinks(query) {
  const lowerQuery = query.toLowerCase();
  const links = [];
  if (lowerQuery.includes("veranstaltung") || lowerQuery.includes("event")) {
    links.push("\u{1F4C5} Alle Veranstaltungen anzeigen: /events");
  }
  if (lowerQuery.includes("news") || lowerQuery.includes("nachricht") || lowerQuery.includes("aktuell")) {
    links.push("\u{1F4F0} Alle Nachrichten anzeigen: /news");
  }
  if (lowerQuery.includes("m\xFCll") || lowerQuery.includes("abfall")) {
    links.push("\u{1F5D1}\uFE0F Abfallkalender: /waste");
  }
  if (lowerQuery.includes("m\xE4ngel") || lowerQuery.includes("schaden")) {
    links.push("\u{1F527} M\xE4ngelmelder: /issue-reports");
  }
  if (lowerQuery.includes("kontakt") || lowerQuery.includes("anliegen")) {
    links.push("\u{1F4DE} Kontakt & Anliegen: /contact");
  }
  if (links.length > 0) {
    return "\n\n" + links.join("\n");
  }
  return "";
}
function createLocalSystemPrompt2(contextData) {
  const knowledgeBase2 = getKnowledgeBaseContext();
  return `Du bist \u201EManus", ein digitaler Assistent f\xFCr B\xFCrgerinnen und B\xFCrger der Stadt Schieder-Schwalenberg in Nordrhein-Westfalen.

=== DEINE GRUNDREGELN ===

1. **Lokaler Bezug:**
   - Wenn Nutzer nach lokalen Informationen fragen (z. B. \xD6ffnungszeiten, Adressen, \xC4mter, Rathaus, B\xFCrgerb\xFCro, Schulen, Kitas, Vereine, Apotheken, \xC4rzte, M\xFCllabfuhr, Veranstaltungen, Sehensw\xFCrdigkeiten, Ortsteile wie Schieder, Schwalenberg, Lothe, Ruensiek, W\xF6bbel usw.), dann gehe automatisch davon aus, dass sie sich auf die Stadt Schieder-Schwalenberg und ihre Ortsteile beziehen.
   - Nutze dein vorhandenes Weltwissen vorsichtig. Wenn du dir bei einer konkreten Information (z. B. exakte \xD6ffnungszeiten, genaue Adresse, aktuelles Angebot) nicht sicher bist, dann erfinde nichts.

2. **Hilfreiche Antworten:**
   - Nutze die bereitgestellten **AKTUELLEN INFORMATIONEN AUS DEM INTERNET** um pr\xE4zise Antworten zu geben
   - Wenn **ORTE IN DER N\xC4HE (Google Places)** vorhanden sind, nutze AUSSCHLIESSLICH diese Informationen und gib sie vollst\xE4ndig weiter (Name, Adresse, Telefon, Website, Bewertung, \xD6ffnungszeiten)
   - Bei Umkreissuchen (Restaurant, Arzt, Apotheke, Tankstelle, etc.) verweise NIEMALS auf das Rathaus oder die Stadtverwaltung
   - Das Rathaus soll NUR bei Verwaltungsangelegenheiten (Ausweise, Anmeldung, \xC4mter, etc.) erw\xE4hnt werden
   - Wenn Web-Suche-Ergebnisse vorhanden sind, nutze diese um konkrete Antworten zu geben
   - Gib **konkrete, umsetzbare Informationen** statt nur auf Websites zu verweisen
   - Erfinde niemals Daten, aber nutze die bereitgestellten Informationen aktiv

3. **Formatierung:**
   - Nutze IMMER Icons f\xFCr bessere Lesbarkeit:
     * \u{1F4CD} f\xFCr Adressen
     * \u2B50 f\xFCr Bewertungen
     * \u{1F550} f\xFCr \xD6ffnungszeiten
     * \u{1F4DE} f\xFCr Telefonnummern
     * \u{1F310} f\xFCr Websites
     * \u{1F4E7} f\xFCr E-Mail-Adressen
     * \u{1F4C5} f\xFCr Termine/Veranstaltungen
     * \u{1F3DB}\uFE0F f\xFCr Rathaus/Verwaltung
     * \u{1F465} f\xFCr Personen/Ansprechpartner
   - Strukturiere Antworten mit Aufz\xE4hlungen und Abs\xE4tzen

4. **Sprache & Ton:**
   - Antworte standardm\xE4\xDFig auf Deutsch, freundlich, hilfsbereit und gut verst\xE4ndlich.
   - Wenn der Nutzer in einer anderen Sprache schreibt, kannst du dich seiner Sprache anpassen.

5. **Sicherheit:**
   - Speichere keine sensiblen personenbezogenen Daten und fordere keine unn\xF6tigen privaten Informationen vom Nutzer an.

=== WISSENSDATENBANK SCHIEDER-SCHWALENBERG ===
${knowledgeBase2}

=== AKTUELLE DATEN ===
${contextData}

=== WICHTIGE FAKTEN ===
- Der aktuelle B\xFCrgermeister ist Marco M\xFCllers (E-Mail: marco.muellers@schieder-schwalenberg.de)
- Rathaus: Dom\xE4ne 3, 32816 Schieder-Schwalenberg, Tel: 05282 / 601-0
- \xD6ffnungszeiten Rathaus: Mo-Fr 08:00-12:00 Uhr, Do 14:00-17:00 Uhr

Antworte jetzt auf die Frage des B\xFCrgers.`;
}
function createGlobalSystemPrompt2() {
  return `Du bist \u201EManus", ein digitaler Assistent f\xFCr B\xFCrgerinnen und B\xFCrger der Stadt Schieder-Schwalenberg in Nordrhein-Westfalen.

=== ALLGEMEINE FRAGEN ===

Diese Frage hat keinen direkten Bezug zu Schieder-Schwalenberg.

**Deine Aufgabe:**
- Antworte wie ein normaler, voll funktionsf\xE4higer ChatGPT-Assistent
- Nutze dein vollst\xE4ndiges allgemeines Wissen
- Beantworte die Frage pr\xE4zise und informativ
- Gib Quellenangaben oder Kontext wenn m\xF6glich

**Sprache & Ton:**
- Antworte standardm\xE4\xDFig auf Deutsch, freundlich, hilfsbereit und gut verst\xE4ndlich
- Wenn der Nutzer in einer anderen Sprache schreibt, kannst du dich seiner Sprache anpassen

**Hinweis:**
Falls die Frage doch einen lokalen Bezug zu Schieder-Schwalenberg haben sollte, weise darauf hin und biete an, bei lokalen Fragen zu helfen.

Antworte jetzt auf die Frage.`;
}
var init_chat_service = __esm({
  "server/chat-service.ts"() {
    "use strict";
    init_stadtWebsiteScraper();
    init_knowledge_base();
  }
});

// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { nanoid } from "nanoid";

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  alerts: () => alerts,
  chatLogs: () => chatLogs,
  clubs: () => clubs,
  contactMessages: () => contactMessages,
  contactStatusEnum: () => contactStatusEnum,
  councilMeetings: () => councilMeetings,
  departments: () => departments,
  events: () => events,
  institutions: () => institutions,
  issueReports: () => issueReports,
  issueStatusEnum: () => issueStatusEnum,
  mayorInfo: () => mayorInfo,
  news: () => news,
  notificationPriorityEnum: () => notificationPriorityEnum,
  notificationTypeEnum: () => notificationTypeEnum,
  pois: () => pois,
  priorityEnum: () => priorityEnum,
  pushNotifications: () => pushNotifications,
  roleEnum: () => roleEnum,
  scrapingLog: () => scrapingLog,
  tenants: () => tenants,
  userNotifications: () => userNotifications,
  userPreferences: () => userPreferences,
  users: () => users,
  wasteSchedule: () => wasteSchedule,
  websiteChunks: () => websiteChunks
});
import { pgTable, text, timestamp, varchar, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
var roleEnum = pgEnum("role", ["user", "admin", "tenant_admin"]);
var issueStatusEnum = pgEnum("issue_status", ["eingegangen", "in_bearbeitung", "erledigt"]);
var priorityEnum = pgEnum("priority", ["low", "medium", "high", "critical"]);
var contactStatusEnum = pgEnum("contact_status", ["neu", "in_bearbeitung", "erledigt"]);
var notificationTypeEnum = pgEnum("notification_type", ["info", "warning", "danger", "event"]);
var notificationPriorityEnum = pgEnum("notification_priority", ["low", "medium", "high", "urgent"]);
var tenants = pgTable("tenants", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("subdomain", { length: 100 }).notNull().unique(),
  // Branding
  primaryColor: varchar("primary_color", { length: 20 }).default("#0066CC"),
  secondaryColor: varchar("secondary_color", { length: 20 }).default("#00A86B"),
  logoUrl: varchar("logo_url", { length: 1e3 }),
  faviconUrl: varchar("favicon_url", { length: 1e3 }),
  heroImageUrl: varchar("hero_image_url", { length: 1e3 }),
  // Kontakt
  contactEmail: varchar("contact_email", { length: 320 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  contactAddress: text("address"),
  website: varchar("website", { length: 1e3 }),
  description: text("description"),
  // Location
  mayor: varchar("mayor", { length: 200 }),
  population: integer("population"),
  area: varchar("area", { length: 50 }),
  postalCode: varchar("postal_code", { length: 20 }),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  // Settings
  timezone: varchar("timezone", { length: 100 }).default("Europe/Berlin"),
  locale: varchar("locale", { length: 20 }).default("de-DE"),
  currency: varchar("currency", { length: 10 }).default("EUR"),
  // JSON fields
  features: text("features"),
  openingHours: text("opening_hours"),
  socialMedia: text("social_media"),
  // Meta
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var users = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  oneSignalPlayerId: varchar("oneSignalPlayerId", { length: 64 }),
  pushEnabled: boolean("pushEnabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow()
});
var news = pgTable("news", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  teaser: text("teaser"),
  bodyMD: text("bodyMD"),
  imageUrl: varchar("imageUrl", { length: 1e3 }),
  category: varchar("category", { length: 100 }),
  publishedAt: timestamp("publishedAt").notNull(),
  sourceUrl: varchar("sourceUrl", { length: 1e3 }),
  createdAt: timestamp("createdAt").defaultNow()
});
var events = pgTable("events", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  location: varchar("location", { length: 500 }),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  imageUrl: varchar("imageUrl", { length: 1e3 }),
  ticketLink: varchar("ticketLink", { length: 1e3 }),
  category: varchar("category", { length: 100 }),
  cost: varchar("cost", { length: 200 }),
  createdAt: timestamp("createdAt").defaultNow()
});
var departments = pgTable("departments", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 500 }).notNull(),
  description: text("description"),
  responsibilities: text("responsibilities"),
  contactName: varchar("contactName", { length: 200 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  openingHours: text("openingHours"),
  appointmentLink: varchar("appointmentLink", { length: 1e3 }),
  createdAt: timestamp("createdAt").defaultNow()
});
var issueReports = pgTable("issueReports", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  userId: varchar("userId", { length: 64 }),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description").notNull(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  address: varchar("address", { length: 500 }),
  photoUrl: varchar("photoUrl", { length: 1e3 }),
  status: issueStatusEnum("status").default("eingegangen").notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  ticketNumber: varchar("ticketNumber", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});
var wasteSchedule = pgTable("wasteSchedule", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  wasteType: varchar("wasteType", { length: 100 }).notNull(),
  collectionDate: timestamp("collectionDate").notNull(),
  district: varchar("district", { length: 200 }),
  street: varchar("street", { length: 500 }),
  route: varchar("route", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow()
});
var alerts = pgTable("alerts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 100 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  message: text("message").notNull(),
  priority: priorityEnum("priority").default("medium").notNull(),
  validUntil: timestamp("validUntil"),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow()
});
var pois = pgTable("pois", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 500 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  address: varchar("address", { length: 500 }),
  imageUrl: varchar("imageUrl", { length: 1e3 }),
  websiteUrl: varchar("websiteUrl", { length: 1e3 }),
  openingHours: text("openingHours"),
  pricing: text("pricing"),
  createdAt: timestamp("createdAt").defaultNow()
});
var institutions = pgTable("institutions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 500 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  description: text("description"),
  contactName: varchar("contactName", { length: 200 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  websiteUrl: varchar("websiteUrl", { length: 1e3 }),
  registrationInfo: text("registrationInfo"),
  createdAt: timestamp("createdAt").defaultNow()
});
var councilMeetings = pgTable("councilMeetings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  meetingDate: timestamp("meetingDate").notNull(),
  committee: varchar("committee", { length: 200 }),
  agendaUrl: varchar("agendaUrl", { length: 1e3 }),
  minutesUrl: varchar("minutesUrl", { length: 1e3 }),
  location: varchar("location", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow()
});
var mayorInfo = pgTable("mayorInfo", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  party: varchar("party", { length: 100 }),
  position: varchar("position", { length: 200 }),
  photoUrl: varchar("photoUrl", { length: 1e3 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  bio: text("bio"),
  calendarUrl: varchar("calendarUrl", { length: 1e3 }),
  updatedAt: timestamp("updatedAt").defaultNow()
});
var clubs = pgTable("clubs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  contactName: varchar("contactName", { length: 200 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  websiteUrl: varchar("websiteUrl", { length: 1e3 }),
  logoUrl: varchar("logoUrl", { length: 1e3 }),
  createdAt: timestamp("createdAt").defaultNow()
});
var chatLogs = pgTable("chatLogs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  userId: varchar("userId", { length: 64 }),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  intent: varchar("intent", { length: 200 }),
  isLocal: boolean("isLocal").default(true),
  sourceDocs: text("sourceDocs"),
  tokens: integer("tokens"),
  createdAt: timestamp("createdAt").defaultNow()
});
var userPreferences = pgTable("userPreferences", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  favoriteCategories: text("favoriteCategories"),
  wasteDistrict: varchar("wasteDistrict", { length: 200 }),
  wasteStreet: varchar("wasteStreet", { length: 500 }),
  notificationSettings: text("notificationSettings"),
  savedPois: text("savedPois"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});
var contactMessages = pgTable("contactMessages", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }),
  subject: varchar("subject", { length: 500 }).notNull(),
  message: text("message").notNull(),
  status: contactStatusEnum("status").default("neu").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});
var pushNotifications = pgTable("pushNotifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").default("info").notNull(),
  priority: notificationPriorityEnum("priority").default("medium").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdBy: varchar("createdBy", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});
var userNotifications = pgTable("userNotifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  oneSignalPlayerId: varchar("oneSignalPlayerId", { length: 64 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").default("info").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  receivedAt: timestamp("receivedAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
  data: text("data")
  // JSON string for additional data
});
var websiteChunks = pgTable("website_chunks", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  url: varchar("url", { length: 2e3 }).notNull(),
  title: varchar("title", { length: 500 }),
  content: text("content").notNull(),
  chunkIndex: integer("chunkIndex").notNull(),
  embedding: text("embedding").notNull(),
  // Will store vector as JSON array
  metadata: text("metadata"),
  // JSON: {section, lastScraped, etc}
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow()
});
var scrapingLog = pgTable("scraping_log", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  url: varchar("url", { length: 2e3 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  // success, error, skipped
  chunksCreated: integer("chunksCreated").default(0),
  errorMessage: text("errorMessage"),
  scrapedAt: timestamp("scrapedAt").defaultNow()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL || process.env.OPENAI_BASE_URL || "https://api.openai.com",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? process.env.OPENAI_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client, { schema: schema_exports });
      console.log("[Database] Connected successfully");
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      id: user.id
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === void 0) {
      if (user.id === ENV.ownerId) {
        user.role = "admin";
        values.role = "admin";
        updateSet.role = "admin";
      }
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUser(id) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.warn(
        "[OAuth] WARNING: OAUTH_SERVER_URL is not configured. OAuth features will be disabled."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a user ID
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.id);
   */
  async createSessionToken(userId, options = {}) {
    return this.signSession(
      {
        openId: userId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUser(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          id: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUser(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      id: user.id,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        id: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/routers-multi-tenant.ts
import { z as z10 } from "zod";

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/_core/llm.ts
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://api.openai.com/v1/chat/completions";
var assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format
  } = params;
  const payload = {
    model: "gpt-4o-mini",
    messages: messages.map(normalizeMessage)
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  payload.max_tokens = 4096;
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// server/web-search.ts
function addLocalContext(query) {
  const lowerQuery = query.toLowerCase();
  const localIndicators = [
    "apotheke",
    "arzt",
    "\xE4rztin",
    "krankenhaus",
    "klinik",
    "restaurant",
    "caf\xE9",
    "essen",
    "trinken",
    "hotel",
    "\xFCbernachten",
    "unterkunft",
    "gesch\xE4ft",
    "laden",
    "einkaufen",
    "supermarkt",
    "bank",
    "sparkasse",
    "geldautomat",
    "tankstelle",
    "werkstatt",
    "friseur",
    "fris\xF6r",
    "friseurin",
    "b\xE4ckerei",
    "metzgerei",
    "fleischerei",
    "schule",
    "kindergarten",
    "kita",
    "spielplatz",
    "park",
    "schwimmbad",
    "freibad",
    "hallenbad",
    "badeanstalt",
    "b\xFCcherei",
    "bibliothek",
    "kirche",
    "friedhof",
    "polizei",
    "feuerwehr",
    "post",
    "paket",
    "busfahrplan",
    "bus",
    "haltestelle",
    "\xF6ffnungszeiten",
    "ge\xF6ffnet",
    "geschlossen",
    "wo ist",
    "wo finde",
    "wo gibt es",
    "n\xE4chste",
    "n\xE4chster",
    "n\xE4chstes",
    "hier",
    "in der n\xE4he",
    "bei uns"
  ];
  const hasLocalIndicator = localIndicators.some(
    (indicator) => lowerQuery.includes(indicator)
  );
  if (hasLocalIndicator && !lowerQuery.includes("schieder") && !lowerQuery.includes("schwalenberg")) {
    return `${query} in Schieder-Schwalenberg`;
  }
  return query;
}
async function performWebSearch(query) {
  try {
    const enhancedQuery = addLocalContext(query);
    console.log(`[Web Search] Original: "${query}" \u2192 Enhanced: "${enhancedQuery}"`);
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(enhancedQuery)}&format=json&no_html=1&skip_disambig=1`;
    const response = await fetch(searchUrl);
    if (!response.ok) {
      console.error("Web search failed:", response.statusText);
      return "";
    }
    const data = await response.json();
    let results = "";
    if (data.AbstractText) {
      results += `${data.AbstractText}

`;
    }
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      const topTopics = data.RelatedTopics.filter((t2) => t2.Text).slice(0, 3);
      topTopics.forEach((topic) => {
        results += `${topic.Text}
`;
      });
    }
    if (!results.trim()) {
      const wikiQuery = enhancedQuery.replace(/\s+/g, "_");
      const wikiUrl = `https://de.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiQuery)}`;
      try {
        const wikiResponse = await fetch(wikiUrl);
        if (wikiResponse.ok) {
          const wikiData = await wikiResponse.json();
          if (wikiData.extract) {
            results = wikiData.extract;
          }
        }
      } catch (error) {
        console.error("Wikipedia search error:", error);
      }
    }
    return results || "Keine aktuellen Informationen gefunden.";
  } catch (error) {
    console.error("Web search error:", error);
    return "";
  }
}
function requiresWebSearch(message) {
  const lowerMessage = message.toLowerCase();
  const globalKeywords = [
    // Politik & Regierung
    "bundeskanzler",
    "kanzler",
    "regierung",
    "minister",
    "ministerin",
    "bundesregierung",
    "ministerpr\xE4sident",
    "bauminister",
    "bauministerin",
    "pr\xE4sident",
    "pr\xE4sidentin",
    "politiker",
    "politikerin",
    // Geografie & Allgemein
    "deutschland",
    "europa",
    "welt",
    "hauptstadt von",
    "einwohner von",
    "wo liegt",
    // Zeit & Nachrichten
    "aktuell",
    "heute",
    "gestern",
    "morgen",
    "nachrichten",
    "news",
    // Wetter
    "wetter in",
    "temperatur in",
    // Wirtschaft & Sport
    "wirtschaft",
    "b\xF6rse",
    "aktien",
    "sport",
    "fu\xDFball",
    "bundesliga",
    // Wissenschaft
    "wissenschaft",
    "forschung",
    // Events & Veranstaltungen (WICHTIG!)
    "weihnachtsmarkt",
    "adventsmarkt",
    "christkindlmarkt",
    "konzert",
    "festival",
    "fest",
    "feier",
    "markt",
    "flohmarkt",
    "wochenmarkt",
    "was ist los",
    "was kann man",
    "was gibt es",
    "n\xE4chste veranstaltung",
    "kommende veranstaltung",
    "veranstaltungen in",
    "events in",
    "schiedersee",
    "am see",
    // Fragen
    "wer ist",
    "wer war",
    "was ist",
    "was war",
    "wie hei\xDFt",
    "wie hoch",
    "wie gro\xDF",
    "wie alt",
    "wann ist",
    "wann findet",
    "wann wurde",
    "geschichte von",
    "erfinder von"
  ];
  const localOnlyKeywords = [
    "rathaus",
    "b\xFCrgermeister marco",
    "\xF6ffnungszeiten rathaus",
    "m\xE4ngelmelder",
    "schadensmeldung",
    "abfall",
    "m\xFCll",
    "m\xFCllabfuhr"
    // Ortsteile OHNE Events/Veranstaltungen
    // (entfernt, damit Event-Fragen Web-Suche auslösen)
  ];
  const hasLocalOnlyKeyword = localOnlyKeywords.some(
    (keyword) => lowerMessage.includes(keyword)
  );
  if (hasLocalOnlyKeyword) {
    return false;
  }
  const hasGlobalKeyword = globalKeywords.some(
    (keyword) => lowerMessage.includes(keyword)
  );
  return hasGlobalKeyword;
}

// server/web-search-improved.ts
async function scrapeGoogleSearch(query) {
  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=de`;
    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "de-DE,de;q=0.9,en;q=0.8"
      }
    });
    if (!response.ok) {
      console.error("Google search failed:", response.statusText);
      return [];
    }
    const html = await response.text();
    const results = [];
    const titleRegex = /<h3[^>]*>([^<]+)<\/h3>/g;
    const snippetRegex = /<div[^>]*data-sncf="1"[^>]*>([^<]+)<\/div>/g;
    let titleMatch;
    let snippetMatch;
    const titles = [];
    const snippets = [];
    while ((titleMatch = titleRegex.exec(html)) !== null) {
      titles.push(titleMatch[1]);
    }
    while ((snippetMatch = snippetRegex.exec(html)) !== null) {
      snippets.push(snippetMatch[1]);
    }
    for (let i = 0; i < Math.min(titles.length, snippets.length, 5); i++) {
      results.push({
        title: titles[i],
        url: "",
        // URL-Extraktion ist komplexer, lassen wir weg
        snippet: snippets[i]
      });
    }
    return results;
  } catch (error) {
    console.error("Google scraping error:", error);
    return [];
  }
}
async function performImprovedWebSearch(query) {
  try {
    console.log(`[Improved Web Search] Query: "${query}"`);
    const googleResults = await scrapeGoogleSearch(query);
    if (googleResults.length > 0) {
      const formattedResults = googleResults.map((r) => `**${r.title}**
${r.snippet}`).join("\n\n");
      console.log(`[Improved Web Search] Found ${googleResults.length} Google results`);
      return formattedResults;
    }
    const duckUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const duckResponse = await fetch(duckUrl);
    if (duckResponse.ok) {
      const data = await duckResponse.json();
      let results = "";
      if (data.AbstractText) {
        results += `${data.AbstractText}

`;
      }
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        const topTopics = data.RelatedTopics.filter((t2) => t2.Text).slice(0, 3);
        topTopics.forEach((topic) => {
          results += `${topic.Text}
`;
        });
      }
      if (results.trim()) {
        console.log(`[Improved Web Search] Found DuckDuckGo results`);
        return results;
      }
    }
    const wikiQuery = query.replace(/\s+/g, "_");
    const wikiUrl = `https://de.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiQuery)}`;
    const wikiResponse = await fetch(wikiUrl);
    if (wikiResponse.ok) {
      const wikiData = await wikiResponse.json();
      if (wikiData.extract) {
        console.log(`[Improved Web Search] Found Wikipedia result`);
        return wikiData.extract;
      }
    }
    console.log(`[Improved Web Search] No results found`);
    return "";
  } catch (error) {
    console.error("Improved web search error:", error);
    return "";
  }
}

// server/perplexity-search.ts
function addLocalContext2(query) {
  const lowerQuery = query.toLowerCase();
  const localIndicators = [
    "apotheke",
    "arzt",
    "\xE4rztin",
    "krankenhaus",
    "klinik",
    "restaurant",
    "caf\xE9",
    "essen",
    "trinken",
    "hotel",
    "\xFCbernachten",
    "unterkunft",
    "gesch\xE4ft",
    "laden",
    "einkaufen",
    "supermarkt",
    "bank",
    "sparkasse",
    "geldautomat",
    "tankstelle",
    "werkstatt",
    "friseur",
    "fris\xF6r",
    "friseurin",
    "b\xE4ckerei",
    "metzgerei",
    "fleischerei",
    "schule",
    "kindergarten",
    "kita",
    "spielplatz",
    "park",
    "schwimmbad",
    "freibad",
    "hallenbad",
    "badeanstalt",
    "b\xFCcherei",
    "bibliothek",
    "kirche",
    "friedhof",
    "polizei",
    "feuerwehr",
    "post",
    "paket",
    "busfahrplan",
    "bus",
    "haltestelle",
    "\xF6ffnungszeiten",
    "ge\xF6ffnet",
    "geschlossen",
    "wo ist",
    "wo finde",
    "wo gibt es",
    "n\xE4chste",
    "n\xE4chster",
    "n\xE4chstes",
    "hier",
    "in der n\xE4he",
    "bei uns",
    "veranstaltung",
    "event",
    "konzert",
    "festival",
    "weihnachtsmarkt",
    "adventsmarkt",
    "markt",
    "was ist los",
    "was kann man"
  ];
  const hasLocalIndicator = localIndicators.some(
    (indicator) => lowerQuery.includes(indicator)
  );
  if (hasLocalIndicator && !lowerQuery.includes("schieder") && !lowerQuery.includes("schwalenberg")) {
    return `${query} in Schieder-Schwalenberg`;
  }
  return query;
}
async function performPerplexitySearch(query) {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      console.error("[Perplexity] API Key not found");
      return "";
    }
    const enhancedQuery = addLocalContext2(query);
    console.log(`[Perplexity] Original: "${query}" \u2192 Enhanced: "${enhancedQuery}"`);
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "system",
            content: "Du bist ein hilfreicher Assistent. Beantworte Fragen pr\xE4zise und mit Quellenangaben. Antworte auf Deutsch."
          },
          {
            role: "user",
            content: enhancedQuery
          }
        ]
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Perplexity] Request failed:", response.status, errorText);
      return "";
    }
    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("[Perplexity] Invalid response format:", data);
      return "";
    }
    const answer = data.choices[0].message.content;
    let result = answer;
    if (data.citations && data.citations.length > 0) {
      result += "\n\n**Quellen:**\n";
      data.citations.slice(0, 3).forEach((url, index) => {
        result += `${index + 1}. ${url}
`;
      });
    }
    console.log(`[Perplexity] Got answer (${answer.length} chars, ${data.citations?.length || 0} citations)`);
    return result;
  } catch (error) {
    console.error("[Perplexity] Error:", error);
    return "";
  }
}

// server/open-meteo-weather.ts
var LATITUDE = 51.8667;
var LONGITUDE = 9.1833;
function getWeatherDescription(code) {
  const descriptions = {
    0: "Klar",
    1: "\xDCberwiegend klar",
    2: "Teilweise bew\xF6lkt",
    3: "Bedeckt",
    45: "Nebel",
    48: "Nebel mit Reifablagerung",
    51: "Leichter Nieselregen",
    53: "M\xE4\xDFiger Nieselregen",
    55: "Starker Nieselregen",
    56: "Leichter gefrierender Nieselregen",
    57: "Starker gefrierender Nieselregen",
    61: "Leichter Regen",
    63: "M\xE4\xDFiger Regen",
    65: "Starker Regen",
    66: "Leichter gefrierender Regen",
    67: "Starker gefrierender Regen",
    71: "Leichter Schneefall",
    73: "M\xE4\xDFiger Schneefall",
    75: "Starker Schneefall",
    77: "Schneegriesel",
    80: "Leichte Regenschauer",
    81: "M\xE4\xDFige Regenschauer",
    82: "Starke Regenschauer",
    85: "Leichte Schneeschauer",
    86: "Starke Schneeschauer",
    95: "Gewitter",
    96: "Gewitter mit leichtem Hagel",
    99: "Gewitter mit starkem Hagel"
  };
  return descriptions[code] || "Unbekannt";
}
function getIconCode(weatherCode, isDay) {
  const dayNight = isDay ? "d" : "n";
  if (weatherCode === 0) return `01${dayNight}`;
  if (weatherCode === 1 || weatherCode === 2) return `02${dayNight}`;
  if (weatherCode === 3) return `03${dayNight}`;
  if (weatherCode === 45 || weatherCode === 48) return `50${dayNight}`;
  if (weatherCode >= 51 && weatherCode <= 57) return `09${dayNight}`;
  if (weatherCode >= 61 && weatherCode <= 67) return `10${dayNight}`;
  if (weatherCode >= 71 && weatherCode <= 77) return `13${dayNight}`;
  if (weatherCode >= 80 && weatherCode <= 82) return `10${dayNight}`;
  if (weatherCode === 85 || weatherCode === 86) return `13${dayNight}`;
  if (weatherCode >= 95 && weatherCode <= 99) return `11${dayNight}`;
  return `04${dayNight}`;
}
async function getCurrentWeather() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,weather_code,is_day&timezone=Europe/Berlin`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error("[Open-Meteo] Current weather request failed:", response.status);
      return null;
    }
    const data = await response.json();
    if (!data.current) {
      console.error("[Open-Meteo] Invalid response format:", data);
      return null;
    }
    const { temperature_2m, weather_code, is_day } = data.current;
    return {
      main: {
        temp: temperature_2m
      },
      weather: [
        {
          description: getWeatherDescription(weather_code),
          icon: getIconCode(weather_code, is_day === 1)
        }
      ]
    };
  } catch (error) {
    console.error("[Open-Meteo] Error fetching current weather:", error);
    return null;
  }
}
async function getWeatherForecast() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe/Berlin&forecast_days=5`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error("[Open-Meteo] Forecast request failed:", response.status);
      return null;
    }
    const data = await response.json();
    if (!data.daily) {
      console.error("[Open-Meteo] Invalid response format:", data);
      return null;
    }
    const { time, weather_code, temperature_2m_max, temperature_2m_min } = data.daily;
    const list = time.map((date, index) => {
      const dateObj = new Date(date);
      const timestamp2 = Math.floor(dateObj.getTime() / 1e3);
      return {
        dt: timestamp2,
        dt_txt: `${date} 12:00:00`,
        // Mittags-Zeitpunkt für Kompatibilität
        main: {
          temp: (temperature_2m_max[index] + temperature_2m_min[index]) / 2,
          temp_max: temperature_2m_max[index],
          temp_min: temperature_2m_min[index]
        },
        weather: [
          {
            description: getWeatherDescription(weather_code[index]),
            icon: getIconCode(weather_code[index], true)
            // Tag-Icon
          }
        ]
      };
    });
    return { list };
  } catch (error) {
    console.error("[Open-Meteo] Error fetching forecast:", error);
    return null;
  }
}

// server/google-places.ts
var SCHIEDER_LAT = 51.8667;
var SCHIEDER_LNG = 9.1833;
var DEFAULT_RADIUS = 1e4;
var GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "";
var CATEGORY_MAPPING = {
  // Gastronomie
  "restaurant": ["restaurant"],
  "restaurants": ["restaurant"],
  "essen": ["restaurant"],
  "caf\xE9": ["cafe"],
  "caf\xE9s": ["cafe"],
  "kaffee": ["cafe"],
  "bar": ["bar"],
  "bars": ["bar"],
  "kneipe": ["bar"],
  "pizza": ["restaurant", "meal_delivery"],
  "burger": ["restaurant"],
  "d\xF6ner": ["restaurant"],
  "imbiss": ["restaurant", "meal_takeaway"],
  // Einkaufen
  "supermarkt": ["supermarket"],
  "superm\xE4rkte": ["supermarket"],
  "einkaufen": ["supermarket", "shopping_mall"],
  "gesch\xE4ft": ["store"],
  "gesch\xE4fte": ["store"],
  "laden": ["store"],
  "b\xE4ckerei": ["bakery"],
  "b\xE4cker": ["bakery"],
  "metzger": ["store"],
  "fleischer": ["store"],
  // Gesundheit
  "apotheke": ["pharmacy"],
  "apotheken": ["pharmacy"],
  "arzt": ["doctor"],
  "\xE4rzte": ["doctor"],
  "zahnarzt": ["dentist"],
  "zahn\xE4rzte": ["dentist"],
  "krankenhaus": ["hospital"],
  "klinik": ["hospital"],
  // Auto & Verkehr
  "tankstelle": ["gas_station"],
  "tankstellen": ["gas_station"],
  "tanken": ["gas_station"],
  "werkstatt": ["car_repair"],
  "autowerkstatt": ["car_repair"],
  "parkplatz": ["parking"],
  "parken": ["parking"],
  // Unterkunft
  "hotel": ["lodging"],
  "hotels": ["lodging"],
  "unterkunft": ["lodging"],
  "pension": ["lodging"],
  "ferienwohnung": ["lodging"],
  // Freizeit
  "kino": ["movie_theater"],
  "museum": ["museum"],
  "park": ["park"],
  "spielplatz": ["park"],
  "schwimmbad": ["swimming_pool"],
  "fitness": ["gym"],
  "fitnessstudio": ["gym"],
  // Sonstiges
  "bank": ["bank"],
  "banken": ["bank"],
  "geldautomat": ["atm"],
  "post": ["post_office"],
  "friseur": ["hair_care"],
  "fris\xF6r": ["hair_care"]
};
function isProximityQuery(query) {
  const lowerQuery = query.toLowerCase();
  const proximityKeywords = [
    "in der n\xE4he",
    "n\xE4he",
    "umgebung",
    "umkreis",
    "hier",
    "bei mir",
    "in schieder",
    "wo finde ich",
    "wo gibt es",
    "gibt es",
    "wo kann ich",
    "suche",
    "wo ist",
    "n\xE4chste",
    "n\xE4chster",
    "n\xE4chstes",
    "zeige mir",
    "liste"
  ];
  const hasProximityKeyword = proximityKeywords.some((keyword) => lowerQuery.includes(keyword));
  const hasCategory = Object.keys(CATEGORY_MAPPING).some(
    (category) => lowerQuery.includes(category)
  );
  return hasProximityKeyword && hasCategory;
}
function extractCategory(query) {
  const lowerQuery = query.toLowerCase();
  for (const [keyword, types] of Object.entries(CATEGORY_MAPPING)) {
    if (lowerQuery.includes(keyword)) {
      return types;
    }
  }
  return ["establishment"];
}
async function searchNearbyPlaces(query, radius = DEFAULT_RADIUS) {
  if (!GOOGLE_PLACES_API_KEY) {
    console.error("[Google Places] API Key nicht konfiguriert");
    return null;
  }
  try {
    const types = extractCategory(query);
    const type = types[0];
    console.log(`[Google Places] Suche nach "${type}" im Umkreis von ${radius}m`);
    const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json");
    url.searchParams.append("location", `${SCHIEDER_LAT},${SCHIEDER_LNG}`);
    url.searchParams.append("radius", radius.toString());
    url.searchParams.append("type", type);
    url.searchParams.append("key", GOOGLE_PLACES_API_KEY);
    url.searchParams.append("language", "de");
    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error("[Google Places] API request failed:", response.status);
      return null;
    }
    const data = await response.json();
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("[Google Places] API error:", data.status, data.error_message);
      return null;
    }
    if (data.status === "ZERO_RESULTS") {
      console.log("[Google Places] Keine Ergebnisse gefunden");
      return {
        results: [],
        query,
        category: type
      };
    }
    const placesWithBasicInfo = data.results.slice(0, 10);
    const results = await Promise.all(
      placesWithBasicInfo.map(async (place) => {
        const details = await getPlaceDetails(place.place_id);
        return {
          name: place.name,
          address: place.vicinity,
          rating: place.rating || null,
          userRatingsTotal: place.user_ratings_total || 0,
          openNow: place.opening_hours?.open_now || null,
          phone: details?.formatted_phone_number || null,
          website: details?.website || null,
          types: place.types,
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng
          },
          placeId: place.place_id
        };
      })
    );
    console.log(`[Google Places] ${results.length} Ergebnisse gefunden`);
    return {
      results,
      query,
      category: type,
      totalResults: data.results.length
    };
  } catch (error) {
    console.error("[Google Places] Error:", error);
    return null;
  }
}
async function getPlaceDetails(placeId) {
  if (!GOOGLE_PLACES_API_KEY) {
    console.error("[Google Places] API Key nicht konfiguriert");
    return null;
  }
  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
    url.searchParams.append("place_id", placeId);
    url.searchParams.append("fields", "name,formatted_address,formatted_phone_number,opening_hours,website,rating,user_ratings_total,reviews");
    url.searchParams.append("key", GOOGLE_PLACES_API_KEY);
    url.searchParams.append("language", "de");
    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error("[Google Places] Details request failed:", response.status);
      return null;
    }
    const data = await response.json();
    if (data.status !== "OK") {
      console.error("[Google Places] Details error:", data.status);
      return null;
    }
    return data.result;
  } catch (error) {
    console.error("[Google Places] Details error:", error);
    return null;
  }
}
function formatPlacesForPrompt(placesData) {
  if (!placesData || !placesData.results || placesData.results.length === 0) {
    return "\n(Keine Orte in der N\xE4he gefunden)\n";
  }
  let formatted = `
**ORTE IN DER N\xC4HE (Google Places):**
`;
  formatted += `Kategorie: ${placesData.category}
`;
  formatted += `Gefunden: ${placesData.results.length} Orte

`;
  placesData.results.forEach((place, index) => {
    formatted += `${index + 1}. **${place.name}**
`;
    formatted += `   \u{1F4CD} Adresse: ${place.address}
`;
    if (place.rating) {
      formatted += `   \u2B50 Bewertung: ${place.rating}/5 (${place.userRatingsTotal} Bewertungen)
`;
    }
    if (place.openNow !== null) {
      formatted += `   \u{1F550} ${place.openNow ? "Jetzt ge\xF6ffnet" : "Jetzt geschlossen"}
`;
    }
    if (place.phone) {
      formatted += `   \u{1F4DE} Telefon: ${place.phone}
`;
    }
    if (place.website) {
      formatted += `   \u{1F310} Website: ${place.website}
`;
    }
    formatted += "\n";
  });
  return formatted;
}

// server/routers/tenant.ts
import { z as z2 } from "zod";
import { eq as eq2 } from "drizzle-orm";
var tenantRouter = router({
  /**
   * Get current tenant info
   */
  current: publicProcedure.query(async ({ ctx }) => {
    return ctx.tenant;
  }),
  /**
   * List all active tenants
   */
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    return await db.select().from(tenants).where(eq2(tenants.isActive, true)).orderBy(tenants.name);
  }),
  /**
   * Get tenant by slug
   */
  getBySlug: publicProcedure.input(z2.object({ slug: z2.string() })).query(async ({ input }) => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }
    const result = await db.select().from(tenants).where(eq2(tenants.slug, input.slug)).limit(1);
    return result[0] || null;
  })
});

// server/routers/news-multi-tenant.ts
import { z as z3 } from "zod";
import { eq as eq3, desc as desc2, and as and2 } from "drizzle-orm";
import { nanoid as nanoid2 } from "nanoid";
var newsRouter = router({
  /**
   * List all news for current tenant
   */
  list: publicProcedure.input(z3.object({
    category: z3.string().optional(),
    limit: z3.number().default(50)
  })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    let query = db.select().from(news).where(eq3(news.tenantId, ctx.tenant.id)).orderBy(desc2(news.publishedAt)).limit(input.limit);
    if (input.category) {
      query = db.select().from(news).where(
        and2(
          eq3(news.tenantId, ctx.tenant.id),
          eq3(news.category, input.category)
        )
      ).orderBy(desc2(news.publishedAt)).limit(input.limit);
    }
    return await query;
  }),
  /**
   * Get single news by ID (tenant-filtered)
   */
  getById: publicProcedure.input(z3.object({ id: z3.string() })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(news).where(
      and2(
        eq3(news.id, input.id),
        eq3(news.tenantId, ctx.tenant.id)
      )
    ).limit(1);
    return result[0] || null;
  }),
  /**
   * Create news (tenant-admin or admin only)
   */
  create: protectedProcedure.input(z3.object({
    title: z3.string(),
    teaser: z3.string().optional(),
    bodyMD: z3.string().optional(),
    imageUrl: z3.string().optional(),
    category: z3.string().optional(),
    publishedAt: z3.date(),
    sourceUrl: z3.string().optional()
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "tenant_admin") {
      throw new Error("Unauthorized: Admin or Tenant Admin role required");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const id = nanoid2();
    const newsData = {
      id,
      tenantId: ctx.tenant.id,
      title: input.title,
      teaser: input.teaser || null,
      bodyMD: input.bodyMD || null,
      imageUrl: input.imageUrl || null,
      category: input.category || null,
      publishedAt: input.publishedAt,
      sourceUrl: input.sourceUrl || null
    };
    await db.insert(news).values(newsData);
    return { id };
  }),
  /**
   * Update news (tenant-admin or admin only, tenant-filtered)
   */
  update: protectedProcedure.input(z3.object({
    id: z3.string(),
    title: z3.string().optional(),
    teaser: z3.string().optional(),
    bodyMD: z3.string().optional(),
    imageUrl: z3.string().optional(),
    category: z3.string().optional(),
    publishedAt: z3.date().optional(),
    sourceUrl: z3.string().optional()
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "tenant_admin") {
      throw new Error("Unauthorized: Admin or Tenant Admin role required");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const existing = await db.select().from(news).where(
      and2(
        eq3(news.id, input.id),
        eq3(news.tenantId, ctx.tenant.id)
      )
    ).limit(1);
    if (existing.length === 0) {
      throw new Error("News not found or does not belong to your tenant");
    }
    const { id, ...updateData } = input;
    await db.update(news).set(updateData).where(eq3(news.id, id));
    return { success: true };
  }),
  /**
   * Delete news (tenant-admin or admin only, tenant-filtered)
   */
  delete: protectedProcedure.input(z3.object({ id: z3.string() })).mutation(async ({ input, ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "tenant_admin") {
      throw new Error("Unauthorized: Admin or Tenant Admin role required");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const existing = await db.select().from(news).where(
      and2(
        eq3(news.id, input.id),
        eq3(news.tenantId, ctx.tenant.id)
      )
    ).limit(1);
    if (existing.length === 0) {
      throw new Error("News not found or does not belong to your tenant");
    }
    await db.delete(news).where(eq3(news.id, input.id));
    return { success: true };
  })
});

// server/routers/events-multi-tenant.ts
import { z as z4 } from "zod";
import { eq as eq4, desc as desc3, and as and3, gte as gte2 } from "drizzle-orm";
import { nanoid as nanoid3 } from "nanoid";
var eventsRouter = router({
  /**
   * List all events for current tenant
   */
  list: publicProcedure.input(z4.object({
    upcoming: z4.boolean().default(true),
    limit: z4.number().default(50)
  })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    if (input.upcoming) {
      return await db.select().from(events).where(
        and3(
          eq4(events.tenantId, ctx.tenant.id),
          gte2(events.startDate, /* @__PURE__ */ new Date())
        )
      ).orderBy(events.startDate).limit(input.limit);
    }
    return await db.select().from(events).where(eq4(events.tenantId, ctx.tenant.id)).orderBy(desc3(events.startDate)).limit(input.limit);
  }),
  /**
   * Get single event by ID (tenant-filtered)
   */
  getById: publicProcedure.input(z4.object({ id: z4.string() })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(events).where(
      and3(
        eq4(events.id, input.id),
        eq4(events.tenantId, ctx.tenant.id)
      )
    ).limit(1);
    return result[0] || null;
  }),
  /**
   * Create event (tenant-admin or admin only)
   */
  create: protectedProcedure.input(z4.object({
    title: z4.string(),
    description: z4.string().optional(),
    startDate: z4.date(),
    endDate: z4.date().optional(),
    location: z4.string().optional(),
    imageUrl: z4.string().optional(),
    category: z4.string().optional(),
    organizerName: z4.string().optional(),
    organizerContact: z4.string().optional(),
    registrationUrl: z4.string().optional()
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "tenant_admin") {
      throw new Error("Unauthorized: Admin or Tenant Admin role required");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const id = nanoid3();
    const eventData = {
      id,
      tenantId: ctx.tenant.id,
      title: input.title,
      description: input.description || null,
      startDate: input.startDate,
      endDate: input.endDate || null,
      location: input.location || null,
      imageUrl: input.imageUrl || null,
      category: input.category || null,
      organizerName: input.organizerName || null,
      organizerContact: input.organizerContact || null,
      registrationUrl: input.registrationUrl || null
    };
    await db.insert(events).values(eventData);
    return { id };
  }),
  /**
   * Update event (tenant-admin or admin only, tenant-filtered)
   */
  update: protectedProcedure.input(z4.object({
    id: z4.string(),
    title: z4.string().optional(),
    description: z4.string().optional(),
    startDate: z4.date().optional(),
    endDate: z4.date().optional(),
    location: z4.string().optional(),
    imageUrl: z4.string().optional(),
    category: z4.string().optional(),
    organizerName: z4.string().optional(),
    organizerContact: z4.string().optional(),
    registrationUrl: z4.string().optional()
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "tenant_admin") {
      throw new Error("Unauthorized: Admin or Tenant Admin role required");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const existing = await db.select().from(events).where(
      and3(
        eq4(events.id, input.id),
        eq4(events.tenantId, ctx.tenant.id)
      )
    ).limit(1);
    if (existing.length === 0) {
      throw new Error("Event not found or does not belong to your tenant");
    }
    const { id, ...updateData } = input;
    await db.update(events).set(updateData).where(eq4(events.id, id));
    return { success: true };
  }),
  /**
   * Delete event (tenant-admin or admin only, tenant-filtered)
   */
  delete: protectedProcedure.input(z4.object({ id: z4.string() })).mutation(async ({ input, ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "tenant_admin") {
      throw new Error("Unauthorized: Admin or Tenant Admin role required");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const existing = await db.select().from(events).where(
      and3(
        eq4(events.id, input.id),
        eq4(events.tenantId, ctx.tenant.id)
      )
    ).limit(1);
    if (existing.length === 0) {
      throw new Error("Event not found or does not belong to your tenant");
    }
    await db.delete(events).where(eq4(events.id, input.id));
    return { success: true };
  })
});

// server/routers/departments-multi-tenant.ts
import { z as z5 } from "zod";
import { eq as eq5, and as and4 } from "drizzle-orm";
import { nanoid as nanoid4 } from "nanoid";
var departmentsRouter = router({
  /**
   * List all departments for current tenant
   */
  list: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select().from(departments).where(eq5(departments.tenantId, ctx.tenant.id)).orderBy(departments.name);
  }),
  /**
   * Get single department by ID (tenant-filtered)
   */
  getById: publicProcedure.input(z5.object({ id: z5.string() })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(departments).where(
      and4(
        eq5(departments.id, input.id),
        eq5(departments.tenantId, ctx.tenant.id)
      )
    ).limit(1);
    return result[0] || null;
  }),
  /**
   * Create department (tenant-admin or admin only)
   */
  create: protectedProcedure.input(z5.object({
    name: z5.string(),
    description: z5.string().optional(),
    contactPerson: z5.string().optional(),
    email: z5.string().optional(),
    phone: z5.string().optional(),
    address: z5.string().optional(),
    openingHours: z5.string().optional(),
    website: z5.string().optional()
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "tenant_admin") {
      throw new Error("Unauthorized: Admin or Tenant Admin role required");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const id = nanoid4();
    const deptData = {
      id,
      tenantId: ctx.tenant.id,
      name: input.name,
      description: input.description || null,
      contactPerson: input.contactPerson || null,
      email: input.email || null,
      phone: input.phone || null,
      address: input.address || null,
      openingHours: input.openingHours || null,
      website: input.website || null
    };
    await db.insert(departments).values(deptData);
    return { id };
  }),
  /**
   * Update department (tenant-admin or admin only, tenant-filtered)
   */
  update: protectedProcedure.input(z5.object({
    id: z5.string(),
    name: z5.string().optional(),
    description: z5.string().optional(),
    contactPerson: z5.string().optional(),
    email: z5.string().optional(),
    phone: z5.string().optional(),
    address: z5.string().optional(),
    openingHours: z5.string().optional(),
    website: z5.string().optional()
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "tenant_admin") {
      throw new Error("Unauthorized: Admin or Tenant Admin role required");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const existing = await db.select().from(departments).where(
      and4(
        eq5(departments.id, input.id),
        eq5(departments.tenantId, ctx.tenant.id)
      )
    ).limit(1);
    if (existing.length === 0) {
      throw new Error("Department not found or does not belong to your tenant");
    }
    const { id, ...updateData } = input;
    await db.update(departments).set(updateData).where(eq5(departments.id, id));
    return { success: true };
  }),
  /**
   * Delete department (tenant-admin or admin only, tenant-filtered)
   */
  delete: protectedProcedure.input(z5.object({ id: z5.string() })).mutation(async ({ input, ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "tenant_admin") {
      throw new Error("Unauthorized: Admin or Tenant Admin role required");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const existing = await db.select().from(departments).where(
      and4(
        eq5(departments.id, input.id),
        eq5(departments.tenantId, ctx.tenant.id)
      )
    ).limit(1);
    if (existing.length === 0) {
      throw new Error("Department not found or does not belong to your tenant");
    }
    await db.delete(departments).where(eq5(departments.id, input.id));
    return { success: true };
  })
});

// server/routers/issueReports-multi-tenant.ts
import { z as z6 } from "zod";
import { eq as eq6, desc as desc4, and as and5 } from "drizzle-orm";
import { nanoid as nanoid5 } from "nanoid";
var issueReportsRouter = router({
  /**
   * List all issue reports for current tenant
   */
  list: publicProcedure.input(z6.object({
    category: z6.string().optional(),
    status: z6.enum(["open", "in_progress", "resolved", "closed"]).optional(),
    limit: z6.number().default(100)
  })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    let query = db.select().from(issueReports).where(eq6(issueReports.tenantId, ctx.tenant.id)).orderBy(desc4(issueReports.createdAt)).limit(input.limit);
    if (input.category || input.status) {
      const conditions = [eq6(issueReports.tenantId, ctx.tenant.id)];
      if (input.category) conditions.push(eq6(issueReports.category, input.category));
      if (input.status) conditions.push(eq6(issueReports.status, input.status));
      query = db.select().from(issueReports).where(and5(...conditions)).orderBy(desc4(issueReports.createdAt)).limit(input.limit);
    }
    return await query;
  }),
  /**
   * Get single issue report by ID (tenant-filtered)
   */
  getById: publicProcedure.input(z6.object({ id: z6.string() })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(issueReports).where(
      and5(
        eq6(issueReports.id, input.id),
        eq6(issueReports.tenantId, ctx.tenant.id)
      )
    ).limit(1);
    return result[0] || null;
  }),
  /**
   * Create issue report (public, but tenant-scoped)
   */
  create: publicProcedure.input(z6.object({
    category: z6.string(),
    title: z6.string(),
    description: z6.string(),
    location: z6.string().optional(),
    latitude: z6.number().optional(),
    longitude: z6.number().optional(),
    imageUrl: z6.string().optional(),
    reporterName: z6.string().optional(),
    reporterEmail: z6.string().optional(),
    reporterPhone: z6.string().optional()
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const id = nanoid5();
    const reportData = {
      id,
      tenantId: ctx.tenant.id,
      category: input.category,
      title: input.title,
      description: input.description,
      location: input.location || null,
      latitude: input.latitude || null,
      longitude: input.longitude || null,
      imageUrl: input.imageUrl || null,
      reporterName: input.reporterName || null,
      reporterEmail: input.reporterEmail || null,
      reporterPhone: input.reporterPhone || null,
      status: "open",
      createdAt: /* @__PURE__ */ new Date()
    };
    await db.insert(issueReports).values(reportData);
    return { id };
  }),
  /**
   * Update issue report status (tenant-admin or admin only, tenant-filtered)
   */
  updateStatus: protectedProcedure.input(z6.object({
    id: z6.string(),
    status: z6.enum(["open", "in_progress", "resolved", "closed"]),
    adminNotes: z6.string().optional()
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "tenant_admin") {
      throw new Error("Unauthorized: Admin or Tenant Admin role required");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const existing = await db.select().from(issueReports).where(
      and5(
        eq6(issueReports.id, input.id),
        eq6(issueReports.tenantId, ctx.tenant.id)
      )
    ).limit(1);
    if (existing.length === 0) {
      throw new Error("Issue report not found or does not belong to your tenant");
    }
    await db.update(issueReports).set({
      status: input.status,
      adminNotes: input.adminNotes || null
    }).where(eq6(issueReports.id, input.id));
    return { success: true };
  }),
  /**
   * Delete issue report (admin only, tenant-filtered)
   */
  delete: protectedProcedure.input(z6.object({ id: z6.string() })).mutation(async ({ input, ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new Error("Unauthorized: Admin role required");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const existing = await db.select().from(issueReports).where(
      and5(
        eq6(issueReports.id, input.id),
        eq6(issueReports.tenantId, ctx.tenant.id)
      )
    ).limit(1);
    if (existing.length === 0) {
      throw new Error("Issue report not found or does not belong to your tenant");
    }
    await db.delete(issueReports).where(eq6(issueReports.id, input.id));
    return { success: true };
  })
});

// server/routers/all-remaining-routers.ts
import { z as z7 } from "zod";
import { eq as eq7, desc as desc5, and as and6, gte as gte3 } from "drizzle-orm";
import { nanoid as nanoid6 } from "nanoid";
var wasteScheduleRouter = router({
  list: publicProcedure.input(z7.object({
    upcoming: z7.boolean().default(true),
    limit: z7.number().default(100)
  })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    if (input.upcoming) {
      return await db.select().from(wasteSchedule).where(
        and6(
          eq7(wasteSchedule.tenantId, ctx.tenant.id),
          gte3(wasteSchedule.collectionDate, /* @__PURE__ */ new Date())
        )
      ).orderBy(wasteSchedule.collectionDate).limit(input.limit);
    }
    return await db.select().from(wasteSchedule).where(eq7(wasteSchedule.tenantId, ctx.tenant.id)).orderBy(desc5(wasteSchedule.collectionDate)).limit(input.limit);
  }),
  create: protectedProcedure.input(z7.object({
    wasteType: z7.string(),
    collectionDate: z7.date(),
    district: z7.string().optional()
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "tenant_admin") {
      throw new Error("Unauthorized");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const id = nanoid6();
    await db.insert(wasteSchedule).values({
      id,
      tenantId: ctx.tenant.id,
      ...input
    });
    return { id };
  })
});
var alertsRouter = router({
  list: publicProcedure.input(z7.object({
    active: z7.boolean().default(true),
    limit: z7.number().default(50)
  })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    if (input.active) {
      return await db.select().from(alerts).where(
        and6(
          eq7(alerts.tenantId, ctx.tenant.id),
          eq7(alerts.isActive, true)
        )
      ).orderBy(desc5(alerts.createdAt)).limit(input.limit);
    }
    return await db.select().from(alerts).where(eq7(alerts.tenantId, ctx.tenant.id)).orderBy(desc5(alerts.createdAt)).limit(input.limit);
  }),
  create: protectedProcedure.input(z7.object({
    title: z7.string(),
    message: z7.string(),
    severity: z7.enum(["info", "warning", "critical"]),
    category: z7.string().optional()
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "tenant_admin") {
      throw new Error("Unauthorized");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const id = nanoid6();
    await db.insert(alerts).values({
      id,
      tenantId: ctx.tenant.id,
      ...input,
      isActive: true,
      createdAt: /* @__PURE__ */ new Date()
    });
    return { id };
  }),
  deactivate: protectedProcedure.input(z7.object({ id: z7.string() })).mutation(async ({ input, ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "tenant_admin") {
      throw new Error("Unauthorized");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const existing = await db.select().from(alerts).where(
      and6(
        eq7(alerts.id, input.id),
        eq7(alerts.tenantId, ctx.tenant.id)
      )
    ).limit(1);
    if (existing.length === 0) {
      throw new Error("Alert not found or does not belong to your tenant");
    }
    await db.update(alerts).set({ isActive: false }).where(eq7(alerts.id, input.id));
    return { success: true };
  })
});
var mayorInfoRouter = router({
  info: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const result = await db.select().from(mayorInfo).where(eq7(mayorInfo.tenantId, ctx.tenant.id)).limit(1);
    return result[0] || null;
  }),
  update: protectedProcedure.input(z7.object({
    name: z7.string(),
    title: z7.string().optional(),
    bio: z7.string().optional(),
    imageUrl: z7.string().optional(),
    email: z7.string().optional(),
    phone: z7.string().optional()
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "tenant_admin") {
      throw new Error("Unauthorized");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const existing = await db.select().from(mayorInfo).where(eq7(mayorInfo.tenantId, ctx.tenant.id)).limit(1);
    if (existing.length === 0) {
      const id = nanoid6();
      await db.insert(mayorInfo).values({
        id,
        tenantId: ctx.tenant.id,
        ...input
      });
    } else {
      await db.update(mayorInfo).set(input).where(eq7(mayorInfo.id, existing[0].id));
    }
    return { success: true };
  })
});
var poisRouter = router({
  list: publicProcedure.input(z7.object({
    category: z7.string().optional(),
    limit: z7.number().default(100)
  })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    if (input.category) {
      return await db.select().from(pois).where(
        and6(
          eq7(pois.tenantId, ctx.tenant.id),
          eq7(pois.category, input.category)
        )
      ).limit(input.limit);
    }
    return await db.select().from(pois).where(eq7(pois.tenantId, ctx.tenant.id)).limit(input.limit);
  }),
  create: protectedProcedure.input(z7.object({
    name: z7.string(),
    description: z7.string().optional(),
    category: z7.string(),
    latitude: z7.number(),
    longitude: z7.number(),
    address: z7.string().optional(),
    imageUrl: z7.string().optional(),
    website: z7.string().optional()
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "tenant_admin") {
      throw new Error("Unauthorized");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const id = nanoid6();
    await db.insert(pois).values({
      id,
      tenantId: ctx.tenant.id,
      ...input
    });
    return { id };
  })
});
var institutionsRouter = router({
  list: publicProcedure.input(z7.object({
    category: z7.string().optional(),
    limit: z7.number().default(100)
  })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    if (input.category) {
      return await db.select().from(institutions).where(
        and6(
          eq7(institutions.tenantId, ctx.tenant.id),
          eq7(institutions.category, input.category)
        )
      ).limit(input.limit);
    }
    return await db.select().from(institutions).where(eq7(institutions.tenantId, ctx.tenant.id)).limit(input.limit);
  }),
  create: protectedProcedure.input(z7.object({
    name: z7.string(),
    category: z7.string(),
    description: z7.string().optional(),
    address: z7.string().optional(),
    phone: z7.string().optional(),
    email: z7.string().optional(),
    website: z7.string().optional()
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "tenant_admin") {
      throw new Error("Unauthorized");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const id = nanoid6();
    await db.insert(institutions).values({
      id,
      tenantId: ctx.tenant.id,
      ...input
    });
    return { id };
  })
});
var clubsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select().from(clubs).where(eq7(clubs.tenantId, ctx.tenant.id)).orderBy(clubs.name);
  }),
  create: protectedProcedure.input(z7.object({
    name: z7.string(),
    description: z7.string().optional(),
    category: z7.string().optional(),
    contactPerson: z7.string().optional(),
    email: z7.string().optional(),
    phone: z7.string().optional(),
    website: z7.string().optional()
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "tenant_admin") {
      throw new Error("Unauthorized");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const id = nanoid6();
    await db.insert(clubs).values({
      id,
      tenantId: ctx.tenant.id,
      ...input
    });
    return { id };
  })
});
var councilMeetingsRouter = router({
  list: publicProcedure.input(z7.object({
    upcoming: z7.boolean().default(true),
    limit: z7.number().default(50)
  })).query(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    if (input.upcoming) {
      return await db.select().from(councilMeetings).where(
        and6(
          eq7(councilMeetings.tenantId, ctx.tenant.id),
          gte3(councilMeetings.meetingDate, /* @__PURE__ */ new Date())
        )
      ).orderBy(councilMeetings.meetingDate).limit(input.limit);
    }
    return await db.select().from(councilMeetings).where(eq7(councilMeetings.tenantId, ctx.tenant.id)).orderBy(desc5(councilMeetings.meetingDate)).limit(input.limit);
  }),
  create: protectedProcedure.input(z7.object({
    title: z7.string(),
    meetingDate: z7.date(),
    location: z7.string().optional(),
    agendaUrl: z7.string().optional(),
    minutesUrl: z7.string().optional()
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "tenant_admin") {
      throw new Error("Unauthorized");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const id = nanoid6();
    await db.insert(councilMeetings).values({
      id,
      tenantId: ctx.tenant.id,
      ...input
    });
    return { id };
  })
});
var contactMessagesRouter = router({
  list: protectedProcedure.input(z7.object({
    limit: z7.number().default(100)
  })).query(async ({ input, ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "tenant_admin") {
      throw new Error("Unauthorized");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select().from(contactMessages).where(eq7(contactMessages.tenantId, ctx.tenant.id)).orderBy(desc5(contactMessages.createdAt)).limit(input.limit);
  }),
  create: publicProcedure.input(z7.object({
    name: z7.string(),
    email: z7.string(),
    subject: z7.string(),
    message: z7.string()
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const id = nanoid6();
    await db.insert(contactMessages).values({
      id,
      tenantId: ctx.tenant.id,
      ...input,
      createdAt: /* @__PURE__ */ new Date()
    });
    return { id };
  })
});
var pushNotificationsRouter = router({
  active: publicProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(pushNotifications).where(
      and6(
        eq7(pushNotifications.tenantId, ctx.tenant.id),
        eq7(pushNotifications.isActive, true)
      )
    ).orderBy(desc5(pushNotifications.createdAt)).limit(10);
  }),
  send: protectedProcedure.input(z7.object({
    title: z7.string(),
    body: z7.string(),
    targetAudience: z7.enum(["all", "specific"]).default("all")
  })).mutation(async ({ input, ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "tenant_admin") {
      throw new Error("Unauthorized");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const id = nanoid6();
    await db.insert(pushNotifications).values({
      id,
      tenantId: ctx.tenant.id,
      ...input,
      sentAt: /* @__PURE__ */ new Date()
    });
    return { id };
  }),
  list: protectedProcedure.input(z7.object({
    limit: z7.number().default(50)
  })).query(async ({ input, ctx }) => {
    if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "tenant_admin") {
      throw new Error("Unauthorized");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return await db.select().from(pushNotifications).where(eq7(pushNotifications.tenantId, ctx.tenant.id)).orderBy(desc5(pushNotifications.sentAt)).limit(input.limit);
  })
});
var userNotificationsRouter = router({
  list: protectedProcedure.input(z7.object({
    unreadOnly: z7.boolean().default(false),
    limit: z7.number().default(50)
  })).query(async ({ input, ctx }) => {
    if (!ctx.user) {
      throw new Error("Unauthorized");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    if (input.unreadOnly) {
      return await db.select().from(userNotifications).where(
        and6(
          eq7(userNotifications.tenantId, ctx.tenant.id),
          eq7(userNotifications.userId, ctx.user.id),
          eq7(userNotifications.isRead, false)
        )
      ).orderBy(desc5(userNotifications.createdAt)).limit(input.limit);
    }
    return await db.select().from(userNotifications).where(
      and6(
        eq7(userNotifications.tenantId, ctx.tenant.id),
        eq7(userNotifications.userId, ctx.user.id)
      )
    ).orderBy(desc5(userNotifications.createdAt)).limit(input.limit);
  }),
  markAsRead: protectedProcedure.input(z7.object({ id: z7.string() })).mutation(async ({ input, ctx }) => {
    if (!ctx.user) {
      throw new Error("Unauthorized");
    }
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    await db.update(userNotifications).set({ isRead: true }).where(
      and6(
        eq7(userNotifications.id, input.id),
        eq7(userNotifications.userId, ctx.user.id),
        eq7(userNotifications.tenantId, ctx.tenant.id)
      )
    );
    return { success: true };
  })
});

// server/routers/chat.ts
import { z as z8 } from "zod";

// server/services/chat-service.ts
import pg2 from "pg";
var { Pool: Pool2 } = pg2;
var pool2 = new Pool2({
  host: "127.0.0.1",
  port: 5432,
  database: "buergerapp",
  user: "buergerapp_user",
  password: "buergerapp_dev_2025"
});
var PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || "";
var PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";
var sessions = /* @__PURE__ */ new Map();
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1e3;
  for (const [sessionId, session] of sessions.entries()) {
    if (now - session.lastActivity > oneHour) {
      sessions.delete(sessionId);
    }
  }
}, 5 * 60 * 1e3);
function getQuestionType(message, cityName) {
  const lowerMessage = message.toLowerCase();
  const shoppingKeywords = [
    "einkaufsm\xF6glichkeit",
    "einkaufen",
    "gesch\xE4ft",
    "laden",
    "supermarkt",
    "markt",
    "shopping",
    "lebensmittel",
    "discounter",
    "discount",
    "aldi",
    "lidl",
    "penny",
    "netto",
    "rewe",
    "edeka"
  ];
  const hasShoppingKeyword = shoppingKeywords.some((keyword) => lowerMessage.includes(keyword));
  if (hasShoppingKeyword) {
    return "proximity";
  }
  const localKeywords = [
    "b\xFCrgermeister",
    "\xF6ffnungszeit",
    "ge\xF6ffnet",
    "rathaus",
    "verwaltung",
    "kontakt",
    "telefon",
    "email",
    "adresse",
    "kontaktieren",
    "erreichen",
    "anrufen",
    "schreiben",
    "verein",
    "club",
    "schule",
    "kindergarten",
    "kita",
    "bildung",
    "sehensw\xFCrdigkeit",
    "sehensw\xFCrdigkeiten",
    "ausflug",
    "ausfl\xFCge",
    "aktivit\xE4t",
    "aktivit\xE4ten",
    "attraktionen",
    "attraktion",
    "was kann man",
    "was gibt es zu",
    "tipps",
    "empfehlung",
    "empfehlungen",
    "interessant",
    "besichtigen",
    "besuchen",
    "erleben",
    "unternehmen"
  ];
  const hasLocalKeyword = localKeywords.some((keyword) => lowerMessage.includes(keyword));
  if (hasLocalKeyword) {
    return "local";
  }
  const proximityKeywords = [
    "zahnarzt",
    "arzt",
    "apotheke",
    "krankenhaus",
    "restaurant",
    "caf\xE9",
    "cafe",
    "tankstelle",
    "supermarkt",
    "einkaufen",
    "laden",
    "gesch\xE4ft",
    "bank",
    "geldautomat",
    "atm",
    "fris\xF6r",
    "friseur",
    "hotel",
    "\xFCbernachtung"
  ];
  const hasProximityKeyword = proximityKeywords.some((keyword) => lowerMessage.includes(keyword));
  const hasProximityPhrase = [
    "wo finde",
    "wo gibt es",
    "wo ist der n\xE4chste",
    "wo ist die n\xE4chste",
    "n\xE4chste",
    "n\xE4chster",
    "n\xE4chstes",
    "in der n\xE4he"
  ].some((phrase) => lowerMessage.includes(phrase));
  if (hasProximityKeyword && hasProximityPhrase) {
    return "proximity";
  }
  const globalKeywords = [
    "bundeskanzler",
    "bundesregierung",
    "bundestag",
    "bundesrat",
    "bundespr\xE4sident",
    "minister",
    "kanzler",
    "bitcoin",
    "kryptow\xE4hrung",
    "aktie",
    "b\xF6rse",
    "dax",
    "weltweit",
    "international",
    "europa",
    "usa",
    "china",
    "russland",
    "krieg",
    "konflikt",
    "eiffelturm",
    "paris",
    "london",
    "berlin",
    "hauptstadt",
    "pr\xE4sident",
    "k\xF6nig",
    "queen",
    "weltkrieg",
    "geschichte",
    "erfinder",
    "entdecker",
    "wissenschaftler",
    "einstein",
    "newton"
  ];
  const hasGlobalKeyword = globalKeywords.some((keyword) => lowerMessage.includes(keyword));
  const lowerCity = cityName.toLowerCase();
  if (hasGlobalKeyword && !lowerMessage.includes(lowerCity)) {
    return "global";
  }
  return "local";
}
async function getTenantData(tenantId) {
  try {
    const result = await pool2.query(
      'SELECT id, name, slug, "contactEmail", "contactPhone", "contactAddress", "chatbotName", "weatherLat", "weatherLon", mayor_name, mayor_office_hours FROM tenants WHERE id = $1',
      [tenantId]
    );
    if (result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      contactEmail: row.contactEmail,
      contactPhone: row.contactPhone,
      contactAddress: row.contactAddress,
      chatbotName: row.chatbotName,
      weatherLat: row.weatherLat,
      weatherLon: row.weatherLon,
      mayorName: row.mayor_name,
      mayorOfficeHours: row.mayor_office_hours
    };
  } catch (error) {
    console.error("[Chat] Error loading tenant data:", error);
    return null;
  }
}
async function getLocalContext(tenantId) {
  try {
    const [newsResult, eventsResult, departmentsResult, clubsResult] = await Promise.all([
      // Latest 5 news
      pool2.query(
        'SELECT title, "bodyMD" as content, "publishedAt" as published_at FROM news WHERE "tenantId" = $1 ORDER BY "publishedAt" DESC LIMIT 5',
        [tenantId]
      ),
      // Upcoming 5 events
      pool2.query(
        "SELECT title, description, start_date, location FROM events WHERE tenant_id = $1 AND start_date >= NOW() ORDER BY start_date ASC LIMIT 5",
        [tenantId]
      ),
      // All departments
      pool2.query(
        "SELECT name FROM departments WHERE tenant_id = $1",
        [tenantId]
      ),
      // All clubs
      pool2.query(
        "SELECT c.name, c.contact_person, c.phone, c.email, c.website, cc.name as category FROM clubs c LEFT JOIN club_categories cc ON c.category_id = cc.id WHERE c.tenant_id = $1",
        [tenantId]
      )
    ]);
    const newsData = newsResult.rows;
    const eventsData = eventsResult.rows;
    const departmentsData = departmentsResult.rows;
    const clubsData = clubsResult.rows;
    let context = "";
    if (newsData.length > 0) {
      context += "\n=== AKTUELLE NACHRICHTEN ===\n";
      newsData.forEach((n) => {
        context += `\u{1F4F0} ${n.title}
`;
        if (n.published_at) {
          context += `   Datum: ${formatDate(n.published_at)}
`;
        }
        if (n.content) {
          const preview = n.content.substring(0, 200).replace(/\n/g, " ");
          context += `   ${preview}...
`;
        }
        context += "\n";
      });
    }
    if (eventsData.length > 0) {
      context += "\n=== KOMMENDE VERANSTALTUNGEN ===\n";
      eventsData.forEach((e) => {
        context += `\u{1F4C5} ${e.title}
`;
        if (e.start_date) {
          context += `   Datum: ${formatDate(e.start_date)}
`;
        }
        if (e.location) {
          context += `   \u{1F4CD} Ort: ${e.location}
`;
        }
        if (e.description) {
          const preview = e.description.substring(0, 150).replace(/\n/g, " ");
          context += `   ${preview}...
`;
        }
        context += "\n";
      });
    }
    if (departmentsData.length > 0) {
      context += "\n=== \xC4MTER & ABTEILUNGEN ===\n";
      departmentsData.forEach((d) => {
        context += `\u{1F3DB}\uFE0F ${d.name}
`;
        context += "\n";
      });
    }
    if (clubsData.length > 0) {
      context += "\n=== VEREINE ===\n";
      const categories = [...new Set(clubsData.map((c) => c.category).filter(Boolean))];
      categories.forEach((category) => {
        context += `
${category}:
`;
        const categoryClubs = clubsData.filter((c) => c.category === category);
        categoryClubs.forEach((club) => {
          context += `  \u{1F3C6} ${club.name}
`;
          if (club.contact_person) {
            context += `     Ansprechpartner: ${club.contact_person}
`;
          }
          if (club.phone) {
            context += `     \u{1F4DE} ${club.phone}
`;
          }
          if (club.email) {
            context += `     \u{1F4E7} ${club.email}
`;
          }
          if (club.website) {
            context += `     \u{1F310} ${club.website}
`;
          }
        });
      });
    }
    return context;
  } catch (error) {
    console.error("[Chat] Error loading local context:", error);
    return "";
  }
}
function formatDate(date) {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}
function createLocalSystemPrompt(tenantData, contextData) {
  const chatbotName = tenantData.chatbotName || "Stadtbot";
  const cityName = tenantData.name;
  return `Du bist "${chatbotName}", der digitale Assistent f\xFCr ${cityName}.

=== DEINE GRUNDREGELN ===

1. **Lokaler Bezug - SEHR WICHTIG:**
   - Du beantwortest Fragen IMMER im Kontext von ${cityName}
   - Wenn jemand fragt "Wie hei\xDFt der B\xFCrgermeister?" ist IMMER der B\xFCrgermeister von ${cityName} gemeint
   - Wenn jemand fragt "\xD6ffnungszeiten Freibad" ist IMMER das Freibad in ${cityName} gemeint
   - Wenn jemand fragt "Wo finde ich einen Zahnarzt?" sind Zahn\xE4rzte im Umkreis von ca. 8km um ${cityName} gemeint
   - Du musst NICHT explizit nach dem Stadt-Namen fragen - der lokale Bezug ist IMMER implizit

2. **Umkreissuche (8km Radius):**
   - Fragen nach \xC4rzten, Zahn\xE4rzten, Apotheken, Restaurants, Tankstellen, etc. beziehen sich auf den Umkreis von ca. 8km
   - Nutze die bereitgestellten Daten oder empfehle eine Suche auf Google Maps
   - Format: "In ${cityName} und Umgebung finden Sie..."

3. **Hilfreiche Antworten - SEHR WICHTIG:**
   - Du hast Zugriff auf das Internet und kannst AKTIV recherchieren
   - Gib IMMER **konkrete, detaillierte Informationen** aus deiner Recherche
   - NIEMALS nur auf Webseiten oder Kontaktstellen verweisen
   - NIEMALS sagen "Ich empfehle dir, die Website zu besuchen" oder "Kontaktiere die Touristinfo"
   - Wenn du Informationen findest, pr\xE4sentiere sie DIREKT und VOLLST\xC4NDIG
   - Nutze die bereitgestellten **AKTUELLEN INFORMATIONEN** f\xFCr pr\xE4zise Antworten
   - Wenn du trotz Recherche keine konkreten Infos findest, sage das ehrlich, aber gib trotzdem allgemeine Tipps

3a. **ANTI-HALLUZINATION - ABSOLUT KRITISCH:**
   - NIEMALS Informationen erfinden oder raten
   - NIEMALS konkrete Adressen, \xD6ffnungszeiten oder Namen nennen, die du nicht verifiziert hast
   - Wenn du keine verifizierten Daten findest, sage EHRLICH: "Ich habe keine aktuellen Informationen gefunden"
   - Bei Fragen nach konkreten Orten (Gesch\xE4fte, Restaurants, etc.) NUR verifizierte Daten aus deiner Recherche verwenden
   - Lieber KEINE Antwort als eine FALSCHE Antwort

4. **Formatierung:**
   - Nutze IMMER Icons f\xFCr bessere Lesbarkeit:
     * \u{1F4CD} f\xFCr Adressen
     * \u{1F550} f\xFCr \xD6ffnungszeiten
     * \u{1F4DE} f\xFCr Telefonnummern
     * \u{1F4E7} f\xFCr E-Mail-Adressen
     * \u{1F4C5} f\xFCr Termine/Veranstaltungen
     * \u{1F3DB}\uFE0F f\xFCr Rathaus/Verwaltung
     * \u{1F465} f\xFCr Personen/Ansprechpartner
     * \u{1F3C6} f\xFCr Vereine
     * \u{1F4F0} f\xFCr News
   - Strukturiere Antworten mit Aufz\xE4hlungen und Abs\xE4tzen

5. **Sprache & Ton:**
   - Antworte auf Deutsch, freundlich, hilfsbereit und gut verst\xE4ndlich
   - Duze die B\xFCrger (wie in der App \xFCblich)
   - Sei ehrlich, wenn du etwas nicht wei\xDFt - das ist besser als falsche Informationen

=== STADT-INFORMATIONEN (VERIFIZIERTE DATEN - IMMER VERWENDEN!) ===

\u26A0\uFE0F WICHTIG: Diese Informationen sind OFFIZIELL und AKTUELL aus der Datenbank.
Verwende AUSSCHLIESSLICH diese Daten f\xFCr Fragen zu Rathaus, B\xFCrgermeister und \xD6ffnungszeiten!
Suche NICHT im Web nach diesen Informationen - die Daten hier sind die einzige Wahrheit!

- **Stadt:** ${cityName}
${tenantData.mayorName ? `- **B\xFCrgermeister:** ${tenantData.mayorName}` : ""}
- **Rathaus-Adresse:** ${tenantData.contactAddress || "Nicht verf\xFCgbar"}
- **Telefon:** ${tenantData.contactPhone || "Nicht verf\xFCgbar"}
- **E-Mail:** ${tenantData.contactEmail || "Nicht verf\xFCgbar"}
${tenantData.mayorOfficeHours ? `- **\xD6ffnungszeiten Rathaus:** ${tenantData.mayorOfficeHours}` : ""}
${tenantData.weatherLat && tenantData.weatherLon ? `- **Koordinaten:** ${tenantData.weatherLat}, ${tenantData.weatherLon}` : ""}

=== AKTUELLE DATEN ===
${contextData || "Keine aktuellen Daten verf\xFCgbar."}

Antworte jetzt auf die Frage des B\xFCrgers. Denke daran: Der lokale Bezug zu ${cityName} ist IMMER implizit!`;
}
function createGlobalSystemPrompt(tenantData) {
  const chatbotName = tenantData.chatbotName || "Stadtbot";
  const cityName = tenantData.name;
  return `Du bist "${chatbotName}", ein hilfreicher Assistent.

Beantworte die Frage pr\xE4zise und informativ:
- Nutze aktuelle Informationen aus dem Web
- Gib direkte, klare Antworten ohne unn\xF6tige Vorbemerkungen
- Sei objektiv und faktisch korrekt
- Antworte auf Deutsch in einem freundlichen, nat\xFCrlichen Ton
- Duze den Nutzer

Antworte jetzt auf die Frage.`;
}
async function callPerplexity(messages, searchDomains) {
  try {
    const body = {
      model: "sonar",
      messages,
      temperature: 0.2,
      max_tokens: 2e3
    };
    if (searchDomains) {
      body.search_domain_filter = Array.isArray(searchDomains) ? searchDomains : [searchDomains];
    }
    const response = await fetch(PERPLEXITY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Chat] Perplexity API error: ${response.status} - ${errorText}`);
      if (response.status === 429) {
        return "Entschuldigung, ich bin gerade \xFCberlastet. Bitte versuche es in ein paar Sekunden erneut.";
      } else if (response.status === 400) {
        return "Entschuldigung, ich konnte deine Frage nicht verarbeiten. Bitte formuliere sie anders.";
      } else {
        return "Entschuldigung, es gab einen Fehler bei der Verarbeitung deiner Anfrage. Bitte versuche es erneut.";
      }
    }
    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("[Chat] Invalid Perplexity response:", data);
      return "Entschuldigung, ich habe keine Antwort erhalten. Bitte versuche es erneut.";
    }
    return data.choices[0].message.content;
  } catch (error) {
    console.error("[Chat] Perplexity API error:", error);
    return "Entschuldigung, es gab einen technischen Fehler. Bitte versuche es in ein paar Sekunden erneut.";
  }
}
async function getChatResponse(tenantId, tenantName, tenantWebsite, chatbotName, message, sessionId) {
  try {
    const tenantData = await getTenantData(tenantId);
    if (!tenantData) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }
    let session = sessions.get(sessionId);
    if (!session) {
      session = {
        messages: [],
        lastActivity: Date.now()
      };
      sessions.set(sessionId, session);
    }
    session.lastActivity = Date.now();
    const questionType = getQuestionType(message, tenantName);
    if (questionType === "proximity") {
      session.messages = [];
    }
    session.messages.push({
      role: "user",
      content: message
    });
    if (session.messages.length > 6) {
      session.messages = session.messages.slice(-6);
    }
    console.log(`[Chat] Question type: ${questionType.toUpperCase()} - "${message}"`);
    let systemPrompt;
    let searchDomain;
    let response;
    if (questionType === "proximity") {
      const cityName = tenantData.name;
      const { searchNearbyPlaces: searchNearbyPlaces3, extractPlaceType: extractPlaceType2, mapPlaceType: mapPlaceType2, formatPlacesForChatbot: formatPlacesForChatbot2 } = await Promise.resolve().then(() => (init_google_places(), google_places_exports));
      const germanPlaceType = extractPlaceType2(message);
      if (!germanPlaceType) {
        const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(message)}+near+${encodeURIComponent(cityName)}`;
        response = `\u{1F4CD} Ich konnte den gesuchten Ort-Typ nicht genau bestimmen. Hier ist ein Google Maps Link:

\u{1F5FA}\uFE0F [Auf Google Maps suchen](${googleMapsUrl})`;
      } else {
        const latitude = parseFloat(tenantData.weatherLat || "51.9");
        const longitude = parseFloat(tenantData.weatherLon || "9.0");
        const placeType = mapPlaceType2(germanPlaceType);
        try {
          const places = await searchNearbyPlaces3(latitude, longitude, 8e3, placeType, 5);
          response = formatPlacesForChatbot2(places, cityName);
        } catch (error) {
          console.error("[Chat] Error searching places:", error);
          const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(germanPlaceType)}+near+${encodeURIComponent(cityName)}`;
          response = `\u{1F4CD} Entschuldigung, es gab einen Fehler bei der Suche. Hier ist ein Google Maps Link:

\u{1F5FA}\uFE0F [Auf Google Maps suchen](${googleMapsUrl})`;
        }
      }
    } else if (questionType === "local") {
      const { searchLocalDatabase: searchLocalDatabase2 } = await Promise.resolve().then(() => (init_local_search_service(), local_search_service_exports));
      const localResults = await searchLocalDatabase2(tenantId, message);
      if (localResults.length > 0) {
        console.log(`[Chat] Found ${localResults.length} local results in database`);
        let formattedResponse = "";
        if (localResults.length === 1) {
          formattedResponse = localResults[0].content;
        } else {
          formattedResponse = "Hier sind die Informationen, die ich gefunden habe:\n\n";
          localResults.forEach((result, index) => {
            formattedResponse += `**${result.title}**
${result.content}

`;
          });
        }
        response = formattedResponse;
      } else {
        console.log("[Chat] No local results found, using Perplexity");
        const contextData = await getLocalContext(tenantId);
        systemPrompt = createLocalSystemPrompt(tenantData, contextData);
        let searchDomains = [];
        if (tenantWebsite) {
          searchDomains.push(tenantWebsite.replace(/^https?:\/\//, "").replace(/\/$/, ""));
        } else if (tenantData.slug === "schieder") {
          searchDomains = [
            "www.schieder-schwalenberg.de",
            "freibad-schieder-schwalenberg.net",
            "tourismus.schieder-schwalenberg.de"
          ];
        }
        const messages = [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ];
        response = await callPerplexity(messages, searchDomains.length > 0 ? searchDomains : void 0);
      }
    } else {
      systemPrompt = createGlobalSystemPrompt(tenantData);
      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
        // Send only current message
      ];
      response = await callPerplexity(messages);
    }
    session.messages.push({
      role: "assistant",
      content: response
    });
    return response;
  } catch (error) {
    console.error("[Chat] Error generating response:", error);
    throw error;
  }
}

// server/routers/chat.ts
var chatRouter = router({
  /**
   * Chat-Endpoint: Beantwortet Bürger-Fragen mit Perplexity
   */
  sendMessage: publicProcedure.input(
    z8.object({
      message: z8.string().min(1, "Nachricht darf nicht leer sein"),
      sessionId: z8.string(),
      conversationHistory: z8.array(
        z8.object({
          role: z8.enum(["user", "assistant"]),
          content: z8.string()
        })
      ).optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const { message, sessionId } = input;
    const tenant = ctx.tenant;
    if (!tenant) {
      throw new Error("Tenant nicht gefunden");
    }
    try {
      const response = await getChatResponse(
        tenant.id,
        tenant.name,
        tenant.website || "https://www.schieder-schwalenberg.de",
        tenant.chatbotName || "Chatbot",
        message,
        sessionId
      );
      return {
        response
      };
    } catch (error) {
      console.error("[Chat] Fehler beim Verarbeiten der Nachricht:", error);
      throw new Error(`Fehler beim Verarbeiten der Nachricht: ${error.message}`);
    }
  })
});

// server/routers/directus.ts
import { z as z9 } from "zod";

// server/directus-service.ts
import axios2 from "axios";
var DIRECTUS_URL = process.env.DIRECTUS_URL || "http://localhost:8055";
var DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || "";
var DirectusService = class {
  api = axios2.create({
    baseURL: DIRECTUS_URL,
    headers: {
      "Authorization": `Bearer ${DIRECTUS_TOKEN}`,
      "Content-Type": "application/json"
    }
  });
  // News
  async getNews(tenantId) {
    try {
      const response = await this.api.get("/items/news", {
        params: {
          filter: {
            tenant_id: { _eq: tenantId },
            status: { _eq: "published" }
          },
          sort: "-published_at"
        }
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching news from Directus:", error);
      return [];
    }
  }
  async getNewsById(id, tenantId) {
    try {
      const response = await this.api.get(`/items/news/${id}`, {
        params: {
          filter: {
            tenant_id: { _eq: tenantId }
          }
        }
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching news by id from Directus:", error);
      return null;
    }
  }
  // Events
  async getEvents(tenantId) {
    try {
      const response = await this.api.get("/items/events", {
        params: {
          filter: {
            tenant_id: { _eq: tenantId },
            start_date: { _gte: (/* @__PURE__ */ new Date()).toISOString() }
          },
          sort: "start_date"
        }
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching events from Directus:", error);
      return [];
    }
  }
  async getEventById(id, tenantId) {
    try {
      const response = await this.api.get(`/items/events/${id}`, {
        params: {
          filter: {
            tenant_id: { _eq: tenantId }
          }
        }
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching event by id from Directus:", error);
      return null;
    }
  }
  // Departments
  async getDepartments(tenantId) {
    try {
      const response = await this.api.get("/items/departments", {
        params: {
          filter: {
            tenant_id: { _eq: tenantId }
          },
          sort: "name"
        }
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching departments from Directus:", error);
      return [];
    }
  }
  async getDepartmentById(id, tenantId) {
    try {
      const response = await this.api.get(`/items/departments/${id}`, {
        params: {
          filter: {
            tenant_id: { _eq: tenantId }
          }
        }
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching department by id from Directus:", error);
      return null;
    }
  }
  // Push Notifications
  async getPushNotifications(tenantId) {
    try {
      const response = await this.api.get("/items/push_notifications", {
        params: {
          filter: {
            tenant_id: { _eq: tenantId }
          },
          sort: "-scheduled_at"
        }
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching push notifications from Directus:", error);
      return [];
    }
  }
  async getPushNotificationById(id, tenantId) {
    try {
      const response = await this.api.get(`/items/push_notifications/${id}`, {
        params: {
          filter: {
            tenant_id: { _eq: tenantId }
          }
        }
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching push notification by id from Directus:", error);
      return null;
    }
  }
  // Push Notifications (for admin/scheduled sending)
  async getPendingPushNotifications() {
    try {
      const response = await this.api.get("/items/push_notifications", {
        params: {
          filter: {
            status: { _eq: "scheduled" },
            scheduled_at: { _lte: (/* @__PURE__ */ new Date()).toISOString() }
          }
        }
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching pending push notifications from Directus:", error);
      return [];
    }
  }
  async markPushNotificationAsSent(id) {
    try {
      await this.api.patch(`/items/push_notifications/${id}`, {
        status: "sent",
        sent_at: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error marking push notification as sent:", error);
    }
  }
  async markPushNotificationAsFailed(id) {
    try {
      await this.api.patch(`/items/push_notifications/${id}`, {
        status: "failed"
      });
    } catch (error) {
      console.error("Error marking push notification as failed:", error);
    }
  }
};
var directusService = new DirectusService();

// server/directus-db-service.ts
import { Pool as Pool3 } from "pg";
var DIRECTUS_DB_HOST = process.env.DIRECTUS_DB_HOST || "localhost";
var DIRECTUS_DB_PORT = parseInt(process.env.DIRECTUS_DB_PORT || "5432");
var DIRECTUS_DB_NAME = process.env.DIRECTUS_DB_NAME || "directus";
var DIRECTUS_DB_USER = process.env.DIRECTUS_DB_USER || "directus_user";
var DIRECTUS_DB_PASSWORD = process.env.DIRECTUS_DB_PASSWORD || "directus123";
var pool3 = new Pool3({
  host: DIRECTUS_DB_HOST,
  port: DIRECTUS_DB_PORT,
  database: DIRECTUS_DB_NAME,
  user: DIRECTUS_DB_USER,
  password: DIRECTUS_DB_PASSWORD
});
var DirectusDbService = class {
  async getPushNotifications(tenantId) {
    try {
      console.log("[DirectusDbService] getPushNotifications called with tenantId:", tenantId);
      const result = await pool3.query(
        `SELECT id, tenant_id, title, message, scheduled_at, sent_at, status 
         FROM push_notifications 
         WHERE tenant_id = $1 
         ORDER BY scheduled_at DESC NULLS LAST, id DESC`,
        [tenantId]
      );
      console.log("[DirectusDbService] Found", result.rows.length, "notifications for tenant", tenantId);
      return result.rows;
    } catch (error) {
      console.error("Error fetching push notifications from database:", error);
      return [];
    }
  }
  async getPushNotificationById(id, tenantId) {
    try {
      const result = await pool3.query(
        `SELECT id, tenant_id, title, message, scheduled_at, sent_at, status 
         FROM push_notifications 
         WHERE id = $1 AND tenant_id = $2`,
        [id, tenantId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error fetching push notification by id from database:", error);
      return null;
    }
  }
};
var directusDbService = new DirectusDbService();

// server/routers/directus.ts
var TENANT_SLUG_TO_ID = {
  "schieder": 1,
  "barntrup": 2
};
function getDirectusTenantId(tenantSlug) {
  const id = TENANT_SLUG_TO_ID[tenantSlug];
  if (!id) {
    throw new Error(`No Directus tenant_id mapping found for slug: ${tenantSlug}`);
  }
  return id;
}
var directusRouter = router({
  // News
  getNews: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.tenant) {
      throw new Error("Tenant not found");
    }
    const directusTenantId = getDirectusTenantId(ctx.tenant.slug);
    return directusService.getNews(directusTenantId);
  }),
  getNewsById: publicProcedure.input(z9.object({ id: z9.number() })).query(async ({ input, ctx }) => {
    if (!ctx.tenant) {
      throw new Error("Tenant not found");
    }
    const directusTenantId = getDirectusTenantId(ctx.tenant.slug);
    return directusService.getNewsById(input.id, directusTenantId);
  }),
  // Events
  getEvents: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.tenant) {
      throw new Error("Tenant not found");
    }
    const directusTenantId = getDirectusTenantId(ctx.tenant.slug);
    return directusService.getEvents(directusTenantId);
  }),
  getEventById: publicProcedure.input(z9.object({ id: z9.number() })).query(async ({ input, ctx }) => {
    if (!ctx.tenant) {
      throw new Error("Tenant not found");
    }
    const directusTenantId = getDirectusTenantId(ctx.tenant.slug);
    return directusService.getEventById(input.id, directusTenantId);
  }),
  // Departments
  getDepartments: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.tenant) {
      throw new Error("Tenant not found");
    }
    const directusTenantId = getDirectusTenantId(ctx.tenant.slug);
    return directusService.getDepartments(directusTenantId);
  }),
  getDepartmentById: publicProcedure.input(z9.object({ id: z9.number() })).query(async ({ input, ctx }) => {
    if (!ctx.tenant) {
      throw new Error("Tenant not found");
    }
    const directusTenantId = getDirectusTenantId(ctx.tenant.slug);
    return directusService.getDepartmentById(input.id, directusTenantId);
  }),
  // Push Notifications (using direct DB access)
  getPushNotifications: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.tenant) {
      throw new Error("Tenant not found");
    }
    const directusTenantId = getDirectusTenantId(ctx.tenant.slug);
    return directusDbService.getPushNotifications(directusTenantId);
  }),
  getPushNotificationById: publicProcedure.input(z9.object({ id: z9.number() })).query(async ({ input, ctx }) => {
    if (!ctx.tenant) {
      throw new Error("Tenant not found");
    }
    const directusTenantId = getDirectusTenantId(ctx.tenant.slug);
    return directusDbService.getPushNotificationById(input.id, directusTenantId);
  })
});

// server/routers-multi-tenant.ts
var appRouter = router({
  system: systemRouter,
  // Tenant Router (new)
  tenant: tenantRouter,
  // Auth Router (unchanged)
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  // Multi-Tenant Content Routers
  news: newsRouter,
  events: eventsRouter,
  departments: departmentsRouter,
  issueReports: issueReportsRouter,
  waste: wasteScheduleRouter,
  alerts: alertsRouter,
  mayor: mayorInfoRouter,
  pois: poisRouter,
  institutions: institutionsRouter,
  clubs: clubsRouter,
  council: councilMeetingsRouter,
  contact: contactMessagesRouter,
  pushNotifications: pushNotificationsRouter,
  notifications: userNotificationsRouter,
  // Chat Router (tenant-aware version)
  chat: chatRouter,
  // Directus CMS Router (tenant-aware)
  directus: directusRouter,
  // Old Chat Router (deprecated, keeping for backward compatibility)
  chatOld: router({
    send: publicProcedure.input(z10.object({
      message: z10.string(),
      sessionId: z10.string()
    })).mutation(async ({ input, ctx }) => {
      try {
        const { isLocalQuery: isLocalQuery2, searchLocalContext: searchLocalContext2, formatContextForPrompt: formatContextForPrompt2, createLocalSystemPrompt: createLocalSystemPrompt3, createGlobalSystemPrompt: createGlobalSystemPrompt3, generateDeepLinks: generateDeepLinks2 } = await Promise.resolve().then(() => (init_chat_service(), chat_service_exports));
        const chatbotName = ctx.tenant.chatbotName || "Chatbot";
        const systemPromptOverride = ctx.tenant.chatbotSystemPrompt;
        const isLocal = isLocalQuery2(input.message);
        let systemPrompt;
        let webSearchResults = "";
        const isProximity = isProximityQuery(input.message);
        let placesResults = "";
        if (isProximity) {
          console.log("[Chat] Proximity search triggered for:", input.message);
          const placesData = await searchNearbyPlaces(input.message);
          if (placesData) {
            placesResults = formatPlacesForPrompt(placesData);
            console.log("[Chat] Places results:", placesResults.substring(0, 200));
          }
        }
        const needsWebSearch = requiresWebSearch(input.message);
        if (needsWebSearch) {
          console.log("[Chat] Web search triggered for:", input.message);
          webSearchResults = await performPerplexitySearch(input.message);
          if (!webSearchResults) {
            console.log("[Chat] Perplexity returned no results, trying Google scraping...");
            webSearchResults = await performImprovedWebSearch(input.message);
          }
          if (!webSearchResults) {
            console.log("[Chat] Google scraping returned no results, trying DuckDuckGo...");
            webSearchResults = await performWebSearch(input.message);
          }
          console.log("[Chat] Web search results:", webSearchResults.substring(0, 200));
        }
        if (isLocal) {
          const localContext = await searchLocalContext2(input.message, ctx.tenant.id);
          const formattedContext = formatContextForPrompt2(localContext);
          let contextWithExtras = formattedContext;
          if (placesResults) {
            contextWithExtras += "\n\n" + placesResults;
          }
          if (webSearchResults) {
            contextWithExtras += "\n\n**AKTUELLE INFORMATIONEN AUS DEM INTERNET:**\n" + webSearchResults;
          }
          const contextWithWebSearch = contextWithExtras;
          systemPrompt = systemPromptOverride || createLocalSystemPrompt3(chatbotName, ctx.tenant.name);
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Kontext:
${contextWithWebSearch}

Frage: ${input.message}` }
            ],
            temperature: 0.7
          });
          const deepLinks = generateDeepLinks2(response, localContext);
          return {
            response,
            deepLinks,
            isLocal: true
          };
        } else {
          let contextWithWebSearch = "";
          if (placesResults) {
            contextWithWebSearch += placesResults + "\n\n";
          }
          if (webSearchResults) {
            contextWithWebSearch += "**AKTUELLE INFORMATIONEN AUS DEM INTERNET:**\n" + webSearchResults;
          }
          systemPrompt = systemPromptOverride || createGlobalSystemPrompt3(chatbotName);
          const userMessage = contextWithWebSearch ? `Kontext:
${contextWithWebSearch}

Frage: ${input.message}` : input.message;
          const response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage }
            ],
            temperature: 0.8
          });
          return {
            response,
            deepLinks: [],
            isLocal: false
          };
        }
      } catch (error) {
        console.error("[Chat] Error:", error);
        throw new Error("Fehler beim Verarbeiten der Nachricht");
      }
    })
  }),
  // Weather Router (unchanged, uses tenant coordinates from context)
  weather: router({
    current: publicProcedure.input(z10.object({
      latitude: z10.number().optional(),
      longitude: z10.number().optional()
    }).optional()).query(async ({ input, ctx }) => {
      const lat = input?.latitude || parseFloat(ctx.tenant.weatherLat || "51.8667");
      const lon = input?.longitude || parseFloat(ctx.tenant.weatherLon || "9.1167");
      return getCurrentWeather(lat, lon);
    }),
    forecast: publicProcedure.input(z10.object({
      latitude: z10.number().optional(),
      longitude: z10.number().optional(),
      days: z10.number().default(7)
    }).optional()).query(async ({ input, ctx }) => {
      const lat = input?.latitude || parseFloat(ctx.tenant.weatherLat || "51.8667");
      const lon = input?.longitude || parseFloat(ctx.tenant.weatherLon || "9.1167");
      const days = input?.days || 7;
      return getWeatherForecast(lat, lon, days);
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  const tenant = opts.req.tenant;
  if (!tenant) {
    throw new Error("Tenant not found in request context. Make sure tenant-middleware is registered before tRPC.");
  }
  return {
    req: opts.req,
    res: opts.res,
    user,
    tenant
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid as nanoid7 } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
var plugins = [react(), tailwindcss(), jsxLocPlugin()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  console.log("[Vite] Middlewares registered");
  app.use((req, res, next) => {
    console.log("[Express] Incoming request:", req.method, req.url);
    next();
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    console.log("[Vite] Handling request:", url);
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid7()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = path2.join(import.meta.dirname, "public");
  console.log("[Static] import.meta.dirname:", import.meta.dirname);
  console.log("[Static] Resolved distPath:", distPath);
  console.log("[Static] Serving from:", distPath);
  console.log("[Static] Directory exists:", fs.existsSync(distPath));
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    const indexPath = path2.join(distPath, "index.html");
    console.log("[Static] Sending index.html from:", indexPath);
    res.sendFile(indexPath);
  });
}

// server/tenant-middleware.ts
function extractTenantSlug(req) {
  const host = req.get("host") || "";
  const skipSubdomainHosts = ["localhost", "manusvm.computer", "127.0.0.1", "onrender.com"];
  const shouldSkipSubdomain = skipSubdomainHosts.some((skip) => host.includes(skip));
  if (!shouldSkipSubdomain) {
    const subdomain = host.split(".")[0];
    if (subdomain && subdomain !== "www" && !subdomain.match(/^\d/)) {
      console.log("[Tenant] Extracted from subdomain:", subdomain);
      return subdomain;
    }
  }
  const queryTenant = req.query.tenant;
  if (queryTenant) {
    console.log("[Tenant] Extracted from query:", queryTenant);
    return queryTenant;
  }
  const headerTenant = req.get("X-Tenant");
  if (headerTenant) {
    console.log("[Tenant] Extracted from header:", headerTenant);
    return headerTenant;
  }
  console.log("[Tenant] Using default: hornbadmeinberg");
  return "hornbadmeinberg";
}
async function loadTenant(slug) {
  console.log("[Tenant] Loading tenant from DB with slug:", slug);
  try {
    const response = await fetch("http://localhost:3000/api/debug/tenants");
    const data = await response.json();
    console.log("[Tenant] Debug endpoint returned", data.count, "tenants");
    const tenant = data.tenants?.find((t2) => t2.subdomain === slug);
    if (!tenant) {
      console.error("[Tenant] No tenant found with slug:", slug);
      return null;
    }
    console.log("[Tenant] Loaded tenant:", tenant.name);
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.subdomain,
      primaryColor: tenant.primary_color || "#0066CC",
      secondaryColor: tenant.secondary_color || "#00A86B",
      logoUrl: tenant.logo_url,
      heroImageUrl: tenant.hero_image_url,
      contactEmail: tenant.contact_email,
      contactPhone: tenant.contact_phone,
      contactAddress: tenant.address,
      weatherLat: tenant.latitude,
      weatherLon: tenant.longitude,
      weatherCity: tenant.subdomain,
      chatbotName: "Chatbot",
      chatbotSystemPrompt: null,
      enabledFeatures: tenant.features,
      isActive: true,
      mayorName: tenant.mayor,
      mayorEmail: null,
      mayorPhone: null,
      mayorAddress: null,
      mayorOfficeHours: null
    };
  } catch (error) {
    console.error("[Tenant] Error loading tenant:", error);
    return null;
  }
}
async function tenantMiddleware(req, res, next) {
  const slug = extractTenantSlug(req);
  if (!slug) {
    return res.status(400).json({ error: "Tenant not specified" });
  }
  const tenant = await loadTenant(slug);
  if (!tenant) {
    return res.status(404).json({ error: "Tenant not found" });
  }
  req.tenant = tenant;
  next();
}

// server/routes/news.ts
import { Router } from "express";
import { sql as sql2 } from "drizzle-orm";
var router2 = Router();
router2.get("/", async (req, res) => {
  try {
    const tenantSlug = req.query.tenant;
    if (!tenantSlug) {
      return res.status(400).json({ error: "Tenant parameter is required" });
    }
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const result = await db.execute(sql2`
      SELECT id, title, teaser as description, "publishedAt" as published_date, 
             "sourceUrl" as source_url, category, "createdAt" as scraped_at, "imageUrl" as image_url
      FROM news
      WHERE "tenantId" = ${tenantSlug}
      ORDER BY "publishedAt" DESC
      LIMIT 20
    `);
    res.json({
      articles: result.rows
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: "Failed to fetch news articles" });
  }
});
var news_default = router2;

// server/routes/events.ts
import { Router as Router2 } from "express";
import { sql as sql3 } from "drizzle-orm";
var router3 = Router2();
router3.get("/", async (req, res) => {
  try {
    const tenantSlug = req.query.tenant;
    if (!tenantSlug) {
      return res.status(400).json({ error: "Tenant parameter is required" });
    }
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const result = await db.execute(sql3`
      SELECT id, title, description, "startDate" as start_date, "endDate" as end_date, 
             location, "imageUrl" as image_url, "ticketLink" as ticket_link, category, "createdAt" as scraped_at
      FROM events
      WHERE "tenantId" = ${tenantSlug}
      ORDER BY "startDate" ASC
      LIMIT 50
    `);
    res.json({
      events: result.rows
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});
var events_default = router3;

// server/routes/departments.ts
import { Router as Router3 } from "express";
import { sql as sql4 } from "drizzle-orm";
var router4 = Router3();
router4.get("/", async (req, res) => {
  try {
    const tenantSlug = req.query.tenant;
    if (!tenantSlug) {
      return res.status(400).json({ error: "Tenant parameter is required" });
    }
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Database not available" });
    }
    const result = await db.execute(sql4`
      SELECT id, name, description, phone, email, "openingHours" as opening_hours
      FROM departments
      WHERE "tenantId" = ${tenantSlug}
      ORDER BY name ASC
    `);
    res.json({ departments: result.rows });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});
var departments_default = router4;

// server/routes/attractions.ts
import { Router as Router4 } from "express";
import { Pool as Pool4 } from "pg";
var router5 = Router4();
var pool4 = new Pool4({
  host: process.env.DIRECTUS_DB_HOST || "localhost",
  port: parseInt(process.env.DIRECTUS_DB_PORT || "5432"),
  database: process.env.DIRECTUS_DB_NAME || "buergerapp",
  user: process.env.DIRECTUS_DB_USER || "buergerapp_user",
  password: process.env.DIRECTUS_DB_PASSWORD || "buergerapp_dev_2025"
});
router5.get("/", async (req, res) => {
  try {
    const tenantSlug = req.query.tenant;
    if (!tenantSlug) {
      return res.status(400).json({ error: "Tenant parameter is required" });
    }
    const tenantResult = await pool4.query(
      "SELECT id FROM tenants WHERE slug = $1 LIMIT 1",
      [tenantSlug]
    );
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    const tenantId = tenantResult.rows[0].id;
    const attractionsResult = await pool4.query(
      `SELECT id, name, description, category, main_category, image_url, address, more_info_url, display_order
       FROM attractions
       WHERE tenant_id = $1
       ORDER BY main_category ASC, display_order ASC, name ASC`,
      [tenantId]
    );
    const attractionsByMainCategory = {};
    attractionsResult.rows.forEach((attraction) => {
      const mainCategory = attraction.main_category || "Sonstiges";
      if (!attractionsByMainCategory[mainCategory]) {
        attractionsByMainCategory[mainCategory] = [];
      }
      attractionsByMainCategory[mainCategory].push(attraction);
    });
    res.json({
      attractions: attractionsResult.rows,
      attractionsByMainCategory,
      totalCount: attractionsResult.rows.length
    });
  } catch (error) {
    console.error("Error fetching attractions:", error);
    res.status(500).json({ error: "Failed to fetch attractions" });
  }
});
var attractions_default = router5;

// server/routes/waste.ts
import { Router as Router5 } from "express";
import pkg from "pg";
var { Pool: Pool5 } = pkg;
var router6 = Router5();
var pool5 = new Pool5({
  connectionString: process.env.DATABASE_URL || "postgresql://buergerapp_user:buergerapp_dev_2025@localhost:5432/buergerapp"
});
router6.get("/areas", async (req, res) => {
  try {
    const { tenant } = req.query;
    if (!tenant) {
      return res.status(400).json({ error: "Tenant parameter required" });
    }
    const tenantResult = await pool5.query(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      [tenant]
    );
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    const tenantId = tenantResult.rows[0].id;
    const areasResult = await pool5.query(
      `SELECT id, name FROM waste_areas WHERE tenant_id = $1 ORDER BY name`,
      [tenantId]
    );
    res.json(areasResult.rows);
  } catch (error) {
    console.error("Error fetching waste areas:", error);
    res.status(500).json({ error: "Failed to fetch waste areas" });
  }
});
router6.get("/schedule", async (req, res) => {
  try {
    const { tenant, area, startDate, endDate } = req.query;
    if (!tenant || !area) {
      return res.status(400).json({ error: "Tenant and area parameters required" });
    }
    const tenantResult = await pool5.query(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      [tenant]
    );
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    const tenantId = tenantResult.rows[0].id;
    const areaResult = await pool5.query(
      `SELECT id FROM waste_areas WHERE tenant_id = $1 AND name = $2 LIMIT 1`,
      [tenantId, area]
    );
    if (areaResult.rows.length === 0) {
      return res.status(404).json({ error: "Area not found" });
    }
    const areaId = areaResult.rows[0].id;
    let query = `
      SELECT 
        wc.collection_date,
        wt.name as waste_type,
        wt.color,
        wt.icon,
        wt.description
      FROM waste_collections wc
      JOIN waste_types wt ON wc.waste_type_id = wt.id
      WHERE wc.tenant_id = $1 AND wc.area_id = $2
    `;
    const params = [tenantId, areaId];
    if (startDate) {
      params.push(startDate);
      query += ` AND wc.collection_date >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      query += ` AND wc.collection_date <= $${params.length}`;
    }
    query += ` ORDER BY wc.collection_date, wt.name`;
    const scheduleResult = await pool5.query(query, params);
    const groupedByDate = {};
    for (const row of scheduleResult.rows) {
      const date = row.collection_date.toISOString().split("T")[0];
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push({
        wasteType: row.waste_type,
        color: row.color,
        icon: row.icon,
        description: row.description
      });
    }
    res.json(groupedByDate);
  } catch (error) {
    console.error("Error fetching waste schedule:", error);
    res.status(500).json({ error: "Failed to fetch waste schedule" });
  }
});
router6.get("/next", async (req, res) => {
  try {
    const { tenant, area } = req.query;
    if (!tenant || !area) {
      return res.status(400).json({ error: "Tenant and area parameters required" });
    }
    const tenantResult = await pool5.query(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      [tenant]
    );
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    const tenantId = tenantResult.rows[0].id;
    const areaResult = await pool5.query(
      `SELECT id FROM waste_areas WHERE tenant_id = $1 AND name = $2 LIMIT 1`,
      [tenantId, area]
    );
    if (areaResult.rows.length === 0) {
      return res.status(404).json({ error: "Area not found" });
    }
    const areaId = areaResult.rows[0].id;
    const today = /* @__PURE__ */ new Date();
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - today.getDay() + 1);
    startOfThisWeek.setHours(0, 0, 0, 0);
    const endOfThisWeek = new Date(startOfThisWeek);
    endOfThisWeek.setDate(startOfThisWeek.getDate() + 6);
    endOfThisWeek.setHours(23, 59, 59, 999);
    const startOfNextWeek = new Date(endOfThisWeek);
    startOfNextWeek.setDate(endOfThisWeek.getDate() + 1);
    startOfNextWeek.setHours(0, 0, 0, 0);
    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
    endOfNextWeek.setHours(23, 59, 59, 999);
    const thisWeekResult = await pool5.query(
      `SELECT 
        wc.collection_date,
        wt.name as waste_type,
        wt.color,
        wt.icon,
        wt.description
      FROM waste_collections wc
      JOIN waste_types wt ON wc.waste_type_id = wt.id
      WHERE wc.tenant_id = $1 
        AND wc.area_id = $2
        AND wc.collection_date >= $3
        AND wc.collection_date <= $4
      ORDER BY wc.collection_date, wt.name`,
      [tenantId, areaId, startOfThisWeek.toISOString().split("T")[0], endOfThisWeek.toISOString().split("T")[0]]
    );
    const nextWeekResult = await pool5.query(
      `SELECT 
        wc.collection_date,
        wt.name as waste_type,
        wt.color,
        wt.icon,
        wt.description
      FROM waste_collections wc
      JOIN waste_types wt ON wc.waste_type_id = wt.id
      WHERE wc.tenant_id = $1 
        AND wc.area_id = $2
        AND wc.collection_date >= $3
        AND wc.collection_date <= $4
      ORDER BY wc.collection_date, wt.name`,
      [tenantId, areaId, startOfNextWeek.toISOString().split("T")[0], endOfNextWeek.toISOString().split("T")[0]]
    );
    const groupByDate = (rows) => {
      const grouped = {};
      for (const row of rows) {
        const date = row.collection_date.toISOString().split("T")[0];
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push({
          wasteType: row.waste_type,
          color: row.color,
          icon: row.icon,
          description: row.description
        });
      }
      return grouped;
    };
    res.json({
      thisWeek: groupByDate(thisWeekResult.rows),
      nextWeek: groupByDate(nextWeekResult.rows)
    });
  } catch (error) {
    console.error("Error fetching next collections:", error);
    res.status(500).json({ error: "Failed to fetch next collections" });
  }
});
router6.post("/preferences", async (req, res) => {
  try {
    const { tenant, userId, areaName, notificationEnabled, notificationTime } = req.body;
    if (!tenant || !userId || !areaName) {
      return res.status(400).json({ error: "Tenant, userId, and areaName required" });
    }
    const tenantResult = await pool5.query(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      [tenant]
    );
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    const tenantId = tenantResult.rows[0].id;
    const areaResult = await pool5.query(
      `SELECT id FROM waste_areas WHERE tenant_id = $1 AND name = $2 LIMIT 1`,
      [tenantId, areaName]
    );
    if (areaResult.rows.length === 0) {
      return res.status(404).json({ error: "Area not found" });
    }
    const areaId = areaResult.rows[0].id;
    const result = await pool5.query(
      `INSERT INTO user_waste_preferences (tenant_id, user_id, area_id, notification_enabled, notification_time, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (tenant_id, user_id)
       DO UPDATE SET 
         area_id = EXCLUDED.area_id,
         notification_enabled = EXCLUDED.notification_enabled,
         notification_time = EXCLUDED.notification_time,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [tenantId, userId, areaId, notificationEnabled || false, notificationTime || "18:00:00"]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error saving waste preferences:", error);
    res.status(500).json({ error: "Failed to save preferences" });
  }
});
router6.get("/preferences", async (req, res) => {
  try {
    const { tenant, userId } = req.query;
    if (!tenant || !userId) {
      return res.status(400).json({ error: "Tenant and userId parameters required" });
    }
    const tenantResult = await pool5.query(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      [tenant]
    );
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    const tenantId = tenantResult.rows[0].id;
    const result = await pool5.query(
      `SELECT 
        uwp.*,
        wa.name as area_name
      FROM user_waste_preferences uwp
      JOIN waste_areas wa ON uwp.area_id = wa.id
      WHERE uwp.tenant_id = $1 AND uwp.user_id = $2
      LIMIT 1`,
      [tenantId, userId]
    );
    if (result.rows.length === 0) {
      return res.json(null);
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching waste preferences:", error);
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
});
var waste_default = router6;

// server/routes/clubs.ts
import { Router as Router6 } from "express";
import pg3 from "pg";
var { Pool: Pool6 } = pg3;
var router7 = Router6();
var pool6 = new Pool6({
  host: "127.0.0.1",
  port: 5432,
  database: "buergerapp",
  user: "buergerapp_user",
  password: "buergerapp_dev_2025"
});
router7.get("/", async (req, res) => {
  const { tenant } = req.query;
  if (!tenant) {
    return res.status(400).json({ error: "Tenant parameter is required" });
  }
  try {
    const tenantResult = await pool6.query(
      "SELECT id FROM tenants WHERE slug = $1",
      [tenant]
    );
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    const tenantId = tenantResult.rows[0].id;
    const result = await pool6.query(
      `SELECT 
        cc.id as category_id,
        cc.name as category_name,
        cc.icon as category_icon,
        cc.color as category_color,
        cc.display_order,
        json_agg(
          json_build_object(
            'id', c.id,
            'name', c.name,
            'contactPerson', c.contact_person,
            'address', c.address,
            'phone', c.phone,
            'fax', c.fax,
            'email', c.email,
            'website', c.website
          ) ORDER BY c.name
        ) FILTER (WHERE c.id IS NOT NULL) as clubs
      FROM club_categories cc
      LEFT JOIN clubs c ON c.category_id = cc.id AND c.tenant_id = $1
      WHERE cc.tenant_id = $1
      GROUP BY cc.id, cc.name, cc.icon, cc.color, cc.display_order
      ORDER BY cc.display_order, cc.name`,
      [tenantId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching clubs:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
var clubs_default = router7;

// server/routes/education.ts
import { Router as Router7 } from "express";
import pg4 from "pg";
var { Pool: Pool7 } = pg4;
var router8 = Router7();
var pool7 = new Pool7({
  host: "127.0.0.1",
  port: 5432,
  database: "buergerapp",
  user: "buergerapp_user",
  password: "buergerapp_dev_2025"
});
router8.get("/", async (req, res) => {
  try {
    const { tenant } = req.query;
    if (!tenant) {
      return res.status(400).json({ error: "Tenant parameter is required" });
    }
    const tenantResult = await pool7.query(
      "SELECT id FROM tenants WHERE slug = $1",
      [tenant]
    );
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    const tenantId = tenantResult.rows[0].id;
    const result = await pool7.query(
      `SELECT * FROM education_institutions 
       WHERE tenant_id = $1 
       ORDER BY display_order, name`,
      [tenantId]
    );
    const institutionsByCategory = {};
    result.rows.forEach((institution) => {
      if (!institutionsByCategory[institution.category]) {
        institutionsByCategory[institution.category] = [];
      }
      institutionsByCategory[institution.category].push(institution);
    });
    res.json({
      institutions: result.rows,
      institutionsByCategory,
      totalCount: result.rows.length
    });
  } catch (error) {
    console.error("Error fetching education institutions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
var education_default = router8;

// server/routes/dog-registration.ts
import { Router as Router8 } from "express";
import { Pool as Pool9 } from "pg";

// server/services/dog-registration-email.ts
import { Pool as Pool8 } from "pg";
var pool8 = new Pool8({
  connectionString: process.env.DATABASE_URL || "postgresql://buergerapp_user:buergerapp_dev_2025@localhost:5432/buergerapp"
});
async function sendEmailToTownHall(registrationId) {
  try {
    const result = await pool8.query(
      "SELECT * FROM dog_registrations WHERE id = $1",
      [registrationId]
    );
    if (result.rows.length === 0) {
      throw new Error(`Registration ${registrationId} not found`);
    }
    const reg = result.rows[0];
    const subject = `Hundesteuer-${reg.registration_type === "anmelden" ? "Anmeldung" : "Abmeldung"} - ${reg.owner_last_name}`;
    const emailBody = `
Sehr geehrte Damen und Herren,

hiermit ${reg.registration_type === "anmelden" ? "melde ich meinen Hund zur Hundesteuer an" : "melde ich meinen Hund von der Hundesteuer ab"}:

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

ANGABEN ZUM HALTER:
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

Name:                ${reg.owner_first_name} ${reg.owner_last_name}
Stra\xDFe:              ${reg.owner_street} ${reg.owner_house_number}
PLZ/Ort:             ${reg.owner_zip} ${reg.owner_city}
E-Mail:              ${reg.owner_email}
Telefon:             ${reg.owner_phone || "Nicht angegeben"}

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

ANGABEN ZUM HUND:
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

Name:                ${reg.dog_name}
Rasse/Mix:           ${reg.dog_breed}
Geschlecht:          ${reg.dog_gender}
Geburtsdatum:        ${new Date(reg.dog_birth_date).toLocaleDateString("de-DE")}
Chip-Nummer:         ${reg.dog_chip_number || "Nicht angegeben"}
Haltungsbeginn:      ${new Date(reg.dog_holding_start_date).toLocaleDateString("de-DE")}
Zuzug:               ${reg.dog_from_other_municipality ? "Ja" : "Nein"}

${reg.registration_type === "anmelden" ? `
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

SEPA-LASTSCHRIFTMANDAT:
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

IBAN:                ${reg.sepa_iban}
Kontoinhaber:in:     ${reg.sepa_account_holder}
` : ""}

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

WEITERE INFORMATIONEN:
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

Antrags-ID:          ${reg.id}
Eingereicht am:      ${new Date(reg.created_at).toLocaleString("de-DE")}
Status:              ${reg.status}
Datenschutz:         ${reg.privacy_accepted ? "Akzeptiert" : "Nicht akzeptiert"}

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

Mit freundlichen Gr\xFC\xDFen
${reg.owner_first_name} ${reg.owner_last_name}

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

Diese E-Mail wurde automatisch \xFCber die B\xFCrger-App Schieder-Schwalenberg generiert.
`;
    console.log("\n" + "=".repeat(80));
    console.log("\u{1F4E7} E-MAIL AN RATHAUS");
    console.log("=".repeat(80));
    console.log(`Von: noreply@schieder-schwalenberg.de`);
    console.log(`An: rathaus@schieder-schwalenberg.de`);
    console.log(`Reply-To: ${reg.owner_email}`);
    console.log(`Betreff: ${subject}`);
    console.log("=".repeat(80));
    console.log(emailBody);
    console.log("=".repeat(80) + "\n");
  } catch (error) {
    console.error("Error preparing email to town hall:", error);
    throw error;
  }
}
async function sendConfirmationEmailToCitizen(registrationId) {
  try {
    const result = await pool8.query(
      "SELECT * FROM dog_registrations WHERE id = $1",
      [registrationId]
    );
    if (result.rows.length === 0) {
      throw new Error(`Registration ${registrationId} not found`);
    }
    const reg = result.rows[0];
    const subject = `Best\xE4tigung: Hundesteuer-${reg.registration_type === "anmelden" ? "Anmeldung" : "Abmeldung"}`;
    const emailBody = `
Sehr geehrte/r ${reg.owner_first_name} ${reg.owner_last_name},

vielen Dank f\xFCr Ihre ${reg.registration_type === "anmelden" ? "Anmeldung" : "Abmeldung"} zur Hundesteuer.

Wir haben Ihre Daten erfolgreich erhalten und werden diese zeitnah bearbeiten.

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

IHRE ANGABEN:
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

Halter:              ${reg.owner_first_name} ${reg.owner_last_name}
Adresse:             ${reg.owner_street} ${reg.owner_house_number}, ${reg.owner_zip} ${reg.owner_city}

Hund:                ${reg.dog_name}
Rasse:               ${reg.dog_breed}
${reg.registration_type === "anmelden" ? `Haltungsbeginn:     ${new Date(reg.dog_holding_start_date).toLocaleDateString("de-DE")}` : `Abmeldedatum:       ${new Date(reg.dog_holding_start_date).toLocaleDateString("de-DE")}`}

Antrags-ID:          ${reg.id}
Eingereicht am:      ${new Date(reg.created_at).toLocaleString("de-DE")}

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

${reg.registration_type === "anmelden" ? `
WICHTIGE HINWEISE:

\u2022 Die Hundesteuer betr\xE4gt 60 \u20AC pro Jahr (1. Hund) bzw. 90 \u20AC f\xFCr jeden weiteren Hund
\u2022 Die Zahlung erfolgt automatisch per SEPA-Lastschrift
\u2022 Sie erhalten eine separate Mitteilung mit der Mandatsreferenz
\u2022 Bei Fragen wenden Sie sich bitte an: 05282 / 601-0
` : `
WICHTIGE HINWEISE:

\u2022 Ihre Abmeldung wird zeitnah bearbeitet
\u2022 Bei Fragen wenden Sie sich bitte an: 05282 / 601-0
`}

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

Mit freundlichen Gr\xFC\xDFen
Stadt Schieder-Schwalenberg

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501

Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.
Bei Fragen kontaktieren Sie uns unter: rathaus@schieder-schwalenberg.de
`;
    console.log("\n" + "=".repeat(80));
    console.log("\u{1F4E7} BEST\xC4TIGUNGS-E-MAIL AN B\xDCRGER");
    console.log("=".repeat(80));
    console.log(`Von: noreply@schieder-schwalenberg.de`);
    console.log(`An: ${reg.owner_email}`);
    console.log(`Betreff: ${subject}`);
    console.log("=".repeat(80));
    console.log(emailBody);
    console.log("=".repeat(80) + "\n");
  } catch (error) {
    console.error("Error preparing confirmation email:", error);
    throw error;
  }
}

// server/routes/dog-registration.ts
var router9 = Router8();
var pool9 = new Pool9({
  connectionString: process.env.DATABASE_URL || "postgresql://buergerapp_user:buergerapp_dev_2025@localhost:5432/buergerapp"
});
router9.post("/", async (req, res) => {
  try {
    const {
      tenant,
      ownerFirstName,
      ownerLastName,
      ownerStreet,
      ownerHouseNumber,
      ownerZip,
      ownerCity,
      ownerEmail,
      ownerPhone,
      dogName,
      dogBreed,
      dogGender,
      dogBirthDate,
      dogChipNumber,
      dogHoldingStartDate,
      dogFromOtherMunicipality,
      sepaIban,
      sepaAccountHolder,
      privacyAccepted,
      registrationType
    } = req.body;
    if (!tenant || !ownerFirstName || !ownerLastName || !ownerStreet || !ownerHouseNumber || !ownerZip || !ownerCity || !ownerEmail || !dogName || !dogBreed || !dogGender || !dogBirthDate || !dogHoldingStartDate || !sepaIban || !sepaAccountHolder || !privacyAccepted) {
      return res.status(400).json({ error: "Pflichtfelder fehlen" });
    }
    const tenantResult = await pool9.query(
      "SELECT id FROM tenants WHERE slug = $1 LIMIT 1",
      [tenant]
    );
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: "Tenant nicht gefunden" });
    }
    const tenantId = tenantResult.rows[0].id;
    const result = await pool9.query(
      `INSERT INTO dog_registrations (
        tenant_id, owner_first_name, owner_last_name, owner_street, owner_house_number,
        owner_zip, owner_city, owner_email, owner_phone,
        dog_name, dog_breed, dog_gender, dog_birth_date, dog_chip_number, 
        dog_holding_start_date, dog_from_other_municipality,
        sepa_iban, sepa_account_holder, privacy_accepted, registration_type, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING id`,
      [
        tenantId,
        ownerFirstName,
        ownerLastName,
        ownerStreet,
        ownerHouseNumber,
        ownerZip,
        ownerCity,
        ownerEmail,
        ownerPhone,
        dogName,
        dogBreed,
        dogGender,
        dogBirthDate,
        dogChipNumber,
        dogHoldingStartDate,
        dogFromOtherMunicipality || false,
        sepaIban,
        sepaAccountHolder,
        privacyAccepted,
        registrationType || "anmelden",
        "pending"
      ]
    );
    const registrationId = result.rows[0].id;
    console.log(`\u2705 Dog registration created: ID ${registrationId} for tenant ${tenant}`);
    try {
      await sendEmailToTownHall(registrationId);
      await sendConfirmationEmailToCitizen(registrationId);
    } catch (emailError) {
      console.error("Error sending emails:", emailError);
    }
    res.json({
      success: true,
      registrationId,
      message: "Hundeanmeldung erfolgreich eingereicht"
    });
  } catch (error) {
    console.error("Error creating dog registration:", error);
    res.status(500).json({ error: "Fehler beim Speichern der Hundeanmeldung" });
  }
});
router9.get("/", async (req, res) => {
  try {
    const { tenant, status } = req.query;
    if (!tenant) {
      return res.status(400).json({ error: "Tenant-Parameter fehlt" });
    }
    const tenantResult = await pool9.query(
      "SELECT id FROM tenants WHERE slug = $1 LIMIT 1",
      [tenant]
    );
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: "Tenant nicht gefunden" });
    }
    const tenantId = tenantResult.rows[0].id;
    let query = `
      SELECT * FROM dog_registrations 
      WHERE tenant_id = $1
    `;
    const params = [tenantId];
    if (status) {
      query += " AND status = $2";
      params.push(status);
    }
    query += " ORDER BY created_at DESC";
    const result = await pool9.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching dog registrations:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Hundeanmeldungen" });
  }
});
router9.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { tenant } = req.query;
    if (!tenant) {
      return res.status(400).json({ error: "Tenant-Parameter fehlt" });
    }
    const tenantResult = await pool9.query(
      "SELECT id FROM tenants WHERE slug = $1 LIMIT 1",
      [tenant]
    );
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: "Tenant nicht gefunden" });
    }
    const tenantId = tenantResult.rows[0].id;
    const result = await pool9.query(
      "SELECT * FROM dog_registrations WHERE id = $1 AND tenant_id = $2",
      [id, tenantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Hundeanmeldung nicht gefunden" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching dog registration:", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Hundeanmeldung" });
  }
});
var dog_registration_default = router9;

// server/routes/contact-request.ts
import { Router as Router9 } from "express";
import pg5 from "pg";

// server/services/contact-request-email.ts
async function sendContactRequestEmail(data) {
  const {
    requestId,
    tenantName,
    firstName,
    lastName,
    email,
    phone,
    subject,
    message,
    category
  } = data;
  const townHallEmail = {
    to: process.env.TOWN_HALL_EMAIL || "rathaus@schieder-schwalenberg.de",
    from: process.env.SMTP_FROM || "noreply@schieder-schwalenberg.de",
    replyTo: email,
    subject: `Neue Kontaktanfrage: ${subject}`,
    text: `
Neue Kontaktanfrage \xFCber die B\xFCrger-App

ANTRAGS-ID: ${requestId}

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

KONTAKTDATEN:

Name:           ${firstName} ${lastName}
E-Mail:         ${email}
Telefon:        ${phone || "Nicht angegeben"}

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

ANLIEGEN:

Betreff:        ${subject}
${category ? `Kategorie:      ${category}
` : ""}
Nachricht:

${message}

\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550

Diese Anfrage wurde \xFCber die digitale Stadtverwaltung von ${tenantName} eingereicht.

Antworten Sie direkt auf diese E-Mail, um den B\xFCrger zu kontaktieren.
    `.trim()
  };
  if (!process.env.SMTP_HOST) {
    console.log("\n" + "=".repeat(80));
    console.log("\u{1F4E7} CONTACT REQUEST EMAIL (Town Hall)");
    console.log("=".repeat(80));
    console.log(`To: ${townHallEmail.to}`);
    console.log(`From: ${townHallEmail.from}`);
    console.log(`Reply-To: ${townHallEmail.replyTo}`);
    console.log(`Subject: ${townHallEmail.subject}`);
    console.log("-".repeat(80));
    console.log(townHallEmail.text);
    console.log("=".repeat(80) + "\n");
    return;
  }
  console.log(`[Email] Would send contact request email for request #${requestId}`);
}

// server/routes/contact-request.ts
var { Pool: Pool10 } = pg5;
var router10 = Router9();
var pool10 = new Pool10({
  host: "127.0.0.1",
  port: 5432,
  database: "buergerapp",
  user: "buergerapp_user",
  password: "buergerapp_dev_2025"
});
router10.post("/", async (req, res) => {
  const { tenant } = req.query;
  if (!tenant) {
    return res.status(400).json({ error: "Tenant parameter is required" });
  }
  const {
    firstName,
    lastName,
    email,
    phone,
    subject,
    message,
    category
  } = req.body;
  if (!firstName || !lastName || !email || !subject || !message) {
    return res.status(400).json({
      error: "Bitte f\xFCllen Sie alle Pflichtfelder aus"
    });
  }
  try {
    const tenantResult = await pool10.query(
      "SELECT id, name FROM tenants WHERE slug = $1",
      [tenant]
    );
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    const tenantId = tenantResult.rows[0].id;
    const tenantName = tenantResult.rows[0].name;
    const result = await pool10.query(
      `INSERT INTO contact_requests (
        tenant_id, first_name, last_name, email, phone,
        subject, message, category, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', NOW(), NOW())
      RETURNING id`,
      [tenantId, firstName, lastName, email, phone, subject, message, category]
    );
    const requestId = result.rows[0].id;
    try {
      await sendContactRequestEmail({
        requestId,
        tenantName,
        firstName,
        lastName,
        email,
        phone,
        subject,
        message,
        category
      });
    } catch (emailError) {
      console.error("Failed to send contact request email:", emailError);
    }
    res.json({
      success: true,
      requestId,
      message: "Ihre Anfrage wurde erfolgreich \xFCbermittelt"
    });
  } catch (err) {
    console.error("Error submitting contact request:", err);
    res.status(500).json({ error: "Fehler beim \xDCbermitteln der Anfrage" });
  }
});
router10.get("/", async (req, res) => {
  const { tenant } = req.query;
  if (!tenant) {
    return res.status(400).json({ error: "Tenant parameter is required" });
  }
  try {
    const tenantResult = await pool10.query(
      "SELECT id FROM tenants WHERE slug = $1",
      [tenant]
    );
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: "Tenant not found" });
    }
    const tenantId = tenantResult.rows[0].id;
    const result = await pool10.query(
      `SELECT 
        id, first_name, last_name, email, phone,
        subject, message, category, status,
        created_at, updated_at
      FROM contact_requests
      WHERE tenant_id = $1
      ORDER BY created_at DESC`,
      [tenantId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching contact requests:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
var contact_request_default = router10;

// server/routes/neighborhood-help.ts
import { Router as Router10 } from "express";
import { nanoid as nanoid8 } from "nanoid";
import postgres2 from "postgres";
var router11 = Router10();
function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }
  return postgres2(process.env.DATABASE_URL);
}
router11.post("/requests", async (req, res) => {
  try {
    const sql5 = getSql();
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(400).json({ error: "Tenant not found" });
    }
    const {
      category,
      description,
      district,
      meetingPoint,
      timeframe,
      urgency = "medium",
      contactMethod,
      phoneNumber,
      userId,
      userName
    } = req.body;
    const id = nanoid8();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await sql5`
      INSERT INTO help_requests (
        id, tenant_id, created_by, created_by_name, category, description,
        district, meeting_point, timeframe, urgency, contact_method, phone_number,
        status, created_at, updated_at
      ) VALUES (
        ${id}, ${tenant.id}, ${userId}, ${userName}, ${category}, ${description},
        ${district}, ${meetingPoint || null}, ${timeframe || null}, ${urgency},
        ${contactMethod}, ${phoneNumber || null}, 'open', ${now}, ${now}
      )
    `;
    await sql5.end();
    res.json({ id, success: true });
  } catch (error) {
    console.error("Error creating help request:", error);
    res.status(500).json({ error: "Failed to create help request" });
  }
});
router11.get("/requests", async (req, res) => {
  try {
    const sql5 = getSql();
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(400).json({ error: "Tenant not found" });
    }
    const { category, district, urgency } = req.query;
    let result;
    if (category && category !== "all") {
      if (district) {
        result = await sql5`
          SELECT * FROM help_requests
          WHERE tenant_id = ${tenant.id} AND status = 'open'
            AND category = ${category} AND district = ${district}
          ORDER BY created_at DESC
        `;
      } else {
        result = await sql5`
          SELECT * FROM help_requests
          WHERE tenant_id = ${tenant.id} AND status = 'open'
            AND category = ${category}
          ORDER BY created_at DESC
        `;
      }
    } else if (district) {
      result = await sql5`
        SELECT * FROM help_requests
        WHERE tenant_id = ${tenant.id} AND status = 'open'
          AND district = ${district}
        ORDER BY created_at DESC
      `;
    } else {
      result = await sql5`
        SELECT * FROM help_requests
        WHERE tenant_id = ${tenant.id} AND status = 'open'
        ORDER BY created_at DESC
      `;
    }
    if (urgency === "high") {
      result = result.filter((r) => r.urgency === "high");
    }
    await sql5.end();
    res.json(result);
  } catch (error) {
    console.error("Error fetching help requests:", error);
    res.status(500).json({ error: "Failed to fetch help requests" });
  }
});
router11.post("/offers", async (req, res) => {
  try {
    const sql5 = getSql();
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(400).json({ error: "Tenant not found" });
    }
    const {
      categories,
      description,
      district,
      radius = 5,
      availability,
      contactMethod,
      phoneNumber,
      userId,
      userName
    } = req.body;
    const id = nanoid8();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await sql5`
      INSERT INTO help_offers (
        id, tenant_id, created_by, created_by_name, categories, description,
        district, radius, availability, contact_method, phone_number,
        status, created_at, updated_at
      ) VALUES (
        ${id}, ${tenant.id}, ${userId}, ${userName}, ${categories}, ${description},
        ${district}, ${radius}, ${availability || null}, ${contactMethod},
        ${phoneNumber || null}, 'open', ${now}, ${now}
      )
    `;
    await sql5.end();
    res.json({ id, success: true });
  } catch (error) {
    console.error("Error creating help offer:", error);
    res.status(500).json({ error: "Failed to create help offer" });
  }
});
router11.get("/offers", async (req, res) => {
  try {
    const sql5 = getSql();
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(400).json({ error: "Tenant not found" });
    }
    const { category, district } = req.query;
    let result;
    if (district) {
      result = await sql5`
        SELECT * FROM help_offers
        WHERE tenant_id = ${tenant.id} AND status = 'open'
          AND district = ${district}
        ORDER BY created_at DESC
      `;
    } else {
      result = await sql5`
        SELECT * FROM help_offers
        WHERE tenant_id = ${tenant.id} AND status = 'open'
        ORDER BY created_at DESC
      `;
    }
    if (category && category !== "all") {
      result = result.filter((r) => r.categories && r.categories.includes(category));
    }
    await sql5.end();
    res.json(result);
  } catch (error) {
    console.error("Error fetching help offers:", error);
    res.status(500).json({ error: "Failed to fetch help offers" });
  }
});
router11.get("/all", async (req, res) => {
  try {
    const sql5 = getSql();
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(400).json({ error: "Tenant not found" });
    }
    const requests = await sql5`
      SELECT *, 'request' as type FROM help_requests
      WHERE tenant_id = ${tenant.id} AND status = 'open'
      ORDER BY created_at DESC
    `;
    const offers = await sql5`
      SELECT *, 'offer' as type FROM help_offers
      WHERE tenant_id = ${tenant.id} AND status = 'open'
      ORDER BY created_at DESC
    `;
    const all = [...requests, ...offers].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    await sql5.end();
    res.json(all);
  } catch (error) {
    console.error("Error fetching all items:", error);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});
var neighborhood_help_default = router11;

// server/routes/neighborhood-chat.ts
import { Router as Router11 } from "express";
import { nanoid as nanoid9 } from "nanoid";
import postgres3 from "postgres";
var router12 = Router11();
function getSql2() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }
  return postgres3(process.env.DATABASE_URL);
}
router12.post("/conversations", async (req, res) => {
  try {
    const sql5 = getSql2();
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(400).json({ error: "Tenant not found" });
    }
    const {
      requestId,
      offerId,
      requesterId,
      requesterName,
      helperId,
      helperName
    } = req.body;
    const existing = await sql5`
      SELECT * FROM help_conversations
      WHERE tenant_id = ${tenant.id}
        AND ((request_id = ${requestId || null} AND requester_id = ${requesterId} AND helper_id = ${helperId})
          OR (offer_id = ${offerId || null} AND requester_id = ${requesterId} AND helper_id = ${helperId}))
    `;
    if (existing.length > 0) {
      await sql5.end();
      return res.json({ id: existing[0].id, existing: true });
    }
    const id = nanoid9();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await sql5`
      INSERT INTO help_conversations (
        id, tenant_id, request_id, offer_id, requester_id, requester_name,
        helper_id, helper_name, status, created_at, updated_at
      ) VALUES (
        ${id}, ${tenant.id}, ${requestId || null}, ${offerId || null},
        ${requesterId}, ${requesterName}, ${helperId}, ${helperName},
        'active', ${now}, ${now}
      )
    `;
    await sql5.end();
    res.json({ id, success: true });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({ error: "Failed to create conversation" });
  }
});
router12.get("/conversations/:id", async (req, res) => {
  try {
    const sql5 = getSql2();
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(400).json({ error: "Tenant not found" });
    }
    const { id } = req.params;
    const conversation = await sql5`
      SELECT * FROM help_conversations
      WHERE id = ${id} AND tenant_id = ${tenant.id}
    `;
    if (conversation.length === 0) {
      await sql5.end();
      return res.status(404).json({ error: "Conversation not found" });
    }
    await sql5.end();
    res.json(conversation[0]);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});
router12.get("/conversations", async (req, res) => {
  try {
    const sql5 = getSql2();
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(400).json({ error: "Tenant not found" });
    }
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "userId required" });
    }
    const conversations = await sql5`
      SELECT c.*, 
        (SELECT COUNT(*) FROM help_messages m 
         WHERE m.conversation_id = c.id AND m.sender_id != ${userId} AND m.read = false) as unread_count,
        (SELECT message FROM help_messages m 
         WHERE m.conversation_id = c.id 
         ORDER BY m.created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM help_messages m 
         WHERE m.conversation_id = c.id 
         ORDER BY m.created_at DESC LIMIT 1) as last_message_at
      FROM help_conversations c
      WHERE c.tenant_id = ${tenant.id}
        AND (c.requester_id = ${userId} OR c.helper_id = ${userId})
        AND c.status = 'active'
      ORDER BY COALESCE(
        (SELECT created_at FROM help_messages m 
         WHERE m.conversation_id = c.id 
         ORDER BY m.created_at DESC LIMIT 1),
        c.created_at
      ) DESC
    `;
    await sql5.end();
    res.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});
router12.post("/messages", async (req, res) => {
  try {
    const sql5 = getSql2();
    const {
      conversationId,
      senderId,
      senderName,
      message
    } = req.body;
    const id = nanoid9();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await sql5`
      INSERT INTO help_messages (
        id, conversation_id, sender_id, sender_name, message, read, created_at
      ) VALUES (
        ${id}, ${conversationId}, ${senderId}, ${senderName}, ${message}, false, ${now}
      )
    `;
    await sql5`
      UPDATE help_conversations
      SET updated_at = ${now}
      WHERE id = ${conversationId}
    `;
    await sql5.end();
    res.json({ id, success: true });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});
router12.post("/conversations/:id/messages", async (req, res) => {
  try {
    const sql5 = getSql2();
    const { id } = req.params;
    const { senderId, senderName, message } = req.body;
    const messageId = nanoid9();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await sql5`
      INSERT INTO help_messages (
        id, conversation_id, sender_id, sender_name, message, read, created_at
      ) VALUES (
        ${messageId}, ${id}, ${senderId}, ${senderName}, ${message}, false, ${now}
      )
    `;
    await sql5`
      UPDATE help_conversations
      SET updated_at = ${now}
      WHERE id = ${id}
    `;
    await sql5.end();
    res.json({ id: messageId, success: true });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});
router12.get("/conversations/:id/messages", async (req, res) => {
  try {
    const sql5 = getSql2();
    const { id } = req.params;
    const { userId } = req.query;
    const messages = await sql5`
      SELECT * FROM help_messages
      WHERE conversation_id = ${id}
      ORDER BY created_at ASC
    `;
    if (userId) {
      await sql5`
        UPDATE help_messages
        SET read = true
        WHERE conversation_id = ${id}
          AND sender_id != ${userId}
          AND read = false
      `;
    }
    await sql5.end();
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});
router12.get("/messages/:conversationId", async (req, res) => {
  try {
    const sql5 = getSql2();
    const { conversationId } = req.params;
    const { userId } = req.query;
    const messages = await sql5`
      SELECT * FROM help_messages
      WHERE conversation_id = ${conversationId}
      ORDER BY created_at ASC
    `;
    if (userId) {
      await sql5`
        UPDATE help_messages
        SET read = true
        WHERE conversation_id = ${conversationId}
          AND sender_id != ${userId}
          AND read = false
      `;
    }
    await sql5.end();
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});
router12.post("/conversations/:id/share-contact", async (req, res) => {
  try {
    const sql5 = getSql2();
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(400).json({ error: "Tenant not found" });
    }
    const { id } = req.params;
    const { userId } = req.body;
    const conversation = await sql5`
      SELECT * FROM help_conversations
      WHERE id = ${id} AND tenant_id = ${tenant.id}
    `;
    if (conversation.length === 0) {
      await sql5.end();
      return res.status(404).json({ error: "Conversation not found" });
    }
    const conv = conversation[0];
    if (conv.requester_id !== userId && conv.helper_id !== userId) {
      await sql5.end();
      return res.status(403).json({ error: "Unauthorized" });
    }
    await sql5`
      UPDATE help_conversations
      SET contact_shared = true
      WHERE id = ${id}
    `;
    const senderName = conv.requester_id === userId ? conv.requester_name : conv.helper_name;
    const messageId = nanoid9();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    await sql5`
      INSERT INTO help_messages (
        id, conversation_id, sender_id, sender_name, message, read, created_at
      ) VALUES (
        ${messageId}, ${id}, 'system', 'System',
        ${`${senderName} hat die Kontaktdaten geteilt. Sie k\xF6nnen sich nun direkt austauschen.`},
        false, ${now}
      )
    `;
    await sql5.end();
    res.json({ success: true });
  } catch (error) {
    console.error("Error sharing contact:", error);
    res.status(500).json({ error: "Failed to share contact" });
  }
});
var neighborhood_chat_default = router12;

// server/cron-jobs.ts
import cron from "node-cron";
import { exec } from "child_process";
import { promisify } from "util";
var execAsync = promisify(exec);
function setupCronJobs() {
  console.log("[Cron] Setting up scheduled scraping jobs...");
  cron.schedule("0 1 */2 * *", async () => {
    console.log("[Cron] Running news scraping...");
    try {
      const { stdout, stderr } = await execAsync("npx tsx scripts/scrape-schieder-news.ts");
      console.log("[Cron] News scraping completed:", stdout);
      if (stderr) console.error("[Cron] News scraping errors:", stderr);
    } catch (error) {
      console.error("[Cron] News scraping failed:", error);
    }
  });
  cron.schedule("10 1 */2 * *", async () => {
    console.log("[Cron] Running events scraping...");
    try {
      const { stdout, stderr } = await execAsync("npx tsx scripts/scrape-schieder-events.ts");
      console.log("[Cron] Events scraping completed:", stdout);
      if (stderr) console.error("[Cron] Events scraping errors:", stderr);
    } catch (error) {
      console.error("[Cron] Events scraping failed:", error);
    }
  });
  cron.schedule("20 1 */2 * *", async () => {
    console.log("[Cron] Running employees scraping...");
    try {
      const { stdout, stderr } = await execAsync("npx tsx scripts/scrape-schieder-employees.ts");
      console.log("[Cron] Employees scraping completed:", stdout);
      if (stderr) console.error("[Cron] Employees scraping errors:", stderr);
    } catch (error) {
      console.error("[Cron] Employees scraping failed:", error);
    }
  });
  cron.schedule("0 1 * * 0", async () => {
    console.log("[Cron] Running clubs scraping...");
    try {
      const { stdout, stderr } = await execAsync("npx tsx server/scrapers/clubs-scraper.ts");
      console.log("[Cron] Clubs scraping completed:", stdout);
      if (stderr) console.error("[Cron] Clubs scraping errors:", stderr);
    } catch (error) {
      console.error("[Cron] Clubs scraping failed:", error);
    }
  });
  console.log("[Cron] \u2713 News scraping scheduled: Every 2 days at 1:00 AM");
  console.log("[Cron] \u2713 Events scraping scheduled: Every 2 days at 1:10 AM");
  console.log("[Cron] \u2713 Employees scraping scheduled: Every 2 days at 1:20 AM");
  console.log("[Cron] \u2713 Clubs scraping scheduled: Every Sunday at 1:00 AM");
}

// server/_core/index.ts
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.get("/ping", (req, res) => {
    res.send("pong");
  });
  app.use((req, res, next) => {
    console.log(`[${(/* @__PURE__ */ new Date()).toISOString()}] ${req.method} ${req.url}`);
    next();
  });
  app.get("/api/diagnostic", (req, res) => {
    res.status(200).json({
      status: "ok",
      env: process.env.NODE_ENV,
      port: process.env.PORT,
      hasDatabase: !!process.env.DATABASE_URL,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.get("/api/debug/tenants", async (req, res) => {
    try {
      const pg6 = await import("pg");
      const { Client } = pg6.default;
      const client = new Client({ connectionString: process.env.DATABASE_URL });
      await client.connect();
      const result = await client.query("SELECT * FROM tenants");
      await client.end();
      res.json({
        count: result.rows.length,
        tenants: result.rows
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  app.use("/api/trpc", tenantMiddleware);
  app.use("/api/news", news_default);
  app.use("/api/events", events_default);
  app.use("/api/departments", departments_default);
  app.use("/api/attractions", attractions_default);
  app.use("/api/waste", waste_default);
  app.use("/api/clubs", clubs_default);
  app.use("/api/education", education_default);
  app.use("/api/dog-registration", dog_registration_default);
  app.use("/api/dog-registrations", dog_registration_default);
  app.use("/api/contact-request", contact_request_default);
  app.use("/api/contact-requests", contact_request_default);
  app.use("/api/neighborhood-help", tenantMiddleware, neighborhood_help_default);
  app.use("/api/neighborhood-chat", tenantMiddleware, neighborhood_chat_default);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  const isDevelopment = process.env.NODE_ENV === "development";
  if (isDevelopment) {
    console.log("[Server] Running in DEVELOPMENT mode with Vite");
    await setupVite(app, server);
  } else {
    console.log("[Server] Running in PRODUCTION mode with static files");
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "3000");
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`PORT: ${process.env.PORT}`);
    console.log(`Server is ready to accept connections`);
    setupCronJobs();
  });
  server.on("error", (error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}
startServer().catch(console.error);
