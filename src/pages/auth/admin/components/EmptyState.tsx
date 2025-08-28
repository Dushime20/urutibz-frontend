import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="mb-4 text-5xl text-gray-300">{icon}</div>
    <div className="text-lg font-semibold text-gray-700 mb-1">{title}</div>
    {message && <div className="text-gray-500 text-sm text-center max-w-xs">{message}</div>}
  </div>
);

export default EmptyState; 