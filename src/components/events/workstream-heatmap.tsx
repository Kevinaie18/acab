"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { WorkstreamProgress } from "@/types";
import { getWorkstreamLabel, cn } from "@/lib/utils";
import {
  Calendar,
  Plane,
  Hotel,
  Users,
  Mic2,
  Building2,
  Car,
  UtensilsCrossed,
  Globe,
  Wifi,
  Shield,
  Wallet,
  MessageSquare,
  FileCheck,
} from "lucide-react";

const workstreamIcons: Record<string, React.ReactNode> = {
  DATE_SELECTION: <Calendar className="h-4 w-4" />,
  VISA_IMMIGRATION: <FileCheck className="h-4 w-4" />,
  FLIGHTS_TRANSFERS: <Plane className="h-4 w-4" />,
  HOTEL: <Hotel className="h-4 w-4" />,
  MEETING_ROOMS: <Users className="h-4 w-4" />,
  AV_TRANSLATION: <Mic2 className="h-4 w-4" />,
  COMPANY_VISITS: <Building2 className="h-4 w-4" />,
  GROUND_TRANSPORT: <Car className="h-4 w-4" />,
  MEALS: <UtensilsCrossed className="h-4 w-4" />,
  ECOSYSTEM_EVENT: <Globe className="h-4 w-4" />,
  IT_CONNECTIVITY: <Wifi className="h-4 w-4" />,
  SECURITY: <Shield className="h-4 w-4" />,
  BUDGET_CONTRACTS: <Wallet className="h-4 w-4" />,
  COMMUNICATIONS: <MessageSquare className="h-4 w-4" />,
};

interface WorkstreamHeatmapProps {
  workstreams: WorkstreamProgress[];
  onWorkstreamClick?: (type: string) => void;
}

export function WorkstreamHeatmap({
  workstreams,
  onWorkstreamClick,
}: WorkstreamHeatmapProps) {
  const getStatusColor = (status: WorkstreamProgress["status"]) => {
    switch (status) {
      case "complete":
        return "bg-green-100 border-green-300 hover:bg-green-200";
      case "on-track":
        return "bg-blue-50 border-blue-200 hover:bg-blue-100";
      case "at-risk":
        return "bg-yellow-50 border-yellow-200 hover:bg-yellow-100";
      case "blocked":
        return "bg-red-50 border-red-200 hover:bg-red-100";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const getStatusBadge = (status: WorkstreamProgress["status"]) => {
    switch (status) {
      case "complete":
        return <Badge variant="success">Terminé</Badge>;
      case "on-track":
        return <Badge variant="info">En cours</Badge>;
      case "at-risk":
        return <Badge variant="warning">À risque</Badge>;
      case "blocked":
        return <Badge variant="error">Bloqué</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Avancement par workstream</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {workstreams.map((ws) => (
            <button
              key={ws.type}
              onClick={() => onWorkstreamClick?.(ws.type)}
              className={cn(
                "p-3 rounded-lg border text-left transition-colors",
                getStatusColor(ws.status)
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-muted-foreground">
                  {workstreamIcons[ws.type]}
                </span>
                <span className="text-xs font-medium truncate flex-1">
                  {ws.label}
                </span>
              </div>
              <Progress
                value={ws.progress}
                className="h-1.5 mb-2"
                indicatorClassName={cn(
                  ws.status === "complete" && "bg-green-600",
                  ws.status === "on-track" && "bg-blue-600",
                  ws.status === "at-risk" && "bg-yellow-600",
                  ws.status === "blocked" && "bg-red-600"
                )}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {ws.completedTasks}/{ws.totalTasks}
                </span>
                {ws.blockedTasks > 0 && (
                  <span className="text-xs text-red-600 font-medium">
                    {ws.blockedTasks} bloquée(s)
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
