import { Router, Request, Response } from 'express';
import pkg from 'pg';
const { Pool } = pkg;

const router = Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://buergerapp_user:buergerapp_dev_2025@localhost:5432/buergerapp'
});

// GET /api/waste/areas?tenant=schieder
// Get all waste collection areas for a tenant
router.get('/areas', async (req: Request, res: Response) => {
  try {
    const { tenant } = req.query;
    
    if (!tenant) {
      return res.status(400).json({ error: 'Tenant parameter required' });
    }
    
    // Get tenant ID
    const tenantResult = await pool.query(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      [tenant]
    );
    
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    const tenantId = tenantResult.rows[0].id;
    
    // Get areas
    const areasResult = await pool.query(
      `SELECT id, name FROM waste_areas WHERE tenant_id = $1 ORDER BY name`,
      [tenantId]
    );
    
    res.json(areasResult.rows);
  } catch (error: any) {
    console.error('Error fetching waste areas:', error);
    res.status(500).json({ error: 'Failed to fetch waste areas' });
  }
});

// GET /api/waste/schedule?tenant=schieder&area=Lothe&startDate=2025-11-23&endDate=2025-12-07
// Get waste collection schedule for an area and date range
router.get('/schedule', async (req: Request, res: Response) => {
  try {
    const { tenant, area, startDate, endDate } = req.query;
    
    if (!tenant || !area) {
      return res.status(400).json({ error: 'Tenant and area parameters required' });
    }
    
    // Get tenant ID
    const tenantResult = await pool.query(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      [tenant]
    );
    
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    const tenantId = tenantResult.rows[0].id;
    
    // Get area ID
    const areaResult = await pool.query(
      `SELECT id FROM waste_areas WHERE tenant_id = $1 AND name = $2 LIMIT 1`,
      [tenantId, area]
    );
    
    if (areaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Area not found' });
    }
    
    const areaId = areaResult.rows[0].id;
    
    // Build query
    let query = `
      SELECT 
        wc.collection_date,
        wt.name as waste_type,
        wt.color,
        wt.icon,
        wt.description
      FROM waste_collections wc
      JOIN waste_types wt ON wc.waste_type_id = wt.id
      WHERE wc.tenant_id = $1 AND wc.area_id = $2
    `;
    
    const params: any[] = [tenantId, areaId];
    
    if (startDate) {
      params.push(startDate);
      query += ` AND wc.collection_date >= $${params.length}`;
    }
    
    if (endDate) {
      params.push(endDate);
      query += ` AND wc.collection_date <= $${params.length}`;
    }
    
    query += ` ORDER BY wc.collection_date, wt.name`;
    
    const scheduleResult = await pool.query(query, params);
    
    // Group by date
    const groupedByDate: Record<string, any[]> = {};
    
    for (const row of scheduleResult.rows) {
      const date = row.collection_date.toISOString().split('T')[0];
      
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      
      groupedByDate[date].push({
        wasteType: row.waste_type,
        color: row.color,
        icon: row.icon,
        description: row.description
      });
    }
    
    res.json(groupedByDate);
  } catch (error: any) {
    console.error('Error fetching waste schedule:', error);
    res.status(500).json({ error: 'Failed to fetch waste schedule' });
  }
});

// GET /api/waste/next?tenant=schieder&area=Lothe
// Get next collection dates (this week and next week)
router.get('/next', async (req: Request, res: Response) => {
  try {
    const { tenant, area } = req.query;
    
    if (!tenant || !area) {
      return res.status(400).json({ error: 'Tenant and area parameters required' });
    }
    
    // Get tenant ID
    const tenantResult = await pool.query(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      [tenant]
    );
    
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    const tenantId = tenantResult.rows[0].id;
    
    // Get area ID
    const areaResult = await pool.query(
      `SELECT id FROM waste_areas WHERE tenant_id = $1 AND name = $2 LIMIT 1`,
      [tenantId, area]
    );
    
    if (areaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Area not found' });
    }
    
    const areaId = areaResult.rows[0].id;
    
    // Calculate date ranges
    const today = new Date();
    const startOfThisWeek = new Date(today);
    startOfThisWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    startOfThisWeek.setHours(0, 0, 0, 0);
    
    const endOfThisWeek = new Date(startOfThisWeek);
    endOfThisWeek.setDate(startOfThisWeek.getDate() + 6); // Sunday
    endOfThisWeek.setHours(23, 59, 59, 999);
    
    const startOfNextWeek = new Date(endOfThisWeek);
    startOfNextWeek.setDate(endOfThisWeek.getDate() + 1); // Next Monday
    startOfNextWeek.setHours(0, 0, 0, 0);
    
    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6); // Next Sunday
    endOfNextWeek.setHours(23, 59, 59, 999);
    
    // Get collections for this week
    const thisWeekResult = await pool.query(
      `SELECT 
        wc.collection_date,
        wt.name as waste_type,
        wt.color,
        wt.icon,
        wt.description
      FROM waste_collections wc
      JOIN waste_types wt ON wc.waste_type_id = wt.id
      WHERE wc.tenant_id = $1 
        AND wc.area_id = $2
        AND wc.collection_date >= $3
        AND wc.collection_date <= $4
      ORDER BY wc.collection_date, wt.name`,
      [tenantId, areaId, startOfThisWeek.toISOString().split('T')[0], endOfThisWeek.toISOString().split('T')[0]]
    );
    
    // Get collections for next week
    const nextWeekResult = await pool.query(
      `SELECT 
        wc.collection_date,
        wt.name as waste_type,
        wt.color,
        wt.icon,
        wt.description
      FROM waste_collections wc
      JOIN waste_types wt ON wc.waste_type_id = wt.id
      WHERE wc.tenant_id = $1 
        AND wc.area_id = $2
        AND wc.collection_date >= $3
        AND wc.collection_date <= $4
      ORDER BY wc.collection_date, wt.name`,
      [tenantId, areaId, startOfNextWeek.toISOString().split('T')[0], endOfNextWeek.toISOString().split('T')[0]]
    );
    
    // Group by date
    const groupByDate = (rows: any[]) => {
      const grouped: Record<string, any[]> = {};
      
      for (const row of rows) {
        const date = row.collection_date.toISOString().split('T')[0];
        
        if (!grouped[date]) {
          grouped[date] = [];
        }
        
        grouped[date].push({
          wasteType: row.waste_type,
          color: row.color,
          icon: row.icon,
          description: row.description
        });
      }
      
      return grouped;
    };
    
    res.json({
      thisWeek: groupByDate(thisWeekResult.rows),
      nextWeek: groupByDate(nextWeekResult.rows)
    });
  } catch (error: any) {
    console.error('Error fetching next collections:', error);
    res.status(500).json({ error: 'Failed to fetch next collections' });
  }
});

// POST /api/waste/preferences
// Save user waste preferences (area and notification settings)
router.post('/preferences', async (req: Request, res: Response) => {
  try {
    const { tenant, userId, areaName, notificationEnabled, notificationTime } = req.body;
    
    if (!tenant || !userId || !areaName) {
      return res.status(400).json({ error: 'Tenant, userId, and areaName required' });
    }
    
    // Get tenant ID
    const tenantResult = await pool.query(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      [tenant]
    );
    
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    const tenantId = tenantResult.rows[0].id;
    
    // Get area ID
    const areaResult = await pool.query(
      `SELECT id FROM waste_areas WHERE tenant_id = $1 AND name = $2 LIMIT 1`,
      [tenantId, areaName]
    );
    
    if (areaResult.rows.length === 0) {
      return res.status(404).json({ error: 'Area not found' });
    }
    
    const areaId = areaResult.rows[0].id;
    
    // Save preferences
    const result = await pool.query(
      `INSERT INTO user_waste_preferences (tenant_id, user_id, area_id, notification_enabled, notification_time, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (tenant_id, user_id)
       DO UPDATE SET 
         area_id = EXCLUDED.area_id,
         notification_enabled = EXCLUDED.notification_enabled,
         notification_time = EXCLUDED.notification_time,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [tenantId, userId, areaId, notificationEnabled || false, notificationTime || '18:00:00']
    );
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error saving waste preferences:', error);
    res.status(500).json({ error: 'Failed to save preferences' });
  }
});

// GET /api/waste/preferences?tenant=schieder&userId=device123
// Get user waste preferences
router.get('/preferences', async (req: Request, res: Response) => {
  try {
    const { tenant, userId } = req.query;
    
    if (!tenant || !userId) {
      return res.status(400).json({ error: 'Tenant and userId parameters required' });
    }
    
    // Get tenant ID
    const tenantResult = await pool.query(
      `SELECT id FROM tenants WHERE slug = $1 LIMIT 1`,
      [tenant]
    );
    
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    const tenantId = tenantResult.rows[0].id;
    
    // Get preferences
    const result = await pool.query(
      `SELECT 
        uwp.*,
        wa.name as area_name
      FROM user_waste_preferences uwp
      JOIN waste_areas wa ON uwp.area_id = wa.id
      WHERE uwp.tenant_id = $1 AND uwp.user_id = $2
      LIMIT 1`,
      [tenantId, userId]
    );
    
    if (result.rows.length === 0) {
      return res.json(null);
    }
    
    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching waste preferences:', error);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

export default router;
