"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { Participant } from "@/types";

const PARTICIPANT_ROLES = [
  { value: "LP", label: "LP" },
  { value: "AC_MEMBER", label: "Membre AC" },
  { value: "AB_MEMBER", label: "Membre AB" },
  { value: "IP_TEAM", label: "Équipe I&P" },
  { value: "LOCAL_TEAM", label: "Équipe locale" },
  { value: "ECOSYSTEM", label: "Écosystème" },
];

const LANGUAGES = [
  { value: "FR", label: "Français" },
  { value: "EN", label: "English" },
];

const VISA_STATUSES = [
  { value: "NOT_NEEDED", label: "Non requis" },
  { value: "PENDING", label: "En attente" },
  { value: "SUBMITTED", label: "Soumis" },
  { value: "APPROVED", label: "Approuvé" },
  { value: "REJECTED", label: "Refusé" },
];

const RSVP_STATUSES = [
  { value: "PENDING", label: "En attente" },
  { value: "CONFIRMED", label: "Confirmé" },
  { value: "DECLINED", label: "Décliné" },
  { value: "TENTATIVE", label: "Incertain" },
];

interface ParticipantFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant?: Participant | null;
  eventId: string;
  onSubmit: (data: ParticipantFormData) => Promise<void>;
}

export interface ParticipantFormData {
  name: string;
  organization: string;
  role: string;
  email: string;
  language: string;
  needsVisa: boolean;
  visaStatus: string | null;
  flightArrival: string;
  flightDeparture: string;
  dietaryRestrictions: string;
  specialNeeds: string;
  hotelAssigned: string;
  rsvpStatus: string;
}

export function ParticipantForm({
  open,
  onOpenChange,
  participant,
  eventId,
  onSubmit,
}: ParticipantFormProps) {
  const isEditing = !!participant;
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<ParticipantFormData>({
    name: participant?.name || "",
    organization: participant?.organization || "",
    role: participant?.role || "LP",
    email: participant?.email || "",
    language: participant?.language || "EN",
    needsVisa: participant?.needsVisa || false,
    visaStatus: participant?.visaStatus || null,
    flightArrival: participant?.flightArrival || "",
    flightDeparture: participant?.flightDeparture || "",
    dietaryRestrictions: participant?.dietaryRestrictions || "",
    specialNeeds: participant?.specialNeeds || "",
    hotelAssigned: participant?.hotelAssigned || "",
    rsvpStatus: participant?.rsvpStatus || "PENDING",
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

  const updateField = <K extends keyof ParticipantFormData>(
    field: K,
    value: ParticipantFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier le participant" : "Ajouter un participant"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifiez les informations du participant."
              : "Remplissez les informations du nouveau participant."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Jean Dupont"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">Organisation *</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={(e) => updateField("organization", e.target.value)}
                placeholder="Proparco"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="jean.dupont@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => updateField("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  {PARTICIPANT_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Langue</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => updateField("language", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rsvpStatus">Statut RSVP</Label>
              <Select
                value={formData.rsvpStatus}
                onValueChange={(value) => updateField("rsvpStatus", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RSVP_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Visa */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="needsVisa"
                checked={formData.needsVisa}
                onCheckedChange={(checked) =>
                  updateField("needsVisa", checked as boolean)
                }
              />
              <Label htmlFor="needsVisa">Nécessite un visa</Label>
            </div>
            {formData.needsVisa && (
              <div className="space-y-2">
                <Label htmlFor="visaStatus">Statut du visa</Label>
                <Select
                  value={formData.visaStatus || "PENDING"}
                  onValueChange={(value) => updateField("visaStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VISA_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Vols */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="flightArrival">Vol d'arrivée</Label>
              <Input
                id="flightArrival"
                value={formData.flightArrival}
                onChange={(e) => updateField("flightArrival", e.target.value)}
                placeholder="AF 718 - 10/03 14:30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flightDeparture">Vol de départ</Label>
              <Input
                id="flightDeparture"
                value={formData.flightDeparture}
                onChange={(e) => updateField("flightDeparture", e.target.value)}
                placeholder="AF 719 - 14/03 23:00"
              />
            </div>
          </div>

          {/* Logistique */}
          <div className="space-y-2">
            <Label htmlFor="hotelAssigned">Hôtel assigné</Label>
            <Input
              id="hotelAssigned"
              value={formData.hotelAssigned}
              onChange={(e) => updateField("hotelAssigned", e.target.value)}
              placeholder="Radisson Blu - Chambre 412"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dietaryRestrictions">Restrictions alimentaires</Label>
              <Textarea
                id="dietaryRestrictions"
                value={formData.dietaryRestrictions}
                onChange={(e) =>
                  updateField("dietaryRestrictions", e.target.value)
                }
                placeholder="Végétarien, sans gluten..."
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialNeeds">Besoins spéciaux</Label>
              <Textarea
                id="specialNeeds"
                value={formData.specialNeeds}
                onChange={(e) => updateField("specialNeeds", e.target.value)}
                placeholder="Accessibilité, allergies..."
                rows={2}
              />
            </div>
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
              {isEditing ? "Enregistrer" : "Ajouter"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
