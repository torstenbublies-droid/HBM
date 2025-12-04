import axios from 'axios';
import * as cheerio from 'cheerio';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'buergerapp',
  user: 'buergerapp_user',
  password: 'buergerapp_dev_2025',
  client_encoding: 'UTF8'
});

const TENANT_ID = 'tenant_hornbadmeinberg_001';
const BASE_URL = 'https://www.hornbadmeinberg.de';
const ATTRACTIONS_URL = `${BASE_URL}/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html`;
const IMAGES_DIR = path.join(__dirname, '../../public/assets/hornbadmeinberg/attractions');

// Create images directory if it doesn't exist
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

interface Attraction {
  name: string;
  description: string;
  imageUrl: string;
  localImagePath: string;
  address: string;
  moreInfoUrl: string;
  category: string;
}

async function downloadImage(url: string, filename: string): Promise<string> {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const filepath = path.join(IMAGES_DIR, filename);
    fs.writeFileSync(filepath, response.data);
    console.log(`✓ Downloaded image: ${filename}`);
    return `/assets/hornbadmeinberg/attractions/${filename}`;
  } catch (error) {
    console.error(`✗ Failed to download image ${url}:`, error);
    return '';
  }
}

async function scrapeAttractions(): Promise<Attraction[]> {
  console.log('Fetching attractions page...');
  
  const response = await axios.get(ATTRACTIONS_URL, {
    responseType: 'arraybuffer',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  // Convert to UTF-8
  const html = Buffer.from(response.data, 'binary').toString('utf-8');
  const $ = cheerio.load(html);

  const attractions: Attraction[] = [];
  let displayOrder = 0;

  // Find all attraction sections (each has an image, title, description, and address)
  $('img[alt]').each((index, element) => {
    const $img = $(element);
    const imageUrl = $img.attr('src');
    const altText = $img.attr('alt');
    
    if (!imageUrl || !altText) return;

    // Get full image URL
    const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`;
    
    // Find the next heading (h3 or strong) after the image
    let $current = $img.parent();
    let name = '';
    let description = '';
    let address = '';
    let moreInfoUrl = '';

    // Look for the title (usually in a heading or strong tag)
    const $nextHeading = $current.nextAll('h3, p:has(strong)').first();
    if ($nextHeading.length) {
      name = $nextHeading.find('strong').first().text().trim() || $nextHeading.text().trim();
    }

    // Get description (paragraphs after the image)
    const $paragraphs = $img.parent().nextAll('p');
    const descriptionParts: string[] = [];
    
    $paragraphs.each((i, p) => {
      const text = $(p).text().trim();
      // Stop if we hit an address or empty paragraph
      if (text && !text.match(/^\d{5}/) && descriptionParts.length < 3) {
        descriptionParts.push(text);
      }
      
      // Extract address if present
      if (text.match(/^\d{5}/)) {
        address = text;
      }
    });

    description = descriptionParts.join('\n\n');

    // Skip if no name found
    if (!name || name.length < 3) {
      name = altText; // Use alt text as fallback
    }

    // Generate filename from name
    const filename = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50)}.jpg`;

    attractions.push({
      name,
      description: description || altText,
      imageUrl: fullImageUrl,
      localImagePath: filename,
      address,
      moreInfoUrl: '', // Will be set later if available
      category: 'Sehenswürdigkeiten'
    });

    displayOrder++;
  });

  console.log(`Found ${attractions.length} attractions`);
  return attractions;
}

async function importAttractions() {
  try {
    console.log('Starting attractions scraper for Horn-Bad Meinberg...\n');

    // Scrape attractions
    const attractions = await scrapeAttractions();

    // Download images
    console.log('\nDownloading images...');
    for (const attraction of attractions) {
      const localPath = await downloadImage(attraction.imageUrl, attraction.localImagePath);
      if (localPath) {
        attraction.localImagePath = localPath;
      }
      // Add delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Clear existing attractions for this tenant
    console.log('\nClearing existing attractions...');
    await pool.query('DELETE FROM attractions WHERE tenant_id = $1', [TENANT_ID]);

    // Insert new attractions
    console.log('Inserting attractions into database...');
    let inserted = 0;
    
    for (let i = 0; i < attractions.length; i++) {
      const attraction = attractions[i];
      
      try {
        await pool.query(
          `INSERT INTO attractions (
            tenant_id, name, description, category, image_url, address, more_info_url, display_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            TENANT_ID,
            attraction.name,
            attraction.description,
            attraction.category,
            attraction.localImagePath,
            attraction.address,
            attraction.moreInfoUrl,
            i
          ]
        );
        inserted++;
        console.log(`✓ Inserted: ${attraction.name}`);
      } catch (error) {
        console.error(`✗ Failed to insert ${attraction.name}:`, error);
      }
    }

    console.log(`\n✅ Successfully imported ${inserted} attractions!`);
    
    // Show summary
    const result = await pool.query(
      'SELECT category, COUNT(*) as count FROM attractions WHERE tenant_id = $1 GROUP BY category',
      [TENANT_ID]
    );
    console.log('\nSummary:');
    result.rows.forEach(row => {
      console.log(`  ${row.category}: ${row.count} attractions`);
    });

  } catch (error) {
    console.error('Error importing attractions:', error);
  } finally {
    await pool.end();
  }
}

// Run the scraper
importAttractions();
