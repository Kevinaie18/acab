"use server";

import { db } from "@/db";
import { tasks, workstreams } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";
import { revalidatePath } from "next/cache";

// Types
type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "BLOCKED" | "DONE";
type Criticality = "LOW" | "MEDIUM" | "HIGH" | "BLOCKING";

export interface CreateTaskData {
  title: string;
  description?: string;
  deadline?: Date;
  status?: TaskStatus;
  criticality?: Criticality;
  proofUrl?: string;
  notes?: string;
  workstreamId: string;
  ownerId?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  deadline?: Date | null;
  status?: TaskStatus;
  criticality?: Criticality;
  proofUrl?: string;
  notes?: string;
  ownerId?: string;
}

// ============ GET TASKS ============

export async function getTasksByWorkstream(workstreamId: string) {
  try {
    const workstreamTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.workstreamId, workstreamId));
    
    return { success: true, data: workstreamTasks };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { success: false, error: "Failed to fetch tasks" };
  }
}

export async function getTasksByEvent(eventId: string) {
  try {
    // Get all workstreams for the event
    const eventWorkstreams = await db
      .select()
      .from(workstreams)
      .where(eq(workstreams.eventId, eventId));
    
    // Get all tasks for these workstreams
    const allTasks = [];
    for (const ws of eventWorkstreams) {
      const wsTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.workstreamId, ws.id));
      
      allTasks.push(...wsTasks.map(t => ({ ...t, workstreamType: ws.type })));
    }
    
    return { success: true, data: allTasks };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return { success: false, error: "Failed to fetch tasks" };
  }
}

export async function getTaskById(taskId: string) {
  try {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId));
    
    if (!task) {
      return { success: false, error: "Task not found" };
    }
    
    return { success: true, data: task };
  } catch (error) {
    console.error("Error fetching task:", error);
    return { success: false, error: "Failed to fetch task" };
  }
}

// ============ CREATE TASK ============

export async function createTask(data: CreateTaskData, eventId: string) {
  try {
    const taskId = generateId();
    
    await db.insert(tasks).values({
      id: taskId,
      title: data.title,
      description: data.description || null,
      deadline: data.deadline || null,
      status: data.status || "NOT_STARTED",
      criticality: data.criticality || "MEDIUM",
      proofUrl: data.proofUrl || null,
      notes: data.notes || null,
      workstreamId: data.workstreamId,
      ownerId: data.ownerId || null,
    });

    revalidatePath(`/events/${eventId}`);
    
    return { success: true, data: { id: taskId } };
  } catch (error) {
    console.error("Error creating task:", error);
    return { success: false, error: "Failed to create task" };
  }
}

// ============ UPDATE TASK ============

export async function updateTask(taskId: string, eventId: string, data: UpdateTaskData) {
  try {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.deadline !== undefined) updateData.deadline = data.deadline;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.criticality !== undefined) updateData.criticality = data.criticality;
    if (data.proofUrl !== undefined) updateData.proofUrl = data.proofUrl;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.ownerId !== undefined) updateData.ownerId = data.ownerId;

    await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, taskId));

    revalidatePath(`/events/${eventId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error updating task:", error);
    return { success: false, error: "Failed to update task" };
  }
}

// ============ UPDATE TASK STATUS ============

export async function updateTaskStatus(taskId: string, eventId: string, status: TaskStatus) {
  return updateTask(taskId, eventId, { status });
}

// ============ DELETE TASK ============

export async function deleteTask(taskId: string, eventId: string) {
  try {
    await db.delete(tasks).where(eq(tasks.id, taskId));
    
    revalidatePath(`/events/${eventId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    return { success: false, error: "Failed to delete task" };
  }
}

// ============ BULK ACTIONS ============

export async function bulkUpdateTasksStatus(
  taskIds: string[],
  eventId: string,
  status: TaskStatus
) {
  try {
    for (const id of taskIds) {
      await db
        .update(tasks)
        .set({ status, updatedAt: new Date() })
        .where(eq(tasks.id, id));
    }
    
    revalidatePath(`/events/${eventId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Error bulk updating tasks:", error);
    return { success: false, error: "Failed to update tasks" };
  }
}

// ============ GET BLOCKING TASKS ============

export async function getBlockingTasks(eventId: string) {
  try {
    const result = await getTasksByEvent(eventId);
    
    if (!result.success || !result.data) {
      return result;
    }
    
    const blockingTasks = result.data.filter(
      t => (t.criticality === "BLOCKING" || t.criticality === "HIGH") && t.status !== "DONE"
    );
    
    return { success: true, data: blockingTasks };
  } catch (error) {
    console.error("Error fetching blocking tasks:", error);
    return { success: false, error: "Failed to fetch blocking tasks" };
  }
}
