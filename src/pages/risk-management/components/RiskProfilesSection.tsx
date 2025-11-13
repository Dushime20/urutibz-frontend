import React, { useState } from 'react';
import { Plus, Upload, Search, Trash2, Eye, Edit, AlertTriangle, Shield } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { riskManagementService } from '../../../services/riskManagementService';
import { RiskProfile, RiskLevel } from '../../../types/riskManagement';
import CreateRiskProfileModal from './CreateRiskProfileModal';
import BulkCreateRiskProfileModal from './BulkCreateRiskProfileModal';
import RiskProfileDetailsModal from './RiskProfileDetailsModal';
import EditRiskProfileModal from './EditRiskProfileModal';
import ConfirmationDialog from './ConfirmationDialog';
import { useToast } from '../../../contexts/ToastContext';
import { formatDateUTC } from '../../../utils/dateUtils';

const RiskProfilesSection: React.FC = () => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<RiskLevel | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<RiskProfile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Fetch risk profiles
  const {
    data: profilesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['riskProfiles', currentPage, pageSize, searchTerm, selectedRiskLevel],
    queryFn: () => riskManagementService.getRiskProfiles(
      {
        search: searchTerm || undefined,
        riskLevel: selectedRiskLevel ? [selectedRiskLevel] : undefined
      },
      currentPage,
      pageSize
    )
  });

  // Delete risk profile mutation
  const deleteProfileMutation = useMutation({
    mutationFn: (id: string) => riskManagementService.deleteRiskProfile(id),
    onSuccess: () => {
      showToast('Risk profile deleted successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['riskProfiles'] });
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to delete risk profile', 'error');
    }
  });

  const handleDeleteProfile = (id: string) => {
    setProfileToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProfile = () => {
    if (profileToDelete) {
      deleteProfileMutation.mutate(profileToDelete);
      setShowDeleteConfirm(false);
      setProfileToDelete(null);
    }
  };

  const handleViewProfile = (profile: RiskProfile) => {
    setSelectedProfile(profile);
    setShowDetailsModal(true);
  };

  const handleEditProfile = (profile: RiskProfile) => {
    setSelectedProfile(profile);
    setShowEditModal(true);
  };

  const getRiskLevelColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.LOW:
        return 'bg-green-100 text-green-800';
      case RiskLevel.MEDIUM:
        return 'bg-yellow-100 text-yellow-800';
      case RiskLevel.HIGH:
        return 'bg-orange-100 text-orange-800';
      case RiskLevel.CRITICAL:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Use shared UTC date formatter
  const formatDate = formatDateUTC;

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <AlertTriangle className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">Error Loading Risk Profiles</h3>
          <p className="text-gray-500 dark:text-slate-400 mb-4">
            {(error as any)?.response?.data?.message || 'An error occurred while loading risk profiles'}
          </p>
          <button
            onClick={() => refetch()}
            className="bg-teal-600 dark:bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Risk Profiles</h2>
          <p className="text-gray-600 dark:text-slate-400">Manage risk profiles for products and categories</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowBulkCreateModal(true)}
            className="bg-gray-600 dark:bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-slate-700 flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Bulk Create</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-teal-600 dark:bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Profile</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-6 border border-gray-200 dark:border-slate-600">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search risk profiles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={selectedRiskLevel}
              onChange={(e) => setSelectedRiskLevel(e.target.value as RiskLevel | '')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
            >
              <option value="">All Risk Levels</option>
              <option value={RiskLevel.LOW}>Low Risk</option>
              <option value={RiskLevel.MEDIUM}>Medium Risk</option>
              <option value={RiskLevel.HIGH}>High Risk</option>
              <option value={RiskLevel.CRITICAL}>Critical Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      {profilesData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{profilesData.total || 0}</div>
            <div className="text-sm text-gray-600 dark:text-slate-400">Total Profiles</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {(profilesData.data || []).filter(p => p.isActive).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-slate-400">Active Profiles</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {(profilesData.data || []).filter(p => p.riskLevel === RiskLevel.HIGH || p.riskLevel === RiskLevel.CRITICAL).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-slate-400">High/Critical Risk</div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {(profilesData.data || []).reduce((acc, p) => acc + (p.mandatoryRequirements?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-slate-400">Total Requirements</div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 dark:border-teal-400 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-slate-400">Loading risk profiles...</p>
          </div>
        ) : (profilesData?.data || []).length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 dark:text-slate-500 mb-4">
              <Shield className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">No Risk Profiles Found</h3>
            <p className="text-gray-500 dark:text-slate-400 mb-4">
              {searchTerm || selectedRiskLevel 
                ? 'No risk profiles match your current filters.'
                : 'Get started by creating your first risk profile.'
              }
            </p>
            {!searchTerm && !selectedRiskLevel && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-teal-600 dark:bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-700 dark:hover:bg-teal-600"
              >
                Create First Profile
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Requirements
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {(profilesData?.data || []).map((profile) => (
                    <tr key={profile.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                            {profile.productName || `Product ${profile.productId}`}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-slate-400">
                            {profile.categoryName || `Category ${profile.categoryId}`}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(profile.riskLevel)}`}>
                          {profile.riskLevel.charAt(0).toUpperCase() + profile.riskLevel.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100">
                        {profile.mandatoryRequirements.length} mandatory
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          profile.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {profile.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {formatDate(profile.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewProfile(profile)}
                            className="text-teal-600 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditProfile(profile)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProfile(profile.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                            title="Delete"
                            disabled={deleteProfileMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {profilesData && (profilesData.totalPages || 0) > 1 && (
              <div className="bg-white dark:bg-slate-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-slate-700 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(profilesData.totalPages, currentPage + 1))}
                    disabled={currentPage === (profilesData.totalPages || 1)}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-slate-300">
                      Showing{' '}
                      <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>
                      {' '}to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * pageSize, profilesData.total || 0)}
                      </span>
                      {' '}of{' '}
                      <span className="font-medium">{profilesData.total || 0}</span>
                      {' '}results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {Array.from({ length: Math.min(5, profilesData.totalPages || 1) }, (_, i) => {
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
                        onClick={() => setCurrentPage(Math.min(profilesData.totalPages, currentPage + 1))}
                        disabled={currentPage === (profilesData.totalPages || 1)}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateRiskProfileModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            queryClient.invalidateQueries({ queryKey: ['riskProfiles'] });
          }}
        />
      )}

      {showBulkCreateModal && (
        <BulkCreateRiskProfileModal
          isOpen={showBulkCreateModal}
          onClose={() => setShowBulkCreateModal(false)}
          onSuccess={() => {
            setShowBulkCreateModal(false);
            queryClient.invalidateQueries({ queryKey: ['riskProfiles'] });
          }}
        />
      )}

      {showDetailsModal && selectedProfile && (
        <RiskProfileDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedProfile(null);
          }}
          profile={selectedProfile}
        />
      )}

      {showEditModal && selectedProfile && (
        <EditRiskProfileModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProfile(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedProfile(null);
            queryClient.invalidateQueries({ queryKey: ['riskProfiles'] });
          }}
          profile={selectedProfile}
        />
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setProfileToDelete(null);
        }}
        onConfirm={confirmDeleteProfile}
        title="Delete Risk Profile"
        message="Are you sure you want to delete this risk profile? This action cannot be undone. The profile will be marked as inactive."
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteProfileMutation.isPending}
      />
    </div>
  );
};

export default RiskProfilesSection;
