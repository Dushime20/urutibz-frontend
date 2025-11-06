# Combined Owner Pre-Inspection Form

## 📋 Overview

The **Owner Pre-Inspection Form Combined** (`OwnerPreInspectionFormCombined.tsx`) combines two previously separate forms into one unified form for product owners:

1. **Create New Inspection Modal** - For creating inspection requests
2. **Provide Pre-Inspection Form** - For providing detailed pre-inspection data

This creates a **single, streamlined workflow** where owners can create an inspection and provide all pre-inspection data in one step.

---

## 🎯 Purpose

**Before (2-step process):**
1. Owner creates inspection request → Gets inspection ID
2. Owner provides pre-inspection data → Uses inspection ID

**After (1-step process):**
1. Owner creates inspection and provides pre-inspection data → All in one form

---

## 📊 Form Fields

### **Section 1: Inspection Details**

**Fields from Create Inspection Modal:**
- ✅ **Product** (required) - Autocomplete search
- ✅ **Booking** (optional) - Autocomplete search
- ✅ **Inspection Type** (required) - Dropdown (PRE_RENTAL, POST_RENTAL, etc.)
- ✅ **Scheduled Date & Time** (required) - DateTime picker
- ✅ **Location (Address)** (required) - Text input for scheduling
- ✅ **Inspector** (optional) - Dropdown (optional, not required)
- ✅ **Notes** (optional) - Textarea

### **Section 2: Product Condition Data**

**Fields from Provide Pre-Inspection Form:**
- ✅ **Product Photos** (required) - 10-20 photos, minimum 10
- ✅ **Overall Condition** (required) - Dropdown (EXCELLENT, GOOD, FAIR, POOR, DAMAGED)
- ✅ **Product Components/Items** (optional) - Dynamic list:
  - Item name
  - Condition
  - Description
- ✅ **Accessories & Included Items** (optional) - Dynamic list:
  - Accessory name
  - Included checkbox
  - Condition
- ✅ **Known Issues or Defects** (optional) - Dynamic list
- ✅ **Maintenance History** (optional) - Textarea
- ✅ **Additional Notes** (optional) - Textarea
- ✅ **GPS Location** (required) - GPS coordinates (latitude, longitude)
- ✅ **Confirmation Checkbox** (required) - "I confirm that the information is accurate"

---

## 🔄 Data Flow

### **Single Submit Handler:**

```typescript
handleCompleteSubmit() {
  // Validates all fields from both sections
  // Creates inspection with pre-inspection data in one API call
  // API: POST /api/v1/inspections
  // Body: {
  //   ...inspectionDetails,
  //   ownerPreInspectionData: { ...preInspectionData }
  // }
}
```

### **API Request:**

```typescript
{
  mode: 'owner',
  productId: string,
  bookingId?: string,
  inspectorId?: string,  // Optional
  inspectionType: InspectionType,
  scheduledAt: string,
  location: string,      // Text address
  notes?: string,
  ownerPreInspectionData: {
    photos: File[] | string[],
    condition: {
      overallCondition: ItemCondition,
      items: Array<{...}>,
      accessories: Array<{...}>,
      knownIssues: string[],
      maintenanceHistory?: string
    },
    notes: string,
    location: GPSLocation,  // GPS coordinates
    timestamp: string,
    confirmed: boolean
  }
}
```

---

## 🔧 Integration

### **Usage in Dashboard:**

**Replace `CreateInspectionModal` with `OwnerPreInspectionFormCombined`:**

```typescript
// Before
import CreateInspectionModal from '../../components/inspections/CreateInspectionModal';

<CreateInspectionModal
  isOpen={showInspectionModal}
  onClose={() => setShowInspectionModal(false)}
  onSubmit={async (data) => {
    await inspectionService.createInspection(data);
  }}
/>

// After
import OwnerPreInspectionFormCombined from '../../components/inspections/OwnerPreInspectionFormCombined';

<OwnerPreInspectionFormCombined
  isOpen={showInspectionModal}
  onClose={() => setShowInspectionModal(false)}
  onSuccess={() => {
    // Refresh inspections list
    loadUserInspections();
    showToast('Pre-inspection created successfully!', 'success');
  }}
  initialInspectionData={{
    productId: selectedProductId,  // Optional
    bookingId: selectedBookingId,   // Optional
    inspectionType: InspectionType.PRE_RENTAL
  }}
/>
```

### **Usage in Inspections Section:**

**Replace the "Provide Pre-Inspection" button logic:**

```typescript
// Before - Two separate steps
1. Create inspection → Get inspection ID
2. Open OwnerPreInspectionForm with inspection ID

// After - One combined step
1. Open OwnerPreInspectionFormCombined
2. Create inspection + submit pre-inspection data in one step
```

---

## ✅ Benefits

1. **Simplified Workflow:**
   - One form instead of two
   - No need to wait for inspection ID
   - Faster completion

2. **Better UX:**
   - All fields in one place
   - Clear sections (Inspection Details + Product Condition)
   - Single submit button

3. **Data Consistency:**
   - All data submitted together
   - No risk of incomplete data
   - Atomic operation

4. **Reduced API Calls:**
   - One API call instead of two
   - Better performance
   - Less server load

---

## ⚠️ Backend Requirements

The backend API needs to support:

1. **Create Inspection with Pre-Inspection Data:**
   ```typescript
   POST /api/v1/inspections
   Body: {
     ...inspectionDetails,
     ownerPreInspectionData: { ... }
   }
   ```

2. **Optional Inspector:**
   - `inspectorId` should be optional (nullable)
   - Inspection can be created without inspector

3. **Pre-Inspection Data Storage:**
   - Store `ownerPreInspectionData` in database
   - Set `ownerPreInspectionConfirmed = true` automatically
   - Handle photo uploads

---

## 📝 Migration Guide

### **Step 1: Update Dashboard Page**

**File:** `src/pages/my-account/DashboardPage.tsx`

```typescript
// Replace
import CreateInspectionModal from '../../components/inspections/CreateInspectionModal';

// With
import OwnerPreInspectionFormCombined from '../../components/inspections/OwnerPreInspectionFormCombined';

// Update usage
<OwnerPreInspectionFormCombined
  isOpen={showInspectionModal}
  onClose={() => setShowInspectionModal(false)}
  onSuccess={() => {
    loadUserInspections();
    showToast('Pre-inspection created successfully!', 'success');
  }}
/>
```

### **Step 2: Update Inspections Section**

**File:** `src/pages/my-account/components/InspectionsSection.tsx`

**Option A: Keep separate forms (for existing inspections)**
- Keep `OwnerPreInspectionForm` for existing inspections
- Use `OwnerPreInspectionFormCombined` for new inspections

**Option B: Replace completely**
- Replace all usage with `OwnerPreInspectionFormCombined`
- Remove `OwnerPreInspectionForm` import

### **Step 3: Update Backend API**

**File:** `src/services/productInspection.service.ts`

```typescript
// Update createInspection method to accept ownerPreInspectionData
async createInspection(data: CreateInspectionRequest & {
  ownerPreInspectionData?: OwnerPreInspectionData;
}) {
  // Create inspection
  // If ownerPreInspectionData provided:
  //   - Store pre-inspection data
  //   - Set ownerPreInspectionConfirmed = true
  //   - Upload photos
}
```

---

## 🎨 Form Structure

### **Layout:**

```
┌─────────────────────────────────────────┐
│  Create Pre-Inspection                  │
├─────────────────────────────────────────┤
│                                         │
│  Section 1: Inspection Details          │
│  ┌─────────────────────────────────┐  │
│  │ Product *                        │  │
│  │ Booking (Optional)               │  │
│  │ Inspection Type *                │  │
│  │ Scheduled Date & Time *          │  │
│  │ Location (Address) *             │  │
│  │ Inspector (Optional)              │  │
│  │ Notes (Optional)                 │  │
│  └─────────────────────────────────┘  │
│                                         │
│  Section 2: Product Condition Data      │
│  ┌─────────────────────────────────┐  │
│  │ Photos * (10-20)                 │  │
│  │ Overall Condition *             │  │
│  │ Product Components/Items         │  │
│  │ Accessories & Included Items      │  │
│  │ Known Issues                     │  │
│  │ Maintenance History              │  │
│  │ Additional Notes                  │  │
│  │ GPS Location *                   │  │
│  │ Confirmation Checkbox *           │  │
│  └─────────────────────────────────┘  │
│                                         │
│  [Cancel] [Create Inspection & Submit] │
└─────────────────────────────────────────┘
```

---

## 📋 Summary

### **Key Features:**
- ✅ Single form for inspection creation + pre-inspection data
- ✅ All fields from both original forms
- ✅ Inspector optional (supports new workflow)
- ✅ GPS location for verification
- ✅ Photo upload (10-20 photos)
- ✅ Comprehensive condition assessment
- ✅ Single submit button

### **Benefits:**
- ✅ Simplified workflow (1 step instead of 2)
- ✅ Better UX (all fields in one place)
- ✅ Faster completion
- ✅ Data consistency
- ✅ Reduced API calls

### **Next Steps:**
1. ✅ Frontend component created
2. ❌ Update backend API to accept combined data
3. ❌ Update dashboard to use new form
4. ❌ Test end-to-end workflow

---

## 🔄 Rollback Plan

If needed, you can keep both forms:
- `CreateInspectionModal` - For simple inspection creation
- `OwnerPreInspectionForm` - For providing data to existing inspections
- `OwnerPreInspectionFormCombined` - For new inspections with pre-inspection data

This allows gradual migration.

