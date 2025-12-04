import axios from 'axios';
import * as cheerio from 'cheerio';
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

// Manual data for Umgebung attractions
const umgebungAttractions = [
  {
    name: 'Hermannsdenkmal',
    description: 'Mit einer Höhe von 60 m ist das Wahrzeichen des Teutoburger Waldes bereits aus der Ferne sichtbar. Das Hermannsdenkmal erinnert an Arminius (Hermann), einen Fürsten der Cherusker, der die Germanen in der Varusschlacht im Jahre 9 n. Chr. zum Sieg über die römischen Legionen führte.',
    category: 'Kultur & Geschichte',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/9/f/csm_Sehenswuerdigkeiten_in_der_Umgebung_7b3f2865f7.jpg',
    address: 'Grotenburg 50, 32760 Detmold',
    more_info_url: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html',
    display_order: 100
  },
  {
    name: 'LWL-Freilichtmuseum Detmold',
    description: 'Das weitläufige Gelände mit historischen Gebäuden ist umgeben von herrlicher Natur. In den Werkstätten schauen Sie der Fotografin, dem Schmied, dem Bäcker und der Töpferin bei der Arbeit zu. Auf den Weiden findet man alte und zum Teil vom Aussterben bedrohte Haustierrassen wie die Senner Pferde oder das Siegerländer Rotvieh.',
    category: 'Kultur & Geschichte',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/d/8/csm_Dorfteich_LWL_Sandra_Sanchez_ecc78eaec8.jpg',
    address: 'Krummes Haus, 32760 Detmold',
    more_info_url: 'https://www.lwl-freilichtmuseum-detmold.de/',
    display_order: 101
  },
  {
    name: 'Falkenburg',
    description: 'Die Falkenburg ist ehemaliger Sitz der Herrschaft zur Lippe, erbaut ca. 1194 von Bernhard II. zur Lippe. Die Ruine dieser mittelalterlichen Höhenburg mit Ringmauer, Bergfried, Palas, Vorburg und Zwinger ist auf eigene Faust und im Rahmen von Führungen erlebbar.',
    category: 'Kultur & Geschichte',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/d/4/csm_Falkenburg_380f4b1559.jpg',
    address: 'Falkenburg, 32760 Detmold',
    more_info_url: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html',
    display_order: 102
  },
  {
    name: 'Adlerwarte Berlebeck',
    description: 'Die Adlerwarte beherbergt mehr als 200 Greifvögel aus aller Welt: Weißkopfseeadler, Lanner- und Sakerfalken, Mönchs- und Gänsegeier, heimische Milane und Bussarde. Auf der Panoramaterrasse mit Blick in den Teutoburger Wald finden regelmäßig Freiflugshows statt.',
    category: 'Natur & Tiere',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/d/1/csm_20410-Adlerwarte_843743b2af.jpg',
    address: 'Hangsteinstraße 4, 32760 Detmold-Berlebeck',
    more_info_url: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html',
    display_order: 103
  },
  {
    name: 'Vogelpark Heiligenkirchen',
    description: 'Ein privat geführter Vogelpark der besonderen Art mit über 1.200 Vögeln und 300 Arten Säugetiere. Pelikane, Störche, Kraniche, Pfauen und seltene Hornvögel, Affen, Präriehunde und Kängurus können hier bestaunt werden. Mit Streichelwiese und Abenteuerspielplatz.',
    category: 'Natur & Tiere',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/f/e/csm_DSC_0103_1__f1e7325e80.jpg',
    address: 'Ostertalstraße 1, 32760 Detmold-Heiligenkirchen',
    more_info_url: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html',
    display_order: 104
  },
  {
    name: 'Schloss Detmold',
    description: 'Ein Schloss im Stil der Weserrenaissance, bewohnt von der Familie von Dr. Armin Prinz zur Lippe. Teile des Schlosses stehen Besuchern offen mit umfangreichen Sammlungen an Porzellanen, historischen Waffen und Gemälden.',
    category: 'Kultur & Geschichte',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/c/6/csm_20413-SchlossDetmold-2016_26ae58e316.jpg',
    address: 'Schlossplatz 1, 32756 Detmold',
    more_info_url: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html',
    display_order: 105
  },
  {
    name: 'Freizeitzentrum SchiederSee',
    description: 'Das Freizeitzentrum bietet Aktivitäten für Groß und Klein mit garantiertem Spaßfaktor. Bei einer einstündigen Rundfahrt kann der Stausee erkundet werden.',
    category: 'Freizeit & Erholung',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/8/8/csm_AA_SchiederSee_Imagebild_0239704134.jpg',
    address: 'Schieder-Schwalenberg',
    more_info_url: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html',
    display_order: 106
  },
  {
    name: 'Köterberg',
    description: '496m ist er hoch und somit die höchste Erhebung im Lipper Bergland. Ein Freilichtkino bietet einen atemberaubenden Panoramablick auf den Teutoburger Wald und das Weserbergland. 36 Holz-Kinoplätze laden ein, den wunderbaren „Naturfilm" zu genießen.',
    category: 'Natur & Landschaft',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/3/5/csm_20200-Koeterberg_1a0fea6634.jpg',
    address: 'Köterberg, Lügde',
    more_info_url: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html',
    display_order: 107
  },
  {
    name: 'Lippisches Landesmuseum Detmold',
    description: 'Das größte und älteste Regionalmuseum Ostwestfalen-Lippes. Gegründet 1835 als Naturhistorisches Museum, präsentiert es heute eine großartige Sammlung lippischer und außerlippischer Kulturgüter.',
    category: 'Kultur & Geschichte',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/4/9/csm_Museum_Aussen___c_Lippisches_Landesmuseum_Detmold_784abaf843.jpg',
    address: 'Ameide 4, 32756 Detmold',
    more_info_url: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html',
    display_order: 108
  },
  {
    name: 'Landestheater Detmold',
    description: 'Das Landestheater wurde 1919 eröffnet und bietet heute 648 Plätze. Es ist das größte der vier Landestheater in Nordrhein-Westfalen und das einzige mit einem Musiktheaterensemble.',
    category: 'Kultur & Freizeit',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/1/8/csm_landestheater-detmold_61915ab46b.jpg',
    address: 'Theaterplatz 1, 32756 Detmold',
    more_info_url: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html',
    display_order: 109
  },
  {
    name: 'Tierpark Bad Pyrmont',
    description: 'Der Tierpark ist vor allem beliebt wegen seiner Nähe zu den Tieren und der Möglichkeit, die Pflanzen- und Tierwelt auf eine ganz eigene Art und Weise zu erkunden.',
    category: 'Natur & Tiere',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/e/a/csm_Tierpark-Pyrmont-Eingang_6e86242889.jpg',
    address: 'Ohrbergstraße, 31812 Bad Pyrmont',
    more_info_url: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html',
    display_order: 110
  },
  {
    name: 'Schloss Brake - Weserrenaissance-Museum',
    description: 'Schloss Brake wurde ab 1584 als Residenz der Grafen zur Lippe im Stil der Renaissance ausgebaut. 1986 entstand das Weserrenaissance-Museum.',
    category: 'Kultur & Geschichte',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/c/f/csm_Museum_Schloss_Brake_9a14430f7a.jpg',
    address: 'Schlossstraße 18, 32657 Lemgo',
    more_info_url: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html',
    display_order: 111
  },
  {
    name: 'Gartenschau Bad Lippspringe',
    description: 'Die Landesgartenschau fand 2017 statt und eignet sich als ganzjähriges Ausflugsziel für Familien und Naturfreunde. Themen- und Mustergärten, Spielplätze, Waldidylle und farbenfrohe Blumenpracht.',
    category: 'Parks & Gärten',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/e/2/csm_Gartenschau_Bad_Lippspringe_cdfd1924e3.jpg',
    address: 'Arminiuspark, 33175 Bad Lippspringe',
    more_info_url: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html',
    display_order: 112
  },
  {
    name: 'Huxarium Gartenpark Höxter',
    description: 'Der Huxarium Gartenpark verbindet die historische Fachwerkstadt mit dem Welterbe Corvey. Das Gelände erstreckt sich vom Wall über die Stadtmauer und Uferpomenade der Weser bis zum Barockschloss Corvey und dem Archäologiepark.',
    category: 'Parks & Gärten',
    image_url: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/7/2/csm_Landesgartschenschau_Hoexter_57fe30040a.jpg',
    address: 'Höxter',
    more_info_url: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-d-umgebung.html',
    display_order: 113
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

async function importUmgebungAttractions() {
  const client = await pool.connect();
  
  try {
    console.log('Starting Umgebung attractions import...');
    
    // Get tenant_id
    const tenantResult = await client.query(
      "SELECT id FROM tenants WHERE slug = 'hornbadmeinberg'"
    );
    
    if (tenantResult.rows.length === 0) {
      throw new Error('Tenant hornbadmeinberg not found');
    }
    
    const tenantId = tenantResult.rows[0].id;
    console.log(`Found tenant: ${tenantId}`);
    
    let imported = 0;
    
    for (const attraction of umgebungAttractions) {
      try {
        // Download image
        const imageFilename = `umgebung-${attraction.display_order}.jpg`;
        console.log(`Downloading image for ${attraction.name}...`);
        const localImageUrl = await downloadImage(attraction.image_url, imageFilename);
        
        if (!localImageUrl) {
          console.warn(`Skipping ${attraction.name} - image download failed`);
          continue;
        }
        
        // Check if attraction already exists
        const existingResult = await client.query(
          'SELECT id FROM attractions WHERE tenant_id = $1 AND name = $2',
          [tenantId, attraction.name]
        );
        
        if (existingResult.rows.length > 0) {
          // Update existing
          await client.query(
            `UPDATE attractions 
             SET description = $3, category = $4, image_url = $5, address = $6, more_info_url = $7, display_order = $8
             WHERE tenant_id = $1 AND name = $2`,
            [
              tenantId,
              attraction.name,
              attraction.description,
              attraction.category,
              localImageUrl,
              attraction.address,
              attraction.more_info_url,
              attraction.display_order
            ]
          );
        } else {
          // Insert new
          await client.query(
            `INSERT INTO attractions (tenant_id, name, description, category, image_url, address, more_info_url, display_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              tenantId,
              attraction.name,
              attraction.description,
              attraction.category,
              localImageUrl,
              attraction.address,
              attraction.more_info_url,
              attraction.display_order
            ]
          );
        }
        
        imported++;
        console.log(`✓ Imported: ${attraction.name} (${attraction.category})`);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error importing ${attraction.name}:`, error);
      }
    }
    
    console.log(`\n✅ Successfully imported ${imported} Umgebung attractions!`);
    
  } catch (error) {
    console.error('Error during import:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

importUmgebungAttractions();
