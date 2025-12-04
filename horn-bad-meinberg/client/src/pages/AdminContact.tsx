import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Mail, User, Calendar, MessageSquare } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useWithTenant } from "@/utils/tenantUrl";

export default function AdminContact() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const withTenant = useWithTenant();
  const [statusFilter, setStatusFilter] = useState<"neu" | "in_bearbeitung" | "erledigt" | undefined>(undefined);

  const { data: messages, isLoading, refetch } = trpc.contact.list.useQuery(
    { status: statusFilter },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const updateStatusMutation = trpc.contact.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status aktualisiert");
      refetch();
    },
    onError: () => {
      toast.error("Fehler beim Aktualisieren des Status");
    },
  });

  const handleStatusChange = (id: string, status: "neu" | "in_bearbeitung" | "erledigt") => {
    updateStatusMutation.mutate({ id, status });
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-red-600 text-white py-6">
          <div className="container">
            <h1 className="text-3xl font-bold">Zugriff verweigert</h1>
          </div>
        </div>
        <div className="container py-8">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">
              Sie haben keine Berechtigung, diese Seite zu sehen.
            </p>
            <Link href={withTenant("/")}>
              <Button>Zur Startseite</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const statusColors = {
    neu: "bg-blue-100 text-blue-800",
    in_bearbeitung: "bg-yellow-100 text-yellow-800",
    erledigt: "bg-green-100 text-green-800",
  };

  const statusLabels = {
    neu: "Neu",
    in_bearbeitung: "In Bearbeitung",
    erledigt: "Erledigt",
  };

  const stats = {
    neu: messages?.filter((m) => m.status === "neu").length || 0,
    in_bearbeitung: messages?.filter((m) => m.status === "in_bearbeitung").length || 0,
    erledigt: messages?.filter((m) => m.status === "erledigt").length || 0,
    total: messages?.length || 0,
  };

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
          <h1 className="text-3xl font-bold">Admin: Kontaktanliegen</h1>
          <p className="text-primary-foreground/90 mt-1">Verwaltung aller Bürgeranliegen</p>
        </div>
      </div>

      <div className="container py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Gesamt</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </Card>
          <Card className="p-4 border-blue-200 bg-blue-50">
            <div className="text-sm text-blue-600">Neu</div>
            <div className="text-2xl font-bold text-blue-800">{stats.neu}</div>
          </Card>
          <Card className="p-4 border-yellow-200 bg-yellow-50">
            <div className="text-sm text-yellow-600">In Bearbeitung</div>
            <div className="text-2xl font-bold text-yellow-800">{stats.in_bearbeitung}</div>
          </Card>
          <Card className="p-4 border-green-200 bg-green-50">
            <div className="text-sm text-green-600">Erledigt</div>
            <div className="text-2xl font-bold text-green-800">{stats.erledigt}</div>
          </Card>
        </div>

        {/* Filter */}
        <div className="mb-6 flex gap-4 items-center">
          <label className="text-sm font-medium">Status filtern:</label>
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) => setStatusFilter(value === "all" ? undefined : value as any)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle anzeigen</SelectItem>
              <SelectItem value="neu">Nur Neue</SelectItem>
              <SelectItem value="in_bearbeitung">In Bearbeitung</SelectItem>
              <SelectItem value="erledigt">Erledigt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Messages List */}
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

        {!isLoading && messages && messages.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">
              {statusFilter ? "Keine Anliegen mit diesem Status gefunden." : "Noch keine Anliegen eingegangen."}
            </p>
          </Card>
        )}

        {!isLoading && messages && messages.length > 0 && (
          <div className="grid gap-4">
            {messages.map((message) => (
              <Card key={message.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{message.subject}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User size={14} />
                        <span>{message.name}</span>
                      </div>
                      {message.email && (
                        <div className="flex items-center gap-1">
                          <Mail size={14} />
                          <a href={`mailto:${message.email}`} className="text-primary hover:underline">
                            {message.email}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>
                          {format(new Date(message.createdAt!), "dd.MM.yyyy, HH:mm", { locale: de })} Uhr
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[message.status]}`}>
                    {statusLabels[message.status]}
                  </span>
                </div>

                <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MessageSquare size={16} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Select
                    value={message.status}
                    onValueChange={(value) => handleStatusChange(message.id, value as any)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="neu">Neu</SelectItem>
                      <SelectItem value="in_bearbeitung">In Bearbeitung</SelectItem>
                      <SelectItem value="erledigt">Erledigt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

