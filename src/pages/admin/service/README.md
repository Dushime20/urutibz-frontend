# Admin Service API - Modular Structure

This directory contains the refactored admin service API functions, organized into logical modules for better maintainability and readability.

## Structure Overview

The original monolithic `api.ts` file (over 2300 lines) has been refactored into focused, manageable modules:

### Core Files

- **`config.ts`** - API configuration, common utilities, and helper functions
- **`index.ts`** - Main export file that consolidates all modules
- **`api.ts`** - Legacy compatibility file (now just re-exports from modules)

### Functional Modules (Refactored from api.ts)

- **`products.ts`** - Product management, images, pricing, and availability
- **`users.ts`** - User management, favorites, and basic operations
- **`bookings.ts`** - Booking management and availability
- **`admin.ts`** - Admin dashboard, analytics, and user moderation
- **`categories.ts`** - Category and country management
- **`payments.ts`** - Payment methods, providers, and insurance
- **`settings.ts`** - Admin settings and system management
- **`ai.ts`** - AI interactions, analytics, and machine learning metrics

### Existing Service Files

- **`userProfileService.ts`** - User profile management and updates
- **`pricingService.ts`** - Pricing strategies and calculations
- **`messagingService.ts`** - Messaging and communication features

## AI Service Integration

The new `ai.ts` service provides comprehensive AI interactions and analytics functionality:

### Available Endpoints

- ✅ **`GET /api/v1/ai/interactions/types`** - Returns available interaction types
- ✅ **`POST /api/v1/ai/interactions`** - Tracks user interactions (demo mode)
- ✅ **`GET /api/v1/ai/analytics/user-behavior`** - User behavior analytics (demo mode)
- ✅ **`GET /api/v1/ai/analytics/recommendations`** - Recommendation analytics (demo mode)
- ✅ **`GET /api/v1/ai/metrics/model-performance`** - Model performance metrics (demo mode)

### Key Features

- **Interaction Tracking**: Log user clicks, views, favorites, and other actions
- **Analytics**: Get insights into user behavior and recommendation performance
- **Performance Metrics**: Monitor AI model performance and accuracy
- **Utility Functions**: Pre-built functions for common tracking scenarios
- **Device Detection**: Automatic device type detection for analytics
- **Error Handling**: Graceful error handling that won't break user experience

### Usage Examples

```typescript
import { 
  trackClick, 
  trackView, 
  trackFavorite,
  getUserBehaviorAnalytics,
  getRecommendationAnalytics,
  getModelPerformanceMetrics
} from './ai';

// Track user interactions
await trackClick('product-123', 'product');
await trackView('product-123', 'product');
await trackFavorite('product-123', 'product');

// Get analytics data
const behaviorData = await getUserBehaviorAnalytics(token, {
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

const recommendations = await getRecommendationAnalytics(token);
const modelMetrics = await getModelPerformanceMetrics(token);
```

## Usage

### Option 1: Import from the main index (Recommended)
```typescript
import { 
  fetchAllProducts, 
  fetchAdminStats, 
  createCategory,
  trackClick,
  getUserBehaviorAnalytics,
  UserProfileService,
  PricingService,
  MessagingService
} from './index';
```

### Option 2: Import from specific modules
```typescript
import { fetchAllProducts } from './products';
import { fetchAdminStats } from './admin';
import { createCategory } from './categories';
import { trackClick, getUserBehaviorAnalytics } from './ai';
import { UserProfileService } from './userProfileService';
```

### Option 3: Import from legacy api.ts (Backward compatible)
```typescript
import { fetchAllProducts } from './api';
```

## Benefits of the New Structure

1. **Maintainability** - Each module focuses on a specific domain
2. **Readability** - Easier to find and understand related functions
3. **Scalability** - New functions can be added to appropriate modules
4. **Testing** - Modules can be tested independently
5. **Code Splitting** - Only import the modules you need
6. **Backward Compatibility** - Existing imports continue to work
7. **Consistent Organization** - All services follow the same modular pattern
8. **AI Integration** - Comprehensive AI interactions and analytics support

## Common Utilities

The `config.ts` file provides shared utilities:

- `API_BASE_URL` - Base URL for API endpoints
- `createAuthHeaders(token)` - Create headers with authentication
- `createJsonHeaders(token)` - Create headers for JSON requests
- `handleApiError(err, message)` - Standardized error handling
- `processApiResponse(response)` - Standardized response processing

## Migration Guide

If you're updating existing code:

1. **No changes needed** - Existing imports from `./api` continue to work
2. **Optional optimization** - Consider importing from specific modules for better tree-shaking
3. **New functions** - Add them to the appropriate module based on their domain
4. **Existing services** - Continue using `UserProfileService`, `PricingService`, etc.
5. **AI functions** - Use the new `ai.ts` service for all AI-related functionality

## Example Refactoring

### Before (Monolithic)
```typescript
// All functions in one massive file
export async function fetchAllProducts() { /* ... */ }
export async function fetchAdminStats() { /* ... */ }
export async function createCategory() { /* ... */ }
export async function logInteraction() { /* ... */ }
```

### After (Modular)
```typescript
// products.ts
export async function fetchAllProducts() { /* ... */ }

// admin.ts
export async function fetchAdminStats() { /* ... */ }

// categories.ts
export async function createCategory() { /* ... */ }

// ai.ts
export async function logInteraction() { /* ... */ }
```

## Adding New Functions

When adding new API functions:

1. **Identify the domain** - Which module does it belong to?
2. **Add to appropriate module** - Place it in the relevant `.ts` file
3. **Follow naming conventions** - Use consistent function naming
4. **Use shared utilities** - Leverage `config.ts` helpers
5. **Export from index** - Ensure it's available through the main export

## File Size Comparison

- **Original**: `api.ts` - 2,338 lines
- **New Structure**: 9 focused modules, each under 300 lines
- **Maintenance**: Easier to navigate and modify specific functionality
- **Performance**: Better tree-shaking and code splitting potential
- **Organization**: Clear separation of concerns and responsibilities
- **AI Features**: Comprehensive AI interactions and analytics support

## Complete File List

```
src/pages/admin/service/
├── README.md                 # This documentation
├── api.ts                    # Legacy compatibility (re-exports)
├── index.ts                  # Main export file
├── config.ts                 # Configuration and utilities
├── products.ts               # Product management
├── users.ts                  # User management
├── bookings.ts               # Booking management
├── admin.ts                  # Admin dashboard
├── categories.ts             # Categories and countries
├── payments.ts               # Payment and insurance
├── settings.ts               # Admin settings
├── ai.ts                     # AI interactions and analytics
├── userProfileService.ts     # User profile service
├── pricingService.ts         # Pricing service
└── messagingService.ts       # Messaging service
```
