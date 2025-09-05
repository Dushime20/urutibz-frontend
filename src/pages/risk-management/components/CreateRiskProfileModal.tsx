import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { riskManagementService } from '../../../services/riskManagementService';
import { CreateRiskProfileRequest, RiskLevel } from '../../../types/riskManagement';
import { useToast } from '../../../contexts/ToastContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateRiskProfileModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState<CreateRiskProfileRequest>({
    productId: '',
    categoryId: '',
    riskLevel: RiskLevel.LOW,
    mandatoryRequirements: [''],
    optionalRequirements: [''],
    riskFactors: [{
      name: '',
      description: '',
      weight: 1,
      impact: 1,
      probability: 1,
      mitigationStrategies: ['']
    }],
    complianceRules: [{
      name: '',
      description: '',
      requirement: '',
      validationCriteria: [''],
      enforcementAction: 'warning' as any,
      isMandatory: true
    }]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProfileMutation = useMutation({
    mutationFn: (data: CreateRiskProfileRequest) => riskManagementService.createRiskProfile(data),
    onSuccess: () => {
      showToast('Risk profile created successfully', 'success');
      onSuccess();
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || 'Failed to create risk profile', 'error');
    }
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.productId.trim()) {
      newErrors.productId = 'Product ID is required';
    }

    if (!formData.categoryId.trim()) {
      newErrors.categoryId = 'Category ID is required';
    }

    if (formData.mandatoryRequirements.some(req => !req.trim())) {
      newErrors.mandatoryRequirements = 'All mandatory requirements must be filled';
    }

    if (formData.riskFactors.some(factor => !factor.name.trim() || !factor.description.trim())) {
      newErrors.riskFactors = 'All risk factors must have name and description';
    }

    if (formData.complianceRules.some(rule => !rule.name.trim() || !rule.description.trim())) {
      newErrors.complianceRules = 'All compliance rules must have name and description';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    // Clean up empty strings from arrays
    const cleanedData = {
      ...formData,
      mandatoryRequirements: formData.mandatoryRequirements.filter(req => req.trim()),
      optionalRequirements: formData.optionalRequirements?.filter(req => req.trim()) || [],
      riskFactors: formData.riskFactors.map(factor => ({
        ...factor,
        mitigationStrategies: factor.mitigationStrategies.filter(strategy => strategy.trim())
      })),
      complianceRules: formData.complianceRules.map(rule => ({
        ...rule,
        validationCriteria: rule.validationCriteria.filter(criteria => criteria.trim())
      }))
    };

    createProfileMutation.mutate(cleanedData);
    setIsSubmitting(false);
  };

  const addMandatoryRequirement = () => {
    setFormData(prev => ({
      ...prev,
      mandatoryRequirements: [...prev.mandatoryRequirements, '']
    }));
  };

  const removeMandatoryRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mandatoryRequirements: prev.mandatoryRequirements.filter((_, i) => i !== index)
    }));
  };

  const updateMandatoryRequirement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      mandatoryRequirements: prev.mandatoryRequirements.map((req, i) => i === index ? value : req)
    }));
  };

  const addOptionalRequirement = () => {
    setFormData(prev => ({
      ...prev,
      optionalRequirements: [...(prev.optionalRequirements || []), '']
    }));
  };

  const removeOptionalRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      optionalRequirements: (prev.optionalRequirements || []).filter((_, i) => i !== index)
    }));
  };

  const updateOptionalRequirement = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      optionalRequirements: (prev.optionalRequirements || []).map((req, i) => i === index ? value : req)
    }));
  };

  const addRiskFactor = () => {
    setFormData(prev => ({
      ...prev,
      riskFactors: [...prev.riskFactors, {
        name: '',
        description: '',
        weight: 1,
        impact: 1,
        probability: 1,
        mitigationStrategies: ['']
      }]
    }));
  };

  const removeRiskFactor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      riskFactors: prev.riskFactors.filter((_, i) => i !== index)
    }));
  };

  const updateRiskFactor = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      riskFactors: prev.riskFactors.map((factor, i) => 
        i === index ? { ...factor, [field]: value } : factor
      )
    }));
  };

  const addMitigationStrategy = (factorIndex: number) => {
    setFormData(prev => ({
      ...prev,
      riskFactors: prev.riskFactors.map((factor, i) => 
        i === factorIndex 
          ? { ...factor, mitigationStrategies: [...factor.mitigationStrategies, ''] }
          : factor
      )
    }));
  };

  const removeMitigationStrategy = (factorIndex: number, strategyIndex: number) => {
    setFormData(prev => ({
      ...prev,
      riskFactors: prev.riskFactors.map((factor, i) => 
        i === factorIndex 
          ? { 
              ...factor, 
              mitigationStrategies: factor.mitigationStrategies.filter((_, j) => j !== strategyIndex)
            }
          : factor
      )
    }));
  };

  const updateMitigationStrategy = (factorIndex: number, strategyIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      riskFactors: prev.riskFactors.map((factor, i) => 
        i === factorIndex 
          ? { 
              ...factor, 
              mitigationStrategies: factor.mitigationStrategies.map((strategy, j) => 
                j === strategyIndex ? value : strategy
              )
            }
          : factor
      )
    }));
  };

  const addComplianceRule = () => {
    setFormData(prev => ({
      ...prev,
      complianceRules: [...prev.complianceRules, {
        name: '',
        description: '',
        requirement: '',
        validationCriteria: [''],
        enforcementAction: 'warning' as any,
        isMandatory: true
      }]
    }));
  };

  const removeComplianceRule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      complianceRules: prev.complianceRules.filter((_, i) => i !== index)
    }));
  };

  const updateComplianceRule = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      complianceRules: prev.complianceRules.map((rule, i) => 
        i === index ? { ...rule, [field]: value } : rule
      )
    }));
  };

  const addValidationCriteria = (ruleIndex: number) => {
    setFormData(prev => ({
      ...prev,
      complianceRules: prev.complianceRules.map((rule, i) => 
        i === ruleIndex 
          ? { ...rule, validationCriteria: [...rule.validationCriteria, ''] }
          : rule
      )
    }));
  };

  const removeValidationCriteria = (ruleIndex: number, criteriaIndex: number) => {
    setFormData(prev => ({
      ...prev,
      complianceRules: prev.complianceRules.map((rule, i) => 
        i === ruleIndex 
          ? { 
              ...rule, 
              validationCriteria: rule.validationCriteria.filter((_, j) => j !== criteriaIndex)
            }
          : rule
      )
    }));
  };

  const updateValidationCriteria = (ruleIndex: number, criteriaIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      complianceRules: prev.complianceRules.map((rule, i) => 
        i === ruleIndex 
          ? { 
              ...rule, 
              validationCriteria: rule.validationCriteria.map((criteria, j) => 
                j === criteriaIndex ? value : criteria
              )
            }
          : rule
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create Risk Profile</h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product ID *
                    </label>
                    <input
                      type="text"
                      value={formData.productId}
                      onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                        errors.productId ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter product ID"
                    />
                    {errors.productId && (
                      <p className="mt-1 text-sm text-red-600">{errors.productId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category ID *
                    </label>
                    <input
                      type="text"
                      value={formData.categoryId}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                        errors.categoryId ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter category ID"
                    />
                    {errors.categoryId && (
                      <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Risk Level *
                  </label>
                  <select
                    value={formData.riskLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, riskLevel: e.target.value as RiskLevel }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value={RiskLevel.LOW}>Low Risk</option>
                    <option value={RiskLevel.MEDIUM}>Medium Risk</option>
                    <option value={RiskLevel.HIGH}>High Risk</option>
                    <option value={RiskLevel.CRITICAL}>Critical Risk</option>
                  </select>
                </div>

                {/* Mandatory Requirements */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Mandatory Requirements *
                    </label>
                    <button
                      type="button"
                      onClick={addMandatoryRequirement}
                      className="text-teal-600 hover:text-teal-700 flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                  {formData.mandatoryRequirements.map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={requirement}
                        onChange={(e) => updateMandatoryRequirement(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Enter mandatory requirement"
                      />
                      <button
                        type="button"
                        onClick={() => removeMandatoryRequirement(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {errors.mandatoryRequirements && (
                    <p className="mt-1 text-sm text-red-600">{errors.mandatoryRequirements}</p>
                  )}
                </div>

                {/* Optional Requirements */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Optional Requirements
                    </label>
                    <button
                      type="button"
                      onClick={addOptionalRequirement}
                      className="text-teal-600 hover:text-teal-700 flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                  {(formData.optionalRequirements || []).map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={requirement}
                        onChange={(e) => updateOptionalRequirement(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Enter optional requirement"
                      />
                      <button
                        type="button"
                        onClick={() => removeOptionalRequirement(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Risk Factors */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Risk Factors *
                    </label>
                    <button
                      type="button"
                      onClick={addRiskFactor}
                      className="text-teal-600 hover:text-teal-700 flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Factor</span>
                    </button>
                  </div>
                  {formData.riskFactors.map((factor, factorIndex) => (
                    <div key={factorIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Risk Factor {factorIndex + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeRiskFactor(factorIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name *
                          </label>
                          <input
                            type="text"
                            value={factor.name}
                            onChange={(e) => updateRiskFactor(factorIndex, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="Risk factor name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Weight
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={factor.weight}
                            onChange={(e) => updateRiskFactor(factorIndex, 'weight', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description *
                        </label>
                        <textarea
                          value={factor.description}
                          onChange={(e) => updateRiskFactor(factorIndex, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          rows={3}
                          placeholder="Describe the risk factor"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Impact (1-10)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={factor.impact}
                            onChange={(e) => updateRiskFactor(factorIndex, 'impact', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Probability (1-10)
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={factor.probability}
                            onChange={(e) => updateRiskFactor(factorIndex, 'probability', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Mitigation Strategies
                          </label>
                          <button
                            type="button"
                            onClick={() => addMitigationStrategy(factorIndex)}
                            className="text-teal-600 hover:text-teal-700 flex items-center space-x-1"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add</span>
                          </button>
                        </div>
                        {factor.mitigationStrategies.map((strategy, strategyIndex) => (
                          <div key={strategyIndex} className="flex items-center space-x-2 mb-2">
                            <input
                              type="text"
                              value={strategy}
                              onChange={(e) => updateMitigationStrategy(factorIndex, strategyIndex, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              placeholder="Enter mitigation strategy"
                            />
                            <button
                              type="button"
                              onClick={() => removeMitigationStrategy(factorIndex, strategyIndex)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {errors.riskFactors && (
                    <p className="mt-1 text-sm text-red-600">{errors.riskFactors}</p>
                  )}
                </div>

                {/* Compliance Rules */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Compliance Rules *
                    </label>
                    <button
                      type="button"
                      onClick={addComplianceRule}
                      className="text-teal-600 hover:text-teal-700 flex items-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Rule</span>
                    </button>
                  </div>
                  {formData.complianceRules.map((rule, ruleIndex) => (
                    <div key={ruleIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Compliance Rule {ruleIndex + 1}</h4>
                        <button
                          type="button"
                          onClick={() => removeComplianceRule(ruleIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name *
                          </label>
                          <input
                            type="text"
                            value={rule.name}
                            onChange={(e) => updateComplianceRule(ruleIndex, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                            placeholder="Rule name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Enforcement Action
                          </label>
                          <select
                            value={rule.enforcementAction}
                            onChange={(e) => updateComplianceRule(ruleIndex, 'enforcementAction', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          >
                            <option value="warning">Warning</option>
                            <option value="penalty">Penalty</option>
                            <option value="suspension">Suspension</option>
                            <option value="termination">Termination</option>
                            <option value="training_required">Training Required</option>
                            <option value="audit_required">Audit Required</option>
                          </select>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description *
                        </label>
                        <textarea
                          value={rule.description}
                          onChange={(e) => updateComplianceRule(ruleIndex, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          rows={3}
                          placeholder="Describe the compliance rule"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Requirement
                        </label>
                        <input
                          type="text"
                          value={rule.requirement}
                          onChange={(e) => updateComplianceRule(ruleIndex, 'requirement', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          placeholder="Enter requirement"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Validation Criteria
                          </label>
                          <button
                            type="button"
                            onClick={() => addValidationCriteria(ruleIndex)}
                            className="text-teal-600 hover:text-teal-700 flex items-center space-x-1"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add</span>
                          </button>
                        </div>
                        {rule.validationCriteria.map((criteria, criteriaIndex) => (
                          <div key={criteriaIndex} className="flex items-center space-x-2 mb-2">
                            <input
                              type="text"
                              value={criteria}
                              onChange={(e) => updateValidationCriteria(ruleIndex, criteriaIndex, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              placeholder="Enter validation criteria"
                            />
                            <button
                              type="button"
                              onClick={() => removeValidationCriteria(ruleIndex, criteriaIndex)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={rule.isMandatory}
                            onChange={(e) => updateComplianceRule(ruleIndex, 'isMandatory', e.target.checked)}
                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Mandatory requirement</span>
                        </label>
                      </div>
                    </div>
                  ))}
                  {errors.complianceRules && (
                    <p className="mt-1 text-sm text-red-600">{errors.complianceRules}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isSubmitting || createProfileMutation.isPending}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || createProfileMutation.isPending ? 'Creating...' : 'Create Profile'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRiskProfileModal;
