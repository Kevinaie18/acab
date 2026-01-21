"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import type { Task, WorkstreamWithTasks } from "@/types";
import { formatDate, getStatusColor, getWorkstreamLabel, cn } from "@/lib/utils";

interface WorkstreamTasksListProps {
  workstream: WorkstreamWithTasks;
  eventId: string;
  onAddTask: (workstreamId: string, workstreamType: string) => void;
  onEditTask: (task: Task, workstreamType: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, status: string) => void;
}

export function WorkstreamTasksList({
  workstream,
  eventId,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onUpdateTaskStatus,
}: WorkstreamTasksListProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const tasks = workstream.tasks || [];
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const blockedTasks = tasks.filter((t) => t.status === "BLOCKED").length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: "success" | "warning" | "error" | "secondary" }> = {
      NOT_STARTED: { label: "Non démarrée", variant: "secondary" },
      IN_PROGRESS: { label: "En cours", variant: "warning" },
      BLOCKED: { label: "Bloquée", variant: "error" },
      DONE: { label: "Terminée", variant: "success" },
    };
    const { label, variant } = config[status] || config.NOT_STARTED;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getCriticalityIndicator = (criticality: string | null) => {
    if (!criticality) return null;
    const config: Record<string, { color: string; icon: boolean }> = {
      LOW: { color: "bg-gray-300", icon: false },
      MEDIUM: { color: "bg-yellow-400", icon: false },
      HIGH: { color: "bg-orange-500", icon: false },
      BLOCKING: { color: "bg-red-500", icon: true },
    };
    const { color, icon } = config[criticality] || config.MEDIUM;
    return (
      <div className="flex items-center gap-1">
        <div className={cn("w-2 h-2 rounded-full", color)} />
        {icon && <AlertTriangle className="h-3 w-3 text-red-500" />}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 hover:opacity-80"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
            <CardTitle className="text-base">
              {getWorkstreamLabel(workstream.type)}
            </CardTitle>
            <Badge variant="outline" className="ml-2">
              {completedTasks}/{tasks.length}
            </Badge>
            {blockedTasks > 0 && (
              <Badge variant="error" className="ml-1">
                {blockedTasks} bloquée(s)
              </Badge>
            )}
          </button>
          <div className="flex items-center gap-2">
            <Progress value={progress} className="w-24 h-2" />
            <span className="text-sm text-muted-foreground">{progress}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddTask(workstream.id, workstream.type)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          {tasks.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Aucune tâche. Cliquez sur + pour en ajouter.
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border",
                    task.status === "DONE" && "bg-green-50/50 border-green-200",
                    task.status === "BLOCKED" && "bg-red-50/50 border-red-200",
                    task.criticality === "BLOCKING" && task.status !== "DONE" && "border-red-300"
                  )}
                >
                  <Checkbox
                    checked={task.status === "DONE"}
                    onCheckedChange={(checked) =>
                      onUpdateTaskStatus(task.id, checked ? "DONE" : "NOT_STARTED")
                    }
                  />
                  
                  {getCriticalityIndicator(task.criticality)}

                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium",
                        task.status === "DONE" && "line-through text-muted-foreground"
                      )}
                    >
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {task.deadline && (
                      <span
                        className={cn(
                          "flex items-center gap-1 text-xs",
                          new Date(task.deadline) < new Date() && task.status !== "DONE"
                            ? "text-red-600"
                            : "text-muted-foreground"
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        {formatDate(task.deadline)}
                      </span>
                    )}

                    {task.proofUrl && (
                      <a
                        href={task.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}

                    {getStatusBadge(task.status)}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onEditTask(task, workstream.type)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onUpdateTaskStatus(task.id, "IN_PROGRESS")}
                        >
                          En cours
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onUpdateTaskStatus(task.id, "BLOCKED")}
                        >
                          Bloquée
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteTask(task.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
