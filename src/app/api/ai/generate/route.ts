import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GenerateRequest {
  action: string;
  context: Record<string, unknown>;
  language: "FR" | "EN";
}

const SYSTEM_PROMPTS: Record<string, string> = {
  "generate-rsvp-reminder": `Tu es un assistant professionnel pour I&P (Investisseurs & Partenaires), 
un fonds d'investissement à impact en Afrique. Tu aides à rédiger des emails de relance pour les 
participants aux Advisory Committees/Boards.

Règles:
- Ton professionnel mais chaleureux
- En français si language=FR, en anglais sinon
- Email court et direct
- Rappeler les dates et le lieu de l'événement
- Demander une confirmation de participation`,

  "generate-visa-letter": `Tu es un assistant professionnel pour I&P. Tu aides à rédiger des lettres 
d'invitation pour les demandes de visa des participants aux Advisory Committees/Boards.

Règles:
- Format lettre officielle
- Inclure toutes les informations requises (dates, lieu, objet)
- Ton formel et professionnel`,

  "generate-deck-request": `Tu es un assistant professionnel pour I&P. Tu aides à rédiger des emails 
pour demander aux entreprises du portefeuille d'envoyer leurs présentations pour les visites AC/AB.

Règles:
- Ton professionnel mais encourageant
- Rappeler la date limite
- Donner des indications sur le contenu attendu`,

  "generate-risk-analysis": `Tu es un assistant professionnel pour I&P. Tu analyses les risques 
opérationnels pour un événement AC/AB et produis une synthèse claire.

Règles:
- Identifier les points de blocage
- Prioriser par criticité
- Proposer des actions correctives`,
};

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { action, context, language } = body;

    const systemPrompt = SYSTEM_PROMPTS[action] || SYSTEM_PROMPTS["generate-rsvp-reminder"];
    
    const userPrompt = buildUserPrompt(action, context, language);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const content = response.content[0];
    const text = content.type === "text" ? content.text : "";

    return NextResponse.json({
      success: true,
      content: text,
      metadata: {
        tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
        model: response.model,
      },
    });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate content" },
      { status: 500 }
    );
  }
}

function buildUserPrompt(action: string, context: Record<string, unknown>, language: string): string {
  const lang = language === "FR" ? "français" : "anglais";

  switch (action) {
    case "generate-rsvp-reminder":
      return `Génère un email de relance RSVP en ${lang} pour:
- Participant: ${context.participantName}
- Organisation: ${context.organization}
- Événement: ${context.eventName}
- Dates: ${context.eventDates}
- Lieu: ${context.eventLocation}
- Date limite de réponse: ${context.deadline}`;

    case "generate-visa-letter":
      return `Génère une lettre d'invitation pour visa en ${lang} pour:
- Participant: ${context.participantName}
- Organisation: ${context.organization}
- Nationalité: ${context.nationality}
- Événement: ${context.eventName}
- Dates: ${context.eventDates}
- Lieu: ${context.eventLocation}
- Objet de la visite: Participation à l'Advisory Committee/Board`;

    case "generate-deck-request":
      return `Génère un email de demande de deck en ${lang} pour:
- Entreprise(s): ${context.companies}
- Événement: ${context.eventName}
- Date de la visite: ${context.visitDate}
- Date limite d'envoi du deck: ${context.deadline}
- Format attendu: PowerPoint, 15-20 slides`;

    case "generate-risk-analysis":
      return `Analyse les risques pour l'événement "${context.eventName}":
- Jours avant l'événement: ${context.daysUntil}
- Tâches bloquantes: ${JSON.stringify(context.blockingTasks)}
- Visas en attente: ${context.pendingVisas}
- Contrats non signés: ${JSON.stringify(context.unsignedContracts)}
- Budget: ${context.budgetStatus}

Produis une synthèse des risques et recommandations en ${lang}.`;

    default:
      return `Génère du contenu en ${lang} basé sur le contexte suivant: ${JSON.stringify(context)}`;
  }
}
