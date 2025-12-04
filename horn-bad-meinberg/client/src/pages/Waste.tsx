import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Trash2, Bell, BellOff, Recycle, Leaf, Flower, FileText, Package } from "lucide-react";
import { Link } from "wouter";
import { format, isToday, isTomorrow } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";
import { useWithTenant } from "@/utils/tenantUrl";
import { useTenant } from "@/contexts/TenantContext";

interface WasteCollection {
  wasteType: string;
  color: string;
  icon: string;
  description: string;
}

interface WeekSchedule {
  thisWeek: Record<string, WasteCollection[]>;
  nextWeek: Record<string, WasteCollection[]>;
}

// Icon mapping
const iconMap: Record<string, any> = {
  'Leaf': Leaf,
  'Flower': Flower,
  'Trash2': Trash2,
  'FileText': FileText,
  'Package': Package
};

// Color mapping
const colorMap: Record<string, string> = {
  'green': 'bg-green-600',
  'gray': 'bg-gray-700',
  'black': 'bg-gray-900',
  'blue': 'bg-blue-600',
  'yellow': 'bg-yellow-500'
};

export default function Waste() {
  const withTenant = useWithTenant();
  const { tenant } = useTenant();
  const [schedule, setSchedule] = useState<WeekSchedule | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load notifications setting from localStorage
  useEffect(() => {
    if (!tenant) return;
    const notifEnabled = localStorage.getItem(`wasteNotifications_${tenant.slug}`) === "true";
    setNotificationsEnabled(notifEnabled);
  }, [tenant]);

  // Load schedule on mount (use any area since all have same gemeinsame Tonnen)
  useEffect(() => {
    if (!tenant) return;
    
    setLoading(true);
    setError(null);
    
    // Use "Schieder" as default area (all areas have same gemeinsame Tonnen anyway)
    fetch(`/api/waste/next?tenant=${tenant.slug}&area=Schieder`)
      .then(res => res.json())
      .then(data => {
        console.log('Schedule loaded:', data);
        setSchedule(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading schedule:', err);
        setError('Fehler beim Laden des Abfuhrkalenders');
        setLoading(false);
      });
  }, [tenant]);

  const handleToggleNotifications = async () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    if (tenant) {
      localStorage.setItem(`wasteNotifications_${tenant.slug}`, String(newState));
    }
    
    if (newState) {
      toast.success("Benachrichtigungen aktiviert", {
        description: "Sie erhalten täglich um 18 Uhr eine Erinnerung für die Abfuhr am nächsten Tag."
      });
      
      // TODO: Save to backend for push notifications
      if (tenant) {
        fetch('/api/waste/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant: tenant.slug,
            userId: `device_${Math.random().toString(36).substring(7)}`, // TODO: Use real user/device ID
            areaName: 'Schieder', // Default area
            notificationEnabled: true,
            notificationTime: '18:00:00'
          })
        }).catch(err => console.error('Error saving preferences:', err));
      }
    } else {
      toast.success("Benachrichtigungen deaktiviert");
    }
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Trash2;
    return <IconComponent size={32} />;
  };

  const getColorClass = (color: string) => {
    return colorMap[color] || 'bg-gray-600';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Heute";
    if (isTomorrow(date)) return "Morgen";
    return format(date, "EEEE, dd. MMMM", { locale: de });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-green-600 text-white py-6">
        <div className="container">
          <Link href={withTenant("/")}>
            <Button variant="ghost" size="sm" className="mb-2 text-white hover:bg-white/20">
              <ArrowLeft size={16} className="mr-2" />
              Zurück
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Abfall & Termine</h1>
          <p className="text-white/90 mt-1">Abfuhrkalender für {tenant?.name || 'Ihre Stadt'}</p>
        </div>
      </div>

      <div className="container py-8">
        {/* Notifications Toggle */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {notificationsEnabled ? <Bell size={24} className="text-primary" /> : <BellOff size={24} className="text-muted-foreground" />}
              <div>
                <Label htmlFor="notifications" className="text-base font-semibold cursor-pointer">
                  Erinnerungen aktivieren
                </Label>
                <p className="text-sm text-muted-foreground">
                  Erhalten Sie täglich um 18 Uhr eine Benachrichtigung für die Abfuhr am nächsten Tag
                </p>
              </div>
            </div>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={handleToggleNotifications}
            />
          </div>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Lade Abfuhrtermine...</p>
          </div>
        ) : error ? (
          <Card className="p-6 text-center text-red-600">
            <p>{error}</p>
          </Card>
        ) : schedule ? (
          <>
            {/* This Week */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Diese Woche</h2>
              <div className="grid gap-3">
                {Object.entries(schedule.thisWeek || {}).length > 0 ? (
                  Object.entries(schedule.thisWeek).map(([date, items]) => (
                    <Card key={date} className="p-4 bg-muted/50">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <div className="font-semibold">{formatDate(date)}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(date), "dd.MM.yyyy")}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap justify-end">
                          {items.map((item, idx) => (
                            <div
                              key={idx}
                              className={`${getColorClass(item.color)} text-white px-4 py-2 rounded-lg flex items-center gap-2`}
                              title={item.description}
                            >
                              {renderIcon(item.icon)}
                              <span className="font-medium">{item.wasteType}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-6 text-center text-muted-foreground">
                    Keine Abfuhrtermine diese Woche
                  </Card>
                )}
              </div>
            </div>

            {/* Next Week */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Nächste Woche</h2>
              <div className="grid gap-3">
                {Object.entries(schedule.nextWeek || {}).length > 0 ? (
                  Object.entries(schedule.nextWeek).map(([date, items]) => (
                    <Card key={date} className="p-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <div className="font-semibold">{formatDate(date)}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(date), "dd.MM.yyyy")}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap justify-end">
                          {items.map((item, idx) => (
                            <div
                              key={idx}
                              className={`${getColorClass(item.color)} text-white px-4 py-2 rounded-lg flex items-center gap-2`}
                              title={item.description}
                            >
                              {renderIcon(item.icon)}
                              <span className="font-medium">{item.wasteType}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-6 text-center text-muted-foreground">
                    Keine Abfuhrtermine nächste Woche
                  </Card>
                )}
              </div>
            </div>
          </>
        ) : null}

        {/* Info Box */}
        <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <Recycle size={24} className="text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Abfallberatung</h3>
              <p className="text-sm text-blue-800 mb-2">
                Abfallberatung ABG Lippe mbH
              </p>
              <p className="text-sm text-blue-800">
                Tel.: 05261 948720<br />
                Internet: <a href="https://www.abfall-lippe.de" target="_blank" rel="noopener noreferrer" className="underline">www.abfall-lippe.de</a>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
