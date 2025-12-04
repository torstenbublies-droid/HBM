import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, Phone, Building2, Droplet, Zap } from "lucide-react";
import { Link } from "wouter";
import { useWithTenant } from "@/utils/tenantUrl";

export default function Alerts() {
  const { data: alerts, isLoading } = trpc.alerts.active.useQuery();
  const withTenant = useWithTenant();

  const priorityColors = {
    low: "bg-blue-100 text-blue-800 border-blue-300",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
    high: "bg-orange-100 text-orange-800 border-orange-300",
    critical: "bg-red-100 text-red-800 border-red-300",
  };

  const emergencyContacts = [
    { name: "Polizei Notruf", number: "110", icon: AlertTriangle, color: "text-blue-600" },
    { name: "Feuerwehr", number: "112", icon: AlertTriangle, color: "text-red-600" },
    { name: "Ärztlicher Notfalldienst", number: "116 117", icon: Phone, color: "text-green-600" },
    { name: "Krankentransport", number: "05231 / 192 22", icon: Phone, color: "text-orange-600" },
  ];

  const cityContacts = [
    { name: "Rathaus", number: "05234 / 201 - 0", icon: Building2 },
    { name: "Kreispolizei", number: "05231 / 609-0", icon: AlertTriangle },
    { name: "Klinikum Lippe-Detmold", number: "05231 / 72 - 0", icon: Phone },
  ];

  const utilityContacts = [
    { name: "Wasserversorgung", number: "0172 / 60 91 6 55", icon: Droplet },
    { name: "Notdienst Abwasserbeseitigung Stadtwerke", number: "0172 / 52 05 0 52", icon: Droplet },
    { name: "Westfalen Weser Netz", number: "05231 / 20 20 303", icon: Zap },
    { name: "Westnetz (Strom)", number: "0800 / 937 863 89", icon: Zap },
    { name: "Telekom Störungen", number: "0800 / 33 01903", icon: Phone },
  ];

  const additionalHelp = [
    {
      title: "Telefonseelsorge",
      description: "Kostenlos und rund um die Uhr",
      contacts: [
        { type: "Evangelisch", number: "0800 / 1-11 0 111" },
        { type: "Katholisch", number: "0800 / 1-11 0 222" },
      ]
    },
    {
      title: "Gift-Notrufzentrale",
      description: "Bei Vergiftungen",
      contacts: [
        { type: "", number: "0228 / 2873211" },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-6 px-4 shadow-lg">
        <div className="container mx-auto">
          <Link href={withTenant("/")}>
            <Button variant="ghost" className="text-white hover:bg-red-700 mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Notfall & Störungen</h1>
          <p className="text-red-100 mt-2">Aktuelle Warnungen und wichtige Kontakte</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Aktuelle Störungen */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Aktuelle Störungen</h2>
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

          {!isLoading && alerts && alerts.length === 0 && (
            <Card className="p-8 text-center bg-green-50 border-green-200">
              <p className="text-green-700 font-medium">✓ Aktuell keine Warnungen oder Störungen.</p>
            </Card>
          )}

          {!isLoading && alerts && alerts.length > 0 && (
            <div className="grid gap-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className={`border-2 ${priorityColors[alert.priority]}`}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <AlertTriangle size={24} className="flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{alert.title}</h3>
                        <p className="whitespace-pre-line">{alert.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Notfälle */}
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader className="bg-red-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Notfälle
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {emergencyContacts.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border-2 border-red-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${contact.color}`} />
                      <span className="font-medium text-gray-800">{contact.name}</span>
                    </div>
                    <a href={`tel:${contact.number.replace(/\s/g, '')}`} className={`text-xl font-bold ${contact.color} hover:underline`}>
                      {contact.number}
                    </a>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stadt & Verwaltung */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Stadt & Verwaltung
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              {cityContacts.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <div key={index} className="flex flex-col p-4 bg-white rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-gray-800">{contact.name}</span>
                    </div>
                    <a href={`tel:${contact.number.replace(/\s/g, '')}`} className="text-lg font-semibold text-blue-600 hover:underline">
                      {contact.number}
                    </a>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stadtwerke & Versorgung */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader className="bg-green-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Droplet className="h-5 w-5" />
              Stadtwerke & Versorgung
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-4">
              {utilityContacts.map((contact, index) => {
                const Icon = contact.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-800">{contact.name}</span>
                    </div>
                    <a href={`tel:${contact.number.replace(/\s/g, '')}`} className="text-lg font-semibold text-green-600 hover:underline">
                      {contact.number}
                    </a>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Weitere Hilfe */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-800">Weitere Hilfe</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {additionalHelp.map((section, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-gray-800 mb-1">{section.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                  <div className="space-y-2">
                    {section.contacts.map((contact, cIndex) => (
                      <div key={cIndex} className="flex items-center justify-between">
                        {contact.type && <span className="text-sm text-gray-700">{contact.type}:</span>}
                        <a href={`tel:${contact.number.replace(/\s/g, '')}`} className="text-purple-600 font-semibold hover:underline">
                          {contact.number}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Wichtiger Hinweis */}
        <Card className="mt-6 bg-yellow-50 border-yellow-300">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-700">
                  <strong>Wichtiger Hinweis:</strong> Bei lebensbedrohlichen Notfällen wählen Sie sofort 112 (Feuerwehr/Rettungsdienst) oder 110 (Polizei). Diese Apps ersetzen nicht den direkten Notruf!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

