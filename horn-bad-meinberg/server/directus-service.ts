import axios from 'axios';

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN || '';

interface DirectusResponse<T> {
  data: T;
}

interface DirectusListResponse<T> {
  data: T[];
  meta?: {
    total_count: number;
    filter_count: number;
  };
}

export interface DirectusNews {
  id: number;
  tenant_id: number;
  title: string;
  content: string;
  image?: string;
  published_at?: string;
  status: 'draft' | 'published' | 'archived';
}

export interface DirectusEvent {
  id: number;
  tenant_id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  image?: string;
}

export interface DirectusDepartment {
  id: number;
  tenant_id: number;
  name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
  opening_hours?: string;
}

export interface DirectusPushNotification {
  id: number;
  tenant_id: number;
  title: string;
  message: string;
  scheduled_at?: string | null;
  sent_at?: string | null;
  status: 'draft' | 'scheduled' | 'published' | 'sent' | 'failed';
}

class DirectusService {
  private api = axios.create({
    baseURL: DIRECTUS_URL,
    headers: {
      'Authorization': `Bearer ${DIRECTUS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  // News
  async getNews(tenantId: number): Promise<DirectusNews[]> {
    try {
      const response = await this.api.get<DirectusListResponse<DirectusNews>>('/items/news', {
        params: {
          filter: {
            tenant_id: { _eq: tenantId },
            status: { _eq: 'published' },
          },
          sort: '-published_at',
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching news from Directus:', error);
      return [];
    }
  }

  async getNewsById(id: number, tenantId: number): Promise<DirectusNews | null> {
    try {
      const response = await this.api.get<DirectusResponse<DirectusNews>>(`/items/news/${id}`, {
        params: {
          filter: {
            tenant_id: { _eq: tenantId },
          },
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching news by id from Directus:', error);
      return null;
    }
  }

  // Events
  async getEvents(tenantId: number): Promise<DirectusEvent[]> {
    try {
      const response = await this.api.get<DirectusListResponse<DirectusEvent>>('/items/events', {
        params: {
          filter: {
            tenant_id: { _eq: tenantId },
            start_date: { _gte: new Date().toISOString() },
          },
          sort: 'start_date',
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching events from Directus:', error);
      return [];
    }
  }

  async getEventById(id: number, tenantId: number): Promise<DirectusEvent | null> {
    try {
      const response = await this.api.get<DirectusResponse<DirectusEvent>>(`/items/events/${id}`, {
        params: {
          filter: {
            tenant_id: { _eq: tenantId },
          },
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching event by id from Directus:', error);
      return null;
    }
  }

  // Departments
  async getDepartments(tenantId: number): Promise<DirectusDepartment[]> {
    try {
      const response = await this.api.get<DirectusListResponse<DirectusDepartment>>('/items/departments', {
        params: {
          filter: {
            tenant_id: { _eq: tenantId },
          },
          sort: 'name',
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching departments from Directus:', error);
      return [];
    }
  }

  async getDepartmentById(id: number, tenantId: number): Promise<DirectusDepartment | null> {
    try {
      const response = await this.api.get<DirectusResponse<DirectusDepartment>>(`/items/departments/${id}`, {
        params: {
          filter: {
            tenant_id: { _eq: tenantId },
          },
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching department by id from Directus:', error);
      return null;
    }
  }

  // Push Notifications
  async getPushNotifications(tenantId: number): Promise<DirectusPushNotification[]> {
    try {
      const response = await this.api.get<DirectusListResponse<DirectusPushNotification>>('/items/push_notifications', {
        params: {
          filter: {
            tenant_id: { _eq: tenantId },
          },
          sort: '-scheduled_at',
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching push notifications from Directus:', error);
      return [];
    }
  }

  async getPushNotificationById(id: number, tenantId: number): Promise<DirectusPushNotification | null> {
    try {
      const response = await this.api.get<DirectusResponse<DirectusPushNotification>>(`/items/push_notifications/${id}`, {
        params: {
          filter: {
            tenant_id: { _eq: tenantId },
          },
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching push notification by id from Directus:', error);
      return null;
    }
  }

  // Push Notifications (for admin/scheduled sending)
  async getPendingPushNotifications(): Promise<DirectusPushNotification[]> {
    try {
      const response = await this.api.get<DirectusListResponse<DirectusPushNotification>>('/items/push_notifications', {
        params: {
          filter: {
            status: { _eq: 'scheduled' },
            scheduled_at: { _lte: new Date().toISOString() },
          },
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching pending push notifications from Directus:', error);
      return [];
    }
  }

  async markPushNotificationAsSent(id: number): Promise<void> {
    try {
      await this.api.patch(`/items/push_notifications/${id}`, {
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error marking push notification as sent:', error);
    }
  }

  async markPushNotificationAsFailed(id: number): Promise<void> {
    try {
      await this.api.patch(`/items/push_notifications/${id}`, {
        status: 'failed',
      });
    } catch (error) {
      console.error('Error marking push notification as failed:', error);
    }
  }
}

export const directusService = new DirectusService();
