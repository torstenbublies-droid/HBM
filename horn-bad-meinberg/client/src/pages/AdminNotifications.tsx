import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Bell, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useWithTenant } from "@/utils/tenantUrl";

export default function AdminNotifications() {
  const { user } = useAuth();
  const withTenant = useWithTenant();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info" as "info" | "warning" | "danger" | "event",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    expiresAt: "",
  });

  const { data: notifications, refetch } = trpc.pushNotifications.all.useQuery();
  const createMutation = trpc.pushNotifications.create.useMutation({
    onSuccess: () => {
      toast.success("Benachrichtigung erstellt");
      refetch();
      resetForm();
    },
    onError: () => {
      toast.error("Fehler beim Erstellen");
    },
  });

  const updateMutation = trpc.pushNotifications.update.useMutation({
    onSuccess: () => {
      toast.success("Benachrichtigung aktualisiert");
      refetch();
      resetForm();
    },
    onError: () => {
      toast.error("Fehler beim Aktualisieren");
    },
  });

  const deleteMutation = trpc.pushNotifications.delete.useMutation({
    onSuccess: () => {
      toast.success("Benachrichtigung gelöscht");
      refetch();
    },
    onError: () => {
      toast.error("Fehler beim Löschen");
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      type: "info",
      priority: "medium",
      expiresAt: "",
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (notification: any) => {
    setFormData({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      expiresAt: notification.expiresAt ? new Date(notification.expiresAt).toISOString().slice(0, 16) : "",
    });
    setEditingId(notification.id);
    setShowForm(true);
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateMutation.mutate({ id, isActive: !isActive });
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-4">Zugriff verweigert</h2>
          <p className="text-muted-foreground mb-4">Sie haben keine Berechtigung für diesen Bereich.</p>
          <Link href={withTenant("/")}>
            <Button>Zur Startseite</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container">
          <Link href={withTenant("/")}>
            <Button variant="ghost" size="sm" className="mb-4 text-primary-foreground hover:bg-primary-foreground/20">
              <ArrowLeft size={16} className="mr-2" />
              Zurück
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Bell size={32} />
            <div>
              <h1 className="text-2xl font-bold">Push-Benachrichtigungen</h1>
              <p className="text-sm opacity-90">Verwaltung von Benachrichtigungen</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Create Button */}
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="mb-6">
            <Plus size={18} className="mr-2" />
            Neue Benachrichtigung
          </Button>
        )}

        {/* Form */}
        {showForm && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">
              {editingId ? "Benachrichtigung bearbeiten" : "Neue Benachrichtigung"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Nachricht *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Typ</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-border rounded-md"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warnung</option>
                    <option value="danger">Gefahr</option>
                    <option value="event">Veranstaltung</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="priority">Priorität</Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-border rounded-md"
                  >
                    <option value="low">Niedrig</option>
                    <option value="medium">Mittel</option>
                    <option value="high">Hoch</option>
                    <option value="urgent">Dringend</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="expiresAt">Ablaufdatum (optional)</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? "Aktualisieren" : "Erstellen"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Abbrechen
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Notifications List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Alle Benachrichtigungen</h2>
          {notifications && notifications.length > 0 ? (
            notifications.map((notification) => {
              const bgColor =
                notification.type === "danger" ? "bg-red-50" :
                notification.type === "warning" ? "bg-orange-50" :
                notification.type === "event" ? "bg-blue-50" :
                "bg-green-50";

              return (
                <Card key={notification.id} className={`${bgColor} ${!notification.isActive && 'opacity-50'}`}>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg">{notification.title}</h3>
                          {notification.priority === "urgent" && (
                            <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
                              DRINGEND
                            </span>
                          )}
                          {!notification.isActive && (
                            <span className="px-2 py-1 bg-gray-400 text-white text-xs rounded">
                              INAKTIV
                            </span>
                          )}
                        </div>
                        <p className="text-sm mb-2 whitespace-pre-wrap">{notification.message}</p>
                        <div className="text-xs text-muted-foreground">
                          Typ: {notification.type} | Priorität: {notification.priority}
                          {notification.expiresAt && ` | Läuft ab: ${new Date(notification.expiresAt).toLocaleString('de-DE')}`}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(notification.id, notification.isActive)}
                        >
                          {notification.isActive ? <X size={16} /> : <Check size={16} />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(notification)}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm("Wirklich löschen?")) {
                              deleteMutation.mutate({ id: notification.id });
                            }
                          }}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Keine Benachrichtigungen vorhanden</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

