import type {
  Fund,
  EventStatus,
  ParticipantRole,
  Language,
  VisaStatus,
  RsvpStatus,
  WorkstreamType,
  TaskStatus,
  Criticality,
  VendorCategory,
  VendorStatus,
  PortfolioStatus,
  IncidentType,
  DocumentType,
  Role,
} from "@/db/schema";

// ============ FULL ENTITY TYPES ============

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
}

export interface Event {
  id: string;
  name: string;
  fund: Fund;
  country: string;
  city: string;
  candidateDates: string | null;
  selectedWeek: Date | null;
  status: EventStatus;
  budgetPlanned: number | null;
  notes: string | null;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  lockedAt: Date | null;
  closedAt: Date | null;
}

export interface EventWithRelations extends Event {
  owner: User | null;
  participants: Participant[];
  workstreams: WorkstreamWithTasks[];
  vendors: Vendor[];
  companyVisits: CompanyVisit[];
  budgetLines: BudgetLine[];
  incidents: Incident[];
  documents: Document[];
}

export interface Participant {
  id: string;
  name: string;
  organization: string;
  role: ParticipantRole;
  email: string;
  language: Language | null;
  needsVisa: boolean | null;
  visaStatus: VisaStatus | null;
  flightArrival: string | null;
  flightDeparture: string | null;
  dietaryRestrictions: string | null;
  specialNeeds: string | null;
  hotelAssigned: string | null;
  rsvpStatus: RsvpStatus | null;
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlightInfo {
  date: string;
  flightNumber: string;
  time: string;
  airport?: string;
}

export interface Workstream {
  id: string;
  type: WorkstreamType;
  ownerId: string | null;
  notes: string | null;
  eventId: string;
}

export interface WorkstreamWithTasks extends Workstream {
  tasks: Task[];
  owner?: User | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  deadline: Date | null;
  status: TaskStatus;
  criticality: Criticality | null;
  proofUrl: string | null;
  notes: string | null;
  workstreamId: string;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskWithDependencies extends Task {
  dependsOn: TaskDependency[];
  dependedBy: TaskDependency[];
  owner?: User | null;
}

export interface TaskDependency {
  id: string;
  dependentTaskId: string;
  blockingTaskId: string;
}

export interface Vendor {
  id: string;
  category: VendorCategory;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  quoteReceived: boolean | null;
  contractSigned: boolean | null;
  cancellationTerms: string | null;
  status: VendorStatus | null;
  notes: string | null;
  eventId: string;
}

export interface CompanyVisit {
  id: string;
  companyName: string;
  portfolioStatus: PortfolioStatus;
  address: string;
  maxCapacity: number | null;
  spaceConfirmed: boolean | null;
  epiRequired: string | null;
  presentationLanguage: Language | null;
  deckReceived: boolean | null;
  runOfShowValidated: boolean | null;
  siteContactName: string | null;
  siteContactPhone: string | null;
  identifiedRisks: string | null;
  visitDate: Date | null;
  visitTime: string | null;
  notes: string | null;
  eventId: string;
}

export interface BudgetLine {
  id: string;
  workstreamType: WorkstreamType;
  description: string;
  amountPlanned: number;
  amountCommitted: number | null;
  amountPaid: number | null;
  currency: string | null;
  costCenter: string | null;
  eventId: string;
  vendorId: string | null;
}

export interface Incident {
  id: string;
  occurredAt: Date;
  type: IncidentType;
  description: string;
  impact: string | null;
  resolution: string | null;
  futureAction: string | null;
  eventId: string;
  createdAt: Date;
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  url: string;
  generatedBy: string | null;
  eventId: string;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: string | null;
  userId: string | null;
  eventId: string | null;
  createdAt: Date;
}

// ============ GO/NO-GO CHECKS ============

export interface GoNoGoCheck {
  id: string;
  label: string;
  description: string;
  severity: "blocker" | "warning";
  passed: boolean;
  details?: string;
}

// ============ AI TYPES ============

export interface AISuggestion {
  id: string;
  priority: number;
  label: string;
  description: string;
  action: AIAction;
  context: Record<string, unknown>;
}

export type AIAction =
  | "generate-rsvp-reminder"
  | "generate-visa-letter"
  | "generate-deck-request"
  | "generate-vendor-email"
  | "generate-run-of-show"
  | "generate-ceo-brief"
  | "generate-risk-analysis"
  | "generate-participant-pack";

export interface AIGenerationRequest {
  action: AIAction;
  eventId: string;
  context: Record<string, unknown>;
  language: Language;
}

export interface AIGenerationResponse {
  success: boolean;
  content: string;
  metadata?: {
    tokensUsed?: number;
    model?: string;
  };
}

// ============ DASHBOARD TYPES ============

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  blockedTasks: number;
  criticalTasks: number;
  participantsConfirmed: number;
  participantsTotal: number;
  visasPending: number;
  budgetPlanned: number;
  budgetCommitted: number;
  budgetPaid: number;
  daysUntilEvent: number | null;
}

export interface WorkstreamProgress {
  type: WorkstreamType;
  label: string;
  totalTasks: number;
  completedTasks: number;
  blockedTasks: number;
  progress: number;
  status: "on-track" | "at-risk" | "blocked" | "complete";
}
