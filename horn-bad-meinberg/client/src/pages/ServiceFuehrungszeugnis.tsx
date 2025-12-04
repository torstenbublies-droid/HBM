import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useWithTenant } from "@/utils/tenantUrl";

export default function ServiceFuehrungszeugnis() {
  const withTenant = useWithTenant();
  
  const handleStart = () => {
    window.open("https://www.fuehrungszeugnis.bund.de", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-purple-600 text-white py-8">
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
              <h1 className="text-3xl md:text-4xl font-bold">Führungszeugnis</h1>
              <p className="text-white/90 mt-1">Online beim Bundesamt beantragen</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-3xl">
        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Führungszeugnis beantragen</h2>
              <p className="text-muted-foreground text-lg">
                Schnell online beim Bundesamt für Justiz – mit Online-Ausweisfunktion (eID).
              </p>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Was ist ein Führungszeugnis?</h3>
              <p className="text-sm text-muted-foreground">
                Das Führungszeugnis gibt Auskunft über im Bundeszentralregister gespeicherte 
                Verurteilungen. Es wird häufig benötigt für:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Bewerbungen (z.B. im öffentlichen Dienst)</li>
                <li>• Ehrenamtliche Tätigkeiten (z.B. Jugendarbeit)</li>
                <li>• Gewerbeanmeldungen</li>
                <li>• Adoption oder Pflegschaft</li>
              </ul>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Voraussetzungen</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Personalausweis mit aktivierter Online-Ausweisfunktion (eID)</li>
                <li>• AusweisApp2 auf Smartphone oder Computer</li>
                <li>• Kartenlesegerät oder NFC-fähiges Smartphone</li>
                <li>• Gebühr: 13 € (online bezahlbar)</li>
              </ul>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="font-semibold mb-2 text-purple-900 dark:text-purple-100">
                Wichtig
              </h3>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                Sie werden zum offiziellen Portal des Bundesamts für Justiz weitergeleitet. 
                Das Führungszeugnis wird direkt an Ihre Wohnadresse geschickt (Zustellung ca. 2 Wochen).
              </p>
            </div>

            <Button 
              onClick={handleStart}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              <FileText className="mr-2 h-5 w-5" />
              Zum Bundesportal
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>

            <div className="pt-6 border-t">
              <h3 className="font-semibold mb-3">Alternative: Persönlich beantragen</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Sie können das Führungszeugnis auch persönlich im Bürgerbüro beantragen:
              </p>
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

