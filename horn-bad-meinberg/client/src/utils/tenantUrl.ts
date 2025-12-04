/**
 * Adds the tenant query parameter to a URL path
 * @param path - The URL path (e.g., "/notifications", "/events")
 * @param tenantSlug - The tenant slug (e.g., "schieder", "barntrup")
 * @returns The URL with tenant parameter (e.g., "/notifications?tenant=schieder")
 */
export function addTenantToUrl(path: string, tenantSlug: string): string {
  // Don't modify external URLs
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Don't modify if tenant parameter already exists
  if (path.includes('?tenant=') || path.includes('&tenant=')) {
    return path;
  }

  // Check if URL already has query parameters
  const hasQueryParams = path.includes('?');
  const separator = hasQueryParams ? '&' : '?';

  return `${path}${separator}tenant=${tenantSlug}`;
}

/**
 * Hook to get a function that adds tenant to URLs
 * Usage: const withTenant = useWithTenant();
 *        <Link href={withTenant("/notifications")}>
 */
import { useTenant } from '@/contexts/TenantContext';

export function useWithTenant() {
  const { tenant } = useTenant();
  
  return (path: string) => {
    if (!tenant?.slug) return path;
    return addTenantToUrl(path, tenant.slug);
  };
}
