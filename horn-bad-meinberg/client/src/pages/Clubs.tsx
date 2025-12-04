import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useSearch } from "wouter";
import { ArrowLeft, Users, Trophy, Phone, Mail, MapPin, ExternalLink, Fish, Church, Car, Palette, Music, Shield, Wrench, Heart, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useWithTenant } from "@/utils/tenantUrl";

interface Club {
  id: number;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  fax: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
}

interface Category {
  category_id: number;
  category_name: string;
  category_icon: string;
  category_color: string;
  display_order: number;
  clubs: Club[];
}

// Icon mapping
const iconMap: Record<string, any> = {
  'Trophy': Trophy,
  'Fish': Fish,
  'Church': Church,
  'Car': Car,
  'Palette': Palette,
  'Music': Music,
  'Shield': Shield,
  'Wrench': Wrench,
  'Heart': Heart,
  'Users': Users,
};

// Color mapping
const colorMap: Record<string, string> = {
  'blue': 'bg-blue-100 text-blue-600',
  'cyan': 'bg-cyan-100 text-cyan-600',
  'slate': 'bg-slate-100 text-slate-600',
  'gray': 'bg-gray-100 text-gray-600',
  'violet': 'bg-violet-100 text-violet-600',
  'green': 'bg-green-100 text-green-600',
  'amber': 'bg-amber-100 text-amber-600',
  'orange': 'bg-orange-100 text-orange-600',
  'red': 'bg-red-100 text-red-600',
  'pink': 'bg-pink-100 text-pink-600',
};

export default function Clubs() {
  const withTenant = useWithTenant();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const tenant = params.get('tenant') || 'hornbadmeinberg';
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/clubs?tenant=${tenant}`);
        if (!response.ok) {
          throw new Error('Failed to fetch clubs');
        }
        const data = await response.json();
        setCategories(data);
        if (data.length > 0) {
          setActiveCategory(data[0].category_id);
        }
      } catch (err) {
        console.error('Error fetching clubs:', err);
        setError('Fehler beim Laden der Vereine');
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, [tenant]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container py-8">
          <Card className="p-6 bg-destructive/10 border-destructive">
            <p className="text-destructive">{error}</p>
          </Card>
        </div>
      </div>
    );
  }

  const activeData = categories.find(c => c.category_id === activeCategory);
  const displayClubs = activeData?.clubs || [];
  const totalClubs = categories.reduce((sum, cat) => sum + (cat.clubs?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-orange-500 text-white py-8">
        <div className="container">
          <Link href={withTenant("/")}>
            <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">Vereine</h1>
          <p className="text-primary-foreground/90 mt-2">
            {totalClubs} Vereine in {categories.length} Kategorien
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Category Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {categories.map((category) => {
            const Icon = iconMap[category.category_icon] || Users;
            const colorClass = colorMap[category.category_color] || 'bg-gray-100 text-gray-600';
            const isActive = activeCategory === category.category_id;
            
            return (
              <Button
                key={category.category_id}
                variant={isActive ? 'default' : 'outline'}
                onClick={() => setActiveCategory(category.category_id)}
                className={`h-auto py-4 flex flex-col items-center gap-2 ${!isActive ? 'hover:bg-muted' : ''}`}
              >
                <div className={`p-2 rounded-lg ${!isActive ? colorClass : 'bg-white/20'}`}>
                  <Icon className={`h-5 w-5 ${!isActive ? '' : 'text-white'}`} />
                </div>
                <div className="text-xs text-center leading-tight">
                  {category.category_name}
                </div>
                <div className="text-xs font-bold">
                  ({category.clubs?.length || 0})
                </div>
              </Button>
            );
          })}
        </div>

        {/* Clubs List */}
        {displayClubs.length > 0 ? (
          <div className="grid gap-4">
            {displayClubs.map((club) => {
              const Icon = iconMap[activeData?.category_icon || 'users'] || Users;
              const colorClass = colorMap[activeData?.category_color || 'gray'] || 'bg-gray-100 text-gray-600';
              
              return (
                <Card key={club.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${colorClass}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2">{club.name}</h3>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {club.contactPerson && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{club.contactPerson}</span>
                          </div>
                        )}
                        {club.address && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{club.address}</span>
                          </div>
                        )}
                        {club.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <a href={`tel:${club.phone.replace(/\s/g, '')}`} className="hover:text-primary">
                              {club.phone}
                            </a>
                          </div>
                        )}
                        {club.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <a href={`mailto:${club.email}`} className="hover:text-primary">
                              {club.email}
                            </a>
                          </div>
                        )}
                        {club.website && (
                          <div className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4" />
                            <a 
                              href={club.website.startsWith('http') ? club.website : `https://${club.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-primary hover:underline"
                            >
                              {club.website.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-6 text-center text-muted-foreground">
            <p>Keine Vereine in dieser Kategorie gefunden.</p>
          </Card>
        )}

        {/* Info Box */}
        <Card className="mt-8 p-6 bg-muted/50">
          <h3 className="font-semibold mb-2">Weitere Informationen</h3>
          <p className="text-sm text-muted-foreground">
            Insgesamt sind {totalClubs} Vereine in Horn-Bad Meinberg registriert. 
            Die Daten werden automatisch alle 2 Tage aktualisiert.
            Für weitere Informationen besuchen Sie bitte die{' '}
            <a 
              href="https://www.horn-badmeinberg.de/Familie-und-Soziales/Sport-und-Freizeitstätten/Vereine/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              offizielle Website der Stadt
            </a>.
          </p>
        </Card>
      </div>
    </div>
  );
}
