import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CarsPage from './pages/CarsPage';
import CarDetailsPage from './pages/CarDetailsPage';
import BookingPage from './pages/BookingPage';
import FaqPage from './pages/FaqPage';
import CreateListingPage from './pages/CreateListingPage';
import ProfileVerificationPage from './pages/verification/ProfileVerificationPage';
import EmailVerificationPage from './pages/verification/EmailVerificationPage';
import PhoneVerificationPage from './pages/verification/PhoneVerificationPage';
import IdVerificationPage from './pages/verification/IdVerificationPage';
import AddressVerificationPage from './pages/verification/AddressVerificationPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth routes - handle their own layout */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          
          {/* Main app routes with layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="cars" element={<CarsPage />} />
            <Route path="cars/:id" element={<CarDetailsPage />} />
            <Route path="faq" element={<FaqPage />} />
            
            {/* Protected routes */}
            <Route path="create-listing" element={
              <ProtectedRoute>
                <CreateListingPage />
              </ProtectedRoute>
            } />
            <Route path="dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="admin" element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="booking/:carId" element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            } />
            
            {/* Verification routes - protected */}
            <Route path="verify/profile" element={
              <ProtectedRoute>
                <ProfileVerificationPage />
              </ProtectedRoute>
            } />
            <Route path="verify/email" element={
              <ProtectedRoute>
                <EmailVerificationPage />
              </ProtectedRoute>
            } />
            <Route path="verify/phone" element={
              <ProtectedRoute>
                <PhoneVerificationPage />
              </ProtectedRoute>
            } />
            <Route path="verify/id" element={
              <ProtectedRoute>
                <IdVerificationPage />
              </ProtectedRoute>
            } />
            <Route path="verify/address" element={
              <ProtectedRoute>
                <AddressVerificationPage />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
