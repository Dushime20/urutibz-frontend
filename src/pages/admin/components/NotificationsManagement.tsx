import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Filter, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Send, 
  Clock,
  Mail,
  Smartphone,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  TrendingUp,
  Users,
  Calendar,
  Settings,
  RefreshCw
} from 'lucide-react';

interface NotificationsManagementProps {
  // Add props for notifications data as needed
}

const NotificationsManagement: React.FC<NotificationsManagementProps> = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'system' | 'push' | 'email' | 'scheduled'>('overview');

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Notifications Management</h3>
        <div className="flex items-center space-x-3">
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark All Read
          </button>
          <button className="bg-my-primary hover:bg-my-primary/80 text-white px-4 py-2 rounded-xl transition-colors flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Send Push
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'system', label: 'System', icon: Bell },
            { id: 'push', label: 'Push', icon: Smartphone },
            { id: 'email', label: 'Email', icon: Mail },
            { id: 'scheduled', label: 'Scheduled', icon: Clock }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-my-primary text-my-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                    <p className="text-2xl font-bold text-gray-900">1,234</p>
                  </div>
                  <div className="p-3 bg-my-primary/10 rounded-full">
                    <Bell className="w-6 h-6 text-my-primary" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-gray-900">98.5%</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Delivery Time</p>
                    <p className="text-2xl font-bold text-gray-900">2.3s</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today</p>
                    <p className="text-2xl font-bold text-gray-900">156</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Channel Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Channel Distribution</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Push</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-my-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">65%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-my-primary h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">25%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">SMS</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-my-primary h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">10%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">System</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-my-primary h-2 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">40%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Booking</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-my-primary h-2 rounded-full" style={{ width: '35%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">35%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Support</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-my-primary h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">25%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Notifications</h3>
              <p className="text-sm text-gray-600">Manage system-generated notifications and alerts</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="font-medium text-gray-900 mb-4">Recent System Notifications</h4>
              <p className="text-gray-500 text-sm">System notifications will be displayed here once implemented.</p>
            </div>
          </div>
        )}

        {activeTab === 'push' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Push Notifications</h3>
              <p className="text-sm text-gray-600">Send instant push notifications to users' devices</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="font-medium text-gray-900 mb-4">Recent Push Notifications</h4>
              <p className="text-gray-500 text-sm">Push notification history will be displayed here once implemented.</p>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Email Templates</h3>
              <p className="text-sm text-gray-600">Manage email notification templates for various scenarios</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="font-medium text-gray-900 mb-4">Email Templates</h4>
              <p className="text-gray-500 text-sm">Email templates will be displayed here once implemented.</p>
            </div>
          </div>
        )}

        {activeTab === 'scheduled' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Scheduled Notifications</h3>
              <p className="text-sm text-gray-600">Manage notifications scheduled for future delivery</p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="font-medium text-gray-900 mb-4">Scheduled Notifications</h4>
              <p className="text-gray-500 text-sm">Scheduled notifications will be displayed here once implemented.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsManagement;
