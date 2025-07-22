import React, { useState, useEffect, useContext } from 'react';
import { 
  LayoutGrid, 
  Users, 
  Package, 
  ShoppingCart, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Moon,
  Sun,
  Globe,
  CreditCard,
  FileText,
  Bell,
  MessageSquare,
  Languages
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../../context/AuthContext';
import type { AuthContextType } from '../../../context/AuthContext';
import { ToastContext } from '../../../contexts/ToastContext';
import type { ToastContextType } from '../../../contexts/ToastContext';

interface AdminNavigationItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
  hasNotification?: boolean;
}

interface AdminSidebarProps {
  activeTab: 'overview' | 'items' | 'users' | 'bookings' | 'finances' | 'transactions' | 'categories' | 'countries' | 'paymentMethods' | 'reports' | 'settings' | 'locations' | 'languages' | 'messaging' | 'notifications';
  setActiveTab: (tab: 'overview' | 'items' | 'users' | 'bookings' | 'finances' | 'transactions' | 'categories' | 'countries' | 'paymentMethods' | 'reports' | 'settings' | 'locations' | 'languages' | 'messaging' | 'notifications') => void;
  AdminNavigationItem: React.FC<AdminNavigationItemProps>;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  AdminNavigationItem 
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext<AuthContextType>(AuthContext);
  const { showToast } = useContext<ToastContextType>(ToastContext);

  useEffect(() => {
    // Check and apply dark mode from local storage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    
    // Apply dark mode to document
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Apply to document
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to local storage
    localStorage.setItem('darkMode', newMode.toString());

    // Show toast notification
    showToast(`Switched to ${newMode ? 'dark' : 'light'} mode`, 'info');
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    navigate('/login');
  };

  const navigationItems = [
    { 
      icon: LayoutGrid, 
      label: 'Overview', 
      tab: 'overview' as const,
      hasNotification: false
    },
    { 
      icon: Package, 
      label: 'Items', 
      tab: 'items' as const,
      hasNotification: false
    },
    { 
      icon: Users, 
      label: 'Users', 
      tab: 'users' as const,
      hasNotification: false
    },
    { 
      icon: ShoppingCart, 
      label: 'Bookings', 
      tab: 'bookings' as const,
      hasNotification: false
    },
    { 
      icon: CreditCard, 
      label: 'Transactions', 
      tab: 'transactions' as const,
      hasNotification: false
    },
    { 
      icon: FileText, 
      label: 'Categories', 
      tab: 'categories' as const,
      hasNotification: false
    },
    { 
      icon: Globe, 
      label: 'Countries', 
      tab: 'countries' as const,
      hasNotification: false
    },
    { 
      icon: CreditCard, 
      label: 'Payment Methods', 
      tab: 'paymentMethods' as const,
      hasNotification: false
    },
    { 
      icon: FileText, 
      label: 'Reports', 
      tab: 'reports' as const,
      hasNotification: false
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      tab: 'settings' as const,
      hasNotification: false
    },
    { 
      icon: Globe, 
      label: 'Locations', 
      tab: 'locations' as const,
      hasNotification: false
    },
    { 
      icon: Languages, 
      label: 'Languages', 
      tab: 'languages' as const,
      hasNotification: false
    },
    { 
      icon: MessageSquare, 
      label: 'Messaging', 
      tab: 'messaging' as const,
      hasNotification: false
    },
    { 
      icon: Bell, 
      label: 'Notifications', 
      tab: 'notifications' as const,
      hasNotification: false
    }
  ];

  return (
    <div 
      className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 
        shadow-sm border-r border-gray-100 dark:border-gray-800 
        z-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 
        dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 
        dark:scrollbar-track-gray-800 scrollbar-thumb-rounded-full
        scrollbar-track-rounded-full pt-16"
    >
      {/* Navigation */}
      <nav className="space-y-2 px-4 pt-4">
        {navigationItems.map((item) => (
          <AdminNavigationItem 
            key={item.tab}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.tab}
            onClick={() => setActiveTab(item.tab)}
            hasNotification={item.hasNotification}
          />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-6 px-4">
        {/* Dark Mode Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="w-full flex items-center px-4 py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 mr-3 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 mr-3 text-gray-600" />
          )}
          <span className="flex-1">
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors mt-2"
        >
          <LogOut className="w-5 h-5 mr-3 text-red-500" />
          <span className="flex-1">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar; 