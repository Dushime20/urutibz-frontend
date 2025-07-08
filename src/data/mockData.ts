import type { Car } from '../types/car';

// Re-export Car type for convenience
export type { Car } from '../types/car';

// Temporary type definitions until separate files are created
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role?: string;
  phone: string;
  location?: string;
  verified?: boolean;
  memberSince?: string;
}

export interface Booking {
  id: string;
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalPrice: number;
  pickupLocation: string;
  dropoffLocation: string;
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  carId: string;
  rating: number;
  comment: string;
  date?: string;
  userName?: string;
  userAvatar?: string;
  createdAt: string;
  user?: {
    id?: string;
    name: string;
    avatar: string;
  };
}

export const mockCars: Car[] = [
  {
    id: 'car-1',
    name: 'Toyota Camry SE 350',
    brand: 'Toyota',
    model: 'Camry',
    year: 2024,
    type: 'sedan',
    price: 160,
    priceType: 'day',
    location: 'Las Vegas',
    description: 'A reliable and comfortable sedan perfect for business trips or daily commuting. Features modern amenities and excellent fuel economy.',
    passengers: 5,
    bags: 3,
    images: [
      '/assets/img/cars/car-01.jpg',
      '/assets/img/cars/car-01-slide1.jpg',
      '/assets/img/cars/car-01-slide2.jpg',
    ],
    features: ['GPS Navigation', 'Bluetooth', 'Air Conditioning', 'Backup Camera', 'Heated Seats'],
    transmission: 'automatic',
    fuelType: 'diesel',
    seats: 5,
    doors: 4,
    mileage: 10,
    rating: 4.0,
    reviewCount: 138,
    available: true,
    owner: {
      id: 'owner-1',
      name: 'John Smith',
      avatar: '/assets/img/profiles/avatar-01.jpg',
      rating: 4.9,
    },
  },
  {
    id: 'car-2',
    name: 'Audi A3 2019 new',
    brand: 'Audi',
    model: 'A3',
    year: 2019,
    type: 'sedan',
    price: 45,
    priceType: 'day',
    location: 'Las Vegas',
    description: 'Luxury compact sedan with premium features and excellent handling. Perfect for both city driving and highway trips.',
    passengers: 5,
    bags: 2,
    images: [
      '/assets/img/cars/car-02.jpg',
      '/assets/img/cars/car-02-slide1.jpg',
      '/assets/img/cars/car-02-slide2.jpg',
    ],
    features: ['All-Wheel Drive', 'Sunroof', 'Apple CarPlay', 'Lane Assist', 'Collision Avoidance'],
    transmission: 'automatic',
    fuelType: 'diesel',
    seats: 5,
    doors: 4,
    mileage: 10,
    rating: 4.0,
    reviewCount: 150,
    available: true,
    owner: {
      id: 'owner-2',
      name: 'Sarah Johnson',
      avatar: '/assets/img/profiles/avatar-02.jpg',
      rating: 4.8,
    },
  },
  {
    id: 'car-3',
    name: 'Ford Mustang 4.0 AT',
    brand: 'Ford',
    model: 'Mustang',
    year: 2021,
    type: 'coupe',
    price: 90,
    priceType: 'day',
    location: 'Las Vegas',
    description: 'Iconic American muscle car with powerful performance and classic styling. Perfect for weekend adventures and special occasions.',
    passengers: 4,
    bags: 2,
    images: [
      '/assets/img/cars/car-03.jpg',
      '/assets/img/cars/car-04.jpg',
    ],
    features: ['Sport Mode', 'Premium Sound', 'Performance Tires', 'Manual Transmission'],
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: 4,
    doors: 2,
    mileage: 10,
    rating: 4.0,
    reviewCount: 170,
    available: true,
    owner: {
      id: 'owner-3',
      name: 'Mike Davis',
      avatar: '/assets/img/profiles/avatar-03.jpg',
      rating: 4.7,
    },
  },
  {
    id: 'car-4',
    name: 'Chevrolet Picker',
    brand: 'Chevrolet',
    model: 'Silverado',
    year: 2018,
    type: 'sedan',
    price: 48,
    priceType: 'day',
    location: 'Spain',
    description: 'Reliable pickup truck perfect for hauling and outdoor adventures. Spacious cabin with modern amenities.',
    passengers: 6,
    bags: 4,
    images: [
      '/assets/img/cars/car-05.jpg',
      '/assets/img/cars/car-06.jpg',
    ],
    features: ['4WD', 'Towing Package', 'Bed Liner', 'Extended Cab'],
    transmission: 'manual',
    fuelType: 'diesel',
    seats: 6,
    doors: 4,
    mileage: 18,
    rating: 4.0,
    reviewCount: 165,
    available: true,
    owner: {
      id: 'owner-4',
      name: 'Lisa Wilson',
      avatar: '/assets/img/profiles/avatar-04.jpg',
      rating: 4.6,
    },
  },
  {
    id: 'car-5',
    name: 'Ferrari 458 MM Special',
    brand: 'Ferrari',
    model: '458',
    year: 2021,
    type: 'coupe',
    price: 95,
    priceType: 'day',
    location: 'Las Vegas',
    description: 'Exotic supercar with breathtaking performance and stunning Italian design. An unforgettable driving experience.',
    passengers: 2,
    bags: 1,
    images: [
      '/assets/img/cars/car-07.jpg',
      '/assets/img/cars/car-07-slide1.jpg',
    ],
    features: ['Carbon Fiber', 'Track Mode', 'Racing Seats', 'Premium Interior'],
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: 2,
    doors: 2,
    mileage: 16,
    rating: 4.0,
    reviewCount: 160,
    available: true,
    owner: {
      id: 'owner-5',
      name: 'Robert Brown',
      avatar: '/assets/img/profiles/avatar-05.jpg',
      rating: 4.9,
    },
  },
  {
    id: 'car-6',
    name: '2018 Chevrolet Camaro',
    brand: 'Chevrolet',
    model: 'Camaro',
    year: 2019,
    type: 'coupe',
    price: 120,
    priceType: 'day',
    location: 'New York, USA',
    description: 'Powerful American muscle car with aggressive styling and thrilling performance. Perfect for making a statement.',
    passengers: 4,
    bags: 2,
    images: [
      '/assets/img/cars/car-08.jpg',
      '/assets/img/cars/car-08-slide1.jpg',
    ],
    features: ['Sport Suspension', 'Brembo Brakes', 'HUD Display', 'Performance Exhaust'],
    transmission: 'automatic',
    fuelType: 'diesel',
    seats: 4,
    doors: 2,
    mileage: 10,
    rating: 4.0,
    reviewCount: 150,
    available: true,
    owner: {
      id: 'owner-6',
      name: 'Emma Garcia',
      avatar: '/assets/img/profiles/avatar-06.jpg',
      rating: 4.8,
    },
  },
  {
    id: 'car-7',
    name: 'Mercedes-Benz C-Class',
    brand: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2023,
    type: 'sedan',
    price: 75,
    priceType: 'day',
    location: 'Beverly Hills, CA',
    description: 'Luxury sedan with sophisticated design and cutting-edge technology. Delivers comfort and prestige in every drive.',
    passengers: 5,
    bags: 3,
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
    ],
    features: ['Premium Audio', 'Leather Seats', 'Sunroof', 'Navigation', 'Wireless Charging'],
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: 5,
    doors: 4,
    mileage: 28,
    rating: 4.9,
    reviewCount: 156,
    available: true,
    owner: {
      id: 'owner-3',
      name: 'Michael Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      rating: 4.8,
    },
  },
  {
    id: 'car-8',
    name: 'Tesla Model 3',
    brand: 'Tesla',
    model: 'Model 3',
    year: 2024,
    type: 'sedan',
    price: 85,
    priceType: 'day',
    location: 'Palo Alto, CA',
    description: 'Revolutionary electric sedan with autopilot capabilities and zero emissions. The future of driving is here.',
    passengers: 5,
    bags: 2,
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800&h=600&fit=crop',
    ],
    features: ['Autopilot', 'Premium Interior', 'Supercharging', 'Glass Roof', 'Premium Audio'],
    transmission: 'automatic',
    fuelType: 'electric',
    seats: 5,
    doors: 4,
    mileage: 0, // Electric vehicle
    rating: 4.7,
    reviewCount: 203,
    available: true,
    owner: {
      id: 'owner-4',
      name: 'Emily Davis',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      rating: 4.9,
    },
  },
  {
    id: 'car-9',
    name: 'Jeep Wrangler 4x4',
    brand: 'Jeep',
    model: 'Wrangler',
    year: 2023,
    type: 'suv',
    price: 65,
    priceType: 'day',
    location: 'Orange County, CA',
    description: 'Rugged off-road vehicle built for adventure. Take on any terrain with confidence and style.',
    passengers: 4,
    bags: 3,
    images: [
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
    ],
    features: ['4x4 Capability', 'Removable Doors', 'Off-Road Tires', 'Rock Rails', 'Skid Plates'],
    transmission: 'manual',
    fuelType: 'petrol',
    seats: 4,
    doors: 2,
    mileage: 24,
    rating: 4.5,
    reviewCount: 67,
    available: true,
    owner: {
      id: 'owner-5',
      name: 'David Wilson',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      rating: 4.6,
    },
  },
  {
    id: 'car-10',
    name: 'Audi A4 Premium',
    brand: 'Audi',
    model: 'A4',
    year: 2024,
    type: 'sedan',
    price: 70,
    priceType: 'day',
    location: 'West Hollywood, CA',
    description: 'Premium luxury sedan with advanced technology and all-wheel drive. Experience German engineering at its finest.',
    passengers: 5,
    bags: 3,
    images: [
      'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
    ],
    features: ['Quattro AWD', 'Virtual Cockpit', 'Premium Sound', 'Heated Seats', 'Parking Assist'],
    transmission: 'automatic',
    fuelType: 'petrol',
    seats: 5,
    doors: 4,
    mileage: 30,
    rating: 4.8,
    reviewCount: 92,
    available: false,
    owner: {
      id: 'owner-6',
      name: 'Lisa Anderson',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
      rating: 4.7,
    },
  },
];

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alex Thompson',
    email: 'alex.thompson@email.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    phone: '+1 (555) 123-4567',
    location: 'Los Angeles, CA',
    verified: true,
    memberSince: '2023-01-15',
  },
];

export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    carId: 'car-1',
    userId: 'user-1',
    startDate: '2024-01-15',
    endDate: '2024-01-18',
    startTime: '10:00',
    endTime: '10:00',
    totalPrice: 135,
    status: 'confirmed',
    pickupLocation: 'Downtown, Los Angeles',
    dropoffLocation: 'Downtown, Los Angeles',
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'booking-2',
    carId: 'car-3',
    userId: 'user-1',
    startDate: '2024-02-01',
    endDate: '2024-02-03',
    startTime: '14:00',
    endTime: '14:00',
    totalPrice: 150,
    status: 'completed',
    pickupLocation: 'Beverly Hills, CA',
    dropoffLocation: 'Beverly Hills, CA',
    createdAt: '2024-01-25T14:00:00Z',
  },
];

export const mockReviews: Review[] = [
  {
    id: 'review-1',
    carId: 'car-1',
    userId: 'user-1',
    rating: 5,
    comment: 'Excellent car! Very clean and comfortable. The owner was very responsive and helpful.',
    createdAt: '2024-01-20T10:00:00Z',
    user: {
      name: 'Alex Thompson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    },
  },
  {
    id: 'review-2',
    carId: 'car-3',
    userId: 'user-1',
    rating: 4,
    comment: 'Great luxury car experience. Perfect for a weekend getaway.',
    createdAt: '2024-02-05T16:00:00Z',
    user: {
      name: 'Alex Thompson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    },
  },
];
