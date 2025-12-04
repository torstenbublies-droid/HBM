#!/usr/bin/env tsx

/**
 * Cron Job: Update Bekanntmachungen
 * 
 * This script runs every 3 days to fetch the latest announcements
 * from the Stadt Schieder-Schwalenberg website.
 * 
 * Schedule: Every 3 days at 6:00 AM
 * Cron: 0 6 star-slash-3 star star
 */

import { scrapeBekanntmachungen } from '../scrapers/bekanntmachungen';

async function main() {
  console.log('🕐 Cron Job: Update Bekanntmachungen');
  console.log(`📅 Started at: ${new Date().toISOString()}`);
  
  try {
    await scrapeBekanntmachungen();
    console.log('✅ Cron Job completed successfully');
  } catch (error) {
    console.error('❌ Cron Job failed:', error);
    process.exit(1);
  }
}

main();

