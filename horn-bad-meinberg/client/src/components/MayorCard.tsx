import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Mail, Phone, User } from "lucide-react";
import { Link } from "wouter";
import { useWithTenant } from "@/utils/tenantUrl";

export default function MayorCard() {
  const { data: mayor, isLoading } = trpc.mayor.info.useQuery();
  const withTenant = useWithTenant();

  if (isLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-muted rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        </div>
      </Card>
    );
  }

  if (!mayor) {
    return null;
  }

  return (
    <Link href={withTenant("/council")}>
      <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="relative">
            {mayor.photoUrl ? (
              <img
                src={mayor.photoUrl}
                alt={mayor.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User size={32} className="text-primary" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{mayor.name}</h3>
            <p className="text-sm text-muted-foreground">
              {mayor.position || "Bürgermeister"}
              {mayor.party && ` · ${mayor.party}`}
            </p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
              {mayor.email && (
                <div className="flex items-center gap-1">
                  <Mail size={14} />
                  <span>{mayor.email}</span>
                </div>
              )}
              {mayor.phone && (
                <div className="flex items-center gap-1">
                  <Phone size={14} />
                  <span>{mayor.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

