import React from 'react';
import { Package, Wallet, DollarSign, Shield, ArrowUpRight, Calendar, TrendingUp } from 'lucide-react';

interface Props {
  dashboardStats: {
    activeBookings: number;
    totalEarnings: number;
    totalTransactions: number;
    activeInspections: number;
  };
  recentDashboardBookings: any[];
  recentDashboardTransactions: any[];
}

const StatCard = ({ icon: Icon, title, value, subtitle, trend, color, bgColor, gradientFrom, gradientTo }: any) => (
  <div className="group relative overflow-hidden">
    <div className="relative bg-white rounded-2xl p-4 sm:p-6 border border-gray-100/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm dark:bg-slate-900/80 dark:border-slate-700/50">
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>
      
      {/* Content */}
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`relative p-3 rounded-xl ${bgColor} backdrop-blur-sm`}>
            <Icon className={`w-6 h-6 ${color}`} />
            {trend && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-teal-500 rounded-full animate-pulse"></div>
            )}
          </div>
          {trend && (
            <div className="flex items-center space-x-1 text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-medium">Live</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {value}
          </div>
          <div className="text-sm font-medium text-gray-600 dark:text-slate-300">
            {title}
          </div>
          {subtitle && (
            <div className="flex items-center text-xs text-teal-600 font-semibold bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400 px-2 py-1 rounded-full w-fit">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const BookingCard = ({ booking }: { booking: any }) => (
  <div className="group relative overflow-hidden">
    <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-gray-50/80 to-teal-50/30 hover:from-teal-50/50 hover:to-teal-100/40 transition-all duration-300 border border-gray-100/50 dark:from-slate-800/50 dark:to-slate-700/30 dark:hover:from-slate-700/50 dark:hover:to-slate-600/30 dark:border-slate-700/50">
      {/* Product Image */}
      <div className="relative overflow-hidden rounded-lg">
        <img 
          src={booking.images?.[0]?.image_url || '/assets/img/placeholder-image.png'} 
          alt={booking.product?.title || 'Product'} 
          className="w-16 h-12 object-cover transition-transform duration-300 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 dark:text-white truncate mb-1">
          {booking.product?.title || 'Product'}
        </h4>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-slate-400">
          <Calendar className="w-4 h-4" />
          <span>{new Date(booking.start_date).toLocaleDateString()}</span>
        </div>
      </div>
      
      {/* Price & Status */}
      <div className="text-right">
        <p className="font-bold text-gray-900 dark:text-white mb-1">
          {booking.product?.base_price_per_day != null && booking.product?.base_currency ? 
            `$${booking.product.base_price_per_day}` : '--'
          }
        </p>
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
          booking.status === 'pending' 
            ? 'bg-amber-100 text-amber-700 border border-amber-200' 
            : 'bg-teal-100 text-teal-700 border border-teal-200'
        }`}>
          {booking.status}
        </span>
      </div>
    </div>
  </div>
);

const TransactionCard = ({ transaction }: { transaction: any }) => (
  <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-r from-white to-gray-50/50 hover:from-gray-50 hover:to-teal-50/30 transition-all duration-300 border border-gray-100/50 dark:from-slate-800/50 dark:to-slate-700/30 dark:hover:from-slate-700/50 dark:hover:to-slate-600/30 dark:border-slate-700/50">
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
            {transaction.transaction_type?.replace(/_/g, ' ') || 'Payment'}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center">
            <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
            {new Date(transaction.created_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>
      
      <div className="text-right">
        <p className="font-bold text-sm text-gray-900 dark:text-white">
          {parseFloat(transaction.amount).toLocaleString()} {transaction.currency}
        </p>
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${
          transaction.status === 'completed' 
            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
            : transaction.status === 'pending' 
            ? 'bg-amber-100 text-amber-700 border border-amber-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {transaction.status}
        </span>
      </div>
    </div>
    
    <div className="flex items-center justify-between text-xs text-gray-400 dark:text-slate-500 pt-2 border-t border-gray-100 dark:border-slate-700">
      <span className="flex items-center">
        <span className="w-1 h-1 bg-teal-400 rounded-full mr-2"></span>
        via {transaction.provider}
      </span>
      <span>{new Date(transaction.created_at).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}</span>
    </div>
  </div>
);

const EmptyState = ({ icon: Icon, message }: { icon: any, message: string }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="w-8 h-8 text-gray-400 dark:text-slate-500" />
    </div>
    <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">{message}</p>
    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Data will appear here once available</p>
  </div>
);

const OverviewSection: React.FC<Props> = ({ dashboardStats, recentDashboardBookings, recentDashboardTransactions }) => {
  const formatEarnings = (amount: number) => {
    return amount >= 1000000 
      ? `${(amount / 1000000).toFixed(1)}M`
      : amount >= 1000
      ? `${(amount / 1000).toFixed(1)}K`
      : `${amount.toLocaleString()}`;
  };

  const formatNumber = (num: number) => {
    return num >= 1000000 
      ? `${(num / 1000000).toFixed(1)}M`
      : num >= 1000
      ? `${(num / 1000).toFixed(1)}K`
      : num.toLocaleString();
  };

  return (
    <div className="space-y-8 bg-gradient-to-br from-gray-50/50 to-teal-50/20 dark:from-slate-900 dark:to-slate-800 min-h-screen px-3 py-4 sm:p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Package} 
          title="Active Bookings" 
          value={formatNumber(dashboardStats.activeBookings)} 
          subtitle="View all →" 
          trend={true} 
          color="text-teal-600" 
          bgColor="bg-teal-50 dark:bg-teal-900/30"
          gradientFrom="from-teal-500"
          gradientTo="to-cyan-500"
        />
        <StatCard 
          icon={Wallet} 
          title="Total Earnings" 
          value={formatEarnings(dashboardStats.totalEarnings)} 
          subtitle="Available" 
          trend={true} 
          color="text-emerald-600" 
          bgColor="bg-emerald-50 dark:bg-emerald-900/30"
          gradientFrom="from-emerald-500"
          gradientTo="to-teal-500"
        />
        <StatCard 
          icon={DollarSign} 
          title="Transactions" 
          value={formatNumber(dashboardStats.totalTransactions)} 
          subtitle="+12% this month" 
          trend={true} 
          color="text-blue-600" 
          bgColor="bg-blue-50 dark:bg-blue-900/30"
          gradientFrom="from-blue-500"
          gradientTo="to-teal-500"
        />
        <StatCard 
          icon={Shield} 
          title="Inspections" 
          value={dashboardStats.activeInspections} 
          subtitle="In progress" 
          trend={true} 
          color="text-purple-600" 
          bgColor="bg-purple-50 dark:bg-purple-900/30"
          gradientFrom="from-purple-500"
          gradientTo="to-teal-500"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="xl:col-span-2">
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100/50 dark:border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Bookings</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Latest booking activities</p>
              </div>
              <button className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-semibold flex items-center group bg-teal-50 dark:bg-teal-900/20 px-3 py-2 rounded-full transition-colors">
                View all
                <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
            
            <div className="space-y-3">
              {recentDashboardBookings.length === 0 ? (
                <EmptyState icon={Calendar} message="No recent bookings found" />
              ) : (
                recentDashboardBookings.map((booking: any) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="xl:col-span-1">
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100/50 dark:border-slate-700/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Transactions</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Recent payments</p>
              </div>
              <button className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-semibold flex items-center group bg-teal-50 dark:bg-teal-900/20 px-3 py-2 rounded-full transition-colors">
                View all
                <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
            
            <div className="space-y-3">
              {recentDashboardTransactions.length === 0 ? (
                <EmptyState icon={DollarSign} message="No transactions yet" />
              ) : (
                recentDashboardTransactions.slice(0, 4).map((transaction: any) => (
                  <TransactionCard key={transaction.id} transaction={transaction} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;