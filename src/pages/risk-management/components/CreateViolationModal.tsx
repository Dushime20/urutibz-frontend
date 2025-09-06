import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, AlertTriangle, User, Calendar } from 'lucide-react';
import { riskManagementService } from '../../../services/riskManagementService';
import type { CreateViolationRequest } from '../../../types/riskManagement';

interface CreateViolationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateViolationModal: React.FC<CreateViolationModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<CreateViolationRequest>({
    bookingId: '',
    productId: '',
    renterId: '',
    violationType: 'missing_insurance',
    severity: 'low',
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();

  const createViolationMutation = useMutation({
    mutationFn: riskManagementService.createViolation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['violations'] });
      onClose();
      setFormData({
        bookingId: '',
        productId: '',
        renterId: '',
        violationType: 'missing_insurance',
        severity: 'low',
        description: ''
      });
      setErrors({});
    },
    onError: (error: any) => {
      console.error('Error creating violation:', error);
      setErrors({ general: 'Failed to create violation. Please try again.' });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.bookingId.trim()) {
      newErrors.bookingId = 'Booking ID is required';
    }
    if (!formData.productId.trim()) {
      newErrors.productId = 'Product ID is required';
    }
    if (!formData.renterId.trim()) {
      newErrors.renterId = 'Renter ID is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await createViolationMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error creating violation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateViolationRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const violationTypes = [
    { value: 'missing_insurance', label: 'Missing Insurance', icon: '🛡️' },
    { value: 'missing_inspection', label: 'Missing Inspection', icon: '🔍' },
    { value: 'inadequate_coverage', label: 'Inadequate Coverage', icon: '⚠️' },
    { value: 'expired_compliance', label: 'Expired Compliance', icon: '📄' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Record New Violation</h3>
                <p className="text-sm text-gray-600">Create a new policy violation record</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{errors.general}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Required Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking ID *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.bookingId}
                    onChange={(e) => handleInputChange('bookingId', e.target.value)}
                    placeholder="Valid UUID"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                      errors.bookingId ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.bookingId && (
                  <p className="mt-1 text-sm text-red-600">{errors.bookingId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product ID *
                </label>
                <input
                  type="text"
                  value={formData.productId}
                  onChange={(e) => handleInputChange('productId', e.target.value)}
                  placeholder="Valid UUID"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                    errors.productId ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.productId && (
                  <p className="mt-1 text-sm text-red-600">{errors.productId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Renter ID *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.renterId}
                    onChange={(e) => handleInputChange('renterId', e.target.value)}
                    placeholder="Valid UUID"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                      errors.renterId ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.renterId && (
                  <p className="mt-1 text-sm text-red-600">{errors.renterId}</p>
                )}
              </div>
            </div>

            {/* Violation Type and Severity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Violation Type *
                </label>
                <select
                  value={formData.violationType}
                  onChange={(e) => handleInputChange('violationType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  {violationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity *
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => handleInputChange('severity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  {severityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                placeholder="Describe the violation..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    Create Violation
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

export default CreateViolationModal;
