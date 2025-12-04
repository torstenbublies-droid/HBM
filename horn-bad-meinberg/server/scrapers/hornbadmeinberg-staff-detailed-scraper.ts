import axios from 'axios';
import * as cheerio from 'cheerio';
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://buergerapp_user:buergerapp_dev_2025@localhost:5432/buergerapp';
const pool = new Pool({ connectionString: DATABASE_URL });

interface StaffMember {
  name: string;
  title?: string;
  department: string;
  email?: string;
  phone?: string;
  address?: string;
  room?: string;
  detailUrl?: string;
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeDetailPage(url: string): Promise<{ phone?: string; email?: string; room?: string }> {
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
    
    let phone: string | undefined;
    let email: string | undefined;
    let room: string | undefined;
    
    // Find contact information in the detail page
    $('.list-text').each((_, element) => {
      const $el = $(element);
      const text = $el.text();
      
      // Extract phone (look for pattern like 05234 / 69357)
      const phoneMatch = text.match(/(\d{5}\s*\/\s*\d+(?:\s*-\s*\d+)?)/);
      if (phoneMatch) {
        phone = phoneMatch[1].trim();
      }
      
      // Extract email
      const emailMatch = text.match(/([a-z0-9._-]+@horn-badmeinberg\.de)/i);
      if (emailMatch) {
        email = emailMatch[1].trim();
      }
      
      // Extract room (look for "Raum: X (Location)")
      const roomMatch = text.match(/Raum:\s*([^)]+\))/);
      if (roomMatch) {
        room = roomMatch[1].trim();
      }
    });
    
    return { phone, email, room };
  } catch (error) {
    console.error(`Error scraping detail page ${url}:`, error);
    return {};
  }
}

async function scrapeHornBadMeinbergStaff() {
  console.log('Starting Horn-Bad Meinberg detailed staff scraper...');
  
  const baseUrl = 'https://www.horn-badmeinberg.de/Verwaltung/Bürgerberatung/Mitarbeitenden-Verzeichnis/';
  const allStaff: StaffMember[] = [];
  
  // Scrape all 4 pages
  for (let page = 0; page < 4; page++) {
    const offset = page * 25;
    const url = page === 0 
      ? baseUrl 
      : `${baseUrl}index.php?ofs_1=${offset}&La=1&NavID=3165.55&sfplz=1&sfort=1&kat=1.101&kuo=1&TypSel=1.101&k_sub=1&ModID=9&object=tx%7C3165.1.1&KatID=1.101`;
    
    console.log(`Scraping page ${page + 1}...`);
    
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
      
      // Find all staff entries with class list-title
      const staffPromises: Promise<void>[] = [];
      
      $('.list-title').each((_, element) => {
        const $el = $(element);
        const $link = $el.find('a');
        const nameText = $link.text().trim();
        
        // Extract name (remove Herr/Frau prefix)
        const name = nameText.replace(/^(Herr|Frau)\s+/, '').trim();
        if (!name || name === 'Bürgerdialog') return;
        
        // Get detail page URL
        const detailUrl = $link.attr('href');
        if (!detailUrl) return;
        
        const fullDetailUrl = detailUrl.startsWith('http') 
          ? detailUrl 
          : `https://www.horn-badmeinberg.de${detailUrl}`;
        
        // Get parent container
        const $container = $el.closest('.list-text');
        
        // Extract department and other info from paragraphs
        const $paragraphs = $container.find('p');
        let department = 'Allgemeine Verwaltung';
        let title: string | undefined;
        let address: string | undefined;
        
        $paragraphs.each((_, p) => {
          const text = $(p).html();
          if (!text) return;
          
          const lines = text.split('<br>').map(l => {
            return l.replace(/<[^>]*>/g, '').trim();
          }).filter(l => l);
          
          if (lines.length >= 2) {
            if (lines[1] && !lines[1].match(/\d{5}/)) {
              department = lines[1];
            }
            if (lines[2] && !lines[2].match(/\d{5}/) && !lines[2].includes('Marktplatz')) {
              title = lines[2];
            }
          }
          
          lines.forEach(line => {
            if (line.match(/\d{5}\s+Horn-Bad Meinberg/)) {
              address = line;
            }
          });
        });
        
        // Scrape detail page for contact info
        const promise = (async () => {
          console.log(`  Scraping details for ${name}...`);
          const details = await scrapeDetailPage(fullDetailUrl);
          
          allStaff.push({
            name,
            title,
            department,
            address,
            detailUrl: fullDetailUrl,
            ...details
          });
          
          // Rate limiting
          await delay(100);
        })();
        
        staffPromises.push(promise);
      });
      
      // Wait for all detail pages to be scraped
      await Promise.all(staffPromises);
      
    } catch (error) {
      console.error(`Error scraping page ${page + 1}:`, error);
    }
  }
  
  console.log(`Found ${allStaff.length} staff members`);
  
  // Group by department
  const departmentMap = new Map<string, StaffMember[]>();
  allStaff.forEach(staff => {
    const existing = departmentMap.get(staff.department) || [];
    existing.push(staff);
    departmentMap.set(staff.department, existing);
  });
  
  console.log(`Grouped into ${departmentMap.size} departments`);
  
  // Insert into database
  const tenantId = 'tenant_hornbadmeinberg_001';
  
  // Delete existing staff
  await pool.query('DELETE FROM staff WHERE tenant_id = $1', [tenantId]);
  
  for (const [deptName, members] of departmentMap.entries()) {
    // Find or create department
    let deptResult = await pool.query(
      'SELECT id FROM departments WHERE tenant_id = $1 AND name = $2',
      [tenantId, deptName]
    );
    
    let deptId: number;
    if (deptResult.rows.length === 0) {
      const insertResult = await pool.query(
        'INSERT INTO departments (tenant_id, name, description, display_order) VALUES ($1, $2, $3, $4) RETURNING id',
        [tenantId, deptName, '', 0]
      );
      deptId = insertResult.rows[0].id;
    } else {
      deptId = deptResult.rows[0].id;
    }
    
    // Insert staff members
    for (const member of members) {
      await pool.query(
        'INSERT INTO staff (tenant_id, department_id, name, title, phone, email, address, room) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [tenantId, deptId, member.name, member.title, member.phone, member.email, member.address, member.room]
      );
    }
    
    console.log(`Inserted ${members.length} staff members for ${deptName}`);
  }
  
  console.log('Staff scraping completed!');
}

scrapeHornBadMeinbergStaff()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
