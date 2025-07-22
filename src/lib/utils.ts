import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getCarTypeIcon(type: string): string {
  const icons = {
    sedan: '🚗',
    suv: '🚙',
    hatchback: '🚗',
    convertible: '🏎️',
    coupe: '🏎️',
    wagon: '🚗',
  };
  return icons[type as keyof typeof icons] || '🚗';
}

/**
 * Formats a number as currency with optional locale and currency
 * @param amount The monetary amount to format
 * @param locale The locale to use for formatting (default: 'en-US')
 * @param currency The currency code (default: 'USD')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number, 
  locale: string = 'en-US', 
  currency: string = 'USD'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Shared location/geocoding utilities
export function wkbHexToLatLng(wkbHex: string) {
  if (!wkbHex || wkbHex.length < 50) return null;
  function hexToDouble(hex: string) {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    for (let i = 0; i < 8; i++) {
      view.setUint8(i, parseInt(hex.substr(i * 2, 2), 16));
    }
    return view.getFloat64(0, true); // little endian
  }
  // X (lng): hex 18-33 (16 chars), Y (lat): hex 34-49 (16 chars)
  const lng = hexToDouble(wkbHex.substr(18, 16));
  const lat = hexToDouble(wkbHex.substr(34, 16));
  return { lat, lng };
}

export async function getCityFromCoordinates(
  lat: number, 
  lng: number, 
  retries: number = 2
): Promise<{ city: string | null, country: string | null }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'UrutibiziApp/1.0 (https://urutibizi.com; contact@urutibizi.com)',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Geocoding API error: ${response.status} ${response.statusText}`);
      if (retries > 0) {
        // Random delay to prevent overwhelming the server
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
        return getCityFromCoordinates(lat, lng, retries - 1);
      }
      return { city: null, country: null };
    }

    const data = await response.json();

    if (!data.address) {
      console.warn('No address found for coordinates:', { lat, lng });
      return { city: null, country: null };
    }

    const city = data.address.city || 
                 data.address.town || 
                 data.address.village || 
                 data.address.hamlet || 
                 data.address.county || 
                 null;

    const country = data.address.country || null;

    return { city, country };
  } catch (error) {
    console.error('Geocoding error:', error);
    
    // Detailed error logging
    if (error instanceof TypeError) {
      console.error('Network or fetch error:', error.message);
    } else if (error instanceof DOMException && error.name === 'AbortError') {
      console.error('Geocoding request timed out');
      
      // Retry mechanism for AbortError
      if (retries > 0) {
        console.log(`Retrying geocoding for coordinates: ${lat}, ${lng}`);
        // Random delay to prevent immediate retry
        await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
        return getCityFromCoordinates(lat, lng, retries - 1);
      }
    }

    return { city: null, country: null };
  }
}
