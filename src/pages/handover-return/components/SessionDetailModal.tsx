import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Edit, Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Package, ArrowRightLeft, User, Building, Play } from 'lucide-react';
import { useHandoverSession } from '../../../hooks/useHandoverSession';
import { useReturnSession } from '../../../hooks/useReturnSession';
import { useToast } from '../../../contexts/ToastContext';
import { HandoverSession, ReturnSession, CompleteHandoverRequest, CompleteReturnRequest } from '../../../types/handoverReturn';
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';

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
  const { tSync } = useTranslation();
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
  // Current user (used to authorize who can complete the session)
  let currentUserId: string | null = null;
  try {
    const token = (typeof window !== 'undefined' && localStorage.getItem('token')) || '';
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      currentUserId = payload?.sub || payload?.userId || payload?.id || null;
    }
    if (!currentUserId) {
      const storedUser = (typeof window !== 'undefined' && localStorage.getItem('user')) || '';
      if (storedUser) {
        const u = JSON.parse(storedUser);
        currentUserId = u?.id || u?.userId || null;
      }
    }
  } catch {}

  // Friendly names derived from IDs
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
  const [friendly, setFriendly] = useState<{ productName?: string; bookingName?: string; ownerName?: string; ownerPhone?: string; renterName?: string }>({});

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

  // Fetch friendly names when IDs are available
  useEffect(() => {
    (async () => {
      if (!session) return;
      const updates: any = {};
      try {
        if (session.productId) {
          const { data } = await axios.get(`${API_BASE_URL}/products/${session.productId}`);
          const prod = data?.data || data;
          updates.productName = prod?.name || prod?.title || prod?.productName || `Product ${String(session.productId).slice(0,8)}`;
        }
      } catch {}
      try {
        if (session.bookingId) {
          const { data } = await axios.get(`${API_BASE_URL}/bookings/${session.bookingId}`);
          const b = data?.data || data;
          updates.bookingName = b?.reference || b?.code || b?.bookingCode || `Booking ${String(session.bookingId).slice(0,8)}`;
        }
      } catch {}
      try {
        if (session.ownerId) {
          const { data } = await axios.get(`${API_BASE_URL}/users/${session.ownerId}`);
          const u = data?.data || data;
          updates.ownerName = u?.name || [u?.firstName, u?.lastName].filter(Boolean).join(' ') || u?.email || `Owner ${String(session.ownerId).slice(0,8)}`;
          updates.ownerPhone = u?.phone || u?.phoneNumber || u?.mobile || '';
        }
      } catch {}
      try {
        if (session.renterId) {
          const { data } = await axios.get(`${API_BASE_URL}/users/${session.renterId}`);
          const u = data?.data || data;
          updates.renterName = u?.name || [u?.firstName, u?.lastName].filter(Boolean).join(' ') || u?.email || `Renter ${String(session.renterId).slice(0,8)}`;
        }
      } catch {}
      if (Object.keys(updates).length) setFriendly((prev) => ({ ...prev, ...updates }));
    })();
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

      showToast(tSync('Session updated successfully'), 'success');
      setIsEditing(false);
    } catch (error: any) {
      showToast(error.message || tSync('Failed to update session'), 'error');
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

      showToast(tSync('Session completed successfully'), 'success');
      setShowCompleteForm(false);
      // Refresh session data
      if (sessionType === 'handover') {
        getHandoverSession(sessionId);
      } else {
        getReturnSession(sessionId);
      }
    } catch (error: any) {
      showToast(error.message || tSync('Failed to complete session'), 'error');
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-slate-700">
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div className="flex items-center space-x-3">
              {sessionType === 'handover' ? (
                <Package className="w-6 h-6 text-teal-600" />
              ) : (
                <ArrowRightLeft className="w-6 h-6 text-blue-600" />
              )}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">
                  {sessionType === 'handover' ? <TranslatedText text="Handover" /> : <TranslatedText text="Return" />} <TranslatedText text="Session Details" />
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 break-all">
                  <TranslatedText text="Session" /> #{session?.id?.slice(0, 8)}...
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {session?.status === 'scheduled' && session?.renterId === currentUserId && (
                <button
                  onClick={handleStartComplete}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  <TranslatedText text="Complete Session" />
                </button>
              )}
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-700 text-sm font-medium rounded-md text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? <TranslatedText text="Cancel" /> : <TranslatedText text="Edit" />}
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-3 sm:space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 dark:bg-slate-700"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 dark:bg-slate-700"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 dark:bg-slate-700"></div>
            </div>
          ) : session ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Status and Basic Info */}
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(session.status)}
                    <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(session.status)}`}>
                      {tSync(session.status.replace('_', ' '))}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                    <TranslatedText text="Created" />: {formatDate(session.createdAt)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300"><TranslatedText text="Booking" /></label>
                    <p className="text-sm text-gray-900 dark:text-slate-100 break-words">
                      {friendly.bookingName || '—'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 font-mono break-all">{session.bookingId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300"><TranslatedText text="Product" /></label>
                    <p className="text-sm text-gray-900 dark:text-slate-100 break-words">
                      {friendly.productName || '—'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 font-mono break-all">{session.productId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300"><TranslatedText text="Owner" /></label>
                    <p className="text-sm text-gray-900 dark:text-slate-100 break-words">
                      {friendly.ownerName || '—'}
                    </p>
                    {friendly.ownerPhone && (
                      <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5 break-words">{friendly.ownerPhone}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-slate-400 font-mono break-all">{session.ownerId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300"><TranslatedText text="Renter" /></label>
                    <p className="text-sm text-gray-900 dark:text-slate-100 break-words">
                      {friendly.renterName || '—'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 font-mono break-all">{session.renterId}</p>
                  </div>
                </div>
              </div>

              {/* Session Details */}
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 sm:p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-3 sm:mb-4"><TranslatedText text="Session Details" /></h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300"><TranslatedText text="Scheduled Date & Time" /></label>
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        value={editForm.scheduledDateTime ? new Date(editForm.scheduledDateTime).toISOString().slice(0, 16) : ''}
                        onChange={(e) => setEditForm({...editForm, scheduledDateTime: e.target.value})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:text-slate-100"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 dark:text-slate-100">{formatDate(session.scheduledDateTime)}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      {sessionType === 'handover' ? <TranslatedText text="Handover" /> : <TranslatedText text="Return" />} <TranslatedText text="Type" />
                    </label>
                    <p className="text-sm text-gray-900 dark:text-slate-100 capitalize">
                      {sessionType === 'handover' ? session.handoverType : session.returnType}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300"><TranslatedText text="Estimated Duration" /></label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.estimatedDurationMinutes}
                        onChange={(e) => setEditForm({...editForm, estimatedDurationMinutes: parseInt(e.target.value)})}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:text-slate-100"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 dark:text-slate-100">{session.estimatedDurationMinutes} <TranslatedText text="minutes" /></p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      {sessionType === 'handover' ? <TranslatedText text="Handover" /> : <TranslatedText text="Return" />} <TranslatedText text="Code" />
                    </label>
                    <p className="text-lg font-mono font-bold text-gray-900 dark:text-slate-100">
                      {sessionType === 'handover' ? session.handoverCode : session.returnCode}
                    </p>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300"><TranslatedText text="Location" /></label>
                  {isEditing ? (
                    <div className="mt-1 space-y-2">
                      <input
                        type="text"
                        placeholder={tSync("Address")}
                        value={editForm.location?.address || ''}
                        onChange={(e) => setEditForm({
                          ...editForm, 
                          location: {...editForm.location, address: e.target.value}
                        })}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:text-slate-100"
                      />
                      <input
                        type="text"
                        placeholder={tSync("Instructions")}
                        value={editForm.location?.instructions || ''}
                        onChange={(e) => setEditForm({
                          ...editForm, 
                          location: {...editForm.location, instructions: e.target.value}
                        })}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:text-slate-100"
                      />
                    </div>
                  ) : (
                    <div className="mt-1">
                      <p className="text-sm text-gray-900 dark:text-slate-100 break-words">{session.location?.address}</p>
                      {session.location?.instructions && (
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 break-words">{session.location.instructions}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-3 sm:mt-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300"><TranslatedText text="Notes" /></label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={editForm.notes}
                      onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:text-slate-100"
                      placeholder={tSync("Add notes about this session...")}
                    />
                  ) : (
                    <p className="text-sm text-gray-900 dark:text-slate-100 mt-1 break-words">
                      {session.notes || tSync('No notes added')}
                    </p>
                  )}
                </div>
              </div>

              {/* Return Session Specific Fields */}
              {sessionType === 'return' && session.handoverSessionId && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-lg p-3 sm:p-4">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2"><TranslatedText text="Related Handover Session" /></h3>
                  <p className="text-sm text-blue-800 dark:text-blue-300 font-mono break-all">{session.handoverSessionId}</p>
                </div>
              )}

              {/* Condition Report (for handover sessions) */}
              {sessionType === 'handover' && session.conditionReport && (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/40 rounded-lg p-3 sm:p-4">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-2"><TranslatedText text="Condition Report" /></h3>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-800 dark:text-green-300"><TranslatedText text="Overall Condition" />:</span>
                      <span className="ml-2 capitalize text-green-700 dark:text-green-300/90">{session.conditionReport.overallCondition}</span>
                    </div>
                    <div>
                      <span className="font-medium text-green-800 dark:text-green-300"><TranslatedText text="Cleanliness" />:</span>
                      <span className="ml-2 capitalize text-green-700 dark:text-green-300/90">{session.conditionReport.cleanliness}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Condition Comparison (for return sessions) */}
              {sessionType === 'return' && session.conditionComparison && (
                <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40 rounded-lg p-3 sm:p-4">
                  <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-300 mb-2"><TranslatedText text="Condition Comparison" /></h3>
                  <div className="text-sm">
                    <span className="font-medium text-orange-800 dark:text-orange-300"><TranslatedText text="Overall Change" />:</span>
                    <span className="ml-2 capitalize text-orange-700 dark:text-orange-300/90">{session.conditionComparison.overallConditionChange}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 dark:border-slate-700 text-sm font-medium rounded-md text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <TranslatedText text="Cancel" />
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? <TranslatedText text="Saving..." /> : <TranslatedText text="Save Changes" />}
                  </button>
                </div>
              )}

              {/* Complete Session Form */}
              {showCompleteForm && (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/40 rounded-lg p-3 sm:p-4 mt-6">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-3 sm:mb-4"><TranslatedText text="Complete Session" /></h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                        <TranslatedText text="Final Condition" />
                      </label>
                      <select
                        value={completeForm.finalCondition}
                        onChange={(e) => setCompleteForm({...completeForm, finalCondition: e.target.value})}
                        className="block w-full px-3 py-2 border border-green-300 dark:border-green-900/40 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-slate-900 dark:text-slate-100"
                      >
                        <option value="excellent"><TranslatedText text="Excellent" /></option>
                        <option value="good"><TranslatedText text="Good" /></option>
                        <option value="fair"><TranslatedText text="Fair" /></option>
                        <option value="poor"><TranslatedText text="Poor" /></option>
                        <option value="damaged"><TranslatedText text="Damaged" /></option>
                      </select>
                    </div>

                    {sessionType === 'handover' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                            <TranslatedText text="Overall Condition" />
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
                            className="block w-full px-3 py-2 border border-green-300 dark:border-green-900/40 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-slate-900 dark:text-slate-100"
                          >
                            <option value="excellent"><TranslatedText text="Excellent" /></option>
                            <option value="good"><TranslatedText text="Good" /></option>
                            <option value="fair"><TranslatedText text="Fair" /></option>
                            <option value="poor"><TranslatedText text="Poor" /></option>
                            <option value="damaged"><TranslatedText text="Damaged" /></option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                            <TranslatedText text="Cleanliness" />
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
                            className="block w-full px-3 py-2 border border-green-300 dark:border-green-900/40 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-slate-900 dark:text-slate-100"
                          >
                            <option value="very_clean"><TranslatedText text="Very Clean" /></option>
                            <option value="clean"><TranslatedText text="Clean" /></option>
                            <option value="acceptable"><TranslatedText text="Acceptable" /></option>
                            <option value="dirty"><TranslatedText text="Dirty" /></option>
                            <option value="very_dirty"><TranslatedText text="Very Dirty" /></option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                            <TranslatedText text="Damage Notes" />
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
                            className="block w-full px-3 py-2 border border-green-300 dark:border-green-900/40 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-slate-900 dark:text-slate-100"
                            placeholder={tSync("Describe any damage or issues...")}
                          />
                        </div>
                      </>
                    )}

                    {sessionType === 'return' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                            <TranslatedText text="Overall Condition Change" />
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
                            className="block w-full px-3 py-2 border border-green-300 dark:border-green-900/40 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-slate-900 dark:text-slate-100"
                          >
                            <option value="improved"><TranslatedText text="Improved" /></option>
                            <option value="no_change"><TranslatedText text="No Change" /></option>
                            <option value="slightly_worse"><TranslatedText text="Slightly Worse" /></option>
                            <option value="significantly_worse"><TranslatedText text="Significantly Worse" /></option>
                            <option value="damaged"><TranslatedText text="Damaged" /></option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                            <TranslatedText text="Cleanliness Change" />
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
                            className="block w-full px-3 py-2 border border-green-300 dark:border-green-900/40 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-slate-900 dark:text-slate-100"
                          >
                            <option value="improved"><TranslatedText text="Improved" /></option>
                            <option value="no_change"><TranslatedText text="No Change" /></option>
                            <option value="slightly_worse"><TranslatedText text="Slightly Worse" /></option>
                            <option value="significantly_worse"><TranslatedText text="Significantly Worse" /></option>
                            <option value="much_worse"><TranslatedText text="Much Worse" /></option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                            <TranslatedText text="Condition Change Notes" />
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
                            className="block w-full px-3 py-2 border border-green-300 dark:border-green-900/40 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-slate-900 dark:text-slate-100"
                            placeholder={tSync("Describe any changes in condition since handover...")}
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                        <TranslatedText text="Completion Notes" />
                      </label>
                      <textarea
                        rows={3}
                        value={completeForm.completionNotes}
                        onChange={(e) => setCompleteForm({...completeForm, completionNotes: e.target.value})}
                        className="block w-full px-3 py-2 border border-green-300 dark:border-green-900/40 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-slate-900 dark:text-slate-100"
                        placeholder={tSync("Add any notes about the session completion...")}
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-green-200 dark:border-green-900/40">
                      <button
                        onClick={handleCancelComplete}
                        className="px-4 py-2 border border-green-300 dark:border-green-900/40 text-sm font-medium rounded-md text-green-700 dark:text-green-300 bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-slate-700"
                      >
                        <TranslatedText text="Cancel" />
                      </button>
                      <button
                        onClick={handleCompleteSession}
                        disabled={completing}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {completing ? <TranslatedText text="Completing..." /> : <TranslatedText text="Complete Session" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-slate-400"><TranslatedText text="Session not found" /></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionDetailModal;
