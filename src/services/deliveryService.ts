import { DeliverySettings } from '../types';

export interface PlaceSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  description: string;
  lat?: number;
  lng?: number;
  source: 'google' | 'curated' | 'osm';
}

export let lastGoogleStatus: string | null = null;
export let lastGoogleError: string | null = null;
let loadedApiKey = '';
let isScriptLoading = false;
let currentSessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

export const refreshPlacesSession = () => {
  currentSessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
};

/**
 * Diagnostics helper for admin panel
 */
export const getGooglePlacesDiagnostic = () => ({
  isLoaded: Boolean((window as any).google?.maps?.places || lastGoogleStatus === 'OK'),
  apiKey: loadedApiKey,
  lastStatus: lastGoogleStatus,
  lastError: lastGoogleError,
});

/**
 * Calculates the great-circle distance between two GPS coordinates (Haversine Formula) in km.
 */
export const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  if (
    typeof lat1 !== 'number' ||
    typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lon2 !== 'number' ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return 0;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
};

export interface DeliveryFareBreakdown {
  distanceKm: number;
  estimatedMinutes: number;
  startFare: number;
  ratePerKm: number;
  ratePerMin: number;
  bookingFeePercent: number;
  distanceCharge: number;
  timeCharge: number;
  subtotal: number;
  bookingFeeAmount: number;
  calculatedTotal: number;
  minimumPrice: number;
  finalFare: number;
  isFreeDelivery: boolean;
}


/**
 * Calculates dynamic delivery dispatch fee:
 * 1. Minimum price floor: e.g. GH₵15.00
 * 2. Start (Base fare): e.g. GH₵3.15
 * 3. Per km rate: e.g. GH₵1.45/KM
 * 4. Per min transit: e.g. GH₵0.54/MIN
 * 5. Dispatch / Booking Fee: e.g. 6.1%
 * 
 * Formula:
 * Subtotal = Start + (distanceKm * ratePerKm) + (estimatedMinutes * ratePerMin)
 * BookingFee = Subtotal * (bookingFeePercent / 100)
 * Calculated Total = Subtotal + BookingFee
 * Final Fare = max(Calculated Total, Minimum Price) (or 0 if Free Delivery)
 */
export const getDeliveryFareBreakdown = (
  distanceKm: number,
  settings: DeliverySettings,
  cartTotal?: number
): DeliveryFareBreakdown => {
  const isFreeDelivery = Boolean(
    cartTotal !== undefined &&
      settings.freeDeliveryThreshold > 0 &&
      cartTotal >= settings.freeDeliveryThreshold
  );

  const startFare =
    typeof settings.startFare === 'number'
      ? settings.startFare
      : typeof settings.baseFee === 'number'
      ? settings.baseFee
      : 3.15;
  const ratePerKm = typeof settings.ratePerKm === 'number' ? settings.ratePerKm : 1.45;
  const ratePerMin = typeof settings.ratePerMin === 'number' ? settings.ratePerMin : 0.54;
  const bookingFeePercent =
    typeof settings.bookingFeePercent === 'number' ? settings.bookingFeePercent : 6.1;
  const minimumPrice = typeof settings.minimumFee === 'number' ? settings.minimumFee : 15.0;
  const minutesPerKm = typeof settings.minutesPerKm === 'number' ? settings.minutesPerKm : 2.0;

  const validDist = Math.max(0, distanceKm);
  const estimatedMinutes = Math.max(1, Math.round(validDist * minutesPerKm));

  const distanceCharge = Math.round(validDist * ratePerKm * 100) / 100;
  const timeCharge = Math.round(estimatedMinutes * ratePerMin * 100) / 100;

  const subtotal = Math.round((startFare + distanceCharge + timeCharge) * 100) / 100;
  const bookingFeeAmount = Math.round(subtotal * (bookingFeePercent / 100) * 100) / 100;

  const calculatedTotal = Math.round((subtotal + bookingFeeAmount) * 100) / 100;
  const finalFare = isFreeDelivery ? 0 : Math.max(calculatedTotal, minimumPrice);

  return {
    distanceKm: Math.round(validDist * 10) / 10,
    estimatedMinutes,
    startFare,
    ratePerKm,
    ratePerMin,
    bookingFeePercent,
    distanceCharge,
    timeCharge,
    subtotal,
    bookingFeeAmount,
    calculatedTotal,
    minimumPrice,
    finalFare: Math.round(finalFare * 100) / 100,
    isFreeDelivery,
  };
};


/**
 * Calculates final delivery fee:
 */
export const calculateDeliveryFee = (
  distanceKm: number,
  settings: DeliverySettings,
  cartTotal?: number
): number => {
  return getDeliveryFareBreakdown(distanceKm, settings, cartTotal).finalFare;
};

// Comprehensive Ghana Places Database covering major neighborhoods, streets, and landmarks
const GHANA_REAL_PLACES: Array<{ name: string; area: string; lat: number; lng: number }> = [
  // Greater Accra - Central & Prime
  { name: 'East Legon (American House)', area: 'Accra, Greater Accra', lat: 5.6425, lng: -0.1582 },
  { name: 'East Legon (Lagos Avenue)', area: 'Accra, Greater Accra', lat: 5.6358, lng: -0.1624 },
  { name: 'East Legon (Under Bridge / Shiashie)', area: 'Accra, Greater Accra', lat: 5.6268, lng: -0.1746 },
  { name: 'Adjiringanor', area: 'East Legon, Greater Accra', lat: 5.6601, lng: -0.1344 },
  { name: 'Trassaco Valley', area: 'East Legon, Greater Accra', lat: 5.6685, lng: -0.1189 },
  { name: 'Airport Residential Area', area: 'Accra, Greater Accra', lat: 5.6026, lng: -0.1793 },
  { name: 'Airport City (Marina Mall & Stanbic)', area: 'Accra, Greater Accra', lat: 5.5992, lng: -0.1782 },
  { name: 'Kotoka International Airport (Terminal 3)', area: 'Accra, Greater Accra', lat: 5.6052, lng: -0.1668 },
  { name: 'Cantonments (American Embassy)', area: 'Accra, Greater Accra', lat: 5.5786, lng: -0.1741 },
  { name: 'Labone (Coffee Shop / Metro)', area: 'Accra, Greater Accra', lat: 5.5684, lng: -0.1658 },
  { name: 'Osu (Oxford Street / Papaye)', area: 'Accra, Greater Accra', lat: 5.556, lng: -0.1824 },
  { name: 'Osu (Ring Road Central)', area: 'Accra, Greater Accra', lat: 5.5652, lng: -0.1874 },
  { name: 'Ridge (Financial District / Kempinski)', area: 'Accra, Greater Accra', lat: 5.5584, lng: -0.1988 },
  { name: 'North Ridge (Alisa Hotel)', area: 'Accra, Greater Accra', lat: 5.5689, lng: -0.1995 },
  { name: 'Roman Ridge', area: 'Accra, Greater Accra', lat: 5.5997, lng: -0.1912 },
  { name: 'Dzorwulu (Blohum St & Perez Chapel)', area: 'Accra, Greater Accra', lat: 5.6127, lng: -0.1983 },
  { name: 'Abelemkpe', area: 'Accra, Greater Accra', lat: 5.6083, lng: -0.2148 },

  // Malls & Hubs
  { name: 'Accra Mall (Tetteh Quarshie)', area: 'Accra, Greater Accra', lat: 5.6219, lng: -0.1741 },
  { name: 'A&C Mall (East Legon)', area: 'Accra, Greater Accra', lat: 5.6416, lng: -0.1524 },
  { name: 'Achimota Retail Centre (Mall)', area: 'Accra, Greater Accra', lat: 5.6321, lng: -0.2312 },
  { name: 'West Hills Mall (Weija)', area: 'Accra, Greater Accra', lat: 5.5539, lng: -0.3752 },
  { name: 'Junction Mall (Nungua)', area: 'Nungua, Greater Accra', lat: 5.6139, lng: -0.0782 },
  { name: 'Marina Mall (Airport City)', area: 'Accra, Greater Accra', lat: 5.5994, lng: -0.1784 },
  { name: 'Palace Mall (Spintex Road)', area: 'Spintex, Greater Accra', lat: 5.6302, lng: -0.1192 },
  { name: 'The Junction Mall (Nungua Barrier)', area: 'Accra, Greater Accra', lat: 5.6142, lng: -0.0789 },

  // Spintex, Tema & Beach Road
  { name: 'Spintex Road (Batsonaa Total)', area: 'Spintex, Greater Accra', lat: 5.6378, lng: -0.0984 },
  { name: 'Spintex Road (Kasapreko / Manet)', area: 'Spintex, Greater Accra', lat: 5.6324, lng: -0.1245 },
  { name: 'Sakumono Estates', area: 'Tema / Spintex, Greater Accra', lat: 5.6277, lng: -0.0633 },
  { name: 'Lashibi (Comm 17 / Comm 18)', area: 'Tema, Greater Accra', lat: 5.6565, lng: -0.0768 },
  { name: 'Tema Community 1 (Central)', area: 'Tema, Greater Accra', lat: 5.6475, lng: -0.0051 },
  { name: 'Tema Community 2', area: 'Tema, Greater Accra', lat: 5.6512, lng: -0.0164 },
  { name: 'Tema Community 6 & 10', area: 'Tema, Greater Accra', lat: 5.6678, lng: -0.0124 },
  { name: 'Tema Community 12', area: 'Tema, Greater Accra', lat: 5.6812, lng: -0.0189 },
  { name: 'Tema Community 25 (Mall)', area: 'Tema, Greater Accra', lat: 5.7186, lng: 0.0536 },
  { name: 'Teshie (Camp / First Junction)', area: 'Accra, Greater Accra', lat: 5.5894, lng: -0.1082 },
  { name: 'Nungua (Traditional Council / Barrier)', area: 'Accra, Greater Accra', lat: 5.5982, lng: -0.0754 },
  { name: 'Labadi (Trade Fair & Beach)', area: 'Accra, Greater Accra', lat: 5.5612, lng: -0.1512 },

  // Northern & Legon Corridor
  { name: 'Legon Campus (University of Ghana)', area: 'Accra, Greater Accra', lat: 5.6508, lng: -0.187 },
  { name: 'UPSA (Madina / Legon)', area: 'Accra, Greater Accra', lat: 5.6624, lng: -0.1692 },
  { name: 'Madina (Zongo Junction)', area: 'Accra, Greater Accra', lat: 5.6713, lng: -0.1664 },
  { name: 'Madina (Market / Ritz Junction)', area: 'Accra, Greater Accra', lat: 5.6784, lng: -0.1612 },
  { name: 'Adenta (Housing Down / Barrier)', area: 'Accra, Greater Accra', lat: 5.7142, lng: -0.1636 },
  { name: 'Adenta (Commandos / Frafraha)', area: 'Accra, Greater Accra', lat: 5.7289, lng: -0.1524 },
  { name: 'Haatso (Supermarket / Ecomog)', area: 'Accra, Greater Accra', lat: 5.6698, lng: -0.2033 },
  { name: 'Atomic Junction (Legon)', area: 'Accra, Greater Accra', lat: 5.6642, lng: -0.1865 },
  { name: 'Agbogba', area: 'Accra, Greater Accra', lat: 5.6892, lng: -0.1784 },
  { name: 'Ashongman Estate', area: 'Accra, Greater Accra', lat: 5.7024, lng: -0.2189 },
  { name: 'Kwabenya (Atomic Hills)', area: 'Accra, Greater Accra', lat: 5.6854, lng: -0.2312 },
  { name: 'Dome (Crossing / Pillar 2)', area: 'Accra, Greater Accra', lat: 5.6421, lng: -0.2289 },
  { name: 'Taifa (Burkina / Bankyease)', area: 'Accra, Greater Accra', lat: 5.6589, lng: -0.2456 },
  { name: 'Oyarifa & Teiman', area: 'Greater Accra', lat: 5.7562, lng: -0.1684 },
  { name: 'Pokuase (Interchange / ACP)', area: 'Greater Accra', lat: 5.6984, lng: -0.2982 },
  { name: 'Ashaley Botwe (Little Roses)', area: 'Greater Accra', lat: 5.6792, lng: -0.1345 },

  // Western & Southern Corridor
  { name: 'Dansoman (Exhibition / Roundabout)', area: 'Accra, Greater Accra', lat: 5.5488, lng: -0.2642 },
  { name: 'Dansoman (Last Stop / SSNIT Flats)', area: 'Accra, Greater Accra', lat: 5.5382, lng: -0.2741 },
  { name: 'Kaneshie (Market / First Light)', area: 'Accra, Greater Accra', lat: 5.5682, lng: -0.2392 },
  { name: 'Abeka Lapaz (Nyamekye / Bambolino)', area: 'Accra, Greater Accra', lat: 5.6021, lng: -0.2524 },
  { name: 'Achimota (Old Station / Golf Club)', area: 'Accra, Greater Accra', lat: 5.6267, lng: -0.2291 },
  { name: 'Odorkor (Official Town / Tipper)', area: 'Accra, Greater Accra', lat: 5.5789, lng: -0.2712 },
  { name: 'Awoshie (Mangoase / Baah Yard)', area: 'Accra, Greater Accra', lat: 5.5912, lng: -0.2845 },
  { name: 'Mallam (Junction / Gbawe)', area: 'Accra, Greater Accra', lat: 5.5684, lng: -0.2989 },
  { name: 'McCarthy Hill', area: 'Accra, Greater Accra', lat: 5.5692, lng: -0.3214 },
  { name: 'Weija (Barrier / SCC)', area: 'Accra, Greater Accra', lat: 5.5582, lng: -0.3456 },
  { name: 'Kasoa (Interchange / New Market)', area: 'Central Region', lat: 5.5342, lng: -0.4244 },
  { name: 'Adabraka (Overhead / Roxy)', area: 'Accra, Greater Accra', lat: 5.5612, lng: -0.2145 },
  { name: 'Kwame Nkrumah Circle (Interchange)', area: 'Accra, Greater Accra', lat: 5.5682, lng: -0.2118 },
  { name: 'Makola Market (Rawlings Park)', area: 'Accra, Greater Accra', lat: 5.5482, lng: -0.2084 },
  { name: 'Korle Bu Teaching Hospital', area: 'Accra, Greater Accra', lat: 5.5384, lng: -0.2289 },

  // Ashanti Region - Kumasi
  { name: 'Kumasi Central Market (Kejetia)', area: 'Kumasi, Ashanti Region', lat: 6.6953, lng: -1.6244 },
  { name: 'Ahodwo (Roundabout / Nhyiaeso)', area: 'Kumasi, Ashanti Region', lat: 6.6718, lng: -1.6231 },
  { name: 'KNUST Campus (Kumasi)', area: 'Kumasi, Ashanti Region', lat: 6.6742, lng: -1.5714 },
  { name: 'Bantama (High Street)', area: 'Kumasi, Ashanti Region', lat: 6.7024, lng: -1.6382 },
  { name: 'Asokwa (Kumasi City Mall)', area: 'Kumasi, Ashanti Region', lat: 6.6721, lng: -1.6084 },
  { name: 'Adum (Commercial Centre)', area: 'Kumasi, Ashanti Region', lat: 6.6892, lng: -1.6214 },
];

/**
 * Modern Google Places API (New) Autocomplete via direct fetch
 * Works natively in all modern browsers without Maps JS script injection delays.
 */
async function fetchGooglePlacesNew(
  query: string,
  apiKey: string,
  sessionToken?: string
): Promise<PlaceSuggestion[]> {
  try {
    const payload: any = {
      input: query,
      includedRegionCodes: ['gh'],
    };
    if (sessionToken) {
      payload.sessionToken = sessionToken;
    }

    const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const msg = errJson?.error?.message || `HTTP ${res.status}`;
      lastGoogleStatus = 'ERROR';
      lastGoogleError = msg;
      console.warn('[Places API New Autocomplete Warning]:', msg);
      return [];
    }

    const data = await res.json();
    lastGoogleStatus = 'OK';
    lastGoogleError = null;
    loadedApiKey = apiKey;

    if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
      return data.suggestions
        .map((s: any) => {
          const pred = s.placePrediction;
          if (!pred) return null;
          const rawPlace = pred.place || '';
          const placeId = pred.placeId || rawPlace.replace(/^places\//, '');
          const mainText = pred.structuredFormat?.mainText?.text || pred.text?.text || '';
          const secondaryText = pred.structuredFormat?.secondaryText?.text || 'Ghana';
          const description = pred.text?.text || `${mainText}, ${secondaryText}`;

          return {
            placeId,
            mainText,
            secondaryText,
            description,
            source: 'google' as const,
          };
        })
        .filter(Boolean) as PlaceSuggestion[];
    }

    // If 0 results under Ghana filter, retry without region code restriction
    delete payload.includedRegionCodes;
    const retryRes = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (retryRes.ok) {
      const retryData = await retryRes.json();
      if (Array.isArray(retryData.suggestions) && retryData.suggestions.length > 0) {
        return retryData.suggestions
          .map((s: any) => {
            const pred = s.placePrediction;
            if (!pred) return null;
            const rawPlace = pred.place || '';
            const placeId = pred.placeId || rawPlace.replace(/^places\//, '');
            const mainText = pred.structuredFormat?.mainText?.text || pred.text?.text || '';
            const secondaryText = pred.structuredFormat?.secondaryText?.text || 'Ghana';
            const description = pred.text?.text || `${mainText}, ${secondaryText}`;

            return {
              placeId,
              mainText,
              secondaryText,
              description,
              source: 'google' as const,
            };
          })
          .filter(Boolean) as PlaceSuggestion[];
      }
    }
  } catch (err: any) {
    console.warn('[Places API New Autocomplete Exception]:', err);
    lastGoogleError = String(err?.message || err);
  }

  return [];
}

/**
 * Modern Google Places API (New) Place Details via direct fetch
 */
async function fetchGooglePlaceDetailsNew(
  placeId: string,
  apiKey: string,
  sessionToken?: string
): Promise<{ placename: string; lat: number; lng: number } | null> {
  try {
    const cleanId = encodeURIComponent(placeId.replace(/^places\//, ''));
    let url = `https://places.googleapis.com/v1/places/${cleanId}?fields=id,displayName,formattedAddress,location`;
    if (sessionToken) {
      url += `&sessionToken=${encodeURIComponent(sessionToken)}`;
    }

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const msg = errJson?.error?.message || `HTTP ${res.status}`;
      console.warn('[Places API New Details Warning]:', msg);
      return null;
    }

    const data = await res.json();
    const lat = data.location?.latitude;
    const lng = data.location?.longitude;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return null;
    }

    const displayName = data.displayName?.text?.trim() || '';
    const address = data.formattedAddress?.trim() || '';

    let placename = displayName || address;
    if (displayName && address) {
      if (address.toLowerCase().includes(displayName.toLowerCase())) {
        placename = address;
      } else {
        placename = `${displayName}, ${address}`;
      }
    }

    return {
      placename,
      lat,
      lng,
    };
  } catch (err) {
    console.warn('[Places API New Details Exception]:', err);
    return null;
  }
}

/**
 * Dynamically loads Google Maps JavaScript Places library (for legacy support if needed).
 */
export const loadGooglePlacesScript = (apiKey: string): Promise<boolean> => {
  if (typeof window === 'undefined') return Promise.resolve(false);
  const cleanKey = apiKey ? apiKey.trim() : '';

  if (!cleanKey) {
    return Promise.resolve(false);
  }

  if ((window as any).google?.maps?.places && loadedApiKey === cleanKey) {
    return Promise.resolve(true);
  }

  (window as any).gm_authFailure = () => {
    lastGoogleStatus = 'REQUEST_DENIED';
    lastGoogleError =
      'Google Maps Authentication Failure: The key was rejected by Google Cloud. Please ensure "Places API (New)" is enabled on your Google Cloud Console without domain restrictions.';
    console.warn('[Google Places Auth Failure]:', lastGoogleError);
  };

  return new Promise((resolve) => {
    const callbackName = '__googleMapsPlacesInit';

    (window as any)[callbackName] = () => {
      isScriptLoading = false;
      loadedApiKey = cleanKey;
      lastGoogleError = null;
      resolve(true);
    };

    const existing = document.getElementById('google-places-script');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = 'google-places-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      cleanKey
    )}&libraries=places&language=en&region=GH&callback=${callbackName}`;
    script.async = true;
    script.defer = true;

    script.onerror = () => {
      isScriptLoading = false;
      lastGoogleError = 'Failed to load script from maps.googleapis.com.';
      resolve(false);
    };

    setTimeout(() => {
      if ((window as any).google?.maps?.places) {
        loadedApiKey = cleanKey;
        resolve(true);
      } else {
        resolve(false);
      }
    }, 4500);

    document.head.appendChild(script);
  });
};

/**
 * Searches places as user types:
 * 1. Queries Google Places API (New) directly for instantaneous, accurate real-world results.
 * 2. Attempts legacy Google Maps JS AutocompleteService if applicable.
 * 3. Falls back seamlessly to our curated Ghana real places database & live geocoding.
 */
export const searchPlacesSuggestions = async (
  query: string,
  apiKey?: string
): Promise<PlaceSuggestion[]> => {
  const clean = query.trim();
  if (clean.length < 2) return [];

  const keyToUse = (apiKey || 'AIzaSyBhMT_jtJCSaZiqUg44CzsKwqXPjgG7Gxc').trim();

  // 1. Modern Google Places API (New) - Fastest, full CORS, works for all modern Google Cloud projects
  if (keyToUse) {
    const newPlaces = await fetchGooglePlacesNew(clean, keyToUse, currentSessionToken);
    if (newPlaces.length > 0) {
      return newPlaces;
    }
  }

  // 2. Query legacy Google Places AutocompleteService if Maps JS is loaded
  if ((window as any).google?.maps?.places?.AutocompleteService) {
    try {
      const service = new (window as any).google.maps.places.AutocompleteService();

      const fetchGooglePredictions = (withGhanaFilter: boolean): Promise<any[]> => {
        return new Promise((resolve) => {
          const req: any = { input: clean };
          if (withGhanaFilter) {
            req.componentRestrictions = { country: 'gh' };
          }
          service.getPlacePredictions(req, (results: any[], status: string) => {
            lastGoogleStatus = status;
            if (
              status === (window as any).google.maps.places.PlacesServiceStatus.OK ||
              status === 'OK'
            ) {
              resolve(results || []);
            } else {
              resolve([]);
            }
          });
        });
      };

      let predictions = await fetchGooglePredictions(true);
      if (predictions.length === 0) {
        predictions = await fetchGooglePredictions(false);
      }

      if (predictions.length > 0) {
        return predictions.map((p) => ({
          placeId: p.place_id,
          mainText: p.structured_formatting?.main_text || p.description,
          secondaryText: p.structured_formatting?.secondary_text || 'Ghana',
          description: p.description,
          source: 'google',
        }));
      }
    } catch (err: any) {
      console.warn('Google Places Autocomplete error:', err);
    }
  }

  // 3. Fallback: Search our extensive Ghana Real Places Database
  const terms = clean.toLowerCase().split(/\s+/).filter(Boolean);
  const matchedCurated = GHANA_REAL_PLACES.filter((p) => {
    const haystack = (p.name + ' ' + p.area).toLowerCase();
    return terms.every((t) => haystack.includes(t));
  }).map((p) => ({
    placeId: `gh_${p.name.replace(/\s+/g, '_').toLowerCase()}`,
    mainText: p.name,
    secondaryText: p.area,
    description: `${p.name}, ${p.area}`,
    lat: p.lat,
    lng: p.lng,
    source: 'curated' as const,
  }));

  if (matchedCurated.length > 0) {
    return matchedCurated.slice(0, 8);
  }

  // 4. Live OpenStreetMap / Photon Fallback for any custom street in Ghana
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        clean
      )}&countrycodes=gh&format=json&limit=5`
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          placeId: `osm_${item.place_id}`,
          mainText: item.name || item.display_name.split(',')[0],
          secondaryText: item.display_name.split(',').slice(1, 3).join(',').trim() || 'Ghana',
          description: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          source: 'osm',
        }));
      }
    }
  } catch {
    // ignore
  }

  return [];
};

/**
 * Resolves a selected place to exact { placename, lat, lng }
 */
export const resolvePlaceCoordinates = async (
  suggestion: PlaceSuggestion,
  apiKey?: string
): Promise<{ placename: string; lat: number; lng: number }> => {
  // If coordinates already present (curated or osm)
  if (typeof suggestion.lat === 'number' && typeof suggestion.lng === 'number') {
    return {
      placename: suggestion.description,
      lat: suggestion.lat,
      lng: suggestion.lng,
    };
  }

  const keyToUse = (apiKey || 'AIzaSyBhMT_jtJCSaZiqUg44CzsKwqXPjgG7Gxc').trim();

  // 1. Modern Google Places API (New) Details lookup
  if (suggestion.source === 'google' && keyToUse) {
    const details = await fetchGooglePlaceDetailsNew(
      suggestion.placeId,
      keyToUse,
      currentSessionToken
    );
    refreshPlacesSession(); // New session for next search
    if (details) {
      return details;
    }
  }

  // 2. Legacy PlacesService fallback
  if (suggestion.source === 'google' && (window as any).google?.maps?.places?.PlacesService) {
    try {
      const div = document.createElement('div');
      const placesService = new (window as any).google.maps.places.PlacesService(div);

      const placeDetails: any = await new Promise((resolve, reject) => {
        placesService.getDetails(
          {
            placeId: suggestion.placeId,
            fields: ['name', 'formatted_address', 'geometry'],
          },
          (result: any, status: string) => {
            if (status === 'OK' && result) {
              resolve(result);
            } else {
              reject(new Error(status));
            }
          }
        );
      });

      if (placeDetails?.geometry?.location) {
        const loc = placeDetails.geometry.location;
        return {
          placename: placeDetails.formatted_address || placeDetails.name || suggestion.description,
          lat: typeof loc.lat === 'function' ? loc.lat() : loc.lat,
          lng: typeof loc.lng === 'function' ? loc.lng() : loc.lng,
        };
      }
    } catch (e) {
      console.warn('PlacesService getDetails fallback to Geocoder:', e);
    }
  }

  // 3. Legacy Geocoder fallback
  if (suggestion.source === 'google' && (window as any).google?.maps?.Geocoder) {
    try {
      const geocoder = new (window as any).google.maps.Geocoder();
      const geoResult: any = await new Promise((resolve, reject) => {
        geocoder.geocode({ placeId: suggestion.placeId }, (results: any[], status: string) => {
          if (status === 'OK' && results?.[0]?.geometry?.location) {
            resolve(results[0]);
          } else {
            reject(new Error(status));
          }
        });
      });

      if (geoResult?.geometry?.location) {
        const loc = geoResult.geometry.location;
        return {
          placename: geoResult.formatted_address || suggestion.description,
          lat: typeof loc.lat === 'function' ? loc.lat() : loc.lat,
          lng: typeof loc.lng === 'function' ? loc.lng() : loc.lng,
        };
      }
    } catch (e) {
      console.warn('Geocoder failed:', e);
    }
  }

  // Fallback: Check if name matches any of our curated list
  const lower = suggestion.description.toLowerCase();
  const match = GHANA_REAL_PLACES.find((p) => lower.includes(p.name.toLowerCase()));
  if (match) {
    return {
      placename: suggestion.description,
      lat: match.lat,
      lng: match.lng,
    };
  }

  // Default Accra center
  return {
    placename: suggestion.description,
    lat: 5.6037,
    lng: -0.187,
  };
};
