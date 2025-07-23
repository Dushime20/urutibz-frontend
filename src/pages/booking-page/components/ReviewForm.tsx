import React, { useState } from 'react';
import { Star, MessageSquare, Award, CheckCircle, AlertCircle } from 'lucide-react';
import { createReview } from '../service/api';
import { useToast } from '../../../contexts/ToastContext';
import Button from '../../../components/ui/Button';

interface ReviewFormProps {
  bookingId: string;
  ownerId?: string;
  onReviewSubmitted?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ bookingId, ownerId, onReviewSubmitted }) => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratings, setRatings] = useState({
    overallRating: 0,
    communicationRating: 0,
    conditionRating: 0,
    valueRating: 0
  });
  const [reviewText, setReviewText] = useState({
    title: '',
    comment: ''
  });

  // Render enhanced star rating component
  const renderStarRating = (
    label: string, 
    currentRating: number, 
    onRatingChange: (rating: number) => void,
    description?: string
  ) => {
    return (
      <div className="bg-gray-50 rounded-xl p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        {description && (
          <p className="text-xs text-gray-500 mb-3">{description}</p>
        )}
        <div className="flex items-center justify-between">
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
                  className={`w-8 h-8 ${star <= currentRating ? 'fill-current' : ''}`}
                />
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">{currentRating}</span>
            <span className="text-sm text-gray-500">/ 5</span>
          </div>
        </div>
      </div>
    );
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Review form submitted');
    console.log('Ratings:', ratings);
    console.log('Review text:', reviewText);
    
    // Validate ratings
    if (ratings.overallRating === 0) {
      console.log('Validation failed: No overall rating');
      showToast('Please provide an overall rating', 'error');
      return;
    }

    // Validate text inputs
    if (!reviewText.title.trim()) {
      console.log('Validation failed: No title');
      showToast('Please provide a review title', 'error');
      return;
    }

    if (!reviewText.comment.trim()) {
      console.log('Validation failed: No comment');
      showToast('Please provide a detailed review', 'error');
      return;
    }
    
    console.log('Validation passed, proceeding with API call');

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token') || undefined;
      
      if (!ownerId) {
        showToast('Owner information not available', 'error');
        return;
      }

      const reviewData = {
        bookingId,
        reviewedUserId: ownerId,
        overallRating: ratings.overallRating,
        communicationRating: ratings.communicationRating,
        conditionRating: ratings.conditionRating,
        valueRating: ratings.valueRating,
        title: reviewText.title,
        comment: reviewText.comment
      };

      console.log('Submitting review with data:', reviewData);
      console.log('Token available:', !!token);
      console.log('Booking ID being used:', bookingId);
      console.log('Owner ID being used:', ownerId);

      const result = await createReview(reviewData, token);
      
      console.log('Review API response:', result);

      if (result.success) {
        console.log('Review submission successful, calling onReviewSubmitted');
        showToast('Review submitted successfully!', 'success');
        onReviewSubmitted?.();
      } else {
        console.error('Review submission failed:', result.error);
        showToast(result.error || 'Failed to submit review', 'error');
      }
    } catch (error) {
      console.error('Review submission error:', error);
      showToast('An unexpected error occurred', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 px-8 py-6 border-b border-primary-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Share Your Experience</h2>
            <p className="text-gray-600">Help others by sharing your honest feedback about this rental</p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Overall Rating - Prominent */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <Award className="w-6 h-6 text-yellow-500" />
                Overall Experience
              </h3>
              <p className="text-gray-600">How would you rate your overall experience?</p>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatings(prev => ({ ...prev, overallRating: star }))}
                  className={`transition-all duration-200 transform hover:scale-125 ${
                    star <= ratings.overallRating 
                      ? 'text-yellow-400' 
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                >
                  <Star
                    className={`w-12 h-12 ${star <= ratings.overallRating ? 'fill-current' : ''}`}
                  />
                </button>
              ))}
            </div>
            
            <div className="text-center">
              <span className="text-2xl font-bold text-gray-900">{ratings.overallRating}</span>
              <span className="text-lg text-gray-500 ml-1">/ 5</span>
              {ratings.overallRating > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {ratings.overallRating <= 2 && "We're sorry to hear that. Your feedback helps us improve."}
                  {ratings.overallRating === 3 && "Thank you for your feedback. We appreciate your honesty."}
                  {ratings.overallRating === 4 && "Great! We're glad you had a good experience."}
                  {ratings.overallRating === 5 && "Excellent! We're thrilled you had an amazing experience."}
                </p>
              )}
            </div>
          </div>

          {/* Detailed Ratings */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-primary-500" />
              Detailed Ratings
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {renderStarRating(
                'Communication', 
                ratings.communicationRating, 
                (rating) => setRatings(prev => ({ ...prev, communicationRating: rating })),
                'How responsive and clear was the owner?'
              )}
              
              {renderStarRating(
                'Item Condition', 
                ratings.conditionRating, 
                (rating) => setRatings(prev => ({ ...prev, conditionRating: rating })),
                'Was the item as described and in good condition?'
              )}
              
              {renderStarRating(
                'Value for Money', 
                ratings.valueRating, 
                (rating) => setRatings(prev => ({ ...prev, valueRating: rating })),
                'Was the rental fairly priced?'
              )}
            </div>
          </div>

          {/* Review Content */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-500" />
              Tell Us More
            </h3>
            
            {/* Review Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                Review Title *
              </label>
              <input
                type="text"
                id="title"
                value={reviewText.title}
                onChange={(e) => setReviewText(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Summarize your experience in a few words"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200"
                required
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">{reviewText.title.length}/100 characters</p>
            </div>

            {/* Detailed Review */}
            <div>
              <label htmlFor="comment" className="block text-sm font-semibold text-gray-700 mb-2">
                Detailed Review *
              </label>
              <textarea
                id="comment"
                value={reviewText.comment}
                onChange={(e) => setReviewText(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share more details about your experience. What went well? What could be improved?"
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200 resize-none"
                required
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{reviewText.comment.length}/500 characters</p>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Review Guidelines
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be honest and constructive in your feedback</li>
              <li>• Focus on your personal experience with the rental</li>
              <li>• Avoid including personal information</li>
              <li>• Help other renters make informed decisions</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <Button 
              type="submit" 
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              loading={isSubmitting}
              className="px-8 py-3"
            >
              {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm; 