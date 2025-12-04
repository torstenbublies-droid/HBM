import axios from 'axios';
import * as cheerio from 'cheerio';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'buergerapp',
  user: 'buergerapp_user',
  password: 'buergerapp_dev_2025',
});

interface Club {
  name: string;
  category: 'Sportvereine' | 'Vereine';
  contactPerson?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}

// Sportvereine-Keywords für automatische Kategorisierung
const sportKeywords = [
  'sport', 'fußball', 'tennis', 'tischtennis', 'volleyball', 'handball',
  'basketball', 'schwimmen', 'dlrg', 'schützen', 'schieß', 'tus', 'tsv',
  'turn', 'gym', 'fitness', 'lauf', 'marathon', 'triathlon', 'rad',
  'segel', 'wasser', 'ruder', 'kanu', 'ski', 'wandern', 'berg'
];

function categorizeClub(name: string): 'Sportvereine' | 'Vereine' {
  const lowerName = name.toLowerCase();
  
  // Prüfe ob ein Sport-Keyword im Namen vorkommt
  for (const keyword of sportKeywords) {
    if (lowerName.includes(keyword)) {
      return 'Sportvereine';
    }
  }
  
  return 'Vereine';
}

async function scrapeClubsPage(url: string): Promise<Club[]> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const clubs: Club[] = [];
    const seenNames = new Set<string>();

    // Finde alle Vereins-Container (jeder Verein ist in einem eigenen Abschnitt)
    $('a[href*="Vereine/"][title*="Detailansicht"]').each((_, element) => {
      const $link = $(element);
      
      // Finde den Container, der alle Infos für diesen Verein enthält
      const $container = $link.closest('div, td, tr').parent();
      
      // Extrahiere Vereinsname aus dem Bild-Alt-Text oder Link
      let name = $link.find('img').attr('alt') || '';
      
      // Fallback: Suche im nächsten Text-Element
      if (!name || name === 'Alternativbild') {
        const $nextText = $link.next();
        name = $nextText.text().trim().split('\n')[0].trim();
      }
      
      // Bereinige den Namen
      name = name
        .replace(/\s+/g, ' ')
        .replace(/^\d+\.\s*/, '') // Entferne führende Nummern
        .trim();
      
      // Validierung des Namens
      if (!name || 
          name.length < 3 || 
          name.includes('Detailansicht') ||
          name.includes('Karte anzeigen') ||
          name.includes('Alternativbild') ||
          seenNames.has(name)) {
        return;
      }
      
      seenNames.add(name);
      
      // Extrahiere Kontaktdaten aus dem Container
      const containerText = $container.text();
      
      // Kontaktperson (erste Zeile nach dem Vereinsnamen)
      let contactPerson = '';
      const lines = containerText.split('\n').map(l => l.trim()).filter(l => l);
      const nameIndex = lines.findIndex(l => l.includes(name));
      if (nameIndex >= 0 && nameIndex + 1 < lines.length) {
        const nextLine = lines[nameIndex + 1];
        // Prüfe ob es eine Rolle ist (Vorsitzender, etc.)
        if (nextLine.match(/vorsitzender|leiter|kontakt/i)) {
          contactPerson = lines[nameIndex + 2] || '';
        } else {
          contactPerson = nextLine;
        }
      }
      
      // Adresse (Straße + PLZ/Ort)
      let address = '';
      const addressMatch = containerText.match(/([A-Za-zäöüÄÖÜß\s]+\d+[a-z]?)\s+(\d{5}\s+[A-Za-zäöüÄÖÜß\s-]+)/);
      if (addressMatch) {
        address = `${addressMatch[1]}, ${addressMatch[2]}`.trim();
      }
      
      // Telefon
      let phone = '';
      const phoneMatch = containerText.match(/(\d{4,5}\s*[\/\-]\s*\d{4,})/);
      if (phoneMatch) {
        phone = phoneMatch[1].trim();
      }
      
      // E-Mail
      let email = '';
      const $emailLink = $container.find('a[href^="mailto:"]');
      if ($emailLink.length > 0) {
        email = $emailLink.attr('href')?.replace('mailto:', '') || '';
      }
      
      // Website
      let website = '';
      const $websiteLink = $container.find('a[href^="http"]').not('[href*="maps.google"]').not('[href*="schieder-schwalenberg.de"]');
      if ($websiteLink.length > 0) {
        website = $websiteLink.attr('href') || '';
      }
      
      clubs.push({
        name,
        category: categorizeClub(name),
        contactPerson: contactPerson || undefined,
        address: address || undefined,
        phone: phone || undefined,
        email: email || undefined,
        website: website || undefined,
      });
    });

    return clubs;
  } catch (error) {
    console.error('Error scraping clubs page:', error);
    throw error;
  }
}

async function scrapeAllClubs(): Promise<Club[]> {
  const baseUrl = 'https://www.schieder-schwalenberg.de/Familie-und-Soziales/Sport-und-Freizeitst%C3%A4tten/Vereine/index.php';
  const allClubs: Club[] = [];
  const seenNames = new Set<string>();

  // Scrape alle 4 Seiten
  for (let page = 0; page < 4; page++) {
    const offset = page * 25;
    const url = page === 0 
      ? `${baseUrl}?La=1&NavID=2808.45&kat=1.103`
      : `${baseUrl}?ofs_1=${offset}&La=1&NavID=2808.45&kat=1.103&TypSel=1.103&k_sub=1&ModID=9&object=tx%7C2808.10.1&KatID=1.103`;

    console.log(`[Clubs Scraper] Scraping page ${page + 1}/4...`);
    
    const clubs = await scrapeClubsPage(url);
    
    for (const club of clubs) {
      if (!seenNames.has(club.name)) {
        seenNames.add(club.name);
        allClubs.push(club);
      }
    }
    
    // Warte 1 Sekunde zwischen Requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return allClubs;
}

async function updateClubsInDatabase(clubs: Club[]): Promise<void> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // Tenant-ID ermitteln
    const tenantResult = await client.query(
      'SELECT id FROM tenants WHERE slug = $1',
      ['schieder']
    );

    if (tenantResult.rows.length === 0) {
      throw new Error('Tenant schieder not found');
    }

    const tenantId = tenantResult.rows[0].id;

    // Kategorien-IDs ermitteln
    const categoriesResult = await client.query(
      'SELECT id, name FROM club_categories WHERE tenant_id = $1',
      [tenantId]
    );

    const categoryMap: Record<string, number> = {};
    for (const row of categoriesResult.rows) {
      categoryMap[row.name] = row.id;
    }

    // Prüfe ob Kategorien existieren
    if (!categoryMap['Sportvereine'] || !categoryMap['Vereine']) {
      console.log('[Clubs Scraper] Creating missing categories...');
      
      if (!categoryMap['Sportvereine']) {
        const result = await client.query(
          `INSERT INTO club_categories (tenant_id, name, icon, color, display_order, created_at, updated_at)
           VALUES ($1, 'Sportvereine', 'Trophy', 'orange', 1, NOW(), NOW())
           RETURNING id`,
          [tenantId]
        );
        categoryMap['Sportvereine'] = result.rows[0].id;
      }
      
      if (!categoryMap['Vereine']) {
        const result = await client.query(
          `INSERT INTO club_categories (tenant_id, name, icon, color, display_order, created_at, updated_at)
           VALUES ($1, 'Vereine', 'Users', 'orange', 2, NOW(), NOW())
           RETURNING id`,
          [tenantId]
        );
        categoryMap['Vereine'] = result.rows[0].id;
      }
    }

    // Hole existierende Vereine
    const existingResult = await client.query(
      'SELECT name FROM clubs WHERE tenant_id = $1',
      [tenantId]
    );

    const existingNames = new Set(existingResult.rows.map(r => r.name));

    // Füge neue Vereine hinzu oder aktualisiere bestehende
    let addedCount = 0;
    let updatedCount = 0;
    
    for (const club of clubs) {
      const categoryId = categoryMap[club.category];
      
      if (!existingNames.has(club.name)) {
        // Neuer Verein
        await client.query(
          `INSERT INTO clubs (tenant_id, category_id, name, contact_person, address, phone, email, website, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
          [tenantId, categoryId, club.name, club.contactPerson, club.address, club.phone, club.email, club.website]
        );
        addedCount++;
      } else {
        // Bestehender Verein - aktualisiere Kontaktdaten
        await client.query(
          `UPDATE clubs 
           SET contact_person = $1, address = $2, phone = $3, email = $4, website = $5, updated_at = NOW()
           WHERE tenant_id = $6 AND name = $7`,
          [club.contactPerson, club.address, club.phone, club.email, club.website, tenantId, club.name]
        );
        updatedCount++;
      }
    }

    await client.query('COMMIT');

    console.log(`[Clubs Scraper] ✅ Successfully updated clubs:`);
    console.log(`  - Total scraped: ${clubs.length}`);
    console.log(`  - New clubs added: ${addedCount}`);
    console.log(`  - Existing clubs updated: ${updatedCount}`);
    console.log(`  - Clubs with phone: ${clubs.filter(c => c.phone).length}`);
    console.log(`  - Clubs with email: ${clubs.filter(c => c.email).length}`);
    console.log(`  - Clubs with website: ${clubs.filter(c => c.website).length}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Clubs Scraper] Error updating database:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function runClubsScraper(): Promise<void> {
  console.log('[Clubs Scraper] Starting clubs scraper...');
  
  try {
    const clubs = await scrapeAllClubs();
    
    console.log(`[Clubs Scraper] Found ${clubs.length} unique clubs`);
    console.log(`  - Sportvereine: ${clubs.filter(c => c.category === 'Sportvereine').length}`);
    console.log(`  - Vereine: ${clubs.filter(c => c.category === 'Vereine').length}`);
    
    await updateClubsInDatabase(clubs);
    
    console.log('[Clubs Scraper] ✅ Clubs scraper completed successfully');
  } catch (error) {
    console.error('[Clubs Scraper] ❌ Clubs scraper failed:', error);
    throw error;
  }
}

// Für manuellen Test
if (import.meta.url === `file://${process.argv[1]}`) {
  runClubsScraper()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}
