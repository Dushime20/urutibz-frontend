// My Account Sidebar Component
// Collapsible sidebar with toggle functionality

import React, { useState, useEffect } from 'react';
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
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  Bell,
  LogOut,
  Package
} from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';
import { useMessaging } from '../../../hooks/useMessaging';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

interface MyAccountSidebarProps {
  activeTab: 'overview' | 'bookings' | 'listings' | 'wallet' | 'inspections' | 'reviews' | 'messages' | 'settings' | 'risk-assessment' | 'handover-return' | 'profile' | 'notifications';
  setActiveTab: (tab: 'overview' | 'bookings' | 'listings' | 'wallet' | 'inspections' | 'reviews' | 'messages' | 'settings' | 'risk-assessment' | 'handover-return' | 'profile' | 'notifications') => void;
  className?: string;
  onNavigate?: () => void; // Callback to close sidebar on mobile when navigating
  isCollapsed?: boolean;
  toggleCollapse?: () => void;
}

const MyAccountSidebar: React.FC<MyAccountSidebarProps> = ({
  activeTab,
  setActiveTab,
  className = '',
  onNavigate,
  isCollapsed: controlledCollapsed,
  toggleCollapse
}) => {
  const { tSync } = useTranslation();
  const isCollapsed = controlledCollapsed ?? false;
  const { unreadCount, loadUnreadCount } = useMessaging();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load unread count on mount
  useEffect(() => {
    loadUnreadCount();
  }, [loadUnreadCount]);
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
    { icon: Bell, label: 'Notifications', tab: 'notifications' },
    { icon: User, label: 'Profile', tab: 'profile' },
    { icon: Settings, label: 'Settings', tab: 'settings' },
  ];

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 h-full dark:bg-slate-900 dark:border-slate-700 transition-all duration-300 relative flex flex-col mt-0 ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => toggleCollapse?.()}
        className="hidden md:flex absolute -right-3 top-6 z-10 w-6 h-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md items-center justify-center shadow-md hover:shadow-lg transition-shadow"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-black dark:text-slate-300" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-black dark:text-slate-300" />
        )}
      </button>

      {/* Header - Fixed */}
      <div className={`p-4 md:p-6 mt-0 border-b border-gray-200 dark:border-slate-700 flex-shrink-0 ${isCollapsed ? 'px-3' : ''}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center dark:bg-teal-900/30 flex-shrink-0">
            {isCollapsed ? (
              <Menu className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            ) : (
              <User className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            )}
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 truncate"><TranslatedText text="My Account" /></h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 truncate"><TranslatedText text="Manage your account" /></p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className={`p-4 mb-10 space-y-2 flex-1 overflow-y-auto overscroll-contain scrollbar-hide min-h-0 ${isCollapsed ? 'px-2' : ''}`}>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;

          return (<>

            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab as any)}
              title={isCollapsed ? tSync(item.label) : ''}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-lg text-left transition-colors duration-200 group ${isActive
                ? 'bg-teal-50 text-teal-700 border border-teal-200 dark:bg-teal-900/20 dark:text-teal-400 dark:border-teal-800'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-gray-400 dark:text-slate-500'
                  }`}
              />
              {!isCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium dark:text-slate-200 truncate"><TranslatedText text={item.label} /></span>
                  {item.tab === 'messages' && unreadCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full min-w-[20px] text-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-slate-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  <TranslatedText text={item.label} />
                  {item.tab === 'messages' && unreadCount > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold text-white bg-red-500 rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
              )}
              {isCollapsed && item.tab === 'messages' && unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

          </>


          );
        })}

        {/* Footer - Browse Items and Logout (especially visible on mobile) */}
        <div className={`flex-shrink-0 p-4  border-t border-gray-200 dark:border-slate-700 space-y-2 ${isCollapsed ? 'px-2' : ''}`}>
          {/* Browse Items Link */}
          <button
            onClick={() => {
              navigate('/items');
              if (isMobile && onNavigate) {
                // Close sidebar on mobile after navigation
                onNavigate();
              }
            }}
            title={isCollapsed ? tSync('Browse Items') : ''}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-lg text-left transition-colors duration-200 group text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200`}
          >
            <Package
              className="w-5 h-5 flex-shrink-0 text-gray-400 dark:text-slate-500"
            />
            {!isCollapsed && (
              <span className="font-medium dark:text-slate-200 truncate">
                <TranslatedText text="Browse Items" />
              </span>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-slate-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                <TranslatedText text="Browse Items" />
              </div>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            title={isCollapsed ? tSync('Logout') : ''}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-2 rounded-lg text-left transition-colors duration-200 group text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300`}
          >
            <LogOut
              className="w-5 h-5 flex-shrink-0 text-red-500 dark:text-red-400"
            />
            {!isCollapsed && (
              <span className="font-medium truncate">
                <TranslatedText text="Logout" />
              </span>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-slate-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                <TranslatedText text="Logout" />
              </div>
            )}
          </button>
        </div>
      </nav>


    </div>
  );
};

export default MyAccountSidebar;
