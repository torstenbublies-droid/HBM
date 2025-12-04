import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useWithTenant } from "@/utils/tenantUrl";

export default function ServiceBauen() {
  const withTenant = useWithTenant();
  
  const handleStart = () => {
    const bauportalUrl = "https://www.kreis-lippe.de/kreis-lippe/optigov?ansicht=dienstleistung&eintrag=195";
    window.open(bauportalUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-orange-600 text-white py-8">
        <div className="container">
          <Link href={withTenant("/services")}>
            <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zu Services
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-2xl">
              <Building size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Bauantrag / Voranfrage</h1>
              <p className="text-white/90 mt-1">Baugenehmigung beantragen</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-3xl">
        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Bauantrag stellen</h2>
              <p className="text-muted-foreground text-lg">
                Für Baugenehmigungen ist der Kreis Lippe zuständig. Hier gelangst du direkt 
                zum Bauportal.
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-950/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
              <h3 className="font-semibold mb-2 text-orange-900 dark:text-orange-100">
                Zuständigkeit
              </h3>
              <p className="text-sm text-orange-800 dark:text-orange-200">
                Die Baugenehmigungsbehörde für Horn-Bad Meinberg ist beim Kreis Lippe angesiedelt. 
                Alle Bauanträge und Bauvoranfragen werden dort bearbeitet.
              </p>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Wann brauche ich eine Baugenehmigung?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Eine Baugenehmigung ist in der Regel erforderlich für:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Neubauten (Wohnhäuser, Gewerbebauten)</li>
                <li>• Anbauten und Aufstockungen</li>
                <li>• Nutzungsänderungen</li>
                <li>• Größere Umbauten</li>
                <li>• Garagen und Carports (ab bestimmter Größe)</li>
              </ul>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Benötigte Unterlagen</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Bauzeichnungen (Grundrisse, Ansichten, Schnitte)</li>
                <li>• Lageplan</li>
                <li>• Baubeschreibung</li>
                <li>• Berechnungen (Wohnfläche, umbauter Raum)</li>
                <li>• Statische Berechnungen (bei Bedarf)</li>
                <li>• Nachweis der Bauvorlageberechtigung (Architekt/Ingenieur)</li>
              </ul>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Bauvoranfrage</h3>
              <p className="text-sm text-muted-foreground">
                Vor dem eigentlichen Bauantrag können Sie eine Bauvoranfrage stellen, um 
                grundsätzliche Fragen zu klären (z.B. ob ein Bauvorhaben grundsätzlich genehmigungsfähig ist). 
                Dies spart Zeit und Kosten.
              </p>
            </div>

            <Button 
              onClick={handleStart}
              className="w-full bg-orange-600 hover:bg-orange-700"
              size="lg"
            >
              <Building className="mr-2 h-5 w-5" />
              Zum Bauportal
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>

            <div className="pt-6 border-t">
              <h3 className="font-semibold mb-3">Kontakt Bauamt Kreis Lippe</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Kreis Lippe - Bauaufsicht</strong></p>
                <p>Felix-Fechenbach-Straße 5</p>
                <p>32756 Detmold</p>
                <p>Telefon: 05231 / 62-0</p>
                <p>E-Mail: bauaufsicht@kreis-lippe.de</p>
                <p>Öffnungszeiten: Mo: 8:30-12:00 &amp; 14:00-16:00, Di: 8:30-12:00, Mi: 7:30-12:30, Do: 8:30-12:00 &amp; 14:00-17:30, Fr: 8:30-12:00</p>
              </div>
            </div>

            <div className="pt-6 border-t">
              <h3 className="font-semibold mb-3">Beratung vor Ort</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Für allgemeine Fragen zum Bauen in Horn-Bad Meinberg können Sie sich auch 
                an das Bauamt der Stadt wenden:
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Telefon: 05234 / 201 - 0</p>
                <p>E-Mail: bauamt@horn-badmeinberg.de</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

