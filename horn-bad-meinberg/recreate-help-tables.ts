import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function recreateTables() {
  try {
    console.log('Dropping old tables...');
    await sql`DROP TABLE IF EXISTS help_ratings CASCADE`;
    await sql`DROP TABLE IF EXISTS help_messages CASCADE`;
    await sql`DROP TABLE IF EXISTS help_offers CASCADE`;
    await sql`DROP TABLE IF EXISTS help_requests CASCADE`;
    
    console.log('Creating help_requests table...');
    await sql`
      CREATE TABLE help_requests (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        created_by TEXT NOT NULL,
        created_by_name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        district TEXT NOT NULL,
        meeting_point TEXT,
        timeframe TEXT,
        urgency TEXT DEFAULT 'medium',
        contact_method TEXT NOT NULL,
        phone_number TEXT,
        status TEXT DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('Creating help_offers table...');
    await sql`
      CREATE TABLE help_offers (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        created_by TEXT NOT NULL,
        created_by_name TEXT NOT NULL,
        categories TEXT[] NOT NULL,
        description TEXT NOT NULL,
        district TEXT NOT NULL,
        radius INTEGER DEFAULT 5,
        availability TEXT,
        contact_method TEXT NOT NULL,
        phone_number TEXT,
        status TEXT DEFAULT 'open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('Creating indexes...');
    await sql`CREATE INDEX idx_help_requests_tenant ON help_requests(tenant_id)`;
    await sql`CREATE INDEX idx_help_requests_status ON help_requests(status)`;
    await sql`CREATE INDEX idx_help_offers_tenant ON help_offers(tenant_id)`;
    await sql`CREATE INDEX idx_help_offers_status ON help_offers(status)`;
    
    console.log('✓ Tables recreated successfully!');
    await sql.end();
  } catch (error) {
    console.error('✗ Error:', error);
    await sql.end();
    process.exit(1);
  }
}

recreateTables();
