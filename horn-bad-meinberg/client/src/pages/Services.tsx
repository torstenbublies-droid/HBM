import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, FileText, Dog, Building, Briefcase } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useWithTenant } from "@/utils/tenantUrl";

interface Service {
  id: string;
  title: string;
  icon: React.ReactNode;
  route: string;
  color: string;
}

const services: Service[] = [
  {
    id: "termine",
    title: "Termin Rathaus",
    icon: <Calendar size={28} />,
    route: "/service/termine",
    color: "bg-blue-600"
  },
  {
    id: "meldebescheinigung",
    title: "Meldebescheinigung",
    icon: <FileText size={28} />,
    route: "/service/meldebescheinigung",
    color: "bg-green-600"
  },
  {
    id: "hund",
    title: "Hund anmelden/abmelden",
    icon: <Dog size={28} />,
    route: "/service/hundesteuer",
    color: "bg-amber-600"
  },
  {
    id: "fuehrungszeugnis",
    title: "Führungszeugnis",
    icon: <FileText size={28} />,
    route: "/service/fuehrungszeugnis",
    color: "bg-purple-600"
  },

  {
    id: "bauen",
    title: "Bauantrag / Voranfrage",
    icon: <Building size={28} />,
    route: "/service/bauen",
    color: "bg-orange-600"
  },
  {
    id: "gewerbe",
    title: "Gewerbe an-/um-/abmelden",
    icon: <Briefcase size={28} />,
    route: "/service/gewerbe",
    color: "bg-indigo-600"
  }
];

export default function Services() {
  const withTenant = useWithTenant();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-primary text-white py-8">
        <div className="container">
          <Link href={withTenant("/")}>
            <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">Bürger-Services</h1>
          <p className="text-primary-foreground/90 mt-2">
            Ihre Online-Services für Horn-Bad Meinberg
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link key={service.id} href={withTenant(service.route)}>
              <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer h-full flex flex-col items-center justify-center text-center gap-4">
                <div className={`${service.color} text-white p-4 rounded-2xl`}>
                  {service.icon}
                </div>
                <h3 className="font-semibold text-lg">{service.title}</h3>
              </Card>
            </Link>
          ))}
        </div>

        {/* Info Box */}
        <Card className="mt-8 p-6 bg-muted/50">
          <h3 className="font-semibold mb-2">Weitere Services</h3>
          <p className="text-sm text-muted-foreground">
            Weitere Services wie Mängelmelder, Kontakt & Anliegen sowie der Schwalenbot 
            sind direkt auf der Startseite verfügbar.
          </p>
        </Card>
      </div>
    </div>
  );
}

