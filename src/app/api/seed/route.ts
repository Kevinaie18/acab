import { db } from "@/db";
import { users, events, participants, workstreams, tasks, vendors, companyVisits, budgetLines } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const existingEvents = await db.select().from(events);
    if (existingEvents.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Des donnees existent deja. Utilisez le bouton Reinitialiser." 
      });
    }
    await seedDatabase();
    return NextResponse.json({ success: true, message: "Donnees de demo creees avec succes!" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";
    if (force) {
      await db.delete(tasks);
      await db.delete(workstreams);
      await db.delete(participants);
      await db.delete(vendors);
      await db.delete(companyVisits);
      await db.delete(budgetLines);
      await db.delete(events);
      await db.delete(users);
    }
    await seedDatabase();
    return NextResponse.json({ success: true, message: "Donnees de demo creees avec succes!" });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

async function seedDatabase() {
  await db.insert(users).values([
    { id: "user-1", email: "sarah.dupont@ip.com", name: "Sarah Dupont", role: "INVESTMENT_MANAGER" },
    { id: "user-2", email: "amadou.diallo@ip.com", name: "Amadou Diallo", role: "LOCAL_TEAM" },
  ]);

  const eventDate = new Date("2025-03-10");
  await db.insert(events).values({
    id: "event-1",
    name: "IPAE 2 - Advisory Committee Dakar",
    fund: "IPAE_2",
    country: "Senegal",
    city: "Dakar",
    selectedWeek: eventDate,
    status: "LOCKED",
    budgetPlanned: 85000,
    ownerId: "user-1",
  });

  await db.insert(participants).values([
    { id: "p-1", name: "Jean-Michel Severino", organization: "Meridiam", role: "LP", email: "jm.severino@meridiam.com", language: "FR", needsVisa: false, rsvpStatus: "CONFIRMED", eventId: "event-1" },
    { id: "p-2", name: "Thomas Hubner", organization: "DEG", role: "LP", email: "t.hubner@deg.de", language: "EN", needsVisa: true, visaStatus: "APPROVED", flightArrival: "LH 542 - 09/03 18:30", rsvpStatus: "CONFIRMED", eventId: "event-1" },
    { id: "p-3", name: "Maria Santos", organization: "BIO", role: "LP", email: "m.santos@bio.be", language: "EN", needsVisa: true, visaStatus: "PENDING", rsvpStatus: "CONFIRMED", eventId: "event-1" },
    { id: "p-4", name: "Aminata Toure", organization: "Proparco", role: "LP", email: "a.toure@proparco.fr", language: "FR", needsVisa: false, flightArrival: "AF 718 - 10/03 14:30", rsvpStatus: "CONFIRMED", eventId: "event-1" },
    { id: "p-5", name: "Ahmed Benali", organization: "Expert Independant", role: "AC_MEMBER", email: "a.benali@gmail.com", language: "FR", needsVisa: true, visaStatus: "APPROVED", rsvpStatus: "TENTATIVE", eventId: "event-1" },
    { id: "p-6", name: "Sophie Mercier", organization: "Fondation Grameen", role: "AC_MEMBER", email: "s.mercier@grameen.org", language: "FR", needsVisa: false, rsvpStatus: "PENDING", eventId: "event-1" },
  ]);

  const workstreamTypes = [
    "DATE_SELECTION", "VISA_IMMIGRATION", "FLIGHTS_TRANSFERS", "HOTEL",
    "MEETING_ROOMS", "AV_TRANSLATION", "COMPANY_VISITS", "GROUND_TRANSPORT",
    "MEALS", "ECOSYSTEM_EVENT", "IT_CONNECTIVITY", "SECURITY",
    "BUDGET_CONTRACTS", "COMMUNICATIONS"
  ];

  for (let i = 0; i < workstreamTypes.length; i++) {
    await db.insert(workstreams).values({
      id: `ws-${i + 1}`,
      type: workstreamTypes[i],
      eventId: "event-1",
    });
  }

  const tasksData = [
    { id: "t-1", title: "Proposer 3 semaines aux LPs", status: "DONE", criticality: "HIGH", workstreamId: "ws-1" },
    { id: "t-2", title: "Collecter les disponibilites", status: "DONE", criticality: "BLOCKING", workstreamId: "ws-1" },
    { id: "t-3", title: "Confirmer la semaine finale", status: "DONE", criticality: "BLOCKING", workstreamId: "ws-1" },
    { id: "t-4", title: "Identifier participants necessitant visa", status: "DONE", criticality: "HIGH", workstreamId: "ws-2" },
    { id: "t-5", title: "Envoyer lettres invitation", status: "DONE", criticality: "BLOCKING", workstreamId: "ws-2" },
    { id: "t-6", title: "Suivre demandes de visa", status: "IN_PROGRESS", criticality: "HIGH", workstreamId: "ws-2" },
    { id: "t-7", title: "Confirmer tous les visas approuves", status: "BLOCKED", criticality: "BLOCKING", workstreamId: "ws-2" },
    { id: "t-8", title: "Negocier contrat hotel", status: "DONE", criticality: "BLOCKING", workstreamId: "ws-4" },
    { id: "t-9", title: "Envoyer rooming list preliminaire", status: "DONE", criticality: "MEDIUM", workstreamId: "ws-4" },
    { id: "t-10", title: "Confirmer attributions chambres", status: "IN_PROGRESS", criticality: "HIGH", workstreamId: "ws-4" },
    { id: "t-11", title: "Verifier late check-out", status: "NOT_STARTED", criticality: "LOW", workstreamId: "ws-4" },
    { id: "t-12", title: "Sourcer prestataires AV", status: "DONE", criticality: "HIGH", workstreamId: "ws-6" },
    { id: "t-13", title: "Confirmer interpretes FR/EN", status: "IN_PROGRESS", criticality: "BLOCKING", workstreamId: "ws-6" },
    { id: "t-14", title: "Tester equipements", status: "NOT_STARTED", criticality: "HIGH", workstreamId: "ws-6" },
    { id: "t-15", title: "Selectionner 3 entreprises", status: "DONE", criticality: "HIGH", workstreamId: "ws-7" },
    { id: "t-16", title: "Confirmer dates avec les CEOs", status: "DONE", criticality: "BLOCKING", workstreamId: "ws-7" },
    { id: "t-17", title: "Collecter les decks de presentation", status: "IN_PROGRESS", criticality: "HIGH", workstreamId: "ws-7" },
    { id: "t-18", title: "Organiser la logistique transport", status: "NOT_STARTED", criticality: "MEDIUM", workstreamId: "ws-7" },
    { id: "t-19", title: "Finaliser le budget previsionnel", status: "DONE", criticality: "HIGH", workstreamId: "ws-13" },
    { id: "t-20", title: "Valider avec le Top Management", status: "DONE", criticality: "BLOCKING", workstreamId: "ws-13" },
    { id: "t-21", title: "Suivre les engagements", status: "IN_PROGRESS", criticality: "MEDIUM", workstreamId: "ws-13" },
  ];

  for (const task of tasksData) {
    await db.insert(tasks).values(task);
  }

  await db.insert(vendors).values([
    { id: "v-1", name: "Radisson Blu Dakar", serviceType: "HOTEL", contactName: "Mamadou Ndiaye", contactEmail: "mndiaye@radisson.com", status: "CONTRACTED", amountContracted: 35000, eventId: "event-1" },
    { id: "v-2", name: "Dakar Events AV", serviceType: "AV_EQUIPMENT", contactName: "Ibrahima Fall", contactEmail: "ifall@dakarevents.sn", status: "CONFIRMED", amountContracted: 8000, eventId: "event-1" },
    { id: "v-3", name: "Elite Transport", serviceType: "TRANSPORT", contactName: "Ousmane Diop", contactEmail: "contact@elitetransport.sn", status: "NEGOTIATING", amountQuoted: 5000, eventId: "event-1" },
  ]);

  await db.insert(companyVisits).values([
    { id: "cv-1", companyName: "Kirene", sector: "FMCG", contactName: "Abdoulaye Sy", contactEmail: "asy@kirene.sn", visitDate: new Date("2025-03-11"), location: "Zone Industrielle Dakar", deckReceived: true, logisticsConfirmed: true, readinessScore: 90, eventId: "event-1" },
    { id: "cv-2", companyName: "COFINA", sector: "Finance", contactName: "Fatou Diallo", contactEmail: "fdiallo@cofina.com", visitDate: new Date("2025-03-12"), location: "Plateau, Dakar", deckReceived: false, logisticsConfirmed: false, readinessScore: 40, eventId: "event-1" },
    { id: "cv-3", companyName: "Oragroup", sector: "Banking", contactName: "Patrick Mestrallet", contactEmail: "pmestrallet@oragroup.com", visitDate: new Date("2025-03-13"), location: "Almadies, Dakar", deckReceived: false, logisticsConfirmed: true, readinessScore: 60, eventId: "event-1" },
  ]);

  await db.insert(budgetLines).values([
    { id: "bl-1", category: "HOTEL", description: "Hebergement Radisson Blu (6 nuits)", amountPlanned: 35000, amountCommitted: 35000, amountPaid: 17500, eventId: "event-1", vendorId: "v-1" },
    { id: "bl-2", category: "AV_EQUIPMENT", description: "Equipement audiovisuel et traduction", amountPlanned: 10000, amountCommitted: 8000, amountPaid: 0, eventId: "event-1", vendorId: "v-2" },
    { id: "bl-3", category: "TRANSPORT", description: "Transferts aeroport et visites", amountPlanned: 6000, amountCommitted: 0, amountPaid: 0, eventId: "event-1" },
    { id: "bl-4", category: "MEALS", description: "Restauration (dejeuners, diners)", amountPlanned: 12000, amountCommitted: 8000, amountPaid: 4000, eventId: "event-1" },
    { id: "bl-5", category: "FLIGHTS", description: "Vols equipe IP", amountPlanned: 8000, amountCommitted: 6500, amountPaid: 3000, eventId: "event-1" },
    { id: "bl-6", category: "MISC", description: "Divers et imprevus", amountPlanned: 14000, amountCommitted: 5500, amountPaid: 0, eventId: "event-1" },
  ]);
}