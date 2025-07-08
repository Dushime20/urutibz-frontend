import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, Star, 
  Shield, MessageCircle, Plus, TrendingUp,
  BarChart3, Award, Package, Settings,
  Calendar, Heart,
  Car, Wallet, BookOpen
} from 'lucide-react';
import { Button } from '../components/ui/DesignSystem';
import VerificationBanner from '../components/verification/VerificationBanner';

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'listings' | 'wallet' | 'wishlist' | 'reviews'>('overview');

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background-color)' }}>
      {/* Improved Content Layout with better padding and responsive design */}
      <div className="py-6 sm:py-8 lg:py-12">
        <div className="content space-y-6">
          {/* Verification Banner */}
          <VerificationBanner />
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Sidebar with responsive design */}
            <div className="lg:col-span-1">
              <div className="p-4 sm:p-6 lg:sticky lg:top-6 bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg rounded-2xl">
                {/* User Profile - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row sm:items-center lg:flex-col lg:items-start mb-6 pb-6 border-b" style={{ borderColor: 'var(--color-platform-light-grey)' }}>
                  <div className="relative mb-4 sm:mb-0 sm:mr-4 lg:mr-0 lg:mb-4 self-center sm:self-auto lg:self-start">
                    <img src={user.avatar} alt="User" className="w-16 h-16 rounded-full" />
                    {user.verified && (
                      <div className="absolute -bottom-1 -right-1 rounded-full p-1" style={{ backgroundColor: 'var(--color-active)' }}>
                        <Shield className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="text-center sm:text-left lg:text-left">
                    <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--foreground-color)' }}>{user.name}</h3>
                    <p className="text-sm mb-2" style={{ color: 'var(--color-platform-grey)' }}>{user.location}</p>
                    <div className="flex items-center justify-center sm:justify-start lg:justify-start space-x-2">
                      <div className="flex items-center">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-xs font-medium">{user.rating}</span>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full" style={{ 
                        backgroundColor: 'var(--color-active)', 
                        color: 'white' 
                      }}>
                        {user.hostLevel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === 'overview'
                        ? 'text-white shadow-lg'
                        : 'hover:bg-white/50'
                    }`}
                    style={{
                      backgroundColor: activeTab === 'overview' ? 'var(--color-active)' : 'transparent',
                      color: activeTab === 'overview' ? 'white' : 'var(--color-platform-grey)'
                    }}
                  >
                    <BarChart3 className="w-5 h-5 mr-3" />
                    <span>Overview</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === 'bookings'
                        ? 'text-white shadow-lg'
                        : 'hover:bg-white/50'
                    }`}
                    style={{
                      backgroundColor: activeTab === 'bookings' ? 'var(--color-active)' : 'transparent',
                      color: activeTab === 'bookings' ? 'white' : 'var(--color-platform-grey)'
                    }}
                  >
                    <Calendar className="w-5 h-5 mr-3" />
                    <span>My Bookings</span>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('listings')}
                    className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === 'listings'
                        ? 'text-white shadow-lg'
                        : 'hover:bg-white/50'
                    }`}
                    style={{
                      backgroundColor: activeTab === 'listings' ? 'var(--color-active)' : 'transparent',
                      color: activeTab === 'listings' ? 'white' : 'var(--color-platform-grey)'
                    }}
                  >
                    <Car className="w-5 h-5 mr-3" />
                    <span>My Listings</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('wallet')}
                    className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === 'wallet'
                        ? 'text-white shadow-lg'
                        : 'hover:bg-white/50'
                    }`}
                    style={{
                      backgroundColor: activeTab === 'wallet' ? 'var(--color-active)' : 'transparent',
                      color: activeTab === 'wallet' ? 'white' : 'var(--color-platform-grey)'
                    }}
                  >
                    <Wallet className="w-5 h-5 mr-3" />
                    <span>Wallet</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('wishlist')}
                    className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === 'wishlist'
                        ? 'text-white shadow-lg'
                        : 'hover:bg-white/50'
                    }`}
                    style={{
                      backgroundColor: activeTab === 'wishlist' ? 'var(--color-active)' : 'transparent',
                      color: activeTab === 'wishlist' ? 'white' : 'var(--color-platform-grey)'
                    }}
                  >
                    <Heart className="w-5 h-5 mr-3" />
                    <span>Wishlist</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === 'reviews'
                        ? 'text-white shadow-lg'
                        : 'hover:bg-white/50'
                    }`}
                    style={{
                      backgroundColor: activeTab === 'reviews' ? 'var(--color-active)' : 'transparent',
                      color: activeTab === 'reviews' ? 'white' : 'var(--color-platform-grey)'
                    }}
                  >
                    <BookOpen className="w-5 h-5 mr-3" />
                    <span>Reviews</span>
                  </button>

                  <Link
                    to="/dashboard/messages"
                    className="w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:bg-white/50"
                    style={{ color: 'var(--color-platform-grey)' }}
                  >
                    <MessageCircle className="w-5 h-5 mr-3" />
                    <span>Messages</span>
                    <div className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-platform-error)' }}></div>
                  </Link>

                  <Link
                    to="/dashboard/settings"
                    className="w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 hover:bg-white/50 mt-6"
                    style={{ color: 'var(--color-platform-grey)' }}
                  >
                    <Settings className="w-5 h-5 mr-3" />
                    <span>Settings</span>
                  </Link>
                </nav>
              </div>
            </div>

            {/* Main Content with improved spacing */}
            <div className="lg:col-span-3">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Stats Cards - Mobile Optimized */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/50 shadow-lg">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="p-2 sm:p-3 rounded-xl" style={{ backgroundColor: 'var(--color-active)', opacity: 0.1 }}>
                          <Package className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: 'var(--color-active)' }} />
                        </div>
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold mb-1" style={{ color: 'var(--foreground-color)' }}>{user.activeBookings}</div>
                      <div className="text-xs sm:text-sm" style={{ color: 'var(--color-platform-grey)' }}>My Bookings</div>
                      <Link to="#" className="text-xs hidden sm:block mt-2" style={{ color: 'var(--color-active)' }}>View all →</Link>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/50 shadow-lg">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="p-2 sm:p-3 rounded-xl bg-yellow-100">
                          <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                        </div>
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold mb-1" style={{ color: 'var(--foreground-color)' }}>${user.walletBalance.toLocaleString()}</div>
                      <div className="text-xs sm:text-sm" style={{ color: 'var(--color-platform-grey)' }}>Wallet Balance</div>
                      <Link to="#" className="text-xs text-yellow-600 hidden sm:block mt-2">View Balance →</Link>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/50 shadow-lg">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="p-2 sm:p-3 rounded-xl bg-green-100">
                          <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                        </div>
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold mb-1" style={{ color: 'var(--foreground-color)' }}>${user.totalTransactions.toLocaleString()}</div>
                      <div className="text-xs sm:text-sm" style={{ color: 'var(--color-platform-grey)' }}>Transactions</div>
                      <Link to="#" className="text-xs text-green-600 hidden sm:block mt-2">View all →</Link>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/50 shadow-lg">
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="p-2 sm:p-3 rounded-xl bg-red-100">
                          <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                        </div>
                        <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                      </div>
                      <div className="text-xl sm:text-2xl font-bold mb-1" style={{ color: 'var(--foreground-color)' }}>{user.wishlistItems}</div>
                      <div className="text-xs sm:text-sm" style={{ color: 'var(--color-platform-grey)' }}>Wishlist</div>
                      <Link to="#" className="text-xs text-red-600 hidden sm:block mt-2">Go to Wishlist →</Link>
                    </div>
                  </div>

                  {/* Recent Bookings & Transactions */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Last 5 Bookings */}
                    <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold" style={{ color: 'var(--foreground-color)' }}>Recent Bookings</h3>
                        <Link to="#" className="text-sm" style={{ color: 'var(--color-active)' }}>View all</Link>
                      </div>
                      <div className="space-y-4">
                        {recentBookings.map((booking) => (
                          <div key={booking.id} className="flex items-center space-x-4 p-4 rounded-xl bg-gray-50/50">
                            <img src={booking.carImage} alt={booking.carName} className="w-16 h-12 rounded-lg object-cover" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{booking.carName}</h4>
                              <p className="text-xs text-gray-500">{booking.startDate}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">${booking.price}</p>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                booking.status === 'Upcoming' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold" style={{ color: 'var(--foreground-color)' }}>Transactions</h3>
                        <Link to="#" className="text-sm" style={{ color: 'var(--color-active)' }}>View all</Link>
                      </div>
                      <div className="space-y-4">
                        {recentTransactions.map((transaction) => (
                          <div key={transaction.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50/50">
                            <div className="w-8 h-8">
                              <img src={transaction.carImage} alt={transaction.carName} className="w-full h-full rounded object-cover" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{transaction.type}</p>
                              <p className="text-xs text-gray-500">{transaction.date}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-semibold text-sm ${
                                transaction.type === 'Earning' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.type === 'Earning' ? '+' : '-'}${transaction.amount}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                  <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--foreground-color)' }}>My Bookings</h3>
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center space-x-4 p-4 rounded-xl border">
                        <img src={booking.carImage} alt={booking.carName} className="w-20 h-16 rounded-lg object-cover" />
                        <div className="flex-1">
                          <h4 className="font-semibold">{booking.carName}</h4>
                          <p className="text-sm text-gray-500">{booking.startDate} - {booking.endDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${booking.price}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            booking.status === 'Upcoming' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'listings' && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold" style={{ color: 'var(--foreground-color)' }}>My Listings</h3>
                    <Button className="btn-primary flex items-center">
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Listing
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userListings.map((listing) => (
                      <div key={listing.id} className="border border-gray-200 rounded-xl p-4">
                        <img src={listing.image} alt={listing.name} className="w-full h-32 rounded-lg object-cover mb-4" />
                        <h4 className="font-semibold mb-2">{listing.name}</h4>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold">${listing.price}/day</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            listing.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {listing.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">{listing.bookings} bookings</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'wallet' && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                  <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--foreground-color)' }}>Wallet</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white">
                      <h4 className="text-lg font-semibold mb-2">Available Balance</h4>
                      <p className="text-3xl font-bold">${user.walletBalance.toLocaleString()}</p>
                    </div>
                    <div className="p-6 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl text-white">
                      <h4 className="text-lg font-semibold mb-2">Total Earnings</h4>
                      <p className="text-3xl font-bold">${user.totalEarnings.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Recent Transactions</h4>
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center space-x-4 p-4 rounded-xl border">
                        <img src={transaction.carImage} alt={transaction.carName} className="w-16 h-12 rounded-lg object-cover" />
                        <div className="flex-1">
                          <h4 className="font-semibold">{transaction.carName}</h4>
                          <p className="text-sm text-gray-500">{transaction.date}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'Earning' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'Earning' ? '+' : '-'}${transaction.amount}
                          </p>
                          <span className="text-xs text-gray-500">{transaction.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'wishlist' && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                  <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--foreground-color)' }}>My Wishlist</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistCars.map((car) => (
                      <div key={car.id} className="border border-gray-200 rounded-xl p-4">
                        <img src={car.image} alt={car.name} className="w-full h-32 rounded-lg object-cover mb-4" />
                        <h4 className="font-semibold mb-2">{car.name}</h4>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-lg font-bold">${car.price}/day</span>
                          <div className="flex items-center">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-sm">{car.rating}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button className="btn-primary flex-1">Book Now</Button>
                          <Button className="btn-outline p-2">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
                  <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--foreground-color)' }}>Reviews</h3>
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h4 className="text-lg font-semibold text-gray-600 mb-2">No Reviews Yet</h4>
                    <p className="text-gray-500">Start renting cars to receive reviews from hosts and renters.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
