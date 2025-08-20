// User Profile Types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  status: string;
  countryId?: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
  kyc_status: string;
  lastLogin?: string;
  verifications?: UserVerification[];
  kycProgress?: KYCProgress;
}

export interface UserProfileUpdate {
  firstName?: string;
  lastName?: string;
  phone?: string;
  profileImage?: string;
  countryId?: string;
}

export interface UserStatusUpdate {
  status: 'active' | 'inactive' | 'suspended' | 'banned' | 'pending';
  reason?: string;
  duration?: number; // in days, for temporary suspensions
}

export interface UserRoleUpdate {
  role: 'admin' | 'moderator' | 'user' | 'host' | 'owner';
  reason?: string;
}

export interface UserVerificationUpdate {
  verificationType: string;
  status: 'pending' | 'verified' | 'rejected';
  reason?: string;
  documents?: string[];
}

export interface UserSearchFilters {
  search?: string;
  role?: string;
  status?: string;
  kycStatus?: string;
  countryId?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserProfileStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  bannedUsers: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  usersByRole: Record<string, number>;
  usersByCountry: Record<string, number>;
  usersByStatus: Record<string, number>;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
  newUsersToday: number;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'login' | 'logout' | 'profile_update' | 'password_change' | 'verification_submit' | 'booking_create' | 'booking_cancel' | 'review_post' | 'payment_made';
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  lastActivity: string;
  createdAt: string;
  expiresAt: string;
}

// KYC and Verification Types
export interface UserVerification {
  id?: string;
  verification_type: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
  documents?: string[];
  notes?: string;
  verified_by?: string;
  verified_at?: string;
}

export interface KYCProgress {
  required: string[];
  verified: string[];
  pending: string[];
  rejected: string[];
  completionRate: number;
}

// Extended User Types for Admin
export interface AdminUser extends UserProfile {
  // Additional admin-specific fields
  loginAttempts?: number;
  lastFailedLogin?: string;
  accountLocked?: boolean;
  lockReason?: string;
  lockExpiresAt?: string;
  preferences?: UserPreferences;
  notifications?: UserNotificationSettings;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  currency: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
}

export interface UserNotificationSettings {
  email: {
    bookings: boolean;
    payments: boolean;
    reviews: boolean;
    security: boolean;
    marketing: boolean;
  };
  sms: {
    bookings: boolean;
    payments: boolean;
    security: boolean;
  };
  push: {
    bookings: boolean;
    payments: boolean;
    reviews: boolean;
    security: boolean;
  };
}

// User Import/Export Types
export interface UserImportData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
  countryId?: string;
}

export interface UserExportOptions {
  format: 'csv' | 'excel' | 'json';
  fields: string[];
  filters?: UserSearchFilters;
  includeSensitiveData?: boolean;
}

// User Analytics Types
export interface UserAnalytics {
  userId: string;
  totalBookings: number;
  totalSpent: number;
  averageRating: number;
  reviewCount: number;
  lastActivity: string;
  favoriteCategories: string[];
  preferredLocations: string[];
  bookingFrequency: 'low' | 'medium' | 'high';
  userSegment: 'new' | 'active' | 'loyal' | 'inactive';
}

// User Risk Assessment Types
export interface UserRiskAssessment {
  userId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  lastAssessment: string;
  nextAssessment: string;
  recommendations: string[];
}
