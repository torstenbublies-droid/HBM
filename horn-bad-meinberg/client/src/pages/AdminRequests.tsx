import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, User, Calendar, MessageSquare, Dog, Loader2 } from "lucide-react";
import { Link, useSearch } from "wouter";
import { useWithTenant } from "@/utils/tenantUrl";
import { toast } from "sonner";

interface ContactRequest {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category?: string;
  status: string;
  created_at: string;
}

interface DogRegistration {
  id: number;
  registration_type: 'register' | 'deregister';
  owner_first_name: string;
  owner_last_name: string;
  owner_email: string;
  owner_phone?: string;
  owner_street: string;
  owner_house_number: string;
  owner_zip: string;
  owner_city: string;
  dog_name: string;
  dog_breed: string;
  dog_gender?: string;
  dog_birth_date?: string;
  dog_chip_number?: string;
  dog_keeping_start?: string;
  dog_from_other_municipality: boolean;
  sepa_iban: string;
  sepa_account_holder: string;
  status: string;
  created_at: string;
}

export default function AdminRequests() {
  const withTenant = useWithTenant();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const tenant = params.get('tenant') || 'hornbadmeinberg';
  
  const [activeTab, setActiveTab] = useState<'contact' | 'dogs'>('contact');
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>([]);
  const [dogRegistrations, setDogRegistrations] = useState<DogRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);
  const [selectedDog, setSelectedDog] = useState<DogRegistration | null>(null);

  useEffect(() => {
    fetchData();
  }, [tenant]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch contact requests
      const contactResponse = await fetch(`/api/contact-requests?tenant=${tenant}`);
      if (contactResponse.ok) {
        const contactData = await contactResponse.json();
        setContactRequests(contactData);
      }

      // Fetch dog registrations
      const dogResponse = await fetch(`/api/dog-registrations?tenant=${tenant}`);
      if (dogResponse.ok) {
        const dogData = await dogResponse.json();
        setDogRegistrations(dogData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };
    const labels = {
      pending: 'Offen',
      processed: 'In Bearbeitung',
      completed: 'Abgeschlossen'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container">
          <Link href={withTenant("/")}>
            <Button variant="ghost" size="sm" className="mb-2 text-primary-foreground hover:bg-primary-foreground/20">
              <ArrowLeft size={16} className="mr-2" />
              Zurück
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Anfragen-Verwaltung</h1>
          <p className="text-primary-foreground/90 mt-1">Übersicht aller Bürger-Anfragen</p>
        </div>
      </div>

      <div className="container py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'contact' ? 'default' : 'outline'}
            onClick={() => setActiveTab('contact')}
            className="flex items-center gap-2"
          >
            <MessageSquare size={16} />
            Kontakt-Anfragen ({contactRequests.length})
          </Button>
          <Button
            variant={activeTab === 'dogs' ? 'default' : 'outline'}
            onClick={() => setActiveTab('dogs')}
            className="flex items-center gap-2"
          >
            <Dog size={16} />
            Hundeanmeldungen ({dogRegistrations.length})
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Contact Requests Tab */}
            {activeTab === 'contact' && (
              <div className="grid gap-4">
                {contactRequests.length === 0 ? (
                  <Card className="p-8 text-center text-muted-foreground">
                    <MessageSquare className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Keine Kontakt-Anfragen vorhanden</p>
                  </Card>
                ) : (
                  contactRequests.map((request) => (
                    <Card key={request.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedRequest(request)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{request.subject}</h3>
                            {getStatusBadge(request.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User size={14} />
                              <span>{request.first_name} {request.last_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{formatDate(request.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {selectedRequest?.id === request.id && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail size={16} className="text-primary" />
                            <a href={`mailto:${request.email}`} className="text-primary hover:underline">
                              {request.email}
                            </a>
                          </div>
                          {request.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone size={16} className="text-primary" />
                              <a href={`tel:${request.phone}`} className="text-primary hover:underline">
                                {request.phone}
                              </a>
                            </div>
                          )}
                          <div className="mt-4">
                            <p className="font-medium mb-2">Nachricht:</p>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-4 rounded">
                              {request.message}
                            </p>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            )}

            {/* Dog Registrations Tab */}
            {activeTab === 'dogs' && (
              <div className="grid gap-4">
                {dogRegistrations.length === 0 ? (
                  <Card className="p-8 text-center text-muted-foreground">
                    <Dog className="mx-auto mb-4 h-12 w-12 opacity-50" />
                    <p>Keine Hundeanmeldungen vorhanden</p>
                  </Card>
                ) : (
                  dogRegistrations.map((dog) => (
                    <Card key={dog.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedDog(dog)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">
                              {dog.registration_type === 'register' ? '🐕 Anmeldung' : '❌ Abmeldung'}: {dog.dog_name}
                            </h3>
                            {getStatusBadge(dog.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User size={14} />
                              <span>{dog.owner_first_name} {dog.owner_last_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{formatDate(dog.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {selectedDog?.id === dog.id && (
                        <div className="mt-4 pt-4 border-t space-y-4">
                          <div>
                            <p className="font-medium mb-2">Halter:</p>
                            <div className="text-sm space-y-1 text-muted-foreground">
                              <p>{dog.owner_first_name} {dog.owner_last_name}</p>
                              <p>{dog.owner_street} {dog.owner_house_number}</p>
                              <p>{dog.owner_zip} {dog.owner_city}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Mail size={16} className="text-primary" />
                                <a href={`mailto:${dog.owner_email}`} className="text-primary hover:underline">
                                  {dog.owner_email}
                                </a>
                              </div>
                              {dog.owner_phone && (
                                <div className="flex items-center gap-2">
                                  <Phone size={16} className="text-primary" />
                                  <a href={`tel:${dog.owner_phone}`} className="text-primary hover:underline">
                                    {dog.owner_phone}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <p className="font-medium mb-2">Hund:</p>
                            <div className="text-sm space-y-1 text-muted-foreground">
                              <p><strong>Rasse:</strong> {dog.dog_breed}</p>
                              {dog.dog_gender && <p><strong>Geschlecht:</strong> {dog.dog_gender}</p>}
                              {dog.dog_birth_date && <p><strong>Geburtsdatum:</strong> {dog.dog_birth_date}</p>}
                              {dog.dog_chip_number && <p><strong>Chip-Nummer:</strong> {dog.dog_chip_number}</p>}
                              {dog.dog_keeping_start && <p><strong>Haltungsbeginn:</strong> {dog.dog_keeping_start}</p>}
                            </div>
                          </div>
                          
                          <div>
                            <p className="font-medium mb-2">SEPA-Lastschrift:</p>
                            <div className="text-sm space-y-1 text-muted-foreground">
                              <p><strong>IBAN:</strong> {dog.sepa_iban}</p>
                              <p><strong>Kontoinhaber:</strong> {dog.sepa_account_holder}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
