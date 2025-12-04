interface ContactRequestEmailData {
  requestId: number;
  tenantName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category?: string;
}

export async function sendContactRequestEmail(data: ContactRequestEmailData): Promise<void> {
  const {
    requestId,
    tenantName,
    firstName,
    lastName,
    email,
    phone,
    subject,
    message,
    category
  } = data;

  // Email to town hall
  const townHallEmail = {
    to: process.env.TOWN_HALL_EMAIL || 'rathaus@schieder-schwalenberg.de',
    from: process.env.SMTP_FROM || 'noreply@schieder-schwalenberg.de',
    replyTo: email,
    subject: `Neue Kontaktanfrage: ${subject}`,
    text: `
Neue Kontaktanfrage über die Bürger-App

ANTRAGS-ID: ${requestId}

═══════════════════════════════════════════════════════

KONTAKTDATEN:

Name:           ${firstName} ${lastName}
E-Mail:         ${email}
Telefon:        ${phone || 'Nicht angegeben'}

═══════════════════════════════════════════════════════

ANLIEGEN:

Betreff:        ${subject}
${category ? `Kategorie:      ${category}\n` : ''}
Nachricht:

${message}

═══════════════════════════════════════════════════════

Diese Anfrage wurde über die digitale Stadtverwaltung von ${tenantName} eingereicht.

Antworten Sie direkt auf diese E-Mail, um den Bürger zu kontaktieren.
    `.trim()
  };

  // For development: Log email instead of sending
  if (!process.env.SMTP_HOST) {
    console.log('\n' + '='.repeat(80));
    console.log('📧 CONTACT REQUEST EMAIL (Town Hall)');
    console.log('='.repeat(80));
    console.log(`To: ${townHallEmail.to}`);
    console.log(`From: ${townHallEmail.from}`);
    console.log(`Reply-To: ${townHallEmail.replyTo}`);
    console.log(`Subject: ${townHallEmail.subject}`);
    console.log('-'.repeat(80));
    console.log(townHallEmail.text);
    console.log('='.repeat(80) + '\n');
    return;
  }

  // TODO: Implement actual email sending with nodemailer when SMTP is configured
  // For now, just log
  console.log(`[Email] Would send contact request email for request #${requestId}`);
}
