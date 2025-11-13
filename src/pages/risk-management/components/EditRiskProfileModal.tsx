import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { riskManagementService } from '../../../services/riskManagementService';
import { RiskProfile, RiskLevel, UpdateRiskProfileRequest } from '../../../types/riskManagement';
import { useToast } from '../../../contexts/ToastContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  profile: RiskProfile | null;
}

const EditRiskProfileModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, profile }) => {
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<UpdateRiskProfileRequest>({
    riskLevel: RiskLevel.LOW,
    mandatoryRequirements: {
      insurance: false,
      inspection: false,
      minCoverage: 0,
      inspectionTypes: [],
      complianceDeadlineHours: 24
    },
    riskFactors: [],
    mitigationStrategies: [],
    enforcementLevel: 'moderate',
    autoEnforcement: false,
    gracePeriodHours: 24
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        riskLevel: profile.riskLevel,
        mandatoryRequirements: {
          insurance: profile.mandatoryRequirements?.insurance || false,
          inspection: profile.mandatoryRequirements?.inspection || false,
          minCoverage: profile.mandatoryRequirements?.minCoverage || 0,
          inspectionTypes: profile.mandatoryRequirements?.inspectionTypes || [],
          complianceDeadlineHours: profile.mandatoryRequirements?.complianceDeadlineHours || 24
        },
        riskFactors: profile.riskFactors || [],
        mitigationStrategies: profile.mitigationStrategies || [],
        enforcementLevel: profile.enforcementLevel || 'moderate',
        autoEnforcement: profile.autoEnforcement ?? false,
        gracePeriodHours: profile.gracePeriodHours || 24
      });
      setErrors({});
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateRiskProfileRequest) => 
      riskManagementService.updateRiskProfile(profile!.id, data),
    onSuccess: () => {
      showToast('Risk profile updated successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['riskProfiles'] });
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      showToast(
        error.response?.data?.message || 'Failed to update risk profile',
        'error'
      );
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (formData.complianceDeadlineHours && formData.complianceDeadlineHours < 1) {
      newErrors.complianceDeadlineHours = 'Compliance deadline must be at least 1 hour';
    }
    if (formData.gracePeriodHours && formData.gracePeriodHours < 0) {
      newErrors.gracePeriodHours = 'Grace period cannot be negative';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateMutation.mutate(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => {
      const keys = field.split('.');
      if (keys.length === 1) {
        return { ...prev, [field]: value };
      } else if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...(prev[keys[0] as keyof typeof prev] as any),
            [keys[1]]: value
          }
        };
      }
      return prev;
    });
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">
                Edit Risk Profile
              </h3>
              <button
                onClick={onClose}
                disabled={updateMutation.isPending}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-slate-300 disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Risk Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Risk Level *
                </label>
                <select
                  value={formData.riskLevel}
                  onChange={(e) => handleChange('riskLevel', e.target.value as RiskLevel)}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                >
                  <option value={RiskLevel.LOW}>Low</option>
                  <option value={RiskLevel.MEDIUM}>Medium</option>
                  <option value={RiskLevel.HIGH}>High</option>
                  <option value={RiskLevel.CRITICAL}>Critical</option>
                </select>
              </div>

              {/* Mandatory Requirements */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  Mandatory Requirements
                </h4>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="mandatoryInsurance"
                    checked={formData.mandatoryRequirements?.insurance || false}
                    onChange={(e) => handleChange('mandatoryRequirements.insurance', e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="mandatoryInsurance" className="text-sm text-gray-700 dark:text-slate-300">
                    Mandatory Insurance
                  </label>
                </div>

                {formData.mandatoryRequirements?.insurance && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Minimum Coverage ($)
                    </label>
                    <input
                      type="number"
                      value={formData.mandatoryRequirements?.minCoverage || 0}
                      onChange={(e) => handleChange('mandatoryRequirements.minCoverage', parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="mandatoryInspection"
                    checked={formData.mandatoryRequirements?.inspection || false}
                    onChange={(e) => handleChange('mandatoryRequirements.inspection', e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="mandatoryInspection" className="text-sm text-gray-700 dark:text-slate-300">
                    Mandatory Inspection
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Compliance Deadline (hours)
                  </label>
                  <input
                    type="number"
                    value={formData.mandatoryRequirements?.complianceDeadlineHours || 24}
                    onChange={(e) => handleChange('mandatoryRequirements.complianceDeadlineHours', parseInt(e.target.value) || 24)}
                    className={`w-full border rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 ${
                      errors.complianceDeadlineHours 
                        ? 'border-red-500' 
                        : 'border-gray-300 dark:border-slate-600'
                    }`}
                    min="1"
                  />
                  {errors.complianceDeadlineHours && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.complianceDeadlineHours}
                    </p>
                  )}
                </div>
              </div>

              {/* Enforcement Settings */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  Enforcement Settings
                </h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Enforcement Level
                  </label>
                  <select
                    value={formData.enforcementLevel || 'moderate'}
                    onChange={(e) => handleChange('enforcementLevel', e.target.value)}
                    className="w-full border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  >
                    <option value="lenient">Lenient</option>
                    <option value="moderate">Moderate</option>
                    <option value="strict">Strict</option>
                    <option value="very_strict">Very Strict</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoEnforcement"
                    checked={formData.autoEnforcement ?? false}
                    onChange={(e) => handleChange('autoEnforcement', e.target.checked)}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="autoEnforcement" className="text-sm text-gray-700 dark:text-slate-300">
                    Auto Enforcement
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Grace Period (hours)
                  </label>
                  <input
                    type="number"
                    value={formData.gracePeriodHours || 24}
                    onChange={(e) => handleChange('gracePeriodHours', parseInt(e.target.value) || 24)}
                    className={`w-full border rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 ${
                      errors.gracePeriodHours 
                        ? 'border-red-500' 
                        : 'border-gray-300 dark:border-slate-600'
                    }`}
                    min="0"
                  />
                  {errors.gracePeriodHours && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.gracePeriodHours}
                    </p>
                  )}
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Risk Factors (comma-separated)
                </label>
                <textarea
                  value={Array.isArray(formData.riskFactors) 
                    ? formData.riskFactors.join(', ') 
                    : ''}
                  onChange={(e) => {
                    const factors = e.target.value
                      .split(',')
                      .map(f => f.trim())
                      .filter(f => f.length > 0);
                    handleChange('riskFactors', factors);
                  }}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  placeholder="Enter risk factors separated by commas"
                />
              </div>

              {/* Mitigation Strategies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Mitigation Strategies (comma-separated)
                </label>
                <textarea
                  value={Array.isArray(formData.mitigationStrategies) 
                    ? formData.mitigationStrategies.join(', ') 
                    : ''}
                  onChange={(e) => {
                    const strategies = e.target.value
                      .split(',')
                      .map(s => s.trim())
                      .filter(s => s.length > 0);
                    handleChange('mitigationStrategies', strategies);
                  }}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  placeholder="Enter mitigation strategies separated by commas"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-50 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center space-x-2"
              >
                {updateMutation.isPending ? (
                  <>
                    <AlertCircle className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditRiskProfileModal;

