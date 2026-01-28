import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Truck, 
  Clock, 
  Shield, 
  CheckCircle,
  MessageCircle,
  Award,
  Package,
  Edit3,
  X
} from 'lucide-react';
import { fetchProductReviews } from '../../pages/my-account/service/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface ProductTabsProps {
  activeTab: 'overview' | 'specifications' | 'reviews' | 'shipping' | 'faq';
  onTabChange: (tab: 'overview' | 'specifications' | 'reviews' | 'shipping' | 'faq') => void;
  product: any;
}

const ProductTabs: React.FC<ProductTabsProps> = ({ activeTab, onTabChange, product }) => {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: '',
    comment: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Fetch product reviews when component mounts or product changes
  useEffect(() => {
    if (!product?.id) return;
    
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const token = localStorage.getItem('token') || undefined;
        const reviews = await fetchProductReviews(product.id, token);
        // Filter to only show approved reviews publicly
        const approvedReviews = Array.isArray(reviews)
          ? reviews.filter((review: any) => review.moderationStatus === 'approved')
          : [];
        setProductReviews(approvedReviews);
      } catch (error) {
        console.error('Error fetching product reviews:', error);
        setProductReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [product?.id]);

  // Handle review submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      showToast('Please log in to submit a review', 'error');
      return;
    }

    if (reviewForm.rating === 0) {
      showToast('Please select a rating', 'error');
      return;
    }

    if (!reviewForm.comment.trim()) {
      showToast('Please write a review comment', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      // TODO: Implement review submission API call
      // const reviewData = {
      //   product_id: product.id,
      //   rating: reviewForm.rating,
      //   title: reviewForm.title,
      //   comment: reviewForm.comment,
      //   reviewer_id: user?.id
      // };
      // await submitProductReview(reviewData);
      
      // For now, show success message
      showToast('Review submitted successfully! It will be visible after moderation.', 'success');
      
      // Reset form and close modal
      setReviewForm({ rating: 0, title: '', comment: '' });
      setShowReviewModal(false);
      
      // Refresh reviews
      const token = localStorage.getItem('token') || undefined;
      const reviews = await fetchProductReviews(product.id, token);
      const approvedReviews = Array.isArray(reviews)
        ? reviews.filter((review: any) => review.moderationStatus === 'approved')
        : [];
      setProductReviews(approvedReviews);
      
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast('Failed to submit review. Please try again.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Reset form when modal closes
  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setReviewForm({ rating: 0, title: '', comment: '' });
  };
  const tabs: Array<{
    key: 'overview' | 'specifications' | 'reviews' | 'shipping' | 'faq';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { key: 'overview', label: 'Overview', icon: Package },
    { key: 'specifications', label: 'Specifications', icon: CheckCircle },
    { key: 'reviews', label: 'Reviews', icon: Star },
    { key: 'shipping', label: 'Shipping', icon: Truck },
    { key: 'faq', label: 'FAQ', icon: MessageCircle }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="prose max-w-none">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Product Overview</h3>
            <div className="text-gray-700 dark:text-slate-300 leading-relaxed space-y-4 text-sm sm:text-base">
              <p>
                {product.description || 'This is a high-quality rental product designed to meet your needs. Our team has carefully verified this item to ensure it meets our strict quality standards.'}
              </p>
              
              {/* Key Features */}
              {product.features && product.features.length > 0 ? (
                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Key Features</h4>
                  <ul className="space-y-2">
                    {product.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Key Features</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Quality verified product</span>
                    </li>
                    {product.delivery_available && (
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Delivery available</span>
                      </li>
                    )}
                    {product.pickup_available !== false && (
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Pickup available</span>
                      </li>
                    )}
                    {product.is_featured && (
                      <li className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Featured product</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Product Details */}
              {(product.brand || product.model || product.condition) && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Product Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                    {product.brand && (
                      <div>
                        <span className="text-gray-600 dark:text-slate-300">Brand:</span>
                        <span className="font-medium ml-2 dark:text-white">{product.brand}</span>
                      </div>
                    )}
                    {product.model && (
                      <div>
                        <span className="text-gray-600 dark:text-slate-300">Model:</span>
                        <span className="font-medium ml-2 dark:text-white">{product.model}</span>
                      </div>
                    )}
                    {product.condition && (
                      <div>
                        <span className="text-gray-600 dark:text-slate-300">Condition:</span>
                        <span className="font-medium ml-2 capitalize dark:text-white">{product.condition}</span>
                      </div>
                    )}
                    {product.year_manufactured && (
                      <div>
                        <span className="text-gray-600 dark:text-slate-300">Year:</span>
                        <span className="font-medium ml-2 dark:text-white">{product.year_manufactured}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'specifications':
        return (
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Product Details</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white border-b dark:border-slate-600 pb-2 text-sm sm:text-base">Basic Information</h4>
                <div className="space-y-2 sm:space-y-3">
                  {product.brand && (
                    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 dark:border-slate-700 gap-1 sm:gap-0">
                      <span className="text-gray-600 dark:text-slate-300 text-sm">Brand</span>
                      <span className="font-medium dark:text-white text-sm">{product.brand}</span>
                    </div>
                  )}
                  {product.model && (
                    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 dark:border-slate-700 gap-1 sm:gap-0">
                      <span className="text-gray-600 dark:text-slate-300 text-sm">Model</span>
                      <span className="font-medium dark:text-white text-sm">{product.model}</span>
                    </div>
                  )}
                  {product.year_manufactured && (
                    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 dark:border-slate-700 gap-1 sm:gap-0">
                      <span className="text-gray-600 dark:text-slate-300 text-sm">Year</span>
                      <span className="font-medium dark:text-white text-sm">{product.year_manufactured}</span>
                    </div>
                  )}
                  {product.condition && (
                    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 dark:border-slate-700 gap-1 sm:gap-0">
                      <span className="text-gray-600 dark:text-slate-300 text-sm">Condition</span>
                      <span className="font-medium capitalize dark:text-white text-sm">{product.condition}</span>
                    </div>
                  )}
                  {product.serial_number && (
                    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 dark:border-slate-700 gap-1 sm:gap-0">
                      <span className="text-gray-600 dark:text-slate-300 text-sm">Serial Number</span>
                      <span className="font-medium dark:text-white text-sm">{product.serial_number}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white border-b dark:border-slate-600 pb-2 text-sm sm:text-base">Rental Information</h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 dark:border-slate-700 gap-1 sm:gap-0">
                    <span className="text-gray-600 dark:text-slate-300 text-sm">Price per Day</span>
                    <span className="font-medium dark:text-white text-sm">{product.base_currency || 'RWF'} {product.base_price_per_day || 0}</span>
                  </div>
                  {product.security_deposit && (
                    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 dark:border-slate-700 gap-1 sm:gap-0">
                      <span className="text-gray-600 dark:text-slate-300 text-sm">Security Deposit</span>
                      <span className="font-medium dark:text-white text-sm">{product.base_currency || 'RWF'} {product.security_deposit}</span>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 dark:border-slate-700 gap-1 sm:gap-0">
                    <span className="text-gray-600 dark:text-slate-300 text-sm">Delivery Available</span>
                    <span className="font-medium dark:text-white text-sm">{product.delivery_available ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 dark:border-slate-700 gap-1 sm:gap-0">
                    <span className="text-gray-600 dark:text-slate-300 text-sm">Pickup Available</span>
                    <span className="font-medium dark:text-white text-sm">{product.pickup_available !== false ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 dark:border-slate-700 gap-1 sm:gap-0">
                    <span className="text-gray-600 dark:text-slate-300 text-sm">Rating</span>
                    <span className="font-medium flex items-center space-x-1 dark:text-white text-sm">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{product.average_rating || 'No ratings yet'}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mt-6 sm:mt-8">
                <h4 className="font-semibold text-gray-900 dark:text-white border-b dark:border-slate-600 pb-2 mb-4 text-sm sm:text-base">Technical Specifications</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 dark:border-slate-700 gap-1 sm:gap-0">
                      <span className="text-gray-600 dark:text-slate-300 capitalize text-sm">{key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</span>
                      <span className="font-medium dark:text-white text-sm">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mt-6 sm:mt-8">
                <h4 className="font-semibold text-gray-900 dark:text-white border-b dark:border-slate-600 pb-2 mb-4 text-sm sm:text-base">Features</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
                  {product.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Included Accessories */}
            {product.included_accessories && product.included_accessories.length > 0 && (
              <div className="mt-6 sm:mt-8">
                <h4 className="font-semibold text-gray-900 dark:text-white border-b dark:border-slate-600 pb-2 mb-4 text-sm sm:text-base">What's Included</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
                  {product.included_accessories.map((accessory: string, index: number) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Package className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-slate-300 text-sm">{accessory}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'reviews':
        return (
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Customer Reviews</h3>
            
            {/* Reviews Summary */}
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4 sm:gap-0">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{product.average_rating || '0.0'}</div>
                  <div>
                    <div className="flex items-center space-x-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            i < Math.floor(product.average_rating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 dark:text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-slate-300">Based on {productReviews.length} reviews</div>
                  </div>
                </div>
                
                {/* Write Review Button - Alibaba Style */}
                {isAuthenticated && (
                  <motion.button
                    onClick={() => setShowReviewModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium text-sm transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Write Review</span>
                  </motion.button>
                )}
              </div>
              
              {/* Rating Breakdown - Calculate from actual reviews */}
              {productReviews.length > 0 && (
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = productReviews.filter((review: any) => Math.floor(review.rating || 0) === rating).length;
                    const percentage = productReviews.length > 0 ? Math.round((count / productReviews.length) * 100) : 0;
                    return (
                      <div key={rating} className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 dark:text-slate-300 w-8">{rating}★</span>
                        <div className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-slate-300 w-12">{count} ({percentage}%)</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reviews Loading State */}
            {reviewsLoading && (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="animate-pulse border-b border-gray-200 dark:border-slate-700 pb-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24"></div>
                          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Reviews State */}
            {!reviewsLoading && productReviews.length === 0 && (
              <div className="text-center py-12">
                <Star className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-slate-600" />
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No reviews yet</h4>
                <p className="text-gray-600 dark:text-slate-300">Be the first to review this product after renting!</p>
              </div>
            )}

            {/* Actual Reviews */}
            {!reviewsLoading && productReviews.length > 0 && (
              <div className="space-y-6">
                {productReviews.slice(0, 5).map((review: any, index: number) => {
                  // Get reviewer initials
                  const reviewerName = review.reviewer_name || review.reviewerName || 'Anonymous';
                  const initials = reviewerName.split(' ').map((n: string) => n.charAt(0)).join('').toUpperCase().slice(0, 2);
                  
                  // Format date
                  const reviewDate = review.created_at || review.createdAt;
                  const formattedDate = reviewDate ? new Date(reviewDate).toLocaleDateString() : 'Recently';
                  
                  return (
                    <div key={review.id || index} className="border-b border-gray-200 dark:border-slate-700 pb-6 last:border-b-0">
                      <div className="flex items-start space-x-4">
                        {/* Reviewer Avatar */}
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {initials}
                        </div>
                        
                        <div className="flex-1">
                          {/* Reviewer Info */}
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-gray-900 dark:text-white">{reviewerName}</span>
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${
                                    i < Math.floor(review.rating || 0)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300 dark:text-slate-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500 dark:text-slate-400">{formattedDate}</span>
                          </div>
                          
                          {/* Review Title */}
                          {review.title && (
                            <h5 className="font-medium text-gray-900 dark:text-white mb-2">{review.title}</h5>
                          )}
                          
                          {/* Review Comment */}
                          <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
                            {review.comment || review.review || 'Great rental experience!'}
                          </p>
                          
                          {/* Review Response (if any) */}
                          {review.response && (
                            <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">Owner Response:</span>
                              </div>
                              <p className="text-sm text-gray-700 dark:text-slate-300">{review.response}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Show more reviews link if there are many */}
                {productReviews.length > 5 && (
                  <div className="text-center pt-4">
                    <button className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium text-sm">
                      View all {productReviews.length} reviews
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'shipping':
        return (
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Pickup & Delivery</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Delivery/Pickup Options */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Available Options</h4>
                
                <div className="space-y-3 sm:space-y-4">
                  {product.pickup_available !== false && (
                    <div className="flex items-start space-x-3 p-3 sm:p-4 border border-gray-200 dark:border-slate-600 rounded-lg">
                      <Package className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Pickup Available</h5>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 mt-1">
                          Pick up directly from owner • Free
                        </p>
                        {product.address_line && (
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                            Location: {product.address_line}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {product.delivery_available && (
                    <div className="flex items-start space-x-3 p-3 sm:p-4 border border-gray-200 dark:border-slate-600 rounded-lg">
                      <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Delivery Available</h5>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 mt-1">
                          Delivered to your location
                          {product.delivery_fee && ` • ${product.base_currency || 'RWF'} ${product.delivery_fee}`}
                        </p>
                        {product.delivery_radius_km && (
                          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                            Within {product.delivery_radius_km}km radius
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {!product.delivery_available && product.pickup_available === false && (
                    <div className="flex items-start space-x-3 p-3 sm:p-4 border border-gray-200 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-800">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Contact Owner</h5>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 mt-1">
                          Arrange pickup/delivery with the owner
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Rental Policies */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Rental Policies</h4>
                
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="dark:text-slate-300">Secure rental process</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="dark:text-slate-300">Quality verified products</span>
                  </div>
                  {product.security_deposit && (
                    <div className="flex items-start space-x-2">
                      <Shield className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span className="dark:text-slate-300">Security deposit: {product.base_currency || 'RWF'} {product.security_deposit}</span>
                    </div>
                  )}
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="dark:text-slate-300">24/7 customer support</span>
                  </div>
                </div>
                
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h5 className="font-medium text-blue-900 dark:text-blue-300 mb-2 text-sm sm:text-base">Rental Terms</h5>
                  <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200">
                    Please return the item in the same condition. 
                    Late returns may incur additional charges.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'faq':
        return (
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Frequently Asked Questions</h3>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="border-b border-gray-200 dark:border-slate-700 pb-4 sm:pb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">How do I book this item?</h4>
                <p className="text-gray-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                  Simply select your rental dates, choose the quantity you need, and add the item to your cart. 
                  You can then proceed to checkout and complete your booking with secure payment.
                </p>
              </div>
              
              <div className="border-b border-gray-200 dark:border-slate-700 pb-4 sm:pb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">What's included in the rental?</h4>
                <p className="text-gray-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                  All items listed in the product description are included in your rental. 
                  This includes the main product and any accessories mentioned in the specifications.
                </p>
              </div>
              
              <div className="border-b border-gray-200 dark:border-slate-700 pb-4 sm:pb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">Can I cancel my booking?</h4>
                <p className="text-gray-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                  Yes, you can cancel your booking according to our cancellation policy. 
                  Free cancellation is available up to 24 hours before your rental start date.
                </p>
              </div>
              
              <div className="border-b border-gray-200 dark:border-slate-700 pb-4 sm:pb-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">Is there a security deposit?</h4>
                <p className="text-gray-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                  A refundable security deposit may be required for certain high-value items. 
                  This will be clearly indicated during the booking process and refunded after successful return.
                </p>
              </div>
              
              <div className="border-b border-gray-200 dark:border-slate-700 pb-4 sm:pb-6 last:border-b-0">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 text-sm sm:text-base">How do I contact the supplier?</h4>
                <p className="text-gray-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                  You can contact the supplier directly through our messaging system or use the contact buttons 
                  in the supplier information section. Response times are typically under 2 hours.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded">
      {/* Tab Navigation - Alibaba Style with Horizontal Scroll */}
      <div className="border-b border-gray-200 dark:border-slate-700">
        {/* Mobile: Horizontal scroll container */}
        <div className="overflow-x-auto scrollbar-hide">
          <nav className="flex space-x-0 min-w-max">
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => onTabChange(tab.key)}
                  className={`flex items-center space-x-2 py-3 px-4 sm:px-6 text-sm font-medium transition-colors relative whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 border-b-2 border-teal-600 dark:border-teal-400'
                      : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800'
                  } ${index === 0 ? 'rounded-tl' : ''} ${index === tabs.length - 1 ? 'rounded-tr' : ''}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden text-xs">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Scroll indicators for mobile */}
        <div className="sm:hidden absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none opacity-50"></div>
      </div>

      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductTabs;