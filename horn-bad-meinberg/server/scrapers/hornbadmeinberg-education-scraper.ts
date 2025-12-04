import axios from 'axios';
import * as cheerio from 'cheerio';
import { Client } from 'pg';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = 'postgresql://buergerapp_user:buergerapp_dev_2025@localhost:5432/buergerapp';

interface EducationInstitution {
  name: string;
  category: string;
  description: string;
  address: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  display_order: number;
}

const institutions: EducationInstitution[] = [
  {
    name: 'Grundschule am Silvaticum',
    category: 'Grundschulen',
    description: 'Grundschulverbund Bad Meinberg – Belle mit Standort Bad Meinberg. Offene Ganztagsschule mit ca. 145 Schülern in 8 Klassen.',
    address: 'Müllerberg, 32805 Horn-Bad Meinberg',
    phone: '05234 / 9765',
    fax: '05234 / 99084',
    email: 'GSBadMeinberg@horn-badmeinberg.de',
    website: 'https://www.horn-badmeinberg.de/Leben-Freizeit/Bildung/Schulen/Grundschule-am-Silvaticum/',
    display_order: 1
  },
  {
    name: 'Grundschule Horn',
    category: 'Grundschulen',
    description: 'Grundschule in Horn mit Offener Ganztagsbetreuung.',
    address: 'Mittelstraße 12, 32805 Horn-Bad Meinberg',
    phone: '05234 / 7343',
    fax: '05234 / 88651',
    email: 'GSHorn@horn-badmeinberg.de',
    website: 'https://www.horn-badmeinberg.de/Leben-Freizeit/Bildung/Schulen/Grundschule-Horn/',
    display_order: 2
  },
  {
    name: 'Sekundarschule Horn-Bad Meinberg',
    category: 'Sekundarschule',
    description: 'Sekundarschule mit den Jahrgängen 5-10. Längeres gemeinsames Lernen mit individueller Förderung.',
    address: 'Mittelstraße 10, 32805 Horn-Bad Meinberg',
    phone: '05234 / 9880-0',
    fax: '05234 / 9880-20',
    email: 'sekretariat@sekundarschule-hbm.de',
    website: 'https://www.sekundarschule-hbm.de',
    display_order: 3
  },
  {
    name: 'Gymnasium Horn-Bad Meinberg',
    category: 'Gymnasium',
    description: 'Städtisches Gymnasium mit ca. 900 Schülern. Offene Ganztagsschule mit vielfältigen AG-Angeboten.',
    address: 'Am Silvaticum 1, 32805 Horn-Bad Meinberg',
    phone: '05234 / 9814-0',
    fax: '05234 / 9814-20',
    email: 'sekretariat@gymnasium-hbm.de',
    website: 'https://www.gymnasium-hbm.de',
    display_order: 4
  },
  {
    name: 'VHS Detmold-Lemgo',
    category: 'VHS',
    description: 'Volkshochschule Detmold-Lemgo mit Außenstelle in Horn-Bad Meinberg. Vielfältiges Kursangebot für Erwachsenenbildung.',
    address: 'Krumme Straße 20, 32756 Detmold',
    phone: '05231 / 977-0',
    fax: '05231 / 977-199',
    email: 'info@vhs-detmold-lemgo.de',
    website: 'https://www.vhs-detmold-lemgo.de',
    display_order: 5
  }
];

async function main() {
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Get tenant ID
    const tenantResult = await client.query(
      "SELECT id FROM tenants WHERE slug = 'hornbadmeinberg'"
    );
    
    if (tenantResult.rows.length === 0) {
      throw new Error('Tenant hornbadmeinberg not found');
    }
    
    const tenantId = tenantResult.rows[0].id;
    console.log(`Tenant ID: ${tenantId}`);
    
    // Insert education institutions
    let insertedCount = 0;
    
    for (const institution of institutions) {
      try {
        await client.query(
          `INSERT INTO education_institutions 
           (tenant_id, name, category, description, address, phone, fax, email, website, display_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            tenantId,
            institution.name,
            institution.category,
            institution.description,
            institution.address,
            institution.phone || null,
            institution.fax || null,
            institution.email || null,
            institution.website || null,
            institution.display_order
          ]
        );
        
        console.log(`✓ Inserted: ${institution.name} (${institution.category})`);
        insertedCount++;
      } catch (err: any) {
        console.error(`✗ Error inserting ${institution.name}:`, err.message);
      }
    }
    
    console.log(`\n✅ Successfully inserted ${insertedCount} education institutions`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

main();
