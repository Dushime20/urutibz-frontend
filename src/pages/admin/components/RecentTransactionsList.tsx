import type { PaymentTransaction } from '../interfaces';
import React, { useEffect, useState } from 'react';
import { fetchRecentPaymentTransactions } from '../service/api';
import { Loader } from 'lucide-react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

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
  const [page, setPage] = useState(1);
  const [selectedTxn, setSelectedTxn] = useState<PaymentTransaction | null>(null);
  const txnsPerPage = limit;

  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    fetchRecentPaymentTransactions(50, token || undefined) // fetch more for pagination
      .then((res) => {
        setTransactions(res.data);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch transactions');
      })
      .finally(() => setLoading(false));
  }, [limit]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold dark:text-gray-100">Recent Transactions</h3>
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Provider</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
              </tr>
            </thead>
            <TransitionGroup component="tbody">
              {transactions.slice((page-1)*txnsPerPage, page*txnsPerPage).map(txn => (
                <CSSTransition key={txn.id} timeout={300} classNames="fade">
                  <tr
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 even:bg-gray-50 dark:even:bg-gray-800 transition cursor-pointer"
                    onClick={() => setSelectedTxn(txn)}
                  >
                    <td className="px-4 py-2 font-semibold text-my-primary" title={txn.transaction_type.replace(/_/g, ' ')}>
                      {txn.transaction_type.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(txn.status)}`}>{txn.status}</span>
                    </td>
                    <td className="px-4 py-2 font-bold text-gray-900 dark:text-gray-100">
                      {txn.amount.toLocaleString()} {txn.currency}
                    </td>
                    <td className="px-4 py-2 truncate max-w-xs" title={txn.provider}>{txn.provider}</td>
                    <td className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
                      {txn.processed_at ? new Date(txn.processed_at).toLocaleString() : '-'}
                    </td>
                  </tr>
                </CSSTransition>
              ))}
            </TransitionGroup>
          </table>
          {/* Pagination */}
          <div className="flex justify-end mt-2 gap-2">
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50">Prev</button>
            <span className="text-xs text-gray-500 dark:text-gray-400">Page {page}</span>
            <button onClick={() => setPage(p => p+1)} disabled={page*txnsPerPage >= transactions.length} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-50">Next</button>
          </div>
        </div>
      )}
      {/* Transaction Detail Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold">Transaction Details</h4>
              <button onClick={() => setSelectedTxn(null)} className="text-gray-400 hover:text-my-primary">&times;</button>
            </div>
            <div className="mb-2 text-sm"><b>Type:</b> {selectedTxn.transaction_type.replace(/_/g, ' ')}</div>
            <div className="mb-2 text-sm"><b>Status:</b> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(selectedTxn.status)}`}>{selectedTxn.status}</span></div>
            <div className="mb-2 text-sm"><b>Amount:</b> {selectedTxn.amount.toLocaleString()} {selectedTxn.currency}</div>
            <div className="mb-2 text-sm"><b>Provider:</b> {selectedTxn.provider}</div>
            <div className="mb-2 text-sm"><b>Date:</b> {selectedTxn.processed_at ? new Date(selectedTxn.processed_at).toLocaleString() : '-'}</div>
            <div className="mb-2 text-sm"><b>Txn ID:</b> {selectedTxn.id}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentTransactionsList; 