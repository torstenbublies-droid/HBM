import * as cheerio from 'cheerio';
import { getDb, db } from '../db.js';

const EVENTS_URL = 'https://www.schieder-schwalenberg.de/Tourismus/Tourismus-und-Freizeit/Service/Veranstaltungskalender/';

interface ScrapedEvent {
  id: string;
  title: string;
  description: string | null;
  startDate: Date;
  endDate: Date | null;
  location: string | null;
  sourceUrl: string;
}

export async function scrapeVeranstaltungen(): Promise<{ success: boolean; message: string; events?: ScrapedEvent[] }> {
  try {
    console.log('Fetching events from:', EVENTS_URL);
    
    const response = await fetch(EVENTS_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    const events: ScrapedEvent[] = [];
    
    // Find all event entries
    $('a[href*="object=tx"]').each((index, element) => {
      if (index >= 15) return false; // Only get first 15
      
      const $el = $(element);
      const href = $el.attr('href');
      
      if (!href) return;
      
      // Extract text content
      const fullText = $el.text().trim();
      
      // Parse date and title from text
      // Format: "DD.MM.YYYY / HH:MM BIS HH:MM UHR Title..."
      // or: "DD.MM.YYYY BIS DD.MM.YYYY Title..."
      const dateMatch = fullText.match(/(\d{2}\.\d{2}\.\d{4})/);
      const timeMatch = fullText.match(/(\d{2}:\d{2})\s+BIS\s+(\d{2}:\d{2})/);
      const dateRangeMatch = fullText.match(/(\d{2}\.\d{2}\.\d{4})\s+BIS\s+(\d{2}\.\d{2}\.\d{4})/);
      
      if (!dateMatch) return;
      
      const startDateStr = dateMatch[1];
      const [day, month, year] = startDateStr.split('.').map(Number);
      const startDate = new Date(year, month - 1, day);
      
      let endDate: Date | null = null;
      if (dateRangeMatch) {
        const endDateStr = dateRangeMatch[2];
        const [endDay, endMonth, endYear] = endDateStr.split('.').map(Number);
        endDate = new Date(endYear, endMonth - 1, endDay);
      }
      
      // Extract title (text after date/time info)
      let title = fullText;
      if (timeMatch) {
        title = fullText.split(timeMatch[0])[1]?.trim() || fullText;
      } else if (dateRangeMatch) {
        title = fullText.split(dateRangeMatch[0])[1]?.trim() || fullText;
      } else if (dateMatch) {
        title = fullText.split(dateMatch[0])[1]?.trim() || fullText;
      }
      
      // Clean up title
      title = title.replace(/^[\s\/]+/, '').trim();
      if (title.length > 200) {
        title = title.substring(0, 200);
      }
      
      // Try to find location in the parent or sibling elements
      const $parent = $el.closest('.event-item, .veranstaltung, div');
      const locationText = $parent.find('[class*="location"], [class*="ort"]').text().trim();
      
      const event: ScrapedEvent = {
        id: `event_${Date.now()}_${index}`,
        title: title || 'Veranstaltung',
        description: null,
        startDate,
        endDate,
        location: locationText || null,
        sourceUrl: href.startsWith('http') ? href : `https://www.schieder-schwalenberg.de${href}`
      };
      
      events.push(event);
    });
    
    console.log(`Found ${events.length} events`);
    
    // Save to database
    const database = await getDb();
    if (!database) {
      return { success: false, message: 'Database not available' };
    }
    
    let savedCount = 0;
    for (const event of events) {
      try {
        await database.insert(db.events).values({
          id: event.id,
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          sourceUrl: event.sourceUrl,
          createdAt: new Date()
        }).onConflictDoNothing();
        savedCount++;
      } catch (error) {
        console.error(`Error saving event ${event.title}:`, error);
      }
    }
    
    return {
      success: true,
      message: `Scraped ${events.length} events, saved ${savedCount}`,
      events
    };
    
  } catch (error) {
    console.error('Error scraping events:', error);
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

