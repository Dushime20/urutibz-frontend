# 🔍 Third-Party Inspection End-User Flow Documentation

## Overview

This document describes the complete end-user flow for requesting and completing a third-party professional inspection for a product, including the payment process. This flow allows product owners to request inspections for their products, optionally linked to specific bookings, and pay the required fees.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Complete User Flow](#complete-user-flow)
3. [Step-by-Step Process](#step-by-step-process)
4. [API Endpoints Reference](#api-endpoints-reference)
5. [Status Flow Diagram](#status-flow-diagram)
6. [Error Handling](#error-handling)
7. [Payment Details](#payment-details)

---

## Prerequisites

Before requesting an inspection, the product owner must have:

- ✅ A registered account with `owner` role
- ✅ At least one product listed in the system
- ✅ A valid payment method added to their account
- ✅ (Optional) A booking associated with the product (for booking-linked inspections)

---

## Complete User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    INSPECTION REQUEST FLOW                      │
└─────────────────────────────────────────────────────────────────┘

1. Owner selects product
   ↓
2. (Optional) Owner selects booking for the product
   ↓
3. Owner creates inspection request
   ├─ Selects inspection tier (Standard/Advanced)
   ├─ Sets scheduled date/time
   ├─ Provides location and notes
   └─ System calculates inspection cost
   ↓
4. Inspection created with status: "pending_payment"
   ↓
5. Owner pays inspection fee
   ├─ Selects payment method
   ├─ Confirms payment amount
   └─ Processes payment
   ↓
6. Payment verified and processed
   ↓
7. Inspection status updated to: "pending"
   ↓
8. Inspector assigned (if not pre-selected)
   ↓
9. Inspector receives notification
   ↓
10. Inspector completes inspection
    ├─ Performs on-site inspection
    ├─ Scores all criteria
    ├─ Takes photos
    └─ Submits inspection report
    ↓
11. Inspection status updated to: "completed"
    ↓
12. Public inspection report generated
    ↓
13. Owner receives inspection report
    ↓
14. Report available for public viewing (optional)
```

---

## Step-by-Step Process

### Step 1: Select Product

**Action:** Product owner navigates to their product list and selects a product for inspection.

**UI Elements:**
- Product list/dashboard
- Product selection interface
- "Request Inspection" button

**Backend:**
- No API call required at this step

---

### Step 2: (Optional) Select Booking

**Action:** If the owner wants to link the inspection to a specific booking, they select a booking from the list.

**API Call:**
```
GET /api/v1/third-party-inspections/bookings/:productId
```

**Request:**
- Headers: `Authorization: Bearer <token>`
- Path Parameter: `productId` (UUID)

**Response:**
```json
{
  "success": true,
  "message": "Bookings retrieved successfully",
  "data": [
    {
      "id": "booking-uuid",
      "booking_number": "BK-2024-001",
      "status": "confirmed",
      "start_date": "2024-02-01T10:00:00Z",
      "end_date": "2024-02-05T18:00:00Z",
      "renter": {
        "id": "renter-uuid",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com"
      },
      "total_amount": 500.00,
      "payment_status": "completed"
    }
  ]
}
```

**UI Elements:**
- Booking selection dropdown/list
- Booking details display
- "Continue without booking" option

---

### Step 3: Create Inspection Request

**Action:** Owner fills out the inspection request form with all required details.

**Form Fields:**
- **Product ID** (pre-filled from Step 1)
- **Category ID** (auto-detected from product)
- **Booking ID** (optional, from Step 2)
- **Inspection Tier** (Standard: $50 / Advanced: $100)
- **Scheduled Date/Time** (required)
- **Location** (optional)
- **Notes** (optional)
- **Priority** (low/normal/high, optional)
- **Currency** (defaults to USD)

**API Call:**
```
POST /api/v1/third-party-inspections
```

**Request:**
```json
{
  "productId": "product-uuid",
  "categoryId": "category-uuid",
  "bookingId": "booking-uuid",  // Optional
  "scheduledAt": "2024-02-10T14:00:00Z",
  "location": "123 Main St, City, Country",
  "notes": "Please check engine and tires carefully",
  "inspectionTier": "standard",  // or "advanced"
  "currency": "USD",
  "priority": "normal"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Third-party inspection created successfully",
  "data": {
    "id": "inspection-uuid",
    "productId": "product-uuid",
    "bookingId": "booking-uuid",
    "status": "pending_payment",
    "inspectionCost": 50.00,
    "currency": "USD",
    "inspectionTier": "standard",
    "scheduledAt": "2024-02-10T14:00:00Z",
    "paymentRequired": true
  }
}
```

**UI Elements:**
- Inspection request form
- Tier selection (Standard/Advanced)
- Date/time picker
- Location input
- Notes textarea
- Cost calculator (shows cost based on tier)
- "Submit Request" button

**Important Notes:**
- Inspection is created with status `pending_payment`
- Inspector is auto-assigned (or pre-selected if provided)
- Cost is calculated based on tier: Standard ($50) or Advanced ($100)
- Owner cannot proceed until payment is completed

---

### Step 4: Payment Required Notification

**Action:** System displays payment required notification with inspection details.

**UI Elements:**
- Payment required banner/alert
- Inspection summary card
- Cost breakdown
- "Pay Now" button
- Inspection details (ID, scheduled date, tier, etc.)

**Status:** `pending_payment`

---

### Step 5: Process Payment

**Action:** Owner selects payment method and processes payment for the inspection fee.

**API Call:**
```
POST /api/v1/third-party-inspections/:inspectionId/pay
```

**Request:**
```json
{
  "paymentMethodId": "payment-method-uuid",
  "amount": 50.00,
  "currency": "USD",
  "provider": "stripe"  // Optional
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Inspection payment processed successfully",
  "data": {
    "inspection": {
      "id": "inspection-uuid",
      "status": "pending",  // Updated from pending_payment
      "inspectionCost": 50.00,
      "currency": "USD",
      "scheduledAt": "2024-02-10T14:00:00Z"
    },
    "payment": {
      "transaction_id": "transaction-uuid",
      "status": "completed",
      "provider_transaction_id": "stripe_txn_123"
    }
  }
}
```

**Response (Failure):**
```json
{
  "success": false,
  "error": "Payment processing failed: Insufficient funds"
}
```

**UI Elements:**
- Payment method selection
- Payment amount display
- Payment confirmation dialog
- Processing indicator
- Success/error messages

**Important Notes:**
- Payment amount must match inspection cost exactly
- Payment is processed through the payment transaction service
- Inspection status is automatically updated to `pending` after successful payment
- If payment fails, inspection remains in `pending_payment` status

---

### Step 6: Payment Verification & Status Update

**Action:** System verifies payment and updates inspection status.

**Backend Process:**
1. Payment transaction is created with type `inspection_fee`
2. Payment is processed through selected provider
3. On success:
   - Inspection status updated from `pending_payment` to `pending`
   - Inspector is notified (if not already notified)
   - Owner receives confirmation

**Status Transition:** `pending_payment` → `pending`

---

### Step 7: Inspector Assignment & Notification

**Action:** Inspector receives notification about the assigned inspection.

**Backend Process:**
- Inspector is already assigned during request creation
- Inspector receives notification when status changes to `pending`
- Inspector can view inspection details in their dashboard

**Status:** `pending`

---

### Step 8: Inspector Performs Inspection

**Action:** Inspector conducts the on-site inspection.

**Inspector Actions:**
- Reviews inspection criteria template
- Visits inspection location at scheduled time
- Performs physical inspection
- Scores all criteria items
- Takes photos as evidence
- Documents findings and notes

**Status:** `pending` → `in_progress` (when inspector starts)

---

### Step 9: Inspector Completes Inspection

**Action:** Inspector submits the completed inspection with scores and findings.

**API Call (Inspector):**
```
POST /api/v1/third-party-inspections/:inspectionId/complete
```

**Request:**
```json
{
  "scores": [
    {
      "criterionId": "criterion-uuid-1",
      "criterionName": "Engine Condition",
      "score": 45,
      "maxScore": 50,
      "notes": "Engine runs smoothly, no unusual sounds",
      "evidence": {
        "photos": ["photo-url-1", "photo-url-2"]
      }
    },
    {
      "criterionId": "criterion-uuid-2",
      "criterionName": "Tire Condition",
      "score": 40,
      "maxScore": 50,
      "notes": "All tires in good condition, adequate tread depth"
    }
  ],
  "inspectorNotes": "Overall condition is excellent. Product is well-maintained.",
  "recommendations": "Regular maintenance recommended. No immediate concerns.",
  "photos": ["photo-url-1", "photo-url-2", "photo-url-3"],
  "isPassed": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inspection completed successfully",
  "data": {
    "inspection": {
      "id": "inspection-uuid",
      "status": "completed",
      "inspectionScore": 85.5,
      "overallRating": "good",
      "totalPoints": 120,
      "isPassed": true
    },
    "scores": [...],
    "publicReport": {
      "id": "report-uuid",
      "overallScore": 85.5,
      "overallRating": "good",
      "isPassed": true
    }
  }
}
```

**Status:** `in_progress` → `completed`

---

### Step 10: Owner Receives Inspection Report

**Action:** Owner is notified and can view the completed inspection report.

**UI Elements:**
- Notification: "Your inspection has been completed"
- Inspection report page
- Overall score and rating display
- Detailed scores breakdown
- Photos and evidence
- Inspector notes and recommendations
- Download report option
- Share report option

**Status:** `completed`

---

### Step 11: Public Report Available (Optional)

**Action:** Inspection report is made available for public viewing (if enabled).

**API Call:**
```
GET /api/v1/third-party-inspections/public-reports/:productId
```

**Response:**
```json
{
  "success": true,
  "message": "Public report retrieved successfully",
  "data": {
    "id": "report-uuid",
    "productId": "product-uuid",
    "overallScore": 85.5,
    "overallRating": "good",
    "isPassed": true,
    "highlights": ["Excellent engine condition", "Well-maintained"],
    "concerns": [],
    "summary": "Product is in good condition...",
    "inspectionDate": "2024-02-10T14:00:00Z"
  }
}
```

---

## API Endpoints Reference

### 1. Get Owner Bookings
```
GET /api/v1/third-party-inspections/bookings/:productId
```
**Purpose:** Retrieve bookings for a product to select one for inspection  
**Auth:** Required (Owner)  
**Response:** List of bookings with renter information

### 2. Create Inspection Request
```
POST /api/v1/third-party-inspections
```
**Purpose:** Create a new third-party inspection request  
**Auth:** Required (Owner)  
**Request Body:** `ThirdPartyInspectionRequest`  
**Response:** Inspection object with `paymentRequired: true`

### 3. Process Inspection Payment
```
POST /api/v1/third-party-inspections/:id/pay
```
**Purpose:** Pay the required fees for an inspection  
**Auth:** Required (Owner)  
**Request Body:** Payment details (paymentMethodId, amount, currency)  
**Response:** Updated inspection with payment transaction details

### 4. Complete Inspection (Inspector)
```
POST /api/v1/third-party-inspections/:id/complete
```
**Purpose:** Inspector submits completed inspection with scores  
**Auth:** Required (Inspector/Admin)  
**Request Body:** Scores, notes, photos, isPassed  
**Response:** Completed inspection with public report

### 5. Get Public Report
```
GET /api/v1/third-party-inspections/public-reports/:productId
```
**Purpose:** Retrieve public inspection report for a product  
**Auth:** Not required (Public endpoint)  
**Response:** Public inspection report

---

## Status Flow Diagram

```
┌─────────────────┐
│ pending_payment │  ← Inspection created, payment required
└────────┬────────┘
         │ (Payment successful)
         ↓
┌─────────────────┐
│    pending      │  ← Payment completed, waiting for inspector
└────────┬────────┘
         │ (Inspector starts)
         ↓
┌─────────────────┐
│  in_progress    │  ← Inspector performing inspection
└────────┬────────┘
         │ (Inspector completes)
         ↓
┌─────────────────┐
│   completed     │  ← Inspection finished, report available
└─────────────────┘
```

**Status Definitions:**
- **`pending_payment`**: Inspection created but payment not yet processed
- **`pending`**: Payment completed, waiting for inspector to start
- **`in_progress`**: Inspector is actively performing the inspection
- **`completed`**: Inspection finished, report generated and available

---

## Error Handling

### Common Errors

#### 1. Product Not Found
```json
{
  "success": false,
  "error": "Product not found"
}
```
**Solution:** Verify product ID is correct and product exists

#### 2. Product Ownership Validation
```json
{
  "success": false,
  "error": "You can only request inspection for your own products"
}
```
**Solution:** Ensure user is the owner of the product

#### 3. Booking Ownership Validation
```json
{
  "success": false,
  "error": "You can only request inspection for your own bookings"
}
```
**Solution:** Ensure booking belongs to the user and product

#### 4. Payment Amount Mismatch
```json
{
  "success": false,
  "error": "Payment amount mismatch. Expected 50.00, got 45.00"
}
```
**Solution:** Use the exact amount returned in inspection creation response

#### 5. Payment Already Processed
```json
{
  "success": false,
  "error": "Inspection payment already processed or not in pending payment status"
}
```
**Solution:** Check inspection status - payment may already be completed

#### 6. No Inspector Available
```json
{
  "success": false,
  "error": "No available inspector found for this category and location"
}
```
**Solution:** Try different location or contact support

---

## Payment Details

### Inspection Costs

| Tier | Points | Cost (USD) | Description |
|------|--------|-------------|-------------|
| **Standard** | 120 | $50 | Comprehensive 120-point inspection |
| **Advanced** | 240 | $100 | Detailed 240-point inspection |

### Payment Methods

Supported payment methods:
- Credit/Debit Cards (Stripe)
- Mobile Money (MTN MoMo, Airtel Money)
- Bank Transfer
- Other configured providers

### Payment Transaction Details

**Transaction Type:** `inspection_fee`

**Metadata Includes:**
- `inspection_id`: Inspection UUID
- `product_id`: Product UUID
- `booking_id`: Booking UUID (if linked)
- `inspection_tier`: Standard or Advanced

### Refund Policy

- Refunds are handled through the standard payment transaction refund process
- Contact support for refund requests
- Refunds may be subject to cancellation policies

---

## User Interface Recommendations

### Inspection Request Form
- Clear tier selection with cost display
- Date/time picker with availability checking
- Location autocomplete or map picker
- Booking selection dropdown (if applicable)
- Real-time cost calculation
- Form validation with helpful error messages

### Payment Screen
- Clear cost breakdown
- Payment method selection
- Secure payment processing indicator
- Success/error feedback
- Receipt generation

### Inspection Status Dashboard
- Status indicator with clear visual states
- Timeline view of inspection progress
- Payment status indicator
- Inspector information (when assigned)
- Scheduled date/time display

### Inspection Report View
- Overall score prominently displayed
- Visual rating indicator (stars/badges)
- Detailed scores breakdown by category
- Photo gallery
- Inspector notes and recommendations
- Download/print options
- Share functionality

---

## Testing Checklist

### Owner Flow Testing
- [ ] Can view bookings for a product
- [ ] Can create inspection request without booking
- [ ] Can create inspection request with booking
- [ ] Cannot create inspection for someone else's product
- [ ] Cannot create inspection for someone else's booking
- [ ] Payment is required after request creation
- [ ] Can process payment successfully
- [ ] Payment failure is handled gracefully
- [ ] Inspection status updates after payment
- [ ] Can view completed inspection report

### Inspector Flow Testing
- [ ] Inspector receives notification
- [ ] Inspector can view assigned inspections
- [ ] Inspector can complete inspection
- [ ] Scores are calculated correctly
- [ ] Public report is generated

### Error Handling Testing
- [ ] Invalid product ID returns error
- [ ] Invalid booking ID returns error
- [ ] Payment amount mismatch returns error
- [ ] Payment on already-paid inspection returns error
- [ ] No inspector available returns error

---

## Support & Troubleshooting

### Common Issues

**Issue:** Payment button not appearing  
**Solution:** Check inspection status - it should be `pending_payment`

**Issue:** Cannot select booking  
**Solution:** Ensure booking status is `confirmed`, `in_progress`, or `completed`

**Issue:** Payment fails repeatedly  
**Solution:** Verify payment method is valid and has sufficient funds

**Issue:** Inspector not assigned  
**Solution:** Contact support - may need manual inspector assignment

---

## Conclusion

This flow provides a complete end-to-end process for product owners to request professional third-party inspections, pay the required fees, and receive detailed inspection reports. The system ensures proper validation, secure payment processing, and seamless communication between owners and inspectors.

For technical implementation details, refer to the backend API documentation and service layer code.

---

**Last Updated:** January 2024  
**Version:** 1.0

