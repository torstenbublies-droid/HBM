import { Router } from 'express';
import { getDb } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

/**
 * GET /api/events?tenant=hornbadmeinberg
 * Get events for a specific tenant
 */
router.get('/', async (req, res) => {
  try {
    const tenantSlug = req.query.tenant as string;
    
    if (!tenantSlug) {
      return res.status(400).json({ error: 'Tenant parameter is required' });
    }
    
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }
    
    // Get events for this tenant using raw SQL
    const result = await db.execute(sql`
      SELECT id, title, description, "startDate" as start_date, "endDate" as end_date, 
             location, "imageUrl" as image_url, "ticketLink" as ticket_link, category, "createdAt" as scraped_at
      FROM events
      WHERE "tenantId" = ${tenantSlug}
      ORDER BY "startDate" ASC
      LIMIT 50
    `);
    
    res.json({
      events: result.rows
    });
    
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

export default router;
