import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Clock, CheckCircle, AlertTriangle, Eye, User, FileText, Camera, Package, DollarSign, Play, Loader2, Users } from 'lucide-react';
import { inspectionService } from '../../../services/inspectionService';
import { getProductById } from '../../../pages/my-account/service/api';
import type { Inspection } from '../../../types/inspection';
import { InspectionStatus, ItemCondition } from '../../../types/inspection';
import StatusBadge from '../../../components/inspections/StatusBadge';

interface InspectorInspectionDetailsModalProps {
  isOpen: boolean;
  inspectionId: string;
  onClose: () => void;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
  onRefresh?: () => void;
}

const InspectorInspectionDetailsModal: React.FC<InspectorInspectionDetailsModalProps> = ({
  isOpen,
  inspectionId,
  onClose,
  onStart,
  onComplete,
  onRefresh
}) => {
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [inspectionDetails, setInspectionDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && inspectionId) {
      loadInspection();
    }
  }, [isOpen, inspectionId]);

  const loadInspection = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 [InspectorInspectionDetailsModal] Loading inspection:', inspectionId);
      
      const inspectionData = await inspectionService.getInspection(inspectionId);
      console.log('📦 [InspectorInspectionDetailsModal] Raw API Response:', inspectionData);
      
      setInspection(inspectionData.inspection);
      setInspectionDetails(inspectionData);

      // Load product name
      try {
        const pid = inspectionData.inspection?.productId;
        if (pid) {
          const prod = await getProductById(pid);
          const name = prod?.title || prod?.name || prod?.productName || '';
          if (name) setProductName(String(name));
          console.log('📦 [InspectorInspectionDetailsModal] Product loaded:', name);
        }
      } catch (err) {
        console.warn('Failed to load product:', err);
      }
    } catch (error: any) {
      console.error('❌ [InspectorInspectionDetailsModal] Error loading inspection:', error);
      setError(error?.message || 'Failed to load inspection details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'pre_rental':
        return 'Pre-Rental Inspection';
      case 'post_rental':
        return 'Post-Rental Inspection';
      case 'post_return':
        return 'Post-Return Inspection';
      case 'third_party_professional':
        return 'Third-Party Professional Inspection';
      case 'damage_assessment':
        return 'Damage Assessment';
      case 'maintenance_check':
        return 'Maintenance Check';
      case 'quality_verification':
        return 'Quality Verification';
      default:
        return type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Inspection';
    }
  };

  const handleStart = async () => {
    if (!inspection?.id || !onStart) return;
    try {
      await onStart(inspection.id);
      await loadInspection(); // Refresh data
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error starting inspection:', error);
    }
  };

  const handleComplete = async () => {
    if (!inspection?.id || !onComplete) return;
    try {
      await onComplete(inspection.id);
      await loadInspection(); // Refresh data
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error completing inspection:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500/60 dark:bg-black/60 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-5xl transform overflow-hidden rounded-xl bg-white dark:bg-gray-900 text-left shadow-2xl transition-all border border-gray-200 dark:border-gray-700 max-h-[95vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-[#00aaac] dark:from-gray-800 dark:to-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700 z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">
                  Inspection Details
                </h3>
                {productName && (
                  <p className="text-sm text-white/90 mt-1">
                    {productName}
                  </p>
                )}
                {inspection && (
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={inspection.status} />
                    <span className="text-xs text-white/80 font-mono">
                      {inspection.id?.substring(0, 8)}...
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-md bg-white/10 hover:bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50 p-2 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-my-primary animate-spin mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Loading inspection details...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Error Loading Inspection</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
                <button
                  onClick={loadInspection}
                  className="px-4 py-2 bg-my-primary text-white rounded-lg hover:bg-my-primary/90 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : !inspection ? (
              <div className="text-center py-12">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Inspection not found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  The inspection you're looking for doesn't exist.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3">
                  {inspection.status === InspectionStatus.PENDING && onStart && (
                    <button
                      onClick={handleStart}
                      className="px-4 py-2 bg-my-primary text-white rounded-lg hover:bg-my-primary/90 transition-colors flex items-center gap-2 font-medium"
                    >
                      <Play className="w-4 h-4" />
                      Start Inspection
                    </button>
                  )}
                  {inspection.status === InspectionStatus.IN_PROGRESS && onComplete && (
                    <button
                      onClick={handleComplete}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete Inspection
                    </button>
                  )}
                </div>

                {/* Basic Information Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-my-primary" />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Inspection Type</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {getTypeLabel(inspection.inspectionType || '')}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                      <StatusBadge status={inspection.status} />
                    </div>
                    {inspection.scheduledAt && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Scheduled Date
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {formatDate(inspection.scheduledAt)}
                        </p>
                      </div>
                    )}
                    {inspection.location && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Location
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {inspection.location}
                        </p>
                      </div>
                    )}
                    {inspection.createdAt && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Created
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {formatDate(inspection.createdAt)}
                        </p>
                      </div>
                    )}
                    {inspection.startedAt && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          Started
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {formatDate(inspection.startedAt)}
                        </p>
                      </div>
                    )}
                    {inspection.completedAt && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {formatDate(inspection.completedAt)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Third-Party Inspection Details */}
                  {(() => {
                    const inspectionAny = inspection as any;
                    const isThirdParty = inspectionAny?.is_third_party_inspection ||
                                       inspectionAny?.isThirdPartyInspection ||
                                       String(inspection?.inspectionType || '') === 'third_party_professional';
                    if (!isThirdParty) return null;
                    
                    const tier = (inspection as any).inspection_tier || (inspection as any).inspectionTier || 'standard';
                    const cost = (inspection as any).inspection_cost || (inspection as any).inspectionCost;
                    const currency = (inspection as any).currency || 'USD';
                    const totalPoints = (inspection as any).total_points || (inspection as any).totalPoints;
                    
                    return (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Inspection Details</h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {tier && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tier</p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
                                {tier} {totalPoints && `(${totalPoints}-point check)`}
                              </p>
                            </div>
                          )}
                          {cost !== undefined && cost !== null && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                Cost
                              </p>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {currency} {parseFloat(cost.toString()).toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Inspector Notes */}
                  {inspection.inspectorNotes && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Inspector Notes</p>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {inspection.inspectorNotes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* General Notes */}
                  {inspection.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">General Notes</p>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {inspection.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Participants Section */}
                {(() => {
                  const participants = inspectionDetails?.participants;
                  const hasParticipants = participants && (
                    (participants.inspector && (participants.inspector.name || participants.inspector.email)) ||
                    (participants.owner && (participants.owner.name || participants.owner.email)) ||
                    (participants.renter && (participants.renter.name || participants.renter.email))
                  );

                  if (!hasParticipants) return null;

                  return (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        Participants
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Inspector */}
                        {participants?.inspector && (participants.inspector.name || participants.inspector.email) && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-my-primary/10 dark:bg-my-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-my-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Inspector</p>
                                {participants.inspector.name && (
                                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                    {participants.inspector.name}
                                  </p>
                                )}
                                {participants.inspector.email && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                                    {participants.inspector.email}
                                  </p>
                                )}
                                {participants.inspector.role && (
                                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-my-primary/10 text-my-primary dark:bg-my-primary/20 dark:text-my-primary rounded">
                                    {participants.inspector.role}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Owner */}
                        {participants?.owner && (participants.owner.name || participants.owner.email) && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Owner</p>
                                {participants.owner.name && (
                                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                    {participants.owner.name}
                                  </p>
                                )}
                                {participants.owner.email && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                                    {participants.owner.email}
                                  </p>
                                )}
                                {participants.owner.role && (
                                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                                    {participants.owner.role}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Renter */}
                        {participants?.renter && (participants.renter.name || participants.renter.email) && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Renter</p>
                                {participants.renter.name && (
                                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                    {participants.renter.name}
                                  </p>
                                )}
                                {participants.renter.email && (
                                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                                    {participants.renter.email}
                                  </p>
                                )}
                                {participants.renter.role && (
                                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded">
                                    {participants.renter.role}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Pre-Inspection Data (Owner) - For Reference */}
                {inspection.ownerPreInspectionData && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Owner's Pre-Inspection Data (Reference)
                    </h4>
                    {inspection.ownerPreInspectionData.condition && (
                      <div className="space-y-4">
                        {inspection.ownerPreInspectionData.condition.overallCondition && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Overall Condition</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
                              {inspection.ownerPreInspectionData.condition.overallCondition}
                            </p>
                          </div>
                        )}
                        {inspection.ownerPreInspectionData.condition.items && inspection.ownerPreInspectionData.condition.items.length > 0 && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Items</p>
                            <div className="space-y-2">
                              {inspection.ownerPreInspectionData.condition.items.map((item: any, index: number) => (
                                <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded p-3 border border-gray-200 dark:border-gray-600">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.itemName}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">Condition: {item.condition}</p>
                                  {item.description && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {inspection.ownerPreInspectionData.notes && (
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Owner Notes</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{inspection.ownerPreInspectionData.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Inspection Items */}
                {((inspectionDetails?.items && inspectionDetails.items.length > 0) || (inspection.items && inspection.items.length > 0)) && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-my-primary" />
                      Inspection Items
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({(inspectionDetails?.items || inspection.items || []).length})
                      </span>
                    </h4>
                    <div className="space-y-3">
                      {(inspectionDetails?.items || inspection.items || []).map((item: any, index: number) => (
                        <div key={index} className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {item.name || item.itemName || item.item_name || `Item ${index + 1}`}
                              </p>
                              {item.condition && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">
                                  Condition: {item.condition}
                                </p>
                              )}
                              {item.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{item.description}</p>
                              )}
                              {item.notes && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">{item.notes}</p>
                              )}
                            </div>
                            {(item.status || item.condition) && (() => {
                              const condition = (item.status || item.condition || '').toLowerCase();
                              const isGood = condition === ItemCondition.GOOD || condition === ItemCondition.EXCELLENT;
                              const isDamaged = condition === ItemCondition.DAMAGED || condition === ItemCondition.POOR;
                              const isFair = condition === ItemCondition.FAIR;
                              
                              return (
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  isGood ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                  isDamaged ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                  isFair ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                  'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                }`}>
                                  {item.status || item.condition}
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Inspection Photos - Only show if photos exist and are not null/empty */}
                {(() => {
                  const photos = inspectionDetails?.photos || inspection.photos;
                  const hasPhotos = photos && Array.isArray(photos) && photos.length > 0 && photos.some((photo: any) => {
                    if (!photo) return false;
                    const photoUrl = typeof photo === 'string' 
                      ? photo 
                      : (photo.url || photo.path || photo.photo_url || photo.photoUrl || '');
                    return !!photoUrl;
                  });
                  
                  if (!hasPhotos) return null;
                  
                  return (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Camera className="w-5 h-5 text-my-primary" />
                        Photos ({photos.filter((photo: any) => {
                          if (!photo) return false;
                          const photoUrl = typeof photo === 'string' 
                            ? photo 
                            : (photo.url || photo.path || photo.photo_url || photo.photoUrl || '');
                          return !!photoUrl;
                        }).length})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {photos.map((photo: any, index: number) => {
                          const photoUrl = typeof photo === 'string' 
                            ? photo 
                            : (photo.url || photo.path || photo.photo_url || photo.photoUrl || '');
                          if (!photoUrl) return null;
                          return (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
                              <img
                                src={photoUrl}
                                alt={`Inspection photo ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                                onClick={() => window.open(photoUrl, '_blank')}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Image+Not+Available';
                                }}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Debug Info - Check browser console for full data */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectorInspectionDetailsModal;

