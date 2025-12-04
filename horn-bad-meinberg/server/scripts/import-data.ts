/**
 * Import data from SQL backup after migrations
 */
import { getDb } from "../db";
import * as fs from "fs";
import * as path from "path";

export async function importData() {
  console.log('[Data-Import] Starting data import from backup...');
  
  const db = await getDb();
  if (!db) {
    console.error('[Data-Import] Database not available');
    return;
  }

  try {
    // Check if data is already imported
    const tenantsCheck = await db.execute(`SELECT COUNT(*) as count FROM tenants`);
    const tenantCount = tenantsCheck.rows[0]?.count || 0;
    
    if (tenantCount > 0) {
      console.log(`[Data-Import] Database already has ${tenantCount} tenants, skipping import`);
      return;
    }
    
    // Read the SQL backup file
    const sqlFile = path.join(__dirname, '../../complete_database_backup.sql');
    if (!fs.existsSync(sqlFile)) {
      console.error('[Data-Import] SQL backup file not found:', sqlFile);
      return;
    }

    console.log('[Data-Import] Reading backup file...');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('[Data-Import] Executing SQL backup...');
    // Split by semicolon and execute each statement
    const statements = sqlContent
      .split(';')
      .filter(s => s.trim().length > 0)
      .filter(s => !s.trim().startsWith('--'))
      .filter(s => !s.includes('CREATE TABLE'))
      .filter(s => !s.includes('CREATE SEQUENCE'))
      .filter(s => !s.includes('ALTER TABLE'));
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          await db.execute(statement + ';');
        } catch (error) {
          console.error(`[Data-Import] Error executing statement ${i}:`, error.message);
        }
      }
      
      if (i % 50 === 0) {
        console.log(`[Data-Import] Processed ${i}/${statements.length} statements...`);
      }
    }
    
    console.log('[Data-Import] ✅ Data imported successfully!');
  } catch (error) {
    console.error('[Data-Import] Error importing data:', error);
  }
}

// Auto-run is handled by index.ts startup sequence
