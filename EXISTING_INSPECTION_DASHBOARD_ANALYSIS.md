# Existing Inspection Dashboard Pages Analysis

## 📋 Executive Summary

This document analyzes the **existing inspection dashboard pages** to understand how inspections are currently displayed, managed, and interacted with in the frontend before adapting them to the new owner/renter-driven workflow.

---

## 🔍 Current Inspection Dashboard Pages

### **1. My Account Dashboard - Inspections Tab**

**Location:** `src/pages/my-account/DashboardPage.tsx` → `InspectionsSection` component

**File:** `src/pages/my-account/components/InspectionsSection.tsx`

#### **Structure:**
- **Tabs:** `my-items`, `rented-items`, `disputes`
- **Data Loading:**
  - `userInspections` - Inspections for user's own items (owner)
  - `rentedInspections` - Inspections for items user rented (renter)
  - `userDisputes` - Disputes raised by user

#### **Current Implementation:**

**My Items Tab (Owner View):**
```typescript
// Shows inspections for products owned by user
userInspections.map((inspection) => (
  <div>
    <h4>{inspection.inspectionType}</h4>
    <StatusBadge status={inspection.status} />
    <button onClick={() => onViewInspection(inspection.id)}>View Details</button>
    <button onClick={() => openDisputeModal(inspection.id)}>Raise Dispute</button>
  </div>
))
```

**Rented Items Tab (Renter View):**
```typescript
// Shows inspections for items user rented
rentedInspections.map((inspection) => (
  <div>
    <h4>{inspection.inspectionType}</h4>
    <StatusBadge status={inspection.status} />
    <button onClick={() => onViewInspection(inspection.id)}>View Details</button>
  </div>
))
```

**Disputes Tab:**
```typescript
// Shows disputes raised by user
userDisputes.map((dispute) => (
  <div>
    <h4>{dispute.disputeType}</h4>
    <StatusBadge status={dispute.status} />
  </div>
))
```

#### **Key Features:**
- ✅ Tab-based navigation
- ✅ Loading states for each tab
- ✅ Status badges for inspections
- ✅ View details navigation
- ✅ Raise dispute modal
- ❌ **No owner pre-inspection form**
- ❌ **No renter review component**
- ❌ **No renter post-inspection form**
- ❌ **No owner post-review component**
- ❌ **No action buttons based on workflow status**

#### **Data Loading:**
```typescript
// Load inspections when tab is active
useEffect(() => {
  if (activeTab === 'rented-items') {
    loadRentedInspections(); // Uses inspectionService.getMyInspections()
  } else if (activeTab === 'disputes') {
    loadUserDisputes(); // Uses disputeService.getUserDisputes()
  }
}, [activeTab]);
```

---

### **2. Inspector Dashboard Page**

**Location:** `src/pages/inspections/InspectorDashboardPage.tsx`

#### **Structure:**
- **Tabs:** `overview`, `inspections`, `disputes`
- **Data Loading:**
  - `inspections` - All inspections assigned to inspector
  - `inspectorDisputes` - All disputes (inspector can see all)
  - `stats` - Statistics (total, pending, inProgress, completed, disputed)

#### **Current Implementation:**

**Overview Tab:**
- Shows quick stats cards
- Shows recent inspections
- Shows recent disputes
- Shows inspector profile

**Inspections Tab:**
- **Active Inspections Section:**
  - Filters: `status === 'pending' || status === 'in_progress'`
  - Actions: `View Details`, `Start`, `Complete`, `Add Item`, `Reschedule`, `Raise Dispute`
  
- **Completed Inspections Section:**
  - Filters: `status === 'completed'`
  - Shows completed inspections list
  - Action: `View Report`

**Disputes Tab:**
- Shows all disputes
- Actions: `View Details`, `Resolve Dispute`

#### **Key Features:**
- ✅ Inspector-centric workflow
- ✅ Start/Complete inspection actions
- ✅ Add inspection items
- ✅ Resolve disputes
- ✅ View inspection details
- ❌ **Assumes inspector conducts physical inspection**
- ❌ **No owner/renter workflow support**

#### **Action Handlers:**
```typescript
const handleStart = async (inspectionId: string) => {
  await inspectionService.startInspection(inspectionId, {});
  // Status changes: PENDING → IN_PROGRESS
};

const handleComplete = async (inspectionId: string) => {
  // Opens complete inspection modal
  // Inspector adds items and completes
  // Status changes: IN_PROGRESS → COMPLETED
};
```

---

### **3. Admin Dashboard - Inspections Management**

**Location:** `src/pages/admin/DashboardPage.tsx` → `InspectionsManagement` component

**File:** `src/pages/admin/components/InspectionsManagement.tsx`

#### **Structure:**
- **Tabs:** `overview`, `inspections`, `disputes`
- **Data Loading:**
  - `inspections` - All inspections (admin view)
  - `disputes` - All disputes (admin view)
  - `inspectionSummary` - Statistics

#### **Current Implementation:**

**Overview Tab:**
- Summary cards (Total Inspections, Active Disputes, Completed Today)
- Recent inspections list
- Recent disputes list

**Inspections Tab:**
- All inspections table
- Actions: `View Details`, `Start Inspection`, `Complete Inspection`
- Filtering and search

**Disputes Tab:**
- All disputes table
- Actions: `View Details`, `Resolve Dispute`

#### **Key Features:**
- ✅ Admin oversight view
- ✅ Can view all inspections
- ✅ Can start/complete inspections (override)
- ✅ Can resolve disputes
- ❌ **No owner/renter workflow support**
- ❌ **Assumes inspector-centric workflow**

---

### **4. Inspection Details Page**

**Location:** `src/pages/inspections/InspectionDetailsPage.tsx`

#### **Structure:**
- Shows full inspection details
- Shows inspection items
- Shows photos
- Shows disputes
- Shows participants (inspector, renter, owner)

#### **Key Features:**
- ✅ Detailed inspection view
- ✅ Shows inspection items
- ✅ Shows photos
- ✅ Shows disputes
- ✅ Action buttons based on user role
- ❌ **No owner/renter workflow forms**
- ❌ **Assumes inspector-centric workflow**

---

## 📊 Current Data Flow

### **Inspection Creation Flow:**

```
1. User clicks "Request Inspection"
   ↓
2. CreateInspectionModal opens
   ↓
3. User selects:
   - Product/Booking
   - Inspector (REQUIRED)
   - Inspection Type
   - Scheduled Date
   - Location
   ↓
4. API: POST /api/v1/inspections
   ↓
5. Backend creates inspection with status: PENDING
   ↓
6. Inspector notified
   ↓
7. Inspection appears in dashboard
```

### **Inspection Progress Flow:**

```
1. Inspection created → Status: PENDING
   ↓
2. Inspector starts → Status: IN_PROGRESS
   ↓
3. Inspector adds items
   ↓
4. Inspector completes → Status: COMPLETED
   ↓
5. If dispute → Status: DISPUTED
   ↓
6. Dispute resolved → Status: RESOLVED
```

---

## 🔄 Current Action Buttons

### **Inspector Dashboard:**

**Pending Inspections:**
- ✅ "Start" button
- ✅ "View Details" button
- ✅ "Reschedule" button

**In Progress Inspections:**
- ✅ "Complete" button
- ✅ "Add Item" button
- ✅ "View Details" button
- ✅ "Reschedule" button

**Completed Inspections:**
- ✅ "View Report" button

### **My Account Dashboard (Owner/Renter):**

**My Items Tab (Owner):**
- ✅ "View Details" button
- ✅ "Raise Dispute" button
- ❌ **No "Provide Pre-Inspection" button**
- ❌ **No "Review Post-Inspection" button**

**Rented Items Tab (Renter):**
- ✅ "View Details" button
- ❌ **No "Review Pre-Inspection" button**
- ❌ **No "Provide Post-Inspection" button**

---

## 🚨 Gaps for New Workflow

### **1. Missing Action Buttons**

**My Items Tab (Owner) - Missing:**
- ❌ "Provide Pre-Inspection" button (when `ownerPreInspectionConfirmed === false`)
- ❌ "Waiting for Renter Review" status (when `ownerPreInspectionConfirmed === true && renterPreReviewAccepted === false`)
- ❌ "Review Post-Inspection" button (when `renterPostInspectionConfirmed === true && ownerPostReviewAccepted === false`)
- ❌ "Dispute Raised" status (when `ownerDisputeRaised === true`)

**Rented Items Tab (Renter) - Missing:**
- ❌ "Review Pre-Inspection" button (when `ownerPreInspectionConfirmed === true && renterPreReviewAccepted === false`)
- ❌ "Discrepancy Reported" status (when `renterDiscrepancyReported === true`)
- ❌ "Provide Post-Inspection" button (when `renterPostInspectionConfirmed === false`)
- ❌ "Waiting for Owner Review" status (when `renterPostInspectionConfirmed === true && ownerPostReviewAccepted === false`)

### **2. Missing Form Modals**

**Currently Missing:**
- ❌ Owner Pre-Inspection Form modal
- ❌ Renter Pre-Review Component modal
- ❌ Renter Post-Inspection Form modal
- ❌ Owner Post-Review Component modal

### **3. Missing Data Fields**

**Inspection Data Structure - Missing:**
- ❌ `ownerPreInspectionData`
- ❌ `ownerPreInspectionConfirmed`
- ❌ `renterPreReviewAccepted`
- ❌ `renterDiscrepancyData`
- ❌ `renterPostInspectionData`
- ❌ `renterPostInspectionConfirmed`
- ❌ `ownerPostReviewAccepted`
- ❌ `ownerDisputeRaised`

### **4. Missing Status Logic**

**Current Status Logic:**
```typescript
// Simple status check
if (inspection.status === 'pending') {
  // Show "Start" button (inspector only)
}
if (inspection.status === 'in_progress') {
  // Show "Complete" button (inspector only)
}
```

**New Workflow Needs:**
```typescript
// Complex status logic based on workflow step
if (isOwner && inspectionType === 'pre_rental' && !ownerPreInspectionConfirmed) {
  // Show "Provide Pre-Inspection" button
}
if (!isOwner && inspectionType === 'pre_rental' && ownerPreInspectionConfirmed && !renterPreReviewAccepted) {
  // Show "Review Pre-Inspection" button
}
// ... etc
```

---

## 💡 Current Implementation Details

### **1. Data Loading**

**My Account Dashboard:**
```typescript
// Load user's own inspections (owner)
const loadUserInspections = async () => {
  // Uses: inspectionService.getInspectionsByOwner(ownerId)
  // Or: inspectionService.getInspections({ ownerId })
};

// Load rented inspections (renter)
const loadRentedInspections = async () => {
  // Uses: inspectionService.getMyInspections()
  // Returns: inspections where user is renter
};
```

**Inspector Dashboard:**
```typescript
// Load inspector's inspections
const loadInspectorData = async () => {
  // Uses: inspectionService.getInspectionsByInspector(inspectorId)
  // Returns: inspections assigned to inspector
};
```

**Admin Dashboard:**
```typescript
// Load all inspections
const fetchInspectionsData = async () => {
  // Uses: fetchAllInspections()
  // Returns: all inspections (admin view)
};
```

### **2. Inspection Display**

**Current Display Format:**
```typescript
<div className="inspection-card">
  <h4>{inspection.inspectionType}</h4>
  <StatusBadge status={inspection.status} />
  <div>
    <Calendar /> {inspection.scheduledAt}
    <MapPin /> {inspection.location}
  </div>
  <button onClick={() => onViewInspection(inspection.id)}>View Details</button>
</div>
```

**Shows:**
- Inspection type (pre_rental, post_return)
- Status (pending, in_progress, completed, disputed, resolved)
- Scheduled date
- Location
- View details button

**Missing:**
- Workflow status indicators
- Action buttons based on workflow step
- Owner/renter specific actions

### **3. Action Handlers**

**Current Handlers:**
```typescript
// Inspector actions
handleStart(inspectionId) → inspectionService.startInspection()
handleComplete(inspectionId) → inspectionService.completeInspection()
handleAddItem(inspectionId) → inspectionItemService.addItem()

// Owner/Renter actions
handleRaiseDispute(inspectionId) → disputeService.raiseDispute()
handleViewInspection(inspectionId) → navigate to details page
```

**Missing Handlers:**
```typescript
// New workflow handlers needed:
handleOwnerPreInspectionSubmit() → inspectionService.submitOwnerPreInspection()
handleRenterPreReviewSubmit() → inspectionService.submitRenterPreReview()
handleRenterPostInspectionSubmit() → inspectionService.submitRenterPostInspection()
handleOwnerPostReviewSubmit() → inspectionService.submitOwnerPostReview()
```

---

## 🔧 Integration Points

### **1. InspectionsSection Component**

**Current Props:**
```typescript
interface Props {
  loading: boolean;
  userInspections: any[];
  onViewInspection: (id: string) => void;
  onRequestInspection: () => void;
}
```

**Needs to Add:**
- Modal states for new forms
- Action button logic based on workflow status
- Form submission handlers
- Refresh trigger for data reload

### **2. InspectorDashboardPage**

**Current Structure:**
- Inspector-centric actions
- Start/Complete inspection
- Add items
- Resolve disputes

**Needs to Add:**
- Support for owner/renter workflow
- Conditional rendering based on workflow type
- New action buttons for workflow steps

### **3. Admin Dashboard**

**Current Structure:**
- Admin oversight view
- Can override inspector actions
- View all inspections

**Needs to Add:**
- View owner/renter workflow data
- Monitor workflow progress
- Support for new workflow statuses

---

## 📝 Summary of Changes Needed

### **1. InspectionsSection Component** ✅ (Already Updated)

**Changes Made:**
- ✅ Added modal states for new forms
- ✅ Added `getActionButton()` function
- ✅ Added form submission handlers
- ✅ Added modal components for each form
- ✅ Added refresh trigger

**Still Needs:**
- Backend API support for new endpoints
- Proper data structure from backend
- Status field updates

### **2. InspectorDashboardPage**

**Needs Updates:**
- Add support for owner/renter workflow
- Show workflow status indicators
- Add conditional actions based on workflow type
- Support new workflow statuses

### **3. Admin Dashboard**

**Needs Updates:**
- Display new workflow fields
- Show workflow progress
- Support new status types
- Monitor owner/renter actions

---

## ✅ Conclusion

The current inspection dashboard pages are **inspector-centric** and need significant updates to support the new owner/renter-driven workflow:

1. **InspectionsSection** - ✅ Already updated with new forms
2. **InspectorDashboardPage** - Needs workflow support
3. **Admin Dashboard** - Needs workflow monitoring
4. **InspectionDetailsPage** - Needs workflow view

The main challenge is that the current system assumes an inspector physically conducts inspections, while the new workflow requires owner/renter to provide data first, with inspector only involved in disputes.

