import axios from 'axios';
import type {
  RiskProfile,
  PolicyViolation,
  EnforcementAction,
  RiskAssessment,
  ComplianceCheck,
  RiskManagementStats,
  RiskManagementStatsResponse,
  RiskManagementTrendsResponse,
  CreateRiskProfileRequest,
  BulkCreateRiskProfileRequest,
  BulkCreateRiskProfileResponse,
  CreateViolationRequest,
  CreateEnforcementActionRequest,
  RiskAssessmentRequest,
  BulkRiskAssessmentRequest,
  ComplianceCheckRequest,
  RiskProfileFilters,
  ViolationFilters,
  EnforcementFilters,
  AssessmentFilters,
  PaginatedResponse,
  ExportOptions,
  ExportResult,
  RiskLevel,
  ViolationType,
  ViolationSeverity,
  ViolationStatus,
  RiskEnforcementRequest,
  RiskEnforcementResponse
} from '../types/riskManagement';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Create axios instance with interceptors
const riskManagementApi = axios.create({
  baseURL: `${API_BASE_URL}/risk-management`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
riskManagementApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
riskManagementApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Risk Management Service
export const riskManagementService = {
  // Risk Profile Management (ADMIN/SUPER_ADMIN only)
  
  /**
   * Create a new risk profile
   */
  async createRiskProfile(data: CreateRiskProfileRequest): Promise<RiskProfile> {
    const response = await riskManagementApi.post('/profiles', data);
    return response.data.data || response.data;
  },

  /**
   * Create multiple risk profiles in bulk
   */
  async createRiskProfilesBulk(data: BulkCreateRiskProfileRequest): Promise<BulkCreateRiskProfileResponse> {
    try {
      // Validate and normalize the data before sending
      const normalizedData = this.normalizeBulkCreateData(data);
      
      // Debug logging to help identify JSON validation issues
      console.log('🔍 Sending bulk create request:', {
        profileCount: normalizedData.profiles.length,
        sampleProfile: normalizedData.profiles[0],
        inspectionTypes: normalizedData.profiles[0]?.mandatoryRequirements?.inspectionTypes,
        riskFactors: normalizedData.profiles[0]?.riskFactors,
        mitigationStrategies: normalizedData.profiles[0]?.mitigationStrategies
      });
      
      const response = await riskManagementApi.post('/profiles/bulk', normalizedData);
      
      // Return the response in the expected format
      return {
        success: true,
        message: response.data.message || 'Bulk risk profile creation completed',
        data: {
          successful: response.data.data?.successful || 0,
          failed: response.data.data?.failed || 0,
          results: response.data.data?.results || [],
          errors: response.data.data?.errors || []
        }
      };
    } catch (error: any) {
      // Enhanced error logging
      console.error('❌ Bulk create error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Handle different types of errors
      if (error.response?.status === 400) {
        // Validation errors
        const validationErrors = error.response.data?.errors || [];
        return {
          success: false,
          message: 'Validation failed',
          data: {
            successful: 0,
            failed: data.profiles.length,
            results: [],
            errors: validationErrors.map((err: any, index: number) => ({
              data: data.profiles[index] || {},
              error: err.message || 'Validation error'
            }))
          }
        };
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.');
      } else if (error.response?.status === 403) {
        throw new Error('Insufficient permissions. Admin access required.');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Failed to create risk profiles');
      }
    }
  },

  /**
   * Normalize bulk create data to ensure proper format
   */
  normalizeBulkCreateData(data: BulkCreateRiskProfileRequest): BulkCreateRiskProfileRequest {
    return {
      profiles: data.profiles.map(profile => {
        // Ensure arrays are properly formatted and allow empty arrays
        const normalizedProfile = {
          productId: String(profile.productId).trim(),
          categoryId: String(profile.categoryId).trim(),
          riskLevel: profile.riskLevel,
          mandatoryRequirements: {
            insurance: Boolean(profile.mandatoryRequirements.insurance),
            inspection: Boolean(profile.mandatoryRequirements.inspection),
            minCoverage: Number(profile.mandatoryRequirements.minCoverage) || 0,
            inspectionTypes: Array.isArray(profile.mandatoryRequirements.inspectionTypes) 
              ? profile.mandatoryRequirements.inspectionTypes.filter(item => item != null && item !== '')
              : [],
            complianceDeadlineHours: Number(profile.mandatoryRequirements.complianceDeadlineHours) || 24
          },
          riskFactors: Array.isArray(profile.riskFactors) 
            ? profile.riskFactors.filter(item => item != null && item !== '')
            : [],
          mitigationStrategies: Array.isArray(profile.mitigationStrategies) 
            ? profile.mitigationStrategies.filter(item => item != null && item !== '')
            : [],
          enforcementLevel: profile.enforcementLevel,
          autoEnforcement: Boolean(profile.autoEnforcement),
          gracePeriodHours: Number(profile.gracePeriodHours) || 48
        };
        
        // Debug logging for each profile
        console.log('🔧 Normalized profile:', {
          productId: normalizedProfile.productId,
          inspectionTypes: normalizedProfile.mandatoryRequirements.inspectionTypes,
          riskFactors: normalizedProfile.riskFactors,
          mitigationStrategies: normalizedProfile.mitigationStrategies
        });
        
        return normalizedProfile;
      })
    };
  },

  /**
   * Get risk profiles with filters and pagination
   */
  async getRiskProfiles(
    filters?: RiskProfileFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<RiskProfile>> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.productId) params.append('productId', filters.productId);
      if (filters?.categoryId) params.append('categoryId', filters.categoryId);
      if (filters?.riskLevel?.length) {
        filters.riskLevel.forEach(level => params.append('riskLevel', level));
      }
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      if (filters?.createdBy) params.append('createdBy', filters.createdBy);
      if (filters?.dateRange?.start) params.append('startDate', filters.dateRange.start);
      if (filters?.dateRange?.end) params.append('endDate', filters.dateRange.end);
      if (filters?.search) params.append('search', filters.search);
      
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await riskManagementApi.get(`/profiles?${params.toString()}`);
      
      // Map the API response to match our expected structure
      const apiData = response.data.data;
      const profiles = apiData.profiles || [];
      const pagination = apiData.pagination || {};
      
      // Transform each profile to match our RiskProfile interface
      const mappedProfiles: RiskProfile[] = profiles.map((profile: any) => ({
        id: profile.id,
        productId: profile.productId,
        categoryId: profile.categoryId,
        riskLevel: profile.riskLevel as RiskLevel,
        mandatoryRequirements: [
          ...(profile.mandatoryInsurance ? ['Mandatory Insurance'] : []),
          ...(profile.mandatoryInspection ? ['Mandatory Inspection'] : []),
          ...(profile.minCoverage ? [`Minimum Coverage: $${profile.minCoverage}`] : []),
          ...(profile.inspectionTypes?.types || []).map((type: string) => `Inspection Type: ${type}`),
          ...(profile.complianceDeadlineHours ? [`Compliance Deadline: ${profile.complianceDeadlineHours} hours`] : []),
          ...(profile.gracePeriodHours ? [`Grace Period: ${profile.gracePeriodHours} hours`] : [])
        ],
        optionalRequirements: [
          ...(profile.enforcementLevel ? [`Enforcement Level: ${profile.enforcementLevel}`] : []),
          ...(profile.autoEnforcement ? ['Auto Enforcement Enabled'] : [])
        ],
        // Additional fields from API
        productName: profile.productName,
        productDescription: profile.productDescription,
        categoryName: profile.categoryName,
        mandatoryInsurance: profile.mandatoryInsurance,
        mandatoryInspection: profile.mandatoryInspection,
        minCoverage: profile.minCoverage,
        inspectionTypes: profile.inspectionTypes,
        complianceDeadlineHours: profile.complianceDeadlineHours,
        gracePeriodHours: profile.gracePeriodHours,
        enforcementLevel: profile.enforcementLevel,
        autoEnforcement: profile.autoEnforcement,
        riskFactors: (profile.riskFactors?.factors || []).map((factor: string) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: factor,
          description: `Risk factor: ${factor}`,
          weight: profile.riskLevel === 'critical' ? 9 : profile.riskLevel === 'high' ? 7 : profile.riskLevel === 'medium' ? 5 : 3,
          impact: profile.riskLevel === 'critical' ? 8 : profile.riskLevel === 'high' ? 6 : profile.riskLevel === 'medium' ? 4 : 2,
          probability: profile.riskLevel === 'critical' ? 6 : profile.riskLevel === 'high' ? 5 : profile.riskLevel === 'medium' ? 4 : 3,
          mitigationStrategies: (profile.mitigationStrategies?.strategies || []).length > 0 
            ? profile.mitigationStrategies.strategies 
            : ['Regular maintenance', 'User training', 'Safety protocols']
        })),
        complianceRules: [
          {
            id: Math.random().toString(36).substr(2, 9),
            name: 'Insurance Requirement',
            description: 'Mandatory insurance coverage requirement',
            requirement: profile.mandatoryInsurance ? 'Insurance required' : 'Insurance optional',
            validationCriteria: ['Valid insurance policy', 'Coverage amount verification'],
            enforcementAction: profile.enforcementLevel === 'very_strict' ? 'termination' : 
                              profile.enforcementLevel === 'strict' ? 'suspension' : 
                              profile.enforcementLevel === 'moderate' ? 'penalty' : 'warning',
            isMandatory: profile.mandatoryInsurance
          },
          {
            id: Math.random().toString(36).substr(2, 9),
            name: 'Inspection Requirement',
            description: 'Mandatory inspection requirement',
            requirement: profile.mandatoryInspection ? 'Inspection required' : 'Inspection optional',
            validationCriteria: ['Pre-rental inspection', 'Post-return inspection'],
            enforcementAction: profile.enforcementLevel === 'very_strict' ? 'termination' : 
                              profile.enforcementLevel === 'strict' ? 'suspension' : 
                              profile.enforcementLevel === 'moderate' ? 'penalty' : 'warning',
            isMandatory: profile.mandatoryInspection
          }
        ],
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
        createdBy: 'system', // Not provided in API
        updatedBy: 'system', // Not provided in API
        isActive: true, // Assume active if not specified
        version: 1
      }));

      return {
        data: mappedProfiles,
        total: pagination.total || 0,
        page: pagination.page || page,
        limit: pagination.limit || limit,
        totalPages: pagination.totalPages || 0,
        hasNext: pagination.hasNext || false,
        hasPrev: pagination.hasPrev || false
      };
    } catch (error: any) {
      // If API endpoint doesn't exist (404), return empty data structure
      if (error.response?.status === 404) {
        return {
          data: [],
          total: 0,
          page: page,
          limit: limit,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        };
      }
      throw error;
    }
  },

  /**
   * Get risk profile by ID
   */
  async getRiskProfile(id: string): Promise<RiskProfile> {
    const response = await riskManagementApi.get(`/profiles/${id}`);
    return response.data.data || response.data;
  },

  /**
   * Get risk profile for a specific product
   */
  async getRiskProfileByProduct(productId: string): Promise<RiskProfile> {
    const response = await riskManagementApi.get(`/profiles/product/${productId}`);
    return response.data.data || response.data;
  },

  /**
   * Update risk profile
   */
  async updateRiskProfile(id: string, data: Partial<CreateRiskProfileRequest>): Promise<RiskProfile> {
    const response = await riskManagementApi.put(`/profiles/${id}`, data);
    return response.data.data || response.data;
  },

  /**
   * Delete risk profile
   */
  async deleteRiskProfile(id: string): Promise<void> {
    await riskManagementApi.delete(`/profiles/${id}`);
  },

  // Policy Violation Management (ADMIN/SUPER_ADMIN/INSPECTOR)

  /**
   * Create a new policy violation
   */
  async createViolation(data: CreateViolationRequest): Promise<PolicyViolation> {
    const response = await riskManagementApi.post('/violations', data);
    return response.data.data || response.data;
  },

  /**
   * Get violations with filters and pagination
   */
  async getViolations(
    filters?: ViolationFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<PolicyViolation>> {
    const params = new URLSearchParams();
    
    if (filters?.violationType?.length) {
      filters.violationType.forEach(type => params.append('violationType', type));
    }
    if (filters?.severity?.length) {
      filters.severity.forEach(severity => params.append('severity', severity));
    }
    if (filters?.status?.length) {
      filters.status.forEach(status => params.append('status', status));
    }
    if (filters?.productId) params.append('productId', filters.productId);
    if (filters?.bookingId) params.append('bookingId', filters.bookingId);
    if (filters?.inspectorId) params.append('inspectorId', filters.inspectorId);
    if (filters?.reportedBy) params.append('reportedBy', filters.reportedBy);
    if (filters?.dateRange?.start) params.append('startDate', filters.dateRange.start);
    if (filters?.dateRange?.end) params.append('endDate', filters.dateRange.end);
    if (filters?.search) params.append('search', filters.search);
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    try {
      const response = await riskManagementApi.get(`/violations?${params.toString()}`);
      const apiData = response.data.data;
      
      // Map the API response to match our expected structure
      const violations = apiData.violations || [];
      const pagination = apiData.pagination || {};
      
      // Transform each violation to match our PolicyViolation interface
      const mappedViolations: PolicyViolation[] = violations.map((violation: any) => ({
        id: violation.id,
        bookingId: violation.bookingId,
        productId: violation.productId,
        violatorId: violation.violatorId,
        violationType: violation.violationType as ViolationType,
        severity: violation.severity as ViolationSeverity,
        description: violation.description,
        penaltyAmount: violation.penaltyAmount,
        status: violation.status as ViolationStatus,
        resolutionActions: violation.resolutionActions || [],
        resolvedAt: violation.resolvedAt,
        detectedAt: violation.detectedAt,
        createdAt: violation.createdAt,
        updatedAt: violation.updatedAt,
        // Additional API fields
        productName: violation.productName,
        productDescription: violation.productDescription,
        violatorName: violation.violatorName,
        violatorEmail: violation.violatorEmail,
        // Backward compatibility
        renterId: violation.violatorId, // Map violatorId to renterId for compatibility
        affectedUserId: violation.violatorId // Map violatorId to affectedUserId for compatibility
      }));

      return {
        data: mappedViolations,
        total: pagination.total || 0,
        page: pagination.page || page,
        limit: pagination.limit || limit,
        totalPages: pagination.totalPages || 0,
        hasNext: pagination.hasNext || false,
        hasPrev: pagination.hasPrev || false
      };
    } catch (error: any) {
      // If API endpoint doesn't exist (404), return empty data structure
      if (error.response?.status === 404) {
        return {
          data: [],
          total: 0,
          page: page,
          limit: limit,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        };
      }
      throw error;
    }
  },

  /**
   * Get violation by ID
   */
  async getViolation(id: string): Promise<PolicyViolation> {
    const response = await riskManagementApi.get(`/violations/${id}`);
    return response.data.data || response.data;
  },

  /**
   * Delete violation
   */
  async deleteViolation(id: string): Promise<void> {
    await riskManagementApi.delete(`/violations/${id}`);
  },

  /**
   * Update violation
   */
  async updateViolation(id: string, data: Partial<CreateViolationRequest>): Promise<PolicyViolation> {
    const response = await riskManagementApi.put(`/violations/${id}`, data);
    return response.data.data || response.data;
  },

  /**
   * Assign violation to inspector
   */
  async assignViolation(id: string, inspectorId: string): Promise<PolicyViolation> {
    const response = await riskManagementApi.patch(`/violations/${id}/assign`, { inspectorId });
    return response.data.data || response.data;
  },

  /**
   * Resolve violation
   */
  async resolveViolation(id: string, resolutionNotes: string): Promise<PolicyViolation> {
    const response = await riskManagementApi.patch(`/violations/${id}/resolve`, { resolutionNotes });
    return response.data.data || response.data;
  },

  // Enforcement Actions (ADMIN/SUPER_ADMIN only)

  /**
   * Create enforcement action
   */
  async createEnforcementAction(data: CreateEnforcementActionRequest): Promise<EnforcementAction> {
    const response = await riskManagementApi.post('/enforce', data);
    return response.data.data || response.data;
  },

  /**
   * Get enforcement actions with filters and pagination
   */
  async getEnforcementActions(
    filters?: EnforcementFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<EnforcementAction>> {
    const params = new URLSearchParams();
    
    if (filters?.actionType?.length) {
      filters.actionType.forEach(type => params.append('actionType', type));
    }
    if (filters?.status?.length) {
      filters.status.forEach(status => params.append('status', status));
    }
    if (filters?.violationId) params.append('violationId', filters.violationId);
    if (filters?.targetUserId) params.append('targetUserId', filters.targetUserId);
    if (filters?.approvedBy) params.append('approvedBy', filters.approvedBy);
    if (filters?.executedBy) params.append('executedBy', filters.executedBy);
    if (filters?.dateRange?.start) params.append('startDate', filters.dateRange.start);
    if (filters?.dateRange?.end) params.append('endDate', filters.dateRange.end);
    if (filters?.search) params.append('search', filters.search);
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await riskManagementApi.get(`/enforce?${params.toString()}`);
    return response.data.data || response.data;
  },

  /**
   * Approve enforcement action
   */
  async approveEnforcementAction(id: string): Promise<EnforcementAction> {
    const response = await riskManagementApi.patch(`/enforce/${id}/approve`);
    return response.data.data || response.data;
  },

  /**
   * Execute enforcement action
   */
  async executeEnforcementAction(id: string, executionNotes: string): Promise<EnforcementAction> {
    const response = await riskManagementApi.patch(`/enforce/${id}/execute`, { executionNotes });
    return response.data.data || response.data;
  },

  // Risk Assessment (All authenticated users)

  /**
   * Perform risk assessment
   */
  async assessRisk(data: RiskAssessmentRequest): Promise<RiskAssessment> {
    const response = await riskManagementApi.post('/assess', data);
    return response.data.data || response.data;
  },

  /**
   * Perform bulk risk assessment
   */
  async assessRiskBulk(data: BulkRiskAssessmentRequest): Promise<RiskAssessment[]> {
    const response = await riskManagementApi.post('/assess/bulk', data);
    return response.data.data || response.data;
  },

  /**
   * Get risk assessments with filters and pagination
   */
  async getRiskAssessments(
    filters?: AssessmentFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<RiskAssessment>> {
    const params = new URLSearchParams();
    
    if (filters?.productId) params.append('productId', filters.productId);
    if (filters?.bookingId) params.append('bookingId', filters.bookingId);
    if (filters?.assessedBy) params.append('assessedBy', filters.assessedBy);
    if (filters?.riskLevel?.length) {
      filters.riskLevel.forEach(level => params.append('riskLevel', level));
    }
    if (filters?.complianceStatus?.length) {
      filters.complianceStatus.forEach(status => params.append('complianceStatus', status));
    }
    if (filters?.dateRange?.start) params.append('startDate', filters.dateRange.start);
    if (filters?.dateRange?.end) params.append('endDate', filters.dateRange.end);
    if (filters?.search) params.append('search', filters.search);
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await riskManagementApi.get(`/assessments?${params.toString()}`);
    return response.data.data || response.data;
  },

  /**
   * Get risk assessment by ID
   */
  async getRiskAssessment(id: string): Promise<RiskAssessment> {
    const response = await riskManagementApi.get(`/assessments/${id}`);
    return response.data.data || response.data;
  },

  // Compliance Checking (All authenticated users)

  /**
   * Perform compliance check
   */
  async checkCompliance(data: ComplianceCheckRequest): Promise<ComplianceCheck> {
    const response = await riskManagementApi.post('/compliance/check', data);
    return response.data.data || response.data;
  },

  /**
   * Get compliance check for booking
   */
  async getComplianceCheck(bookingId: string): Promise<ComplianceCheck> {
    const response = await riskManagementApi.get(`/compliance/booking/${bookingId}`);
    return response.data.data || response.data;
  },

  /**
   * Get compliance checks with filters and pagination
   */
  async getComplianceChecks(
    filters?: {
      bookingId?: string;
      checkedBy?: string;
      complianceStatus?: string[];
      dateRange?: { start: string; end: string };
      search?: string;
    },
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<ComplianceCheck>> {
    const params = new URLSearchParams();
    
    if (filters?.bookingId) params.append('bookingId', filters.bookingId);
    if (filters?.checkedBy) params.append('checkedBy', filters.checkedBy);
    if (filters?.complianceStatus?.length) {
      filters.complianceStatus.forEach(status => params.append('complianceStatus', status));
    }
    if (filters?.dateRange?.start) params.append('startDate', filters.dateRange.start);
    if (filters?.dateRange?.end) params.append('endDate', filters.dateRange.end);
    if (filters?.search) params.append('search', filters.search);
    
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await riskManagementApi.get(`/compliance/checks?${params.toString()}`);
    return response.data.data || response.data;
  },

  // Statistics and Analytics (ADMIN/SUPER_ADMIN only)

  /**
   * Get risk management statistics
   */
  async getStats(): Promise<RiskManagementStats> {
    const response = await riskManagementApi.get('/stats');
    return response.data.data || response.data;
  },

  /**
   * Get dashboard widgets data
   */
  async getDashboardWidgets(): Promise<any[]> {
    const response = await riskManagementApi.get('/dashboard/widgets');
    return response.data.data || response.data;
  },

  // Export and Reporting

  /**
   * Export data
   */
  async exportData(
    type: 'profiles' | 'violations' | 'enforcements' | 'assessments' | 'compliance',
    options: ExportOptions
  ): Promise<ExportResult> {
    const response = await riskManagementApi.post(`/export/${type}`, options);
    return response.data.data || response.data;
  },

  /**
   * Generate report
   */
  async generateReport(
    type: 'summary' | 'detailed' | 'compliance' | 'violations',
    options: {
      dateRange?: { start: string; end: string };
      filters?: Record<string, any>;
      format?: 'pdf' | 'excel' | 'csv';
    }
  ): Promise<ExportResult> {
    const response = await riskManagementApi.post(`/reports/${type}`, options);
    return response.data.data || response.data;
  },

  // Utility Methods

  /**
   * Get risk levels
   */
  async getRiskLevels(): Promise<{ value: string; label: string; color: string }[]> {
    return [
      { value: 'low', label: 'Low Risk', color: 'green' },
      { value: 'medium', label: 'Medium Risk', color: 'yellow' },
      { value: 'high', label: 'High Risk', color: 'orange' },
      { value: 'critical', label: 'Critical Risk', color: 'red' }
    ];
  },

  /**
   * Get violation types
   */
  async getViolationTypes(): Promise<{ value: string; label: string }[]> {
    return [
      { value: 'missing_insurance', label: 'Missing Insurance' },
      { value: 'missing_inspection', label: 'Missing Inspection' },
      { value: 'inadequate_coverage', label: 'Inadequate Coverage' },
      { value: 'expired_compliance', label: 'Expired Compliance' }
    ];
  },

  /**
   * Get enforcement action types
   */
  async getEnforcementActionTypes(): Promise<{ value: string; label: string }[]> {
    return [
      { value: 'warning', label: 'Warning' },
      { value: 'penalty', label: 'Penalty' },
      { value: 'suspension', label: 'Suspension' },
      { value: 'termination', label: 'Termination' },
      { value: 'training_required', label: 'Training Required' },
      { value: 'audit_required', label: 'Audit Required' }
    ];
  },

  /**
   * Get risk management statistics
   * GET /api/v1/risk-management/stats
   */
  async getRiskManagementStats(): Promise<RiskManagementStatsResponse> {
    try {
      console.log('📊 Fetching risk management statistics...');
      const response = await riskManagementApi.get('/stats');
      console.log('✅ Risk management statistics retrieved successfully:', response.data);
      
      // Check if the response has the expected structure
      if (response.data && response.data.success && response.data.data) {
        return {
          success: true,
          message: response.data.message || 'Statistics retrieved successfully',
          data: response.data.data
        };
      } else {
        console.warn('⚠️ Unexpected response structure:', response.data);
        throw new Error('Invalid response structure from statistics API');
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch risk management statistics:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.');
      } else if (error.response?.status === 403) {
        throw new Error('Insufficient permissions. Admin or Super Admin access required.');
      } else if (error.response?.status === 404) {
        throw new Error('Statistics endpoint not found. Please check API configuration.');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch risk management statistics');
      }
    }
  },

  /**
   * Get risk management trend data
   * GET /api/v1/risk-management/trends
   */
  async getRiskManagementTrends(period: string = '30d'): Promise<RiskManagementTrendsResponse> {
    try {
      console.log('📈 Fetching risk management trends for period:', period);
      const response = await riskManagementApi.get(`/trends?period=${period}`);
      console.log('✅ Risk management trends retrieved successfully:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        return {
          success: true,
          message: response.data.message || 'Trends retrieved successfully',
          data: response.data.data
        };
      } else {
        console.warn('⚠️ Unexpected trends response structure:', response.data);
        throw new Error('Invalid response structure from trends API');
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch risk management trends:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.');
      } else if (error.response?.status === 403) {
        throw new Error('Insufficient permissions. Admin or Super Admin access required.');
      } else if (error.response?.status === 404) {
        throw new Error('Trends endpoint not found. Please check API configuration.');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch risk management trends');
      }
    }
  },

  /**
   * Trigger risk enforcement for a booking
   * POST /api/v1/risk-management/enforce
   */
  async triggerRiskEnforcement(data: RiskEnforcementRequest): Promise<RiskEnforcementResponse> {
    try {
      console.log('🔍 Triggering risk enforcement for booking:', data.bookingId);
      
      const response = await riskManagementApi.post('/enforce', data);
      
      console.log('✅ Risk enforcement triggered successfully:', response.data);
      
      return {
        success: true,
        message: response.data.message || 'Enforcement triggered successfully',
        data: {
          compliance: response.data.data.compliance,
          violationsRecorded: response.data.data.violationsRecorded
        }
      };
    } catch (error: any) {
      console.error('❌ Risk enforcement failed:', error);
      
      // Handle different types of errors
      if (error.response?.status === 400) {
        throw new Error(error.response.data?.message || 'Invalid booking ID or request data');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.');
      } else if (error.response?.status === 403) {
        throw new Error('Insufficient permissions. Admin or Super Admin access required.');
      } else if (error.response?.status === 404) {
        throw new Error('Booking not found or no risk profile associated');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Failed to trigger risk enforcement');
      }
    }
  }
};

export default riskManagementService;
