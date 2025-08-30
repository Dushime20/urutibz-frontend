import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Flag, Clock, TrendingUp, Users } from 'lucide-react';
import ModerationActionsManagement from './components/ModerationActionsManagement';
import ProductModerationHistory from './components/ProductModerationHistory';
import { fetchModerationStats, fetchModerationActions } from './service';

const ModerationDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'actions' | 'history'>('overview');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentActions, setRecentActions] = useState<any[]>([]);
  const [loadingActions, setLoadingActions] = useState(true);

  useEffect(() => {
    loadModerationStats();
    loadRecentActions();
  }, []);

  const loadModerationStats = async () => {
    try {
      setLoadingStats(true);
      const token = localStorage.getItem('token');
      if (token) {
        const statsData = await fetchModerationStats(token);
        const statsObject = statsData?.data || statsData || null;
        setStats(statsObject);
        console.log('Moderation stats loaded:', statsObject);
      }
    } catch (error) {
      console.error('Error loading moderation stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const loadRecentActions = async () => {
    try {
      setLoadingActions(true);
      const token = localStorage.getItem('token');
      if (token) {
        const actionsData = await fetchModerationActions(token);
        const actionsArray = actionsData?.data || actionsData || [];
        // Get the 5 most recent actions
        const recent = actionsArray.slice(0, 5);
        setRecentActions(recent);
        console.log('Recent actions loaded:', recent);
      }
    } catch (error) {
      console.error('Error loading recent actions:', error);
    } finally {
      setLoadingActions(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Shield className="w-5 h-5" /> },
    { id: 'actions', label: 'All Actions', icon: <AlertTriangle className="w-5 h-4" /> },
    { id: 'history', label: 'Product History', icon: <Clock className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Moderation Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Monitor and manage content moderation across the platform
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                Active
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-white dark:bg-gray-800 rounded-2xl p-1 shadow-sm border border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-my-primary text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Actions</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {loadingStats ? 'Loading...' : (stats?.totalActions || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {loadingStats ? 'Loading...' : (stats?.actionsByType?.approve || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                      <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {loadingStats ? 'Loading...' : (stats?.actionsByType?.reject || 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                      <Flag className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Flagged</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {loadingStats ? 'Loading...' : (stats?.actionsByType?.flag || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Recent Moderation Activity
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Latest moderation actions across the platform
                  </p>
                </div>
                <div className="p-6">
                  {loadingActions ? (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">Loading recent actions...</p>
                    </div>
                  ) : recentActions.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">No recent moderation actions found.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActions.map((action, index) => (
                        <div key={index} className="flex items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          <div className="p-2 bg-gray-200 dark:bg-gray-600 rounded-full text-gray-600 dark:text-gray-300">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {action.actionType} on {new Date(action.timestamp).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {action.contentType} - {action.contentId}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Status: {action.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Quick Actions
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Common moderation tasks
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveTab('actions')}
                      className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <AlertTriangle className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-4" />
                      <div className="text-left">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">View All Actions</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Browse through all moderation actions
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('history')}
                      className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                    >
                      <Clock className="w-8 h-8 text-green-600 dark:text-green-400 mr-4" />
                      <div className="text-left">
                        <h4 className="font-medium text-green-900 dark:text-green-100">Product History</h4>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Check moderation history for specific products
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'actions' && (
            <ModerationActionsManagement />
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Product Moderation History
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Enter a product ID to view its moderation history, or use the Items Management page to view history for specific products.
                </p>
                
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="Enter Product ID"
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-my-primary focus:border-transparent"
                    value={selectedProductId || ''}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                  />
                  <button
                    onClick={() => setSelectedProductId(selectedProductId)}
                    disabled={!selectedProductId}
                    className="bg-my-primary hover:bg-my-primary/90 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
                  >
                    View History
                  </button>
                </div>
              </div>

              {selectedProductId && (
                <ProductModerationHistory
                  productId={selectedProductId}
                  productTitle={`Product ${selectedProductId}`}
                  onClose={() => setSelectedProductId(null)}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModerationDashboardPage;
