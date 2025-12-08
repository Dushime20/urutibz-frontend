import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon for location picker
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `<div style="
      width: 40px;
      height: 40px;
      background-color: #0c9488;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number) => void;
  onAddressChange?: (address: string) => void;
  height?: string;
  defaultCenter?: [number, number];
}

// Component to handle map clicks
function MapClickHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationChange(lat, lng);
    },
  });
  return null;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  latitude,
  longitude,
  onLocationChange,
  onAddressChange,
  height = '400px',
  defaultCenter = [-1.9441, 30.0619], // Default to Kigali, Rwanda
}) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const mapWrapperRef = useRef<HTMLDivElement>(null);

  // Constrain Leaflet's z-index to prevent it from appearing above modals
  useEffect(() => {
    const styleId = 'location-picker-z-index-fix';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
      
      // Constrain z-index values for Leaflet elements within location picker
      styleElement.textContent = `
        .location-picker-wrapper .leaflet-container,
        .location-picker-wrapper .leaflet-pane,
        .location-picker-wrapper .leaflet-map-pane,
        .location-picker-wrapper .leaflet-tile-pane,
        .location-picker-wrapper .leaflet-overlay-pane,
        .location-picker-wrapper .leaflet-shadow-pane,
        .location-picker-wrapper .leaflet-marker-pane,
        .location-picker-wrapper .leaflet-tooltip-pane,
        .location-picker-wrapper .leaflet-popup-pane {
          z-index: 1 !important;
        }
        .location-picker-wrapper .leaflet-popup {
          z-index: 10 !important;
        }
        .location-picker-wrapper .leaflet-control-container {
          z-index: 5 !important;
        }
      `;
    }
  }, []);

  // Initialize position from props or default
  useEffect(() => {
    if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
      setPosition([latitude, longitude]);
    } else {
      setPosition(defaultCenter);
    }
  }, [latitude, longitude, defaultCenter]);

  // Reverse geocoding function
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    if (!onAddressChange) return;
    
    setIsLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'UrutibiziApp/1.0 (https://urutibizi.com; contact@urutibizi.com)',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding failed');
      }

      const data = await response.json();
      
      if (data.address) {
        // Build address string from components
        const addressParts = [];
        if (data.address.road) addressParts.push(data.address.road);
        if (data.address.house_number) addressParts.push(data.address.house_number);
        if (data.address.suburb || data.address.neighbourhood) {
          addressParts.push(data.address.suburb || data.address.neighbourhood);
        }
        if (data.address.city || data.address.town || data.address.village) {
          addressParts.push(data.address.city || data.address.town || data.address.village);
        }
        
        const fullAddress = addressParts.length > 0 
          ? addressParts.join(', ')
          : data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        
        onAddressChange(fullAddress);
      } else {
        onAddressChange(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      onAddressChange(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsLoadingAddress(false);
    }
  }, [onAddressChange]);

  // Handle location change
  const handleLocationChange = useCallback((lat: number, lng: number) => {
    setPosition([lat, lng]);
    onLocationChange(lat, lng);
    reverseGeocode(lat, lng);
  }, [onLocationChange, reverseGeocode]);

  // Get current location
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        handleLocationChange(lat, lng);
        
        // Center map on current location
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 15);
        }
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please select a location on the map.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [handleLocationChange]);

  if (!position) {
    return (
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center" style={{ height }}>
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapWrapperRef}
      className="location-picker-wrapper w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm relative" 
      style={{ height, zIndex: 1, isolation: 'isolate' }}
    >
      {/* Get Current Location Button */}
      <div className="absolute top-4 right-4 z-[1000]">
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGettingLocation ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Locating...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              <span>Use My Location</span>
            </>
          )}
        </button>
      </div>

      {/* Loading Address Indicator */}
      {isLoadingAddress && (
        <div className="absolute top-4 left-4 z-[1000] bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
          <span className="text-sm text-gray-700 dark:text-slate-300">Getting address...</span>
        </div>
      )}

      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        whenCreated={(map) => {
          mapRef.current = map;
          setTimeout(() => {
            map.invalidateSize();
          }, 100);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationChange={handleLocationChange} />
        <Marker position={position} icon={createCustomIcon()}>
          <Popup>
            <div className="p-2">
              <p className="text-sm font-medium">Selected Location</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {position[0].toFixed(6)}, {position[1].toFixed(6)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Click anywhere on the map to change location
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default LocationPicker;

