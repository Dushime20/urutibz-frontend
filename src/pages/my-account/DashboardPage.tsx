import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, Star, 
  Shield, MessageCircle, Plus, TrendingUp,
  BarChart3, Package, Settings,
  Calendar, Heart,
  Car, Wallet, BookOpen, ArrowUpRight,
  Bell, Search, Eye,
  Edit3, MoreHorizontal
} from 'lucide-react';
import { Button } from '../../components/ui/DesignSystem';
import VerificationBanner from '../../components/verification/VerificationBanner';
import { createProduct, createProductImage } from './service/api';
import { useToast } from '../../contexts/ToastContext';

// TypeScript interfaces for component props
interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: boolean;
  color: string;
  bgColor: string;
}

interface NavigationItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
  hasNotification?: boolean;
}

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'listings' | 'wallet' | 'wishlist' | 'reviews'>('overview');
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    category_id: '',
    condition: 'new',
    base_price_per_day: '',
    base_currency: 'USD',
    pickup_methods: [] as string[],
    country_id: '',
    specifications: { processor: '', memory: '', storage: '' },
    image: null as File | null,
    alt_text: '',
    sort_order: '1',
    isPrimary: 'true',
    product_id: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file' && e.target instanceof HTMLInputElement) {
      const input = e.target as HTMLInputElement;
      setForm((prev) => ({ ...prev, image: (input.files && input.files[0]) || null }));
    } else if (name.startsWith('specifications.')) {
      const specKey = name.split('.')[1];
      setForm((prev) => ({ ...prev, specifications: { ...prev.specifications, [specKey]: value } }));
    } else if (name === 'pickup_methods') {
      setForm((prev) => ({ ...prev, pickup_methods: Array.from((e.target as HTMLSelectElement).selectedOptions, (option) => option.value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 1. Create product
      const productPayload = {
        title: form.title,
        slug: form.slug,
        description: form.description,
        category_id: form.category_id,
        condition: form.condition,
        base_price_per_day: parseFloat(form.base_price_per_day),
        base_currency: form.base_currency,
        pickup_methods: form.pickup_methods,
        country_id: form.country_id,
        specifications: form.specifications,
      };
      const productResponse = await createProduct(productPayload);
      const productId = productResponse.data.id;
      console.log('Created productId:', productId);
      setForm((prev) => ({ ...prev, product_id: productId }));
      // 2. Create product image
      if (form.image && productId) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const imagePayload = {
          image: form.image,
          product_id: productId,
          alt_text: form.alt_text,
          sort_order: form.sort_order,
          isPrimary: form.isPrimary,
        };
        await createProductImage(imagePayload);
      }
      showToast('Listing created successfully!', 'success');
      setShowModal(false);
      // Optionally refresh listings here
    } catch (err) {
      showToast('Failed to create listing. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock user data
  const user = {
    name: 'Amara Nkomo',
    avatar: '/assets/img/profiles/avatar-01.jpg',
    location: 'Kigali, Rwanda',
    verified: true,
    rating: 4.9,
    totalRentals: 47,
    totalEarnings: 3240,
    hostLevel: 'Super Host',
    walletBalance: 24665,
    totalTransactions: 15210,
    wishlistItems: 24,
    activeBookings: 3,
    verification: {
      isProfileComplete: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      isIdVerified: true,
      isAddressVerified: true,
      isFullyVerified: true,
      verificationStep: 'complete',
    },
  };

  // Mock data for dashboard sections
  const recentBookings = [
    {
      id: 1,
      carName: 'Ferrari 458 MM Speciale',
      carImage: '/assets/img/cars/car-04.jpg',
      rentType: 'Hourly',
      startDate: '15 Sep 2023, 11:30 PM',
      endDate: '15 Sep 2023, 1:30 PM',
      price: 200,
      status: 'Upcoming',
      statusColor: 'secondary'
    },
    {
      id: 2,
      carName: 'Kia Soul 2016',
      carImage: '/assets/img/cars/car-05.jpg',
      rentType: 'Daily',
      startDate: '10 Sep 2023, 09:00 AM',
      endDate: '12 Sep 2023, 05:00 PM',
      price: 300,
      status: 'Active',
      statusColor: 'primary'
    }
  ];

  const recentTransactions = [
    {
      id: 1,
      carName: 'Hyundai Elantra',
      carImage: '/assets/img/cars/car-06.jpg',
      type: 'Earning',
      amount: 250,
      date: '15 Sep 2023',
      status: 'Completed'
    },
    {
      id: 2,
      carName: 'Chevrolet Pick Truck 3.5L',
      carImage: '/assets/img/cars/car-07.jpg',
      type: 'Refund',
      amount: 150,
      date: '12 Sep 2023',
      status: 'Processing'
    }
  ];

  const wishlistCars = [
    {
      id: 1,
      name: 'BMW M4 Coupe',
      image: '/assets/img/cars/car-04.jpg',
      price: 180,
      rating: 4.8
    },
    {
      id: 2,
      name: 'Mercedes AMG GT',
      image: '/assets/img/cars/car-05.jpg',
      price: 220,
      rating: 4.9
    }
  ];

  const userListings = [
    {
      id: 1,
      name: 'BMW X5 2019',
      image: '/assets/img/cars/car-04.jpg',
      price: 120,
      status: 'Active',
      bookings: 12
    },
    {
      id: 2,
      name: 'Audi Q7 2020',
      image: '/assets/img/cars/car-05.jpg',
      price: 95,
      status: 'Active',
      bookings: 8
    }
  ];

  const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, subtitle, trend, color, bgColor }) => (
    <div className="group relative bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl ${bgColor}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          {trend && <TrendingUp className="w-5 h-5 text-emerald-500" />}
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{title}</div>
          {subtitle && (
            <div className="flex items-center text-xs text-emerald-600 font-medium">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const NavigationItem: React.FC<NavigationItemProps> = ({ icon: Icon, label, active, onClick, hasNotification = false }) => (
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 w-64"
                />
              </div>
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Banner */}
        <div className="mb-8">
          <VerificationBanner />
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
              {/* User Profile */}
              <div className="text-center mb-8">
                <div className="relative inline-block mb-4">
                  <img 
                    src={user.avatar} 
                    alt="User" 
                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-lg" 
                  />
                  {user.verified && (
                    <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-xl p-2 shadow-lg">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{user.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{user.location}</p>
                <div className="flex items-center justify-center space-x-3">
                  <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-lg">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm font-semibold text-yellow-700">{user.rating}</span>
                  </div>
                  <span className="text-xs px-3 py-1 bg-blue-500 text-white rounded-lg font-medium">
                    {user.hostLevel}
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <NavigationItem
                  icon={BarChart3}
                  label="Overview"
                  active={activeTab === 'overview'}
                  onClick={() => setActiveTab('overview')}
                />
                <NavigationItem
                  icon={Calendar}
                  label="My Bookings"
                  active={activeTab === 'bookings'}
                  onClick={() => setActiveTab('bookings')}
                />
                <NavigationItem
                  icon={Car}
                  label="My Listings"
                  active={activeTab === 'listings'}
                  onClick={() => setActiveTab('listings')}
                />
                <NavigationItem
                  icon={Wallet}
                  label="Wallet"
                  active={activeTab === 'wallet'}
                  onClick={() => setActiveTab('wallet')}
                />
                <NavigationItem
                  icon={Heart}
                  label="Wishlist"
                  active={activeTab === 'wishlist'}
                  onClick={() => setActiveTab('wishlist')}
                />
                <NavigationItem
                  icon={BookOpen}
                  label="Reviews"
                  active={activeTab === 'reviews'}
                  onClick={() => setActiveTab('reviews')}
                />
                
                <div className="border-t border-gray-100 pt-4 mt-6">
                  <Link
                    to="/dashboard/messages"
                    className="w-full flex items-center px-4 py-3.5 rounded-2xl font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                  >
                    <MessageCircle className="w-5 h-5 mr-3" />
                    <span className="flex-1">Messages</span>
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  </Link>
                  <Link
                    to="/dashboard/settings"
                    className="w-full flex items-center px-4 py-3.5 rounded-2xl font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    <span>Settings</span>
                  </Link>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-4">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard
                    icon={Package}
                    title="Active Bookings"
                    value={user.activeBookings}
                    subtitle="View all →"
                    trend={true}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                  />
                  <StatCard
                    icon={Wallet}
                    title="Wallet Balance"
                    value={`$${user.walletBalance.toLocaleString()}`}
                    subtitle="Available"
                    trend={true}
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                  />
                  <StatCard
                    icon={DollarSign}
                    title="Total Transactions"
                    value={`$${user.totalTransactions.toLocaleString()}`}
                    subtitle="+12% this month"
                    trend={true}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                  />
                  <StatCard
                    icon={Heart}
                    title="Wishlist Items"
                    value={user.wishlistItems}
                    subtitle="Cars saved"
                    trend={false}
                    color="text-pink-600"
                    bgColor="bg-pink-50"
                  />
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Recent Bookings */}
                  <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
                      <Link 
                        to="#" 
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center group"
                      >
                        View all
                        <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {recentBookings.map((booking) => (
                        <div key={booking.id} className="group flex items-center space-x-4 p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-all duration-200">
                          <div className="relative">
                            <img 
                              src={booking.carImage} 
                              alt={booking.carName} 
                              className="w-16 h-12 rounded-xl object-cover" 
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors duration-200"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">{booking.carName}</h4>
                            <p className="text-sm text-gray-500">{booking.startDate}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">${booking.price}</p>
                            <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-medium ${
                              booking.status === 'Upcoming' 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Transactions */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Transactions</h3>
                      <Link 
                        to="#" 
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center group"
                      >
                        View all
                        <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                          <div className="w-10 h-10 rounded-xl overflow-hidden">
                            <img 
                              src={transaction.carImage} 
                              alt={transaction.carName} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{transaction.type}</p>
                            <p className="text-xs text-gray-500">{transaction.date}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold text-sm ${
                              transaction.type === 'Earning' ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'Earning' ? '+' : '-'}${transaction.amount}
                            </p>
                            <p className="text-xs text-gray-500">{transaction.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">My Bookings</h3>
                  <div className="flex items-center space-x-2">
                    <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors">
                      All
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors">
                      Active
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors">
                      Completed
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center space-x-4 p-6 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                      <img 
                        src={booking.carImage} 
                        alt={booking.carName} 
                        className="w-24 h-18 rounded-xl object-cover" 
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{booking.carName}</h4>
                        <p className="text-sm text-gray-500 mb-2">{booking.startDate} - {booking.endDate}</p>
                        <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-medium ${
                          booking.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-gray-900">${booking.price}</p>
                        <button className="mt-2 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'listings' && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">My Listings</h3>
                  <Button className="bg-[#01aaa7] hover:bg-[#019c98] text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center" onClick={() => setShowModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Listing
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {userListings.map((listing) => (
                    <div key={listing.id} className="group relative bg-gray-50 rounded-2xl p-6 hover:bg-gray-100/50 transition-all duration-300">
                      <img 
                        src={listing.image} 
                        alt={listing.name} 
                        className="w-full h-40 rounded-xl object-cover mb-4 group-hover:scale-105 transition-transform duration-300" 
                      />
                      <h4 className="font-semibold text-gray-900 mb-3">{listing.name}</h4>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-bold text-gray-900">${listing.price}/day</span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                          listing.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {listing.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">{listing.bookings} bookings this month</p>
                      <div className="flex space-x-2">
                        <button className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        <button className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-300 transition-colors">
                          <Edit3 className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'wallet' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative">
                      <h4 className="text-lg font-semibold mb-2 opacity-90">Available Balance</h4>
                      <p className="text-3xl font-bold mb-4">${user.walletBalance.toLocaleString()}</p>
                      <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                        Withdraw Funds
                      </button>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="relative">
                      <h4 className="text-lg font-semibold mb-2 opacity-90">Total Earnings</h4>
                      <p className="text-3xl font-bold mb-4">${user.totalEarnings.toLocaleString()}</p>
                      <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-6">Recent Transactions</h4>
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center space-x-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                        <img 
                          src={transaction.carImage} 
                          alt={transaction.carName} 
                          className="w-16 h-12 rounded-xl object-cover" 
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{transaction.carName}</h4>
                          <p className="text-sm text-gray-500">{transaction.date}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${
                            transaction.type === 'Earning' ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'Earning' ? '+' : '-'}${transaction.amount}
                          </p>
                          <span className="text-xs text-gray-500">{transaction.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">My Wishlist</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistCars.map((car) => (
                    <div key={car.id} className="group bg-gray-50 rounded-2xl p-6 hover:bg-gray-100/50 transition-all duration-300">
                      <div className="relative mb-4">
                        <img 
                          src={car.image} 
                          alt={car.name} 
                          className="w-full h-40 rounded-xl object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-lg hover:bg-white transition-colors">
                          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                        </button>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{car.name}</h4>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-gray-900">${car.price}/day</span>
                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm font-semibold text-yellow-700">{car.rating}</span>
                        </div>
                      </div>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-medium transition-colors">
                        Book Now
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Reviews</h3>
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="w-10 h-10 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">No Reviews Yet</h4>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Start renting cars to receive reviews from hosts and renters. 
                    Your reviews will help build trust with the community.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
                    Browse Cars
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modal for new listing */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={() => setShowModal(false)}>&times;</button>
            <h2 className="text-2xl font-bold mb-4 text-[#01aaa7]">Add New Listing</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <input name="title" value={form.title} onChange={handleInputChange} required placeholder="Title" className="w-full border rounded-lg px-4 py-2" />
                <input name="slug" value={form.slug} onChange={handleInputChange} required placeholder="Slug" className="w-full border rounded-lg px-4 py-2" />
                <textarea name="description" value={form.description} onChange={handleInputChange} required placeholder="Description" className="w-full border rounded-lg px-4 py-2" />
                <input name="category_id" value={form.category_id} onChange={handleInputChange} required placeholder="Category ID" className="w-full border rounded-lg px-4 py-2" />
                <select name="condition" value={form.condition} onChange={handleInputChange} className="w-full border rounded-lg px-4 py-2">
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
                <input name="base_price_per_day" value={form.base_price_per_day} onChange={handleInputChange} required placeholder="Price per day" type="number" className="w-full border rounded-lg px-4 py-2" />
                <input name="base_currency" value={form.base_currency} onChange={handleInputChange} required placeholder="Currency" className="w-full border rounded-lg px-4 py-2" />
              </div>
              <div className="space-y-4">
                <select name="pickup_methods" multiple value={form.pickup_methods} onChange={handleInputChange} className="w-full border rounded-lg px-4 py-2">
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                </select>
                <input name="country_id" value={form.country_id} onChange={handleInputChange} required placeholder="Country ID" className="w-full border rounded-lg px-4 py-2" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input name="specifications.processor" value={form.specifications.processor} onChange={handleInputChange} required placeholder="Processor" className="border rounded-lg px-4 py-2" />
                  <input name="specifications.memory" value={form.specifications.memory} onChange={handleInputChange} required placeholder="Memory" className="border rounded-lg px-4 py-2" />
                  <input name="specifications.storage" value={form.specifications.storage} onChange={handleInputChange} required placeholder="Storage" className="border rounded-lg px-4 py-2" />
                </div>
                <input name="alt_text" value={form.alt_text} onChange={handleInputChange} required placeholder="Image Alt Text" className="w-full border rounded-lg px-4 py-2" />
                <input name="sort_order" value={form.sort_order} onChange={handleInputChange} required placeholder="Sort Order" className="w-full border rounded-lg px-4 py-2" />
                <input name="isPrimary" value={form.isPrimary} onChange={handleInputChange} required placeholder="Is Primary (true/false)" className="w-full border rounded-lg px-4 py-2" />
                <input name="product_id" value={form.product_id} readOnly placeholder="Product ID (auto)" className="w-full border rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed" />
                <input name="image" type="file" accept="image/*" onChange={handleInputChange} required className="w-full border rounded-lg px-4 py-2" />
              </div>
              <div className="col-span-1 md:col-span-2">
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#01aaa7] text-white py-3 rounded-lg font-semibold hover:bg-[#019c98] transition-colors">
                  {isSubmitting ? 'Submitting...' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;