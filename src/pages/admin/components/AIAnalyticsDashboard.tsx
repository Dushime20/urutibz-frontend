import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  Brain, 
  Activity,
  Calendar,
  Filter,
  RefreshCw,
  Eye,
  MousePointer,
  Heart,
  Star,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  fetchUserBehaviorAnalytics, 
  fetchRecommendationAnalytics, 
  fetchModelPerformanceMetrics,
  fetchInteractionTypes,
  type UserBehaviorAnalytics,
  type RecommendationAnalytics,
  type ModelPerformanceMetrics,
  type InteractionTypesResponse
} from '../service/ai';
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';

interface AIAnalyticsDashboardProps {
  token?: string;
}

const AIAnalyticsDashboard: React.FC<AIAnalyticsDashboardProps> = ({ token }) => {
  const { tSync } = useTranslation();
  const [userBehavior, setUserBehavior] = useState<UserBehaviorAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationAnalytics | null>(null);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformanceMetrics | null>(null);
  const [interactionTypes, setInteractionTypes] = useState<InteractionTypesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'behavior' | 'recommendations' | 'performance' | 'types'>('behavior');

  // Recommendation filters
  const [recFilters, setRecFilters] = useState<{
    startDate?: string;
    endDate?: string;
    recommendationType?: string;
    userId?: string;
  }>({
    // default to last 30 days
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [recLoading, setRecLoading] = useState(false);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [behaviorData, recommendationsData, performanceData, typesData] = await Promise.all([
        fetchUserBehaviorAnalytics(undefined, token),
        fetchRecommendationAnalytics(undefined, token),
        fetchModelPerformanceMetrics(undefined, token),
        fetchInteractionTypes(undefined, token)
      ]);
      
      console.log('Behavior Data:', behaviorData);
      console.log('Recommendations Data:', recommendationsData);
      console.log('Performance Data:', performanceData);
      console.log('Types Data:', typesData);
      
      setUserBehavior(behaviorData);
      setRecommendations(recommendationsData);
      setModelPerformance(performanceData);
      setInteractionTypes(typesData);
    } catch (err: any) {
      setError(err.message || tSync('Failed to load AI analytics'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [token]);

  // Fetch recommendations when switching to the tab or filters change
  useEffect(() => {
    const fetchRecs = async () => {
      if (activeTab !== 'recommendations') return;
      try {
        setRecLoading(true);
        const data = await fetchRecommendationAnalytics(recFilters, token);
        setRecommendations(data);
      } catch (e) {
        // keep prior recommendations if fetch fails
      } finally {
        setRecLoading(false);
      }
    };
    fetchRecs();
  }, [activeTab, recFilters, token]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-my-primary" />
          <span className="ml-3 text-gray-600"><TranslatedText text="Loading AI Analytics..." /></span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">⚠️ {error}</div>
          <button 
            onClick={loadAnalytics}
            className="px-4 py-2 bg-my-primary text-white rounded-lg hover:bg-my-primary/90"
          >
            <TranslatedText text="Retry" />
          </button>
        </div>
      </div>
    );
  }

  const StatCard: React.FC<{
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
  }> = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="bg-white border border-gray-100 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{title}</div>
        {subtitle && (
          <div className="text-xs text-gray-400">{subtitle}</div>
        )}
      </div>
    </div>
  );

  const renderBehaviorAnalytics = () => {
    console.log('Rendering behavior analytics with data:', userBehavior);
    console.log('Full userBehavior object:', JSON.stringify(userBehavior, null, 2));
    console.log('Interactions by type:', userBehavior?.interactionsByType);
    console.log('Interactions by target:', userBehavior?.interactionsByTarget);
    console.log('Total interactions:', userBehavior?.totalInteractions);
    console.log('Unique users:', userBehavior?.uniqueUsers);
    
    return (
      <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          title={tSync("Total Interactions")}
          value={userBehavior?.totalInteractions?.toLocaleString() || '0'}
          subtitle={tSync("All time")}
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          title={tSync("Unique Users")}
          value={userBehavior?.uniqueUsers?.toLocaleString() || '0'}
          subtitle={tSync("Active users")}
          color="bg-green-500"
        />
        <StatCard
          icon={MousePointer}
          title={tSync("Top Action")}
          value={userBehavior?.topActions && userBehavior.topActions.length > 0 ? userBehavior.topActions[0].action : tSync('N/A')}
          subtitle={userBehavior?.topActions && userBehavior.topActions.length > 0 ? `${userBehavior.topActions[0].count} ${tSync('times')}` : tSync('No data')}
          color="bg-purple-500"
        />
        <StatCard
          icon={Target}
          title={tSync("Top Target")}
          value={userBehavior?.topTargets && userBehavior.topTargets.length > 0 ? userBehavior.topTargets[0].target : tSync('N/A')}
          subtitle={userBehavior?.topTargets && userBehavior.topTargets.length > 0 ? `${userBehavior.topTargets[0].count} ${tSync('interactions')}` : tSync('No data')}
          color="bg-orange-500"
        />
      </div>

      {/* Interaction Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-blue-500" />
            <TranslatedText text="Interactions by Type" />
          </h3>
          <div className="space-y-3">
            {userBehavior?.interactionsByType && Object.keys(userBehavior.interactionsByType).length > 0 ? Object.entries(userBehavior.interactionsByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-gray-600 capitalize">{type}</span>
                <span className="font-semibold">{count.toLocaleString()}</span>
              </div>
            )) : (
              <div className="text-gray-500 text-center py-4"><TranslatedText text="No interaction data available" /></div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-500" />
            <TranslatedText text="Interactions by Target" />
          </h3>
          <div className="space-y-3">
            {userBehavior?.interactionsByTarget && Object.keys(userBehavior.interactionsByTarget).length > 0 ? Object.entries(userBehavior.interactionsByTarget).map(([target, count]) => (
              <div key={target} className="flex items-center justify-between">
                <span className="text-gray-600 capitalize">{target}</span>
                <span className="font-semibold">{count.toLocaleString()}</span>
              </div>
            )) : (
              <div className="text-gray-500 text-center py-4"><TranslatedText text="No target data available" /></div>
            )}
          </div>
        </div>
      </div>
    </div>
    );
  };

  const renderRecommendationAnalytics = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1"><TranslatedText text="Start Date" /></label>
            <input
              type="date"
              value={recFilters.startDate || ''}
              onChange={(e) => setRecFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1"><TranslatedText text="End Date" /></label>
            <input
              type="date"
              value={recFilters.endDate || ''}
              onChange={(e) => setRecFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1"><TranslatedText text="Recommendation Type" /></label>
            <select
              value={recFilters.recommendationType || ''}
              onChange={(e) => setRecFilters(prev => ({ ...prev, recommendationType: e.target.value || undefined }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            >
              <option value=""><TranslatedText text="All" /></option>
              <option value="similar_products"><TranslatedText text="Similar Products" /></option>
              <option value="category_suggestions"><TranslatedText text="Category Suggestions" /></option>
              <option value="trending_items"><TranslatedText text="Trending Items" /></option>
              <option value="personalized"><TranslatedText text="Personalized" /></option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1"><TranslatedText text="User ID (optional)" /></label>
            <input
              placeholder={tSync("Filter by userId")}
              value={recFilters.userId || ''}
              onChange={(e) => setRecFilters(prev => ({ ...prev, userId: e.target.value || undefined }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-my-primary"
            />
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <button
            onClick={() => setRecFilters({
              startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              endDate: new Date().toISOString().split('T')[0]
            })}
            className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            <TranslatedText text="Reset" />
          </button>
        </div>
      </div>

      {recLoading && (
        <div className="flex items-center text-sm text-gray-600">
          <RefreshCw className="w-4 h-4 animate-spin mr-2" /> <TranslatedText text="Updating recommendations..." />
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          title={tSync("Total Recommendations")}
          value={recommendations?.totalRecommendations?.toLocaleString() || '0'}
          subtitle={tSync("All time")}
          color="bg-blue-500"
        />
        <StatCard
          icon={CheckCircle}
          title={tSync("Accepted")}
          value={recommendations?.acceptedRecommendations?.toLocaleString() || '0'}
          subtitle={tSync("Successfully accepted")}
          color="bg-green-500"
        />
        <StatCard
          icon={XCircle}
          title={tSync("Rejection Rate")}
          value={`${((recommendations?.rejectionRate || 0) * 100).toFixed(1)}%`}
          subtitle={tSync("Recommendations rejected")}
          color="bg-red-500"
        />
        <StatCard
          icon={TrendingUp}
          title={tSync("Top Type")}
          value={recommendations?.topRecommendationTypes && recommendations.topRecommendationTypes.length > 0 ? recommendations.topRecommendationTypes[0].type.replace('_', ' ') : tSync('N/A')}
          subtitle={recommendations?.topRecommendationTypes && recommendations.topRecommendationTypes.length > 0 ? `${((recommendations.topRecommendationTypes[0].acceptanceRate || 0) * 100).toFixed(1)}% ${tSync('acceptance')}` : tSync('No data')}
          color="bg-purple-500"
        />
      </div>

      {/* Recommendation Types */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
          <TranslatedText text="Recommendations by Type" />
        </h3>
        <div className="space-y-3">
          {recommendations?.topRecommendationTypes && recommendations.topRecommendationTypes.length > 0 ? recommendations.topRecommendationTypes.map((recType) => (
            <div key={recType.type} className="flex items-center justify-between">
              <span className="text-gray-600 capitalize">{recType.type.replace('_', ' ')}</span>
              <div className="flex items-center space-x-3">
                <span className="font-semibold">{recType.count}</span>
                <span className="text-sm text-gray-500">
                  {((recType.acceptanceRate || 0) * 100).toFixed(1)}% {tSync('acceptance')}
                </span>
              </div>
            </div>
          )) : (
            <div className="text-gray-500 text-center py-4"><TranslatedText text="No recommendation data available" /></div>
          )}
        </div>
      </div>

      {/* User Engagement List */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4"><TranslatedText text="User Engagement" /></h3>
        {recommendations?.userEngagement && recommendations.userEngagement.length > 0 ? (
          <div className="space-y-2">
            {recommendations.userEngagement.slice(0, 10).map((u) => (
              <div key={u.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="text-gray-900 font-medium">{u.userId}</div>
                <div className="text-sm text-gray-600">{u.accepted}/{u.recommendations} <TranslatedText text="accepted" /></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-4"><TranslatedText text="No user engagement data" /></div>
        )}
      </div>
    </div>
  );

  const renderModelPerformance = () => (
    <div className="space-y-6">
      {/* Model Info */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-500" />
          <TranslatedText text="Model Information" />
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-gray-600"><TranslatedText text="Model Type" />:</span>
            <span className="ml-2 font-semibold capitalize">{modelPerformance?.modelType.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-gray-600"><TranslatedText text="Version" />:</span>
            <span className="ml-2 font-semibold">{modelPerformance?.version || tSync('N/A')}</span>
          </div>
          <div>
            <span className="text-gray-600"><TranslatedText text="Last Updated" />:</span>
            <span className="ml-2 font-semibold">
              {modelPerformance?.lastUpdated ? new Date(modelPerformance.lastUpdated).toLocaleDateString() : tSync('N/A')}
            </span>
          </div>
          <div>
            <span className="text-gray-600"><TranslatedText text="Training Data" />:</span>
            <span className="ml-2 font-semibold">
              {modelPerformance?.trainingDataSize ? `${(modelPerformance.trainingDataSize / 1000).toFixed(1)}K ${tSync('samples')}` : tSync('N/A')}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-500" />
            <TranslatedText text="Accuracy Metrics" />
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600"><TranslatedText text="Accuracy" />:</span>
              <span className="font-semibold">{((modelPerformance?.accuracy || 0) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600"><TranslatedText text="Precision" />:</span>
              <span className="font-semibold">{((modelPerformance?.precision || 0) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600"><TranslatedText text="Recall" />:</span>
              <span className="font-semibold">{((modelPerformance?.recall || 0) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600"><TranslatedText text="F1 Score" />:</span>
              <span className="font-semibold">{((modelPerformance?.f1Score || 0) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            <TranslatedText text="Performance Metrics" />
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600"><TranslatedText text="Latency" />:</span>
              <span className="font-semibold">{modelPerformance?.latency || 0}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600"><TranslatedText text="Throughput" />:</span>
              <span className="font-semibold">{modelPerformance?.throughput || 0} <TranslatedText text="req/s" /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInteractionTypes = () => (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={MousePointer}
          title={tSync("Action Types")}
          value={interactionTypes?.actionTypes.length || 0}
          subtitle={tSync("Available actions")}
          color="bg-blue-500"
        />
        <StatCard
          icon={Target}
          title={tSync("Target Types")}
          value={interactionTypes?.targetTypes.length || 0}
          subtitle={tSync("Available targets")}
          color="bg-green-500"
        />
        <StatCard
          icon={Activity}
          title={tSync("Device Types")}
          value={interactionTypes?.deviceTypes.length || 0}
          subtitle={tSync("Supported devices")}
          color="bg-purple-500"
        />
      </div>

      {/* Action Types */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MousePointer className="w-5 h-5 mr-2 text-blue-500" />
          <TranslatedText text="Available Action Types" />
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {interactionTypes?.actionTypes.map((actionType) => (
            <div key={actionType} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <span className="text-sm font-medium text-blue-800 capitalize">{actionType}</span>
            </div>
          )) || (
            <div className="text-gray-500 text-center py-4"><TranslatedText text="No action types available" /></div>
          )}
        </div>
      </div>

      {/* Target Types */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-green-500" />
          <TranslatedText text="Available Target Types" />
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {interactionTypes?.targetTypes.map((targetType) => (
            <div key={targetType} className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <span className="text-sm font-medium text-green-800 capitalize">{targetType.replace('_', ' ')}</span>
            </div>
          )) || (
            <div className="text-gray-500 text-center py-4"><TranslatedText text="No target types available" /></div>
          )}
        </div>
      </div>

      {/* Device Types */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-purple-500" />
          <TranslatedText text="Supported Device Types" />
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {interactionTypes?.deviceTypes.map((deviceType) => (
            <div key={deviceType} className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
              <span className="text-sm font-medium text-purple-800 capitalize">{deviceType}</span>
            </div>
          )) || (
            <div className="text-gray-500 text-center py-4"><TranslatedText text="No device types available" /></div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900"><TranslatedText text="AI Analytics Dashboard" /></h3>
        <button 
          onClick={loadAnalytics}
          className="inline-flex items-center px-3 py-2 rounded-lg bg-my-primary text-white hover:bg-my-primary/90"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          <TranslatedText text="Refresh" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('behavior')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'behavior'
              ? 'bg-white text-my-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Eye className="w-4 h-4 inline mr-2" />
          <TranslatedText text="User Behavior" />
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'recommendations'
              ? 'bg-white text-my-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Target className="w-4 h-4 inline mr-2" />
          <TranslatedText text="Recommendations" />
        </button>
                 <button
           onClick={() => setActiveTab('performance')}
           className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
             activeTab === 'performance'
               ? 'bg-white text-my-primary shadow-sm'
               : 'text-gray-600 hover:text-gray-900'
           }`}
         >
           <Brain className="w-4 h-4 inline mr-2" />
           <TranslatedText text="Model Performance" />
         </button>
         <button
           onClick={() => setActiveTab('types')}
           className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
             activeTab === 'types'
               ? 'bg-white text-my-primary shadow-sm'
               : 'text-gray-600 hover:text-gray-900'
           }`}
         >
           <Filter className="w-4 h-4 inline mr-2" />
           <TranslatedText text="Interaction Types" />
         </button>
      </div>

             {/* Tab Content */}
       {activeTab === 'behavior' && renderBehaviorAnalytics()}
       {activeTab === 'recommendations' && renderRecommendationAnalytics()}
       {activeTab === 'performance' && renderModelPerformance()}
       {activeTab === 'types' && renderInteractionTypes()}
    </div>
  );
};

export default AIAnalyticsDashboard;
