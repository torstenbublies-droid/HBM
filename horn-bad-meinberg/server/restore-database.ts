/**
 * Restore complete database from backup
 * This runs once on first deployment to populate the Render database
 */
import { getDb } from "./db";
import * as fs from "fs";
import * as path from "path";

export async function restoreDatabase() {
  console.log('[DB-Restore] Starting database restore from backup...');
  
  const db = await getDb();
  if (!db) {
    console.error('[DB-Restore] Database not available');
    return;
  }

  try {
    // Check if database is already populated
    const checkResult = await db.execute(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'tenants'
    `);
    
    const tableExists = checkResult.rows[0]?.count > 0;
    
    if (tableExists) {
      const tenantsCheck = await db.execute(`SELECT COUNT(*) as count FROM tenants`);
      const tenantCount = tenantsCheck.rows[0]?.count || 0;
      
      if (tenantCount > 0) {
        console.log(`[DB-Restore] Database already populated with ${tenantCount} tenants, skipping restore`);
        return;
      }
    }
    
    // Read the SQL backup file
    const sqlFile = path.join(__dirname, '../complete_database_backup.sql');
    if (!fs.existsSync(sqlFile)) {
      console.error('[DB-Restore] SQL backup file not found:', sqlFile);
      return;
    }

    console.log('[DB-Restore] Reading backup file...');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('[DB-Restore] Executing SQL backup...');
    // Split by semicolon and execute each statement
    const statements = sqlContent.split(';').filter(s => s.trim().length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement && !statement.startsWith('--')) {
        try {
          await db.execute(statement + ';');
        } catch (error) {
          // Ignore errors for statements that might fail (like DROP TABLE IF NOT EXISTS)
          if (!error.message.includes('does not exist')) {
            console.error(`[DB-Restore] Error executing statement ${i}:`, error.message);
          }
        }
      }
      
      if (i % 100 === 0) {
        console.log(`[DB-Restore] Processed ${i}/${statements.length} statements...`);
      }
    }
    
    console.log('[DB-Restore] ✅ Database restored successfully!');
  } catch (error) {
    console.error('[DB-Restore] Error restoring database:', error);
  }
}
