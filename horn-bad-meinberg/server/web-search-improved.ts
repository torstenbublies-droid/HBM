/**
 * Verbesserte Web-Suche mit Google-Scraping für lokale Fragen
 */

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

/**
 * Scrape Google Search Ergebnisse
 */
async function scrapeGoogleSearch(query: string): Promise<SearchResult[]> {
  try {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=de`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      console.error('Google search failed:', response.statusText);
      return [];
    }

    const html = await response.text();
    
    // Extrahiere Suchergebnisse aus dem HTML
    const results: SearchResult[] = [];
    
    // Einfaches Regex-basiertes Parsing (funktioniert für die meisten Fälle)
    const titleRegex = /<h3[^>]*>([^<]+)<\/h3>/g;
    const snippetRegex = /<div[^>]*data-sncf="1"[^>]*>([^<]+)<\/div>/g;
    
    let titleMatch;
    let snippetMatch;
    
    const titles: string[] = [];
    const snippets: string[] = [];
    
    while ((titleMatch = titleRegex.exec(html)) !== null) {
      titles.push(titleMatch[1]);
    }
    
    while ((snippetMatch = snippetRegex.exec(html)) !== null) {
      snippets.push(snippetMatch[1]);
    }
    
    // Kombiniere Titel und Snippets
    for (let i = 0; i < Math.min(titles.length, snippets.length, 5); i++) {
      results.push({
        title: titles[i],
        url: '', // URL-Extraktion ist komplexer, lassen wir weg
        snippet: snippets[i],
      });
    }
    
    return results;
  } catch (error) {
    console.error('Google scraping error:', error);
    return [];
  }
}

/**
 * Verbesserte Web-Suche mit mehreren Quellen
 */
export async function performImprovedWebSearch(query: string): Promise<string> {
  try {
    console.log(`[Improved Web Search] Query: "${query}"`);
    
    // Versuche zuerst Google-Scraping
    const googleResults = await scrapeGoogleSearch(query);
    
    if (googleResults.length > 0) {
      const formattedResults = googleResults
        .map(r => `**${r.title}**\n${r.snippet}`)
        .join('\n\n');
      
      console.log(`[Improved Web Search] Found ${googleResults.length} Google results`);
      return formattedResults;
    }
    
    // Fallback: DuckDuckGo
    const duckUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    const duckResponse = await fetch(duckUrl);
    
    if (duckResponse.ok) {
      const data = await duckResponse.json();
      
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
      
      if (results.trim()) {
        console.log(`[Improved Web Search] Found DuckDuckGo results`);
        return results;
      }
    }
    
    // Fallback: Wikipedia
    const wikiQuery = query.replace(/\s+/g, '_');
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
    return '';
  } catch (error) {
    console.error('Improved web search error:', error);
    return '';
  }
}
