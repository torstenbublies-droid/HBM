import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useWithTenant } from "@/utils/tenantUrl";

export default function Council() {
  const { data: meetings, isLoading } = trpc.council.meetings.useQuery({ upcoming: true });
  const { data: mayor } = trpc.mayor.info.useQuery();
  const withTenant = useWithTenant();

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-indigo-600 text-white py-6">
        <div className="container">
          <Link href={withTenant("/")}>
            <Button variant="ghost" size="sm" className="mb-2 text-white hover:bg-white/20">
              <ArrowLeft size={16} className="mr-2" />
              Zurück
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Ratsinfos & Politik</h1>
          <p className="text-white/90 mt-1">Stadtrat und politische Gremien</p>
        </div>
      </div>

      <div className="container py-8">
        {mayor && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Bürgermeister</h2>
            <div className="flex gap-4 items-center">
              {mayor.photoUrl && (
                <img src={mayor.photoUrl} alt={mayor.name} className="w-20 h-20 rounded-full object-cover" />
              )}
              <div>
                <h3 className="font-semibold text-lg">{mayor.name}</h3>
                {mayor.party && <p className="text-sm text-muted-foreground">{mayor.party}</p>}
                {mayor.email && <p className="text-sm text-primary">{mayor.email}</p>}
              </div>
            </div>
          </Card>
        )}

        <h2 className="text-2xl font-semibold mb-4">Kommende Sitzungen</h2>

        {isLoading && <div className="text-center">Lädt...</div>}

        {!isLoading && meetings && meetings.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Keine kommenden Sitzungen.</p>
          </Card>
        )}

        {!isLoading && meetings && meetings.length > 0 && (
          <div className="grid gap-4">
            {meetings.map((meeting) => (
              <Card key={meeting.id} className="p-6">
                <h3 className="text-lg font-semibold mb-2">{meeting.title}</h3>
                {meeting.committee && <p className="text-sm text-muted-foreground mb-2">{meeting.committee}</p>}
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <Calendar size={14} />
                  <span>{format(new Date(meeting.meetingDate), "dd. MMMM yyyy, HH:mm", { locale: de })} Uhr</span>
                </div>
                <div className="flex gap-2">
                  {meeting.agendaUrl && (
                    <Button asChild variant="outline" size="sm">
                      <a href={meeting.agendaUrl} target="_blank" rel="noopener noreferrer">
                        <FileText size={14} className="mr-2" />
                        Tagesordnung
                      </a>
                    </Button>
                  )}
                  {meeting.minutesUrl && (
                    <Button asChild variant="outline" size="sm">
                      <a href={meeting.minutesUrl} target="_blank" rel="noopener noreferrer">
                        <FileText size={14} className="mr-2" />
                        Protokoll
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
