import { Router } from 'express';
import pg from 'pg';
import { sendContactRequestEmail } from '../services/contact-request-email.js';

const { Pool } = pg;
const router = Router();

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  database: 'buergerapp',
  user: 'buergerapp_user',
  password: 'buergerapp_dev_2025',
});

// POST /api/contact-request - Submit contact request
router.post('/', async (req, res) => {
  const { tenant } = req.query;
  
  if (!tenant) {
    return res.status(400).json({ error: 'Tenant parameter is required' });
  }
  
  const {
    firstName,
    lastName,
    email,
    phone,
    subject,
    message,
    category
  } = req.body;
  
  // Validation
  if (!firstName || !lastName || !email || !subject || !message) {
    return res.status(400).json({ 
      error: 'Bitte füllen Sie alle Pflichtfelder aus' 
    });
  }
  
  try {
    // Get tenant_id
    const tenantResult = await pool.query(
      'SELECT id, name FROM tenants WHERE slug = $1',
      [tenant]
    );
    
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    const tenantId = tenantResult.rows[0].id;
    const tenantName = tenantResult.rows[0].name;
    
    // Insert contact request
    const result = await pool.query(
      `INSERT INTO contact_requests (
        tenant_id, first_name, last_name, email, phone,
        subject, message, category, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', NOW(), NOW())
      RETURNING id`,
      [tenantId, firstName, lastName, email, phone, subject, message, category]
    );
    
    const requestId = result.rows[0].id;
    
    // Send email to town hall (but don't fail if email fails)
    try {
      await sendContactRequestEmail({
        requestId,
        tenantName,
        firstName,
        lastName,
        email,
        phone,
        subject,
        message,
        category
      });
    } catch (emailError) {
      console.error('Failed to send contact request email:', emailError);
      // Continue anyway - the request is saved in database
    }
    
    res.json({ 
      success: true,
      requestId,
      message: 'Ihre Anfrage wurde erfolgreich übermittelt'
    });
    
  } catch (err) {
    console.error('Error submitting contact request:', err);
    res.status(500).json({ error: 'Fehler beim Übermitteln der Anfrage' });
  }
});

// GET /api/contact-requests - Get all contact requests (for admin dashboard)
router.get('/', async (req, res) => {
  const { tenant } = req.query;
  
  if (!tenant) {
    return res.status(400).json({ error: 'Tenant parameter is required' });
  }
  
  try {
    const tenantResult = await pool.query(
      'SELECT id FROM tenants WHERE slug = $1',
      [tenant]
    );
    
    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    const tenantId = tenantResult.rows[0].id;
    
    const result = await pool.query(
      `SELECT 
        id, first_name, last_name, email, phone,
        subject, message, category, status,
        created_at, updated_at
      FROM contact_requests
      WHERE tenant_id = $1
      ORDER BY created_at DESC`,
      [tenantId]
    );
    
    res.json(result.rows);
    
  } catch (err) {
    console.error('Error fetching contact requests:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
