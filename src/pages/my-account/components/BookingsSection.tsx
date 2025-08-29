import React from 'react';
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
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">My Bookings</h3>
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors">All</button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors">Active</button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors">Completed</button>
        </div>
      </div>
      <div className="space-y-4">
        {loadingBookings ? (
          <div>Loading bookings...</div>
        ) : userBookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">No bookings found</h4>
            <p className="text-gray-500 mb-6">You haven't made any bookings yet. Start exploring and book your first item.</p>
            <button onClick={navigateToBrowse} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">Browse Items</button>
          </div>
        ) : (
          userBookings.map((booking) => {
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


