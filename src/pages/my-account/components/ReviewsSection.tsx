import React, { useMemo, useState } from 'react';
import { Star } from 'lucide-react';

interface Props {
  loadingReviews: boolean;
  userReviews: any[];
  onViewReviewDetail: (id: string) => void;
  loadingReviewDetail: boolean;
}

const ReviewsSection: React.FC<Props> = ({ loadingReviews, userReviews, onViewReviewDetail, loadingReviewDetail }) => {
  const [activeTab, setActiveTab] = useState<'received' | 'written'>('received');
  const received = useMemo(() => userReviews.filter(r => r._source === 'received'), [userReviews]);
  const written = useMemo(() => userReviews.filter(r => r._source === 'written'), [userReviews]);
  const list = activeTab === 'received' ? received : written;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">My Reviews</h3>
        <div className="flex items-center space-x-2">
          <div className="inline-flex bg-gray-100 rounded-lg p-1 dark:bg-slate-800">
            {(['received','written'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-3 py-1 rounded-md text-sm ${activeTab===tab ? 'bg-white text-teal-600 shadow-sm dark:bg-slate-900' : 'text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                {tab === 'received' ? `Received (${received.length})` : `Written (${written.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>
      {loadingReviews ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-slate-800">
            <Star className="w-10 h-10 text-gray-400 dark:text-slate-500" />
          </div>
          <h4 className="text-lg font-semibold text-gray-600 mb-2 dark:text-slate-300">No Reviews Yet</h4>
          <p className="text-gray-500 mb-6 max-w-md mx-auto dark:text-slate-400">Start renting cars to receive reviews from hosts and renters. Your reviews will help build trust with the community.</p>
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">Browse Cars</button>
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
              <p className="text-gray-700 mb-4 dark:text-slate-300">{review.comment}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                <div className="text-center"><div className="text-lg font-semibold text-gray-900 dark:text-slate-100">{review.communicationRating}</div><div className="text-xs text-gray-500 dark:text-slate-400">Communication</div></div>
                <div className="text-center"><div className="text-lg font-semibold text-gray-900 dark:text-slate-100">{review.conditionRating}</div><div className="text-xs text-gray-500 dark:text-slate-400">Condition</div></div>
                <div className="text-center"><div className="text-lg font-semibold text-gray-900 dark:text-slate-100">{review.valueRating}</div><div className="text-xs text-gray-500 dark:text-slate-400">Value</div></div>
                {review.deliveryRating && <div className="text-center"><div className="text-lg font-semibold text-gray-900 dark:text-slate-100">{review.deliveryRating}</div><div className="text-xs text-gray-500 dark:text-slate-400">Delivery</div></div>}
              </div>
              {review.response && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl dark:bg-slate-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"><span className="text-xs text-white font-bold">R</span></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-slate-100">Your Response</span>
                  </div>
                  <p className="text-gray-700 text-sm dark:text-slate-300">{review.response}</p>
                </div>
              )}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-slate-400">
                  <span className={`px-2 py-1 rounded-full ${review.moderationStatus === 'approved' ? 'bg-success-100 text-success-700' : review.moderationStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{review.moderationStatus}</span>
                  {review.isVerifiedBooking && <span className="px-2 py-1 bg-my-primary/10 text-my-primary rounded-full">Verified</span>}
                </div>
                <button onClick={() => onViewReviewDetail(review.id)} disabled={loadingReviewDetail} className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">{loadingReviewDetail ? 'Loading...' : 'View Details'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;


