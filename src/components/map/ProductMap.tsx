import React, { useMemo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ProductMapProps {
  latitude: number;
  longitude: number;
  productTitle?: string;
  address?: string;
  height?: string;
}

const ProductMap: React.FC<ProductMapProps> = ({ 
  latitude, 
  longitude, 
  productTitle = 'Product Location',
  address,
  height = '400px'
}) => {
  const center = useMemo(() => [latitude, longitude] as [number, number], [latitude, longitude]);
  const position = useMemo(() => [latitude, longitude] as [number, number], [latitude, longitude]);
  const mapWrapperRef = useRef<HTMLDivElement>(null);

  // Constrain Leaflet's z-index to prevent it from appearing above other sections
  useEffect(() => {
    const styleId = 'leaflet-z-index-fix';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
      
      // Constrain z-index values for Leaflet elements within product maps
      styleElement.textContent = `
        .product-map-wrapper .leaflet-container,
        .product-map-wrapper .leaflet-pane,
        .product-map-wrapper .leaflet-map-pane,
        .product-map-wrapper .leaflet-tile-pane,
        .product-map-wrapper .leaflet-overlay-pane,
        .product-map-wrapper .leaflet-shadow-pane,
        .product-map-wrapper .leaflet-marker-pane,
        .product-map-wrapper .leaflet-tooltip-pane,
        .product-map-wrapper .leaflet-popup-pane {
          z-index: 1 !important;
        }
        .product-map-wrapper .leaflet-popup {
          z-index: 10 !important;
        }
        .product-map-wrapper .leaflet-control-container {
          z-index: 5 !important;
        }
      `;
    }
  }, []);

  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    return (
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center" style={{ height }}>
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Location information not available</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapWrapperRef}
      className="product-map-wrapper w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm relative" 
      style={{ height, zIndex: 1, isolation: 'isolate' }}
    >
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        whenCreated={(map) => {
          // Invalidate size after map is created to ensure proper rendering
          setTimeout(() => {
            map.invalidateSize();
          }, 100);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-sm mb-1">{productTitle}</h3>
              {address && <p className="text-xs text-gray-600 dark:text-gray-400">{address}</p>}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default ProductMap;

