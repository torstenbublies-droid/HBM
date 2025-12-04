import axios from 'axios';
import * as cheerio from 'cheerio';
import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://buergerapp_dev:buergerapp_dev_2025@localhost:5432/buergerapp_dev';
const pool = new Pool({ connectionString: DATABASE_URL });

interface StaffMember {
  name: string;
  title?: string;
  department: string;
  email?: string;
  phone?: string;
  address?: string;
}

async function scrapeHornBadMeinbergStaff() {
  console.log('Starting Horn-Bad Meinberg staff scraper...');
  
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
      
      // Decode as UTF-8
      const html = Buffer.from(response.data, 'binary').toString('utf-8');
      
      const $ = cheerio.load(html);
      
      // Find all staff entries with class list-title
      $('.list-title').each((_, element) => {
        const $el = $(element);
        const nameText = $el.text().trim();
        
        // Extract name (remove Herr/Frau prefix)
        const name = nameText.replace(/^(Herr|Frau)\s+/, '').trim();
        if (!name || name === 'Bürgerdialog') return;
        
        // Get parent container
        const $container = $el.closest('.list-text');
        
        // Extract department and other info from paragraphs
        const $paragraphs = $container.find('p');
        let department = 'Allgemeine Verwaltung';
        let title = undefined;
        let address = undefined;
        
        $paragraphs.each((_, p) => {
          const text = $(p).html();
          if (!text) return;
          
          const lines = text.split('<br>').map(l => {
            // Remove HTML tags and decode entities
            return l.replace(/<[^>]*>/g, '').trim();
          }).filter(l => l);
          
          // First paragraph usually contains organization and department
          if (lines.length >= 2) {
            // Second line is usually the department
            if (lines[1] && !lines[1].match(/\d{5}/)) {
              department = lines[1];
            }
            // Third line might be title
            if (lines[2] && !lines[2].match(/\d{5}/) && !lines[2].includes('Marktplatz')) {
              title = lines[2];
            }
          }
          
          // Look for address
          lines.forEach(line => {
            if (line.match(/\d{5}\s+Horn-Bad Meinberg/)) {
              address = line;
            }
          });
        });
        
        allStaff.push({
          name,
          title,
          department,
          address
        });
      });
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`Error scraping page ${page + 1}:`, error);
    }
  }
  
  console.log(`Found ${allStaff.length} staff members`);
  
  // Get tenant ID
  const tenantResult = await pool.query(
    'SELECT id FROM tenants WHERE slug = $1',
    ['hornbadmeinberg']
  );
  
  if (tenantResult.rows.length === 0) {
    throw new Error('Tenant hornbadmeinberg not found');
  }
  
  const tenantId = tenantResult.rows[0].id;
  
  // Group by department
  const departmentMap = new Map<string, StaffMember[]>();
  
  allStaff.forEach(staff => {
    const dept = normalizeDepartment(staff.department);
    if (!departmentMap.has(dept)) {
      departmentMap.set(dept, []);
    }
    departmentMap.get(dept)!.push(staff);
  });
  
  console.log(`Grouped into ${departmentMap.size} departments`);
  
  // Insert departments and staff
  for (const [deptName, members] of departmentMap.entries()) {
    // Insert or update department
    const deptResult = await pool.query(
      `INSERT INTO departments (name, tenant_id, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       ON CONFLICT (tenant_id, name) DO UPDATE SET updated_at = NOW()
       RETURNING id`,
      [deptName, tenantId]
    );
    
    const departmentId = deptResult.rows[0].id;
    
    // Insert staff members
    for (const member of members) {
      await pool.query(
        `INSERT INTO staff (name, title, email, phone, department_id, tenant_id, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT (email, tenant_id) DO UPDATE 
         SET name = $1, title = $2, phone = $4, department_id = $5, updated_at = NOW()`,
        [
          member.name,
          member.title || null,
          member.email || `${member.name.toLowerCase().replace(/\s+/g, '.')}@horn-badmeinberg.de`,
          member.phone || null,
          departmentId,
          tenantId
        ]
      );
    }
    
    console.log(`Inserted ${members.length} staff members for ${deptName}`);
  }
  
  console.log('Staff scraping completed!');
}

function normalizeDepartment(dept: string): string {
  // Normalize department names
  if (dept.includes('Bildung, Ordnung und Soziales')) return 'Bildung, Ordnung und Soziales';
  if (dept.includes('Stadtwerke, Umwelt')) return 'Stadtwerke, Umwelt und öffentliche Einrichtungen';
  if (dept.includes('Stadtentwicklung, Bauen')) return 'Stadtentwicklung, Bauen und Liegenschaften';
  if (dept.includes('Finanzen')) return 'Finanzen';
  if (dept.includes('Zentrale Dienste') || dept.includes('Personal')) return 'Zentrale Dienste / Personal';
  return dept;
}

// Run scraper
scrapeHornBadMeinbergStaff()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
