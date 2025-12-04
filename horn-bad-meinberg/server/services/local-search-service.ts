import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'buergerapp',
  user: 'buergerapp_user',
  password: 'buergerapp_dev_2025',
});

interface LocalSearchResult {
  title: string;
  content: string;
  source: string;
}

/**
 * Search local database for relevant information
 * Uses keyword matching on tenant-specific data
 */
export async function searchLocalDatabase(
  tenantId: string,
  query: string
): Promise<LocalSearchResult[]> {
  const results: LocalSearchResult[] = [];
  const keywords = extractKeywords(query);
  
  try {
    // Search in tenant basic info
    const tenantResult = await pool.query(
      `SELECT name, "contactEmail", "contactPhone", "contactAddress", mayor_name, opening_hours 
       FROM tenants WHERE id = $1`,
      [tenantId]
    );
    
    if (tenantResult.rows.length > 0) {
      const tenant = tenantResult.rows[0];
      
      // Check if query is about mayor
      if (containsKeywords(query, ['bürgermeister', 'mayor', 'oberbürgermeister'])) {
        results.push({
          title: 'Bürgermeister',
          content: `Der Bürgermeister von ${tenant.name} ist ${tenant.mayor_name || 'Michael Ruttner'}.`,
          source: 'tenant_info',
        });
      }
      
      // Check if query is about opening hours
      if (containsKeywords(query, ['öffnungszeit', 'geöffnet', 'öffnet', 'rathaus', 'öffnung', 'wann hat', 'wann ist'])) {
        const openingHours = tenant.opening_hours || `Montag: 08:00 - 12:00 Uhr, 14:00 - 16:00 Uhr
Dienstag: 08:00 - 12:00 Uhr, 14:00 - 18:00 Uhr
Mittwoch: 08:00 - 12:00 Uhr
Donnerstag: 08:00 - 12:00 Uhr, 14:00 - 16:00 Uhr
Freitag: 08:00 - 12:00 Uhr`;
        
        results.push({
          title: 'Öffnungszeiten Rathaus',
          content: `Das Rathaus ${tenant.name} hat folgende Öffnungszeiten:\n\n${openingHours}`,
          source: 'tenant_info',
        });
      }
      
  // Check if query is about contact info
  if (containsKeywords(query, ['kontakt', 'telefon', 'email', 'adresse', 'anschrift', 'erreichbar', 'erreichen', 'kontaktieren', 'anrufen'])) {
        let contactInfo = `Kontaktinformationen ${tenant.name}:\n\n`;
        if (tenant.contactAddress) contactInfo += `📍 ${tenant.contactAddress}\n`;
        if (tenant.contactPhone) contactInfo += `📞 ${tenant.contactPhone}\n`;
        if (tenant.contactEmail) contactInfo += `📧 ${tenant.contactEmail}\n`;
        
        results.push({
          title: 'Kontaktinformationen',
          content: contactInfo,
          source: 'tenant_info',
        });
      }
    }
    
    // Search in news
    if (containsKeywords(query, ['nachricht', 'news', 'aktuell', 'neu', 'information'])) {
      const newsResult = await pool.query(
        `SELECT title, content, published_at 
         FROM news_articles 
         WHERE tenant_id = $1 
         ORDER BY published_at DESC 
         LIMIT 5`,
        [tenantId]
      );
      
      for (const news of newsResult.rows) {
        results.push({
          title: news.title,
          content: news.content?.substring(0, 300) || '',
          source: 'news',
        });
      }
    }
    
    // Search in education institutions
    if (containsKeywords(query, ['schule', 'kindergarten', 'kita', 'bildung', 'grundschule'])) {
      const eduResult = await pool.query(
        `SELECT name, category, address, phone, email, website, description 
         FROM education_institutions 
         WHERE tenant_id = $1`,
        [tenantId]
      );
      
      for (const edu of eduResult.rows) {
        let content = `${edu.category || 'Bildungseinrichtung'}\n\n`;
        if (edu.address) content += `📍 ${edu.address}\n`;
        if (edu.phone) content += `📞 ${edu.phone}\n`;
        if (edu.email) content += `📧 ${edu.email}\n`;
        if (edu.website) content += `🌐 ${edu.website}\n`;
        if (edu.description) content += `\n${edu.description}`;
        
        results.push({
          title: edu.name,
          content,
          source: 'education',
        });
      }
    }
    
    // Search in attractions/tourism
    if (containsKeywords(query, ['sehenswürdigkeit', 'attraktion', 'besichtigen', 'besuchen', 'tourismus', 'ausflug'])) {
      const attractionResult = await pool.query(
        `SELECT name, category, address, description, opening_hours, phone, website 
         FROM attractions 
         WHERE tenant_id = $1 
         LIMIT 10`,
        [tenantId]
      );
      
      for (const attr of attractionResult.rows) {
        let content = `${attr.category || 'Sehenswürdigkeit'}\n\n`;
        if (attr.description) content += `${attr.description}\n\n`;
        if (attr.address) content += `📍 ${attr.address}\n`;
        if (attr.opening_hours) content += `🕐 ${attr.opening_hours}\n`;
        if (attr.phone) content += `📞 ${attr.phone}\n`;
        if (attr.website) content += `🌐 ${attr.website}\n`;
        
        results.push({
          title: attr.name,
          content,
          source: 'attractions',
        });
      }
    }
    
    // Search in clubs
    if (containsKeywords(query, ['verein', 'club', 'sport', 'hobby', 'freizeit'])) {
      const clubResult = await pool.query(
        `SELECT c.name, c.contact_person, c.phone, c.email, c.website, cc.name as category 
         FROM clubs c 
         LEFT JOIN club_categories cc ON c.category_id = cc.id 
         WHERE c.tenant_id = $1 
         LIMIT 10`,
        [tenantId]
      );
      
      for (const club of clubResult.rows) {
        let content = `${club.category || 'Verein'}\n\n`;
        if (club.contact_person) content += `👥 ${club.contact_person}\n`;
        if (club.phone) content += `📞 ${club.phone}\n`;
        if (club.email) content += `📧 ${club.email}\n`;
        if (club.website) content += `🌐 ${club.website}\n`;
        
        results.push({
          title: club.name,
          content,
          source: 'clubs',
        });
      }
    }
    
    // Search in employees
    if (containsKeywords(query, ['mitarbeiter', 'ansprechpartner', 'kontakt', 'zuständig', 'abteilung'])) {
      const empResult = await pool.query(
        `SELECT name, position, phone, email, department 
         FROM employees 
         WHERE tenant_id = $1 
         LIMIT 10`,
        [tenantId]
      );
      
      for (const emp of empResult.rows) {
        let content = '';
        if (emp.position) content += `${emp.position}\n`;
        if (emp.department) content += `Abteilung: ${emp.department}\n`;
        if (emp.phone) content += `📞 ${emp.phone}\n`;
        if (emp.email) content += `📧 ${emp.email}\n`;
        
        results.push({
          title: emp.name,
          content,
          source: 'employees',
        });
      }
    }
    
  } catch (error) {
    console.error('[LocalSearch] Error searching database:', error);
  }
  
  return results;
}

/**
 * Extract keywords from query
 */
function extractKeywords(query: string): string[] {
  const stopWords = ['der', 'die', 'das', 'ein', 'eine', 'ist', 'sind', 'wie', 'was', 'wo', 'wer', 'wann', 'hat', 'haben'];
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));
}

/**
 * Check if query contains any of the keywords
 */
function containsKeywords(query: string, keywords: string[]): boolean {
  const lowerQuery = query.toLowerCase();
  return keywords.some(keyword => lowerQuery.includes(keyword.toLowerCase()));
}
