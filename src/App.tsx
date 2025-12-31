import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import ModeratorRoute from './components/auth/ModeratorRoute';
import InspectorRoute from './components/auth/InspectorRoute';
import Layout from './components/layout/Layout';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/ui/ToastContainer';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { AdminSettingsProvider } from './contexts/AdminSettingsContext';
import { I18nProvider } from './contexts/i18n-context';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import PWAInstallPrompt from './components/PWAInstallPrompt';

// Lazy load page components for code-splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./pages/my-account/DashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const BookingPage = lazy(() => import('./pages/booking-page/BookingPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const CreateListingPage = lazy(() => import('./pages/CreateListingPage'));
const ItemSearchPage = lazy(() => import('./pages/ItemSearchPage'));
const ItemDetailsPage = lazy(() => import('./pages/ItemDetailsPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const SuppliersPage = lazy(() => import('./pages/SuppliersPage'));
const EnterprisePage = lazy(() => import('./pages/EnterprisePage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const UrutiBzVerification = lazy(() => import('./pages/verification2/urutibiziVerification'));
const DemoPage = lazy(() => import('./pages/DemoPage'));
const RoleAwareInspections = lazy(() => import('./pages/inspections/RoleAwareInspections'));
const InspectorDashboardPage = lazy(() => import('./pages/inspections/InspectorDashboardPage'));
const InspectionDetailsPage = lazy(() => import('./pages/inspections/InspectionDetailsPage'));
const ModeratorDashboardPage = lazy(() => import('./pages/moderator/ModeratorDashboardPage'));
const RiskManagementPage = lazy(() => import('./pages/risk-management/RiskManagementPage'));
const RiskAssessmentPage = lazy(() => import('./pages/risk-management/RiskAssessmentPage'));
const NotificationsPage = lazy(() => import('./features/notifications/pages/NotificationsPage'));
const SessionMessagesPage = lazy(() => import('./pages/my-account/SessionMessagesPage'));
const HandoverReturnDemoPage = lazy(() => import('./pages/handover-return/HandoverReturnDemoPage'));
const CartCheckoutPage = lazy(() => import('./pages/CartCheckoutPage'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);


function App() {
  // Get Google Translate API key from environment (optional)
  const googleTranslateApiKey = import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY;
  
  // Get default language from localStorage or use 'en'
  const defaultLanguage = localStorage.getItem('language') || 'en';

  return (
    <I18nProvider 
      defaultLanguage={defaultLanguage}
      googleTranslateApiKey={googleTranslateApiKey}
    >
      <ThemeProvider token={localStorage.getItem('token') || undefined}>
        <DarkModeProvider>
          <AdminSettingsProvider token={localStorage.getItem('token') || undefined}>
            <ToastProvider>
          <ToastContainer />
          <CartProvider>
          <AuthProvider>
            <Router>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Auth routes - handle their own layout */}
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="reset-password" element={<ResetPasswordPage />} />

                  {/* My Account routes - handle their own layout */}
                  <Route path="dashboard" element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="my-account/messages/:type/:id" element={
                    <ProtectedRoute>
                      <SessionMessagesPage />
                    </ProtectedRoute>
                  } />
                  <Route path="dashboard/notifications" element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="my-account" element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />

                  {/* Inspection routes - protected, standalone (no header/footer) */}
                  <Route path="inspections" element={
                    <ProtectedRoute>
                      <RoleAwareInspections />
                    </ProtectedRoute>
                  } />
                  <Route path="inspector" element={
                    <InspectorRoute>
                      <InspectorDashboardPage />
                    </InspectorRoute>
                  } />
                  <Route path="moderator" element={
                    <ModeratorRoute>
                      <ModeratorDashboardPage />
                    </ModeratorRoute>
                  } />
                  <Route path="inspections/:id" element={
                    <ProtectedRoute>
                      <InspectionDetailsPage />
                    </ProtectedRoute>
                  } />

                  {/* Main app routes with layout */}
                  <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="cars" element={<ItemSearchPage />} />
                    <Route path="items" element={<ItemSearchPage />} />
                    <Route path="items/search" element={<ItemSearchPage />} />
                    <Route path="browse" element={<ItemSearchPage />} />
                    <Route path="favorites" element={
                      <ProtectedRoute>
                        <FavoritesPage />
                      </ProtectedRoute>
                    } />

                    <Route path="it/:id" element={<ItemDetailsPage />} />

                    <Route path="demo" element={<DemoPage />} />
                    <Route path="faq" element={<FaqPage />} />
                    <Route path="suppliers" element={<SuppliersPage />} />
                    <Route path="enterprise" element={<EnterprisePage />} />
                    <Route path="handover-return-demo" element={<HandoverReturnDemoPage />} />

                    {/* Protected routes */}
                    <Route path="create-listing" element={
                      <ProtectedRoute>
                        <CreateListingPage />
                      </ProtectedRoute>
                    } />
                    <Route path="admin" element={
                      <AdminRoute>
                        <AdminDashboardPage />
                      </AdminRoute>
                    } />
                    <Route path="risk-management" element={
                      <ProtectedRoute>
                        <RiskManagementPage />
                      </ProtectedRoute>
                    } />
                   
                    <Route path="booking" element={
                      <BookingPage />
                    } />
                    <Route path="booking/:carId" element={
                      <ProtectedRoute>
                        <BookingPage />
                      </ProtectedRoute>
                    } />
                    <Route path="booking/item/:itemId" element={
                      <ProtectedRoute>
                        <BookingPage />
                      </ProtectedRoute>
                    } />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="cart/checkout" element={
                      <ProtectedRoute>
                        <CartCheckoutPage />
                      </ProtectedRoute>
                    } />
                  </Route>
                  <Route path="risk-assessment" element={
                      <ProtectedRoute>
                        <RiskAssessmentPage />
                      </ProtectedRoute>
                    } />
                  <Route path="verify/id" element={
                    <ProtectedRoute>
                      <UrutiBzVerification />
                    </ProtectedRoute>
                  } />
                </Routes>
              </Suspense>
          </Router>
        </AuthProvider>
        </CartProvider>
        </ToastProvider>
        </AdminSettingsProvider>
        </DarkModeProvider>
      </ThemeProvider>
      <PWAInstallPrompt />
    </I18nProvider>
  );
}

export default App;
