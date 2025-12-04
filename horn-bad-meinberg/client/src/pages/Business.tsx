import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useWithTenant } from "@/utils/tenantUrl";

export default function Business() {
  const withTenant = useWithTenant();
  
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-amber-600 text-white py-6">
        <div className="container">
          <Link href={withTenant("/")}>
            <Button variant="ghost" size="sm" className="mb-2 text-white hover:bg-white/20">
              <ArrowLeft size={16} className="mr-2" />
              Zurück
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Wirtschaft & Bauen</h1>
          <p className="text-white/90 mt-1">Ausschreibungen und Bebauungspläne</p>
        </div>
      </div>

      <div className="container py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Informationen zu Ausschreibungen und Bebauungsplänen folgen in Kürze.</p>
        </Card>
      </div>
    </div>
  );
}
