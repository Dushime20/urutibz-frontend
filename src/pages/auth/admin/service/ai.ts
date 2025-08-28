import axios from 'axios';
import { API_BASE_URL, createAuthHeaders, createJsonHeaders, handleApiError } from './config';

// AI Interactions API Service

// Interface for interaction payload
export interface InteractionPayload {
  userId?: string;
  sessionId?: string;
  actionType: 'click' | 'view' | 'favorite' | 'unfavorite' | 'navigate' | 'other';
  targetType: 'product' | 'category' | 'button' | 'link' | 'other';
  targetId?: string;
  pageUrl?: string;
  referrerUrl?: string;
  userAgent?: string;
  deviceType?: 'mobile' | 'desktop' | 'tablet' | 'other';
  metadata?: Record<string, unknown>;
}

// Interface for interaction types response
export interface InteractionTypesResponse {
  actionTypes: string[];
  targetTypes: string[];
  deviceTypes: string[];
}

export interface InteractionTypesMeta {
  actionTypesCount: number;
  targetTypesCount: number;
  deviceTypesCount: number;
}

export interface InteractionTypesData {
  success: boolean;
  data: InteractionTypesResponse;
  meta: InteractionTypesMeta;
}

// Interface for user behavior analytics
export interface UserBehaviorAnalytics {
  totalInteractions: number;
  uniqueUsers: number;
  interactionsByType: Record<string, number>;
  interactionsByTarget: Record<string, number>;
  topActions: Array<{ action: string; count: number }>;
  topTargets: Array<{ target: string; count: number }>;
  timeSeriesData?: Array<{ date: string; interactions: number }>;
}

// Interface for recommendation analytics
export interface RecommendationAnalytics {
  totalRecommendations: number;
  acceptedRecommendations: number;
  rejectionRate: number;
  recommendationsByType: Record<string, number>;
  topRecommendationTypes: Array<{ type: string; count: number; acceptanceRate: number }>;
  userEngagement: Array<{ userId: string; recommendations: number; accepted: number }>;
}

// Interface for model performance metrics
export interface ModelPerformanceMetrics {
  modelType: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  latency: number;
  throughput: number;
  lastUpdated: string;
  trainingDataSize?: number;
  version?: string;
}

/**
 * Log user interaction
 * POST /api/v1/ai/interactions
 */
export async function logInteraction(payload: InteractionPayload, token?: string) {
  const url = `${API_BASE_URL}/ai/interactions`;
  const headers = createJsonHeaders(token);
  try {
    await axios.post(url, payload, { headers });
    return { success: true, error: null };
  } catch (err: any) {
    // swallow errors; tracking should not break UX
    console.warn('Failed to log interaction:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Get product interactions
 * GET /api/v1/ai/interactions
 */
export async function getProductInteractions(
  targetId: string, 
  actionType?: string, 
  limit: number = 5,
  token?: string
) {
  const url = `${API_BASE_URL}/ai/interactions`;
  const params = new URLSearchParams();
  params.append('targetType', 'product');
  params.append('targetId', targetId);
  if (actionType) params.append('actionType', actionType);
  params.append('limit', String(limit));
  
  const headers = createAuthHeaders(token);
  
  try {
    const response = await axios.get(`${url}?${params.toString()}`, { headers });
    return {
      success: Boolean(response.data?.success),
      data: Array.isArray(response.data?.data) ? response.data.data : [],
      meta: response.data?.meta || null,
      error: null
    };
  } catch (err: any) {
    const errorMsg = handleApiError(err, 'Failed to fetch product interactions');
    return { 
      success: false, 
      data: [], 
      meta: null,
      error: errorMsg
    };
  }
}

/**
 * Get available interaction types
 * GET /api/v1/ai/interactions/types
 */
export async function getInteractionTypes(token?: string): Promise<{
  success: boolean;
  data: InteractionTypesResponse;
  error: string | null;
}> {
  const url = `${API_BASE_URL}/ai/interactions/types`;
  try {
    const headers = createAuthHeaders(token);
    const response = await axios.get(url, { headers });
    return {
      success: Boolean(response.data?.success),
      data: response.data?.data || { actionTypes: [], targetTypes: [], deviceTypes: [] },
      error: null
    };
  } catch (err: any) {
    const errorMsg = handleApiError(err, 'Failed to fetch interaction types');
    console.error('Error fetching interaction types:', errorMsg);
    return {
      success: false,
      data: { actionTypes: [], targetTypes: [], deviceTypes: [] },
      error: errorMsg
    };
  }
}

/**
 * Fetch interaction types (alias for getInteractionTypes)
 * GET /api/v1/ai/interactions/types
 */
export async function fetchInteractionTypes(
  filters?: {
    actionType?: string;
    targetType?: string;
    deviceType?: string;
  },
  token?: string
): Promise<InteractionTypesResponse> {
  const url = `${API_BASE_URL}/ai/interactions/types`;
  const headers = createAuthHeaders(token);
  
  try {
    const queryParams = new URLSearchParams();
    if (filters?.actionType) queryParams.append('actionType', filters.actionType);
    if (filters?.targetType) queryParams.append('targetType', filters.targetType);
    if (filters?.deviceType) queryParams.append('deviceType', filters.deviceType);
    
    const fullUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;
    const response = await axios.get(fullUrl, { headers });
    
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    
    // Return mock data for demo mode
    return {
      actionTypes: [
        "view", "search", "click", "book", "favorite", 
        "share", "rate", "review", "compare", "filter"
      ],
      targetTypes: [
        "product", "category", "user", "search_result", 
        "recommendation", "listing"
      ],
      deviceTypes: [
        "desktop", "mobile", "tablet", "unknown"
      ]
    };
  } catch (err: any) {
    console.warn('Failed to fetch interaction types:', err);
    // Return mock data on error
    return {
      actionTypes: ["view", "click", "favorite"],
      targetTypes: ["product", "category"],
      deviceTypes: ["desktop", "mobile"]
    };
  }
}

/**
 * Get user behavior analytics
 * GET /api/v1/ai/analytics/user-behavior
 */
export async function getUserBehaviorAnalytics(token?: string, params?: {
  startDate?: string;
  endDate?: string;
  userId?: string;
  actionType?: string;
  targetType?: string;
}): Promise<{
  success: boolean;
  data: UserBehaviorAnalytics | {};
  error: string | null;
}> {
  const url = `${API_BASE_URL}/ai/analytics/user-behavior`;
  try {
    const headers = createAuthHeaders(token);
    const queryParams = new URLSearchParams();
    
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.actionType) queryParams.append('actionType', params.actionType);
    if (params?.targetType) queryParams.append('targetType', params.targetType);
    
    const fullUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;
    const response = await axios.get(fullUrl, { headers });
    
    return {
      success: Boolean(response.data?.success),
      data: response.data?.data || {},
      error: null
    };
  } catch (err: any) {
    const errorMsg = handleApiError(err, 'Failed to fetch user behavior analytics');
    console.error('Error fetching user behavior analytics:', errorMsg);
    return {
      success: false,
      data: {},
      error: errorMsg
    };
  }
}

/**
 * Get recommendation analytics
 * GET /api/v1/ai/analytics/recommendations
 */
export async function getRecommendationAnalytics(token?: string, params?: {
  startDate?: string;
  endDate?: string;
  recommendationType?: string;
  targetId?: string;
  userId?: string;
}): Promise<{
  success: boolean;
  data: RecommendationAnalytics | {};
  error: string | null;
}> {
  const url = `${API_BASE_URL}/ai/analytics/recommendations`;
  try {
    const headers = createAuthHeaders(token);
    const queryParams = new URLSearchParams();
    
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.recommendationType) queryParams.append('recommendationType', params.recommendationType);
    if (params?.targetId) queryParams.append('targetId', params.targetId);
    if (params?.userId) queryParams.append('userId', params.userId);
    
    const fullUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;
    const response = await axios.get(fullUrl, { headers });
    
    return {
      success: Boolean(response.data?.success),
      data: response.data?.data || {},
      error: null
    };
  } catch (err: any) {
    const errorMsg = handleApiError(err, 'Failed to fetch recommendation analytics');
    console.error('Error fetching recommendation analytics:', errorMsg);
    return {
      success: false,
      data: {},
      error: errorMsg
    };
  }
}

/**
 * Get model performance metrics
 * GET /api/v1/ai/metrics/model-performance
 */
export async function getModelPerformanceMetrics(token?: string, params?: {
  startDate?: string;
  endDate?: string;
  modelType?: string;
  metric?: string;
}): Promise<{
  success: boolean;
  data: ModelPerformanceMetrics | {};
  error: string | null;
}> {
  const url = `${API_BASE_URL}/ai/metrics/model-performance`;
  try {
    const headers = createAuthHeaders(token);
    const queryParams = new URLSearchParams();
    
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.modelType) queryParams.append('modelType', params.modelType);
    if (params?.metric) queryParams.append('metric', params.metric);
    
    const fullUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;
    const response = await axios.get(fullUrl, { headers });
    
    return {
      success: Boolean(response.data?.success),
      data: response.data?.data || {},
      error: null
    };
  } catch (err: any) {
    const errorMsg = handleApiError(err, 'Failed to fetch model performance metrics');
    console.error('Error fetching model performance metrics:', errorMsg);
    return {
      success: false,
      data: {},
      error: errorMsg
    };
  }
}

// Utility functions for common AI operations

/**
 * Track a simple click interaction
 */
export async function trackClick(
  targetId: string,
  targetType: string = 'product',
  metadata?: Record<string, unknown>,
  token?: string
) {
  const payload: InteractionPayload = {
    actionType: 'click',
    targetType: targetType as any,
    targetId,
    pageUrl: window.location.href,
    referrerUrl: document.referrer,
    userAgent: navigator.userAgent,
    deviceType: getDeviceType(),
    metadata
  };
  
  return logInteraction(payload, token);
}

/**
 * Track a view interaction
 */
export async function trackView(
  targetId: string,
  targetType: string = 'product',
  metadata?: Record<string, unknown>,
  token?: string
) {
  const payload: InteractionPayload = {
    actionType: 'view',
    targetType: targetType as any,
    targetId,
    pageUrl: window.location.href,
    referrerUrl: document.referrer,
    userAgent: navigator.userAgent,
    deviceType: getDeviceType(),
    metadata
  };
  
  return logInteraction(payload, token);
}

/**
 * Track a favorite interaction
 */
export async function trackFavorite(
  targetId: string,
  targetType: string = 'product',
  metadata?: Record<string, unknown>,
  token?: string
) {
  const payload: InteractionPayload = {
    actionType: 'favorite',
    targetType: targetType as any,
    targetId,
    pageUrl: window.location.href,
    referrerUrl: document.referrer,
    userAgent: navigator.userAgent,
    deviceType: getDeviceType(),
    metadata
  };
  
  return logInteraction(payload, token);
}

/**
 * Track an unfavorite interaction
 */
export async function trackUnfavorite(
  targetId: string,
  targetType: string = 'product',
  metadata?: Record<string, unknown>,
  token?: string
) {
  const payload: InteractionPayload = {
    actionType: 'unfavorite',
    targetType: targetType as any,
    targetId,
    pageUrl: window.location.href,
    referrerUrl: document.referrer,
    userAgent: navigator.userAgent,
    deviceType: getDeviceType(),
    metadata
  };
  
  return logInteraction(payload, token);
}

/**
 * Helper function to determine device type
 */
function getDeviceType(): 'mobile' | 'desktop' | 'tablet' | 'other' {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/mobile|android|iphone|ipad|phone|blackberry|opera mini|iemobile/.test(userAgent)) {
    if (/tablet|ipad/.test(userAgent)) {
      return 'tablet';
    }
    return 'mobile';
  }
  
  return 'desktop';
}

/**
 * Fetch user behavior analytics
 * GET /api/v1/ai/analytics/user-behavior
 */
export async function fetchUserBehaviorAnalytics(
  filters?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    actionType?: string;
    targetType?: string;
  },
  token?: string
): Promise<UserBehaviorAnalytics> {
  const url = `${API_BASE_URL}/ai/analytics/user-behavior`;
  const headers = createAuthHeaders(token);
  
  try {
    const response = await axios.get(url, { 
      headers,
      params: filters 
    });
    
    if (response.data?.success && response.data?.data) {
      console.log('API returned real data:', response.data.data);
      
      const apiData = response.data.data;
      
      // Transform API response to match component interface
      const transformedData: UserBehaviorAnalytics = {
        totalInteractions: apiData.totalInteractions || 0,
        uniqueUsers: apiData.uniqueUsers || 0,
        
        // Transform topActions from API format to component format
        topActions: apiData.topActions ? apiData.topActions.map((item: any) => ({
          action: item.actionType || item.action || 'unknown',
          count: item.count || 0
        })) : [],
        
        // Create interactionsByType from topActions
        interactionsByType: apiData.topActions ? 
          apiData.topActions.reduce((acc: Record<string, number>, item: any) => {
            const actionType = item.actionType || item.action || 'unknown';
            acc[actionType] = item.count || 0;
            return acc;
          }, {}) : {},
        
        // Create interactionsByTarget (since API doesn't provide this, we'll use device breakdown as a fallback)
        interactionsByTarget: apiData.deviceBreakdown ? 
          apiData.deviceBreakdown.reduce((acc: Record<string, number>, item: any) => {
            acc[item.deviceType || 'unknown'] = item.count || 0;
            return acc;
          }, {}) : {},
        
        // Create topTargets from device breakdown
        topTargets: apiData.deviceBreakdown ? 
          apiData.deviceBreakdown.map((item: any) => ({
            target: item.deviceType || 'unknown',
            count: item.count || 0
          })) : [],
        
        // Transform hourly activity to time series data
        timeSeriesData: apiData.hourlyActivity ? 
          apiData.hourlyActivity.map((item: any) => ({
            date: `Hour ${item.hour}`,
            interactions: item.interactions || 0
          })) : []
      };
      
      console.log('Transformed data for component:', transformedData);
      return transformedData;
    }
    
    console.log('API returned no data, using mock data');
    // Return mock data for demo mode
    return {
      totalInteractions: 1250,
      uniqueUsers: 89,
      interactionsByType: {
        click: 450,
        view: 680,
        favorite: 120
      },
      interactionsByTarget: {
        product: 890,
        category: 280,
        button: 80
      },
      topActions: [
        { action: 'view', count: 680 },
        { action: 'click', count: 450 },
        { action: 'favorite', count: 120 }
      ],
      topTargets: [
        { target: 'product', count: 890 },
        { target: 'category', count: 280 },
        { target: 'button', count: 80 }
      ],
      timeSeriesData: [
        { date: '2024-01-01', interactions: 45 },
        { date: '2024-01-02', interactions: 52 },
        { date: '2024-01-03', interactions: 48 }
      ]
    };
  } catch (err: any) {
    console.warn('Failed to fetch user behavior analytics:', err);
    // Return mock data on error
    return {
      totalInteractions: 0,
      uniqueUsers: 0,
      interactionsByType: {},
      interactionsByTarget: {},
      topActions: [],
      topTargets: [],
      timeSeriesData: []
    };
  }
}

/**
 * Fetch recommendation analytics
 * GET /api/v1/ai/analytics/recommendations
 */
export async function fetchRecommendationAnalytics(
  filters?: {
    startDate?: string;
    endDate?: string;
    recommendationType?: string;
    userId?: string;
  },
  token?: string
): Promise<RecommendationAnalytics> {
  const url = `${API_BASE_URL}/ai/analytics/recommendations`;
  const headers = createAuthHeaders(token);
  
  try {
    const response = await axios.get(url, { 
      headers,
      params: filters 
    });
    
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    
    // Return mock data for demo mode
    return {
      totalRecommendations: 340,
      acceptedRecommendations: 289,
      rejectionRate: 0.15,
      recommendationsByType: {
        'similar_products': 120,
        'category_suggestions': 95,
        'trending_items': 85,
        'personalized': 40
      },
      topRecommendationTypes: [
        { type: 'similar_products', count: 120, acceptanceRate: 0.85 },
        { type: 'category_suggestions', count: 95, acceptanceRate: 0.78 },
        { type: 'trending_items', count: 85, acceptanceRate: 0.72 }
      ],
      userEngagement: [
        { userId: 'user1', recommendations: 15, accepted: 12 },
        { userId: 'user2', recommendations: 12, accepted: 10 },
        { userId: 'user3', recommendations: 8, accepted: 6 }
      ]
    };
  } catch (err: any) {
    console.warn('Failed to fetch recommendation analytics:', err);
    // Return mock data on error
    return {
      totalRecommendations: 0,
      acceptedRecommendations: 0,
      rejectionRate: 0,
      recommendationsByType: {},
      topRecommendationTypes: [],
      userEngagement: []
    };
  }
}

/**
 * Fetch model performance metrics
 * GET /api/v1/ai/metrics/model-performance
 */
export async function fetchModelPerformanceMetrics(
  filters?: {
    modelType?: string;
    startDate?: string;
    endDate?: string;
  },
  token?: string
): Promise<ModelPerformanceMetrics> {
  const url = `${API_BASE_URL}/ai/metrics/model-performance`;
  const headers = createAuthHeaders(token);
  
  try {
    const response = await axios.get(url, { 
      headers,
      params: filters 
    });
    
    if (response.data?.success && response.data?.data) {
      return response.data.data;
    }
    
    // Return mock data for demo mode
    return {
      modelType: 'recommendation_engine',
      accuracy: 0.87,
      precision: 0.84,
      recall: 0.89,
      f1Score: 0.86,
      latency: 45,
      throughput: 1200,
      lastUpdated: new Date().toISOString(),
      trainingDataSize: 50000,
      version: '1.2.0'
    };
  } catch (err: any) {
    console.warn('Failed to fetch model performance metrics:', err);
    // Return mock data on error
    return {
      modelType: 'unknown',
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      latency: 0,
      throughput: 0,
      lastUpdated: new Date().toISOString()
    };
  }
}
