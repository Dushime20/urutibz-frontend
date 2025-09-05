import React from 'react';

const SkeletonMyListings: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-28 animate-pulse" />
        </div>
      </div>

      {/* Listings Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="group relative bg-white dark:bg-gray-800 rounded-3xl p-4 border border-gray-100 dark:border-gray-700">
            {/* Image Skeleton */}
            <div className="w-full h-44 rounded-2xl bg-gray-200 dark:bg-gray-700 animate-pulse mb-3" />
            
            {/* Title Skeleton */}
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse mb-2" />
            
            {/* Price and Status Row Skeleton */}
            <div className="flex justify-between items-center mb-2">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
            </div>
            
            {/* Description Skeleton */}
            <div className="space-y-2 mb-3">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
            </div>
            
            {/* Action Buttons Skeleton */}
            <div className="flex justify-between items-center">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonMyListings;
