export interface Product {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
  category_id?: string;
  location?: string;
  status?: string;
  image?: string;
  images?: string[];
  bookings?: number;
  rating?: number;
  price?: number;
  icon?: React.ReactNode;
  [key: string]: any;
}

export interface Owner {
  id: string;
  name: string;
  [key: string]: any;
}

export interface ItemCategory {
  id: string;
  icon: React.ReactNode;
  name: string;
  count: number;
}

export interface RecentUser {
  id: string | number;
  name: string;
  email: string;
  avatar: string;
  role: string;
  status: string;
  joinDate: string;
  verified: boolean;
}

export interface RecentBooking {
  id: string | number;
  bookingId: string;
  itemName: string;
  itemImage: string;
  customerName: string;
  amount: number;
  status: string;
  startDate: string;
  endDate: string;
  category: string;
  icon: React.ElementType;
} 