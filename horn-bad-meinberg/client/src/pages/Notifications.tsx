import { Bell, ArrowLeft, Loader2, Calendar, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";
import PushNotificationButton from "@/components/PushNotificationButton";
import { useReadNotifications } from "@/hooks/useReadNotifications";
import { useEffect } from "react";
import { useTenant } from "@/contexts/TenantContext";

export default function Notifications() {
  const { tenant } = useTenant();
  const { data: notifications, isLoading } = trpc.directus.getPushNotifications.useQuery();
  const { markAllAsRead, isRead } = useReadNotifications();

  // Mark all notifications as read after a short delay to allow viewing
  useEffect(() => {
    if (notifications && notifications.length > 0) {
      // Wait 2 seconds before marking as read, so user can see them
      const timer = setTimeout(() => {
        const notificationIds = notifications.map(n => n.id);
        markAllAsRead(notificationIds);
      }, 2000);
      
      // Cleanup timer on unmount
      return () => clearTimeout(timer);
    }
  }, [notifications, markAllAsRead]);

  // Separate notifications into unread and read
  const unreadNotifications = notifications?.filter(n => !isRead(n.id)) || [];
  const readNotifications = notifications?.filter(n => isRead(n.id)) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Veröffentlicht</Badge>;
      case "draft":
        return <Badge variant="secondary">Entwurf</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-500">Geplant</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: de,
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.href = `/?tenant=${tenant?.slug || 'hornbadmeinberg'}`}
                className="hover:bg-blue-700 p-2 rounded-lg transition-colors"
                aria-label="Zurück zur Startseite"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <Bell className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Benachrichtigungen</h1>
                <p className="text-blue-100 text-sm">
                  {notifications && notifications.length > 0 
                    ? `${notifications.length} ${notifications.length === 1 ? 'Benachrichtigung' : 'Benachrichtigungen'} (${unreadNotifications.length} ungelesen)`
                    : "Keine Benachrichtigungen"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PushNotificationButton />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Aktualisieren
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {!notifications || notifications.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Keine Benachrichtigungen vorhanden</p>
              <p className="text-sm text-gray-500 mt-2">
                Hier werden alle empfangenen Push-Benachrichtigungen angezeigt
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Unread Notifications */}
            {unreadNotifications.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900 px-2">Neu</h2>
                {unreadNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className="transition-all bg-blue-50 border-l-4 border-blue-500"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-2xl mt-1">
                            🔔
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg leading-tight">
                                {notification.title}
                              </CardTitle>
                              <Badge className="bg-blue-500">Neu</Badge>
                              {getStatusBadge(notification.status)}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                              {notification.scheduled_at && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Geplant: {formatDate(notification.scheduled_at)}</span>
                                </div>
                              )}
                              {notification.sent_at && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Gesendet: {formatDate(notification.sent_at)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-700 whitespace-pre-wrap">{notification.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Read Notifications */}
            {readNotifications.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900 px-2">Gelesen</h2>
                {readNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`transition-all ${
                      notification.status === "published" ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-2xl mt-1 opacity-50">
                            🔔
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg leading-tight text-gray-600">
                                {notification.title}
                              </CardTitle>
                              {getStatusBadge(notification.status)}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                              {notification.scheduled_at && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>Geplant: {formatDate(notification.scheduled_at)}</span>
                                </div>
                              )}
                              {notification.sent_at && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Gesendet: {formatDate(notification.sent_at)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-600 whitespace-pre-wrap">{notification.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
