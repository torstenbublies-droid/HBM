import axios from 'axios';
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
const IMAGES_DIR = path.join(__dirname, '../../public/assets/hornbadmeinberg/attractions');

// Create images directory if it doesn't exist
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

interface Attraction {
  name: string;
  description: string;
  imageUrl: string;
  address: string;
  moreInfoUrl: string;
  category: string;
}

// Manually curated list of attractions from the website
const attractionsData: Attraction[] = [
  {
    name: 'Externsteine',
    description: 'Die eindrucksvolle Felsformation gehört zu den bemerkenswertesten Natur- und Kulturdenkmälern Mitteleuropas. Es ranken sich zahllose Geschichten und Mythen um die ca. 80 Millionen Jahre alte Sandsteingruppe. Die Felsen können über zwei in den Stein gearbeitete Treppenaufgänge erklommen werden. Ein Aufstieg, der sich lohnt! Denn aus ca. 40 m Höhe bietet sich den Besuchern ein beeindruckender Ausblick in die abwechslungsreiche Landschaft des Teutoburger Waldes.',
    imageUrl: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/8/6/csm_10807-Externsteine_53dd031407.jpg',
    address: '',
    moreInfoUrl: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html',
    category: 'Natur & Landschaft'
  },
  {
    name: 'Vogeltaufe',
    description: 'Der südöstlich auslaufende Bergrücken des Stembergs wird „Vogeltaufe" genannt, nach einer Sage. Der Sage nach wollte hier Abt Anastasius die Heiden des Lipperlandes taufen. Gerade in dem Moment, als Abbio von Thiotmalli den Göttern Donar, Saxnot und Wotan entsagte, rauschte es in der Luft und Hunderte von kleinen braunen Vögeln ließen sich hernieder und sangen so schön, wie es nie zuvor jemand gehört hatte.',
    imageUrl: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/c/5/csm_Vogeltaufe_dbeb3e74e7.jpg',
    address: 'Vogeltaufenweg, 32805 Horn-Bad Meinberg',
    moreInfoUrl: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html',
    category: 'Natur & Landschaft'
  },
  {
    name: 'Lavendelfeld Fromhausen',
    description: 'Bereits seit 2014 werden in dem schönen Lipperland (Fromhausen) erfolgreich Lavendelfelder angelegt. Das lila Blütenmeer begeistert seit Jahren Alt und Jung und ist mittlerweile zu einem magischen Anziehungsort für Menschen aus aller Welt geworden. Jedes Jahr im Sommer, vor allem kurz vor Sonnenuntergang erlebt man einmalige, magische Augenblicke begleitet von duftend-blumigen Feldern.',
    imageUrl: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/6/4/csm_10404-Lavendel-Fromhausen_6bf4c2ef9d.jpg',
    address: '',
    moreInfoUrl: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html',
    category: 'Natur & Landschaft'
  },
  {
    name: 'Historischer Kurpark Bad Meinberg',
    description: 'Der 6,25 ha große historische Kurpark eines der ältesten Mineral- und Moorheilbäder Deutschlands, wurde im Spätbarock ab 1767 angelegt und immer wieder den Erfordernissen eines modernen Kurbetriebs angepasst und erweitert. Von dem Landschaftsgarten des 19. Jahrhunderts sind bis heute ein großer Teil des alten Baumbestandes und ein Schneckenberg erhalten.',
    imageUrl: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/d/6/csm_Hist_Kurpark_HBM_mit_Brunnentempel_a1e1ddefe6.jpg',
    address: 'Parkstraße 10, 32805 Horn-Bad Meinberg',
    moreInfoUrl: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html',
    category: 'Parks & Gärten'
  },
  {
    name: 'Seekurpark Bad Meinberg',
    description: 'Von 1952 bis 1955 wurde nach Plänen von Hermann Niemeyer der Kurpark am See angelegt. Hier erwartet den Gast in den Monaten Mai bis Oktober von 9:00 bis 11:00 und 15:00 bis 17:00 Uhr eine 12 Meter hohe Fontäne.',
    imageUrl: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/b/4/csm_Seekurpark_Bad_Meinberg_2_R_GesUndTourismus_Horn-Bad_Meinberg_GmbH_6ccab97ef7.jpg',
    address: '32805 Horn-Bad Meinberg',
    moreInfoUrl: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html',
    category: 'Parks & Gärten'
  },
  {
    name: 'Silvaticum - Länderwaldpark',
    description: 'Ende der fünfziger Jahre wurde in Bad Meinberg ein ganz neuartiger Kurpark geschaffen, ein Länderwaldpark, geordnet nach unterschiedlichen Landschaften der Erde. 36.000 Bäume und Sträucher auf einer Fläche von ca. 12 ha. Dreizehn je ca. 1 ha große Waldlandschaften aus Mittel- und Südeuropa, Nordamerika und Ostasien. Die Wege des Silvaticums werden gern für erholsame Spaziergänge und Wanderungen genutzt.',
    imageUrl: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/1/1/csm_Horn-Bad_Meinberg-Silvaticum-Teutoburger-Wald-D-Ketz-179_6e5dac6128.jpg',
    address: 'Wällenweg, 32805 Horn-Bad Meinberg',
    moreInfoUrl: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html',
    category: 'Parks & Gärten'
  },
  {
    name: 'Kurpark Holzhausen-Externsteine',
    description: 'Der Kurpark im Luftkurort Holzhausen-Externsteinen bietet vielfältige Möglichkeiten für Begegnungen, Sport und Entspannung. Mit einer Boulderwand, einem inklusiven Bodentrampolin und einem Balancierparcours fördert der Park die sportliche Betätigung von Jung und Alt. Umgeben von einer reichen Baum- und Pflanzenvielfalt, darunter beeindruckende Mammutbäume und Ginkgos.',
    imageUrl: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/9/c/csm_Horn-Bad_Meinberg-Kurpark_Holzhausen-Externsteine-Teutoburger-Wald-D-Ketz-197_ec6aa9ac2f.jpg',
    address: 'Golfweg, 32805 Horn-Bad Meinberg',
    moreInfoUrl: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html',
    category: 'Parks & Gärten'
  },
  {
    name: 'Burg Horn',
    description: 'Das bedeutende Baudenkmal der Landesgeschichte mit umliegendem Burghof-Ensemble beherbergt ein Museum mit Dauerausstellung und wechselnden Exponaten. Hier wird die Burg- und Stadtgeschichte von Horn lebendig. Öffnungszeiten (Ostern bis Allerheiligen): Fr., Sa., So. 14:00 - 17:00 Uhr. Der Eintritt ist frei.',
    imageUrl: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/3/3/csm_1-burg_5226ff00be.jpg',
    address: '32805 Horn-Bad Meinberg',
    moreInfoUrl: 'http://www.burgmuseum-horn.de/',
    category: 'Kultur & Geschichte'
  },
  {
    name: 'Historischer Stadtkern Horn',
    description: 'Horn gilt als Gründungsstadt der Edelherren zur Lippe und taucht urkundlich erstmals 1248 auf. Im Stadtkern befinden sich neben der Burg Horn mit dem dazugehörigen Burgmuseum zahlreiche historische Fachwerkgebäude und das imposante neugotische Rathaus. Der 1,6 km lange Wallrundgang bietet die Möglichkeit die historische Altstadt von Horn zu umrunden und dabei interessante Winkel der Stadt zu entdecken.',
    imageUrl: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/d/b/csm_histor._Stadtkern_Horn_8232b11484.jpg',
    address: 'Mittelstraße, 32805 Horn-Bad Meinberg',
    moreInfoUrl: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html',
    category: 'Kultur & Geschichte'
  },
  {
    name: 'Rathaus Horn',
    description: 'Das Rathaus in Horn, das auf dem Marktplatz thront, besticht durch seine markante neugotische Bauweise. Der Baumeister und Architekt Wilhelm Lakemeier aus Steinheim (Westfalen) errichtete zwischen 1865 und 1866 das heutige Rathaus als Ersatz für das beim großen Stadtbrand von 1864 zerstörte Vorgängergebäude. Besonders markant ist die zum Marktplatz gerichtete Schaufront und der viergeschossige, achteckige Eckturm.',
    imageUrl: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/9/7/csm_Rathaus_H_Ortskern_2020_61c4077bab.jpg',
    address: 'Marktplatz 4, 32805 Horn-Bad Meinberg',
    moreInfoUrl: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html',
    category: 'Kultur & Geschichte'
  },
  {
    name: 'Brunnentempel',
    description: 'Der Brunnentempel ist das Wahrzeichen von Bad Meinberg und eines der beliebtesten Fotomotive im Historischen Kurpark. Er wurde 1842 errichtet und gilt seitdem als besonderes Augenmerk des Historischen Kurparks. Im Inneren ist die Bad Meinberger Heilquelle in Natura zu bestaunen.',
    imageUrl: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/c/0/csm_Brunnentempel_mit_Musikmuschel__R_GesUndTourismus_Horn-Bad_Meinberg_GmbH_9867e2897a.jpg',
    address: 'Parkstraße 10, 32805 Horn-Bad Meinberg',
    moreInfoUrl: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html',
    category: 'Kultur & Geschichte'
  },
  {
    name: 'Lippischer Velmerstot',
    description: 'Der Velmerstot ist der höchste Berg des Eggegebirges. Der Berg besitzt zwei Bergkuppen: Der Lippische Velmerstot (ca. 440 m) und der Preußische Velmerstot (ca. 460 m). Auf der höchsten Anhöhe befindet sich der Eggeturm, eine Holzkonstruktion mit Aussichtsplattform, von der aus Sie einen 360°-Panoramablick in die sanften Hügel der Umgebung genießen können.',
    imageUrl: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/6/c/csm_Teutoburger_Wald_Naehe_Horn-Bad_Meinberg_Lippischer_Velmerstot_0170_-_R__Tourismus_NRW_e.V.__A1__3d68985e62.jpg',
    address: 'Wanderparkplatz Silbergrund 62, 32805 Horn-Bad Meinberg',
    moreInfoUrl: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html',
    category: 'Natur & Landschaft'
  },
  {
    name: 'Norderteich',
    description: 'Von vielen Einheimischen wird das Natur- und Vogelschutzgebiet rund um den Norderteich auch das „Lippische Meer" genannt und lockt jedes Jahr zahlreiche Wanderer und Ausflügler an. Erstmals 1115 urkundlich im Güterverzeichnis des Corveyer Abtes Erkenbert erwähnt, ist es das älteste Naturschutzgebiet Lippes. Mönche legen einst den zwölf Hektar großen Teich an, um Fische zu züchten.',
    imageUrl: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/0/5/csm_Norderteich_1__335770b2b1.jpg',
    address: 'Steinheimer Str. 201, 32805 Horn-Bad Meinberg',
    moreInfoUrl: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html',
    category: 'Natur & Landschaft'
  },
  {
    name: 'Silberbachtal',
    description: 'Im Silberbachtal nahe der Ortschaft Leopoldstal wird zwischen 1710 und 1711 nach Silber gesucht. Die Wasserkraft des silbrig schimmernden Silberbaches führte jedoch zu einer Ansiedlung verschiedener Mühlenbetriebe. Das wild-romantische Silberbachtal ist der ideale Ausgangspunkt für ausgiebige Wanderungen, etwa zur Velmerstot mit seinen Zwillingsgipfeln.',
    imageUrl: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/b/f/csm_Silberbachtal-Horn-Bad_Meinberg-Kreis_Lippe-Teutoburger-Wald-Tourismus-D-Ketz-051_1__4798b5560c.jpg',
    address: 'Parkplatz Silberbachtal, 32805 Horn-Bad Meinberg',
    moreInfoUrl: 'https://www.hornbadmeinberg.de/tourismus-freizeit/sehenswertes-fuehrungen/sehenswuerdigkeiten-in-horn-bad-meinberg.html',
    category: 'Natur & Landschaft'
  },
  {
    name: 'Freilichtbühne Bellenberg',
    description: 'Die Freilichtbühne Bellenberg liegt direkt am Waldrand und bietet mit rund 850 Sitzplätzen Theaterspaß für Groß und Klein. Sie blickt auf eine 70-jährige Tradition zurück. Die Bühnenanlage gleicht einem Amphitheater - Bühnenfläche und Zuschauerbänke bilden einen Kreis. Ein Teilbereich ist sogar überdacht.',
    imageUrl: 'https://www.hornbadmeinberg.de/fileadmin/_processed_/d/d/csm_Freilichtbuehne_Bellenberg__c__Freilichtbuehne_107462783f.jpg',
    address: '32805 Horn-Bad Meinberg',
    moreInfoUrl: 'https://freilichtbuehne-bellenberg.reservix.de/events',
    category: 'Kultur & Freizeit'
  }
];

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

async function importAttractions() {
  try {
    console.log('Starting attractions import for Horn-Bad Meinberg...\n');

    // Download images
    console.log('Downloading images...');
    for (let i = 0; i < attractionsData.length; i++) {
      const attraction = attractionsData[i];
      const filename = `${i + 1}-${attraction.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 40)}.jpg`;
      const localPath = await downloadImage(attraction.imageUrl, filename);
      
      if (localPath) {
        (attraction as any).localImagePath = localPath;
      }
      
      // Add delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Clear existing attractions for this tenant
    console.log('\nClearing existing attractions...');
    await pool.query('DELETE FROM attractions WHERE tenant_id = $1', [TENANT_ID]);

    // Insert new attractions
    console.log('Inserting attractions into database...');
    let inserted = 0;
    
    for (let i = 0; i < attractionsData.length; i++) {
      const attraction = attractionsData[i];
      const localPath = (attraction as any).localImagePath || '';
      
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
            localPath,
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
      'SELECT category, COUNT(*) as count FROM attractions WHERE tenant_id = $1 GROUP BY category ORDER BY category',
      [TENANT_ID]
    );
    console.log('\nSummary by category:');
    result.rows.forEach(row => {
      console.log(`  ${row.category}: ${row.count} attractions`);
    });

  } catch (error) {
    console.error('Error importing attractions:', error);
  } finally {
    await pool.end();
  }
}

// Run the import
importAttractions();
