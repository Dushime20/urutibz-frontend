import React, { useState, useEffect } from 'react';
import { fetchRecentPaymentTransactions } from '../service';
import type { PaymentTransaction } from '../interfaces';
import { Loader, Filter, Search, ArrowUpDown } from 'lucide-react';

const TransactionsManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

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
        setError(err.message || 'Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentPage, statusFilter, typeFilter, searchTerm]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Transactions</h3>
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-my-primary focus:bg-white transition-all duration-200 w-64"
            />
          </div>

          {/* Filters */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-100 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-my-primary"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-gray-100 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-my-primary"
          >
            <option value="all">All Types</option>
            <option value="booking_payment">Booking Payment</option>
            <option value="security_deposit">Security Deposit</option>
            <option value="refund">Refund</option>
            <option value="platform_fee">Platform Fee</option>
          </select>

          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 text-my-primary animate-spin mr-2" />
          <span className="text-gray-500">Loading transactions...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                  <div className="flex items-center cursor-pointer hover:text-my-primary">
                    Transaction ID
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </div>
                </th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Type</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Amount</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Provider</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">
                  <div className="flex items-center cursor-pointer hover:text-my-primary">
                    Date
                    <ArrowUpDown className="w-4 h-4 ml-1" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions && transactions.length > 0 ? transactions.map((txn) => {
                return (
                <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-my-primary">{txn.id}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">
                      {txn.payment_method ? txn.payment_method.replace(/_/g, ' ') : '-'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(txn.status)}`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {txn.amount.toLocaleString()} {txn.currency}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{txn.payment_method}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">
                      {txn.created_at ? new Date(txn.created_at).toLocaleString() : '-'}
                    </span>
                  </td>
                </tr>
              );
              }) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && transactions.length > 0 && (
        <div className="flex items-center justify-between mt-6 px-4">
          <div className="text-sm text-gray-500">
            Showing {transactions.length} transactions
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsManagement; 