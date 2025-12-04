import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);

async function createChatTables() {
  try {
    console.log('Creating help_conversations table...');
    await sql`
      CREATE TABLE IF NOT EXISTS help_conversations (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        request_id TEXT,
        offer_id TEXT,
        requester_id TEXT NOT NULL,
        requester_name TEXT NOT NULL,
        helper_id TEXT NOT NULL,
        helper_name TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('Creating help_messages table (if not exists)...');
    await sql`
      CREATE TABLE IF NOT EXISTS help_messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL REFERENCES help_conversations(id) ON DELETE CASCADE,
        sender_id TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON help_conversations(tenant_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversations_requester ON help_conversations(requester_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_conversations_helper ON help_conversations(helper_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_conversation ON help_messages(conversation_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_messages_sender ON help_messages(sender_id)`;
    
    console.log('✓ Chat tables created successfully!');
    await sql.end();
  } catch (error) {
    console.error('✗ Error:', error);
    await sql.end();
    process.exit(1);
  }
}

createChatTables();
