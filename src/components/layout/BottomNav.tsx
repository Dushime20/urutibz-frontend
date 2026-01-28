import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Search, 
  ShoppingCart, 
  User, 
  Menu,
  X,
  Heart,
  PlusCircle,
  Clock,
  Headphones,
  Settings,
  LogOut,
  Star,
  Package,
  Bell,
  Globe,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { TranslatedText } from '../translated-text';
import { LanguageSwitcher } from '../language-switcher';
import LoginSignupModal from '../auth/LoginSignupModal';
import CartDrawer from '../cart/CartDrawer';
import { useToast } from '../../contexts/ToastContext';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { cartItems } = useCart();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { showToast } = useToast();
  
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  const cartItemCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setShowProfileMenu(true);
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setShowCartDrawer(true);
  };

  const roleDestination = user?.role === 'admin' 
    ? '/admin' 
    : user?.role === 'inspector' 
    ? '/inspector' 
    : user?.role === 'moderator' 
    ? '/moderator' 
    : '/dashboard';

  const profileMenuItems = [
    // Dashboard link based on user role
    { 
      icon: User, 
      label: user?.role === 'admin' ? 'Admin Dashboard' : 'Customer Dashboard', 
      path: roleDestination 
    },
    { icon: Package, label: 'Marketplace', path: '/items' },
    { icon: PlusCircle, label: 'Enterprise', path: '/enterprise' },
    { icon: Headphones, label: 'Support', path: '/support' },
    { icon: Star, label: 'Rent on UrutiBz', path: '/create-listing' },
  ];

  return (
    <>
      {/* Bottom Navigation - Only visible on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 shadow-lg">
        <div className="grid grid-cols-4 h-16">
          {/* Home */}
          <Link
            to="/"
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              isActive('/') 
                ? 'text-teal-600 dark:text-teal-400' 
                : 'text-gray-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs font-medium">
              <TranslatedText text="Home" />
            </span>
          </Link>

          {/* Market/Items */}
          <Link
            to="/items"
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              isActive('/items') 
                ? 'text-teal-600 dark:text-teal-400' 
                : 'text-gray-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400'
            }`}
          >
            <Search className="w-5 h-5" />
            <span className="text-xs font-medium">
              <TranslatedText text="Market" />
            </span>
          </Link>

          {/* Cart */}
          <button
            onClick={handleCartClick}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors relative ${
              isActive('/cart') 
                ? 'text-teal-600 dark:text-teal-400' 
                : 'text-gray-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400'
            }`}
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">
              <TranslatedText text="Shopping Cart" />
            </span>
          </button>

          {/* Profile/Menu */}
          <button
            onClick={handleProfileClick}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              showProfileMenu || isActive('/dashboard') || isActive('/admin') || isActive('/inspector') || isActive('/moderator')
                ? 'text-teal-600 dark:text-teal-400' 
                : 'text-gray-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400'
            }`}
          >
            {isAuthenticated ? (
              user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-5 h-5 rounded-full object-cover" 
                />
              ) : (
                <User className="w-5 h-5" />
              )
            ) : (
              <User className="w-5 h-5" />
            )}
            <span className="text-xs font-medium">
              <TranslatedText text={isAuthenticated ? "My Account" : "Login"} />
            </span>
          </button>
        </div>
      </div>

      {/* Profile Menu Modal - Alibaba Style */}
      <AnimatePresence>
        {showProfileMenu && (
          <div className="md:hidden fixed inset-0 z-[60]">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowProfileMenu(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-6 py-4 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-12 h-12 rounded-full object-cover" 
                      />
                    ) : (
                      <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        <TranslatedText text="My Account" />
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        {user?.name || user?.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowProfileMenu(false)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Menu Items */}
              <div className="px-6 py-4 space-y-2">
                {profileMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Icon className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        <TranslatedText text={item.label} />
                      </span>
                    </Link>
                  );
                })}

                {/* Settings Section */}
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center space-x-3">
                      {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      <span className="font-medium text-gray-900 dark:text-white">
                        <TranslatedText text="Dark Mode" />
                      </span>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isDarkMode ? 'bg-teal-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isDarkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        <TranslatedText text="Language" />
                      </span>
                    </div>
                    <div className="mt-2 ml-8">
                      <LanguageSwitcher 
                        buttonClassName="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-teal-600 rounded-lg border border-gray-200 dark:border-gray-700"
                        showFlag={true}
                        showNativeName={true}
                      />
                    </div>
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                    showToast('Logged out successfully', 'success');
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">
                    <TranslatedText text="Sign Out" />
                  </span>
                </button>
              </div>

              {/* Bottom Padding for safe area */}
              <div className="h-6"></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={showCartDrawer} 
        onClose={() => setShowCartDrawer(false)} 
      />

      {/* Login Modal */}
      <LoginSignupModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          showToast('Welcome! You can now access all features.', 'success');
        }}
      />
    </>
  );
};

export default BottomNav;