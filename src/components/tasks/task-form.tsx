"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { Task } from "@/types";
import { getWorkstreamLabel } from "@/lib/utils";

const TASK_STATUSES = [
  { value: "NOT_STARTED", label: "Non démarrée" },
  { value: "IN_PROGRESS", label: "En cours" },
  { value: "BLOCKED", label: "Bloquée" },
  { value: "DONE", label: "Terminée" },
];

const CRITICALITIES = [
  { value: "LOW", label: "Basse" },
  { value: "MEDIUM", label: "Moyenne" },
  { value: "HIGH", label: "Haute" },
  { value: "BLOCKING", label: "Bloquante" },
];

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  workstreamId: string;
  workstreamType: string;
  eventId: string;
  onSubmit: (data: TaskFormData) => Promise<void>;
}

export interface TaskFormData {
  title: string;
  description: string;
  deadline: string;
  status: string;
  criticality: string;
  proofUrl: string;
  notes: string;
  workstreamId: string;
}

export function TaskForm({
  open,
  onOpenChange,
  task,
  workstreamId,
  workstreamType,
  eventId,
  onSubmit,
}: TaskFormProps) {
  const isEditing = !!task;
  const [isLoading, setIsLoading] = useState(false);

  const formatDateForInput = (date: Date | null | undefined) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState<TaskFormData>({
    title: task?.title || "",
    description: task?.description || "",
    deadline: formatDateForInput(task?.deadline),
    status: task?.status || "NOT_STARTED",
    criticality: task?.criticality || "MEDIUM",
    proofUrl: task?.proofUrl || "",
    notes: task?.notes || "",
    workstreamId: workstreamId,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = <K extends keyof TaskFormData>(
    field: K,
    value: TaskFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier la tâche" : "Nouvelle tâche"}
          </DialogTitle>
          <DialogDescription>
            Workstream: {getWorkstreamLabel(workstreamType)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Ex: Confirmer les réservations hôtel"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Détails de la tâche..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">Date limite</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => updateField("deadline", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="criticality">Criticité</Label>
              <Select
                value={formData.criticality}
                onValueChange={(value) => updateField("criticality", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CRITICALITIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Statut</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => updateField("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proofUrl">Lien de preuve (optionnel)</Label>
            <Input
              id="proofUrl"
              type="url"
              value={formData.proofUrl}
              onChange={(e) => updateField("proofUrl", e.target.value)}
              placeholder="https://drive.google.com/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Notes additionnelles..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
