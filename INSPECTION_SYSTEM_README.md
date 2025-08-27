# Inspection Management System

A comprehensive inspection management system built with React, TypeScript, and Tailwind CSS for managing product inspections, inspector assignments, and dispute resolution.

## 🚀 Features

### Main Inspections Dashboard
- **Complete inspections page** with filtering (status, type, date range), search, and pagination
- **Status badges** for pending, in_progress, completed, disputed, and resolved inspections
- **Action buttons** for each inspection (view, edit, start, complete)
- **Quick stats cards** showing total inspections, pending, completed, disputed counts
- **Recent inspections timeline** with quick action buttons

### Inspection Forms & Management
- **Create Inspection Form** with productId, bookingId, inspectorId, inspectionType, scheduledAt, location, and notes
- **Edit Inspection Form** for updating existing inspection details
- **Start Inspection Form** to change status to in_progress
- **Complete Inspection Form** to change status to completed with final notes
- **Inspection Details View** showing header, items, photos, notes, disputes, and action buttons

### Inspection Items Management
- **Add/Edit Item Forms** with itemName, description, condition, notes, and photos
- **Item List component** with condition badges (excellent, good, fair, poor, damaged)
- **Photo upload component** with drag & drop functionality
- **Cost assessment fields** for repairCost and replacementCost
- **Condition selector** with visual indicators

### Dispute Management System
- **Raise Dispute Form** with type, reason, evidence, and photos
- **Dispute Details View** showing status, timeline, and evidence
- **Resolve Dispute Form** with resolution notes and agreed amount
- **Dispute List component** with status tracking
- **Evidence upload and review interface**

### Photo Management Interface
- **Photo grid layout** with thumbnails and full-size viewer
- **Drag & drop photo upload** with categorization (general, damage, condition, before/after)
- **Mobile-friendly photo capture interface**
- **Bulk photo operations and organization**

### User Roles & Inspector Management
- **Inspector Dashboard**: Dedicated interface for inspectors to manage assigned inspections
- **Inspector Profile**: View/edit inspector details, qualifications, and specializations
- **Assignment Management**: View assigned inspections, schedule, and workload
- **Inspector Calendar**: Calendar view showing scheduled inspections and availability
- **Performance Metrics**: Individual inspector statistics and ratings

### User Role-Based Interfaces
- **Inspectors**: Full inspection management (create, conduct, complete, dispute handling)
- **Product Owners**: View their product inspections, add notes, raise disputes
- **Renters**: View their rental inspections, add notes, participate in disputes
- **Admins**: Full system access, inspector management, dispute resolution
- **Managers**: Oversight of inspections, reporting, quality control

## 🛠️ Technical Stack

- **React 18+** with TypeScript for type safety
- **Tailwind CSS v3** for styling (mobile-first responsive design)
- **React Hook Form** with Zod for form validation
- **React Router** for navigation and routing
- **Axios** for API integration with proper error handling
- **React Context** for state management
- **Lucide React** for modern icons

## 📁 Project Structure

```
src/
├── components/
│   └── inspections/
│       ├── StatusBadge.tsx           # Status display component
│       ├── QuickStatsCard.tsx        # Statistics display
│       ├── InspectionFiltersPanel.tsx # Advanced filtering
│       ├── InspectionTable.tsx       # Inspections table
│       ├── RecentInspectionsTimeline.tsx # Activity timeline
│       └── CreateInspectionModal.tsx # Create inspection modal
├── pages/
│   └── inspections/
│       ├── InspectionsDashboardPage.tsx # Main dashboard
│       ├── InspectorDashboardPage.tsx   # Inspector view
│       └── InspectionDetailsPage.tsx    # Inspection details
├── services/
│   └── inspectionService.ts          # API integration
├── types/
│   └── inspection.ts                 # TypeScript interfaces
└── App.tsx                           # Main routing
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- React 18+
- TypeScript 5+

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open http://localhost:5173

### Available Routes
- `/inspections` - Main inspections dashboard
- `/inspector` - Inspector dashboard
- `/inspections/:id` - Inspection details page

## 🔧 API Integration

The system integrates with `/api/v1/inspections` endpoints:

- **GET /inspections** - List inspections with filters
- **POST /inspections** - Create new inspection
- **GET /inspections/:id** - Get inspection details
- **PUT /inspections/:id** - Update inspection
- **POST /inspections/:id/start** - Start inspection
- **POST /inspections/:id/complete** - Complete inspection
- **DELETE /inspections/:id** - Delete inspection

### Services
- `inspectionService` - Core inspection CRUD operations
- `inspectionItemService` - Inspection items management
- `disputeService` - Dispute handling
- `photoService` - Photo upload and management
- `inspectorService` - Inspector management

## 🎨 Design System

### Color Scheme
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Neutral**: Gray scale

### Components
- **StatusBadge**: Consistent status display across the app
- **QuickStatsCard**: Reusable statistics display
- **Pagination**: Navigation between pages
- **Modal**: Reusable modal components

### Responsive Design
- Mobile-first approach
- Responsive tables that stack on mobile
- Touch-friendly interface elements
- Mobile-optimized forms

## 🔐 Authentication & Authorization

- Protected routes using `ProtectedRoute` component
- Role-based access control
- Admin routes using `AdminRoute` component
- JWT token-based authentication

## 📱 Mobile & PWA Features

- Touch-friendly interface elements
- Mobile-optimized forms
- Responsive design patterns
- Offline capability considerations
- Camera integration for photo capture

## 🧪 Testing & Quality

- TypeScript for type safety
- Comprehensive error handling
- Loading states and error boundaries
- Form validation with Zod schemas
- Responsive design testing

## 🚀 Future Enhancements

- Real-time updates via WebSocket
- Advanced analytics dashboard
- Mobile app development
- AI-powered inspection recommendations
- Integration with IoT devices
- Advanced reporting and exports
- Multi-language support
- Advanced scheduling algorithms

## 🤝 Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Ensure mobile responsiveness
4. Add proper error handling
5. Update documentation

## 📄 License

This project is part of the UrutiBz e-rental platform.

---

For more information, contact the development team or refer to the main project documentation.
