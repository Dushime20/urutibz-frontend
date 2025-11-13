import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from 'axios';
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
  Eye,
  Download,
  Plus
} from 'lucide-react';
import { riskManagementService } from '../../../services/riskManagementService';
import type { PolicyViolation } from '../../../types/riskManagement';
import { useToast } from '../../../contexts/ToastContext';
import { formatDateUTC } from '../../../utils/dateUtils';

interface ViolationDetailsModalProps {
  violation: PolicyViolation | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViolationDetailsModal: React.FC<ViolationDetailsModalProps> = ({ violation, isOpen, onClose }) => {
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [editData, setEditData] = useState<{
    status?: string;
    severity?: string;
    description?: string;
    penaltyAmount?: number;
  }>({});
  const [resolveData, setResolveData] = useState<{
    resolutionActions: string[];
    resolutionNotes?: string;
  }>({
    resolutionActions: ['']
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [productName, setProductName] = useState<string>('');
  const [bookingDetails, setBookingDetails] = useState<string>('');

  const queryClient = useQueryClient();

  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ['user', violation?.affectedUserId],
    queryFn: async () => {
      if (!violation?.affectedUserId) return null;
      const token = localStorage.getItem('authToken');
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.get(`${API_BASE_URL}/users/${violation.affectedUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!violation?.affectedUserId && isOpen
  });

  // Fetch product data
  const { data: productData } = useQuery({
    queryKey: ['product', violation?.productId],
    queryFn: async () => {
      if (!violation?.productId) return null;
      const token = localStorage.getItem('authToken');
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.get(`${API_BASE_URL}/products/${violation.productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!violation?.productId && isOpen
  });

  // Fetch booking data
  const { data: bookingData } = useQuery({
    queryKey: ['booking', violation?.bookingId],
    queryFn: async () => {
      if (!violation?.bookingId) return null;
      const token = localStorage.getItem('authToken');
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.get(`${API_BASE_URL}/bookings/${violation.bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!violation?.bookingId && isOpen
  });

  // Update names when data is fetched
  useEffect(() => {
    if (userData?.data?.firstName && userData?.data?.lastName) {
      setUserName(`${userData.data.firstName} ${userData.data.lastName}`);
    }
  }, [userData]);

  useEffect(() => {
    if (productData?.data?.title) {
      setProductName(productData.data.title);
    }
  }, [productData]);

  useEffect(() => {
    if (bookingData?.data) {
      const booking = bookingData.data;
      setBookingDetails(`Booking #${booking.id.slice(0, 8)}... (${booking.status})`);
    }
  }, [bookingData]);

  const updateViolationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: {
      severity?: string;
      description?: string;
      penaltyAmount?: number;
      status?: 'active' | 'resolved' | 'escalated';
    } }) => 
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

  const resolveViolationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: {
      resolutionActions: string[];
      resolutionNotes?: string;
    } }) => 
      riskManagementService.resolveViolation(id, data),
    onSuccess: () => {
      showToast('Violation resolved successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['violations'] });
      setIsResolving(false);
      setResolveData({ resolutionActions: [''] });
      onClose();
    },
    onError: (error: any) => {
      console.error('Error resolving violation:', error);
      showToast(
        error.response?.data?.message || 'Failed to resolve violation. Please try again.',
        'error'
      );
    }
  });

  const handleEdit = () => {
    if (violation) {
      setEditData({
        status: violation.status,
        severity: violation.severity,
        description: violation.description,
        penaltyAmount: violation.penaltyAmount
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

  const handleResolve = () => {
    if (violation) {
      setResolveData({
        resolutionActions: (violation.resolutionActions && violation.resolutionActions.length > 0) 
          ? violation.resolutionActions 
          : [''],
        resolutionNotes: ''
      });
      setIsResolving(true);
    }
  };

  const handleResolveSubmit = async () => {
    if (!violation) return;
    
    // Validate resolution actions
    const actions = resolveData.resolutionActions.filter(a => a.trim().length > 0);
    if (actions.length === 0) {
      showToast('Please provide at least one resolution action', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await resolveViolationMutation.mutateAsync({
        id: violation.id,
        data: {
          resolutionActions: actions,
          resolutionNotes: resolveData.resolutionNotes
        }
      });
    } catch (error: any) {
      console.error('Error resolving violation:', error);
      // Error is already handled by the mutation's onError
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveCancel = () => {
    setIsResolving(false);
    setResolveData({ resolutionActions: [''] });
  };

  const addResolutionAction = () => {
    setResolveData(prev => ({
      ...prev,
      resolutionActions: [...prev.resolutionActions, '']
    }));
  };

  const removeResolutionAction = (index: number) => {
    setResolveData(prev => ({
      ...prev,
      resolutionActions: prev.resolutionActions.filter((_, i) => i !== index)
    }));
  };

  const updateResolutionAction = (index: number, value: string) => {
    setResolveData(prev => ({
      ...prev,
      resolutionActions: prev.resolutionActions.map((action, i) => i === index ? value : action)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700';
      case 'under_investigation':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const getViolationTypeColor = (type: string) => {
    switch (type) {
      case 'insurance':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'inspection':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'safety':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'payment':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'documentation':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'usage':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (!isOpen || !violation) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border border-gray-200 dark:border-slate-700 w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-slate-800">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Violation Details</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">ID: {violation.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 bg-teal-600 dark:bg-teal-500 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    disabled={isSubmitting || updateViolationMutation.isPending}
                    className="px-3 py-1 bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-500 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSubmitting || updateViolationMutation.isPending}
                    className="px-3 py-1 bg-teal-600 dark:bg-teal-500 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting || updateViolationMutation.isPending ? (
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
                className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Status and Type Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-slate-600">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-gray-400 dark:text-slate-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Status</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(violation.status)}`}>
                      {violation.status.replace('_', ' ').charAt(0).toUpperCase() + violation.status.replace('_', ' ').slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-slate-600">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-gray-400 dark:text-slate-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Type</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getViolationTypeColor(violation.violationType)}`}>
                      {violation.violationType.charAt(0).toUpperCase() + violation.violationType.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-700 p-4 rounded-lg border border-gray-200 dark:border-slate-600">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 dark:text-slate-500 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Severity</p>
                    {isEditing ? (
                      <select
                        value={editData.severity || violation.severity}
                        onChange={(e) => setEditData(prev => ({ ...prev, severity: e.target.value }))}
                        className="mt-1 px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    ) : (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(violation.severity)}`}>
                        {violation.severity.charAt(0).toUpperCase() + violation.severity.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-slate-700 p-6 rounded-lg border border-gray-200 dark:border-slate-600">
              <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-3">Description</h4>
              <p className="text-gray-700 dark:text-slate-300">{violation.description}</p>
            </div>

            {/* Affected Parties */}
            <div className="bg-white dark:bg-slate-700 p-6 rounded-lg border border-gray-200 dark:border-slate-600">
              <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-3">Affected Parties</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-4 w-4 text-gray-400 dark:text-slate-500 mr-2" />
                  <div>
                    <span className="text-sm text-gray-700 dark:text-slate-300">
                      <strong>User:</strong> {userName || `User ${violation.affectedUserId}`}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-slate-400">ID: {violation.affectedUserId}</p>
                  </div>
                </div>
                {violation.productId && (
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-400 dark:text-slate-500 mr-2" />
                    <div>
                      <span className="text-sm text-gray-700 dark:text-slate-300">
                        <strong>Product:</strong> {productName || `Product ${violation.productId}`}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-slate-400">ID: {violation.productId}</p>
                    </div>
                  </div>
                )}
                {violation.bookingId && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 dark:text-slate-500 mr-2" />
                    <div>
                      <span className="text-sm text-gray-700 dark:text-slate-300">
                        <strong>Booking:</strong> {bookingDetails || `Booking ${violation.bookingId}`}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-slate-400">ID: {violation.bookingId}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Assignment and Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-700 p-6 rounded-lg border border-gray-200 dark:border-slate-600">
                <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-3">Assignment</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Reported By</p>
                    <p className="text-sm text-gray-900 dark:text-slate-100">{violation.reportedBy}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Assigned To</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.assignedTo || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, assignedTo: e.target.value }))}
                        placeholder="Inspector or admin ID"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 dark:text-slate-100">{violation.assignedTo || 'Not assigned'}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-700 p-6 rounded-lg border border-gray-200 dark:border-slate-600">
                <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-3">Timeline</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 dark:text-slate-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Reported At</p>
                      <p className="text-sm text-gray-900 dark:text-slate-100">{violation.reportedAt ? formatDateUTC(violation.reportedAt) : 'N/A'}</p>
                    </div>
                  </div>
                  {violation.assignedAt && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 dark:text-slate-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Assigned At</p>
                        <p className="text-sm text-gray-900 dark:text-slate-100">{formatDateUTC(violation.assignedAt)}</p>
                      </div>
                    </div>
                  )}
                  {violation.resolvedAt && (
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-gray-400 dark:text-slate-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Resolved At</p>
                        <p className="text-sm text-gray-900 dark:text-slate-100">{formatDateUTC(violation.resolvedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description and Penalty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-700 p-6 rounded-lg border border-gray-200 dark:border-slate-600">
                <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-3">Description</h4>
                {isEditing ? (
                  <textarea
                    value={editData.description || violation.description}
                    onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    placeholder="Enter violation description..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  />
                ) : (
                  <p className="text-gray-700 dark:text-slate-300">{violation.description || 'No description available'}</p>
                )}
              </div>

              <div className="bg-white dark:bg-slate-700 p-6 rounded-lg border border-gray-200 dark:border-slate-600">
                <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-3">Penalty Amount</h4>
                {isEditing ? (
                  <input
                    type="number"
                    value={editData.penaltyAmount || violation.penaltyAmount || 0}
                    onChange={(e) => setEditData(prev => ({ ...prev, penaltyAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                    min="0"
                    step="0.01"
                  />
                ) : (
                  <p className="text-gray-700 dark:text-slate-300">
                    ${violation.penaltyAmount ? parseFloat(violation.penaltyAmount.toString()).toFixed(2) : '0.00'}
                  </p>
                )}
              </div>
            </div>

            {/* Resolve Section */}
            {violation.status !== 'resolved' && !isResolving && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                      Resolve Violation
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Mark this violation as resolved with resolution actions
                    </p>
                  </div>
                  <button
                    onClick={handleResolve}
                    className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Resolve
                  </button>
                </div>
              </div>
            )}

            {isResolving && (
              <div className="bg-white dark:bg-slate-700 p-6 rounded-lg border border-gray-200 dark:border-slate-600">
                <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">
                  Resolve Violation
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Resolution Actions *
                    </label>
                    {resolveData.resolutionActions.map((action, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={action}
                          onChange={(e) => updateResolutionAction(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                          placeholder="Enter resolution action"
                        />
                        {resolveData.resolutionActions.length > 1 && (
                          <button
                            onClick={() => removeResolutionAction(index)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addResolutionAction}
                      className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 text-sm flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add Action
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Resolution Notes
                    </label>
                    <textarea
                      value={resolveData.resolutionNotes || ''}
                      onChange={(e) => setResolveData(prev => ({ ...prev, resolutionNotes: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                      placeholder="Enter resolution notes (optional)"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleResolveCancel}
                      className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleResolveSubmit}
                      disabled={isSubmitting || resolveViolationMutation.isPending}
                      className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting || resolveViolationMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Resolving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Resolve Violation
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Resolution Actions (if resolved) */}
            {violation.status === 'resolved' && violation.resolutionActions && violation.resolutionActions.length > 0 && (
              <div className="bg-white dark:bg-slate-700 p-6 rounded-lg border border-gray-200 dark:border-slate-600">
                <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-3">Resolution Actions</h4>
                <ul className="list-disc list-inside space-y-2">
                  {violation.resolutionActions.map((action, index) => (
                    <li key={index} className="text-gray-700 dark:text-slate-300">{action}</li>
                  ))}
                </ul>
                {violation.resolvedAt && (
                  <p className="mt-4 text-sm text-gray-500 dark:text-slate-400">
                    Resolved: {formatDateUTC(violation.resolvedAt)}
                  </p>
                )}
              </div>
            )}

            {/* Evidence and Attachments */}
            {violation.evidence && violation.evidence.length > 0 && (
              <div className="bg-white dark:bg-slate-700 p-6 rounded-lg border border-gray-200 dark:border-slate-600">
                <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-3">Evidence & Attachments</h4>
                <div className="space-y-2">
                  {violation.evidence.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 dark:text-slate-500 mr-2" />
                        <span className="text-sm text-gray-700 dark:text-slate-300">{typeof item === 'string' ? item : (item as any).name || 'Unknown file'}</span>
                      </div>
                      <button className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 flex items-center gap-2">
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
