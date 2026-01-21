"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Task } from "@/types";
import { AlertTriangle, Clock, ArrowRight, User } from "lucide-react";
import { formatDate, getStatusColor, getWorkstreamLabel, cn } from "@/lib/utils";

interface BlockingTasksListProps {
  tasks: (Task & { workstreamType?: string; ownerName?: string })[];
  onTaskClick?: (taskId: string) => void;
}

export function BlockingTasksList({ tasks, onTaskClick }: BlockingTasksListProps) {
  const sortedTasks = [...tasks].sort((a, b) => {
    const order: Record<string, number> = { BLOCKING: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return (order[a.criticality || "LOW"] || 3) - (order[b.criticality || "LOW"] || 3);
  });

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Tâches critiques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-green-500" />
            <p>Aucune tâche bloquante ou critique</p>
            <p className="text-sm">Tout est sous contrôle !</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Tâches critiques
          </CardTitle>
          <Badge variant="error">{tasks.length} en attente</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedTasks.slice(0, 5).map((task) => (
            <div
              key={task.id}
              className={cn(
                "p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent",
                task.criticality === "BLOCKING" && "border-red-200 bg-red-50/50",
                task.criticality === "HIGH" && "border-orange-200 bg-orange-50/50"
              )}
              onClick={() => onTaskClick?.(task.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{task.title}</p>
                  {task.workstreamType && (
                    <p className="text-xs text-muted-foreground">
                      {getWorkstreamLabel(task.workstreamType)}
                    </p>
                  )}
                </div>
                <Badge className={getStatusColor(task.criticality || "MEDIUM")}>
                  {task.criticality}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                {task.deadline && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(task.deadline)}
                  </span>
                )}
                {task.ownerName && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {task.ownerName}
                  </span>
                )}
                <span className={cn("ml-auto", getStatusColor(task.status))}>
                  {task.status === "NOT_STARTED" && "Non démarrée"}
                  {task.status === "IN_PROGRESS" && "En cours"}
                  {task.status === "BLOCKED" && "Bloquée"}
                </span>
              </div>
            </div>
          ))}
          {tasks.length > 5 && (
            <Button variant="ghost" className="w-full" size="sm">
              Voir les {tasks.length - 5} autres tâches
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
