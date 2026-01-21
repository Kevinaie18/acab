"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ParticipantsTable } from "@/components/participants/participants-table";
import { ParticipantForm, type ParticipantFormData } from "@/components/participants/participant-form";
import {
  getParticipantsByEvent,
  createParticipant,
  updateParticipant,
  updateParticipantRsvp,
  deleteParticipant,
} from "@/lib/actions/participants";
import { Plus, Search, Download, Users } from "lucide-react";
import type { Participant } from "@/types";

export default function ParticipantsPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [rsvpFilter, setRsvpFilter] = useState<string>("ALL");

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);

  const loadParticipants = useCallback(async () => {
    setIsLoading(true);
    const result = await getParticipantsByEvent(eventId);
    if (result.success && result.data) {
      setParticipants(result.data as Participant[]);
    }
    setIsLoading(false);
  }, [eventId]);

  useEffect(() => {
    loadParticipants();
  }, [loadParticipants]);

  // Filter participants
  useEffect(() => {
    let filtered = [...participants];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.organization.toLowerCase().includes(term) ||
          p.email.toLowerCase().includes(term)
      );
    }

    if (roleFilter !== "ALL") {
      filtered = filtered.filter((p) => p.role === roleFilter);
    }

    if (rsvpFilter !== "ALL") {
      filtered = filtered.filter((p) => p.rsvpStatus === rsvpFilter);
    }

    setFilteredParticipants(filtered);
  }, [participants, searchTerm, roleFilter, rsvpFilter]);

  const handleCreateParticipant = async (data: ParticipantFormData) => {
    await createParticipant({
      ...data,
      eventId,
      role: data.role as "LP" | "AC_MEMBER" | "AB_MEMBER" | "IP_TEAM" | "LOCAL_TEAM" | "ECOSYSTEM",
      language: data.language as "FR" | "EN",
      visaStatus: data.visaStatus as "NOT_NEEDED" | "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED" | undefined,
      rsvpStatus: data.rsvpStatus as "PENDING" | "CONFIRMED" | "DECLINED" | "TENTATIVE",
    });
    await loadParticipants();
  };

  const handleUpdateParticipant = async (data: ParticipantFormData) => {
    if (!editingParticipant) return;
    await updateParticipant(editingParticipant.id, eventId, {
      ...data,
      role: data.role as "LP" | "AC_MEMBER" | "AB_MEMBER" | "IP_TEAM" | "LOCAL_TEAM" | "ECOSYSTEM",
      language: data.language as "FR" | "EN",
      visaStatus: data.visaStatus as "NOT_NEEDED" | "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED" | undefined,
      rsvpStatus: data.rsvpStatus as "PENDING" | "CONFIRMED" | "DECLINED" | "TENTATIVE",
    });
    await loadParticipants();
  };

  const handleEdit = (participant: Participant) => {
    setEditingParticipant(participant);
    setIsFormOpen(true);
  };

  const handleDelete = async (participantId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce participant ?")) {
      await deleteParticipant(participantId, eventId);
      await loadParticipants();
    }
  };

  const handleUpdateRsvp = async (participantId: string, status: string) => {
    await updateParticipantRsvp(
      participantId,
      eventId,
      status as "PENDING" | "CONFIRMED" | "DECLINED" | "TENTATIVE"
    );
    await loadParticipants();
  };

  const handleGenerateEmail = (participant: Participant, type: string) => {
    // TODO: Implement AI email generation
    console.log("Generate email:", type, participant);
  };

  const handleOpenForm = () => {
    setEditingParticipant(null);
    setIsFormOpen(true);
  };

  // Stats
  const stats = {
    total: participants.length,
    confirmed: participants.filter((p) => p.rsvpStatus === "CONFIRMED").length,
    pending: participants.filter((p) => p.rsvpStatus === "PENDING").length,
    visaNeeded: participants.filter((p) => p.needsVisa).length,
    visaApproved: participants.filter((p) => p.needsVisa && p.visaStatus === "APPROVED").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Participants</h2>
          <p className="text-sm text-muted-foreground">
            {stats.confirmed}/{stats.total} confirmés
            {stats.visaNeeded > 0 && ` • ${stats.visaApproved}/${stats.visaNeeded} visas approuvés`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={handleOpenForm}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les rôles</SelectItem>
            <SelectItem value="LP">LP</SelectItem>
            <SelectItem value="AC_MEMBER">Membre AC</SelectItem>
            <SelectItem value="AB_MEMBER">Membre AB</SelectItem>
            <SelectItem value="IP_TEAM">Équipe I&P</SelectItem>
            <SelectItem value="LOCAL_TEAM">Équipe locale</SelectItem>
            <SelectItem value="ECOSYSTEM">Écosystème</SelectItem>
          </SelectContent>
        </Select>
        <Select value={rsvpFilter} onValueChange={setRsvpFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="RSVP" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les statuts</SelectItem>
            <SelectItem value="CONFIRMED">Confirmés</SelectItem>
            <SelectItem value="PENDING">En attente</SelectItem>
            <SelectItem value="DECLINED">Déclinés</SelectItem>
            <SelectItem value="TENTATIVE">Incertains</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">
          Chargement...
        </div>
      ) : (
        <ParticipantsTable
          participants={filteredParticipants}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUpdateRsvp={handleUpdateRsvp}
          onUpdateVisa={() => {}}
          onGenerateEmail={handleGenerateEmail}
        />
      )}

      {/* Form Dialog */}
      <ParticipantForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        participant={editingParticipant}
        eventId={eventId}
        onSubmit={editingParticipant ? handleUpdateParticipant : handleCreateParticipant}
      />
    </div>
  );
}
