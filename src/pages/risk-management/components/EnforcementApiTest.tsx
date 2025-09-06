import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { riskManagementService } from '../../../services/riskManagementService';
import { RiskEnforcementRequest } from '../../../types/riskManagement';

const EnforcementApiTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testCases = [
    {
      name: 'Valid Booking ID Test',
      data: { bookingId: '550e8400-e29b-41d4-a716-446655440000' },
      description: 'Tests enforcement with a valid booking UUID'
    },
    {
      name: 'Vehicle Booking Test',
      data: { bookingId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8' },
      description: 'Tests enforcement for vehicle rental booking'
    },
    {
      name: 'Electronics Booking Test',
      data: { bookingId: '6ba7b811-9dad-11d1-80b4-00c04fd430c9' },
      description: 'Tests enforcement for electronics equipment booking'
    },
    {
      name: 'Invalid UUID Test',
      data: { bookingId: 'invalid-uuid' },
      description: 'Tests error handling for invalid UUID format'
    },
    {
      name: 'Non-existent Booking Test',
      data: { bookingId: '00000000-0000-0000-0000-000000000000' },
      description: 'Tests error handling for non-existent booking'
    }
  ];

  const runTest = async (testCase: typeof testCases[0]) => {
    setLoading(true);
    try {
      console.log(`🧪 Running test: ${testCase.name}`);
      console.log('📤 Test data:', testCase.data);
      
      const result = await riskManagementService.triggerRiskEnforcement(testCase.data);
      
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
        statusCode: error.response?.status,
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

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'non_compliant':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Risk Enforcement API Test Suite</h2>
        <div className="flex space-x-2">
          <button
            onClick={runAllTests}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
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
                <p className="text-sm text-gray-600">{testCase.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Booking ID: {testCase.data.bookingId}
                </p>
              </div>
              <button
                onClick={() => runTest(testCase)}
                disabled={loading}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
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
              <div key={index} className={`p-4 rounded-md border ${getStatusColor(result.success)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(result.success)}
                    <h4 className="font-medium text-gray-900">{result.testName}</h4>
                  </div>
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
                    <div className="mt-2">
                      <p><strong>Message:</strong> {result.message}</p>
                      <div className="mt-2 p-3 bg-white rounded border">
                        <h5 className="font-medium text-gray-900 mb-2">Compliance Data:</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="font-medium">Booking ID:</span> {result.data.compliance.bookingId}
                          </div>
                          <div>
                            <span className="font-medium">Product ID:</span> {result.data.compliance.productId}
                          </div>
                          <div>
                            <span className="font-medium">Renter ID:</span> {result.data.compliance.renterId}
                          </div>
                          <div>
                            <span className="font-medium">Compliance Score:</span> {result.data.compliance.complianceScore}%
                          </div>
                          <div>
                            <span className="font-medium">Violations:</span> {result.data.violationsRecorded}
                          </div>
                          <div>
                            <span className="font-medium">Status:</span>
                            <span className={`ml-1 px-2 py-0.5 rounded text-xs ${getComplianceStatusColor(result.data.compliance.status)}`}>
                              {result.data.compliance.status}
                            </span>
                          </div>
                        </div>
                        {result.data.compliance.missingRequirements.length > 0 && (
                          <div className="mt-2">
                            <span className="font-medium">Missing Requirements:</span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {result.data.compliance.missingRequirements.map((req: string, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs">
                                  {req}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p><strong>Error:</strong> {result.error}</p>
                      {result.statusCode && (
                        <p><strong>Status Code:</strong> {result.statusCode}</p>
                      )}
                    </div>
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
          This will help identify any issues with the risk enforcement API.
        </p>
      </div>
    </div>
  );
};

export default EnforcementApiTest;
