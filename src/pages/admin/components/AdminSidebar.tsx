import React, { useState, useEffect, useContext } from 'react';
import { 
  LayoutGrid, 
  Users, 
  Package, 
  ShoppingCart, 
  Settings, 
  LogOut, 
  Moon,
  Sun,
  Globe,
  CreditCard,
  FileText,
  Bell,
  MessageSquare,
  Languages,
  DollarSign,
  ChevronDown,
  Shield,
  Brain,
  Activity,
  ArrowRightLeft,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  activeTab: 'overview' | 'items' | 'users' | 'bookings' | 'finances' | 'transactions' | 'categories' | 'countries' | 'paymentMethods' | 'paymentProviders' | 'insuranceProviders' | 'categoryRegulations' | 'administrativeDivisions' | 'pricing' | 'reports' | 'admin-settings' | 'profile' | 'locations' | 'languages' | 'messaging' | 'notifications' | 'moderation' | 'ai-analytics' | 'inspections' | 'risk-management' | 'handover-return';
  setActiveTab: (tab: 'overview' | 'items' | 'users' | 'bookings' | 'finances' | 'transactions' | 'categories' | 'countries' | 'paymentMethods' | 'paymentProviders' | 'insuranceProviders' | 'categoryRegulations' | 'administrativeDivisions' | 'pricing' | 'reports' | 'admin-settings' | 'profile' | 'locations' | 'languages' | 'messaging' | 'notifications' | 'moderation' | 'ai-analytics' | 'inspections' | 'risk-management' | 'handover-return') => void;
  AdminNavigationItem: React.FC<AdminNavigationItemProps>;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  AdminNavigationItem 
}) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const navigate = useNavigate();
  const { logout } = useContext<AuthContextType>(AuthContext);
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

  // Collapsible grouped navigation
  const groups: Array<{
    key: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    items: Array<{
      icon: React.ComponentType<{ className?: string }>;
      label: string;
      tab: AdminSidebarProps['activeTab'];
      hasNotification?: boolean;
    }>;
  }> = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: LayoutGrid,
      items: [
        { icon: LayoutGrid, label: 'Overview', tab: 'overview' }
      ]
    },
    {
      key: 'management',
      label: 'Management',
      icon: Package,
      items: [
        { icon: Package, label: 'Items', tab: 'items' },
        { icon: Users, label: 'Users', tab: 'users' },
        { icon: ShoppingCart, label: 'Bookings', tab: 'bookings' },
        { icon: Activity, label: 'Inspections', tab: 'inspections' },
        { icon: Shield, label: 'Risk Management', tab: 'risk-management' },
        { icon: ArrowRightLeft, label: 'Handover & Return', tab: 'handover-return' },
        { icon: FileText, label: 'Categories', tab: 'categories' },
        { icon: Globe, label: 'Countries', tab: 'countries' },
        { icon: CreditCard, label: 'Payment Methods', tab: 'paymentMethods' },
        { icon: CreditCard, label: 'Payment Providers', tab: 'paymentProviders' },
        { icon: CreditCard, label: 'Insurance Providers', tab: 'insuranceProviders' },
        { icon: FileText, label: 'Category Regulations', tab: 'categoryRegulations' },
        { icon: DollarSign, label: 'Pricing', tab: 'pricing' },
        { icon: FileText, label: 'Administrative Divisions', tab: 'administrativeDivisions' }
      ]
    },
    {
      key: 'finance',
      label: 'Finance',
      icon: CreditCard,
      items: [
        { icon: CreditCard, label: 'Transactions', tab: 'transactions' }
      ]
    },
    {
      key: 'reports',
      label: 'Reports',
      icon: FileText,
      items: [
        { icon: FileText, label: 'Reports', tab: 'reports' },
        { icon: Brain, label: 'AI Analytics', tab: 'ai-analytics' }
      ]
    },
    {
      key: 'moderation',
      label: 'Moderation',
      icon: Shield,
      items: [
        { icon: Shield, label: 'Moderation Dashboard', tab: 'moderation' }
      ]
    },
    {
      key: 'system',
      label: 'System',
      icon: Settings,
      items: [
        { icon: User, label: 'Profile', tab: 'profile' },
        { icon: Settings, label: 'Admin Settings', tab: 'admin-settings' },
        { icon: Globe, label: 'Locations', tab: 'locations' },
        { icon: Languages, label: 'Languages', tab: 'languages' }
      ]
    },
    {
      key: 'communication',
      label: 'Communication',
      icon: MessageSquare,
      items: [
        { icon: MessageSquare, label: 'Messaging', tab: 'messaging' },
        { icon: Bell, label: 'Notifications', tab: 'notifications' }
      ]
    }
  ];

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    management: true,
    finance: false,
    reports: false,
    moderation: false,
    system: false,
    communication: false
  });

  const toggleGroup = (key: string) => {
    setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div 
      className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-900 
        shadow-sm border-r border-gray-100 dark:border-gray-800 
        z-40 overflow-y-auto scrollbar-hide pt-16"
    >
      {/* Navigation */}
      <nav className="space-y-2 px-4 pt-4">
        {groups.map(group => (
          <div key={group.key} className="mb-2">
            <button
              onClick={() => toggleGroup(group.key)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center">
                <group.icon className="w-5 h-5 mr-3 text-gray-600" />
                <span className="font-medium text-gray-800 dark:text-gray-200">{group.label}</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openGroups[group.key] ? 'rotate-180' : ''}`} />
            </button>
            {openGroups[group.key] && (
              <div className="mt-1 pl-2 space-y-1">
                {group.items.map(item => (
                  <AdminNavigationItem
                    key={item.tab}
                    icon={item.icon}
                    label={item.label}
                    active={activeTab === item.tab}
                    onClick={() => setActiveTab(item.tab)}
                    hasNotification={item.hasNotification}
                  />
                ))}
              </div>
            )}
          </div>
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