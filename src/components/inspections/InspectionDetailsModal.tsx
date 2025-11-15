import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Clock, CheckCircle, AlertTriangle, Eye, User, FileText, Camera, Package, DollarSign, Users, Wrench, Settings } from 'lucide-react';
import { inspectionService } from '../../services/inspectionService';
import { getProductById } from '../../pages/my-account/service/api';
import type { Inspection } from '../../types/inspection';
import StatusBadge from './StatusBadge';

interface InspectionDetailsModalProps {
  isOpen: boolean;
  inspectionId: string;
  onClose: () => void;
  onReviewPreInspection?: (inspection: Inspection) => void;
  onReportDiscrepancy?: (inspection: Inspection) => void;
  onViewPostInspection?: (inspection: Inspection) => void;
  onPayInspection?: (inspection: Inspection) => void; // Callback to open payment modal
  userRole?: 'owner' | 'renter' | 'inspector' | 'admin';
}

const InspectionDetailsModal: React.FC<InspectionDetailsModalProps> = ({
  isOpen,
  inspectionId,
  onClose,
  onReviewPreInspection,
  onReportDiscrepancy,
  onViewPostInspection,
  onPayInspection,
  userRole
}) => {
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [inspectionDetails, setInspectionDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState<string>('');

  useEffect(() => {
    if (isOpen && inspectionId) {
      loadInspection();
    }
  }, [isOpen, inspectionId]);

  const loadInspection = async () => {
    try {
      setLoading(true);
      const inspectionData = await inspectionService.getInspection(inspectionId);
      setInspection(inspectionData.inspection);
      setInspectionDetails(inspectionData);

      // Debug logging
      console.log('🔍 InspectionDetailsModal - Loaded Inspection:', {
        id: inspectionData.inspection?.id,
        type: inspectionData.inspection?.inspectionType,
        hasOwnerPreInspectionData: !!inspectionData.inspection?.ownerPreInspectionData,
        ownerPreInspectionConfirmed: inspectionData.inspection?.ownerPreInspectionConfirmed,
        renterPreReviewAccepted: inspectionData.inspection?.renterPreReviewAccepted,
        renterDiscrepancyReported: inspectionData.inspection?.renterDiscrepancyReported,
        userRole,
        ownerPreInspectionData: inspectionData.inspection?.ownerPreInspectionData ? 'exists' : 'missing'
      });

      // Load product name
      try {
        const pid = inspectionData.inspection?.productId;
        if (pid) {
          const prod = await getProductById(pid);
          const name = prod?.title || prod?.name || prod?.productName || '';
          if (name) setProductName(String(name));
        }
      } catch {}
    } catch (error) {
      console.error('Error loading inspection:', error);
    } finally {
      setLoading(false);
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'pre_rental':
        return 'Pre-Rental';
      case 'post_rental':
        return 'Post-Rental';
      case 'damage_assessment':
        return 'Damage Assessment';
      case 'maintenance_check':
        return 'Maintenance Check';
      case 'quality_verification':
        return 'Quality Verification';
      default:
        return type?.replace(/_/g, ' ') || 'Inspection';
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
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-lg bg-white dark:bg-slate-900 text-left shadow-xl transition-all border border-gray-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-slate-900 px-6 py-4 border-b border-gray-200 dark:border-slate-700 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  Inspection Details
                </h3>
                {productName && (
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                    {productName}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="rounded-md bg-white dark:bg-slate-900 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
              </div>
            ) : !inspection ? (
              <div className="text-center py-12">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-slate-100">Inspection not found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  The inspection you're looking for doesn't exist.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Inspection Type</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                        {getTypeLabel(inspection.inspectionType || '')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Status</p>
                      <StatusBadge status={inspection.status} />
                    </div>
                    {inspection.scheduledAt && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Scheduled Date</p>
                        <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-slate-100">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(inspection.scheduledAt)}</span>
                        </div>
                      </div>
                    )}
                    {inspection.location && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Location</p>
                        <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-slate-100">
                          <MapPin className="w-4 h-4" />
                          <span>{inspection.location}</span>
                        </div>
                      </div>
                    )}
                    {inspection.createdAt && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Created</p>
                        <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-slate-100">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(inspection.createdAt)}</span>
                        </div>
                      </div>
                    )}
                    {inspection.completedAt && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Completed</p>
                        <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-slate-100">
                          <CheckCircle className="w-4 h-4" />
                          <span>{formatDate(inspection.completedAt)}</span>
                        </div>
                      </div>
                    )}
                    {inspection.inspectorId && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Inspector</p>
                        <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-slate-100">
                          <User className="w-4 h-4" />
                          <span>
                            {inspectionDetails?.participants?.inspector?.name || 
                             inspection.inspector?.name || 
                             `Inspector ${inspection.inspectorId}` || 
                             'Unassigned'}
                          </span>
                        </div>
                      </div>
                    )}
                    {inspection.startedAt && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Started</p>
                        <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-slate-100">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(inspection.startedAt)}</span>
                        </div>
                      </div>
                    )}
                    {/* Third-Party Inspection Details */}
                    {(() => {
                      const isThirdParty = inspection?.isThirdPartyInspection || 
                                         (inspection as any)?.is_third_party_inspection ||
                                         inspection?.inspectionType === 'third_party_professional';
                      if (!isThirdParty) return null;
                      
                      const tier = (inspection as any).inspection_tier || (inspection as any).inspectionTier || 'standard';
                      const cost = (inspection as any).inspection_cost || (inspection as any).inspectionCost;
                      const currency = (inspection as any).currency || 'USD';
                      const totalPoints = (inspection as any).total_points || (inspection as any).totalPoints;
                      
                      return (
                        <>
                          {tier && (
                            <div>
                              <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Inspection Tier</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-slate-100 capitalize">
                                {tier} {totalPoints && `(${totalPoints}-point check)`}
                              </p>
                            </div>
                          )}
                          {cost !== undefined && cost !== null && (
                            <div>
                              <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Inspection Cost</p>
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-slate-100">
                                <DollarSign className="w-4 h-4" />
                                <span>{currency} {parseFloat(cost.toString()).toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  {inspection.inspectorNotes && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                      <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Inspector Notes</p>
                      <p className="text-sm text-gray-700 dark:text-slate-300 break-words">
                        {inspection.inspectorNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Pre-Inspection Data (Owner) */}
                {inspection.ownerPreInspectionData && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Pre-Inspection Data (Owner)
                    </h4>
                    {inspection.ownerPreInspectionData.condition && (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Overall Condition</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-slate-100 capitalize">
                            {inspection.ownerPreInspectionData.condition.overallCondition}
                          </p>
                        </div>
                        {inspection.ownerPreInspectionData.condition.items && inspection.ownerPreInspectionData.condition.items.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Items</p>
                            <div className="space-y-2">
                              {inspection.ownerPreInspectionData.condition.items.map((item: any, index: number) => (
                                <div key={index} className="bg-white dark:bg-slate-800 rounded p-2 border border-gray-200 dark:border-slate-700">
                                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{item.itemName}</p>
                                  <p className="text-xs text-gray-500 dark:text-slate-400 capitalize">Condition: {item.condition}</p>
                                  {item.description && (
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{item.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {inspection.ownerPreInspectionData.condition.accessories && inspection.ownerPreInspectionData.condition.accessories.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Accessories & Included Items</p>
                            <div className="space-y-2">
                              {inspection.ownerPreInspectionData.condition.accessories.map((accessory: any, index: number) => (
                                <div key={index} className="bg-white dark:bg-slate-800 rounded p-2 border border-gray-200 dark:border-slate-700 flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{accessory.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">
                                      {accessory.included ? 'Included' : 'Not Included'}
                                      {accessory.condition && ` • Condition: ${accessory.condition}`}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {inspection.ownerPreInspectionData.condition.knownIssues && inspection.ownerPreInspectionData.condition.knownIssues.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Known Issues</p>
                            <ul className="list-disc list-inside space-y-1">
                              {inspection.ownerPreInspectionData.condition.knownIssues.map((issue: string, index: number) => (
                                <li key={index} className="text-sm text-gray-700 dark:text-slate-300">{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {inspection.ownerPreInspectionData.condition.maintenanceHistory && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Maintenance History</p>
                            <p className="text-sm text-gray-700 dark:text-slate-300">{inspection.ownerPreInspectionData.condition.maintenanceHistory}</p>
                          </div>
                        )}
                        {inspection.ownerPreInspectionData.notes && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Notes</p>
                            <p className="text-sm text-gray-700 dark:text-slate-300">{inspection.ownerPreInspectionData.notes}</p>
                          </div>
                        )}
                        {inspection.ownerPreInspectionData.location && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">GPS Location</p>
                            <p className="text-sm text-gray-700 dark:text-slate-300">
                              {inspection.ownerPreInspectionData.location.latitude.toFixed(6)}, {inspection.ownerPreInspectionData.location.longitude.toFixed(6)}
                            </p>
                            {inspection.ownerPreInspectionData.location.address && (
                              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{inspection.ownerPreInspectionData.location.address}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Post-Inspection Data (Renter) */}
                {inspection.renterPostInspectionData && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Post-Inspection Data (Renter)
                    </h4>
                    {inspection.renterPostInspectionData.condition && (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Overall Condition</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-slate-100 capitalize">
                            {inspection.renterPostInspectionData.condition.overallCondition}
                          </p>
                        </div>
                        {inspection.renterPostInspectionData.condition.items && inspection.renterPostInspectionData.condition.items.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Items</p>
                            <div className="space-y-2">
                              {inspection.renterPostInspectionData.condition.items.map((item: any, index: number) => (
                                <div key={index} className="bg-white dark:bg-slate-800 rounded p-2 border border-gray-200 dark:border-slate-700">
                                  <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{item.itemName}</p>
                                  <p className="text-xs text-gray-500 dark:text-slate-400 capitalize">Condition: {item.condition}</p>
                                  {item.description && (
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{item.description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {inspection.renterPostInspectionData.condition.accessories && inspection.renterPostInspectionData.condition.accessories.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Accessories & Included Items</p>
                            <div className="space-y-2">
                              {inspection.renterPostInspectionData.condition.accessories.map((accessory: any, index: number) => (
                                <div key={index} className="bg-white dark:bg-slate-800 rounded p-2 border border-gray-200 dark:border-slate-700 flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{accessory.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">
                                      {accessory.included ? 'Included' : 'Not Included'}
                                      {accessory.condition && ` • Condition: ${accessory.condition}`}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {inspection.renterPostInspectionData.notes && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Notes</p>
                            <p className="text-sm text-gray-700 dark:text-slate-300">{inspection.renterPostInspectionData.notes}</p>
                          </div>
                        )}
                        {inspection.renterPostInspectionData.returnLocation && (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">GPS Return Location</p>
                            <p className="text-sm text-gray-700 dark:text-slate-300">
                              {inspection.renterPostInspectionData.returnLocation.latitude.toFixed(6)}, {inspection.renterPostInspectionData.returnLocation.longitude.toFixed(6)}
                            </p>
                            {inspection.renterPostInspectionData.returnLocation.address && (
                              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{inspection.renterPostInspectionData.returnLocation.address}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Inspection Items */}
                {inspection.items && inspection.items.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Inspection Items ({inspection.items.length})
                    </h4>
                    <div className="space-y-3">
                      {inspection.items.map((item: any) => (
                        <div key={item.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="text-sm font-medium text-gray-900 dark:text-slate-100">{item.itemName}</h5>
                              {item.description && (
                                <p className="text-sm text-gray-500 mt-1 dark:text-slate-400 break-words">{item.description}</p>
                              )}
                              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-slate-400">
                                <span>Condition: {item.condition}</span>
                                {item.repairCost > 0 && <span>Repair Cost: ${item.repairCost}</span>}
                                {item.replacementCost > 0 && <span>Replacement Cost: ${item.replacementCost}</span>}
                                {item.requiresRepair && <span className="text-orange-600">Requires Repair</span>}
                                {item.requiresReplacement && <span className="text-red-600">Requires Replacement</span>}
                              </div>
                              {item.notes && (
                                <p className="text-xs text-gray-500 mt-2 dark:text-slate-400 italic">{item.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photos - Inspection Photos */}
                {inspection.photos && inspection.photos.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Inspection Photos ({inspection.photos.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {inspection.photos.map((photo: any) => (
                        <div key={photo.id} className="relative group">
                          <img
                            src={photo.url || photo.photoUrl}
                            alt={photo.description || 'Inspection photo'}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-slate-700"
                          />
                          {photo.description && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg truncate">
                              {photo.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Photos - Pre/Post Inspection Photos */}
                {(inspection.ownerPreInspectionData?.photos || inspection.renterPostInspectionData?.returnPhotos) && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Pre/Post Inspection Photos
                    </h4>
                    {inspection.ownerPreInspectionData?.photos && inspection.ownerPreInspectionData.photos.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Pre-Inspection Photos ({inspection.ownerPreInspectionData.photos.length})</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {inspection.ownerPreInspectionData.photos.map((photo: string | File, index: number) => (
                            <div key={index} className="relative group">
                              <img
                                src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)}
                                alt={`Pre-inspection ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-slate-700"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg">
                                Pre-Inspection
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {inspection.renterPostInspectionData?.returnPhotos && inspection.renterPostInspectionData.returnPhotos.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Post-Inspection Photos ({inspection.renterPostInspectionData.returnPhotos.length})</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {inspection.renterPostInspectionData.returnPhotos.map((photo: string | File, index: number) => (
                            <div key={index} className="relative group">
                              <img
                                src={typeof photo === 'string' ? photo : URL.createObjectURL(photo)}
                                alt={`Post-inspection ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-slate-700"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 rounded-b-lg">
                                Post-Inspection
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {inspection.notes && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Notes
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                      {inspection.notes}
                    </p>
                  </div>
                )}

                {/* Damage Assessment */}
                {inspectionDetails?.damageAssessment && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Damage Assessment
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                        <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Total Repair Cost</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                          ${inspectionDetails.damageAssessment.totalRepairCost || 0}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                        <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Total Replacement Cost</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                          ${inspectionDetails.damageAssessment.totalReplacementCost || 0}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                        <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Items Requiring Repair</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                          {inspectionDetails.damageAssessment.itemsRequiringRepair || 0}
                        </p>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
                        <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">Items Requiring Replacement</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                          {inspectionDetails.damageAssessment.itemsRequiringReplacement || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {inspectionDetails?.timeline && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Timeline
                    </h4>
                    <div className="space-y-2">
                      {inspectionDetails.timeline.scheduled && (
                        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded p-2 border border-gray-200 dark:border-slate-700">
                          <span className="text-xs text-gray-500 dark:text-slate-400">Scheduled</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                            {formatDate(inspectionDetails.timeline.scheduled)}
                          </span>
                        </div>
                      )}
                      {inspectionDetails.timeline.started && (
                        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded p-2 border border-gray-200 dark:border-slate-700">
                          <span className="text-xs text-gray-500 dark:text-slate-400">Started</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                            {formatDate(inspectionDetails.timeline.started)}
                          </span>
                        </div>
                      )}
                      {inspectionDetails.timeline.completed && (
                        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded p-2 border border-gray-200 dark:border-slate-700">
                          <span className="text-xs text-gray-500 dark:text-slate-400">Completed</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                            {formatDate(inspectionDetails.timeline.completed)}
                          </span>
                        </div>
                      )}
                      {inspectionDetails.timeline.duration > 0 && (
                        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded p-2 border border-gray-200 dark:border-slate-700">
                          <span className="text-xs text-gray-500 dark:text-slate-400">Duration</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                            {Math.round(inspectionDetails.timeline.duration / 1000 / 60)} minutes
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Participants */}
                {inspectionDetails?.participants && (
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Participants
                    </h4>
                    <div className="space-y-3">
                      {inspectionDetails.participants.inspector && (
                        <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 rounded p-3 border border-gray-200 dark:border-slate-700">
                          <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                              {inspectionDetails.participants.inspector.name || 'Inspector'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                              Inspector {inspectionDetails.participants.inspector.email && `• ${inspectionDetails.participants.inspector.email}`}
                            </p>
                          </div>
                        </div>
                      )}
                      {inspectionDetails.participants.renter && (
                        <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 rounded p-3 border border-gray-200 dark:border-slate-700">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                              {inspectionDetails.participants.renter.name || 'Renter'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                              Renter {inspectionDetails.participants.renter.email && `• ${inspectionDetails.participants.renter.email}`}
                            </p>
                          </div>
                        </div>
                      )}
                      {inspectionDetails.participants.owner && (
                        <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 rounded p-3 border border-gray-200 dark:border-slate-700">
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                              {inspectionDetails.participants.owner.name || 'Owner'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-slate-400">
                              Owner {inspectionDetails.participants.owner.email && `• ${inspectionDetails.participants.owner.email}`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Disputes */}
                {(inspectionDetails?.disputes && inspectionDetails.disputes.length > 0) || (inspection.disputes && inspection.disputes.length > 0) && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Disputes ({(inspectionDetails?.disputes?.length || 0) + (inspection.disputes?.length || 0)})
                    </h4>
                    <div className="space-y-2">
                      {inspectionDetails?.disputes?.map((dispute: any, index: number) => (
                        <div key={index} className="bg-white dark:bg-slate-800 rounded p-3 border border-red-200 dark:border-red-800">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{dispute.disputeType}</p>
                            {dispute.status && (
                              <span className={`px-2 py-1 rounded text-xs ${
                                dispute.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                dispute.status === 'open' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {dispute.status}
                              </span>
                            )}
                          </div>
                          {dispute.reason && (
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 break-words">{dispute.reason}</p>
                          )}
                          {dispute.evidence && (
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 italic">{dispute.evidence}</p>
                          )}
                          {dispute.createdAt && (
                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                              Created: {formatDate(dispute.createdAt)}
                            </p>
                          )}
                        </div>
                      ))}
                      {inspection.disputes?.map((dispute: any, index: number) => (
                        <div key={`inspection-${index}`} className="bg-white dark:bg-slate-800 rounded p-3 border border-red-200 dark:border-red-800">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{dispute.disputeType}</p>
                            {dispute.status && (
                              <span className={`px-2 py-1 rounded text-xs ${
                                dispute.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                dispute.status === 'open' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {dispute.status}
                              </span>
                            )}
                          </div>
                          {dispute.reason && (
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 break-words">{dispute.reason}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-slate-900 px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center gap-3">
            <div className="flex gap-3">
              {/* Third-Party Inspection Payment Button */}
              {(() => {
                const isThirdParty = inspection?.isThirdPartyInspection || 
                                   (inspection as any)?.is_third_party_inspection ||
                                   inspection?.inspectionType === 'third_party_professional';
                const needsPayment = inspection?.status === 'pending_payment' || 
                                    (inspection as any)?.status === 'pending_payment';
                const isOwner = userRole === 'owner';
                
                return isThirdParty && needsPayment && isOwner && onPayInspection;
              })() && (
                <button
                  onClick={() => {
                    if (inspection && onPayInspection) {
                      onPayInspection(inspection);
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Pay Now
                </button>
              )}

              {/* Owner Post-Inspection Review Actions */}
              {userRole === 'owner' && (
                <>
                  {/* Check if renter has provided post-inspection and owner hasn't reviewed yet */}
                  {(() => {
                    const hasPostInspection = inspection?.renterPostInspectionData || 
                                             (inspection as any)?.renter_post_inspection_data;
                    const isConfirmed = inspection?.renterPostInspectionConfirmed || 
                                       (inspection as any)?.renter_post_inspection_confirmed;
                    const isAccepted = inspection?.ownerPostReviewAccepted || 
                                      (inspection as any)?.owner_post_review_accepted;
                    const isDisputed = inspection?.ownerDisputeRaised || 
                                      (inspection as any)?.owner_dispute_raised;
                    
                    return hasPostInspection && isConfirmed && !isAccepted && !isDisputed;
                  })() && onViewPostInspection && (
                    <button
                      onClick={() => {
                        if (inspection && onViewPostInspection) {
                          onViewPostInspection(inspection);
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      View Post-Inspection
                    </button>
                  )}
                  {/* Status messages for owner */}
                  {(() => {
                    const isAccepted = inspection?.ownerPostReviewAccepted || 
                                      (inspection as any)?.owner_post_review_accepted;
                    const isDisputed = inspection?.ownerDisputeRaised || 
                                      (inspection as any)?.owner_dispute_raised;
                    
                    if (isAccepted) {
                      return (
                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg dark:bg-green-900/20 dark:text-green-400 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Post-Inspection Accepted
                        </span>
                      );
                    }
                    if (isDisputed) {
                      return (
                        <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg dark:bg-red-900/20 dark:text-red-400 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Dispute Raised
                        </span>
                      );
                    }
                    return null;
                  })()}
                </>
              )}
              
              {/* Renter Pre-Inspection Review Actions */}
              {userRole === 'renter' && inspection?.inspectionType === 'pre_rental' && (
                <>
                  {/* Check if owner has provided pre-inspection (data exists OR confirmed) */}
                  {((inspection?.ownerPreInspectionData || inspection?.ownerPreInspectionConfirmed) && !inspection?.renterPreReviewAccepted && !inspection?.renterDiscrepancyReported) && (
                    <>
                      {onReviewPreInspection && (
                        <button
                          onClick={() => {
                            if (inspection && onReviewPreInspection) {
                              onReviewPreInspection(inspection);
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Review & Confirm
                        </button>
                      )}
                      {onReportDiscrepancy && (
                        <button
                          onClick={() => {
                            if (inspection && onReportDiscrepancy) {
                              onReportDiscrepancy(inspection);
                            }
                          }}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          Report Issue
                        </button>
                      )}
                    </>
                  )}
                  {/* Status messages */}
                  {inspection?.renterPreReviewAccepted && (
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg dark:bg-green-900/20 dark:text-green-400 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Review Accepted
                    </span>
                  )}
                  {inspection?.renterDiscrepancyReported && (
                    <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg dark:bg-yellow-900/20 dark:text-yellow-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Discrepancy Reported
                    </span>
                  )}
                  {/* Show waiting message if owner hasn't provided pre-inspection yet */}
                  {!inspection?.ownerPreInspectionData && !inspection?.ownerPreInspectionConfirmed && (
                    <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg dark:bg-gray-900/20 dark:text-gray-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Waiting for Owner Pre-Inspection
                    </span>
                  )}
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionDetailsModal;

