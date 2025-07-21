import React, { useEffect, useState } from 'react';
import { fetchRecentPaymentTransactions } from '../service/api';
import type { PaymentTransaction } from '../service/api';
import { Loader, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SidebarTransactionsListProps {
  limit?: number;
}

const statusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-600';
    case 'pending':
      return 'text-yellow-600';
    case 'failed':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

const SidebarTransactionsList: React.FC<SidebarTransactionsListProps> = ({ limit = 3 }) => {
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
    <div className="mb-8 p-4 bg-gradient-to-r from-my-primary/5 to-indigo-50/50 rounded-2xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Recent Transactions</h3>
        <Link 
          to="#" 
          className="text-xs text-my-primary hover:text-my-primary/80 font-medium flex items-center group"
        >
          View all
          <ArrowUpRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-4 text-my-primary">
          <Loader className="animate-spin w-4 h-4 mr-2" /> Loading...
        </div>
      ) : error ? (
        <div className="text-red-500 text-xs text-center py-4">{error}</div>
      ) : transactions.length === 0 ? (
        <div className="text-gray-500 text-xs text-center py-4">No recent transactions</div>
      ) : (
        <div className="space-y-3">
          {transactions.map((txn) => (
            <div key={txn.id} className="flex items-center justify-between py-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-700 truncate">
                    {txn.transaction_type.replace(/_/g, ' ')}
                  </span>
                  <span className={`text-xs ml-2 ${statusColor(txn.status)}`}>
                    • {txn.status}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 truncate">
                  {txn.processed_at ? new Date(txn.processed_at).toLocaleDateString() : '-'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-gray-900">
                  {txn.amount.toLocaleString()} {txn.currency}
                </div>
                <div className="text-[11px] text-gray-500">{txn.provider}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SidebarTransactionsList; 