import { Router } from 'express';
import { nanoid } from 'nanoid';
import postgres from 'postgres';

const router = Router();

// Get postgres connection
function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
  return postgres(process.env.DATABASE_URL);
}

// Create help request
router.post('/requests', async (req, res) => {
  try {
    const sql = getSql();
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(400).json({ error: 'Tenant not found' });
    }

    const {
      category,
      description,
      district,
      meetingPoint,
      timeframe,
      urgency = 'medium',
      contactMethod,
      phoneNumber,
      userId,
      userName
    } = req.body;

    const id = nanoid();
    const now = new Date().toISOString();

    await sql`
      INSERT INTO help_requests (
        id, tenant_id, created_by, created_by_name, category, description,
        district, meeting_point, timeframe, urgency, contact_method, phone_number,
        status, created_at, updated_at
      ) VALUES (
        ${id}, ${tenant.id}, ${userId}, ${userName}, ${category}, ${description},
        ${district}, ${meetingPoint || null}, ${timeframe || null}, ${urgency},
        ${contactMethod}, ${phoneNumber || null}, 'open', ${now}, ${now}
      )
    `;

    await sql.end();
    res.json({ id, success: true });
  } catch (error) {
    console.error('Error creating help request:', error);
    res.status(500).json({ error: 'Failed to create help request' });
  }
});

// Get help requests
router.get('/requests', async (req, res) => {
  try {
    const sql = getSql();
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(400).json({ error: 'Tenant not found' });
    }

    const { category, district, urgency } = req.query;

    let result;
    if (category && category !== 'all') {
      if (district) {
        result = await sql`
          SELECT * FROM help_requests
          WHERE tenant_id = ${tenant.id} AND status = 'open'
            AND category = ${category} AND district = ${district}
          ORDER BY created_at DESC
        `;
      } else {
        result = await sql`
          SELECT * FROM help_requests
          WHERE tenant_id = ${tenant.id} AND status = 'open'
            AND category = ${category}
          ORDER BY created_at DESC
        `;
      }
    } else if (district) {
      result = await sql`
        SELECT * FROM help_requests
        WHERE tenant_id = ${tenant.id} AND status = 'open'
          AND district = ${district}
        ORDER BY created_at DESC
      `;
    } else {
      result = await sql`
        SELECT * FROM help_requests
        WHERE tenant_id = ${tenant.id} AND status = 'open'
        ORDER BY created_at DESC
      `;
    }

    if (urgency === 'high') {
      result = result.filter((r: any) => r.urgency === 'high');
    }

    await sql.end();
    res.json(result);
  } catch (error) {
    console.error('Error fetching help requests:', error);
    res.status(500).json({ error: 'Failed to fetch help requests' });
  }
});

// Create help offer
router.post('/offers', async (req, res) => {
  try {
    const sql = getSql();
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(400).json({ error: 'Tenant not found' });
    }

    const {
      categories,
      description,
      district,
      radius = 5,
      availability,
      contactMethod,
      phoneNumber,
      userId,
      userName
    } = req.body;

    const id = nanoid();
    const now = new Date().toISOString();

    await sql`
      INSERT INTO help_offers (
        id, tenant_id, created_by, created_by_name, categories, description,
        district, radius, availability, contact_method, phone_number,
        status, created_at, updated_at
      ) VALUES (
        ${id}, ${tenant.id}, ${userId}, ${userName}, ${categories}, ${description},
        ${district}, ${radius}, ${availability || null}, ${contactMethod},
        ${phoneNumber || null}, 'open', ${now}, ${now}
      )
    `;

    await sql.end();
    res.json({ id, success: true });
  } catch (error) {
    console.error('Error creating help offer:', error);
    res.status(500).json({ error: 'Failed to create help offer' });
  }
});

// Get help offers
router.get('/offers', async (req, res) => {
  try {
    const sql = getSql();
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(400).json({ error: 'Tenant not found' });
    }

    const { category, district } = req.query;

    let result;
    if (district) {
      result = await sql`
        SELECT * FROM help_offers
        WHERE tenant_id = ${tenant.id} AND status = 'open'
          AND district = ${district}
        ORDER BY created_at DESC
      `;
    } else {
      result = await sql`
        SELECT * FROM help_offers
        WHERE tenant_id = ${tenant.id} AND status = 'open'
        ORDER BY created_at DESC
      `;
    }

    if (category && category !== 'all') {
      result = result.filter((r: any) => r.categories && r.categories.includes(category));
    }

    await sql.end();
    res.json(result);
  } catch (error) {
    console.error('Error fetching help offers:', error);
    res.status(500).json({ error: 'Failed to fetch help offers' });
  }
});

// Get all (requests + offers)
router.get('/all', async (req, res) => {
  try {
    const sql = getSql();
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(400).json({ error: 'Tenant not found' });
    }

    const requests = await sql`
      SELECT *, 'request' as type FROM help_requests
      WHERE tenant_id = ${tenant.id} AND status = 'open'
      ORDER BY created_at DESC
    `;

    const offers = await sql`
      SELECT *, 'offer' as type FROM help_offers
      WHERE tenant_id = ${tenant.id} AND status = 'open'
      ORDER BY created_at DESC
    `;

    const all = [...requests, ...offers].sort((a: any, b: any) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    await sql.end();
    res.json(all);
  } catch (error) {
    console.error('Error fetching all items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

export default router;
