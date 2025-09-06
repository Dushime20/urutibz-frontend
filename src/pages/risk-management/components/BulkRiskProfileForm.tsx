import React, { useState, useCallback } from 'react';
import { 
  Plus, 
  Trash2, 
  Upload, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  FileText,
  X
} from 'lucide-react';
import { riskManagementService } from '../../../services/riskManagementService';
import { CreateRiskProfileRequest, RiskLevel } from '../../../types/riskManagement';
import { useToast } from '../../../contexts/ToastContext';

interface BulkRiskProfileFormProps {
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

interface FormData {
  productId: string;
  categoryId: string;
  riskLevel: RiskLevel;
  mandatoryRequirements: {
    insurance: boolean;
    inspection: boolean;
    minCoverage: number;
    inspectionTypes: string[];
    complianceDeadlineHours: number;
  };
  riskFactors: string[];
  mitigationStrategies: string[];
  enforcementLevel: 'lenient' | 'moderate' | 'strict' | 'very_strict';
  autoEnforcement: boolean;
  gracePeriodHours: number;
}

interface ValidationErrors {
  [key: string]: string;
}

const BulkRiskProfileForm: React.FC<BulkRiskProfileFormProps> = ({
  onSuccess,
  onError,
  onCancel
}) => {
  const { showToast } = useToast();
  const [profiles, setProfiles] = useState<FormData[]>([
    getDefaultProfile()
  ]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<string>('');

  const riskLevels = [
    { value: RiskLevel.LOW, label: 'Low Risk', color: 'green' },
    { value: RiskLevel.MEDIUM, label: 'Medium Risk', color: 'yellow' },
    { value: RiskLevel.HIGH, label: 'High Risk', color: 'orange' },
    { value: RiskLevel.CRITICAL, label: 'Critical Risk', color: 'red' }
  ];

  const enforcementLevels = [
    { value: 'lenient', label: 'Lenient' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'strict', label: 'Strict' },
    { value: 'very_strict', label: 'Very Strict' }
  ];

  const inspectionTypes = [
    { value: 'pre_rental', label: 'Pre-rental' },
    { value: 'post_rental', label: 'Post-rental' },
    { value: 'periodic', label: 'Periodic' },
    { value: 'damage_assessment', label: 'Damage Assessment' }
  ];

  const commonRiskFactors = [
    'High value item',
    'Fragile equipment', 
    'Safety critical',
    'Weather sensitive',
    'Technical complexity',
    'Seasonal demand',
    'Regulatory compliance'
  ];

  const commonMitigationStrategies = [
    'Comprehensive insurance',
    'Professional inspections',
    'Enhanced security deposit',
    'User training required',
    'Safety protocols',
    'Regular maintenance',
    'Monitoring systems'
  ];

  function getDefaultProfile(): FormData {
    return {
      productId: '',
      categoryId: '',
      riskLevel: RiskLevel.MEDIUM,
      mandatoryRequirements: {
        insurance: true,
        inspection: true,
        minCoverage: 10000,
        inspectionTypes: ['pre_rental', 'post_rental'],
        complianceDeadlineHours: 24
      },
      riskFactors: ['High value item'],
      mitigationStrategies: ['Comprehensive insurance'],
      enforcementLevel: 'moderate',
      autoEnforcement: true,
      gracePeriodHours: 48
    };
  }

  const validateProfile = useCallback((profile: FormData, index: number): string[] => {
    const profileErrors: string[] = [];

    if (!profile.productId.trim()) {
      profileErrors.push(`Profile ${index + 1}: Product ID is required`);
    } else if (!isValidUUID(profile.productId)) {
      profileErrors.push(`Profile ${index + 1}: Product ID must be a valid UUID`);
    }

    if (!profile.categoryId.trim()) {
      profileErrors.push(`Profile ${index + 1}: Category ID is required`);
    } else if (!isValidUUID(profile.categoryId)) {
      profileErrors.push(`Profile ${index + 1}: Category ID must be a valid UUID`);
    }

    if (!profile.mandatoryRequirements.minCoverage || profile.mandatoryRequirements.minCoverage < 0) {
      profileErrors.push(`Profile ${index + 1}: Minimum coverage must be a positive number`);
    }

    if (!profile.mandatoryRequirements.complianceDeadlineHours || profile.mandatoryRequirements.complianceDeadlineHours < 0) {
      profileErrors.push(`Profile ${index + 1}: Compliance deadline must be a positive number`);
    }

    if (!profile.gracePeriodHours || profile.gracePeriodHours < 0) {
      profileErrors.push(`Profile ${index + 1}: Grace period must be a positive number`);
    }

    // Allow empty arrays - no validation required for inspectionTypes, riskFactors, or mitigationStrategies

    return profileErrors;
  }, []);

  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  const validateAllProfiles = useCallback((): boolean => {
    const allErrors: string[] = [];
    
    profiles.forEach((profile, index) => {
      const profileErrors = validateProfile(profile, index);
      allErrors.push(...profileErrors);
    });

    if (allErrors.length > 0) {
      setErrors({ validation: allErrors.join(', ') });
      return false;
    }

    setErrors({});
    return true;
  }, [profiles, validateProfile]);

  const addProfile = () => {
    setProfiles([...profiles, getDefaultProfile()]);
    setErrors({});
  };

  const removeProfile = (index: number) => {
    if (profiles.length > 1) {
      setProfiles(profiles.filter((_, i) => i !== index));
      setErrors({});
    }
  };

  const updateProfile = (index: number, field: keyof FormData, value: any) => {
    const updatedProfiles = [...profiles];
    updatedProfiles[index] = { ...updatedProfiles[index], [field]: value };
    setProfiles(updatedProfiles);
    setErrors({});
  };

  const updateMandatoryRequirements = (index: number, field: keyof FormData['mandatoryRequirements'], value: any) => {
    const updatedProfiles = [...profiles];
    updatedProfiles[index].mandatoryRequirements = {
      ...updatedProfiles[index].mandatoryRequirements,
      [field]: value
    };
    setProfiles(updatedProfiles);
    setErrors({});
  };

  const toggleArrayItem = (index: number, field: 'riskFactors' | 'mitigationStrategies' | 'inspectionTypes', item: string) => {
    const updatedProfiles = [...profiles];
    const currentArray = field === 'inspectionTypes' 
      ? updatedProfiles[index].mandatoryRequirements.inspectionTypes
      : updatedProfiles[index][field];
    
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    
    if (field === 'inspectionTypes') {
      updatedProfiles[index].mandatoryRequirements.inspectionTypes = newArray;
    } else {
      updatedProfiles[index][field] = newArray;
    }
    
    setProfiles(updatedProfiles);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    if (!validateAllProfiles()) {
      return;
    }

    setLoading(true);

    try {
      const apiData: CreateRiskProfileRequest[] = profiles.map(profile => ({
        productId: profile.productId.trim(),
        categoryId: profile.categoryId.trim(),
        riskLevel: profile.riskLevel,
        mandatoryRequirements: profile.mandatoryRequirements,
        riskFactors: profile.riskFactors,
        mitigationStrategies: profile.mitigationStrategies,
        enforcementLevel: profile.enforcementLevel,
        autoEnforcement: profile.autoEnforcement,
        gracePeriodHours: profile.gracePeriodHours
      }));

      const result = await riskManagementService.createRiskProfilesBulk({ profiles: apiData });
      
      if (result.success) {
        const successCount = result.data.successful;
        const failedCount = result.data.failed;
        
        if (failedCount === 0) {
          showToast(`Successfully created ${successCount} risk profile${successCount > 1 ? 's' : ''}`, 'success');
        } else {
          showToast(`Created ${successCount} profiles successfully, ${failedCount} failed`, 'warning');
        }
        
        onSuccess?.(result);
      } else {
        const errorMessage = result.message || 'Failed to create risk profiles';
        setGlobalError(errorMessage);
        showToast(errorMessage, 'error');
        onError?.(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create risk profiles';
      setGlobalError(errorMessage);
      showToast(errorMessage, 'error');
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    const sampleProfiles: FormData[] = [
      {
        productId: '403eb546-56bf-4b2e-987d-6bb05a09cadd',
        categoryId: 'photography-equipment',
        riskLevel: RiskLevel.HIGH,
        mandatoryRequirements: {
          insurance: true,
          inspection: true,
          minCoverage: 25000,
          inspectionTypes: ['pre_rental', 'post_rental'],
          complianceDeadlineHours: 12
        },
        riskFactors: ['High value item', 'Fragile equipment', 'Technical complexity'],
        mitigationStrategies: ['Comprehensive insurance', 'Professional inspections', 'User training required'],
        enforcementLevel: 'strict',
        autoEnforcement: true,
        gracePeriodHours: 24
      },
      {
        productId: '550e8400-e29b-41d4-a716-446655440000',
        categoryId: 'vehicles',
        riskLevel: RiskLevel.CRITICAL,
        mandatoryRequirements: {
          insurance: true,
          inspection: true,
          minCoverage: 50000,
          inspectionTypes: ['pre_rental', 'post_rental', 'periodic'],
          complianceDeadlineHours: 6
        },
        riskFactors: ['High value item', 'Safety critical', 'Regulatory compliance'],
        mitigationStrategies: ['Comprehensive insurance', 'Professional inspections', 'Safety protocols'],
        enforcementLevel: 'very_strict',
        autoEnforcement: true,
        gracePeriodHours: 12
      }
    ];
    setProfiles(sampleProfiles);
    showToast(`Loaded ${sampleProfiles.length} sample profiles`, 'info');
  };

  const downloadSampleJSON = () => {
    const sampleData = {
      profiles: [
        {
          productId: "403eb546-56bf-4b2e-987d-6bb05a09cadd",
          categoryId: "photography-equipment",
          riskLevel: "high",
          mandatoryRequirements: {
            insurance: true,
            inspection: true,
            minCoverage: 25000,
            inspectionTypes: ["pre_rental", "post_rental"],
            complianceDeadlineHours: 12
          },
          riskFactors: ["High value item", "Fragile equipment", "Technical complexity"],
          mitigationStrategies: ["Comprehensive insurance", "Professional inspections", "User training required"],
          enforcementLevel: "strict",
          autoEnforcement: true,
          gracePeriodHours: 24
        }
      ]
    };

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'risk-profiles-sample.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Sample JSON template downloaded', 'success');
  };

  const handleImportData = () => {
    try {
      const parsedData = JSON.parse(importData);
      if (parsedData.profiles && Array.isArray(parsedData.profiles)) {
        setProfiles(parsedData.profiles);
        setShowImportModal(false);
        setImportData('');
        setErrors({});
        showToast(`Successfully imported ${parsedData.profiles.length} profile${parsedData.profiles.length > 1 ? 's' : ''}`, 'success');
      } else {
        setErrors({ import: 'Invalid JSON format. Expected "profiles" array.' });
        showToast('Invalid JSON format. Expected "profiles" array.', 'error');
      }
    } catch (error) {
      setErrors({ import: 'Invalid JSON format. Please check your data.' });
      showToast('Invalid JSON format. Please check your data.', 'error');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Bulk Create Risk Profiles</h2>
            <p className="text-sm text-gray-600 mt-1">
              Create multiple risk profiles with comprehensive validation
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={downloadSampleJSON}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Sample JSON
            </button>
            <button
              type="button"
              onClick={generateSampleData}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <FileText className="w-4 h-4 mr-2" />
              Load Sample
            </button>
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import JSON
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {(globalError || Object.keys(errors).length > 0) && (
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          {globalError && (
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{globalError}</p>
                </div>
              </div>
            </div>
          )}
          {Object.keys(errors).map(key => (
            <div key={key} className="flex items-center mt-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div className="ml-3">
                <div className="text-sm text-red-700">
                  <p>{errors[key]}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-8">
          {profiles.map((profile, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Profile {index + 1}</h3>
                {profiles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProfile(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Product ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product ID *
                  </label>
                  <input
                    type="text"
                    value={profile.productId}
                    onChange={(e) => updateProfile(index, 'productId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter product UUID"
                  />
                </div>

                {/* Category ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category ID *
                  </label>
                  <input
                    type="text"
                    value={profile.categoryId}
                    onChange={(e) => updateProfile(index, 'categoryId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Enter category UUID"
                  />
                </div>

                {/* Risk Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Level *
                  </label>
                  <select
                    value={profile.riskLevel}
                    onChange={(e) => updateProfile(index, 'riskLevel', e.target.value as RiskLevel)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    {riskLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Enforcement Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enforcement Level *
                  </label>
                  <select
                    value={profile.enforcementLevel}
                    onChange={(e) => updateProfile(index, 'enforcementLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    {enforcementLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min Coverage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Coverage ($)
                  </label>
                  <input
                    type="number"
                    value={profile.mandatoryRequirements.minCoverage}
                    onChange={(e) => updateMandatoryRequirements(index, 'minCoverage', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    min="0"
                  />
                </div>

                {/* Compliance Deadline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compliance Deadline (hours)
                  </label>
                  <input
                    type="number"
                    value={profile.mandatoryRequirements.complianceDeadlineHours}
                    onChange={(e) => updateMandatoryRequirements(index, 'complianceDeadlineHours', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    min="0"
                  />
                </div>

                {/* Grace Period */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grace Period (hours)
                  </label>
                  <input
                    type="number"
                    value={profile.gracePeriodHours}
                    onChange={(e) => updateProfile(index, 'gracePeriodHours', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Mandatory Requirements */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Mandatory Requirements</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.mandatoryRequirements.insurance}
                      onChange={(e) => updateMandatoryRequirements(index, 'insurance', e.target.checked)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Insurance Required</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.mandatoryRequirements.inspection}
                      onChange={(e) => updateMandatoryRequirements(index, 'inspection', e.target.checked)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Inspection Required</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.autoEnforcement}
                      onChange={(e) => updateProfile(index, 'autoEnforcement', e.target.checked)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Auto Enforcement</label>
                  </div>
                </div>
              </div>

              {/* Inspection Types */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Inspection Types</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {inspectionTypes.map(type => (
                    <div key={type.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.mandatoryRequirements.inspectionTypes.includes(type.value)}
                        onChange={() => toggleArrayItem(index, 'inspectionTypes', type.value)}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">{type.label}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Risk Factors</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {commonRiskFactors.map(factor => (
                    <div key={factor} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.riskFactors.includes(factor)}
                        onChange={() => toggleArrayItem(index, 'riskFactors', factor)}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">{factor}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mitigation Strategies */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Mitigation Strategies</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {commonMitigationStrategies.map(strategy => (
                    <div key={strategy} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={profile.mitigationStrategies.includes(strategy)}
                        onChange={() => toggleArrayItem(index, 'mitigationStrategies', strategy)}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">{strategy}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Profile Button */}
        <div className="mt-6 flex justify-start">
          <button
            type="button"
            onClick={addProfile}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Profile
          </button>
        </div>

        {/* Submit Buttons */}
        <div className="mt-8 flex justify-end space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : `Create ${profiles.length} Profile${profiles.length > 1 ? 's' : ''}`}
          </button>
        </div>
      </form>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowImportModal(false)}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Import JSON Data</h3>
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste JSON data:
                  </label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    rows={10}
                    placeholder='{"profiles": [...]}'
                  />
                </div>

                {errors.import && (
                  <div className="mb-4 text-sm text-red-600">
                    {errors.import}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleImportData}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Import
                </button>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkRiskProfileForm;
