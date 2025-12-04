import { nanoid } from 'nanoid';
import * as db from '../db';
import { fullWebsiteCrawler } from './fullWebsiteCrawler';

interface PopulationResult {
  success: boolean;
  newsAdded: number;
  eventsAdded: number;
  departmentsAdded: number;
  poisAdded: number;
  institutionsAdded: number;
  errors: string[];
}

export class DatabasePopulator {
  private errors: string[] = [];

  /**
   * Hauptmethode zum Befüllen der Datenbank mit gecrawlten Daten
   */
  async populateDatabase(): Promise<PopulationResult> {
    console.log('[DB Populator] Starting database population...');

    let newsAdded = 0;
    let eventsAdded = 0;
    let departmentsAdded = 0;
    let poisAdded = 0;
    let institutionsAdded = 0;

    try {
      // First, crawl the website
      console.log('[DB Populator] Crawling website...');
      const crawlResult = await fullWebsiteCrawler.crawlWebsite();
      console.log(`[DB Populator] Crawled ${crawlResult.totalPages} pages`);

      // Process Bekanntmachungen (News/Announcements)
      // Search for pages with keywords in title/content
      const allPages = fullWebsiteCrawler.getCrawledPages();
      const newsPages = allPages.filter(page => 
        page.url.toLowerCase().includes('bekanntmachung') ||
        page.title.toLowerCase().includes('bekanntmachung') ||
        page.category === 'Bekanntmachungen'
      );
      console.log(`[DB Populator] Found ${newsPages.length} news pages`);
      newsAdded = await this.processNews(newsPages);

      // Process Veranstaltungen (Events)
      const eventPages = allPages.filter(page => 
        page.url.toLowerCase().includes('veranstaltung') ||
        page.title.toLowerCase().includes('veranstaltung') ||
        page.category === 'Veranstaltungen'
      );
      console.log(`[DB Populator] Found ${eventPages.length} event pages`);
      eventsAdded = await this.processEvents(eventPages);

      // Process Departments (Rathaus/Verwaltung)
      const deptPages = allPages.filter(page => 
        (page.url.toLowerCase().includes('rathaus') ||
         page.url.toLowerCase().includes('verwaltung') ||
         page.category === 'Rathaus') &&
        !page.url.toLowerCase().includes('bekanntmachung')
      );
      console.log(`[DB Populator] Found ${deptPages.length} department pages`);
      departmentsAdded = await this.processDepartments(deptPages);

      // Process POIs (Points of Interest - Tourismus)
      const poiPages = allPages.filter(page => 
        page.url.toLowerCase().includes('tourismus') ||
        page.url.toLowerCase().includes('sehenswuerdigkeit') ||
        page.url.toLowerCase().includes('freizeit') ||
        page.category === 'Tourismus'
      );
      console.log(`[DB Populator] Found ${poiPages.length} POI pages`);
      poisAdded = await this.processPOIs(poiPages);

      // Process Institutions (Bildung, Sport, etc.)
      const institutionPages = allPages.filter(page => 
        page.url.toLowerCase().includes('bildung') ||
        page.url.toLowerCase().includes('schule') ||
        page.url.toLowerCase().includes('kindergarten') ||
        page.url.toLowerCase().includes('sport') ||
        page.url.toLowerCase().includes('verein') ||
        page.category === 'Bildung' ||
        page.category === 'Sport & Freizeit' ||
        page.category === 'Familie & Soziales'
      );
      console.log(`[DB Populator] Found ${institutionPages.length} institution pages`);
      institutionsAdded = await this.processInstitutions(institutionPages);

      console.log('[DB Populator] Database population complete');

      return {
        success: true,
        newsAdded,
        eventsAdded,
        departmentsAdded,
        poisAdded,
        institutionsAdded,
        errors: this.errors,
      };

    } catch (error) {
      console.error('[DB Populator] Fatal error:', error);
      this.errors.push(`Fatal error: ${error.message}`);
      
      return {
        success: false,
        newsAdded,
        eventsAdded,
        departmentsAdded,
        poisAdded,
        institutionsAdded,
        errors: this.errors,
      };
    }
  }

  /**
   * Verarbeitet News/Bekanntmachungen
   */
  private async processNews(pages: any[]): Promise<number> {
    let added = 0;
    console.log(`[DB Populator] Processing ${pages.length} news pages...`);

    for (const page of pages) {
      try {
        // Extract date from content or use current date
        const publishedAt = this.extractDate(page.content) || new Date();

        const newsItem = {
          id: nanoid(),
          title: page.title,
          summary: page.content.substring(0, 200),
          content: page.content,
          category: 'Bekanntmachung',
          publishedAt,
          source: page.url,
          imageUrl: null,
        };

        await db.createNews(newsItem);
        added++;
      } catch (error) {
        this.errors.push(`Error adding news from ${page.url}: ${error.message}`);
      }
    }

    console.log(`[DB Populator] Added ${added} news items`);
    return added;
  }

  /**
   * Verarbeitet Veranstaltungen
   */
  private async processEvents(pages: any[]): Promise<number> {
    let added = 0;
    console.log(`[DB Populator] Processing ${pages.length} event pages...`);

    for (const page of pages) {
      try {
        const startDate = this.extractDate(page.content) || new Date();
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 2); // Default 2-hour event

        const event = {
          id: nanoid(),
          title: page.title,
          description: page.content.substring(0, 500),
          startDate,
          endDate,
          location: this.extractLocation(page.content),
          category: 'Veranstaltung',
          organizer: 'Stadt Schieder-Schwalenberg',
          registrationRequired: false,
          imageUrl: null,
        };

        await db.createEvent(event);
        added++;
      } catch (error) {
        this.errors.push(`Error adding event from ${page.url}: ${error.message}`);
      }
    }

    console.log(`[DB Populator] Added ${added} events`);
    return added;
  }

  /**
   * Verarbeitet Abteilungen/Departments
   */
  private async processDepartments(pages: any[]): Promise<number> {
    let added = 0;
    console.log(`[DB Populator] Processing ${pages.length} department pages...`);

    for (const page of pages) {
      try {
        const department = {
          id: nanoid(),
          name: page.title,
          description: page.content.substring(0, 300),
          contactPerson: this.extractContactPerson(page.content),
          phone: this.extractPhone(page.content),
          email: this.extractEmail(page.content),
          officeHours: 'Mo-Fr 08:00-12:00 Uhr, Do 14:00-17:00 Uhr',
          location: 'Rathaus Schieder-Schwalenberg',
        };

        await db.createDepartment(department);
        added++;
      } catch (error) {
        this.errors.push(`Error adding department from ${page.url}: ${error.message}`);
      }
    }

    console.log(`[DB Populator] Added ${added} departments`);
    return added;
  }

  /**
   * Verarbeitet Points of Interest
   */
  private async processPOIs(pages: any[]): Promise<number> {
    let added = 0;
    console.log(`[DB Populator] Processing ${pages.length} POI pages...`);

    if (pages.length === 0) {
      console.log('[DB Populator] No POI pages found, skipping...');
      return 0;
    }

    for (const page of pages) {
      try {
        const poi = {
          id: nanoid(),
          name: page.title,
          description: page.content.substring(0, 300),
          category: 'Sehenswürdigkeit',
          address: this.extractAddress(page.content),
          latitude: null,
          longitude: null,
          openingHours: this.extractOpeningHours(page.content),
          website: page.url,
          phone: this.extractPhone(page.content),
          imageUrl: null,
        };

        await db.createPoi(poi);
        added++;
      } catch (error) {
        this.errors.push(`Error adding POI from ${page.url}: ${error.message}`);
      }
    }

    console.log(`[DB Populator] Added ${added} POIs`);
    return added;
  }

  /**
   * Verarbeitet Institutionen
   */
  private async processInstitutions(pages: any[]): Promise<number> {
    let added = 0;
    console.log(`[DB Populator] Processing ${pages.length} institution pages...`);

    for (const page of pages) {
      try {
        const institution = {
          id: nanoid(),
          name: page.title,
          type: this.determineInstitutionType(page.category),
          description: page.content.substring(0, 300),
          address: this.extractAddress(page.content),
          phone: this.extractPhone(page.content),
          email: this.extractEmail(page.content),
          website: page.url,
          openingHours: this.extractOpeningHours(page.content),
        };

        await db.createInstitution(institution);
        added++;
      } catch (error) {
        this.errors.push(`Error adding institution from ${page.url}: ${error.message}`);
      }
    }

    console.log(`[DB Populator] Added ${added} institutions`);
    return added;
  }

  /**
   * Hilfsfunktionen zum Extrahieren von Informationen
   */

  private extractDate(text: string): Date | null {
    // Try to find dates in format DD.MM.YYYY or DD.MM.YY
    const datePattern = /(\d{1,2})\.(\d{1,2})\.(\d{2,4})/;
    const match = text.match(datePattern);
    
    if (match) {
      const day = parseInt(match[1]);
      const month = parseInt(match[2]) - 1; // JS months are 0-indexed
      let year = parseInt(match[3]);
      
      if (year < 100) {
        year += 2000; // Assume 20xx for 2-digit years
      }
      
      return new Date(year, month, day);
    }
    
    return null;
  }

  private extractLocation(text: string): string | null {
    // Look for common location indicators
    const locationPatterns = [
      /(?:in|im|am)\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)*)/,
      /Ort:\s*([^\n]+)/i,
      /Veranstaltungsort:\s*([^\n]+)/i,
    ];

    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    return 'Schieder-Schwalenberg';
  }

  private extractPhone(text: string): string | null {
    const phonePattern = /(\d{5}\s*\/\s*\d+[-\d]*|\+49\s*\d+\s*\/\s*\d+[-\d]*)/;
    const match = text.match(phonePattern);
    return match ? match[0].trim() : null;
  }

  private extractEmail(text: string): string | null {
    const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
    const match = text.match(emailPattern);
    return match ? match[0].trim() : null;
  }

  private extractAddress(text: string): string | null {
    // Look for street addresses
    const addressPattern = /([A-ZÄÖÜ][a-zäöüß]+(?:straße|str\.|weg|platz|allee))\s+(\d+[a-z]?)/i;
    const match = text.match(addressPattern);
    return match ? `${match[1]} ${match[2]}, 32816 Schieder-Schwalenberg` : null;
  }

  private extractOpeningHours(text: string): string | null {
    // Look for opening hours patterns
    const hoursPattern = /(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/;
    const match = text.match(hoursPattern);
    return match ? match[0] : null;
  }

  private extractContactPerson(text: string): string | null {
    // Look for names (capitalized words)
    const namePattern = /(?:Ansprechpartner|Kontakt):\s*([A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+)/;
    const match = text.match(namePattern);
    return match ? match[1].trim() : null;
  }

  private determineInstitutionType(category: string): string {
    if (category.includes('Bildung')) return 'Bildungseinrichtung';
    if (category.includes('Sport')) return 'Sporteinrichtung';
    if (category.includes('Soziales')) return 'Sozialeinrichtung';
    return 'Sonstige';
  }
}

// Singleton instance
export const databasePopulator = new DatabasePopulator();

