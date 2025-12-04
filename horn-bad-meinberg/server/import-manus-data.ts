/**
 * Import data from Manus PostgreSQL to Render PostgreSQL
 */
import { getDb } from "./db";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

export async function importManusData() {
  console.log('[Manus-Import] Starting data import from Manus database...');
  
  const db = await getDb();
  if (!db) {
    console.error('[Manus-Import] Database not available');
    return;
  }

  try {
    // Read the SQL dump file
    const sqlFile = path.join(__dirname, '../manus_data.sql');
    if (!fs.existsSync(sqlFile)) {
      console.error('[Manus-Import] SQL dump file not found:', sqlFile);
      return;
    }

    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL dump
    await db.execute(sql.raw(sqlContent));
    
    console.log('[Manus-Import] ✅ All data imported successfully!');
  } catch (error) {
    console.error('[Manus-Import] Error importing data:', error);
  }
}
