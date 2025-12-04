import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Phone, Mail, MapPin, Clock, ChevronDown, ChevronUp,
  Building, Calculator, Users, Wrench, Crown, Info, GraduationCap, Heart, Briefcase
} from "lucide-react";
import { Link } from "wouter";
import { useWithTenant } from "@/utils/tenantUrl";
import { useTenant } from "@/contexts/TenantContext";

interface Employee {
  id: number;
  name: string;
  title?: string;
  responsibilities?: string;
  phone?: string;
  fax?: string;
  email?: string;
  room?: string;
  address?: string;
  office_hours?: string;
}

interface Department {
  id: number;
  name: string;
  icon: string;
  display_order: number;
  employees: Employee[];
}

// Map icon names to lucide-react components
const iconMap: Record<string, any> = {
  'Building': Building,
  'Calculator': Calculator,
  'Users': Users,
  'Wrench': Wrench,
  'Crown': Crown,
  'Info': Info,
  'MapPin': MapPin,
  'GraduationCap': GraduationCap,
  'Heart': Heart,
  'Briefcase': Briefcase
};

export default function Departments() {
  const withTenant = useWithTenant();
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedDepartments, setExpandedDepartments] = useState<Set<number>>(new Set());
  const [mayorExpanded, setMayorExpanded] = useState(false);

  useEffect(() => {
    async function fetchDepartments() {
      if (!tenant) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/departments?tenant=${tenant.slug}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch departments');
        }
        
        const data = await response.json();
        setDepartments(data.departments || []);
        
        // Start with all departments collapsed
        setExpandedDepartments(new Set());
      } catch (err) {
        console.error('Error fetching departments:', err);
        setError('Fehler beim Laden der Abteilungen');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDepartments();
  }, [tenant]);

  const toggleDepartment = (deptId: number) => {
    setExpandedDepartments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deptId)) {
        newSet.delete(deptId);
      } else {
        newSet.add(deptId);
      }
      return newSet;
    });
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Briefcase;
    return IconComponent;
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
          <h1 className="text-3xl font-bold">Rathaus & Verwaltung</h1>
          <p className="text-primary-foreground/90 mt-1">Ämter und Ansprechpartner</p>
        </div>
      </div>

      <div className="container py-8">
        {/* Mayor Section */}
        {!isLoading && !error && tenant?.mayorName && (
          <Card className="mb-6 border-primary/20">
            <CardHeader 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setMayorExpanded(!mayorExpanded)}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Crown className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">Bürgermeister</CardTitle>
                  <p className="text-xl font-semibold text-primary mt-1">{tenant.mayorName}</p>
                </div>
                {mayorExpanded ? (
                  <ChevronUp className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            {mayorExpanded && (
              <CardContent>
                <div className="space-y-3">
                  {tenant.mayorPhone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <a href={`tel:${tenant.mayorPhone.replace(/\s/g, '')}`} className="text-primary hover:underline">
                        {tenant.mayorPhone}
                      </a>
                    </div>
                  )}
                  {tenant.mayorEmail && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <a href={`mailto:${tenant.mayorEmail}`} className="text-primary hover:underline break-all">
                        {tenant.mayorEmail}
                      </a>
                    </div>
                  )}
                  {tenant.mayorAddress && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">{tenant.mayorAddress}</span>
                    </div>
                  )}
                  {tenant.mayorOfficeHours && (
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">{tenant.mayorOfficeHours}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/3" />
                </CardHeader>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="p-8 text-center border-destructive">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && departments.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Keine Abteilungen gefunden.</p>
          </Card>
        )}

        {/* Departments List */}
        {!isLoading && !error && departments.length > 0 && (
          <div className="grid gap-4">
            {departments.filter(dept => dept.employees.length > 0).map((dept) => {
              const Icon = getIcon(dept.icon);
              const isExpanded = expandedDepartments.has(dept.id);
              
              return (
                <Card key={dept.id} className="overflow-hidden">
                  <CardHeader 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => toggleDepartment(dept.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{dept.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {dept.employees.length} {dept.employees.length === 1 ? 'Mitarbeiter' : 'Mitarbeiter'}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0">
                      <div className="space-y-6 mt-4">
                        {dept.employees.map((employee) => (
                          <div key={employee.id} className="border-l-2 border-primary/20 pl-4">
                            <h3 className="font-semibold text-lg">{employee.name}</h3>
                            
                            {employee.title && (
                              <p className="text-muted-foreground text-sm mt-1">{employee.title}</p>
                            )}
                            
                            {employee.responsibilities && (
                              <p className="text-sm mt-2 text-muted-foreground">{employee.responsibilities}</p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                              {employee.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone size={14} className="text-primary" />
                                  <a href={`tel:${employee.phone}`} className="hover:underline">
                                    {employee.phone}
                                  </a>
                                </div>
                              )}

                              {employee.email && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail size={14} className="text-primary" />
                                  <a href={`mailto:${employee.email}`} className="hover:underline break-all">
                                    {employee.email}
                                  </a>
                                </div>
                              )}

                              {employee.address && (
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin size={14} className="text-primary" />
                                  <span>{employee.address}</span>
                                </div>
                              )}

                              {employee.room && (
                                <div className="flex items-center gap-2 text-sm">
                                  <MapPin size={14} className="text-primary" />
                                  <span>{employee.room}</span>
                                </div>
                              )}

                              {employee.office_hours && (
                                <div className="flex items-center gap-2 text-sm col-span-full">
                                  <Clock size={14} className="text-primary" />
                                  <span>{employee.office_hours}</span>
                                </div>
                              )}

                              {employee.fax && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Phone size={14} />
                                  <span>Fax: {employee.fax}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
