import React, { useState, useMemo } from 'react';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { RiskProfile, RiskLevel } from '../../../types/riskManagement';
import { useToast } from '../../../contexts/ToastContext';

interface RiskProfilesTableProps {
  profiles: RiskProfile[];
  loading?: boolean;
  onView?: (profile: RiskProfile) => void;
  onEdit?: (profile: RiskProfile) => void;
  onDelete?: (profile: RiskProfile) => void;
  onBulkAction?: (action: string, selectedIds: string[]) => void;
}

interface SortConfig {
  key: keyof RiskProfile;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  riskLevel: RiskLevel[];
  enforcementLevel: string[];
  status: string[];
}

const RiskProfilesTable: React.FC<RiskProfilesTableProps> = ({
  profiles,
  loading = false,
  onView,
  onEdit,
  onDelete,
  onBulkAction
}) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<FilterConfig>({
    riskLevel: [],
    enforcementLevel: [],
    status: []
  });
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const riskLevelColors = {
    [RiskLevel.LOW]: 'bg-green-100 text-green-800',
    [RiskLevel.MEDIUM]: 'bg-yellow-100 text-yellow-800',
    [RiskLevel.HIGH]: 'bg-orange-100 text-orange-800',
    [RiskLevel.CRITICAL]: 'bg-red-100 text-red-800'
  };

  const enforcementLevelColors = {
    'lenient': 'bg-blue-100 text-blue-800',
    'moderate': 'bg-yellow-100 text-yellow-800',
    'strict': 'bg-orange-100 text-orange-800',
    'very_strict': 'bg-red-100 text-red-800'
  };

  const filteredAndSortedProfiles = useMemo(() => {
    let filtered = profiles.filter(profile => {
      // Search filter
      const matchesSearch = !searchTerm || 
        profile.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.productId.toLowerCase().includes(searchTerm.toLowerCase());

      // Risk level filter
      const matchesRiskLevel = filters.riskLevel.length === 0 || 
        filters.riskLevel.includes(profile.riskLevel);

      // Enforcement level filter
      const matchesEnforcementLevel = filters.enforcementLevel.length === 0 || 
        filters.enforcementLevel.includes(profile.enforcementLevel || '');

      // Status filter (assuming active/inactive based on isActive)
      const matchesStatus = filters.status.length === 0 || 
        (filters.status.includes('active') && profile.isActive) ||
        (filters.status.includes('inactive') && !profile.isActive);

      return matchesSearch && matchesRiskLevel && matchesEnforcementLevel && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue == null || bValue == null) return 0;
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [profiles, searchTerm, filters, sortConfig]);

  const handleSort = (key: keyof RiskProfile) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectProfile = (profileId: string) => {
    setSelectedProfiles(prev => 
      prev.includes(profileId) 
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProfiles.length === filteredAndSortedProfiles.length) {
      setSelectedProfiles([]);
    } else {
      setSelectedProfiles(filteredAndSortedProfiles.map(p => p.id));
    }
  };

  const toggleRowExpansion = (profileId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(profileId)) {
        newSet.delete(profileId);
      } else {
        newSet.add(profileId);
      }
      return newSet;
    });
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

  const getRiskLevelIcon = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.LOW:
        return <CheckCircle className="w-4 h-4" />;
      case RiskLevel.MEDIUM:
        return <Clock className="w-4 h-4" />;
      case RiskLevel.HIGH:
      case RiskLevel.CRITICAL:
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading risk profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Risk Profiles</h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredAndSortedProfiles.length} of {profiles.length} profiles
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search profiles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                showFilters 
                  ? 'border-teal-500 text-teal-700 bg-teal-50' 
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Risk Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Risk Level</label>
                <div className="space-y-2">
                  {Object.values(RiskLevel).map(level => (
                    <label key={level} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.riskLevel.includes(level)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({ ...prev, riskLevel: [...prev.riskLevel, level] }));
                          } else {
                            setFilters(prev => ({ ...prev, riskLevel: prev.riskLevel.filter(l => l !== level) }));
                          }
                        }}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Enforcement Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Enforcement Level</label>
                <div className="space-y-2">
                  {['lenient', 'moderate', 'strict', 'very_strict'].map(level => (
                    <label key={level} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.enforcementLevel.includes(level)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({ ...prev, enforcementLevel: [...prev.enforcementLevel, level] }));
                          } else {
                            setFilters(prev => ({ ...prev, enforcementLevel: prev.enforcementLevel.filter(l => l !== level) }));
                          }
                        }}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{level.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="space-y-2">
                  {['active', 'inactive'].map(status => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters(prev => ({ ...prev, status: [...prev.status, status] }));
                          } else {
                            setFilters(prev => ({ ...prev, status: prev.status.filter(s => s !== status) }));
                          }
                        }}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedProfiles.length > 0 && (
          <div className="mt-4 p-3 bg-teal-50 border border-teal-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-teal-700">
                {selectedProfiles.length} profile{selectedProfiles.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    onBulkAction?.('delete', selectedProfiles);
                    showToast(`Deleting ${selectedProfiles.length} selected profiles`, 'warning');
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => {
                    onBulkAction?.('activate', selectedProfiles);
                    showToast(`Activating ${selectedProfiles.length} selected profiles`, 'info');
                  }}
                  className="text-sm text-green-600 hover:text-green-800"
                >
                  Activate Selected
                </button>
                <button
                  onClick={() => {
                    onBulkAction?.('deactivate', selectedProfiles);
                    showToast(`Deactivating ${selectedProfiles.length} selected profiles`, 'info');
                  }}
                  className="text-sm text-yellow-600 hover:text-yellow-800"
                >
                  Deactivate Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedProfiles.length === filteredAndSortedProfiles.length && filteredAndSortedProfiles.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('productName')}
              >
                <div className="flex items-center">
                  Product
                  {sortConfig.key === 'productName' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('categoryName')}
              >
                <div className="flex items-center">
                  Category
                  {sortConfig.key === 'categoryName' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('riskLevel')}
              >
                <div className="flex items-center">
                  Risk Level
                  {sortConfig.key === 'riskLevel' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('enforcementLevel')}
              >
                <div className="flex items-center">
                  Enforcement
                  {sortConfig.key === 'enforcementLevel' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('isActive')}
              >
                <div className="flex items-center">
                  Status
                  {sortConfig.key === 'isActive' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center">
                  Created
                  {sortConfig.key === 'createdAt' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedProfiles.map((profile) => (
              <React.Fragment key={profile.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedProfiles.includes(profile.id)}
                      onChange={() => handleSelectProfile(profile.id)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {profile.productName || 'Unnamed Product'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {profile.productId.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {profile.categoryName || 'Uncategorized'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${riskLevelColors[profile.riskLevel]}`}>
                      {getRiskLevelIcon(profile.riskLevel)}
                      <span className="ml-1 capitalize">{profile.riskLevel}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${enforcementLevelColors[profile.enforcementLevel as keyof typeof enforcementLevelColors] || 'bg-gray-100 text-gray-800'}`}>
                      {profile.enforcementLevel?.replace('_', ' ') || 'Not set'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profile.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {profile.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(profile.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => toggleRowExpansion(profile.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {expandedRows.has(profile.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => {
                          onView?.(profile);
                          showToast(`Viewing profile for ${profile.productId}`, 'info');
                        }}
                        className="text-teal-600 hover:text-teal-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          onEdit?.(profile);
                          showToast(`Editing profile for ${profile.productId}`, 'info');
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          onDelete?.(profile);
                          showToast(`Deleting profile for ${profile.productId}`, 'warning');
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                
                {/* Expanded Row */}
                {expandedRows.has(profile.id) && (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Mandatory Requirements</h4>
                          <div className="space-y-1">
                            {profile.mandatoryInsurance && (
                              <div className="text-sm text-gray-600">✓ Insurance Required</div>
                            )}
                            {profile.mandatoryInspection && (
                              <div className="text-sm text-gray-600">✓ Inspection Required</div>
                            )}
                            {profile.minCoverage && (
                              <div className="text-sm text-gray-600">Min Coverage: ${profile.minCoverage}</div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Risk Factors</h4>
                          <div className="space-y-1">
                            {profile.riskFactors?.slice(0, 3).map((factor, index) => (
                              <div key={index} className="text-sm text-gray-600">
                                • {typeof factor === 'string' ? factor : factor.name || 'Unknown'}
                              </div>
                            ))}
                            {profile.riskFactors?.length > 3 && (
                              <div className="text-sm text-gray-500">
                                +{profile.riskFactors.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Settings</h4>
                          <div className="space-y-1">
                            <div className="text-sm text-gray-600">
                              Auto Enforcement: {profile.autoEnforcement ? 'Yes' : 'No'}
                            </div>
                            <div className="text-sm text-gray-600">
                              Grace Period: {profile.gracePeriodHours}h
                            </div>
                            <div className="text-sm text-gray-600">
                              Version: {profile.version}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredAndSortedProfiles.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <AlertTriangle className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No profiles found</h3>
          <p className="text-gray-500">
            {searchTerm || Object.values(filters).some(f => f.length > 0)
              ? 'Try adjusting your search or filters'
              : 'No risk profiles have been created yet'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default RiskProfilesTable;
