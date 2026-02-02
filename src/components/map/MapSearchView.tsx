import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, X, Search, Navigation, SlidersHorizontal, ChevronLeft, ChevronRight, Filter, List, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import { wkbHexToLatLng } from '../../lib/utils';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Product {
  id: string;
  title?: string;
  name?: string;
  base_price_per_day?: string;
  base_currency?: string;
  location?: any;
  geometry?: any;
  images?: string[];
  [key: string]: any;
}

interface MapSearchViewProps {
  products: Product[];
  onLocationSelect?: (lat: number, lng: number, radiusKm: number) => void;
  selectedLocation?: { lat: number; lng: number; radiusKm: number } | null;
  onProductClick?: (productId: string) => void;
  height?: string;
  defaultCenter?: [number, number];
  defaultZoom?: number;
}

// Component to handle map clicks
function MapClickHandler({
  onLocationSelect,
  selectedLocation
}: {
  onLocationSelect?: (lat: number, lng: number, radiusKm: number) => void;
  selectedLocation?: { lat: number; lng: number; radiusKm: number } | null;
}) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      if (onLocationSelect) {
        onLocationSelect(lat, lng, selectedLocation?.radiusKm || 25);
      }
    },
  });
  return null;
}

// Component to center map on selected location
function MapCenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

// Component to initialize map ref and event listeners
function MapInitializer({
  onMapReady
}: {
  onMapReady: (map: L.Map) => void;
}) {
  const map = useMap();
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);
  return null;
}

// Create custom icon for product markers with price (Airbnb style)
const createProductIcon = (price: string, currency: string, isSelected: boolean = false, isHovered: boolean = false) => {
  const scale = isSelected ? 1.15 : isHovered ? 1.1 : 1;
  return L.divIcon({
    className: 'custom-product-marker',
    html: `<div style="
      transform: scale(${scale});
      transition: all 0.2s ease;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    ">
      <div style="
        background-color: ${isSelected ? '#222222' : '#ffffff'};
        color: ${isSelected ? '#ffffff' : '#222222'};
        padding: 6px 10px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 14px;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2), 0 1px 2px rgba(0,0,0,0.1);
        border: ${isSelected ? '2px solid #222222' : '1px solid rgba(0,0,0,0.1)'};
        position: relative;
      ">
        ${currency} ${price}
        <div style="
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          width: 12px;
          height: 12px;
          background-color: ${isSelected ? '#222222' : '#ffffff'};
          border-right: ${isSelected ? '2px solid #222222' : '1px solid rgba(0,0,0,0.1)'};
          border-bottom: ${isSelected ? '2px solid #222222' : '1px solid rgba(0,0,0,0.1)'};
        "></div>
      </div>
    </div>`,
    iconSize: [100, 40],
    iconAnchor: [50, 40],
    popupAnchor: [0, -40],
  });
};

// Create custom icon for selected location (Airbnb style)
const createLocationIcon = () => {
  return L.divIcon({
    className: 'custom-location-marker',
    html: `<div style="
      width: 12px;
      height: 12px;
      background-color: #222222;
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -6],
  });
};

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Extract coordinates from product location
function extractProductCoordinates(product: Product): { lat: number; lng: number } | null {
  let lat: number | undefined;
  let lng: number | undefined;

  const locationSources = [product.location, product.geometry];

  for (const source of locationSources) {
    if (!source) continue;

    if (typeof source === 'string') {
      const coords = wkbHexToLatLng(source);
      if (coords) {
        lat = coords.lat;
        lng = coords.lng;
        break;
      }
    } else if (source && typeof source === 'object') {
      lat = (source as any).lat ?? (source as any).latitude ?? (source as any).y;
      lng = (source as any).lng ?? (source as any).longitude ?? (source as any).x;

      if ((source as any).coordinates && Array.isArray((source as any).coordinates)) {
        const coords = (source as any).coordinates;
        if (coords.length >= 2) {
          lng = coords[0];
          lat = coords[1];
        }
      }

      if (lat != null && lng != null) break;
    }
  }

  if (lat != null && lng != null) {
    return { lat, lng };
  }
  return null;
}

const MapSearchView: React.FC<MapSearchViewProps> = ({
  products,
  onLocationSelect,
  selectedLocation,
  onProductClick,
  height = '100vh',
  defaultCenter = [-1.9441, 30.0619], // Default to Kigali, Rwanda
  defaultZoom = 10,
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [mapZoom, setMapZoom] = useState(defaultZoom);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [clickedMarkerProductId, setClickedMarkerProductId] = useState<string | null>(null);
  const [markerCardPosition, setMarkerCardPosition] = useState<{ x: number; y: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(selectedLocation?.radiusKm || 25);
  const mapRef = useRef<L.Map | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);

  // Mobile-specific state
  const [isMobile, setIsMobile] = useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [bottomSheetHeight, setBottomSheetHeight] = useState(200); // Height in pixels
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map'); // 'map' or 'list'
  const bottomSheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef<number>(0);
  const dragStartHeight = useRef<number>(200);

  // Extract product coordinates
  const productsWithCoords = useMemo(() => {
    return products
      .map(product => {
        const coords = extractProductCoordinates(product);
        if (coords) {
          return { ...product, coords };
        }
        return null;
      })
      .filter((p): p is Product & { coords: { lat: number; lng: number } } => p !== null);
  }, [products]);

  // Filter products within radius
  const productsInRadius = useMemo(() => {
    if (!selectedLocation) return productsWithCoords;

    return productsWithCoords.filter(product => {
      const distance = calculateDistance(
        selectedLocation.lat,
        selectedLocation.lng,
        product.coords.lat,
        product.coords.lng
      );
      return distance <= radiusKm;
    });
  }, [productsWithCoords, selectedLocation, radiusKm]);

  // Handle location selection
  const handleLocationSelect = useCallback((lat: number, lng: number, radius: number) => {
    setMapCenter([lat, lng]);
    setMapZoom(13);
    if (onLocationSelect) {
      onLocationSelect(lat, lng, radius);
    }
  }, [onLocationSelect]);

  // Get current location with enhanced error handling and user feedback
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Please select a location on the map manually.');
      return;
    }

    setIsGettingLocation(true);
    
    // Enhanced geolocation options for better accuracy
    const options = {
      enableHighAccuracy: true,
      timeout: 15000, // 15 seconds timeout
      maximumAge: 300000, // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng, accuracy } = position.coords;
        
        // Calculate appropriate radius based on GPS accuracy
        let searchRadius = radiusKm;
        if (accuracy) {
          // If GPS accuracy is poor (>1000m), use larger search radius
          if (accuracy > 1000) {
            searchRadius = Math.max(radiusKm, 10); // At least 10km for poor accuracy
          } else if (accuracy > 100) {
            searchRadius = Math.max(radiusKm, 5); // At least 5km for moderate accuracy
          }
        }
        
        handleLocationSelect(lat, lng, searchRadius);
        setIsGettingLocation(false);
        
        // Optional: Show success feedback
        console.log(`Location found with ${accuracy ? Math.round(accuracy) + 'm' : 'unknown'} accuracy`);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsGettingLocation(false);
        
        let errorMessage = 'Unable to get your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access was denied. Please enable location services and try again, or select a location on the map manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable. Please check your internet connection or select a location on the map manually.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again or select a location on the map manually.';
            break;
          default:
            errorMessage += 'An unknown error occurred. Please select a location on the map manually.';
            break;
        }
        alert(errorMessage);
      },
      options
    );
  }, [handleLocationSelect, radiusKm]);

  // Update map center when selected location changes
  useEffect(() => {
    if (selectedLocation) {
      setMapCenter([selectedLocation.lat, selectedLocation.lng]);
      setMapZoom(13);
    }
  }, [selectedLocation]);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false); // Hide sidebar on mobile
        if (viewMode === 'list') {
          setBottomSheetOpen(true); // Show bottom sheet when in list mode
        } else {
          setBottomSheetOpen(false); // Hide when in map mode
        }
      } else {
        setSidebarOpen(true); // Show sidebar on desktop
        setBottomSheetOpen(false); // Hide bottom sheet on desktop
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [viewMode]);

  // Handle map invalidation on sidebar toggle or expansion
  useEffect(() => {
    if (mapRef.current) {
      // Small delay to allow CSS transitions to complete
      const timer = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [sidebarOpen]);

  // Bottom sheet drag handlers
  const handleBottomSheetTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    dragStartY.current = e.touches[0].clientY;
    dragStartHeight.current = bottomSheetHeight;
  }, [bottomSheetHeight]);

  const handleBottomSheetTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaY = dragStartY.current - e.touches[0].clientY;
    const newHeight = Math.max(200, Math.min(window.innerHeight - 100, dragStartHeight.current + deltaY));
    setBottomSheetHeight(newHeight);
  }, [isDragging]);

  const handleBottomSheetTouchEnd = useCallback(() => {
    setIsDragging(false);
    // Snap to positions
    if (bottomSheetHeight < window.innerHeight * 0.3) {
      setBottomSheetHeight(200); // Collapsed
    } else if (bottomSheetHeight < window.innerHeight * 0.7) {
      setBottomSheetHeight(window.innerHeight * 0.5); // Half
    } else {
      setBottomSheetHeight(window.innerHeight * 0.9); // Expanded
    }
  }, [bottomSheetHeight]);

  // Toggle view mode on mobile
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => {
      const newMode = prev === 'map' ? 'list' : 'map';
      if (isMobile) {
        setBottomSheetOpen(newMode === 'list');
      }
      return newMode;
    });
  }, [isMobile]);

  // Format price for display (Airbnb style - compact)
  const formatPrice = (product: Product & { coords: { lat: number; lng: number } }) => {
    const price = product.base_price_per_day ? Number(product.base_price_per_day) : 0;
    if (price === 0) return '0';
    if (price >= 1000) {
      return (price / 1000).toFixed(0) + 'K';
    }
    return Math.round(price).toString();
  };

  // Get currency
  const getCurrency = (product: Product) => {
    return product.base_currency || 'USD';
  };

  // Handle map move to update bounds and card position
  const handleMapMove = useCallback(() => {
    if (mapRef.current) {
      setMapBounds(mapRef.current.getBounds());
      // Update card position if a marker is selected
      if (clickedMarkerProductId && mapRef.current) {
        const product = productsWithCoords.find(p => p.id === clickedMarkerProductId);
        if (product) {
          const point = mapRef.current.latLngToContainerPoint([product.coords.lat, product.coords.lng]);
          setMarkerCardPosition({ x: point.x, y: point.y });
        }
      }
    }
  }, [clickedMarkerProductId, productsWithCoords]);

  // Handle map ready
  const handleMapReady = useCallback((map: L.Map) => {
    map.on('click', () => {
      // Close card when clicking on map
      setClickedMarkerProductId(null);
      setMarkerCardPosition(null);
    });
    mapRef.current = map;
    map.on('moveend', handleMapMove);
    map.on('zoomend', handleMapMove);
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [handleMapMove]);

  // Search this area handler
  const handleSearchThisArea = useCallback(() => {
    if (mapRef.current && onLocationSelect) {
      const center = mapRef.current.getCenter();
      const bounds = mapRef.current.getBounds();
      
      // Calculate radius based on map bounds for more accurate search area
      const northEast = bounds.getNorthEast();
      const southWest = bounds.getSouthWest();
      const mapRadiusKm = Math.max(
        calculateDistance(center.lat, center.lng, northEast.lat, northEast.lng),
        calculateDistance(center.lat, center.lng, southWest.lat, southWest.lng)
      );
      
      // Use calculated radius or user-selected radius, whichever is more appropriate
      const searchRadius = Math.min(Math.max(mapRadiusKm * 0.7, 5), 50); // Between 5-50km
      
      handleLocationSelect(center.lat, center.lng, Math.round(searchRadius));
    }
  }, [mapRef, onLocationSelect, handleLocationSelect]);

  return (
    <>
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.15);
        }
        .custom-product-marker {
          background: transparent !important;
          border: none !important;
        }
        .bottom-sheet-handle {
          width: 40px;
          height: 4px;
          background-color: #d1d5db;
          border-radius: 2px;
          margin: 8px auto;
          cursor: grab;
        }
        .bottom-sheet-handle:active {
          cursor: grabbing;
        }
        @media (max-width: 768px) {
          .leaflet-control-container {
            display: none;
          }
        }
      `}</style>
      <div className="relative w-full flex flex-col md:flex-row" style={{ height }}>
        {/* Desktop Sidebar with listing cards (Airbnb style) */}
        <div
          className={`hidden md:flex ${sidebarOpen ? 'w-[500px] lg:w-[600px] border-r border-gray-200 dark:border-gray-800' : 'w-0'
            } bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out overflow-hidden flex-col z-[10]`}
        >
          {sidebarOpen && (
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {productsInRadius.length} {productsInRadius.length === 1 ? 'item' : 'items'}
                  </h2>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Listing Cards - Grid Layout */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {productsInRadius.map((product) => {
                      const isSelected = selectedProductId === product.id;
                      const price = formatPrice(product);
                      const currency = getCurrency(product);
                      const productImage = product.images?.[0];

                      return (
                        <div
                          id={`product-card-${product.id}`}
                          key={product.id}
                          className={`group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${isSelected
                              ? 'border-gray-900 dark:border-white shadow-lg'
                              : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'
                            }`}
                          onClick={() => {
                            setSelectedProductId(product.id);
                            if (onProductClick) {
                              onProductClick(product.id);
                            }
                            // Center map on product
                            setMapCenter([product.coords.lat, product.coords.lng]);
                            setMapZoom(15);
                          }}
                          onMouseEnter={() => setHoveredProductId(product.id)}
                          onMouseLeave={() => setHoveredProductId(null)}
                        >
                          <Link to={`/it/${product.id}`} className="block">
                            <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                              {productImage ? (
                                <img
                                  src={productImage}
                                  alt={product.title || product.name || 'Product'}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <MapPin className="w-8 h-8" />
                                </div>
                              )}
                            </div>
                            <div className="p-2 bg-white dark:bg-gray-900">
                              <h3 className="font-semibold text-xs text-gray-900 dark:text-white line-clamp-2 mb-1 min-h-[2.5rem]">
                                {product.title || product.name || 'Product'}
                              </h3>
                              <p className="text-xs font-medium text-gray-900 dark:text-white">
                                {currency} {Number(product.base_price_per_day || 0).toFixed(2)}
                                <span className="text-gray-600 dark:text-gray-400 font-normal">/day</span>
                              </p>
                            </div>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          {/* Floating Controls (Airbnb style) */}
          <div className="absolute top-4 left-4 z-[6] flex flex-col gap-2">
            {/* Toggle Sidebar - Desktop only */}
            {!sidebarOpen && !isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="hidden md:block bg-white dark:bg-gray-900 rounded-full p-3 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow"
              >
                <ChevronRight className="w-5 h-5 text-gray-900 dark:text-white" />
              </button>
            )}

            {/* Search This Area Button */}
            {onLocationSelect && (
              <button
                onClick={handleSearchThisArea}
                className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-full px-4 md:px-6 py-2.5 md:py-3 shadow-lg hover:shadow-xl transition-all text-sm md:text-base font-semibold whitespace-nowrap flex items-center gap-2 border-2 border-gray-900 dark:border-white"
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search this area</span>
                <span className="sm:hidden">Search area</span>
              </button>
            )}

            {/* My Location Button */}
            <button
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className={`bg-white dark:bg-gray-900 rounded-full p-2.5 md:p-3 shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isGettingLocation ? 'animate-pulse' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              title={isGettingLocation ? "Getting your location..." : "Use my current location"}
            >
              {isGettingLocation ? (
                <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-gray-400 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
              ) : (
                <Navigation className="w-4 h-4 md:w-5 md:h-5 text-gray-900 dark:text-white" />
              )}
            </button>
          </div>

          {/* Map */}
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{
              height: '100%', width: '100%', zIndex: 1
            }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapInitializer onMapReady={handleMapReady} />
            <MapCenter center={mapCenter} zoom={mapZoom} />

            {onLocationSelect && (
              <MapClickHandler
                onLocationSelect={(lat, lng) => handleLocationSelect(lat, lng, radiusKm)}
                selectedLocation={selectedLocation || undefined}
              />
            )}

            {/* Selected location marker and radius circle */}
            {selectedLocation && (
              <>
                <Circle
                  center={[selectedLocation.lat, selectedLocation.lng]}
                  radius={radiusKm * 1000}
                  pathOptions={{
                    color: '#222222',
                    fillColor: '#222222',
                    fillOpacity: 0.08,
                    weight: 1.5,
                  }}
                />
                <Marker
                  position={[selectedLocation.lat, selectedLocation.lng]}
                  icon={createLocationIcon()}
                />
              </>
            )}

            {/* Product markers with price tags */}
            {productsWithCoords.map((product) => {
              const isInRadius = selectedLocation
                ? productsInRadius.some(p => p.id === product.id)
                : true;
              const isSelected = selectedProductId === product.id;
              const isHovered = hoveredProductId === product.id;

              if (!isInRadius && selectedLocation) return null;

              const price = formatPrice(product);
              const currency = getCurrency(product);

              return (
                <Marker
                  key={product.id}
                  position={[product.coords.lat, product.coords.lng]}
                  icon={createProductIcon(price, currency, isSelected, isHovered)}
                  eventHandlers={{
                    click: (e) => {
                      const marker = e.target;
                      const latlng = marker.getLatLng();

                      // Convert lat/lng to pixel coordinates
                      if (mapRef.current) {
                        const point = mapRef.current.latLngToContainerPoint(latlng);
                        setMarkerCardPosition({ x: point.x, y: point.y });
                        setClickedMarkerProductId(product.id);
                        setSelectedProductId(product.id);

                        // Scroll to card in sidebar if open
                        if (sidebarOpen) {
                          const element = document.getElementById(`product-card-${product.id}`);
                          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }
                    },
                    mouseover: () => setHoveredProductId(product.id),
                    mouseout: () => setHoveredProductId(null),
                  }}
                />
              );
            })}
          </MapContainer>

          {/* Preview Card (Airbnb style) - appears when marker is clicked */}
          {clickedMarkerProductId && markerCardPosition && (() => {
            const product = productsWithCoords.find(p => p.id === clickedMarkerProductId);
            if (!product) return null;

            const productImage = product.images?.[0];
            const currency = getCurrency(product);

            return (
              <div
                className="absolute z-[1001] pointer-events-auto"
                style={{
                  left: `${markerCardPosition.x}px`,
                  top: `${markerCardPosition.y - 180}px`, // Position above marker
                  transform: 'translateX(-50%)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  to={`/it/${product.id}`}
                  className="block w-64 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-3xl transition-all duration-200"
                  onClick={() => {
                    if (onProductClick) {
                      onProductClick(product.id);
                    }
                  }}
                >
                  {/* Image */}
                  <div className="relative w-full h-40 bg-gray-100 dark:bg-gray-800">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={product.title || product.name || 'Product'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <MapPin className="w-12 h-12" />
                      </div>
                    )}
                    {/* Close button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setClickedMarkerProductId(null);
                        setMarkerCardPosition(null);
                      }}
                      className="absolute top-3 right-3 w-9 h-9 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 group backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 border border-gray-200 dark:border-gray-700"
                      aria-label="Close preview"
                    >
                      <X className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                      {product.title || product.name || 'Product'}
                    </h3>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {currency} {Number(product.base_price_per_day || 0).toFixed(2)}
                      <span className="text-gray-600 dark:text-gray-400 font-normal">/day</span>
                    </p>
                  </div>
                </Link>

                {/* Arrow pointing to marker */}
                <div
                  className="absolute left-1/2 transform -translate-x-1/2"
                  style={{ top: '100%' }}
                >
                  <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white dark:border-t-gray-900"></div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Mobile Overlay when bottom sheet is open */}
        {isMobile && bottomSheetOpen && viewMode === 'list' && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-20 z-[1001]"
            onClick={() => {
              setBottomSheetOpen(false);
              setViewMode('map');
            }}
          />
        )}

        {/* Mobile Bottom Sheet (Airbnb style) */}
        {isMobile && bottomSheetOpen && viewMode === 'list' && (
          <div
            ref={bottomSheetRef}
            className="md:hidden fixed left-0 right-0  bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl z-[1005] transition-transform duration-300"
            style={{
              height: `${bottomSheetHeight}px`,
              maxHeight: 'calc(90vh - 80px)', // Account for toggle buttons
              bottom: '80px', // Space for toggle buttons
            }}
            onTouchStart={handleBottomSheetTouchStart}
            onTouchMove={handleBottomSheetTouchMove}
            onTouchEnd={handleBottomSheetTouchEnd}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="bottom-sheet-handle"></div>
            </div>

            {/* Header */}
            <div className="px-4 pb-3 border-b  border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {productsInRadius.length} {productsInRadius.length === 1 ? 'item' : 'items'}
                </h2>
                <button
                  onClick={() => {
                    setBottomSheetOpen(false);
                    setViewMode('map');
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Listing Cards - Single Column on Mobile */}
            <div className="flex-1 overflow-y-auto" style={{ height: `${Math.max(200, bottomSheetHeight - 100)}px` }}>
              <div className="p-4 space-y-5 pb-8">
                {productsInRadius.map((product) => {
                  const isSelected = selectedProductId === product.id;
                  const productImage = product.images?.[0];

                  return (
                    <div
                      id={`product-card-${product.id}`}
                      key={product.id}
                      className={`group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${isSelected
                          ? 'border-gray-900 dark:border-white shadow-lg'
                          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                      onClick={() => {
                        setSelectedProductId(product.id);
                        if (onProductClick) {
                          onProductClick(product.id);
                        }
                        // Center map on product
                        setMapCenter([product.coords.lat, product.coords.lng]);
                        setMapZoom(15);
                      }}
                      onMouseEnter={() => setHoveredProductId(product.id)}
                      onMouseLeave={() => setHoveredProductId(null)}
                    >
                      <Link to={`/it/${product.id}`} className="block">
                        <div className="flex gap-4">
                          <div className="relative w-40 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                            {productImage ? (
                              <img
                                src={productImage}
                                alt={product.title || product.name || 'Product'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <MapPin className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 py-2 flex flex-col justify-between">
                            <div>
                              <h3 className="font-semibold text-base text-gray-900 dark:text-white line-clamp-2 mb-2">
                                {product.title || product.name || 'Product'}
                              </h3>
                            </div>
                            <div>
                              <p className="text-base font-semibold text-gray-900 dark:text-white">
                                {getCurrency(product)} {Number(product.base_price_per_day || 0).toFixed(2)}
                                <span className="text-gray-600 dark:text-gray-400 font-normal text-sm">/day</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Toggle Buttons (Airbnb style) */}
        {isMobile && (
          <div className={`md:hidden fixed left-1/2 transform -translate-x-1/2 z-[1003] flex gap-2 transition-all duration-300 ${bottomSheetOpen && viewMode === 'list' ? 'bottom-4' : 'bottom-4'
            }`}>
            <button
              onClick={() => {
                setViewMode('list');
                setBottomSheetOpen(true);
              }}
              className={`px-6 py-3 rounded-full shadow-lg font-semibold text-sm transition-all ${viewMode === 'list'
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white'
                }`}
            >
              List
            </button>
            <button
              onClick={() => {
                setViewMode('map');
                setBottomSheetOpen(false);
              }}
              className={`px-6 py-3 rounded-full shadow-lg font-semibold text-sm transition-all ${viewMode === 'map'
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                  : 'bg-white text-gray-900 dark:bg-gray-800 dark:text-white'
                }`}
            >
              Map
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MapSearchView;

