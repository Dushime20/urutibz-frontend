import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const location = useLocation();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#01aaa7]"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the current path so we can redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Redirect to dashboard if not admin
  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }
  
  // Render the admin content
  return <>{children}</>;
};

export default AdminRoute;
