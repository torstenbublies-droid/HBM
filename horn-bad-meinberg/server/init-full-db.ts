/**
 * Full database initialization script
 * Creates all tables and populates with sample data
 */
import { getDb } from "./db";
import { sql } from "drizzle-orm";

export async function initFullDatabase() {
  console.log('[DB-Init] Starting full database initialization...');
  
  const db = await getDb();
  if (!db) {
    console.error('[DB-Init] Database not available');
    return;
  }

  try {
    // Create ENUMS first
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE role AS ENUM ('user', 'admin', 'tenant_admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE issue_status AS ENUM ('eingegangen', 'in_bearbeitung', 'erledigt');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE priority AS ENUM ('low', 'medium', 'high', 'critical');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE contact_status AS ENUM ('neu', 'in_bearbeitung', 'erledigt');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE notification_type AS ENUM ('info', 'warning', 'danger', 'event');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    await db.execute(sql`
      DO $$ BEGIN
        CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    
    console.log('[DB-Init] ✅ Enums created');

    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        "tenantId" VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
        name TEXT,
        email VARCHAR(320),
        "loginMethod" VARCHAR(64),
        role role DEFAULT 'user' NOT NULL,
        "oneSignalPlayerId" VARCHAR(64),
        "pushEnabled" BOOLEAN DEFAULT true NOT NULL,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "lastSignedIn" TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('[DB-Init] ✅ users table created');

    // Create news table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS news (
        id VARCHAR(64) PRIMARY KEY,
        "tenantId" VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        teaser TEXT,
        "bodyMD" TEXT,
        "imageUrl" VARCHAR(1000),
        category VARCHAR(100),
        "publishedAt" TIMESTAMP NOT NULL,
        "sourceUrl" VARCHAR(1000),
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('[DB-Init] ✅ news table created');

    // Create events table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(64) PRIMARY KEY,
        "tenantId" VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        "startDate" TIMESTAMP NOT NULL,
        "endDate" TIMESTAMP,
        location VARCHAR(500),
        latitude VARCHAR(50),
        longitude VARCHAR(50),
        "imageUrl" VARCHAR(1000),
        "ticketLink" VARCHAR(1000),
        category VARCHAR(100),
        cost VARCHAR(200),
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('[DB-Init] ✅ events table created');

    // Create departments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS departments (
        id VARCHAR(64) PRIMARY KEY,
        "tenantId" VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(500) NOT NULL,
        description TEXT,
        responsibilities TEXT,
        "contactName" VARCHAR(200),
        phone VARCHAR(50),
        email VARCHAR(320),
        address TEXT,
        "openingHours" TEXT,
        "appointmentLink" VARCHAR(1000),
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('[DB-Init] ✅ departments table created');

    // Create issueReports table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "issueReports" (
        id VARCHAR(64) PRIMARY KEY,
        "tenantId" VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        "userId" VARCHAR(64),
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        latitude VARCHAR(50),
        longitude VARCHAR(50),
        "imageUrl" VARCHAR(1000),
        status issue_status DEFAULT 'eingegangen' NOT NULL,
        priority priority DEFAULT 'medium' NOT NULL,
        "assignedTo" VARCHAR(64),
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('[DB-Init] ✅ issueReports table created');

    // Create posts table (Nachbarschaftshilfe)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS posts (
        id VARCHAR(64) PRIMARY KEY,
        "tenantId" VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        "userId" VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100),
        "imageUrl" VARCHAR(1000),
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('[DB-Init] ✅ posts table created');

    // Create notifications table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(64) PRIMARY KEY,
        "tenantId" VARCHAR(64) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        message TEXT NOT NULL,
        type notification_type DEFAULT 'info' NOT NULL,
        priority notification_priority DEFAULT 'medium' NOT NULL,
        "targetAudience" TEXT,
        "publishedAt" TIMESTAMP NOT NULL,
        "expiresAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('[DB-Init] ✅ notifications table created');

    console.log('[DB-Init] ✅ All tables created successfully!');
    
    // Now populate with sample data
    await populateSampleData(db);
    
  } catch (error) {
    console.error('[DB-Init] Error:', error);
  }
}

async function populateSampleData(db: any) {
  console.log('[DB-Init] Populating sample data...');
  
  try {
    // Insert sample news
    await db.execute(sql`
      INSERT INTO news (id, "tenantId", title, teaser, "publishedAt")
      VALUES 
        ('news1', 'hornbadmeinberg', 'Willkommen in Horn-Bad Meinberg', 'Die neue Bürger-App ist online!', NOW()),
        ('news2', 'hornbadmeinberg', 'Rathaus Öffnungszeiten', 'Neue Öffnungszeiten ab Januar', NOW() - INTERVAL '1 day')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('[DB-Init] ✅ Sample news inserted');

    // Insert sample events
    await db.execute(sql`
      INSERT INTO events (id, "tenantId", title, description, "startDate", location)
      VALUES 
        ('event1', 'hornbadmeinberg', 'Weihnachtsmarkt', 'Traditioneller Weihnachtsmarkt im Ortskern', NOW() + INTERVAL '7 days', 'Marktplatz'),
        ('event2', 'hornbadmeinberg', 'Neujahrsempfang', 'Neujahrsempfang der Stadt', NOW() + INTERVAL '30 days', 'Rathaus')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('[DB-Init] ✅ Sample events inserted');

    // Insert sample departments
    await db.execute(sql`
      INSERT INTO departments (id, "tenantId", name, description, phone, email)
      VALUES 
        ('dept1', 'hornbadmeinberg', 'Bürgerbüro', 'Meldewesen, Ausweise, Führerscheine', '+49 5234 9710', 'buergerbuero@horn-badmeinberg.de'),
        ('dept2', 'hornbadmeinberg', 'Bauamt', 'Bauanträge und Baugenehmigungen', '+49 5234 9720', 'bauamt@horn-badmeinberg.de')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('[DB-Init] ✅ Sample departments inserted');

    // Insert sample notification
    await db.execute(sql`
      INSERT INTO notifications (id, "tenantId", title, message, type, "publishedAt")
      VALUES 
        ('notif1', 'hornbadmeinberg', 'Willkommen!', 'Herzlich willkommen in der Bürger-App Horn-Bad Meinberg', 'info', NOW())
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('[DB-Init] ✅ Sample notification inserted');

    console.log('[DB-Init] ✅ All sample data inserted successfully!');
    
  } catch (error) {
    console.error('[DB-Init] Error populating data:', error);
  }
}
