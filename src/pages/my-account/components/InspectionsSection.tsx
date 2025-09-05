import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MapPin, Clock, Eye, CheckCircle, AlertTriangle, Play, AlertCircle, MessageSquare, Plus } from 'lucide-react';
import { disputeService, inspectionService } from '../../../services/inspectionService';
import { DisputeType } from '../../../types/inspection';

interface Props {
  loading: boolean;
  userInspections: any[];
  onViewInspection: (id: string) => void;
  onRequestInspection: () => void;
}

const InspectionsSection: React.FC<Props> = ({
  loading,
  userInspections,
  onViewInspection,
  onRequestInspection,
}) => {
  const [activeTab, setActiveTab] = useState<'my-items' | 'rented-items' | 'disputes'>('my-items');
  const [rentedInspections, setRentedInspections] = useState<any[]>([]);
  const [rentedLoading, setRentedLoading] = useState(false);
  const [userDisputes, setUserDisputes] = useState<any[]>([]);
  const [disputesLoading, setDisputesLoading] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);
  const [disputeForm, setDisputeForm] = useState({
    disputeType: DisputeType.DAMAGE_ASSESSMENT,
    reason: '',
    evidence: '',
    photos: [] as File[]
  });

  // Fetch rented inspections
  const loadRentedInspections = async () => {
    setRentedLoading(true);
    try {
      const response = await inspectionService.getMyInspections();
      setRentedInspections(response.data || []);
    } catch (error) {
      console.error('Error fetching rented inspections:', error);
      setRentedInspections([]);
    } finally {
      setRentedLoading(false);
    }
  };

  // Fetch user disputes
  const loadUserDisputes = async () => {
    setDisputesLoading(true);
    try {
      // Get user ID from localStorage or context
      const token = localStorage.getItem('token');
      if (!token) {
        setUserDisputes([]);
        return;
      }
      
      // Extract user ID from token
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.sub || tokenPayload.userId || tokenPayload.id;
      
      if (!userId) {
        // Fallback to general disputes if no user ID
        const response = await disputeService.getAllDisputes();
        setUserDisputes(response.disputes || []);
      } else {
        // Get user-specific disputes
        const response = await disputeService.getUserDisputes(userId);
        setUserDisputes(response.disputes || []);
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);
      setUserDisputes([]);
    } finally {
      setDisputesLoading(false);
    }
  };

  // Load data when tabs are active
  useEffect(() => {
    if (activeTab === 'rented-items') {
      loadRentedInspections();
    } else if (activeTab === 'disputes') {
      loadUserDisputes();
    }
  }, [activeTab]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'disputed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'disputed': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getDisputeStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'under_review': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDisputeStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'under_review': return <AlertCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleRaiseDispute = async () => {
    if (!selectedInspectionId || !disputeForm.reason.trim()) {
      return;
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('disputeType', disputeForm.disputeType);
      formData.append('reason', disputeForm.reason);
      formData.append('evidence', disputeForm.evidence);

      // Append photos if any
      disputeForm.photos.forEach((photo) => {
        formData.append('photos', photo);
      });

      await disputeService.raiseDispute(selectedInspectionId, formData as any);

      // Reset form and close modal
      setDisputeForm({
        disputeType: DisputeType.DAMAGE_ASSESSMENT,
        reason: '',
        evidence: '',
        photos: []
      });
      setShowDisputeModal(false);
      setSelectedInspectionId(null);
      
      // Reload disputes
      loadUserDisputes();
    } catch (error) {
      console.error('Failed to raise dispute:', error);
    }
  };

  const openDisputeModal = (inspectionId: string) => {
    setSelectedInspectionId(inspectionId);
    setShowDisputeModal(true);
  };

  if ((loading && activeTab === 'my-items') || (rentedLoading && activeTab === 'rented-items')) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (disputesLoading && activeTab === 'disputes') {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      {/* Header with tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('my-items')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'my-items'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Items ({userInspections.length})
          </button>
          <button
            onClick={() => setActiveTab('rented-items')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'rented-items'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Rented Items ({rentedInspections.length})
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'disputes'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Disputes ({userDisputes.length})
          </button>
        </div>
        <div className="flex gap-2">
          {activeTab === 'my-items' && (
            <button onClick={onRequestInspection} className="bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700 rounded">
              Request Inspection
            </button>
          )}
          {activeTab === 'disputes' && (
            <button 
              onClick={() => setShowDisputeModal(true)}
              className="bg-red-600 text-white px-3 py-2 hover:bg-red-700 rounded flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Raise Dispute
            </button>
          )}
        </div>
      </div>

      {/* My Items Tab */}
      {activeTab === 'my-items' && (
        <div className="space-y-4">
          {userInspections.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Inspections Yet</h3>
              <p className="text-gray-500 mb-4">You haven't requested any inspections yet.</p>
              <button
                onClick={onRequestInspection}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Request Your First Inspection
              </button>
            </div>
          ) : (
            userInspections.map((inspection) => (
              <div
                key={inspection.id}
                className="flex items-center space-x-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
                onClick={() => onViewInspection(inspection.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900 capitalize">
                      {inspection.inspectionType?.replace(/_/g, ' ') || 'Inspection'}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(inspection.status)}`}>
                      {getStatusIcon(inspection.status)}
                      {inspection.status?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                    {inspection.scheduledAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(inspection.scheduledAt)}</span>
                      </div>
                    )}
                    {inspection.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{inspection.location}</span>
                      </div>
                    )}
                  </div>

                  {inspection.notes && (
                    <p className="text-xs text-gray-400 truncate">{inspection.notes}</p>
                  )}
                </div>

                                 <div className="text-right">
                   <div className="flex items-center gap-2">
                     <Eye className="w-4 h-4 text-gray-400" />
                     <span className="text-xs text-gray-500">View Details</span>
                   </div>
                   {inspection.createdAt && (
                     <p className="text-xs text-gray-400 mt-1">
                       Created {formatDate(inspection.createdAt)}
                     </p>
                   )}
                   {/* Raise Dispute Button */}
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       openDisputeModal(inspection.id);
                     }}
                     className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full hover:bg-red-200 transition-colors flex items-center gap-1"
                   >
                     <AlertCircle className="w-3 h-3" />
                     Raise Dispute
                   </button>
                 </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Rented Items Tab */}
      {activeTab === 'rented-items' && (
        <div className="space-y-4">
          {rentedInspections.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Rented Item Inspections</h3>
              <p className="text-gray-500 mb-4">You haven't rented any items that require inspections yet.</p>
            </div>
          ) : (
            rentedInspections.map((inspection) => (
              <div
                key={inspection.id}
                className="flex items-center space-x-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
                onClick={() => onViewInspection(inspection.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900 capitalize">
                      {inspection.inspectionType?.replace(/_/g, ' ') || 'Inspection'}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(inspection.status)}`}>
                      {getStatusIcon(inspection.status)}
                      {inspection.status?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                    {inspection.scheduledAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(inspection.scheduledAt)}</span>
                      </div>
                    )}
                    {inspection.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{inspection.location}</span>
                      </div>
                    )}
                  </div>

                  {inspection.notes && (
                    <p className="text-sm text-gray-600 mb-2">{inspection.notes}</p>
                  )}

                  {inspection.inspectorNotes && (
                    <p className="text-sm text-gray-600 mb-2 italic">
                      Inspector Notes: {inspection.inspectorNotes}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">View Details</span>
                  </div>
                  {inspection.createdAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Created {formatDate(inspection.createdAt)}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Disputes Tab */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          {userDisputes.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Disputes Yet</h3>
              <p className="text-gray-500 mb-4">You haven't raised any disputes yet.</p>
              <button
                onClick={() => setShowDisputeModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Raise Your First Dispute
              </button>
            </div>
          ) : (
            userDisputes.map((dispute) => (
              <div
                key={dispute.id}
                className="flex items-center space-x-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold text-gray-900 capitalize">
                      {dispute.disputeType?.replace(/_/g, ' ') || 'Dispute'}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getDisputeStatusColor(dispute.status)}`}>
                      {getDisputeStatusIcon(dispute.status)}
                      {dispute.status?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                    {dispute.createdAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Raised {formatDate(dispute.createdAt)}</span>
                      </div>
                    )}
                    {dispute.inspectionId && (
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>Inspection #{dispute.inspectionId}</span>
                      </div>
                    )}
                  </div>

                  {dispute.reason && (
                    <p className="text-xs text-gray-400 truncate">{dispute.reason}</p>
                  )}
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Dispute</span>
                  </div>
                  {dispute.updatedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Updated {formatDate(dispute.updatedAt)}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDisputeModal(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Raise Dispute</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dispute Type *</label>
                <select
                  value={disputeForm.disputeType}
                  onChange={(e) => setDisputeForm(prev => ({ ...prev, disputeType: e.target.value as DisputeType }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value={DisputeType.DAMAGE_ASSESSMENT}>Damage Assessment</option>
                  <option value={DisputeType.COST_DISPUTE}>Cost Dispute</option>
                  <option value={DisputeType.PROCEDURE_VIOLATION}>Procedure Violation</option>
                  <option value={DisputeType.OTHER}>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <textarea
                  value={disputeForm.reason}
                  onChange={(e) => setDisputeForm(prev => ({ ...prev, reason: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Describe the reason for this dispute..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Evidence</label>
                <textarea
                  value={disputeForm.evidence}
                  onChange={(e) => setDisputeForm(prev => ({ ...prev, evidence: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Provide any supporting evidence or additional details..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Photos</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setDisputeForm(prev => ({ ...prev, photos: files }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                />
                <p className="mt-1 text-sm text-gray-500">Upload photos to support your dispute (optional)</p>
                {disputeForm.photos.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Selected files:</p>
                    <ul className="mt-1 text-sm text-gray-500">
                      {disputeForm.photos.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDisputeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Cancel
              </button>

              <button
                onClick={handleRaiseDispute}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Raise Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionsSection;


