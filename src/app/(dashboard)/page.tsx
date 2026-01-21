import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  Plus,
  Building2,
} from "lucide-react";
import { getFundLabel, formatDate } from "@/lib/utils";

// Demo data - in production, this would come from the database
const DEMO_EVENTS = [
  {
    id: "event-1",
    name: "IPAE 2 - Advisory Committee Dakar",
    fund: "IPAE_2",
    country: "Sénégal",
    city: "Dakar",
    selectedWeek: new Date("2025-03-10"),
    status: "LOCKED",
    progress: 65,
    participantsConfirmed: 4,
    participantsTotal: 6,
    tasksCompleted: 28,
    tasksTotal: 43,
  },
  {
    id: "event-2",
    name: "IPAE 3 - Advisory Board Abidjan",
    fund: "IPAE_3",
    country: "Côte d'Ivoire",
    city: "Abidjan",
    selectedWeek: new Date("2025-05-19"),
    status: "DRAFT",
    progress: 15,
    participantsConfirmed: 2,
    participantsTotal: 8,
    tasksCompleted: 5,
    tasksTotal: 38,
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Tableau de bord
          </h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos Advisory Committees et Advisory Boards
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel événement
        </Button>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {DEMO_EVENTS.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {event.city}, {event.country}
                    </div>
                  </div>
                  <Badge
                    variant={
                      event.status === "LOCKED"
                        ? "info"
                        : event.status === "LIVE"
                        ? "success"
                        : "secondary"
                    }
                  >
                    {event.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Fund & Date */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{getFundLabel(event.fund)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(event.selectedWeek)}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progression</span>
                    <span className="font-medium">{event.progress}%</span>
                  </div>
                  <Progress value={event.progress} />
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {event.participantsConfirmed}/{event.participantsTotal}{" "}
                      confirmés
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {event.tasksCompleted}/{event.tasksTotal} tâches
                  </div>
                </div>

                {/* CTA */}
                <div className="flex items-center justify-end text-sm font-medium text-blue-600">
                  Voir les détails
                  <ArrowRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">2</div>
            <p className="text-sm text-muted-foreground">Événements actifs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">14</div>
            <p className="text-sm text-muted-foreground">Participants totaux</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">33</div>
            <p className="text-sm text-muted-foreground">Tâches complétées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">48j</div>
            <p className="text-sm text-muted-foreground">Prochain événement</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
