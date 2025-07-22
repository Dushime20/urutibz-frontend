import React, { useState, useEffect } from 'react';
import { Bot, MapPin, Star, Shield, Heart, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProductImages } from '../../pages/admin/service/api'; // adjust path if needed
import type { Product } from '../../pages/admin/types';
import user from '../../../public/assets/img/profiles/user.jpg'
import { wkbHexToLatLng, getCityFromCoordinates } from '../../lib/utils';


// Add Product type if not already present
// type Product = { ... } // (keep your existing type)

interface FeaturedRentalsSectionProps {
  products?: Product[];
}

// Define an interface for image objects
interface ProductImage {
  url?: string;
  image_url?: string;
  path?: string;
}

// Utility function to extract image URL
function extractImageUrl(img: unknown): string | null {
  // If it's already a string and not empty, return it
  if (typeof img === 'string' && img.trim() !== '') {
    return img;
  }

  // If it's an object, try to extract URL from known properties
  if (img && typeof img === 'object') {
    const possibleUrlProps = ['url', 'image_url', 'path'] as const;
    for (const prop of possibleUrlProps) {
      const value = (img as Record<string, unknown>)[prop];
      if (typeof value === 'string' && value.trim() !== '') {
        return value;
      }
    }
  }

  // If no valid URL found
  return null;
}

const FeaturedRentalsSection: React.FC<FeaturedRentalsSectionProps> = ({ products = [] }) => {
  const [activeFilter, setActiveFilter] = useState('trending');
  const navigate = useNavigate();
  const [productImages, setProductImages] = useState<{ [productId: string]: string[] }>({});
  const [itemLocations, setItemLocations] = useState<{ [id: string]: { city: string | null, country: string | null } }>({});

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem('token') || undefined;
    const fetchImages = async () => {
      const imagesMap: { [productId: string]: string[] } = {};
      
      await Promise.all(products.map(async (item) => {
        try {
          const images = await fetchProductImages(item.id, token);
          
          console.log(`Images for product ${item.id}:`, images);
          
          // Normalize images to extract URLs
          const normalizedImages: string[] = [];
          
          // Handle array of images
          if (Array.isArray(images)) {
            images.forEach(img => {
              const extractedUrl = extractImageUrl(img);
              if (extractedUrl) normalizedImages.push(extractedUrl);
            });
          } 
          // Handle single image
          else {
            const extractedUrl = extractImageUrl(images);
            if (extractedUrl) normalizedImages.push(extractedUrl);
          }
          
          console.log(`Normalized images for product ${item.id}:`, normalizedImages);

          // Use placeholder if no images
          imagesMap[item.id] = normalizedImages.length > 0 
            ? normalizedImages 
            : ['/assets/img/placeholder-image.png'];
        } catch (error) {
          console.error(`Error fetching images for product ${item.id}:`, error);
          imagesMap[item.id] = ['/assets/img/placeholder-image.png'];
        }
      }));

      if (isMounted) setProductImages(imagesMap);
    };
    
    if (products.length > 0) fetchImages();
    return () => { isMounted = false; };
  }, [products]);

  useEffect(() => {
    let isMounted = true;
    const fetchLocations = async () => {
      const locationsMap: { [id: string]: { city: string | null, country: string | null } } = {};
      const locationPromises = products.map(async (item) => {
        let lat: number | undefined, lng: number | undefined;
        if (typeof item.location === 'string') {
          const coords = wkbHexToLatLng(item.location);
          if (coords) {
            lat = coords.lat;
            lng = coords.lng;
          }
        } else if (
          item.location &&
          typeof item.location === 'object' &&
          (
            ('lat' in item.location || 'latitude' in item.location) &&
            ('lng' in item.location || 'longitude' in item.location)
          )
        ) {
          // Use type assertions to access possible properties
          lat = (item.location as any).lat ?? (item.location as any).latitude;
          lng = (item.location as any).lng ?? (item.location as any).longitude;
        }
        
        if (lat !== undefined && lng !== undefined) {
          try {
            const { city, country } = await getCityFromCoordinates(lat, lng);
            locationsMap[item.id] = { city, country };
          } catch (e) {
            console.warn(`Location fetch failed for item ${item.id}:`, e);
            locationsMap[item.id] = { city: null, country: null };
          }
        } else if (
          item.location &&
          typeof item.location === 'object' &&
          'city' in item.location
        ) {
          locationsMap[item.id] = { 
            city: (item.location as any).city, 
            country: (item.location as any).country || null 
          };
        } else {
          locationsMap[item.id] = { city: null, country: null };
        }
      });

      // Use Promise.allSettled to prevent one failed request from stopping others
      await Promise.allSettled(locationPromises);
      
      if (isMounted) setItemLocations(locationsMap);
    };
    if (products.length > 0) fetchLocations();
    return () => { isMounted = false; };
  }, [products]);

  const filters = [
    { id: 'trending', label: 'AI Trending', icon: TrendingUp },
    { id: 'popular', label: 'Community Favorites', icon: Heart },
    { id: 'new', label: 'Recently Added', icon: Bot },
    { id: 'verified', label: 'AI Verified', icon: Shield }
  ];

  // Only show items with status 'active' if status exists
  const activeFeaturedItems = products.filter(item => !item.status || item.status === 'active');

  return (
    <section className="py-12 sm:py-16 lg:py-20 xl:py-24" style={{ backgroundColor: 'var(--background-color)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-3 lg:px-4 py-2 rounded-full border border-teal-200 shadow-sm mb-4 lg:mb-6">
            <Bot className="w-3 h-3 lg:w-4 lg:h-4 text-active" />
            <span className="text-xs lg:text-sm font-medium text-active font-outfit">AI-Curated Selection</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-outfit mb-3 lg:mb-4" style={{ color: 'var(--foreground-color)' }}>
            Featured <span className="text-active">Rentals</span>
          </h2>
          <p className="text-base lg:text-lg leading-relaxed text-platform-grey max-w-2xl mx-auto font-inter px-4">
            Handpicked by our AI based on your preferences, location, and community ratings.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 lg:mb-8 px-4">
          {filters.map((filter) => {
            const IconComponent = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center space-x-1.5 lg:space-x-2 px-3 lg:px-4 py-2 rounded-full font-medium transition-all duration-200 font-outfit text-sm lg:text-base ${activeFilter === filter.id
                  ? 'bg-active text-white shadow-active'
                  : 'bg-white text-platform-grey hover:bg-active/10 hover:text-active border border-platform-light-grey'
                  }`}
              >
                <IconComponent className="w-3 h-3 lg:w-4 lg:h-4" />
                <span className="hidden sm:inline">{filter.label}</span>
              </button>
            );
          })}
        </div>

        {/* Featured Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8 lg:mb-12">
          {activeFeaturedItems.map((item) => (
            <div
              key={item.id}
              className="card group cursor-pointer overflow-hidden hover:shadow-active transition-all duration-300 hover:-translate-y-1"
            
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={productImages[item.id]?.[0] || '/assets/img/placeholder-image.png'}
                  alt={item.title}
                  className="w-full h-36 sm:h-40 lg:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    console.error(`Error loading image for item ${item.id}:`, productImages[item.id]);
                    (e.target as HTMLImageElement).src = '/assets/img/placeholder-image.png';
                  }}
                />

                {/* Badges */}
                <div className="absolute top-2 lg:top-3 left-2 lg:left-3 flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                  {item.trending && (
                    <div className="bg-active text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                      <TrendingUp className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                      <span className="hidden sm:inline">Trending</span>
                    </div>
                  )}
                  <div className="bg-white/90 backdrop-blur-sm text-active px-2 py-1 rounded-full text-xs font-medium">
                    Loading... AI
                  </div>
                </div>

                {/* Wishlist */}
                <button className="absolute top-2 lg:top-3 right-2 lg:right-3 w-7 h-7 lg:w-8 lg:h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Heart className="w-3 h-3 lg:w-4 lg:h-4 text-platform-grey hover:text-red-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-3 lg:p-4">
                <div className="mb-2 lg:mb-3">
                  <h3 className="font-semibold font-outfit mb-1 text-sm lg:text-base line-clamp-1" style={{ color: 'var(--foreground-color)' }}>{item.title}</h3>
                  <p className="text-xs lg:text-sm text-platform-grey font-inter line-clamp-2">{item.description}</p>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1 mb-2 lg:mb-3">
                  {item.features.slice(0, 2).map((feature: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined, index: React.Key | null | undefined) => (
                    <span key={index} className="bg-platform-light-grey text-platform-grey px-1.5 lg:px-2 py-0.5 lg:py-1 rounded text-xs font-inter">
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Location & Distance */}
                <div className="flex items-center text-xs lg:text-sm text-platform-grey mb-2 lg:mb-3 font-inter">
                  <MapPin className="w-2.5 h-2.5 lg:w-3 lg:h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{itemLocations[item.id]?.city || 'loading'}{itemLocations[item.id]?.country ? `, ${itemLocations[item.id]?.country}` : ''}</span>
                  <span className="mx-1 lg:mx-2">•</span>
                  <span className="flex-shrink-0">{item.distance} Loading... away</span>
                </div>

                {/* Owner */}
                <div className="flex items-center space-x-2 mb-2 lg:mb-3">
                  <img
                    src={user}
                    alt={item.owner?.name || 'Unknown'}
                    className="w-5 h-5 lg:w-6 lg:h-6 rounded-full"
                  />
                  <span className="text-xs lg:text-sm font-medium font-inter truncate" style={{ color: 'var(--foreground-color)' }}>{item.owner?.name || 'Unknown'}</span>
                  {item.owner?.verified && (
                    <Shield className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-active flex-shrink-0" />
                  )}
                  <div className="flex items-center space-x-1 ml-auto">
                    <Star className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-platform-grey font-inter">{item.owner?.rating ?? 'loading...'}</span>
                  </div>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-base lg:text-lg font-bold text-active font-outfit">${item.base_price_per_day}</span>
                    <span className="text-xs lg:text-sm text-platform-grey font-inter">/day</span>
                    {item.originalPrice && (
                      <span className="text-xs text-platform-grey line-through ml-1 lg:ml-2 font-inter">${item.originalPrice}</span>
                    )}
                  </div>
                  <Link to={`/it/${item.id}`}>
                  <button
                    className="btn-primary text-xs lg:text-sm px-3 lg:px-4 py-2 font-outfit"
                  
                  >
                    Book Now
                  </button>
                  </Link>
                 
                </div>

                {/* Booking Stats */}
                <div className="text-xs text-platform-grey font-inter">
                  Booked {item.booked} times this month
                </div>
              </div>
            </div>
          ))}
        </div>


      </div>
    </section>
  );
};

export default FeaturedRentalsSection;
