import { pgTable, text, timestamp, varchar, integer, boolean, pgEnum } from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", ["user", "admin", "tenant_admin"]);
export const issueStatusEnum = pgEnum("issue_status", ["eingegangen", "in_bearbeitung", "erledigt"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high", "critical"]);
export const contactStatusEnum = pgEnum("contact_status", ["neu", "in_bearbeitung", "erledigt"]);
export const notificationTypeEnum = pgEnum("notification_type", ["info", "warning", "danger", "event"]);
export const notificationPriorityEnum = pgEnum("notification_priority", ["low", "medium", "high", "urgent"]);

/**
 * Tenants/Städte - Multi-Tenancy
 */
export const tenants = pgTable("tenants", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 200 }).notNull(), // z.B. "Schieder-Schwalenberg"
  slug: varchar("slug", { length: 100 }).notNull().unique(), // z.B. "schieder"
  domain: varchar("domain", { length: 255 }), // z.B. "schieder.buergerapp.eu"
  
  // Branding
  primaryColor: varchar("primaryColor", { length: 20 }).default("#0066CC"), // Hauptfarbe
  secondaryColor: varchar("secondaryColor", { length: 20 }).default("#00A86B"), // Akzentfarbe
  logoUrl: varchar("logoUrl", { length: 1000 }),
  heroImageUrl: varchar("heroImageUrl", { length: 1000 }),
  
  // Kontakt
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  contactAddress: text("contactAddress"),
  
  // Wetter
  weatherLat: varchar("weatherLat", { length: 50 }), // Breitengrad
  weatherLon: varchar("weatherLon", { length: 50 }), // Längengrad
  weatherCity: varchar("weatherCity", { length: 200 }), // Stadt-Name für Wetter
  
  // Chatbot
  chatbotName: varchar("chatbotName", { length: 100 }).default("Chatbot"),
  chatbotSystemPrompt: text("chatbotSystemPrompt"), // Custom System-Prompt
  
  // Features (optional - für spätere Erweiterung)
  enabledFeatures: text("enabledFeatures"), // JSON: ["news", "events", "waste", ...]
  
  // Bürgermeister
  mayorName: varchar("mayor_name", { length: 200 }),
  mayorEmail: varchar("mayor_email", { length: 320 }),
  mayorPhone: varchar("mayor_phone", { length: 50 }),
  mayorAddress: text("mayor_address"),
  mayorOfficeHours: text("mayor_office_hours"),
  
  // Meta
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = typeof tenants.$inferInsert;

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  oneSignalPlayerId: varchar("oneSignalPlayerId", { length: 64 }),
  pushEnabled: boolean("pushEnabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * News/Aktuelles
 */
export const news = pgTable("news", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  teaser: text("teaser"),
  bodyMD: text("bodyMD"),
  imageUrl: varchar("imageUrl", { length: 1000 }),
  category: varchar("category", { length: 100 }),
  publishedAt: timestamp("publishedAt").notNull(),
  sourceUrl: varchar("sourceUrl", { length: 1000 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type News = typeof news.$inferSelect;
export type InsertNews = typeof news.$inferInsert;

/**
 * Events/Veranstaltungen
 */
export const events = pgTable("events", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  location: varchar("location", { length: 500 }),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  imageUrl: varchar("imageUrl", { length: 1000 }),
  ticketLink: varchar("ticketLink", { length: 1000 }),
  category: varchar("category", { length: 100 }),
  cost: varchar("cost", { length: 200 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Departments/Ämter
 */
export const departments = pgTable("departments", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 500 }).notNull(),
  description: text("description"),
  responsibilities: text("responsibilities"),
  contactName: varchar("contactName", { length: 200 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  openingHours: text("openingHours"),
  appointmentLink: varchar("appointmentLink", { length: 1000 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;

/**
 * Issue Reports/Mängelmelder
 */
export const issueReports = pgTable("issueReports", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  userId: varchar("userId", { length: 64 }),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description").notNull(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  address: varchar("address", { length: 500 }),
  photoUrl: varchar("photoUrl", { length: 1000 }),
  status: issueStatusEnum("status").default("eingegangen").notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  ticketNumber: varchar("ticketNumber", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type IssueReport = typeof issueReports.$inferSelect;
export type InsertIssueReport = typeof issueReports.$inferInsert;

/**
 * Waste Collection/Abfallkalender
 */
export const wasteSchedule = pgTable("wasteSchedule", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  wasteType: varchar("wasteType", { length: 100 }).notNull(),
  collectionDate: timestamp("collectionDate").notNull(),
  district: varchar("district", { length: 200 }),
  street: varchar("street", { length: 500 }),
  route: varchar("route", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type WasteSchedule = typeof wasteSchedule.$inferSelect;
export type InsertWasteSchedule = typeof wasteSchedule.$inferInsert;

/**
 * Alerts/Warnings/Notfall & Störungen
 */
export const alerts = pgTable("alerts", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 100 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  message: text("message").notNull(),
  priority: priorityEnum("priority").default("medium").notNull(),
  validUntil: timestamp("validUntil"),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

/**
 * Tourism POIs/Tourismus & Freizeit
 */
export const pois = pgTable("pois", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 500 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  address: varchar("address", { length: 500 }),
  imageUrl: varchar("imageUrl", { length: 1000 }),
  websiteUrl: varchar("websiteUrl", { length: 1000 }),
  openingHours: text("openingHours"),
  pricing: text("pricing"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Poi = typeof pois.$inferSelect;
export type InsertPoi = typeof pois.$inferInsert;

/**
 * Educational Institutions/Bildung & Familie
 */
export const institutions = pgTable("institutions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 500 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(),
  description: text("description"),
  contactName: varchar("contactName", { length: 200 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  websiteUrl: varchar("websiteUrl", { length: 1000 }),
  registrationInfo: text("registrationInfo"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Institution = typeof institutions.$inferSelect;
export type InsertInstitution = typeof institutions.$inferInsert;

/**
 * Council/Ratsinfos & Politik
 */
export const councilMeetings = pgTable("councilMeetings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  meetingDate: timestamp("meetingDate").notNull(),
  committee: varchar("committee", { length: 200 }),
  agendaUrl: varchar("agendaUrl", { length: 1000 }),
  minutesUrl: varchar("minutesUrl", { length: 1000 }),
  location: varchar("location", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type CouncilMeeting = typeof councilMeetings.$inferSelect;
export type InsertCouncilMeeting = typeof councilMeetings.$inferInsert;

/**
 * Mayor Info/Bürgermeister
 */
export const mayorInfo = pgTable("mayorInfo", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  party: varchar("party", { length: 100 }),
  position: varchar("position", { length: 200 }),
  photoUrl: varchar("photoUrl", { length: 1000 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  bio: text("bio"),
  calendarUrl: varchar("calendarUrl", { length: 1000 }),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type MayorInfo = typeof mayorInfo.$inferSelect;
export type InsertMayorInfo = typeof mayorInfo.$inferInsert;

/**
 * Clubs/Vereine
 */
export const clubs = pgTable("clubs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  contactName: varchar("contactName", { length: 200 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  websiteUrl: varchar("websiteUrl", { length: 1000 }),
  logoUrl: varchar("logoUrl", { length: 1000 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Club = typeof clubs.$inferSelect;
export type InsertClub = typeof clubs.$inferInsert;

/**
 * Chat History/Chatbot Logs
 */
export const chatLogs = pgTable("chatLogs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  userId: varchar("userId", { length: 64 }),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  message: text("message").notNull(),
  response: text("response").notNull(),
  intent: varchar("intent", { length: 200 }),
  isLocal: boolean("isLocal").default(true),
  sourceDocs: text("sourceDocs"),
  tokens: integer("tokens"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type ChatLog = typeof chatLogs.$inferSelect;
export type InsertChatLog = typeof chatLogs.$inferInsert;

/**
 * User Preferences/Personalisierung
 */
export const userPreferences = pgTable("userPreferences", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  favoriteCategories: text("favoriteCategories"),
  wasteDistrict: varchar("wasteDistrict", { length: 200 }),
  wasteStreet: varchar("wasteStreet", { length: 500 }),
  notificationSettings: text("notificationSettings"),
  savedPois: text("savedPois"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;


/**
 * Contact Messages/Kontakt & Anliegen
 */
export const contactMessages = pgTable("contactMessages", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }),
  subject: varchar("subject", { length: 500 }).notNull(),
  message: text("message").notNull(),
  status: contactStatusEnum("status").default("neu").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;



/**
 * Push Notifications
 */
export const pushNotifications = pgTable("pushNotifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 500 }).notNull(),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").default("info").notNull(),
  priority: notificationPriorityEnum("priority").default("medium").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdBy: varchar("createdBy", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type PushNotification = typeof pushNotifications.$inferSelect;
export type InsertPushNotification = typeof pushNotifications.$inferInsert;

/**
 * User Notifications - stores notifications received by each user
 */
export const userNotifications = pgTable("userNotifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenantId", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  oneSignalPlayerId: varchar("oneSignalPlayerId", { length: 64 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").default("info").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  receivedAt: timestamp("receivedAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
  data: text("data"), // JSON string for additional data
});

export type UserNotification = typeof userNotifications.$inferSelect;
export type InsertUserNotification = typeof userNotifications.$inferInsert;
