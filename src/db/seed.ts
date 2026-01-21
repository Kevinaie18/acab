import { db } from "./index";
import {
  users,
  events,
  participants,
  workstreams,
  tasks,
  vendors,
  companyVisits,
  budgetLines,
  WORKSTREAM_TYPES,
} from "./schema";
import { generateId } from "@/lib/utils";

const DEMO_USERS = [
  { id: "user-1", email: "sarah.dupont@investisseurs-partenaires.com", name: "Sarah Dupont", role: "INVESTMENT_MANAGER" as const },
  { id: "user-2", email: "amadou.diallo@ip-senegal.com", name: "Amadou Diallo", role: "LOCAL_TEAM" as const },
  { id: "user-3", email: "claire.martin@investisseurs-partenaires.com", name: "Claire Martin", role: "TOP_MANAGEMENT" as const },
];

const DEMO_EVENT = {
  id: "event-1",
  name: "IPAE 2 - Advisory Committee Dakar",
  fund: "IPAE_2" as const,
  country: "Sénégal",
  city: "Dakar",
  selectedWeek: new Date("2025-03-10"),
  status: "LOCKED" as const,
  budgetPlanned: 85000,
  notes: "AC annuel avec visite de 3 sociétés en portefeuille",
  ownerId: "user-1",
};

const DEMO_PARTICIPANTS = [
  { name: "Jean-Michel Severino", organization: "Meridiam", role: "LP" as const, email: "jm.severino@meridiam.com", language: "FR" as const, needsVisa: false, rsvpStatus: "CONFIRMED" as const },
  { name: "Olivier Lafourcade", organization: "Proparco", role: "LP" as const, email: "o.lafourcade@proparco.fr", language: "FR" as const, needsVisa: false, rsvpStatus: "CONFIRMED" as const },
  { name: "Thomas Hübner", organization: "DEG", role: "LP" as const, email: "t.hubner@deg.de", language: "EN" as const, needsVisa: true, visaStatus: "APPROVED" as const, rsvpStatus: "CONFIRMED" as const },
  { name: "Maria Santos", organization: "BIO", role: "LP" as const, email: "m.santos@bio.be", language: "EN" as const, needsVisa: true, visaStatus: "PENDING" as const, rsvpStatus: "CONFIRMED" as const },
  { name: "Ahmed Benali", organization: "FMO", role: "AC_MEMBER" as const, email: "a.benali@fmo.nl", language: "FR" as const, needsVisa: true, visaStatus: "SUBMITTED" as const, rsvpStatus: "TENTATIVE" as const },
  { name: "Sophie Mercier", organization: "Fondation Grameen", role: "AC_MEMBER" as const, email: "s.mercier@grameen.org", language: "FR" as const, needsVisa: false, rsvpStatus: "PENDING" as const },
];

const DEMO_VENDORS = [
  { category: "HOTEL" as const, name: "Radisson Blu Dakar", contactName: "Fatou Ndiaye", contactEmail: "f.ndiaye@radissonblu.com", contactPhone: "+221 33 869 3333", quoteReceived: true, contractSigned: true, status: "CONTRACTED" as const },
  { category: "TRANSPORT" as const, name: "Dakar Elite Transport", contactName: "Moussa Fall", contactEmail: "m.fall@dakar-elite.sn", contactPhone: "+221 77 123 4567", quoteReceived: true, contractSigned: false, status: "NEGOTIATING" as const },
  { category: "AV_EQUIPMENT" as const, name: "TechSound Sénégal", contactName: "Ibrahima Sy", contactEmail: "i.sy@techsound.sn", contactPhone: "+221 77 890 1234", quoteReceived: true, contractSigned: true, status: "CONTRACTED" as const },
  { category: "TRANSLATION" as const, name: "LinguaAfrique", contactName: "Aïssatou Diop", contactEmail: "a.diop@linguaafrique.com", contactPhone: "+221 77 567 8901", quoteReceived: false, contractSigned: false, status: "QUOTE_REQUESTED" as const },
  { category: "RESTAURANT" as const, name: "Le Lagon 2", contactName: "Pierre Mendy", contactEmail: "p.mendy@lelagon2.sn", contactPhone: "+221 33 821 5555", quoteReceived: true, contractSigned: true, status: "CONTRACTED" as const },
];

const DEMO_VISITS = [
  { companyName: "Kirène", portfolioStatus: "CURRENT" as const, address: "Route de Rufisque, Dakar", maxCapacity: 25, spaceConfirmed: true, deckReceived: true, runOfShowValidated: false, siteContactName: "Mamadou Sow", siteContactPhone: "+221 77 111 2222", presentationLanguage: "FR" as const },
  { companyName: "COFINA", portfolioStatus: "CURRENT" as const, address: "Plateau, Dakar", maxCapacity: 30, spaceConfirmed: true, deckReceived: false, runOfShowValidated: false, siteContactName: "Aminata Ba", siteContactPhone: "+221 77 333 4444", presentationLanguage: "FR" as const },
  { companyName: "Oragroup", portfolioStatus: "EXITED" as const, address: "Avenue Pompidou, Dakar", maxCapacity: 20, spaceConfirmed: false, deckReceived: false, runOfShowValidated: false, siteContactName: "Cheikh Diallo", siteContactPhone: "+221 77 555 6666", presentationLanguage: "EN" as const },
];

const DEFAULT_TASKS: Record<string, { title: string; criticality: string; deadline?: number }[]> = {
  DATE_SELECTION: [
    { title: "Envoyer sondage de dates aux LPs", criticality: "HIGH", deadline: -60 },
    { title: "Collecter les réponses", criticality: "MEDIUM", deadline: -50 },
    { title: "Valider la semaine retenue", criticality: "BLOCKING", deadline: -45 },
  ],
  VISA_IMMIGRATION: [
    { title: "Identifier les participants nécessitant un visa", criticality: "HIGH", deadline: -45 },
    { title: "Envoyer les lettres d'invitation", criticality: "BLOCKING", deadline: -40 },
    { title: "Suivre les demandes de visa", criticality: "HIGH", deadline: -20 },
    { title: "Confirmer tous les visas approuvés", criticality: "BLOCKING", deadline: -7 },
  ],
  FLIGHTS_TRANSFERS: [
    { title: "Collecter les itinéraires de vol", criticality: "HIGH", deadline: -21 },
    { title: "Organiser les accueils aéroport", criticality: "MEDIUM", deadline: -14 },
    { title: "Confirmer les transferts retour", criticality: "MEDIUM", deadline: -7 },
  ],
  HOTEL: [
    { title: "Négocier le contrat hôtel", criticality: "BLOCKING", deadline: -45 },
    { title: "Envoyer la rooming list préliminaire", criticality: "MEDIUM", deadline: -21 },
    { title: "Confirmer les attributions de chambres", criticality: "HIGH", deadline: -7 },
    { title: "Vérifier les late check-out", criticality: "LOW", deadline: -3 },
  ],
  MEETING_ROOMS: [
    { title: "Réserver la salle principale", criticality: "BLOCKING", deadline: -30 },
    { title: "Valider le plan de salle", criticality: "MEDIUM", deadline: -14 },
    { title: "Commander la signalétique", criticality: "LOW", deadline: -7 },
  ],
  AV_TRANSLATION: [
    { title: "Sélectionner le prestataire AV", criticality: "HIGH", deadline: -30 },
    { title: "Confirmer les interprètes FR/EN", criticality: "BLOCKING", deadline: -21 },
    { title: "Tester l'équipement sur site", criticality: "HIGH", deadline: -1 },
  ],
  COMPANY_VISITS: [
    { title: "Confirmer les 3 visites d'entreprise", criticality: "BLOCKING", deadline: -30 },
    { title: "Collecter les decks de présentation", criticality: "HIGH", deadline: -14 },
    { title: "Valider les run-of-show", criticality: "HIGH", deadline: -7 },
    { title: "Briefer les CEOs", criticality: "MEDIUM", deadline: -3 },
  ],
  GROUND_TRANSPORT: [
    { title: "Sélectionner le prestataire transport", criticality: "HIGH", deadline: -30 },
    { title: "Planifier les itinéraires", criticality: "MEDIUM", deadline: -14 },
    { title: "Confirmer les véhicules et chauffeurs", criticality: "HIGH", deadline: -7 },
  ],
  MEALS: [
    { title: "Collecter les restrictions alimentaires", criticality: "MEDIUM", deadline: -21 },
    { title: "Réserver les restaurants", criticality: "HIGH", deadline: -21 },
    { title: "Valider les menus", criticality: "MEDIUM", deadline: -7 },
  ],
  ECOSYSTEM_EVENT: [
    { title: "Définir le format de l'événement", criticality: "MEDIUM", deadline: -45 },
    { title: "Envoyer les invitations", criticality: "HIGH", deadline: -30 },
    { title: "Confirmer le protocole", criticality: "MEDIUM", deadline: -14 },
  ],
  IT_CONNECTIVITY: [
    { title: "Commander les cartes SIM locales", criticality: "MEDIUM", deadline: -14 },
    { title: "Tester le WiFi salle de réunion", criticality: "HIGH", deadline: -1 },
  ],
  SECURITY: [
    { title: "Évaluer les risques sécuritaires", criticality: "HIGH", deadline: -30 },
    { title: "Briefer l'équipe sur les procédures", criticality: "MEDIUM", deadline: -7 },
  ],
  BUDGET_CONTRACTS: [
    { title: "Établir le budget prévisionnel", criticality: "BLOCKING", deadline: -60 },
    { title: "Valider tous les contrats", criticality: "HIGH", deadline: -14 },
    { title: "Préparer les avances de caisse", criticality: "MEDIUM", deadline: -7 },
  ],
  COMMUNICATIONS: [
    { title: "Envoyer le save-the-date", criticality: "HIGH", deadline: -60 },
    { title: "Envoyer le programme détaillé", criticality: "HIGH", deadline: -14 },
    { title: "Préparer le participant pack", criticality: "MEDIUM", deadline: -7 },
  ],
};

export async function seed() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await db.delete(budgetLines);
  await db.delete(companyVisits);
  await db.delete(vendors);
  await db.delete(tasks);
  await db.delete(workstreams);
  await db.delete(participants);
  await db.delete(events);
  await db.delete(users);

  // Insert users
  for (const user of DEMO_USERS) {
    await db.insert(users).values(user);
  }
  console.log("✓ Users created");

  // Insert event
  await db.insert(events).values(DEMO_EVENT);
  console.log("✓ Event created");

  // Insert participants
  for (const participant of DEMO_PARTICIPANTS) {
    await db.insert(participants).values({
      id: generateId(),
      ...participant,
      eventId: DEMO_EVENT.id,
    });
  }
  console.log("✓ Participants created");

  // Insert vendors
  for (const vendor of DEMO_VENDORS) {
    await db.insert(vendors).values({
      id: generateId(),
      ...vendor,
      eventId: DEMO_EVENT.id,
    });
  }
  console.log("✓ Vendors created");

  // Insert company visits
  for (const visit of DEMO_VISITS) {
    await db.insert(companyVisits).values({
      id: generateId(),
      ...visit,
      eventId: DEMO_EVENT.id,
    });
  }
  console.log("✓ Company visits created");

  // Insert workstreams and tasks
  const eventDate = DEMO_EVENT.selectedWeek;
  for (const wsType of WORKSTREAM_TYPES) {
    const wsId = generateId();
    await db.insert(workstreams).values({
      id: wsId,
      type: wsType,
      ownerId: wsType.includes("VISA") || wsType.includes("FLIGHT") ? "user-2" : "user-1",
      eventId: DEMO_EVENT.id,
    });

    const wsTasks = DEFAULT_TASKS[wsType] || [];
    for (const task of wsTasks) {
      const deadline = task.deadline
        ? new Date(eventDate.getTime() + task.deadline * 24 * 60 * 60 * 1000)
        : null;

      // Simulate some tasks as done, some in progress
      const random = Math.random();
      let status: "NOT_STARTED" | "IN_PROGRESS" | "DONE" | "BLOCKED" = "NOT_STARTED";
      if (deadline && deadline < new Date()) {
        status = random > 0.3 ? "DONE" : random > 0.1 ? "IN_PROGRESS" : "BLOCKED";
      } else if (random > 0.7) {
        status = "IN_PROGRESS";
      }

      await db.insert(tasks).values({
        id: generateId(),
        title: task.title,
        criticality: task.criticality as "LOW" | "MEDIUM" | "HIGH" | "BLOCKING",
        deadline,
        status,
        workstreamId: wsId,
        ownerId: Math.random() > 0.5 ? "user-1" : "user-2",
      });
    }
  }
  console.log("✓ Workstreams and tasks created");

  // Insert budget lines
  const budgetData = [
    { workstreamType: "HOTEL" as const, description: "Hébergement 6 nuits", amountPlanned: 25000, amountCommitted: 24500 },
    { workstreamType: "FLIGHTS_TRANSFERS" as const, description: "Transferts aéroport", amountPlanned: 3000, amountCommitted: 2800 },
    { workstreamType: "GROUND_TRANSPORT" as const, description: "Transport terrestre", amountPlanned: 8000, amountCommitted: 7500 },
    { workstreamType: "AV_TRANSLATION" as const, description: "Équipement AV + Interprètes", amountPlanned: 12000, amountCommitted: 11000 },
    { workstreamType: "MEALS" as const, description: "Restauration", amountPlanned: 15000, amountCommitted: 14000 },
    { workstreamType: "ECOSYSTEM_EVENT" as const, description: "Cocktail networking", amountPlanned: 8000, amountCommitted: 0 },
    { workstreamType: "IT_CONNECTIVITY" as const, description: "Cartes SIM + WiFi", amountPlanned: 1500, amountCommitted: 1200 },
    { workstreamType: "SECURITY" as const, description: "Sécurité additionnelle", amountPlanned: 5000, amountCommitted: 0 },
    { workstreamType: "COMMUNICATIONS" as const, description: "Signalétique + Goodies", amountPlanned: 3500, amountCommitted: 2000 },
  ];

  for (const line of budgetData) {
    await db.insert(budgetLines).values({
      id: generateId(),
      ...line,
      eventId: DEMO_EVENT.id,
    });
  }
  console.log("✓ Budget lines created");

  console.log("🎉 Seed completed!");
}

// Run seed if executed directly
seed().catch(console.error);
