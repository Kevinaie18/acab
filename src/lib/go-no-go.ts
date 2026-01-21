import type { EventWithRelations, GoNoGoCheck } from "@/types";

export function evaluateGoNoGo(event: EventWithRelations): GoNoGoCheck[] {
  const checks: GoNoGoCheck[] = [];

  // 1. All visas approved
  const participantsNeedingVisa = event.participants.filter((p) => p.needsVisa);
  const visasApproved = participantsNeedingVisa.filter((p) => p.visaStatus === "APPROVED");
  checks.push({
    id: "visas-approved",
    label: "Visas approuvés",
    description: "Tous les participants nécessitant un visa doivent l'avoir obtenu",
    severity: "blocker",
    passed: participantsNeedingVisa.length === 0 || visasApproved.length === participantsNeedingVisa.length,
    details:
      participantsNeedingVisa.length > 0
        ? `${visasApproved.length}/${participantsNeedingVisa.length} visas approuvés`
        : "Aucun visa requis",
  });

  // 2. Hotel contracted
  const hotelVendors = event.vendors.filter((v) => v.category === "HOTEL");
  const hotelContracted = hotelVendors.some((v) => v.contractSigned);
  checks.push({
    id: "hotel-contracted",
    label: "Hôtel contracté",
    description: "Au moins un hôtel doit avoir un contrat signé",
    severity: "blocker",
    passed: hotelContracted,
    details: hotelContracted
      ? `Contrat signé: ${hotelVendors.find((v) => v.contractSigned)?.name}`
      : "Aucun contrat hôtel signé",
  });

  // 3. AV & Translation confirmed
  const avVendors = event.vendors.filter((v) => v.category === "AV_EQUIPMENT" || v.category === "TRANSLATION");
  const avConfirmed = avVendors.length === 0 || avVendors.every((v) => v.contractSigned);
  checks.push({
    id: "av-confirmed",
    label: "AV & Traduction confirmés",
    description: "Équipements audiovisuels et traduction doivent être confirmés",
    severity: "blocker",
    passed: avConfirmed,
    details: avVendors.length > 0 ? `${avVendors.filter((v) => v.contractSigned).length}/${avVendors.length} confirmés` : "Non requis",
  });

  // 4. All LPs confirmed
  const lpParticipants = event.participants.filter((p) => p.role === "LP");
  const lpConfirmed = lpParticipants.filter((p) => p.rsvpStatus === "CONFIRMED");
  checks.push({
    id: "lp-confirmed",
    label: "LPs confirmés",
    description: "Tous les LPs doivent avoir confirmé leur participation",
    severity: "blocker",
    passed: lpParticipants.length === 0 || lpConfirmed.length === lpParticipants.length,
    details: lpParticipants.length > 0 ? `${lpConfirmed.length}/${lpParticipants.length} LPs confirmés` : "Aucun LP invité",
  });

  // 5. Company visits ready
  const visits = event.companyVisits;
  const visitsReady = visits.filter((v) => v.spaceConfirmed && v.deckReceived && v.runOfShowValidated);
  checks.push({
    id: "visits-ready",
    label: "Visites prêtes",
    description: "Toutes les visites d'entreprises doivent être préparées",
    severity: "warning",
    passed: visits.length === 0 || visitsReady.length === visits.length,
    details: visits.length > 0 ? `${visitsReady.length}/${visits.length} visites prêtes` : "Aucune visite planifiée",
  });

  // 6. Transport confirmed
  const transportVendors = event.vendors.filter((v) => v.category === "TRANSPORT");
  const transportConfirmed = transportVendors.some((v) => v.contractSigned);
  checks.push({
    id: "transport-confirmed",
    label: "Transport confirmé",
    description: "Au moins un prestataire transport doit être confirmé",
    severity: "warning",
    passed: transportVendors.length === 0 || transportConfirmed,
    details: transportConfirmed
      ? `Confirmé: ${transportVendors.find((v) => v.contractSigned)?.name}`
      : "Aucun transport confirmé",
  });

  // 7. No blocking tasks
  const allTasks = event.workstreams.flatMap((w) => w.tasks);
  const blockingTasks = allTasks.filter((t) => t.criticality === "BLOCKING" && t.status !== "DONE");
  checks.push({
    id: "no-blocking-tasks",
    label: "Pas de tâches bloquantes",
    description: "Aucune tâche critique bloquante ne doit rester ouverte",
    severity: "blocker",
    passed: blockingTasks.length === 0,
    details: blockingTasks.length > 0 ? `${blockingTasks.length} tâche(s) bloquante(s) en cours` : "Aucune tâche bloquante",
  });

  // 8. Budget within limits
  const totalPlanned = event.budgetPlanned || 0;
  const totalCommitted = event.budgetLines.reduce((sum, line) => sum + (line.amountCommitted || 0), 0);
  const budgetOverrun = totalCommitted > totalPlanned * 1.1; // 10% tolerance
  checks.push({
    id: "budget-ok",
    label: "Budget maîtrisé",
    description: "Le budget engagé ne doit pas dépasser 110% du budget prévu",
    severity: "warning",
    passed: !budgetOverrun,
    details: `Engagé: ${totalCommitted.toLocaleString()}€ / Prévu: ${totalPlanned.toLocaleString()}€`,
  });

  // 9. Date selected
  checks.push({
    id: "date-selected",
    label: "Date sélectionnée",
    description: "Une semaine doit être choisie pour l'événement",
    severity: "blocker",
    passed: event.selectedWeek !== null,
    details: event.selectedWeek ? `Semaine du ${event.selectedWeek.toLocaleDateString("fr-FR")}` : "Aucune date sélectionnée",
  });

  // 10. Meeting rooms confirmed
  const meetingRoomVendors = event.vendors.filter((v) => v.category === "HOTEL"); // Usually same as hotel
  const meetingRoomsTasks = event.workstreams
    .filter((w) => w.type === "MEETING_ROOMS")
    .flatMap((w) => w.tasks);
  const meetingRoomsReady = meetingRoomsTasks.length === 0 || meetingRoomsTasks.every((t) => t.status === "DONE");
  checks.push({
    id: "meeting-rooms-ready",
    label: "Salles de réunion prêtes",
    description: "Configuration des salles de réunion doit être finalisée",
    severity: "warning",
    passed: meetingRoomsReady,
    details: meetingRoomsTasks.length > 0
      ? `${meetingRoomsTasks.filter((t) => t.status === "DONE").length}/${meetingRoomsTasks.length} tâches complétées`
      : "Non configuré",
  });

  return checks;
}

export function canGoLive(checks: GoNoGoCheck[]): boolean {
  return checks.filter((c) => c.severity === "blocker").every((c) => c.passed);
}

export function getGoNoGoSummary(checks: GoNoGoCheck[]): {
  blockersPassed: number;
  blockersTotal: number;
  warningsPassed: number;
  warningsTotal: number;
  canGoLive: boolean;
} {
  const blockers = checks.filter((c) => c.severity === "blocker");
  const warnings = checks.filter((c) => c.severity === "warning");

  return {
    blockersPassed: blockers.filter((c) => c.passed).length,
    blockersTotal: blockers.length,
    warningsPassed: warnings.filter((c) => c.passed).length,
    warningsTotal: warnings.length,
    canGoLive: blockers.every((c) => c.passed),
  };
}
