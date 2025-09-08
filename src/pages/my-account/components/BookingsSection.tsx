import React, { useMemo, useState } from 'react';
import { Calendar } from 'lucide-react';

interface Props {
  loadingBookings: boolean;
  userBookings: any[];
  navigateToBrowse: () => void;
  bookingProducts: { [k: string]: any };
  bookingImages: { [k: string]: any[] };
  bookingReviews: { [k: string]: any };
  loadingBookingReviews: { [k: string]: boolean };
  bookingReviewCounts: { [k: string]: number };
  onViewBookingReview: (bookingId: string) => void;
}

const BookingsSection: React.FC<Props> = ({
  loadingBookings,
  userBookings,
  navigateToBrowse,
  bookingProducts,
  bookingImages,
  bookingReviews,
  loadingBookingReviews,
  bookingReviewCounts,
  onViewBookingReview,
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

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">My Bookings</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setRoleTab('all')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${roleTab === 'all' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
          >All {roleTab === 'all' && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">{allCount}</span>}</button>
          <button
            onClick={() => setRoleTab('renter')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${roleTab === 'renter' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
          >Renter {roleTab === 'renter' && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">{renterCount}</span>}</button>
          <button
            onClick={() => setRoleTab('owner')}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${roleTab === 'owner' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
          >Owner {roleTab === 'owner' && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">{ownerCount}</span>}</button>
        </div>
      </div>
      <div className="space-y-4">
        {loadingBookings ? (
          <div>Loading bookings...</div>
        ) : roleFilteredBookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">No bookings found</h4>
            <p className="text-gray-500 mb-6">You haven't made any bookings yet. Start exploring and book your first item.</p>
            <button onClick={navigateToBrowse} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">Browse Items</button>
          </div>
        ) : (
          roleFilteredBookings.map((booking) => {
            const product = bookingProducts[booking.id];
            const images = bookingImages[booking.id] || [];
            const bookingReview = bookingReviews[booking.id];
            const isLoadingReview = loadingBookingReviews[booking.id];
            const reviewCount = bookingReviewCounts[booking.id] || 0;
            return (
              <div key={booking.id} className="border border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-colors">
                <div className="flex items-center space-x-4 mb-4">
                  <img src={images[0]?.image_url || '/assets/img/placeholder-image.png'} alt={product?.title || 'Product'} className="w-24 h-18 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{product?.title || 'Product'}</h4>
                    <p className="text-sm text-gray-500 mb-2">{new Date(booking.start_date).toLocaleString()} - {new Date(booking.end_date).toLocaleString()}</p>
                    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-medium ${booking.status === 'pending' ? 'bg-my-primary/10 text-my-primary' : 'bg-success-100 text-success-700'}`}>{booking.status}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-gray-900">{product?.base_price_per_day ? `$${product.base_price_per_day}` : ''}</p>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h5 className="font-medium text-gray-900">Review</h5>
                      {reviewCount > 0 && <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>}
                    </div>
                    {!bookingReview && !isLoadingReview && reviewCount === 0 && (
                      <button onClick={() => onViewBookingReview(booking.id)} className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">Check for Review</button>
                    )}
                    {!bookingReview && !isLoadingReview && reviewCount > 0 && (
                      <button onClick={() => onViewBookingReview(booking.id)} className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">View Review</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BookingsSection;


