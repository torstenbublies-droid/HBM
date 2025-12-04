import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

export async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('[Migrations] FEHLER: DATABASE_URL ist nicht gesetzt. Migration wird übersprungen.');
    throw new Error("DATABASE_URL ist nicht definiert.");
  }

  try {
    const migrationClient = postgres(connectionString, { max: 1 });
    const db = drizzle(migrationClient);

    console.log('[Migrations] Starte Migrationen aus dem ./drizzle Ordner...');
    
    // WICHTIG: Relativer Pfad zum Migrations-Ordner
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log('[Migrations] Migrationen erfolgreich abgeschlossen.');

    await migrationClient.end();
  } catch (error) {
    console.error('[Migrations] FEHLER bei der Ausführung der Migrationen:', error);
    throw error; // Wirft den Fehler, damit der Deployment-Prozess bei einem Fehler abbricht.
  }
}

// Auto-run is handled by index.ts startup sequence
