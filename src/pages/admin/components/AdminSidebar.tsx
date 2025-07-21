import React from 'react';
import { BarChart3, Package, Users, Calendar, DollarSign, FileText, Globe, Languages, MessageSquare, Bell, Settings, CreditCard } from 'lucide-react';
import type { AdminStats } from '../service/api';

// Define the TabType union to match AdminDashboardPage
export type TabType = "overview" | "items" | "users" | "bookings" | "finances" | "transactions" | "reports" | "settings" | "locations" | "languages" | "messaging" | "notifications";

interface AdminSidebarProps {
  adminStats: AdminStats;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  AdminNavigationItem: React.FC<any>;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ adminStats, activeTab, setActiveTab, AdminNavigationItem }) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24 overflow-y-auto max-h-[80vh]">
    {/* Quick Stats */}
    <div className="mb-8 p-4 bg-gradient-to-r from-my-primary/10 to-indigo-50 rounded-2xl">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Overview</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Users</span>
          <span className="font-semibold">{adminStats.totalUsers.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Active Items</span>
          <span className="font-semibold">{adminStats.totalItems}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Live Bookings</span>
          <span className="font-semibold">{adminStats.activeBookings}</span>
        </div>
      </div>
    </div>

    {/* Navigation */}
    <nav className="space-y-2">
      <AdminNavigationItem
        icon={BarChart3}
        label="Overview"
        active={activeTab === 'overview'}
        onClick={() => setActiveTab('overview')}
      />
      <AdminNavigationItem
        icon={Package}
        label="Items"
        active={activeTab === 'items'}
        onClick={() => setActiveTab('items')}
      />
      <AdminNavigationItem
        icon={Users}
        label="Users"
        active={activeTab === 'users'}
        onClick={() => setActiveTab('users')}
      />
      <AdminNavigationItem
        icon={Calendar}
        label="Bookings"
        active={activeTab === 'bookings'}
        onClick={() => setActiveTab('bookings')}
      />
      <AdminNavigationItem
        icon={CreditCard}
        label="Transactions"
        active={activeTab === 'transactions'}
        onClick={() => setActiveTab('transactions')}
      />
      <AdminNavigationItem
        icon={DollarSign}
        label="Finances"
        active={activeTab === 'finances'}
        onClick={() => setActiveTab('finances')}
      />
      <AdminNavigationItem
        icon={FileText}
        label="Reports"
        active={activeTab === 'reports'}
        onClick={() => setActiveTab('reports')}
      />
      <AdminNavigationItem
        icon={Globe}
        label="Locations"
        active={activeTab === 'locations'}
        onClick={() => setActiveTab('locations')}
      />
      <AdminNavigationItem
        icon={Languages}
        label="Languages"
        active={activeTab === 'languages'}
        onClick={() => setActiveTab('languages')}
      />
      <AdminNavigationItem
        icon={MessageSquare}
        label="Messaging"
        active={activeTab === 'messaging'}
        onClick={() => setActiveTab('messaging')}
      />
      <AdminNavigationItem
        icon={Bell}
        label="Notifications"
        active={activeTab === 'notifications'}
        onClick={() => setActiveTab('notifications')}
      />
      <div className="border-t border-gray-100 pt-4 mt-6">
        <AdminNavigationItem
          icon={Settings}
          label="Settings"
          active={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
        />
      </div>
    </nav>
  </div>
);

export default AdminSidebar; 