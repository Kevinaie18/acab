"use server";

import { db } from "@/db";
import { participants } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { generateId } from "@/lib/utils";
import { revalidatePath } from "next/cache";

// Types
type ParticipantRole = "LP" | "AC_MEMBER" | "AB_MEMBER" | "IP_TEAM" | "LOCAL_TEAM" | "ECOSYSTEM";
type Language = "FR" | "EN";
type VisaStatus = "NOT_NEEDED" | "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";
type RsvpStatus = "PENDING" | "CONFIRMED" | "DECLINED" | "TENTATIVE";

export interface CreateParticipantData {
  name: string;
  organization: string;
  role: ParticipantRole;
  email: string;
  language?: Language;
  needsVisa?: boolean;
  visaStatus?: VisaStatus;
  flightArrival?: string;
  flightDeparture?: string;
  dietaryRestrictions?: string;
  specialNeeds?: string;
  hotelAssigned?: string;
  rsvpStatus?: RsvpStatus;
  eventId: string;
}

export interface UpdateParticipantData {
  name?: string;
  organization?: string;
  role?: ParticipantRole;
  email?: string;
  language?: Language;
  needsVisa?: boolean;
  visaStatus?: VisaStatus;
  flightArrival?: string;
  flightDeparture?: string;
  dietaryRestrictions?: string;
  specialNeeds?: string;
  hotelAssigned?: string;
  rsvpStatus?: RsvpStatus;
}

// ============ GET PARTICIPANTS ============

export async function getParticipantsByEvent(eventId: string) {
  try {
    const eventParticipants = await db
      .select()
      .from(participants)
      .where(eq(participants.eventId, eventId));
    
    return { success: true, data: eventParticipants };
  } catch (error) {
    console.error("Error fetching participants:", error);
    return { success: false, error: "Failed to fetch participants" };
  }
}

export async function getParticipantById(participantId: string) {
  try {
    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.id, participantId));
    
    if (!participant) {
      return { success: false, error: "Participant not found" };
    }
    
    return { success: true, data: participant };
  } catch (error) {
    console.error("Error fetching participant:", error);
    return { success: false, error: "Failed to fetch participant" };
  }
}

// ============ CREATE PARTICIPANT ============

export async function createParticipant(data: CreateParticipantData) {
  try {
    const participantId = generateId();
    
    await db.insert(participants).values({
      id: participantId,
      name: data.name,
      organization: data.organization,
      role: data.role,
      email: data.email,
      language: data.language || "EN",
      needsVisa: data.needsVisa || false,
      visaStatus: data.visaStatus || null,
      flightArrival: data.flightArrival || null,
      flightDeparture: data.flightDeparture || null,
      dietaryRestrictions: data.dietaryRestrictions || null,
      specialNeeds: data.specialNeeds || null,
      hotelAssigned: data.hotelAssigned || null,
      rsvpStatus: data.rsvpStatus || "PENDING",
      eventId: data.eventId,
    });

    revalidatePath(`/events/${data.eventId}`);
    revalidatePath(`/events/${data.eventId}/participants`);
    
    return { success: true, data: { id: participantId } };
  } catch (error) {
    console.error("Error creating participant:", error);
    return { success: false, error: "Failed to create participant" };
  }
}

// ============ UPDATE PARTICIPANT ============

export async function updateParticipant(participantId: string, eventId: string, data: UpdateParticipantData) {
  try {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.organization !== undefined) updateData.organization = data.organization;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.needsVisa !== undefined) updateData.needsVisa = data.needsVisa;
    if (data.visaStatus !== undefined) updateData.visaStatus = data.visaStatus;
    if (data.flightArrival !== undefined) updateData.flightArrival = data.flightArrival;
    if (data.flightDeparture !== undefined) updateData.flightDeparture = data.flightDeparture;
    if (data.dietaryRestrictions !== undefined) updateData.dietaryRestrictions = data.dietaryRestrictions;
    if (data.specialNeeds !== undefined) updateData.specialNeeds = data.specialNeeds;
    if (data.hotelAssigned !== undefined) updateData.hotelAssigned = data.hotelAssigned;
    if (data.rsvpStatus !== undefined) updateData.rsvpStatus = data.rsvpStatus;

    await db
      .update(participants)
      .set(updateData)
      .where(eq(participants.id, participantId));

    revalidatePath(`/events/${eventId}`);
    revalidatePath(`/events/${eventId}/participants`);
    
    return { success: true };
  } catch (error) {
    console.error("Error updating participant:", error);
    return { success: false, error: "Failed to update participant" };
  }
}

// ============ UPDATE RSVP STATUS ============

export async function updateParticipantRsvp(participantId: string, eventId: string, rsvpStatus: RsvpStatus) {
  return updateParticipant(participantId, eventId, { rsvpStatus });
}

// ============ UPDATE VISA STATUS ============

export async function updateParticipantVisa(participantId: string, eventId: string, visaStatus: VisaStatus) {
  return updateParticipant(participantId, eventId, { visaStatus });
}

// ============ DELETE PARTICIPANT ============

export async function deleteParticipant(participantId: string, eventId: string) {
  try {
    await db.delete(participants).where(eq(participants.id, participantId));
    
    revalidatePath(`/events/${eventId}`);
    revalidatePath(`/events/${eventId}/participants`);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting participant:", error);
    return { success: false, error: "Failed to delete participant" };
  }
}

// ============ BULK ACTIONS ============

export async function bulkUpdateParticipantsRsvp(
  participantIds: string[],
  eventId: string,
  rsvpStatus: RsvpStatus
) {
  try {
    for (const id of participantIds) {
      await db
        .update(participants)
        .set({ rsvpStatus, updatedAt: new Date() })
        .where(eq(participants.id, id));
    }
    
    revalidatePath(`/events/${eventId}`);
    revalidatePath(`/events/${eventId}/participants`);
    
    return { success: true };
  } catch (error) {
    console.error("Error bulk updating participants:", error);
    return { success: false, error: "Failed to update participants" };
  }
}
