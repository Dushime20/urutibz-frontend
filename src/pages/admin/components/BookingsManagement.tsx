import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { type AdminBooking, fetchAdminBookings, overrideBooking } from '../service';
import { Eye, MoreVertical, Edit, RefreshCw, Filter, X, Search } from 'lucide-react';
import BookingDetailsModal from './BookingDetailsModal';
import Pagination from '../../../components/ui/Pagination';

interface BookingsManagementProps {
  // ... keep any existing props ...
}

const BookingsManagement: React.FC<BookingsManagementProps> = (props) => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing page size
  };
  
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [bookingToOverride, setBookingToOverride] = useState<AdminBooking | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideStatus, setOverrideStatus] = useState<'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'>('confirmed');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [productSearch, setProductSearch] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Filter bookings based on current filter state
  const filteredBookings = bookings.filter((booking) => {
    // Status filter
    if (statusFilter !== 'all' && booking.status.toLowerCase() !== statusFilter.toLowerCase()) {
      return false;
    }

    // Payment status filter
    if (paymentStatusFilter !== 'all' && booking.payment_status.toLowerCase() !== paymentStatusFilter.toLowerCase()) {
      return false;
    }

    // Date range filter
    if (dateRangeFilter.start) {
      const bookingStartDate = new Date(booking.start_date);
      const filterStartDate = new Date(dateRangeFilter.start);
      if (bookingStartDate < filterStartDate) {
        return false;
      }
    }
    if (dateRangeFilter.end) {
      const bookingEndDate = new Date(booking.end_date);
      const filterEndDate = new Date(dateRangeFilter.end);
      if (bookingEndDate > filterEndDate) {
        return false;
      }
    }

    // Customer search filter
    if (customerSearch) {
      const customerName = `${booking.renter_first_name} ${booking.renter_last_name}`.toLowerCase();
      const customerEmail = booking.renter_email.toLowerCase();
      const searchTerm = customerSearch.toLowerCase();
      if (!customerName.includes(searchTerm) && !customerEmail.includes(searchTerm)) {
        return false;
      }
    }

    // Product search filter
    if (productSearch) {
      const productTitle = booking.product_title.toLowerCase();
      const productDescription = booking.product_description.toLowerCase();
      const searchTerm = productSearch.toLowerCase();
      if (!productTitle.includes(searchTerm) && !productDescription.includes(searchTerm)) {
        return false;
      }
    }

    return true;
  });

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter('all');
    setPaymentStatusFilter('all');
    setDateRangeFilter({ start: '', end: '' });
    setCustomerSearch('');
    setProductSearch('');
  };

  // Check if any filters are active
  const hasActiveFilters = statusFilter !== 'all' || 
    paymentStatusFilter !== 'all' || 
    dateRangeFilter.start || 
    dateRangeFilter.end || 
    customerSearch || 
    productSearch;

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetchAdminBookings(currentPage, itemsPerPage, token || undefined);
        setBookings(response.items);
        setTotalPages(response.pagination.totalPages);
        setTotalBookings(response.pagination.total);
      } catch (error) {
        console.error('Error loading bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [currentPage, itemsPerPage]);

  // Removed problematic click-outside handler that only affected first row
  // Menu state is now properly managed by toggling on button click and closing after actions

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-my-primary/10 text-my-primary';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number | null | undefined, currency?: string) => {
    if (amount === null || amount === undefined) return '-';
    const safeCurrency = currency && currency.length === 3 ? currency.toUpperCase() : 'USD';
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: safeCurrency, maximumFractionDigits: 0 }).format(amount);
    } catch {
      return `${amount.toLocaleString()} ${safeCurrency}`;
    }
  };

  const getPositiveNumber = (value: unknown): number | null => {
    if (value === null || value === undefined) return null;
    const n = typeof value === 'string' ? Number(value) : (value as number);
    if (Number.isFinite(n) && n > 0) return n;
    return null;
  };

  const resolveCurrency = (booking: AdminBooking): string | undefined => {
    return booking.pricing?.currency || (booking as any).base_currency || 'USD';
  };

  const getBookingPrice = (booking: AdminBooking) => {
    // Primary: Use total_amount from API response (real calculated price)
    if ((booking as any).total_amount) {
      const totalAmount = parseFloat((booking as any).total_amount);
      if (!isNaN(totalAmount) && totalAmount > 0) {
        return `${totalAmount.toFixed(2)} USD`;
      }
    }
    
    // Secondary: Use pricing.total_amount from API response
    if ((booking as any).pricing?.total_amount) {
      const totalAmount = parseFloat((booking as any).pricing.total_amount);
      if (!isNaN(totalAmount) && totalAmount > 0) {
        return `${totalAmount.toFixed(2)} USD`;
      }
    }
    
    // Tertiary: Use pricing.totalAmount if available (legacy format)
    if (booking.pricing?.totalAmount !== null && booking.pricing?.totalAmount !== undefined) {
      return `${booking.pricing.totalAmount} ${booking.pricing.currency}`;
    }
    
    // Fallback: Calculate from pricing breakdown
    if ((booking as any).pricing?.subtotal) {
      const subtotal = parseFloat((booking as any).pricing.subtotal);
      const platformFee = parseFloat((booking as any).pricing.platform_fee || 0);
      const taxAmount = parseFloat((booking as any).pricing.tax_amount || 0);
      const total = subtotal + platformFee + taxAmount;
      return `${total.toFixed(2)} USD`;
    }
    
    // Legacy fallback: Use pricing.subtotal + platformFee
    if (booking.pricing?.subtotal !== null && booking.pricing?.subtotal !== undefined) {
      const subtotal = booking.pricing.subtotal;
      const platformFee = booking.pricing.platformFee || 0;
      const total = subtotal + platformFee;
      return `${total.toFixed(2)} ${booking.pricing.currency}`;
    }
    
    // Additional fallback: Check for any other price fields
    const priceFields = [
      (booking as any).amount,
      (booking as any).price,
      (booking as any).total_price,
      (booking as any).final_price
    ];
    
    for (const price of priceFields) {
      if (price && typeof price === 'number' && price > 0) {
        const currency = booking.pricing?.currency || (booking as any).currency || 'USD';
        return `${price} ${currency}`;
      }
    }
    
    return 'N/A';
  };

  const calculateRentalDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleEdit = (booking: AdminBooking) => {
    setSelectedBooking(booking);
    setViewMode('edit');
    setEditModalOpen(true);
  };

  const handleView = (booking: AdminBooking) => {
    setSelectedBooking(booking);
    setViewMode('view');
    setEditModalOpen(true);
  };

  const handleSave = (updated: any) => {
    // Refresh bookings after edit
    setCurrentPage(1); // Optionally reload first page
  };

  const handleViewBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    // Close any open edit modal
    setEditModalOpen(false);
    setSelectedBooking(null);
  };

  const handleOverrideBooking = async () => {
    if (!bookingToOverride) return;

    try {
      const token = localStorage.getItem('token');
      const result = await overrideBooking(
        bookingToOverride.id, 
        {
          status: overrideStatus,
          reason: overrideReason || 'Manual admin intervention'
        }, 
        token || undefined
      );

      if (result.success) {
        // Optionally refresh bookings or update the specific booking
        const updatedBookings = bookings.map(booking => 
          booking.id === bookingToOverride.id 
            ? { ...booking, status: overrideStatus } 
            : booking
        );
        setBookings(updatedBookings);

        // Close modal and reset state
        setOverrideModalOpen(false);
        setBookingToOverride(null);
        setOverrideReason('');
        setOverrideStatus('confirmed');

        // Optional: Show success toast
        // toast.success('Booking status updated successfully');
      } else {
        // Optional: Show error toast
        // toast.error(result.error);
        console.error('Booking override failed:', result.error);
      }
    } catch (error) {
      console.error('Error overriding booking:', error);
      // Optional: Show error toast
      // toast.error('Failed to override booking');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Bookings Management</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 dark:text-slate-400">
              Total Bookings: {totalBookings} | Showing: {filteredBookings.length}
            </span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-my-primary text-white border-my-primary'
                  : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {[statusFilter !== 'all', paymentStatusFilter !== 'all', dateRangeFilter.start, dateRangeFilter.end, customerSearch, productSearch].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-4 border border-gray-200 dark:border-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Payment Status
                </label>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                >
                  <option value="all">All Payment</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Start Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Start Date From
                </label>
                <input
                  type="date"
                  value={dateRangeFilter.start}
                  onChange={(e) => setDateRangeFilter(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                />
              </div>

              {/* End Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  End Date To
                </label>
                <input
                  type="date"
                  value={dateRangeFilter.end}
                  onChange={(e) => setDateRangeFilter(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                />
              </div>

              {/* Customer Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Customer Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Name or email..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                  />
                </div>
              </div>

              {/* Product Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                  Product Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Product name..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                  />
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
              <div className="flex items-center space-x-2">
                {hasActiveFilters && (
                  <span className="text-sm text-gray-600 dark:text-slate-400">
                    {filteredBookings.length} of {totalBookings} bookings match your filters
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-my-primary dark:border-teal-500 mx-auto"></div>
            <p className="mt-4 text-gray-500 dark:text-slate-400">Loading bookings...</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500 dark:text-slate-400">
                      {hasActiveFilters ? (
                        <div>
                          <p className="text-lg font-medium mb-2">No bookings match your filters</p>
                          <p className="text-sm">Try adjusting your filter criteria or clear all filters to see all bookings.</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg font-medium mb-2">No bookings found</p>
                          <p className="text-sm">There are currently no bookings in the system.</p>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      {booking.renter_first_name} {booking.renter_last_name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      {booking.renter_email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      {booking.product_title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-slate-400 truncate max-w-xs">
                      {booking.product_description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      Payment: {booking.payment_status}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-slate-100">
                      {format(new Date(booking.start_date), 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      {booking.total_days} days
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                      {getBookingPrice(booking)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right relative">
                    <div className="relative action-menu-container">
                      <button 
                        onClick={() => setActionMenuOpen(actionMenuOpen === booking.id ? null : booking.id)}
                        className="text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                        title="More Actions"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {actionMenuOpen === booking.id && (
                        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-slate-700 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-slate-600 focus:outline-none">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setSelectedBookingId(booking.id);
                                setActionMenuOpen(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center"
                            >
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </button>
                            <button
                              onClick={() => {
                                // Implement edit logic or open edit modal
                                handleEdit(booking);
                                setActionMenuOpen(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center"
                            >
                              <Edit className="w-4 h-4 mr-2" /> Edit Booking
                            </button>
                            <button
                              onClick={() => {
                                setBookingToOverride(booking);
                                setOverrideModalOpen(true);
                                setActionMenuOpen(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" /> Override Status
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
        {/* Items per page selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 dark:text-gray-400">Bookings per page:</span>
          <select
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm"
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
          >
            {[10, 20, 30, 50, 100].map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        
        {/* Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalBookings}
          itemsPerPage={itemsPerPage}
          showItemCount={true}
        />
      </div>
      {/* Booking Details Modal */}
      <BookingDetailsModal 
        bookingId={selectedBookingId}
        onClose={() => setSelectedBookingId(null)}
        token={localStorage.getItem('token') || undefined}
      />
      {overrideModalOpen && bookingToOverride && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-[500px] p-6 border border-gray-200 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-slate-100">Override Booking Status</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Booking: {bookingToOverride.booking_number}
              </label>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Current Status: {bookingToOverride.status}
              </label>
            </div>

            <div className="mb-4">
              <label htmlFor="override-status" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                New Status
              </label>
              <select
                id="override-status"
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value as 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              >
                {['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="override-reason" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Reason for Override (Optional)
              </label>
              <textarea
                id="override-reason"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                placeholder="Enter reason for status change"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setOverrideModalOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-slate-200 rounded-md hover:bg-gray-300 dark:hover:bg-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleOverrideBooking}
                className="px-4 py-2 bg-my-primary dark:bg-teal-500 text-white rounded-md hover:bg-my-primary/80 dark:hover:bg-teal-600"
              >
                Override Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsManagement; 