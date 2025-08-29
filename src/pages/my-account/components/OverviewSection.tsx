import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Wallet, DollarSign, Shield, ArrowUpRight, Calendar } from 'lucide-react';

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

const StatCard = ({ icon: Icon, title, value, subtitle, trend, color, bgColor }: any) => (
  <div className="group relative bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        {trend && <ArrowUpRight className="w-5 h-5 text-success-500" />}
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{title}</div>
        {subtitle && (
          <div className="flex items-center text-xs text-success-600 font-medium">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            {subtitle}
          </div>
        )}
      </div>
    </div>
  </div>
);

const OverviewSection: React.FC<Props> = ({ dashboardStats, recentDashboardBookings, recentDashboardTransactions }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Package} title="Active Bookings" value={dashboardStats.activeBookings} subtitle="View all →" trend={true} color="text-primary-600" bgColor="bg-primary-50" />
        <StatCard icon={Wallet} title="Total Earnings" value={`${dashboardStats.totalEarnings.toLocaleString()}`} subtitle="Available" trend={true} color="text-success-600" bgColor="bg-success-50" />
        <StatCard icon={DollarSign} title="Total Transactions" value={`${dashboardStats.totalTransactions.toLocaleString()}`} subtitle="+12% this month" trend={true} color="text-purple-600" bgColor="bg-purple-50" />
        <StatCard icon={Shield} title="Active Inspections" value={dashboardStats.activeInspections} subtitle="In progress" trend={true} color="text-emerald-600" bgColor="bg-emerald-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
            <Link to="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center group">
              View all
              <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentDashboardBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No recent bookings found</p>
              </div>
            ) : (
              recentDashboardBookings.map((booking: any) => (
                <div key={booking.id} className="group flex items-center space-x-4 p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-all duration-200">
                  <div className="relative">
                    <img src={booking.images?.[0]?.image_url || '/assets/img/placeholder-image.png'} alt={booking.product?.title || 'Product'} className="w-16 h-12 rounded-xl object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors duration-200"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{booking.product?.title || 'Product'}</h4>
                    <p className="text-sm text-gray-500">{new Date(booking.start_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{booking.product?.base_price_per_day != null && booking.product?.base_currency ? `$${booking.product.base_price_per_day}` : ''}</p>
                    <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${booking.status === 'pending' ? 'bg-my-primary/10 text-my-primary' : 'bg-success-100 text-success-700'}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Transactions</h3>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center group">
              View all
              <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
          <div className="space-y-3">
            {recentDashboardTransactions.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No transactions yet</p>
              </div>
            ) : (
              recentDashboardTransactions.slice(0, 3).map((transaction: any) => (
                <div key={transaction.id} className="p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors duration-200 border border-gray-100/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 capitalize">
                          {transaction.transaction_type?.replace(/_/g, ' ') || 'Payment'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-gray-900">
                        {parseFloat(transaction.amount).toLocaleString()} {transaction.currency}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${transaction.status === 'completed' ? 'bg-green-100 text-green-700' : transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>via {transaction.provider}</span>
                    <span>{new Date(transaction.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;


