#!/usr/bin/env tsx

/**
 * Script zum Crawlen der gesamten Website und Befüllen der Datenbank
 * 
 * Usage:
 *   tsx server/scripts/crawl-and-populate.ts
 */

import { databasePopulator } from '../services/databasePopulator';
import { fullWebsiteCrawler } from '../services/fullWebsiteCrawler';

async function main() {
  console.log('='.repeat(60));
  console.log('Schieder-Schwalenberg Website Crawler & Database Populator');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Step 1: Crawl the website
    console.log('Step 1: Crawling website...');
    const crawlResult = await fullWebsiteCrawler.crawlWebsite();
    
    console.log('');
    console.log('Crawl Results:');
    console.log(`  Total pages crawled: ${crawlResult.totalPages}`);
    console.log('  Pages by category:');
    crawlResult.categories.forEach((count, category) => {
      console.log(`    - ${category}: ${count} pages`);
    });
    console.log('');

    // Step 2: Populate database
    console.log('Step 2: Populating database...');
    const populateResult = await databasePopulator.populateDatabase();
    
    console.log('');
    console.log('Population Results:');
    console.log(`  Success: ${populateResult.success}`);
    console.log(`  News added: ${populateResult.newsAdded}`);
    console.log(`  Events added: ${populateResult.eventsAdded}`);
    console.log(`  Departments added: ${populateResult.departmentsAdded}`);
    console.log(`  POIs added: ${populateResult.poisAdded}`);
    console.log(`  Institutions added: ${populateResult.institutionsAdded}`);
    
    if (populateResult.errors.length > 0) {
      console.log('');
      console.log('Errors encountered:');
      populateResult.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('Process complete!');
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

