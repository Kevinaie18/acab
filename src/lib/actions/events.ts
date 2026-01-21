"use server";

import { db } from "@/db";
import { events, participants, workstreams, tasks, vendors, companyVisits, budgetLines, users, WORKSTREAM_TYPES } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";
import { revalidatePath } from "next/cache";

// ============ GET EVENTS ============

export async function getEvents() {
  try {
    const allEvents = await db.select().from(events);
    return { success: true, data: allEvents };
  } catch (error) {
    console.error("Error fetching events:", error);
    return { success: false, error: "Failed to fetch events" };
  }
}

export async function getEventById(eventId: string) {
  try {
    const [event] = await db.select().from(events).where(eq(events.id, eventId));
    
    if (!event) {
      return { success: false, error: "Event not found" };
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

    return {
      success: true,
      data: {
        ...event,
        participants: eventParticipants,
        workstreams: workstreamsWithTasks,
        vendors: eventVendors,
        companyVisits: eventVisits,
        budgetLines: eventBudget,
      },
    };
  } catch (error) {
    console.error("Error fetching event:", error);
    return { success: false, error: "Failed to fetch event" };
  }
}

// ============ CREATE EVENT ============

export async function createEvent(data: {
  name: string;
  fund: "IPAE_1" | "IPAE_2" | "IPAE_3";
  country: string;
  city: string;
  selectedWeek?: Date;
  budgetPlanned?: number;
  notes?: string;
  ownerId?: string;
}) {
  try {
    const eventId = generateId();
    
    await db.insert(events).values({
      id: eventId,
      name: data.name,
      fund: data.fund,
      country: data.country,
      city: data.city,
      selectedWeek: data.selectedWeek || null,
      status: "DRAFT",
      budgetPlanned: data.budgetPlanned || 0,
      notes: data.notes || null,
      ownerId: data.ownerId || null,
    });

    // Create default workstreams
    for (const wsType of WORKSTREAM_TYPES) {
      await db.insert(workstreams).values({
        id: generateId(),
        type: wsType,
        eventId: eventId,
      });
    }

    revalidatePath("/");
    revalidatePath("/events");
    
    return { success: true, data: { id: eventId } };
  } catch (error) {
    console.error("Error creating event:", error);
    return { success: false, error: "Failed to create event" };
  }
}

// ============ UPDATE EVENT ============

export async function updateEvent(
  eventId: string,
  data: Partial<{
    name: string;
    fund: "IPAE_1" | "IPAE_2" | "IPAE_3";
    country: string;
    city: string;
    selectedWeek: Date | null;
    status: "DRAFT" | "LOCKED" | "LIVE" | "CLOSED";
    budgetPlanned: number;
    notes: string;
  }>
) {
  try {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.fund !== undefined) updateData.fund = data.fund;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.selectedWeek !== undefined) updateData.selectedWeek = data.selectedWeek;
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === "LOCKED") updateData.lockedAt = new Date();
      if (data.status === "CLOSED") updateData.closedAt = new Date();
    }
    if (data.budgetPlanned !== undefined) updateData.budgetPlanned = data.budgetPlanned;
    if (data.notes !== undefined) updateData.notes = data.notes;

    await db.update(events).set(updateData).where(eq(events.id, eventId));

    revalidatePath(`/events/${eventId}`);
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating event:", error);
    return { success: false, error: "Failed to update event" };
  }
}

// ============ DELETE EVENT ============

export async function deleteEvent(eventId: string) {
  try {
    await db.delete(events).where(eq(events.id, eventId));
    
    revalidatePath("/");
    revalidatePath("/events");
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting event:", error);
    return { success: false, error: "Failed to delete event" };
  }
}
