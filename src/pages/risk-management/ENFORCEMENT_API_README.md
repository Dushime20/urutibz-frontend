# Risk Enforcement API Implementation

## Overview

This implementation provides a complete frontend solution for the Risk Enforcement API endpoint `POST /api/v1/risk-management/enforce`. The API allows administrators to trigger risk enforcement checks for bookings and monitor compliance status.

## API Endpoint

**POST** `/api/v1/risk-management/enforce`

### Authentication
- **Required**: Admin or Super Admin access only
- **Headers**: Authorization token required

### Request Body
```json
{
  "bookingId": "uuid-string"
}
```

### Response
```json
{
  "success": true,
  "message": "Enforcement triggered successfully",
  "data": {
    "compliance": {
      "bookingId": "uuid",
      "productId": "uuid", 
      "renterId": "uuid",
      "isCompliant": false,
      "missingRequirements": ["MISSING_INSURANCE", "MISSING_INSPECTION"],
      "complianceScore": 45,
      "status": "non_compliant",
      "enforcementActions": [
        {
          "id": "action-1",
          "type": "warning",
          "status": "executed",
          "message": "Insurance coverage required",
          "createdAt": "2025-01-06T10:30:00Z"
        }
      ],
      "lastCheckedAt": "2025-01-06T10:30:00Z"
    },
    "violationsRecorded": 2
  }
}
```

## Implementation Components

### 1. Types (`src/types/riskManagement.ts`)

```typescript
export interface RiskEnforcementRequest {
  bookingId: string;
}

export interface ComplianceData {
  bookingId: string;
  productId: string;
  renterId: string;
  isCompliant: boolean;
  missingRequirements: string[];
  complianceScore: number;
  status: 'compliant' | 'non_compliant' | 'pending' | 'under_review';
  enforcementActions: EnforcementAction[];
  lastCheckedAt: string;
}

export interface RiskEnforcementResponse {
  success: boolean;
  message: string;
  data: {
    compliance: ComplianceData;
    violationsRecorded: number;
  };
}
```

### 2. Service Layer (`src/services/riskManagementService.ts`)

```typescript
async triggerRiskEnforcement(data: RiskEnforcementRequest): Promise<RiskEnforcementResponse> {
  try {
    console.log('🔍 Triggering risk enforcement for booking:', data.bookingId);
    
    const response = await riskManagementApi.post('/risk-management/enforce', data);
    
    return {
      success: true,
      message: response.data.message || 'Enforcement triggered successfully',
      data: {
        compliance: response.data.data.compliance,
        violationsRecorded: response.data.data.violationsRecorded
      }
    };
  } catch (error: any) {
    // Comprehensive error handling for different HTTP status codes
    if (error.response?.status === 400) {
      throw new Error('Invalid booking ID or request data');
    } else if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in.');
    } else if (error.response?.status === 403) {
      throw new Error('Insufficient permissions. Admin or Super Admin access required.');
    } else if (error.response?.status === 404) {
      throw new Error('Booking not found or no risk profile associated');
    } else {
      throw new Error(error.response?.data?.message || error.message || 'Failed to trigger risk enforcement');
    }
  }
}
```

### 3. Custom Hook (`src/pages/risk-management/hooks/useRiskEnforcement.ts`)

```typescript
export const useRiskEnforcement = (): UseRiskEnforcementReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RiskEnforcementResponse | null>(null);

  const triggerEnforcement = useCallback(async (data: RiskEnforcementRequest) => {
    try {
      setLoading(true);
      setError(null);
      setResult(null);

      const response = await riskManagementService.triggerRiskEnforcement(data);
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Failed to trigger risk enforcement');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, result, triggerEnforcement, reset };
};
```

### 4. Trigger Component (`src/pages/risk-management/components/RiskEnforcementTrigger.tsx`)

A modal component that provides:
- **Input Form**: Booking ID input with validation
- **Warning Messages**: Clear warnings about enforcement consequences
- **Error Handling**: User-friendly error messages
- **Results Display**: Detailed compliance information
- **Toast Notifications**: Success/error feedback

### 5. Main Page (`src/pages/risk-management/RiskEnforcementPage.tsx`)

A comprehensive page featuring:
- **Statistics Dashboard**: Enforcement metrics and compliance scores
- **Trigger Interface**: Easy-to-use enforcement trigger
- **Recent Enforcements**: History of recent enforcement actions
- **Information Panel**: Educational content about risk enforcement

### 6. Test Component (`src/pages/risk-management/components/EnforcementApiTest.tsx`)

A testing suite that includes:
- **Multiple Test Cases**: Valid bookings, invalid UUIDs, non-existent bookings
- **Real-time Results**: Pass/fail status with detailed information
- **Error Scenario Testing**: Tests various error conditions
- **Console Logging**: Detailed debugging information

## Features

### ✅ **Comprehensive Error Handling**
- **400 Bad Request**: Invalid booking ID format
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions (non-admin users)
- **404 Not Found**: Booking doesn't exist or no risk profile
- **500 Server Error**: Generic server errors

### ✅ **User Experience**
- **Loading States**: Clear loading indicators during API calls
- **Toast Notifications**: Success/error feedback with z-index fix
- **Modal Interface**: Clean, accessible modal for enforcement trigger
- **Results Visualization**: Color-coded compliance status and scores
- **Responsive Design**: Works on all device sizes

### ✅ **Data Visualization**
- **Compliance Score**: Color-coded percentage (green ≥80%, yellow ≥60%, red <60%)
- **Status Badges**: Visual status indicators (compliant, non-compliant, pending)
- **Missing Requirements**: Tagged list of missing compliance items
- **Enforcement Actions**: Detailed list of triggered actions
- **Statistics Dashboard**: Overview of enforcement metrics

### ✅ **Testing & Debugging**
- **API Test Suite**: Comprehensive testing of all scenarios
- **Console Logging**: Detailed request/response logging
- **Sample Data**: Pre-configured test cases
- **Error Scenarios**: Tests for various error conditions

## Usage Examples

### Basic Usage
```typescript
import { useRiskEnforcement } from './hooks/useRiskEnforcement';

const MyComponent = () => {
  const { loading, error, result, triggerEnforcement } = useRiskEnforcement();

  const handleEnforcement = async () => {
    try {
      await triggerEnforcement({ bookingId: '550e8400-e29b-41d4-a716-446655440000' });
      console.log('Enforcement successful:', result);
    } catch (err) {
      console.error('Enforcement failed:', err);
    }
  };

  return (
    <button onClick={handleEnforcement} disabled={loading}>
      {loading ? 'Triggering...' : 'Trigger Enforcement'}
    </button>
  );
};
```

### Using the Trigger Component
```typescript
import RiskEnforcementTrigger from './components/RiskEnforcementTrigger';

const MyPage = () => {
  const handleSuccess = (result) => {
    console.log('Enforcement completed:', result);
  };

  const handleError = (error) => {
    console.error('Enforcement failed:', error);
  };

  return (
    <RiskEnforcementTrigger
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
};
```

## Sample Data

The implementation includes sample data for testing:

```json
{
  "sampleRequests": [
    {
      "bookingId": "550e8400-e29b-41d4-a716-446655440000",
      "description": "High-value camera equipment booking"
    },
    {
      "bookingId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8", 
      "description": "Vehicle rental booking"
    }
  ]
}
```

## Security Considerations

- **Admin-Only Access**: API requires admin or super admin permissions
- **Input Validation**: Booking ID format validation
- **Error Handling**: No sensitive information exposed in error messages
- **Authentication**: Proper token-based authentication

## Integration

The enforcement functionality is integrated into the main risk management page and can be accessed through:

1. **Risk Management Dashboard**: Main page with statistics and trigger interface
2. **Bulk Risk Management Page**: Includes the API test component
3. **Standalone Component**: Can be used independently in other pages

## Future Enhancements

- **Bulk Enforcement**: Trigger enforcement for multiple bookings
- **Scheduled Enforcement**: Automatic enforcement at specific times
- **Compliance Reports**: Detailed compliance reporting and analytics
- **Notification System**: Real-time notifications for compliance issues
- **Audit Trail**: Complete history of enforcement actions
