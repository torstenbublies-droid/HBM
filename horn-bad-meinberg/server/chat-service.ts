import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { stadtWebsiteScraper } from "./services/stadtWebsiteScraper";
import { getKnowledgeBaseContext } from "./knowledge-base";

/**
 * Erkennt, ob eine Frage lokal (Schieder-Schwalenberg) oder global ist
 */
export function isLocalQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  // Lokale Keywords - wenn diese vorkommen, ist es eine lokale Frage
  const localKeywords = [
    'schieder', 'schwalenberg', 'rathaus', 'bürgermeister', 'stadt',
    'öffnungszeiten', 'veranstaltung', 'event', 'termin',
    'müll', 'abfall', 'störung', 'notfall', 'warnung',
    'badeanstalt', 'schwimmbad', 'freibad', 'bibliothek', 'kita', 'schule',
    'amt', 'behörde', 'verwaltung', 'bürgerbüro',
    'mängelmelder', 'schadensmeldung',
    'hier', 'bei uns', 'in der stadt', 'marco', 'müllers',
    'lothe', 'ruensiek', 'wöbbel', 'glashütte'
  ];
  
  // Globale Keywords - wenn diese vorkommen UND keine lokalen Keywords, ist es eine globale Frage
  const globalKeywords = [
    'bundeskanzler', 'bundesregierung', 'deutschland',
    'politiker', 'politik', 'partei',
    'welt', 'europa', 'land', 'staat',
    'geschichte', 'wissenschaft', 'technik',
    'wie hoch', 'wie groß', 'wie alt', 'wann wurde', 'wo liegt',
    'was ist', 'wer ist', 'wer war', 'rechne', 'berechne'
  ];
  
  // Prüfe auf lokale Keywords
  const hasLocalKeyword = localKeywords.some(keyword => lowerQuery.includes(keyword));
  
  // Prüfe auf globale Keywords
  const hasGlobalKeyword = globalKeywords.some(keyword => lowerQuery.includes(keyword));
  
  // Wenn lokale Keywords vorhanden sind, ist es eine lokale Frage
  if (hasLocalKeyword) {
    return true;
  }
  
  // Wenn globale Keywords vorhanden sind und keine lokalen, ist es eine globale Frage
  if (hasGlobalKeyword && !hasLocalKeyword) {
    return false;
  }
  
  // Standardmäßig als lokal behandeln (Sicherheit)
  return true;
}

/**
 * Erweiterte RAG-Funktion: Lädt nur statische Daten OHNE Datenbankzugriff
 * Nutzt nur die Knowledge Base und Stadt-Website-Scraper
 */
export async function searchLocalContext(query: string) {
  const lowerQuery = query.toLowerCase();
  
  const results: any = {
    stadtWebsite: {
      mitteilungen: [],
      veranstaltungen: [],
    },
  };

  // Hole aktuelle Informationen von der Stadt-Website (OHNE Datenbank)
  try {
    const [mitteilungen, veranstaltungen] = await Promise.all([
      stadtWebsiteScraper.getMitteilungen(),
      stadtWebsiteScraper.getVeranstaltungen(),
    ]);
    results.stadtWebsite.mitteilungen = mitteilungen.slice(0, 5);
    results.stadtWebsite.veranstaltungen = veranstaltungen.slice(0, 5);
  } catch (error) {
    console.error('Fehler beim Abrufen der Stadt-Website-Daten:', error);
  }

  return results;
}

/**
 * Formatiert den Kontext für das System-Prompt
 */
export function formatContextForPrompt(context: any): string {
  let formatted = '';

  // Stadt-Website Informationen
  if (context.stadtWebsite) {
    if (context.stadtWebsite.mitteilungen && context.stadtWebsite.mitteilungen.length > 0) {
      formatted += '\n**OFFIZIELLE MITTEILUNGEN VON SCHIEDER-SCHWALENBERG.DE:**\n';
      context.stadtWebsite.mitteilungen.forEach((m: any) => {
        formatted += `- ${m.title}`;
        if (m.date) formatted += ` (${m.date})`;
        formatted += '\n';
        if (m.content) formatted += `  ${m.content.substring(0, 200)}...\n`;
        if (m.url) formatted += `  Link: ${m.url}\n`;
      });
    }

    if (context.stadtWebsite.veranstaltungen && context.stadtWebsite.veranstaltungen.length > 0) {
      formatted += '\n**VERANSTALTUNGEN VON SCHIEDER-SCHWALENBERG.DE:**\n';
      context.stadtWebsite.veranstaltungen.forEach((v: any) => {
        formatted += `- ${v.title}`;
        if (v.date) formatted += ` (${v.date})`;
        formatted += '\n';
        if (v.content) formatted += `  ${v.content.substring(0, 150)}...\n`;
      });
    }
  }

  if (!formatted) {
    formatted = '\n(Keine aktuellen Daten verfügbar)\n';
  }

  return formatted;
}

/**
 * Generiert Deep-Links zu relevanten App-Bereichen
 */
export function generateDeepLinks(query: string): string {
  const lowerQuery = query.toLowerCase();
  const links: string[] = [];

  if (lowerQuery.includes('veranstaltung') || lowerQuery.includes('event')) {
    links.push('📅 Alle Veranstaltungen anzeigen: /events');
  }

  if (lowerQuery.includes('news') || lowerQuery.includes('nachricht') || lowerQuery.includes('aktuell')) {
    links.push('📰 Alle Nachrichten anzeigen: /news');
  }

  if (lowerQuery.includes('müll') || lowerQuery.includes('abfall')) {
    links.push('🗑️ Abfallkalender: /waste');
  }

  if (lowerQuery.includes('mängel') || lowerQuery.includes('schaden')) {
    links.push('🔧 Mängelmelder: /issue-reports');
  }

  if (lowerQuery.includes('kontakt') || lowerQuery.includes('anliegen')) {
    links.push('📞 Kontakt & Anliegen: /contact');
  }

  if (links.length > 0) {
    return '\n\n' + links.join('\n');
  }

  return '';
}

/**
 * Erstellt das optimierte System-Prompt für LOKALE Fragen
 */
export function createLocalSystemPrompt(contextData: string): string {
  // Hole die Wissensdatenbank
  const knowledgeBase = getKnowledgeBaseContext();
  
  return `Du bist „Manus", ein digitaler Assistent für Bürgerinnen und Bürger der Stadt Schieder-Schwalenberg in Nordrhein-Westfalen.

=== DEINE GRUNDREGELN ===

1. **Lokaler Bezug:**
   - Wenn Nutzer nach lokalen Informationen fragen (z. B. Öffnungszeiten, Adressen, Ämter, Rathaus, Bürgerbüro, Schulen, Kitas, Vereine, Apotheken, Ärzte, Müllabfuhr, Veranstaltungen, Sehenswürdigkeiten, Ortsteile wie Schieder, Schwalenberg, Lothe, Ruensiek, Wöbbel usw.), dann gehe automatisch davon aus, dass sie sich auf die Stadt Schieder-Schwalenberg und ihre Ortsteile beziehen.
   - Nutze dein vorhandenes Weltwissen vorsichtig. Wenn du dir bei einer konkreten Information (z. B. exakte Öffnungszeiten, genaue Adresse, aktuelles Angebot) nicht sicher bist, dann erfinde nichts.

2. **Hilfreiche Antworten:**
   - Nutze die bereitgestellten **AKTUELLEN INFORMATIONEN AUS DEM INTERNET** um präzise Antworten zu geben
   - Wenn **ORTE IN DER NÄHE (Google Places)** vorhanden sind, nutze AUSSCHLIESSLICH diese Informationen und gib sie vollständig weiter (Name, Adresse, Telefon, Website, Bewertung, Öffnungszeiten)
   - Bei Umkreissuchen (Restaurant, Arzt, Apotheke, Tankstelle, etc.) verweise NIEMALS auf das Rathaus oder die Stadtverwaltung
   - Das Rathaus soll NUR bei Verwaltungsangelegenheiten (Ausweise, Anmeldung, Ämter, etc.) erwähnt werden
   - Wenn Web-Suche-Ergebnisse vorhanden sind, nutze diese um konkrete Antworten zu geben
   - Gib **konkrete, umsetzbare Informationen** statt nur auf Websites zu verweisen
   - Erfinde niemals Daten, aber nutze die bereitgestellten Informationen aktiv

3. **Formatierung:**
   - Nutze IMMER Icons für bessere Lesbarkeit:
     * 📍 für Adressen
     * ⭐ für Bewertungen
     * 🕐 für Öffnungszeiten
     * 📞 für Telefonnummern
     * 🌐 für Websites
     * 📧 für E-Mail-Adressen
     * 📅 für Termine/Veranstaltungen
     * 🏛️ für Rathaus/Verwaltung
     * 👥 für Personen/Ansprechpartner
   - Strukturiere Antworten mit Aufzählungen und Absätzen

4. **Sprache & Ton:**
   - Antworte standardmäßig auf Deutsch, freundlich, hilfsbereit und gut verständlich.
   - Wenn der Nutzer in einer anderen Sprache schreibt, kannst du dich seiner Sprache anpassen.

5. **Sicherheit:**
   - Speichere keine sensiblen personenbezogenen Daten und fordere keine unnötigen privaten Informationen vom Nutzer an.

=== WISSENSDATENBANK SCHIEDER-SCHWALENBERG ===
${knowledgeBase}

=== AKTUELLE DATEN ===
${contextData}

=== WICHTIGE FAKTEN ===
- Der aktuelle Bürgermeister ist Marco Müllers (E-Mail: marco.muellers@schieder-schwalenberg.de)
- Rathaus: Domäne 3, 32816 Schieder-Schwalenberg, Tel: 05282 / 601-0
- Öffnungszeiten Rathaus: Mo-Fr 08:00-12:00 Uhr, Do 14:00-17:00 Uhr

Antworte jetzt auf die Frage des Bürgers.`;
}

/**
 * Erstellt das optimierte System-Prompt für GLOBALE Fragen
 */
export function createGlobalSystemPrompt(): string {
  return `Du bist „Manus", ein digitaler Assistent für Bürgerinnen und Bürger der Stadt Schieder-Schwalenberg in Nordrhein-Westfalen.

=== ALLGEMEINE FRAGEN ===

Diese Frage hat keinen direkten Bezug zu Schieder-Schwalenberg.

**Deine Aufgabe:**
- Antworte wie ein normaler, voll funktionsfähiger ChatGPT-Assistent
- Nutze dein vollständiges allgemeines Wissen
- Beantworte die Frage präzise und informativ
- Gib Quellenangaben oder Kontext wenn möglich

**Sprache & Ton:**
- Antworte standardmäßig auf Deutsch, freundlich, hilfsbereit und gut verständlich
- Wenn der Nutzer in einer anderen Sprache schreibt, kannst du dich seiner Sprache anpassen

**Hinweis:**
Falls die Frage doch einen lokalen Bezug zu Schieder-Schwalenberg haben sollte, weise darauf hin und biete an, bei lokalen Fragen zu helfen.

Antworte jetzt auf die Frage.`;
}
