import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events, participants, workstreams, tasks, vendors, companyVisits, budgetLines } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";

// GET /api/events - Liste tous les événements
export async function GET() {
  try {
    const allEvents = await db.select().from(events);
    return NextResponse.json(allEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

// POST /api/events - Crée un nouvel événement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newEvent = {
      id: generateId(),
      name: body.name,
      fund: body.fund,
      country: body.country,
      city: body.city,
      candidateDates: body.candidateDates ? JSON.stringify(body.candidateDates) : null,
      selectedWeek: body.selectedWeek ? new Date(body.selectedWeek) : null,
      status: "DRAFT" as const,
      budgetPlanned: body.budgetPlanned || 0,
      notes: body.notes || null,
      ownerId: body.ownerId || null,
    };

    await db.insert(events).values(newEvent);
    
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
