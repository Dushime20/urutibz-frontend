# Owner & Renter Inspection Dashboard Analysis

## 📋 Executive Summary

This document focuses specifically on **Owner and Renter** inspection workflows in the dashboard, analyzing how each user sees and interacts with inspections, and how to integrate the new owner/renter-driven workflow.

---

## 👥 Two User Perspectives

### **1. Owner View (My Items Tab)**

**Location:** `src/pages/my-account/components/InspectionsSection.tsx` → `activeTab === 'my-items'`

**Data Loading:**
```typescript
// DashboardPage.tsx
const loadUserInspections = async () => {
  const response = await inspectionService.getInspectionsByOwner(authUser.id);
  setUserInspections(response.data || []);
};

// Shows inspections where user is the owner
```

**Current Display:**
```typescript
// My Items Tab - Owner View
userInspections.map((inspection) => (
  <div>
    <h4>{inspection.inspectionType}</h4>
    <StatusBadge status={inspection.status} />
    <button onClick={() => onViewInspection(inspection.id)}>View Details</button>
    <button onClick={() => openDisputeModal(inspection.id)}>Raise Dispute</button>
  </div>
))
```

**What Owner Currently Sees:**
- ✅ Inspection type (pre_rental, post_return)
- ✅ Status (pending, in_progress, completed, disputed, resolved)
- ✅ Scheduled date
- ✅ Location
- ✅ View details button
- ✅ Raise dispute button

**What Owner Should See (New Workflow):**

**For Pre-Rental Inspections:**
- ✅ "Provide Pre-Inspection" button (when `ownerPreInspectionConfirmed === false`)
- ✅ "Waiting for Renter Review" status (when `ownerPreInspectionConfirmed === true && renterPreReviewAccepted === false`)
- ✅ "Renter Discrepancy Reported" status (when `renterDiscrepancyReported === true`)

**For Post-Return Inspections:**
- ✅ "Review Post-Inspection" button (when `renterPostInspectionConfirmed === true && ownerPostReviewAccepted === false`)
- ✅ "Dispute Raised" status (when `ownerDisputeRaised === true`)
- ✅ "Rental Closed" status (when `ownerPostReviewAccepted === true`)

---

### **2. Renter View (Rented Items Tab)**

**Location:** `src/pages/my-account/components/InspectionsSection.tsx` → `activeTab === 'rented-items'`

**Data Loading:**
```typescript
// InspectionsSection.tsx
const loadRentedInspections = async () => {
  const response = await inspectionService.getMyInspections();
  setRentedInspections(response.data || []);
};

// Shows inspections where user is the renter
```

**Current Display:**
```typescript
// Rented Items Tab - Renter View
rentedInspections.map((inspection) => (
  <div>
    <h4>{inspection.inspectionType}</h4>
    <StatusBadge status={inspection.status} />
    <button onClick={() => onViewInspection(inspection.id)}>View Details</button>
  </div>
))
```

**What Renter Currently Sees:**
- ✅ Inspection type (pre_rental, post_return)
- ✅ Status (pending, in_progress, completed, disputed, resolved)
- ✅ Scheduled date
- ✅ Location
- ✅ View details button

**What Renter Should See (New Workflow):**

**For Pre-Rental Inspections:**
- ✅ "Review Pre-Inspection" button (when `ownerPreInspectionConfirmed === true && renterPreReviewAccepted === false`)
- ✅ "Discrepancy Reported" status (when `renterDiscrepancyReported === true`)
- ✅ "Pre-Inspection Accepted" status (when `renterPreReviewAccepted === true`)

**For Post-Return Inspections:**
- ✅ "Provide Post-Inspection" button (when `renterPostInspectionConfirmed === false`)
- ✅ "Waiting for Owner Review" status (when `renterPostInspectionConfirmed === true && ownerPostReviewAccepted === false`)
- ✅ "Owner Dispute Raised" status (when `ownerDisputeRaised === true`)

---

## 🔄 Current Implementation Flow

### **Owner Flow (My Items Tab):**

```
1. Owner navigates to Inspections tab
   ↓
2. "My Items" tab is active
   ↓
3. loadUserInspections() called
   ↓
4. API: GET /api/v1/inspections?ownerId={userId}
   ↓
5. Returns inspections where user is owner
   ↓
6. Displays inspections list
   ↓
7. Owner can:
   - View Details
   - Raise Dispute
   ❌ Cannot provide pre-inspection
   ❌ Cannot review post-inspection
```

### **Renter Flow (Rented Items Tab):**

```
1. Renter navigates to Inspections tab
   ↓
2. "Rented Items" tab is active
   ↓
3. loadRentedInspections() called
   ↓
4. API: GET /api/v1/inspections/my-inspections?role=renter
   ↓
5. Returns inspections where user is renter
   ↓
6. Displays inspections list
   ↓
7. Renter can:
   - View Details
   ❌ Cannot review pre-inspection
   ❌ Cannot provide post-inspection
```

---

## 🎯 Action Button Logic (Current Implementation)

### **Current `getActionButton()` Function:**

```typescript
const getActionButton = (inspection: any, isOwner: boolean) => {
  const inspectionType = inspection.inspectionType;
  
  // Owner actions for pre-rental inspection
  if (isOwner && inspectionType === InspectionType.PRE_RENTAL) {
    if (!inspection.ownerPreInspectionConfirmed) {
      return <button>Provide Pre-Inspection</button>;
    }
    if (inspection.ownerPreInspectionConfirmed && !inspection.renterPreReviewAccepted) {
      return <span>Waiting for Renter Review</span>;
    }
  }
  
  // Renter actions for pre-rental inspection
  if (!isOwner && inspectionType === InspectionType.PRE_RENTAL) {
    if (inspection.ownerPreInspectionConfirmed && !inspection.renterPreReviewAccepted) {
      return <button>Review Pre-Inspection</button>;
    }
    if (inspection.renterDiscrepancyReported) {
      return <span>Discrepancy Reported</span>;
    }
  }
  
  // Renter actions for post-return inspection
  if (!isOwner && inspectionType === InspectionType.POST_RENTAL) {
    if (!inspection.renterPostInspectionConfirmed) {
      return <button>Provide Post-Inspection</button>;
    }
    if (inspection.renterPostInspectionConfirmed && !inspection.ownerPostReviewAccepted && !inspection.ownerDisputeRaised) {
      return <span>Waiting for Owner Review</span>;
    }
  }
  
  // Owner actions for post-return inspection
  if (isOwner && inspectionType === InspectionType.POST_RENTAL) {
    if (inspection.renterPostInspectionConfirmed && !inspection.ownerPostReviewAccepted && !inspection.ownerDisputeRaised) {
      return <button>Review Post-Inspection</button>;
    }
    if (inspection.ownerDisputeRaised) {
      return <span>Dispute Raised</span>;
    }
  }
  
  return null;
};
```

### **How It's Used:**

**My Items Tab (Owner):**
```typescript
{getActionButton(inspection, true)}  // isOwner = true
```

**Rented Items Tab (Renter):**
```typescript
{getActionButton(inspection, false)}  // isOwner = false
```

---

## 📊 Current Data Structure

### **Inspection Object (Current):**

```typescript
interface Inspection {
  id: string;
  productId: string;
  bookingId: string;
  inspectorId: string;
  renterId: string;
  ownerId: string;
  inspectionType: InspectionType;
  status: InspectionStatus;
  scheduledAt: string;
  location: string;
  notes: string;
  // ... existing fields
}
```

### **Inspection Object (New Workflow - Needed):**

```typescript
interface Inspection {
  // ... existing fields
  // New workflow fields
  ownerPreInspectionData?: OwnerPreInspectionData;
  ownerPreInspectionConfirmed?: boolean;
  ownerPreInspectionConfirmedAt?: string;
  renterPreReviewAccepted?: boolean;
  renterPreReviewAcceptedAt?: string;
  renterDiscrepancyReported?: boolean;
  renterDiscrepancyData?: DiscrepancyReport;
  renterPostInspectionData?: RenterPostInspectionData;
  renterPostInspectionConfirmed?: boolean;
  renterPostInspectionConfirmedAt?: string;
  ownerPostReviewAccepted?: boolean;
  ownerPostReviewAcceptedAt?: string;
  ownerDisputeRaised?: boolean;
  ownerDisputeRaisedAt?: string;
}
```

---

## 🔍 Current Implementation Details

### **1. Owner View (My Items Tab)**

**Tab Structure:**
```typescript
<button onClick={() => setActiveTab('my-items')}>
  My Items ({userInspections.length})
</button>
```

**Inspection Cards:**
```typescript
{userInspections.map((inspection) => (
  <div onClick={() => onViewInspection(inspection.id)}>
    <h4>{inspection.inspectionType}</h4>
    <StatusBadge status={inspection.status} />
    <div>
      <Calendar /> {inspection.scheduledAt}
      <MapPin /> {inspection.location}
    </div>
    {/* Action Button - Currently shows generic actions */}
    {getActionButton(inspection, true)}  // ✅ isOwner = true
  </div>
))}
```

**Current Actions Available:**
- ✅ View Details
- ✅ Raise Dispute (legacy)
- ✅ **NEW:** Provide Pre-Inspection (when needed)
- ✅ **NEW:** Review Post-Inspection (when needed)

---

### **2. Renter View (Rented Items Tab)**

**Tab Structure:**
```typescript
<button onClick={() => setActiveTab('rented-items')}>
  Rented Items ({rentedInspections.length})
</button>
```

**Inspection Cards:**
```typescript
{rentedInspections.map((inspection) => (
  <div onClick={() => onViewInspection(inspection.id)}>
    <h4>{inspection.inspectionType}</h4>
    <StatusBadge status={inspection.status} />
    <div>
      <Calendar /> {inspection.scheduledAt}
      <MapPin /> {inspection.location}
    </div>
    {/* Action Button - Currently shows generic actions */}
    {getActionButton(inspection, false)}  // ✅ isOwner = false
  </div>
))}
```

**Current Actions Available:**
- ✅ View Details
- ✅ **NEW:** Review Pre-Inspection (when needed)
- ✅ **NEW:** Provide Post-Inspection (when needed)

---

## 🎯 Workflow States by User Role

### **Pre-Rental Inspection Workflow:**

**Owner States:**
1. **Initial State:** `ownerPreInspectionConfirmed === false`
   - Action: "Provide Pre-Inspection" button
   - Form: `OwnerPreInspectionForm`

2. **Submitted State:** `ownerPreInspectionConfirmed === true && renterPreReviewAccepted === false`
   - Status: "Waiting for Renter Review"
   - No action button

3. **Renter Discrepancy:** `renterDiscrepancyReported === true`
   - Status: "Renter Discrepancy Reported"
   - Action: Inspector resolves

4. **Renter Accepted:** `renterPreReviewAccepted === true`
   - Status: "Pre-Inspection Accepted"
   - Workflow: Rental can proceed

**Renter States:**
1. **Waiting for Owner:** `ownerPreInspectionConfirmed === false`
   - Status: "Waiting for Owner Pre-Inspection"
   - No action button

2. **Ready to Review:** `ownerPreInspectionConfirmed === true && renterPreReviewAccepted === false`
   - Action: "Review Pre-Inspection" button
   - Component: `RenterPreReviewComponent`

3. **Discrepancy Reported:** `renterDiscrepancyReported === true`
   - Status: "Discrepancy Reported"
   - Action: Inspector resolves

4. **Accepted:** `renterPreReviewAccepted === true`
   - Status: "Pre-Inspection Accepted"
   - Workflow: Rental can proceed

---

### **Post-Return Inspection Workflow:**

**Renter States:**
1. **Initial State:** `renterPostInspectionConfirmed === false`
   - Action: "Provide Post-Inspection" button
   - Form: `RenterPostInspectionForm`

2. **Submitted State:** `renterPostInspectionConfirmed === true && ownerPostReviewAccepted === false && ownerDisputeRaised === false`
   - Status: "Waiting for Owner Review"
   - No action button

3. **Owner Dispute:** `ownerDisputeRaised === true`
   - Status: "Owner Dispute Raised"
   - Action: Inspector resolves

4. **Owner Accepted:** `ownerPostReviewAccepted === true`
   - Status: "Return Accepted"
   - Workflow: Rental closed

**Owner States:**
1. **Waiting for Renter:** `renterPostInspectionConfirmed === false`
   - Status: "Waiting for Renter Post-Inspection"
   - No action button

2. **Ready to Review:** `renterPostInspectionConfirmed === true && ownerPostReviewAccepted === false && ownerDisputeRaised === false`
   - Action: "Review Post-Inspection" button
   - Component: `OwnerPostReviewComponent`

3. **Dispute Raised:** `ownerDisputeRaised === true`
   - Status: "Dispute Raised"
   - Action: Inspector resolves

4. **Accepted:** `ownerPostReviewAccepted === true`
   - Status: "Return Accepted"
   - Workflow: Rental closed

---

## 🔧 Integration Status

### **✅ Already Implemented:**

1. **InspectionsSection Component:**
   - ✅ Tab structure (My Items / Rented Items)
   - ✅ `getActionButton()` function with `isOwner` flag
   - ✅ Modal states for all new forms
   - ✅ Form submission handlers
   - ✅ Modal components for each form

2. **Data Loading:**
   - ✅ Owner inspections: `getInspectionsByOwner(ownerId)`
   - ✅ Renter inspections: `getMyInspections()`
   - ✅ Refresh trigger after form submission

### **⚠️ Needs Backend Support:**

1. **API Endpoints:**
   - ❌ `POST /api/v1/inspections/:id/owner-pre-inspection`
   - ❌ `POST /api/v1/inspections/:id/owner-pre-inspection/confirm`
   - ❌ `POST /api/v1/inspections/:id/renter-pre-review`
   - ❌ `POST /api/v1/inspections/:id/renter-discrepancy`
   - ❌ `POST /api/v1/inspections/:id/renter-post-inspection`
   - ❌ `POST /api/v1/inspections/:id/renter-post-inspection/confirm`
   - ❌ `POST /api/v1/inspections/:id/owner-post-review`
   - ❌ `POST /api/v1/inspections/:id/owner-dispute`

2. **Database Fields:**
   - ❌ New workflow fields in `product_inspections` table
   - ❌ Status field updates

3. **Response Data:**
   - ❌ Inspection objects need to include new workflow fields
   - ❌ API responses need to include workflow status

---

## 📝 Summary

### **Owner & Renter Focus:**

**Owner (My Items Tab):**
- ✅ Sees inspections for their products
- ✅ Can provide pre-inspection (NEW)
- ✅ Can review post-inspection (NEW)
- ✅ Can raise disputes

**Renter (Rented Items Tab):**
- ✅ Sees inspections for items they rented
- ✅ Can review pre-inspection (NEW)
- ✅ Can provide post-inspection (NEW)
- ✅ Can report discrepancies

**Both Users:**
- ✅ Separate tabs for each role
- ✅ Action buttons based on workflow status
- ✅ Form modals for each workflow step
- ✅ Clear workflow progression indicators

The implementation is **owner/renter-focused** and ready for backend support. The forms are integrated into the dashboard tabs, and action buttons show the appropriate actions based on the user's role and the inspection's workflow status.

