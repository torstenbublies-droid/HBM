import { useState } from "react";
import { Cloud, X, CloudRain, Sun, CloudSnow, Wind, CloudDrizzle, Cloudy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useTenant } from "@/contexts/TenantContext";

interface WeatherDay {
  day: string;
  date: string;
  temp: string;
  icon: React.ReactNode;
  description: string;
}

// Wetter-Icon basierend auf OpenWeatherMap Icon-Code
function getWeatherIcon(iconCode: string, size: number = 24) {
  const iconMap: Record<string, React.ReactNode> = {
    "01d": <Sun size={size} className="text-yellow-500" />,
    "01n": <Sun size={size} className="text-yellow-400" />,
    "02d": <Cloud size={size} className="text-gray-400" />,
    "02n": <Cloud size={size} className="text-gray-500" />,
    "03d": <Cloudy size={size} className="text-gray-500" />,
    "03n": <Cloudy size={size} className="text-gray-600" />,
    "04d": <Cloudy size={size} className="text-gray-600" />,
    "04n": <Cloudy size={size} className="text-gray-700" />,
    "09d": <CloudDrizzle size={size} className="text-blue-400" />,
    "09n": <CloudDrizzle size={size} className="text-blue-500" />,
    "10d": <CloudRain size={size} className="text-blue-500" />,
    "10n": <CloudRain size={size} className="text-blue-600" />,
    "11d": <CloudRain size={size} className="text-purple-500" />,
    "11n": <CloudRain size={size} className="text-purple-600" />,
    "13d": <CloudSnow size={size} className="text-blue-200" />,
    "13n": <CloudSnow size={size} className="text-blue-300" />,
    "50d": <Wind size={size} className="text-gray-500" />,
    "50n": <Wind size={size} className="text-gray-600" />,
  };
  
  return iconMap[iconCode] || <Cloud size={size} className="text-gray-500" />;
}

export default function WeatherWidget() {
  const { tenant } = useTenant();
  const [showForecast, setShowForecast] = useState(false);
  
  const { data: currentWeather } = trpc.weather.current.useQuery();
  const { data: forecastData } = trpc.weather.forecast.useQuery();

  // Fallback-Daten wenn API nicht verfügbar
  const displayTemp = currentWeather?.main?.temp 
    ? `${Math.round(currentWeather.main.temp)}°C` 
    : "15°C";
  const displayDescription = currentWeather?.weather?.[0]?.description || "Bewölkt";
  const displayIcon = currentWeather?.weather?.[0]?.icon 
    ? getWeatherIcon(currentWeather.weather[0].icon, 24)
    : <Cloud size={24} className="text-primary" />;

  // Verarbeite 5-Tages-Vorhersage
  const forecast: WeatherDay[] = [];
  
  if (forecastData?.list) {
    // Gruppiere nach Tagen (12:00 Uhr Vorhersage)
    const dailyForecasts = forecastData.list.filter((item: any) => 
      item.dt_txt.includes("12:00:00")
    ).slice(0, 5);
    
    const dayNames = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
    
    dailyForecasts.forEach((item: any, index: number) => {
      const date = new Date(item.dt * 1000);
      const dayName = index === 0 ? "Heute" : dayNames[date.getDay()];
      const dateStr = `${date.getDate()}.${date.getMonth() + 1}`;
      
      // Finde Min/Max Temperatur für den Tag
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayItems = forecastData.list.filter((f: any) => {
        const fDate = new Date(f.dt * 1000);
        return fDate >= dayStart && fDate <= dayEnd;
      });
      
      const temps = dayItems.map((f: any) => f.main.temp);
      const minTemp = Math.round(Math.min(...temps));
      const maxTemp = Math.round(Math.max(...temps));
      
      forecast.push({
        day: dayName,
        date: dateStr,
        temp: `${maxTemp}°C / ${minTemp}°C`,
        icon: getWeatherIcon(item.weather[0].icon, 32),
        description: item.weather[0].description,
      });
    });
  } else {
    // Fallback-Daten
    forecast.push(
      {
        day: "Heute",
        date: "17.10",
        temp: "15°C / 8°C",
        icon: <Cloud size={32} className="text-gray-500" />,
        description: "Bewölkt",
      },
      {
        day: "Freitag",
        date: "18.10",
        temp: "14°C / 7°C",
        icon: <CloudRain size={32} className="text-blue-500" />,
        description: "Leichter Regen",
      },
      {
        day: "Samstag",
        date: "19.10",
        temp: "16°C / 9°C",
        icon: <Sun size={32} className="text-yellow-500" />,
        description: "Sonnig",
      },
      {
        day: "Sonntag",
        date: "20.10",
        temp: "13°C / 6°C",
        icon: <CloudRain size={32} className="text-blue-500" />,
        description: "Regnerisch",
      },
      {
        day: "Montag",
        date: "21.10",
        temp: "12°C / 5°C",
        icon: <Wind size={32} className="text-gray-600" />,
        description: "Windig",
      }
    );
  }

  return (
    <>
      {/* Compact Widget */}
      <Card
        className="bg-white/90 dark:bg-card/90 backdrop-blur-sm p-2 md:p-3 shadow-lg cursor-pointer hover:bg-white/95 transition-colors"
        onClick={() => setShowForecast(true)}
      >
        <div className="flex items-center gap-1.5 md:gap-2">
          <div className="scale-75 md:scale-100">{displayIcon}</div>
          <div>
            <div className="text-xs md:text-sm font-semibold">
              <span className="hidden md:inline">{tenant?.name || 'Wetter'}</span>
              <span className="md:hidden">Wetter</span>
            </div>
            <div className="text-[10px] md:text-xs text-muted-foreground">
              {displayTemp} · <span className="hidden sm:inline">{displayDescription}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 5-Day Forecast Modal */}
      {showForecast && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-primary text-primary-foreground p-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-lg font-semibold">5-Tages-Wettervorhersage</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowForecast(false)}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X size={20} />
              </Button>
            </div>

            {/* Forecast Content */}
            <div className="p-4 space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold">Horn-Bad Meinberg</h3>
                <p className="text-sm text-muted-foreground">Wettervorhersage für die nächsten 5 Tage</p>
              </div>

              {/* Forecast Days */}
              <div className="space-y-3">
                {forecast.map((day, index) => (
                  <Card key={index} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 text-left">
                          <div className="font-semibold">{day.day}</div>
                          <div className="text-xs text-muted-foreground">{day.date}</div>
                        </div>
                        <div className="flex items-center gap-3 flex-1">
                          {day.icon}
                          <div>
                            <div className="font-medium capitalize">{day.description}</div>
                            <div className="text-sm text-muted-foreground">{day.temp}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Footer Info */}
              <div className="text-center text-xs text-muted-foreground mt-6 pb-2">
                {forecastData ? "Wetterdaten von OpenWeatherMap" : "Wetterdaten werden geladen..."}
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

