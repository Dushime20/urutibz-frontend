export interface Inspection {
  id: string;
  productId: string;
  bookingId: string;
  inspectorId: string;
  inspectionType: InspectionType;
  status: InspectionStatus;
  scheduledAt: string;
  location: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  items: InspectionItem[];
  photos: InspectionPhoto[];
  disputes: Dispute[];
  inspector?: Inspector;
  product?: Product;
  booking?: Booking;
}

export interface InspectionItem {
  id: string;
  inspectionId: string;
  itemName: string;
  description: string;
  condition: ItemCondition;
  notes: string;
  photos: InspectionPhoto[];
  repairCost: number;
  replacementCost: number;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionPhoto {
  id: string;
  inspectionId: string;
  itemId?: string;
  url: string;
  category: PhotoCategory;
  description?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Dispute {
  id: string;
  inspectionId: string;
  disputeType: DisputeType;
  reason: string;
  evidence: string;
  photos: InspectionPhoto[];
  status: DisputeStatus;
  raisedBy: string;
  raisedAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  agreedAmount?: number;
  resolvedBy?: string;
}

export interface Inspector {
  id: string;
  userId: string;
  qualifications: string[];
  specializations: string[];
  experience: number;
  rating: number;
  totalInspections: number;
  completedInspections: number;
  workingHours: WorkingHours;
  availability: AvailabilityStatus;
  location: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkingHours {
  monday: TimeRange;
  tuesday: TimeRange;
  wednesday: TimeRange;
  thursday: TimeRange;
  friday: TimeRange;
  saturday: TimeRange;
  sunday: TimeRange;
}

export interface TimeRange {
  start: string;
  end: string;
  available: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  ownerId: string;
}

export interface Booking {
  id: string;
  productId: string;
  renterId: string;
  startDate: string;
  endDate: string;
  status: string;
}

export enum InspectionType {
  PRE_RENTAL = 'pre_rental',
  POST_RENTAL = 'post_rental',
  DAMAGE_ASSESSMENT = 'damage_assessment',
  MAINTENANCE_CHECK = 'maintenance_check',
  QUALITY_VERIFICATION = 'quality_verification'
}

export enum InspectionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DISPUTED = 'disputed',
  RESOLVED = 'resolved'
}

export enum ItemCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  DAMAGED = 'damaged'
}

export enum PhotoCategory {
  GENERAL = 'general',
  DAMAGE = 'damage',
  CONDITION = 'condition',
  BEFORE = 'before',
  AFTER = 'after'
}

export enum DisputeType {
  CONDITION_DISAGREEMENT = 'condition_disagreement',
  COST_DISPUTE = 'cost_dispute',
  PROCEDURE_VIOLATION = 'procedure_violation',
  DAMAGE_ASSESSMENT = 'damage_assessment',
  OTHER = 'other'
}

export enum DisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum AvailabilityStatus {
  AVAILABLE = 'available',
  BUSY = 'busy',
  UNAVAILABLE = 'unavailable',
  ON_LEAVE = 'on_leave'
}

export interface InspectionFilters {
  status?: InspectionStatus[];
  type?: InspectionType[];
  dateRange?: {
    start: string;
    end: string;
  };
  inspectorId?: string;
  location?: string;
  search?: string;
}

export interface InspectionStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  disputed: number;
  resolved: number;
}

export interface CreateInspectionRequest {
  productId: string;
  bookingId: string;
  inspectorId: string;
  inspectionType: InspectionType;
  scheduledAt: string;
  location: string;
  notes: string;
}

export interface UpdateInspectionRequest {
  inspectionType?: InspectionType;
  scheduledAt?: string;
  location?: string;
  notes?: string;
}

export interface StartInspectionRequest {
  notes?: string;
}

// Complete inspection request interface
export interface CompleteInspectionRequest {
  notes: string;
  items: Omit<InspectionItem, 'id' | 'inspectionId' | 'createdAt' | 'updatedAt'>[];
}

export interface CreateInspectionItemRequest {
  itemName: string;
  description: string;
  condition: ItemCondition;
  notes: string;
  repairCost: number;
  replacementCost: number;
}

export interface CreateDisputeRequest {
  disputeType: DisputeType;
  reason: string;
  evidence: string;
}

export interface ResolveDisputeRequest {
  resolutionNotes: string;
  agreedAmount?: number;
}
