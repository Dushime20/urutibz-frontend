import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
    <div className="text-lg font-semibold text-red-600 mb-2">{message}</div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-2 px-4 py-2 bg-my-primary text-white rounded-lg hover:bg-my-primary/90 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);

export default ErrorState; 