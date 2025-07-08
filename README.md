# Uruti eRental - Car Rental Website

A modern, component-based car rental website built with React, TypeScript, Vite, and Tailwind CSS.

## 📋 Project Documentation

- **[Project Maintenance Guide](./PROJECT_MAINTENANCE_GUIDE.md)** - Complete project status, resolved issues, and maintenance checklist
- **[Design System](./DESIGN_SYSTEM.md)** - UI components and styling guidelines  
- **[Authentication Flow](./AUTHENTICATION_FLOW.md)** - Authentication system documentation
- **[Responsive Design](./RESPONSIVE_DESIGN.md)** - Mobile and responsive design guidelines

## Features

- Modern UI with Tailwind CSS
- Responsive design
- Car listing and filtering
- Car details with specifications
- Booking system
- User authentication
- User dashboard
- Protected routes

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

## License

This project is licensed under the MIT License - see the LICENSE file for details.
