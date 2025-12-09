import React, { useState } from 'react';
import { Star, User, Calendar, CheckCircle, ThumbsUp, Flag, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { TranslatedText } from '../translated-text';
import Button from '../ui/Button';

interface Review {
  id: string;
  user_name?: string;
  reviewer?: string;
  rating?: number;
  overallRating?: number;
  comment?: string;
  text?: string;
  created_at?: string;
  createdAt?: string;
  communicationRating?: number;
  conditionRating?: number;
  valueRating?: number;
  verifiedBooking?: boolean;
  helpfulVotes?: number;
}

interface ReviewsSectionProps {
  reviews: Review[];
  productId: string;
  ownerId?: string;
  onReviewAdded?: () => void;
  averageRating?: number;
  totalReviews?: number;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  productId,
  ownerId,
  onReviewAdded,
  averageRating,
  totalReviews,
}) => {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());

  // Review form state
  const [ratings, setRatings] = useState({
    overallRating: 0,
    communicationRating: 0,
    conditionRating: 0,
    valueRating: 0,
  });
  const [reviewText, setReviewText] = useState({
    title: '',
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate average rating if not provided
  const avgRating = averageRating || (reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || r.overallRating || 0), 0) / reviews.length
    : 0);
  const reviewCount = totalReviews || reviews.length;

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => (r.rating || r.overallRating || 0) === rating).length,
    percentage: reviews.length > 0
      ? (reviews.filter((r) => (r.rating || r.overallRating || 0) === rating).length / reviews.length) * 100
      : 0,
  }));

  // Render star rating display
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          />
        ))}
      </div>
    );
  };

  // Render interactive star rating for form
  const renderInteractiveStars = (
    currentRating: number,
    onRatingChange: (rating: number) => void,
    size: 'md' | 'lg' = 'md'
  ) => {
    const sizeClasses = {
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
    };
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`transition-all duration-200 transform hover:scale-110 ${
              star <= currentRating
                ? 'text-yellow-400'
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            <Star
              className={`${sizeClasses[size]} ${star <= currentRating ? 'fill-current' : ''}`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Handle review submission
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (ratings.overallRating === 0) {
      showToast('Please provide an overall rating', 'error');
      return;
    }

    if (!reviewText.comment.trim()) {
      showToast('Please write a review comment', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

      // Note: This requires a bookingId. For now, we'll show a message
      // In a real scenario, you'd need to get the bookingId from user's bookings
      showToast('To leave a review, please complete a booking first', 'info');
      setShowReviewForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast('Failed to submit review', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle helpful
  const toggleHelpful = (reviewId: string) => {
    setHelpfulReviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mt-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-2">
              <TranslatedText text="Reviews" />
              {reviewCount > 0 && (
                <span className="text-gray-600 dark:text-gray-400 font-normal ml-2">
                  ({reviewCount})
                </span>
              )}
            </h2>
            {reviewCount > 0 && (
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">
                    {avgRating.toFixed(1)}
                  </span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">·</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                </span>
              </div>
            )}
          </div>
          {isAuthenticated && (
            <Button
              onClick={() => setShowReviewForm(!showReviewForm)}
              variant="outline"
              className="w-full md:w-auto"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              <TranslatedText text="Write a review" />
            </Button>
          )}
        </div>

        {/* Rating Distribution */}
        {reviewCount > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 min-w-[60px]">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {rating}
                    </span>
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[40px] text-right">
                    {count}
                  </span>
                </div>
              ))}
            </div>
            <div className="hidden md:block">
              {/* Additional stats can go here */}
            </div>
          </div>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && isAuthenticated && (
        <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            <TranslatedText text="Share your experience" />
          </h3>
          <form onSubmit={handleSubmitReview} className="space-y-6">
            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <TranslatedText text="Overall rating" /> *
              </label>
              {renderInteractiveStars(ratings.overallRating, (rating) =>
                setRatings((prev) => ({ ...prev, overallRating: rating }))
              )}
            </div>

            {/* Detailed Ratings */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TranslatedText text="Communication" />
                </label>
                {renderInteractiveStars(ratings.communicationRating, (rating) =>
                  setRatings((prev) => ({ ...prev, communicationRating: rating }))
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TranslatedText text="Condition" />
                </label>
                {renderInteractiveStars(ratings.conditionRating, (rating) =>
                  setRatings((prev) => ({ ...prev, conditionRating: rating }))
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TranslatedText text="Value" />
                </label>
                {renderInteractiveStars(ratings.valueRating, (rating) =>
                  setRatings((prev) => ({ ...prev, valueRating: rating }))
                )}
              </div>
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <TranslatedText text="Your review" /> *
              </label>
              <textarea
                value={reviewText.comment}
                onChange={(e) =>
                  setReviewText((prev) => ({ ...prev, comment: e.target.value }))
                }
                placeholder="Share your experience with this item..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
                required
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                loading={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                <TranslatedText text="Submit review" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowReviewForm(false);
                  setRatings({ overallRating: 0, communicationRating: 0, conditionRating: 0, valueRating: 0 });
                  setReviewText({ title: '', comment: '' });
                }}
              >
                <TranslatedText text="Cancel" />
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {reviewCount > 0 ? (
        <div className="space-y-6">
          {reviews.map((review, index) => {
            const rating = review.rating || review.overallRating || 0;
            const comment = review.comment || review.text || '';
            const isExpanded = expandedReviewId === review.id;
            const isHelpful = helpfulReviews.has(review.id);
            const shouldTruncate = comment.length > 300;

            return (
              <div
                key={review.id || index}
                className="border-b border-gray-200 dark:border-gray-800 pb-6 last:border-b-0"
              >
                <div className="flex gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {review.user_name || review.reviewer || 'Anonymous'}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(rating, 'sm')}
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(review.created_at || review.createdAt)}
                          </span>
                          {review.verifiedBooking && (
                            <span className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400">
                              <CheckCircle className="w-3 h-3" />
                              <TranslatedText text="Verified booking" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Ratings */}
                    {(review.communicationRating || review.conditionRating || review.valueRating) && (
                      <div className="flex flex-wrap gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
                        {review.communicationRating && (
                          <span>
                            <TranslatedText text="Communication" />: {review.communicationRating}/5
                          </span>
                        )}
                        {review.conditionRating && (
                          <span>
                            <TranslatedText text="Condition" />: {review.conditionRating}/5
                          </span>
                        )}
                        {review.valueRating && (
                          <span>
                            <TranslatedText text="Value" />: {review.valueRating}/5
                          </span>
                        )}
                      </div>
                    )}

                    {/* Review Text */}
                    <div className="text-gray-700 dark:text-gray-300 mb-3">
                      {shouldTruncate && !isExpanded ? (
                        <>
                          <p>{comment.substring(0, 300)}...</p>
                          <button
                            onClick={() => setExpandedReviewId(review.id)}
                            className="text-teal-600 dark:text-teal-400 font-medium hover:underline mt-1"
                          >
                            <TranslatedText text="Show more" />
                          </button>
                        </>
                      ) : (
                        <>
                          <p>{comment}</p>
                          {shouldTruncate && (
                            <button
                              onClick={() => setExpandedReviewId(null)}
                              className="text-teal-600 dark:text-teal-400 font-medium hover:underline mt-1"
                            >
                              <TranslatedText text="Show less" />
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 text-sm">
                      <button
                        onClick={() => toggleHelpful(review.id)}
                        className={`flex items-center gap-1 transition-colors ${
                          isHelpful
                            ? 'text-teal-600 dark:text-teal-400 font-medium'
                            : 'text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>
                          <TranslatedText text="Helpful" />
                        </span>
                        {review.helpfulVotes && review.helpfulVotes > 0 && (
                          <span>({review.helpfulVotes})</span>
                        )}
                      </button>
                      <button className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        <Flag className="w-4 h-4" />
                        <span>
                          <TranslatedText text="Report" />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            <TranslatedText text="No reviews yet" />
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            <TranslatedText text="Be the first to review this item" />
          </p>
          {isAuthenticated && (
            <Button onClick={() => setShowReviewForm(true)} variant="primary">
              <TranslatedText text="Write a review" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;

