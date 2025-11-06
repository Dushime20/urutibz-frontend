import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/DesignSystem';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import UserManagement from './components/UserManagement';

interface AdminNavigationItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
  hasNotification?: boolean;
}

const AdminUsersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'users' | 'bookings' | 'finances' | 'transactions' | 'categories' | 'countries' | 'paymentMethods' | 'paymentProviders' | 'insuranceProviders' | 'categoryRegulations' | 'pricing' | 'reports' | 'profile' | 'locations' | 'languages' | 'messaging' | 'notifications' | 'administrativeDivisions' | 'moderation' | 'ai-analytics' | 'inspections' | 'risk-management' | 'handover-return' | 'admin-settings'>('users');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Handle tab navigation
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    if (tab !== 'users') {
      navigate('/admin');
    }
  };

  // AdminNavigationItem component - exact copy from AdminDashboardPage
  const AdminNavigationItem: React.FC<AdminNavigationItemProps> = ({ 
    icon: Icon, 
    label, 
    active, 
    onClick, 
    hasNotification 
  }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
        active 
          ? 'bg-[#01aaa7] text-white shadow-sm' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
      <span className="font-medium">{label}</span>
      {hasNotification && (
        <div className="ml-auto w-2 h-2 bg-red-500 rounded-full"></div>
      )}
    </button>
  );

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar - Fixed width for large screens, mobile menu for small screens */}
        <div className="xl:block xl:w-64 xl:flex-shrink-0">
          <AdminSidebar 
            activeTab={activeTab} 
            setActiveTab={handleTabChange} 
            AdminNavigationItem={AdminNavigationItem}
            isMobileMenuOpen={isMobileMenuOpen}
            onMobileMenuClose={handleMenuClose}
          />
        </div>
        
        {/* Main Content - Takes remaining space */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <AdminHeader 
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            onMenuToggle={handleMenuToggle}
          />
          
          {/* Content with proper spacing */}
          <main className="flex-1 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
              {/* User Management Component - exact same as users tab */}
              <UserManagement Button={Button} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;