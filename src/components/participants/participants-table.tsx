"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Mail,
  FileText,
  Plane,
  Check,
  X,
} from "lucide-react";
import type { Participant } from "@/types";
import { getStatusColor, getRoleLabel } from "@/lib/utils";

interface ParticipantsTableProps {
  participants: Participant[];
  onEdit: (participant: Participant) => void;
  onDelete: (participantId: string) => void;
  onUpdateRsvp: (participantId: string, status: string) => void;
  onUpdateVisa: (participantId: string, status: string) => void;
  onGenerateEmail: (participant: Participant, type: string) => void;
}

export function ParticipantsTable({
  participants,
  onEdit,
  onDelete,
  onUpdateRsvp,
  onUpdateVisa,
  onGenerateEmail,
}: ParticipantsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === participants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(participants.map((p) => p.id));
    }
  };

  const getRsvpBadge = (status: string | null) => {
    const variants: Record<string, "success" | "warning" | "error" | "secondary"> = {
      CONFIRMED: "success",
      PENDING: "warning",
      DECLINED: "error",
      TENTATIVE: "secondary",
    };
    const labels: Record<string, string> = {
      CONFIRMED: "Confirmé",
      PENDING: "En attente",
      DECLINED: "Décliné",
      TENTATIVE: "Incertain",
    };
    return (
      <Badge variant={variants[status || "PENDING"] || "secondary"}>
        {labels[status || "PENDING"] || status}
      </Badge>
    );
  };

  const getVisaBadge = (needsVisa: boolean | null, status: string | null) => {
    if (!needsVisa) {
      return <span className="text-muted-foreground text-sm">-</span>;
    }
    const variants: Record<string, "success" | "warning" | "error" | "info" | "secondary"> = {
      APPROVED: "success",
      PENDING: "warning",
      SUBMITTED: "info",
      REJECTED: "error",
      NOT_NEEDED: "secondary",
    };
    const labels: Record<string, string> = {
      APPROVED: "Approuvé",
      PENDING: "En attente",
      SUBMITTED: "Soumis",
      REJECTED: "Refusé",
      NOT_NEEDED: "Non requis",
    };
    return (
      <Badge variant={variants[status || "PENDING"] || "warning"}>
        {labels[status || "PENDING"] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedIds.length} sélectionné(s)
          </span>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-1" />
            Envoyer un email
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              selectedIds.forEach((id) => onUpdateRsvp(id, "CONFIRMED"));
              setSelectedIds([]);
            }}
          >
            <Check className="h-4 w-4 mr-1" />
            Marquer confirmés
          </Button>
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedIds.length === participants.length &&
                    participants.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Organisation</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>RSVP</TableHead>
              <TableHead>Visa</TableHead>
              <TableHead>Vol</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {participants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Aucun participant pour le moment
                </TableCell>
              </TableRow>
            ) : (
              participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(participant.id)}
                      onCheckedChange={() => toggleSelect(participant.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{participant.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {participant.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{participant.organization}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getRoleLabel(participant.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>{getRsvpBadge(participant.rsvpStatus)}</TableCell>
                  <TableCell>
                    {getVisaBadge(participant.needsVisa, participant.visaStatus)}
                  </TableCell>
                  <TableCell>
                    {participant.flightArrival ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Plane className="h-3 w-3" />
                        <span className="truncate max-w-[100px]">
                          {participant.flightArrival}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(participant)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            onGenerateEmail(participant, "rsvp-reminder")
                          }
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Générer email RSVP
                        </DropdownMenuItem>
                        {participant.needsVisa && (
                          <DropdownMenuItem
                            onClick={() =>
                              onGenerateEmail(participant, "visa-letter")
                            }
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Générer lettre visa
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Changer RSVP</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => onUpdateRsvp(participant.id, "CONFIRMED")}
                        >
                          <Check className="h-4 w-4 mr-2 text-green-600" />
                          Confirmé
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onUpdateRsvp(participant.id, "DECLINED")}
                        >
                          <X className="h-4 w-4 mr-2 text-red-600" />
                          Décliné
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(participant.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
