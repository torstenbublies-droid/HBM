import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

interface EventItem {
  title: string;
  description: string;
  location: string;
  month: number;
  day: number;
}

async function importHornBadMeinbergEvents() {
  console.log('[Scraper] Starting Horn-Bad Meinberg events import...');
  
  try {
    const currentYear = new Date().getFullYear();
    
    // Manual event data from the website
    const events: EventItem[] = [
      {
        title: 'Frühlingsfest in Horn',
        description: 'Buntes Kirmestreiben rund ums Rathaus vor Ostern',
        location: 'Horn, Rathaus',
        month: 3,
        day: 20
      },
      {
        title: 'Osterfeuer',
        description: 'Als traditioneller Brauch werden in verschiedenen Stadtteilen Osterfeuer angezündet: Bad Meinberg, Billerbeck, Feldrom, Wehren und anderen Stadtteilen',
        location: 'Verschiedene Stadtteile',
        month: 3,
        day: 31
      },
      {
        title: 'Weinfest in Bad Meinberg',
        description: 'Ein Fest rund um den Wein Ende Mai',
        location: 'Bad Meinberg',
        month: 5,
        day: 25
      },
      {
        title: 'Kurpark-Sommerfest',
        description: 'Sommerfest im Kurpark Bad Meinberg',
        location: 'Kurpark Bad Meinberg',
        month: 8,
        day: 15
      },
      {
        title: 'Hörnchenfest in Horn',
        description: 'Das Altstadtvergnügen mit verlängerter Einkaufsmöglichkeit am Samstag - Letztes Wochenende im September',
        location: 'Horn, Altstadt',
        month: 9,
        day: 28
      },
      {
        title: 'Beller Schnirz',
        description: 'Traditionelles Volksfest im Stadtteil Belle - 3. Wochenende im Oktober',
        location: 'Belle',
        month: 10,
        day: 18
      },
      {
        title: 'Bauernmarkt in Bad Meinberg',
        description: 'Traditioneller Bauernmarkt in der Bad Meinberger Allee - 3. Wochenende im Oktober',
        location: 'Bad Meinberg, Allee',
        month: 10,
        day: 19
      },
      {
        title: 'Kläschen in Horn',
        description: 'Traditionelles Fest mit Kirmes rund um das Rathaus und verkaufsoffenem Sonntag - 3. Wochenende vor dem 1. Advent',
        location: 'Horn, Rathaus',
        month: 11,
        day: 10
      },
      {
        title: 'Christkindlmarkt in Bad Meinberg',
        description: 'Veranstaltungsort ist der Kurpark und das Kurgastzentrum - 3. Advent',
        location: 'Kurpark und Kurgastzentrum Bad Meinberg',
        month: 12,
        day: 15
      },
      {
        title: 'Schützenfeste in sieben Stadtteilen',
        description: 'Die traditionellen Schützengesellschaften veranstalten jeweils in ihren Stadtteilen Schützenfeste: Bad Meinberg, Belle, Bellenberg, Feldrom, Horn, Kempen, Wehren',
        location: 'Verschiedene Stadtteile',
        month: 6,
        day: 15
      }
    ];
    
    console.log(`[Scraper] Importing ${events.length} events`);
    
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
        const startDate = new Date(currentYear, event.month - 1, event.day);
        
        // Check if event already exists (by title)
        const existing = await sql`
          SELECT id FROM events 
          WHERE tenant_id = ${tenantId} 
          AND title = ${event.title}
          LIMIT 1
        `;
        
        if (existing && existing.length > 0) {
          skipped++;
          continue;
        }
        
        // Insert new event
        await sql`
          INSERT INTO events (
            tenant_id,
            title,
            description,
            location,
            start_date,
            end_date,
            source_url
          ) VALUES (
            ${tenantId},
            ${event.title},
            ${event.description},
            ${event.location},
            ${startDate.toISOString()},
            ${null},
            ${'https://www.horn-badmeinberg.de/Leben-Freizeit/Veranstaltungen/Traditionelle-Feste/#' + event.title.toLowerCase().replace(/\s+/g, '-')}
          )
        `;
        
        inserted++;
        console.log(`[Scraper] ✓ Inserted: ${event.title}`);
        
        // Small delay to ensure unique IDs
        await new Promise(resolve => setTimeout(resolve, 10));
        
      } catch (error) {
        console.error(`[Scraper] Error inserting event:`, error);
      }
    }
    
    console.log(`[Scraper] ✓ Import complete!`);
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
importHornBadMeinbergEvents()
  .then(() => {
    console.log('[Scraper] Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[Scraper] Failed:', error);
    process.exit(1);
  });
