import React, { useState } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  FileText, 
  MapPin, 
  User, 
  Calendar,
  DollarSign,
  TrendingUp,
  Shield,
  MessageSquare
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';

interface InspectionsManagementProps {
  inspections: any[];
  disputes: any[];
  inspectionSummary: any;
  loadingInspections: boolean;
  loadingDisputes: boolean;
  loadingSummary: boolean;
  onResolveDispute: (inspectionId: string, disputeId: string, data: any) => Promise<void>;
  onViewInspection: (inspection: any) => void;
  onViewDispute: (dispute: any) => void;
}

const InspectionsManagement: React.FC<InspectionsManagementProps> = ({
  inspections,
  disputes,
  inspectionSummary,
  loadingInspections,
  loadingDisputes,
  loadingSummary,
  onResolveDispute,
  onViewInspection,
  onViewDispute
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'inspections' | 'disputes'>('overview');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [resolveForm, setResolveForm] = useState({
    resolutionNotes: '',
    agreedAmount: ''
  });

  const handleResolveDispute = (dispute: any) => {
    setSelectedDispute(dispute);
    setShowResolveModal(true);
  };

  const submitResolveDispute = async () => {
    if (!selectedDispute || !resolveForm.resolutionNotes) {
      showToast('Please provide resolution notes', 'error');
      return;
    }

    try {
      await onResolveDispute(
        selectedDispute.inspectionId,
        selectedDispute.id,
        {
          resolutionNotes: resolveForm.resolutionNotes,
          agreedAmount: resolveForm.agreedAmount ? parseFloat(resolveForm.agreedAmount) : undefined
        }
      );
      setShowResolveModal(false);
      setSelectedDispute(null);
      setResolveForm({ resolutionNotes: '', agreedAmount: '' });
      showToast('Dispute resolved successfully', 'success');
    } catch (error) {
      console.error('Failed to resolve dispute:', error);
      showToast('Failed to resolve dispute', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDisputeStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'open':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Inspections & Disputes Management</h2>
            <p className="text-gray-600">Monitor and manage all inspection activities and resolve disputes</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {!loadingSummary && inspectionSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Inspections</h3>
              <p className="text-3xl font-bold text-emerald-600">{inspectionSummary?.totalInspections || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Active Disputes</h3>
              <p className="text-3xl font-bold text-red-600">{disputes?.length || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Completed Today</h3>
              <p className="text-3xl font-bold text-blue-600">{inspectionSummary?.completedToday || 0}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('inspections')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'inspections'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Inspections ({inspections?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('disputes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'disputes'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Disputes ({disputes?.length || 0})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Inspections */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Inspections
                </h3>
                <div className="space-y-3">
                  {inspections.slice(0, 5).map((inspection) => (
                    <div
                      key={inspection.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => onViewInspection(inspection)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Activity className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {inspection.product?.name || `Product ${inspection.productId}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {inspection.inspectionType?.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inspection.status)}`}>
                          {inspection.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(inspection.scheduledAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Disputes */}
              <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Active Disputes</h3>
                  </div>
                  <div className="p-6">
                    {disputes && disputes.length > 0 ? (
                      <div className="space-y-4">
                        {disputes.slice(0, 5).map((dispute) => (
                          <div key={dispute.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">Dispute #{dispute.id.slice(0, 8)}</p>
                              <p className="text-sm text-gray-600">{dispute.reason}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDisputeStatusColor(dispute.status)}`}>
                                {dispute.status}
                              </span>
                              <button
                                onClick={() => handleResolveDispute(dispute)}
                                className="text-emerald-600 hover:text-emerald-900 text-sm font-medium"
                              >
                                Resolve
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No active disputes</p>
                    )}
                  </div>
                </div>
            </div>
          )}

          {/* Inspections Tab */}
          {activeTab === 'inspections' && (
            <div className="space-y-4">
              
              {loadingInspections ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading inspections...</p>
                </div>
              ) : inspections && inspections.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Inspection
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Scheduled
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {inspections.map((inspection) => (
                        <tr key={inspection.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Activity className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {inspection.product?.name || `Product ${inspection.productId}`}
                                </div>
                                <div className="text-sm text-gray-500">ID: {inspection.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {inspection.inspectionType?.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inspection.status)}`}>
                              {inspection.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(inspection.scheduledAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {inspection.location}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => onViewInspection(inspection)}
                              className="text-emerald-600 hover:text-emerald-900 flex items-center"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No inspections found</h3>
                  <p className="text-gray-600">There are no inspections to display at the moment.</p>
                </div>
              )}
            </div>
          )}

          {/* Disputes Tab */}
          {activeTab === 'disputes' && (
            <div className="space-y-4">
              
              {loadingDisputes ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading disputes...</p>
                </div>
              ) : disputes && disputes.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dispute
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Raised
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {disputes.map((dispute) => (
                        <tr key={dispute.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  Inspection {dispute.inspectionId}
                                </div>
                                <div className="text-sm text-gray-500">ID: {dispute.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {dispute.disputeType?.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDisputeStatusColor(dispute.status)}`}>
                              {dispute.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(dispute.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                            {dispute.reason}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => onViewDispute(dispute)}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </button>
                              {dispute.status === 'open' && (
                                <button
                                  onClick={() => handleResolveDispute(dispute)}
                                  className="text-emerald-600 hover:text-emerald-900 flex items-center"
                                >
                                  <Shield className="w-4 h-4 mr-1" />
                                  Resolve
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No disputes found</h3>
                  <p className="text-gray-600">There are no disputes to display at the moment.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Resolve Dispute Modal */}
      {showResolveModal && selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowResolveModal(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resolve Dispute</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Notes *</label>
                <textarea
                  value={resolveForm.resolutionNotes}
                  onChange={(e) => setResolveForm(s => ({ ...s, resolutionNotes: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Provide detailed explanation of how the dispute was resolved..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agreed Amount (Optional)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={resolveForm.agreedAmount}
                  onChange={(e) => setResolveForm(s => ({ ...s, agreedAmount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="0.00"
                />
                <p className="mt-1 text-sm text-gray-500">Enter the agreed upon amount if applicable</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Cancel
              </button>
              
              <button
                onClick={submitResolveDispute}
                disabled={!resolveForm.resolutionNotes}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resolve Dispute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionsManagement;
