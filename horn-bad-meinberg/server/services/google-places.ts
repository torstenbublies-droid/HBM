// Using native fetch (Node.js 18+)

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyAj-cTa8x15rpSC-RfoaNnaCxPZaRRID6g';

interface PlaceResult {
  name: string;
  displayName: string;
  formattedAddress: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  userRatingCount?: number;
  types?: string[];
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
}

interface NearbySearchResponse {
  places: PlaceResult[];
}

/**
 * Search for places near a location using Google Places API (New)
 * 
 * @param latitude Center latitude
 * @param longitude Center longitude
 * @param radius Radius in meters (max 50000)
 * @param placeType Place type (e.g., 'dentist', 'pharmacy', 'restaurant')
 * @param maxResults Maximum number of results (default 10)
 * @returns Array of places
 */
export async function searchNearbyPlaces(
  latitude: number,
  longitude: number,
  radius: number,
  placeType: string,
  maxResults: number = 10
): Promise<PlaceResult[]> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.error('[Google Places] API key not configured');
    return [];
  }

  try {
    const url = 'https://places.googleapis.com/v1/places:searchNearby';
    
    const requestBody = {
      includedTypes: [placeType],
      maxResultCount: Math.min(maxResults, 20),
      locationRestriction: {
        circle: {
          center: {
            latitude,
            longitude,
          },
          radius: Math.min(radius, 50000),
        },
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask': 
          'places.displayName,' +
          'places.formattedAddress,' +
          'places.location,' +
          'places.rating,' +
          'places.userRatingCount,' +
          'places.types,' +
          'places.nationalPhoneNumber,' +
          'places.internationalPhoneNumber,' +
          'places.websiteUri,' +
          'places.googleMapsUri',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Google Places] API error:', response.status, errorText);
      return [];
    }

    const data = await response.json() as NearbySearchResponse;
    return data.places || [];
  } catch (error) {
    console.error('[Google Places] Error searching nearby places:', error);
    return [];
  }
}

/**
 * Map German place type to Google Places API type
 */
export function mapPlaceType(germanType: string): string {
  const typeMap: Record<string, string> = {
    'lebensmittel': 'supermarket',
    'discounter': 'supermarket',
    'discount': 'supermarket',
    'aldi': 'supermarket',
    'lidl': 'supermarket',
    'penny': 'supermarket',
    'netto': 'supermarket',
    'rewe': 'supermarket',
    'edeka': 'supermarket',
    'einkaufsmöglichkeit': 'store',
    'einkaufsmöglichkeiten': 'store',
    'einkaufen': 'store',
    'shopping': 'shopping_mall',
    'geschäft': 'store',
    'geschäfte': 'store',
    'laden': 'store',
    'läden': 'store',
    'zahnarzt': 'dentist',
    'zahnärzte': 'dentist',
    'arzt': 'doctor',
    'ärzte': 'doctor',
    'apotheke': 'pharmacy',
    'apotheken': 'pharmacy',
    'krankenhaus': 'hospital',
    'restaurant': 'restaurant',
    'restaurants': 'restaurant',
    'café': 'cafe',
    'cafe': 'cafe',
    'tankstelle': 'gas_station',
    'tankstellen': 'gas_station',
    'supermarkt': 'supermarket',
    'supermärkte': 'supermarket',
    'bank': 'bank',
    'banken': 'bank',
    'geldautomat': 'atm',
    'atm': 'atm',
    'frisör': 'hair_care',
    'friseur': 'hair_care',
    'hotel': 'lodging',
    'hotels': 'lodging',
  };

  const lowerType = germanType.toLowerCase();
  return typeMap[lowerType] || 'point_of_interest';
}

/**
 * Extract place type from user message
 */
export function extractPlaceType(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  const placeTypes = [
    'lebensmittel', 'discounter', 'discount',
    'einkaufsmöglichkeit', 'einkaufsmöglichkeiten',
    'einkaufen', 'shopping',
    'geschäft', 'geschäfte',
    'laden', 'läden',
    'zahnarzt', 'zahnärzte',
    'arzt', 'ärzte',
    'apotheke', 'apotheken',
    'krankenhaus',
    'restaurant', 'restaurants',
    'café', 'cafe',
    'tankstelle', 'tankstellen',
    'supermarkt', 'supermärkte',
    'bank', 'banken',
    'geldautomat', 'atm',
    'frisör', 'friseur',
    'hotel', 'hotels',
  ];

  for (const type of placeTypes) {
    if (lowerMessage.includes(type)) {
      return type;
    }
  }

  return null;
}

/**
 * Format place results for chatbot response
 */
export function formatPlacesForChatbot(places: PlaceResult[], cityName: string): string {
  if (places.length === 0) {
    return `Leider konnte ich keine passenden Orte in der Nähe von ${cityName} finden. Versuche es mit einer Google Maps Suche.`;
  }

  let response = `🗺️ Hier sind die Ergebnisse in der Nähe von ${cityName}:\n\n`;

  places.slice(0, 5).forEach((place, index) => {
    response += `${index + 1}. **${place.displayName?.text || place.name}**\n`;
    
    if (place.formattedAddress) {
      response += `   📍 ${place.formattedAddress}\n`;
    }
    
    if (place.rating && place.userRatingCount) {
      response += `   ⭐ ${place.rating}/5 (${place.userRatingCount} Bewertungen)\n`;
    }
    
    if (place.nationalPhoneNumber || place.internationalPhoneNumber) {
      response += `   📞 ${place.nationalPhoneNumber || place.internationalPhoneNumber}\n`;
    }
    
    if (place.websiteUri) {
      response += `   🌐 [Website öffnen](${place.websiteUri})\n`;
    }
    
    if (place.googleMapsUri) {
      response += `   🗺️ [In Google Maps öffnen](${place.googleMapsUri})\n`;
    }
    
    response += '\n';
  });

  if (places.length > 5) {
    response += `_... und ${places.length - 5} weitere Ergebnisse_\n`;
  }

  return response;
}
