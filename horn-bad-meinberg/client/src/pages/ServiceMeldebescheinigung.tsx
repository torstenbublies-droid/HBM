import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useWithTenant } from "@/utils/tenantUrl";

export default function ServiceMeldebescheinigung() {
  const withTenant = useWithTenant();
  
  const handleStart = () => {
    const portalUrl = "https://meineverwaltung.nrw/leistung/99115003012000";
    window.open(portalUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-green-600 text-white py-8">
        <div className="container">
          <Link href={withTenant("/services")}>
            <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zu Services
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-2xl">
              <FileText size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Meldebescheinigung</h1>
              <p className="text-white/90 mt-1">Online beantragen</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-3xl">
        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Meldebescheinigung beantragen</h2>
              <p className="text-muted-foreground text-lg">
                Wohnsitz- oder Lebensbescheinigung online starten. Zahlung und Versand 
                erfolgen über das Serviceportal.
              </p>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Was ist eine Meldebescheinigung?</h3>
              <p className="text-sm text-muted-foreground">
                Eine Meldebescheinigung bestätigt Ihren aktuellen Wohnsitz oder frühere Wohnsitze. 
                Sie wird häufig benötigt für:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Behördliche Anträge</li>
                <li>• Rentenanträge</li>
                <li>• Versicherungen</li>
                <li>• Arbeitgeber</li>
              </ul>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Benötigte Angaben</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Personalausweis oder Reisepass</li>
                <li>• Aktuelle Adresse</li>
                <li>• Verwendungszweck</li>
                <li>• Gebühr: ca. 10 €</li>
              </ul>
            </div>



            <Button 
              onClick={handleStart}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              <FileText className="mr-2 h-5 w-5" />
              Antrag starten
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>

            <div className="pt-6 border-t">
              <h3 className="font-semibold mb-3">Kontakt</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Bürgerbüro</strong></p>
                <p>Telefon: 05234 / 201 - 0</p>
                <p>E-Mail: buergerbuero@horn-badmeinberg.de</p>
                <p>Öffnungszeiten: Mo: 8:30-12:00 &amp; 14:00-16:00, Di: 8:30-12:00, Mi: 7:30-12:30, Do: 8:30-12:00 &amp; 14:00-17:30, Fr: 8:30-12:00</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

