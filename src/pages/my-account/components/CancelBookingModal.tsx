import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  bookingTitle?: string;
  isLoading?: boolean;
}

const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  bookingTitle,
  isLoading = false
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reason is mandatory - must be at least 10 characters
    if (!reason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }
    
    if (reason.trim().length < 10) {
      setError('Please provide a detailed reason (at least 10 characters)');
      return;
    }

    setError('');
    onConfirm(reason.trim());
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">
              Request Cancellation
            </h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {bookingTitle && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-1">Booking</p>
              <p className="font-medium text-gray-900 dark:text-slate-100">{bookingTitle}</p>
            </div>
          )}

          <p className="text-gray-600 dark:text-slate-300 mb-4">
            Submit a cancellation request to the owner. The owner will review your request and decide to approve or reject it. Please provide a reason for cancellation.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label 
                htmlFor="reason" 
                className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2"
              >
                Reason for Cancellation <span className="text-red-600">*</span>
              </label>
              <textarea
                id="reason"
                rows={4}
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError('');
                }}
                placeholder="Difficulty scheduling, item not needed, found alternative... (minimum 10 characters)"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-slate-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 resize-none"
                disabled={isLoading}
              />
              {error && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Keep Booking
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting Request...' : 'Request Cancellation'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;
