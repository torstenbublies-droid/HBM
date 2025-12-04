import axios from 'axios';
import * as cheerio from 'cheerio';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

interface EventItem {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate?: Date;
}

async function scrapeHornBadMeinbergEvents() {
  console.log('[Scraper] Starting Horn-Bad Meinberg events scraping...');
  
  try {
    // Fetch the events page
    const response = await axios.get('https://www.horn-badmeinberg.de/Leben-Freizeit/Veranstaltungen/Traditionelle-Feste/');
    const $ = cheerio.load(response.data);
    
    const events: EventItem[] = [];
    const currentYear = new Date().getFullYear();
    
    // Parse events from the page
    // Structure: Month heading, then event entries
    let currentMonth = 0;
    
    $('p, h3').each((index, element) => {
      const $elem = $(element);
      const text = $elem.text().trim();
      
      // Check if it's a month heading
      if ($elem.is('em') || text.match(/^(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)/i)) {
        const monthMatch = text.match(/(Januar|Februar|März|April|Mai|Juni|Juli|August|September|Oktober|November|Dezember)/i);
        if (monthMatch) {
          const monthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
          currentMonth = monthNames.findIndex(m => m.toLowerCase() === monthMatch[1].toLowerCase()) + 1;
        }
      }
      
      // Parse event entries
      if ($elem.is('p') && !$elem.is('em')) {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);
        
        if (lines.length >= 2) {
          const title = lines[0];
          const description = lines.slice(1, -1).join(' ');
          const timing = lines[lines.length - 1];
          
          // Skip if title is too short or contains navigation text
          if (title.length < 5 || title.includes('zur')) return;
          
          // Determine date based on timing info
          let startDate = new Date(currentYear, currentMonth - 1, 15); // Default to mid-month
          
          // Parse specific timing
          if (timing.includes('vor Ostern')) {
            startDate = new Date(currentYear, 2, 20); // Late March
          } else if (timing.includes('Ende Mai')) {
            startDate = new Date(currentYear, 4, 25);
          } else if (timing.includes('Letztes Wochenende im September')) {
            startDate = new Date(currentYear, 8, 25);
          } else if (timing.includes('3. Wochenende im Oktober')) {
            startDate = new Date(currentYear, 9, 15);
          } else if (timing.includes('3. Wochenende vor dem 1. Advent')) {
            startDate = new Date(currentYear, 10, 10);
          } else if (timing.includes('3. Advent')) {
            startDate = new Date(currentYear, 11, 15);
          } else if (timing.includes('Übers Jahr')) {
            startDate = new Date(currentYear, 5, 1); // Mid-year
          }
          
          // Extract location
          let location = 'Horn-Bad Meinberg';
          if (title.includes('Horn')) location = 'Horn';
          else if (title.includes('Bad Meinberg')) location = 'Bad Meinberg';
          else if (title.includes('Belle')) location = 'Belle';
          else if (title.includes('Bellenberg')) location = 'Bellenberg';
          else if (title.includes('Feldrom')) location = 'Feldrom';
          else if (title.includes('Wehren')) location = 'Wehren';
          else if (title.includes('Kempen')) location = 'Kempen';
          else if (title.includes('Kurpark')) location = 'Kurpark Bad Meinberg';
          
          events.push({
            title,
            description: description || timing,
            location,
            startDate,
            endDate: undefined
          });
        }
      }
    });
    
    console.log(`[Scraper] Found ${events.length} events`);
    
    // Get tenant ID for hornbadmeinberg
    const tenant = await sql`
      SELECT id FROM tenants WHERE slug = 'hornbadmeinberg' LIMIT 1
    `;
    
    if (!tenant || tenant.length === 0) {
      throw new Error('Tenant hornbadmeinberg not found');
    }
    
    const tenantId = tenant[0].id;
    console.log(`[Scraper] Using tenant ID: ${tenantId}`);
    
    // Insert events into database
    let inserted = 0;
    let skipped = 0;
    
    for (const event of events) {
      try {
        // Check if event already exists (by title and date)
        const existing = await sql`
          SELECT id FROM events 
          WHERE "tenantId" = ${tenantId} 
          AND title = ${event.title}
          AND "startDate" = ${event.startDate.toISOString()}
          LIMIT 1
        `;
        
        if (existing && existing.length > 0) {
          skipped++;
          continue;
        }
        
        // Insert new event
        await sql`
          INSERT INTO events (
            id,
            "tenantId",
            title,
            description,
            location,
            "startDate",
            "endDate",
            "createdAt"
          ) VALUES (
            ${'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)},
            ${tenantId},
            ${event.title},
            ${event.description},
            ${event.location},
            ${event.startDate.toISOString()},
            ${event.endDate ? event.endDate.toISOString() : null},
            NOW()
          )
        `;
        
        inserted++;
        console.log(`[Scraper] ✓ Inserted: ${event.title}`);
        
      } catch (error) {
        console.error(`[Scraper] Error inserting event:`, error);
      }
    }
    
    console.log(`[Scraper] ✓ Scraping complete!`);
    console.log(`[Scraper]   - Inserted: ${inserted}`);
    console.log(`[Scraper]   - Skipped (duplicates): ${skipped}`);
    console.log(`[Scraper]   - Total: ${events.length}`);
    
    await sql.end();
    
  } catch (error) {
    console.error('[Scraper] Error:', error);
    await sql.end();
    throw error;
  }
}

// Run scraper
scrapeHornBadMeinbergEvents()
  .then(() => {
    console.log('[Scraper] Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[Scraper] Failed:', error);
    process.exit(1);
  });
