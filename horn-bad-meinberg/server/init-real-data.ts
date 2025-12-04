/**
 * Initialize database with REAL Horn-Bad Meinberg data
 */
import { getDb } from "./db";
import { sql } from "drizzle-orm";

export async function initRealData() {
  console.log('[Real-Data-Init] Starting initialization with real Horn-Bad Meinberg data...');
  
  const db = await getDb();
  if (!db) {
    console.error('[Real-Data-Init] Database not available');
    return;
  }

  try {
    // Insert REAL news from Horn-Bad Meinberg website
    await db.execute(sql`
      INSERT INTO news (id, "tenantId", title, teaser, "bodyMD", "publishedAt")
      VALUES 
        ('news_hbm_1', 'hornbadmeinberg', 'Besser informiert durch soziale Medien - Stadt Horn-Bad Meinberg ist auf Facebook und Instagram', 
         'Instagram und Facebook sind aus dem Alltag vieler Menschen nicht mehr wegzudenken. Dies möchte auch die Stadt Horn-Bad Meinberg nutzen.', 
         'Die Stadt Horn-Bad Meinberg ist jetzt auch auf Instagram und Facebook vertreten, um Bürgerinnen und Bürger noch besser zu informieren.', 
         '2025-11-26'),
        ('news_hbm_2', 'hornbadmeinberg', 'Damit alle sicher ankommen: Winterdienst erfordert Platz', 
         'Mit Beginn der winterlichen Witterung sind das Team des städtischen Bauhofs und beauftragte Unternehmen häufig bereits ab drei Uhr morgens im Einsatz.', 
         'Der Winterdienst der Stadt Horn-Bad Meinberg ist bereit für die kalte Jahreszeit. Bitte halten Sie Straßen und Gehwege frei, damit der Räumdienst seine Arbeit machen kann.', 
         '2025-11-25'),
        ('news_hbm_3', 'hornbadmeinberg', 'Wunschbaumaktion in Horn-Bad Meinberg hat begonnen', 
         'Damit in Horn-Bad Meinberg kein Kind ohne Weihnachtsgeschenk bleibt, findet auch in diesem Jahr wieder die Wunschbaumaktion für Kinder von 3 bis 12 Jahren statt.', 
         'Die traditionelle Wunschbaumaktion ermöglicht es Bürgerinnen und Bürgern, Kindern aus einkommensschwachen Familien eine Freude zu Weihnachten zu machen.', 
         '2025-11-24'),
        ('news_hbm_4', 'hornbadmeinberg', 'Schwimmhalle im Schulzentrum ab Montag wieder in Betrieb', 
         'Die Schwimmhalle im Schulzentrum von Horn-Bad Meinberg kann ab Montag, 10. November, wieder ihren Betrieb aufnehmen.', 
         'Nach erfolgreicher Reparatur des defekten Hubbodens steht die Schwimmhalle wieder für Schulen und Vereine zur Verfügung.', 
         '2025-11-07'),
        ('news_hbm_5', 'hornbadmeinberg', 'Stadt Horn-Bad Meinberg lädt zur Seniorenweihnachtsfeier ein', 
         'Die Stadt Horn-Bad Meinberg lädt alle Seniorinnen und Senioren herzlich zur traditionellen Weihnachtsfeier ein.', 
         'Die Seniorenweihnachtsfeier findet im Dezember statt. Anmeldungen sind erforderlich, da die Plätze begrenzt sind.', 
         '2025-11-06')
      ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title
    `);
    console.log('[Real-Data-Init] ✅ Real news inserted');

    // Insert REAL events
    await db.execute(sql`
      INSERT INTO events (id, "tenantId", title, description, "startDate", location)
      VALUES 
        ('event_hbm_1', 'hornbadmeinberg', 'Seniorenweihnachtsfeier', 
         'Traditionelle Weihnachtsfeier für alle Seniorinnen und Senioren aus Horn-Bad Meinberg', 
         '2025-12-15 15:00:00', 'Kurhaus Bad Meinberg'),
        ('event_hbm_2', 'hornbadmeinberg', 'Volkstrauertag Gedenkfeier', 
         'Kranzniederlegungen an den Ehrenmalen aller Stadtteile', 
         '2025-11-17 11:00:00', 'Ehrenmal Horn'),
        ('event_hbm_3', 'hornbadmeinberg', 'Weihnachtsmarkt Horn-Bad Meinberg', 
         'Traditioneller Weihnachtsmarkt mit Kunsthandwerk und kulinarischen Spezialitäten', 
         '2025-12-07 14:00:00', 'Marktplatz Horn'),
        ('event_hbm_4', 'hornbadmeinberg', 'Neujahrsempfang der Stadt', 
         'Offizieller Neujahrsempfang mit Bürgermeister und Stadtrat', 
         '2026-01-12 18:00:00', 'Rathaus Horn-Bad Meinberg'),
        ('event_hbm_5', 'hornbadmeinberg', 'Eselwanderung im Winter', 
         'Erlebnisführung mit Eseln durch die winterliche Landschaft', 
         '2025-12-20 10:00:00', 'Rosenhof Lippe')
      ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title
    `);
    console.log('[Real-Data-Init] ✅ Real events inserted');

    // Insert REAL departments
    await db.execute(sql`
      INSERT INTO departments (id, "tenantId", name, description, phone, email, "openingHours")
      VALUES 
        ('dept_hbm_1', 'hornbadmeinberg', 'Bürgerbüro', 
         'Meldewesen, Ausweise, Führerscheine, Kfz-Zulassungen', 
         '+49 5234 97-0', 'buergerbuero@horn-badmeinberg.de',
         'Mo-Fr: 8:00-12:00 Uhr, Do: 14:00-18:00 Uhr'),
        ('dept_hbm_2', 'hornbadmeinberg', 'Bauamt', 
         'Bauanträge, Baugenehmigungen, Bauberatung', 
         '+49 5234 97-150', 'bauamt@horn-badmeinberg.de',
         'Mo-Fr: 8:00-12:00 Uhr, Do: 14:00-16:00 Uhr'),
        ('dept_hbm_3', 'hornbadmeinberg', 'Ordnungsamt', 
         'Gewerbean- und -abmeldungen, Veranstaltungsgenehmigungen, Verkehrsangelegenheiten', 
         '+49 5234 97-200', 'ordnungsamt@horn-badmeinberg.de',
         'Mo-Fr: 8:00-12:00 Uhr'),
        ('dept_hbm_4', 'hornbadmeinberg', 'Standesamt', 
         'Eheschließungen, Geburts- und Sterbeurkunden', 
         '+49 5234 97-120', 'standesamt@horn-badmeinberg.de',
         'Mo-Fr: 8:00-12:00 Uhr, nach Terminvereinbarung'),
        ('dept_hbm_5', 'hornbadmeinberg', 'Stadtwerke', 
         'Strom, Wasser, Abwasser, Abfallentsorgung', 
         '+49 5234 97-300', 'stadtwerke@horn-badmeinberg.de',
         'Mo-Fr: 7:00-16:00 Uhr')
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
    `);
    console.log('[Real-Data-Init] ✅ Real departments inserted');

    // Insert notification
    await db.execute(sql`
      INSERT INTO notifications (id, "tenantId", title, message, type, "publishedAt")
      VALUES 
        ('notif_hbm_1', 'hornbadmeinberg', 'Willkommen in der Bürger-App!', 
         'Herzlich willkommen in der digitalen Stadtverwaltung von Horn-Bad Meinberg. Hier finden Sie alle wichtigen Informationen und Services.', 
         'info', NOW())
      ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title
    `);
    console.log('[Real-Data-Init] ✅ Real notification inserted');

    console.log('[Real-Data-Init] ✅ All real data inserted successfully!');
    
  } catch (error) {
    console.error('[Real-Data-Init] Error:', error);
  }
}
