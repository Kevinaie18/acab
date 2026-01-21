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

const DEMO_EVENTS = [
  {
    id: "event-1",
    name: "IPAE 2 - Advisory Committee Dakar",
    fund: "IPAE_2",
    country: "Senegal",
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
    country: "Cote d Ivoire",
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">I&P AC/AB Hub</span>
            </div>
            <div className="flex items-center gap-4">
              <nav className="flex items-center gap-6">
                <Link href="/" className="text-sm font-medium text-gray-900">Dashboard</Link>
                <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-900">Admin</Link>
              </nav>
              <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-medium text-sm">SD</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
              <p className="text-gray-500 mt-1">Gerez vos Advisory Committees et Advisory Boards</p>
            </div>
            <Button><Plus className="h-4 w-4 mr-2" />Nouvel evenement</Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {DEMO_EVENTS.map((event) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{event.name}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />{event.city}, {event.country}
                        </div>
                      </div>
                      <Badge variant={event.status === "LOCKED" ? "info" : event.status === "LIVE" ? "success" : "secondary"}>{event.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{getFundLabel(event.fund)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(event.selectedWeek)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Progression</span>
                        <span className="font-medium">{event.progress}%</span>
                      </div>
                      <Progress value={event.progress} />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{event.participantsConfirmed}/{event.participantsTotal} confirmes</span>
                      </div>
                      <div className="text-sm text-gray-500">{event.tasksCompleted}/{event.tasksTotal} taches</div>
                    </div>
                    <div className="flex items-center justify-end text-sm font-medium text-blue-600">
                      Voir les details<ArrowRight className="h-4 w-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card><CardContent className="pt-6"><div className="text-2xl font-bold">2</div><p className="text-sm text-gray-500">Evenements actifs</p></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-2xl font-bold">14</div><p className="text-sm text-gray-500">Participants totaux</p></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-2xl font-bold">33</div><p className="text-sm text-gray-500">Taches completees</p></CardContent></Card>
            <Card><CardContent className="pt-6"><div className="text-2xl font-bold text-orange-600">48j</div><p className="text-sm text-gray-500">Prochain evenement</p></CardContent></Card>
          </div>
        </div>
      </main>
    </div>
  );
}