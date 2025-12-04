import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';

interface CrawledPage {
  url: string;
  title: string;
  content: string;
  category: string;
  links: string[];
  lastCrawled: Date;
}

interface CrawlResult {
  pages: CrawledPage[];
  totalPages: number;
  categories: Map<string, number>;
}

export class FullWebsiteCrawler {
  private baseUrl = 'https://www.schieder-schwalenberg.de';
  private visitedUrls = new Set<string>();
  private crawledPages: CrawledPage[] = [];
  private maxPages = 500; // Limit to prevent infinite crawling
  private delay = 800; // 0.8 second delay between requests to be polite

  /**
   * Hauptmethode zum Crawlen der gesamten Website
   */
  async crawlWebsite(): Promise<CrawlResult> {
    console.log(`[Crawler] Starting full website crawl of ${this.baseUrl}`);
    
    // Start with the homepage
    await this.crawlPage(this.baseUrl, 'Homepage');
    
    // Analyze results
    const categories = this.analyzeCrawledPages();
    
    console.log(`[Crawler] Crawl complete. Total pages: ${this.crawledPages.length}`);
    
    return {
      pages: this.crawledPages,
      totalPages: this.crawledPages.length,
      categories,
    };
  }

  /**
   * Normalisiert eine URL (entfernt Duplikate)
   */
  private normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove trailing slashes
      let path = urlObj.pathname.replace(/\/$/, '');
      if (path === '') path = '/';
      return `${urlObj.protocol}//${urlObj.hostname}${path}${urlObj.search}`;
    } catch {
      return url;
    }
  }

  /**
   * Crawlt eine einzelne Seite und folgt allen internen Links
   */
  private async crawlPage(url: string, category: string, depth = 0): Promise<void> {
    // Normalize URL to avoid duplicates
    const normalizedUrl = this.normalizeUrl(url);
    
    // Stop conditions
    if (depth > 4 || this.visitedUrls.has(normalizedUrl) || this.crawledPages.length >= this.maxPages) {
      return;
    }

    // Mark as visited
    this.visitedUrls.add(normalizedUrl);

    try {
      console.log(`[Crawler] Crawling (depth ${depth}, total ${this.crawledPages.length}/${this.maxPages}): ${normalizedUrl}`);
      
      // Fetch page
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'BuergerApp-Schieder-Crawler/1.0',
        },
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Extract page title
      const title = $('title').text() || $('h1').first().text() || 'Untitled';

      // Extract main content
      const content = this.extractContent($);

      // Extract all internal links
      const links = this.extractInternalLinks($, url);

      // Store crawled page
      const crawledPage: CrawledPage = {
        url,
        title: title.trim(),
        content: content.trim(),
        category: this.categorizeUrl(url),
        links,
        lastCrawled: new Date(),
      };

      this.crawledPages.push(crawledPage);

      // Wait to be polite to the server
      await this.sleep(this.delay);

      // Recursively crawl linked pages (limited by depth)
      if (depth < 4) { // Only follow links up to depth 4
        // Prioritize important links
        const prioritizedLinks = this.prioritizeLinks(links);
        for (const link of prioritizedLinks.slice(0, 15)) { // Limit to 15 links per page
          if (this.crawledPages.length >= this.maxPages) break;
          await this.crawlPage(link, category, depth + 1);
        }
      }

    } catch (error) {
      console.error(`[Crawler] Error crawling ${url}:`, error.message);
    }
  }

  /**
   * Extrahiert den Hauptinhalt einer Seite
   */
  private extractContent($: cheerio.CheerioAPI): string {
    // Remove scripts, styles, and navigation
    $('script, style, nav, header, footer, .navigation, .menu').remove();

    // Try to find main content area
    let content = '';
    
    // Common content selectors
    const contentSelectors = [
      'main',
      '.content',
      '.main-content',
      '#content',
      '#main',
      'article',
      '.article',
      '.page-content',
    ];

    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text();
        break;
      }
    }

    // Fallback: get body text
    if (!content) {
      content = $('body').text();
    }

    // Clean up whitespace
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    return content.substring(0, 5000); // Limit content length
  }

  /**
   * Extrahiert alle internen Links von einer Seite
   */
  private extractInternalLinks($: cheerio.CheerioAPI, currentUrl: string): string[] {
    const links: string[] = [];
    const baseUrlObj = new URL(this.baseUrl);

    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (!href) return;

      try {
        // Resolve relative URLs
        const absoluteUrl = new URL(href, currentUrl).toString();
        const urlObj = new URL(absoluteUrl);

        // Only include links from the same domain
        if (urlObj.hostname === baseUrlObj.hostname) {
          // Exclude certain file types and fragments
          if (!absoluteUrl.match(/\.(pdf|jpg|jpeg|png|gif|zip|doc|docx|xls|xlsx)$/i) &&
              !absoluteUrl.includes('#')) {
            links.push(absoluteUrl);
          }
        }
      } catch (error) {
        // Invalid URL, skip
      }
    });

    // Remove duplicates
    return Array.from(new Set(links));
  }

  /**
   * Kategorisiert eine URL basierend auf ihrem Pfad
   */
  private categorizeUrl(url: string): string {
    const urlLower = url.toLowerCase();

    if (urlLower.includes('tourismus')) return 'Tourismus';
    if (urlLower.includes('rathaus') || urlLower.includes('verwaltung')) return 'Rathaus';
    if (urlLower.includes('familie') || urlLower.includes('soziales')) return 'Familie & Soziales';
    if (urlLower.includes('bauen') || urlLower.includes('wirtschaft')) return 'Bauen & Wirtschaft';
    if (urlLower.includes('veranstaltung')) return 'Veranstaltungen';
    if (urlLower.includes('bekanntmachung') || urlLower.includes('mitteilung')) return 'Bekanntmachungen';
    if (urlLower.includes('bildung') || urlLower.includes('schule') || urlLower.includes('kindergarten')) return 'Bildung';
    if (urlLower.includes('sport') || urlLower.includes('freizeit')) return 'Sport & Freizeit';
    if (urlLower.includes('verein')) return 'Vereine';
    if (urlLower.includes('buergermeister')) return 'Bürgermeister';
    if (urlLower.includes('kontakt') || urlLower.includes('anliegen')) return 'Kontakt';

    return 'Allgemein';
  }

  /**
   * Analysiert die gecrawlten Seiten und erstellt Statistiken
   */
  private analyzeCrawledPages(): Map<string, number> {
    const categories = new Map<string, number>();

    for (const page of this.crawledPages) {
      const count = categories.get(page.category) || 0;
      categories.set(page.category, count + 1);
    }

    return categories;
  }

  /**
   * Priorisiert Links basierend auf Wichtigkeit
   */
  private prioritizeLinks(links: string[]): string[] {
    const priorityKeywords = [
      'buergermeister', 'rathaus', 'veranstaltung', 'bekanntmachung',
      'tourismus', 'freibad', 'sport', 'bildung', 'schule', 'kindergarten',
      'verein', 'familie', 'soziales', 'bauen', 'wirtschaft'
    ];

    return links.sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      
      const aScore = priorityKeywords.reduce((score, keyword) => 
        score + (aLower.includes(keyword) ? 1 : 0), 0);
      const bScore = priorityKeywords.reduce((score, keyword) => 
        score + (bLower.includes(keyword) ? 1 : 0), 0);
      
      return bScore - aScore; // Higher score first
    });
  }

  /**
   * Hilfsfunktion für Verzögerungen
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Gibt die gecrawlten Seiten zurück
   */
  getCrawledPages(): CrawledPage[] {
    return this.crawledPages;
  }

  /**
   * Filtert Seiten nach Kategorie
   */
  getPagesByCategory(category: string): CrawledPage[] {
    return this.crawledPages.filter(page => page.category === category);
  }

  /**
   * Sucht nach Schlüsselwörtern in den gecrawlten Seiten
   */
  searchPages(keyword: string): CrawledPage[] {
    const keywordLower = keyword.toLowerCase();
    return this.crawledPages.filter(page => 
      page.title.toLowerCase().includes(keywordLower) ||
      page.content.toLowerCase().includes(keywordLower)
    );
  }
}

// Singleton instance
export const fullWebsiteCrawler = new FullWebsiteCrawler();

