import { Router } from 'express';
import { Pool } from 'pg';

const router = Router();

// Use the same database as Directus
const pool = new Pool({
  host: process.env.DIRECTUS_DB_HOST || 'localhost',
  port: parseInt(process.env.DIRECTUS_DB_PORT || '5432'),
  database: process.env.DIRECTUS_DB_NAME || 'buergerapp',
  user: process.env.DIRECTUS_DB_USER || 'buergerapp_user',
  password: process.env.DIRECTUS_DB_PASSWORD || 'buergerapp_dev_2025',
});

/**
 * GET /api/attractions?tenant=hornbadmeinberg
 * Get attractions for a specific tenant, grouped by main_category
 */
router.get('/', async (req, res) => {
  try {
    const tenantSlug = req.query.tenant as string;
    
    if (!tenantSlug) {
      return res.status(400).json({ error: 'Tenant parameter is required' });
    }
    
    // Get tenant ID from slug
    const tenantResult = await pool.query(
      'SELECT id FROM tenants WHERE slug = $1 LIMIT 1',
      [tenantSlug]
    );
    
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    const tenantId = tenantResult.rows[0].id;
    
    // Get all attractions for this tenant
    const attractionsResult = await pool.query(
      `SELECT id, name, description, category, main_category, image_url, address, more_info_url, display_order
       FROM attractions
       WHERE tenant_id = $1
       ORDER BY main_category ASC, display_order ASC, name ASC`,
      [tenantId]
    );
    
    // Group attractions by main_category
    const attractionsByMainCategory: Record<string, any[]> = {};
    
    attractionsResult.rows.forEach(attraction => {
      const mainCategory = attraction.main_category || 'Sonstiges';
      if (!attractionsByMainCategory[mainCategory]) {
        attractionsByMainCategory[mainCategory] = [];
      }
      attractionsByMainCategory[mainCategory].push(attraction);
    });
    
    res.json({
      attractions: attractionsResult.rows,
      attractionsByMainCategory,
      totalCount: attractionsResult.rows.length
    });
    
  } catch (error) {
    console.error('Error fetching attractions:', error);
    res.status(500).json({ error: 'Failed to fetch attractions' });
  }
});

export default router;
