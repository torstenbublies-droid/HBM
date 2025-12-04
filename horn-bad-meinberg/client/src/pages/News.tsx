import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useWithTenant } from "@/utils/tenantUrl";
import { useTenant } from "@/contexts/TenantContext";

interface NewsArticle {
  id: number;
  title: string;
  description: string;
  published_date: string;
  source_url: string;
  category?: string;
}

export default function News() {
  const withTenant = useWithTenant();
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(true);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      if (!tenant) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/news?tenant=${tenant.slug}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        
        const data = await response.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Fehler beim Laden der Bekanntmachungen');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchNews();
  }, [tenant]);

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
          <h1 className="text-3xl font-bold">Aktuelles</h1>
          <p className="text-primary-foreground/90 mt-1">Bekanntmachungen aus {tenant?.name || 'Ihrer Stadt'}</p>
        </div>
      </div>

      <div className="container py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                <div className="h-3 bg-muted rounded w-1/2" />
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
        {!isLoading && !error && articles.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Aktuell keine Bekanntmachungen verfügbar.</p>
          </Card>
        )}

        {/* Articles List */}
        {!isLoading && !error && articles.length > 0 && (
          <div className="grid gap-4">
            {articles.map((article) => (
              <Card key={article.id} className="p-6 hover:shadow-lg transition-all">
                <div className="flex gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg h-fit">
                    <FileText size={24} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
                    
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <Calendar size={14} />
                      <span>
                        {format(new Date(article.published_date), "dd. MMMM yyyy", { locale: de })}
                      </span>
                      {article.category && (
                        <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                          {article.category}
                        </span>
                      )}
                    </div>

                    {article.description && (
                      <p className="text-muted-foreground mb-3 line-clamp-3">
                        {article.description}
                      </p>
                    )}

                    {article.source_url && (
                      <Button asChild variant="link" className="px-0 mt-2">
                        <a href={article.source_url} target="_blank" rel="noopener noreferrer">
                          Mehr erfahren →
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
