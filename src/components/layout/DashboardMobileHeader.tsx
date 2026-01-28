import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  Search, 
  Camera,
  ShoppingCart,
  Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useAdminSettingsContext } from '../../contexts/AdminSettingsContext';
import { TranslatedText } from '../translated-text';
import RealtimeNotifications from '../RealtimeNotifications';
import CartIcon from '../cart/CartIcon';
import CartDrawer from '../cart/CartDrawer';
import LoginSignupModal from '../auth/LoginSignupModal';
import { useToast } from '../../contexts/ToastContext';

interface DashboardMobileHeaderProps {
  title?: string;
  showSearch?: boolean;
  showCart?: boolean;
  onMenuClick?: () => void;
  onSearchClick?: () => void;
}

const DashboardMobileHeader: React.FC<DashboardMobileHeaderProps> = ({
  title = 'Dashboard',
  showSearch = false,
  showCart = true,
  onMenuClick,
  onSearchClick
}) => {
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { settings } = useAdminSettingsContext();
  const { showToast } = useToast();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const roleDestination =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'inspector'
        ? '/inspector'
        : user?.role === 'moderator'
          ? '/moderator'
          : '/dashboard';

  return (
    <>
      {/* Mobile Header - Only visible on small screens */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
        {/* Top Row: Logo, Title, Actions */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={
                  settings?.business?.companyLogo ||
                  settings?.platform?.logoUrl ||
                  '/assets/img/yacht/urutilogo2.png'
                }
                alt={
                  settings?.business?.companyName ||
                  settings?.platform?.siteName ||
                  'UrutiBz'
                }
                className="w-8 h-8 object-cover rounded"
              />
              <span className="font-bold text-lg text-teal-600">UrutiBz</span>
            </Link>
            <div className="h-6 w-px bg-gray-300 dark:bg-slate-600" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              <TranslatedText text={title} />
            </h1>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
           
          

            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-gray-600 dark:text-slate-400" />
              ) : (
                <Moon className="w-4 h-4 text-gray-600 dark:text-slate-400" />
              )}
            </button>

            <button
              onClick={onMenuClick}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Profile Dropdown */}
        {isProfileOpen && isAuthenticated && (
          <div className="absolute top-full right-4 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 py-3 z-50">
            <div className="px-4 pb-3 border-b border-gray-200 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
            <div className="py-2">
              <Link
                to={roleDestination}
                onClick={() => setIsProfileOpen(false)}
                className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <TranslatedText text={
                  user?.role === 'admin' ? 'Admin Console' :
                  user?.role === 'inspector' ? 'Inspector Console' :
                  user?.role === 'moderator' ? 'Moderator Console' :
                  'My Account'
                } />
              </Link>
              <Link
                to="/items"
                onClick={() => setIsProfileOpen(false)}
                className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <TranslatedText text="Marketplace" />
              </Link>
              <Link
                to="/enterprise"
                onClick={() => setIsProfileOpen(false)}
                className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <TranslatedText text="Enterprise" />
              </Link>
              <Link
                to="/support"
                onClick={() => setIsProfileOpen(false)}
                className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <TranslatedText text="Support" />
              </Link>
              <Link
                to="/create-listing"
                onClick={() => setIsProfileOpen(false)}
                className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <TranslatedText text="Rent on UrutiBz" />
              </Link>
              <button
                onClick={toggleDarkMode}
                className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                <TranslatedText text={isDarkMode ? "Light Mode" : "Dark Mode"} />
              </button>
            </div>
            <div className="border-t border-gray-200 dark:border-slate-700 pt-2">
              <button
                onClick={() => {
                  // Handle logout
                  setIsProfileOpen(false);
                  // Add logout logic here
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-2xl"
              >
                <TranslatedText text="Logout" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Login/Signup Modal */}
      <LoginSignupModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          showToast('Welcome! You can now access all features.', 'success');
        }}
      />

      {/* Backdrop for profile dropdown */}
      {isProfileOpen && (
        <div 
          className="fixed inset-0 z-30 md:hidden" 
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </>
  );
};

export default DashboardMobileHeader;