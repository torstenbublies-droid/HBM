import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://buergerapp_user:buergerapp_dev_2025@localhost:5432/buergerapp'
});

interface DogRegistration {
  id: number;
  tenant_id: string;
  owner_first_name: string;
  owner_last_name: string;
  owner_street: string;
  owner_house_number: string;
  owner_zip: string;
  owner_city: string;
  owner_email: string;
  owner_phone: string | null;
  dog_name: string;
  dog_breed: string;
  dog_gender: string;
  dog_birth_date: string;
  dog_chip_number: string | null;
  dog_holding_start_date: string;
  dog_from_other_municipality: boolean;
  sepa_iban: string;
  sepa_account_holder: string;
  privacy_accepted: boolean;
  registration_type: string;
  status: string;
  created_at: string;
}

/**
 * Sendet strukturierte E-Mail an das Rathaus
 * In Entwicklung: Zeigt E-Mail in Console
 * In Produktion: Kann mit echtem SMTP-Service erweitert werden
 */
export async function sendEmailToTownHall(registrationId: number): Promise<void> {
  try {
    // Daten aus Datenbank abrufen
    const result = await pool.query(
      'SELECT * FROM dog_registrations WHERE id = $1',
      [registrationId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Registration ${registrationId} not found`);
    }

    const reg: DogRegistration = result.rows[0];

    const subject = `Hundesteuer-${reg.registration_type === 'anmelden' ? 'Anmeldung' : 'Abmeldung'} - ${reg.owner_last_name}`;

    const emailBody = `
Sehr geehrte Damen und Herren,

hiermit ${reg.registration_type === 'anmelden' ? 'melde ich meinen Hund zur Hundesteuer an' : 'melde ich meinen Hund von der Hundesteuer ab'}:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ANGABEN ZUM HALTER:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name:                ${reg.owner_first_name} ${reg.owner_last_name}
Straße:              ${reg.owner_street} ${reg.owner_house_number}
PLZ/Ort:             ${reg.owner_zip} ${reg.owner_city}
E-Mail:              ${reg.owner_email}
Telefon:             ${reg.owner_phone || 'Nicht angegeben'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ANGABEN ZUM HUND:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name:                ${reg.dog_name}
Rasse/Mix:           ${reg.dog_breed}
Geschlecht:          ${reg.dog_gender}
Geburtsdatum:        ${new Date(reg.dog_birth_date).toLocaleDateString('de-DE')}
Chip-Nummer:         ${reg.dog_chip_number || 'Nicht angegeben'}
Haltungsbeginn:      ${new Date(reg.dog_holding_start_date).toLocaleDateString('de-DE')}
Zuzug:               ${reg.dog_from_other_municipality ? 'Ja' : 'Nein'}

${reg.registration_type === 'anmelden' ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SEPA-LASTSCHRIFTMANDAT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IBAN:                ${reg.sepa_iban}
Kontoinhaber:in:     ${reg.sepa_account_holder}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WEITERE INFORMATIONEN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Antrags-ID:          ${reg.id}
Eingereicht am:      ${new Date(reg.created_at).toLocaleString('de-DE')}
Status:              ${reg.status}
Datenschutz:         ${reg.privacy_accepted ? 'Akzeptiert' : 'Nicht akzeptiert'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mit freundlichen Grüßen
${reg.owner_first_name} ${reg.owner_last_name}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Diese E-Mail wurde automatisch über die Bürger-App Schieder-Schwalenberg generiert.
`;

    // In Entwicklung: E-Mail in Console ausgeben
    console.log('\n' + '='.repeat(80));
    console.log('📧 E-MAIL AN RATHAUS');
    console.log('='.repeat(80));
    console.log(`Von: noreply@schieder-schwalenberg.de`);
    console.log(`An: rathaus@schieder-schwalenberg.de`);
    console.log(`Reply-To: ${reg.owner_email}`);
    console.log(`Betreff: ${subject}`);
    console.log('='.repeat(80));
    console.log(emailBody);
    console.log('='.repeat(80) + '\n');

    // TODO: In Produktion echten E-Mail-Versand implementieren
    // Beispiel mit fetch zu einem E-Mail-Service-API:
    // await fetch('https://api.emailservice.com/send', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${process.env.EMAIL_API_KEY}` },
    //   body: JSON.stringify({
    //     from: 'noreply@schieder-schwalenberg.de',
    //     to: 'rathaus@schieder-schwalenberg.de',
    //     subject,
    //     text: emailBody,
    //     replyTo: reg.owner_email
    //   })
    // });

  } catch (error) {
    console.error('Error preparing email to town hall:', error);
    throw error;
  }
}

/**
 * Sendet Bestätigungs-E-Mail an den Bürger
 * In Entwicklung: Zeigt E-Mail in Console
 * In Produktion: Kann mit echtem SMTP-Service erweitert werden
 */
export async function sendConfirmationEmailToCitizen(registrationId: number): Promise<void> {
  try {
    // Daten aus Datenbank abrufen
    const result = await pool.query(
      'SELECT * FROM dog_registrations WHERE id = $1',
      [registrationId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Registration ${registrationId} not found`);
    }

    const reg: DogRegistration = result.rows[0];

    const subject = `Bestätigung: Hundesteuer-${reg.registration_type === 'anmelden' ? 'Anmeldung' : 'Abmeldung'}`;

    const emailBody = `
Sehr geehrte/r ${reg.owner_first_name} ${reg.owner_last_name},

vielen Dank für Ihre ${reg.registration_type === 'anmelden' ? 'Anmeldung' : 'Abmeldung'} zur Hundesteuer.

Wir haben Ihre Daten erfolgreich erhalten und werden diese zeitnah bearbeiten.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IHRE ANGABEN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Halter:              ${reg.owner_first_name} ${reg.owner_last_name}
Adresse:             ${reg.owner_street} ${reg.owner_house_number}, ${reg.owner_zip} ${reg.owner_city}

Hund:                ${reg.dog_name}
Rasse:               ${reg.dog_breed}
${reg.registration_type === 'anmelden' ? `Haltungsbeginn:     ${new Date(reg.dog_holding_start_date).toLocaleDateString('de-DE')}` : `Abmeldedatum:       ${new Date(reg.dog_holding_start_date).toLocaleDateString('de-DE')}`}

Antrags-ID:          ${reg.id}
Eingereicht am:      ${new Date(reg.created_at).toLocaleString('de-DE')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${reg.registration_type === 'anmelden' ? `
WICHTIGE HINWEISE:

• Die Hundesteuer beträgt 60 € pro Jahr (1. Hund) bzw. 90 € für jeden weiteren Hund
• Die Zahlung erfolgt automatisch per SEPA-Lastschrift
• Sie erhalten eine separate Mitteilung mit der Mandatsreferenz
• Bei Fragen wenden Sie sich bitte an: 05282 / 601-0
` : `
WICHTIGE HINWEISE:

• Ihre Abmeldung wird zeitnah bearbeitet
• Bei Fragen wenden Sie sich bitte an: 05282 / 601-0
`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mit freundlichen Grüßen
Stadt Schieder-Schwalenberg

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.
Bei Fragen kontaktieren Sie uns unter: rathaus@schieder-schwalenberg.de
`;

    // In Entwicklung: E-Mail in Console ausgeben
    console.log('\n' + '='.repeat(80));
    console.log('📧 BESTÄTIGUNGS-E-MAIL AN BÜRGER');
    console.log('='.repeat(80));
    console.log(`Von: noreply@schieder-schwalenberg.de`);
    console.log(`An: ${reg.owner_email}`);
    console.log(`Betreff: ${subject}`);
    console.log('='.repeat(80));
    console.log(emailBody);
    console.log('='.repeat(80) + '\n');

    // TODO: In Produktion echten E-Mail-Versand implementieren

  } catch (error) {
    console.error('Error preparing confirmation email:', error);
    throw error;
  }
}
