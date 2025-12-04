import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useTenant } from '@/contexts/TenantContext';
import { ArrowLeft, GraduationCap, Phone, Mail, Globe, MapPin, FileText } from 'lucide-react';

interface EducationInstitution {
  id: number;
  name: string;
  category: string;
  description: string;
  address: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  display_order: number;
}

interface APIResponse {
  institutions: EducationInstitution[];
  institutionsByCategory: Record<string, EducationInstitution[]>;
  totalCount: number;
}

export default function Education() {
  const { tenant, loading: tenantLoading } = useTenant();
  
  const [data, setData] = useState<APIResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tenant) {
      fetchEducation();
    } else if (!tenantLoading) {
      setLoading(false);
    }
  }, [tenant, tenantLoading]);

  const fetchEducation = async () => {
    if (!tenant) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/education?tenant=${tenant.slug}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch education institutions');
      }
      
      const apiData: APIResponse = await response.json();
      setData(apiData);
      
      // Select first category by default
      const categories = Object.keys(apiData.institutionsByCategory);
      if (categories.length > 0) {
        setSelectedCategory(categories[0]);
      }
    } catch (err) {
      console.error('Error fetching education:', err);
      setError('Fehler beim Laden der Bildungseinrichtungen');
    } finally {
      setLoading(false);
    }
  };

  if (loading || tenantLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Bildungseinrichtungen...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Fehler beim Laden'}</p>
          <button
            onClick={fetchEducation}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  const categories = Object.keys(data.institutionsByCategory);
  const selectedInstitutions = selectedCategory ? data.institutionsByCategory[selectedCategory] : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Link to={`/?tenant=${tenant?.slug}`}>
            <button className="flex items-center gap-2 text-white/90 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Zurück
            </button>
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Bildung & Familie</h1>
              <p className="text-purple-100 mt-2">
                {data.totalCount} Einrichtungen in {categories.length} Kategorien
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-4">
            {categories.map((category) => {
              const count = data.institutionsByCategory[category].length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Institutions List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {selectedInstitutions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Keine Einrichtungen in dieser Kategorie gefunden.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {selectedInstitutions.map((institution) => (
              <div
                key={institution.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {institution.name}
                </h3>
                
                {institution.description && (
                  <p className="text-gray-600 mb-4 text-sm">
                    {institution.description}
                  </p>
                )}

                <div className="space-y-3">
                  {institution.address && (
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{institution.address}</span>
                    </div>
                  )}

                  {institution.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <a
                        href={`tel:${institution.phone.replace(/\s/g, '')}`}
                        className="text-purple-600 hover:text-purple-700 hover:underline"
                      >
                        {institution.phone}
                      </a>
                    </div>
                  )}

                  {institution.fax && (
                    <div className="flex items-center gap-3 text-sm">
                      <FileText className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <span className="text-gray-700">Fax: {institution.fax}</span>
                    </div>
                  )}

                  {institution.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <a
                        href={`mailto:${institution.email}`}
                        className="text-purple-600 hover:text-purple-700 hover:underline break-all"
                      >
                        {institution.email}
                      </a>
                    </div>
                  )}

                  {institution.website && (
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      <a
                        href={institution.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:text-purple-700 hover:underline break-all"
                      >
                        Website besuchen
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Weitere Informationen</h2>
          <p className="text-gray-700 text-sm">
            Insgesamt sind {data.totalCount} Bildungseinrichtungen in Horn-Bad Meinberg registriert. 
            Für weitere Informationen besuchen Sie bitte die{' '}
            {tenant?.slug === 'hornbadmeinberg' && (
              <a
                href="https://www.horn-badmeinberg.de/Leben-Freizeit/Bildung/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 hover:underline font-medium"
              >
                offizielle Website der Stadt
              </a>
            )}.
          </p>
        </div>
      </div>
    </div>
  );
}
