import axios from 'axios';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: 'postgresql://buergerapp_user:buergerapp_dev_2025@localhost:5432/buergerapp',
  client_encoding: 'UTF8'
});

// Ortsteile data
const ortsteile = [
  {
    name: 'Bad Meinberg',
    description: 'Das Staatsbad Meinberg besitzt mit seinem Schwefelmoor, Kohlensäure- und Heilwasserquellen viele natürliche Heilmittel. Der Historische Kurpark, der Seekurpark und der Länderwaldpark Silvaticum laden zum Naturgenießen ein.',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/7/9/csm_Bad_Meinberg_74a85e9e67.jpg',
    display_order: 200
  },
  {
    name: 'Belle',
    description: 'Im örtlichen Freibad werden heiße Tage erfrischt. Im Dorfzentrum befindet sich eine kleine Kirche, die einzige erhaltene Fachwerkkapelle im Weserbergland unter Denkmalschutz. Der Straußenhof Möller bietet Eier, Likör und Führungen an.',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/3/a/csm_Belle_31425c2d67.jpg',
    display_order: 201
  },
  {
    name: 'Bellenberg',
    description: 'Die im Jahr 1949 gegründete Freilichtbühne Bellenberg begeistert jedes Jahr mit einem tollen Programm für die ganze Familie. Erstmals erwähnt wurde der Ort 1507 als Bellintrupp.',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/8/4/csm_Bellenberg_c___Freilichtbuehne_75f956e55b.jpg',
    display_order: 202
  },
  {
    name: 'Billerbeck',
    description: 'Das idyllische Dorf liegt am Rande des Norderteich. Dieser künstlich angelegte See liegt im ältesten Naturschutzgebiet in Lippe und diente zur Zucht von Karpfen und Hechten.',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/f/e/csm_Billerbeck-Norderteich_GUT_a067840a9d.jpg',
    display_order: 203
  },
  {
    name: 'Veldrom',
    description: 'Die Bollmühle (Wassermühle) ist ein Baudenkmal am Silberbach. Der Preußische Velmerstot (464 m) und der Lippische Velmerstot (441 m) bieten eine atemberaubende Aussicht.',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/2/f/csm_F_V_eldrom__Werner_Wilmes_1f13ae50b5.jpg',
    display_order: 204
  },
  {
    name: 'Feldrom/Kempen',
    description: 'Im Traktorenmuseum in Kempen stehen 60 Traktoren aus aller Welt. Es zeigt die Entwicklung der Landwirtschaft vom Mittelalter bis in die 1960er Jahre. Auf „Gut Kempen" werden heute Pferde gezüchtet.',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/0/2/csm_Feldrom2_2db9e59205.jpg',
    display_order: 205
  },
  {
    name: 'Fissenknick',
    description: 'Die aufwendig restaurierte Windmühle aus dem Jahre 1847 ist Aussichtsturm und beliebtes Restaurant in wunderschöner landschaftlicher Lage.',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/9/c/csm_Fissenknick__C_Windmuehle_Fissenknick_1ce29d74bb.jpg',
    display_order: 206
  },
  {
    name: 'Fromhausen',
    description: 'Hier erwartet Sie ein Meer aus lila Blüten. Lavendelfelder von Taoasis blühen von Juni bis August. Der Rosenhof-Lippe bietet Eselwanderungen, Esel-Relax-Kuschelzeit und Wohnmobilstellplätze an.',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/b/f/csm_Fromhausen__C_Werner_Wilmes_49b79286aa.jpg',
    display_order: 207
  },
  {
    name: 'Holzhausen-Externsteine',
    description: 'Staatlich anerkannter Luftkurort und Zuhause der sagenumwobenen Externsteine. Der kleine Kurpark lädt zum Verweilen ein. Besonders ruhig, da der Ort keinen Durchgangsverkehr hat.',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/a/8/csm_Holzhausen-Externsteine_Werner_Wilmes_bab8e30673.jpg',
    display_order: 208
  },
  {
    name: 'Heesten',
    description: 'Die historische Warte auf dem Ziegenberg, eine Turm-Ruine inmitten des Waldes, wurde 1442 erbaut. Das FFH-Schutzgebiet „Silberbachtal mit Ziegenberg" liegt unweit entfernt. Auf dem Rittergut Küterbrok ist Kuhkuscheln angesagt.',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/8/b/csm_Heesten_Tobias_Spieker_591548ad24.jpg',
    display_order: 209
  },
  {
    name: 'Horn',
    description: 'Horn wurde ca. 1234 gegründet und ist die zweitälteste Stadt im Kreis Lippe. Der gut erhaltene historische Stadtkern mit alter Stadtmauer und liebevoll restaurierten Häusern zeigt die historische Vergangenheit. Im Museum in der Burg lässt sich viel entdecken.',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/b/b/csm_Horn_61d86add67.jpg',
    display_order: 210
  },
  {
    name: 'Leopoldstal',
    description: 'Der Ort wurde 1789 von Fürst Leopold I. gegründet. Hier sprudelt die Silberbachquelle und wird zum Silberbach. Neben Silbermühle und Kattenmühle wartet ein toller Blick vom Velmerstot auf Sie.',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/7/2/csm_Leopoldstal__Werner_Wilmes_-Silberbachtal_55b3201242.jpg',
    display_order: 211
  },
  {
    name: 'Schmedissen',
    description: 'Schmedissen wurde 1015 als Smithessun erstmals schriftlich erwähnt. Das idyllische Dorf liegt direkt am Gustav-Mesch-Wanderweg.',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/c/6/csm_Schmedissen_5743449965.jpg',
    display_order: 212
  },
  {
    name: 'Vahlhausen',
    description: 'Im Sommer bietet das Waldfreibad Spiel, Spaß und eine nasse Erfrischung. Der älteste Ortsteil Horn-Bad Meinbergs feierte 2022 sein 1175-jähriges Jubiläum.',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/4/0/csm_Vahlhausen_Tobias_Spieker_7aefcdeb8c.jpg',
    display_order: 213
  },
  {
    name: 'Wehren',
    description: 'In Wehren plätschert die Werre-Quelle in einer sumpfartigen Umgebung fast unauffällig aus der Erde. Sie fließt durch den Kurpark von Bad Meinberg. Wehren wurde 1173 erstmals schriftlich erwähnt. Bei der Wollfühloase können Wanderungen mit Alpakas unternommen werden.',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/2/9/csm_Wehern_Werner_Wilmes_-WerreQuelle1_a92309de38.jpg',
    display_order: 214
  },
  {
    name: 'Wilberg',
    description: 'Hier befinden sich die Niedermühle zu Wilberg aus dem Jahre 1698 und die Wilberger Obermühle von ca. 1574. Im Red Horn District, dem Musikclub in Horn-Bad Meinberg, gibt es Jazz- und Popmusik. Hier ist auch das District Studio, ein voll ausgestattetes Tonstudio.',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/e/4/csm_Wilberg__Red_Horn_District_f6e705e98d.jpg',
    display_order: 215
  }
];

async function downloadImage(url: string, filename: string): Promise<string> {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const imageDir = path.join(__dirname, '../../public/assets/hornbadmeinberg/attractions');
    
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }
    
    const imagePath = path.join(imageDir, filename);
    fs.writeFileSync(imagePath, response.data);
    
    return `/assets/hornbadmeinberg/attractions/${filename}`;
  } catch (error) {
    console.error(`Error downloading image ${url}:`, error);
    return '';
  }
}

async function restructureCategories() {
  const client = await pool.connect();
  
  try {
    console.log('Starting category restructuring...\n');
    
    // Get tenant_id
    const tenantResult = await client.query(
      "SELECT id FROM tenants WHERE slug = 'hornbadmeinberg'"
    );
    
    if (tenantResult.rows.length === 0) {
      throw new Error('Tenant hornbadmeinberg not found');
    }
    
    const tenantId = tenantResult.rows[0].id;
    console.log(`Found tenant: ${tenantId}\n`);
    
    // Step 1: Update existing attractions with main_category
    console.log('Step 1: Updating existing attractions with main_category...');
    
    // Update local attractions (display_order 0-99)
    await client.query(
      `UPDATE attractions 
       SET main_category = 'Sehenswürdigkeiten in Horn-Bad Meinberg'
       WHERE tenant_id = $1 AND display_order < 100`,
      [tenantId]
    );
    console.log('✓ Updated local attractions');
    
    // Update Umgebung attractions (display_order 100-199)
    await client.query(
      `UPDATE attractions 
       SET main_category = 'Sehenswürdigkeiten in der Umgebung'
       WHERE tenant_id = $1 AND display_order >= 100 AND display_order < 200`,
      [tenantId]
    );
    console.log('✓ Updated Umgebung attractions\n');
    
    // Step 2: Import Ortsteile
    console.log('Step 2: Importing Ortsteile...');
    
    let imported = 0;
    
    for (const ortsteil of ortsteile) {
      try {
        // Download image
        const imageFilename = `ortsteil-${ortsteil.display_order}.jpg`;
        console.log(`Downloading image for ${ortsteil.name}...`);
        const localImageUrl = await downloadImage(ortsteil.image_url, imageFilename);
        
        if (!localImageUrl) {
          console.warn(`Skipping ${ortsteil.name} - image download failed`);
          continue;
        }
        
        // Check if ortsteil already exists
        const existingResult = await client.query(
          'SELECT id FROM attractions WHERE tenant_id = $1 AND name = $2',
          [tenantId, ortsteil.name]
        );
        
        if (existingResult.rows.length > 0) {
          // Update existing
          await client.query(
            `UPDATE attractions 
             SET description = $3, main_category = $4, image_url = $5, display_order = $6
             WHERE tenant_id = $1 AND name = $2`,
            [
              tenantId,
              ortsteil.name,
              ortsteil.description,
              '16 Ortsteile',
              localImageUrl,
              ortsteil.display_order
            ]
          );
        } else {
          // Insert new
          await client.query(
            `INSERT INTO attractions (tenant_id, name, description, main_category, image_url, display_order)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              tenantId,
              ortsteil.name,
              ortsteil.description,
              '16 Ortsteile',
              localImageUrl,
              ortsteil.display_order
            ]
          );
        }
        
        imported++;
        console.log(`✓ Imported: ${ortsteil.name}`);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error importing ${ortsteil.name}:`, error);
      }
    }
    
    console.log(`\n✅ Successfully imported ${imported} Ortsteile!`);
    
    // Step 3: Show summary
    console.log('\n=== Summary ===');
    const summary = await client.query(
      `SELECT main_category, COUNT(*) as count
       FROM attractions
       WHERE tenant_id = $1
       GROUP BY main_category
       ORDER BY main_category`,
      [tenantId]
    );
    
    console.log('\nAttractions by main category:');
    summary.rows.forEach(row => {
      console.log(`  ${row.main_category}: ${row.count}`);
    });
    
  } catch (error) {
    console.error('Error during restructuring:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

restructureCategories();
