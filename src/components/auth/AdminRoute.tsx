import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminSettingsContext } from '../../contexts/AdminSettingsContext';
import { useTwoFactor } from '../../hooks/useTwoFactor';
import { fetchUserProfile } from '../../pages/my-account/service/api';
import Portal from '../ui/Portal';
import { TwoFactorManagement } from '../../components/2fa';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();
  const location = useLocation();
  const { settings, isLoading: isSettingsLoading } = useAdminSettingsContext();
  const { status } = useTwoFactor();
  const [meLoaded, setMeLoaded] = useState(false);
  const [meFlags, setMeFlags] = useState<{ twoFactorEnabled: boolean; twoFactorVerified: boolean; role?: string } | null>(null);
  const [showSetup2FA, setShowSetup2FA] = useState(false);

  // Fetch canonical flags from auth/me to avoid stale local state
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token') || '';
        if (!token) {
          setMeLoaded(true);
          return;
        }
        const res = await fetchUserProfile(token);
        const enabled = Boolean(res?.data?.twoFactorEnabled);
        const verified = Boolean(res?.data?.twoFactorVerified);
        const role = res?.data?.role;
        setMeFlags({ twoFactorEnabled: enabled, twoFactorVerified: verified, role });
      } catch (e) {
        // ignore
      } finally {
        setMeLoaded(true);
      }
    })();
  }, []);

  // Compute enforcement flags BEFORE any early returns to keep hook order stable
  const storedRequire = (() => {
    try {
      const a = localStorage.getItem('security.requireTwoFactor') === 'true';
      const b = localStorage.getItem('security.twoFactorRequired') === 'true';
      return a || b;
    } catch {
      return false;
    }
  })();
  const requireTwoFactor = Boolean((settings as any)?.security?.twoFactorRequired || storedRequire);
  const twoFactorEnabled = meFlags?.twoFactorEnabled ?? status.enabled;
  const twoFactorVerified = meFlags?.twoFactorVerified ?? status.verified;
  const isAdminRole = isAdmin() || meFlags?.role === 'admin';
  const twoFactorOk = Boolean(twoFactorEnabled && twoFactorVerified);
  const mustEnforce = requireTwoFactor && isAdminRole && !twoFactorOk;

  // Show overlay when enforcement is required
  useEffect(() => {
    if (mustEnforce) setShowSetup2FA(true);
  }, [mustEnforce]);

  // Auto-close overlay only when enforcement condition becomes false
  useEffect(() => {
    if (!mustEnforce && showSetup2FA) {
      setShowSetup2FA(false);
    }
  }, [mustEnforce, showSetup2FA]);
  
  // Show loading state while checking authentication
  if (isLoading || isSettingsLoading || status.isLoading || !meLoaded) {
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

  
  // Render the admin content and 2FA enforcement overlay when required
  return (
    <>
      {children}
      {showSetup2FA && (
        <Portal>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[3000] p-3">
            <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-lg overflow-hidden shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Two-Factor Authentication Required</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Enable and verify 2FA to continue</p>
                </div>
              </div>
              <div className="p-3 max-h-[75vh] overflow-y-auto">
                <TwoFactorManagement onStatusChange={() => { /* keep open until verified */ }} />
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
};

export default AdminRoute;
