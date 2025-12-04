import { Router } from 'express';
import { Pool } from 'pg';
import { sendEmailToTownHall, sendConfirmationEmailToCitizen } from '../services/dog-registration-email.js';

const router = Router();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://buergerapp_user:buergerapp_dev_2025@localhost:5432/buergerapp'
});

// POST /api/dog-registration - Hundeanmeldung absenden
router.post('/', async (req, res) => {
  try {
    const {
      tenant,
      ownerFirstName,
      ownerLastName,
      ownerStreet,
      ownerHouseNumber,
      ownerZip,
      ownerCity,
      ownerEmail,
      ownerPhone,
      dogName,
      dogBreed,
      dogGender,
      dogBirthDate,
      dogChipNumber,
      dogHoldingStartDate,
      dogFromOtherMunicipality,
      sepaIban,
      sepaAccountHolder,
      privacyAccepted,
      registrationType
    } = req.body;

    // Validierung
    if (!tenant || !ownerFirstName || !ownerLastName || !ownerStreet || !ownerHouseNumber || 
        !ownerZip || !ownerCity || !ownerEmail || !dogName || !dogBreed || !dogGender || 
        !dogBirthDate || !dogHoldingStartDate || !sepaIban || !sepaAccountHolder || !privacyAccepted) {
      return res.status(400).json({ error: 'Pflichtfelder fehlen' });
    }

    // Tenant ID ermitteln
    const tenantResult = await pool.query(
      'SELECT id FROM tenants WHERE slug = $1 LIMIT 1',
      [tenant]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant nicht gefunden' });
    }

    const tenantId = tenantResult.rows[0].id;

    // Hundeanmeldung in Datenbank speichern
    const result = await pool.query(
      `INSERT INTO dog_registrations (
        tenant_id, owner_first_name, owner_last_name, owner_street, owner_house_number,
        owner_zip, owner_city, owner_email, owner_phone,
        dog_name, dog_breed, dog_gender, dog_birth_date, dog_chip_number, 
        dog_holding_start_date, dog_from_other_municipality,
        sepa_iban, sepa_account_holder, privacy_accepted, registration_type, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING id`,
      [
        tenantId, ownerFirstName, ownerLastName, ownerStreet, ownerHouseNumber,
        ownerZip, ownerCity, ownerEmail, ownerPhone,
        dogName, dogBreed, dogGender, dogBirthDate, dogChipNumber,
        dogHoldingStartDate, dogFromOtherMunicipality || false,
        sepaIban, sepaAccountHolder, privacyAccepted, registrationType || 'anmelden', 'pending'
      ]
    );

    const registrationId = result.rows[0].id;

    console.log(`✅ Dog registration created: ID ${registrationId} for tenant ${tenant}`);

    // E-Mail versenden
    try {
      await sendEmailToTownHall(registrationId);
      await sendConfirmationEmailToCitizen(registrationId);
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Fehler beim E-Mail-Versand sollte nicht zum Fehlschlagen der Registrierung führen
    }

    res.json({
      success: true,
      registrationId,
      message: 'Hundeanmeldung erfolgreich eingereicht'
    });

  } catch (error) {
    console.error('Error creating dog registration:', error);
    res.status(500).json({ error: 'Fehler beim Speichern der Hundeanmeldung' });
  }
});

// GET /api/dog-registrations - Alle Hundeanmeldungen abrufen (für Rathaus-Dashboard)
router.get('/', async (req, res) => {
  try {
    const { tenant, status } = req.query;

    if (!tenant) {
      return res.status(400).json({ error: 'Tenant-Parameter fehlt' });
    }

    // Tenant ID ermitteln
    const tenantResult = await pool.query(
      'SELECT id FROM tenants WHERE slug = $1 LIMIT 1',
      [tenant]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant nicht gefunden' });
    }

    const tenantId = tenantResult.rows[0].id;

    let query = `
      SELECT * FROM dog_registrations 
      WHERE tenant_id = $1
    `;
    const params: any[] = [tenantId];

    if (status) {
      query += ' AND status = $2';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json(result.rows);

  } catch (error) {
    console.error('Error fetching dog registrations:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Hundeanmeldungen' });
  }
});

// GET /api/dog-registration/:id - Einzelne Hundeanmeldung abrufen
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tenant } = req.query;

    if (!tenant) {
      return res.status(400).json({ error: 'Tenant-Parameter fehlt' });
    }

    // Tenant ID ermitteln
    const tenantResult = await pool.query(
      'SELECT id FROM tenants WHERE slug = $1 LIMIT 1',
      [tenant]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant nicht gefunden' });
    }

    const tenantId = tenantResult.rows[0].id;

    const result = await pool.query(
      'SELECT * FROM dog_registrations WHERE id = $1 AND tenant_id = $2',
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hundeanmeldung nicht gefunden' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error fetching dog registration:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Hundeanmeldung' });
  }
});

export default router;
