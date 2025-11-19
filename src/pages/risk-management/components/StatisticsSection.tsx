import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Target,
  Activity,
  Download,
  RefreshCw,
  Eye
} from 'lucide-react';
import { useRiskManagementStats } from '../hooks/useRiskManagementStats';
import { useRiskManagementTrends } from '../hooks/useRiskManagementTrends';
import TrendChart from './TrendChart';
import { useToast } from '../../../contexts/ToastContext';
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';

const StatisticsSection: React.FC = () => {
  const { showToast } = useToast();
  const { tSync } = useTranslation();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'trends'>('overview');
  const { stats, loading, error, refetch, lastUpdated } = useRiskManagementStats();
  const { trends, loading: trendsLoading, error: trendsError, refetch: refetchTrends, lastUpdated: trendsLastUpdated } = useRiskManagementTrends(selectedPeriod);

  const handleExport = () => {
    if (!stats) {
      showToast(tSync('No data available to export'), 'error');
      return;
    }

    const exportData = {
      generatedAt: new Date().toISOString(),
      period: selectedPeriod,
      statistics: stats
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `risk-management-stats-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(tSync('Statistics exported successfully'), 'success');
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30';
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30';
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700';
    }
  };

  const getComplianceColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 dark:text-green-400';
    if (rate >= 80) return 'text-teal-600 dark:text-teal-400';
    if (rate >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getViolationColor = (rate: number) => {
    if (rate <= 5) return 'text-green-600 dark:text-green-400';
    if (rate <= 15) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-gray-400 dark:text-slate-500 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2"><TranslatedText text="Loading Statistics" /></h3>
            <p className="text-gray-600 dark:text-slate-400"><TranslatedText text="Fetching risk management data..." /></p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2"><TranslatedText text="Failed to Load Statistics" /></h3>
          <p className="text-gray-600 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">No Statistics Available</h3>
          <p className="text-gray-600 dark:text-slate-400">Statistics will appear here once data is available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Risk Management Statistics</h2>
              <p className="text-gray-600 dark:text-slate-400">Comprehensive overview of risk management performance</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => {
                setSelectedPeriod(e.target.value as any);
                refetchTrends(e.target.value);
              }}
              className="border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              onClick={() => {
                refetch();
                refetchTrends();
              }}
              disabled={loading || trendsLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${(loading || trendsLoading) ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 dark:hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>
        {lastUpdated && (
          <div className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            Last updated: {lastUpdated.toLocaleString()}
          </div>
        )}
      </div>

      {/* View Mode Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'detailed', label: 'Detailed', icon: Eye },
              { id: 'trends', label: 'Trends', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id as any)}
                    className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      isActive
                        ? 'border-teal-500 dark:border-teal-400 text-teal-600 dark:text-teal-400'
                        : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                    }`}
                >
                  <Icon className={`-ml-0.5 mr-2 h-5 w-5 ${
                    isActive ? 'text-teal-500 dark:text-teal-400' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-500 dark:group-hover:text-slate-400'
                  }`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Overview Mode */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Shield className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Total Risk Profiles</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">{stats.totalRiskProfiles}</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Compliance Rate</p>
                  <p className={`text-2xl font-semibold ${getComplianceColor(stats.complianceRate)}`}>
                    {stats.complianceRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Violation Rate</p>
                  <p className={`text-2xl font-semibold ${getViolationColor(stats.violationRate)}`}>
                    {stats.violationRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Average Risk Score</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-slate-100">{stats.averageRiskScore.toFixed(1)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enforcement Actions */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Enforcement Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">{stats.enforcementActions.total}</div>
                <div className="text-sm text-gray-600 dark:text-slate-400">Total Actions</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.enforcementActions.successful}</div>
                <div className="text-sm text-green-600 dark:text-green-400">Successful</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.enforcementActions.failed}</div>
                <div className="text-sm text-red-600 dark:text-red-400">Failed</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.enforcementActions.pending}</div>
                <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
              </div>
            </div>
          </div>

          {/* Risk Distribution */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Risk Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.riskDistribution).map(([level, count]) => (
                <div key={level} className={`text-center p-4 rounded-lg ${getRiskLevelColor(level)}`}>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm font-medium capitalize">{level} Risk</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detailed Mode */}
      {viewMode === 'detailed' && (
        <div className="space-y-6">
          {/* Detailed Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Breakdown */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Compliance Analysis</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Overall Compliance</span>
                  <span className={`font-semibold ${getComplianceColor(stats.complianceRate)}`}>
                    {stats.complianceRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getComplianceColor(stats.complianceRate).includes('green') ? 'bg-green-500' : 
                      getComplianceColor(stats.complianceRate).includes('teal') ? 'bg-teal-500' : 
                      getComplianceColor(stats.complianceRate).includes('yellow') ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${stats.complianceRate}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Violation Rate</span>
                  <span className={`font-semibold ${getViolationColor(stats.violationRate)}`}>
                    {stats.violationRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getViolationColor(stats.violationRate).includes('green') ? 'bg-green-500' : 
                      getViolationColor(stats.violationRate).includes('yellow') ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${stats.violationRate}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Enforcement Effectiveness */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Enforcement Effectiveness</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Success Rate</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {((stats.enforcementActions.successful / stats.enforcementActions.total) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-green-500"
                    style={{ width: `${(stats.enforcementActions.successful / stats.enforcementActions.total) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-slate-400">Failure Rate</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {((stats.enforcementActions.failed / stats.enforcementActions.total) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-red-500"
                    style={{ width: `${(stats.enforcementActions.failed / stats.enforcementActions.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Profile Details */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Risk Profile Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">{stats.totalRiskProfiles}</div>
                <div className="text-sm text-gray-600 dark:text-slate-400">Total Risk Profiles</div>
                <div className="text-xs text-gray-500 dark:text-slate-500 mt-1">Products with risk assessments</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">{stats.averageRiskScore.toFixed(1)}</div>
                <div className="text-sm text-gray-600 dark:text-slate-400">Average Risk Score</div>
                <div className="text-xs text-gray-500 dark:text-slate-500 mt-1">Weighted risk assessment</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
                  {Object.values(stats.riskDistribution).reduce((a, b) => a + b, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-slate-400">Total Products</div>
                <div className="text-xs text-gray-500 dark:text-slate-500 mt-1">All risk categories</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trends Mode */}
      {viewMode === 'trends' && (
        <div className="space-y-6">
          {/* Trend Analysis Header */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Trend Analysis</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-slate-400">Period: {selectedPeriod}</span>
                {trendsLastUpdated && (
                  <span className="text-xs text-gray-500 dark:text-slate-500">
                    Updated: {trendsLastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
            
            {trendsLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-8 h-8 text-gray-400 dark:text-slate-500 animate-spin mr-3" />
                <span className="text-gray-600 dark:text-slate-400">Loading trend data...</span>
              </div>
            ) : trendsError ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">Failed to Load Trends</h4>
                <p className="text-gray-600 dark:text-slate-400 mb-4">{trendsError}</p>
                <button
                  onClick={() => refetchTrends()}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </button>
              </div>
            ) : trends ? (
              <div className="space-y-6">
                {/* Comparison Summary */}
                {trends.comparison && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-teal-50 dark:bg-teal-900/30 rounded-lg p-4">
                      <div className="flex items-center">
                        <Target className="w-8 h-8 text-teal-600 dark:text-teal-400 mr-3" />
                        <div>
                          <p className="text-sm text-teal-600 dark:text-teal-400">Compliance Change</p>
                          <p className={`text-lg font-semibold ${trends.comparison.complianceRateChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {trends.comparison.complianceRateChange >= 0 ? '+' : ''}{trends.comparison.complianceRateChange.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 mr-3" />
                        <div>
                          <p className="text-sm text-red-600 dark:text-red-400">Violation Change</p>
                          <p className={`text-lg font-semibold ${trends.comparison.violationRateChange <= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {trends.comparison.violationRateChange >= 0 ? '+' : ''}{trends.comparison.violationRateChange.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mr-3" />
                        <div>
                          <p className="text-sm text-green-600 dark:text-green-400">Enforcement Change</p>
                          <p className={`text-lg font-semibold ${trends.comparison.enforcementActionsChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {trends.comparison.enforcementActionsChange >= 0 ? '+' : ''}{trends.comparison.enforcementActionsChange.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4">
                      <div className="flex items-center">
                        <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
                        <div>
                          <p className="text-sm text-purple-600 dark:text-purple-400">Risk Profiles Change</p>
                          <p className={`text-lg font-semibold ${trends.comparison.riskProfilesChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {trends.comparison.riskProfilesChange >= 0 ? '+' : ''}{trends.comparison.riskProfilesChange.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Metrics Trends */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TrendChart
                    data={trends.complianceRate}
                    title="Compliance Rate Trend"
                    color="green"
                    formatValue={(value) => `${value.toFixed(1)}%`}
                  />
                  <TrendChart
                    data={trends.violationRate}
                    title="Violation Rate Trend"
                    color="red"
                    formatValue={(value) => `${value.toFixed(1)}%`}
                  />
                </div>

                {/* Enforcement Actions Trends */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Enforcement Actions Trends</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TrendChart
                      data={trends.enforcementActions.total}
                      title="Total Enforcement Actions"
                      color="teal"
                      formatValue={(value) => value.toString()}
                    />
                    <TrendChart
                      data={trends.enforcementActions.successful}
                      title="Successful Actions"
                      color="green"
                      formatValue={(value) => value.toString()}
                    />
                    <TrendChart
                      data={trends.enforcementActions.failed}
                      title="Failed Actions"
                      color="red"
                      formatValue={(value) => value.toString()}
                    />
                    <TrendChart
                      data={trends.enforcementActions.pending}
                      title="Pending Actions"
                      color="yellow"
                      formatValue={(value) => value.toString()}
                    />
                  </div>
                </div>

                {/* Risk Profile Trends */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Risk Profile Distribution Trends</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TrendChart
                      data={trends.riskProfiles.total}
                      title="Total Risk Profiles"
                      color="teal"
                      formatValue={(value) => value.toString()}
                    />
                    <TrendChart
                      data={trends.riskProfiles.low}
                      title="Low Risk Profiles"
                      color="green"
                      formatValue={(value) => value.toString()}
                    />
                    <TrendChart
                      data={trends.riskProfiles.medium}
                      title="Medium Risk Profiles"
                      color="yellow"
                      formatValue={(value) => value.toString()}
                    />
                    <TrendChart
                      data={trends.riskProfiles.high}
                      title="High Risk Profiles"
                      color="orange"
                      formatValue={(value) => value.toString()}
                    />
                    <TrendChart
                      data={trends.riskProfiles.critical}
                      title="Critical Risk Profiles"
                      color="red"
                      formatValue={(value) => value.toString()}
                    />
                    <TrendChart
                      data={trends.averageRiskScore}
                      title="Average Risk Score"
                      color="purple"
                      formatValue={(value) => value.toFixed(1)}
                    />
                  </div>
                </div>

                {/* Trend Summary */}
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-4">Trend Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-slate-100 mb-2">Key Insights</h5>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
                        <li className="flex items-center">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                          Compliance rate is {trends.complianceRate[trends.complianceRate.length - 1]?.value > trends.complianceRate[0]?.value ? 'improving' : 'declining'}
                        </li>
                        <li className="flex items-center">
                          <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                          Violation rate is {trends.violationRate[trends.violationRate.length - 1]?.value > trends.violationRate[0]?.value ? 'increasing' : 'decreasing'}
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-teal-500 mr-2" />
                          Enforcement actions are {trends.enforcementActions.total[trends.enforcementActions.total.length - 1]?.value > trends.enforcementActions.total[0]?.value ? 'increasing' : 'decreasing'}
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-slate-100 mb-2">Recommendations</h5>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
                        <li>• Monitor compliance trends closely</li>
                        <li>• Review enforcement strategies if failure rate is high</li>
                        <li>• Focus on high-risk areas requiring attention</li>
                        <li>• Consider proactive risk mitigation measures</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">No Trend Data Available</h4>
                <p className="text-gray-600 dark:text-slate-400">Trend data will appear here once historical data is available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsSection;