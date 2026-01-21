import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatDate(date: Date | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function daysUntil(date: Date | null | undefined): number | null {
  if (!date) return null;
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Event statuses
    DRAFT: "bg-gray-100 text-gray-800",
    LOCKED: "bg-blue-100 text-blue-800",
    LIVE: "bg-green-100 text-green-800",
    CLOSED: "bg-purple-100 text-purple-800",
    // Task statuses
    NOT_STARTED: "bg-gray-100 text-gray-800",
    IN_PROGRESS: "bg-yellow-100 text-yellow-800",
    BLOCKED: "bg-red-100 text-red-800",
    DONE: "bg-green-100 text-green-800",
    // RSVP
    PENDING: "bg-yellow-100 text-yellow-800",
    CONFIRMED: "bg-green-100 text-green-800",
    DECLINED: "bg-red-100 text-red-800",
    TENTATIVE: "bg-orange-100 text-orange-800",
    // Visa
    NOT_NEEDED: "bg-gray-100 text-gray-600",
    SUBMITTED: "bg-blue-100 text-blue-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    // Criticality
    LOW: "bg-gray-100 text-gray-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-orange-100 text-orange-800",
    BLOCKING: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getCriticalityIcon(criticality: string): string {
  const icons: Record<string, string> = {
    LOW: "○",
    MEDIUM: "◐",
    HIGH: "●",
    BLOCKING: "⬤",
  };
  return icons[criticality] || "○";
}

export function getWorkstreamLabel(type: string): string {
  const labels: Record<string, string> = {
    DATE_SELECTION: "Sélection des dates",
    VISA_IMMIGRATION: "Visas & Immigration",
    FLIGHTS_TRANSFERS: "Vols & Transferts",
    HOTEL: "Hôtel",
    MEETING_ROOMS: "Salles de réunion",
    AV_TRANSLATION: "AV & Traduction",
    COMPANY_VISITS: "Visites d'entreprises",
    GROUND_TRANSPORT: "Transport terrestre",
    MEALS: "Restauration",
    ECOSYSTEM_EVENT: "Événement écosystème",
    IT_CONNECTIVITY: "IT & Connectivité",
    SECURITY: "Sécurité",
    BUDGET_CONTRACTS: "Budget & Contrats",
    COMMUNICATIONS: "Communications",
  };
  return labels[type] || type;
}

export function getFundLabel(fund: string): string {
  const labels: Record<string, string> = {
    IPAE_1: "IPAE I",
    IPAE_2: "IPAE II",
    IPAE_3: "IPAE III",
  };
  return labels[fund] || fund;
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    LP: "LP",
    AC_MEMBER: "Membre AC",
    AB_MEMBER: "Membre AB",
    IP_TEAM: "Équipe I&P",
    LOCAL_TEAM: "Équipe locale",
    ECOSYSTEM: "Écosystème",
  };
  return labels[role] || role;
}

export function calculateProgress(tasks: { status: string }[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === "DONE").length;
  return Math.round((done / tasks.length) * 100);
}
