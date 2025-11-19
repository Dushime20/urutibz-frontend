import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface InspectorRouteProps {
  children: React.ReactNode;
}

const InspectorRoute: React.FC<InspectorRouteProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading, isInspector } = useAuth();
  const location = useLocation();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  
  // Wait for AuthContext to finish initial load AND check localStorage
  useEffect(() => {
    if (!isLoading) {
      // Give a small delay to ensure user is loaded from localStorage
      const timer = setTimeout(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        console.log('🔍 [InspectorRoute] Initial check:', {
          isLoading,
          hasStoredUser: !!storedUser,
          hasStoredToken: !!storedToken,
          hasUserInContext: !!user,
          isAuthenticated
        });
        
        setInitialCheckDone(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, user, isAuthenticated]);
  
  // Debug logging
  useEffect(() => {
    if (initialCheckDone) {
      console.log('🔐 [InspectorRoute] Auth Check:', {
        isLoading,
        isAuthenticated,
        user: user ? { id: user.id, role: user.role, email: user.email } : null,
        isInspector: isInspector(),
        location: location.pathname,
        initialCheckDone
      });
    }
  }, [isLoading, isAuthenticated, user, isInspector, location.pathname, initialCheckDone]);
  
  // Show loading state while checking authentication
  if (isLoading || !initialCheckDone) {
    console.log('⏳ [InspectorRoute] Loading authentication state...');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#01aaa7]"></div>
      </div>
    );
  }
  
  // Check localStorage as fallback if context user is not set but token exists
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');
  const hasStoredAuth = storedUser && storedToken;
  
  // If we have stored auth but context doesn't have user, wait a bit more
  if (hasStoredAuth && !user && !isLoading) {
    console.log('⏳ [InspectorRoute] Has stored auth but user not in context, waiting...');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#01aaa7]"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated && !hasStoredAuth) {
    console.warn('❌ [InspectorRoute] Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Get role from user or stored user
  let userRole = user?.role;
  if (!userRole && storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      userRole = parsed?.role;
    } catch {}
  }
  
  // Redirect to dashboard if not inspector
  if (userRole !== 'inspector' && !isInspector()) {
    console.warn('⚠️ [InspectorRoute] User is not an inspector. Role:', userRole, 'Redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ [InspectorRoute] Access granted for inspector');
  // Render the inspector content
  return <>{children}</>;
};

export default InspectorRoute;

