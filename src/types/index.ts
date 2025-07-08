export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  type: 'sedan' | 'suv' | 'hatchback' | 'convertible' | 'coupe' | 'wagon';
  price: number;
  priceType: 'day' | 'hour';
  location: string;
  images: string[];
  features: string[];
  transmission: 'automatic' | 'manual';
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  seats: number;
  doors: number;
  mileage: number;
  rating: number;
  reviewCount: number;
  available: boolean;
  owner: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  phone: string;
  location: string;
  verified: boolean;
  memberSince: string;
}

export interface Booking {
  id: string;
  carId: string;
  userId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  pickupLocation: string;
  dropoffLocation: string;
  createdAt: string;
}

export interface Review {
  id: string;
  carId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: Pick<User, 'name' | 'avatar'>;
}

export interface FilterOptions {
  priceRange: [number, number];
  carType: string[];
  transmission: string[];
  fuelType: string[];
  seats: number[];
  features: string[];
}
