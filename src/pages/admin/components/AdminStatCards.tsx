import React from 'react';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  ShieldCheck
} from 'lucide-react';
import { fetchAdminStats } from '../service';
import ErrorBoundary from '../../../components/ErrorBoundary';
import type { AdminStats } from '../interfaces';
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';

// Define props interface
interface AdminStatCardsProps {
  adminStats: AdminStats;
  verifiedUsers: number;
}

const AdminStatCards: React.FC<AdminStatCardsProps> = ({ adminStats, verifiedUsers }) => {
  const { tSync } = useTranslation();
  const statCards = [
    {
      icon: Users,
      title: 'Total Users',
      value: adminStats?.totalUsers || 0,
      color: 'text-my-primary bg-my-primary/10'
    },
    {
      icon: Package,
      title: 'Total Items',
      value: adminStats?.totalItems || 0,
      color: 'text-green-500 bg-green-100'
    },
    {
      icon: ShoppingCart,
      title: 'Active Bookings',
      value: adminStats?.activeBookings || 0,
      color: 'text-purple-500 bg-purple-100'
    },
    {
      icon: DollarSign,
      title: 'Total Revenue',
      value: `$${(adminStats?.totalRevenue || 0).toLocaleString()}`,
      color: 'text-yellow-500 bg-yellow-100'
    },
    {
      icon: ShieldCheck,
      title: 'Verified Users',
      value: verifiedUsers || 0,
      color: 'text-emerald-500 bg-emerald-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <div 
          key={index} 
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md flex items-center"
        >
          <div className={`p-3 rounded-full mr-4 ${card.color}`}>
            <card.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <TranslatedText text={card.title} />
            </p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{card.value}</h2>
          </div>
        </div>
      ))}
    </div>
  );
};

// Wrap the component with ErrorBoundary
const AdminStatCardsWithErrorBoundary: React.FC<AdminStatCardsProps> = (props) => (
  <ErrorBoundary>
    <AdminStatCards {...props} />
  </ErrorBoundary>
);

export default AdminStatCardsWithErrorBoundary; 