import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Play, 
  Pause, 
  RefreshCw, 
  BarChart3, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  Send,
  Eye,
  Filter
} from 'lucide-react';
import { Button } from '../../../components/ui/DesignSystem';
import { useToast } from '../../../contexts/ToastContext';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface ReminderConfiguration {
  id: string;
  name: string;
  hours_before: number;
  enabled: boolean;
  email_template: string;
  sms_template: string;
  in_app_template: string;
  created_at: string;
  updated_at: string;
}

interface ReminderStats {
  total_reminders: number;
  recent_reminders: number;
  failed_reminders: number;
  upcoming_reminders: number;
}

interface ReminderLog {
  id: string;
  booking_id: string;
  booking_number: string;
  product_name: string;
  first_name: string;
  last_name: string;
  email: string;
  reminder_type: string;
  channel: string;
  status: string;
  scheduled_at: string;
  sent_at?: string;
  recipient?: string;
  error_message?: string;
  created_at: string;
}

interface CronStatus {
  isActive: boolean;
  isRunning: boolean;
  schedule: string;
  nextRuns: string[];
}

const RentalRemindersManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'configurations' | 'logs' | 'settings'>('overview');
  const [configurations, setConfigurations] = useState<ReminderConfiguration[]>([]);
  const [stats, setStats] = useState<ReminderStats>({
    total_reminders: 0,
    recent_reminders: 0,
    failed_reminders: 0,
    upcoming_reminders: 0
  });
  const [logs, setLogs] = useState<ReminderLog[]>([]);
  const [cronStatus, setCronStatus] = useState<CronStatus>({
    isActive: false,
    isRunning: false,
    schedule: '',
    nextRuns: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<ReminderConfiguration | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  // Pagination and filters for logs
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [reminderTypeFilter, setReminderTypeFilter] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'logs') {
      loadLogs();
    }
  }, [activeTab, currentPage, statusFilter, channelFilter, reminderTypeFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      const [configsRes, statsRes, cronRes] = await Promise.all([
        fetch(`${API_BASE_URL}/rental-reminders/configurations`, { headers }),
        fetch(`${API_BASE_URL}/rental-reminders/stats`, { headers }),
        fetch(`${API_BASE_URL}/rental-reminders/cron/status`, { headers })
      ]);

      if (configsRes.ok) {
        const configsData = await configsRes.json();
        setConfigurations(configsData.data);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.data);
      }

      if (cronRes.ok) {
        const cronData = await cronRes.json();
        setCronStatus(cronData.data);
      }
    } catch (error) {
      console.error('Error loading reminder data:', error);
      showToast('Failed to load reminder data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });

      if (statusFilter) params.append('status', statusFilter);
      if (channelFilter) params.append('channel', channelFilter);
      if (reminderTypeFilter) params.append('reminder_type', reminderTypeFilter);

      const response = await fetch(`${API_BASE_URL}/rental-reminders/logs?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data.data.data);
        setTotalPages(data.data.meta.totalPages);
      }
    } catch (error) {
      console.error('Error loading reminder logs:', error);
      showToast('Failed to load reminder logs', 'error');
    }
  };

  const triggerManualProcessing = async () => {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/rental-reminders/process`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        showToast(`Processing completed: ${data.data.processed} reminders sent`, 'success');
        loadData(); // Refresh stats
      } else {
        throw new Error('Failed to trigger processing');
      }
    } catch (error) {
      console.error('Error triggering manual processing:', error);
      showToast('Failed to trigger manual processing', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const updateConfiguration = async (configId: string, updates: Partial<ReminderConfiguration>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/rental-reminders/configurations/${configId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        showToast('Configuration updated successfully', 'success');
        loadData(); // Refresh configurations
      } else {
        throw new Error('Failed to update configuration');
      }
    } catch (error) {
      console.error('Error updating configuration:', error);
      showToast('Failed to update configuration', 'error');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'sms':
        return <Smartphone className="w-4 h-4" />;
      case 'in_app':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const formatReminderType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const TabButton: React.FC<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active: boolean;
    onClick: () => void;
  }> = ({ icon: Icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
        active
          ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-700'
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Rental Reminders
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage multi-channel rental return reminder system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            cronStatus.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              cronStatus.isActive ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              {cronStatus.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <Button
            onClick={triggerManualProcessing}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {isProcessing ? 'Processing...' : 'Process Now'}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <TabButton
          icon={BarChart3}
          label="Overview"
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
        />
        <TabButton
          icon={Settings}
          label="Configurations"
          active={activeTab === 'configurations'}
          onClick={() => setActiveTab('configurations')}
        />
        <TabButton
          icon={Eye}
          label="Logs"
          active={activeTab === 'logs'}
          onClick={() => setActiveTab('logs')}
        />
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stats Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Reminders</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.total_reminders.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Recent (24h)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.recent_reminders.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Failed (24h)</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.failed_reminders.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.upcoming_reminders.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                  <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            {/* Cron Status */}
            <div className="md:col-span-2 lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                System Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Cron Job Status</p>
                  <p className={`font-medium ${cronStatus.isActive ? 'text-green-600' : 'text-red-600'}`}>
                    {cronStatus.isActive ? 'Running' : 'Stopped'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Schedule</p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Every 15 minutes
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Currently Processing</p>
                  <p className={`font-medium ${cronStatus.isRunning ? 'text-yellow-600' : 'text-gray-600'}`}>
                    {cronStatus.isRunning ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
              {cronStatus.nextRuns.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Next Runs</p>
                  <div className="flex flex-wrap gap-2">
                    {cronStatus.nextRuns.slice(0, 3).map((run, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                        {new Date(run).toLocaleTimeString()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'configurations' && (
          <div className="space-y-6">
            {configurations.map((config) => (
              <div key={config.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatReminderType(config.name)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Sent {config.hours_before} hours before return date
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={config.enabled}
                        onChange={(e) => updateConfiguration(config.id, { enabled: e.target.checked })}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Enabled</span>
                    </label>
                    <Button
                      onClick={() => {
                        setSelectedConfig(config);
                        setShowTemplateModal(true);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Edit Templates
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">Email</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {config.email_template.replace(/<[^>]*>/g, '').substring(0, 100)}...
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">SMS</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {config.sms_template.substring(0, 100)}...
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">In-App</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {config.in_app_template.substring(0, 100)}...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">All Statuses</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">All Channels</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="in_app">In-App</option>
                </select>
                
                <select
                  value={reminderTypeFilter}
                  onChange={(e) => setReminderTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">All Types</option>
                  <option value="24h_before">24h Before</option>
                  <option value="6h_before">6h Before</option>
                  <option value="same_day">Same Day</option>
                </select>
                
                <Button
                  onClick={() => {
                    setStatusFilter('');
                    setChannelFilter('');
                    setReminderTypeFilter('');
                    setCurrentPage(1);
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Booking
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Renter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Channel
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Scheduled
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Sent
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {log.booking_number}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {log.product_name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {log.first_name} {log.last_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {log.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {formatReminderType(log.reminder_type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getChannelIcon(log.channel)}
                            <span className="text-sm text-gray-900 dark:text-gray-100 capitalize">
                              {log.channel}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(log.status)}
                            <span className={`text-sm capitalize ${
                              log.status === 'sent' ? 'text-green-600' :
                              log.status === 'failed' ? 'text-red-600' :
                              log.status === 'cancelled' ? 'text-gray-600' :
                              'text-yellow-600'
                            }`}>
                              {log.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(log.scheduled_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {log.sent_at ? new Date(log.sent_at).toLocaleString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                      >
                        Previous
                      </Button>
                      <Button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        size="sm"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalRemindersManagement;