import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle,
  Clock,
  User,
  Calendar,
  Shield,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { riskManagementService } from '../../../services/riskManagementService';
import type { PolicyViolation, ViolationFilters } from '../../../types/riskManagement';
import CreateViolationModal from './CreateViolationModal';
import ViolationDetailsModal from './ViolationDetailsModal';
import ConfirmationDialog from './ConfirmationDialog';
import { useToast } from '../../../contexts/ToastContext';
import { formatDateUTC } from '../../../utils/dateUtils';

const ViolationsSection: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'investigating' | 'resolved'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [violationToDelete, setViolationToDelete] = useState<string | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<PolicyViolation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters] = useState<ViolationFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const queryClient = useQueryClient();

  // Fetch violations
  const { data: violationsData, isLoading, error } = useQuery({
    queryKey: ['violations', activeTab, searchTerm, filters, currentPage],
    queryFn: () => riskManagementService.getViolations(filters, currentPage, pageSize),
    staleTime: 30000,
  });

  // Delete violation mutation
  const deleteViolationMutation = useMutation({
    mutationFn: riskManagementService.deleteViolation,
    onSuccess: () => {
      showToast('Violation deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['violations'] });
    },
    onError: (error: any) => {
      console.error('Error deleting violation:', error);
      showToast(
        error.response?.data?.message || 'Failed to delete violation. Please try again.',
        'error'
      );
    }
  });

  const handleDeleteViolation = (id: string) => {
    setViolationToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteViolation = () => {
    if (violationToDelete) {
      deleteViolationMutation.mutate(violationToDelete);
      setShowDeleteConfirm(false);
      setViolationToDelete(null);
    }
  };

  const handleViewDetails = (violation: PolicyViolation) => {
    setSelectedViolation(violation);
    setShowDetailsModal(true);
  };

  const getViolationStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'under_investigation':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'closed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getViolationTypeColor = (type: string) => {
    switch (type) {
      case 'missing_insurance':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'missing_inspection':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'inadequate_coverage':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'expired_compliance':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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

  const filteredViolations = violationsData?.data?.filter(violation => {
    const matchesSearch = !searchTerm || 
      violation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.violationType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (violation.violatorName && violation.violatorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (violation.violatorEmail && violation.violatorEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (violation.productName && violation.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (violation.affectedUserId && violation.affectedUserId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (violation.renterId && violation.renterId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'investigating' && violation.status === 'under_investigation') ||
      (activeTab !== 'investigating' && violation.status === activeTab);
    
    return matchesSearch && matchesTab;
  }) || [];

  const getTabCounts = () => {
    const all = violationsData?.data || [];
    return {
      all: all.length,
      open: all.filter(v => v.status === 'open').length,
      investigating: all.filter(v => v.status === 'under_investigation').length,
      resolved: all.filter(v => v.status === 'resolved').length,
    };
  };

  const tabCounts = getTabCounts();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                Error loading violations
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                {error instanceof Error ? error.message : 'An error occurred while loading violations.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Policy Violations</h2>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Manage and track policy violations across the platform</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Record Violation
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Total Violations</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{tabCounts.all}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Open</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{tabCounts.open}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Investigating</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{tabCounts.investigating}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border border-gray-200 dark:border-slate-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-slate-400">Resolved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{tabCounts.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search violations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
              />
            </div>
          </div>
          <button className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-2 text-gray-700 dark:text-slate-300">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 mb-6">
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { key: 'all', label: 'All Violations', count: tabCounts.all },
              { key: 'open', label: 'Open', count: tabCounts.open },
              { key: 'investigating', label: 'Investigating', count: tabCounts.investigating },
              { key: 'resolved', label: 'Resolved', count: tabCounts.resolved },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-teal-500 dark:border-teal-400 text-teal-600 dark:text-teal-400'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                }`}
              >
                {tab.label}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.key ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Violations Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Violation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Type & Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Affected User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Penalty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {filteredViolations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-slate-500" />
                    <p className="text-lg font-medium text-gray-900 dark:text-slate-100">No violations found</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">No violations match your current filters.</p>
                  </td>
                </tr>
              ) : (
                filteredViolations.map((violation) => (
                  <tr key={violation.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                          {violation.description}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">
                          ID: {violation.id.slice(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getViolationTypeColor(violation.violationType)}`}>
                          {violation.violationType.charAt(0).toUpperCase() + violation.violationType.slice(1)}
                        </span>
                        <div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getSeverityColor(violation.severity)}`}>
                            {violation.severity.charAt(0).toUpperCase() + violation.severity.slice(1)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 dark:text-slate-500 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                            {violation.violatorName || 'Unknown User'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-slate-400">
                            {(violation.violatorId || violation.renterId || violation.affectedUserId || 'Unknown').slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getViolationStatusColor(violation.status)}`}>
                        {violation.status.replace('_', ' ').charAt(0).toUpperCase() + violation.status.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 dark:text-slate-500 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-slate-100">
                          {formatDateUTC(violation.createdAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 dark:text-slate-500 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-slate-100">
                          {violation.penaltyAmount ? `$${parseFloat(violation.penaltyAmount).toFixed(2)}` : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(violation)}
                          className="text-teal-600 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleViewDetails(violation)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteViolation(violation.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {violationsData && (violationsData.totalPages || 0) > 1 && (
          <div className="bg-white dark:bg-slate-800 px-4 py-3 border-t border-gray-200 dark:border-slate-700 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(violationsData.totalPages || 1, currentPage + 1))}
                  disabled={currentPage === (violationsData.totalPages || 1)}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-slate-300">
                    Showing <span className="font-medium">{Math.min(currentPage * pageSize, violationsData.total || 0)}</span> of{' '}
                    <span className="font-medium">{violationsData.total || 0}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {[...Array(Math.min(5, violationsData.totalPages || 1))].map((_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-teal-50 dark:bg-teal-900/30 border-teal-500 dark:border-teal-400 text-teal-600 dark:text-teal-400'
                              : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-600'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(Math.min(violationsData.totalPages || 1, currentPage + 1))}
                      disabled={currentPage === (violationsData.totalPages || 1)}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Violation Modal */}
      <CreateViolationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Violation Details Modal */}
      <ViolationDetailsModal
        violation={selectedViolation}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedViolation(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setViolationToDelete(null);
        }}
        onConfirm={confirmDeleteViolation}
        title="Delete Violation"
        message="Are you sure you want to delete this violation? This action cannot be undone."
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteViolationMutation.isPending}
      />
    </div>
  );
};

export default ViolationsSection;