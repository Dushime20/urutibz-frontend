import React, { useMemo, useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../contexts/ToastContext';
import { fetchProductReviews } from '../service/api';
import axios from '../../../lib/http';

interface Props {
  loadingReviews: boolean;
  userReviews: any[];
  onViewReviewDetail: (id: string) => void;
  loadingReviewDetail: boolean;
  onReviewsUpdated?: () => void; // Callback to refresh reviews after moderation
}

const ReviewsSection: React.FC<Props> = ({ loadingReviews, userReviews, onViewReviewDetail, loadingReviewDetail, onReviewsUpdated }) => {
  const { tSync } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'received' | 'written' | 'product'>('received');
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [loadingProductReviews, setLoadingProductReviews] = useState(false);
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [moderatingReviewId, setModeratingReviewId] = useState<string | null>(null);
  const [moderatingAction, setModeratingAction] = useState<'approved' | 'rejected' | null>(null);
  
  const received = useMemo(() => userReviews.filter(r => r._source === 'received'), [userReviews]);
  const written = useMemo(() => userReviews.filter(r => r._source === 'written'), [userReviews]);
  const list = activeTab === 'received' ? received : activeTab === 'written' ? written : productReviews;

  // Fetch user's products and their reviews
  useEffect(() => {
    if (activeTab === 'product' && user?.id) {
      loadProductReviews();
    }
  }, [activeTab, user?.id]);

  const loadProductReviews = async () => {
    setLoadingProductReviews(true);
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;
      
      // Fetch user's products
      const productsResponse = await axios.get(`${API_BASE_URL}/products/my/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const products = productsResponse.data?.data?.data || [];
      setUserProducts(products);

      // Fetch reviews for all products
      const allReviews: any[] = [];
      for (const product of products) {
        try {
          const reviews = await fetchProductReviews(product.id, token || undefined);
          if (Array.isArray(reviews)) {
            reviews.forEach((review: any) => {
              allReviews.push({
                ...review,
                productId: product.id,
                productTitle: product.title || product.name,
              });
            });
          }
        } catch (error) {
          console.error(`Error fetching reviews for product ${product.id}:`, error);
        }
      }
      setProductReviews(allReviews);
    } catch (error) {
      console.error('Error loading product reviews:', error);
      showToast('Failed to load product reviews', 'error');
    } finally {
      setLoadingProductReviews(false);
    }
  };

  // Separate function for approving reviews
  const handleApproveReview = async (reviewId: string) => {
    setModeratingReviewId(reviewId);
    setModeratingAction('approved');
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;
      
      const url = `${API_BASE_URL}/review/moderation/${reviewId}`;
      console.log('Approving review:', { reviewId, url });
      
      const response = await axios.put(
        url,
        { action: 'approved' }, // Database expects 'approved', not 'approve'
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.success) {
        showToast('Review approved successfully. It is now visible to the public.', 'success');
        
        // Update local state based on active tab
        if (activeTab === 'product') {
          setProductReviews((prev) =>
            prev.map((review) =>
              review.id === reviewId
                ? { ...review, moderationStatus: 'approved' }
                : review
            )
          );
          // Reload product reviews
          await loadProductReviews();
        } else if (activeTab === 'received' || activeTab === 'written') {
          // Trigger parent component to refresh reviews
          if (onReviewsUpdated) {
            onReviewsUpdated();
          }
        }
      } else {
        showToast(response.data?.error || 'Failed to approve review', 'error');
      }
    } catch (error: any) {
      console.error('Error approving review:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to approve review';
      showToast(errorMessage, 'error');
    } finally {
      setModeratingReviewId(null);
      setModeratingAction(null);
    }
  };

  // Separate function for rejecting reviews
  const handleRejectReview = async (reviewId: string) => {
    setModeratingReviewId(reviewId);
    setModeratingAction('rejected');
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;
      
      const url = `${API_BASE_URL}/review/moderation/${reviewId}`;
      console.log('Rejecting review:', { reviewId, url });
      
      const response = await axios.put(
        url,
        { action: 'rejected' }, // Database expects 'rejected', not 'reject'
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.success) {
        showToast('Review rejected successfully. It is now hidden from public view.', 'success');
        
        // Update local state based on active tab
        if (activeTab === 'product') {
          setProductReviews((prev) =>
            prev.map((review) =>
              review.id === reviewId
                ? { ...review, moderationStatus: 'rejected' }
                : review
            )
          );
          // Reload product reviews
          await loadProductReviews();
        } else if (activeTab === 'received' || activeTab === 'written') {
          // Trigger parent component to refresh reviews
          if (onReviewsUpdated) {
            onReviewsUpdated();
          }
        }
      } else {
        showToast(response.data?.error || 'Failed to reject review', 'error');
      }
    } catch (error: any) {
      console.error('Error rejecting review:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to reject review';
      showToast(errorMessage, 'error');
    } finally {
      setModeratingReviewId(null);
      setModeratingAction(null);
    }
  };

  // Check if user can moderate a review
  const canModerateReview = (review: any): boolean => {
    // User can moderate if:
    // 1. They are the reviewed user (for received reviews)
    // 2. They are the product owner (for product reviews)
    // 3. They are a moderator/admin (check user.isModerator or user.role)
    const isReviewedUser = review.reviewedUserId === user?.id;
    const isModerator = user?.isModerator || user?.role === 'admin' || user?.role === 'moderator';
    
    // For product reviews, owner can moderate
    // For received reviews, the reviewed user can moderate
    // Moderators can moderate any review
    return isModerator || isReviewedUser || activeTab === 'product';
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100"><TranslatedText text="My Reviews" /></h3>
        <div className="flex items-center space-x-2">
          <div className="inline-flex bg-gray-100 rounded-lg p-1 dark:bg-slate-800">
            {(['received','written','product'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1 rounded-md text-sm ${activeTab===tab ? 'bg-white text-teal-600 shadow-sm dark:bg-slate-900' : 'text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                {tab === 'received' ? <><TranslatedText text="Received" /> ({received.length})</> : 
                 tab === 'written' ? <><TranslatedText text="Written" /> ({written.length})</> :
                 <><TranslatedText text="Product Reviews" /> ({productReviews.length})</>}
              </button>
            ))}
          </div>
        </div>
      </div>
      {(loadingReviews || (activeTab === 'product' && loadingProductReviews)) ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-slate-800">
            <Star className="w-10 h-10 text-gray-400 dark:text-slate-500" />
          </div>
          <h4 className="text-lg font-semibold text-gray-600 mb-2 dark:text-slate-300"><TranslatedText text="No Reviews Yet" /></h4>
          <p className="text-gray-500 mb-6 max-w-md mx-auto dark:text-slate-400"><TranslatedText text="Start renting cars to receive reviews from hosts and renters. Your reviews will help build trust with the community." /></p>
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"><TranslatedText text="Browse Cars" /></button>
        </div>
      ) : (
        <div className="space-y-6">
          {list.map((review) => (
            <div key={review.id} className="border border-gray-100 rounded-2xl p-6 hover:border-gray-200 transition-colors dark:border-slate-700 dark:hover:border-slate-600">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center dark:bg-primary-900/20">
                    <Star className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-slate-100">{review.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} className={`w-4 h-4 ${index < review.overallRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-slate-600'}`} />
                  ))}
                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-slate-100">{review.overallRating}/5</span>
                </div>
              </div>
              {activeTab === 'product' && review.productTitle && (
                <div className="mb-3">
                  <span className="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 px-2 py-1 rounded-full">
                    {review.productTitle}
                  </span>
                </div>
              )}
              <p className="text-gray-700 mb-4 dark:text-slate-300">{review.comment}</p>
              {activeTab !== 'product' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <div className="text-center"><div className="text-lg font-semibold text-gray-900 dark:text-slate-100">{review.communicationRating}</div><div className="text-xs text-gray-500 dark:text-slate-400"><TranslatedText text="Communication" /></div></div>
                  <div className="text-center"><div className="text-lg font-semibold text-gray-900 dark:text-slate-100">{review.conditionRating}</div><div className="text-xs text-gray-500 dark:text-slate-400"><TranslatedText text="Condition" /></div></div>
                  <div className="text-center"><div className="text-lg font-semibold text-gray-900 dark:text-slate-100">{review.valueRating}</div><div className="text-xs text-gray-500 dark:text-slate-400"><TranslatedText text="Value" /></div></div>
                  {review.deliveryRating && <div className="text-center"><div className="text-lg font-semibold text-gray-900 dark:text-slate-100">{review.deliveryRating}</div><div className="text-xs text-gray-500 dark:text-slate-400"><TranslatedText text="Delivery" /></div></div>}
                </div>
              )}
              {review.response && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl dark:bg-slate-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"><span className="text-xs text-white font-bold">R</span></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-slate-100"><TranslatedText text="Your Response" /></span>
                  </div>
                  <p className="text-gray-700 text-sm dark:text-slate-300">{review.response}</p>
                </div>
              )}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-slate-400">
                  <span className={`px-2 py-1 rounded-full ${review.moderationStatus === 'approved' ? 'bg-success-100 text-success-700' : review.moderationStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{review.moderationStatus}</span>
                  {review.isVerifiedBooking && <span className="px-2 py-1 bg-my-primary/10 text-my-primary rounded-full"><TranslatedText text="Verified" /></span>}
                </div>
                <div className="flex items-center gap-2">
                  {canModerateReview(review) && (
                    <div className="flex items-center gap-2">
                      {/* Approve Button - Always visible, disabled if already approved */}
                      <button
                        onClick={() => handleApproveReview(review.id)}
                        disabled={moderatingReviewId === review.id || review.moderationStatus === 'approved'}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400"
                        title={
                          review.moderationStatus === 'approved' 
                            ? 'Review is already approved' 
                            : review.moderationStatus === 'rejected'
                            ? 'Approve this review to make it visible publicly again'
                            : 'Approve this review to make it visible publicly'
                        }
                      >
                        {moderatingReviewId === review.id && moderatingAction === 'approved' ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        <TranslatedText text="Approve" />
                      </button>
                      
                      {/* Reject Button - Always visible, disabled if already rejected */}
                      <button
                        onClick={() => handleRejectReview(review.id)}
                        disabled={moderatingReviewId === review.id || review.moderationStatus === 'rejected'}
                        className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 ${
                          review.moderationStatus === 'approved' 
                            ? 'bg-orange-600 hover:bg-orange-700' 
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                        title={
                          review.moderationStatus === 'rejected' 
                            ? 'Review is already rejected' 
                            : review.moderationStatus === 'approved'
                            ? 'Reject this review to hide it from public view'
                            : 'Reject this review to hide it from public view'
                        }
                      >
                        {moderatingReviewId === review.id && moderatingAction === 'rejected' ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <TranslatedText text="Reject" />
                      </button>
                    </div>
                  )}
                  <button onClick={() => onViewReviewDetail(review.id)} disabled={loadingReviewDetail} className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">{loadingReviewDetail ? <TranslatedText text="Loading..." /> : <TranslatedText text="View Details" />}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;


