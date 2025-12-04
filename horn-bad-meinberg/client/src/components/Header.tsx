import { useTenant } from "@/contexts/TenantContext";
import { Link } from "wouter";
import { useWithTenant } from "@/utils/tenantUrl";

export default function Header() {
  const { tenant } = useTenant();
  const withTenant = useWithTenant();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href={withTenant("/")}>
          <img 
            src={tenant?.logoUrl || '/logo.png'} 
            alt={tenant?.name || 'Logo'} 
            className="h-8 md:h-10 cursor-pointer"
          />
        </Link>

        {/* Impressum & Datenschutz */}
        <div className="flex items-center gap-4 md:gap-6 text-sm">
          <a 
            href={tenant?.slug === 'schieder' 
              ? 'https://www.horn-badmeinberg.de/Startseite/Impressum' 
              : tenant?.slug === 'barntrup'
              ? 'https://www.barntrup.de/impressum'
              : tenant?.slug === 'hornbadmeinberg'
              ? 'https://www.horn-badmeinberg.de/Rechtliches/Impressum/'
              : withTenant("/impressum")
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Impressum
          </a>
          <a 
            href={tenant?.slug === 'schieder' 
              ? 'https://www.horn-badmeinberg.de/Startseite/Datenschutzerklärung' 
              : tenant?.slug === 'barntrup'
              ? 'https://www.barntrup.de/datenschutz'
              : tenant?.slug === 'hornbadmeinberg'
              ? 'https://www.horn-badmeinberg.de/Rechtliches/Datenschutz/'
              : withTenant("/datenschutz")
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Datenschutz
          </a>
        </div>
      </div>
    </header>
  );
}
