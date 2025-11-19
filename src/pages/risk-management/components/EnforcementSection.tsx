import React from 'react';
import EnforcementActionsPanel from './EnforcementActionsPanel';
import RiskEnforcementTrigger from './RiskEnforcementTrigger';
import { useRiskManagementStats } from '../hooks/useRiskManagementStats';
import { Shield, AlertTriangle, CheckCircle, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';

const EnforcementSection: React.FC = () => {
  const { tSync } = useTranslation();
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
          <Shield className="w-8 h-8 text-red-600 dark:text-red-400" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100"><TranslatedText text="Risk Enforcement" /></h2>
            <p className="text-gray-600 dark:text-slate-400"><TranslatedText text="Manage enforcement actions and compliance monitoring" /></p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Enforcement Trigger */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100"><TranslatedText text="Trigger Enforcement" /></h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              <TranslatedText text="Manually trigger risk enforcement for a specific booking" />
            </p>
          </div>
          <div className="p-6">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2"><TranslatedText text="Risk Enforcement" /></h4>
              <p className="text-gray-600 dark:text-slate-400 mb-6">
                <TranslatedText text="Trigger compliance checks and enforcement actions for bookings. This will analyze the booking against risk profiles and record any violations." />
              </p>
              
              <RiskEnforcementTrigger
                onSuccess={handleEnforcementSuccess}
                onError={handleEnforcementError}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100"><TranslatedText text="Enforcement Overview" /></h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                  <TranslatedText text="Quick overview of enforcement activities" />
                </p>
              </div>
              <button
                onClick={refetch}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                <TranslatedText text="Refresh" />
              </button>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-8 h-8 text-gray-400 dark:text-slate-500 animate-spin mr-3" />
                <span className="text-gray-600 dark:text-slate-400"><TranslatedText text="Loading statistics..." /></span>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2"><TranslatedText text="Failed to Load Statistics" /></h4>
                <p className="text-gray-600 dark:text-slate-400 mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  <TranslatedText text="Retry" />
                </button>
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.enforcementActions.failed}</div>
                  <div className="text-sm text-red-600 dark:text-red-400">Failed Actions</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                  <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.enforcementActions.pending}</div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending Actions</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.enforcementActions.successful}</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Successful Actions</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.complianceRate.toFixed(1)}%</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Compliance Rate</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">No Statistics Available</h4>
                <p className="text-gray-600 dark:text-slate-400">Statistics will appear here once data is available</p>
              </div>
            )}
            {lastUpdated && (
              <div className="mt-4 text-center text-xs text-gray-500 dark:text-slate-400">
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
