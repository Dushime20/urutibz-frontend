import React, { useState, useEffect } from 'react';
import { fetchRecentPaymentTransactions } from '../service';
import type { PaymentTransaction } from '../interfaces';
import { 
  Loader, 
  Filter, 
  Search, 
  ArrowUpDown, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  Building
} from 'lucide-react';
import { useAdminSettingsContext } from '../../../contexts/AdminSettingsContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';

const TransactionsManagement: React.FC = () => {
  const { tSync } = useTranslation();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const { formatCurrency, formatDate } = useAdminSettingsContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [amountRangeFilter, setAmountRangeFilter] = useState('all');

  // Respect global theme; no forced dark mode here
  useEffect(() => {
    // no-op
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await fetchRecentPaymentTransactions(
          10,
          token || undefined,
          currentPage,
          statusFilter,
          typeFilter,
          searchTerm
        );
        
        // Ensure we have valid data before setting state
        if (response && response.data && Array.isArray(response.data)) {
          setTransactions(response.data);
          setTotalPages(Math.ceil(response.pagination.total / 10)); // Calculate total pages
        } else {
          setTransactions([]);
          setTotalPages(1);
        }
      } catch (err: any) {
        setError(err.message || tSync('Failed to fetch transactions'));
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentPage, statusFilter, typeFilter, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  // Calculate transaction statistics
  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(t => t.status.toLowerCase() === 'completed').length;
  const pendingTransactions = transactions.filter(t => t.status.toLowerCase() === 'pending').length;
  const failedTransactions = transactions.filter(t => t.status.toLowerCase() === 'failed').length;
  const totalAmount = transactions.reduce((sum, t) => {
    const amount = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount;
    return sum + amount;
  }, 0);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">
            <TranslatedText text="Loading transactions..." />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            <TranslatedText text="Transactions" />
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            <TranslatedText text="Monitor and manage all payment transactions" />
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={tSync('Search transactions...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-64"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl transition-colors flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            <TranslatedText text="Filter" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <TranslatedText text="Status" />
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all"><TranslatedText text="All Statuses" /></option>
                <option value="completed"><TranslatedText text="Completed" /></option>
                <option value="pending"><TranslatedText text="Pending" /></option>
                <option value="failed"><TranslatedText text="Failed" /></option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <TranslatedText text="Type" />
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all"><TranslatedText text="All Types" /></option>
                <option value="booking_payment"><TranslatedText text="Booking Payment" /></option>
                <option value="security_deposit"><TranslatedText text="Security Deposit" /></option>
                <option value="refund"><TranslatedText text="Refund" /></option>
                <option value="platform_fee"><TranslatedText text="Platform Fee" /></option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <TranslatedText text="Date Range" />
              </label>
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all"><TranslatedText text="All Time" /></option>
                <option value="today"><TranslatedText text="Today" /></option>
                <option value="week"><TranslatedText text="This Week" /></option>
                <option value="month"><TranslatedText text="This Month" /></option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <TranslatedText text="Amount Range" />
              </label>
              <select
                value={amountRangeFilter}
                onChange={(e) => setAmountRangeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all"><TranslatedText text="All Amounts" /></option>
                <option value="0-100"><TranslatedText text="$0 - $100" /></option>
                <option value="100-500"><TranslatedText text="$100 - $500" /></option>
                <option value="500-1000"><TranslatedText text="$500 - $1,000" /></option>
                <option value="1000+"><TranslatedText text="$1,000+" /></option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex items-center">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <CreditCard className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400"><TranslatedText text="Total Transactions" /></p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{totalTransactions}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400"><TranslatedText text="Completed" /></p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{completedTransactions}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400"><TranslatedText text="Pending" /></p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{pendingTransactions}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400"><TranslatedText text="Total Amount" /></p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 text-red-700 dark:text-red-400">{error}</div>
      )}

      {/* Transactions Table */}
      {!loading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer hover:text-teal-600 dark:hover:text-teal-400">
                      <TranslatedText text="Transaction ID" />
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"><TranslatedText text="Type" /></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"><TranslatedText text="Status" /></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"><TranslatedText text="Amount" /></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"><TranslatedText text="Provider" /></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center cursor-pointer hover:text-teal-600 dark:hover:text-teal-400">
                      <TranslatedText text="Date" />
                      <ArrowUpDown className="w-4 h-4 ml-1" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {transactions && transactions.length > 0 ? transactions.map((txn) => {
                  return (
                  <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg mr-3">
                          <CreditCard className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        </div>
                        <span className="text-sm font-medium text-teal-600 dark:text-teal-400">{txn.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {txn.transaction_type ? txn.transaction_type.replace(/_/g, ' ') : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(txn.status)}`}>
                        {getStatusIcon(txn.status)}
                        <span className="ml-1 capitalize">{txn.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(typeof txn.amount === 'string' ? parseFloat(txn.amount) : txn.amount, txn.currency)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{txn.provider || '-'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-1" />
                        {txn.created_at ? formatDate(txn.created_at) : '-'}
                      </div>
                    </td>
                  </tr>
                );
                }) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center">
                        <CreditCard className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          <TranslatedText text="No transactions found" />
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                            ? tSync('Try adjusting your filters to see more results.')
                            : tSync('Transactions will appear here once they are processed.')}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && transactions.length > 0 && (
        <div className="flex items-center justify-between mt-6 px-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <TranslatedText text="Showing" /> {transactions.length} <TranslatedText text="transactions" />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-gray-800 transition-colors"
            >
              <TranslatedText text="Previous" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              <TranslatedText text="Page" /> {currentPage} <TranslatedText text="of" /> {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-xl border border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-gray-800 transition-colors"
            >
              <TranslatedText text="Next" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsManagement; 