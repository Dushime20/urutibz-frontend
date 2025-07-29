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

/**
 * Filters availability data to only include current and future dates
 * @param availabilityData Array of product availability data
 * @param availabilityType Type to filter for ('available' | 'unavailable')
 * @returns Filtered array containing only current and future dates
 */
export function filterCurrentAndFutureAvailability<T extends { date: string; availability_type: string }>(
  availabilityData: T[], 
  availabilityType: 'available' | 'unavailable' = 'unavailable'
): T[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day
  
  return availabilityData.filter(item => {
    const itemDate = new Date(item.date);
    itemDate.setHours(0, 0, 0, 0);
    return item.availability_type === availabilityType && itemDate >= today;
  });
}

/**
 * Checks if a product is currently available (not booked)
 * @param availabilityData Array of product availability data
 * @returns true if product is available, false if currently booked
 */
export function isProductCurrentlyAvailable<T extends { date: string; availability_type: string }>(
  availabilityData: T[]
): boolean {
  if (!availabilityData || availabilityData.length === 0) {
    return true; // No availability data means product is available
  }
  
  // Get current and future unavailable dates (bookings)
  const currentBookings = filterCurrentAndFutureAvailability(availabilityData, 'unavailable');
  
  // If there are no current/future bookings, product is available
  return currentBookings.length === 0;
}

/**
 * Currency exchange rates (relative to USD)
 * In a production app, these should be fetched from a real-time exchange rate API
 */
const EXCHANGE_RATES = {
  USD: 1,
  RWF: 1300, // 1 USD = 1300 RWF (approximate)
  KES: 150,  // 1 USD = 150 KES (approximate)
  UGX: 3700, // 1 USD = 3700 UGX (approximate)
  EUR: 0.85, // 1 USD = 0.85 EUR (approximate)
  GBP: 0.75, // 1 USD = 0.75 GBP (approximate)
  CAD: 1.35, // 1 USD = 1.35 CAD (approximate)
};

/**
 * Converts an amount from one currency to another
 * @param amount The amount to convert
 * @param fromCurrency Source currency code
 * @param toCurrency Target currency code
 * @returns Converted amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromRate = EXCHANGE_RATES[fromCurrency as keyof typeof EXCHANGE_RATES];
  const toRate = EXCHANGE_RATES[toCurrency as keyof typeof EXCHANGE_RATES];

  if (!fromRate || !toRate) {
    console.warn(`Exchange rate not found for ${fromCurrency} or ${toCurrency}`);
    return amount; // Return original amount if rates not found
  }

  // Convert to USD first, then to target currency
  const usdAmount = amount / fromRate;
  const convertedAmount = usdAmount * toRate;

  return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
}

/**
 * Gets the currency used by mobile money providers
 * @param provider Mobile money provider name
 * @returns Currency code for the provider
 */
export function getMobileMoneyProviderCurrency(provider: string): string {
  const providerCurrencyMap: { [key: string]: string } = {
    'mtn_momo': 'RWF',
    'airtel_money': 'RWF',
    'mpesa': 'KES',
    'mtn_uganda': 'UGX',
  };

  return providerCurrencyMap[provider] || 'RWF'; // Default to RWF
}

/**
 * Determines if currency conversion is needed for mobile money payment
 * @param bookingCurrency The currency of the booking
 * @param provider Mobile money provider
 * @returns true if conversion is needed
 */
export function needsCurrencyConversion(
  bookingCurrency: string,
  provider: string
): boolean {
  const providerCurrency = getMobileMoneyProviderCurrency(provider);
  return bookingCurrency !== providerCurrency;
}

/**
 * Converts booking amount to mobile money provider currency
 * @param amount Booking amount
 * @param bookingCurrency Original booking currency
 * @param provider Mobile money provider
 * @returns Object with converted amount and target currency
 */
export function convertToMobileMoneyAmount(
  amount: number,
  bookingCurrency: string,
  provider: string
): { amount: number; currency: string; exchangeRate: number } {
  const targetCurrency = getMobileMoneyProviderCurrency(provider);
  
  if (bookingCurrency === targetCurrency) {
    return { amount, currency: targetCurrency, exchangeRate: 1 };
  }

  const convertedAmount = convertCurrency(amount, bookingCurrency, targetCurrency);
  const exchangeRate = convertedAmount / amount;

  return {
    amount: convertedAmount,
    currency: targetCurrency,
    exchangeRate
  };
}
