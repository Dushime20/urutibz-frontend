// Core Item Types for Peer-to-Peer Rental Platform

export interface RentalItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  subcategory: string;
  images: string[];
  price: number;
  priceUnit: 'hour' | 'day' | 'week' | 'month';
  minRentalPeriod: number;
  maxRentalPeriod: number;
  
  // Owner Information
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  ownerRating: number;
  ownerReviews: number;
  
  // Location
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
    timezone: string;
  };
  
  // Availability
  availability: {
    available: boolean;
    availableDates: string[];
    blockedDates: string[];
    instantBook: boolean;
    responseTime: string;
  };
  
  // Item Details
  condition: 'new' | 'excellent' | 'good' | 'fair';
  specifications: Record<string, any>;
  features: string[];
  includedItems: string[];
  
  // Rental Terms
  pickupRequired: boolean;
  deliveryAvailable: boolean;
  deliveryFee?: number;
  deliveryRadius?: number;
  securityDeposit: number;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict';
  
  // Reviews and Ratings
  rating: number;
  totalReviews: number;
  totalBookings: number;
  
  // Platform Data
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  featured: boolean;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  
  // SEO and Display
  slug: string;
  tags: string[];
  searchKeywords: string[];
}

export type ItemCategory = 
  | 'vehicles'
  | 'electronics'
  | 'photography'
  | 'tools'
  | 'outdoor'
  | 'events'
  | 'sports'
  | 'music'
  | 'home'
  | 'fashion'
  | 'gaming'
  | 'fitness'
  | 'travel'
  | 'books'
  | 'art'
  | 'other';

export interface ItemSubcategory {
  id: string;
  name: string;
  category: ItemCategory;
  icon: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'renter' | 'host' | 'admin';
  phone: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  verified: boolean;
  memberSince: string;
  rating: number;
  totalReviews: number;
  totalBookings: number;
  languages: string[];
  responseTime: string;
  bio?: string;
  badges: string[];
}

export interface Booking {
  id: string;
  userId: string;
  itemId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime?: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  totalPrice: number;
  securityDeposit: number;
  pickupLocation: string;
  dropoffLocation: string;
  deliveryRequired: boolean;
  deliveryFee?: number;
  specialRequests?: string;
  createdAt: string;
  
  // References
  item?: RentalItem;
  user?: User;
  host?: User;
}

export interface Review {
  id: string;
  userId: string;
  itemId: string;
  bookingId: string;
  rating: number;
  comment: string;
  photos?: string[];
  createdAt: string;
  
  // Detailed Ratings
  ratings: {
    accuracy: number;
    communication: number;
    cleanliness: number;
    condition: number;
    value: number;
  };
  
  // References
  user?: User;
  item?: RentalItem;
  
  // Helpful votes
  helpfulVotes: number;
  verifiedBooking: boolean;
}

// Legacy Car Type for backward compatibility
export interface Car extends RentalItem {
  year: number;
  make: string;
  model: string;
  transmission: 'automatic' | 'manual';
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  seats: number;
  doors: number;
  mileage: number;
  licensePlate?: string;
  insuranceIncluded: boolean;
}

// All types are exported individually above
