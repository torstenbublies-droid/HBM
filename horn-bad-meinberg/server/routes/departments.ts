import { Router } from 'express';
import { getDb } from '../db';
import { sql } from 'drizzle-orm';

const router = Router();

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
    
    const result = await db.execute(sql`
      SELECT id, name, description, phone, email, "openingHours" as opening_hours
      FROM departments
      WHERE "tenantId" = ${tenantSlug}
      ORDER BY name ASC
    `);
    
    res.json({ departments: result.rows });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

export default router;
