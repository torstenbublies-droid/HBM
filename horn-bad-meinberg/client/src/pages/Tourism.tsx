import { useState, useEffect } from 'react';
import { MapPin, ArrowLeft, Building2, Map, Users, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWithTenant } from "@/utils/tenantUrl";
import { useTenant } from "@/contexts/TenantContext";

interface Attraction {
  id: number;
  name: string;
  description: string;
  category?: string;
  main_category?: string | null;
  image_url?: string;
  address?: string;
  more_info_url?: string;
  display_order: number;
}

interface AttractionsData {
  attractions: Attraction[];
  attractionsByCategory?: Record<string, Attraction[]>;
  attractionsByMainCategory?: Record<string, Attraction[]>;
  totalCount: number;
}

// Mapping von Ortsteil-Namen zu Hauptkategorie
const ortsteilNames = [
  'Bad Meinberg', 'Belle', 'Bellenberg', 'Billerbeck', 'Veldrom', 
  'Feldrom/Kempen', 'Fissenknick', 'Fromhausen', 'Holzhausen-Externsteine',
  'Heesten', 'Horn', 'Leopoldstal', 'Schmedissen', 'Vahlhausen', 'Wehren', 'Wilberg'
];

// Mapping von Umgebungs-Sehenswürdigkeiten
const umgebungNames = [
  'Hermannsdenkmal', 'LWL-Freilichtmuseum Detmold', 'Falkenburg', 
  'Adlerwarte Berlebeck', 'Vogelpark Heiligenkirchen', 'Schloss Detmold',
  'Freizeitzentrum SchiederSee', 'Köterberg', 'Lippisches Landesmuseum',
  'Landestheater Detmold', 'Tierpark Bad Pyrmont', 'Schloss Brake',
  'Landesgartenschau Bad Lippspringe', 'Huxarium Gartenpark Höxter'
];

export default function Tourism() {
  const withTenant = useWithTenant();
  const { tenant } = useTenant();
  const [data, setData] = useState<AttractionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const isHornBadMeinberg = tenant?.slug === 'hornbadmeinberg';

  useEffect(() => {
    if (!isHornBadMeinberg) {
      setLoading(false);
      return;
    }

    const fetchAttractions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/attractions?tenant=${tenant.slug}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch attractions');
        }
        
        const jsonData = await response.json();
        
        // Client-side grouping by main_category (workaround for old API)
        const attractionsByMainCategory: Record<string, Attraction[]> = {};
        
        jsonData.attractions.forEach((attraction: Attraction) => {
          let mainCategory: string;
          
          // Determine main category based on name
          if (ortsteilNames.includes(attraction.name)) {
            mainCategory = '16 Ortsteile';
          } else if (umgebungNames.includes(attraction.name)) {
            mainCategory = 'Sehenswürdigkeiten in der Umgebung';
          } else {
            mainCategory = 'Sehenswürdigkeiten in Horn-Bad Meinberg';
          }
          
          if (!attractionsByMainCategory[mainCategory]) {
            attractionsByMainCategory[mainCategory] = [];
          }
          attractionsByMainCategory[mainCategory].push(attraction);
        });
        
        // Sort attractions within each category
        Object.keys(attractionsByMainCategory).forEach(category => {
          attractionsByMainCategory[category].sort((a, b) => {
            if (a.display_order !== b.display_order) {
              return a.display_order - b.display_order;
            }
            return a.name.localeCompare(b.name);
          });
        });
        
        setData({
          ...jsonData,
          attractionsByMainCategory
        });
        setError(null);
        
        console.log('Attractions loaded and grouped:', {
          totalCount: jsonData.totalCount,
          mainCategories: Object.keys(attractionsByMainCategory),
          counts: Object.entries(attractionsByMainCategory).map(([cat, items]) => 
            `${cat}: ${items.length}`
          )
        });
      } catch (err) {
        console.error('Error fetching attractions:', err);
        setError('Fehler beim Laden der Sehenswürdigkeiten');
      } finally {
        setLoading(false);
      }
    };

    fetchAttractions();
  }, [tenant, isHornBadMeinberg]);

  // Category icons and colors
  const categoryConfig: Record<string, { icon: any; color: string; description: string }> = {
    'Sehenswürdigkeiten in Horn-Bad Meinberg': {
      icon: Building2,
      color: 'bg-blue-500',
      description: 'Entdecken Sie die Highlights unserer Stadt'
    },
    'Sehenswürdigkeiten in der Umgebung': {
      icon: Map,
      color: 'bg-green-500',
      description: 'Erkunden Sie die Region rund um Horn-Bad Meinberg'
    },
    '16 Ortsteile': {
      icon: Users,
      color: 'bg-purple-500',
      description: 'Lernen Sie unsere 16 Ortsteile kennen'
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-6 px-4 shadow-lg">
          <div className="container mx-auto">
            <Link href={withTenant("/")}>
              <Button variant="ghost" className="text-white hover:bg-teal-700 mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Tourismus & Freizeit</h1>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Lade Sehenswürdigkeiten...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-6 px-4 shadow-lg">
          <div className="container mx-auto">
            <Link href={withTenant("/")}>
              <Button variant="ghost" className="text-white hover:bg-teal-700 mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Tourismus & Freizeit</h1>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  // Horn-Bad Meinberg: Show main categories or selected category
  if (isHornBadMeinberg && data && data.attractionsByMainCategory) {
    // If a category is selected, show attractions in that category
    if (selectedCategory && data.attractionsByMainCategory[selectedCategory]) {
      const attractions = data.attractionsByMainCategory[selectedCategory];
      const config = categoryConfig[selectedCategory];
      const Icon = config?.icon || Building2;

      return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-6 px-4 shadow-lg">
            <div className="container mx-auto">
              <Link href={withTenant("/")}>
                <Button variant="ghost" className="text-white hover:bg-teal-700 mb-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Zurück zur Startseite
                </Button>
              </Link>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-white hover:underline mb-4 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Zurück zur Übersicht
              </button>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${config?.color || 'bg-gray-100'} text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{selectedCategory}</h1>
                  <p className="text-teal-100 mt-1">{config?.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Attractions list */}
          <div className="container mx-auto px-4 py-8">
            <p className="text-gray-600 mb-6">{attractions.length} {attractions.length === 1 ? 'Eintrag' : 'Einträge'}</p>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {attractions.map((attraction) => (
                <Card key={attraction.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  {attraction.image_url && (
                    <div className="relative h-48 bg-gray-100">
                      <img
                        src={attraction.image_url}
                        alt={attraction.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image failed to load:', attraction.image_url);
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="text-lg">{attraction.name}</CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {attraction.description}
                    </p>
                    
                    {attraction.address && (
                      <div className="flex items-start gap-2 text-sm text-gray-500 mb-3">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{attraction.address}</span>
                      </div>
                    )}
                    
                    {attraction.more_info_url && (
                      <a
                        href={attraction.more_info_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-teal-600 hover:text-teal-700 text-sm font-medium group"
                      >
                        Mehr Infos
                        <ExternalLink className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Show main category tiles
    const mainCategories = Object.keys(data.attractionsByMainCategory).sort();

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-6 px-4 shadow-lg">
          <div className="container mx-auto">
            <Link href={withTenant("/")}>
              <Button variant="ghost" className="text-white hover:bg-teal-700 mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Tourismus & Freizeit</h1>
            <p className="text-teal-100 mt-2">Entdecken Sie Horn-Bad Meinberg</p>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <Card className="mb-8 border-teal-200 bg-gradient-to-br from-white to-teal-50">
            <CardHeader>
              <CardTitle className="text-2xl text-teal-800">
                Willkommen in Horn-Bad Meinberg
              </CardTitle>
              <CardDescription className="text-base italic text-gray-700">
                "Die Welt ist ein Buch. Wer nie reist, sieht nur eine Seite davon." – Augustinus Aurelius
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                Erleben Sie die einzigartige Vielfalt von Horn-Bad Meinberg! Von den beeindruckenden Externsteinen über 
                historische Kurparks bis hin zu malerischen Wanderwegen – unsere Stadt bietet Ihnen unvergessliche Erlebnisse 
                in Natur, Kultur und Geschichte. Entdecken Sie die Schönheit des Teutoburger Waldes und lassen Sie sich von 
                der Gastfreundschaft unserer Region verzaubern.
              </p>
            </CardContent>
          </Card>

          {/* Main category tiles */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Sehenswürdigkeiten & Highlights</h2>
          
          <div className="grid gap-6 md:grid-cols-3">
            {mainCategories.map((categoryName) => {
              const config = categoryConfig[categoryName];
              const Icon = config?.icon || Building2;
              const count = data.attractionsByMainCategory![categoryName]?.length || 0;

              return (
                <Card
                  key={categoryName}
                  className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => setSelectedCategory(categoryName)}
                >
                  <div className={`h-2 ${config?.color || 'bg-gray-500'}`}></div>
                  <CardHeader>
                    <div className={`inline-flex p-3 rounded-lg ${config?.color || 'bg-gray-100'} text-white mb-3`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-teal-600 transition-colors">
                      {categoryName}
                    </CardTitle>
                    <CardDescription>
                      {config?.description || ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      {count} {count === 1 ? 'Eintrag' : 'Einträge'}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Horn-Bad Meinberg: Show static categories (fallback)
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-6 px-4 shadow-lg">
        <div className="container mx-auto">
          <Link href={withTenant("/")}>
            <Button variant="ghost" className="text-white hover:bg-teal-700 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Tourismus & Freizeit</h1>
          <p className="text-teal-100 mt-2">Entdecken Sie Horn-Bad Meinberg</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tourismus & Freizeit</CardTitle>
            <CardDescription>
              Entdecken Sie die Schönheit von Horn-Bad Meinberg und Umgebung.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <a
            href="https://www.horn-badmeinberg.de/tourismus-freizeit/freizeitangebote"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card className="hover:shadow-xl transition-shadow h-full">
              <CardHeader>
                <CardTitle className="text-xl">Freizeitangebote</CardTitle>
                <CardDescription>
                  Vielfältige Freizeitmöglichkeiten in Horn-Bad Meinberg
                </CardDescription>
              </CardHeader>
            </Card>
          </a>

          <a
            href="https://www.horn-badmeinberg.de/tourismus-freizeit/sehenswuerdigkeiten"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card className="hover:shadow-xl transition-shadow h-full">
              <CardHeader>
                <CardTitle className="text-xl">Sehenswürdigkeiten</CardTitle>
                <CardDescription>
                  Entdecken Sie die Highlights unserer Region
                </CardDescription>
              </CardHeader>
            </Card>
          </a>

          <a
            href="https://www.horn-badmeinberg.de/tourismus-freizeit/wandern-radfahren"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Card className="hover:shadow-xl transition-shadow h-full">
              <CardHeader>
                <CardTitle className="text-xl">Wandern & Radfahren</CardTitle>
                <CardDescription>
                  Erkunden Sie die Natur auf zahlreichen Wander- und Radwegen
                </CardDescription>
              </CardHeader>
            </Card>
          </a>
        </div>
      </div>
    </div>
  );
}
