"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { GoNoGoChecklist } from "@/components/events/go-no-go-checklist";
import { WorkstreamHeatmap } from "@/components/events/workstream-heatmap";
import { BlockingTasksList } from "@/components/dashboard/blocking-tasks-list";
import { AICopilot } from "@/components/ai/copilot";
import { ParticipantsTable } from "@/components/participants/participants-table";
import { ParticipantForm, type ParticipantFormData } from "@/components/participants/participant-form";
import { WorkstreamTasksList } from "@/components/tasks/workstream-tasks-list";
import { TaskForm, type TaskFormData } from "@/components/tasks/task-form";
import { getEventById, updateEvent } from "@/lib/actions/events";
import {
  createParticipant,
  updateParticipant,
  updateParticipantRsvp,
  deleteParticipant,
} from "@/lib/actions/participants";
import { createTask, updateTask, updateTaskStatus, deleteTask } from "@/lib/actions/tasks";
import { evaluateGoNoGo, canGoLive as checkCanGoLive } from "@/lib/go-no-go";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  Settings,
  Download,
  Users,
  Wallet,
  Building,
  ListTodo,
  Plus,
  Loader2,
} from "lucide-react";
import { getFundLabel, formatDate, getWorkstreamLabel, daysUntil } from "@/lib/utils";
import type {
  DashboardStats,
  WorkstreamProgress,
  AISuggestion,
  Task,
  Participant,
  EventWithRelations,
  WorkstreamWithTasks,
} from "@/types";

export default function EventPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<EventWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [isParticipantFormOpen, setIsParticipantFormOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);

  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedWorkstream, setSelectedWorkstream] = useState<{ id: string; type: string } | null>(null);

  const loadEvent = useCallback(async () => {
    setIsLoading(true);
    const result = await getEventById(eventId);
    if (result.success && result.data) {
      setEvent(result.data as EventWithRelations);
    }
    setIsLoading(false);
  }, [eventId]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Événement non trouvé</p>
        <Link href="/" className="text-blue-600 hover:underline mt-2 inline-block">
          Retour au tableau de bord
        </Link>
      </div>
    );
  }

  const allTasks = event.workstreams.flatMap((ws) => ws.tasks || []);
  const stats: DashboardStats = {
    totalTasks: allTasks.length,
    completedTasks: allTasks.filter((t) => t.status === "DONE").length,
    blockedTasks: allTasks.filter((t) => t.status === "BLOCKED").length,
    criticalTasks: allTasks.filter((t) => t.criticality === "BLOCKING" && t.status !== "DONE").length,
    participantsConfirmed: event.participants.filter((p) => p.rsvpStatus === "CONFIRMED").length,
    participantsTotal: event.participants.length,
    visasPending: event.participants.filter((p) => p.needsVisa && p.visaStatus !== "APPROVED").length,
    budgetPlanned: event.budgetPlanned || 0,
    budgetCommitted: event.budgetLines.reduce((sum, l) => sum + (l.amountCommitted || 0), 0),
    budgetPaid: event.budgetLines.reduce((sum, l) => sum + (l.amountPaid || 0), 0),
    daysUntilEvent: event.selectedWeek ? daysUntil(event.selectedWeek) : null,
  };

  const workstreamProgress: WorkstreamProgress[] = event.workstreams.map((ws) => {
    const tasks = ws.tasks || [];
    const completed = tasks.filter((t) => t.status === "DONE").length;
    const blocked = tasks.filter((t) => t.status === "BLOCKED").length;
    const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
    let status: "on-track" | "at-risk" | "blocked" | "complete" = "on-track";
    if (progress === 100) status = "complete";
    else if (blocked > 0) status = "blocked";
    else if (progress < 50 && stats.daysUntilEvent && stats.daysUntilEvent < 14) status = "at-risk";
    return { type: ws.type, label: getWorkstreamLabel(ws.type), totalTasks: tasks.length, completedTasks: completed, blockedTasks: blocked, progress, status };
  });

  const blockingTasks = allTasks
    .filter((t) => (t.criticality === "BLOCKING" || t.criticality === "HIGH") && t.status !== "DONE")
    .map((t) => {
      const ws = event.workstreams.find((w) => w.id === t.workstreamId);
      return { ...t, workstreamType: ws?.type || "", ownerName: "" };
    });

  const goNoGoChecks = evaluateGoNoGo(event);
  const canGoLive = checkCanGoLive(goNoGoChecks);

  const aiSuggestions: AISuggestion[] = [];
  const pendingRsvps = event.participants.filter((p) => p.rsvpStatus === "PENDING");
  if (pendingRsvps.length > 0) {
    aiSuggestions.push({ id: "rsvp", priority: 10, label: `Relancer ${pendingRsvps.length} participant(s)`, description: "RSVP en attente", action: "generate-rsvp-reminder", context: {} });
  }
  const pendingVisas = event.participants.filter((p) => p.needsVisa && p.visaStatus === "PENDING");
  if (pendingVisas.length > 0) {
    aiSuggestions.push({ id: "visa", priority: 9, label: `Suivre ${pendingVisas.length} visa(s)`, description: "Visas en attente", action: "generate-visa-letter", context: {} });
  }

  const handleAIAction = async (suggestion: AISuggestion): Promise<string> => {
    await new Promise((r) => setTimeout(r, 1500));
    return `Email généré pour: ${suggestion.label}\n\nObjet: ${event.name}\n\nContenu à personnaliser...`;
  };

  const handleGoLive = async () => {
    await updateEvent(eventId, { status: "LIVE" });
    await loadEvent();
  };

  const handleCreateParticipant = async (data: ParticipantFormData) => {
    await createParticipant({ ...data, eventId, role: data.role as any, language: data.language as any, visaStatus: data.visaStatus as any, rsvpStatus: data.rsvpStatus as any });
    await loadEvent();
  };

  const handleUpdateParticipant = async (data: ParticipantFormData) => {
    if (!editingParticipant) return;
    await updateParticipant(editingParticipant.id, eventId, data as any);
    await loadEvent();
  };

  const handleDeleteParticipant = async (participantId: string) => {
    if (confirm("Supprimer ce participant ?")) {
      await deleteParticipant(participantId, eventId);
      await loadEvent();
    }
  };

  const handleUpdateRsvp = async (participantId: string, status: string) => {
    await updateParticipantRsvp(participantId, eventId, status as any);
    await loadEvent();
  };

  const handleAddTask = (workstreamId: string, workstreamType: string) => {
    setEditingTask(null);
    setSelectedWorkstream({ id: workstreamId, type: workstreamType });
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: Task, workstreamType: string) => {
    setEditingTask(task);
    setSelectedWorkstream({ id: task.workstreamId, type: workstreamType });
    setIsTaskFormOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Supprimer cette tâche ?")) {
      await deleteTask(taskId, eventId);
      await loadEvent();
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    await updateTaskStatus(taskId, eventId, status as any);
    await loadEvent();
  };

  const handleSubmitTask = async (data: TaskFormData) => {
    if (editingTask) {
      await updateTask(editingTask.id, eventId, { title: data.title, description: data.description || undefined, deadline: data.deadline ? new Date(data.deadline) : null, status: data.status as any, criticality: data.criticality as any, proofUrl: data.proofUrl || undefined, notes: data.notes || undefined });
    } else if (selectedWorkstream) {
      await createTask({ title: data.title, description: data.description || undefined, deadline: data.deadline ? new Date(data.deadline) : undefined, status: data.status as any, criticality: data.criticality as any, proofUrl: data.proofUrl || undefined, notes: data.notes || undefined, workstreamId: selectedWorkstream.id }, eventId);
    }
    await loadEvent();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{event.name}</h1>
            <Badge variant={event.status === "LIVE" ? "success" : event.status === "LOCKED" ? "info" : "secondary"}>{event.status}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Building2 className="h-4 w-4" />{getFundLabel(event.fund)}</span>
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{event.city}, {event.country}</span>
            {event.selectedWeek && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(event.selectedWeek)}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Exports</Button>
          <Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-2" />Paramètres</Button>
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="tasks"><ListTodo className="h-4 w-4 mr-1" />Tâches</TabsTrigger>
              <TabsTrigger value="participants"><Users className="h-4 w-4 mr-1" />Participants</TabsTrigger>
              <TabsTrigger value="budget"><Wallet className="h-4 w-4 mr-1" />Budget</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <WorkstreamHeatmap workstreams={workstreamProgress} onWorkstreamClick={() => setActiveTab("tasks")} />
              <BlockingTasksList tasks={blockingTasks} onTaskClick={() => setActiveTab("tasks")} />
            </TabsContent>

            <TabsContent value="tasks" className="mt-6 space-y-4">
              {event.workstreams.map((ws) => (
                <WorkstreamTasksList key={ws.id} workstream={ws as WorkstreamWithTasks} eventId={eventId} onAddTask={handleAddTask} onEditTask={handleEditTask} onDeleteTask={handleDeleteTask} onUpdateTaskStatus={handleUpdateTaskStatus} />
              ))}
            </TabsContent>

            <TabsContent value="participants" className="mt-6">
              <div className="flex justify-end mb-4">
                <Button onClick={() => { setEditingParticipant(null); setIsParticipantFormOpen(true); }}><Plus className="h-4 w-4 mr-2" />Ajouter</Button>
              </div>
              <ParticipantsTable participants={event.participants} onEdit={(p) => { setEditingParticipant(p); setIsParticipantFormOpen(true); }} onDelete={handleDeleteParticipant} onUpdateRsvp={handleUpdateRsvp} onUpdateVisa={() => {}} onGenerateEmail={() => {}} />
            </TabsContent>

            <TabsContent value="budget" className="mt-6">
              <div className="text-center py-12 text-muted-foreground">
                <Wallet className="h-12 w-12 mx-auto mb-3" />
                <p>Budget: {stats.budgetCommitted.toLocaleString()}€ / {stats.budgetPlanned.toLocaleString()}€</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <GoNoGoChecklist checks={goNoGoChecks} canGoLive={canGoLive} eventStatus={event.status} onGoLive={handleGoLive} onForceGoLive={() => handleGoLive()} />
          <AICopilot suggestions={aiSuggestions} onExecuteAction={handleAIAction} />
        </div>
      </div>

      <ParticipantForm open={isParticipantFormOpen} onOpenChange={setIsParticipantFormOpen} participant={editingParticipant} eventId={eventId} onSubmit={editingParticipant ? handleUpdateParticipant : handleCreateParticipant} />
      {selectedWorkstream && <TaskForm open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen} task={editingTask} workstreamId={selectedWorkstream.id} workstreamType={selectedWorkstream.type} eventId={eventId} onSubmit={handleSubmitTask} />}
    </div>
  );
}
