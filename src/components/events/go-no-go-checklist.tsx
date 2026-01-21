"use client";

import { CheckCircle2, XCircle, AlertTriangle, Lock, Unlock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { GoNoGoCheck } from "@/types";
import { cn } from "@/lib/utils";

interface GoNoGoChecklistProps {
  checks: GoNoGoCheck[];
  canGoLive: boolean;
  eventStatus: string;
  onGoLive?: () => void;
  onForceGoLive?: (reason: string) => void;
}

export function GoNoGoChecklist({
  checks,
  canGoLive,
  eventStatus,
  onGoLive,
  onForceGoLive,
}: GoNoGoChecklistProps) {
  const blockers = checks.filter((c) => c.severity === "blocker");
  const warnings = checks.filter((c) => c.severity === "warning");

  const blockersPassed = blockers.filter((c) => c.passed).length;
  const warningsPassed = warnings.filter((c) => c.passed).length;

  const overallProgress = Math.round(
    ((blockersPassed + warningsPassed) / checks.length) * 100
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {canGoLive ? (
              <Unlock className="h-5 w-5 text-green-600" />
            ) : (
              <Lock className="h-5 w-5 text-red-600" />
            )}
            Go / No-Go Checklist
          </CardTitle>
          <Badge variant={canGoLive ? "success" : "error"}>
            {canGoLive ? "Prêt" : "Non prêt"}
          </Badge>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <Progress value={overallProgress} className="flex-1" />
          <span className="text-sm text-muted-foreground font-medium">
            {overallProgress}%
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Blockers */}
        <div>
          <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Critères bloquants ({blockersPassed}/{blockers.length})
          </h4>
          <div className="space-y-2">
            {blockers.map((check) => (
              <CheckItem key={check.id} check={check} />
            ))}
          </div>
        </div>

        {/* Warnings */}
        <div>
          <h4 className="text-sm font-semibold text-yellow-700 mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Avertissements ({warningsPassed}/{warnings.length})
          </h4>
          <div className="space-y-2">
            {warnings.map((check) => (
              <CheckItem key={check.id} check={check} />
            ))}
          </div>
        </div>

        {/* Actions */}
        {eventStatus === "LOCKED" && (
          <div className="pt-4 border-t flex gap-2">
            {canGoLive ? (
              <Button onClick={onGoLive} className="flex-1">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Passer en LIVE
              </Button>
            ) : (
              <Button
                variant="outline"
                className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                onClick={() => {
                  const reason = window.prompt(
                    "Raison du passage en force :"
                  );
                  if (reason) onForceGoLive?.(reason);
                }}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Forcer le passage (avec justification)
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CheckItem({ check }: { check: GoNoGoCheck }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-2 rounded-lg",
        check.passed ? "bg-green-50" : "bg-red-50"
      )}
    >
      {check.passed ? (
        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium",
            check.passed ? "text-green-800" : "text-red-800"
          )}
        >
          {check.label}
        </p>
        {check.details && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {check.details}
          </p>
        )}
      </div>
    </div>
  );
}
