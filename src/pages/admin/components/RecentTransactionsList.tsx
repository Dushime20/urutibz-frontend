import React, { useEffect, useState } from 'react';
import { fetchRecentPaymentTransactions } from '../service/api';
import type { PaymentTransaction } from '../service/api';
import { Loader } from 'lucide-react';

interface RecentTransactionsListProps {
  limit?: number;
}

const statusColor = (status: string) => {
  switch (status) {
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

const RecentTransactionsList: React.FC<RecentTransactionsListProps> = ({ limit = 5 }) => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    fetchRecentPaymentTransactions(limit, token || undefined)
      .then((res) => {
        setTransactions(res.data);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch transactions');
      })
      .finally(() => setLoading(false));
  }, [limit]);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-8 text-my-primary">
          <Loader className="animate-spin w-6 h-6 mr-2" /> Loading...
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : transactions.length === 0 ? (
        <div className="text-gray-500 text-center py-8">No recent transactions found.</div>
      ) : (
        <div className="space-y-4">
          {transactions.map((txn) => (
            <div key={txn.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-my-primary">{txn.transaction_type.replace(/_/g, ' ')}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ml-2 ${statusColor(txn.status)}`}>{txn.status}</span>
                </div>
                <div className="text-xs text-gray-500">Txn ID: {txn.id}</div>
                <div className="text-xs text-gray-400">Provider: {txn.provider}</div>
              </div>
              <div className="flex flex-col items-end min-w-[100px]">
                <span className="font-bold text-gray-900">
                  {txn.amount.toLocaleString()} {txn.currency}
                </span>
                <span className="text-xs text-gray-400 mt-1">{txn.processed_at ? new Date(txn.processed_at).toLocaleString() : '-'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentTransactionsList; 