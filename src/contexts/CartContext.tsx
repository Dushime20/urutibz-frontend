import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CartItem {
  id: string;
  productId: string;
  productTitle: string;
  productImage?: string;
  startDate: string;
  endDate: string;
  pricePerDay: number;
  currency: string;
  totalDays: number;
  totalPrice: number;
  pickupMethod?: string;
  deliveryMethod?: 'pickup' | 'delivery' | 'meet_public' | 'visit';
  deliveryAddress?: string;
  meetPublicLocation?: string;
  deliveryInstructions?: string;
  deliveryFee?: number;
  specialInstructions?: string;
  ownerId: string;
  categoryId?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'totalDays' | 'totalPrice'>) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const CART_STORAGE_KEY = 'urutibz_cart';

const calculateTotalDays = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays || 1; // Minimum 1 day
};

const calculateTotalPrice = (pricePerDay: number, totalDays: number): number => {
  return pricePerDay * totalDays;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        setItems(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [items]);

  const addToCart = useCallback((item: Omit<CartItem, 'id' | 'totalDays' | 'totalPrice'>) => {
    setItems((prevItems) => {
      // Check if product with same dates already exists
      const existingIndex = prevItems.findIndex(
        (existing) =>
          existing.productId === item.productId &&
          existing.startDate === item.startDate &&
          existing.endDate === item.endDate
      );

      if (existingIndex >= 0) {
        // Update existing item
        const existing = prevItems[existingIndex];
        const totalDays = calculateTotalDays(item.startDate, item.endDate);
        const totalPrice = calculateTotalPrice(item.pricePerDay, totalDays);
        
        return prevItems.map((itm, idx) =>
          idx === existingIndex
            ? { ...itm, ...item, totalDays, totalPrice }
            : itm
        );
      }

      // Add new item
      const totalDays = calculateTotalDays(item.startDate, item.endDate);
      const totalPrice = calculateTotalPrice(item.pricePerDay, totalDays);
      const newItem: CartItem = {
        ...item,
        id: `${item.productId}-${Date.now()}-${Math.random()}`,
        totalDays,
        totalPrice,
      };

      return [...prevItems, newItem];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  }, []);

  const updateCartItem = useCallback((itemId: string, updates: Partial<CartItem>) => {
    setItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id !== itemId) return item;

        const updated = { ...item, ...updates };
        
        // Recalculate if dates or price changed
        if (updates.startDate || updates.endDate || updates.pricePerDay) {
          const startDate = updates.startDate || item.startDate;
          const endDate = updates.endDate || item.endDate;
          const pricePerDay = updates.pricePerDay || item.pricePerDay;
          
          updated.totalDays = calculateTotalDays(startDate, endDate);
          updated.totalPrice = calculateTotalPrice(pricePerDay, updated.totalDays);
        }

        return updated;
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + item.totalPrice, 0);
  }, [items]);

  const getTotalItems = useCallback(() => {
    return items.length;
  }, [items]);

  const isInCart = useCallback((productId: string) => {
    return items.some((item) => item.productId === productId);
  }, [items]);

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getTotalPrice,
    getTotalItems,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};



