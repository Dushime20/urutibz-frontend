import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp,
  RefreshCw,
  Info
} from 'lucide-react';
import RiskEnforcementTrigger from './components/RiskEnforcementTrigger';
import EnforcementActionsPanel from './components/EnforcementActionsPanel';
import { useToast } from '../../contexts/ToastContext';

const RiskEnforcementPage: React.FC = () => {
  const { showToast } = useToast();
  const [recentEnforcements, setRecentEnforcements] = useState<any[]>([]);

  const handleEnforcementSuccess = (result: any) => {
    // Add to recent enforcements list
    setRecentEnforcements(prev => [
      {
        id: Date.now(),
        bookingId: result.data.compliance.bookingId,
        status: result.data.compliance.status,
        score: result.data.compliance.complianceScore,
        violations: result.data.violationsRecorded,
        timestamp: new Date().toISOString()
      },
      ...prev.slice(0, 9) // Keep only last 10
    ]);
    
    showToast(`Enforcement completed for booking ${result.data.compliance.bookingId}`, 'success');
  };

  const handleEnforcementError = (error: string) => {
    showToast(`Enforcement failed: ${error}`, 'error');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'non_compliant':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Risk Enforcement</h1>
          <p className="mt-2 text-gray-600">
            Trigger risk enforcement checks for bookings and monitor compliance status
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Enforcements</p>
                <p className="text-2xl font-semibold text-gray-900">{recentEnforcements.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Compliant</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {recentEnforcements.filter(e => e.status === 'compliant').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Non-Compliant</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {recentEnforcements.filter(e => e.status === 'non_compliant').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Score</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {recentEnforcements.length > 0 
                    ? Math.round(recentEnforcements.reduce((sum, e) => sum + e.score, 0) / recentEnforcements.length)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Enforcement Trigger */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Trigger Enforcement</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manually trigger risk enforcement for a specific booking
              </p>
            </div>
            <div className="p-6">
              <div className="text-center">
                <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Risk Enforcement</h3>
                <p className="text-gray-600 mb-6">
                  Trigger compliance checks and enforcement actions for bookings. 
                  This will analyze the booking against risk profiles and record any violations.
                </p>
                
                <RiskEnforcementTrigger
                  onSuccess={handleEnforcementSuccess}
                  onError={handleEnforcementError}
                />
              </div>
            </div>
          </div>

          {/* Recent Enforcements */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Enforcements</h2>
              <p className="text-sm text-gray-600 mt-1">
                Latest enforcement actions and their results
              </p>
            </div>
            <div className="p-6">
              {recentEnforcements.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Enforcements</h3>
                  <p className="text-gray-600">
                    Trigger your first enforcement to see results here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentEnforcements.map((enforcement) => (
                    <div key={enforcement.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(enforcement.status)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Booking: {enforcement.bookingId.slice(0, 8)}...
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(enforcement.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${getScoreColor(enforcement.score)}`}>
                            {enforcement.score}%
                          </p>
                          <p className="text-xs text-gray-500">Score</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {enforcement.violations}
                          </p>
                          <p className="text-xs text-gray-500">Violations</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enforcement.status)}`}>
                          {enforcement.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enforcement Actions Panel */}
        <EnforcementActionsPanel />

        {/* Information Panel */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <Info className="w-5 h-5 text-blue-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">About Risk Enforcement</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Risk enforcement automatically checks bookings against risk profiles and compliance requirements. 
                  When triggered, the system will:
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>Analyze the booking against applicable risk profiles</li>
                  <li>Check for missing insurance, inspections, or other requirements</li>
                  <li>Calculate a compliance score based on risk factors</li>
                  <li>Record violations and trigger enforcement actions if needed</li>
                  <li>Update the booking's compliance status</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskEnforcementPage;
