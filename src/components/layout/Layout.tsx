import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AlibabaHeader from './AlibabaHeader';
import Footer from './Footer';
import BottomNav from './BottomNav';
import { useAdminSettingsContext } from '../../contexts/AdminSettingsContext';
import { useAuthReminder } from '../../hooks/useAuthReminder';
import AuthReminderPopup from '../auth/AuthReminderPopup';

const Layout: React.FC = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const { settings } = useAdminSettingsContext();
  
  // Global auth reminder for all non-admin pages
  const { showPopup, closePopup, currentTrigger } = useAuthReminder({
    interval: 30000,      // Show every 30 seconds after first one
    maxReminders: 5,      // Max 5 reminders per session
    autoHide: 8000        // Auto-hide after 8 seconds
  });
  
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
      {(settings?.system?.maintenanceMode || settings?.notifications?.systemMaintenance?.enabled) && (
        <div className="w-full bg-yellow-50 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 text-sm py-2 text-center">
          {settings?.notifications?.systemMaintenance?.message || 'System is in maintenance mode. Some features may be unavailable.'}
        </div>
      )}
      {!isAdmin && <AlibabaHeader />}
      <main className="flex-1 relative pb-16 md:pb-0">
        <Outlet />
        {(settings?.system?.maintenanceMode || settings?.notifications?.systemMaintenance?.enabled) && !isAdmin && (
          <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-6 max-w-md text-center mx-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Maintenance Mode</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{settings?.notifications?.systemMaintenance?.message || 'We’re performing scheduled maintenance. Please try again later.'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">If you are an admin, you can continue in the admin panel.</p>
            </div>
          </div>
        )}
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <BottomNav />}
      
      {/* Global Auth Reminder - Shows on all non-admin pages */}
      {!isAdmin && (
        <AuthReminderPopup
          isOpen={showPopup}
          onClose={closePopup}
          trigger={currentTrigger}
          autoHideAfter={8}
        />
      )}
    </div>
  );
};

export default Layout;
