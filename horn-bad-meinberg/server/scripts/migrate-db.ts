#!/usr/bin/env tsx

/**
 * Automatic Database Migration Script
 * 
 * This script runs database migrations automatically on deployment.
 * It creates all necessary tables in the Supabase database.
 * 
 * Usage:
 *   tsx server/scripts/migrate-db.ts
 */

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function runMigrations() {
  console.log('='.repeat(60));
  console.log('Database Migration Script');
  console.log('='.repeat(60));
  console.log('');

  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set');
    console.error('Please set DATABASE_URL in your environment variables.');
    process.exit(1);
  }

  console.log('✅ DATABASE_URL found');
  console.log('🔄 Connecting to database...');

  try {
    // Create postgres connection for migrations
    const migrationClient = postgres(connectionString, { max: 1 });
    const db = drizzle(migrationClient);

    console.log('✅ Connected to database');
    console.log('🔄 Running migrations...');

    // Run migrations from the drizzle folder
    await migrate(db, { migrationsFolder: './drizzle' });

    console.log('✅ Migrations completed successfully!');
    console.log('');
    console.log('Database tables created:');
    console.log('  - users');
    console.log('  - news');
    console.log('  - events');
    console.log('  - departments');
    console.log('  - issueReports');
    console.log('  - wasteSchedule');
    console.log('  - alerts');
    console.log('  - pois');
    console.log('  - institutions');
    console.log('  - councilMeetings');
    console.log('  - mayorInfo');
    console.log('  - chatLogs');
    console.log('  - userPreferences');
    console.log('  - contactMessages');
    console.log('  - pushNotifications');
    console.log('');
    console.log('='.repeat(60));
    console.log('Migration complete!');
    console.log('='.repeat(60));

    await migrationClient.end();
    process.exit(0);

  } catch (error) {
    console.error('');
    console.error('❌ Migration failed:', error);
    console.error('');
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    console.error('');
    console.error('Please check:');
    console.error('1. DATABASE_URL is correct');
    console.error('2. Database is accessible');
    console.error('3. Migration files exist in ./drizzle folder');
    console.error('');
    
    process.exit(1);
  }
}

// Run migrations
runMigrations();

