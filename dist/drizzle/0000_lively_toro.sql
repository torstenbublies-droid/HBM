CREATE TYPE "public"."contact_status" AS ENUM('neu', 'in_bearbeitung', 'erledigt');--> statement-breakpoint
CREATE TYPE "public"."issue_status" AS ENUM('eingegangen', 'in_bearbeitung', 'erledigt');--> statement-breakpoint
CREATE TYPE "public"."notification_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('info', 'warning', 'danger', 'event');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin', 'tenant_admin');--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenantId" varchar(64) NOT NULL,
	"type" varchar(100) NOT NULL,
	"title" varchar(500) NOT NULL,
	"message" text NOT NULL,
	"priority" "priority" DEFAULT 'medium' NOT NULL,
	"validUntil" timestamp,
	"category" varchar(100),
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chatLogs" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenantId" varchar(64) NOT NULL,
	"userId" varchar(64),
	"sessionId" varchar(64) NOT NULL,
	"message" text NOT NULL,
	"response" text NOT NULL,
	"intent" varchar(200),
	"isLocal" boolean DEFAULT true,
	"sourceDocs" text,
	"tokens" integer,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clubs" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenantId" varchar(64) NOT NULL,
	"name" varchar(500) NOT NULL,
	"category" varchar(100),
	"description" text,
	"contactName" varchar(200),
	"phone" varchar(50),
	"email" varchar(320),
	"websiteUrl" varchar(1000),
	"logoUrl" varchar(1000),
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contactMessages" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenantId" varchar(64) NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(320),
	"subject" varchar(500) NOT NULL,
	"message" text NOT NULL,
	"status" "contact_status" DEFAULT 'neu' NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "councilMeetings" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenantId" varchar(64) NOT NULL,
	"title" varchar(500) NOT NULL,
	"meetingDate" timestamp NOT NULL,
	"committee" varchar(200),
	"agendaUrl" varchar(1000),
	"minutesUrl" varchar(1000),
	"location" varchar(500),
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenantId" varchar(64) NOT NULL,
	"name" varchar(500) NOT NULL,
	"description" text,
	"responsibilities" text,
	"contactName" varchar(200),
	"phone" varchar(50),
	"email" varchar(320),
	"address" text,
	"openingHours" text,
	"appointmentLink" varchar(1000),
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenantId" varchar(64) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp,
	"location" varchar(500),
	"latitude" varchar(50),
	"longitude" varchar(50),
	"imageUrl" varchar(1000),
	"ticketLink" varchar(1000),
	"category" varchar(100),
	"cost" varchar(200),
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "institutions" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenantId" varchar(64) NOT NULL,
	"name" varchar(500) NOT NULL,
	"type" varchar(100) NOT NULL,
	"description" text,
	"contactName" varchar(200),
	"phone" varchar(50),
	"email" varchar(320),
	"address" text,
	"websiteUrl" varchar(1000),
	"registrationInfo" text,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "issueReports" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenantId" varchar(64) NOT NULL,
	"userId" varchar(64),
	"category" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"latitude" varchar(50),
	"longitude" varchar(50),
	"address" varchar(500),
	"photoUrl" varchar(1000),
	"status" "issue_status" DEFAULT 'eingegangen' NOT NULL,
	"contactEmail" varchar(320),
	"contactPhone" varchar(50),
	"ticketNumber" varchar(50) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mayorInfo" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenantId" varchar(64) NOT NULL,
	"name" varchar(200) NOT NULL,
	"party" varchar(100),
	"position" varchar(200),
	"photoUrl" varchar(1000),
	"email" varchar(320),
	"phone" varchar(50),
	"bio" text,
	"calendarUrl" varchar(1000),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenantId" varchar(64) NOT NULL,
	"title" varchar(500) NOT NULL,
	"teaser" text,
	"bodyMD" text,
	"imageUrl" varchar(1000),
	"category" varchar(100),
	"publishedAt" timestamp NOT NULL,
	"sourceUrl" varchar(1000),
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pois" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenantId" varchar(64) NOT NULL,
	"name" varchar(500) NOT NULL,
	"description" text,
	"category" varchar(100),
	"latitude" varchar(50),
	"longitude" varchar(50),
	"address" varchar(500),
	"imageUrl" varchar(1000),
	"websiteUrl" varchar(1000),
	"openingHours" text,
	"pricing" text,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pushNotifications" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenantId" varchar(64) NOT NULL,
	"title" varchar(500) NOT NULL,
	"message" text NOT NULL,
	"type" "notification_type" DEFAULT 'info' NOT NULL,
	"priority" "notification_priority" DEFAULT 'medium' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"expiresAt" timestamp,
	"createdBy" varchar(64),
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"domain" varchar(255),
	"primaryColor" varchar(20) DEFAULT '#0066CC',
	"secondaryColor" varchar(20) DEFAULT '#00A86B',
	"logoUrl" varchar(1000),
	"heroImageUrl" varchar(1000),
	"contactEmail" varchar(320),
	"contactPhone" varchar(50),
	"contactAddress" text,
	"weatherLat" varchar(50),
	"weatherLon" varchar(50),
	"weatherCity" varchar(200),
	"chatbotName" varchar(100) DEFAULT 'Chatbot',
	"chatbotSystemPrompt" text,
	"enabledFeatures" text,
	"mayor_name" varchar(200),
	"mayor_email" varchar(320),
	"mayor_phone" varchar(50),
	"mayor_address" text,
	"mayor_office_hours" text,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "userNotifications" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenantId" varchar(64) NOT NULL,
	"oneSignalPlayerId" varchar(64) NOT NULL,
	"title" varchar(500) NOT NULL,
	"message" text NOT NULL,
	"type" "notification_type" DEFAULT 'info' NOT NULL,
	"isRead" boolean DEFAULT false NOT NULL,
	"receivedAt" timestamp DEFAULT now() NOT NULL,
	"readAt" timestamp,
	"data" text
);
--> statement-breakpoint
CREATE TABLE "userPreferences" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"userId" varchar(64) NOT NULL,
	"favoriteCategories" text,
	"wasteDistrict" varchar(200),
	"wasteStreet" varchar(500),
	"notificationSettings" text,
	"savedPois" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenantId" varchar(64),
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"oneSignalPlayerId" varchar(64),
	"pushEnabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"lastSignedIn" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "wasteSchedule" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"tenantId" varchar(64) NOT NULL,
	"wasteType" varchar(100) NOT NULL,
	"collectionDate" timestamp NOT NULL,
	"district" varchar(200),
	"street" varchar(500),
	"route" varchar(100),
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chatLogs" ADD CONSTRAINT "chatLogs_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clubs" ADD CONSTRAINT "clubs_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contactMessages" ADD CONSTRAINT "contactMessages_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "councilMeetings" ADD CONSTRAINT "councilMeetings_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "institutions" ADD CONSTRAINT "institutions_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issueReports" ADD CONSTRAINT "issueReports_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mayorInfo" ADD CONSTRAINT "mayorInfo_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news" ADD CONSTRAINT "news_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pois" ADD CONSTRAINT "pois_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pushNotifications" ADD CONSTRAINT "pushNotifications_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "userNotifications" ADD CONSTRAINT "userNotifications_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wasteSchedule" ADD CONSTRAINT "wasteSchedule_tenantId_tenants_id_fk" FOREIGN KEY ("tenantId") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;