import React, { useMemo, useState } from 'react';
import { Calendar } from 'lucide-react';

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
  const [roleTab, setRoleTab] = useState<'all' | 'renter' | 'owner'>('all');

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

  const roleFilteredBookings = useMemo(() => {
    if (roleTab === 'all') return userBookings;
    if (!currentUserId) return userBookings;
    return userBookings.filter((b) => {
      const renterId = b.renterId || b.renter_id;
      const ownerId = b.ownerId || b.owner_id;
      return roleTab === 'renter' ? String(renterId) === String(currentUserId) : String(ownerId) === String(currentUserId);
    });
  }, [roleTab, userBookings, currentUserId]);

  const { allCount, renterCount, ownerCount } = useMemo(() => {
    const allCountVal = userBookings.length;
    if (!currentUserId) return { allCount: allCountVal, renterCount: allCountVal, ownerCount: allCountVal };
    const renterCountVal = userBookings.filter((b) => String(b.renterId || b.renter_id) === String(currentUserId)).length;
    const ownerCountVal = userBookings.filter((b) => String(b.ownerId || b.owner_id) === String(currentUserId)).length;
    return { allCount: allCountVal, renterCount: renterCountVal, ownerCount: ownerCountVal };
  }, [userBookings, currentUserId]);

  // Intentionally do not auto-fetch reviews; only fetch on click

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 hidden sm:block">My Bookings</h3>
        <div className="flex items-center space-x-2 overflow-x-auto flex-1 sm:flex-none whitespace-nowrap">
          <button
            onClick={() => setRoleTab('all')}
            className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-colors whitespace-nowrap ${roleTab === 'all' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'}`}
          >All {roleTab === 'all' && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">{allCount}</span>}</button>
          <button
            onClick={() => setRoleTab('renter')}
            className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-colors whitespace-nowrap ${roleTab === 'renter' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'}`}
          >Renter {roleTab === 'renter' && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">{renterCount}</span>}</button>
          <button
            onClick={() => setRoleTab('owner')}
            className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-colors whitespace-nowrap ${roleTab === 'owner' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'}`}
          >Owner {roleTab === 'owner' && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">{ownerCount}</span>}</button>
        </div>
      </div>
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
            <h4 className="text-lg font-semibold text-gray-600 mb-2 dark:text-slate-300">No bookings found</h4>
            <p className="text-gray-500 mb-6 dark:text-slate-400">You haven't made any bookings yet. Start exploring and book your first item.</p>
            <button onClick={navigateToBrowse} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">Browse Items</button>
          </div>
        ) : (
          roleFilteredBookings.map((booking) => {
            const product = bookingProducts[booking.id];
            const images = bookingImages[booking.id] || [];
            const reviewCount = bookingReviewCounts[booking.id] || 0;
            return (
              <div key={booking.id} className="border border-gray-100 rounded-2xl p-4 sm:p-6 hover:border-gray-200 transition-colors dark:border-slate-700 dark:hover:border-slate-600">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0 mb-4">
                  <img src={images[0]?.image_url || '/assets/img/placeholder-image.png'} alt={product?.title || 'Product'} className="w-full h-32 sm:w-24 sm:h-18 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1 dark:text-slate-100 truncate">{product?.title || 'Product'}</h4>
                    <p className="text-sm text-gray-500 mb-2 dark:text-slate-400 break-words">
                      {new Date(booking.start_date).toLocaleString()} - {new Date(booking.end_date).toLocaleString()}
                    </p>
                    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-medium ${
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      booking.status === 'cancellation_requested' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                      booking.status === 'in_progress' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                      booking.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      booking.status === 'disputed' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {booking.status === 'cancellation_requested' ? '🔄 Cancellation Requested' : booking.status?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="sm:text-right text-left">
                    <p className="font-bold text-lg sm:text-xl text-gray-900 dark:text-slate-100">{product?.base_price_per_day ? `$${product.base_price_per_day}` : ''}</p>
                  </div>
                </div> 
                
                {/* Quick Actions and Review for Pending Bookings */}
                {booking.status === 'pending' && (
                  <div className="border-t border-gray-100 pt-4 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      {/* Left side - Review */}
                      <div className="flex items-center space-x-2">
                        <h5 className="font-medium text-gray-900 dark:text-slate-100">Review</h5>
                        {reviewCount > 0 && <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full dark:bg-primary-900/20 dark:text-primary-400">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>}
                        <button
                          onClick={() => onViewBookingReview(booking.id)}
                          className="text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg px-3 py-1.5 transition-colors"
                        >
                          View Review
                        </button>
                      </div>
                      
                      {/* Right side - Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {String(booking.renter_id || booking.renterId) === String(currentUserId) && (
                          <>
                            {/* Show Pay Now button if payment is pending */}
                            {booking.payment_status === 'pending' && (
                              <button
                                onClick={() => {
                                  // Navigate to payment step (step=1) with bookingId to skip to payment
                                  window.location.href = `/booking/item/${booking.product_id}?bookingId=${booking.id}&step=1`;
                                }}
                                className="text-sm font-semibold text-white bg-green-600 hover:bg-blue-700 rounded-lg px-3 py-1.5 transition-colors"
                              >
                                 Pay Now
                              </button>
                            )}
                            {/* Hide cancel button for pending bookings - only show for confirmed bookings before start_date */}
                          </>
                        )}
                        {String(booking.owner_id || booking.ownerId) === String(currentUserId) && (
                          <>
                            {onConfirmBooking && (
                              <button
                                onClick={() => onConfirmBooking(booking.id)}
                                className="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg px-3 py-1.5 transition-colors"
                              >
                                Confirm Booking
                              </button>
                            )}
                            {onCancelBooking && (
                              <button
                                onClick={() => onCancelBooking(booking.id)}
                                className="text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg px-3 py-1.5 transition-colors"
                              >
                                Reject
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions for Cancellation Requested (Owner can review) */}
                {booking.status === 'cancellation_requested' && (
                  <div className="border-t border-gray-100 pt-4 dark:border-slate-700">
                    <div className="mb-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-600 dark:text-orange-400">🔄</span>
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-orange-900 dark:text-orange-100 mb-1">Cancellation Requested</h5>
                          <p className="text-sm text-orange-700 dark:text-orange-300">The renter has requested to cancel this booking. Please review and decide.</p>
                          {booking.cancellation_reason && (
                            <div className="mt-2 p-2 bg-white dark:bg-slate-800 rounded text-xs text-gray-700 dark:text-slate-300">
                              <strong>Reason:</strong> {booking.cancellation_reason}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      {/* Left side - Review */}
                      <div className="flex items-center space-x-2">
                        <h5 className="font-medium text-gray-900 dark:text-slate-100">Review</h5>
                        {reviewCount > 0 && <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full dark:bg-primary-900/20 dark:text-primary-400">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>}
                        <button
                          onClick={() => onViewBookingReview(booking.id)}
                          className="text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg px-3 py-1.5 transition-colors"
                        >
                          View Review
                        </button>
                      </div>
                      
                      {/* Right side - Actions (Owner only) */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {String(booking.owner_id || booking.ownerId) === String(currentUserId) && onReviewCancellation && (
                          <button
                            onClick={() => onReviewCancellation(booking.id)}
                            className="text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg px-3 py-1.5 transition-colors"
                          >
                            🔍 Review Cancellation
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions and Review for Confirmed Bookings */}
                {booking.status === 'confirmed' && (
                  <div className="border-t border-gray-100 pt-4 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      {/* Left side - Review */}
                      <div className="flex items-center space-x-2">
                        <h5 className="font-medium text-gray-900 dark:text-slate-100">Review</h5>
                        {reviewCount > 0 && <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full dark:bg-primary-900/20 dark:text-primary-400">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>}
                        <button
                          onClick={() => onViewBookingReview(booking.id)}
                          className="text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg px-3 py-1.5 transition-colors"
                        >
                          View Review
                        </button>
                      </div>
                      
                      {/* Right side - Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {onCheckIn && (
                          <button
                            onClick={() => onCheckIn(booking.id)}
                            className="text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg px-3 py-1.5 transition-colors"
                          >
                            Check In
                          </button>
                        )}
                        {/* Show cancel button only for renters and before start_date */}
                        {onCancelBooking && String(booking.renter_id || booking.renterId) === String(currentUserId) && (() => {
                          const startDate = new Date(booking.start_date);
                          const now = new Date();
                          const isBeforeStartDate = now < startDate;
                          return isBeforeStartDate ? (
                            <button
                              onClick={() => onCancelBooking(booking.id)}
                              className="text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg px-3 py-1.5 transition-colors"
                            >
                              Cancel Booking
                            </button>
                          ) : null;
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions and Review for In Progress Bookings */}
                {booking.status === 'in_progress' && (
                  <div className="border-t border-gray-100 pt-4 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      {/* Left side - Review */}
                      <div className="flex items-center space-x-2">
                        <h5 className="font-medium text-gray-900 dark:text-slate-100">Review</h5>
                        {reviewCount > 0 && <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full dark:bg-primary-900/20 dark:text-primary-400">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>}
                        <button
                          onClick={() => onViewBookingReview(booking.id)}
                          className="text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg px-3 py-1.5 transition-colors"
                        >
                          View Review
                        </button>
                      </div>
                      
                      {/* Right side - Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {onCheckOut && (
                          <button
                            onClick={() => onCheckOut(booking.id)}
                            className="text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg px-3 py-1.5 transition-colors"
                          >
                            Check Out
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Review section for other statuses (completed, cancelled, etc.) */}
                {!['pending', 'confirmed', 'in_progress'].includes(booking.status) && (
                  <div className="border-t border-gray-100 pt-4 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div className="flex items-center space-x-2">
                        <h5 className="font-medium text-gray-900 dark:text-slate-100">Review</h5>
                        {reviewCount > 0 && <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full dark:bg-primary-900/20 dark:text-primary-400">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>}
                      </div>
                      <button
                        onClick={() => onViewBookingReview(booking.id)}
                        className="text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg px-3 py-1.5 transition-colors"
                      >
                        View Review
                      </button>
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


