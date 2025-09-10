import React, { useState, useEffect } from 'react';
import { X, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { RiskProfile, RiskLevel } from '../../../types/riskManagement';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: RiskProfile;
}

const RiskProfileDetailsModal: React.FC<Props> = ({ isOpen, onClose, profile }) => {
  const [productName, setProductName] = useState<string>('');
  const [categoryName, setCategoryName] = useState<string>('');

  // Fetch product details
  const { data: productData } = useQuery({
    queryKey: ['product', profile.productId],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://localhost:3000/api/v1/products/${profile.productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!profile.productId && isOpen
  });

  // Fetch category details
  const { data: categoryData } = useQuery({
    queryKey: ['category', profile.categoryId],
    queryFn: async () => {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://localhost:3000/api/v1/categories/${profile.categoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!profile.categoryId && isOpen
  });

  // Update names when data is fetched
  useEffect(() => {
    if (productData?.data?.title) {
      setProductName(productData.data.title);
    }
  }, [productData]);

  useEffect(() => {
    if (categoryData?.name) {
      setCategoryName(categoryData.name);
    }
  }, [categoryData]);

  if (!isOpen) return null;

  const getRiskLevelColor = (level: RiskLevel) => {
    switch (level) {
      case RiskLevel.LOW:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case RiskLevel.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case RiskLevel.HIGH:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case RiskLevel.CRITICAL:
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-gray-200 dark:border-slate-700">
          <div className="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="text-teal-600 dark:text-teal-400">
                  <Shield className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Risk Profile Details</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {productName || `Product ${profile.productId}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-slate-600">
                <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Product</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-slate-100">
                      {productName || `Product ${profile.productId}`}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-500">ID: {profile.productId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Category</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-slate-100">
                      {categoryName || `Category ${profile.categoryId}`}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-500">ID: {profile.categoryId}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Risk Level</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(profile.riskLevel)}`}>
                      {profile.riskLevel.charAt(0).toUpperCase() + profile.riskLevel.slice(1)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Status</label>
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      profile.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {profile.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Created</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-slate-100">{formatDate(profile.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">Last Updated</label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-slate-100">{formatDate(profile.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Mandatory Requirements */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Mandatory Requirements</h4>
                {profile.mandatoryRequirements.length > 0 ? (
                  <ul className="space-y-2">
                    {profile.mandatoryRequirements.map((requirement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-900 dark:text-slate-100">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-slate-400">No mandatory requirements defined</p>
                )}
              </div>

              {/* Optional Requirements */}
              {profile.optionalRequirements && profile.optionalRequirements.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Optional Requirements</h4>
                  <ul className="space-y-2">
                    {profile.optionalRequirements.map((requirement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-5 h-5 border border-gray-300 dark:border-slate-600 rounded mt-0.5 flex-shrink-0 bg-white dark:bg-slate-800"></div>
                        <span className="text-sm text-gray-900 dark:text-slate-100">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Risk Factors */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Risk Factors</h4>
                {profile.riskFactors.length > 0 ? (
                  <div className="space-y-4">
                    {profile.riskFactors.map((factor, index) => (
                      <div key={index} className="border border-gray-200 dark:border-slate-600 rounded-lg p-4 bg-white dark:bg-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900 dark:text-slate-100">{factor.name}</h5>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 dark:text-slate-400">Weight: {factor.weight}</span>
                            <span className="text-xs text-gray-500 dark:text-slate-400">Impact: {factor.impact}</span>
                            <span className="text-xs text-gray-500 dark:text-slate-400">Probability: {factor.probability}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">{factor.description}</p>
                        {factor.mitigationStrategies.length > 0 && (
                          <div>
                            <h6 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Mitigation Strategies:</h6>
                            <ul className="space-y-1">
                              {factor.mitigationStrategies.map((strategy, strategyIndex) => (
                                <li key={strategyIndex} className="text-sm text-gray-600 dark:text-slate-400 flex items-start space-x-2">
                                  <span className="text-teal-500 dark:text-teal-400 mt-1">•</span>
                                  <span>{strategy}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-slate-400">No risk factors defined</p>
                )}
              </div>

              {/* Compliance Rules */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Compliance Rules</h4>
                {profile.complianceRules.length > 0 ? (
                  <div className="space-y-4">
                    {profile.complianceRules.map((rule, index) => (
                      <div key={index} className="border border-gray-200 dark:border-slate-600 rounded-lg p-4 bg-white dark:bg-slate-700">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900 dark:text-slate-100">{rule.name}</h5>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              rule.isMandatory 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                              {rule.isMandatory ? 'Mandatory' : 'Optional'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-slate-400 capitalize">
                              {rule.enforcementAction.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">{rule.description}</p>
                        {rule.requirement && (
                          <div className="mb-3">
                            <h6 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Requirement:</h6>
                            <p className="text-sm text-gray-600 dark:text-slate-400">{rule.requirement}</p>
                          </div>
                        )}
                        {rule.validationCriteria.length > 0 && (
                          <div>
                            <h6 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Validation Criteria:</h6>
                            <ul className="space-y-1">
                              {rule.validationCriteria.map((criteria, criteriaIndex) => (
                                <li key={criteriaIndex} className="text-sm text-gray-600 dark:text-slate-400 flex items-start space-x-2">
                                  <span className="text-teal-500 dark:text-teal-400 mt-1">•</span>
                                  <span>{criteria}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-slate-400">No compliance rules defined</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-slate-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200 dark:border-slate-600">
            <button
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 dark:bg-teal-500 text-base font-medium text-white hover:bg-teal-700 dark:hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-teal-400 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskProfileDetailsModal;
