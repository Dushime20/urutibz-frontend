import React, { useState, useEffect } from 'react';
import { X, User, FileText, MapPin, Calendar, Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getVerificationById, rejectVerification } from '../service/admin';
import type { UserVerification } from '../interfaces';

interface VerificationDetailsModalProps {
  verificationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  token?: string;
}

interface VerificationDetails {
  id: string;
  user_id: string;
  verification_type: string;
  verification_status: string;
  document_number?: string;
  document_front_image?: string;
  document_back_image?: string;
  selfie_image?: string;
  ai_profile_score?: string;
  ai_processing_status: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  city?: string;
  country?: string;
  address?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  rejection_reason?: string;
  verified_by?: string;
  verified_at?: string;
}

const VerificationDetailsModal: React.FC<VerificationDetailsModalProps> = ({
  verificationId,
  isOpen,
  onClose,
  token
}) => {
  const [verification, setVerification] = useState<VerificationDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && verificationId) {
      fetchVerificationDetails();
    }
  }, [isOpen, verificationId]);

  const fetchVerificationDetails = async () => {
    if (!verificationId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getVerificationById(verificationId, token);
      if (response?.success && response?.data) {
        setVerification(response.data);
      } else {
        setError('Failed to fetch verification details');
      }
    } catch (err) {
      console.error('Error fetching verification details:', err);
      setError('Failed to fetch verification details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const handleReject = async () => {
    if (!verificationId || !rejectNotes.trim()) return;
    
    setRejecting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await rejectVerification(verificationId, rejectNotes.trim(), token);
      // Refresh verification details after rejection
      await fetchVerificationDetails();
      setShowRejectForm(false);
      setRejectNotes('');
      setSuccessMessage('Verification rejected successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error rejecting verification:', err);
      setError('Failed to reject verification');
    } finally {
      setRejecting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-my-primary" />
            <h2 className="text-xl font-semibold text-gray-900">
              Verification Details
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-my-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">{error}</div>
              <button
                onClick={fetchVerificationDetails}
                className="px-4 py-2 bg-my-primary text-white rounded-lg hover:bg-my-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : successMessage ? (
            <div className="text-center py-12">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">{successMessage}</p>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Continue
              </button>
            </div>
          ) : verification ? (
            <div className="space-y-6">
              {/* Status Header */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(verification.verification_status)}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {verification.first_name} {verification.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">{verification.email}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(verification.verification_status)}`}>
                    {verification.verification_status}
                  </span>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <span>Personal Information</span>
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-sm text-gray-900">{verification.first_name} {verification.last_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900">{verification.email}</p>
                    </div>
                    {verification.phone_number && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-sm text-gray-900">{verification.phone_number}</p>
                      </div>
                    )}
                    {verification.date_of_birth && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                        <p className="text-sm text-gray-900">{verification.date_of_birth}</p>
                      </div>
                    )}
                    {verification.gender && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Gender</label>
                        <p className="text-sm text-gray-900 capitalize">{verification.gender}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <span>Verification Details</span>
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Type</label>
                      <p className="text-sm text-gray-900 capitalize">{verification.verification_type}</p>
                    </div>
                    {verification.document_number && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Document Number</label>
                        <p className="text-sm text-gray-900">{verification.document_number}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">AI Processing Status</label>
                      <p className="text-sm text-gray-900 capitalize">{verification.ai_processing_status}</p>
                    </div>
                    {verification.ai_profile_score && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">AI Profile Score</label>
                        <p className="text-sm text-gray-900">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            parseFloat(verification.ai_profile_score) >= 0.7 ? 'bg-green-100 text-green-700' :
                            parseFloat(verification.ai_profile_score) >= 0.5 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {parseFloat(verification.ai_profile_score).toFixed(2)}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Location Information */}
              {(verification.city || verification.country || verification.address) && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span>Location Information</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {verification.city && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">City</label>
                        <p className="text-sm text-gray-900">{verification.city}</p>
                      </div>
                    )}
                    {verification.country && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Country</label>
                        <p className="text-sm text-gray-900">{verification.country}</p>
                      </div>
                    )}
                    {verification.address && (
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-500">Address</label>
                        <p className="text-sm text-gray-900">{verification.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span>Timeline</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <p className="text-sm text-gray-900">{formatDate(verification.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="text-sm text-gray-900">{formatDate(verification.updated_at)}</p>
                  </div>
                  {verification.verified_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Verified At</label>
                      <p className="text-sm text-gray-900">{formatDate(verification.verified_at)}</p>
                    </div>
                  )}
                  {verification.verified_by && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Verified By</label>
                      <p className="text-sm text-gray-900">{verification.verified_by}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes and Rejection Reason */}
              {(verification.notes || verification.rejection_reason) && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Additional Information</h4>
                  <div className="space-y-3">
                    {verification.notes && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Notes</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{verification.notes}</p>
                      </div>
                    )}
                    {verification.rejection_reason && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Rejection Reason</label>
                        <p className="text-sm text-gray-900 bg-red-50 p-3 rounded-lg text-red-700">{verification.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Document Images */}
              {(verification.document_front_image || verification.document_back_image || verification.selfie_image) && (
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900">Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {verification.document_front_image && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-2">Front Document</label>
                        <img 
                          src={verification.document_front_image} 
                          alt="Document Front" 
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    {verification.document_back_image && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-2">Back Document</label>
                        <img 
                          src={verification.document_back_image} 
                          alt="Document Back" 
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                    {verification.selfie_image && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 block mb-2">Selfie</label>
                        <img 
                          src={verification.selfie_image} 
                          alt="Selfie" 
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200">
          {/* Reject Button - Only show for pending verifications */}
          {verification?.verification_status?.toLowerCase() === 'pending' && (
            <div className="flex-1">
              {!showRejectForm ? (
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Verification
                </button>
                  ) : (
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={rejectNotes}
                    onChange={(e) => setRejectNotes(e.target.value)}
                    placeholder="Enter rejection reason..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <button
                    onClick={handleReject}
                    disabled={rejecting || !rejectNotes.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rejecting ? 'Rejecting...' : 'Confirm Reject'}
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectForm(false);
                      setRejectNotes('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Close
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationDetailsModal;
