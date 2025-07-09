import type { RentalItem, ItemCategory, User, Booking, Review } from '../types/rentalItem';

// Mock Categories and Subcategories
export const itemCategories: { id: ItemCategory; name: string; icon: string; description: string; count: number }[] = [
  {
    id: 'vehicles',
    name: 'Vehicles',
    icon: '🚗',
    description: 'Cars, motorcycles, bikes, and other transportation',
    count: 156
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: '📱',
    description: 'Laptops, cameras, phones, and gadgets',
    count: 234
  },
  {
    id: 'photography',
    name: 'Photography',
    icon: '📸',
    description: 'Cameras, lenses, lighting, and photo equipment',
    count: 124
  },
  {
    id: 'tools',
    name: 'Tools & Equipment',
    icon: '🔧',
    description: 'Power tools, construction equipment, and machinery',
    count: 189
  },
  {
    id: 'outdoor',
    name: 'Outdoor Gear',
    icon: '⛺',
    description: 'Camping, hiking, and outdoor adventure equipment',
    count: 98
  },
  {
    id: 'events',
    name: 'Event Items',
    icon: '🎉',
    description: 'Party supplies, decorations, and event equipment',
    count: 87
  },
  {
    id: 'sports',
    name: 'Sports Equipment',
    icon: '⚽',
    description: 'Sports gear, fitness equipment, and recreational items',
    count: 145
  },
  {
    id: 'music',
    name: 'Musical Instruments',
    icon: '🎸',
    description: 'Instruments, audio equipment, and music gear',
    count: 76
  },
  {
    id: 'home',
    name: 'Home & Garden',
    icon: '🏠',
    description: 'Furniture, appliances, and home improvement tools',
    count: 203
  },
  {
    id: 'gaming',
    name: 'Gaming',
    icon: '🎮',
    description: 'Gaming consoles, VR equipment, and accessories',
    count: 45
  }
];

// Mock Users (Hosts and Renters)
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Mukama',
    email: 'john@example.com',
    avatar: '/assets/img/profiles/avatar-01.jpg',
    role: 'host',
    phone: '+250 788 123 456',
    location: {
      city: 'Kigali',
      state: 'Kigali City',
      country: 'Rwanda'
    },
    verified: true,
    memberSince: '2023-01-15',
    rating: 4.8,
    totalReviews: 127,
    totalBookings: 156,
    languages: ['en', 'rw', 'fr'],
    responseTime: '1 hour',
    bio: 'Professional photographer and tech enthusiast. I rent out my high-quality equipment to help others create amazing content.',
    badges: ['SuperHost', 'Verified', 'FastResponse']
  },
  {
    id: '2',
    name: 'Sarah Uwimana',
    email: 'sarah@example.com',
    avatar: '/assets/img/profiles/avatar-02.jpg',
    role: 'host',
    phone: '+250 788 234 567',
    location: {
      city: 'Butare',
      state: 'Southern Province',
      country: 'Rwanda'
    },
    verified: true,
    memberSince: '2023-03-22',
    rating: 4.9,
    totalReviews: 89,
    totalBookings: 98,
    languages: ['en', 'rw'],
    responseTime: '30 minutes',
    bio: 'Tech entrepreneur sharing premium electronics and gadgets with the community.',
    badges: ['SuperHost', 'Verified', 'TechExpert']
  }
];

// Comprehensive Mock Rental Items
export const mockRentalItems: RentalItem[] = [
  // Photography Equipment
  {
    id: 'camera-canon-r5',
    name: 'Canon EOS R5 Mirrorless Camera',
    description: 'Professional 45MP full-frame mirrorless camera perfect for photography and videography. Includes 24-70mm lens, extra batteries, and memory cards.',
    category: 'photography',
    subcategory: 'cameras',
    images: [
      '/assets/img/items/camera-01.jpg',
      '/assets/img/items/camera-01-2.jpg',
      '/assets/img/items/camera-01-3.jpg'
    ],
    price: 85,
    priceUnit: 'day',
    minRentalPeriod: 1,
    maxRentalPeriod: 30,
    
    ownerId: '1',
    ownerName: 'John Mukama',
    ownerAvatar: '/assets/img/profiles/avatar-01.jpg',
    ownerRating: 4.8,
    ownerReviews: 127,
    
    location: {
      address: 'KN 4 Ave, Nyarugenge',
      city: 'Kigali',
      state: 'Kigali City',
      country: 'Rwanda',
      coordinates: { lat: -1.9441, lng: 30.0619 },
      timezone: 'Africa/Kigali'
    },
    
    availability: {
      available: true,
      availableDates: [],
      blockedDates: ['2024-07-15', '2024-07-16'],
      instantBook: true,
      responseTime: '1 hour'
    },
    
    condition: 'excellent',
    specifications: {
      resolution: '45MP',
      sensorType: 'Full Frame CMOS',
      videoRecording: '8K RAW, 4K 120p',
      isoRange: '100-51,200',
      batteryLife: '490 shots',
      weight: '650g'
    },
    features: [
      'Image Stabilization',
      'Weather Sealing',
      'Dual Memory Card Slots',
      'Wi-Fi & Bluetooth',
      '8K Video Recording'
    ],
    includedItems: [
      'Canon EOS R5 Body',
      'RF 24-70mm f/2.8L IS USM Lens',
      '2x Extra Batteries',
      '128GB Memory Card',
      'Battery Charger',
      'Camera Strap'
    ],
    
    pickupRequired: false,
    deliveryAvailable: true,
    deliveryFee: 15,
    deliveryRadius: 25,
    securityDeposit: 500,
    cancellationPolicy: 'moderate',
    
    rating: 4.9,
    totalReviews: 24,
    totalBookings: 67,
    
    status: 'active',
    featured: true,
    verified: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-07-08T00:00:00Z',
    
    slug: 'canon-eos-r5-mirrorless-camera',
    tags: ['photography', 'camera', 'professional', 'mirrorless', '8k'],
    searchKeywords: ['canon', 'r5', 'camera', 'photography', 'mirrorless', 'professional']
  },

  // Electronics
  {
    id: 'macbook-pro-16',
    name: 'MacBook Pro 16" M2 Max',
    description: 'Powerful laptop perfect for video editing, design work, and development. Features M2 Max chip, 32GB RAM, and 1TB SSD.',
    category: 'electronics',
    subcategory: 'laptops',
    images: [
      '/assets/img/items/laptop-01.jpg',
      '/assets/img/items/laptop-01-2.jpg'
    ],
    price: 120,
    priceUnit: 'day',
    minRentalPeriod: 1,
    maxRentalPeriod: 14,
    
    ownerId: '2',
    ownerName: 'Sarah Uwimana',
    ownerAvatar: '/assets/img/profiles/avatar-02.jpg',
    ownerRating: 4.9,
    ownerReviews: 89,
    
    location: {
      address: 'Avenue de la Paix',
      city: 'Butare',
      state: 'Southern Province',
      country: 'Rwanda',
      coordinates: { lat: -2.5959, lng: 29.7407 },
      timezone: 'Africa/Kigali'
    },
    
    availability: {
      available: true,
      availableDates: [],
      blockedDates: [],
      instantBook: true,
      responseTime: '30 minutes'
    },
    
    condition: 'excellent',
    specifications: {
      processor: 'Apple M2 Max',
      memory: '32GB Unified Memory',
      storage: '1TB SSD',
      display: '16.2" Liquid Retina XDR',
      graphics: '38-core GPU',
      batteryLife: 'Up to 22 hours'
    },
    features: [
      'M2 Max Chip',
      'Liquid Retina XDR Display',
      'Advanced Thermal Design',
      'Studio-Quality Mics',
      'MagSafe 3 Charging'
    ],
    includedItems: [
      'MacBook Pro 16"',
      'MagSafe 3 Charger',
      'USB-C to Lightning Cable',
      'Laptop Sleeve',
      'Wireless Mouse'
    ],
    
    pickupRequired: false,
    deliveryAvailable: true,
    deliveryFee: 20,
    deliveryRadius: 30,
    securityDeposit: 800,
    cancellationPolicy: 'strict',
    
    rating: 4.8,
    totalReviews: 18,
    totalBookings: 42,
    
    status: 'active',
    featured: true,
    verified: true,
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-07-07T00:00:00Z',
    
    slug: 'macbook-pro-16-m2-max',
    tags: ['laptop', 'apple', 'macbook', 'professional', 'editing'],
    searchKeywords: ['macbook', 'apple', 'laptop', 'computer', 'editing', 'design']
  },

  // Gaming
  {
    id: 'playstation-5',
    name: 'PlayStation 5 Console',
    description: 'Latest gaming console with 4K gaming, ray tracing, and ultra-fast SSD. Includes 2 controllers and popular games.',
    category: 'gaming',
    subcategory: 'consoles',
    images: [
      '/assets/img/items/gaming-01.jpg',
      '/assets/img/items/gaming-01-2.jpg'
    ],
    price: 45,
    priceUnit: 'day',
    minRentalPeriod: 2,
    maxRentalPeriod: 14,
    
    ownerId: '1',
    ownerName: 'John Mukama',
    ownerAvatar: '/assets/img/profiles/avatar-01.jpg',
    ownerRating: 4.8,
    ownerReviews: 127,
    
    location: {
      address: 'KN 4 Ave, Nyarugenge',
      city: 'Kigali',
      state: 'Kigali City',
      country: 'Rwanda',
      coordinates: { lat: -1.9441, lng: 30.0619 },
      timezone: 'Africa/Kigali'
    },
    
    availability: {
      available: true,
      availableDates: [],
      blockedDates: ['2024-07-20', '2024-07-21'],
      instantBook: false,
      responseTime: '2 hours'
    },
    
    condition: 'excellent',
    specifications: {
      processor: 'AMD Zen 2',
      memory: '16GB GDDR6',
      storage: '825GB SSD',
      graphics: 'AMD RDNA 2',
      resolution: '4K 120Hz',
      rayTracing: 'Hardware Ray Tracing'
    },
    features: [
      '4K Gaming',
      'Ray Tracing',
      'Ultra-Fast Loading',
      'Haptic Feedback',
      '3D Audio'
    ],
    includedItems: [
      'PlayStation 5 Console',
      '2x DualSense Controllers',
      'HDMI Cable',
      'Power Cable',
      '5 Popular Games'
    ],
    
    pickupRequired: true,
    deliveryAvailable: false,
    securityDeposit: 300,
    cancellationPolicy: 'moderate',
    
    rating: 4.7,
    totalReviews: 31,
    totalBookings: 78,
    
    status: 'active',
    featured: false,
    verified: true,
    createdAt: '2024-03-05T00:00:00Z',
    updatedAt: '2024-07-06T00:00:00Z',
    
    slug: 'playstation-5-console',
    tags: ['gaming', 'console', 'playstation', '4k', 'entertainment'],
    searchKeywords: ['playstation', 'ps5', 'gaming', 'console', 'entertainment']
  },

  // Vehicles - BMW X5
  {
    id: 'bmw-x5-2019',
    name: 'BMW X5 2019 SUV',
    description: 'Luxury SUV perfect for family trips and special occasions. Fully insured with comprehensive coverage.',
    category: 'vehicles',
    subcategory: 'cars',
    images: [
      '/assets/img/cars/car-04.jpg',
      '/assets/img/cars/car-04-2.jpg'
    ],
    price: 450,
    priceUnit: 'day',
    minRentalPeriod: 1,
    maxRentalPeriod: 30,
    
    ownerId: '2',
    ownerName: 'Sarah Uwimana',
    ownerAvatar: '/assets/img/profiles/avatar-02.jpg',
    ownerRating: 4.9,
    ownerReviews: 89,
    
    location: {
      address: 'Avenue de la Paix',
      city: 'Butare',
      state: 'Southern Province',
      country: 'Rwanda',
      coordinates: { lat: -2.5959, lng: 29.7407 },
      timezone: 'Africa/Kigali'
    },
    
    availability: {
      available: true,
      availableDates: [],
      blockedDates: ['2024-07-12', '2024-07-13'],
      instantBook: false,
      responseTime: '1 hour'
    },
    
    condition: 'excellent',
    specifications: {
      year: 2019,
      make: 'BMW',
      model: 'X5',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      seats: 7,
      doors: 5,
      mileage: 45000,
      engineSize: '3.0L',
      insurance: 'Comprehensive'
    },
    features: [
      'Luxury Interior',
      'Navigation System',
      'Backup Camera',
      'Heated Seats',
      'Panoramic Sunroof',
      'Apple CarPlay'
    ],
    includedItems: [
      'BMW X5 Vehicle',
      'Full Tank of Fuel',
      'Comprehensive Insurance',
      'GPS Navigation',
      'Child Car Seats (on request)'
    ],
    
    pickupRequired: true,
    deliveryAvailable: true,
    deliveryFee: 50,
    deliveryRadius: 50,
    securityDeposit: 1000,
    cancellationPolicy: 'moderate',
    
    rating: 4.8,
    totalReviews: 15,
    totalBookings: 34,
    
    status: 'active',
    featured: true,
    verified: true,
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-07-05T00:00:00Z',
    
    slug: 'bmw-x5-2019-luxury-suv',
    tags: ['vehicle', 'car', 'suv', 'luxury', 'family'],
    searchKeywords: ['bmw', 'x5', 'suv', 'car', 'luxury', 'vehicle']
  },

  // Audio Equipment
  {
    id: 'sony-headphones-wh1000xm5',
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Premium noise-canceling wireless headphones with industry-leading sound quality and 30-hour battery life.',
    category: 'electronics',
    subcategory: 'audio',
    images: [
      '/assets/img/items/headphones-01.jpg',
      '/assets/img/items/headphones-01-2.jpg'
    ],
    price: 25,
    priceUnit: 'day',
    minRentalPeriod: 1,
    maxRentalPeriod: 14,
    
    ownerId: '1',
    ownerName: 'John Mukama',
    ownerAvatar: '/assets/img/profiles/avatar-01.jpg',
    ownerRating: 4.8,
    ownerReviews: 127,
    
    location: {
      address: 'KN 4 Ave, Nyarugenge',
      city: 'Kigali',
      state: 'Kigali City',
      country: 'Rwanda',
      coordinates: { lat: -1.9441, lng: 30.0619 },
      timezone: 'Africa/Kigali'
    },
    
    availability: {
      available: true,
      availableDates: [],
      blockedDates: [],
      instantBook: true,
      responseTime: '1 hour'
    },
    
    condition: 'excellent',
    specifications: {
      type: 'Over-ear Wireless',
      noiseCancellation: 'Industry Leading',
      batteryLife: '30 hours',
      connectivity: 'Bluetooth 5.2',
      weight: '250g',
      driverSize: '30mm'
    },
    features: [
      'Industry-Leading Noise Cancellation',
      'Speak-to-Chat Technology',
      'Quick Attention Mode',
      'Multipoint Connection',
      '30-Hour Battery Life'
    ],
    includedItems: [
      'Sony WH-1000XM5 Headphones',
      'USB-C Charging Cable',
      'Audio Cable',
      'Carrying Case',
      'User Manual'
    ],
    
    pickupRequired: false,
    deliveryAvailable: true,
    deliveryFee: 10,
    deliveryRadius: 20,
    securityDeposit: 100,
    cancellationPolicy: 'flexible',
    
    rating: 4.9,
    totalReviews: 42,
    totalBookings: 89,
    
    status: 'active',
    featured: false,
    verified: true,
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-07-04T00:00:00Z',
    
    slug: 'sony-wh1000xm5-noise-canceling-headphones',
    tags: ['headphones', 'audio', 'wireless', 'noise-canceling', 'premium'],
    searchKeywords: ['sony', 'headphones', 'wireless', 'noise', 'canceling', 'audio']
  }
];

// Legacy car data for backward compatibility
export const mockCars = mockRentalItems.filter(item => item.category === 'vehicles');

// Mock Bookings
export const mockBookings: Booking[] = [
  {
    id: 'BK-2024-001',
    userId: 'user-001',
    itemId: 'camera-canon-r5',
    startDate: '2024-07-10',
    endDate: '2024-07-15',
    startTime: '10:00',
    endTime: '10:00',
    status: 'active',
    totalPrice: 425,
    securityDeposit: 500,
    pickupLocation: 'KN 4 Ave, Nyarugenge, Kigali',
    dropoffLocation: 'KN 4 Ave, Nyarugenge, Kigali',
    deliveryRequired: true,
    deliveryFee: 15,
    specialRequests: 'Please include extra memory cards',
    createdAt: '2024-07-05T00:00:00Z'
  },
  {
    id: 'BK-2024-002',
    userId: 'user-002',
    itemId: 'macbook-pro-16',
    startDate: '2024-07-05',
    endDate: '2024-07-08',
    startTime: '09:00',
    endTime: '18:00',
    status: 'completed',
    totalPrice: 360,
    securityDeposit: 800,
    pickupLocation: 'Avenue de la Paix, Butare',
    dropoffLocation: 'Avenue de la Paix, Butare',
    deliveryRequired: false,
    createdAt: '2024-07-01T00:00:00Z'
  }
];

// Mock Reviews
export const mockReviews: Review[] = [
  {
    id: 'REV-001',
    userId: 'user-001',
    itemId: 'camera-canon-r5',
    bookingId: 'BK-2024-001',
    rating: 5,
    comment: 'Amazing camera! Perfect condition and great quality photos. John was very helpful and responsive.',
    photos: ['/assets/img/reviews/review-01.jpg'],
    createdAt: '2024-07-16T00:00:00Z',
    ratings: {
      accuracy: 5,
      communication: 5,
      cleanliness: 5,
      condition: 5,
      value: 5
    },
    helpfulVotes: 8,
    verifiedBooking: true
  }
];

export default {
  mockRentalItems,
  mockUsers,
  mockBookings,
  mockReviews,
  itemCategories,
  // Legacy exports
  mockCars
};
