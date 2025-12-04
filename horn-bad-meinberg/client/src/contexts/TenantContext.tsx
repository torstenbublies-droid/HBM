import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { trpc } from '@/lib/trpc';

export interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactAddress: string | null;
  weatherLat: string | null;
  weatherLon: string | null;
  weatherCity: string | null;
  chatbotName: string;
  chatbotSystemPrompt: string | null;
  isActive: boolean;
  mayorName: string | null;
  mayorEmail: string | null;
  mayorPhone: string | null;
  mayorAddress: string | null;
  mayorOfficeHours: string | null;
}

interface TenantContextType {
  tenant: TenantInfo | null;
  loading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const TENANT_STORAGE_KEY = 'current-tenant-slug';

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if we need to restore tenant from localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tenantParam = urlParams.get('tenant');
    const storedTenant = localStorage.getItem(TENANT_STORAGE_KEY);
    
    // If no tenant in URL but we have one stored, redirect with tenant parameter
    if (!tenantParam && storedTenant) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('tenant', storedTenant);
      window.location.href = newUrl.toString();
    }
  }, []);

  // Tenant-Query mit tRPC
  const { data, isLoading, error: queryError } = trpc.tenant.current.useQuery();

  useEffect(() => {
    if (data) {
      setTenant(data);
      setLoading(false);
      
      // Store tenant slug in localStorage for persistence
      localStorage.setItem(TENANT_STORAGE_KEY, data.slug);
      
      // Set CSS Variables for dynamic theming
      document.documentElement.style.setProperty('--tenant-primary', data.primaryColor);
      document.documentElement.style.setProperty('--tenant-secondary', data.secondaryColor);
      
      // Update page title
      document.title = `${data.name} - Bürger-App`;
      
      // Update favicon if logoUrl is available
      if (data.logoUrl) {
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (link) {
          link.href = data.logoUrl;
        }
      }
    }
    if (queryError) {
      setError(queryError.message);
      setLoading(false);
    }
  }, [data, queryError]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-700 font-medium">Lade Stadt-Daten...</p>
        </div>
      </div>
    );
  }

  if (error || !tenant) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-red-600 mb-2">Fehler</h1>
          <p className="text-gray-700 mb-6">{error || 'Stadt nicht gefunden'}</p>
          <p className="text-sm text-gray-600">
            Bitte überprüfen Sie die URL oder kontaktieren Sie den Administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <TenantContext.Provider value={{ tenant, loading, error }}>
      {children}
    </TenantContext.Provider>
  );
}

/**
 * Hook to access tenant context
 */
export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within TenantProvider');
  }
  return context;
}

/**
 * Hook to access tenant branding (colors, logos, images)
 */
export function useTenantBranding() {
  const { tenant } = useTenant();
  return {
    primaryColor: tenant?.primaryColor || '#0066CC',
    secondaryColor: tenant?.secondaryColor || '#00A86B',
    logoUrl: tenant?.logoUrl,
    heroImageUrl: tenant?.heroImageUrl,
  };
}

/**
 * Hook to access tenant contact information
 */
export function useTenantContact() {
  const { tenant } = useTenant();
  return {
    email: tenant?.contactEmail,
    phone: tenant?.contactPhone,
    address: tenant?.contactAddress,
  };
}

/**
 * Hook to access tenant weather configuration
 */
export function useTenantWeather() {
  const { tenant } = useTenant();
  return {
    lat: tenant?.weatherLat,
    lon: tenant?.weatherLon,
    city: tenant?.weatherCity || tenant?.name,
  };
}

/**
 * Hook to access tenant chatbot configuration
 */
export function useTenantChatbot() {
  const { tenant } = useTenant();
  return {
    name: tenant?.chatbotName || 'Chatbot',
    systemPrompt: tenant?.chatbotSystemPrompt,
  };
}
