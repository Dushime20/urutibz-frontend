# Risk Management Bulk Create Component

## Overview

The `BulkCreateRiskProfileModal` component provides a comprehensive interface for creating multiple risk profiles in bulk. It matches the API specification for `POST /api/v1/risk-management/profiles/bulk`.

## Features

### 🎯 **Core Functionality**
- **Multiple Profile Creation**: Create multiple risk profiles in a single operation
- **Form Validation**: Real-time validation of required fields
- **Sample Data**: Pre-loaded sample data and downloadable JSON templates
- **Error Handling**: Comprehensive error reporting with detailed feedback
- **Success Reporting**: Detailed results showing successful and failed creations

### 📋 **Form Fields**

Each risk profile includes the following fields:

#### **Required Fields**
- **Product ID**: UUID string identifying the product
- **Category ID**: UUID string identifying the product category
- **Risk Level**: `low` | `medium` | `high` | `critical`
- **Enforcement Level**: `lenient` | `moderate` | `strict` | `very_strict`

#### **Mandatory Requirements**
- **Insurance Required**: Boolean checkbox
- **Inspection Required**: Boolean checkbox
- **Minimum Coverage**: Dollar amount (number)
- **Inspection Types**: Multi-select from:
  - `pre_rental`
  - `post_rental`
  - `periodic`
  - `damage_assessment`
- **Compliance Deadline**: Hours (number)

#### **Risk Management**
- **Risk Factors**: Multi-select from:
  - `high_value`
  - `fragile`
  - `seasonal_demand`
  - `weather_sensitive`
  - `technical_complexity`
  - `safety_critical`
  - `regulatory_compliance`
- **Mitigation Strategies**: Multi-select from:
  - `require_insurance`
  - `mandatory_inspection`
  - `user_training`
  - `safety_protocols`
  - `regular_maintenance`
  - `monitoring_systems`

#### **Enforcement Settings**
- **Auto Enforcement**: Boolean checkbox
- **Grace Period**: Hours (number)

## API Integration

### **Endpoint**
```
POST /api/v1/risk-management/profiles/bulk
```

### **Request Format**
```json
{
  "profiles": [
    {
      "productId": "uuid-string",
      "categoryId": "uuid-string", 
      "riskLevel": "low|medium|high|critical",
      "mandatoryRequirements": {
        "insurance": true,
        "inspection": true,
        "minCoverage": 10000,
        "inspectionTypes": ["pre_rental", "post_rental"],
        "complianceDeadlineHours": 24
      },
      "riskFactors": ["high_value", "fragile", "seasonal_demand"],
      "mitigationStrategies": ["require_insurance", "mandatory_inspection"],
      "enforcementLevel": "moderate|strict|very_strict|lenient",
      "autoEnforcement": true,
      "gracePeriodHours": 48
    }
  ]
}
```

### **Response Format**
```json
{
  "successful": [
    {
      "id": "profile-uuid",
      "productId": "product-uuid",
      "categoryId": "category-uuid",
      "riskLevel": "high",
      // ... other profile fields
    }
  ],
  "failed": [
    {
      "data": { /* original profile data */ },
      "error": "Error message"
    }
  ],
  "summary": {
    "total": 4,
    "successful": 3,
    "failed": 1
  }
}
```

## Usage

### **Basic Usage**
```tsx
import BulkCreateRiskProfileModal from './components/BulkCreateRiskProfileModal';

function RiskManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    // Refresh data or show success message
    console.log('Risk profiles created successfully');
  };

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>
        Bulk Create Risk Profiles
      </button>
      
      <BulkCreateRiskProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
```

### **Sample Data**

The component includes several sample data options:

1. **Load Sample Button**: Pre-fills the form with realistic sample data
2. **Download Sample JSON**: Downloads a JSON file with the exact API format
3. **Default Values**: Each new profile starts with sensible defaults

### **Sample Data Examples**

#### **High-Risk Photography Equipment**
```json
{
  "productId": "403eb546-56bf-4b2e-987d-6bb05a09cadd",
  "categoryId": "photography-equipment",
  "riskLevel": "high",
  "mandatoryRequirements": {
    "insurance": true,
    "inspection": true,
    "minCoverage": 25000,
    "inspectionTypes": ["pre_rental", "post_rental"],
    "complianceDeadlineHours": 12
  },
  "riskFactors": ["high_value", "fragile", "technical_complexity"],
  "mitigationStrategies": ["require_insurance", "mandatory_inspection", "user_training"],
  "enforcementLevel": "strict",
  "autoEnforcement": true,
  "gracePeriodHours": 24
}
```

#### **Critical-Risk Vehicle**
```json
{
  "productId": "550e8400-e29b-41d4-a716-446655440000",
  "categoryId": "vehicles",
  "riskLevel": "critical",
  "mandatoryRequirements": {
    "insurance": true,
    "inspection": true,
    "minCoverage": 50000,
    "inspectionTypes": ["pre_rental", "post_rental", "periodic"],
    "complianceDeadlineHours": 6
  },
  "riskFactors": ["high_value", "safety_critical", "regulatory_compliance"],
  "mitigationStrategies": ["require_insurance", "mandatory_inspection", "safety_protocols"],
  "enforcementLevel": "very_strict",
  "autoEnforcement": true,
  "gracePeriodHours": 12
}
```

## Error Handling

The component provides comprehensive error handling:

### **Validation Errors**
- Required field validation
- Data type validation
- Range validation for numeric fields

### **API Errors**
- Network errors
- Server validation errors
- Authentication errors

### **Success/Failure Reporting**
- Detailed success summary
- Individual failure reasons
- Clear visual indicators

## Styling

The component uses Tailwind CSS with a teal color scheme:
- **Primary Color**: `teal-600` (buttons, focus states)
- **Success Color**: `green-*` (success messages)
- **Error Color**: `red-*` (error messages)
- **Neutral Colors**: `gray-*` (text, borders, backgrounds)

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Focus Management**: Proper focus handling in modal
- **Color Contrast**: WCAG compliant color combinations

## Dependencies

- **React**: Core framework
- **Lucide React**: Icons
- **Tailwind CSS**: Styling
- **Risk Management Service**: API integration

## File Structure

```
src/pages/risk-management/
├── components/
│   ├── BulkCreateRiskProfileModal.tsx
│   └── README.md
├── sample-data/
│   └── risk-profiles-sample.json
└── ...
```

## Testing

To test the component:

1. **Load Sample Data**: Click "Load Sample" to populate with test data
2. **Download JSON**: Click "Download Sample JSON" to get the API format
3. **Add/Remove Profiles**: Test the dynamic profile management
4. **Submit**: Test the API integration (requires backend)

## Future Enhancements

- **CSV Import**: Upload CSV files for bulk creation
- **Template Management**: Save and reuse profile templates
- **Validation Rules**: Custom validation rules per category
- **Bulk Edit**: Edit multiple profiles simultaneously
- **Export**: Export profiles to various formats
