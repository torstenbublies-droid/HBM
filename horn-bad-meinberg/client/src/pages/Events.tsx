import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Clock } from "lucide-react";
import { Link } from "wouter";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { useWithTenant } from "@/utils/tenantUrl";
import { useTenant } from "@/contexts/TenantContext";

interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  location?: string;
  image_url?: string;
  source_url: string;
  category?: string;
}

export default function Events() {
  const withTenant = useWithTenant();
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      if (!tenant) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/events?tenant=${tenant.slug}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        
        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Fehler beim Laden der Veranstaltungen');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchEvents();
  }, [tenant]);

  function formatEventDate(startDate: string, endDate?: string): string {
    const start = parseISO(startDate);
    
    if (!endDate) {
      return format(start, "EEEE, dd. MMMM yyyy 'um' HH:mm 'Uhr'", { locale: de });
    }
    
    const end = parseISO(endDate);
    const startDay = format(start, "dd.MM.yyyy", { locale: de });
    const endDay = format(end, "dd.MM.yyyy", { locale: de });
    
    if (startDay === endDay) {
      return `${format(start, "EEEE, dd. MMMM yyyy", { locale: de })} · ${format(start, "HH:mm", { locale: de })} - ${format(end, "HH:mm", { locale: de })} Uhr`;
    } else {
      return `${format(start, "dd.MM.yyyy HH:mm", { locale: de })} - ${format(end, "dd.MM.yyyy HH:mm", { locale: de })} Uhr`;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container">
          <Link href={withTenant("/")}>
            <Button variant="ghost" size="sm" className="mb-2 text-primary-foreground hover:bg-primary-foreground/20">
              <ArrowLeft size={16} className="mr-2" />
              Zurück
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Veranstaltungen</h1>
          <p className="text-primary-foreground/90 mt-1">Kommende Events in {tenant?.name || 'Ihrer Stadt'}</p>
        </div>
      </div>

      <div className="container py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="p-8 text-center border-destructive">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && events.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Aktuell keine Veranstaltungen geplant.</p>
          </Card>
        )}

        {/* Events List */}
        {!isLoading && !error && events.length > 0 && (
          <div className="grid gap-4">
            {events.map((event) => (
              <Card key={event.id} className="p-6 hover:shadow-lg transition-all">
                <div className="flex gap-4">
                  {event.image_url && (
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                    
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatEventDate(event.start_date, event.end_date)}</span>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin size={14} />
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      {event.category && (
                        <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs rounded w-fit">
                          {event.category}
                        </span>
                      )}
                    </div>

                    {event.description && event.description !== event.title && (
                      <p className="text-muted-foreground mb-3 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    {event.source_url && (
                      <Button asChild variant="link" className="px-0 mt-2">
                        <a href={event.source_url} target="_blank" rel="noopener noreferrer">
                          Mehr erfahren →
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
