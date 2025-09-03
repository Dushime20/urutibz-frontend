import React from 'react';

const SkeletonPricingStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Price Records Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
          </div>
          <div className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 w-12 h-12 animate-pulse" />
        </div>
      </div>
      
      {/* Active Price Records Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36 animate-pulse" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
          </div>
          <div className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 w-12 h-12 animate-pulse" />
        </div>
      </div>
      
      {/* Countries with Pricing Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 animate-pulse" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
          </div>
          <div className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 w-12 h-12 animate-pulse" />
        </div>
      </div>
      
      {/* Currencies Supported Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-36 animate-pulse" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
          </div>
          <div className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 w-12 h-12 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default SkeletonPricingStats;
