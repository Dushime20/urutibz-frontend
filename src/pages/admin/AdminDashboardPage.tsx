import React, { useState, useEffect } from 'react';

import { Button } from '../../components/ui/DesignSystem';
import { itemCategories } from '../../data/mockRentalData';
import type { AdminStats, RecentUser, RecentBooking, AdminUser } from './interfaces';
import {
  fetchAllProducts,
  fetchUserById,
  fetchAdminStats,
  fetchRecentUsers,
  fetchRecentBookings,
  fetchAdminUsers
} from './service/api';
import AdminSidebar from './components/AdminSidebar';
import AdminHeader from './components/AdminHeader';
import AdminStatCards from './components/AdminStatCards';
import RecentUsersList from './components/RecentUsersList';
import RecentBookingsList from './components/RecentBookingsList';
import ItemsManagement from './components/ItemsManagement';
import UserManagement from './components/UserManagement';
import BookingsManagement from './components/BookingsManagement';
import FinancesManagement from './components/FinancesManagement';
import ReportsManagement from './components/ReportsManagement';
import LocationsManagement from './components/LocationsManagement';
import LanguagesManagement from './components/LanguagesManagement';
import MessagingManagement from './components/MessagingManagement';
import NotificationsManagement from './components/NotificationsManagement';
import SettingsManagement from './components/SettingsManagement';
import RecentTransactionsList from './components/RecentTransactionsList';
import TransactionsManagement from './components/TransactionsManagement';
import CategoriesManagement from './components/CategoriesManagement';
import CountriesManagement from './components/CountriesManagement';
import PaymentMethodsManagement from './components/PaymentMethodsManagement';

interface AdminNavigationItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
  hasNotification?: boolean;
}

// Add interfaces for Product and Owner
interface Product {
  id: string;
  title: string;
  description?: string;
  owner_id: string;
  category_id?: string;
  location?: string;
  status?: string;
  [key: string]: any;
}

interface Owner {
  id: string;
  name: string;
  [key: string]: any;
}

const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'users' | 'bookings' | 'finances' | 'transactions' | 'categories' | 'countries' | 'paymentMethods' | 'reports' | 'settings' | 'locations' | 'languages' | 'messaging' | 'notifications'>('overview');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemFilter, setItemFilter] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [products, setProducts] = useState<Product[]>([]);
  const [owners, setOwners] = useState<Record<string, Owner>>({});
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [verifiedUsersCount, setVerifiedUsersCount] = useState(0);

  // Overview data state
  const [adminStats, setAdminStats] = useState<AdminStats>({
    totalUsers: 0,
    totalItems: 0,
    activeBookings: 0,
    totalRevenue: 0,
    monthlyGrowth: {
      users: 0,
      items: 0,
      bookings: 0,
      revenue: 0
    }
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  // Fetch overview data
  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        setLoadingOverview(true);
        setOverviewError(null);
        const token = localStorage.getItem('token');

        // Fetch all overview data in parallel
        const [stats, users, bookings, allUsers] = await Promise.all([
          fetchAdminStats(token || undefined),
          fetchRecentUsers(5, token || undefined),
          fetchRecentBookings(5, token || undefined),
          fetchAdminUsers(1, 1000, token || undefined) // Fetch all users (up to 1000)
        ]);

        setAdminStats(stats);
        setRecentUsers(users);
        setRecentBookings(bookings);

        // Count verified users
        const verifiedCount = allUsers.items.filter((u: AdminUser) => u.kyc_status?.toLowerCase() === 'verified').length;
        setVerifiedUsersCount(verifiedCount);
      } catch (err) {
        console.error('Error fetching overview data:', err);
        setOverviewError('Failed to load overview data');
      } finally {
        setLoadingOverview(false);
      }
    };

    fetchOverviewData();
  }, []);

  // Use real rental items data

  // Helper function to get category icon

  // Multi-location and Multi-language data


  // Messaging and Communication data






  const AdminNavigationItem: React.FC<AdminNavigationItemProps> = ({ icon: Icon, label, active, onClick, hasNotification = false }) => (
    <button
      onClick={onClick}
      className={`group relative w-full flex items-center px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 ${
        active
          ? 'text-white shadow-lg shadow-my-primary/25 scale-[1.02]'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
      style={{
        backgroundColor: active ? 'var(--color-active)' : 'transparent',
      }}
    >
      <Icon className={`w-5 h-5 mr-3 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
      <span className="flex-1 text-left">{label}</span>
      {hasNotification && (
        <div className="w-2 h-2 bg-red-500 rounded-full ml-auto animate-pulse"></div>
      )}
      {active && (
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-l-full"></div>
      )}
    </button>
  );

  useEffect(() => {
    setLoadingProducts(true);
    setProductsError(null);
    const tokenRaw = localStorage.getItem('token');
    const token = tokenRaw || undefined;
    fetchAllProducts(token)
      .then(async (result) => {
        if (result.error) {
          setProductsError(result.error);
          setProducts([]);
          setOwners({});
          return;
        }
        const productList: Product[] = result.data || [];
        console.log('Fetched productList:', productList);
        setProducts(productList);
        // Fetch owners for all products
        const ownerIds = Array.from(new Set(productList.map((p) => p.owner_id)));
        console.log('Owner IDs:', ownerIds);
        const ownerMap: Record<string, Owner> = {};
        await Promise.all(ownerIds.map(async (id: string) => {
          const userResult = await fetchUserById(id, token);
          if (userResult.error || !userResult.data) {
            ownerMap[id] = { id, name: 'Unknown' };
          } else {
            const user = userResult.data;
            const name = user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : user.email || 'Unknown';
            ownerMap[id] = {
              id: user.id,
              name,
              ...user
            };
          }
        }));
        setOwners(ownerMap);
      })
      .catch((err) => {
        setProductsError('Failed to load products. Please try again later.');
        console.error('Failed to load products:', err);
      })
      .finally(() => setLoadingProducts(false));
  }, []);

  return (
    <>
      <AdminHeader
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
      />
      <div className="py-8">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          <div className="xl:col-span-1">
            <AdminSidebar
              adminStats={adminStats}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              AdminNavigationItem={AdminNavigationItem}
            />
          </div>
          <div className="xl:col-span-4">
            {activeTab === 'overview' && (
              <>
                {loadingOverview ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading overview data...</div>
                  </div>
                ) : overviewError ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-red-500">Error: {overviewError}</div>
                  </div>
                ) : (
                  <>
                    <AdminStatCards adminStats={adminStats} verifiedUsers={verifiedUsersCount} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <RecentUsersList recentUsers={recentUsers} Button={Button} />
                      <RecentBookingsList recentBookings={recentBookings} />
                    </div>
                    <div className="mt-8">
                      <RecentTransactionsList limit={5} />
                    </div>
                  </>
                )}
              </>
            )}
            {activeTab === 'items' && (
              <ItemsManagement
                products={products}
                owners={owners}
                loading={loadingProducts}
                itemCategories={itemCategories}
                itemFilter={itemFilter}
                setItemFilter={setItemFilter}
                selectedLocation={selectedLocation}
                selectedItems={selectedItems}
                setSelectedItems={setSelectedItems}
                Button={Button}
                error={productsError || undefined}
              />
            )}
            {activeTab === 'users' && (
              <UserManagement
                Button={Button}
              />
            )}
            {activeTab === 'bookings' && (
              <BookingsManagement />
            )}
            
            {activeTab === 'transactions' && (
              <TransactionsManagement />
            )}
            {activeTab === 'categories' && (
              <CategoriesManagement />
            )}
            {activeTab === 'countries' && (
              <CountriesManagement />
            )}
            {activeTab === 'paymentMethods' && (
              <PaymentMethodsManagement />
            )}
            {activeTab === 'reports' && (
              <ReportsManagement />
            )}
            {activeTab === 'locations' && (
              <LocationsManagement />
            )}
            {activeTab === 'languages' && (
              <LanguagesManagement />
            )}
            {activeTab === 'finances' && (
              <FinancesManagement />
            )}
            {activeTab === 'messaging' && (
              <MessagingManagement />
            )}
            {activeTab === 'notifications' && (
              <NotificationsManagement />
            )}
            {activeTab === 'settings' && (
              <SettingsManagement />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardPage;
