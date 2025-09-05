import React from 'react';

const SkeletonAdminStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-28 animate-pulse" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
            </div>
            <div className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 w-12 h-12 animate-pulse" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonAdminStats;


