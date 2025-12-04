#!/usr/bin/env tsx

/**
 * Script zum Exportieren der gecrawlten Daten als JSON
 * 
 * Usage:
 *   tsx server/scripts/export-data.ts
 */

import { dataExporter } from '../services/dataExporter';

async function main() {
  console.log('='.repeat(60));
  console.log('Schieder-Schwalenberg Data Exporter');
  console.log('='.repeat(60));
  console.log('');

  try {
    const result = await dataExporter.exportToJSON();
    
    console.log('');
    console.log('Export Results:');
    console.log(`  Success: ${result.success}`);
    console.log(`  News exported: ${result.newsExported}`);
    console.log(`  Events exported: ${result.eventsExported}`);
    console.log(`  Departments exported: ${result.departmentsExported}`);
    console.log(`  POIs exported: ${result.poisExported}`);
    console.log(`  Institutions exported: ${result.institutionsExported}`);
    console.log(`  Export path: ${result.exportPath}`);
    console.log('');
    console.log('='.repeat(60));
    console.log('Export complete!');
    console.log('='.repeat(60));

    process.exit(0);

  } catch (error) {
    console.error('');
    console.error('Fatal error:', error);
    console.error('');
    process.exit(1);
  }
}

// Run the script
main();

