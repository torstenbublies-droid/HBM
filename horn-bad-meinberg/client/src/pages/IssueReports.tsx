import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lightbulb, Trees, Trash2, MoreHorizontal, Baby, AlertTriangle, Navigation, Camera, MapPin, Send, X } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useWithTenant } from "@/utils/tenantUrl";

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const categories: Category[] = [
  {
    id: "Beleuchtung",
    name: "Beleuchtung",
    description: "Defekte Straßenbeleuchtung, dunkle Bereiche",
    icon: <Lightbulb size={32} />,
    color: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
  },
  {
    id: "Grünflächen",
    name: "Grünflächen",
    description: "Beschädigte Parks, überwucherte Bereiche",
    icon: <Trees size={32} />,
    color: "bg-green-50 border-green-200 hover:bg-green-100"
  },
  {
    id: "Müll & Verschmutzung",
    name: "Müll & Verschmutzung",
    description: "Illegale Müllablagerung, verschmutzte Bereiche",
    icon: <Trash2 size={32} />,
    color: "bg-gray-50 border-gray-200 hover:bg-gray-100"
  },
  {
    id: "Sonstiges",
    name: "Sonstiges",
    description: "Andere Anliegen und Meldungen",
    icon: <MoreHorizontal size={32} />,
    color: "bg-gray-50 border-gray-200 hover:bg-gray-100"
  },
  {
    id: "Spielplätze",
    name: "Spielplätze",
    description: "Defekte Spielgeräte, Sicherheitsprobleme",
    icon: <Baby size={32} />,
    color: "bg-pink-50 border-pink-200 hover:bg-pink-100"
  },
  {
    id: "Straßenschäden",
    name: "Straßenschäden",
    description: "Schlaglöcher, defekte Fahrbahn, Risse",
    icon: <AlertTriangle size={32} />,
    color: "bg-red-50 border-red-200 hover:bg-red-100"
  },
  {
    id: "Vandalismus",
    name: "Vandalismus",
    description: "Beschädigte öffentliche Einrichtungen, Graffiti",
    icon: <AlertTriangle size={32} />,
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100"
  },
  {
    id: "Verkehr & Schilder",
    name: "Verkehr & Schilder",
    description: "Defekte Verkehrsschilder, fehlende Markierungen",
    icon: <Navigation size={32} />,
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100"
  },
];

export default function IssueReports() {
  const { user, isAuthenticated } = useAuth();
  const withTenant = useWithTenant();
  const [step, setStep] = useState<"categories" | "form" | "list">("categories");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: reports, isLoading, refetch } = trpc.issueReports.list.useQuery(
    { myReports: true },
    { enabled: isAuthenticated && step === "list" }
  );

  const createMutation = trpc.issueReports.create.useMutation({
    onSuccess: () => {
      toast.success("Meldung erfolgreich eingereicht!");
      setStep("categories");
      resetForm();
      if (isAuthenticated) {
        refetch();
      }
    },
    onError: () => {
      toast.error("Fehler beim Einreichen der Meldung");
    },
  });

  const resetForm = () => {
    setSelectedCategory(null);
    setDescription("");
    setAddress("");
    setContactInfo("");
    setPhoto(null);
    setLatitude("");
    setLongitude("");
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setStep("form");
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
          toast.success("GPS-Position erfasst");
        },
        () => {
          toast.error("GPS-Position konnte nicht ermittelt werden");
        }
      );
    } else {
      toast.error("GPS wird von Ihrem Browser nicht unterstützt");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !description) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    createMutation.mutate({
      category: selectedCategory.id,
      description,
      address,
      latitude,
      longitude,
      photoUrl: photo || undefined,
      contactEmail: contactInfo || undefined,
    });
  };

  const statusColors = {
    eingegangen: "bg-blue-100 text-blue-800",
    in_bearbeitung: "bg-yellow-100 text-yellow-800",
    erledigt: "bg-green-100 text-green-800",
  };

  const statusLabels = {
    eingegangen: "Eingegangen",
    in_bearbeitung: "In Bearbeitung",
    erledigt: "Erledigt",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-orange-600 text-white py-6">
        <div className="container">
          <Link href={withTenant("/")}>
            <Button variant="ghost" size="sm" className="mb-2 text-white hover:bg-white/20">
              <ArrowLeft size={16} className="mr-2" />
              Zurück
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Mängelmelder</h1>
          <p className="text-white/90 mt-1">
            {step === "categories" && "Wählen Sie eine Kategorie für Ihre Meldung"}
            {step === "form" && "Meldung erstellen"}
            {step === "list" && "Meine Meldungen"}
          </p>
        </div>
      </div>

      <div className="container py-8">
        {/* Categories View */}
        {step === "categories" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className={`p-6 cursor-pointer transition-all border-2 ${category.color}`}
                  onClick={() => handleCategorySelect(category)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-3 text-primary">{category.icon}</div>
                    <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Important Notes */}
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">Wichtige Hinweise</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Ihre Meldung wird automatisch an das zuständige Amt weitergeleitet</li>
                <li>• Bei Angabe Ihrer Kontaktdaten erhalten Sie eine Bestätigung</li>
                <li>• Notfälle melden Sie bitte direkt unter 112 oder 110</li>
                <li>• Die Bearbeitung erfolgt innerhalb weniger Tage</li>
              </ul>
            </Card>

            {isAuthenticated && (
              <div className="mt-6 text-center">
                <Button variant="outline" onClick={() => setStep("list")}>
                  Meine Meldungen anzeigen
                </Button>
              </div>
            )}
          </>
        )}

        {/* Form View */}
        {step === "form" && selectedCategory && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Meldung erstellen</h2>
              <Button variant="ghost" size="sm" onClick={() => { setStep("categories"); resetForm(); }}>
                <X size={16} className="mr-2" />
                Abbrechen
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selected Category Display */}
              <div className={`p-4 rounded-lg border-2 ${selectedCategory.color}`}>
                <div className="flex items-center gap-3">
                  <div className="text-primary">{selectedCategory.icon}</div>
                  <div>
                    <h3 className="font-semibold">{selectedCategory.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedCategory.description}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Beschreibung *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Beschreiben Sie das Problem detailliert..."
                  rows={5}
                  required
                  className="mt-2"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <Label>Foto hinzufügen (optional)</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {photo ? (
                    <div className="relative">
                      <img src={photo} alt="Uploaded" className="max-h-64 mx-auto rounded-lg" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="mt-3"
                        onClick={() => setPhoto(null)}
                      >
                        Foto entfernen
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Camera size={48} className="mx-auto text-gray-400 mb-3" />
                      <p className="text-sm text-muted-foreground mb-3">
                        Foto aufnehmen oder hochladen
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Fotos helfen bei der schnelleren Bearbeitung
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoCapture}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera size={16} className="mr-2" />
                        Kamera öffnen
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="address">Standort *</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Straße, Hausnummer oder genaue Beschreibung"
                    required
                  />
                  <Button type="button" variant="outline" onClick={handleGetLocation}>
                    <MapPin size={16} className="mr-2" />
                    GPS nutzen
                  </Button>
                </div>
                {latitude && longitude && (
                  <p className="text-xs text-muted-foreground mt-2">
                    GPS: {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}
                  </p>
                )}
              </div>

              {/* Contact Info */}
              <div>
                <Label htmlFor="contact">Kontaktdaten (optional)</Label>
                <Input
                  id="contact"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="E-Mail oder Telefonnummer für Rückfragen"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Wenn Sie eine Bestätigung oder Updates erhalten möchten, geben Sie hier Ihre Kontaktdaten an
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  <Send size={16} className="mr-2" />
                  {createMutation.isPending ? "Wird gesendet..." : "Meldung absenden"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setStep("categories"); resetForm(); }}
                >
                  Abbrechen
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* List View */}
        {step === "list" && (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Meine Meldungen</h2>
              <Button onClick={() => setStep("categories")} className="bg-orange-600 hover:bg-orange-700">
                Neue Meldung
              </Button>
            </div>

            {isLoading && (
              <div className="grid gap-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="p-6 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </Card>
                ))}
              </div>
            )}

            {!isLoading && reports && reports.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Sie haben noch keine Meldungen eingereicht.</p>
              </Card>
            )}

            {!isLoading && reports && reports.length > 0 && (
              <div className="grid gap-4">
                {reports.map((report) => (
                  <Card key={report.id} className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{report.category}</h3>
                        <p className="text-sm text-muted-foreground">
                          Ticket: {report.ticketNumber}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusColors[report.status]
                        }`}
                      >
                        {statusLabels[report.status]}
                      </span>
                    </div>
                    
                    {report.photoUrl && (
                      <img src={report.photoUrl} alt="Report" className="w-full max-h-48 object-cover rounded-lg mb-3" />
                    )}
                    
                    <p className="text-muted-foreground mb-3">{report.description}</p>
                    
                    {report.address && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin size={14} />
                        <span>{report.address}</span>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Gemeldet am {format(new Date(report.createdAt!), "dd.MM.yyyy, HH:mm", { locale: de })} Uhr
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

