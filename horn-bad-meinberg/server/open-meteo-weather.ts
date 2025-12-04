/**
 * Open-Meteo Weather API Integration
 * Free weather API - no API key required!
 * Documentation: https://open-meteo.com/en/docs
 */

// Koordinaten für Schieder-Schwalenberg
const LATITUDE = 51.8667;
const LONGITUDE = 9.1833;

/**
 * WMO Weather Code zu deutscher Beschreibung
 * https://open-meteo.com/en/docs
 */
function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: "Klar",
    1: "Überwiegend klar",
    2: "Teilweise bewölkt",
    3: "Bedeckt",
    45: "Nebel",
    48: "Nebel mit Reifablagerung",
    51: "Leichter Nieselregen",
    53: "Mäßiger Nieselregen",
    55: "Starker Nieselregen",
    56: "Leichter gefrierender Nieselregen",
    57: "Starker gefrierender Nieselregen",
    61: "Leichter Regen",
    63: "Mäßiger Regen",
    65: "Starker Regen",
    66: "Leichter gefrierender Regen",
    67: "Starker gefrierender Regen",
    71: "Leichter Schneefall",
    73: "Mäßiger Schneefall",
    75: "Starker Schneefall",
    77: "Schneegriesel",
    80: "Leichte Regenschauer",
    81: "Mäßige Regenschauer",
    82: "Starke Regenschauer",
    85: "Leichte Schneeschauer",
    86: "Starke Schneeschauer",
    95: "Gewitter",
    96: "Gewitter mit leichtem Hagel",
    99: "Gewitter mit starkem Hagel",
  };
  
  return descriptions[code] || "Unbekannt";
}

/**
 * WMO Weather Code zu OpenWeatherMap-ähnlichem Icon Code
 * Für Kompatibilität mit bestehendem Frontend
 */
function getIconCode(weatherCode: number, isDay: boolean): string {
  const dayNight = isDay ? "d" : "n";
  
  // Clear sky
  if (weatherCode === 0) return `01${dayNight}`;
  
  // Partly cloudy
  if (weatherCode === 1 || weatherCode === 2) return `02${dayNight}`;
  
  // Cloudy
  if (weatherCode === 3) return `03${dayNight}`;
  
  // Fog
  if (weatherCode === 45 || weatherCode === 48) return `50${dayNight}`;
  
  // Drizzle
  if (weatherCode >= 51 && weatherCode <= 57) return `09${dayNight}`;
  
  // Rain
  if (weatherCode >= 61 && weatherCode <= 67) return `10${dayNight}`;
  
  // Snow
  if (weatherCode >= 71 && weatherCode <= 77) return `13${dayNight}`;
  
  // Rain showers
  if (weatherCode >= 80 && weatherCode <= 82) return `10${dayNight}`;
  
  // Snow showers
  if (weatherCode === 85 || weatherCode === 86) return `13${dayNight}`;
  
  // Thunderstorm
  if (weatherCode >= 95 && weatherCode <= 99) return `11${dayNight}`;
  
  // Default: cloudy
  return `04${dayNight}`;
}

/**
 * Hole aktuelles Wetter von Open-Meteo
 */
export async function getCurrentWeather() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&current=temperature_2m,weather_code,is_day&timezone=Europe/Berlin`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('[Open-Meteo] Current weather request failed:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.current) {
      console.error('[Open-Meteo] Invalid response format:', data);
      return null;
    }
    
    const { temperature_2m, weather_code, is_day } = data.current;
    
    // Konvertiere zu OpenWeatherMap-ähnlichem Format für Frontend-Kompatibilität
    return {
      main: {
        temp: temperature_2m,
      },
      weather: [
        {
          description: getWeatherDescription(weather_code),
          icon: getIconCode(weather_code, is_day === 1),
        },
      ],
    };
  } catch (error) {
    console.error('[Open-Meteo] Error fetching current weather:', error);
    return null;
  }
}

/**
 * Hole 5-Tages-Vorhersage von Open-Meteo
 */
export async function getWeatherForecast() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Europe/Berlin&forecast_days=5`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('[Open-Meteo] Forecast request failed:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.daily) {
      console.error('[Open-Meteo] Invalid response format:', data);
      return null;
    }
    
    const { time, weather_code, temperature_2m_max, temperature_2m_min } = data.daily;
    
    // Konvertiere zu OpenWeatherMap-ähnlichem Format
    const list = time.map((date: string, index: number) => {
      const dateObj = new Date(date);
      const timestamp = Math.floor(dateObj.getTime() / 1000);
      
      return {
        dt: timestamp,
        dt_txt: `${date} 12:00:00`, // Mittags-Zeitpunkt für Kompatibilität
        main: {
          temp: (temperature_2m_max[index] + temperature_2m_min[index]) / 2,
          temp_max: temperature_2m_max[index],
          temp_min: temperature_2m_min[index],
        },
        weather: [
          {
            description: getWeatherDescription(weather_code[index]),
            icon: getIconCode(weather_code[index], true), // Tag-Icon
          },
        ],
      };
    });
    
    return { list };
  } catch (error) {
    console.error('[Open-Meteo] Error fetching forecast:', error);
    return null;
  }
}
