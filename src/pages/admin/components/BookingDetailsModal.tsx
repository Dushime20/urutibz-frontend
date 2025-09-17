import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { fetchAdminBookingById, fetchProductImages } from '../service';
import { PricingService } from '../service/pricingService';

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
  const [productPricing, setProductPricing] = useState<any>(null);
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

        // Fetch product images - try multiple sources
        let images: string[] = [];
        
        // First, check if booking data already has images
        if (bookingData.product_images && Array.isArray(bookingData.product_images)) {
          images = bookingData.product_images.map((img: any) => img.url || img.image_url || img).filter(Boolean);
        }
        
        // If no images from booking data, try to fetch from product
        if (images.length === 0 && bookingData.product_id) {
          try {
            const fetchedImages = await fetchProductImages(bookingData.product_id, token);
            // fetchProductImages already returns an array of URLs, no need to map again
            images = fetchedImages.filter(Boolean);
          } catch (imgError) {
            console.warn('Failed to fetch product images:', imgError);
          }
        }
        
        // If still no images, check for single image fields
        if (images.length === 0) {
          if (bookingData.product_image) images.push(bookingData.product_image);
          if (bookingData.image) images.push(bookingData.image);
        }
        
        setProductImages(images);
        
        // Fetch product pricing information if not available in booking
        if (bookingData.product_id && (!bookingData.pricing || !bookingData.pricing.totalAmount)) {
          try {
            const pricingResponse = await PricingService.getProductPrices(
              { product_id: bookingData.product_id },
              token
            );
            
            if (pricingResponse.data && pricingResponse.data.length > 0) {
              setProductPricing(pricingResponse.data[0]);
              console.log('BookingDetailsModal - Fetched product pricing:', pricingResponse.data[0]);
            }
          } catch (pricingError) {
            console.warn('Failed to fetch product pricing:', pricingError);
          }
        }
        
        // Debug logging to help identify image sources and pricing data
        console.log('BookingDetailsModal - Full booking data:', bookingData);
        console.log('BookingDetailsModal - Pricing data:', bookingData.pricing);
        console.log('BookingDetailsModal - Image sources:', {
          bookingId,
          productId: bookingData.product_id,
          productImages: bookingData.product_images,
          productImage: bookingData.product_image,
          image: bookingData.image,
          finalImages: images
        });

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

  // Calculate rental duration in days
  const calculateRentalDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] relative flex flex-col">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Product Image Gallery */}
          <div className="space-y-4">
            {productImages.length > 0 ? (
              <>
                <div className="relative w-full aspect-square max-h-[300px]">
                  <img
                    src={productImages[currentImageIndex]}
                    alt={`Product image ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain rounded-xl"
                    onError={(e) => {
                      console.error('Image load error:', productImages[currentImageIndex]);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLDivElement | null;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden w-full h-full bg-gray-100 dark:bg-gray-700 rounded-xl ring-1 ring-gray-300 dark:ring-gray-600 flex flex-col items-center justify-center">
                    <ImageIcon className="w-12 h-12 mb-2 text-gray-500 dark:text-gray-300" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">Image failed to load</p>
                  </div>
                  {productImages.length > 1 && (
                    <>
                      <button 
                        onClick={handlePrevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white dark:bg-gray-700 dark:hover:bg-gray-600 shadow-md rounded-full p-1.5 z-10"
                      >
                        <X className="w-4 h-4 rotate-90" />
                      </button>
                      <button 
                        onClick={handleNextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white dark:bg-gray-700 dark:hover:bg-gray-600 shadow-md rounded-full p-1.5 z-10"
                      >
                        <X className="w-4 h-4 -rotate-90" />
                      </button>
                    </>
                  )}
                  {productImages.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                      {currentImageIndex + 1} / {productImages.length}
                    </div>
                  )}
                </div>

                {/* Image Indicators */}
                {productImages.length > 1 && (
                  <div className="flex justify-center space-x-1">
                    {productImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-1.5 h-1.5 rounded-full ${
                          index === currentImageIndex 
                            ? 'bg-my-primary' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-xl ring-1 ring-gray-300 dark:ring-gray-600">
                <ImageIcon className="w-12 h-12 mb-2 text-gray-500 dark:text-gray-300" />
                <p className="text-sm text-gray-600 dark:text-gray-300">No images available</p>
              </div>
            )}

            {/* Product Information */}
            <div className="space-y-3">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {bookingDetails.product_title}
                </h2>
                <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                  {bookingDetails.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                {bookingDetails.product_description}
              </p>
            </div>
              
            {/* Comprehensive Pricing Information */}
            {(bookingDetails.pricing || productPricing) && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 space-y-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Pricing Breakdown</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  {/* Rental Duration */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Duration:</span>
                    <div className="text-sm font-semibold text-my-primary">
                      {(() => {
                        const days = bookingDetails.pricing?.totalDays || 
                                     bookingDetails.total_days || 
                                     calculateRentalDays(bookingDetails.start_date, bookingDetails.end_date);
                        return `${days} ${days === 1 ? 'day' : 'days'}`;
                      })()}
                    </div>
                  </div>
                  
                  {/* Currency */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Currency:</span>
                    <div className="text-sm font-semibold text-my-primary">
                      {bookingDetails.pricing?.currency || productPricing?.currency || 'USD'}
                    </div>
                  </div>
                </div>
                
                {/* Pricing Details */}
                <div className="space-y-1">
                  {/* Daily Rate from Product Pricing */}
                  {productPricing?.price_per_day && (
                    <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg p-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Daily Rate:</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {productPricing.price_per_day} {productPricing.currency}
                      </span>
                    </div>
                  )}
                  
                  {/* Subtotal */}
                  <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg p-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Subtotal:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {(() => {
                        // Primary: Use subtotal from API response
                        if ((bookingDetails as any).pricing?.subtotal !== null && (bookingDetails as any).pricing?.subtotal !== undefined) {
                          return `${(bookingDetails as any).pricing.subtotal} USD`;
                        }
                        // Secondary: Use legacy pricing.subtotal
                        if (bookingDetails.pricing?.subtotal !== null && bookingDetails.pricing?.subtotal !== undefined) {
                          return `${bookingDetails.pricing.subtotal} ${bookingDetails.pricing.currency}`;
                        }
                        // Fallback: Calculate from daily rate and days
                        if (productPricing?.price_per_day) {
                          const days = bookingDetails.pricing?.totalDays || 
                                       bookingDetails.total_days || 
                                       calculateRentalDays(bookingDetails.start_date, bookingDetails.end_date);
                          return `${(productPricing.price_per_day * days).toFixed(2)} ${productPricing.currency}`;
                        }
                        return 'N/A';
                      })()}
                    </span>
                  </div>
                  
                  {/* Platform Fee */}
                  <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg p-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Platform Fee:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {(() => {
                        // Primary: Use platform_fee from API response
                        if ((bookingDetails as any).pricing?.platform_fee !== null && (bookingDetails as any).pricing?.platform_fee !== undefined) {
                          return `${(bookingDetails as any).pricing.platform_fee} USD`;
                        }
                        // Secondary: Use legacy pricing.platformFee
                        if (bookingDetails.pricing?.platformFee !== null && bookingDetails.pricing?.platformFee !== undefined) {
                          return `${bookingDetails.pricing.platformFee} ${bookingDetails.pricing.currency}`;
                        }
                        // Fallback: Calculate platform fee (typically 10-15% of subtotal)
                        if (productPricing?.price_per_day) {
                          const days = bookingDetails.pricing?.totalDays || 
                                       bookingDetails.total_days || 
                                       calculateRentalDays(bookingDetails.start_date, bookingDetails.end_date);
                          const subtotal = productPricing.price_per_day * days;
                          const platformFee = subtotal * 0.1; // 10% platform fee
                          return `${platformFee.toFixed(2)} ${productPricing.currency}`;
                        }
                        return 'N/A';
                      })()}
                    </span>
                  </div>
                  
                  {/* Tax Amount */}
                  <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg p-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Tax Amount:</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {(() => {
                        // Primary: Use tax_amount from API response
                        if ((bookingDetails as any).pricing?.tax_amount !== null && (bookingDetails as any).pricing?.tax_amount !== undefined) {
                          return `${(bookingDetails as any).pricing.tax_amount} USD`;
                        }
                        return 'N/A';
                      })()}
                    </span>
                  </div>
                  
                  {/* Total Amount */}
                  <div className="flex justify-between items-center bg-my-primary/10 dark:bg-my-primary/20 rounded-lg p-2 border border-my-primary/20">
                    <span className="text-sm text-gray-900 dark:text-gray-100 font-bold">Total Amount:</span>
                    <span className="text-lg font-bold text-my-primary">
                      {(() => {
                        // Primary: Use total_amount from API response
                        if ((bookingDetails as any).total_amount) {
                          return `${(bookingDetails as any).total_amount} USD`;
                        }
                        // Secondary: Use pricing.total_amount from API response
                        if ((bookingDetails as any).pricing?.total_amount !== null && (bookingDetails as any).pricing?.total_amount !== undefined) {
                          return `${(bookingDetails as any).pricing.total_amount} USD`;
                        }
                        // Tertiary: Use legacy pricing.totalAmount
                        if (bookingDetails.pricing?.totalAmount !== null && bookingDetails.pricing?.totalAmount !== undefined) {
                          return `${bookingDetails.pricing.totalAmount} ${bookingDetails.pricing.currency}`;
                        }
                        // Fallback: Calculate total amount (subtotal + platform fee + tax)
                        if ((bookingDetails as any).pricing?.subtotal) {
                          const subtotal = parseFloat((bookingDetails as any).pricing.subtotal);
                          const platformFee = parseFloat((bookingDetails as any).pricing.platform_fee || 0);
                          const taxAmount = parseFloat((bookingDetails as any).pricing.tax_amount || 0);
                          const total = subtotal + platformFee + taxAmount;
                          return `${total.toFixed(2)} USD`;
                        }
                        // Legacy fallback: Calculate from product pricing
                        if (productPricing?.price_per_day) {
                          const days = bookingDetails.pricing?.totalDays || 
                                       bookingDetails.total_days || 
                                       calculateRentalDays(bookingDetails.start_date, bookingDetails.end_date);
                          const subtotal = productPricing.price_per_day * days;
                          const platformFee = subtotal * 0.1; // 10% platform fee
                          const total = subtotal + platformFee;
                          return `${total.toFixed(2)} ${productPricing.currency}`;
                        }
                        return 'N/A';
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            )}
              
              {/* Fallback for legacy pricing data */}
              {!bookingDetails.pricing && !productPricing && bookingDetails.base_price_per_day && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Pricing Information</h3>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Daily Rate:</span>
                    <div className="text-xl font-bold text-my-primary">
                      {bookingDetails.base_price_per_day} {bookingDetails.base_currency || 'USD'}
                    </div>
                  </div>
                </div>
              )}
              
              {/* No pricing information available */}
              {!bookingDetails.pricing && !productPricing && !bookingDetails.base_price_per_day && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Pricing Information</h3>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                    <span className="text-gray-500 dark:text-gray-400">No pricing information available</span>
                  </div>
                </div>
              )}
            </div>
            <p className="mt-4 text-gray-600">
              {bookingDetails.product_description}
            </p>
          </div>

          {/* Booking Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Booking Information</h3>
            
            <div className="space-y-3">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Booking Number</label>
                <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">{bookingDetails.booking_number}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Renter</label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {bookingDetails.renter_first_name} {bookingDetails.renter_last_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{bookingDetails.renter_email}</p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Booking Dates</label>
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  {new Date(bookingDetails.start_date).toLocaleDateString()} - {new Date(bookingDetails.end_date).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Payment Status</label>
                <span className="text-xs text-my-primary bg-my-primary/10 dark:bg-my-primary/20 dark:text-my-primary px-2 py-1 rounded-full">
                  {bookingDetails.payment_status}
                </span>
              </div>

              {bookingDetails.renter_notes && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Renter Notes</label>
                  <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-3">{bookingDetails.renter_notes}</p>
                </div>
              )}

              {bookingDetails.owner_notes && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Owner Notes</label>
                  <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-3">{bookingDetails.owner_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Close Button */}
        <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal; 