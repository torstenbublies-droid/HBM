import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Phone, Mail, MapPin, Send, CheckCircle, Printer } from "lucide-react";
import { Link, useSearch } from "wouter";
import { toast } from "sonner";
import { useWithTenant } from "@/utils/tenantUrl";

export default function Contact() {
  const withTenant = useWithTenant();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const tenant = params.get('tenant') || 'hornbadmeinberg';
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !subject || !message) {
      toast.error("Bitte füllen Sie alle Pflichtfelder aus");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/contact-request?tenant=${tenant}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          subject,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit contact request');
      }

      setIsSuccess(true);
      toast.success("Ihre Anfrage wurde erfolgreich übermittelt!");
      
    } catch (error) {
      console.error('Error submitting contact request:', error);
      toast.error("Fehler beim Senden. Bitte versuchen Sie es erneut.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewRequest = () => {
    setIsSuccess(false);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setSubject("");
    setMessage("");
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
          <h1 className="text-3xl font-bold">Kontakt & Anliegen</h1>
          <p className="text-primary-foreground/90 mt-1">So erreichen Sie uns</p>
        </div>
      </div>

      <div className="container py-8">
        {/* Success Message */}
        {isSuccess ? (
          <Card className="p-8 mb-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-600">Anfrage erfolgreich übermittelt!</h2>
              <p className="text-muted-foreground max-w-md">
                Vielen Dank für Ihre Nachricht. Wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich bei Ihnen melden.
              </p>
              <Button onClick={handleNewRequest} className="mt-4">
                Weitere Anfrage stellen
              </Button>
            </div>
          </Card>
        ) : (
          /* Contact Form */
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Ihr Anliegen</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Haben Sie eine Frage oder ein Anliegen? Schreiben Sie uns direkt über dieses Formular.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Vorname *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ihr Vorname"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nachname *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ihr Nachname"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">E-Mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ihre.email@beispiel.de"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Für Rückmeldungen
                  </p>
                </div>
                <div>
                  <Label htmlFor="phone">Telefon (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0123 456789"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Betreff *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Worum geht es?"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Ihr Anliegen *</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Beschreiben Sie Ihr Anliegen..."
                  rows={6}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto"
              >
                <Send size={16} className="mr-2" />
                {isSubmitting ? "Wird gesendet..." : "Anfrage absenden"}
              </Button>
            </form>
          </Card>
        )}

        {/* Contact Information */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Stadt Horn-Bad Meinberg</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Adresse</p>
                <p className="text-muted-foreground">Marktplatz 4</p>
                <p className="text-muted-foreground">32805 Horn-Bad Meinberg</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={20} className="text-primary" />
              <div>
                <p className="font-medium">Telefon</p>
                <a href="tel:+4952342010" className="text-primary hover:underline">05234 / 201 - 0</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Printer size={20} className="text-primary" />
              <div>
                <p className="font-medium">Fax</p>
                <p className="text-muted-foreground">05234 / 201 - 222</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-primary" />
              <div>
                <p className="font-medium">E-Mail</p>
                <a href="mailto:post@horn-badmeinberg.de" className="text-primary hover:underline">
                  post@horn-badmeinberg.de
                </a>
              </div>
            </div>
          </div>
        </Card>

        {/* Opening Hours */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Öffnungszeiten</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Montag:</span>
              <span className="text-muted-foreground">8:30 - 12:00 Uhr und 14:00 - 16:00 Uhr</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Dienstag:</span>
              <span className="text-muted-foreground">8:30 - 12:00 Uhr</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Mittwoch:</span>
              <span className="text-muted-foreground">7:30 - 12:30 Uhr</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Donnerstag:</span>
              <span className="text-muted-foreground">8:30 - 12:00 Uhr und 14:00 - 17:30 Uhr</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Freitag:</span>
              <span className="text-muted-foreground">8:30 - 12:00 Uhr</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
