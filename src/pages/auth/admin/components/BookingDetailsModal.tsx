import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchAdminBookingById, fetchProductImages } from '../service';
import { formatCurrency } from '../../../lib/utils';
import { formatDateUTC } from '../../../utils/dateUtils';

interface BookingDetailsModalProps {
  bookingId: string | null;
  onClose: () => void;
  token?: string;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ 
  bookingId, 
  onClose, 
  token 
}) => {
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) return;

      try {
        setLoading(true);
        const response = await fetchAdminBookingById(bookingId, token);
        const bookingData = response.data;
        setBookingDetails(bookingData);

        // Fetch product images
        if (bookingData.product_id) {
          const images = await fetchProductImages(bookingData.product_id, token);
          setProductImages(images.map((img: any) => img.url || img.image_url));
        }

        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch booking details');
        setBookingDetails(null);
        setProductImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, token]);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  if (!bookingId) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl">
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={onClose} 
            className="mt-4 px-4 py-2 bg-my-primary text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!bookingDetails) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[800px] relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="grid grid-cols-2 gap-8 p-8">
          {/* Product Image Gallery */}
          <div className="relative">
            {productImages.length > 0 ? (
              <>
                <div className="relative w-full aspect-square max-h-[500px]">
                  <img
                    src={productImages[currentImageIndex]}
                    alt={`Product image ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain rounded-xl"
                    onError={(e) => {
                      console.error('Image load error:', productImages[currentImageIndex]);
                      (e.target as HTMLImageElement).src = '/assets/img/placeholder-image.png';
                    }}
                  />
                  {productImages.length > 1 && (
                    <>
                      <button 
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white shadow-md rounded-full p-2 z-10"
                      >
                        &#8592;
                      </button>
                      <button 
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white shadow-md rounded-full p-2 z-10"
                      >
                        &#8594;
                      </button>
                    </>
                  )}
                  {productImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {productImages.length}
                    </div>
                  )}
                </div>

                {/* Image Indicators */}
                {productImages.length > 1 && (
                  <div className="flex justify-center mt-2 space-x-2">
                    {productImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex 
                            ? 'bg-my-primary' 
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 w-full h-96">
                <ChevronLeft className="w-16 h-16 mb-4" />
                <p>No images available</p>
              </div>
            )}

            <div className="mt-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {bookingDetails.product_title}
                </h2>
                <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {bookingDetails.status}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Price</p>
                <p className="text-xl font-bold text-teal-500">
                  {bookingDetails.base_price_per_day != null && bookingDetails.base_currency
                    ? `${bookingDetails.base_price_per_day} ${bookingDetails.base_currency}`
                    : 'No price'}
                </p>
              </div>
            </div>
            <p className="mt-4 text-gray-600">
              {bookingDetails.product_description}
            </p>
          </div>

          {/* Booking Details */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Booking Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Number</label>
                <p className="text-gray-900">{bookingDetails.booking_number}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Renter</label>
                <p className="text-gray-900">
                  {bookingDetails.renter_first_name} {bookingDetails.renter_last_name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Dates</label>
                <p className="text-gray-900">
                  {formatDateUTC(bookingDetails.start_date)} - {formatDateUTC(bookingDetails.end_date)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <span className="text-sm text-my-primary bg-my-primary/10 px-2 py-1 rounded-full">
                  {bookingDetails.payment_status}
                </span>
              </div>

              {bookingDetails.renter_notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Renter Notes</label>
                  <p className="text-gray-900">{bookingDetails.renter_notes}</p>
                </div>
              )}

              {bookingDetails.owner_notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Notes</label>
                  <p className="text-gray-900">{bookingDetails.owner_notes}</p>
                </div>
              )}
            </div>

            {/* Pricing Information */}
         

            <div className="mt-6">
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal; 