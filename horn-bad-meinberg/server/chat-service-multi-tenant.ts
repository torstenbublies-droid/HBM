import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import { getKnowledgeBaseContext } from "./knowledge-base";

/**
 * Tenant-Konfiguration für lokale Keywords
 */
const TENANT_KEYWORDS: Record<string, string[]> = {
  schieder: [
    'schieder', 'schwalenberg', 'marco', 'müllers',
    'lothe', 'ruensiek', 'wöbbel', 'glashütte',
    'badeanstalt', 'schwimmbad', 'freibad'
  ],
  barntrup: [
    'barntrup', 'borris', 'ortmeier',
    'mittelstraße'
  ]
};

/**
 * Erkennt, ob eine Frage lokal (Stadt-spezifisch) oder global ist
 */
export function isLocalQuery(query: string, tenantSlug: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  // Tenant-spezifische Keywords
  const tenantKeywords = TENANT_KEYWORDS[tenantSlug] || [];
  
  // Allgemeine lokale Keywords (für alle Städte)
  const generalLocalKeywords = [
    'rathaus', 'bürgermeister', 'stadt',
    'öffnungszeiten', 'veranstaltung', 'event', 'termin',
    'müll', 'abfall', 'störung', 'notfall', 'warnung',
    'bibliothek', 'kita', 'schule',
    'amt', 'behörde', 'verwaltung', 'bürgerbüro',
    'mängelmelder', 'schadensmeldung',
    'hier', 'bei uns', 'in der stadt'
  ];
  
  // Kombiniere tenant-spezifische und allgemeine Keywords
  const localKeywords = [...tenantKeywords, ...generalLocalKeywords];
  
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
 * Erweiterte RAG-Funktion: Lädt lokale Daten aus der Datenbank
 */
export async function searchLocalContext(query: string, tenantId: string) {
  const lowerQuery = query.toLowerCase();
  
  const results: any = {
    news: [],
    events: [],
    departments: [],
    institutions: [],
  };

  try {
    // Hole News aus der Datenbank (tenant-filtered)
    if (lowerQuery.includes('news') || lowerQuery.includes('nachricht') || lowerQuery.includes('aktuell')) {
      const news = await db.query.news.findMany({
        where: (news, { eq }) => eq(news.tenantId, tenantId),
        limit: 5,
        orderBy: (news, { desc }) => [desc(news.publishedAt)]
      });
      results.news = news;
    }

    // Hole Events aus der Datenbank (tenant-filtered)
    if (lowerQuery.includes('veranstaltung') || lowerQuery.includes('event') || lowerQuery.includes('termin')) {
      const events = await db.query.events.findMany({
        where: (events, { eq }) => eq(events.tenantId, tenantId),
        limit: 5,
        orderBy: (events, { asc }) => [asc(events.startDate)]
      });
      results.events = events;
    }

    // Hole Ämter aus der Datenbank (tenant-filtered)
    if (lowerQuery.includes('amt') || lowerQuery.includes('behörde') || lowerQuery.includes('verwaltung')) {
      const departments = await db.query.departments.findMany({
        where: (departments, { eq }) => eq(departments.tenantId, tenantId),
        limit: 5
      });
      results.departments = departments;
    }

    // Hole Institutionen aus der Datenbank (tenant-filtered)
    if (lowerQuery.includes('schule') || lowerQuery.includes('kita') || lowerQuery.includes('bibliothek')) {
      const institutions = await db.query.institutions.findMany({
        where: (institutions, { eq }) => eq(institutions.tenantId, tenantId),
        limit: 5
      });
      results.institutions = institutions;
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Datenbank-Daten:', error);
  }

  return results;
}

/**
 * Formatiert den Kontext für das System-Prompt
 */
export function formatContextForPrompt(context: any, tenantName: string): string {
  let formatted = '';

  // News
  if (context.news && context.news.length > 0) {
    formatted += `\n**AKTUELLE NACHRICHTEN AUS ${tenantName.toUpperCase()}:**\n`;
    context.news.forEach((n: any) => {
      formatted += `- ${n.title}`;
      if (n.publishedAt) formatted += ` (${new Date(n.publishedAt).toLocaleDateString('de-DE')})`;
      formatted += '\n';
      if (n.content) formatted += `  ${n.content.substring(0, 200)}...\n`;
    });
  }

  // Events
  if (context.events && context.events.length > 0) {
    formatted += `\n**VERANSTALTUNGEN IN ${tenantName.toUpperCase()}:**\n`;
    context.events.forEach((e: any) => {
      formatted += `- ${e.title}`;
      if (e.startDate) formatted += ` (${new Date(e.startDate).toLocaleDateString('de-DE')})`;
      formatted += '\n';
      if (e.description) formatted += `  ${e.description.substring(0, 150)}...\n`;
      if (e.location) formatted += `  📍 ${e.location}\n`;
    });
  }

  // Departments
  if (context.departments && context.departments.length > 0) {
    formatted += `\n**ÄMTER & VERWALTUNG IN ${tenantName.toUpperCase()}:**\n`;
    context.departments.forEach((d: any) => {
      formatted += `- ${d.name}\n`;
      if (d.description) formatted += `  ${d.description.substring(0, 150)}...\n`;
      if (d.phone) formatted += `  📞 ${d.phone}\n`;
      if (d.email) formatted += `  📧 ${d.email}\n`;
    });
  }

  // Institutions
  if (context.institutions && context.institutions.length > 0) {
    formatted += `\n**EINRICHTUNGEN IN ${tenantName.toUpperCase()}:**\n`;
    context.institutions.forEach((i: any) => {
      formatted += `- ${i.name}`;
      if (i.type) formatted += ` (${i.type})`;
      formatted += '\n';
      if (i.address) formatted += `  📍 ${i.address}\n`;
      if (i.phone) formatted += `  📞 ${i.phone}\n`;
    });
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
export function createLocalSystemPrompt(
  contextData: string, 
  tenantName: string,
  mayorName: string,
  mayorEmail: string,
  address: string,
  phone: string,
  openingHours: string
): string {
  // Hole die Wissensdatenbank (tenant-spezifisch)
  const knowledgeBase = getKnowledgeBaseContext(tenantName.toLowerCase());
  
  return `Du bist ein digitaler Assistent für Bürgerinnen und Bürger der Stadt ${tenantName} in Nordrhein-Westfalen.

=== DEINE GRUNDREGELN ===

1. **Lokaler Bezug:**
   - Wenn Nutzer nach lokalen Informationen fragen (z. B. Öffnungszeiten, Adressen, Ämter, Rathaus, Bürgerbüro, Schulen, Kitas, Vereine, Apotheken, Ärzte, Müllabfuhr, Veranstaltungen, Sehenswürdigkeiten), dann gehe automatisch davon aus, dass sie sich auf die Stadt ${tenantName} beziehen.
   - Nutze dein vorhandenes Weltwissen vorsichtig. Wenn du dir bei einer konkreten Information (z. B. exakte Öffnungszeiten, genaue Adresse, aktuelles Angebot) nicht sicher bist, dann erfinde nichts.

2. **Hilfreiche Antworten:**
   - Nutze die bereitgestellten **AKTUELLEN INFORMATIONEN** um präzise Antworten zu geben
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

=== WISSENSDATENBANK ${tenantName.toUpperCase()} ===
${knowledgeBase}

=== AKTUELLE DATEN ===
${contextData}

=== WICHTIGE FAKTEN ===
- Der aktuelle Bürgermeister ist ${mayorName} (E-Mail: ${mayorEmail})
- Rathaus: ${address}
- Tel: ${phone}
- Öffnungszeiten: ${openingHours}

Antworte jetzt auf die Frage des Bürgers.`;
}

/**
 * Erstellt das optimierte System-Prompt für GLOBALE Fragen
 */
export function createGlobalSystemPrompt(tenantName: string): string {
  return `Du bist ein digitaler Assistent für Bürgerinnen und Bürger der Stadt ${tenantName} in Nordrhein-Westfalen.

=== ALLGEMEINE FRAGEN ===

Diese Frage hat keinen direkten Bezug zu ${tenantName}.

**Deine Aufgabe:**
- Antworte wie ein normaler, voll funktionsfähiger ChatGPT-Assistent
- Nutze dein vollständiges allgemeines Wissen
- Beantworte die Frage präzise und informativ
- Gib Quellenangaben oder Kontext wenn möglich

**Sprache & Ton:**
- Antworte standardmäßig auf Deutsch, freundlich, hilfsbereit und gut verständlich
- Wenn der Nutzer in einer anderen Sprache schreibt, kannst du dich seiner Sprache anpassen

**Hinweis:**
Falls die Frage doch einen lokalen Bezug zu ${tenantName} haben sollte, weise darauf hin und biete an, bei lokalen Fragen zu helfen.

Antworte jetzt auf die Frage.`;
}
