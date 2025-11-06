# Owner & Renter Workflow Integration - Summary

## 📋 Focus: Two Users - Owner & Renter

This document summarizes how the **Owner** and **Renter** inspection workflows are integrated into the dashboard.

---

## 👥 User Roles & Tabs

### **Owner View - "My Items" Tab**

**Location:** `InspectionsSection.tsx` → `activeTab === 'my-items'`

**Data Source:**
- Uses: `inspectionService.getInspectionsByOwner(ownerId)`
- Shows: Inspections where user is the **owner**

**Display:**
```typescript
{userInspections.map((inspection) => (
  <div>
    {/* Inspection Info */}
    <h4>{inspection.inspectionType}</h4>
    <StatusBadge status={inspection.status} />
    
    {/* Action Button - Owner Actions */}
    {getActionButton(inspection, true)}  // ✅ isOwner = true
  </div>
))}
```

**Owner Actions (Pre-Rental):**
1. **Provide Pre-Inspection** → Opens `OwnerPreInspectionForm`
   - When: `ownerPreInspectionConfirmed === false`
   - Button: "Provide Pre-Inspection" (teal)

2. **Waiting for Renter** → Shows status badge
   - When: `ownerPreInspectionConfirmed === true && renterPreReviewAccepted === false`
   - Status: "Waiting for Renter Review" (yellow)

**Owner Actions (Post-Return):**
1. **Review Post-Inspection** → Opens `OwnerPostReviewComponent`
   - When: `renterPostInspectionConfirmed === true && ownerPostReviewAccepted === false && ownerDisputeRaised === false`
   - Button: "Review Post-Inspection" (blue)

2. **Dispute Raised** → Shows status badge
   - When: `ownerDisputeRaised === true`
   - Status: "Dispute Raised" (red)

---

### **Renter View - "Rented Items" Tab**

**Location:** `InspectionsSection.tsx` → `activeTab === 'rented-items'`

**Data Source:**
- Uses: `inspectionService.getMyInspections()`
- Shows: Inspections where user is the **renter**

**Display:**
```typescript
{rentedInspections.map((inspection) => (
  <div>
    {/* Inspection Info */}
    <h4>{inspection.inspectionType}</h4>
    <StatusBadge status={inspection.status} />
    
    {/* Action Button - Renter Actions */}
    {getActionButton(inspection, false)}  // ✅ isOwner = false
  </div>
))}
```

**Renter Actions (Pre-Rental):**
1. **Review Pre-Inspection** → Opens `RenterPreReviewComponent`
   - When: `ownerPreInspectionConfirmed === true && renterPreReviewAccepted === false`
   - Button: "Review Pre-Inspection" (blue)

2. **Discrepancy Reported** → Shows status badge
   - When: `renterDiscrepancyReported === true`
   - Status: "Discrepancy Reported" (yellow)

**Renter Actions (Post-Return):**
1. **Provide Post-Inspection** → Opens `RenterPostInspectionForm`
   - When: `renterPostInspectionConfirmed === false`
   - Button: "Provide Post-Inspection" (teal)

2. **Waiting for Owner** → Shows status badge
   - When: `renterPostInspectionConfirmed === true && ownerPostReviewAccepted === false && ownerDisputeRaised === false`
   - Status: "Waiting for Owner Review" (yellow)

---

## 🔄 Complete Workflow Flow

### **Pre-Rental Inspection Flow:**

```
1. Inspection Created (status: PENDING)
   ↓
2. Owner sees "Provide Pre-Inspection" button (My Items Tab)
   ↓
3. Owner provides pre-inspection data
   - Opens: OwnerPreInspectionForm
   - Submits: inspectionService.submitOwnerPreInspection()
   - Updates: ownerPreInspectionConfirmed = true
   ↓
4. Renter sees "Review Pre-Inspection" button (Rented Items Tab)
   ↓
5. Renter reviews pre-inspection
   - Opens: RenterPreReviewComponent
   - Options:
     a) Accept → renterPreReviewAccepted = true
     b) Report Discrepancy → renterDiscrepancyReported = true
   ↓
6a. If Accepted → Rental proceeds
6b. If Discrepancy → Inspector resolves
```

### **Post-Return Inspection Flow:**

```
1. Rental Ends (status: PENDING)
   ↓
2. Renter sees "Provide Post-Inspection" button (Rented Items Tab)
   ↓
3. Renter provides post-inspection data
   - Opens: RenterPostInspectionForm
   - Submits: inspectionService.submitRenterPostInspection()
   - Updates: renterPostInspectionConfirmed = true
   ↓
4. Owner sees "Review Post-Inspection" button (My Items Tab)
   ↓
5. Owner reviews post-inspection
   - Opens: OwnerPostReviewComponent
   - Options:
     a) Accept → ownerPostReviewAccepted = true (Rental closed)
     b) Raise Dispute → ownerDisputeRaised = true (Inspector resolves)
   ↓
6a. If Accepted → Rental closed automatically
6b. If Dispute → Inspector resolves
```

---

## ✅ Implementation Status

### **Frontend (Already Complete):**

1. **Form Components:**
   - ✅ `OwnerPreInspectionForm.tsx` - Owner provides pre-inspection
   - ✅ `RenterPreReviewComponent.tsx` - Renter reviews pre-inspection
   - ✅ `RenterPostInspectionForm.tsx` - Renter provides post-inspection
   - ✅ `OwnerPostReviewComponent.tsx` - Owner reviews post-inspection

2. **Dashboard Integration:**
   - ✅ `InspectionsSection.tsx` - Tab structure with owner/renter separation
   - ✅ `getActionButton()` function - Shows correct actions based on role
   - ✅ Modal states for all forms
   - ✅ Form submission handlers
   - ✅ Data refresh after submission

3. **Service Methods:**
   - ✅ `submitOwnerPreInspection()` - Owner submits pre-inspection
   - ✅ `submitRenterPreReview()` - Renter reviews pre-inspection
   - ✅ `reportRenterDiscrepancy()` - Renter reports discrepancy
   - ✅ `submitRenterPostInspection()` - Renter submits post-inspection
   - ✅ `submitOwnerPostReview()` - Owner reviews post-inspection

### **Backend (Needs Implementation):**

1. **API Endpoints:**
   - ❌ `POST /api/v1/inspections/:id/owner-pre-inspection`
   - ❌ `POST /api/v1/inspections/:id/owner-pre-inspection/confirm`
   - ❌ `POST /api/v1/inspections/:id/renter-pre-review`
   - ❌ `POST /api/v1/inspections/:id/renter-discrepancy`
   - ❌ `POST /api/v1/inspections/:id/renter-post-inspection`
   - ❌ `POST /api/v1/inspections/:id/renter-post-inspection/confirm`
   - ❌ `POST /api/v1/inspections/:id/owner-post-review`
   - ❌ `POST /api/v1/inspections/:id/owner-dispute`

2. **Database Schema:**
   - ❌ Add new workflow fields to `product_inspections` table
   - ❌ Make `inspector_id` nullable (or use placeholder)

3. **Service Methods:**
   - ❌ `submitOwnerPreInspection()` - Backend implementation
   - ❌ `submitRenterPreReview()` - Backend implementation
   - ❌ `reportRenterDiscrepancy()` - Backend implementation
   - ❌ `submitRenterPostInspection()` - Backend implementation
   - ❌ `submitOwnerPostReview()` - Backend implementation

---

## 🎯 Key Points

### **Owner & Renter Separation:**

1. **Owner sees their inspections in "My Items" tab**
   - Uses: `getInspectionsByOwner(ownerId)`
   - Action button: `getActionButton(inspection, true)`

2. **Renter sees their inspections in "Rented Items" tab**
   - Uses: `getMyInspections()` (returns inspections where user is renter)
   - Action button: `getActionButton(inspection, false)`

3. **Each user sees different actions based on:**
   - Their role (owner vs renter)
   - Inspection type (pre_rental vs post_return)
   - Workflow status (confirmed, accepted, disputed, etc.)

### **Workflow Progression:**

**Pre-Rental:**
- Owner provides → Renter reviews → Rental proceeds or Dispute

**Post-Return:**
- Renter provides → Owner reviews → Rental closed or Dispute

**Both workflows are owner/renter-driven, with inspector only involved in disputes.**

---

## 📝 Summary

The frontend implementation is **complete and focused on Owner & Renter workflows**:

✅ **Owner View (My Items Tab):**
- Can provide pre-inspection
- Can review post-inspection
- Can raise disputes

✅ **Renter View (Rented Items Tab):**
- Can review pre-inspection
- Can provide post-inspection
- Can report discrepancies

✅ **Both users:**
- See appropriate actions based on workflow status
- Have form modals for each workflow step
- Clear workflow progression indicators

**Next Step:** Backend implementation to support the new API endpoints and database fields.

