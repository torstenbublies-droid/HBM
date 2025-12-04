import axios from 'axios';
import * as cheerio from 'cheerio';

export interface StadtInfo {
  title: string;
  content: string;
  url: string;
  category?: string;
  date?: string;
}

export class StadtWebsiteScraper {
  private baseUrl = 'https://www.schieder-schwalenberg.de';
  private cache: Map<string, { data: StadtInfo[]; timestamp: number }> = new Map();
  private cacheTimeout = 1000 * 60 * 30; // 30 Minuten Cache

  /**
   * Holt aktuelle Mitteilungen von der Startseite
   */
  async getMitteilungen(): Promise<StadtInfo[]> {
    const cacheKey = 'mitteilungen';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BuergerBot/1.0)',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const mitteilungen: StadtInfo[] = [];

      // Extrahiere Mitteilungen aus der Startseite
      $('.mitteilung, .bekanntmachung, article').each((_, element) => {
        const $el = $(element);
        const title = $el.find('h2, h3, .title').first().text().trim();
        const content = $el.find('p, .text, .content').first().text().trim();
        const link = $el.find('a').first().attr('href');
        const date = $el.find('.date, time').first().text().trim();

        if (title && content) {
          mitteilungen.push({
            title,
            content,
            url: link ? this.makeAbsoluteUrl(link) : this.baseUrl,
            category: 'Mitteilung',
            date,
          });
        }
      });

      this.cache.set(cacheKey, { data: mitteilungen, timestamp: Date.now() });
      return mitteilungen;
    } catch (error) {
      console.error('Fehler beim Abrufen der Mitteilungen:', error);
      return [];
    }
  }

  /**
   * Holt Veranstaltungen von der Website
   */
  async getVeranstaltungen(): Promise<StadtInfo[]> {
    const cacheKey = 'veranstaltungen';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await axios.get(this.baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BuergerBot/1.0)',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const veranstaltungen: StadtInfo[] = [];

      // Extrahiere Veranstaltungen
      $('.veranstaltung, .event').each((_, element) => {
        const $el = $(element);
        const title = $el.find('h2, h3, .title').first().text().trim();
        const content = $el.find('p, .text, .description').first().text().trim();
        const link = $el.find('a').first().attr('href');
        const date = $el.find('.date, time').first().text().trim();

        if (title) {
          veranstaltungen.push({
            title,
            content: content || '',
            url: link ? this.makeAbsoluteUrl(link) : this.baseUrl,
            category: 'Veranstaltung',
            date,
          });
        }
      });

      this.cache.set(cacheKey, { data: veranstaltungen, timestamp: Date.now() });
      return veranstaltungen;
    } catch (error) {
      console.error('Fehler beim Abrufen der Veranstaltungen:', error);
      return [];
    }
  }

  /**
   * Sucht nach spezifischen Informationen auf der Website
   */
  async searchInfo(query: string): Promise<StadtInfo[]> {
    try {
      // Nutze die Suchfunktion der Website
      const searchUrl = `${this.baseUrl}/suche`;
      const response = await axios.get(searchUrl, {
        params: { q: query },
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BuergerBot/1.0)',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const results: StadtInfo[] = [];

      $('.search-result, .result-item').each((_, element) => {
        const $el = $(element);
        const title = $el.find('h2, h3, .title').first().text().trim();
        const content = $el.find('p, .snippet, .text').first().text().trim();
        const link = $el.find('a').first().attr('href');

        if (title) {
          results.push({
            title,
            content: content || '',
            url: link ? this.makeAbsoluteUrl(link) : this.baseUrl,
            category: 'Suchergebnis',
          });
        }
      });

      return results;
    } catch (error) {
      console.error('Fehler bei der Suche:', error);
      return [];
    }
  }

  /**
   * Holt Informationen zu einem bestimmten Thema
   */
  async getThemaInfo(thema: string): Promise<StadtInfo | null> {
    const themaUrls: Record<string, string> = {
      'öffnungszeiten': '/rathaus/mitarbeiter',
      'bürgermeister': '/rathaus/buergermeister',
      'standesamt': '/rathaus/standesamt',
      'formulare': '/rathaus/formulare',
      'müll': '/bauen-und-wirtschaft/abfallberatung',
      'abfall': '/bauen-und-wirtschaft/abfallberatung',
      'bauen': '/bauen-und-wirtschaft',
      'kindergarten': '/familie-und-soziales/kindergaerten',
      'schule': '/familie-und-soziales/schulen',
      'freibad': '/familie-und-soziales/freibad-schieder',
      'tourismus': '/tourismus',
      'veranstaltungen': '/veranstaltungen',
    };

    const url = themaUrls[thema.toLowerCase()];
    if (!url) {
      return null;
    }

    try {
      const response = await axios.get(this.makeAbsoluteUrl(url), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BuergerBot/1.0)',
        },
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const title = $('h1').first().text().trim();
      const content = $('.content, .main-content, article').first().text().trim();

      return {
        title: title || thema,
        content: content || 'Keine Informationen verfügbar',
        url: this.makeAbsoluteUrl(url),
        category: 'Thema',
      };
    } catch (error) {
      console.error(`Fehler beim Abrufen von Thema "${thema}":`, error);
      return null;
    }
  }

  /**
   * Macht relative URLs absolut
   */
  private makeAbsoluteUrl(url: string): string {
    if (url.startsWith('http')) {
      return url;
    }
    if (url.startsWith('/')) {
      return `${this.baseUrl}${url}`;
    }
    return `${this.baseUrl}/${url}`;
  }

  /**
   * Löscht den Cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton-Instanz
export const stadtWebsiteScraper = new StadtWebsiteScraper();

