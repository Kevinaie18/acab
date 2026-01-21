import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ============ ENUMS AS CONSTANTS ============

export const ROLES = ["INVESTMENT_MANAGER", "LOCAL_TEAM", "TOP_MANAGEMENT"] as const;
export type Role = (typeof ROLES)[number];

export const FUNDS = ["IPAE_1", "IPAE_2", "IPAE_3"] as const;
export type Fund = (typeof FUNDS)[number];

export const EVENT_STATUSES = ["DRAFT", "LOCKED", "LIVE", "CLOSED"] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const PARTICIPANT_ROLES = ["LP", "AC_MEMBER", "AB_MEMBER", "IP_TEAM", "LOCAL_TEAM", "ECOSYSTEM"] as const;
export type ParticipantRole = (typeof PARTICIPANT_ROLES)[number];

export const LANGUAGES = ["FR", "EN"] as const;
export type Language = (typeof LANGUAGES)[number];

export const VISA_STATUSES = ["NOT_NEEDED", "PENDING", "SUBMITTED", "APPROVED", "REJECTED"] as const;
export type VisaStatus = (typeof VISA_STATUSES)[number];

export const RSVP_STATUSES = ["PENDING", "CONFIRMED", "DECLINED", "TENTATIVE"] as const;
export type RsvpStatus = (typeof RSVP_STATUSES)[number];

export const WORKSTREAM_TYPES = [
  "DATE_SELECTION",
  "VISA_IMMIGRATION",
  "FLIGHTS_TRANSFERS",
  "HOTEL",
  "MEETING_ROOMS",
  "AV_TRANSLATION",
  "COMPANY_VISITS",
  "GROUND_TRANSPORT",
  "MEALS",
  "ECOSYSTEM_EVENT",
  "IT_CONNECTIVITY",
  "SECURITY",
  "BUDGET_CONTRACTS",
  "COMMUNICATIONS",
] as const;
export type WorkstreamType = (typeof WORKSTREAM_TYPES)[number];

export const TASK_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "BLOCKED", "DONE"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const CRITICALITIES = ["LOW", "MEDIUM", "HIGH", "BLOCKING"] as const;
export type Criticality = (typeof CRITICALITIES)[number];

export const VENDOR_CATEGORIES = [
  "HOTEL",
  "TRANSPORT",
  "AV_EQUIPMENT",
  "TRANSLATION",
  "RESTAURANT",
  "MEET_GREET",
  "SIM_CARDS",
  "SECURITY",
  "OTHER",
] as const;
export type VendorCategory = (typeof VENDOR_CATEGORIES)[number];

export const VENDOR_STATUSES = [
  "PROSPECTING",
  "QUOTE_REQUESTED",
  "QUOTE_RECEIVED",
  "NEGOTIATING",
  "CONTRACTED",
  "CANCELLED",
] as const;
export type VendorStatus = (typeof VENDOR_STATUSES)[number];

export const PORTFOLIO_STATUSES = ["CURRENT", "EXITED"] as const;
export type PortfolioStatus = (typeof PORTFOLIO_STATUSES)[number];

export const INCIDENT_TYPES = ["TRANSPORT", "AV_TECHNICAL", "VISA", "HEALTH", "SECURITY", "CATERING", "OTHER"] as const;
export type IncidentType = (typeof INCIDENT_TYPES)[number];

export const DOCUMENT_TYPES = [
  "VISA_LETTER",
  "RUN_OF_SHOW",
  "CEO_BRIEF",
  "PARTICIPANT_PACK",
  "CHECKLIST",
  "ROOMING_LIST",
  "TRANSFER_MANIFEST",
  "OTHER",
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

// ============ USERS ============

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").$type<Role>().notNull().default("LOCAL_TEAM"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const usersRelations = relations(users, ({ many }) => ({
  ownedEvents: many(events),
  assignedTasks: many(tasks),
  auditLogs: many(auditLogs),
}));

// ============ EVENTS ============

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  fund: text("fund").$type<Fund>().notNull(),
  country: text("country").notNull(),
  city: text("city").notNull(),
  candidateDates: text("candidate_dates"), // JSON string
  selectedWeek: integer("selected_week", { mode: "timestamp" }),
  status: text("status").$type<EventStatus>().notNull().default("DRAFT"),
  budgetPlanned: real("budget_planned").default(0),
  notes: text("notes"),
  ownerId: text("owner_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  lockedAt: integer("locked_at", { mode: "timestamp" }),
  closedAt: integer("closed_at", { mode: "timestamp" }),
});

export const eventsRelations = relations(events, ({ one, many }) => ({
  owner: one(users, { fields: [events.ownerId], references: [users.id] }),
  participants: many(participants),
  workstreams: many(workstreams),
  vendors: many(vendors),
  companyVisits: many(companyVisits),
  budgetLines: many(budgetLines),
  incidents: many(incidents),
  documents: many(documents),
  auditLogs: many(auditLogs),
}));

// ============ PARTICIPANTS ============

export const participants = sqliteTable("participants", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  organization: text("organization").notNull(),
  role: text("role").$type<ParticipantRole>().notNull(),
  email: text("email").notNull(),
  language: text("language").$type<Language>().default("EN"),
  needsVisa: integer("needs_visa", { mode: "boolean" }).default(false),
  visaStatus: text("visa_status").$type<VisaStatus>(),
  flightArrival: text("flight_arrival"), // JSON
  flightDeparture: text("flight_departure"), // JSON
  dietaryRestrictions: text("dietary_restrictions"),
  specialNeeds: text("special_needs"),
  hotelAssigned: text("hotel_assigned"),
  rsvpStatus: text("rsvp_status").$type<RsvpStatus>().default("PENDING"),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const participantsRelations = relations(participants, ({ one }) => ({
  event: one(events, { fields: [participants.eventId], references: [events.id] }),
}));

// ============ WORKSTREAMS ============

export const workstreams = sqliteTable("workstreams", {
  id: text("id").primaryKey(),
  type: text("type").$type<WorkstreamType>().notNull(),
  ownerId: text("owner_id").references(() => users.id),
  notes: text("notes"),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
});

export const workstreamsRelations = relations(workstreams, ({ one, many }) => ({
  event: one(events, { fields: [workstreams.eventId], references: [events.id] }),
  owner: one(users, { fields: [workstreams.ownerId], references: [users.id] }),
  tasks: many(tasks),
}));

// ============ TASKS ============

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  deadline: integer("deadline", { mode: "timestamp" }),
  status: text("status").$type<TaskStatus>().notNull().default("NOT_STARTED"),
  criticality: text("criticality").$type<Criticality>().default("MEDIUM"),
  proofUrl: text("proof_url"),
  notes: text("notes"),
  workstreamId: text("workstream_id")
    .notNull()
    .references(() => workstreams.id, { onDelete: "cascade" }),
  ownerId: text("owner_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  workstream: one(workstreams, { fields: [tasks.workstreamId], references: [workstreams.id] }),
  owner: one(users, { fields: [tasks.ownerId], references: [users.id] }),
  dependsOn: many(taskDependencies, { relationName: "dependentTask" }),
  dependedBy: many(taskDependencies, { relationName: "blockingTask" }),
}));

// ============ TASK DEPENDENCIES ============

export const taskDependencies = sqliteTable("task_dependencies", {
  id: text("id").primaryKey(),
  dependentTaskId: text("dependent_task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  blockingTaskId: text("blocking_task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
});

export const taskDependenciesRelations = relations(taskDependencies, ({ one }) => ({
  dependentTask: one(tasks, {
    fields: [taskDependencies.dependentTaskId],
    references: [tasks.id],
    relationName: "dependentTask",
  }),
  blockingTask: one(tasks, {
    fields: [taskDependencies.blockingTaskId],
    references: [tasks.id],
    relationName: "blockingTask",
  }),
}));

// ============ VENDORS ============

export const vendors = sqliteTable("vendors", {
  id: text("id").primaryKey(),
  category: text("category").$type<VendorCategory>().notNull(),
  name: text("name").notNull(),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  quoteReceived: integer("quote_received", { mode: "boolean" }).default(false),
  contractSigned: integer("contract_signed", { mode: "boolean" }).default(false),
  cancellationTerms: text("cancellation_terms"),
  status: text("status").$type<VendorStatus>().default("PROSPECTING"),
  notes: text("notes"),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
});

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  event: one(events, { fields: [vendors.eventId], references: [events.id] }),
  budgetLines: many(budgetLines),
}));

// ============ COMPANY VISITS ============

export const companyVisits = sqliteTable("company_visits", {
  id: text("id").primaryKey(),
  companyName: text("company_name").notNull(),
  portfolioStatus: text("portfolio_status").$type<PortfolioStatus>().notNull(),
  address: text("address").notNull(),
  maxCapacity: integer("max_capacity"),
  spaceConfirmed: integer("space_confirmed", { mode: "boolean" }).default(false),
  epiRequired: text("epi_required"),
  presentationLanguage: text("presentation_language").$type<Language>().default("EN"),
  deckReceived: integer("deck_received", { mode: "boolean" }).default(false),
  runOfShowValidated: integer("run_of_show_validated", { mode: "boolean" }).default(false),
  siteContactName: text("site_contact_name"),
  siteContactPhone: text("site_contact_phone"),
  identifiedRisks: text("identified_risks"),
  visitDate: integer("visit_date", { mode: "timestamp" }),
  visitTime: text("visit_time"),
  notes: text("notes"),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
});

export const companyVisitsRelations = relations(companyVisits, ({ one }) => ({
  event: one(events, { fields: [companyVisits.eventId], references: [events.id] }),
}));

// ============ BUDGET LINES ============

export const budgetLines = sqliteTable("budget_lines", {
  id: text("id").primaryKey(),
  workstreamType: text("workstream_type").$type<WorkstreamType>().notNull(),
  description: text("description").notNull(),
  amountPlanned: real("amount_planned").notNull(),
  amountCommitted: real("amount_committed").default(0),
  amountPaid: real("amount_paid").default(0),
  currency: text("currency").default("EUR"),
  costCenter: text("cost_center"),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  vendorId: text("vendor_id").references(() => vendors.id),
});

export const budgetLinesRelations = relations(budgetLines, ({ one }) => ({
  event: one(events, { fields: [budgetLines.eventId], references: [events.id] }),
  vendor: one(vendors, { fields: [budgetLines.vendorId], references: [vendors.id] }),
}));

// ============ INCIDENTS ============

export const incidents = sqliteTable("incidents", {
  id: text("id").primaryKey(),
  occurredAt: integer("occurred_at", { mode: "timestamp" }).notNull(),
  type: text("type").$type<IncidentType>().notNull(),
  description: text("description").notNull(),
  impact: text("impact"),
  resolution: text("resolution"),
  futureAction: text("future_action"),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const incidentsRelations = relations(incidents, ({ one }) => ({
  event: one(events, { fields: [incidents.eventId], references: [events.id] }),
}));

// ============ DOCUMENTS ============

export const documents = sqliteTable("documents", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").$type<DocumentType>().notNull(),
  url: text("url").notNull(),
  generatedBy: text("generated_by"), // "AI" or "MANUAL"
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const documentsRelations = relations(documents, ({ one }) => ({
  event: one(events, { fields: [documents.eventId], references: [events.id] }),
}));

// ============ AUDIT LOGS ============

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  action: text("action").notNull(), // CREATE, UPDATE, DELETE, STATUS_CHANGE, AI_GENERATION
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  changes: text("changes"), // JSON
  userId: text("user_id").references(() => users.id),
  eventId: text("event_id").references(() => events.id, { onDelete: "set null" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
  event: one(events, { fields: [auditLogs.eventId], references: [events.id] }),
}));
