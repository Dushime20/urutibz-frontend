import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/my-account/DashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import BookingPage from './pages/booking-page/BookingPage';
import FaqPage from './pages/FaqPage';
import CreateListingPage from './pages/CreateListingPage';
import ItemSearchPage from './pages/ItemSearchPage';
import ItemDetailsPage from './pages/ItemDetailsPage';
import FavoritesPage from './pages/FavoritesPage';
// import ProfileVerificationPage from './pages/verification/ProfileVerificationPage';
// import EmailVerificationPage from './pages/verification/EmailVerificationPage';
// import PhoneVerificationPage from './pages/verification/PhoneVerificationPage';
import UrutiBzVerification from './pages/verification2/urutibiziVerification';
// import AddressVerificationPage from './pages/verification/AddressVerificationPage';
import DemoPage from './pages/DemoPage';
import RoleAwareInspections from './pages/inspections/RoleAwareInspections';
import InspectorDashboardPage from './pages/inspections/InspectorDashboardPage';
import InspectionDetailsPage from './pages/inspections/InspectionDetailsPage';
import RiskManagementPage from './pages/risk-management/RiskManagementPage';
import RiskAssessmentPage from './pages/risk-management/RiskAssessmentPage';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/ui/ToastContainer';
import { DarkModeProvider } from './contexts/DarkModeContext';
import NotificationsPage from './features/notifications/pages/NotificationsPage';
import SessionMessagesPage from './pages/my-account/SessionMessagesPage';
import HandoverReturnDemoPage from './pages/handover-return/HandoverReturnDemoPage';


function App() {
  return (
    <DarkModeProvider>
      <ToastProvider>
        <ToastContainer />
        <AuthProvider>
          <Router>
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
                <ProtectedRoute>
                  <InspectorDashboardPage />
                </ProtectedRoute>
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

          </Router>
        </AuthProvider>
      </ToastProvider>
    </DarkModeProvider>
  );
}

export default App;
