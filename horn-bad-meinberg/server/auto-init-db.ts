/**
 * Auto-initialize database on app startup
 * Creates tenants table and inserts tenants if not exists
 * Updated to match Drizzle schema with camelCase columns
 */
import pg from 'pg';
const { Client } = pg;

export async function autoInitDatabase() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL not set, skipping auto-init');
    return;
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    console.log('[Auto-Init] Checking database...');

    // Drop old table if it exists with wrong schema
    await client.query('DROP TABLE IF EXISTS tenants CASCADE');
    console.log('[Auto-Init] Dropped old tenants table');

    // Create tenants table with quoted camelCase column names (matching Drizzle schema)
    await client.query(`
      CREATE TABLE tenants (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        "primaryColor" VARCHAR(20) DEFAULT '#0066CC',
        "secondaryColor" VARCHAR(20) DEFAULT '#00A86B',
        "logoUrl" VARCHAR(1000),
        "heroImageUrl" VARCHAR(1000),
        "contactEmail" VARCHAR(320),
        "contactPhone" VARCHAR(50),
        "contactAddress" TEXT,
        "weatherLat" VARCHAR(50),
        "weatherLon" VARCHAR(50),
        "weatherCity" VARCHAR(200),
        "chatbotName" VARCHAR(100) DEFAULT 'Chatbot',
        "chatbotSystemPrompt" TEXT,
        "enabledFeatures" TEXT,
        "isActive" BOOLEAN DEFAULT true NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('[Auto-Init] ✅ Tenants table created with correct schema');

    // Insert hornbadmeinberg tenant
    console.log('[Auto-Init] Creating hornbadmeinberg tenant...');
    await client.query(`
      INSERT INTO tenants (
        id, name, slug, "primaryColor", "secondaryColor",
        "logoUrl", "heroImageUrl", "contactEmail", "contactPhone", "contactAddress",
        "weatherLat", "weatherLon", "weatherCity", "chatbotName", "enabledFeatures", "isActive"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      )
    `, [
      'hornbadmeinberg',
      'Horn-Bad Meinberg',
      'hornbadmeinberg',
      '#4A7C7E',
      '#2C5456',
      '/assets/hornbadmeinberg/logo.jpg',
      '/assets/hornbadmeinberg/hero.png',
      'info@horn-badmeinberg.de',
      '+49 5234 9710',
      'Mittelstraße 16, 32805 Horn-Bad Meinberg',
      '51.8833',
      '8.9667',
      'Horn-Bad Meinberg',
      'Meinberg Bot',
      '["news","events","waste","chat","forms","clubs","education","attractions"]',
      true
    ]);
    console.log('[Auto-Init] ✅ Horn-Bad Meinberg tenant created');

    // Insert schieder tenant for backward compatibility
    console.log('[Auto-Init] Creating schieder tenant for backward compatibility...');
    await client.query(`
      INSERT INTO tenants (
        id, name, slug, "primaryColor", "secondaryColor",
        "contactEmail", "contactPhone", "contactAddress", "weatherCity", "isActive"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      )
    `, [
      'schieder',
      'Schieder-Schwalenberg',
      'schieder',
      '#3b82f6',
      '#1e40af',
      'info@schieder-schwalenberg.de',
      '+49 5282 6010',
      'Domäne 3, 32816 Schieder-Schwalenberg',
      'Schieder-Schwalenberg',
      true
    ]);
    console.log('[Auto-Init] ✅ Schieder tenant created');

    await client.end();
    console.log('[Auto-Init] ✅ Database initialization complete');
  } catch (error) {
    console.error('[Auto-Init] ❌ Error:', error);
    try {
      await client.end();
    } catch (e) {
      // Ignore
    }
  }
}
