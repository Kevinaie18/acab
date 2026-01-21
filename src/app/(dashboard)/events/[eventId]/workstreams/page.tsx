"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { WorkstreamTasksList } from "@/components/tasks/workstream-tasks-list";
import { TaskForm, type TaskFormData } from "@/components/tasks/task-form";
import { getEventById } from "@/lib/actions/events";
import { createTask, updateTask, updateTaskStatus, deleteTask } from "@/lib/actions/tasks";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { Task, WorkstreamWithTasks } from "@/types";

export default function WorkstreamsPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const [workstreams, setWorkstreams] = useState<WorkstreamWithTasks[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedWorkstream, setSelectedWorkstream] = useState<{
    id: string;
    type: string;
  } | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const result = await getEventById(eventId);
    if (result.success && result.data) {
      setWorkstreams(result.data.workstreams as WorkstreamWithTasks[]);
    }
    setIsLoading(false);
  }, [eventId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter workstreams based on search and status
  const filteredWorkstreams = workstreams.map((ws) => {
    let filteredTasks = ws.tasks || [];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredTasks = filteredTasks.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          (t.description && t.description.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== "ALL") {
      filteredTasks = filteredTasks.filter((t) => t.status === statusFilter);
    }

    return { ...ws, tasks: filteredTasks };
  });

  // Only show workstreams with matching tasks when filtering
  const visibleWorkstreams =
    searchTerm || statusFilter !== "ALL"
      ? filteredWorkstreams.filter((ws) => ws.tasks.length > 0)
      : filteredWorkstreams;

  const handleAddTask = (workstreamId: string, workstreamType: string) => {
    setEditingTask(null);
    setSelectedWorkstream({ id: workstreamId, type: workstreamType });
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task, workstreamType: string) => {
    setEditingTask(task);
    setSelectedWorkstream({ id: task.workstreamId, type: workstreamType });
    setIsFormOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
      await deleteTask(taskId, eventId);
      await loadData();
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    await updateTaskStatus(
      taskId,
      eventId,
      status as "NOT_STARTED" | "IN_PROGRESS" | "BLOCKED" | "DONE"
    );
    await loadData();
  };

  const handleSubmitTask = async (data: TaskFormData) => {
    if (editingTask) {
      await updateTask(editingTask.id, eventId, {
        title: data.title,
        description: data.description || undefined,
        deadline: data.deadline ? new Date(data.deadline) : null,
        status: data.status as "NOT_STARTED" | "IN_PROGRESS" | "BLOCKED" | "DONE",
        criticality: data.criticality as "LOW" | "MEDIUM" | "HIGH" | "BLOCKING",
        proofUrl: data.proofUrl || undefined,
        notes: data.notes || undefined,
      });
    } else if (selectedWorkstream) {
      await createTask(
        {
          title: data.title,
          description: data.description || undefined,
          deadline: data.deadline ? new Date(data.deadline) : undefined,
          status: data.status as "NOT_STARTED" | "IN_PROGRESS" | "BLOCKED" | "DONE",
          criticality: data.criticality as "LOW" | "MEDIUM" | "HIGH" | "BLOCKING",
          proofUrl: data.proofUrl || undefined,
          notes: data.notes || undefined,
          workstreamId: selectedWorkstream.id,
        },
        eventId
      );
    }
    await loadData();
  };

  // Stats
  const allTasks = workstreams.flatMap((ws) => ws.tasks || []);
  const stats = {
    total: allTasks.length,
    done: allTasks.filter((t) => t.status === "DONE").length,
    blocked: allTasks.filter((t) => t.status === "BLOCKED").length,
    blocking: allTasks.filter(
      (t) => t.criticality === "BLOCKING" && t.status !== "DONE"
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Workstreams & Tâches</h2>
          <p className="text-sm text-muted-foreground">
            {stats.done}/{stats.total} tâches complétées
            {stats.blocked > 0 && ` • ${stats.blocked} bloquées`}
            {stats.blocking > 0 && ` • ${stats.blocking} critiques`}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une tâche..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les statuts</SelectItem>
            <SelectItem value="NOT_STARTED">Non démarrées</SelectItem>
            <SelectItem value="IN_PROGRESS">En cours</SelectItem>
            <SelectItem value="BLOCKED">Bloquées</SelectItem>
            <SelectItem value="DONE">Terminées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Workstreams List */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Chargement...
        </div>
      ) : visibleWorkstreams.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Aucune tâche trouvée
        </div>
      ) : (
        <div className="space-y-4">
          {visibleWorkstreams.map((workstream) => (
            <WorkstreamTasksList
              key={workstream.id}
              workstream={workstream}
              eventId={eventId}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
            />
          ))}
        </div>
      )}

      {/* Task Form Dialog */}
      {selectedWorkstream && (
        <TaskForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          task={editingTask}
          workstreamId={selectedWorkstream.id}
          workstreamType={selectedWorkstream.type}
          eventId={eventId}
          onSubmit={handleSubmitTask}
        />
      )}
    </div>
  );
}
