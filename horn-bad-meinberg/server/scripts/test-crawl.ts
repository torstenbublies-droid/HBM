#!/usr/bin/env tsx

/**
 * Test-Script zum Crawlen von nur 20 Seiten
 * 
 * Usage:
 *   tsx server/scripts/test-crawl.ts
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { URL } from 'url';

interface CrawledPage {
  url: string;
  title: string;
  contentLength: number;
  category: string;
  linksFound: number;
}

const baseUrl = 'https://www.schieder-schwalenberg.de';
const visitedUrls = new Set<string>();
const crawledPages: CrawledPage[] = [];
const maxPages = 20; // Test limit

function categorizeUrl(url: string): string {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('tourismus')) return 'Tourismus';
  if (urlLower.includes('rathaus') || urlLower.includes('verwaltung')) return 'Rathaus';
  if (urlLower.includes('familie') || urlLower.includes('soziales')) return 'Familie & Soziales';
  if (urlLower.includes('bauen') || urlLower.includes('wirtschaft')) return 'Bauen & Wirtschaft';
  if (urlLower.includes('veranstaltung')) return 'Veranstaltungen';
  if (urlLower.includes('bekanntmachung') || urlLower.includes('mitteilung')) return 'Bekanntmachungen';
  if (urlLower.includes('bildung') || urlLower.includes('schule') || urlLower.includes('kindergarten')) return 'Bildung';
  if (urlLower.includes('sport') || urlLower.includes('freizeit')) return 'Sport & Freizeit';
  if (urlLower.includes('verein')) return 'Vereine';
  if (urlLower.includes('buergermeister')) return 'Bürgermeister';

  return 'Allgemein';
}

function extractContent($: cheerio.CheerioAPI): string {
  $('script, style, nav, header, footer, .navigation, .menu').remove();

  let content = '';
  
  const contentSelectors = [
    'main',
    '.content',
    '.main-content',
    '#content',
    '#main',
    'article',
    '.article',
    '.page-content',
  ];

  for (const selector of contentSelectors) {
    const element = $(selector);
    if (element.length > 0) {
      content = element.text();
      break;
    }
  }

  if (!content) {
    content = $('body').text();
  }

  content = content
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();

  return content;
}

function extractInternalLinks($: cheerio.CheerioAPI, currentUrl: string): string[] {
  const links: string[] = [];
  const baseUrlObj = new URL(baseUrl);

  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) return;

    try {
      const absoluteUrl = new URL(href, currentUrl).toString();
      const urlObj = new URL(absoluteUrl);

      if (urlObj.hostname === baseUrlObj.hostname) {
        if (!absoluteUrl.match(/\.(pdf|jpg|jpeg|png|gif|zip|doc|docx|xls|xlsx)$/i) &&
            !absoluteUrl.includes('#')) {
          links.push(absoluteUrl);
        }
      }
    } catch (error) {
      // Invalid URL, skip
    }
  });

  return Array.from(new Set(links));
}

async function crawlPage(url: string, depth = 0): Promise<void> {
  if (depth > 2 || visitedUrls.has(url) || crawledPages.length >= maxPages) {
    return;
  }

  visitedUrls.add(url);

  try {
    console.log(`[${crawledPages.length + 1}/${maxPages}] Crawling: ${url}`);
    
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'BuergerApp-Schieder-Test-Crawler/1.0',
      },
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('title').text() || $('h1').first().text() || 'Untitled';
    const content = extractContent($);
    const links = extractInternalLinks($, url);

    const crawledPage: CrawledPage = {
      url,
      title: title.trim(),
      contentLength: content.length,
      category: categorizeUrl(url),
      linksFound: links.length,
    };

    crawledPages.push(crawledPage);

    // Wait 500ms between requests
    await new Promise(resolve => setTimeout(resolve, 500));

    // Crawl first 3 links from this page
    if (depth < 2) {
      for (const link of links.slice(0, 3)) {
        if (crawledPages.length >= maxPages) break;
        await crawlPage(link, depth + 1);
      }
    }

  } catch (error) {
    console.error(`Error crawling ${url}:`, error.message);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Test Crawl - Schieder-Schwalenberg Website');
  console.log(`Limit: ${maxPages} pages`);
  console.log('='.repeat(60));
  console.log('');

  try {
    await crawlPage(baseUrl);

    console.log('');
    console.log('='.repeat(60));
    console.log('Crawl Results:');
    console.log('='.repeat(60));
    console.log(`Total pages crawled: ${crawledPages.length}`);
    console.log('');

    // Group by category
    const categories = new Map<string, number>();
    crawledPages.forEach(page => {
      const count = categories.get(page.category) || 0;
      categories.set(page.category, count + 1);
    });

    console.log('Pages by category:');
    categories.forEach((count, category) => {
      console.log(`  ${category}: ${count} pages`);
    });

    console.log('');
    console.log('Sample pages:');
    crawledPages.slice(0, 10).forEach((page, i) => {
      console.log(`  ${i + 1}. [${page.category}] ${page.title}`);
      console.log(`     URL: ${page.url}`);
      console.log(`     Content: ${page.contentLength} chars, ${page.linksFound} links`);
    });

    console.log('');
    console.log('='.repeat(60));
    console.log('Test complete!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();

