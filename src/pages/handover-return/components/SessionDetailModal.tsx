import React, { useState, useEffect } from 'react';
import { X, Edit, Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Package, ArrowRightLeft, User, Building, Play } from 'lucide-react';
import { useHandoverSession } from '../../../hooks/useHandoverSession';
import { useReturnSession } from '../../../hooks/useReturnSession';
import { useToast } from '../../../contexts/ToastContext';
import { HandoverSession, ReturnSession, CompleteHandoverRequest, CompleteReturnRequest } from '../../../types/handoverReturn';

interface SessionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  sessionType: 'handover' | 'return';
}

const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  isOpen,
  onClose,
  sessionId,
  sessionType
}) => {
  const { showToast } = useToast();
  const { session: handoverSession, getSession: getHandoverSession, updateSession: updateHandoverSession, completeSession: completeHandoverSession, loading: handoverLoading } = useHandoverSession();
  const { session: returnSession, getSession: getReturnSession, updateSession: updateReturnSession, completeSession: completeReturnSession, loading: returnLoading } = useReturnSession();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [completeForm, setCompleteForm] = useState<any>({});

  const loading = handoverLoading || returnLoading;
  const session = sessionType === 'handover' ? handoverSession : returnSession;

  useEffect(() => {
    if (isOpen && sessionId) {
      if (sessionType === 'handover') {
        getHandoverSession(sessionId);
      } else {
        getReturnSession(sessionId);
      }
    }
  }, [isOpen, sessionId, sessionType, getHandoverSession, getReturnSession]);

  useEffect(() => {
    if (session) {
      setEditForm({
        scheduledDateTime: session.scheduledDateTime,
        location: session.location,
        notes: session.notes || '',
        estimatedDurationMinutes: session.estimatedDurationMinutes
      });
    }
  }, [session]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'in_progress':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
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

  const handleSave = async () => {
    if (!session) return;
    
    setSaving(true);
    try {
      const updateData = {
        scheduledDateTime: editForm.scheduledDateTime,
        location: editForm.location,
        notes: editForm.notes,
        estimatedDurationMinutes: editForm.estimatedDurationMinutes
      };

      if (sessionType === 'handover') {
        await updateHandoverSession(sessionId, updateData);
      } else {
        await updateReturnSession(sessionId, updateData);
      }

      showToast('Session updated successfully', 'success');
      setIsEditing(false);
    } catch (error: any) {
      showToast(error.message || 'Failed to update session', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (session) {
      setEditForm({
        scheduledDateTime: session.scheduledDateTime,
        location: session.location,
        notes: session.notes || '',
        estimatedDurationMinutes: session.estimatedDurationMinutes
      });
    }
    setIsEditing(false);
  };

  const handleCompleteSession = async () => {
    if (!session) return;
    
    setCompleting(true);
    try {
      let completeData: any = {
        sessionId: session.id,
        completionNotes: completeForm.completionNotes || '',
        finalCondition: completeForm.finalCondition || 'good',
        photos: completeForm.photos || [],
        digitalSignature: completeForm.digitalSignature || null
      };

      // Add handover-specific required fields
      if (sessionType === 'handover') {
        completeData = {
          ...completeData,
          handoverCode: session.handoverCode || '',
          conditionReport: completeForm.conditionReport || {
            overallCondition: completeForm.finalCondition || 'good',
            cleanliness: 'clean',
            damageNotes: '',
            photos: []
          },
          accessoryChecklist: completeForm.accessoryChecklist || []
        };
      } else {
        // Add return-specific required fields
        completeData = {
          ...completeData,
          returnCode: session.returnCode || '',
          conditionComparison: completeForm.conditionComparison || {
            overallConditionChange: 'no_change',
            cleanlinessChange: 'no_change',
            damageNotes: '',
            photos: []
          },
          accessoryVerification: completeForm.accessoryVerification || []
        };
      }

      if (sessionType === 'handover') {
        await completeHandoverSession(completeData as CompleteHandoverRequest);
      } else {
        await completeReturnSession(completeData as CompleteReturnRequest);
      }

      showToast('Session completed successfully', 'success');
      setShowCompleteForm(false);
      // Refresh session data
      if (sessionType === 'handover') {
        getHandoverSession(sessionId);
      } else {
        getReturnSession(sessionId);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to complete session', 'error');
    } finally {
      setCompleting(false);
    }
  };

  const handleStartComplete = () => {
    setCompleteForm({
      completionNotes: '',
      finalCondition: 'good',
      photos: [],
      digitalSignature: null,
      conditionReport: {
        overallCondition: 'good',
        cleanliness: 'clean',
        damageNotes: '',
        photos: []
      },
      accessoryChecklist: [],
      conditionComparison: {
        overallConditionChange: 'no_change',
        cleanlinessChange: 'no_change',
        damageNotes: '',
        photos: []
      },
      accessoryVerification: []
    });
    setShowCompleteForm(true);
  };

  const handleCancelComplete = () => {
    setShowCompleteForm(false);
    setCompleteForm({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {sessionType === 'handover' ? (
                <Package className="w-6 h-6 text-teal-600" />
              ) : (
                <ArrowRightLeft className="w-6 h-6 text-blue-600" />
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {sessionType === 'handover' ? 'Handover' : 'Return'} Session Details
                </h2>
                <p className="text-sm text-gray-500">
                  Session #{session?.id?.slice(0, 8)}...
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {session?.status === 'scheduled' && (
                <button
                  onClick={handleStartComplete}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Complete Session
                </button>
              )}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ) : session ? (
            <div className="space-y-6">
              {/* Status and Basic Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(session.status)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                      {session.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Created: {formatDate(session.createdAt)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Booking ID</label>
                    <p className="text-sm text-gray-900 font-mono">{session.bookingId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Product ID</label>
                    <p className="text-sm text-gray-900 font-mono">{session.productId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Owner ID</label>
                    <p className="text-sm text-gray-900 font-mono">{session.ownerId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Renter ID</label>
                    <p className="text-sm text-gray-900 font-mono">{session.renterId}</p>
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Scheduled Date & Time</label>
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        value={editForm.scheduledDateTime ? new Date(editForm.scheduledDateTime).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setEditForm({...editForm, scheduledDateTime: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{formatDate(session.scheduledDateTime)}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {sessionType === 'handover' ? 'Handover' : 'Return'} Type
                    </label>
                    <p className="text-sm text-gray-900 capitalize">
                      {sessionType === 'handover' ? session.handoverType : session.returnType}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Estimated Duration</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.estimatedDurationMinutes}
                        onChange={(e) => setEditForm({...editForm, estimatedDurationMinutes: parseInt(e.target.value)})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{session.estimatedDurationMinutes} minutes</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {sessionType === 'handover' ? 'Handover' : 'Return'} Code
                    </label>
                    <p className="text-lg font-mono font-bold text-gray-900">
                      {sessionType === 'handover' ? session.handoverCode : session.returnCode}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  {isEditing ? (
                    <div className="mt-1 space-y-2">
                      <input
                        type="text"
                        placeholder="Address"
                        value={editForm.location?.address || ''}
                        onChange={(e) => setEditForm({
                          ...editForm, 
                          location: {...editForm.location, address: e.target.value}
                        })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      />
                      <input
                        type="text"
                        placeholder="Instructions"
                        value={editForm.location?.instructions || ''}
                        onChange={(e) => setEditForm({
                          ...editForm, 
                          location: {...editForm.location, instructions: e.target.value}
                        })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>
                  ) : (
                    <div className="mt-1">
                      <p className="text-sm text-gray-900">{session.location?.address}</p>
                      {session.location?.instructions && (
                        <p className="text-sm text-gray-500 mt-1">{session.location.instructions}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={editForm.notes}
                      onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Add notes about this session..."
                    />
                  ) : (
                    <p className="text-sm text-gray-900 mt-1">
                      {session.notes || 'No notes added'}
                    </p>
                  )}
                </div>
              </div>

              {/* Return Session Specific Fields */}
              {sessionType === 'return' && session.handoverSessionId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Related Handover Session</h3>
                  <p className="text-sm text-blue-800 font-mono">{session.handoverSessionId}</p>
                </div>
              )}

              {/* Condition Report (for handover sessions) */}
              {sessionType === 'handover' && session.conditionReport && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Condition Report</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-800">Overall Condition:</span>
                      <span className="ml-2 capitalize text-green-700">{session.conditionReport.overallCondition}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-800">Cleanliness:</span>
                      <span className="ml-2 capitalize text-green-700">{session.conditionReport.cleanliness}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Condition Comparison (for return sessions) */}
              {sessionType === 'return' && session.conditionComparison && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">Condition Comparison</h3>
                  <div className="text-sm">
                    <span className="font-medium text-orange-800">Overall Change:</span>
                    <span className="ml-2 capitalize text-orange-700">{session.conditionComparison.overallConditionChange}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}

              {/* Complete Session Form */}
              {showCompleteForm && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Complete Session</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-green-800 mb-2">
                        Final Condition
                      </label>
                      <select
                        value={completeForm.finalCondition}
                        onChange={(e) => setCompleteForm({...completeForm, finalCondition: e.target.value})}
                        className="block w-full px-3 py-2 border border-green-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                        <option value="damaged">Damaged</option>
                      </select>
                    </div>

                    {sessionType === 'handover' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-green-800 mb-2">
                            Overall Condition
                          </label>
                          <select
                            value={completeForm.conditionReport?.overallCondition || 'good'}
                            onChange={(e) => setCompleteForm({
                              ...completeForm, 
                              conditionReport: {
                                ...completeForm.conditionReport,
                                overallCondition: e.target.value
                              }
                            })}
                            className="block w-full px-3 py-2 border border-green-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                            <option value="fair">Fair</option>
                            <option value="poor">Poor</option>
                            <option value="damaged">Damaged</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-green-800 mb-2">
                            Cleanliness
                          </label>
                          <select
                            value={completeForm.conditionReport?.cleanliness || 'clean'}
                            onChange={(e) => setCompleteForm({
                              ...completeForm, 
                              conditionReport: {
                                ...completeForm.conditionReport,
                                cleanliness: e.target.value
                              }
                            })}
                            className="block w-full px-3 py-2 border border-green-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="very_clean">Very Clean</option>
                            <option value="clean">Clean</option>
                            <option value="acceptable">Acceptable</option>
                            <option value="dirty">Dirty</option>
                            <option value="very_dirty">Very Dirty</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-green-800 mb-2">
                            Damage Notes
                          </label>
                          <textarea
                            rows={2}
                            value={completeForm.conditionReport?.damageNotes || ''}
                            onChange={(e) => setCompleteForm({
                              ...completeForm, 
                              conditionReport: {
                                ...completeForm.conditionReport,
                                damageNotes: e.target.value
                              }
                            })}
                            className="block w-full px-3 py-2 border border-green-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                            placeholder="Describe any damage or issues..."
                          />
                        </div>
                      </>
                    )}

                    {sessionType === 'return' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-green-800 mb-2">
                            Overall Condition Change
                          </label>
                          <select
                            value={completeForm.conditionComparison?.overallConditionChange || 'no_change'}
                            onChange={(e) => setCompleteForm({
                              ...completeForm, 
                              conditionComparison: {
                                ...completeForm.conditionComparison,
                                overallConditionChange: e.target.value
                              }
                            })}
                            className="block w-full px-3 py-2 border border-green-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="improved">Improved</option>
                            <option value="no_change">No Change</option>
                            <option value="slightly_worse">Slightly Worse</option>
                            <option value="significantly_worse">Significantly Worse</option>
                            <option value="damaged">Damaged</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-green-800 mb-2">
                            Cleanliness Change
                          </label>
                          <select
                            value={completeForm.conditionComparison?.cleanlinessChange || 'no_change'}
                            onChange={(e) => setCompleteForm({
                              ...completeForm, 
                              conditionComparison: {
                                ...completeForm.conditionComparison,
                                cleanlinessChange: e.target.value
                              }
                            })}
                            className="block w-full px-3 py-2 border border-green-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="improved">Improved</option>
                            <option value="no_change">No Change</option>
                            <option value="slightly_worse">Slightly Worse</option>
                            <option value="significantly_worse">Significantly Worse</option>
                            <option value="much_worse">Much Worse</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-green-800 mb-2">
                            Condition Change Notes
                          </label>
                          <textarea
                            rows={2}
                            value={completeForm.conditionComparison?.damageNotes || ''}
                            onChange={(e) => setCompleteForm({
                              ...completeForm, 
                              conditionComparison: {
                                ...completeForm.conditionComparison,
                                damageNotes: e.target.value
                              }
                            })}
                            className="block w-full px-3 py-2 border border-green-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                            placeholder="Describe any changes in condition since handover..."
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-green-800 mb-2">
                        Completion Notes
                      </label>
                      <textarea
                        rows={3}
                        value={completeForm.completionNotes}
                        onChange={(e) => setCompleteForm({...completeForm, completionNotes: e.target.value})}
                        className="block w-full px-3 py-2 border border-green-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="Add any notes about the session completion..."
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-green-200">
                      <button
                        onClick={handleCancelComplete}
                        className="px-4 py-2 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCompleteSession}
                        disabled={completing}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {completing ? 'Completing...' : 'Complete Session'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Session not found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionDetailModal;
