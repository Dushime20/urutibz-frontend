import React from 'react';

const SkeletonMetrics2: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {/* Active Users Skeleton */}
      <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl shadow p-4">
        <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 w-10 h-10 mb-2 animate-pulse" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse mb-1" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
      </div>
      
      {/* Current Bookings Skeleton */}
      <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl shadow p-4">
        <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 w-10 h-10 mb-2 animate-pulse" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse mb-1" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
      </div>
      
      {/* System Load Skeleton */}
      <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl shadow p-4">
        <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 w-10 h-10 mb-2 animate-pulse" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse mb-1" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse" />
      </div>
      
      {/* Response Time Skeleton */}
      <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl shadow p-4">
        <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 w-10 h-10 mb-2 animate-pulse" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse mb-1" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
      </div>
      
      {/* Uptime Skeleton */}
      <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl shadow p-4">
        <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 w-10 h-10 mb-2 animate-pulse" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse mb-1" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
      </div>
      
      {/* Timestamp Skeleton */}
      <div className="flex flex-col items-center bg-white dark:bg-gray-800 rounded-xl shadow p-4">
        <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 w-10 h-10 mb-2 animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse mb-1" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
      </div>
    </div>
  );
};

export default SkeletonMetrics2;
