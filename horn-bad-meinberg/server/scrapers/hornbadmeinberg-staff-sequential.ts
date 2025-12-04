import axios from 'axios';
import * as cheerio from 'cheerio';
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://buergerapp_user:buergerapp_dev_2025@localhost:5432/buergerapp';
const pool = new Pool({ 
  connectionString: DATABASE_URL,
  client_encoding: 'UTF8'
});

interface StaffMember {
  name: string;
  title?: string;
  department: string;
  email?: string;
  phone?: string;
  room?: string;
  detailUrl?: string;
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeDetailPage(url: string): Promise<{ phone?: string; room?: string }> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      responseType: 'arraybuffer',
      responseEncoding: 'binary',
      timeout: 10000
    });
    
    const html = Buffer.from(response.data, 'binary').toString('utf-8');
    const $ = cheerio.load(html);
    
    let phone: string | undefined;
    let room: string | undefined;
    
    // Find all text content
    const bodyText = $('body').text();
    
    // Extract phone (look for pattern like 05234 / 69357 or 05234 / 201 - 69357)
    const phoneMatch = bodyText.match(/(\d{5}\s*\/\s*\d+(?:\s*-\s*\d+)?)/);
    if (phoneMatch) {
      phone = phoneMatch[1].trim();
    }
    
    // Extract room (look for "Raum: X" or "Raum X")
    const roomMatch = bodyText.match(/Raum:\s*([^\n]+)/i);
    if (roomMatch) {
      room = roomMatch[1].trim();
    }
    
    return { phone, room };
  } catch (error: any) {
    console.error(`    Error: ${error.message}`);
    return {};
  }
}

async function scrapeHornBadMeinbergStaff() {
  console.log('Starting Horn-Bad Meinberg staff scraper (sequential version)...');
  console.log('');
  
  const baseUrl = 'https://www.horn-badmeinberg.de/Verwaltung/Bürgerberatung/Mitarbeitenden-Verzeichnis/';
  const allStaff: StaffMember[] = [];
  
  // Scrape all 4 pages
  for (let page = 0; page < 4; page++) {
    const offset = page * 25;
    const url = page === 0 
      ? baseUrl 
      : `${baseUrl}index.php?ofs_1=${offset}&La=1&NavID=3165.55&sfplz=1&sfort=1&kat=1.101&kuo=1&TypSel=1.101&k_sub=1&ModID=9&object=tx%7C3165.1.1&KatID=1.101`;
    
    console.log(`[Page ${page + 1}/4] Fetching overview...`);
    
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        responseType: 'arraybuffer',
        responseEncoding: 'binary'
      });
      
      const html = Buffer.from(response.data, 'binary').toString('utf-8');
      const $ = cheerio.load(html);
      
      // Find all staff entries
      const staffEntries: Array<{
        name: string;
        title?: string;
        department: string;
        email?: string;
        detailUrl?: string;
      }> = [];
      
      $('h3.list-title').each((index, element) => {
        const $h3 = $(element);
        const nameText = $h3.text().trim();
        
        // Extract name (remove Herr/Frau prefix)
        const name = nameText.replace(/^(Herr|Frau)\s+/, '').trim();
        if (!name || name === 'Bürgerdialog') return;
        
        // Find the parent <li> container
        const $li = $h3.closest('li');
        
        // Find detail page link (it's in a.overlay-link before the h3)
        let detailUrl: string | undefined;
        const $overlayLink = $li.find('a.overlay-link');
        if ($overlayLink.length > 0) {
          const href = $overlayLink.attr('href');
          if (href) {
            detailUrl = href.startsWith('http') 
              ? href 
              : `https://www.horn-badmeinberg.de${href.replace(/&amp;/g, '&')}`;
          }
        }
        
        // Find the content container
        const $container = $h3.closest('.list-text');
        
        // Extract email from mailto link
        let email: string | undefined;
        $container.find('a[href^="mailto:"]').each((_, link) => {
          const href = $(link).attr('href');
          if (href) {
            email = href.replace('mailto:', '').trim();
            return false; // break
          }
        });
        
        // Extract department and other info
        const $paragraphs = $container.find('p');
        let department = 'Allgemeine Verwaltung';
        let title: string | undefined;
        
        $paragraphs.each((_, p) => {
          const text = $(p).html();
          if (!text) return;
          
          const lines = text.split('<br>').map(l => {
            return l.replace(/<[^>]*>/g, '').trim();
          }).filter(l => l);
          
          // First line after "Stadt Horn-Bad Meinberg" is usually the department
          let foundCity = false;
          for (const line of lines) {
            if (line.includes('Stadt Horn-Bad Meinberg')) {
              foundCity = true;
              continue;
            }
            if (foundCity && !line.match(/\d{5}/) && !line.includes('Marktplatz')) {
              if (!department || department === 'Allgemeine Verwaltung') {
                department = line;
                foundCity = false;
              } else if (!title) {
                title = line;
                break;
              }
            }
          }
        });
        
        staffEntries.push({
          name,
          title,
          department,
          email,
          detailUrl
        });
      });
      
      // Now scrape detail pages SEQUENTIALLY
      console.log(`  Found ${staffEntries.length} staff members on this page`);
      
      for (let i = 0; i < staffEntries.length; i++) {
        const entry = staffEntries[i];
        console.log(`  [${i + 1}/${staffEntries.length}] ${entry.name}`);
        
        let phone: string | undefined;
        let room: string | undefined;
        
        if (entry.detailUrl) {
          const details = await scrapeDetailPage(entry.detailUrl);
          phone = details.phone;
          room = details.room;
          await delay(100); // Rate limiting
        } else {
          console.log(`    Warning: No detail URL`);
        }
        
        allStaff.push({
          ...entry,
          phone,
          room
        });
      }
      
      console.log('');
      
    } catch (error: any) {
      console.error(`Error scraping page ${page + 1}: ${error.message}`);
    }
  }
  
  console.log(`\n✓ Found ${allStaff.length} staff members`);
  console.log(`✓ With email: ${allStaff.filter(s => s.email).length}`);
  console.log(`✓ With phone: ${allStaff.filter(s => s.phone).length}`);
  console.log(`✓ With room: ${allStaff.filter(s => s.room).length}`);
  console.log('');
  
  // Group by department
  const departmentMap = new Map<string, StaffMember[]>();
  allStaff.forEach(staff => {
    const existing = departmentMap.get(staff.department) || [];
    existing.push(staff);
    departmentMap.set(staff.department, existing);
  });
  
  console.log(`✓ Grouped into ${departmentMap.size} departments`);
  console.log('');
  
  // Insert into database
  const tenantId = 'tenant_hornbadmeinberg_001';
  
  console.log('Updating database...');
  
  // Delete existing staff
  await pool.query('DELETE FROM staff WHERE tenant_id = $1', [tenantId]);
  console.log('✓ Deleted old staff records');
  
  let totalInserted = 0;
  
  for (const [deptName, members] of departmentMap.entries()) {
    // Find or create department
    let deptResult = await pool.query(
      'SELECT id FROM departments WHERE tenant_id = $1 AND name = $2',
      [tenantId, deptName]
    );
    
    let deptId: number;
    if (deptResult.rows.length === 0) {
      const insertResult = await pool.query(
        'INSERT INTO departments (tenant_id, name, display_order) VALUES ($1, $2, $3) RETURNING id',
        [tenantId, deptName, 0]
      );
      deptId = insertResult.rows[0].id;
      console.log(`✓ Created department: ${deptName}`);
    } else {
      deptId = deptResult.rows[0].id;
    }
    
    // Insert staff members
    for (const member of members) {
      await pool.query(
        'INSERT INTO staff (tenant_id, department_id, name, title, phone, email, room) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [tenantId, deptId, member.name, member.title, member.phone, member.email, member.room]
      );
      totalInserted++;
    }
    
    console.log(`✓ Inserted ${members.length} staff for "${deptName}"`);
  }
  
  console.log('');
  console.log(`✓ Total: ${totalInserted} staff members inserted`);
  console.log('✓ Staff scraping completed successfully!');
}

scrapeHornBadMeinbergStaff()
  .then(() => {
    console.log('');
    console.log('Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
