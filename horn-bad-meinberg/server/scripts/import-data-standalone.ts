/**
 * Standalone data import script - runs during build/migration phase
 */
import postgres from "postgres";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function importDataStandalone() {
  console.log('[Data-Import-Standalone] Starting data import from backup...');
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('[Data-Import-Standalone] DATABASE_URL not set');
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 1 });

  try {
    // Check if data is already imported
    const tenantsCheck = await sql`SELECT COUNT(*) as count FROM tenants`;
    const tenantCount = Number(tenantsCheck[0]?.count || 0);
    
    if (tenantCount > 0) {
      console.log(`[Data-Import-Standalone] Database already has ${tenantCount} tenants, skipping import`);
      await sql.end();
      return;
    }
    
    // Find the SQL backup file - try multiple locations
    let sqlFile = path.join(__dirname, '../../complete_database_backup.sql');
    
    if (!fs.existsSync(sqlFile)) {
      // Try from project root
      sqlFile = path.join(process.cwd(), 'complete_database_backup.sql');
    }
    
    if (!fs.existsSync(sqlFile)) {
      console.error('[Data-Import-Standalone] SQL backup file not found. Tried:');
      console.error('  -', path.join(__dirname, '../../complete_database_backup.sql'));
      console.error('  -', path.join(process.cwd(), 'complete_database_backup.sql'));
      await sql.end();
      process.exit(1);
    }

    console.log('[Data-Import-Standalone] Reading backup file from:', sqlFile);
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('[Data-Import-Standalone] Executing SQL backup...');
    
    // Split by semicolon and execute each statement
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .filter(s => !s.startsWith('--'))
      .filter(s => !s.includes('CREATE TABLE'))
      .filter(s => !s.includes('CREATE SEQUENCE'))
      .filter(s => !s.includes('ALTER TABLE'))
      .filter(s => !s.includes('DROP TABLE'));
    
    console.log(`[Data-Import-Standalone] Found ${statements.length} INSERT statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          await sql.unsafe(statement + ';');
          successCount++;
        } catch (error: any) {
          errorCount++;
          console.error(`[Data-Import-Standalone] Error executing statement ${i}:`, error.message);
        }
      }
      
      if (i % 50 === 0 && i > 0) {
        console.log(`[Data-Import-Standalone] Processed ${i}/${statements.length} statements (${successCount} success, ${errorCount} errors)...`);
      }
    }
    
    console.log('[Data-Import-Standalone] ✅ Data import completed!');
    console.log(`[Data-Import-Standalone] Success: ${successCount}, Errors: ${errorCount}`);
    
    // Verify import
    const finalCheck = await sql`SELECT COUNT(*) as count FROM tenants`;
    const finalCount = Number(finalCheck[0]?.count || 0);
    console.log(`[Data-Import-Standalone] Final tenant count: ${finalCount}`);
    
    await sql.end();
  } catch (error: any) {
    console.error('[Data-Import-Standalone] Fatal error:', error);
    await sql.end();
    process.exit(1);
  }
}

// Run immediately
importDataStandalone().catch(err => {
  console.error("Fatal error in data import", err);
  process.exit(1);
});
