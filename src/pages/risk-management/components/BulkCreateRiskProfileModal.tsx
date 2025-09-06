import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { riskManagementService } from '../../../services/riskManagementService';
import { RiskLevel } from '../../../types/riskManagement';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface RiskProfileFormData {
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
  enforcementLevel: 'moderate' | 'strict' | 'very_strict' | 'lenient';
  autoEnforcement: boolean;
  gracePeriodHours: number;
}

const BulkCreateRiskProfileModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [profiles, setProfiles] = useState<RiskProfileFormData[]>([
    {
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
      riskFactors: ['high_value'],
      mitigationStrategies: ['require_insurance'],
      enforcementLevel: 'moderate',
      autoEnforcement: true,
      gracePeriodHours: 48
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<any>(null);

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
    'high_value', 'fragile', 'seasonal_demand', 'weather_sensitive', 
    'technical_complexity', 'safety_critical', 'regulatory_compliance'
  ];

  const commonMitigationStrategies = [
    'require_insurance', 'mandatory_inspection', 'user_training', 
    'safety_protocols', 'regular_maintenance', 'monitoring_systems'
  ];

  const addProfile = () => {
    setProfiles([...profiles, {
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
      riskFactors: ['high_value'],
      mitigationStrategies: ['require_insurance'],
      enforcementLevel: 'moderate',
      autoEnforcement: true,
      gracePeriodHours: 48
    }]);
  };

  const removeProfile = (index: number) => {
    if (profiles.length > 1) {
      setProfiles(profiles.filter((_, i) => i !== index));
    }
  };

  const updateProfile = (index: number, field: keyof RiskProfileFormData, value: any) => {
    const updatedProfiles = [...profiles];
    updatedProfiles[index] = { ...updatedProfiles[index], [field]: value };
    setProfiles(updatedProfiles);
  };

  const updateMandatoryRequirements = (index: number, field: keyof RiskProfileFormData['mandatoryRequirements'], value: any) => {
    const updatedProfiles = [...profiles];
    updatedProfiles[index].mandatoryRequirements = {
      ...updatedProfiles[index].mandatoryRequirements,
      [field]: value
    };
    setProfiles(updatedProfiles);
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
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Transform the form data to match the API specification
      const apiData = {
        profiles: profiles.map(profile => ({
          productId: profile.productId,
          categoryId: profile.categoryId,
          riskLevel: profile.riskLevel,
          mandatoryRequirements: profile.mandatoryRequirements,
          riskFactors: profile.riskFactors,
          mitigationStrategies: profile.mitigationStrategies,
          enforcementLevel: profile.enforcementLevel,
          autoEnforcement: profile.autoEnforcement,
          gracePeriodHours: profile.gracePeriodHours
        }))
      };

      const result = await riskManagementService.createRiskProfilesBulk(apiData);
      setResult(result);
      setSuccess(true);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create risk profiles');
    } finally {
      setLoading(false);
    }
  };

  const generateSampleData = () => {
    const sampleProfiles: RiskProfileFormData[] = [
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
        riskFactors: ['high_value', 'fragile', 'technical_complexity'],
        mitigationStrategies: ['require_insurance', 'mandatory_inspection', 'user_training'],
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
        riskFactors: ['high_value', 'safety_critical', 'regulatory_compliance'],
        mitigationStrategies: ['require_insurance', 'mandatory_inspection', 'safety_protocols'],
        enforcementLevel: 'very_strict',
        autoEnforcement: true,
        gracePeriodHours: 12
      }
    ];
    setProfiles(sampleProfiles);
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
          riskFactors: ["high_value", "fragile", "technical_complexity"],
          mitigationStrategies: ["require_insurance", "mandatory_inspection", "user_training"],
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
  };

  if (!isOpen) return null;

  if (success && result) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Bulk Creation Results</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="flex">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Bulk Creation Completed</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>Total: {result.summary.total}</p>
                        <p>Successful: {result.summary.successful}</p>
                        <p>Failed: {result.summary.failed}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {result.failed.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Failed Profiles</h3>
                        <div className="mt-2 text-sm text-red-700">
                          {result.failed.map((failure: any, index: number) => (
                            <p key={index}>Profile {index + 1}: {failure.error}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                onClick={onClose}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Bulk Create Risk Profiles</h3>
              <div className="flex space-x-2">
                <button
                  onClick={downloadSampleJSON}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Sample JSON
                </button>
                <button
                  onClick={generateSampleData}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Load Sample
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
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

            <div className="space-y-6 max-h-96 overflow-y-auto">
              {profiles.map((profile, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-md font-medium text-gray-900">Profile {index + 1}</h4>
                    {profiles.length > 1 && (
                      <button
                        onClick={() => removeProfile(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Product ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product ID *
                      </label>
                      <input
                        type="text"
                        value={profile.productId}
                        onChange={(e) => updateProfile(index, 'productId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter product UUID"
                      />
                    </div>

                    {/* Category ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category ID *
                      </label>
                      <input
                        type="text"
                        value={profile.categoryId}
                        onChange={(e) => updateProfile(index, 'categoryId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Enter category UUID"
                      />
                    </div>

                    {/* Risk Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Risk Level *
                      </label>
                      <select
                        value={profile.riskLevel}
                        onChange={(e) => updateProfile(index, 'riskLevel', e.target.value as RiskLevel)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Enforcement Level *
                      </label>
                      <select
                        value={profile.enforcementLevel}
                        onChange={(e) => updateProfile(index, 'enforcementLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        {enforcementLevels.map(level => (
                          <option key={level.value} value={level.value}>
                            {level.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Mandatory Requirements */}
                    <div className="md:col-span-2">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Mandatory Requirements</h5>
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

                    {/* Min Coverage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Coverage ($)
                      </label>
                      <input
                        type="number"
                        value={profile.mandatoryRequirements.minCoverage}
                        onChange={(e) => updateMandatoryRequirements(index, 'minCoverage', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* Compliance Deadline */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Compliance Deadline (hours)
                      </label>
                      <input
                        type="number"
                        value={profile.mandatoryRequirements.complianceDeadlineHours}
                        onChange={(e) => updateMandatoryRequirements(index, 'complianceDeadlineHours', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* Grace Period */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grace Period (hours)
                      </label>
                      <input
                        type="number"
                        value={profile.gracePeriodHours}
                        onChange={(e) => updateProfile(index, 'gracePeriodHours', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    {/* Inspection Types */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Inspection Types
                      </label>
                      <div className="space-y-2">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Risk Factors
                      </label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {commonRiskFactors.map(factor => (
                          <div key={factor} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={profile.riskFactors.includes(factor)}
                              onChange={() => toggleArrayItem(index, 'riskFactors', factor)}
                              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 text-sm text-gray-700">{factor.replace('_', ' ')}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mitigation Strategies */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mitigation Strategies
                      </label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {commonMitigationStrategies.map(strategy => (
                          <div key={strategy} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={profile.mitigationStrategies.includes(strategy)}
                              onChange={() => toggleArrayItem(index, 'mitigationStrategies', strategy)}
                              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 text-sm text-gray-700">{strategy.replace('_', ' ')}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-between">
              <button
                onClick={addProfile}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Profile
              </button>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              {loading ? 'Creating...' : `Create ${profiles.length} Profile${profiles.length > 1 ? 's' : ''}`}
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkCreateRiskProfileModal;
