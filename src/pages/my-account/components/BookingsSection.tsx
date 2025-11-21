import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin, DollarSign, Hash, User, CheckCircle, XCircle, AlertCircle, Loader2, Filter, X } from 'lucide-react';
import { formatDateUTC } from '../../../utils/dateUtils';
import { formatDate, formatDateTime, calculateDays, formatCurrency } from '../../../lib/utils';
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';

interface Props {
  loadingBookings: boolean;
  userBookings: any[];
  navigateToBrowse: () => void;
  bookingProducts: { [k: string]: any };
  bookingImages: { [k: string]: any[] };
  bookingReviewCounts: { [k: string]: number };
  onViewBookingReview: (bookingId: string) => void;
  onConfirmBooking?: (bookingId: string) => void;
  onCancelBooking?: (bookingId: string) => void;
  onReviewCancellation?: (bookingId: string) => void;
  onCheckIn?: (bookingId: string) => void;
  onCheckOut?: (bookingId: string) => void;
}

const BookingsSection: React.FC<Props> = ({
  loadingBookings,
  userBookings,
  navigateToBrowse,
  bookingProducts,
  bookingImages,
  bookingReviewCounts,
  onViewBookingReview,
  onConfirmBooking,
  onCancelBooking,
  onReviewCancellation,
  onCheckIn,
  onCheckOut,
}) => {
  const { tSync } = useTranslation();
  const [roleTab, setRoleTab] = useState<'all' | 'renter' | 'owner'>('all');
  const [timeTab, setTimeTab] = useState<'recent' | 'all'>('recent');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  // Console log user bookings to see the response data
  useEffect(() => {
    console.log('📋 [BookingsSection] User Bookings Data:', {
      totalBookings: userBookings.length,
      bookings: userBookings.map((booking) => ({
        id: booking.id,
        booking_number: booking.booking_number,
        status: booking.status,
        payment_status: booking.payment_status,
        renter_id: booking.renter_id || booking.renterId,
        owner_id: booking.owner_id || booking.ownerId,
        product_id: booking.product_id,
        start_date: booking.start_date,
        end_date: booking.end_date,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
        fullBooking: booking // Full booking object for detailed inspection
      }))
    });
  }, [userBookings]);

  const currentUserId = useMemo(() => {
    try {
      const rawUser = localStorage.getItem('user') || localStorage.getItem('authUser');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        return parsed?.id || parsed?.user?.id || '';
      }
    } catch {}
    return '';
  }, []);

  // Helper function to check if a booking is from this week
  const isBookingFromThisWeek = useCallback((booking: any): boolean => {
    if (!booking.created_at) return false;
    try {
      const bookingDate = new Date(booking.created_at);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return bookingDate >= weekAgo && bookingDate <= now;
    } catch {
      return false;
    }
  }, []);

  // Helper function to check if booking is within date range
  const isBookingInDateRange = useCallback((booking: any): boolean => {
    if (!filterStartDate && !filterEndDate) return true;
    
    try {
      const bookingStartDate = booking.start_date ? new Date(booking.start_date) : null;
      const bookingEndDate = booking.end_date ? new Date(booking.end_date) : null;
      const bookingCreatedDate = booking.created_at ? new Date(booking.created_at) : null;
      
      // Use booking dates or created date for filtering
      const relevantDate = bookingStartDate || bookingCreatedDate;
      if (!relevantDate) return true;
      
      const filterStart = filterStartDate ? new Date(filterStartDate) : null;
      const filterEnd = filterEndDate ? new Date(filterEndDate) : null;
      
      // Reset time to start of day for accurate comparison
      if (filterStart) filterStart.setHours(0, 0, 0, 0);
      if (filterEnd) filterEnd.setHours(23, 59, 59, 999);
      relevantDate.setHours(0, 0, 0, 0);
      
      // Check if booking date falls within range
      if (filterStart && filterEnd) {
        return relevantDate >= filterStart && relevantDate <= filterEnd;
      } else if (filterStart) {
        return relevantDate >= filterStart;
      } else if (filterEnd) {
        return relevantDate <= filterEnd;
      }
      
      return true;
    } catch {
      return true;
    }
  }, [filterStartDate, filterEndDate]);

  const roleFilteredBookings = useMemo(() => {
    let filtered = userBookings;
    
    // First filter by role
    if (roleTab !== 'all' && currentUserId) {
      filtered = userBookings.filter((b) => {
        const renterId = b.renterId || b.renter_id;
        const ownerId = b.ownerId || b.owner_id;
        return roleTab === 'renter' ? String(renterId) === String(currentUserId) : String(ownerId) === String(currentUserId);
      });
    }
    
    // Then filter by time period
    if (timeTab === 'recent') {
      filtered = filtered.filter(isBookingFromThisWeek);
    }
    
    // Filter by date range if set
    if (filterStartDate || filterEndDate) {
      filtered = filtered.filter(isBookingInDateRange);
    }
    
    // Sort by most recent (newest first) - using created_at or updated_at
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.created_at || a.updated_at || 0).getTime();
      const dateB = new Date(b.created_at || b.updated_at || 0).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
    
    return filtered;
  }, [roleTab, timeTab, userBookings, currentUserId, isBookingFromThisWeek, filterStartDate, filterEndDate, isBookingInDateRange]);

  // Clear date filter
  const clearDateFilter = useCallback(() => {
    setFilterStartDate('');
    setFilterEndDate('');
  }, []);

  const { allCount, renterCount, ownerCount } = useMemo(() => {
    const allCountVal = userBookings.length;
    if (!currentUserId) return { allCount: allCountVal, renterCount: allCountVal, ownerCount: allCountVal };
    const renterCountVal = userBookings.filter((b) => String(b.renterId || b.renter_id) === String(currentUserId)).length;
    const ownerCountVal = userBookings.filter((b) => String(b.ownerId || b.owner_id) === String(currentUserId)).length;
    return { allCount: allCountVal, renterCount: renterCountVal, ownerCount: ownerCountVal };
  }, [userBookings, currentUserId]);

  // Count bookings for time tabs
  const { recentCount, allTimeCount } = useMemo(() => {
    let filtered = userBookings;
    
    // Filter by role first
    if (roleTab !== 'all' && currentUserId) {
      filtered = userBookings.filter((b) => {
        const renterId = b.renterId || b.renter_id;
        const ownerId = b.ownerId || b.owner_id;
        return roleTab === 'renter' ? String(renterId) === String(currentUserId) : String(ownerId) === String(currentUserId);
      });
    }
    
    const recentCountVal = filtered.filter(isBookingFromThisWeek).length;
    const allTimeCountVal = filtered.length;
    
    return { recentCount: recentCountVal, allTimeCount: allTimeCountVal };
  }, [roleTab, userBookings, currentUserId, isBookingFromThisWeek]);

  // Intentionally do not auto-fetch reviews; only fetch on click

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 hidden sm:block"><TranslatedText text="My Bookings" /></h3>
        <div className="flex items-center space-x-2 overflow-x-auto flex-1 sm:flex-none whitespace-nowrap">
          <button
            onClick={() => setRoleTab('all')}
            className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-colors whitespace-nowrap ${roleTab === 'all' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'}`}
          ><TranslatedText text="All" /> {roleTab === 'all' && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">{allCount}</span>}</button>
          <button
            onClick={() => setRoleTab('renter')}
            className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-colors whitespace-nowrap ${roleTab === 'renter' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'}`}
          ><TranslatedText text="Renter" /> {roleTab === 'renter' && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">{renterCount}</span>}</button>
          <button
            onClick={() => setRoleTab('owner')}
            className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-colors whitespace-nowrap ${roleTab === 'owner' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'}`}
          ><TranslatedText text="Owner" /> {roleTab === 'owner' && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">{ownerCount}</span>}</button>
        </div>
      </div>
      
      {/* Time Period Sub-tabs */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-4 flex-wrap">
        <div className="flex items-center space-x-2 overflow-x-auto flex-1">
          <button
            onClick={() => setTimeTab('recent')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors whitespace-nowrap ${timeTab === 'recent' ? 'bg-[#0c9488] text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'}`}
          >
            <TranslatedText text="Recent Booking" />
            {timeTab === 'recent' && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">{recentCount}</span>}
          </button>
          <button
            onClick={() => setTimeTab('all')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors whitespace-nowrap ${timeTab === 'all' ? 'bg-[#0c9488] text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'}`}
          >
            <TranslatedText text="All Booking" />
            {timeTab === 'all' && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">{allTimeCount}</span>}
          </button>
        </div>
        
        {/* Date Filter Toggle Button */}
        <button
          onClick={() => setShowDateFilter(!showDateFilter)}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors whitespace-nowrap ${
            (filterStartDate || filterEndDate) 
              ? 'bg-[#0c9488] text-white' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 border border-gray-300 dark:border-slate-600'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span><TranslatedText text="Filter by Date" /></span>
          {(filterStartDate || filterEndDate) && (
            <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/20 text-xs font-semibold">1</span>
          )}
        </button>
      </div>

      {/* Date Filter Panel */}
      {showDateFilter && (
        <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-xl border border-gray-200 dark:border-slate-600 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#0c9488]" />
              <span><TranslatedText text="Filter by Date Range" /></span>
            </h4>
            <button
              onClick={() => setShowDateFilter(false)}
              className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-2">
                <TranslatedText text="Start Date" />
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0c9488] focus:border-[#0c9488] transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-2">
                <TranslatedText text="End Date" />
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  min={filterStartDate || undefined}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0c9488] focus:border-[#0c9488] transition-all"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600 dark:text-slate-400">
              {(filterStartDate || filterEndDate) && (
                <span>
                  <TranslatedText text="Showing bookings" />{' '}
                  {filterStartDate && filterEndDate 
                    ? `${formatDate(filterStartDate)} - ${formatDate(filterEndDate)}`
                    : filterStartDate 
                    ? `${formatDate(filterStartDate)} ${tSync('onwards')}`
                    : `${tSync('until')} ${formatDate(filterEndDate)}`
                  }
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {(filterStartDate || filterEndDate) && (
                <button
                  onClick={clearDateFilter}
                  className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                  <span><TranslatedText text="Clear Filter" /></span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="space-y-4">
        {loadingBookings ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-100 rounded-2xl p-4 sm:p-6 dark:border-slate-700">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-24 h-18 bg-gray-200 rounded-xl animate-pulse dark:bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse dark:bg-slate-700" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse dark:bg-slate-700" />
                    <div className="h-6 bg-gray-200 rounded w-20 animate-pulse dark:bg-slate-700" />
                  </div>
                  <div className="w-24 h-6 bg-gray-200 rounded animate-pulse dark:bg-slate-700" />
                </div>
                <div className="border-t border-gray-100 pt-4 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse dark:bg-slate-700" />
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse dark:bg-slate-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : roleFilteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-slate-800">
              <Calendar className="w-10 h-10 text-gray-400 dark:text-slate-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2 dark:text-slate-300"><TranslatedText text="No bookings found" /></h4>
            <p className="text-gray-500 mb-6 dark:text-slate-400"><TranslatedText text="You haven't made any bookings yet. Start exploring and book your first item." /></p>
            <button onClick={navigateToBrowse} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"><TranslatedText text="Browse Items" /></button>
          </div>
        ) : (
          roleFilteredBookings.map((booking) => {
            const product = bookingProducts[booking.id];
            const images = bookingImages[booking.id] || [];
            const reviewCount = bookingReviewCounts[booking.id] || 0;
            
            // Calculate booking duration
            const days = booking.start_date && booking.end_date ? calculateDays(booking.start_date, booking.end_date) : 0;
            const totalPrice = product?.base_price_per_day ? product.base_price_per_day * days : 0;
            
            // Extract time from booking (pickup_time, return_time, or from datetime strings)
            const getTimeFromString = (dateTimeStr: string | null | undefined): string | null => {
              if (!dateTimeStr) return null;
              try {
                const date = new Date(dateTimeStr);
                const hours = String(date.getUTCHours()).padStart(2, '0');
                const minutes = String(date.getUTCMinutes()).padStart(2, '0');
                return `${hours}:${minutes}`;
              } catch {
                return null;
              }
            };
            
            // Get times - check pickup_time/return_time first, then extract from datetime strings
            const startTime = booking.pickup_time || 
                            (booking.start_date && booking.start_date.includes('T') ? getTimeFromString(booking.start_date) : null) ||
                            (booking.start_time || null);
            const endTime = booking.return_time || 
                          (booking.end_date && booking.end_date.includes('T') ? getTimeFromString(booking.end_date) : null) ||
                          (booking.end_time || null);
            
            // Check if this is an hourly booking (has times specified)
            const isHourlyBooking = !!(startTime || endTime);
            
            // Status configuration with icons
            const getStatusConfig = (status: string) => {
              const configs: { [key: string]: { bg: string; text: string; icon: any; label: string } } = {
                pending: { bg: 'bg-yellow-50 dark:bg-yellow-900/10', text: 'text-yellow-700 dark:text-yellow-400', icon: Loader2, label: 'Pending' },
                confirmed: { bg: 'bg-blue-50 dark:bg-blue-900/10', text: 'text-blue-700 dark:text-blue-400', icon: CheckCircle, label: 'Confirmed' },
                cancellation_requested: { bg: 'bg-orange-50 dark:bg-orange-900/10', text: 'text-orange-700 dark:text-orange-400', icon: AlertCircle, label: 'Cancellation Requested' },
                in_progress: { bg: 'bg-purple-50 dark:bg-purple-900/10', text: 'text-purple-700 dark:text-purple-400', icon: Clock, label: 'In Progress' },
                completed: { bg: 'bg-green-50 dark:bg-green-900/10', text: 'text-green-700 dark:text-green-400', icon: CheckCircle, label: 'Completed' },
                cancelled: { bg: 'bg-red-50 dark:bg-red-900/10', text: 'text-red-700 dark:text-red-400', icon: XCircle, label: 'Cancelled' },
                disputed: { bg: 'bg-orange-50 dark:bg-orange-900/10', text: 'text-orange-700 dark:text-orange-400', icon: AlertCircle, label: 'Disputed' },
              };
              return configs[status] || { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-400', icon: Calendar, label: status };
            };
            
            const statusConfig = getStatusConfig(booking.status);
            const StatusIcon = statusConfig.icon;
            
            return (
              <div key={booking.id} className="group bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                {/* Card Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 px-4 py-2.5 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                        <Hash className="w-3.5 h-3.5 text-[#0c9488]" />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">Booking Number</p>
                        <p className="text-xs font-bold text-gray-900 dark:text-slate-100 font-mono">{booking.booking_number || `#${booking.id.slice(0, 8).toUpperCase()}`}</p>
                      </div>
                    </div>
                    <div className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg ${statusConfig.bg} ${statusConfig.text} border ${
                      booking.status === 'pending' ? 'border-yellow-200 dark:border-yellow-800' :
                      booking.status === 'confirmed' ? 'border-blue-200 dark:border-blue-800' :
                      booking.status === 'cancellation_requested' ? 'border-orange-200 dark:border-orange-800' :
                      booking.status === 'in_progress' ? 'border-purple-200 dark:border-purple-800' :
                      booking.status === 'completed' ? 'border-green-200 dark:border-green-800' :
                      booking.status === 'cancelled' ? 'border-red-200 dark:border-red-800' :
                      booking.status === 'disputed' ? 'border-orange-200 dark:border-orange-800' :
                      'border-gray-200 dark:border-gray-700'
                    }`}>
                      <StatusIcon className={`w-3.5 h-3.5 ${booking.status === 'pending' ? 'animate-spin' : ''}`} />
                      <span className="text-xs font-semibold">{statusConfig.label}</span>
                    </div>
                  </div>
                </div>
                
                {/* Card Body */}
                <div className="p-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="relative w-full lg:w-36 h-36 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 shadow-md group-hover:shadow-xl transition-shadow">
                        <img 
                          src={images[0]?.image_url || '/assets/img/placeholder-image.png'} 
                          alt={product?.title || 'Product'} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                        {images.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                            +{images.length - 1}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="space-y-3">
                        {/* Product Title */}
                        <div>
                          <h3 className="text-base font-bold text-gray-900 dark:text-slate-100 mb-1 line-clamp-2">
                            {product?.title || 'Product'}
                          </h3>
                          {product?.location && (
                            <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-slate-400">
                              <MapPin className="w-3 h-3" />
                              <span>{product.location}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Booking Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {/* Start Date */}
                          <div className="flex items-start space-x-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                            <div className="p-1 bg-[#0c9488]/10 rounded-lg">
                              <Calendar className="w-3.5 h-3.5 text-[#0c9488]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">Start Date</p>
                              <p className="text-xs font-semibold text-gray-900 dark:text-slate-100">
                                {booking.start_date ? formatDate(booking.start_date) : 'N/A'}
                              </p>
                              {startTime && (
                                <p className="text-[10px] text-[#0c9488] dark:text-[#0c9488] font-medium mt-0.5 flex items-center space-x-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>{startTime}</span>
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* End Date */}
                          <div className="flex items-start space-x-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                            <div className="p-1 bg-[#0c9488]/10 rounded-lg">
                              <Calendar className="w-3.5 h-3.5 text-[#0c9488]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">End Date</p>
                              <p className="text-xs font-semibold text-gray-900 dark:text-slate-100">
                                {booking.end_date ? formatDate(booking.end_date) : 'N/A'}
                              </p>
                              {endTime && (
                                <p className="text-[10px] text-[#0c9488] dark:text-[#0c9488] font-medium mt-0.5 flex items-center space-x-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>{endTime}</span>
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Duration */}
                          <div className="flex items-start space-x-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                            <div className="p-1 bg-[#0c9488]/10 rounded-lg">
                              <Clock className="w-3.5 h-3.5 text-[#0c9488]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">Duration</p>
                              <p className="text-xs font-semibold text-gray-900 dark:text-slate-100">
                                {isHourlyBooking && startTime && endTime ? (
                                  (() => {
                                    try {
                                      const start = new Date(`${booking.start_date}T${startTime}`);
                                      const end = new Date(`${booking.end_date}T${endTime}`);
                                      const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
                                      return hours > 0 ? `${hours} ${hours === 1 ? 'Hour' : 'Hours'}` : `${days} ${days === 1 ? 'Day' : 'Days'}`;
                                    } catch {
                                      return `${days} ${days === 1 ? 'Day' : 'Days'}`;
                                    }
                                  })()
                                ) : (
                                  `${days} ${days === 1 ? 'Day' : 'Days'}`
                                )}
                              </p>
                              {isHourlyBooking && (
                                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                                  Hourly Rate
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Payment Status */}
                          <div className="flex items-start space-x-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                            <div className="p-1 bg-[#0c9488]/10 rounded-lg">
                              <DollarSign className="w-3.5 h-3.5 text-[#0c9488]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wide">Payment</p>
                              <p className={`text-xs font-semibold ${
                                booking.payment_status === 'paid' ? 'text-green-600 dark:text-green-400' :
                                booking.payment_status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                                'text-gray-900 dark:text-slate-100'
                              }`}>
                                {booking.payment_status ? booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1) : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Price Section */}
                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[#0c9488]/5 to-[#0c9488]/10 dark:from-[#0c9488]/10 dark:to-[#0c9488]/20 rounded-lg border border-[#0c9488]/20">
                          <div>
                            <p className="text-[10px] font-medium text-gray-600 dark:text-slate-400">Total Amount</p>
                            <p className="text-lg font-bold text-[#0c9488] dark:text-[#0c9488]">
                              {booking.total_amount ? formatCurrency(booking.total_amount) : 
                               product?.base_price_per_day ? formatCurrency(totalPrice) : 'N/A'}
                            </p>
                            <div className="flex items-center space-x-2 mt-0.5">
                              {isHourlyBooking && product?.base_price_per_hour ? (
                                <p className="text-[10px] text-gray-500 dark:text-slate-500">
                                  {formatCurrency(product.base_price_per_hour)} per hour
                                </p>
                              ) : product?.base_price_per_day ? (
                                <p className="text-[10px] text-gray-500 dark:text-slate-500">
                                  {formatCurrency(product.base_price_per_day)} per day
                                </p>
                              ) : null}
                              {isHourlyBooking && product?.base_price_per_day && (
                                <span className="text-[10px] text-gray-400 dark:text-slate-500">•</span>
                              )}
                              {isHourlyBooking && product?.base_price_per_day && (
                                <p className="text-[10px] text-gray-500 dark:text-slate-500">
                                  {formatCurrency(product.base_price_per_day)} per day
                                </p>
                              )}
                            </div>
                          </div>
                          {String(booking.renter_id || booking.renterId) === String(currentUserId) && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-slate-400">
                              <User className="w-4 h-4" />
                              <span>You are the Renter</span>
                            </div>
                          )}
                          {String(booking.owner_id || booking.ownerId) === String(currentUserId) && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-slate-400">
                              <User className="w-4 h-4" />
                              <span>You are the Owner</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div> 
                
                {/* Actions Footer */}
                <div className="border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 px-4 py-2.5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    {/* Review Section */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onViewBookingReview(booking.id)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
                      >
                        <span><TranslatedText text="View Review" /></span>
                        {reviewCount > 0 && (
                          <span className="px-1.5 py-0.5 bg-[#0c9488] text-white text-[10px] rounded-full font-semibold">
                            {reviewCount}
                          </span>
                        )}
                      </button>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {booking.status === 'pending' && (
                        <>
                          {String(booking.renter_id || booking.renterId) === String(currentUserId) && booking.payment_status === 'pending' && (
                            <button
                              onClick={() => {
                                window.location.href = `/booking/item/${booking.product_id}?bookingId=${booking.id}&step=1`;
                              }}
                              className="px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                              style={{ backgroundColor: '#0c9488' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0a7a70'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0c9488'}
                            >
                              <TranslatedText text="Pay Now" />
                            </button>
                          )}
                          {String(booking.owner_id || booking.ownerId) === String(currentUserId) && (
                            <>
                              {onConfirmBooking && (
                                <button
                                  onClick={() => onConfirmBooking(booking.id)}
                                  className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                                >
                                  <TranslatedText text="Confirm Booking" />
                                </button>
                              )}
                              {onCancelBooking && (
                                <button
                                  onClick={() => onCancelBooking(booking.id)}
                                  className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                                >
                                  <TranslatedText text="Reject" />
                                </button>
                              )}
                            </>
                          )}
                        </>
                      )}
                      
                      {booking.status === 'confirmed' && (
                        <>
                          {onCheckIn && (
                            <button
                              onClick={() => onCheckIn(booking.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                            >
                              <TranslatedText text="Check In" />
                            </button>
                          )}
                          {onCancelBooking && String(booking.renter_id || booking.renterId) === String(currentUserId) && (() => {
                            const startDate = new Date(booking.start_date);
                            const now = new Date();
                            const isBeforeStartDate = now < startDate;
                            return isBeforeStartDate ? (
                              <button
                                onClick={() => onCancelBooking(booking.id)}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                              >
                                <TranslatedText text="Cancel Booking" />
                              </button>
                            ) : null;
                          })()}
                        </>
                      )}
                      
                      {booking.status === 'in_progress' && onCheckOut && (
                        <button
                          onClick={() => onCheckOut(booking.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                        >
                          <TranslatedText text="Check Out" />
                        </button>
                      )}
                      
                      {booking.status === 'cancellation_requested' && String(booking.owner_id || booking.ownerId) === String(currentUserId) && onReviewCancellation && (
                        <button
                          onClick={() => onReviewCancellation(booking.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                        >
                          🔍 <TranslatedText text="Review Cancellation" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cancellation Request Alert */}
                {booking.status === 'cancellation_requested' && booking.cancellation_reason && (
                  <div className="px-6 py-4 bg-orange-50 dark:bg-orange-900/20 border-t border-orange-200 dark:border-orange-800">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-orange-900 dark:text-orange-100 mb-1"><TranslatedText text="Cancellation Requested" /></h5>
                        <p className="text-sm text-orange-700 dark:text-orange-300 mb-2"><TranslatedText text="The renter has requested to cancel this booking. Please review and decide." /></p>
                        <div className="mt-2 p-3 bg-white dark:bg-slate-800 rounded-lg border border-orange-200 dark:border-orange-800">
                          <p className="text-xs font-medium text-gray-600 dark:text-slate-400 mb-1"><TranslatedText text="Cancellation Reason" />:</p>
                          <p className="text-sm text-gray-900 dark:text-slate-100">{booking.cancellation_reason}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BookingsSection;


