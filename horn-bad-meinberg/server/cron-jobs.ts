import cron from 'node-cron';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Run all scraping scripts every 2 days at 1:00 AM
// Cron format: minute hour day-of-month month day-of-week
// 0 1 */2 * * = At 1:00 AM every 2 days

export function setupCronJobs() {
  console.log('[Cron] Setting up scheduled scraping jobs...');
  
  // News scraping - every 2 days at 1:00 AM
  cron.schedule('0 1 */2 * *', async () => {
    console.log('[Cron] Running news scraping...');
    try {
      const { stdout, stderr } = await execAsync('npx tsx scripts/scrape-schieder-news.ts');
      console.log('[Cron] News scraping completed:', stdout);
      if (stderr) console.error('[Cron] News scraping errors:', stderr);
    } catch (error) {
      console.error('[Cron] News scraping failed:', error);
    }
  });
  
  // Events scraping - every 2 days at 1:10 AM
  cron.schedule('10 1 */2 * *', async () => {
    console.log('[Cron] Running events scraping...');
    try {
      const { stdout, stderr } = await execAsync('npx tsx scripts/scrape-schieder-events.ts');
      console.log('[Cron] Events scraping completed:', stdout);
      if (stderr) console.error('[Cron] Events scraping errors:', stderr);
    } catch (error) {
      console.error('[Cron] Events scraping failed:', error);
    }
  });
  
  // Employees scraping - every 2 days at 1:20 AM
  cron.schedule('20 1 */2 * *', async () => {
    console.log('[Cron] Running employees scraping...');
    try {
      const { stdout, stderr } = await execAsync('npx tsx scripts/scrape-schieder-employees.ts');
      console.log('[Cron] Employees scraping completed:', stdout);
      if (stderr) console.error('[Cron] Employees scraping errors:', stderr);
    } catch (error) {
      console.error('[Cron] Employees scraping failed:', error);
    }
  });
  
  // Clubs scraping - every Sunday at 1:00 AM
  cron.schedule('0 1 * * 0', async () => {
    console.log('[Cron] Running clubs scraping...');
    try {
      const { stdout, stderr } = await execAsync('npx tsx server/scrapers/clubs-scraper.ts');
      console.log('[Cron] Clubs scraping completed:', stdout);
      if (stderr) console.error('[Cron] Clubs scraping errors:', stderr);
    } catch (error) {
      console.error('[Cron] Clubs scraping failed:', error);
    }
  });
  
  console.log('[Cron] ✓ News scraping scheduled: Every 2 days at 1:00 AM');
  console.log('[Cron] ✓ Events scraping scheduled: Every 2 days at 1:10 AM');
  console.log('[Cron] ✓ Employees scraping scheduled: Every 2 days at 1:20 AM');
  console.log('[Cron] ✓ Clubs scraping scheduled: Every Sunday at 1:00 AM');
}
