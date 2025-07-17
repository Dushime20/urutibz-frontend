import React, { useState, useEffect } from 'react';

import { Button } from '../../components/ui/DesignSystem';
import { itemCategories } from '../../data/mockRentalData';
import { fetchAllProducts, fetchUserById } from './service/api';
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
import { Camera, Gamepad2, Laptop } from 'lucide-react';


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
  const [activeTab, setActiveTab] = useState<'overview' | 'items' | 'users' | 'bookings' | 'finances' | 'reports' | 'settings' | 'locations' | 'languages' | 'messaging' | 'notifications'>('overview');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [itemFilter, setItemFilter] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [products, setProducts] = useState<Product[]>([]);
  const [owners, setOwners] = useState<Record<string, Owner>>({});
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);

  // Mock admin data
  const adminStats = {
    totalUsers: 2847,
    totalItems: 1256,
    activeBookings: 89,
    totalRevenue: 125400,
    monthlyGrowth: {
      users: 12.5,
      items: 8.3,
      bookings: 15.7,
      revenue: 22.1
    }
  };

  // Mock data for admin sections
  const recentUsers = [
    {
      id: 1,
      name: 'John Mukama',
      email: 'john@example.com',
      avatar: '/assets/img/profiles/avatar-01.jpg',
      role: 'Host',
      status: 'Active',
      joinDate: '2024-07-05',
      verified: true
    },
    {
      id: 2,
      name: 'Sarah Uwimana',
      email: 'sarah@example.com',
      avatar: '/assets/img/profiles/avatar-02.jpg',
      role: 'Renter',
      status: 'Pending',
      joinDate: '2024-07-08',
      verified: false
    }
  ];

  const recentBookings = [
    {
      id: 1,
      bookingId: 'BK-2024-001',
      itemName: 'Canon EOS R5 Camera',
      itemImage: '/assets/img/items/camera-01.jpg',
      customerName: 'Alice Uwimana',
      amount: 85,
      status: 'Active',
      startDate: '2024-07-10',
      endDate: '2024-07-15',
      category: 'Photography',
      icon: Camera
    },
    {
      id: 2,
      bookingId: 'BK-2024-002',
      itemName: 'MacBook Pro 16"',
      itemImage: '/assets/img/items/laptop-01.jpg',
      customerName: 'David Nkusi',
      amount: 120,
      status: 'Completed',
      startDate: '2024-07-05',
      endDate: '2024-07-08',
      category: 'Electronics',
      icon: Laptop
    },
    {
      id: 3,
      bookingId: 'BK-2024-003',
      itemName: 'PlayStation 5',
      itemImage: '/assets/img/items/gaming-01.jpg',
      customerName: 'Sarah Mukisa',
      amount: 45,
      status: 'Active',
      startDate: '2024-07-12',
      endDate: '2024-07-18',
      category: 'Gaming',
      icon: Gamepad2
    }
  ];

  // Use real rental items data

  // Helper function to get category icon

  // Multi-location and Multi-language data


  // Messaging and Communication data






  const AdminNavigationItem: React.FC<AdminNavigationItemProps> = ({ icon: Icon, label, active, onClick, hasNotification = false }) => (
    <button
      onClick={onClick}
      className={`group relative w-full flex items-center px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 ${
        active
          ? 'text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <AdminStatCards adminStats={adminStats} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <RecentUsersList recentUsers={recentUsers} Button={Button} />
                  <RecentBookingsList recentBookings={recentBookings} />
                </div>
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
                recentUsers={recentUsers}
                Button={Button}
              />
            )}
            {activeTab === 'bookings' && (
              <BookingsManagement
                recentBookings={recentBookings}
              />
            )}
            {activeTab === 'finances' && (
              <FinancesManagement />
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
