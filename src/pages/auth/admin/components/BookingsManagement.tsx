import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { type AdminBooking, fetchAdminBookings, overrideBooking } from '../service';
import BookingEditModal from './BookingEditModal';
import { Eye, MoreVertical, Edit, RefreshCw } from 'lucide-react';
import BookingDetailsModal from './BookingDetailsModal';
import { 
  type BookingOverridePayload 
} from '../interfaces';

interface BookingsManagementProps {
  // ... keep any existing props ...
}

const BookingsManagement: React.FC<BookingsManagementProps> = (props) => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [bookingToOverride, setBookingToOverride] = useState<AdminBooking | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideStatus, setOverrideStatus] = useState<'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'>('confirmed');
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    const loadBookings = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetchAdminBookings(currentPage, 20, token || undefined);
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
  }, [currentPage]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check if the click is outside the action menu
      const actionMenuElement = document.querySelector('.action-menu-container');
      if (actionMenuElement && !actionMenuElement.contains(event.target as Node)) {
        setActionMenuOpen(null);
      }
    }

    // Add event listener when action menu is open
    if (actionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [actionMenuOpen]);

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

  const formatCurrency = (amount: number | null | undefined, currency?: string) => {
    if (amount === null || amount === undefined) return '-';
    const safeCurrency = currency && currency.length === 3 ? currency.toUpperCase() : 'USD';
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: safeCurrency, maximumFractionDigits: 0 }).format(amount);
    } catch {
      return `${amount.toLocaleString()} ${safeCurrency}`;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Bookings Management</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Total Bookings: {totalBookings}</span>
          </div>
        </div>
        {/* Your existing filters/search UI here */}
      </div>
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading bookings...</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.booking_number}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(booking.created_at), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.renter_first_name} {booking.renter_last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.renter_email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.product_title}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {booking.product_description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      Payment: {booking.payment_status}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {format(new Date(booking.start_date), 'MMM d, yyyy')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.total_days} days
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(booking.pricing?.totalAmount ?? booking.pricing?.subtotal ?? null, booking.pricing?.currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right relative">
                    <div className="relative action-menu-container">
                      <button 
                        onClick={() => setActionMenuOpen(actionMenuOpen === booking.id ? null : booking.id)}
                        className="text-gray-500 hover:text-gray-700"
                        title="More Actions"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {actionMenuOpen === booking.id && (
                        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                setSelectedBookingId(booking.id);
                                setActionMenuOpen(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </button>
                            <button
                              onClick={() => {
                                // Implement edit logic or open edit modal
                                handleEdit(booking);
                                setActionMenuOpen(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <Edit className="w-4 h-4 mr-2" /> Edit Booking
                            </button>
                            <button
                              onClick={() => {
                                setBookingToOverride(booking);
                                setOverrideModalOpen(true);
                                setActionMenuOpen(null);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                            >
                              <RefreshCw className="w-4 h-4 mr-2" /> Override Status
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
      {/* Booking Details Modal */}
      <BookingDetailsModal 
        bookingId={selectedBookingId}
        onClose={() => setSelectedBookingId(null)}
        token={localStorage.getItem('token') || undefined}
      />
      {overrideModalOpen && bookingToOverride && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-[500px] p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Override Booking Status</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking: {bookingToOverride.booking_number}
              </label>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Status: {bookingToOverride.status}
              </label>
            </div>

            <div className="mb-4">
              <label htmlFor="override-status" className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <select
                id="override-status"
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value as 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled')}
                className="w-full px-3 py-2 border rounded-md"
              >
                {['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="override-reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Override (Optional)
              </label>
              <textarea
                id="override-reason"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter reason for status change"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setOverrideModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleOverrideBooking}
                className="px-4 py-2 bg-my-primary text-white rounded-md hover:bg-my-primary/80"
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