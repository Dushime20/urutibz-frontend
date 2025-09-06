import React from 'react';
import EnforcementActionsPanel from './EnforcementActionsPanel';
import RiskEnforcementTrigger from './RiskEnforcementTrigger';
import { useRiskManagementStats } from '../hooks/useRiskManagementStats';
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, RefreshCw } from 'lucide-react';

const EnforcementSection: React.FC = () => {
  const { stats, loading, error, refetch, lastUpdated } = useRiskManagementStats();

  const handleEnforcementSuccess = (result: any) => {
    console.log('Enforcement triggered successfully:', result);
    // Refresh stats after successful enforcement
    refetch();
  };

  const handleEnforcementError = (error: any) => {
    console.error('Enforcement failed:', error);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-8 h-8 text-red-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Risk Enforcement</h2>
            <p className="text-gray-600">Manage enforcement actions and compliance monitoring</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Enforcement Trigger */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Trigger Enforcement</h3>
            <p className="text-sm text-gray-600 mt-1">
              Manually trigger risk enforcement for a specific booking
            </p>
          </div>
          <div className="p-6">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">Risk Enforcement</h4>
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

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Enforcement Overview</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Quick overview of enforcement activities
                </p>
              </div>
              <button
                onClick={refetch}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mr-3" />
                <span className="text-gray-600">Loading statistics...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Statistics</h4>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </button>
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">{stats.enforcementActions.failed}</div>
                  <div className="text-sm text-red-600">Failed Actions</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600">{stats.enforcementActions.pending}</div>
                  <div className="text-sm text-yellow-600">Pending Actions</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{stats.enforcementActions.successful}</div>
                  <div className="text-sm text-blue-600">Successful Actions</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{stats.complianceRate.toFixed(1)}%</div>
                  <div className="text-sm text-green-600">Compliance Rate</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Statistics Available</h4>
                <p className="text-gray-600">Statistics will appear here once data is available</p>
              </div>
            )}
            {lastUpdated && (
              <div className="mt-4 text-center text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enforcement Actions Panel */}
      <EnforcementActionsPanel />
    </div>
  );
};

export default EnforcementSection;
