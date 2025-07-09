# Booking Flow Demo Guide

## Overview
The booking flow demo showcases how the Uruti eRental platform handles different user scenarios during the booking process. This interactive demonstration helps understand the user experience for four distinct scenarios.

## Demo Access
Visit `/demo` in your browser to access the interactive booking flow demonstration.

## Demo Components

### 1. Interactive Booking Demo
- **Visual Item Card**: Shows a realistic rental item (Canon EOS R5 Camera)
- **Scenario Selector**: Switch between four user types
- **Play Demo**: Automated walkthrough of the booking flow
- **Real-time Modals**: Shows actual authentication and verification modals

### 2. Static Flow Documentation
- **Detailed Steps**: Step-by-step breakdown of each scenario
- **User Status Display**: Current authentication and verification status
- **Key Features**: Highlights of the platform's security and UX features

## User Scenarios

### Scenario 1: User Without Account
**Status**: Not authenticated
**Flow**:
1. User views item details
2. Clicks "Book Now"
3. Authentication modal appears
4. User selects "Log In" or "Create Account"
5. After authentication, returns to original item with booking intent preserved

**Key Features**:
- Modal-based authentication (no jarring redirects)
- Booking intent preservation
- Clear call-to-action buttons

### Scenario 2: Unverified User
**Status**: Authenticated but with no verification steps completed
**User**: Jane Smith (jane@example.com)
**Verification Status**: Profile ✗, Email ✗, Phone ✗, ID ✗, Address ✗

**Flow**:
1. User views item details
2. Clicks "Book Now"
3. Verification modal appears showing current status
4. User proceeds to start verification process
5. After verification, gains access to booking

**Key Features**:
- Visual verification progress indicator
- Clear next steps for verification
- Security-focused messaging

### Scenario 3: Partially Verified User
**Status**: Authenticated with some verification steps completed
**User**: Robert Chen (robert@example.com)
**Verification Status**: Profile ✓, Email ✓, Phone ✓, ID ✗, Address ✗

**Flow**:
1. User views item details
2. Clicks "Book Now"
3. Verification modal appears showing current status
4. User proceeds to complete remaining verification steps
5. After verification, gains access to booking

**Key Features**:
- Progress acknowledgment
- Clear indication of remaining steps
- Contextualized verification requirements

### Scenario 4: Fully Verified User
**Status**: Authenticated and fully verified
**User**: John Doe (john@example.com)
**Verification Status**: All steps completed ✓

**Flow**:
1. User views item details
2. Clicks "Book Now"
3. Direct redirect to booking page (no interruptions)

**Key Features**:
- Seamless, uninterrupted experience
- Immediate access to booking functionality
- Reward for completing verification

## Demo Features

### Interactive Elements
- **Play Demo Button**: Automatically walks through the selected scenario
- **Reset Button**: Restarts the demo from the beginning
- **Scenario Switching**: Instantly change user contexts
- **Real Modals**: Shows actual authentication and verification modals

### Visual Indicators
- **Step Progress**: Visual timeline showing current progress
- **User Status Cards**: Display authentication and verification status
- **Animated Transitions**: Smooth transitions between steps
- **Color-coded Scenarios**: Red (unauthenticated), Orange (unverified), Green (verified)

## Technical Implementation

### Authentication Gates
```typescript
const handleBookNow = () => {
  if (!isAuthenticated) {
    setShowAuthModal(true);
    return;
  }
  
  if (!user?.verification.isFullyVerified) {
    setShowVerificationModal(true);
    return;
  }
  
  navigate(`/booking/item/${item.id}`);
};
```

### Verification Status Tracking
```typescript
interface VerificationStatus {
  isProfileComplete: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isIdVerified: boolean;
  isAddressVerified: boolean;
  isFullyVerified: boolean;
}
```

### Redirect Intent Preservation
```typescript
// Login redirect with booking intent
navigate(`/login?redirect=/items/${item.id}&action=book`);

// Register redirect with booking intent
navigate(`/register?redirect=/items/${item.id}&action=book`);
```

## Testing with Mock Users

To test the actual booking flow with real authentication (not just the demo), you can use these mock user accounts:

### Mock User Credentials

| User Type | Email | Password | Verification Status |
|-----------|-------|----------|---------------------|
| **Fully Verified** | verified@example.com | password | 100% Complete |
| **Partially Verified** | partial@example.com | password | 60% Complete |
| **Unverified** | unverified@example.com | password | 0% Complete |
| **Legacy User** | user@example.com | password | 0% Complete |

### Testing Process

1. Log in with the desired user credentials at `/login`
2. Navigate to an item details page (e.g., `/items/1`)
3. Click "Book Now" to trigger the appropriate flow
4. Observe the different gates and modals that appear based on user verification status

### Expected Behaviors

- **Fully Verified User**: Direct access to booking page
- **Partially Verified User**: Verification modal showing 60% progress
- **Unverified User**: Verification modal showing 0% progress
- **Not Logged In**: Authentication modal with login/register options

## Usage Instructions

1. **Access Demo**: Navigate to `/demo` in your browser
2. **Select Scenario**: Choose one of the three user types
3. **Play Demo**: Click "Play Demo" for automated walkthrough
4. **Interact**: Click "Book Now" to trigger authentication/verification flows
5. **Explore**: Switch between scenarios to see different experiences
6. **Reset**: Use "Reset" button to start over

This demo provides a comprehensive view of how the platform prioritizes security while maintaining an excellent user experience across different authentication and verification states.
