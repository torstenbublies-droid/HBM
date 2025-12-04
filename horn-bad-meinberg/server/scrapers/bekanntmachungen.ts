import { load } from 'cheerio';
import { getDb } from '../db';
import { news } from '../../drizzle/schema';
import { nanoid } from 'nanoid';

const BEKANNTMACHUNGEN_URL = 'https://www.schieder-schwalenberg.de/Bürger-und-Service/Rathaus/Bekanntmachungen';

interface Bekanntmachung {
  title: string;
  date: string;
  teaser: string;
  sourceUrl: string;
}

export async function scrapeBekanntmachungen(): Promise<void> {
  try {
    console.log('🔄 Scraping Bekanntmachungen from Stadt Schieder-Schwalenberg...');
    
    const response = await fetch(BEKANNTMACHUNGEN_URL);
    const html = await response.text();
    const $ = load(html);
    
    const bekanntmachungen: Bekanntmachung[] = [];
    
    // Extract announcements - the page shows them in a structured list
    const pageText = $('body').text();
    
    // Find all dates in DD.MM.YYYY format
    const dateRegex = /(\d{2}\.\d{2}\.\d{4})/g;
    const lines = pageText.split('\n').map(l => l.trim()).filter(l => l);
    
    for (let i = 0; i < lines.length && bekanntmachungen.length < 15; i++) {
      const line = lines[i];
      const dateMatch = line.match(dateRegex);
      
      if (dateMatch && dateMatch[0]) {
        const date = dateMatch[0];
        
        // Look for title in next few lines
        let title = '';
        let teaser = '';
        
        // Check next lines for title (usually 1-3 lines after date)
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const nextLine = lines[j].trim();
          
          // Skip empty lines and very short lines
          if (nextLine.length < 10) continue;
          
          // Skip lines that are just dates
          if (nextLine.match(/^\d{2}\.\d{2}\.\d{4}$/)) break;
          
          // Skip navigation items
          if (nextLine.match(/^(Mehr|mehr|Textanriss|überspringen|Seite:)$/)) continue;
          
          // This is likely the title
          if (!title && nextLine.length > 15 && nextLine.length < 300) {
            title = nextLine.replace(/Mehr$/, '').replace(/\s+/g, ' ').trim();
            
            // Get teaser from following lines
            for (let k = j + 1; k < Math.min(j + 3, lines.length); k++) {
              const teaserLine = lines[k].trim();
              if (teaserLine.length > 20 && teaserLine.length < 500 && !teaserLine.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
                teaser = teaserLine.replace(/Mehr$/, '').replace(/\s+/g, ' ').trim();
                break;
              }
            }
            break;
          }
        }
        
        if (title && title.length > 10) {
          bekanntmachungen.push({
            title: title.substring(0, 400), // Limit title length
            date: parseDate(date),
            teaser: teaser ? teaser.substring(0, 400) : title.substring(0, 200),
            sourceUrl: BEKANNTMACHUNGEN_URL
          });
        }
      }
    }
    
    // Remove duplicates based on title
    const uniqueBekanntmachungen = bekanntmachungen.filter((item, index, self) =>
      index === self.findIndex((t) => t.title === item.title)
    );
    
    console.log(`📊 Found ${uniqueBekanntmachungen.length} unique Bekanntmachungen`);
    
    // Store in database
    const database = await getDb();
    if (!database) {
      throw new Error('Database not available');
    }
    
    let savedCount = 0;
    for (const item of uniqueBekanntmachungen) {
      try {
        await database.insert(news).values({
          id: `bekannt_${nanoid(12)}`,
          title: item.title,
          teaser: item.teaser,
          bodyMD: item.teaser,
          category: 'Bekanntmachungen',
          publishedAt: new Date(item.date),
          sourceUrl: item.sourceUrl,
          createdAt: new Date()
        }).onConflictDoNothing();
        
        savedCount++;
        console.log(`✅ Saved: ${item.title.substring(0, 60)}...`);
      } catch (error) {
        console.error(`❌ Error saving item "${item.title.substring(0, 40)}":`, error);
      }
    }
    
    console.log(`✅ Bekanntmachungen scraping completed: ${savedCount}/${uniqueBekanntmachungen.length} saved`);
    
  } catch (error) {
    console.error('❌ Error scraping Bekanntmachungen:', error);
    throw error;
  }
}

function parseDate(dateStr: string): string {
  // Parse German date format: DD.MM.YYYY
  const match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }
  
  // Fallback to current date
  return new Date().toISOString().split('T')[0];
}

// Run immediately if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeBekanntmachungen()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

