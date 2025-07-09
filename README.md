# Uruti eRental - Universal Rental Platform

A modern, component-based peer-to-peer rental platform built with React, TypeScript, Vite, and Tailwind CSS. Rent anything from cameras and tools to vehicles and electronics across Africa.

## 📋 Project Documentation

- **[Project Maintenance Guide](./PROJECT_MAINTENANCE_GUIDE.md)** - Complete project status, resolved issues, and maintenance checklist
- **[Design System](./DESIGN_SYSTEM.md)** - UI components and styling guidelines  
- **[Authentication Flow](./AUTHENTICATION_FLOW.md)** - Authentication system documentation
- **[Responsive Design](./RESPONSIVE_DESIGN.md)** - Mobile and responsive design guidelines

## Features

- Modern UI with Tailwind CSS
- Responsive design  
- Universal item search and filtering across all categories
- Detailed item pages with specifications and owner information
- Smart booking system with authentication and verification gates
- AI-powered recommendations and matching
- User authentication and profile management
- Comprehensive user dashboard
- Admin panel for platform management
- Protected routes and secure transactions
- Multi-category support (Electronics, Tools, Vehicles, Outdoor Gear, etc.)

## Tech Stack

- React 18+
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Context API for state management

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd erental2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser to see the application.

## Project Structure

```
/src
  /components
    /auth
      ProtectedRoute.tsx
    /layout
      Header.tsx
      Footer.tsx
      Layout.tsx
    /sections
      HeroSection.tsx
      FeaturedCarsSection.tsx
      ...
    /ui
      Button.tsx
      Card.tsx
      ...
  /contexts
    AuthContext.tsx
  /data
    mockData.ts
  /lib
    utils.ts
  /pages
    HomePage.tsx
    CarsPage.tsx
    CarDetailsPage.tsx
    BookingPage.tsx
    LoginPage.tsx
    RegisterPage.tsx
    ...
  /styles
    fonts.css
  /types
    index.ts
  App.tsx
  main.tsx
  index.css
```

## Authentication

The application uses a context-based authentication system with mock implementation. In a production environment, this would be connected to a backend authentication service.

## Development

### Adding New Pages

1. Create a new component in the `/pages` directory
2. Add the route in `App.tsx`
3. For protected routes, wrap the route with the `ProtectedRoute` component

### Adding New Components

1. Create a new component in the appropriate directory under `/components`
2. Import and use it in your pages or other components

## 🎯 Interactive Demo

Experience our booking flow across three user scenarios:

### 🚀 Quick Demo Access
Visit `/demo` to experience the interactive booking flow demonstration.

### Demo Scenarios
- **🔴 User Without Account**: See how we handle unauthenticated visitors
- **🟠 Unverified User**: Experience the start of verification flow  
- **🟡 Partially Verified User**: See progressive verification with some steps completed
- **🟢 Fully Verified User**: Enjoy seamless, frictionless booking

**[📖 Full Demo Guide](./DEMO_README.md)** - Complete demo documentation

## License

This project is licensed under the MIT License - see the LICENSE file for details.
