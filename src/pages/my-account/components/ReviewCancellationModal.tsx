import React, { useState } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, User } from 'lucide-react';

interface ReviewCancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (notes?: string) => void;
  onReject: (notes: string) => void;
  bookingTitle?: string;
  renterReason?: string;
  isLoading?: boolean;
}

const ReviewCancellationModal: React.FC<ReviewCancellationModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  onReject,
  bookingTitle,
  renterReason,
  isLoading = false
}) => {
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (!isOpen) return null;

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    onApprove(approveNotes.trim() || undefined);
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rejectNotes.trim()) {
      alert('Please provide a reason for rejecting the cancellation');
      return;
    }
    
    onReject(rejectNotes.trim());
  };

  const handleClose = () => {
    setApproveNotes('');
    setRejectNotes('');
    setShowApproveForm(false);
    setShowRejectForm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">
              Review Cancellation Request
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
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Booking</p>
              <p className="font-medium text-blue-900 dark:text-blue-100">{bookingTitle}</p>
            </div>
          )}

          {/* Renter's Reason */}
          {renterReason && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border-l-4 border-yellow-500">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Renter's Reason</p>
              </div>
              <p className="text-gray-900 dark:text-slate-100">{renterReason}</p>
            </div>
          )}

          {/* Decision Prompt */}
          {!showApproveForm && !showRejectForm && (
            <div>
              <p className="text-gray-600 dark:text-slate-300 mb-6">
                The renter has requested to cancel this booking. Please review the reason and decide whether to approve or reject this cancellation request.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectForm(false);
                    setShowApproveForm(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Cancellation
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowApproveForm(false);
                    setShowRejectForm(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Cancellation
                </button>
              </div>
            </div>
          )}

          {/* Approve Form */}
          {showApproveForm && (
            <form onSubmit={handleApprove}>
              <div className="mb-4">
                <p className="text-green-700 dark:text-green-400 mb-4 font-medium">
                  ✓ Approving this cancellation will:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-slate-300 mb-4 ml-4">
                  <li>Cancel the booking immediately</li>
                  <li>Make the product available again</li>
                  <li>Initiate refund processing</li>
                  <li>Notify the renter</li>
                </ul>

                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Add notes (optional)
                </label>
                <textarea
                  rows={3}
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  placeholder="e.g., Agreed to cancel, will process refund..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-slate-800 dark:text-slate-100 resize-none"
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowApproveForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Confirm Approval'}
                </button>
              </div>
            </form>
          )}

          {/* Reject Form */}
          {showRejectForm && (
            <form onSubmit={handleReject}>
              <div className="mb-4">
                <p className="text-red-700 dark:text-red-400 mb-4 font-medium">
                  ✗ Rejecting this cancellation will:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-slate-300 mb-4 ml-4">
                  <li>Keep the booking confirmed</li>
                  <li>Product remains booked</li>
                  <li>No refund will be processed</li>
                  <li>Notify the renter of rejection</li>
                </ul>

                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Reason for Rejection <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="e.g., Too close to rental date, can't find replacement..."
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-slate-800 dark:text-slate-100 resize-none"
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  disabled={isLoading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          )}

          {/* Cancel Button */}
          {(showApproveForm || showRejectForm) && (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-slate-600与 transition-colors disabled:opacity-50"
              >
                Cancel Review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCancellationModal;
