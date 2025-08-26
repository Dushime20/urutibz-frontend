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

interface AIAnalyticsDashboardProps {
  token?: string;
}

const AIAnalyticsDashboard: React.FC<AIAnalyticsDashboardProps> = ({ token }) => {
  const [userBehavior, setUserBehavior] = useState<UserBehaviorAnalytics | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationAnalytics | null>(null);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformanceMetrics | null>(null);
  const [interactionTypes, setInteractionTypes] = useState<InteractionTypesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'behavior' | 'recommendations' | 'performance' | 'types'>('behavior');

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
      setError(err.message || 'Failed to load AI analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [token]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-my-primary" />
          <span className="ml-3 text-gray-600">Loading AI Analytics...</span>
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
            Retry
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
          title="Total Interactions"
          value={userBehavior?.totalInteractions.toLocaleString() || '0'}
          subtitle="All time"
          color="bg-blue-500"
        />
        <StatCard
          icon={Users}
          title="Unique Users"
          value={userBehavior?.uniqueUsers.toLocaleString() || '0'}
          subtitle="Active users"
          color="bg-green-500"
        />
        <StatCard
          icon={MousePointer}
          title="Top Action"
          value={userBehavior?.topActions && userBehavior.topActions.length > 0 ? userBehavior.topActions[0].action : 'N/A'}
          subtitle={userBehavior?.topActions && userBehavior.topActions.length > 0 ? `${userBehavior.topActions[0].count} times` : 'No data'}
          color="bg-purple-500"
        />
        <StatCard
          icon={Target}
          title="Top Target"
          value={userBehavior?.topTargets && userBehavior.topTargets.length > 0 ? userBehavior.topTargets[0].target : 'N/A'}
          subtitle={userBehavior?.topTargets && userBehavior.topTargets.length > 0 ? `${userBehavior.topTargets[0].count} interactions` : 'No data'}
          color="bg-orange-500"
        />
      </div>

      {/* Interaction Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-blue-500" />
            Interactions by Type
          </h3>
          <div className="space-y-3">
            {userBehavior?.interactionsByType && Object.keys(userBehavior.interactionsByType).length > 0 ? Object.entries(userBehavior.interactionsByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-gray-600 capitalize">{type}</span>
                <span className="font-semibold">{count.toLocaleString()}</span>
              </div>
            )) : (
              <div className="text-gray-500 text-center py-4">No interaction data available</div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-orange-500" />
            Interactions by Target
          </h3>
          <div className="space-y-3">
            {userBehavior?.interactionsByTarget && Object.keys(userBehavior.interactionsByTarget).length > 0 ? Object.entries(userBehavior.interactionsByTarget).map(([target, count]) => (
              <div key={target} className="flex items-center justify-between">
                <span className="text-gray-600 capitalize">{target}</span>
                <span className="font-semibold">{count.toLocaleString()}</span>
              </div>
            )) : (
              <div className="text-gray-500 text-center py-4">No target data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
    );
  };

  const renderRecommendationAnalytics = () => (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          title="Total Recommendations"
          value={recommendations?.totalRecommendations.toLocaleString() || '0'}
          subtitle="All time"
          color="bg-blue-500"
        />
        <StatCard
          icon={CheckCircle}
          title="Accepted"
          value={recommendations?.acceptedRecommendations.toLocaleString() || '0'}
          subtitle="Successfully accepted"
          color="bg-green-500"
        />
        <StatCard
          icon={XCircle}
          title="Rejection Rate"
          value={`${((recommendations?.rejectionRate || 0) * 100).toFixed(1)}%`}
          subtitle="Recommendations rejected"
          color="bg-red-500"
        />
        <StatCard
          icon={TrendingUp}
          title="Top Type"
          value={recommendations?.topRecommendationTypes && recommendations.topRecommendationTypes.length > 0 ? recommendations.topRecommendationTypes[0].type.replace('_', ' ') : 'N/A'}
          subtitle={recommendations?.topRecommendationTypes && recommendations.topRecommendationTypes.length > 0 ? `${((recommendations.topRecommendationTypes[0].acceptanceRate || 0) * 100).toFixed(1)}% acceptance` : 'No data'}
          color="bg-purple-500"
        />
      </div>

      {/* Recommendation Types */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-purple-500" />
          Recommendations by Type
        </h3>
        <div className="space-y-3">
          {recommendations?.topRecommendationTypes && recommendations.topRecommendationTypes.length > 0 ? recommendations.topRecommendationTypes.map((recType) => (
            <div key={recType.type} className="flex items-center justify-between">
              <span className="text-gray-600 capitalize">{recType.type.replace('_', ' ')}</span>
              <div className="flex items-center space-x-3">
                <span className="font-semibold">{recType.count}</span>
                <span className="text-sm text-gray-500">
                  {((recType.acceptanceRate || 0) * 100).toFixed(1)}% acceptance
                </span>
              </div>
            </div>
          )) : (
            <div className="text-gray-500 text-center py-4">No recommendation data available</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderModelPerformance = () => (
    <div className="space-y-6">
      {/* Model Info */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-purple-500" />
          Model Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-gray-600">Model Type:</span>
            <span className="ml-2 font-semibold capitalize">{modelPerformance?.modelType.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-gray-600">Version:</span>
            <span className="ml-2 font-semibold">{modelPerformance?.version || 'N/A'}</span>
          </div>
          <div>
            <span className="text-gray-600">Last Updated:</span>
            <span className="ml-2 font-semibold">
              {modelPerformance?.lastUpdated ? new Date(modelPerformance.lastUpdated).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Training Data:</span>
            <span className="ml-2 font-semibold">
              {modelPerformance?.trainingDataSize ? `${(modelPerformance.trainingDataSize / 1000).toFixed(1)}K samples` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-green-500" />
            Accuracy Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Accuracy:</span>
              <span className="font-semibold">{((modelPerformance?.accuracy || 0) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Precision:</span>
              <span className="font-semibold">{((modelPerformance?.precision || 0) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Recall:</span>
              <span className="font-semibold">{((modelPerformance?.recall || 0) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">F1 Score:</span>
              <span className="font-semibold">{((modelPerformance?.f1Score || 0) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-500" />
            Performance Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Latency:</span>
              <span className="font-semibold">{modelPerformance?.latency || 0}ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Throughput:</span>
              <span className="font-semibold">{modelPerformance?.throughput || 0} req/s</span>
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
          title="Action Types"
          value={interactionTypes?.actionTypes.length || 0}
          subtitle="Available actions"
          color="bg-blue-500"
        />
        <StatCard
          icon={Target}
          title="Target Types"
          value={interactionTypes?.targetTypes.length || 0}
          subtitle="Available targets"
          color="bg-green-500"
        />
        <StatCard
          icon={Activity}
          title="Device Types"
          value={interactionTypes?.deviceTypes.length || 0}
          subtitle="Supported devices"
          color="bg-purple-500"
        />
      </div>

      {/* Action Types */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MousePointer className="w-5 h-5 mr-2 text-blue-500" />
          Available Action Types
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {interactionTypes?.actionTypes.map((actionType) => (
            <div key={actionType} className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
              <span className="text-sm font-medium text-blue-800 capitalize">{actionType}</span>
            </div>
          )) || (
            <div className="text-gray-500 text-center py-4">No action types available</div>
          )}
        </div>
      </div>

      {/* Target Types */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-green-500" />
          Available Target Types
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {interactionTypes?.targetTypes.map((targetType) => (
            <div key={targetType} className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <span className="text-sm font-medium text-green-800 capitalize">{targetType.replace('_', ' ')}</span>
            </div>
          )) || (
            <div className="text-gray-500 text-center py-4">No target types available</div>
          )}
        </div>
      </div>

      {/* Device Types */}
      <div className="bg-white border border-gray-100 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-purple-500" />
          Supported Device Types
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {interactionTypes?.deviceTypes.map((deviceType) => (
            <div key={deviceType} className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
              <span className="text-sm font-medium text-purple-800 capitalize">{deviceType}</span>
            </div>
          )) || (
            <div className="text-gray-500 text-center py-4">No device types available</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">AI Analytics Dashboard</h3>
        <button 
          onClick={loadAnalytics}
          className="inline-flex items-center px-3 py-2 rounded-lg bg-my-primary text-white hover:bg-my-primary/90"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
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
          User Behavior
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
          Recommendations
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
           Model Performance
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
           Interaction Types
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
