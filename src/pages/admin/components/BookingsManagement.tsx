import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fetchAdminBookings, type AdminBooking } from '../service/api';
import BookingEditModal from './BookingEditModal';

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
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
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-primary-600 hover:text-primary-900 mr-4" onClick={() => handleView(booking)}>
                      View
                    </button>
                    <button className="text-primary-600 hover:text-primary-900" onClick={() => handleEdit(booking)}>
                      Edit
                    </button>
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
      {/* Edit/View Modal */}
      {editModalOpen && selectedBooking && (
        <BookingEditModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          booking={selectedBooking}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default BookingsManagement; 