# Risk Assessment System

A comprehensive risk evaluation and compliance monitoring system for product-renter combinations.

## Overview

The Risk Assessment system provides three main functionalities:
1. **Single Risk Assessment** - Evaluate risk for individual product-renter combinations
2. **Bulk Risk Assessment** - Process multiple assessments simultaneously
3. **Compliance Checking** - Verify booking compliance with risk requirements
4. **Product Risk Profiles** - View detailed risk information for specific products

## API Endpoints

### Risk Assessment APIs
- `POST /api/v1/risk-management/assess` - Single risk assessment
- `POST /api/v1/risk-management/assess/bulk` - Bulk risk assessments
- `POST /api/v1/risk-management/compliance/check` - Check booking compliance
- `GET /api/v1/risk-management/compliance/booking/:bookingId` - Get compliance status
- `GET /api/v1/risk-management/profiles/product/:productId` - Get product risk profile

## Components

### 1. RiskAssessmentForm
**Location**: `src/pages/risk-management/components/RiskAssessmentForm.tsx`

A comprehensive form for performing single risk assessments.

**Features**:
- Product ID and Renter ID input fields
- Real-time risk score visualization (0-100)
- Risk factors breakdown (Product, Renter, Booking, Seasonal)
- Compliance status indicator
- Mandatory requirements display
- Recommendations list
- Export functionality

**Usage**:
```tsx
<RiskAssessmentForm 
  onAssessmentComplete={(assessment) => {
    console.log('Assessment completed:', assessment);
  }}
/>
```

### 2. BulkAssessmentForm
**Location**: `src/pages/risk-management/components/BulkAssessmentForm.tsx`

A form for performing bulk risk assessments with multiple product-renter combinations.

**Features**:
- Dynamic assessment list (add/remove assessments)
- CSV template download
- Progress tracking
- Results table with risk scores and compliance status
- Error handling for failed assessments
- Export results functionality

**Usage**:
```tsx
<BulkAssessmentForm 
  onBulkAssessmentComplete={(results) => {
    console.log('Bulk assessment completed:', results);
  }}
/>
```

### 3. ComplianceChecker
**Location**: `src/pages/risk-management/components/ComplianceChecker.tsx`

A component for checking booking compliance status.

**Features**:
- Booking ID, Product ID, and Renter ID inputs with validation
- Force Check option for mandatory compliance verification
- Compliance status visualization
- Compliance score display (0-100%)
- Missing requirements list
- Enforcement actions display
- Export compliance report with form data

**Usage**:
```tsx
<ComplianceChecker 
  onComplianceChecked={(compliance) => {
    console.log('Compliance checked:', compliance);
  }}
/>
```

### 4. ProductRiskProfile
**Location**: `src/pages/risk-management/components/ProductRiskProfile.tsx`

A component for viewing detailed product risk profiles.

**Features**:
- Product ID input
- Product information display
- Risk level indicator
- Mandatory requirements
- Risk factors list
- Mitigation strategies
- Enforcement settings
- Export profile report

**Usage**:
```tsx
<ProductRiskProfile 
  onProfileLoaded={(profile) => {
    console.log('Profile loaded:', profile);
  }}
/>
```

## Custom Hooks

### 1. useRiskAssessment
**Location**: `src/pages/risk-management/hooks/useRiskAssessment.ts`

Hook for managing single risk assessment operations.

**Returns**:
- `assessment`: Current assessment result
- `loading`: Loading state
- `error`: Error message
- `assessRisk`: Function to perform assessment
- `clearAssessment`: Function to clear results

**Usage**:
```tsx
const { assessment, loading, error, assessRisk, clearAssessment } = useRiskAssessment();
```

### 2. useBulkAssessment
**Location**: `src/pages/risk-management/hooks/useBulkAssessment.ts`

Hook for managing bulk risk assessment operations.

**Returns**:
- `results`: Bulk assessment results
- `loading`: Loading state
- `error`: Error message
- `assessBulk`: Function to perform bulk assessment
- `clearResults`: Function to clear results

**Usage**:
```tsx
const { results, loading, error, assessBulk, clearResults } = useBulkAssessment();
```

### 3. useComplianceCheck
**Location**: `src/pages/risk-management/hooks/useComplianceCheck.ts`

Hook for managing compliance checking operations.

**Returns**:
- `compliance`: Compliance check result
- `loading`: Loading state
- `error`: Error message
- `checkCompliance`: Function to check compliance
- `getBookingCompliance`: Function to get booking compliance status
- `clearCompliance`: Function to clear results

**Usage**:
```tsx
const { compliance, loading, error, checkCompliance, getBookingCompliance, clearCompliance } = useComplianceCheck();
```

### 4. useProductRiskProfile
**Location**: `src/pages/risk-management/hooks/useProductRiskProfile.ts`

Hook for managing product risk profile operations.

**Returns**:
- `profile`: Product risk profile
- `loading`: Loading state
- `error`: Error message
- `getProfile`: Function to get product profile
- `clearProfile`: Function to clear profile

**Usage**:
```tsx
const { profile, loading, error, getProfile, clearProfile } = useProductRiskProfile();
```

## Data Structures

### Risk Assessment Response
```typescript
interface RiskAssessmentResponse {
  success: boolean;
  data: {
    productId: string;
    renterId: string;
    overallRiskScore: number;
    riskFactors: {
      productRisk: number;
      renterRisk: number;
      bookingRisk: number;
      seasonalRisk: number;
    };
    recommendations: string[];
    mandatoryRequirements: {
      insurance: boolean;
      inspection: boolean;
      minCoverage: number;
      inspectionTypes: string[];
    };
    complianceStatus: 'compliant' | 'non_compliant' | 'pending' | 'under_review';
    assessmentDate: string;
    expiresAt: string;
  };
}
```

### Compliance Check Request
```typescript
interface ComplianceCheckRequest {
  bookingId: string;
  productId: string;
  renterId: string;
  forceCheck?: boolean; // optional, defaults to false
}
```

### Compliance Check Response
```typescript
interface ComplianceCheckResponse {
  success: boolean;
  data: {
    bookingId: string;
    isCompliant: boolean;
    missingRequirements: string[];
    complianceScore: number;
    status: 'compliant' | 'non_compliant' | 'pending' | 'under_review';
    enforcementActions: EnforcementAction[];
    lastCheckedAt: string;
  };
}
```

### Product Risk Profile Response
```typescript
interface ProductRiskProfileResponse {
  success: boolean;
  data: {
    productId: string;
    productName: string;
    categoryId: string;
    categoryName: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    mandatoryRequirements: {
      insurance: boolean;
      inspection: boolean;
      minCoverage: number;
      inspectionTypes: string[];
      complianceDeadlineHours: number;
    };
    riskFactors: string[];
    mitigationStrategies: string[];
    enforcementLevel: 'lenient' | 'moderate' | 'strict' | 'very_strict';
    autoEnforcement: boolean;
    gracePeriodHours: number;
    createdAt: string;
    updatedAt: string;
  };
}
```

## Visual Indicators

### Risk Level Colors
- **Low Risk (0-39)**: Green (`text-green-600`, `bg-green-50`)
- **Medium Risk (40-59)**: Yellow (`text-yellow-600`, `bg-yellow-50`)
- **High Risk (60-79)**: Orange (`text-orange-600`, `bg-orange-50`)
- **Critical Risk (80-100)**: Red (`text-red-600`, `bg-red-50`)

### Compliance Status Colors
- **Compliant**: Green (`text-green-600`, `bg-green-50`)
- **Non-Compliant**: Red (`text-red-600`, `bg-red-50`)
- **Pending**: Yellow (`text-yellow-600`, `bg-yellow-50`)
- **Under Review**: Teal (`text-teal-600`, `bg-teal-50`)

### Enforcement Level Colors
- **Lenient**: Green (`text-green-600`, `bg-green-50`)
- **Moderate**: Yellow (`text-yellow-600`, `bg-yellow-50`)
- **Strict**: Orange (`text-orange-600`, `bg-orange-50`)
- **Very Strict**: Red (`text-red-600`, `bg-red-50`)

## Error Handling

All components include comprehensive error handling:
- Network errors
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Validation errors (400)
- Server errors (500+)

Error messages are displayed to users via toast notifications and inline error displays.

## Export Functionality

All components support data export:
- **Risk Assessment**: JSON format with full assessment data
- **Bulk Assessment**: JSON format with summary and detailed results
- **Compliance Check**: JSON format with compliance report
- **Product Profile**: JSON format with profile data
- **Bulk Template**: CSV format for bulk assessment input

## Authentication

All API endpoints require authentication. The system automatically includes the auth token from localStorage in all requests.

## Responsive Design

All components are fully responsive and work on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## Accessibility

Components include:
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility
- High contrast color schemes
- Focus indicators

## Usage Examples

### Single Risk Assessment
```tsx
import RiskAssessmentForm from './components/RiskAssessmentForm';

function MyComponent() {
  const handleAssessmentComplete = (assessment) => {
    console.log('Risk Score:', assessment.overallRiskScore);
    console.log('Compliance:', assessment.complianceStatus);
  };

  return (
    <RiskAssessmentForm onAssessmentComplete={handleAssessmentComplete} />
  );
}
```

### Bulk Risk Assessment
```tsx
import BulkAssessmentForm from './components/BulkAssessmentForm';

function MyComponent() {
  const handleBulkComplete = (results) => {
    console.log('Total:', results.totalAssessments);
    console.log('Successful:', results.successful);
    console.log('Failed:', results.failed);
  };

  return (
    <BulkAssessmentForm onBulkAssessmentComplete={handleBulkComplete} />
  );
}
```

### Compliance Check
```tsx
import ComplianceChecker from './components/ComplianceChecker';

function MyComponent() {
  const handleComplianceChecked = (compliance) => {
    console.log('Is Compliant:', compliance.isCompliant);
    console.log('Score:', compliance.complianceScore);
    console.log('Missing:', compliance.missingRequirements);
  };

  return (
    <ComplianceChecker onComplianceChecked={handleComplianceChecked} />
  );
}
```

## Integration

To integrate the Risk Assessment system into your application:

1. Import the main page component:
```tsx
import RiskAssessmentPage from './pages/risk-management/RiskAssessmentPage';
```

2. Add to your routing:
```tsx
<Route path="/risk-assessment" element={<RiskAssessmentPage />} />
```

3. Or use individual components as needed:
```tsx
import { RiskAssessmentForm, ComplianceChecker, ProductRiskProfile } from './components';
```

## Dependencies

- React 18+
- TypeScript 4.9+
- Lucide React (icons)
- Tailwind CSS (styling)
- Axios (HTTP client)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
