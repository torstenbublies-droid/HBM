import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { nanoid } from 'nanoid';
import { fullWebsiteCrawler } from './fullWebsiteCrawler';

interface ExportResult {
  success: boolean;
  newsExported: number;
  eventsExported: number;
  departmentsExported: number;
  poisExported: number;
  institutionsExported: number;
  exportPath: string;
}

export class DataExporter {
  private exportDir = join(process.cwd(), 'data-export');

  /**
   * Hauptmethode zum Exportieren der gecrawlten Daten als JSON
   */
  async exportToJSON(): Promise<ExportResult> {
    console.log('[Data Exporter] Starting data export...');

    // Create export directory
    try {
      mkdirSync(this.exportDir, { recursive: true });
    } catch (error) {
      console.error('[Data Exporter] Failed to create export directory:', error);
    }

    let newsExported = 0;
    let eventsExported = 0;
    let departmentsExported = 0;
    let poisExported = 0;
    let institutionsExported = 0;

    try {
      // First, crawl the website
      console.log('[Data Exporter] Crawling website...');
      const crawlResult = await fullWebsiteCrawler.crawlWebsite();
      console.log(`[Data Exporter] Crawled ${crawlResult.totalPages} pages`);

      // Get all pages
      const allPages = fullWebsiteCrawler.getCrawledPages();

      // Filter pages by category
      const newsPages = allPages.filter(page => 
        page.url.toLowerCase().includes('bekanntmachung') ||
        page.title.toLowerCase().includes('bekanntmachung') ||
        page.category === 'Bekanntmachungen'
      );
      console.log(`[Data Exporter] Found ${newsPages.length} news pages`);

      const eventPages = allPages.filter(page => 
        page.url.toLowerCase().includes('veranstaltung') ||
        page.title.toLowerCase().includes('veranstaltung') ||
        page.category === 'Veranstaltungen'
      );
      console.log(`[Data Exporter] Found ${eventPages.length} event pages`);

      const deptPages = allPages.filter(page => 
        (page.url.toLowerCase().includes('rathaus') ||
         page.url.toLowerCase().includes('verwaltung') ||
         page.category === 'Rathaus') &&
        !page.url.toLowerCase().includes('bekanntmachung')
      );
      console.log(`[Data Exporter] Found ${deptPages.length} department pages`);

      const poiPages = allPages.filter(page => 
        page.url.toLowerCase().includes('tourismus') ||
        page.url.toLowerCase().includes('sehenswuerdigkeit') ||
        page.url.toLowerCase().includes('freizeit') ||
        page.category === 'Tourismus'
      );
      console.log(`[Data Exporter] Found ${poiPages.length} POI pages`);

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
      console.log(`[Data Exporter] Found ${institutionPages.length} institution pages`);

      // Export News
      const newsData = newsPages.map(page => ({
        id: nanoid(),
        title: page.title,
        summary: page.content.substring(0, 200),
        content: page.content,
        category: 'Bekanntmachung',
        publishedAt: this.extractDate(page.content) || new Date(),
        source: page.url,
        imageUrl: null,
      }));
      this.writeJSON('news.json', newsData);
      newsExported = newsData.length;

      // Export Events
      const eventsData = eventPages.map(page => {
        const startDate = this.extractDate(page.content) || new Date();
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 2);

        return {
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
      });
      this.writeJSON('events.json', eventsData);
      eventsExported = eventsData.length;

      // Export Departments
      const departmentsData = deptPages.map(page => ({
        id: nanoid(),
        name: page.title,
        description: page.content.substring(0, 300),
        contactPerson: this.extractContactPerson(page.content),
        phone: this.extractPhone(page.content),
        email: this.extractEmail(page.content),
        officeHours: 'Mo-Fr 08:00-12:00 Uhr, Do 14:00-17:00 Uhr',
        location: 'Rathaus Schieder-Schwalenberg',
      }));
      this.writeJSON('departments.json', departmentsData);
      departmentsExported = departmentsData.length;

      // Export POIs
      const poisData = poiPages.map(page => ({
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
      }));
      this.writeJSON('pois.json', poisData);
      poisExported = poisData.length;

      // Export Institutions
      const institutionsData = institutionPages.map(page => ({
        id: nanoid(),
        name: page.title,
        type: this.determineInstitutionType(page.category),
        description: page.content.substring(0, 300),
        address: this.extractAddress(page.content),
        phone: this.extractPhone(page.content),
        email: this.extractEmail(page.content),
        website: page.url,
        openingHours: this.extractOpeningHours(page.content),
      }));
      this.writeJSON('institutions.json', institutionsData);
      institutionsExported = institutionsData.length;

      console.log('[Data Exporter] Data export complete');

      return {
        success: true,
        newsExported,
        eventsExported,
        departmentsExported,
        poisExported,
        institutionsExported,
        exportPath: this.exportDir,
      };

    } catch (error) {
      console.error('[Data Exporter] Fatal error:', error);
      
      return {
        success: false,
        newsExported,
        eventsExported,
        departmentsExported,
        poisExported,
        institutionsExported,
        exportPath: this.exportDir,
      };
    }
  }

  /**
   * Schreibt Daten als JSON-Datei
   */
  private writeJSON(filename: string, data: any) {
    const filepath = join(this.exportDir, filename);
    writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`[Data Exporter] Wrote ${data.length} items to ${filename}`);
  }

  /**
   * Hilfsfunktionen zum Extrahieren von Informationen
   */

  private extractDate(text: string): Date | null {
    const datePattern = /(\d{1,2})\.(\d{1,2})\.(\d{2,4})/;
    const match = text.match(datePattern);
    
    if (match) {
      const day = parseInt(match[1]);
      const month = parseInt(match[2]) - 1;
      let year = parseInt(match[3]);
      
      if (year < 100) {
        year += 2000;
      }
      
      return new Date(year, month, day);
    }
    
    return null;
  }

  private extractLocation(text: string): string | null {
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
    const addressPattern = /([A-ZÄÖÜ][a-zäöüß]+(?:straße|str\.|weg|platz|allee))\s+(\d+[a-z]?)/i;
    const match = text.match(addressPattern);
    return match ? `${match[1]} ${match[2]}, 32816 Schieder-Schwalenberg` : null;
  }

  private extractOpeningHours(text: string): string | null {
    const hoursPattern = /(\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2})/;
    const match = text.match(hoursPattern);
    return match ? match[0] : null;
  }

  private extractContactPerson(text: string): string | null {
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
export const dataExporter = new DataExporter();

