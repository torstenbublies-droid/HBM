import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTenant } from "@/contexts/TenantContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  HandshakeIcon,
  HelpCircle,
  HandHeart,
  Heart,
  ArrowLeft,
  Filter,
  List,
  Map
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function NeighborhoodHelp() {
  const [, navigate] = useLocation();
  const { tenant } = useTenant();
  const [activeTab, setActiveTab] = useState<"requests" | "offers" | "all">("requests");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, [activeTab, selectedCategory, urgentOnly, tenant]);

  const fetchItems = async () => {
    if (!tenant) return;
    
    setLoading(true);
    try {
      let url = `/api/neighborhood-help/${activeTab}?tenant=${tenant.slug}`;
      
      if (selectedCategory !== 'all') {
        url += `&category=${selectedCategory}`;
      }
      
      if (urgentOnly) {
        url += '&urgentOnly=true';
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async (item: any) => {
    if (!tenant) return;
    
    const currentUserId = 'current-user'; // TODO: Get from auth context
    const currentUserName = 'Aktueller Nutzer'; // TODO: Get from auth context
    
    try {
      const response = await fetch(`/api/neighborhood-chat/conversations?tenant=${tenant.slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: item.type === 'request' ? item.id : null,
          offerId: item.type === 'offer' ? item.id : null,
          requesterId: item.type === 'request' ? item.created_by : currentUserId,
          requesterName: item.type === 'request' ? item.created_by_name : currentUserName,
          helperId: item.type === 'offer' ? item.created_by : currentUserId,
          helperName: item.type === 'offer' ? item.created_by_name : currentUserName
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        navigate(`/neighborhood-help/chat?id=${data.id}&userId=${currentUserId}&tenant=${tenant.slug}`);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Fehler beim Erstellen der Konversation');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Green Header */}
      <div className="bg-green-600 text-white px-4 py-8">
        <div className="container mx-auto max-w-6xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-white hover:bg-green-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <HandshakeIcon className="h-10 w-10" />
            <h1 className="text-3xl font-bold">Nachbarschaftshilfe</h1>
          </div>
          <p className="text-green-50 text-lg">
            Helfen und Hilfe erhalten in {tenant?.name || "Ihrer Stadt"}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Info Box */}
        <Card className="p-4 bg-green-50 border-green-200 mb-6">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-green-700 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 mb-1">
                Wie funktioniert's?
              </h3>
              <p className="text-sm text-green-800">
                Hier können Sie Hilfe anbieten oder Hilfe suchen. Ob Einkaufen, Handwerk, 
                Kinderbetreuung oder Seniorenhilfe - gemeinsam sind wir stärker! 💪
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Ich brauche Hilfe */}
          <Card 
            className="p-6 bg-orange-50 border-orange-200 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate("/neighborhood-help/request")}
          >
            <div className="flex items-center gap-4">
              <div className="bg-orange-500 text-white p-4 rounded-full">
                <HelpCircle className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-orange-900 mb-1">
                  Ich brauche Hilfe
                </h3>
                <p className="text-sm text-orange-700">
                  Gesuch erstellen und Helfer finden
                </p>
              </div>
            </div>
          </Card>

          {/* Ich möchte helfen */}
          <Card 
            className="p-6 bg-green-50 border-green-200 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate("/neighborhood-help/offer")}
          >
            <div className="flex items-center gap-4">
              <div className="bg-green-600 text-white p-4 rounded-full">
                <HandHeart className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-900 mb-1">
                  Ich möchte helfen
                </h3>
                <p className="text-sm text-green-700">
                  Angebot erstellen und anderen helfen
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === "requests" ? "default" : "outline"}
            onClick={() => setActiveTab("requests")}
            className={activeTab === "requests" ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            Gesuche
          </Button>
          <Button
            variant={activeTab === "offers" ? "default" : "outline"}
            onClick={() => setActiveTab("offers")}
            className={activeTab === "offers" ? "bg-green-600 hover:bg-green-700" : ""}
          >
            Angebote
          </Button>
          <Button
            variant={activeTab === "all" ? "default" : "outline"}
            onClick={() => setActiveTab("all")}
          >
            Alle
          </Button>
        </div>

        {/* Filter Bar */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Alle Kategorien" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                <SelectItem value="shopping">Einkaufen</SelectItem>
                <SelectItem value="transport">Fahrdienste</SelectItem>
                <SelectItem value="childcare">Kinderbetreuung</SelectItem>
                <SelectItem value="escort">Begleitung</SelectItem>
                <SelectItem value="household">Haus & Garten</SelectItem>
                <SelectItem value="tech">Technik-Hilfe</SelectItem>
                <SelectItem value="pet">Haustierbetreuung</SelectItem>
                <SelectItem value="other">Sonstiges</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Checkbox 
                id="urgent" 
                checked={urgentOnly}
                onCheckedChange={(checked) => setUrgentOnly(checked as boolean)}
              />
              <label 
                htmlFor="urgent" 
                className="text-sm font-medium text-red-600 cursor-pointer flex items-center gap-1"
              >
                🚨 Nur Dringend
              </label>
            </div>
          </div>
        </Card>

        {/* View Toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            size="sm"
            className={viewMode === "list" ? "bg-blue-600" : ""}
          >
            <List className="h-4 w-4 mr-2" />
            Liste
          </Button>
          <Button
            variant={viewMode === "map" ? "default" : "outline"}
            onClick={() => setViewMode("map")}
            size="sm"
            className={viewMode === "map" ? "bg-blue-600" : ""}
          >
            <Map className="h-4 w-4 mr-2" />
            Karte
          </Button>
        </div>

        {/* Content Area */}
        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">Lade...</p>
          </Card>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {activeTab === 'requests' ? 'Keine Gesuche gefunden' : activeTab === 'offers' ? 'Keine Angebote gefunden' : 'Keine Einträge gefunden'}
            </h3>
            <p className="text-gray-500 mb-6">
              Seien Sie der Erste und erstellen Sie {activeTab === 'requests' ? 'ein Gesuch' : 'ein Angebot'}!
            </p>
            <Button 
              onClick={() => navigate(activeTab === 'requests' ? "/neighborhood-help/request" : "/neighborhood-help/offer")}
              className={activeTab === 'requests' ? "bg-orange-500 hover:bg-orange-600" : "bg-green-600 hover:bg-green-700"}
            >
              {activeTab === 'requests' ? 'Erstes Gesuch erstellen' : 'Erstes Angebot erstellen'}
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">
                        {item.type === 'request' ? (
                          item.category === 'shopping' ? '🛒' :
                          item.category === 'transport' ? '🚗' :
                          item.category === 'childcare' ? '👶' :
                          item.category === 'escort' ? '🤝' :
                          item.category === 'household' ? '🏡' :
                          item.category === 'tech' ? '💻' :
                          item.category === 'pet' ? '🐕' : '📋'
                        ) : '🤝'}
                      </span>
                      <h3 className="text-lg font-semibold">{item.title || item.description.substring(0, 50) + '...'}</h3>
                      {item.urgency === 'high' && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">🚨 Dringend</span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{item.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>📍 {item.district}</span>
                      {item.timeframe && <span>🕐 {item.timeframe}</span>}
                      {item.availability && <span>🕐 {item.availability}</span>}
                      {item.radius && <span>📏 {item.radius} km Umkreis</span>}
                      <span>👤 {item.created_by_name}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleContact(item)}
                    className={item.type === 'request' ? "bg-orange-500 hover:bg-orange-600" : "bg-green-600 hover:bg-green-700"}
                  >
                    {item.type === 'request' ? 'Helfen' : 'Anfragen'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
