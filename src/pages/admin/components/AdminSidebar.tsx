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
  User,
  X,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import type { AuthContextType } from '../../../context/AuthContext';
import { ToastContext } from '../../../contexts/ToastContext';
import type { ToastContextType } from '../../../contexts/ToastContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';

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
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  AdminNavigationItem,
  isMobileMenuOpen = false,
  onMobileMenuClose
}) => {
  const navigate = useNavigate();
  const { logout } = useContext<AuthContextType>(AuthContext);
  const { showToast } = useContext<ToastContextType>(ToastContext);
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Close mobile menu when a navigation item is clicked
  const handleNavClick = (tab: AdminSidebarProps['activeTab']) => {
    setActiveTab(tab);
    if (onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  const handleToggleDarkMode = () => {
    toggleDarkMode();
    showToast(`Switched to ${!isDarkMode ? 'dark' : 'light'} mode`, 'info');
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

  const [isCollapsed, setIsCollapsed] = useState(false);
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
    if (!isCollapsed) {
      setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 xl:hidden"
          onClick={onMobileMenuClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`
          ${isCollapsed ? 'w-16' : 'w-72'} bg-white dark:bg-gray-900 
          shadow-sm border-r border-gray-100 dark:border-gray-800 
          h-full overflow-y-auto scrollbar-hide
          flex flex-col
          transition-all duration-300
          relative
        `}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 z-10 w-6 h-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600 dark:text-slate-300" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-slate-300" />
          )}
        </button>

        {/* Header */}
        <div className={`p-6 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 flex-shrink-0 ${isCollapsed ? 'px-3' : ''}`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              {isCollapsed ? (
                <Menu className="w-5 h-5 text-white" />
              ) : (
                <Shield className="w-6 h-6 text-white" />
              )}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">Admin Panel</h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate">Dashboard</p>
              </div>
            )}
          </div>
          {(onClose || onMobileMenuClose) && !isCollapsed && (
            <button
              className="xl:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
              onClick={onClose || onMobileMenuClose}
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Navigation */}
        <nav className={`space-y-2 px-4 pt-4 ${isCollapsed ? 'px-2' : ''}`}>
        {groups.map(group => (
          <div key={group.key} className="mb-2">
            {!isCollapsed ? (
              <>
                <button
                  onClick={() => toggleGroup(group.key)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center">
                    <group.icon className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
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
                        onClick={() => handleNavClick(item.tab)}
                        hasNotification={item.hasNotification}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-1">
                {group.items.map(item => {
                  const isActive = activeTab === item.tab;
                  return (
                    <button
                      key={item.tab}
                      onClick={() => handleNavClick(item.tab)}
                      title={item.label}
                      className={`w-full flex items-center justify-center px-3 py-2 rounded-lg transition-colors duration-200 group relative ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 ${
                        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-slate-500'
                      }`} />
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-slate-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className={`border-t border-gray-100 dark:border-gray-800 pt-4 mt-6 px-4 flex-shrink-0 ${isCollapsed ? 'px-2' : ''}`}>
        {/* Dark Mode Toggle */}
        <button 
          onClick={handleToggleDarkMode}
          title={isCollapsed ? (isDarkMode ? 'Light Mode' : 'Dark Mode') : ''}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-2 rounded-lg text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group relative`}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
          {!isCollapsed && (
            <span className="flex-1 ml-3">
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-slate-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </div>
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : ''}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'px-4'} py-2 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors mt-2 group relative`}
        >
          <LogOut className="w-5 h-5 text-red-500" />
          {!isCollapsed && (
            <span className="flex-1 ml-3">Logout</span>
          )}
          {isCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-slate-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </div>
    </>
  );
};

export default AdminSidebar; 