import React from 'react';
import { Package, DollarSign, Shield, ArrowUpRight, Calendar, TrendingUp, Euro, PoundSterling, Banknote, Clock, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';

interface Props {
  dashboardStats: {
    activeBookings: number;
    totalEarnings: number;
    totalTransactions: number;
    activeInspections: number;
  };
  recentDashboardBookings: any[];
  recentDashboardTransactions: any[];
  onGoBookings?: () => void;
  onGoWallet?: () => void;
}

const StatCard = ({ icon: Icon, title, value, subtitle, trend, color, bgColor, gradientFrom, gradientTo, onClickSubtitle }: any) => (
  <div className="group relative overflow-hidden">
    <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-gray-100/50 dark:border-slate-700/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`}></div>
      
      {/* Content */}
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`relative p-3 rounded-xl ${bgColor} backdrop-blur-sm`}>
            <Icon className={`w-6 h-6 ${color}`} />
            {/* Removed decorative dot */}
          </div>
          {trend && (
            <div className="flex items-center space-x-1 text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-medium"><TranslatedText text="Live" /></span>
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
            <button type="button" onClick={onClickSubtitle} className="flex items-center text-xs text-teal-600 dark:text-teal-400 font-semibold bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded-full w-fit cursor-pointer hover:bg-teal-100 dark:hover:bg-teal-900/30">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              {subtitle}
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);


// Unified Activity Item Component
const ActivityItem = ({ item, type }: { item: any, type: 'booking' | 'transaction' }) => {
  const isBooking = type === 'booking';
  const date = isBooking ? item.start_date : item.created_at;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-700';
    }
  };

  return (
    <div className="flex items-start space-x-4 p-4 rounded-xl bg-gradient-to-r from-white to-gray-50/50 hover:from-gray-50 hover:to-teal-50/30 transition-all duration-300 border border-gray-100/50 dark:from-slate-800/50 dark:to-slate-700/30 dark:hover:from-slate-700/50 dark:hover:to-slate-600/30 dark:border-slate-700/50">
      {/* Icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        isBooking 
          ? 'bg-blue-100 dark:bg-blue-900/30' 
          : 'bg-teal-100 dark:bg-teal-900/30'
      }`}>
        {isBooking ? (
          <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        ) : (
          <CreditCard className="w-5 h-5 text-teal-600 dark:text-teal-400" />
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-white truncate">
              {isBooking 
                ? (item.product?.title || <TranslatedText text="Product Booking" />)
                : (item.transaction_type?.replace(/_/g, ' ') || <TranslatedText text="Payment" />)
              }
            </h4>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-slate-400 mt-1">
              <Clock className="w-3 h-3" />
              <span>
                {new Date(date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            {isBooking && item.product?.base_price_per_day && (
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                ${item.product.base_price_per_day} <TranslatedText text="per day" />
              </p>
            )}
            {!isBooking && item.metadata?.description && (
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                {item.metadata.description}
              </p>
            )}
          </div>
          
          {/* Status & Amount */}
          <div className="text-right ml-4">
            {isBooking ? (
              <div>
                <p className="font-bold text-gray-900 dark:text-white">
                  ${item.product?.base_price_per_day || '--'}
                </p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
            ) : (
              <div>
                <p className="font-bold text-gray-900 dark:text-white">
                  {parseFloat(item.amount).toLocaleString()} {item.currency}
                </p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusColor(item.status)}`}>
                  {item.status}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, message }: { icon: any, message: string }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="w-8 h-8 text-gray-400 dark:text-slate-500" />
    </div>
    <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">{message}</p>
    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1"><TranslatedText text="Data will appear here once available" /></p>
  </div>
);

const OverviewSection: React.FC<Props> = ({ dashboardStats, recentDashboardBookings, recentDashboardTransactions, onGoBookings, onGoWallet }) => {
  const navigate = useNavigate();
  const { tSync } = useTranslation();
  const preferredCurrency = (dashboardStats as any)?.preferredCurrency || 'USD';

  const getCurrencyIcon = (code: string) => {
    const upper = (code || '').toUpperCase();
    switch (upper) {
      case 'USD':
        return DollarSign;
      case 'EUR':
        return Euro;
      case 'GBP':
        return PoundSterling;
      // For currencies without dedicated icons, use a generic banknote icon
      case 'RWF':
      case 'KES':
      case 'UGX':
      default:
        return Banknote;
    }
  };
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

  const goBookings = () => {
    if (onGoBookings) return onGoBookings();
    navigate('/my-account#bookings');
  };

  const goWallet = () => {
    if (onGoWallet) return onGoWallet();
    navigate('/my-account#wallet');
  };

  return (
    <div className="space-y-8 bg-gradient-to-br from-gray-50/50 to-teal-50/20 dark:from-slate-900 dark:to-slate-800 min-h-screen px-3 py-4 sm:p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={Package} 
          title={<TranslatedText text="Active Bookings" />} 
          value={formatNumber(dashboardStats.activeBookings)} 
          subtitle={tSync('View all') + ' →'} 
          trend={true} 
          color="text-teal-600" 
          bgColor="bg-teal-50 dark:bg-teal-900/30"
          gradientFrom="from-teal-500"
          gradientTo="to-cyan-500"
          onClickSubtitle={goBookings}
        />
        <StatCard 
          icon={getCurrencyIcon(preferredCurrency)} 
          title={<TranslatedText text="Total Earnings" />} 
          value={`${preferredCurrency} ${formatEarnings(dashboardStats.totalEarnings)}`} 
          subtitle={tSync('Available')} 
          trend={true} 
          color="text-emerald-600" 
          bgColor="bg-emerald-50 dark:bg-emerald-900/30"
          gradientFrom="from-emerald-500"
          gradientTo="to-teal-500"
        />
        <StatCard 
          icon={getCurrencyIcon(preferredCurrency)} 
          title={<TranslatedText text="Transactions" />} 
          value={`${preferredCurrency} ${formatEarnings(dashboardStats.totalTransactions)}`} 
          subtitle="+12% this month" 
          trend={true} 
          color="text-blue-600" 
          bgColor="bg-blue-50 dark:bg-blue-900/30"
          gradientFrom="from-blue-500"
          gradientTo="to-teal-500"
        />
        <StatCard 
          icon={Shield} 
          title={<TranslatedText text="Inspections" />} 
          value={dashboardStats.activeInspections} 
          subtitle={tSync('In progress')} 
          trend={true} 
          color="text-purple-600" 
          bgColor="bg-purple-50 dark:bg-purple-900/30"
          gradientFrom="from-purple-500"
          gradientTo="to-teal-500"
        />
      </div>

      {/* Recent Activity - Combined Bookings & Transactions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white"><TranslatedText text="Recent Bookings" /></h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1"><TranslatedText text="Latest booking activities" /></p>
              </div>
              <button onClick={goBookings} className="text-sm text-teal-600 dark:text-teal-400 font-semibold flex items-center group bg-teal-50 dark:bg-teal-900/20 px-3 py-2 rounded-full transition-colors hover:bg-teal-100 dark:hover:bg-teal-900/30">
                View all
                <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
            
            <div className="space-y-3">
              {recentDashboardBookings.length === 0 ? (
                <EmptyState icon={Calendar} message={tSync('No recent bookings found')} />
              ) : (
                <ActivityItem key={`booking-${recentDashboardBookings[0].id}`} item={recentDashboardBookings[0]} type="booking" />
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white"><TranslatedText text="Recent Transactions" /></h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1"><TranslatedText text="Latest payment activities" /></p>
              </div>
              <button onClick={goWallet} className="text-sm text-teal-600 dark:text-teal-400 font-semibold flex items-center group bg-teal-50 dark:bg-teal-900/20 px-3 py-2 rounded-full transition-colors hover:bg-teal-100 dark:hover:bg-teal-900/30">
                <TranslatedText text="View all" />
                <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
            
            <div className="space-y-3">
              {recentDashboardTransactions.length === 0 ? (
                <EmptyState icon={DollarSign} message={tSync('No transactions yet')} />
              ) : (
                <ActivityItem key={`transaction-${recentDashboardTransactions[0].id}`} item={recentDashboardTransactions[0]} type="transaction" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;