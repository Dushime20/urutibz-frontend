import React, { useState } from 'react';
import { 
  Plus, 
  Upload, 
  Download, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Shield,
  TrendingUp
} from 'lucide-react';
import { RiskManagementProvider, useRiskManagement } from './context/RiskManagementContext';
import BulkRiskProfileForm from './components/BulkRiskProfileForm';
import RiskProfilesTable from './components/RiskProfilesTable';
import BulkOperationProgress from './components/BulkOperationProgress';
import JsonValidationTest from './components/JsonValidationTest';
import EnforcementApiTest from './components/EnforcementApiTest';
import EnforcementActionsPanel from './components/EnforcementActionsPanel';
import { useRiskProfiles } from './hooks/useRiskProfiles';
import { useBulkCreateProfiles } from './hooks/useBulkCreateProfiles';
import { useToast } from '../../contexts/ToastContext';
import { 
  convertProfilesToCSV, 
  convertProfilesToJSON, 
  parseCSVToProfiles, 
  parseJSONToProfiles,
  downloadFile,
  generateCSVTemplate,
  generateJSONTemplate,
  validateBulkData
} from './utils/importExport';

const BulkRiskManagementContent: React.FC = () => {
  const { state, showBulkForm, hideBulkForm, showProgressModal, hideProgressModal } = useRiskManagement();
  const { profiles, loading, error, refresh } = useRiskProfiles();
  const { result: bulkResult, error: bulkError, createProfiles } = useBulkCreateProfiles();
  const { showToast } = useToast();
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const handleBulkCreateSuccess = () => {
    showProgressModal();
    refresh(); // Refresh the profiles list
  };

  const handleBulkCreateError = () => {
    showProgressModal();
  };

  const handleFileImport = async (file: File) => {
    setImportError(null);
    
    try {
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string || '');
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });

      let profilesToImport;
      
      if (file.name.endsWith('.csv')) {
        profilesToImport = parseCSVToProfiles(content);
      } else if (file.name.endsWith('.json')) {
        profilesToImport = parseJSONToProfiles(content);
      } else {
        throw new Error('Unsupported file format. Please use CSV or JSON files.');
      }

      // Validate the data
      const { valid, errors } = validateBulkData(profilesToImport);
      
      if (errors.length > 0) {
        const errorMessages = errors.map(e => 
          `Row ${e.index + 1}: ${e.errors.join(', ')}`
        ).join('\n');
        setImportError(`Validation errors:\n${errorMessages}`);
        showToast(`Validation failed: ${errors.length} profile${errors.length > 1 ? 's' : ''} have errors`, 'error');
        return;
      }

      if (valid.length === 0) {
        setImportError('No valid profiles found in the file');
        showToast('No valid profiles found in the file', 'error');
        return;
      }

      // Create the profiles
      await createProfiles(valid);
      setShowImportModal(false);
      showToast(`Successfully imported ${valid.length} profile${valid.length > 1 ? 's' : ''}`, 'success');
      
    } catch (error: any) {
      setImportError(error.message || 'Failed to import file');
      showToast(error.message || 'Failed to import file', 'error');
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    try {
      if (format === 'csv') {
        const csvContent = convertProfilesToCSV(profiles);
        downloadFile(csvContent, 'risk-profiles.csv', 'text/csv');
        showToast(`Exported ${profiles.length} profiles as CSV`, 'success');
      } else {
        const jsonContent = convertProfilesToJSON(profiles);
        downloadFile(jsonContent, 'risk-profiles.json', 'application/json');
        showToast(`Exported ${profiles.length} profiles as JSON`, 'success');
      }
    } catch (error: any) {
      console.error('Export failed:', error);
      showToast('Export failed. Please try again.', 'error');
    }
  };

  const handleDownloadTemplate = (format: 'csv' | 'json') => {
    try {
      if (format === 'csv') {
        const template = generateCSVTemplate();
        downloadFile(template, 'risk-profiles-template.csv', 'text/csv');
        showToast('CSV template downloaded', 'success');
      } else {
        const template = generateJSONTemplate();
        downloadFile(template, 'risk-profiles-template.json', 'application/json');
        showToast('JSON template downloaded', 'success');
      }
    } catch (error: any) {
      console.error('Template download failed:', error);
      showToast('Template download failed. Please try again.', 'error');
    }
  };

  const stats = [
    {
      name: 'Total Profiles',
      value: profiles.length,
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'High Risk',
      value: profiles.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      name: 'Active Profiles',
      value: profiles.filter(p => p.isActive).length,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      name: 'Auto Enforcement',
      value: profiles.filter(p => p.autoEnforcement).length,
      icon: TrendingUp,
      color: 'text-teal-600',
      bgColor: 'bg-teal-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Risk Management</h1>
          <p className="mt-2 text-gray-600">
            Manage risk profiles for products and categories with comprehensive bulk operations
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Actions</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  showBulkForm();
                  showToast('Opening bulk create form', 'info');
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Bulk Create Profiles
              </button>
              
              <button
                onClick={() => {
                  setShowImportModal(true);
                  showToast('Opening import modal', 'info');
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import Profiles
              </button>
              
              <div className="relative group">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                  <Download className="w-4 h-4 mr-2" />
                  Export Profiles
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('csv')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as CSV
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Export as JSON
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="relative group">
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                  <FileText className="w-4 h-4 mr-2" />
                  Download Template
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    <button
                      onClick={() => handleDownloadTemplate('csv')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      CSV Template
                    </button>
                    <button
                      onClick={() => handleDownloadTemplate('json')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      JSON Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* JSON Validation Test */}
        <JsonValidationTest />

        {/* Enforcement API Test */}
        <EnforcementApiTest />

        {/* Enforcement Actions Panel */}
        <EnforcementActionsPanel />

        {/* Profiles Table */}
        <RiskProfilesTable
          profiles={profiles}
          loading={loading}
          onView={(profile) => console.log('View profile:', profile)}
          onEdit={(profile) => console.log('Edit profile:', profile)}
          onDelete={(profile) => console.log('Delete profile:', profile)}
          onBulkAction={(action, ids) => console.log('Bulk action:', action, ids)}
        />

        {/* Bulk Form Modal */}
        {state.ui.showBulkForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={hideBulkForm}></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
                <BulkRiskProfileForm
                  onSuccess={handleBulkCreateSuccess}
                  onError={handleBulkCreateError}
                  onCancel={hideBulkForm}
                />
              </div>
            </div>
          </div>
        )}

        {/* Progress Modal */}
        <BulkOperationProgress
          isVisible={state.ui.showProgressModal}
          onClose={hideProgressModal}
          result={bulkResult}
          error={bulkError}
        />

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowImportModal(false)}></div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Import Profiles</h3>
                    <button
                      onClick={() => setShowImportModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select file to import:
                    </label>
                    <input
                      type="file"
                      accept=".csv,.json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileImport(file);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>

                  {importError && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                      <div className="text-sm text-red-700 whitespace-pre-line">
                        {importError}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-600">
                    <p>Supported formats: CSV, JSON</p>
                    <p>Download templates for the correct format.</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const BulkRiskManagementPage: React.FC = () => {
  return (
    <RiskManagementProvider>
      <BulkRiskManagementContent />
    </RiskManagementProvider>
  );
};

export default BulkRiskManagementPage;
