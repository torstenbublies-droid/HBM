import axios from 'axios';
import * as cheerio from 'cheerio';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

interface NewsItem {
  title: string;
  content: string;
  publishedAt: Date;
  url: string;
  imageUrl?: string;
}

async function scrapeHornBadMeinbergNews() {
  console.log('[Scraper] Starting Horn-Bad Meinberg news scraping...');
  
  try {
    // Fetch the news page
    const response = await axios.get('https://www.horn-badmeinberg.de/Verwaltung/Nachrichten/');
    const $ = cheerio.load(response.data);
    
    const newsItems: NewsItem[] = [];
    
    // Find the news list container (skip navigation)
    let newsCount = 0;
    
    // Parse each news item from the list
    $('ul li').each((index, element) => {
      if (newsCount >= 15) return false; // Only get first 15 items
      
      const $item = $(element);
      const $link = $item.find('a');
      
      if (!$link.length) return;
      
      const url = $link.attr('href');
      if (!url) return;
      
      // Skip navigation links
      if (!url.includes('Nachrichten') || url.includes('index.php')) return;
      
      // Make URL absolute
      const fullUrl = url.startsWith('http') ? url : `https://www.horn-badmeinberg.de${url}`;
      
      // Extract title (first line of text)
      const fullText = $link.text().trim();
      const lines = fullText.split('\n').map(l => l.trim()).filter(l => l);
      
      let title = '';
      let dateStr = '';
      let content = '';
      
      // Parse structure: Title, Datum: DD.MM.YYYY, Content
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (i === 0 && !line.startsWith('Datum:')) {
          title = line;
        } else if (line.startsWith('Datum:')) {
          dateStr = line.replace('Datum:', '').trim();
        } else if (!line.includes('Mehr') && !line.includes('©') && line.length > 10) {
          content += line + ' ';
        }
      }
      
      if (!title || title.length < 10) return;
      
      // Parse date (format: DD.MM.YYYY)
      let publishedAt = new Date();
      if (dateStr) {
        const [day, month, year] = dateStr.split('.');
        if (day && month && year) {
          publishedAt = new Date(`${year}-${month}-${day}`);
        }
      }
      
      // Extract image URL
      const $img = $link.find('img');
      let imageUrl: string | undefined;
      if ($img.length) {
        const imgSrc = $img.attr('src');
        if (imgSrc) {
          imageUrl = imgSrc.startsWith('http') ? imgSrc : `https://www.horn-badmeinberg.de${imgSrc}`;
        }
      }
      
      newsItems.push({
        title: title.trim(),
        content: content.trim() || title.trim(),
        publishedAt,
        url: fullUrl,
        imageUrl
      });
      
      newsCount++;
    });
    
    console.log(`[Scraper] Found ${newsItems.length} news items`);
    
    // Get tenant ID for hornbadmeinberg
    const tenant = await sql`
      SELECT id FROM tenants WHERE slug = 'hornbadmeinberg' LIMIT 1
    `;
    
    if (!tenant || tenant.length === 0) {
      throw new Error('Tenant hornbadmeinberg not found');
    }
    
    const tenantId = tenant[0].id;
    console.log(`[Scraper] Using tenant ID: ${tenantId}`);
    
    // Insert news items into database
    let inserted = 0;
    let skipped = 0;
    
    for (const item of newsItems) {
      try {
        // Check if news already exists
        const existing = await sql`
          SELECT id FROM news 
          WHERE "tenantId" = ${tenantId} 
          AND "sourceUrl" = ${item.url}
          LIMIT 1
        `;
        
        if (existing && existing.length > 0) {
          skipped++;
          continue;
        }
        
        // Insert new news item
        await sql`
          INSERT INTO news (
            id,
            "tenantId",
            title,
            teaser,
            "bodyMD",
            "publishedAt",
            "sourceUrl",
            "imageUrl",
            "createdAt"
          ) VALUES (
            ${'news_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)},
            ${tenantId},
            ${item.title},
            ${item.content.substring(0, 500)},
            ${item.content},
            ${item.publishedAt.toISOString()},
            ${item.url},
            ${item.imageUrl || null},
            NOW()
          )
        `;
        
        inserted++;
        console.log(`[Scraper] ✓ Inserted: ${item.title.substring(0, 60)}...`);
        
      } catch (error) {
        console.error(`[Scraper] Error inserting news item:`, error);
      }
    }
    
    console.log(`[Scraper] ✓ Scraping complete!`);
    console.log(`[Scraper]   - Inserted: ${inserted}`);
    console.log(`[Scraper]   - Skipped (duplicates): ${skipped}`);
    console.log(`[Scraper]   - Total: ${newsItems.length}`);
    
    await sql.end();
    
  } catch (error) {
    console.error('[Scraper] Error:', error);
    await sql.end();
    throw error;
  }
}

// Run scraper
scrapeHornBadMeinbergNews()
  .then(() => {
    console.log('[Scraper] Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[Scraper] Failed:', error);
    process.exit(1);
  });
