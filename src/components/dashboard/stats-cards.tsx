"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats } from "@/types";
import {
  CheckCircle2,
  AlertCircle,
  Users,
  Wallet,
  Calendar,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Tâches",
      value: `${stats.completedTasks}/${stats.totalTasks}`,
      subtitle: `${Math.round((stats.completedTasks / stats.totalTasks) * 100) || 0}% complétées`,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Bloquées",
      value: stats.blockedTasks.toString(),
      subtitle: `dont ${stats.criticalTasks} critiques`,
      icon: AlertCircle,
      color: stats.blockedTasks > 0 ? "text-red-600" : "text-gray-400",
      bgColor: stats.blockedTasks > 0 ? "bg-red-50" : "bg-gray-50",
    },
    {
      title: "Participants",
      value: `${stats.participantsConfirmed}/${stats.participantsTotal}`,
      subtitle: stats.visasPending > 0 ? `${stats.visasPending} visas en attente` : "Tous visas OK",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Budget",
      value: `${((stats.budgetCommitted / stats.budgetPlanned) * 100 || 0).toFixed(0)}%`,
      subtitle: `${stats.budgetCommitted.toLocaleString()}€ / ${stats.budgetPlanned.toLocaleString()}€`,
      icon: Wallet,
      color:
        stats.budgetCommitted > stats.budgetPlanned
          ? "text-red-600"
          : "text-purple-600",
      bgColor:
        stats.budgetCommitted > stats.budgetPlanned
          ? "bg-red-50"
          : "bg-purple-50",
    },
    {
      title: "Jour J",
      value:
        stats.daysUntilEvent !== null
          ? stats.daysUntilEvent > 0
            ? `J-${stats.daysUntilEvent}`
            : stats.daysUntilEvent === 0
            ? "Aujourd'hui"
            : `J+${Math.abs(stats.daysUntilEvent)}`
          : "-",
      subtitle: stats.daysUntilEvent !== null && stats.daysUntilEvent > 0 
        ? `${stats.daysUntilEvent} jour${stats.daysUntilEvent > 1 ? "s" : ""} restant${stats.daysUntilEvent > 1 ? "s" : ""}`
        : stats.daysUntilEvent === 0 
        ? "C'est maintenant !"
        : "Événement passé",
      icon: Calendar,
      color:
        stats.daysUntilEvent !== null && stats.daysUntilEvent <= 7
          ? "text-orange-600"
          : "text-indigo-600",
      bgColor:
        stats.daysUntilEvent !== null && stats.daysUntilEvent <= 7
          ? "bg-orange-50"
          : "bg-indigo-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", card.bgColor)}>
                <card.icon className={cn("h-5 w-5", card.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{card.title}</p>
                <p className="text-xl font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {card.subtitle}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
