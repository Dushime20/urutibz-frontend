import React, { useState } from 'react';
import { 
  Shield, 
  Upload, 
  Download, 
  RefreshCw,
  XCircle,
  CheckCircle,
  AlertTriangle,
  FileText,
  Users,
  Package
} from 'lucide-react';
import { useBulkAssessment } from '../hooks/useBulkAssessment';
import { useToast } from '../../../contexts/ToastContext';

interface BulkAssessmentFormProps {
  onBulkAssessmentComplete?: (results: any) => void;
  className?: string;
}

interface AssessmentItem {
  productId: string;
  renterId: string;
}

const BulkAssessmentForm: React.FC<BulkAssessmentFormProps> = ({ 
  onBulkAssessmentComplete, 
  className = '' 
}) => {
  const { showToast } = useToast();
  const { results, loading, error, assessBulk, clearResults } = useBulkAssessment();
  const [assessments, setAssessments] = useState<AssessmentItem[]>([
    { productId: '', renterId: '' }
  ]);

  const addAssessment = () => {
    setAssessments(prev => [...prev, { productId: '', renterId: '' }]);
  };

  const removeAssessment = (index: number) => {
    if (assessments.length > 1) {
      setAssessments(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateAssessment = (index: number, field: keyof AssessmentItem, value: string) => {
    setAssessments(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validAssessments = assessments.filter(
      item => item.productId.trim() && item.renterId.trim()
    );

    if (validAssessments.length === 0) {
      showToast('Please enter at least one valid assessment', 'error');
      return;
    }

    try {
      await assessBulk({ assessments: validAssessments });
      
      if (onBulkAssessmentComplete && results) {
        onBulkAssessmentComplete(results);
      }
    } catch (err) {
      console.error('Bulk assessment failed:', err);
    }
  };

  const handleClear = () => {
    clearResults();
    setAssessments([{ productId: '', renterId: '' }]);
  };

  const downloadTemplate = () => {
    const template = [
      { productId: 'uuid-string-1', renterId: 'uuid-string-1' },
      { productId: 'uuid-string-2', renterId: 'uuid-string-2' },
      { productId: 'uuid-string-3', renterId: 'uuid-string-3' }
    ];

    const csvContent = [
      'productId,renterId',
      ...template.map(item => `${item.productId},${item.renterId}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-assessment-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Template downloaded successfully', 'success');
  };

  const exportResults = () => {
    if (!results) return;

    const exportData = {
      summary: {
        totalAssessments: results.totalAssessments,
        successful: results.successful,
        failed: results.failed,
        exportedAt: new Date().toISOString()
      },
      results: results.results,
      errors: results.errors
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-assessment-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Bulk assessment results exported successfully', 'success');
  };

  const getRiskLevelColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50';
    if (score >= 60) return 'text-orange-600 bg-orange-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-teal-600" />
            <div>
              <h2 className="text-lg font-medium text-gray-900">Bulk Risk Assessment</h2>
              <p className="text-sm text-gray-600">Evaluate risk for multiple product-renter combinations</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Template
            </button>
            {results && (
              <button
                onClick={exportResults}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            )}
            {(results || assessments.length > 1) && (
              <button
                onClick={handleClear}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {assessments.map((assessment, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    Assessment #{index + 1}
                  </h3>
                  {assessments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAssessment(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Package className="w-4 h-4 inline mr-2" />
                      Product ID
                    </label>
                    <input
                      type="text"
                      value={assessment.productId}
                      onChange={(e) => updateAssessment(index, 'productId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Enter product UUID"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-2" />
                      Renter ID
                    </label>
                    <input
                      type="text"
                      value={assessment.renterId}
                      onChange={(e) => updateAssessment(index, 'renterId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Enter renter UUID"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={addAssessment}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <FileText className="w-4 h-4 mr-2" />
              Add Assessment
            </button>
            <button
              type="submit"
              disabled={loading || assessments.every(a => !a.productId.trim() || !a.renterId.trim())}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Assessing...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Assess All
                </>
              )}
            </button>
          </div>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Bulk Assessment Failed</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {results && (
          <div className="mt-6 space-y-6">
            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assessment Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{results.totalAssessments}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{results.successful}</div>
                  <div className="text-sm text-green-600">Successful</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                  <div className="text-sm text-red-600">Failed</div>
                </div>
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <div className="text-2xl font-bold text-teal-600">
                    {Math.round((results.successful / results.totalAssessments) * 100)}%
                  </div>
                  <div className="text-sm text-teal-600">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Results Table */}
            {results.results.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Assessment Results</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Renter ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Risk Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Risk Level
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Compliance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {results.results.map((result, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {result.productId.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {result.renterId.substring(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {result.overallRiskScore}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(result.overallRiskScore)}`}>
                              {getRiskLevel(result.overallRiskScore)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {result.complianceStatus === 'compliant' ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span className="ml-2 text-sm text-gray-900 capitalize">
                                {result.complianceStatus.replace('_', ' ')}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Errors */}
            {results.errors.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Assessment Errors</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {results.errors.map((error, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-red-800">
                            Product: {error.productId.substring(0, 8)}... | Renter: {error.renterId.substring(0, 8)}...
                          </div>
                          <div className="text-sm text-red-700 mt-1">{error.error}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkAssessmentForm;
