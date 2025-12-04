import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useWithTenant } from "@/utils/tenantUrl";

export default function ServiceGewerbe() {
  const withTenant = useWithTenant();
  
  const handleStart = () => {
    const gewerbeUrl = "https://meineverwaltung.nrw/leistung/99050012104000";
    window.open(gewerbeUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="bg-indigo-600 text-white py-8">
        <div className="container">
          <Link href={withTenant("/services")}>
            <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zu Services
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-2xl">
              <Briefcase size={32} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Gewerbe an-/um-/abmelden</h1>
              <p className="text-white/90 mt-1">Online über Serviceportal.NRW</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 max-w-3xl">
        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Gewerbe melden</h2>
              <p className="text-muted-foreground text-lg">
                Gewerbeangelegenheiten online über das Serviceportal.NRW erledigen.
              </p>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Gewerbeanmeldung</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Jeder, der ein Gewerbe betreiben möchte, muss dies beim Gewerbeamt anmelden. 
                Dies gilt für:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Einzelunternehmen</li>
                <li>• Personengesellschaften (GbR, OHG, KG)</li>
                <li>• Kapitalgesellschaften (GmbH, UG, AG)</li>
                <li>• Freiberufler mit gewerblicher Nebentätigkeit</li>
              </ul>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Gewerbeummeldung</h3>
              <p className="text-sm text-muted-foreground">
                Bei Änderungen müssen Sie Ihr Gewerbe ummelden:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>• Änderung der Betriebsstätte (Umzug)</li>
                <li>• Änderung des Betriebsgegenstandes</li>
                <li>• Änderung der Rechtsform</li>
                <li>• Übernahme/Verkauf des Betriebs</li>
              </ul>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Gewerbeabmeldung</h3>
              <p className="text-sm text-muted-foreground">
                Bei Aufgabe oder Verlegung des Gewerbes muss dies dem Gewerbeamt mitgeteilt werden.
              </p>
            </div>

            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold mb-3">Benötigte Unterlagen</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Personalausweis oder Reisepass</li>
                <li>• Bei ausländischen Staatsangehörigen: Aufenthaltstitel</li>
                <li>• Bei bestimmten Gewerben: Erlaubnisse/Nachweise</li>
                <li>• Bei Gesellschaften: Gesellschaftsvertrag, Handelsregisterauszug</li>
                <li>• Gebühr: ca. 20-40 € (je nach Art der Meldung)</li>
              </ul>
            </div>



            <Button 
              onClick={handleStart}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              size="lg"
            >
              <Briefcase className="mr-2 h-5 w-5" />
              Zum Serviceportal
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>

            <div className="pt-6 border-t">
              <h3 className="font-semibold mb-3">Was passiert nach der Anmeldung?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Nach der Gewerbeanmeldung werden automatisch informiert:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Finanzamt (für steuerliche Erfassung)</li>
                <li>• IHK oder Handwerkskammer (Pflichtmitgliedschaft)</li>
                <li>• Berufsgenossenschaft (Unfallversicherung)</li>
                <li>• Gewerbeaufsicht (bei bestimmten Gewerben)</li>
              </ul>
            </div>

            <div className="pt-6 border-t">
              <h3 className="font-semibold mb-3">Kontakt Gewerbeamt</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong>Gewerbeamt Horn-Bad Meinberg</strong></p>
                <p>Domäne 3</p>
                <p>32816 Horn-Bad Meinberg</p>
                <p>Telefon: 05234 / 201 - 0</p>
                <p>E-Mail: gewerbe@horn-badmeinberg.de</p>
                <p>Öffnungszeiten: Mo: 8:30-12:00 &amp; 14:00-16:00, Di: 8:30-12:00, Mi: 7:30-12:30, Do: 8:30-12:00 &amp; 14:00-17:30, Fr: 8:30-12:00</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

