import { Router } from 'express';
import { nanoid } from 'nanoid';
import postgres from 'postgres';

const router = Router();

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set');
  }
  return postgres(process.env.DATABASE_URL);
}

// Create conversation (when someone clicks "Anfragen")
router.post('/conversations', async (req, res) => {
  try {
    const sql = getSql();
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(400).json({ error: 'Tenant not found' });
    }

    const {
      requestId,
      offerId,
      requesterId,
      requesterName,
      helperId,
      helperName
    } = req.body;

    // Check if conversation already exists
    const existing = await sql`
      SELECT * FROM help_conversations
      WHERE tenant_id = ${tenant.id}
        AND ((request_id = ${requestId || null} AND requester_id = ${requesterId} AND helper_id = ${helperId})
          OR (offer_id = ${offerId || null} AND requester_id = ${requesterId} AND helper_id = ${helperId}))
    `;

    if (existing.length > 0) {
      await sql.end();
      return res.json({ id: existing[0].id, existing: true });
    }

    const id = nanoid();
    const now = new Date().toISOString();

    await sql`
      INSERT INTO help_conversations (
        id, tenant_id, request_id, offer_id, requester_id, requester_name,
        helper_id, helper_name, status, created_at, updated_at
      ) VALUES (
        ${id}, ${tenant.id}, ${requestId || null}, ${offerId || null},
        ${requesterId}, ${requesterName}, ${helperId}, ${helperName},
        'active', ${now}, ${now}
      )
    `;

    await sql.end();
    res.json({ id, success: true });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get single conversation by ID
router.get('/conversations/:id', async (req, res) => {
  try {
    const sql = getSql();
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(400).json({ error: 'Tenant not found' });
    }

    const { id } = req.params;

    const conversation = await sql`
      SELECT * FROM help_conversations
      WHERE id = ${id} AND tenant_id = ${tenant.id}
    `;

    if (conversation.length === 0) {
      await sql.end();
      return res.status(404).json({ error: 'Conversation not found' });
    }

    await sql.end();
    res.json(conversation[0]);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Get conversations for a user
router.get('/conversations', async (req, res) => {
  try {
    const sql = getSql();
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(400).json({ error: 'Tenant not found' });
    }

    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    const conversations = await sql`
      SELECT c.*, 
        (SELECT COUNT(*) FROM help_messages m 
         WHERE m.conversation_id = c.id AND m.sender_id != ${userId} AND m.read = false) as unread_count,
        (SELECT message FROM help_messages m 
         WHERE m.conversation_id = c.id 
         ORDER BY m.created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM help_messages m 
         WHERE m.conversation_id = c.id 
         ORDER BY m.created_at DESC LIMIT 1) as last_message_at
      FROM help_conversations c
      WHERE c.tenant_id = ${tenant.id}
        AND (c.requester_id = ${userId} OR c.helper_id = ${userId})
        AND c.status = 'active'
      ORDER BY COALESCE(
        (SELECT created_at FROM help_messages m 
         WHERE m.conversation_id = c.id 
         ORDER BY m.created_at DESC LIMIT 1),
        c.created_at
      ) DESC
    `;

    await sql.end();
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Send message
router.post('/messages', async (req, res) => {
  try {
    const sql = getSql();
    const {
      conversationId,
      senderId,
      senderName,
      message
    } = req.body;

    const id = nanoid();
    const now = new Date().toISOString();

    await sql`
      INSERT INTO help_messages (
        id, conversation_id, sender_id, sender_name, message, read, created_at
      ) VALUES (
        ${id}, ${conversationId}, ${senderId}, ${senderName}, ${message}, false, ${now}
      )
    `;

    // Update conversation updated_at
    await sql`
      UPDATE help_conversations
      SET updated_at = ${now}
      WHERE id = ${conversationId}
    `;

    await sql.end();
    res.json({ id, success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Send message to conversation (alternative route)
router.post('/conversations/:id/messages', async (req, res) => {
  try {
    const sql = getSql();
    const { id } = req.params;
    const { senderId, senderName, message } = req.body;

    const messageId = nanoid();
    const now = new Date().toISOString();

    await sql`
      INSERT INTO help_messages (
        id, conversation_id, sender_id, sender_name, message, read, created_at
      ) VALUES (
        ${messageId}, ${id}, ${senderId}, ${senderName}, ${message}, false, ${now}
      )
    `;

    // Update conversation updated_at
    await sql`
      UPDATE help_conversations
      SET updated_at = ${now}
      WHERE id = ${id}
    `;

    await sql.end();
    res.json({ id: messageId, success: true });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get messages for conversation (alternative route)
router.get('/conversations/:id/messages', async (req, res) => {
  try {
    const sql = getSql();
    const { id } = req.params;
    const { userId } = req.query;

    const messages = await sql`
      SELECT * FROM help_messages
      WHERE conversation_id = ${id}
      ORDER BY created_at ASC
    `;

    // Mark messages as read
    if (userId) {
      await sql`
        UPDATE help_messages
        SET read = true
        WHERE conversation_id = ${id}
          AND sender_id != ${userId}
          AND read = false
      `;
    }

    await sql.end();
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get messages for a conversation
router.get('/messages/:conversationId', async (req, res) => {
  try {
    const sql = getSql();
    const { conversationId } = req.params;
    const { userId } = req.query;

    const messages = await sql`
      SELECT * FROM help_messages
      WHERE conversation_id = ${conversationId}
      ORDER BY created_at ASC
    `;

    // Mark messages as read
    if (userId) {
      await sql`
        UPDATE help_messages
        SET read = true
        WHERE conversation_id = ${conversationId}
          AND sender_id != ${userId}
          AND read = false
      `;
    }

    await sql.end();
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Share contact information
router.post('/conversations/:id/share-contact', async (req, res) => {
  try {
    const sql = getSql();
    const tenant = req.tenant;
    if (!tenant) {
      return res.status(400).json({ error: 'Tenant not found' });
    }

    const { id } = req.params;
    const { userId } = req.body;

    // Get conversation
    const conversation = await sql`
      SELECT * FROM help_conversations
      WHERE id = ${id} AND tenant_id = ${tenant.id}
    `;

    if (conversation.length === 0) {
      await sql.end();
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const conv = conversation[0];

    // Verify user is part of conversation
    if (conv.requester_id !== userId && conv.helper_id !== userId) {
      await sql.end();
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update contact_shared flag
    await sql`
      UPDATE help_conversations
      SET contact_shared = true
      WHERE id = ${id}
    `;

    // Send system message
    const senderName = conv.requester_id === userId 
      ? conv.requester_name 
      : conv.helper_name;

    const messageId = nanoid();
    const now = new Date().toISOString();

    await sql`
      INSERT INTO help_messages (
        id, conversation_id, sender_id, sender_name, message, read, created_at
      ) VALUES (
        ${messageId}, ${id}, 'system', 'System',
        ${`${senderName} hat die Kontaktdaten geteilt. Sie können sich nun direkt austauschen.`},
        false, ${now}
      )
    `;

    await sql.end();
    res.json({ success: true });
  } catch (error) {
    console.error('Error sharing contact:', error);
    res.status(500).json({ error: 'Failed to share contact' });
  }
});

export default router;
