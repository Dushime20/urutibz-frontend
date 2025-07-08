export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: string;
  price: number;
  priceType: string;
  images: string[];
  description: string;
  passengers: number;
  seats: number;
  bags: number;
  doors: number;
  transmission: string;
  fuelType: string;
  year: number;
  rating: number;
  reviewCount: number;
  features: string[];
  available: boolean;
  location?: string;
  mileage: number;
  owner?: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    reviewCount?: number;
  };
}
