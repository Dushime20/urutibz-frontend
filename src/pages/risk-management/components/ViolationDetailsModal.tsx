import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  X, 
  AlertTriangle, 
  User, 
  Calendar, 
  Clock, 
  Shield, 
  FileText, 
  DollarSign,
  Edit,
  CheckCircle,
  XCircle,
  Eye,
  Download
} from 'lucide-react';
import { riskManagementService } from '../../../services/riskManagementService';
import type { PolicyViolation } from '../../../types/riskManagement';

interface ViolationDetailsModalProps {
  violation: PolicyViolation | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViolationDetailsModal: React.FC<ViolationDetailsModalProps> = ({ violation, isOpen, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<PolicyViolation>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const updateViolationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PolicyViolation> }) => 
      riskManagementService.updateViolation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['violations'] });
      setIsEditing(false);
      setEditData({});
    },
    onError: (error: any) => {
      console.error('Error updating violation:', error);
    }
  });

  const handleEdit = () => {
    if (violation) {
      setEditData({
        status: violation.status,
        assignedTo: violation.assignedTo,
        notes: violation.notes || '',
        resolution: violation.resolution || ''
      });
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    if (!violation) return;
    
    setIsSubmitting(true);
    try {
      await updateViolationMutation.mutateAsync({
        id: violation.id,
        data: editData
      });
    } catch (error) {
      console.error('Error updating violation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'under_investigation':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getViolationTypeColor = (type: string) => {
    switch (type) {
      case 'insurance':
        return 'bg-blue-100 text-blue-800';
      case 'inspection':
        return 'bg-purple-100 text-purple-800';
      case 'safety':
        return 'bg-red-100 text-red-800';
      case 'payment':
        return 'bg-orange-100 text-orange-800';
      case 'documentation':
        return 'bg-indigo-100 text-indigo-800';
      case 'usage':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen || !violation) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Violation Details</h3>
                <p className="text-sm text-gray-600">ID: {violation.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSubmitting}
                    className="px-3 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Status and Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(violation.status)}`}>
                      {violation.status.replace('_', ' ').charAt(0).toUpperCase() + violation.status.replace('_', ' ').slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Type</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getViolationTypeColor(violation.violationType)}`}>
                      {violation.violationType.charAt(0).toUpperCase() + violation.violationType.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Severity</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(violation.severity)}`}>
                      {violation.severity.charAt(0).toUpperCase() + violation.severity.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Description</h4>
              <p className="text-gray-700">{violation.description}</p>
            </div>

            {/* Affected Parties */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-3">Affected Parties</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-700">
                    <strong>User ID:</strong> {violation.affectedUserId}
                  </span>
                </div>
                {violation.productId && (
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">
                      <strong>Product ID:</strong> {violation.productId}
                    </span>
                  </div>
                )}
                {violation.bookingId && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">
                      <strong>Booking ID:</strong> {violation.bookingId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment and Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Assignment</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Reported By</p>
                    <p className="text-sm text-gray-900">{violation.reportedBy}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Assigned To</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.assignedTo || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, assignedTo: e.target.value }))}
                        placeholder="Inspector or admin ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      />
                    ) : (
                      <p className="text-sm text-gray-900">{violation.assignedTo || 'Not assigned'}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Reported At</p>
                      <p className="text-sm text-gray-900">{new Date(violation.reportedAt).toLocaleString()}</p>
                    </div>
                  </div>
                  {violation.assignedAt && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Assigned At</p>
                        <p className="text-sm text-gray-900">{new Date(violation.assignedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  {violation.resolvedAt && (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Resolved At</p>
                        <p className="text-sm text-gray-900">{new Date(violation.resolvedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes and Resolution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Notes</h4>
                {isEditing ? (
                  <textarea
                    value={editData.notes || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={4}
                    placeholder="Add notes about this violation..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                ) : (
                  <p className="text-gray-700">{violation.notes || 'No notes available'}</p>
                )}
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Resolution</h4>
                {isEditing ? (
                  <textarea
                    value={editData.resolution || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, resolution: e.target.value }))}
                    rows={4}
                    placeholder="Describe how this violation was resolved..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                ) : (
                  <p className="text-gray-700">{violation.resolution || 'No resolution provided'}</p>
                )}
              </div>
            </div>

            {/* Evidence and Attachments */}
            {violation.evidence && violation.evidence.length > 0 && (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Evidence & Attachments</h4>
                <div className="space-y-2">
                  {violation.evidence.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                      <button className="text-teal-600 hover:text-teal-800">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                View Full Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViolationDetailsModal;
