import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { nanoid } from "nanoid";
import { 
  InsertUser, users, 
  news, InsertNews,
  events, InsertEvent,
  departments, InsertDepartment,
  issueReports, InsertIssueReport,
  wasteSchedule, InsertWasteSchedule,
  alerts, InsertAlert,
  pois, InsertPoi,
  institutions, InsertInstitution,
  councilMeetings, InsertCouncilMeeting,
  mayorInfo, InsertMayorInfo,
  chatLogs, InsertChatLog,
  userPreferences, InsertUserPreference,
  contactMessages, InsertContactMessage,
  pushNotifications, InsertPushNotification,
  userNotifications, InsertUserNotification
} from "../drizzle/schema";
import * as schema from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client, { schema });
      console.log("[Database] Connected successfully");
    } catch (error) {
      console.error("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// News functions
export async function getAllNews(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(news).orderBy(desc(news.publishedAt)).limit(limit);
}

export async function getNewsByCategory(category: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(news).where(eq(news.category, category)).orderBy(desc(news.publishedAt)).limit(limit);
}

export async function getNewsById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(news).where(eq(news.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createNews(data: InsertNews) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(news).values(data);
}

// Events functions
export async function getAllEvents(limit = 100) {
  const db = await getDb();
  if (!db) {
    // Fallback to mock data when database is not available
    const { mockEvents } = await import('../client/src/data/mockEvents.js');
    return mockEvents.slice(0, limit);
  }
  return db.select().from(events).orderBy(desc(events.startDate)).limit(limit);
}

export async function getUpcomingEvents(limit = 50) {
  const db = await getDb();
  if (!db) {
    // Fallback to mock data when database is not available
    const { mockEvents } = await import('../client/src/data/mockEvents.js');
    const now = new Date();
    return mockEvents.filter(event => new Date(event.startDate) >= now).slice(0, limit);
  }
  try {
    const now = new Date();
    return await db.select().from(events).where(gte(events.startDate, now)).orderBy(events.startDate).limit(limit);
  } catch (error) {
    console.warn('[Database] Error fetching events, using mock data:', error);
    // Fallback to mock data on error
    const { mockEvents } = await import('../client/src/data/mockEvents.js');
    const now = new Date();
    return mockEvents.filter(event => new Date(event.startDate) >= now).slice(0, limit);
  }
}

export async function getEventById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createEvent(data: InsertEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(events).values(data);
}

// Departments functions
export async function getAllDepartments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(departments).orderBy(departments.name);
}

export async function getDepartmentById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(departments).where(eq(departments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDepartment(data: InsertDepartment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(departments).values(data);
}

// Issue Reports functions
export async function getAllIssueReports(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(issueReports).orderBy(desc(issueReports.createdAt)).limit(limit);
}

export async function getIssueReportsByUser(userId: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(issueReports).where(eq(issueReports.userId, userId)).orderBy(desc(issueReports.createdAt));
}

export async function getIssueReportById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(issueReports).where(eq(issueReports.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createIssueReport(data: InsertIssueReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(issueReports).values(data);
}

export async function updateIssueReportStatus(id: string, status: "eingegangen" | "in_bearbeitung" | "erledigt") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(issueReports).set({ status, updatedAt: new Date() }).where(eq(issueReports.id, id));
}

// Waste Schedule functions
export async function getWasteScheduleByDistrict(district: string, fromDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(wasteSchedule.district, district)];
  if (fromDate) {
    conditions.push(gte(wasteSchedule.collectionDate, fromDate));
  }
  return db.select().from(wasteSchedule).where(and(...conditions)).orderBy(wasteSchedule.collectionDate);
}

export async function getWasteScheduleByStreet(street: string, fromDate?: Date) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(wasteSchedule.street, street)];
  if (fromDate) {
    conditions.push(gte(wasteSchedule.collectionDate, fromDate));
  }
  return db.select().from(wasteSchedule).where(and(...conditions)).orderBy(wasteSchedule.collectionDate);
}

export async function createWasteSchedule(data: InsertWasteSchedule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(wasteSchedule).values(data);
}

export async function getUpcomingWasteCollections(fromDate: Date, toDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(wasteSchedule)
    .where(and(
      gte(wasteSchedule.collectionDate, fromDate),
      lte(wasteSchedule.collectionDate, toDate)
    ))
    .orderBy(wasteSchedule.collectionDate);
}

export async function updateUserWasteNotifications(userId: string, enabled: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const notificationSettings = JSON.stringify({ wasteReminders: enabled });
  
  await db.insert(userPreferences).values({
    id: `pref-${userId}`,
    userId,
    notificationSettings,
  }).onDuplicateKeyUpdate({
    set: { notificationSettings }
  });
}

// Alerts functions
export async function getActiveAlerts() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return db.select().from(alerts).where(
    sql`${alerts.validUntil} IS NULL OR ${alerts.validUntil} >= ${now}`
  ).orderBy(desc(alerts.priority), desc(alerts.createdAt));
}

export async function getAlertById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(alerts).where(eq(alerts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAlert(data: InsertAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(alerts).values(data);
}

// POIs functions
export async function getAllPois() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pois).orderBy(pois.name);
}

export async function getPoisByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pois).where(eq(pois.category, category)).orderBy(pois.name);
}

export async function getPoiById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(pois).where(eq(pois.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPoi(data: InsertPoi) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(pois).values(data);
}

// Institutions functions
export async function getAllInstitutions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(institutions).orderBy(institutions.name);
}

export async function getInstitutionsByType(type: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(institutions).where(eq(institutions.type, type)).orderBy(institutions.name);
}

export async function createInstitution(data: InsertInstitution) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(institutions).values(data);
}

// Council Meetings functions
export async function getAllCouncilMeetings(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(councilMeetings).orderBy(desc(councilMeetings.meetingDate)).limit(limit);
}

export async function getUpcomingCouncilMeetings(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return db.select().from(councilMeetings).where(gte(councilMeetings.meetingDate, now)).orderBy(councilMeetings.meetingDate).limit(limit);
}

export async function createCouncilMeeting(data: InsertCouncilMeeting) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(councilMeetings).values(data);
}

// Mayor Info functions
export async function getMayorInfo() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(mayorInfo).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertMayorInfo(data: InsertMayorInfo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (!data.id) {
    data.id = "mayor-current";
  }
  
  await db.insert(mayorInfo).values(data).onDuplicateKeyUpdate({
    set: {
      name: data.name,
      party: data.party,
      position: data.position,
      photoUrl: data.photoUrl,
      email: data.email,
      phone: data.phone,
      bio: data.bio,
      calendarUrl: data.calendarUrl,
      updatedAt: new Date(),
    },
  });
}

// Chat Logs functions
export async function createChatLog(data: InsertChatLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(chatLogs).values(data);
}

export async function getChatLogsBySession(sessionId: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatLogs).where(eq(chatLogs.sessionId, sessionId)).orderBy(chatLogs.createdAt).limit(limit);
}

// User Preferences functions
export async function getUserPreferences(userId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserPreferences(data: InsertUserPreference) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (!data.id) {
    data.id = `pref-${data.userId}`;
  }
  
  await db.insert(userPreferences).values(data).onDuplicateKeyUpdate({
    set: {
      favoriteCategories: data.favoriteCategories,
      wasteDistrict: data.wasteDistrict,
      wasteStreet: data.wasteStreet,
      notificationSettings: data.notificationSettings,
      savedPois: data.savedPois,
      updatedAt: new Date(),
    },
  });
}


// Contact Messages functions
export async function createContactMessage(data: InsertContactMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(contactMessages).values(data);
}

export async function getAllContactMessages(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(limit);
}

export async function getContactMessagesByStatus(status: "neu" | "in_bearbeitung" | "erledigt", limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contactMessages).where(eq(contactMessages.status, status)).orderBy(desc(contactMessages.createdAt)).limit(limit);
}

export async function updateContactMessageStatus(id: string, status: "neu" | "in_bearbeitung" | "erledigt") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contactMessages).set({ status, updatedAt: new Date() }).where(eq(contactMessages.id, id));
}



// ============ Push Notifications ============
export async function getActivePushNotifications() {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const result = await db
    .select()
    .from(pushNotifications)
    .where(
      and(
        eq(pushNotifications.isActive, true),
        sql`(${pushNotifications.expiresAt} IS NULL OR ${pushNotifications.expiresAt} > ${now})`
      )
    )
    .orderBy(desc(pushNotifications.createdAt));
  
  return result;
}

export async function getAllPushNotifications() {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db
    .select()
    .from(pushNotifications)
    .orderBy(desc(pushNotifications.createdAt));
  
  return result;
}

export async function createPushNotification(notification: InsertPushNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(pushNotifications).values(notification);
  return notification;
}

export async function updatePushNotification(id: string, updates: Partial<InsertPushNotification>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(pushNotifications)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(pushNotifications.id, id));
  
  return true;
}

export async function deletePushNotification(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(pushNotifications).where(eq(pushNotifications.id, id));
  return true;
}



// User Notifications functions
export async function getUserNotifications(userId: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(userNotifications)
    .where(eq(userNotifications.userId, userId))
    .orderBy(desc(userNotifications.receivedAt))
    .limit(limit);
}

export async function getUnreadNotificationCount(userId: string) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(userNotifications)
    .where(and(
      eq(userNotifications.userId, userId),
      eq(userNotifications.isRead, false)
    ));
  
  return result[0]?.count || 0;
}

export async function createUserNotification(data: InsertUserNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(userNotifications).values(data);
  return data;
}

export async function markNotificationAsRead(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(userNotifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(userNotifications.id, id));
  
  return true;
}

export async function markAllNotificationsAsRead(userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(userNotifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(
      eq(userNotifications.userId, userId),
      eq(userNotifications.isRead, false)
    ));
  
  return true;
}

export async function deleteUserNotification(id: string, userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(userNotifications)
    .where(and(
      eq(userNotifications.id, id),
      eq(userNotifications.userId, userId)
    ));
  
  return true;
}

// User Notifications functions by OneSignal Player ID (no auth required)
export async function getUserNotificationsByPlayerId(oneSignalPlayerId: string, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(userNotifications)
    .where(eq(userNotifications.oneSignalPlayerId, oneSignalPlayerId))
    .orderBy(desc(userNotifications.receivedAt))
    .limit(limit);
}

export async function getUnreadNotificationCountByPlayerId(oneSignalPlayerId: string) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(userNotifications)
    .where(and(
      eq(userNotifications.oneSignalPlayerId, oneSignalPlayerId),
      eq(userNotifications.isRead, false)
    ));
  
  return result[0]?.count || 0;
}

export async function createUserNotificationByPlayerId(
  oneSignalPlayerId: string,
  title: string,
  message: string,
  type: string = 'info',
  data: string | null = null
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const notification = {
    id: nanoid(),
    oneSignalPlayerId,
    title,
    message,
    type,
    data,
    isRead: false,
    receivedAt: new Date(),
  };
  
  await db.insert(userNotifications).values(notification);
  return notification;
}

export async function markAllNotificationsAsReadByPlayerId(oneSignalPlayerId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(userNotifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(
      eq(userNotifications.oneSignalPlayerId, oneSignalPlayerId),
      eq(userNotifications.isRead, false)
    ));
  
  return true;
}

export async function deleteUserNotificationByPlayerId(id: string, oneSignalPlayerId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .delete(userNotifications)
    .where(and(
      eq(userNotifications.id, id),
      eq(userNotifications.oneSignalPlayerId, oneSignalPlayerId)
    ));
  
  return true;
}

export async function updateUserPushSettings(userId: string, oneSignalPlayerId: string | null, pushEnabled: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(users)
    .set({ oneSignalPlayerId, pushEnabled })
    .where(eq(users.id, userId));
  
  return true;
}

// Export db instance for direct access (required by some scrapers)
export { _db as db };
