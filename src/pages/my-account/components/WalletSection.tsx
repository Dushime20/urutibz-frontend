import React from 'react';
import { Wallet } from 'lucide-react';

interface Props {
  dashboardStats: { totalEarnings: number; totalTransactions: number; preferredCurrency?: string };
  loadingWallet: boolean;
  userTransactions: any[];
  onViewAll: () => void;
}

const WalletSection: React.FC<Props> = ({ dashboardStats, loadingWallet, userTransactions, onViewAll }) => {
  console.log(loadingWallet,'all user transactions')
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-active via-active to-active-dark rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-active/25">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium backdrop-blur-sm">Available</div>
            </div>
            <h4 className="text-lg font-semibold mb-2 text-white/90">Wallet Balance</h4>
            <p className="text-4xl font-bold mb-6 text-white">{(dashboardStats.preferredCurrency || 'USD')} {dashboardStats.totalEarnings.toLocaleString()}</p>
            <button className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 backdrop-blur-sm hover:scale-105 border border-white/20">Withdraw Funds</button>
          </div>
        </div>

        <div className="bg-gray-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-platform-dark-grey/25">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium backdrop-blur-sm">Total</div>
            </div>
            <h4 className="text-lg font-semibold mb-2 text-white/90">Transaction Volume</h4>
            <p className="text-4xl font-bold mb-6 text-white">{(dashboardStats.preferredCurrency || 'USD')} {dashboardStats.totalTransactions.toLocaleString()}</p>
            <button onClick={onViewAll} className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 backdrop-blur-sm hover:scale-105 border border-white/20">View All Transactions</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-bold text-gray-900 dark:text-slate-100">Payment Transactions</h4>
          {userTransactions.length > 0 && <span className="text-sm text-gray-500 dark:text-slate-400">{userTransactions.length} total</span>}
        </div>
        {loadingWallet ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-gray-600 dark:text-slate-400">Loading transactions...</span>
          </div>
        ) : userTransactions.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4 dark:text-slate-500" />
            <p className="text-gray-500 text-lg font-medium dark:text-slate-400">No transactions found</p>
            <p className="text-gray-500 text-sm dark:text-slate-400">Your payment history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userTransactions.map((transaction) => (

              <div key={transaction.id} className="flex items-center space-x-4 p-3 sm:p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors dark:border-slate-700 dark:hover:border-slate-600">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900 capitalize dark:text-slate-100">{transaction.transaction_type?.replace(/_/g, ' ') || 'Payment'}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.status === 'completed' ? 'bg-green-100 text-green-700' : transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{transaction.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{new Date(transaction.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  {transaction.metadata?.description && <p className="text-xs text-gray-400 mt-1 dark:text-slate-500">{transaction.metadata.description}</p>}
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900 dark:text-slate-100">{parseFloat(transaction.amount).toLocaleString()} {transaction.currency}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-500">via {transaction.provider}</p>
                  {transaction.metadata?.is_converted && (
                    <p className="text-xs text-my-primary">Originally {transaction.metadata.original_amount} {transaction.metadata.original_currency}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletSection;


