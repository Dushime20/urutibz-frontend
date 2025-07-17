import React from 'react';
import { Users, Package, Calendar, DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react';

interface AdminStatCardsProps {
  adminStats: {
    totalUsers: number;
    totalItems: number;
    activeBookings: number;
    totalRevenue: number;
    monthlyGrowth: {
      users: number;
      items: number;
      bookings: number;
      revenue: number;
    };
  };
}

const AdminStatCards: React.FC<AdminStatCardsProps> = ({ adminStats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <div className="group relative bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-2xl bg-blue-50">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex items-center text-sm font-medium text-emerald-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +{adminStats.monthlyGrowth.users}%
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-gray-900">{adminStats.totalUsers.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Total Users</div>
          <div className="flex items-center text-xs text-blue-600 font-medium">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            View all users
          </div>
        </div>
      </div>
    </div>
    <div className="group relative bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-2xl bg-emerald-50">
            <Package className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex items-center text-sm font-medium text-emerald-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +{adminStats.monthlyGrowth.items}%
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-gray-900">{adminStats.totalItems}</div>
          <div className="text-sm text-gray-500">Total Items</div>
          <div className="flex items-center text-xs text-blue-600 font-medium">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            Manage inventory
          </div>
        </div>
      </div>
    </div>
    <div className="group relative bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-2xl bg-purple-50">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex items-center text-sm font-medium text-emerald-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +{adminStats.monthlyGrowth.bookings}%
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-gray-900">{adminStats.activeBookings}</div>
          <div className="text-sm text-gray-500">Active Bookings</div>
          <div className="flex items-center text-xs text-blue-600 font-medium">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            In progress
          </div>
        </div>
      </div>
    </div>
    <div className="group relative bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-2xl bg-orange-50">
            <DollarSign className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex items-center text-sm font-medium text-emerald-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +{adminStats.monthlyGrowth.revenue}%
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-gray-900">${adminStats.totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-gray-500">Monthly Revenue</div>
          <div className="flex items-center text-xs text-blue-600 font-medium">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            This month
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default AdminStatCards; 