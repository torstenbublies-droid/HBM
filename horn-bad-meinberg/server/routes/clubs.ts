import { Router } from 'express';
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

// GET /api/clubs - Get all clubs grouped by category
router.get('/', async (req, res) => {
  const { tenant } = req.query;
  
  if (!tenant) {
    return res.status(400).json({ error: 'Tenant parameter is required' });
  }
  
  try {
    // Get tenant_id
    const tenantResult = await pool.query(
      'SELECT id FROM tenants WHERE slug = $1',
      [tenant]
    );
    
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    const tenantId = tenantResult.rows[0].id;
    
    // Get categories with clubs
    const result = await pool.query(
      `SELECT 
        cc.id as category_id,
        cc.name as category_name,
        cc.icon as category_icon,
        cc.color as category_color,
        cc.display_order,
        json_agg(
          json_build_object(
            'id', c.id,
            'name', c.name,
            'contactPerson', c.contact_person,
            'address', c.address,
            'phone', c.phone,
            'fax', c.fax,
            'email', c.email,
            'website', c.website
          ) ORDER BY c.name
        ) FILTER (WHERE c.id IS NOT NULL) as clubs
      FROM club_categories cc
      LEFT JOIN clubs c ON c.category_id = cc.id AND c.tenant_id = $1
      WHERE cc.tenant_id = $1
      GROUP BY cc.id, cc.name, cc.icon, cc.color, cc.display_order
      ORDER BY cc.display_order, cc.name`,
      [tenantId]
    );
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching clubs:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
