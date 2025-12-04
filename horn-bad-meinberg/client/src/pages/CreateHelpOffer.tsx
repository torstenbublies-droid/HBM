import { useState } from "react";
import { useLocation } from "wouter";
import { useTenant } from "@/contexts/TenantContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, HandHeart, Info, CheckCircle } from "lucide-react";

const STEPS = [
  { id: 1, title: "Einführung" },
  { id: 2, title: "Kategorie" },
  { id: 3, title: "Beschreibung" },
  { id: 4, title: "Verfügbarkeit" },
  { id: 5, title: "Kontakt" },
  { id: 6, title: "Zusammenfassung" }
];

const CATEGORIES = [
  { value: "shopping", label: "🛒 Einkaufen", description: "Lebensmittel, Apotheke, Besorgungen" },
  { value: "transport", label: "🚗 Fahrdienste", description: "Fahrt zum Arzt, Einkauf, Behörde" },
  { value: "childcare", label: "👶 Kinderbetreuung", description: "Kurzzeitige Betreuung" },
  { value: "escort", label: "🤝 Begleitung", description: "Arzt, Behörde, Spaziergang" },
  { value: "household", label: "🏡 Haus & Garten", description: "Kleine Reparaturen, Gartenarbeit" },
  { value: "tech", label: "💻 Technik-Hilfe", description: "Computer, Smartphone, Internet" },
  { value: "pet", label: "🐕 Haustierbetreuung", description: "Gassi gehen, Füttern" },
  { value: "other", label: "📋 Sonstiges", description: "Andere Hilfe" }
];

export default function CreateHelpOffer() {
  const [, navigate] = useLocation();
  const { tenant } = useTenant();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    categories: [] as string[],
    description: "",
    availability: "",
    district: "",
    radius: "3",
    contactMethod: "app",
    phoneNumber: "",
    consentData: false,
    consentAutoDelete: false
  });

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleCategory = (category: string) => {
    if (formData.categories.includes(category)) {
      setFormData({
        ...formData,
        categories: formData.categories.filter(c => c !== category)
      });
    } else {
      setFormData({
        ...formData,
        categories: [...formData.categories, category]
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`/api/neighborhood-help/offers?tenant=${tenant?.slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categories: formData.categories,
          description: formData.description,
          district: formData.district,
          radius: parseInt(formData.radius),
          availability: formData.availability,
          contactMethod: formData.contactMethod,
          phoneNumber: formData.phoneNumber,
          userId: 'user-' + Date.now(), // TODO: Replace with actual user ID
          userName: 'Anonymer Nutzer' // TODO: Replace with actual user name
        }),
      });

      if (response.ok) {
        alert("Ihr Angebot wurde erfolgreich erstellt!");
        navigate("/neighborhood-help");
      } else {
        alert("Fehler beim Erstellen des Angebots. Bitte versuchen Sie es erneut.");
      }
    } catch (error) {
      console.error('Error submitting offer:', error);
      alert("Fehler beim Erstellen des Angebots. Bitte versuchen Sie es erneut.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Green Header */}
      <div className="bg-green-600 text-white px-4 py-6">
        <div className="container mx-auto max-w-3xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/neighborhood-help")}
            className="text-white hover:bg-green-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          
          <div className="flex items-center gap-3">
            <HandHeart className="h-8 w-8" />
            <h1 className="text-2xl font-bold">Hilfe anbieten</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex flex-col items-center ${index < STEPS.length - 1 ? 'flex-1' : ''}`}>
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step.id 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? <CheckCircle className="h-5 w-5" /> : step.id}
                  </div>
                  <span className="text-xs mt-2 hidden md:block">{step.title}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`h-1 flex-1 mx-2 ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-6">
          {/* Step 1: Einführung */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Willkommen bei der Nachbarschaftshilfe</h2>
                <p className="text-gray-600 mb-4">
                  Vielen Dank, dass Sie anderen helfen möchten! 
                  So funktioniert's:
                </p>
              </div>

              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900 space-y-2">
                    <p><strong>1. Angebot erstellen:</strong> Beschreiben Sie, wobei Sie helfen können</p>
                    <p><strong>2. Benachrichtigung:</strong> Sie werden informiert, wenn jemand Ihre Hilfe braucht</p>
                    <p><strong>3. Kontakt:</strong> Sie können Anfragen annehmen oder ablehnen</p>
                    <p><strong>4. Helfen:</strong> Koordinieren Sie die Details im privaten Chat</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-green-50 border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-green-900">
                    <p className="font-semibold mb-2">Datenschutz:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Ihr Angebot wird nur im gewählten Umkreis angezeigt</li>
                      <li>Ihre Kontaktdaten bleiben zunächst anonym</li>
                      <li>Erst nach Annahme einer Anfrage werden Details ausgetauscht</li>
                      <li>Sie können Ihr Angebot jederzeit pausieren oder löschen</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-yellow-50 border-yellow-200">
                <div className="text-sm text-yellow-900">
                  <p className="font-semibold mb-2">⚠️ Wichtige Hinweise:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Helfen Sie nur bei Tätigkeiten, die Sie sicher ausführen können</li>
                    <li>Treffen Sie sich bei Bedarf an öffentlichen Orten</li>
                    <li>Bei Problemen nutzen Sie die Melde-Funktion</li>
                  </ul>
                </div>
              </Card>
            </div>
          )}

          {/* Step 2: Kategorie */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Bei welchen Tätigkeiten können Sie helfen?</h2>
                <p className="text-gray-600">Sie können mehrere Kategorien auswählen</p>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <Card
                    key={cat.value}
                    className={`p-4 cursor-pointer transition-all ${
                      formData.categories.includes(cat.value)
                        ? 'border-green-600 bg-green-50 border-2'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => toggleCategory(cat.value)}
                  >
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={formData.categories.includes(cat.value)}
                        className="mt-1"
                      />
                      <div>
                        <div className="text-lg font-semibold mb-1">{cat.label}</div>
                        <div className="text-sm text-gray-600">{cat.description}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Beschreibung */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Beschreiben Sie Ihr Angebot</h2>
                <p className="text-gray-600">Was können Sie konkret anbieten?</p>
              </div>

              <div>
                <Label htmlFor="description">
                  Beschreibung <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="z.B. Ich kann beim Einkaufen helfen, fahre gerne zum Arzt oder unterstütze bei kleinen Gartenarbeiten..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  maxLength={500}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.description.length}/500 Zeichen
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Verfügbarkeit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Wann und wo können Sie helfen?</h2>
                <p className="text-gray-600">Geben Sie Ihre Verfügbarkeit an</p>
              </div>

              <div>
                <Label htmlFor="district">
                  Ihr Stadtteil/Bereich <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.district}
                  onValueChange={(value) => setFormData({ ...formData, district: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Stadtteil wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="horn">Horn</SelectItem>
                    <SelectItem value="bad-meinberg">Bad Meinberg</SelectItem>
                    <SelectItem value="bellenberg">Bellenberg</SelectItem>
                    <SelectItem value="billerbeck">Billerbeck</SelectItem>
                    <SelectItem value="belle">Belle</SelectItem>
                    <SelectItem value="fissenknick">Fissenknick</SelectItem>
                    <SelectItem value="fromhausen">Fromhausen</SelectItem>
                    <SelectItem value="heesten">Heesten</SelectItem>
                    <SelectItem value="holzhausen-externsteine">Holzhausen-Externsteine</SelectItem>
                    <SelectItem value="schmedissen">Schmedissen</SelectItem>
                    <SelectItem value="vahlhausen">Vahlhausen</SelectItem>
                    <SelectItem value="wehren">Wehren</SelectItem>
                    <SelectItem value="wilberg">Wilberg</SelectItem>
                    <SelectItem value="kempen">Kempen</SelectItem>
                    <SelectItem value="bensen">Bensen</SelectItem>
                    <SelectItem value="erder">Erder</SelectItem>
                    <SelectItem value="hoppenberg">Hoppenberg</SelectItem>
                    <SelectItem value="veldrom">Veldrom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="radius">Umkreis</Label>
                <Select
                  value={formData.radius}
                  onValueChange={(value) => setFormData({ ...formData, radius: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 km - Nur meine Nachbarschaft</SelectItem>
                    <SelectItem value="3">3 km - Mein Stadtteil</SelectItem>
                    <SelectItem value="5">5 km - Erweiterte Umgebung</SelectItem>
                    <SelectItem value="10">10 km - Gesamte Stadt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="availability">
                  Verfügbarkeit <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="availability"
                  placeholder="z.B. Montag bis Freitag nachmittags, Wochenende flexibel"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 5: Kontakt */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Kontaktmöglichkeiten</h2>
                <p className="text-gray-600">Wie möchten Sie kontaktiert werden?</p>
              </div>

              <div>
                <Label>Kontaktart</Label>
                <div className="space-y-3 mt-2">
                  <Card
                    className={`p-4 cursor-pointer ${
                      formData.contactMethod === "app" ? 'border-green-600 bg-green-50 border-2' : ''
                    }`}
                    onClick={() => setFormData({ ...formData, contactMethod: "app" })}
                  >
                    <div className="font-semibold">📱 In-App-Nachrichten (empfohlen)</div>
                    <div className="text-sm text-gray-600">
                      Sicher und anonym - Ihre Telefonnummer bleibt geschützt
                    </div>
                  </Card>

                  <Card
                    className={`p-4 cursor-pointer ${
                      formData.contactMethod === "phone" ? 'border-green-600 bg-green-50 border-2' : ''
                    }`}
                    onClick={() => setFormData({ ...formData, contactMethod: "phone" })}
                  >
                    <div className="font-semibold">📞 Telefonisch</div>
                    <div className="text-sm text-gray-600">
                      Ihre Nummer wird für Hilfesuchende sichtbar
                    </div>
                  </Card>
                </div>
              </div>

              {formData.contactMethod === "phone" && (
                <div>
                  <Label htmlFor="phone">Telefonnummer</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+49 123 456789"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 6: Zusammenfassung */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Zusammenfassung</h2>
                <p className="text-gray-600">Bitte prüfen Sie Ihre Angaben</p>
              </div>

              <Card className="p-4 bg-gray-50">
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-semibold">Kategorien:</span>{" "}
                    {formData.categories.map(c => CATEGORIES.find(cat => cat.value === c)?.label).join(", ")}
                  </div>
                  <div>
                    <span className="font-semibold">Beschreibung:</span>{" "}
                    {formData.description}
                  </div>
                  <div>
                    <span className="font-semibold">Stadtteil:</span>{" "}
                    {formData.district}
                  </div>
                  <div>
                    <span className="font-semibold">Umkreis:</span>{" "}
                    {formData.radius} km
                  </div>
                  <div>
                    <span className="font-semibold">Verfügbarkeit:</span>{" "}
                    {formData.availability}
                  </div>
                  <div>
                    <span className="font-semibold">Kontakt:</span>{" "}
                    {formData.contactMethod === "app" ? "In-App-Nachrichten" : "Telefonisch"}
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="consent1"
                    checked={formData.consentData}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, consentData: checked as boolean })
                    }
                  />
                  <label htmlFor="consent1" className="text-sm cursor-pointer">
                    Ich bin mit der Verarbeitung meiner Daten für die Nachbarschaftshilfe einverstanden{" "}
                    <a href="#" className="text-blue-600 underline">
                      (Datenschutzhinweise)
                    </a>
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="consent2"
                    checked={formData.consentAutoDelete}
                    onCheckedChange={(checked) => 
                      setFormData({ ...formData, consentAutoDelete: checked as boolean })
                    }
                  />
                  <label htmlFor="consent2" className="text-sm cursor-pointer">
                    Angebot nach 6 Monaten automatisch deaktivieren
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                onClick={nextStep}
                className="bg-green-600 hover:bg-green-700"
                disabled={
                  (currentStep === 2 && formData.categories.length === 0) ||
                  (currentStep === 3 && !formData.description) ||
                  (currentStep === 4 && (!formData.district || !formData.availability))
                }
              >
                Weiter
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700"
                disabled={!formData.consentData}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Angebot veröffentlichen
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
