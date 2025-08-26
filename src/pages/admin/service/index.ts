// Main API Service Index - Export all functions from separate modules

// Configuration and utilities
export * from './config';

// Product management
export * from './products';

// User management and interactions
export * from './users';

// Booking management
export * from './bookings';

// Admin dashboard and analytics
export * from './admin';

// Categories and countries
export * from './categories';

// Payment and insurance providers
export * from './payments';

// Settings and system management
export * from './settings';

// AI interactions and analytics
export * from './ai';

// Additional existing services
export * from './userProfileService';
export * from './pricingService';
export * from './messagingService';

// Re-export types that might be needed
export type { AdminBooking } from '../interfaces';
