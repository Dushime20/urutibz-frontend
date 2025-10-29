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
  Filter as FilterIcon,
  X,
  CheckCircle} from 'lucide-react';
import { Button } from '../../../components/ui/DesignSystem';
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

const ReportsManagement: React.FC<ReportsManagementProps> = () => {
  const [activeTab, setActiveTab] = useState<ReportType>('revenue');
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCustomReportModal, setShowCustomReportModal] = useState(false);
  const [customReports, setCustomReports] = useState<CustomReport[]>([]);

  // Report data states
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null);
  const [userReport, setUserReport] = useState<UserReport | null>(null);
  const [bookingReport, setBookingReport] = useState<BookingReport | null>(null);
  const [productReport, setProductReport] = useState<ProductReport | null>(null);
  const [transactionReport, setTransactionReport] = useState<TransactionReport | null>(null);
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null);

  // Filter states
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0], // today
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
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <FilterIcon className="w-4 h-4" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
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

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Report Filters</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
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
      )}

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
          {activeTab === 'bookings' && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Booking reports coming soon!</p>
            </div>
          )}
          {activeTab === 'products' && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Product reports coming soon!</p>
            </div>
          )}
          {activeTab === 'transactions' && (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Transaction reports coming soon!</p>
            </div>
          )}
          {activeTab === 'performance' && (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Performance reports coming soon!</p>
            </div>
          )}
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