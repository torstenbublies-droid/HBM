import { ENV } from "./_core/env";

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * Fügt lokalen Kontext zu einer Suchanfrage hinzu
 */
export function addLocalContext(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  // Keywords die auf lokale Fragen hinweisen
  const localIndicators = [
    'apotheke', 'arzt', 'ärztin', 'krankenhaus', 'klinik',
    'restaurant', 'café', 'essen', 'trinken',
    'hotel', 'übernachten', 'unterkunft',
    'geschäft', 'laden', 'einkaufen', 'supermarkt',
    'bank', 'sparkasse', 'geldautomat',
    'tankstelle', 'werkstatt',
    'friseur', 'frisör', 'friseurin',
    'bäckerei', 'metzgerei', 'fleischerei',
    'schule', 'kindergarten', 'kita',
    'spielplatz', 'park',
    'schwimmbad', 'freibad', 'hallenbad', 'badeanstalt',
    'bücherei', 'bibliothek',
    'kirche', 'friedhof',
    'polizei', 'feuerwehr',
    'post', 'paket',
    'busfahrplan', 'bus', 'haltestelle',
    'öffnungszeiten', 'geöffnet', 'geschlossen',
    'wo ist', 'wo finde', 'wo gibt es',
    'nächste', 'nächster', 'nächstes',
    'hier', 'in der nähe', 'bei uns'
  ];
  
  // Prüfe ob die Anfrage lokalen Bezug hat
  const hasLocalIndicator = localIndicators.some(indicator => 
    lowerQuery.includes(indicator)
  );
  
  // Wenn lokaler Bezug erkannt wird, füge "in Schieder-Schwalenberg" hinzu
  if (hasLocalIndicator && !lowerQuery.includes('schieder') && !lowerQuery.includes('schwalenberg')) {
    return `${query} in Schieder-Schwalenberg`;
  }
  
  return query;
}

/**
 * Performs a web search using DuckDuckGo (no API key needed)
 */
export async function performWebSearch(query: string): Promise<string> {
  try {
    // Füge lokalen Kontext hinzu wenn nötig
    const enhancedQuery = addLocalContext(query);
    
    console.log(`[Web Search] Original: "${query}" → Enhanced: "${enhancedQuery}"`);
    
    // Nutze DuckDuckGo Instant Answer API (kostenlos, kein API Key)
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(enhancedQuery)}&format=json&no_html=1&skip_disambig=1`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      console.error('Web search failed:', response.statusText);
      return '';
    }

    const data = await response.json();
    
    // Extrahiere relevante Informationen
    let results = '';
    
    if (data.AbstractText) {
      results += `${data.AbstractText}\n\n`;
    }
    
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      const topTopics = data.RelatedTopics
        .filter((t: any) => t.Text)
        .slice(0, 3);
      
      topTopics.forEach((topic: any) => {
        results += `${topic.Text}\n`;
      });
    }
    
    // Wenn DuckDuckGo keine Ergebnisse hat, versuche Wikipedia
    if (!results.trim()) {
      const wikiQuery = enhancedQuery.replace(/\s+/g, '_');
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
        console.error('Wikipedia search error:', error);
      }
    }

    return results || 'Keine aktuellen Informationen gefunden.';
  } catch (error) {
    console.error('Web search error:', error);
    return '';
  }
}

/**
 * Determines if a query requires web search (general knowledge)
 * or can be answered with local data
 */
export function requiresWebSearch(message: string): boolean {
  const lowerMessage = message.toLowerCase();
  
  // Keywords that indicate questions that need web search
  const globalKeywords = [
    // Politik & Regierung
    'bundeskanzler', 'kanzler', 'regierung', 'minister', 'ministerin',
    'bundesregierung', 'ministerpräsident', 'bauminister', 'bauministerin',
    'präsident', 'präsidentin', 'politiker', 'politikerin',
    
    // Geografie & Allgemein
    'deutschland', 'europa', 'welt',
    'hauptstadt von', 'einwohner von', 'wo liegt',
    
    // Zeit & Nachrichten
    'aktuell', 'heute', 'gestern', 'morgen',
    'nachrichten', 'news',
    
    // Wetter
    'wetter in', 'temperatur in',
    
    // Wirtschaft & Sport
    'wirtschaft', 'börse', 'aktien',
    'sport', 'fußball', 'bundesliga',
    
    // Wissenschaft
    'wissenschaft', 'forschung',
    
    // Events & Veranstaltungen (WICHTIG!)
    'weihnachtsmarkt', 'adventsmarkt', 'christkindlmarkt',
    'konzert', 'festival', 'fest', 'feier',
    'markt', 'flohmarkt', 'wochenmarkt',
    'was ist los', 'was kann man', 'was gibt es',
    'nächste veranstaltung', 'kommende veranstaltung',
    'veranstaltungen in', 'events in',
    'schiedersee', 'am see',
    
    // Fragen
    'wer ist', 'wer war', 'was ist', 'was war', 'wie heißt',
    'wie hoch', 'wie groß', 'wie alt', 'wann ist', 'wann findet',
    'wann wurde', 'geschichte von', 'erfinder von'
  ];
  
  // Keywords that indicate LOCAL questions - NO web search needed
  // (Nur für Fragen die definitiv OHNE Web-Suche beantwortet werden können)
  const localOnlyKeywords = [
    'rathaus', 'bürgermeister marco',
    'öffnungszeiten rathaus',
    'mängelmelder', 'schadensmeldung',
    'abfall', 'müll', 'müllabfuhr',
    // Ortsteile OHNE Events/Veranstaltungen
    // (entfernt, damit Event-Fragen Web-Suche auslösen)
  ];
  
  // Check if message contains LOCAL-ONLY keywords
  const hasLocalOnlyKeyword = localOnlyKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  // If local-only keyword found, DON'T search web
  if (hasLocalOnlyKeyword) {
    return false;
  }
  
  // Check if message contains global keywords
  const hasGlobalKeyword = globalKeywords.some(keyword => 
    lowerMessage.includes(keyword)
  );
  
  // Aktiviere Web-Suche wenn globale Keywords gefunden wurden
  return hasGlobalKeyword;
}
