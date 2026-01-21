import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { events, participants, workstreams, tasks, vendors, companyVisits, budgetLines } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET /api/events/[eventId] - Récupère un événement avec toutes ses relations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    
    // Fetch event
    const [event] = await db.select().from(events).where(eq(events.id, eventId));
    
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Fetch related data
    const eventParticipants = await db.select().from(participants).where(eq(participants.eventId, eventId));
    const eventWorkstreams = await db.select().from(workstreams).where(eq(workstreams.eventId, eventId));
    const eventVendors = await db.select().from(vendors).where(eq(vendors.eventId, eventId));
    const eventVisits = await db.select().from(companyVisits).where(eq(companyVisits.eventId, eventId));
    const eventBudget = await db.select().from(budgetLines).where(eq(budgetLines.eventId, eventId));

    // Fetch tasks for each workstream
    const workstreamsWithTasks = await Promise.all(
      eventWorkstreams.map(async (ws) => {
        const wsTasks = await db.select().from(tasks).where(eq(tasks.workstreamId, ws.id));
        return { ...ws, tasks: wsTasks };
      })
    );

    return NextResponse.json({
      ...event,
      participants: eventParticipants,
      workstreams: workstreamsWithTasks,
      vendors: eventVendors,
      companyVisits: eventVisits,
      budgetLines: eventBudget,
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

// PATCH /api/events/[eventId] - Met à jour un événement
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Only update provided fields
    if (body.name !== undefined) updateData.name = body.name;
    if (body.fund !== undefined) updateData.fund = body.fund;
    if (body.country !== undefined) updateData.country = body.country;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.selectedWeek !== undefined) updateData.selectedWeek = body.selectedWeek ? new Date(body.selectedWeek) : null;
    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === "LOCKED") updateData.lockedAt = new Date();
      if (body.status === "CLOSED") updateData.closedAt = new Date();
    }
    if (body.budgetPlanned !== undefined) updateData.budgetPlanned = body.budgetPlanned;
    if (body.notes !== undefined) updateData.notes = body.notes;

    await db.update(events).set(updateData).where(eq(events.id, eventId));

    const [updatedEvent] = await db.select().from(events).where(eq(events.id, eventId));
    
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

// DELETE /api/events/[eventId] - Supprime un événement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    
    await db.delete(events).where(eq(events.id, eventId));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
