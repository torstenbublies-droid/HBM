import { ENV } from "./_core/env";

/**
 * Perplexity Search API Integration
 * Uses Perplexity's Grounded LLM (sonar) for web-grounded answers
 */

/**
 * Fügt lokalen Kontext zu einer Suchanfrage hinzu
 */
function addLocalContext(query: string): string {
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
    'hier', 'in der nähe', 'bei uns',
    'veranstaltung', 'event', 'konzert', 'festival',
    'weihnachtsmarkt', 'adventsmarkt', 'markt',
    'was ist los', 'was kann man'
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
 * Suche mit Perplexity Sonar (Grounded LLM)
 * Kombiniert Web-Suche + LLM für präzise Antworten
 */
export async function performPerplexitySearch(query: string): Promise<string> {
  try {
    // Prüfe ob API Key vorhanden ist
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      console.error('[Perplexity] API Key not found');
      return '';
    }
    
    // Füge lokalen Kontext hinzu wenn nötig
    const enhancedQuery = addLocalContext(query);
    
    console.log(`[Perplexity] Original: "${query}" → Enhanced: "${enhancedQuery}"`);
    
    // Rufe Perplexity Sonar (Grounded LLM) auf
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'Du bist ein hilfreicher Assistent. Beantworte Fragen präzise und mit Quellenangaben. Antworte auf Deutsch.',
          },
          {
            role: 'user',
            content: enhancedQuery,
          },
        ],
      } ),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Perplexity] Request failed:', response.status, errorText);
      return '';
    }
    
    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('[Perplexity] Invalid response format:', data);
      return '';
    }
    
    const answer = data.choices[0].message.content;
    
    // Füge Quellenangaben hinzu wenn vorhanden
    let result = answer;
    
    if (data.citations && data.citations.length > 0) {
      result += '\n\n**Quellen:**\n';
      data.citations.slice(0, 3).forEach((url: string, index: number) => {
        result += `${index + 1}. ${url}\n`;
      });
    }
    
    console.log(`[Perplexity] Got answer (${answer.length} chars, ${data.citations?.length || 0} citations)`);
    return result;
    
  } catch (error) {
    console.error('[Perplexity] Error:', error);
    return '';
  }
}
