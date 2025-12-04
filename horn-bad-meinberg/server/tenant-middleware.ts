import { Request } from "express";

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
  enabledFeatures: string | null;
  isActive: boolean;
  mayorName: string | null;
  mayorEmail: string | null;
  mayorPhone: string | null;
  mayorAddress: string | null;
  mayorOfficeHours: string | null;
}

/**
 * Extract tenant slug from request
 * Priority: 1. Subdomain, 2. Query Parameter, 3. Header
 */
export function extractTenantSlug(req: Request): string | null {
  // 1. Try subdomain (e.g., schieder.buerger-app.de)
  const host = req.get('host') || '';
  
  // Skip subdomain extraction for development/sandbox domains
  const skipSubdomainHosts = ['localhost', 'manusvm.computer', '127.0.0.1', 'onrender.com'];
  const shouldSkipSubdomain = skipSubdomainHosts.some(skip => host.includes(skip));
  
  if (!shouldSkipSubdomain) {
    const subdomain = host.split('.')[0];
    if (subdomain && subdomain !== 'www' && !subdomain.match(/^\d/)) {
      console.log('[Tenant] Extracted from subdomain:', subdomain);
      return subdomain;
    }
  }

  // 2. Try query parameter (e.g., ?tenant=schieder)
  const queryTenant = req.query.tenant as string;
  if (queryTenant) {
    console.log('[Tenant] Extracted from query:', queryTenant);
    return queryTenant;
  }

  // 3. Try custom header (e.g., X-Tenant: schieder)
  const headerTenant = req.get('X-Tenant');
  if (headerTenant) {
    console.log('[Tenant] Extracted from header:', headerTenant);
    return headerTenant;
  }

  // Default: hornbadmeinberg
  console.log('[Tenant] Using default: hornbadmeinberg');
  return 'hornbadmeinberg';
}

/**
 * Load tenant from database using internal debug endpoint
 * This is a workaround because Drizzle SQL queries don't work properly
 */
export async function loadTenant(slug: string): Promise<TenantInfo | null> {
  console.log('[Tenant] Loading tenant from DB with slug:', slug);
  
  try {
    // Use internal debug endpoint which uses pg client directly
    const response = await fetch('http://localhost:3000/api/debug/tenants');
    const data = await response.json();
    
    console.log('[Tenant] Debug endpoint returned', data.count, 'tenants');
    
    // Find tenant by subdomain
    const tenant = data.tenants?.find((t: any) => t.subdomain === slug);
    
    if (!tenant) {
      console.error('[Tenant] No tenant found with slug:', slug);
      return null;
    }

    console.log('[Tenant] Loaded tenant:', tenant.name);

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.subdomain,
      primaryColor: tenant.primary_color || "#0066CC",
      secondaryColor: tenant.secondary_color || "#00A86B",
      logoUrl: tenant.logo_url,
      heroImageUrl: tenant.hero_image_url,
      contactEmail: tenant.contact_email,
      contactPhone: tenant.contact_phone,
      contactAddress: tenant.address,
      weatherLat: tenant.latitude,
      weatherLon: tenant.longitude,
      weatherCity: tenant.subdomain,
      chatbotName: "Chatbot",
      chatbotSystemPrompt: null,
      enabledFeatures: tenant.features,
      isActive: true,
      mayorName: tenant.mayor,
      mayorEmail: null,
      mayorPhone: null,
      mayorAddress: null,
      mayorOfficeHours: null,
    };
  } catch (error) {
    console.error('[Tenant] Error loading tenant:', error);
    return null;
  }
}

/**
 * Tenant middleware for Express
 * Attaches tenant info to req.tenant
 */
export async function tenantMiddleware(req: Request & { tenant?: TenantInfo }, res: any, next: any) {
  const slug = extractTenantSlug(req);
  
  if (!slug) {
    return res.status(400).json({ error: 'Tenant not specified' });
  }

  const tenant = await loadTenant(slug);

  if (!tenant) {
    return res.status(404).json({ error: 'Tenant not found' });
  }

  // Attach tenant to request
  req.tenant = tenant;
  next();
}
