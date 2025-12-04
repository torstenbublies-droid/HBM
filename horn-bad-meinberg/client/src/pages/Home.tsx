import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { 
  Newspaper, Calendar, Building2, FileText, Wrench, 
  Trash2, AlertTriangle, Palmtree, GraduationCap, 
  HardHat, Users, Phone, Cloud, MessageCircle, Bell, X, UserPlus, Heart 
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useReadNotifications } from "@/hooks/useReadNotifications";
import ChatBot from "@/components/ChatBot";
import WeatherWidget from "@/components/WeatherWidget";
import PushNotificationButton from "@/components/PushNotificationButton";
import { useOneSignalPlayerId } from "@/hooks/useOneSignalPlayerId";
import { useTenant } from "@/contexts/TenantContext";
import { useWithTenant } from "@/utils/tenantUrl";
import Header from "@/components/Header";

interface TileProps {
  title: string;
  icon: React.ReactNode;
  href: string;
  color?: string;
}

function Tile({ title, icon, href, color = "bg-primary" }: TileProps) {
  const withTenant = useWithTenant();
  // Check if href is external
  const isExternal = href.startsWith('http');
  
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer tile-shadow h-full flex flex-col items-center justify-center text-center gap-3">
          <div className={`${color} text-white p-4 rounded-2xl relative`}>
            {icon}
          </div>
          <h3 className="font-semibold text-base">{title}</h3>
        </Card>
      </a>
    );
  }
  
  return (
    <Link href={withTenant(href)}>
      <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer tile-shadow h-full flex flex-col items-center justify-center text-center gap-3">
        <div className={`${color} text-white p-4 rounded-2xl relative`}>
          {icon}
        </div>
        <h3 className="font-semibold text-base">{title}</h3>
      </Card>
    </Link>
  );
}

function NotificationTile({ unreadCount }: { unreadCount: number }) {
  const withTenant = useWithTenant();
  const prevCountRef = useRef<number>(unreadCount);
  const [isPulsing, setIsPulsing] = useState(false);

  useEffect(() => {
    // Check if there are new notifications
    if (unreadCount > prevCountRef.current && unreadCount > 0) {
      // Play notification sound
      import('@/utils/notificationSound').then(({ playNotificationSound }) => {
        playNotificationSound();
      });
      
      // Start pulsing animation
      setIsPulsing(true);
      
      // Stop pulsing after 5 seconds
      const timer = setTimeout(() => {
        setIsPulsing(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  return (
    <Link href={withTenant("/notifications")}>
      <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer tile-shadow h-full flex flex-col items-center justify-center text-center gap-3">
        <div 
          className={`${
            isPulsing && unreadCount > 0 
              ? 'bg-red-600 animate-pulse-slow' 
              : unreadCount > 0 
              ? 'bg-red-600' 
              : 'bg-blue-600'
          } text-white p-4 rounded-2xl relative transition-colors duration-500`}
        >
          <Bell size={28} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-base">Benachrichtigungen</h3>
        {unreadCount > 0 && (
          <p className="text-xs text-red-600 font-medium">
            {unreadCount} {unreadCount === 1 ? 'neue' : 'neue'}
          </p>
        )}
      </Card>
    </Link>
  );
}

export default function Home() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [showChat, setShowChat] = useState(false);
  const { data: mayor } = trpc.mayor.info.useQuery();
  const { data: notifications } = trpc.pushNotifications.active.useQuery();
  const { playerId } = useOneSignalPlayerId();
  
  // Get Directus push notifications (with auto-refresh every 30 seconds)
  const { data: directusPushNotifications } = trpc.directus.getPushNotifications.useQuery(
    undefined,
    {
      refetchInterval: 30000, // Refresh every 30 seconds
      refetchIntervalInBackground: true, // Continue polling even when tab is in background
    }
  );
  const { isRead } = useReadNotifications();
  
  // Count unread Directus notifications (not read in LocalStorage)
  const directusUnreadCount = directusPushNotifications?.filter(
    n => !isRead(n.id)
  ).length || 0;
  
  const { data: unreadCount } = trpc.userNotifications.unreadCount.useQuery(
    { oneSignalPlayerId: playerId! },
    { enabled: !!playerId }
  );

  const tiles: TileProps[] = [
    { title: "Aktuelles", icon: <Newspaper size={28} />, href: "/news", color: "bg-primary" },
    { title: "Veranstaltungen", icon: <Calendar size={28} />, href: "/events", color: "bg-primary" },
    { title: "Rathaus & Verwaltung", icon: <Building2 size={28} />, href: "/departments", color: "bg-primary" },
    { title: "Bürger-Services", icon: <FileText size={28} />, href: "/services", color: "bg-primary" },
    { title: "Mängelmelder", icon: <Wrench size={28} />, href: "/issues", color: "bg-orange-600" },
    { title: "Abfall & Termine", icon: <Trash2 size={28} />, href: "/waste", color: "bg-green-600" },
    { title: "Notfall & Störungen", icon: <AlertTriangle size={28} />, href: "/alerts", color: "bg-red-600" },
    { title: "Tourismus & Freizeit", icon: <Palmtree size={28} />, href: "/tourism", color: "bg-secondary" },
    { title: "Bildung & Familie", icon: <GraduationCap size={28} />, href: "/education", color: "bg-purple-600" },
    { title: "Vereine", icon: <UserPlus size={28} />, href: "/clubs", color: "bg-amber-600" },
    { title: "Nachbarschaftshilfe", icon: <Heart size={28} />, href: "/neighborhood-help", color: "bg-green-600" },
    { title: "Ratsinfos & Politik", icon: <Users size={28} />, href: "https://horn-badmeinberg.ratsinfomanagement.net/startseite", color: "bg-indigo-600" },
    { title: "Kontakt & Anliegen", icon: <Phone size={28} />, href: "/contact", color: "bg-primary" },

  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      {/* Hero Header */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <div className="absolute inset-0">
          <img src={tenant?.heroImageUrl || '/header-bg.png'} alt={tenant?.name || 'Stadt'} className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          {/* Wappen */}
          {tenant?.slug && (
            <img 
              src={`/assets/wappen-${tenant.slug}.png`} 
              alt="Wappen" 
              className="w-16 h-16 md:w-20 md:h-20 mb-4 object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
          <h1 className="text-3xl md:text-5xl font-bold mb-2 text-center">
            {tenant?.name || 'Horn-Bad Meinberg'}
          </h1>
          <p className="text-lg md:text-xl opacity-95">Ihre digitale Stadtverwaltung</p>
        </div>
        <div className="absolute top-4 right-4">
          <WeatherWidget />
        </div>
      </div>

      <div className="container py-8 pb-32">
        {/* Mayor Card - Simplified */}
        {mayor && (
          <div className="mb-8">
            <Card className="p-6">
              <div className="flex gap-4 items-center justify-between">
                {mayor.photoUrl ? (
                  <img 
                    src={mayor.photoUrl} 
                    alt={mayor.name} 
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Users size={32} />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{mayor.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {mayor.position}{mayor.party ? ` · ${mayor.party}` : ""}
                  </p>
                </div>
                <div>
                  <img 
                    src="/stadt-logo.png" 
                    alt="Horn-Bad Meinberg Logo" 
                    className="h-16 md:h-24 w-auto object-contain"
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tiles Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Notification Tile - Always first */}
          <NotificationTile unreadCount={directusUnreadCount} />
          
          {tiles.map((tile, index) => (
            <Tile key={index} {...tile} />
          ))}
        </div>

        {/* Push Notifications */}
        {notifications && notifications.length > 0 && (
          <div className="mb-24 space-y-3">
            {notifications.map((notification) => {
              const bgColor = 
                notification.type === 'danger' ? 'bg-red-50 border-red-500' :
                notification.type === 'warning' ? 'bg-orange-50 border-orange-500' :
                notification.type === 'event' ? 'bg-blue-50 border-blue-500' :
                'bg-green-50 border-green-500';
              
              const textColor = 
                notification.type === 'danger' ? 'text-red-900' :
                notification.type === 'warning' ? 'text-orange-900' :
                notification.type === 'event' ? 'text-blue-900' :
                'text-green-900';
              
              const iconColor = 
                notification.type === 'danger' ? 'text-red-600' :
                notification.type === 'warning' ? 'text-orange-600' :
                notification.type === 'event' ? 'text-blue-600' :
                'text-green-600';

              return (
                <Card key={notification.id} className={`${bgColor} border-l-4 shadow-lg animate-in slide-in-from-top duration-500`}>
                  <div className="p-4 flex items-start gap-4">
                    <div className={`${iconColor} flex-shrink-0`}>
                      <Bell size={24} className="animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg ${textColor} mb-1`}>{notification.title}</h3>
                      <p className={`${textColor} text-sm whitespace-pre-wrap`}>{notification.message}</p>
                      {notification.priority === 'urgent' && (
                        <span className="inline-block mt-2 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                          DRINGEND
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Chatbot Dock - Prominent */}
      <div 
        className="fixed bottom-0 left-0 right-0 shadow-2xl z-50 border-t-4"
        style={{ 
          background: `linear-gradient(to right, ${tenant?.primaryColor || '#0066CC'}, ${tenant?.primaryColor || '#0066CC'}dd)`,
          borderTopColor: 'rgba(255, 255, 255, 0.2)'
        }}
      >
        <div className="container py-2 md:py-4">
          <button
            onClick={() => setShowChat(!showChat)}
            className="w-full flex items-center gap-2 md:gap-4 px-3 py-2 md:px-6 md:py-4 bg-white hover:bg-primary-foreground/95 rounded-xl md:rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            <div 
              className="w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-md"
              style={{ 
                background: `linear-gradient(to bottom right, ${tenant?.primaryColor || '#0066CC'}, ${tenant?.primaryColor || '#0066CC'}dd)` 
              }}
            >
              <MessageCircle size={16} className="md:hidden text-white" />
              <MessageCircle size={24} className="hidden md:block text-white" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-semibold text-sm md:text-base text-foreground">{tenant?.chatbotName || 'Chatbot'}</div>
              <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">
                Fragen Sie mich alles über {tenant?.name || 'Ihre Stadt'}...
              </span>
            </div>
            <div className="w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse" />
          </button>
        </div>
      </div>

      {/* Chatbot Modal */}
      {showChat && <ChatBot onClose={() => setShowChat(false)} />}
    </div>
  );
}

