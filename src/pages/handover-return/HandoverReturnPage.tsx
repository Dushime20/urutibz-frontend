// Handover & Return Main Page
// Following the same patterns as RiskAssessmentPage.tsx

import React, { useEffect, useState } from 'react';
import { 
  Package, 
  ArrowRightLeft, 
  TrendingUp,
  BarChart3,
  List
} from 'lucide-react';
import HandoverSessionForm from './components/HandoverSessionForm';
import ReturnSessionForm from './components/ReturnSessionForm';
import HandoverSessionsList from './components/HandoverSessionsList';
import ErrorBoundary from '../../components/ErrorBoundary';
import handoverReturnService from '../../services/handoverReturnService';

const HandoverReturnPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'stats'>('sessions');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'handover' | 'return'>('handover');
  const [stats, setStats] = useState<any | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const tabs = [
    {
      id: 'sessions',
      label: 'My Sessions',
      icon: List,
      description: 'View all your handover sessions'
    },
    {
      id: 'stats',
      label: 'Statistics',
      icon: BarChart3,
      description: 'View handover and return analytics'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sessions':
        return <HandoverSessionsList />;
      case 'stats':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Statistics Dashboard</h3>
              <p className="text-sm text-gray-600">Handover and return analytics</p>
            </div>
            {statsError && <div className="text-sm text-red-600 mb-4">{statsError}</div>}
            {statsLoading ? (
              <div className="text-sm text-gray-500">Loading stats…</div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="text-xs text-gray-500">Total Handovers</div>
                    <div className="text-2xl font-semibold text-gray-900">{stats.totalHandovers}</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="text-xs text-gray-500">Total Returns</div>
                    <div className="text-2xl font-semibold text-gray-900">{stats.totalReturns}</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="text-xs text-gray-500">Dispute Rate</div>
                    <div className="text-2xl font-semibold text-gray-900">{stats.disputeRate}%</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="text-xs text-gray-500">Handover Success</div>
                    <div className="text-xl font-semibold text-teal-600">{stats.handoverSuccessRate}%</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="text-xs text-gray-500">Return On-Time</div>
                    <div className="text-xl font-semibold text-teal-600">{stats.returnOnTimeRate}%</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="text-xs text-gray-500">Avg Handover Time</div>
                    <div className="text-xl font-semibold text-gray-900">{stats.averageHandoverTime} min</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="text-xs text-gray-500">Avg Return Processing</div>
                    <div className="text-xl font-semibold text-gray-900">{stats.averageReturnProcessingTime} min</div>
                  </div>
                </div>
                {(stats.statusDistribution || stats.typeDistribution) && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stats.statusDistribution && (
                      <div className="rounded-lg border border-gray-200 p-4">
                        <div className="text-sm font-medium text-gray-900 mb-2">Status Distribution</div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(stats.statusDistribution).map(([k, v]: any) => (
                            <span key={k} className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{k}: {v}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {stats.typeDistribution && (
                      <div className="rounded-lg border border-gray-200 p-4">
                        <div className="text-sm font-medium text-gray-900 mb-2">Type Distribution</div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(stats.typeDistribution).map(([k, v]: any) => (
                            <span key={k} className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">{k}: {v}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-sm text-gray-500">No stats available.</div>
            )}
          </div>
        );
      default:
        return <HandoverSessionsList />;
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError(null);
      try {
        const res = await handoverReturnService.getHandoverReturnStats();
        setStats(res?.data || null);
      } catch (e: any) {
        setStatsError(e?.message || 'Failed to load stats');
      } finally {
        setStatsLoading(false);
      }
    };
    if (activeTab === 'stats') fetchStats();
  }, [activeTab]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Handover & Return</h1>
                <p className="text-gray-600 mt-2">
                  Manage product handover and return sessions with comprehensive tracking
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setCreateType('handover');
                      setShowCreateModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    New Handover
                  </button>
                  <button
                    onClick={() => {
                      setCreateType('return');
                      setShowCreateModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    New Return
                  </button>
                </div>
                <Package className="w-8 h-8 text-teal-600" />
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                        isActive
                          ? 'border-teal-500 text-teal-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon
                        className={`-ml-0.5 mr-2 h-5 w-5 ${
                          isActive ? 'text-teal-500' : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {renderTabContent()}
          </div>

          {/* Quick Stats Overview */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="w-8 h-8 text-teal-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Handover Sessions</h3>
                  <p className="text-sm text-gray-600">Manage product handovers</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ArrowRightLeft className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Return Sessions</h3>
                  <p className="text-sm text-gray-600">Manage product returns</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Success Rate</h3>
                  <p className="text-sm text-gray-600">Track completion rates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {createType === 'handover' ? 'Create Handover Session' : 'Create Return Session'}
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {createType === 'handover' ? (
                <HandoverSessionForm />
              ) : (
                <ReturnSessionForm />
              )}
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
};

export default HandoverReturnPage;
