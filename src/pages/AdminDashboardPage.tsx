import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, Users, Car, Calendar, DollarSign, TrendingUp,
  Shield, Settings, Bell, Search, Plus, Eye, Edit3, 
  MoreHorizontal, CheckCircle, FileText, Filter, ArrowUpRight,
  Star
} from 'lucide-react';
import { Button } from '../components/ui/DesignSystem';

// TypeScript interfaces for admin components
interface AdminStatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: string; positive: boolean };
  color: string;
  bgColor: string;
}

interface AdminNavigationItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
  hasNotification?: boolean;
}

const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'cars' | 'users' | 'bookings' | 'finances' | 'reports' | 'settings'>('overview');

  // Mock admin data
  const adminStats = {
    totalUsers: 2847,
    totalCars: 156,
    activeBookings: 89,
    totalRevenue: 125400,
    monthlyGrowth: {
      users: 12.5,
      cars: 8.3,
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
      carName: 'BMW X5 2019',
      carImage: '/assets/img/cars/car-04.jpg',
      customerName: 'Alice Uwimana',
      amount: 450,
      status: 'Active',
      startDate: '2024-07-10',
      endDate: '2024-07-15'
    },
    {
      id: 2,
      bookingId: 'BK-2024-002',
      carName: 'Mercedes C-Class',
      carImage: '/assets/img/cars/car-05.jpg',
      customerName: 'David Nkusi',
      amount: 320,
      status: 'Completed',
      startDate: '2024-07-05',
      endDate: '2024-07-08'
    }
  ];

  const carListings = [
    {
      id: 1,
      name: 'BMW X5 2019',
      image: '/assets/img/cars/car-04.jpg',
      owner: 'John Mukama',
      price: 120,
      status: 'Active',
      bookings: 12,
      rating: 4.8,
      location: 'Kigali'
    },
    {
      id: 2,
      name: 'Mercedes C-Class',
      image: '/assets/img/cars/car-05.jpg',
      owner: 'Sarah Uwimana',
      price: 95,
      status: 'Under Review',
      bookings: 8,
      rating: 4.6,
      location: 'Butare'
    }
  ];

  const AdminStatCard: React.FC<AdminStatCardProps> = ({ icon: Icon, title, value, subtitle, trend, color, bgColor }) => (
    <div className="group relative bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl ${bgColor}`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          {trend && (
            <div className={`flex items-center text-sm font-medium ${
              trend.positive ? 'text-emerald-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`w-4 h-4 mr-1 ${!trend.positive ? 'rotate-180' : ''}`} />
              {trend.value}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{title}</div>
          {subtitle && (
            <div className="flex items-center text-xs text-blue-600 font-medium">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      {/* Admin Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users, cars, bookings..."
                  className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 w-80"
                />
              </div>
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
                <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
              </button>
              <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
                <img 
                  src="/assets/img/profiles/avatar-01.jpg" 
                  alt="Admin" 
                  className="w-8 h-8 rounded-full object-cover" 
                />
                <span className="text-sm font-medium text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
          {/* Admin Sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
              {/* Quick Stats */}
              <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Overview</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Users</span>
                    <span className="font-semibold">{adminStats.totalUsers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Active Cars</span>
                    <span className="font-semibold">{adminStats.totalCars}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Live Bookings</span>
                    <span className="font-semibold">{adminStats.activeBookings}</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                <AdminNavigationItem
                  icon={BarChart3}
                  label="Overview"
                  active={activeTab === 'overview'}
                  onClick={() => setActiveTab('overview')}
                />
                <AdminNavigationItem
                  icon={Car}
                  label="Car Management"
                  active={activeTab === 'cars'}
                  onClick={() => setActiveTab('cars')}
                />
                <AdminNavigationItem
                  icon={Users}
                  label="User Management"
                  active={activeTab === 'users'}
                  onClick={() => setActiveTab('users')}
                  hasNotification={true}
                />
                <AdminNavigationItem
                  icon={Calendar}
                  label="Bookings"
                  active={activeTab === 'bookings'}
                  onClick={() => setActiveTab('bookings')}
                />
                <AdminNavigationItem
                  icon={DollarSign}
                  label="Finances"
                  active={activeTab === 'finances'}
                  onClick={() => setActiveTab('finances')}
                />
                <AdminNavigationItem
                  icon={FileText}
                  label="Reports"
                  active={activeTab === 'reports'}
                  onClick={() => setActiveTab('reports')}
                />
                
                <div className="border-t border-gray-100 pt-4 mt-6">
                  <AdminNavigationItem
                    icon={Settings}
                    label="Settings"
                    active={activeTab === 'settings'}
                    onClick={() => setActiveTab('settings')}
                  />
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-4">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <AdminStatCard
                    icon={Users}
                    title="Total Users"
                    value={adminStats.totalUsers.toLocaleString()}
                    subtitle="View all users"
                    trend={{ value: `+${adminStats.monthlyGrowth.users}%`, positive: true }}
                    color="text-blue-600"
                    bgColor="bg-blue-50"
                  />
                  <AdminStatCard
                    icon={Car}
                    title="Total Cars"
                    value={adminStats.totalCars}
                    subtitle="Manage fleet"
                    trend={{ value: `+${adminStats.monthlyGrowth.cars}%`, positive: true }}
                    color="text-emerald-600"
                    bgColor="bg-emerald-50"
                  />
                  <AdminStatCard
                    icon={Calendar}
                    title="Active Bookings"
                    value={adminStats.activeBookings}
                    subtitle="In progress"
                    trend={{ value: `+${adminStats.monthlyGrowth.bookings}%`, positive: true }}
                    color="text-purple-600"
                    bgColor="bg-purple-50"
                  />
                  <AdminStatCard
                    icon={DollarSign}
                    title="Monthly Revenue"
                    value={`$${adminStats.totalRevenue.toLocaleString()}`}
                    subtitle="This month"
                    trend={{ value: `+${adminStats.monthlyGrowth.revenue}%`, positive: true }}
                    color="text-orange-600"
                    bgColor="bg-orange-50"
                  />
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Users */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Recent Users</h3>
                      <Link 
                        to="#" 
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center group"
                      >
                        View all
                        <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {recentUsers.map((user) => (
                        <div key={user.id} className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                          <div className="relative">
                            <img 
                              src={user.avatar} 
                              alt={user.name} 
                              className="w-12 h-12 rounded-xl object-cover" 
                            />
                            {user.verified && (
                              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                                <CheckCircle className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900">{user.name}</h4>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">
                                {user.role}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-lg ${
                                user.status === 'Active' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {user.status}
                              </span>
                            </div>
                          </div>
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Bookings */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
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
                        <div key={booking.id} className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                          <img 
                            src={booking.carImage} 
                            alt={booking.carName} 
                            className="w-12 h-12 rounded-xl object-cover" 
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm">{booking.carName}</h4>
                            <p className="text-sm text-gray-500">{booking.customerName}</p>
                            <p className="text-xs text-gray-400">{booking.bookingId}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">${booking.amount}</p>
                            <span className={`text-xs px-2 py-1 rounded-lg ${
                              booking.status === 'Active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional tabs content will be added here */}
            {activeTab === 'cars' && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Car Management</h3>
                  <div className="flex items-center space-x-3">
                    <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors flex items-center">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-colors flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Car
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  {carListings.map((car) => (
                    <div key={car.id} className="flex items-center space-x-4 p-6 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                      <img 
                        src={car.image} 
                        alt={car.name} 
                        className="w-20 h-16 rounded-xl object-cover" 
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{car.name}</h4>
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            car.status === 'Active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {car.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">Owner: {car.owner} • {car.location}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>${car.price}/day</span>
                          <span>{car.bookings} bookings</span>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span>{car.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">User Management</h3>
                  <div className="flex items-center space-x-3">
                    <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors flex items-center">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-colors flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                </div>
                
                {/* User Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Total Users</p>
                        <p className="text-2xl font-bold text-blue-700">2,847</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Verified</p>
                        <p className="text-2xl font-bold text-green-700">2,340</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-yellow-600 font-medium">Pending</p>
                        <p className="text-2xl font-bold text-yellow-700">304</p>
                      </div>
                      <Calendar className="w-8 h-8 text-yellow-600" />
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Hosts</p>
                        <p className="text-2xl font-bold text-purple-700">203</p>
                      </div>
                      <Car className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center space-x-4 p-6 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="relative">
                        <img 
                          src={user.avatar} 
                          alt={user.name} 
                          className="w-16 h-16 rounded-xl object-cover" 
                        />
                        {user.verified && (
                          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{user.name}</h4>
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            user.status === 'Active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {user.status}
                          </span>
                          <span className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700">
                            {user.role}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">{user.email}</p>
                        <p className="text-xs text-gray-400">Joined: {user.joinDate}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Booking Management</h3>
                  <div className="flex items-center space-x-3">
                    <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors flex items-center">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center space-x-4 p-6 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                      <img 
                        src={booking.carImage} 
                        alt={booking.carName} 
                        className="w-20 h-16 rounded-xl object-cover" 
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{booking.carName}</h4>
                          <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            booking.status === 'Active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Customer: {booking.customerName}</p>
                        <p className="text-sm text-gray-500">{booking.startDate} - {booking.endDate}</p>
                        <p className="text-xs text-gray-400">Booking ID: {booking.bookingId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">${booking.amount}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {(activeTab === 'finances' || activeTab === 'reports' || activeTab === 'settings') && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    {activeTab === 'users' && <Users className="w-10 h-10 text-gray-400" />}
                    {activeTab === 'bookings' && <Calendar className="w-10 h-10 text-gray-400" />}
                    {activeTab === 'finances' && <DollarSign className="w-10 h-10 text-gray-400" />}
                    {activeTab === 'reports' && <FileText className="w-10 h-10 text-gray-400" />}
                    {activeTab === 'settings' && <Settings className="w-10 h-10 text-gray-400" />}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
                  </h4>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    This section is under development. Advanced {activeTab} management features will be available soon.
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
                    Coming Soon
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
