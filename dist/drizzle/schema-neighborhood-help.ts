import { pgTable, varchar, text, timestamp, pgEnum, integer, boolean } from "drizzle-orm/pg-core";
import { tenants } from "./schema-multi-tenant";

// Enums für Nachbarschaftshilfe
export const helpRequestStatusEnum = pgEnum("help_request_status", ["open", "in_progress", "completed", "cancelled"]);
export const helpCategoryEnum = pgEnum("help_category", [
  "shopping",          // Einkauf & Besorgungen
  "household",         // Haushalt & Garten
  "pet_care",          // Tierbetreuung
  "transport",         // Transport & Begleitung
  "tech_support",      // Technische Hilfe
  "social"             // Soziales & Gesellschaft
]);
export const urgencyEnum = pgEnum("urgency", ["low", "medium", "high"]);

/**
 * Hilfsgesuche (Help Requests)
 */
export const helpRequests = pgTable("help_requests", {
  id: varchar("id", { length: 64 }).primaryKey(),
  tenantId: varchar("tenant_id", { length: 64 }).notNull().references(() => tenants.id, { onDelete: "cascade" }),
  
  // Ersteller
  createdBy: varchar("created_by", { length: 64 }).notNull(), // User ID
  createdByName: varchar("created_by_name", { length: 100 }).notNull(), // Pseudonym/Username
  
  // Gesuch-Details
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  category: helpCategoryEnum("category").notNull(),
  urgency: urgencyEnum("urgency").default("medium"),
  
  // Standort (anonymisiert auf Stadtteil-Ebene)
  district: varchar("district", { length: 100 }).notNull(), // z.B. "Schieder", "Schwalenberg"
  
  // Status
  status: helpRequestStatusEnum("status").default("open").notNull(),
  
  // Ausgewählter Helfer (wenn Status = in_progress)
  acceptedOfferId: varchar("accepted_offer_id", { length: 64 }),
  acceptedHelperId: varchar("accepted_helper_id", { length: 64 }),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

/**
 * Hilfsangebote (Help Offers)
 */
export const helpOffers = pgTable("help_offers", {
  id: varchar("id", { length: 64 }).primaryKey(),
  requestId: varchar("request_id", { length: 64 }).notNull().references(() => helpRequests.id, { onDelete: "cascade" }),
  
  // Helfer
  offeredBy: varchar("offered_by", { length: 64 }).notNull(), // User ID
  offeredByName: varchar("offered_by_name", { length: 100 }).notNull(), // Pseudonym/Username
  
  // Nachricht vom Helfer (optional)
  message: text("message"),
  
  // Status
  isAccepted: boolean("is_accepted").default(false),
  isRejected: boolean("is_rejected").default(false),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Chat-Nachrichten (nur zwischen akzeptiertem Helfer und Hilfesuchendem)
 */
export const helpMessages = pgTable("help_messages", {
  id: varchar("id", { length: 64 }).primaryKey(),
  requestId: varchar("request_id", { length: 64 }).notNull().references(() => helpRequests.id, { onDelete: "cascade" }),
  
  // Sender
  senderId: varchar("sender_id", { length: 64 }).notNull(),
  senderName: varchar("sender_name", { length: 100 }).notNull(),
  
  // Nachricht
  message: text("message").notNull(),
  
  // Gelesen-Status
  isRead: boolean("is_read").default(false),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/**
 * Bewertungen (optional, nicht-öffentlich, nur für Admins)
 */
export const helpRatings = pgTable("help_ratings", {
  id: varchar("id", { length: 64 }).primaryKey(),
  requestId: varchar("request_id", { length: 64 }).notNull().references(() => helpRequests.id, { onDelete: "cascade" }),
  
  // Bewerter
  ratedBy: varchar("rated_by", { length: 64 }).notNull(), // User ID
  
  // Bewerteter
  ratedUser: varchar("rated_user", { length: 64 }).notNull(), // User ID
  
  // Bewertung (1 = negativ, 5 = positiv)
  rating: integer("rating").notNull(), // 1-5
  
  // Optionaler Kommentar (nur für Admins sichtbar)
  comment: text("comment"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
