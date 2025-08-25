import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, TrendingUp } from 'lucide-react';

import { fetchAvailableProducts } from './admin/service/api'; // adjust path if needed
import { fetchProductImages, fetchProductPricesByProductId, addUserFavorite, removeUserFavorite, getUserFavorites } from './admin/service/api';
import { wkbHexToLatLng, getCityFromCoordinates } from '../lib/utils';

// Utility to normalize possible image shapes
function extractImageUrl(img: unknown): string | null {
  if (typeof img === 'string' && img.trim() !== '') return img;
  if (img && typeof img === 'object') {
    const possible = ['url', 'image_url', 'path'] as const;
    for (const key of possible) {
      const value = (img as Record<string, unknown>)[key];
      if (typeof value === 'string' && value.trim() !== '') return value;
    }
  }
  return null;
}

// Utility to format currency display
function formatCurrency(amount: string, currency: string): string {
  const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF',
    'CNY': '¥',
    'INR': '₹'
  };
  
  const symbol = currencySymbols[currency] || currency;
  return symbol === currency ? `${currency} ${amount}` : `${symbol}${amount}`;
}

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [productImages, setProductImages] = useState<Record<string, string[]>>({});
  const [itemLocations, setItemLocations] = useState<Record<string, { city: string | null; country: string | null }>>({});
  const [productPrices, setProductPrices] = useState<Record<string, any>>({});
  const [locationsLoading, setLocationsLoading] = useState<Record<string, boolean>>({});
  const [favoriteMap, setFavoriteMap] = useState<Record<string, boolean>>({});

  // Simple in-page search state (visual UX only for now)
  const [where] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token') || undefined;

    // First load: get active products quickly (skip availability check for performance)
    fetchAvailableProducts(token, true).then(result => {
      const initial = result.data || [];
      setProducts(initial);

      // Background load: get fully filtered products (with availability check)
      setTimeout(() => {
        fetchAvailableProducts(token, false).then(filteredResult => {
          if (filteredResult.data) {
            setProducts(filteredResult.data);
          }
        });
      }, 1000);
    });
  }, []);

  // Load user's favorites and map by product id
  useEffect(() => {
    const token = localStorage.getItem('token') || undefined;
    if (!token) return; // require auth for favorites
    (async () => {
      try {
        const favs = await getUserFavorites(token);
        const map: Record<string, boolean> = {};
        if (Array.isArray(favs)) {
          favs.forEach((f: any) => {
            const productId = f?.product_id || f?.productId || f?.id;
            if (typeof productId === 'string') map[productId] = true;
          });
        }
        setFavoriteMap(map);
      } catch {
        // ignore favorites loading errors silently
      }
    })();
  }, []);

  // Fetch images for visible products
  useEffect(() => {
    const token = localStorage.getItem('token') || undefined;
    let isMounted = true;
    async function loadImages() {
      const map: Record<string, string[]> = {};
      await Promise.all(
        products.map(async (p) => {
          try {
            const imgs = await fetchProductImages(p.id, token);
            const normalized: string[] = [];
            if (Array.isArray(imgs)) {
              imgs.forEach(i => {
                const url = extractImageUrl(i);
                if (url) normalized.push(url);
              });
            } else {
              const url = extractImageUrl(imgs);
              if (url) normalized.push(url);
            }
            map[p.id] = normalized.length ? normalized : ['/assets/img/placeholder-image1.png'];
          } catch (e) {
            map[p.id] = ['/assets/img/placeholder-image1.png'];
          }
        })
      );
      if (isMounted) setProductImages(map);
    }
    if (products.length) loadImages();
    return () => { isMounted = false; };
  }, [products]);

  // Resolve city/country from product.location or product.geometry
  // Note: Locations load sequentially to avoid overwhelming the geocoding API
  useEffect(() => {
    let isMounted = true;
    async function loadLocations() {
      const map: Record<string, { city: string | null; country: string | null }> = {};
      const loadingMap: Record<string, boolean> = {};
      
      // Process only the first batch of products to reduce API load
      const productsToProcess = products.slice(0, 8); // Limit to first 8 items for initial display
      
      // Set loading state for all products that will be processed
      productsToProcess.forEach(item => {
        loadingMap[item.id] = true;
      });
      setLocationsLoading(loadingMap);
      
      const tasks = productsToProcess.map(async (item) => {
        let lat: number | undefined; let lng: number | undefined;
        
        // Try to extract coordinates from different possible fields
        const locationSources = [item.location, item.geometry];
        
        for (const source of locationSources) {
          if (!source) continue;
          
          // Handle string format (WKB hex)
          if (typeof source === 'string') {
            const coords = wkbHexToLatLng(source);
            if (coords) { 
              lat = coords.lat; 
              lng = coords.lng; 
              break;
            }
          } 
          // Handle object format
          else if (source && typeof source === 'object') {
            // Try different property names
            lat = (source as any).lat ?? (source as any).latitude ?? (source as any).y;
            lng = (source as any).lng ?? (source as any).longitude ?? (source as any).x;
            
            // Handle nested coordinates array [lng, lat] or [lat, lng]
            if ((source as any).coordinates && Array.isArray((source as any).coordinates)) {
              const coords = (source as any).coordinates;
              if (coords.length >= 2) {
                // GeoJSON format is [longitude, latitude]
                lng = coords[0];
                lat = coords[1];
              }
            }
            
            if (lat != null && lng != null) break;
          }
        }
        
        if (lat != null && lng != null) {
          try {
            const { city, country } = await getCityFromCoordinates(lat, lng);
            map[item.id] = { city, country };
          } catch {
            map[item.id] = { city: null, country: null };
          }
        } else {
          map[item.id] = { city: null, country: null };
        }
        
        // Clear loading state for this item
        if (isMounted) {
          setLocationsLoading(prev => {
            const updated = { ...prev };
            delete updated[item.id];
            return updated;
          });
        }
      });
      
      await Promise.allSettled(tasks);
      if (isMounted) {
        setItemLocations(map);
        // Clear any remaining loading states
        setLocationsLoading({});
      }
    }
    if (products.length) loadLocations();
    return () => { isMounted = false; };
  }, [products]);

  // Fetch product prices for all products
  useEffect(() => {
    let isMounted = true;
    async function loadPrices() {
      const priceMap: Record<string, any> = {};
      await Promise.all(
        products.map(async (product) => {
          try {
            const result = await fetchProductPricesByProductId(product.id);
            if (result.success && result.data && result.data.length > 0) {
              // Use the first pricing data available
              priceMap[product.id] = result.data[0];
            }
          } catch (error) {
            console.warn(`Failed to fetch prices for product ${product.id}:`, error);
          }
        })
      );
      if (isMounted) setProductPrices(priceMap);
    }
    if (products.length) loadPrices();
    return () => { isMounted = false; };
  }, [products]);

  // Apply simple in-memory filter for the visible grid
  const filtered = products.filter(p => {
    const title = (p.title || p.name || '').toString().toLowerCase();
    const city = (itemLocations[p.id]?.city || '').toLowerCase();
    const q = where.trim().toLowerCase();
    if (!q) return true;
    return title.includes(q) || city.includes(q);
  });

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Search Bar removed (moved into Header) */}

      {/* Category chips removed to declutter above Popular listings */}

      {/* Results grid */}
      <div className=" max-w-9xl mx-auto px-8 sm:px-10 lg:px-12 xl:px-16 2xl:px-20 pt-6 sm:pt-10 lg:pt-12">
        {/* Section header */}
        <div className="mb-4 sm:mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-semibold">Popular listings</h2>
            <span className="inline-flex items-center gap-1 text-xs rounded-full px-2 py-1 bg-[#01aaa7]/10 text-[#01aaa7]">
              <TrendingUp className="w-3 h-3" />
              AI trending
            </span>
          </div>
          <Link to="/search" className="text-sm text-[#01aaa7] hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filtered.slice(0, 15).map((item) => (
            <Link key={item.id} to={`/it/${item.id}`} className="group">
              <div className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <img
                    src={productImages[item.id]?.[0] || '/assets/img/placeholder-image1.png'}
                    alt={item.title || 'Listing'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/placeholder-image1.png'; }}
                  />
                  {/* Heart Icon */}
                  <button
                    type="button"
                    aria-label="Add to favorites"
                    className="absolute top-3 right-3 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-colors"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const token = localStorage.getItem('token') || undefined;
                      if (!token) return; // optionally prompt login
                      const currentlyFav = Boolean(favoriteMap[item.id]);
                      // optimistic update
                      setFavoriteMap(prev => ({ ...prev, [item.id]: !currentlyFav }));
                      try {
                        if (currentlyFav) {
                          await removeUserFavorite(item.id, token);
                        } else {
                          await addUserFavorite(item.id, token);
                        }
                      } catch {
                        // revert on failure
                        setFavoriteMap(prev => ({ ...prev, [item.id]: currentlyFav }));
                      }
                    }}
                  >
                    <Heart className={`w-4 h-4 ${favoriteMap[item.id] ? 'text-red-500 fill-current' : 'text-white'}`} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-3 space-y-1">
                  {/* Title and Rating */}
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-gray-900 text-sm leading-tight flex-1 pr-2">
                      {item.title || item.name}
                    </h3>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <Star className="w-3 h-3 fill-current text-gray-900" />
                      <span className="text-sm text-gray-900">
                        {item.average_rating || '4.8'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Location */}
                  <p className="text-gray-600 text-sm">
                    {locationsLoading[item.id] ? (
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                        Loading location...
                      </span>
                    ) : (
                      <>
                        {itemLocations[item.id]?.city || 'Unknown Location'}
                        {itemLocations[item.id]?.country ? `, ${itemLocations[item.id]?.country}` : ''}
                      </>
                    )}
                  </p>
                  
                  {/* Price */}
                  <div className="text-gray-900 pt-1">
                    {productPrices[item.id]?.price_per_day ? (
                      <>
                        <span className="font-semibold">
                          {formatCurrency(productPrices[item.id].price_per_day, productPrices[item.id].currency)}
                        </span>
                        <span className="text-sm"> / day</span>
                      </>
                    ) : item.base_price_per_day != null ? (
                      <>
                        <span className="font-semibold">${item.base_price_per_day}</span>
                        <span className="text-sm"> / day</span>
                      </>
                    ) : (
                      <span className="font-semibold">Price on request</span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

       
      </div>
      
      {/* Padding between content and footer */}
      <div className="pb-8 sm:pb-10 lg:pb-12"></div>
    </div>
  );
};

export default HomePage;