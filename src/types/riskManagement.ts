// Risk Management Types and Interfaces

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ViolationType {
  MISSING_INSURANCE = 'missing_insurance',
  MISSING_INSPECTION = 'missing_inspection',
  INADEQUATE_COVERAGE = 'inadequate_coverage',
  EXPIRED_COMPLIANCE = 'expired_compliance'
}

export enum ViolationSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ViolationStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  UNDER_INVESTIGATION = 'under_investigation',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ESCALATED = 'escalated'
}

export enum EnforcementActionType {
  WARNING = 'warning',
  PENALTY = 'penalty',
  SUSPENSION = 'suspension',
  TERMINATION = 'termination',
  TRAINING_REQUIRED = 'training_required',
  AUDIT_REQUIRED = 'audit_required'
}

export enum EnforcementStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  EXECUTED = 'executed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PARTIALLY_COMPLIANT = 'partially_compliant',
  PENDING_REVIEW = 'pending_review',
  UNDER_INVESTIGATION = 'under_investigation'
}

// Core Interfaces
export interface RiskProfile {
  id: string;
  productId: string;
  categoryId: string;
  riskLevel: RiskLevel;
  mandatoryRequirements: string[];
  optionalRequirements: string[];
  riskFactors: RiskFactor[];
  complianceRules: ComplianceRule[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
  version: number;
  // Additional fields from API
  productName?: string;
  productDescription?: string;
  categoryName?: string;
  mandatoryInsurance?: boolean;
  mandatoryInspection?: boolean;
  minCoverage?: string;
  inspectionTypes?: {
    types: string[];
  };
  complianceDeadlineHours?: number;
  gracePeriodHours?: number;
  enforcementLevel?: string;
  autoEnforcement?: boolean;
}

export interface RiskFactor {
  id: string;
  name: string;
  description: string;
  weight: number;
  impact: number;
  probability: number;
  mitigationStrategies: string[];
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  requirement: string;
  validationCriteria: string[];
  enforcementAction: EnforcementActionType;
  isMandatory: boolean;
}

export interface PolicyViolation {
  id: string;
  bookingId: string;
  productId: string;
  violatorId: string; // API uses violatorId instead of renterId
  violationType: ViolationType;
  severity: ViolationSeverity;
  description: string;
  penaltyAmount?: string; // API returns as string
  status: ViolationStatus;
  resolutionActions: any[]; // API field
  resolvedAt?: string | null;
  detectedAt: string; // API field
  createdAt: string;
  updatedAt: string;
  // Additional API fields
  productName?: string;
  productDescription?: string;
  violatorName?: string;
  violatorEmail?: string;
  // Backward compatibility fields
  renterId?: string; // Keep for backward compatibility
  title?: string;
  affectedParties?: string[];
  affectedUserId?: string;
  inspectorId?: string;
  reportedBy?: string;
  reportedAt?: string;
  assignedTo?: string;
  assignedAt?: string;
  resolutionNotes?: string;
  evidence?: ViolationEvidence[];
  correctiveActions?: CorrectiveAction[];
}

export interface ViolationEvidence {
  id: string;
  type: 'photo' | 'document' | 'video' | 'audio' | 'other';
  url: string;
  description: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface CorrectiveAction {
  id: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedAt?: string;
  completionNotes?: string;
}

export interface EnforcementAction {
  id: string;
  actionType: EnforcementActionType;
  status: EnforcementStatus;
  violationId: string;
  targetUserId: string;
  description: string;
  parameters: Record<string, any>;
  approvedBy?: string;
  approvedAt?: string;
  executedBy?: string;
  executedAt?: string;
  executionNotes?: string;
  impact: EnforcementImpact;
  createdAt: string;
  updatedAt: string;
}

export interface EnforcementImpact {
  financialImpact: number;
  operationalImpact: string;
  reputationalImpact: string;
  complianceImpact: string;
  riskMitigation: string;
}

export interface RiskAssessment {
  id: string;
  productId?: string;
  bookingId?: string;
  assessedBy: string;
  assessedAt: string;
  riskLevel: RiskLevel;
  riskScore: number;
  riskFactors: RiskFactorAssessment[];
  recommendations: string[];
  mandatoryRequirements: string[];
  complianceStatus: ComplianceStatus;
  assessmentNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskFactorAssessment {
  factorId: string;
  factorName: string;
  score: number;
  weight: number;
  weightedScore: number;
  assessment: string;
  mitigationRequired: boolean;
}

export interface ComplianceCheck {
  id: string;
  bookingId: string;
  checkedBy: string;
  checkedAt: string;
  complianceStatus: ComplianceStatus;
  complianceScore: number;
  violations: ComplianceViolation[];
  requirements: ComplianceRequirement[];
  recommendations: string[];
  nextCheckDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceViolation {
  id: string;
  requirementId: string;
  requirementName: string;
  violationType: ViolationType;
  severity: ViolationSeverity;
  description: string;
  evidence: string[];
  correctiveAction?: string;
  dueDate?: string;
}

export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  isMandatory: boolean;
  status: ComplianceStatus;
  evidence: string[];
  notes?: string;
}

export interface RiskManagementStats {
  totalRiskProfiles: number;
  activeRiskProfiles: number;
  totalViolations: number;
  openViolations: number;
  resolvedViolations: number;
  totalEnforcementActions: number;
  pendingEnforcementActions: number;
  executedEnforcementActions: number;
  complianceRate: number;
  averageRiskScore: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  violationTrends: {
    period: string;
    violations: number;
    resolved: number;
  }[];
  complianceTrends: {
    period: string;
    complianceRate: number;
  }[];
  topViolationTypes: {
    type: ViolationType;
    count: number;
  }[];
  topRiskFactors: {
    factor: string;
    frequency: number;
    averageScore: number;
  }[];
}

// API Request/Response Interfaces
export interface CreateRiskProfileRequest {
  productId: string;
  categoryId: string;
  riskLevel: RiskLevel;
  mandatoryRequirements: {
    insurance: boolean;
    inspection: boolean;
    minCoverage: number;
    inspectionTypes: string[];
    complianceDeadlineHours: number;
  };
  riskFactors: string[];
  mitigationStrategies: string[];
  enforcementLevel: 'lenient' | 'moderate' | 'strict' | 'very_strict';
  autoEnforcement: boolean;
  gracePeriodHours: number;
}

export interface BulkCreateRiskProfileRequest {
  profiles: CreateRiskProfileRequest[];
}

export interface BulkCreateRiskProfileResponse {
  success: boolean;
  message: string;
  data: {
    successful: number;
    failed: number;
    results: RiskProfile[];
    errors: Array<{
      data: CreateRiskProfileRequest;
      error: string;
    }>;
  };
}

export interface CreateViolationRequest {
  bookingId: string;
  productId: string;
  renterId: string;
  violationType: ViolationType;
  severity: ViolationSeverity;
  description: string;
}

export interface CreateEnforcementActionRequest {
  actionType: EnforcementActionType;
  violationId: string;
  targetUserId: string;
  description: string;
  parameters: Record<string, any>;
  impact: EnforcementImpact;
}



// API Response Interfaces
export interface RiskManagementApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Filter and Search Interfaces
export interface RiskProfileFilters {
  productId?: string;
  categoryId?: string;
  riskLevel?: RiskLevel[];
  isActive?: boolean;
  createdBy?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface ViolationFilters {
  violationType?: ViolationType[];
  severity?: ViolationSeverity[];
  status?: ViolationStatus[];
  productId?: string;
  bookingId?: string;
  inspectorId?: string;
  reportedBy?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface EnforcementFilters {
  actionType?: EnforcementActionType[];
  status?: EnforcementStatus[];
  violationId?: string;
  targetUserId?: string;
  approvedBy?: string;
  executedBy?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface AssessmentFilters {
  productId?: string;
  bookingId?: string;
  assessedBy?: string;
  riskLevel?: RiskLevel[];
  complianceStatus?: ComplianceStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

// Dashboard and Analytics Interfaces
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'table' | 'list';
  data: any;
  config: Record<string, any>;
  refreshInterval?: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

export interface MetricData {
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  format: 'number' | 'percentage' | 'currency';
  unit?: string;
}

// Export interfaces
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  fields: string[];
  filters?: Record<string, any>;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ExportResult {
  downloadUrl: string;
  filename: string;
  size: number;
  expiresAt: string;
}

// Risk Enforcement API Types
export interface RiskEnforcementRequest {
  bookingId: string;
}

export interface ComplianceData {
  bookingId: string;
  productId: string;
  renterId: string;
  isCompliant: boolean;
  missingRequirements: string[];
  complianceScore: number;
  status: 'compliant' | 'non_compliant' | 'pending' | 'under_review';
  enforcementActions: EnforcementAction[];
  lastCheckedAt: string;
}

export interface RiskEnforcementResponse {
  success: boolean;
  message: string;
  data: {
    compliance: ComplianceData;
    violationsRecorded: number;
  };
}

// Risk Management Statistics Types
export interface RiskManagementStats {
  totalRiskProfiles: number;
  complianceRate: number;
  violationRate: number;
  averageRiskScore: number;
  enforcementActions: {
    total: number;
    successful: number;
    failed: number;
    pending: number;
  };
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

export interface RiskManagementStatsResponse {
  success: boolean;
  message: string;
  data: RiskManagementStats;
}

// Risk Management Trends Types
export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface RiskManagementTrends {
  complianceRate: TrendDataPoint[];
  violationRate: TrendDataPoint[];
  enforcementActions: {
    total: TrendDataPoint[];
    successful: TrendDataPoint[];
    failed: TrendDataPoint[];
    pending: TrendDataPoint[];
  };
  riskProfiles: {
    total: TrendDataPoint[];
    low: TrendDataPoint[];
    medium: TrendDataPoint[];
    high: TrendDataPoint[];
    critical: TrendDataPoint[];
  };
  averageRiskScore: TrendDataPoint[];
  period: string;
  comparison?: {
    previousPeriod: string;
    complianceRateChange: number;
    violationRateChange: number;
    enforcementActionsChange: number;
    riskProfilesChange: number;
  };
}

export interface RiskManagementTrendsResponse {
  success: boolean;
  message: string;
  data: RiskManagementTrends;
}

// Risk Assessment Types
export interface RiskAssessmentRequest {
  productId: string;
  renterId: string;
}

export interface RiskAssessmentResponse {
  success: boolean;
  data: {
    productId: string;
    renterId: string;
    overallRiskScore: number;
    riskFactors: {
      productRisk: number;
      renterRisk: number;
      bookingRisk: number;
      seasonalRisk: number;
    };
    recommendations: string[];
    mandatoryRequirements: {
      insurance: boolean;
      inspection: boolean;
      minCoverage: number;
      inspectionTypes: string[];
    };
    complianceStatus: 'compliant' | 'non_compliant' | 'pending' | 'under_review';
    assessmentDate: string;
    expiresAt: string;
  };
}

export interface BulkRiskAssessmentRequest {
  assessments: RiskAssessmentRequest[];
}

export interface BulkRiskAssessmentResponse {
  success: boolean;
  data: {
    totalAssessments: number;
    successful: number;
    failed: number;
    results: RiskAssessmentResponse['data'][];
    errors: Array<{
      productId: string;
      renterId: string;
      error: string;
    }>;
  };
}

export interface ComplianceCheckRequest {
  bookingId: string;
  productId: string;
  renterId: string;
  forceCheck?: boolean;
}

export interface ComplianceCheckResponse {
  success: boolean;
  data: {
    bookingId: string;
    isCompliant: boolean;
    missingRequirements: string[];
    complianceScore: number;
    status: 'compliant' | 'non_compliant' | 'pending' | 'under_review';
    enforcementActions: EnforcementAction[];
    lastCheckedAt: string;
  };
}

export interface BookingComplianceResponse {
  success: boolean;
  data: ComplianceCheckResponse['data'];
}

export interface ProductRiskProfileResponse {
  success: boolean;
  data: {
    productId: string;
    productName: string;
    categoryId: string;
    categoryName: string;
    riskLevel: RiskLevel;
    mandatoryRequirements: {
      insurance: boolean;
      inspection: boolean;
      minCoverage: number;
      inspectionTypes: string[];
      complianceDeadlineHours: number;
    };
    riskFactors: string[];
    mitigationStrategies: string[];
    enforcementLevel: 'lenient' | 'moderate' | 'strict' | 'very_strict';
    autoEnforcement: boolean;
    gracePeriodHours: number;
    createdAt: string;
    updatedAt: string;
  };
}
