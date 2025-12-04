import { Router, Request, Response } from 'express';
import pg from 'pg';

const { Pool } = pg;
const router = Router();

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'buergerapp',
  user: 'buergerapp_user',
  password: 'buergerapp_dev_2025',
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { tenant } = req.query;

    if (!tenant) {
      return res.status(400).json({ error: 'Tenant parameter is required' });
    }

    // Get tenant_id
    const tenantResult = await pool.query(
      'SELECT id FROM tenants WHERE slug = $1',
      [tenant]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    const tenantId = tenantResult.rows[0].id;

    // Get all education institutions
    const result = await pool.query(
      `SELECT * FROM education_institutions 
       WHERE tenant_id = $1 
       ORDER BY display_order, name`,
      [tenantId]
    );

    // Group by category
    const institutionsByCategory: Record<string, any[]> = {};

    result.rows.forEach(institution => {
      if (!institutionsByCategory[institution.category]) {
        institutionsByCategory[institution.category] = [];
      }
      institutionsByCategory[institution.category].push(institution);
    });

    res.json({
      institutions: result.rows,
      institutionsByCategory,
      totalCount: result.rows.length
    });

  } catch (error) {
    console.error('Error fetching education institutions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
