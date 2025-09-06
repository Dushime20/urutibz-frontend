import React, { useState } from 'react';
import { riskManagementService } from '../../../services/riskManagementService';
import { CreateRiskProfileRequest } from '../../../types/riskManagement';

const JsonValidationTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testCases = [
    {
      name: 'Empty Arrays Test',
      data: {
        profiles: [{
          productId: '403eb546-56bf-4b2e-987d-6bb05a09cadd',
          categoryId: 'photography-equipment',
          riskLevel: 'low',
          mandatoryRequirements: {
            insurance: true,
            inspection: true,
            minCoverage: 10000,
            inspectionTypes: [], // Empty array
            complianceDeadlineHours: 24
          },
          riskFactors: [], // Empty array
          mitigationStrategies: [], // Empty array
          enforcementLevel: 'moderate',
          autoEnforcement: true,
          gracePeriodHours: 48
        }]
      }
    },
    {
      name: 'Mixed Arrays Test',
      data: {
        profiles: [{
          productId: '550e8400-e29b-41d4-a716-446655440000',
          categoryId: 'vehicles',
          riskLevel: 'high',
          mandatoryRequirements: {
            insurance: true,
            inspection: true,
            minCoverage: 25000,
            inspectionTypes: ['pre_rental', 'post_rental'], // Non-empty array
            complianceDeadlineHours: 12
          },
          riskFactors: ['High value item'], // Non-empty array
          mitigationStrategies: [], // Empty array
          enforcementLevel: 'strict',
          autoEnforcement: true,
          gracePeriodHours: 24
        }]
      }
    },
    {
      name: 'All Non-Empty Arrays Test',
      data: {
        profiles: [{
          productId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
          categoryId: 'electronics',
          riskLevel: 'medium',
          mandatoryRequirements: {
            insurance: false,
            inspection: true,
            minCoverage: 5000,
            inspectionTypes: ['pre_rental'], // Non-empty array
            complianceDeadlineHours: 48
          },
          riskFactors: ['Technical complexity', 'Weather sensitive'], // Non-empty array
          mitigationStrategies: ['User training', 'Safety protocols'], // Non-empty array
          enforcementLevel: 'lenient',
          autoEnforcement: false,
          gracePeriodHours: 72
        }]
      }
    }
  ];

  const runTest = async (testCase: typeof testCases[0]) => {
    setLoading(true);
    try {
      console.log(`🧪 Running test: ${testCase.name}`);
      console.log('📤 Test data:', testCase.data);
      
      const result = await riskManagementService.createRiskProfilesBulk(testCase.data);
      
      setTestResults(prev => [...prev, {
        testName: testCase.name,
        success: result.success,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      }]);
      
      console.log(`✅ Test ${testCase.name} completed:`, result);
    } catch (error: any) {
      setTestResults(prev => [...prev, {
        testName: testCase.name,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }]);
      
      console.error(`❌ Test ${testCase.name} failed:`, error);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    for (const testCase of testCases) {
      await runTest(testCase);
      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">JSON Validation Test Suite</h2>
        <div className="flex space-x-2">
          <button
            onClick={runAllTests}
            disabled={loading}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? 'Running Tests...' : 'Run All Tests'}
          </button>
          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Clear Results
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Test Cases</h3>
        <div className="space-y-3">
          {testCases.map((testCase, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div>
                <h4 className="font-medium text-gray-900">{testCase.name}</h4>
                <p className="text-sm text-gray-600">
                  Tests various array combinations including empty arrays
                </p>
              </div>
              <button
                onClick={() => runTest(testCase)}
                disabled={loading}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Run Test
              </button>
            </div>
          ))}
        </div>
      </div>

      {testResults.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Test Results</h3>
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className={`p-4 rounded-md border ${
                result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{result.testName}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    result.success 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>Timestamp:</strong> {result.timestamp}</p>
                  {result.success ? (
                    <div>
                      <p><strong>Message:</strong> {result.message}</p>
                      <p><strong>Successful:</strong> {result.data?.successful}</p>
                      <p><strong>Failed:</strong> {result.data?.failed}</p>
                    </div>
                  ) : (
                    <p><strong>Error:</strong> {result.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h4 className="font-medium text-blue-900 mb-2">Debug Information</h4>
        <p className="text-sm text-blue-800">
          Check the browser console for detailed logging of the API requests and responses.
          This will help identify any JSON validation issues on the backend.
        </p>
      </div>
    </div>
  );
};

export default JsonValidationTest;
