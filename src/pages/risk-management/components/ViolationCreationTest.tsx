import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { riskManagementService } from '../../../services/riskManagementService';
import type { CreateViolationRequest } from '../../../types/riskManagement';

const ViolationCreationTest: React.FC = () => {
  const [testData, setTestData] = useState<CreateViolationRequest>({
    bookingId: '0183e487-a0c9-4943-8a07-cd19b35dea3a',
    productId: '02f1e344-c02b-426b-9ab3-c7483d0d6b87',
    renterId: '6cc890f2-7169-44e1-b0f1-dc13d797d4e0',
    violationType: 'missing_insurance',
    severity: 'low',
    description: 'Test violation'
  });

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const queryClient = useQueryClient();

  const createViolationMutation = useMutation({
    mutationFn: riskManagementService.createViolation,
    onSuccess: (data) => {
      setResult(data);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['violations'] });
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to create violation');
      setResult(null);
    }
  });

  const handleTestCreation = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      await createViolationMutation.mutateAsync(testData);
    } catch (error) {
      console.error('Test creation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateViolationRequest, value: any) => {
    setTestData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center mb-6">
        <AlertTriangle className="h-6 w-6 text-teal-600 mr-3" />
        <h3 className="text-lg font-medium text-gray-900">Violation Creation Test</h3>
      </div>

      <div className="space-y-4">
        {/* Test Data Input */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Booking ID
            </label>
            <input
              type="text"
              value={testData.bookingId}
              onChange={(e) => handleInputChange('bookingId', e.target.value)}
              placeholder="Valid UUID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product ID
            </label>
            <input
              type="text"
              value={testData.productId}
              onChange={(e) => handleInputChange('productId', e.target.value)}
              placeholder="Valid UUID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Renter ID
            </label>
            <input
              type="text"
              value={testData.renterId}
              onChange={(e) => handleInputChange('renterId', e.target.value)}
              placeholder="Valid UUID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Violation Type
            </label>
            <select
              value={testData.violationType}
              onChange={(e) => handleInputChange('violationType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="missing_insurance">Missing Insurance</option>
              <option value="missing_inspection">Missing Inspection</option>
              <option value="inadequate_coverage">Inadequate Coverage</option>
              <option value="expired_compliance">Expired Compliance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severity
            </label>
            <select
              value={testData.severity}
              onChange={(e) => handleInputChange('severity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={testData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={2}
              placeholder="Test violation"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Test Button */}
        <button
          onClick={handleTestCreation}
          disabled={isLoading}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Testing...
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4" />
              Test Violation Creation
            </>
          )}
        </button>

        {/* Results */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Violation Created Successfully!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <X className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error Creating Violation
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViolationCreationTest;
