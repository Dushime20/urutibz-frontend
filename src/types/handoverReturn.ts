// Handover & Return System Types
// Following the same patterns as riskManagement.ts

export interface HandoverSession {
  id: string;
  bookingId: string;
  productId: string;
  renterId: string;
  ownerId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  verificationCode: string;
  handoverLocation: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
  };
  handoverPhotos: HandoverPhoto[];
  handoverNotes: string;
  handoverSignature: string;
  handoverTimestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnSession {
  id: string;
  bookingId: string;
  productId: string;
  renterId: string;
  ownerId: string;
  handoverSessionId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  verificationCode: string;
  returnLocation: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
  };
  returnPhotos: ReturnPhoto[];
  returnNotes: string;
  returnSignature: string;
  returnTimestamp: string;
  conditionAssessment: ConditionAssessment;
  createdAt: string;
  updatedAt: string;
}

export interface HandoverPhoto {
  id: string;
  sessionId: string;
  photoUrl: string;
  thumbnailUrl: string;
  caption: string;
  category: 'overall' | 'damage' | 'accessories' | 'documentation';
  uploadedAt: string;
}

export interface ReturnPhoto {
  id: string;
  sessionId: string;
  photoUrl: string;
  thumbnailUrl: string;
  caption: string;
  category: 'overall' | 'damage' | 'accessories' | 'comparison';
  uploadedAt: string;
}

export interface ConditionAssessment {
  overallCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  conditionScore: number; // 1-5 scale
  damages: DamageReport[];
  accessories: AccessoryCheck[];
  notes: string;
  assessedBy: string;
  assessedAt: string;
}

export interface DamageReport {
  id: string;
  type: 'scratch' | 'dent' | 'crack' | 'stain' | 'missing_part' | 'other';
  severity: 'minor' | 'moderate' | 'major' | 'severe';
  description: string;
  photoUrl?: string;
  estimatedCost?: number;
  reportedBy: string;
  reportedAt: string;
}

export interface AccessoryCheck {
  id: string;
  name: string;
  present: boolean;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'missing';
  notes?: string;
}

export interface HandoverMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderType?: 'renter' | 'owner' | string;
  receiverId: string;
  messageType: 'text' | 'image' | 'voice' | 'video' | 'location' | 'file';
  content: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: number;
    latitude?: number;
    longitude?: number;
  };
  isRead: boolean;
  sentAt: string;
  readAt?: string;
}

export interface HandoverNotification {
  id: string;
  userId: string;
  sessionId: string;
  type: 'handover_started' | 'handover_completed' | 'return_started' | 'return_completed' | 'dispute_created' | 'message_received';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  readAt?: string;
}

// V2 Message payloads (booking-scoped)
export interface HandoverMessageAttachment {
  type: 'image' | 'file' | 'video' | 'audio';
  url: string;
}

export interface SendPlainMessageRequest {
  bookingId?: string;
  senderId: string;
  senderType?: 'renter' | 'owner' | string;
  message: string; // up to 2000 chars
  messageType?: 'text' | 'image' | 'voice' | 'video' | 'location' | 'file';
  attachments?: HandoverMessageAttachment[];
  timestamp?: string; // ISO time
  handoverSessionId?: string | null;
  returnSessionId?: string | null;
}

export interface SendPlainMessageResponse {
  success: boolean;
  message: string;
  data: {
    message: HandoverMessage;
  };
}

export interface GetMessagesParams {
  bookingId?: string;
  sessionId?: string;
  handoverSessionId?: string;
  returnSessionId?: string;
  page?: number;
  limit?: number;
}

export interface GetMessagesResponse {
  success: boolean;
  message: string;
  data: HandoverMessage[];
  meta?: any;
}

// Scheduling notifications
export interface ScheduleNotificationRequest {
  bookingId: string;
  type: 'handover' | 'return' | string;
  scheduledAt: string; // ISO string
  payload?: {
    note?: string;
    channel?: 'email' | 'sms' | 'push' | string;
    [key: string]: any;
  };
}

export interface ScheduleNotificationResponse {
  success: boolean;
  message: string;
  data: {
    notification: HandoverNotification;
  };
}

// API Request/Response Types
export interface CreateHandoverSessionRequest {
  bookingId: string;
  productId: string;
  renterId: string;
  ownerId: string;
  handoverType: 'pickup' | 'delivery' | 'meetup';
  scheduledDateTime: string; // ISO string
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
  };
  handoverNotes?: string;
}

export interface CreateHandoverSessionResponse {
  success: boolean;
  message: string;
  data: {
    session: HandoverSession;
    verificationCode: string;
  };
}

export interface CreateReturnSessionRequest {
  bookingId: string;
  productId: string;
  renterId: string;
  ownerId: string;
  handoverSessionId: string;
  returnType: 'pickup' | 'delivery' | 'meetup';
  scheduledDateTime: string; // ISO string
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    country: string;
  };
  returnNotes?: string;
}

export interface CreateReturnSessionResponse {
  success: boolean;
  message: string;
  data: {
    session: ReturnSession;
    verificationCode: string;
  };
}

export interface UploadPhotoRequest {
  sessionId: string;
  photo: File;
  category: 'overall' | 'damage' | 'accessories' | 'documentation' | 'comparison';
  caption?: string;
}

export interface UploadPhotoResponse {
  success: boolean;
  message: string;
  data: {
    photo: HandoverPhoto | ReturnPhoto;
  };
}

export interface SendMessageRequest {
  sessionId: string;
  receiverId: string;
  messageType: 'text' | 'image' | 'voice' | 'video' | 'location' | 'file';
  content: string;
  metadata?: {
    fileName?: string;
    fileSize?: number;
    duration?: number;
    latitude?: number;
    longitude?: number;
  };
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
  data: {
    message: HandoverMessage;
  };
}

export interface CompleteHandoverRequest {
  sessionId: string;
  verificationCode: string;
  handoverSignature: string;
  handoverNotes?: string;
}

export interface CompleteHandoverResponse {
  success: boolean;
  message: string;
  data: {
    session: HandoverSession;
  };
}

export interface CompleteReturnRequest {
  sessionId: string;
  verificationCode: string;
  returnSignature: string;
  conditionAssessment: ConditionAssessment;
  returnNotes?: string;
}

export interface CompleteReturnResponse {
  success: boolean;
  message: string;
  data: {
    session: ReturnSession;
  };
}

export interface HandoverReturnStats {
  totalHandovers: number;
  totalReturns: number;
  completedHandovers: number;
  completedReturns: number;
  disputedSessions: number;
  averageHandoverTime: number; // in minutes
  averageReturnTime: number; // in minutes
  successRate: number; // percentage
  disputeRate: number; // percentage
  userSatisfaction: number; // 1-5 scale
}

export interface HandoverReturnStatsResponse {
  success: boolean;
  message: string;
  data: HandoverReturnStats;
}

// Hook return types
export interface UseHandoverSessionReturn {
  session: HandoverSession | null;
  sessions: HandoverSession[];
  meta: any;
  loading: boolean;
  error: string | null;
  createSession: (data: CreateHandoverSessionRequest) => Promise<void>;
  getSession: (sessionId: string) => Promise<void>;
  getSessionsByUser: (userId: string, page?: number, limit?: number) => Promise<{ data: HandoverSession[], meta: any }>;
  updateSession: (sessionId: string, data: Partial<HandoverSession>) => Promise<void>;
  completeSession: (data: CompleteHandoverRequest) => Promise<void>;
  uploadPhoto: (data: UploadPhotoRequest) => Promise<void>;
}

export interface UseReturnSessionReturn {
  session: ReturnSession | null;
  sessions: ReturnSession[];
  meta: any;
  loading: boolean;
  error: string | null;
  createSession: (data: CreateReturnSessionRequest) => Promise<void>;
  getSession: (sessionId: string) => Promise<void>;
  getSessionsByUser: (userId: string, page?: number, limit?: number) => Promise<{ data: ReturnSession[], meta: any }>;
  updateSession: (sessionId: string, data: Partial<ReturnSession>) => Promise<void>;
  completeSession: (data: CompleteReturnRequest) => Promise<void>;
  uploadPhoto: (data: UploadPhotoRequest) => Promise<void>;
}

export interface UseHandoverMessagesReturn {
  messages: HandoverMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (data: SendMessageRequest | SendPlainMessageRequest) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  refreshMessages: (handoverSessionId?: string, returnSessionId?: string) => Promise<void>;
}

export interface UseHandoverNotificationsReturn {
  notifications: HandoverNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  schedule: (req: ScheduleNotificationRequest) => Promise<void>;
}

export interface UseHandoverStatsReturn {
  stats: HandoverReturnStats | null;
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}
