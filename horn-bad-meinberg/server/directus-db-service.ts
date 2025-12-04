import { Pool } from 'pg';

const DIRECTUS_DB_HOST = process.env.DIRECTUS_DB_HOST || 'localhost';
const DIRECTUS_DB_PORT = parseInt(process.env.DIRECTUS_DB_PORT || '5432');
const DIRECTUS_DB_NAME = process.env.DIRECTUS_DB_NAME || 'directus';
const DIRECTUS_DB_USER = process.env.DIRECTUS_DB_USER || 'directus_user';
const DIRECTUS_DB_PASSWORD = process.env.DIRECTUS_DB_PASSWORD || 'directus123';

const pool = new Pool({
  host: DIRECTUS_DB_HOST,
  port: DIRECTUS_DB_PORT,
  database: DIRECTUS_DB_NAME,
  user: DIRECTUS_DB_USER,
  password: DIRECTUS_DB_PASSWORD,
});

export interface DirectusPushNotification {
  id: number;
  tenant_id: number;
  title: string;
  message: string;
  scheduled_at?: string | null;
  sent_at?: string | null;
  status: 'draft' | 'scheduled' | 'published' | 'sent' | 'failed';
}

class DirectusDbService {
  async getPushNotifications(tenantId: number): Promise<DirectusPushNotification[]> {
    try {
      console.log('[DirectusDbService] getPushNotifications called with tenantId:', tenantId);
      const result = await pool.query(
        `SELECT id, tenant_id, title, message, scheduled_at, sent_at, status 
         FROM push_notifications 
         WHERE tenant_id = $1 
         ORDER BY scheduled_at DESC NULLS LAST, id DESC`,
        [tenantId]
      );
      console.log('[DirectusDbService] Found', result.rows.length, 'notifications for tenant', tenantId);
      return result.rows;
    } catch (error) {
      console.error('Error fetching push notifications from database:', error);
      return [];
    }
  }

  async getPushNotificationById(id: number, tenantId: number): Promise<DirectusPushNotification | null> {
    try {
      const result = await pool.query(
        `SELECT id, tenant_id, title, message, scheduled_at, sent_at, status 
         FROM push_notifications 
         WHERE id = $1 AND tenant_id = $2`,
        [id, tenantId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching push notification by id from database:', error);
      return null;
    }
  }
}

export const directusDbService = new DirectusDbService();
