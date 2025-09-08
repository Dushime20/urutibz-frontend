// My Account Sidebar Component
// Following the same patterns as AdminSidebar.tsx

import React from 'react';
import { 
  BarChart3, 
  Calendar, 
  Car, 
  Wallet, 
  Shield, 
  BookOpen, 
  Settings, 
  MessageCircle, 
  TrendingUp, 
  ArrowRightLeft,
  User
} from 'lucide-react';

interface MyAccountSidebarProps {
  activeTab: 'overview' | 'bookings' | 'listings' | 'wallet' | 'inspections' | 'reviews' | 'messages' | 'settings' | 'risk-assessment' | 'handover-return';
  setActiveTab: (tab: 'overview' | 'bookings' | 'listings' | 'wallet' | 'inspections' | 'reviews' | 'messages' | 'settings' | 'risk-assessment' | 'handover-return') => void;
  className?: string;
}

const MyAccountSidebar: React.FC<MyAccountSidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  className = '' 
}) => {
  const navigationItems = [
    { icon: BarChart3, label: 'Overview', tab: 'overview' },
    { icon: Calendar, label: 'Bookings', tab: 'bookings' },
    { icon: Car, label: 'Listings', tab: 'listings' },
    { icon: Wallet, label: 'Wallet', tab: 'wallet' },
    { icon: Shield, label: 'Inspections', tab: 'inspections' },
    { icon: TrendingUp, label: 'Risk Assessment', tab: 'risk-assessment' },
    { icon: ArrowRightLeft, label: 'Handover & Return', tab: 'handover-return' },
    { icon: BookOpen, label: 'Reviews', tab: 'reviews' },
    { icon: MessageCircle, label: 'Messages', tab: 'messages' },
    { icon: Settings, label: 'Settings', tab: 'settings' },
  ];

  return (
    <div className={`w-64 bg-white border-r border-gray-200 h-full ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">My Account</h2>
            <p className="text-sm text-gray-500">Manage your account</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab as any)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                isActive
                  ? 'bg-teal-50 text-teal-700 border border-teal-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? 'text-teal-600' : 'text-gray-400'
                }`}
              />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      {/* <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          © 2025 Urutibz Platform
        </div>
      </div> */}
    </div>
  );
};

export default MyAccountSidebar;
