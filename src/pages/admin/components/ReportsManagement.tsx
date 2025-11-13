import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Download, 
  Calendar,
  BarChart3,
  TrendingUp,
  Users,
  Package,
  CreditCard,
  Activity,
  Eye,
  Edit,
  Trash2,
  X,
  CheckCircle,
  ShoppingCart} from 'lucide-react';
import { Button } from '../../../components/ui/DesignSystem';
import TrendChart from '../../risk-management/components/TrendChart';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  generateRevenueReport,
  generateUserReport,
  generateBookingReport,
  generateProductReport,
  generateTransactionReport,
  generatePerformanceReport,
  fetchCustomReports,
  createCustomReport,
  deleteCustomReport,
  exportReport
} from '../service';
import { formatDateUTC } from '../../../utils/dateUtils';

// Define types for reports since they're not exported from service yet
interface ReportFilters {
  startDate: string;
  endDate: string;
  category?: string;
}

interface RevenueReport {
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  period: string;
  revenueByCategory: Array<{
    category: string;
    revenue: number;
    bookings: number;
  }>;
}

interface UserReport {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  period: string;
  topUsers: Array<{
    userId: string;
    name: string;
    email: string;
    bookings: number;
    revenue: number;
  }>;
}

interface BookingReport {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  period: string;
  bookingsByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

interface ProductReport {
  totalProducts: number;
  activeProducts: number;
  rentedProducts: number;
  period: string;
  topProducts: Array<{
    name: string;
    category: string;
    bookings: number;
    revenue: number;
  }>;
}

interface TransactionReport {
  totalTransactions: number;
  totalAmount: number;
  successfulTransactions: number;
  completedAmount?: number;
  pendingAmount?: number;
  allStatusAmount?: number;
  completedCount?: number;
  pendingCount?: number;
  period: string;
  transactionsByType: Array<{
    type: string;
    count: number;
    amount: number;
  }>;
}

interface PerformanceReport {
  totalRevenue: number;
  totalBookings: number;
  averageRating: number;
  period: string;
  performanceMetrics: Array<{
    metric: string;
    value: number;
    target: number;
    status: 'good' | 'warning' | 'poor';
  }>;
}

interface CustomReport {
  id: string;
  name: string;
  description: string;
  type: string;
  filters: ReportFilters;
  schedule: string;
  recipients: string[];
  createdAt: string;
  updatedAt: string;
}

interface ReportsManagementProps {
  // Add props for reports data as needed
}

type ReportType = 'revenue' | 'users' | 'bookings' | 'products' | 'transactions' | 'performance' | 'custom';

type DateRangePreset = 'current_month' | 'last_month' | 'last_3_months' | 'last_6_months' | 'last_year' | 'all_time' | 'custom';

// Helper function to get date ranges
const getDateRange = (preset: DateRangePreset): { startDate: string; endDate: string } => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  switch (preset) {
    case 'current_month': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: todayStr
      };
    }
    case 'last_month': {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        startDate: lastMonth.toISOString().split('T')[0],
        endDate: endOfLastMonth.toISOString().split('T')[0]
      };
    }
    case 'last_3_months': {
      const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      return {
        startDate: threeMonthsAgo.toISOString().split('T')[0],
        endDate: todayStr
      };
    }
    case 'last_6_months': {
      const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1);
      return {
        startDate: sixMonthsAgo.toISOString().split('T')[0],
        endDate: todayStr
      };
    }
    case 'last_year': {
      const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), 1);
      return {
        startDate: oneYearAgo.toISOString().split('T')[0],
        endDate: todayStr
      };
    }
    case 'all_time': {
      // Set to a very early date (e.g., 5 years ago)
      const allTimeStart = new Date(today.getFullYear() - 5, 0, 1);
      return {
        startDate: allTimeStart.toISOString().split('T')[0],
        endDate: todayStr
      };
    }
    case 'custom':
    default:
      return {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: todayStr
      };
  }
};

const ReportsManagement: React.FC<ReportsManagementProps> = () => {
  const [activeTab, setActiveTab] = useState<ReportType>('revenue');
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomReportModal, setShowCustomReportModal] = useState(false);
  const [customReports, setCustomReports] = useState<CustomReport[]>([]);
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('current_month');

  // Report data states
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [userReport, setUserReport] = useState<UserReport | null>(null);
  const [bookingReport, setBookingReport] = useState<BookingReport | null>(null);
  const [productReport, setProductReport] = useState<ProductReport | null>(null);
  const [transactionReport, setTransactionReport] = useState<TransactionReport | null>(null);
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null);

  // Filter states - default to current month
  const currentMonthRange = getDateRange('current_month');
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: currentMonthRange.startDate,
    endDate: currentMonthRange.endDate,
  });

  // Custom report form state
  const [customReportForm, setCustomReportForm] = useState({
    name: '',
    description: '',
    type: 'revenue' as ReportType,
    filters: { ...filters },
    schedule: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    recipients: [] as string[],
  });

  // Load custom reports on mount
  useEffect(() => {
    const loadCustomReports = async () => {
      try {
        const token = localStorage.getItem('token');
        const reports = await fetchCustomReports(token || undefined);
        setCustomReports(reports);
      } catch (error) {
        console.error('Error loading custom reports:', error);
      }
    };

    loadCustomReports();
  }, []);

  // Update filters when preset changes
  useEffect(() => {
    if (dateRangePreset !== 'custom') {
      const range = getDateRange(dateRangePreset);
      setFilters(prev => ({
        ...prev,
        startDate: range.startDate,
        endDate: range.endDate
      }));
    }
  }, [dateRangePreset]);

  // Generate report based on active tab
  useEffect(() => {
    const generateReport = async () => {
      if (!filters.startDate || !filters.endDate) return;
      
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        switch (activeTab) {
          case 'revenue':
            const revenue = await generateRevenueReport(filters, token || undefined);
            setRevenueReport(revenue);
            break;
          case 'users':
            const users = await generateUserReport(filters, token || undefined);
            console.log('[Reports] ReportsManagement user report received:', users);
            setUserReport(users);
            break;
          case 'bookings':
            const bookings = await generateBookingReport(filters, token || undefined);
            setBookingReport(bookings);
            break;
          case 'products':
            const products = await generateProductReport(filters, token || undefined);
            setProductReport(products);
            break;
          case 'transactions':
            const transactions = await generateTransactionReport(filters, token || undefined);
            setTransactionReport(transactions);
            break;
          case 'performance':
            const performance = await generatePerformanceReport(filters, token || undefined);
            setPerformanceReport(performance);
            break;
        }
      } catch (error) {
        console.error('Error generating report:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateReport();
  }, [activeTab, filters]);

  // Handle preset change
  const handlePresetChange = (preset: DateRangePreset) => {
    setDateRangePreset(preset);
    if (preset !== 'custom') {
      const range = getDateRange(preset);
      setFilters(prev => ({
        ...prev,
        startDate: range.startDate,
        endDate: range.endDate
      }));
    }
  };

  // Handle custom date change
  const handleCustomDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRangePreset('custom');
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleExportReport = async (format: 'pdf' | 'csv' | 'excel' | 'json') => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const blob = await exportReport(activeTab, format, filters, token || undefined);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}_report_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCustomReport = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const newReport = await createCustomReport(customReportForm, token || undefined);
      setCustomReports(prev => [...prev, newReport]);
      setShowCustomReportModal(false);
      setCustomReportForm({
        name: '',
        description: '',
        type: 'revenue',
        filters: { ...filters },
        schedule: 'monthly',
        recipients: [],
      });
    } catch (error) {
      console.error('Error creating custom report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCustomReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this custom report?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await deleteCustomReport(reportId, token || undefined);
      setCustomReports(prev => prev.filter(report => report.id !== reportId));
    } catch (error) {
      console.error('Error deleting custom report:', error);
    }
  };

  const TabButton: React.FC<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active: boolean;
    onClick: () => void;
  }> = ({ icon: Icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
        active
          ? 'bg-primary-50 text-primary-700 border border-primary-200'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }> = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{title}</div>
        {subtitle && (
          <div className="text-xs text-gray-400">{subtitle}</div>
        )}
      </div>
    </div>
  );

  const renderRevenueReport = () => (
    <div className="space-y-6">
      {revenueReport ? (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={`$${(revenueReport.totalRevenue || 0).toLocaleString()}`}
              subtitle={revenueReport.period || 'Current Period'}
              icon={TrendingUp}
              color="bg-green-500"
            />
            <StatCard
              title="Total Bookings"
              value={(revenueReport.totalBookings || 0).toLocaleString()}
              subtitle={revenueReport.period || 'Current Period'}
              icon={Calendar}
              color="bg-my-primary"
            />
            <StatCard
              title="Average Booking Value"
              value={`$${(revenueReport.averageBookingValue || 0).toLocaleString()}`}
              subtitle="Per booking"
              icon={BarChart3}
              color="bg-purple-500"
            />
            <StatCard
              title="Revenue Growth"
              value="+12.5%"
              subtitle="vs last period"
              icon={TrendingUp}
              color="bg-orange-500"
            />
          </div>

          {/* Revenue Trends Over Time */}
          {((Array.isArray((revenueReport as any).revenueTrends) && (revenueReport as any).revenueTrends.length > 0) ||
            (Array.isArray((revenueReport as any).bookingTrends) && (revenueReport as any).bookingTrends.length > 0)) && (
            <div className="space-y-6">
              {/* Revenue Over Time */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h4>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart 
                    data={(revenueReport as any).revenueTrends || (revenueReport as any).bookingTrends || []}
                    margin={{ top: 20, right: 40, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="dateLabel" 
                      stroke="#6b7280" 
                      fontSize={14} 
                      fontWeight={600}
                      tickFormatter={(value) => {
                        if (!value) return '';
                        try {
                          const date = new Date(value);
                          if (isNaN(date.getTime())) return value;
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        } catch {
                          return value;
                        }
                      }}
                    />
                    <YAxis 
                      stroke="#6b7280" 
                      fontSize={14} 
                      fontWeight={600}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', fontSize: 16 }}
                      labelStyle={{ color: '#10b981', fontWeight: 700 }}
                      itemStyle={{ color: '#374151' }}
                      formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={3}
                      fill="url(#colorRevenue)"
                      activeDot={{ r: 7, fill: '#fff', stroke: '#10b981', strokeWidth: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Bookings Over Time */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Bookings Over Time</h4>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart 
                    data={(revenueReport as any).bookingTrends || (revenueReport as any).revenueTrends || []}
                    margin={{ top: 20, right: 40, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00aaa9" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#00aaa9" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="dateLabel" 
                      stroke="#6b7280" 
                      fontSize={14} 
                      fontWeight={600}
                      tickFormatter={(value) => {
                        if (!value) return '';
                        try {
                          const date = new Date(value);
                          if (isNaN(date.getTime())) return value;
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        } catch {
                          return value;
                        }
                      }}
                    />
                    <YAxis allowDecimals={false} stroke="#6b7280" fontSize={14} fontWeight={600} />
                    <Tooltip
                      contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', fontSize: 16 }}
                      labelStyle={{ color: '#00aaa9', fontWeight: 700 }}
                      itemStyle={{ color: '#374151' }}
                      formatter={(value: any) => [value, 'Bookings']}
                    />
                    <Area
                      type="monotone"
                      dataKey="bookings"
                      stroke="#00aaa9"
                      strokeWidth={3}
                      fill="url(#colorBookings)"
                      activeDot={{ r: 7, fill: '#fff', stroke: '#00aaa9', strokeWidth: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Revenue by Category */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h4>
            <div className="space-y-3">
              {revenueReport.revenueByCategory && revenueReport.revenueByCategory.length > 0 ? (
                revenueReport.revenueByCategory.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{category.category}</div>
                        <div className="text-sm text-gray-500">{category.bookings} bookings</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">${(category.revenue || 0).toLocaleString()}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No revenue data available for the selected period.
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#01aaa7]"></div>
              <p className="text-gray-600">Loading revenue report...</p>
            </div>
          ) : (
            <div className="text-gray-500">
              <p>No revenue data available.</p>
              <p className="text-sm mt-2">Try adjusting your filters or check back later.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderUserReport = () => (
    <div className="space-y-6">
      {userReport && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={userReport.totalUsers.toLocaleString()}
              subtitle={userReport.period}
              icon={Users}
              color="bg-my-primary"
            />
            <StatCard
              title="New Users"
              value={userReport.newUsers.toLocaleString()}
              subtitle={userReport.period}
              icon={Plus}
              color="bg-green-500"
            />
            <StatCard
              title="Active Users"
              value={userReport.activeUsers.toLocaleString()}
              subtitle={userReport.period}
              icon={Activity}
              color="bg-purple-500"
            />
            <StatCard
              title="Verified Users"
              value={userReport.verifiedUsers.toLocaleString()}
              subtitle={userReport.period}
              icon={CheckCircle}
              color="bg-orange-500"
            />
          </div>

          {/* User Growth Trends */}
          {Array.isArray((userReport as any).userTrends) && (userReport as any).userTrends.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">User Growth Over Time</h4>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart 
                  data={(userReport as any).userTrends || []}
                  margin={{ top: 20, right: 40, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorUserTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00aaa9" stopOpacity={0.7}/>
                      <stop offset="95%" stopColor="#00aaa9" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.7}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorActiveUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.7}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="dateLabel" 
                    stroke="#6b7280" 
                    fontSize={14} 
                    fontWeight={600}
                    tickFormatter={(value) => {
                      if (!value) return '';
                      try {
                        const date = new Date(value);
                        if (isNaN(date.getTime())) return value;
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      } catch {
                        return value;
                      }
                    }}
                  />
                  <YAxis allowDecimals={false} stroke="#6b7280" fontSize={14} fontWeight={600} />
                  <Tooltip
                    contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', fontSize: 16 }}
                    labelStyle={{ color: '#00aaa9', fontWeight: 700 }}
                    itemStyle={{ color: '#374151' }}
                    formatter={(value: any, name: string) => {
                      if (name === 'count') return [value, 'Total Users'];
                      if (name === 'newUsers') return [value, 'New Users'];
                      if (name === 'activeUsers') return [value, 'Active Users'];
                      return [value, name];
                    }}
                  />
                  <Legend 
                    formatter={(value) => {
                      if (value === 'count') return 'Total Users';
                      if (value === 'newUsers') return 'New Users';
                      if (value === 'activeUsers') return 'Active Users';
                      return value;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#00aaa9"
                    strokeWidth={3}
                    fill="url(#colorUserTotal)"
                    name="count"
                    activeDot={{ r: 7, fill: '#fff', stroke: '#00aaa9', strokeWidth: 3 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="newUsers"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorNewUsers)"
                    name="newUsers"
                    activeDot={{ r: 6, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="activeUsers"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorActiveUsers)"
                    name="activeUsers"
                    activeDot={{ r: 6, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Users */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Users</h4>
            <div className="space-y-3">
              {userReport.topUsers.slice(0, 5).map((user, index) => (
                <div key={user.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.bookings} bookings</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${user.revenue.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderBookingReport = () => (
    <div className="space-y-6">
      {bookingReport ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Bookings"
              value={(bookingReport.totalBookings || 0).toLocaleString()}
              subtitle={bookingReport.period}
              icon={Calendar}
              color="bg-my-primary"
            />
            <StatCard
              title="Completed"
              value={(bookingReport.completedBookings || 0).toLocaleString()}
              subtitle={bookingReport.period}
              icon={CheckCircle}
              color="bg-green-500"
            />
            <StatCard
              title="Cancelled"
              value={(bookingReport.cancelledBookings || 0).toLocaleString()}
              subtitle={bookingReport.period}
              icon={X}
              color="bg-red-500"
            />
            <StatCard
              title="Avg Value"
              value={bookingReport['averageBookingValue'] ? `$${(bookingReport as any).averageBookingValue.toLocaleString()}` : '$0'}
              subtitle="Per booking"
              icon={BarChart3}
              color="bg-purple-500"
            />
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">By Status</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bookingReport.bookingsByStatus?.map((s) => (
                <div key={s.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="font-medium text-gray-900 capitalize">{s.status.replace('_',' ')}</div>
                  <div className="text-sm text-gray-600">{s.count} ({s.percentage}%)</div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Trends Over Time */}
          {((Array.isArray((bookingReport as any).bookingTrends) && (bookingReport as any).bookingTrends.length > 0) ||
            (Array.isArray(bookingReport.revenueOverTime) && bookingReport.revenueOverTime.length > 0)) && (
            <div className="space-y-6">
              {/* Bookings Over Time */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Bookings Over Time</h4>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart 
                    data={(bookingReport as any).bookingTrends || bookingReport.revenueOverTime || []}
                    margin={{ top: 20, right: 40, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorBookingCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00aaa9" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#00aaa9" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="dateLabel" 
                      stroke="#6b7280" 
                      fontSize={14} 
                      fontWeight={600}
                      tickFormatter={(value) => {
                        if (!value) return '';
                        try {
                          const date = new Date(value);
                          if (isNaN(date.getTime())) return value;
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        } catch {
                          return value;
                        }
                      }}
                    />
                    <YAxis allowDecimals={false} stroke="#6b7280" fontSize={14} fontWeight={600} />
                    <Tooltip
                      contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', fontSize: 16 }}
                      labelStyle={{ color: '#00aaa9', fontWeight: 700 }}
                      itemStyle={{ color: '#374151' }}
                      formatter={(value: any) => [value, 'Bookings']}
                    />
                    <Area
                      type="monotone"
                      dataKey="bookings"
                      stroke="#00aaa9"
                      strokeWidth={3}
                      fill="url(#colorBookingCount)"
                      activeDot={{ r: 7, fill: '#fff', stroke: '#00aaa9', strokeWidth: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue Over Time */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Revenue Over Time</h4>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart 
                    data={(bookingReport as any).bookingTrends || bookingReport.revenueOverTime || []}
                    margin={{ top: 20, right: 40, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorBookingRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="dateLabel" 
                      stroke="#6b7280" 
                      fontSize={14} 
                      fontWeight={600}
                      tickFormatter={(value) => {
                        if (!value) return '';
                        try {
                          const date = new Date(value);
                          if (isNaN(date.getTime())) return value;
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        } catch {
                          return value;
                        }
                      }}
                    />
                    <YAxis 
                      stroke="#6b7280" 
                      fontSize={14} 
                      fontWeight={600}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', fontSize: 16 }}
                      labelStyle={{ color: '#10b981', fontWeight: 700 }}
                      itemStyle={{ color: '#374151' }}
                      formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#10b981"
                      strokeWidth={3}
                      fill="url(#colorBookingRevenue)"
                      activeDot={{ r: 7, fill: '#fff', stroke: '#10b981', strokeWidth: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );

  const renderProductReport = () => (
    <div className="space-y-6">
      {productReport ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Products"
              value={(productReport.totalProducts || 0).toLocaleString()}
              subtitle={productReport.period}
              icon={Package}
              color="bg-my-primary"
            />
            <StatCard
              title="Active"
              value={(productReport.activeProducts || 0).toLocaleString()}
              subtitle={productReport.period}
              icon={Activity}
              color="bg-green-500"
            />
            <StatCard
              title="Rented"
              value={(productReport.rentedProducts || 0).toLocaleString()}
              subtitle={productReport.period}
              icon={ShoppingCart}
              color="bg-orange-500"
            />
            <StatCard
              title="Top Product Revenue"
              value={`$${(productReport.topProducts?.[0]?.revenue || 0).toLocaleString()}`}
              subtitle={productReport.topProducts?.[0]?.name || '—'}
              icon={TrendingUp}
              color="bg-purple-500"
            />
          </div>

          {/* Product Trends Over Time */}
          {Array.isArray((productReport as any).productTrends) && (productReport as any).productTrends.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Growth Over Time</h4>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart 
                  data={(productReport as any).productTrends || []}
                  margin={{ top: 20, right: 40, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorProductTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00aaa9" stopOpacity={0.7}/>
                      <stop offset="95%" stopColor="#00aaa9" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorProductActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.7}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorProductRented" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="dateLabel" 
                    stroke="#6b7280" 
                    fontSize={14} 
                    fontWeight={600}
                    tickFormatter={(value) => {
                      if (!value) return '';
                      try {
                        const date = new Date(value);
                        if (isNaN(date.getTime())) return value;
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      } catch {
                        return value;
                      }
                    }}
                  />
                  <YAxis allowDecimals={false} stroke="#6b7280" fontSize={14} fontWeight={600} />
                  <Tooltip
                    contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', fontSize: 16 }}
                    labelStyle={{ color: '#00aaa9', fontWeight: 700 }}
                    itemStyle={{ color: '#374151' }}
                    formatter={(value: any, name: string) => {
                      if (name === 'count') return [value, 'Total Products'];
                      if (name === 'active') return [value, 'Active Products'];
                      if (name === 'rented') return [value, 'Rented Products'];
                      return [value, name];
                    }}
                  />
                  <Legend 
                    formatter={(value) => {
                      if (value === 'count') return 'Total Products';
                      if (value === 'active') return 'Active Products';
                      if (value === 'rented') return 'Rented Products';
                      return value;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#00aaa9"
                    strokeWidth={3}
                    fill="url(#colorProductTotal)"
                    name="count"
                    activeDot={{ r: 7, fill: '#fff', stroke: '#00aaa9', strokeWidth: 3 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="active"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorProductActive)"
                    name="active"
                    activeDot={{ r: 6, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="rented"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#colorProductRented)"
                    name="rented"
                    activeDot={{ r: 6, fill: '#fff', stroke: '#f59e0b', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h4>
            <div className="space-y-3">
              {productReport.topProducts.slice(0, 5).map((p, idx) => (
                <div key={p.name+idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">{idx+1}</div>
                    <div>
                      <div className="font-medium text-gray-900">{p.name}</div>
                      <div className="text-sm text-gray-500">{p.category} • {p.bookings} bookings</div>
                    </div>
                  </div>
                  <div className="text-right font-semibold text-gray-900">${(p.revenue || 0).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Distribution & Revenue Bars */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribution */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Product Distribution</h4>
              {(() => {
                const total = Math.max(1, productReport.totalProducts || 0);
                const activePct = Math.round(((productReport.activeProducts || 0) / total) * 100);
                const rentedPct = Math.round(((productReport.rentedProducts || 0) / total) * 100);
                return (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Active</span>
                        <span>{activePct}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${activePct}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Rented</span>
                        <span>{rentedPct}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500" style={{ width: `${rentedPct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Top Products by Revenue (Bars) */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Revenue</h4>
              {(() => {
                const items = (productReport.topProducts || []).slice(0, 5);
                const maxRevenue = Math.max(1, ...items.map((x: any) => x.revenue || 0));
                return (
                  <div className="space-y-3">
                    {items.map((item: any, i: number) => (
                      <div key={`${item.name}-${i}`}>
                        <div className="flex justify-between text-sm text-gray-700 mb-1">
                          <span className="truncate mr-2">{item.name}</span>
                          <span className="font-medium">${(item.revenue || 0).toLocaleString()}</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-my-primary" style={{ width: `${Math.round(((item.revenue || 0) / maxRevenue) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );

  const renderTransactionReport = () => (
    <div className="space-y-6">
      {transactionReport ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Transactions"
              value={(transactionReport.totalTransactions || 0).toLocaleString()}
              subtitle={transactionReport.period}
              icon={CreditCard}
              color="bg-my-primary"
            />
            <StatCard
              title="Successful"
              value={(transactionReport.successfulTransactions || 0).toLocaleString()}
              subtitle={transactionReport.period}
              icon={CheckCircle}
              color="bg-green-500"
            />
            <StatCard
              title="Total Amount"
              value={`$${(transactionReport.totalAmount || 0).toLocaleString()}`}
              subtitle={transactionReport.period}
              icon={TrendingUp}
              color="bg-purple-500"
            />
          </div>

          {/* Amount Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Amount Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Completed Amount</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  ${((transactionReport as any).completedAmount || transactionReport.totalAmount || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {(transactionReport as any).completedCount || transactionReport.successfulTransactions || 0} transactions
                </div>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Pending Amount</span>
                  <Activity className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  ${((transactionReport as any).pendingAmount || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {(transactionReport as any).pendingCount || 0} transactions
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Total Amount</span>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  ${(transactionReport.totalAmount || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Pending + Completed
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">By Type</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {transactionReport.transactionsByType?.map((t) => (
                <div key={t.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="font-medium text-gray-900 capitalize">{t.type.replace('_',' ')}</div>
                  <div className="text-sm text-gray-600">{t.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions Over Time - Enhanced Chart */}
          {((Array.isArray((transactionReport as any).trends) && (transactionReport as any).trends.length > 0) ||
            (Array.isArray((transactionReport as any).monthlyTrends) && (transactionReport as any).monthlyTrends.length > 0)) && (
            <div className="space-y-6">
              {/* Transaction Count Over Time */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Transaction Count Over Time</h4>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart 
                    data={(transactionReport as any).trends || (transactionReport as any).monthlyTrends?.map((m: any) => ({
                      date: m.month || m.date,
                      dateLabel: m.month || m.date,
                      count: m.count || 0,
                      completedCount: m.completedCount || 0,
                      pendingCount: m.pendingCount || 0
                    })) || []}
                    margin={{ top: 20, right: 40, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorTransaction" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="dateLabel" 
                      stroke="#6b7280" 
                      fontSize={14} 
                      fontWeight={600}
                      tickFormatter={(value) => {
                        // Format date label nicely
                        if (!value) return '';
                        try {
                          const date = new Date(value);
                          if (isNaN(date.getTime())) return value;
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        } catch {
                          return value;
                        }
                      }}
                    />
                    <YAxis allowDecimals={false} stroke="#6b7280" fontSize={14} fontWeight={600} />
                    <Tooltip
                      contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', fontSize: 16 }}
                      labelStyle={{ color: '#3b82f6', fontWeight: 700 }}
                      itemStyle={{ color: '#374151' }}
                      formatter={(value: any, name: string) => {
                        if (name === 'count') return [value, 'Total Transactions'];
                        if (name === 'completedCount') return [value, 'Completed'];
                        if (name === 'pendingCount') return [value, 'Pending'];
                        return [value, name];
                      }}
                    />
                    <Legend 
                      formatter={(value) => {
                        if (value === 'count') return 'Total Transactions';
                        if (value === 'completedCount') return 'Completed';
                        if (value === 'pendingCount') return 'Pending';
                        return value;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fill="url(#colorTransaction)"
                      name="count"
                      activeDot={{ r: 7, fill: '#fff', stroke: '#3b82f6', strokeWidth: 3 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="completedCount"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#colorCompleted)"
                      name="completedCount"
                      activeDot={{ r: 6, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pendingCount"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fill="url(#colorPending)"
                      name="pendingCount"
                      activeDot={{ r: 6, fill: '#fff', stroke: '#f59e0b', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Transaction Amount Over Time */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Transaction Amount Over Time</h4>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart 
                    data={(transactionReport as any).trends || (transactionReport as any).monthlyTrends?.map((m: any) => ({
                      date: m.month || m.date,
                      dateLabel: m.month || m.date,
                      amount: m.amount || 0,
                      completedAmount: m.completedAmount || 0,
                      pendingAmount: m.pendingAmount || 0
                    })) || []}
                    margin={{ top: 20, right: 40, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorCompletedAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorPendingAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="dateLabel" 
                      stroke="#6b7280" 
                      fontSize={14} 
                      fontWeight={600}
                      tickFormatter={(value) => {
                        if (!value) return '';
                        try {
                          const date = new Date(value);
                          if (isNaN(date.getTime())) return value;
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        } catch {
                          return value;
                        }
                      }}
                    />
                    <YAxis 
                      stroke="#6b7280" 
                      fontSize={14} 
                      fontWeight={600}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001', fontSize: 16 }}
                      labelStyle={{ color: '#8b5cf6', fontWeight: 700 }}
                      itemStyle={{ color: '#374151' }}
                      formatter={(value: any, name: string) => {
                        const formattedValue = `$${Number(value).toLocaleString()}`;
                        if (name === 'amount') return [formattedValue, 'Total Amount'];
                        if (name === 'completedAmount') return [formattedValue, 'Completed Amount'];
                        if (name === 'pendingAmount') return [formattedValue, 'Pending Amount'];
                        return [formattedValue, name];
                      }}
                    />
                    <Legend 
                      formatter={(value) => {
                        if (value === 'amount') return 'Total Amount';
                        if (value === 'completedAmount') return 'Completed Amount';
                        if (value === 'pendingAmount') return 'Pending Amount';
                        return value;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fill="url(#colorAmount)"
                      name="amount"
                      activeDot={{ r: 7, fill: '#fff', stroke: '#8b5cf6', strokeWidth: 3 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="completedAmount"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#colorCompletedAmount)"
                      name="completedAmount"
                      activeDot={{ r: 6, fill: '#fff', stroke: '#10b981', strokeWidth: 2 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="pendingAmount"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fill="url(#colorPendingAmount)"
                      name="pendingAmount"
                      activeDot={{ r: 6, fill: '#fff', stroke: '#f59e0b', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );

  const renderPerformanceReport = () => (
    <div className="space-y-6">
      {performanceReport ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {performanceReport.performanceMetrics?.map((m) => (
              <StatCard
                key={m.metric}
                title={m.metric}
                value={m.value}
                subtitle={`Target: ${m.target}`}
                icon={Activity}
                color={m.status === 'good' ? 'bg-green-500' : m.status === 'warning' ? 'bg-orange-500' : 'bg-red-500'}
              />
            ))}
          </div>

          {Array.isArray((performanceReport as any).performanceTrend) && (performanceReport as any).performanceTrend.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">API Response Time Trend</h4>
              <TrendChart
                title="Avg Response Time (ms)"
                color="purple"
                data={(performanceReport as any).performanceTrend.map((p: any) => ({ date: p.date, value: p.value }))}
                formatValue={(v: number) => `${Math.round(v)} ms`}
              />
            </div>
          )}
        </>
      ) : null}
    </div>
  );

  const renderCustomReports = () => (
    <div className="space-y-6">
      {/* Custom Reports List */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">Custom Reports</h4>
          <Button
            onClick={() => setShowCustomReportModal(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Report
          </Button>
        </div>
        
        <div className="space-y-4">
          {customReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No custom reports created yet</p>
            </div>
          ) : (
            customReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <FileText className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">{report.name}</h5>
                    <p className="text-sm text-gray-500">{report.description}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                        {report.type}
                      </span>
                      {report.schedule && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {report.schedule}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteCustomReport(report.id)}
                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Reports & Analytics</h3>
          <p className="text-gray-600">Generate and view comprehensive reports</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleExportReport('pdf')}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Date Range Filters - Always Visible */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Date Range</h4>
          <div className="text-sm text-gray-500">
            {filters.startDate && filters.endDate && (
              <span>
                {formatDateUTC(filters.startDate)} - {formatDateUTC(filters.endDate)}
              </span>
            )}
          </div>
        </div>
        
        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => handlePresetChange('current_month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateRangePreset === 'current_month'
                ? 'bg-my-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Current Month
          </button>
          <button
            onClick={() => handlePresetChange('last_month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateRangePreset === 'last_month'
                ? 'bg-my-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Last Month
          </button>
          <button
            onClick={() => handlePresetChange('last_3_months')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateRangePreset === 'last_3_months'
                ? 'bg-my-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Last 3 Months
          </button>
          <button
            onClick={() => handlePresetChange('last_6_months')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateRangePreset === 'last_6_months'
                ? 'bg-my-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Last 6 Months
          </button>
          <button
            onClick={() => handlePresetChange('last_year')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateRangePreset === 'last_year'
                ? 'bg-my-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Last Year
          </button>
          <button
            onClick={() => handlePresetChange('all_time')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateRangePreset === 'all_time'
                ? 'bg-my-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => handlePresetChange('custom')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              dateRangePreset === 'custom'
                ? 'bg-my-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Custom Range
          </button>
        </div>

        {/* Custom Date Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleCustomDateChange('startDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleCustomDateChange('endDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category (Optional)</label>
            <select
              value={filters.category || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Categories</option>
              <option value="cars">Cars</option>
              <option value="bikes">Bikes</option>
              <option value="boats">Boats</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl overflow-x-auto">
        <TabButton
          icon={TrendingUp}
          label="Revenue"
          active={activeTab === 'revenue'}
          onClick={() => setActiveTab('revenue')}
        />
        <TabButton
          icon={Users}
          label="Users"
          active={activeTab === 'users'}
          onClick={() => setActiveTab('users')}
        />
        <TabButton
          icon={Calendar}
          label="Bookings"
          active={activeTab === 'bookings'}
          onClick={() => setActiveTab('bookings')}
        />
        <TabButton
          icon={Package}
          label="Products"
          active={activeTab === 'products'}
          onClick={() => setActiveTab('products')}
        />
        <TabButton
          icon={CreditCard}
          label="Transactions"
          active={activeTab === 'transactions'}
          onClick={() => setActiveTab('transactions')}
        />
        <TabButton
          icon={Activity}
          label="Performance"
          active={activeTab === 'performance'}
          onClick={() => setActiveTab('performance')}
        />
        <TabButton
          icon={FileText}
          label="Custom"
          active={activeTab === 'custom'}
          onClick={() => setActiveTab('custom')}
        />
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-3 text-gray-600">Generating report...</span>
        </div>
      )}

      {/* Report Content */}
      {!isLoading && (
        <div>
          {activeTab === 'revenue' && renderRevenueReport()}
          {activeTab === 'users' && renderUserReport()}
          {activeTab === 'bookings' && renderBookingReport()}
          {activeTab === 'products' && renderProductReport()}
          {activeTab === 'transactions' && renderTransactionReport()}
          {activeTab === 'performance' && renderPerformanceReport()}
          {activeTab === 'custom' && renderCustomReports()}
        </div>
      )}

      {/* Custom Report Modal */}
      {showCustomReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Create Custom Report</h3>
                <button
                  onClick={() => setShowCustomReportModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                  <input
                    type="text"
                    value={customReportForm.name}
                    onChange={(e) => setCustomReportForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter report name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={customReportForm.description}
                    onChange={(e) => setCustomReportForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter report description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                    <select
                      value={customReportForm.type}
                      onChange={(e) => setCustomReportForm(prev => ({ ...prev, type: e.target.value as ReportType }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="revenue">Revenue</option>
                      <option value="users">Users</option>
                      <option value="bookings">Bookings</option>
                      <option value="products">Products</option>
                      <option value="transactions">Transactions</option>
                      <option value="performance">Performance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                    <select
                      value={customReportForm.schedule}
                      onChange={(e) => setCustomReportForm(prev => ({ ...prev, schedule: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomReportModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateCustomReport}
                    disabled={!customReportForm.name || isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Create Report'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsManagement; 