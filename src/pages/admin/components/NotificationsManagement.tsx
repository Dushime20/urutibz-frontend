import React, { useState } from 'react';
import { Bell, Mail, Smartphone, Clock, BarChart3, Settings, Send, Users, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import ChannelStatusWidget from '../../../features/notifications/components/ChannelStatusWidget';
import TemplatesManager from '../../../features/notifications/components/TemplatesManager';
import SendNotificationForm from '../../../features/notifications/components/SendNotificationForm';
import { useNotificationStatsQuery } from '../../../features/notifications/queries';
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';

interface NotificationsManagementProps {
  // Add props for notifications data as needed
}

const NotificationsManagement: React.FC<NotificationsManagementProps> = () => {
  const { tSync } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'system' | 'email' | 'push' | 'sms' | 'scheduled' | 'analytics'>('overview');
  const { data: statsData, isLoading: statsLoading } = useNotificationStatsQuery();

  const stats = (statsData?.data ?? statsData) as any;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900"><TranslatedText text="Notifications Management" /></h3>
      </div>

      {/* Tabs */}
      <div className="border-b border-emerald-100 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {[
            { id: 'overview', label: tSync('Overview'), icon: BarChart3 },
            { id: 'system', label: tSync('System'), icon: Bell },
            { id: 'email', label: tSync('Email'), icon: Mail },
            { id: 'push', label: tSync('Push'), icon: Smartphone },
            { id: 'sms', label: tSync('SMS'), icon: Send },
            { id: 'scheduled', label: tSync('Scheduled'), icon: Clock },
            { id: 'analytics', label: tSync('Analytics'), icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-emerald-200 hover:bg-emerald-50/30'
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
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Statistics inside Overview only */}
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl border border-emerald-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900"><TranslatedText text="Notification Statistics" /></h4>
                    <p className="text-sm text-gray-600"><TranslatedText text="Real-time overview of your notification system" /></p>
                  </div>
                </div>
                {statsLoading && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <TranslatedText text="Loading..." />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide"><TranslatedText text="Total" /></p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.total ?? 0}</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide"><TranslatedText text="Delivered" /></p>
                      <p className="text-2xl font-bold text-emerald-600">{stats?.delivered ?? 0}</p>
                    </div>
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide"><TranslatedText text="Pending" /></p>
                      <p className="text-2xl font-bold text-amber-600">{stats?.pending ?? 0}</p>
                    </div>
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide"><TranslatedText text="Failed" /></p>
                      <p className="text-2xl font-bold text-red-600">{stats?.failed ?? 0}</p>
                    </div>
                    <div className="p-2 bg-red-100 rounded-lg">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 text-emerald-600 mr-2" />
                    <TranslatedText text="By Type" />
                  </h5>
                  <div className="space-y-2">
                    {Object.entries(stats?.byType ?? {}).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700 capitalize">{k.replaceAll('_',' ')}</span>
                        <span className="text-sm font-semibold text-gray-900 bg-white px-2 py-1 rounded-full">{v as any}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Send className="w-4 h-4 text-blue-600 mr-2" />
                    <TranslatedText text="By Channel" />
                  </h5>
                  <div className="space-y-2">
                    {Object.entries(stats?.byChannel ?? {}).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700 uppercase">{k}</span>
                        <span className="text-sm font-semibold text-gray-900 bg-white px-2 py-1 rounded-full">{v as any}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Settings className="w-4 h-4 text-purple-600 mr-2" />
                    <TranslatedText text="By Priority" />
                  </h5>
                  <div className="space-y-2">
                    {Object.entries(stats?.byPriority ?? {}).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700 capitalize">{k}</span>
                        <span className="text-sm font-semibold text-gray-900 bg-white px-2 py-1 rounded-full">{v as any}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2"><TranslatedText text="Welcome to Notifications Hub" /></h3>
              <p className="text-gray-600 mb-4"><TranslatedText text="Manage all your notification channels from one central location" /></p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                  <Bell className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900"><TranslatedText text="System" /></p>
                  <p className="text-xs text-gray-500"><TranslatedText text="Core notifications" /></p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                  <Mail className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900"><TranslatedText text="Email" /></p>
                  <p className="text-xs text-gray-500"><TranslatedText text="Templates & campaigns" /></p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                  <Smartphone className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900"><TranslatedText text="Push" /></p>
                  <p className="text-xs text-gray-500"><TranslatedText text="Mobile notifications" /></p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                  <Send className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900"><TranslatedText text="SMS" /></p>
                  <p className="text-xs text-gray-500"><TranslatedText text="Text messages" /></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Bell className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900"><TranslatedText text="System Notifications" /></h3>
                  <p className="text-sm text-gray-600"><TranslatedText text="Manage system-generated notifications and alerts" /></p>
                </div>
              </div>
            </div>

            <ChannelStatusWidget />

            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <Send className="w-5 h-5 text-emerald-600 mr-2" />
                <TranslatedText text="Send Notification" />
              </h4>
              <SendNotificationForm />
            </div>
          </div>
        )}

        {/* Email Tab */}
        {activeTab === 'email' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Mail className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900"><TranslatedText text="Email Templates" /></h3>
                  <p className="text-sm text-gray-600"><TranslatedText text="Manage email notification templates for various scenarios" /></p>
                </div>
              </div>
            </div>

            <TemplatesManager />
          </div>
        )}

        {/* Push Tab */}
        {activeTab === 'push' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Smartphone className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900"><TranslatedText text="Push Notifications" /></h3>
                  <p className="text-sm text-gray-600"><TranslatedText text="Send instant push notifications to users' devices" /></p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-100">
              <div className="text-center">
                <Smartphone className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2"><TranslatedText text="Push Notifications" /></h4>
                <p className="text-gray-600 mb-4"><TranslatedText text="Send instant notifications to mobile devices and browsers" /></p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <h5 className="font-medium text-gray-900 mb-2"><TranslatedText text="Features" /></h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <TranslatedText text="Real-time delivery" /></li>
                      <li>• <TranslatedText text="Rich media support" /></li>
                      <li>• <TranslatedText text="Action buttons" /></li>
                      <li>• <TranslatedText text="Deep linking" /></li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <h5 className="font-medium text-gray-900 mb-2"><TranslatedText text="Coming Soon" /></h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <TranslatedText text="Campaign management" /></li>
                      <li>• <TranslatedText text="A/B testing" /></li>
                      <li>• <TranslatedText text="Analytics dashboard" /></li>
                      <li>• <TranslatedText text="User segmentation" /></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SMS Tab */}
        {activeTab === 'sms' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Send className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900"><TranslatedText text="SMS Notifications" /></h3>
                  <p className="text-sm text-gray-600"><TranslatedText text="Send text message notifications to users' phones" /></p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-100">
              <div className="text-center">
                <Send className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2"><TranslatedText text="SMS Gateway" /></h4>
                <p className="text-gray-600 mb-4"><TranslatedText text="Reliable text message delivery worldwide" /></p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-white p-4 rounded-lg border border-orange-100">
                    <h5 className="font-medium text-gray-900 mb-2"><TranslatedText text="Features" /></h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <TranslatedText text="Global coverage" /></li>
                      <li>• <TranslatedText text="Delivery reports" /></li>
                      <li>• <TranslatedText text="Bulk messaging" /></li>
                      <li>• <TranslatedText text="Two-way SMS" /></li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-orange-100">
                    <h5 className="font-medium text-gray-900 mb-2"><TranslatedText text="Coming Soon" /></h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <TranslatedText text="SMS templates" /></li>
                      <li>• <TranslatedText text="Scheduled SMS" /></li>
                      <li>• <TranslatedText text="Cost optimization" /></li>
                      <li>• <TranslatedText text="Compliance tools" /></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scheduled Tab */}
        {activeTab === 'scheduled' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900"><TranslatedText text="Scheduled Notifications" /></h3>
                  <p className="text-sm text-gray-600"><TranslatedText text="Manage notifications scheduled for future delivery" /></p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-100">
              <div className="text-center">
                <Clock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2"><TranslatedText text="Scheduled Campaigns" /></h4>
                <p className="text-gray-600 mb-4"><TranslatedText text="Plan and automate your notification campaigns" /></p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <h5 className="font-medium text-gray-900 mb-2"><TranslatedText text="Features" /></h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <TranslatedText text="Time-based scheduling" /></li>
                      <li>• <TranslatedText text="Recurring campaigns" /></li>
                      <li>• <TranslatedText text="Timezone support" /></li>
                      <li>• <TranslatedText text="Batch processing" /></li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <h5 className="font-medium text-gray-900 mb-2"><TranslatedText text="Coming Soon" /></h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <TranslatedText text="Calendar view" /></li>
                      <li>• <TranslatedText text="Smart scheduling" /></li>
                      <li>• <TranslatedText text="Campaign templates" /></li>
                      <li>• <TranslatedText text="Performance tracking" /></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900"><TranslatedText text="Analytics & Insights" /></h3>
                  <p className="text-sm text-gray-600"><TranslatedText text="Deep dive into notification performance and user engagement" /></p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-100">
              <div className="text-center">
                <TrendingUp className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2"><TranslatedText text="Advanced Analytics" /></h4>
                <p className="text-gray-600 mb-4"><TranslatedText text="Comprehensive insights to optimize your notification strategy" /></p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <h5 className="font-medium text-gray-900 mb-2"><TranslatedText text="Metrics" /></h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <TranslatedText text="Delivery rates" /></li>
                      <li>• <TranslatedText text="Open rates" /></li>
                      <li>• <TranslatedText text="Click-through rates" /></li>
                      <li>• <TranslatedText text="Conversion tracking" /></li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <h5 className="font-medium text-gray-900 mb-2"><TranslatedText text="Coming Soon" /></h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• <TranslatedText text="Real-time dashboards" /></li>
                      <li>• <TranslatedText text="Custom reports" /></li>
                      <li>• <TranslatedText text="Predictive analytics" /></li>
                      <li>• <TranslatedText text="ROI tracking" /></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsManagement;
