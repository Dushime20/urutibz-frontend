import axios from 'axios';
import { clearAuthAndRedirect } from '../lib/utils';
import type {
  Inspection,
  InspectionFilters,
  InspectionStats,
  InspectionItem,
  InspectionPhoto,
  UpdateInspectionRequest,
  StartInspectionRequest,
  CompleteInspectionRequest,
  CreateInspectionItemRequest,
  CreateDisputeRequest,
  ResolveDisputeRequest,
  Inspector,
  Dispute,
  OwnerPreInspectionData,
  RenterPreReview,
  DiscrepancyReport,
  RenterPostInspectionData,
  OwnerPostReview
} from '../types/inspection';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Create axios instance with interceptors
const inspectionApi = axios.create({
  baseURL: `${API_BASE_URL}/inspections`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
inspectionApi.interceptors.request.use(
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
inspectionApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      clearAuthAndRedirect();
    }
    return Promise.reject(error);
  }
);

// Inspection CRUD operations
export const inspectionService = {
  // Get inspections with filters
  async getInspections(filters?: InspectionFilters, page = 1, limit = 10): Promise<{
    data: Inspection[];
    total: number;
    page: number;
    limit: number;
  }> {
    const params = new URLSearchParams();
    if (filters?.status?.length) {
      for (let i = 0; i < filters.status.length; i++) {
        params.append('status', filters.status[i]);
      }
    }
    if (filters?.type?.length) {
      for (let i = 0; i < filters.type.length; i++) {
        params.append('type', filters.type[i]);
      }
    }
    if (filters?.dateRange?.start) {
      params.append('startDate', filters.dateRange.start);
    }
    if (filters?.dateRange?.end) {
      params.append('endDate', filters.dateRange.end);
    }
    if (filters?.inspectorId) {
      params.append('inspectorId', filters.inspectorId);
    }
    if (filters?.location) {
      params.append('location', filters.location);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await inspectionApi.get(`?${params.toString()}`);
    return response.data;
  },

  // Get inspection by ID with full details
  async getInspection(id: string): Promise<{
    inspection: Inspection;
    items: InspectionItem[];
    photos: InspectionPhoto[];
    damageAssessment: {
      totalRepairCost: number;
      totalReplacementCost: number;
      itemsRequiringRepair: number;
      itemsRequiringReplacement: number;
      damageDetails: any[];
    };
    timeline: {
      scheduled: string;
      started: string;
      completed: string;
      duration: number;
    };
    participants: {
      inspector: {
        id: string;
        name: string;
        email: string;
        role: string;
      };
      renter: {
        id: string;
        name: string;
        email: string;
        role: string;
      };
      owner: {
        id: string;
        name: string;
        email: string;
        role: string;
      };
    };
  }> {
    const response = await inspectionApi.get(`/${id}`);
    
    // Handle the API response structure
    const data = response.data?.data || response.data;
    
    // Map the API response to our expected structure
    const inspection: Inspection = {
      id: data.inspection.id,
      productId: data.inspection.productId ?? data.inspection.product_id,
      bookingId: data.inspection.bookingId ?? data.inspection.booking_id,
      inspectorId: data.inspection.inspectorId ?? data.inspection.inspector_id,
      inspectionType: data.inspection.inspectionType ?? data.inspection.inspection_type,
      status: data.inspection.status,
      scheduledAt: data.inspection.scheduledAt ?? data.inspection.scheduled_at,
      location: data.inspection.inspectionLocation ?? data.inspection.inspection_location ?? data.inspection.location ?? '',
      notes: data.inspection.generalNotes ?? data.inspection.general_notes ?? data.inspection.notes ?? '',
      inspectorNotes: data.inspection.inspectorNotes ?? data.inspection.inspector_notes,
      createdAt: data.inspection.createdAt ?? data.inspection.created_at,
      updatedAt: data.inspection.updatedAt ?? data.inspection.updated_at,
      completedAt: data.inspection.completedAt ?? data.inspection.completed_at ?? undefined,
      startedAt: data.inspection.startedAt ?? data.inspection.started_at ?? undefined,
      items: data.items || [],
      photos: data.photos || [],
      disputes: data.inspection.hasDispute ? [{
        id: 'dispute-' + data.inspection.id,
        inspectionId: data.inspection.id,
        disputeType: 'CONDITION_DISAGREEMENT' as any,
        reason: data.inspection.disputeReason || '',
        evidence: '',
        photos: [],
        status: 'RESOLVED' as any,
        raisedBy: data.inspection.resolvedBy || '',
        raisedAt: data.inspection.createdAt,
        resolvedAt: data.inspection.disputeResolvedAt,
        resolutionNotes: '',
        agreedAmount: 0,
        resolvedBy: data.inspection.resolvedBy
      }] : [],
      // New workflow fields
      ownerPreInspectionData: data.inspection.ownerPreInspectionData ?? data.inspection.owner_pre_inspection_data,
      ownerPreInspectionConfirmed: data.inspection.ownerPreInspectionConfirmed ?? data.inspection.owner_pre_inspection_confirmed,
      ownerPreInspectionConfirmedAt: data.inspection.ownerPreInspectionConfirmedAt ?? data.inspection.owner_pre_inspection_confirmed_at,
      renterPreReviewAccepted: data.inspection.renterPreReviewAccepted ?? data.inspection.renter_pre_review_accepted,
      renterPreReviewAcceptedAt: data.inspection.renterPreReviewAcceptedAt ?? data.inspection.renter_pre_review_accepted_at,
      renterDiscrepancyReported: data.inspection.renterDiscrepancyReported ?? data.inspection.renter_discrepancy_reported,
      renterDiscrepancyData: data.inspection.renterDiscrepancyData ?? data.inspection.renter_discrepancy_data,
      renterPostInspectionData: data.inspection.renterPostInspectionData ?? data.inspection.renter_post_inspection_data,
      renterPostInspectionConfirmed: data.inspection.renterPostInspectionConfirmed ?? data.inspection.renter_post_inspection_confirmed,
      renterPostInspectionConfirmedAt: data.inspection.renterPostInspectionConfirmedAt ?? data.inspection.renter_post_inspection_confirmed_at,
      ownerPostReviewAccepted: data.inspection.ownerPostReviewAccepted ?? data.inspection.owner_post_review_accepted,
      ownerPostReviewAcceptedAt: data.inspection.ownerPostReviewAcceptedAt ?? data.inspection.owner_post_review_accepted_at,
      ownerDisputeRaised: data.inspection.ownerDisputeRaised ?? data.inspection.owner_dispute_raised,
      ownerDisputeRaisedAt: data.inspection.ownerDisputeRaisedAt ?? data.inspection.owner_dispute_raised_at
    };

    return {
      inspection,
      items: data.items || [],
      photos: data.photos || [],
      damageAssessment: data.damageAssessment || {
        totalRepairCost: 0,
        totalReplacementCost: 0,
        itemsRequiringRepair: 0,
        itemsRequiringReplacement: 0,
        damageDetails: []
      },
      timeline: data.timeline || {
        scheduled: data.inspection.scheduledAt,
        started: data.inspection.startedAt || '',
        completed: data.inspection.completedAt || '',
        duration: 0
      },
      participants: data.participants || {
        inspector: { id: '', name: '', email: '', role: '' },
        renter: { id: '', name: '', email: '', role: '' },
        owner: { id: '', name: '', email: '', role: '' }
      }
    };
  },

  // Get inspections for rented items (as renter)
  async getMyInspections(page: number = 1, limit: number = 20): Promise<{
    data: Inspection[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const response = await inspectionApi.get(`/my-inspections?role=renter&page=${page}&limit=${limit}`);
    
    // The backend returns: { success, message, data: { data: [...], total, page, limit, totalPages, hasNext, hasPrev } }
    const responseData = response.data;
    
    const extractArray = (): any[] => {
      if (responseData?.data?.data && Array.isArray(responseData.data.data)) {
        return responseData.data.data;
      }
      if (responseData?.data && Array.isArray(responseData.data)) {
        return responseData.data;
      }
      return [];
    };

    // Map each item to our unified Inspection shape
    const rawList = extractArray();
    const mapped: Inspection[] = rawList.map((item: any) => ({
      id: item.id,
      productId: item.productId ?? item.product_id,
      bookingId: item.bookingId ?? item.booking_id,
      inspectorId: item.inspectorId ?? item.inspector_id,
      inspectionType: item.inspectionType ?? item.inspection_type,
      status: item.status,
      scheduledAt: item.scheduledAt ?? item.scheduled_at,
      location: item.inspectionLocation ?? item.inspection_location ?? item.location ?? '',
      notes: item.generalNotes ?? item.general_notes ?? item.notes ?? '',
      inspectorNotes: item.inspectorNotes ?? item.inspector_notes,
      createdAt: item.createdAt ?? item.created_at,
      updatedAt: item.updatedAt ?? item.updated_at,
      completedAt: item.completedAt ?? item.completed_at ?? undefined,
      items: Array.isArray(item.items) ? item.items : [],
      photos: Array.isArray(item.photos) ? item.photos : [],
      disputes: Array.isArray(item.disputes) ? item.disputes : [],
      inspector: item.inspector,
      product: item.product,
      booking: item.booking,
      // New workflow fields
      ownerPreInspectionData: item.ownerPreInspectionData ?? item.owner_pre_inspection_data,
      ownerPreInspectionConfirmed: item.ownerPreInspectionConfirmed ?? item.owner_pre_inspection_confirmed,
      ownerPreInspectionConfirmedAt: item.ownerPreInspectionConfirmedAt ?? item.owner_pre_inspection_confirmed_at,
      renterPreReviewAccepted: item.renterPreReviewAccepted ?? item.renter_pre_review_accepted,
      renterPreReviewAcceptedAt: item.renterPreReviewAcceptedAt ?? item.renter_pre_review_accepted_at,
      renterDiscrepancyReported: item.renterDiscrepancyReported ?? item.renter_discrepancy_reported,
      renterDiscrepancyData: item.renterDiscrepancyData ?? item.renter_discrepancy_data,
      renterPostInspectionData: item.renterPostInspectionData ?? item.renter_post_inspection_data,
      renterPostInspectionConfirmed: item.renterPostInspectionConfirmed ?? item.renter_post_inspection_confirmed,
      renterPostInspectionConfirmedAt: item.renterPostInspectionConfirmedAt ?? item.renter_post_inspection_confirmed_at,
      ownerPostReviewAccepted: item.ownerPostReviewAccepted ?? item.owner_post_review_accepted,
      ownerPostReviewAcceptedAt: item.ownerPostReviewAcceptedAt ?? item.owner_post_review_accepted_at,
      ownerDisputeRaised: item.ownerDisputeRaised ?? item.owner_dispute_raised,
      ownerDisputeRaisedAt: item.ownerDisputeRaisedAt ?? item.owner_dispute_raised_at,
    }));

    const meta = responseData?.data ?? responseData ?? {};
    const total = Number(meta.total ?? mapped.length);
    const currentPage = Number(meta.page ?? page);
    const pageLimit = Number(meta.limit ?? limit);
    const totalPages = Number(meta.totalPages ?? Math.max(1, Math.ceil(total / (pageLimit || 1))));
    const hasNext = Boolean(meta.hasNext ?? currentPage < totalPages);
    const hasPrev = Boolean(meta.hasPrev ?? currentPage > 1);

    return {
      data: mapped,
      total,
      page: currentPage,
      limit: pageLimit,
      totalPages,
      hasNext,
      hasPrev,
    };
  },

  // Get inspections by owner ID
  async getInspectionsByOwner(ownerId: string, page: number = 1, limit: number = 20): Promise<{
    data: Inspection[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const response = await inspectionApi.get(`?ownerId=${ownerId}&page=${page}&limit=${limit}`);
    
    // The backend returns: { success, message, data: { data: [...], total, page, limit, totalPages, hasNext, hasPrev } }
    // We need to extract the nested data structure
    const responseData = response.data;
    
    const extractArray = (): any[] => {
      if (responseData?.data?.data && Array.isArray(responseData.data.data)) {
        return responseData.data.data;
      }
      if (responseData?.data && Array.isArray(responseData.data)) {
        return responseData.data;
      }
      return [];
    };

    // Map each item to our unified Inspection shape (ensure `location` and `notes` exist)
    const rawList = extractArray();
    const mapped: Inspection[] = rawList.map((item: any) => ({
      id: item.id,
      productId: item.productId ?? item.product_id,
      bookingId: item.bookingId ?? item.booking_id,
      inspectorId: item.inspectorId ?? item.inspector_id,
      inspectionType: item.inspectionType ?? item.inspection_type,
      status: item.status,
      scheduledAt: item.scheduledAt ?? item.scheduled_at,
      location: item.inspectionLocation ?? item.inspection_location ?? item.location ?? '',
      notes: item.generalNotes ?? item.general_notes ?? item.notes ?? '',
      inspectorNotes: item.inspectorNotes ?? item.inspector_notes,
      createdAt: item.createdAt ?? item.created_at,
      updatedAt: item.updatedAt ?? item.updated_at,
      completedAt: item.completedAt ?? item.completed_at ?? undefined,
      items: Array.isArray(item.items) ? item.items : [],
      photos: Array.isArray(item.photos) ? item.photos : [],
      disputes: Array.isArray(item.disputes) ? item.disputes : [],
      inspector: item.inspector,
      product: item.product,
      booking: item.booking,
    }));

    const meta = responseData?.data ?? responseData ?? {};
    const total = Number(meta.total ?? mapped.length);
    const currentPage = Number(meta.page ?? page);
    const pageLimit = Number(meta.limit ?? limit);
    const totalPages = Number(meta.totalPages ?? Math.max(1, Math.ceil(total / (pageLimit || 1))));
    const hasNext = Boolean(meta.hasNext ?? currentPage < totalPages);
    const hasPrev = Boolean(meta.hasPrev ?? currentPage > 1);

    return {
      data: mapped,
      total,
      page: currentPage,
      limit: pageLimit,
      totalPages,
      hasNext,
      hasPrev,
    };
  },

  // Create new inspection (supports combined form with pre-inspection data)
  async createInspection(data: any): Promise<Inspection> {
    // Prepare base inspection payload
    const payload: any = {
      productId: data.productId,
      bookingId: data.bookingId,
      inspectorId: data.inspectorId, // Optional - can be undefined
      inspectionType: data.inspectionType,
      scheduledAt: data.scheduledAt,
      inspectionLocation: data.location ?? data.inspectionLocation,
      generalNotes: data.notes ?? data.generalNotes,
    };

    // If ownerPreInspectionData is provided, include it in the payload
    if (data.ownerPreInspectionData) {
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add base inspection fields
      Object.keys(payload).forEach(key => {
        if (payload[key] !== undefined) {
          formData.append(key, payload[key]);
        }
      });

      // Add pre-inspection photos (backend expects 'files' field name from uploadMultiple middleware)
      const photos = data.ownerPreInspectionData.photos || [];
      photos.forEach((photo: File | string, index: number) => {
        if (photo instanceof File) {
          formData.append('files', photo); // Changed from 'ownerPreInspectionPhotos' to 'files'
        } else {
          // If it's a string URL, include it in the pre-inspection data JSON
          // Don't append separately, it will be in the JSON
        }
      });

      // Add pre-inspection condition data as JSON (without photos - photos are uploaded separately as files)
      formData.append('ownerPreInspectionData', JSON.stringify({
        condition: data.ownerPreInspectionData.condition,
        notes: data.ownerPreInspectionData.notes,
        location: data.ownerPreInspectionData.location,
        timestamp: data.ownerPreInspectionData.timestamp,
        confirmed: data.ownerPreInspectionData.confirmed
        // Note: photos are uploaded as 'files' field, not included in JSON
      }));

      // Use FormData for file upload
      const response = await inspectionApi.post('', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } else {
      // Regular inspection creation without pre-inspection data
      const response = await inspectionApi.post('', payload);
      return response.data;
    }
  },

  // Update inspection
  async updateInspection(id: string, data: UpdateInspectionRequest): Promise<Inspection> {
    const response = await inspectionApi.put(`/${id}`, data);
    return response.data;
  },

  // Start inspection
  async startInspection(id: string, data?: Partial<StartInspectionRequest>): Promise<Inspection> {
    // Backend expects POST /inspections/:id/start with token; body often unused
    const response = await inspectionApi.post(`/${id}/start`, data ?? {});
    return response.data;
  },

  // Complete inspection
  async completeInspection(id: string, data: CompleteInspectionRequest): Promise<Inspection> {
    const response = await inspectionApi.post(`/${id}/complete`, data);
    return response.data;
  },

  // Delete inspection
  async deleteInspection(id: string): Promise<void> {
    await inspectionApi.delete(`/${id}`);
  },

  // Get inspection statistics
  async getInspectionStats(): Promise<InspectionStats> {
    const response = await inspectionApi.get('/stats');
    return response.data;
  },

  // Get inspections by inspector (backend: GET /inspections?inspectorId=...)
  async getInspectionsByInspector(inspectorId: string, page = 1, limit = 10): Promise<{
    inspections: Inspection[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await inspectionApi.get('', {
      params: { inspectorId, page, limit }
    });

    const body = response.data;
    const dataBlock = body?.data ?? body; // supports { success, message, data } or raw
    const rawList = Array.isArray(dataBlock)
      ? dataBlock
      : (Array.isArray(dataBlock?.data) ? dataBlock.data : []);

    // Map camelCase payload to our Inspection type (backend now uses camelCase)
    const inspections: Inspection[] = rawList.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      bookingId: item.bookingId,
      inspectorId: item.inspectorId,
      inspectionType: item.inspectionType,
      status: item.status,
      scheduledAt: item.scheduledAt,
      location: item.inspectionLocation,
      notes: item.generalNotes,
      inspectorNotes: item.inspectorNotes,
      // timestamps
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      completedAt: item.completedAt || undefined,
      // optional relations not provided by this list response
      items: [],
      photos: [],
      disputes: [],
    }));

    const total = Number(dataBlock?.total ?? inspections.length);
    const currentPage = Number(dataBlock?.page ?? page);
    const pageLimit = Number(dataBlock?.limit ?? limit);

    return { inspections, total, page: currentPage, limit: pageLimit };
  },

  // Get inspections by product
  async getInspectionsByProduct(productId: string, page = 1, limit = 10): Promise<{
    inspections: Inspection[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await inspectionApi.get(`/product/${productId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  // Get inspections by booking
  async getInspectionsByBooking(bookingId: string, page = 1, limit = 10): Promise<{
    inspections: Inspection[];
    total: number;
    page: number;
    limit: number;
  }> {
    const response = await inspectionApi.get(`/booking/${bookingId}`, {
      params: { page, limit }
    });
    return response.data;
  },

  // =====================================================
  // NEW WORKFLOW METHODS - Pre-Inspection Phase
  // =====================================================

  // Pre-Inspection Phase - Owner submits pre-inspection
  async submitOwnerPreInspection(inspectionId: string, data: any): Promise<any> {
    const formData = new FormData();
    
    // Add photos (backend expects 'files' field name from uploadMultiple middleware)
    if (data.photos && Array.isArray(data.photos)) {
      data.photos.forEach((photo: File | string, index: number) => {
        if (photo instanceof File) {
          formData.append(`files`, photo);
        }
      });
    }

    // Add condition assessment
    formData.append('condition', JSON.stringify(data.condition));
    formData.append('notes', data.notes || '');
    formData.append('location', JSON.stringify(data.location));
    formData.append('timestamp', data.timestamp);
    formData.append('confirmed', String(data.confirmed));

    const response = await inspectionApi.post(`/${inspectionId}/owner-pre-inspection`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  // Pre-Inspection Phase - Owner confirms pre-inspection
  async confirmOwnerPreInspection(inspectionId: string): Promise<any> {
    const response = await inspectionApi.post(`/${inspectionId}/owner-pre-inspection/confirm`);
    return response.data?.data || response.data;
  },

  // Pre-Inspection Phase - Renter reviews pre-inspection
  async submitRenterPreReview(inspectionId: string, review: any): Promise<any> {
    // Log the payload being sent
    console.log('[inspectionService] Submitting renter pre-review:', {
      inspectionId,
      review,
      token: localStorage.getItem('authToken') || localStorage.getItem('token') ? 'Token exists' : 'No token'
    });
    
    const response = await inspectionApi.post(`/${inspectionId}/renter-pre-review`, review);
    return response.data?.data || response.data;
  },

  // Pre-Inspection Phase - Renter reports discrepancy
  async reportRenterDiscrepancy(inspectionId: string, discrepancy: any): Promise<any> {
    // Log the payload being sent
    console.log('[inspectionService] Reporting renter discrepancy:', {
      inspectionId,
      discrepancy: {
        issuesCount: discrepancy.issues?.length || 0,
        notesLength: discrepancy.notes?.length || 0,
        photosCount: discrepancy.photos?.length || 0
      },
      token: localStorage.getItem('authToken') || localStorage.getItem('token') ? 'Token exists' : 'No token'
    });

    const formData = new FormData();
    formData.append('issues', JSON.stringify(discrepancy.issues));
    formData.append('notes', discrepancy.notes);
    formData.append('timestamp', new Date().toISOString());

    // Add photos (backend expects 'files' field name from uploadMultiple middleware)
    if (discrepancy.photos && Array.isArray(discrepancy.photos)) {
      discrepancy.photos.forEach((photo: File) => {
        if (photo instanceof File) {
          formData.append('files', photo);
        }
      });
    }

    const response = await inspectionApi.post(`/${inspectionId}/renter-discrepancy`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  // Post-Inspection Phase - Renter submits post-inspection
  async submitRenterPostInspection(inspectionId: string, data: any): Promise<any> {
    // Log the payload being sent
    console.log('[inspectionService] Submitting renter post-inspection:', {
      inspectionId,
      data: {
        photosCount: data.returnPhotos?.length || 0,
        hasCondition: !!data.condition,
        notesLength: data.notes?.length || 0,
        hasLocation: !!data.returnLocation,
        confirmed: data.confirmed
      },
      token: localStorage.getItem('authToken') || localStorage.getItem('token') ? 'Token exists' : 'No token'
    });

    const formData = new FormData();
    
    // Add return photos (backend expects 'files' field name from uploadMultiple middleware)
    if (data.returnPhotos && Array.isArray(data.returnPhotos)) {
      data.returnPhotos.forEach((photo: File | string, index: number) => {
        if (photo instanceof File) {
          formData.append(`files`, photo);
        }
      });
    }

    // Add condition assessment
    formData.append('condition', JSON.stringify(data.condition));
    formData.append('notes', data.notes || '');
    formData.append('returnLocation', JSON.stringify(data.returnLocation));
    formData.append('timestamp', data.timestamp);
    formData.append('confirmed', String(data.confirmed));

    const response = await inspectionApi.post(`/${inspectionId}/renter-post-inspection`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  // Post-Inspection Phase - Renter confirms post-inspection
  async confirmRenterPostInspection(inspectionId: string): Promise<any> {
    const response = await inspectionApi.post(`/${inspectionId}/renter-post-inspection/confirm`);
    return response.data?.data || response.data;
  },

  // Post-Inspection Phase - Owner reviews post-inspection
  async submitOwnerPostReview(inspectionId: string, review: any): Promise<any> {
    const formData = new FormData();
    
    // Add dispute evidence photos if provided (backend expects 'files' field name from uploadMultiple middleware)
    if (review.ownerReview?.disputePhotos && Array.isArray(review.ownerReview.disputePhotos)) {
      review.ownerReview.disputePhotos.forEach((photo: File | string) => {
        if (photo instanceof File) {
          formData.append(`files`, photo);
        }
      });
    }

    // Add review data
    formData.append('accepted', String(review.ownerReview?.accepted ?? false));
    formData.append('disputeRaised', String(review.ownerReview?.disputeRaised ?? false));
    if (review.ownerReview?.disputeType) {
      formData.append('disputeType', review.ownerReview.disputeType);
    }
    formData.append('disputeReason', review.ownerReview?.disputeReason || '');
    if (review.ownerReview?.disputeEvidence) {
      formData.append('disputeEvidence', review.ownerReview.disputeEvidence);
    }
    formData.append('confirmedAt', review.ownerReview?.confirmedAt || new Date().toISOString());

    const response = await inspectionApi.post(`/${inspectionId}/owner-post-review`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },

  // Post-Inspection Phase - Owner raises dispute
  async raiseOwnerDispute(inspectionId: string, dispute: any): Promise<any> {
    const formData = new FormData();
    
    // Add dispute evidence photos if provided (backend expects 'files' field name from uploadMultiple middleware)
    if (dispute.evidence && Array.isArray(dispute.evidence)) {
      dispute.evidence.forEach((photo: File | string, index: number) => {
        if (photo instanceof File) {
          formData.append(`files`, photo);
        }
      });
    }

    // Add dispute data
    formData.append('reason', dispute.reason || '');
    formData.append('timestamp', dispute.timestamp || new Date().toISOString());

    const response = await inspectionApi.post(`/${inspectionId}/owner-dispute`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },
};

// Inspection Items operations
export const inspectionItemService = {
  // Add item to inspection
  async addItem(inspectionId: string, data: CreateInspectionItemRequest | FormData): Promise<InspectionItem> {
    const response = await inspectionApi.post(`/${inspectionId}/items`, data, {
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  // Update inspection item
  async updateItem(inspectionId: string, itemId: string, data: Partial<CreateInspectionItemRequest>): Promise<InspectionItem> {
    const response = await inspectionApi.put(`/${inspectionId}/items/${itemId}`, data);
    return response.data;
  },

  // Delete inspection item
  async deleteItem(inspectionId: string, itemId: string): Promise<void> {
    await inspectionApi.delete(`/${inspectionId}/items/${itemId}`);
  }
};

// Dispute operations
export const disputeService = {
  // Raise dispute
  async raiseDispute(inspectionId: string, data: CreateDisputeRequest | FormData): Promise<Dispute> {
    const response = await inspectionApi.post(`/${inspectionId}/disputes`, data, {
      headers: data instanceof FormData ? {} : { 'Content-Type': 'application/json' }
    });
    return response.data;
  },

  // Get all disputes with pagination
  async getAllDisputes(page = 1, limit = 20): Promise<{
    disputes: Dispute[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await inspectionApi.get(`/disputes?page=${page}&limit=${limit}`);
    console.log('Raw disputes API response:', response);
    console.log('Response data:', response.data);
    console.log('Response data.data:', response.data?.data);
    console.log('Response data.data.disputes:', response.data?.data?.disputes);
    
    // Handle nested response structure: response.data.data.disputes
    const disputes = response.data?.data?.disputes || response.data?.disputes || [];
    const pagination = response.data?.data?.pagination || response.data?.pagination || {
      page: 1,
      limit: 20,
      total: disputes.length,
      totalPages: 1
    };
    
    console.log('Extracted disputes:', disputes);
    console.log('Extracted pagination:', pagination);
    
    return {
      disputes,
      pagination
    };
  },

  // Get user-specific disputes
  async getUserDisputes(userId: string, page = 1, limit = 20): Promise<{
    disputes: Dispute[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      // Try user-specific endpoint first
      const response = await inspectionApi.get(`/disputes/user/${userId}?page=${page}&limit=${limit}`);
      const disputes = response.data?.data?.disputes || response.data?.disputes || [];
      const pagination = response.data?.data?.pagination || response.data?.pagination || {
        page: 1,
        limit: 20,
        total: disputes.length,
        totalPages: 1
      };
      
      return { disputes, pagination };
    } catch (error: any) {
      // If user-specific endpoint fails, try filtering by user ID
      if (error.response?.status === 404 || error.response?.status === 401) {
        const response = await inspectionApi.get(`/disputes?userId=${userId}&page=${page}&limit=${limit}`);
        const disputes = response.data?.data?.disputes || response.data?.disputes || [];
        const pagination = response.data?.data?.pagination || response.data?.pagination || {
          page: 1,
          limit: 20,
          total: disputes.length,
          totalPages: 1
        };
        
        return { disputes, pagination };
      }
      throw error;
    }
  },

  // Update dispute
  async updateDispute(inspectionId: string, disputeId: string, data: Partial<CreateDisputeRequest>): Promise<Dispute> {
    const response = await inspectionApi.put(`/${inspectionId}/disputes/${disputeId}`, data);
    return response.data;
  },

  // Resolve dispute
  async resolveDispute(inspectionId: string, disputeId: string, data: ResolveDisputeRequest): Promise<Dispute> {
    const response = await inspectionApi.put(`/${inspectionId}/disputes/${disputeId}/resolve`, data);
    return response.data;
  },

  // Get dispute by ID
  async getDispute(inspectionId: string, disputeId: string): Promise<Dispute> {
    const response = await inspectionApi.get(`/${inspectionId}/disputes/${disputeId}`);
    return response.data;
  },
};

// Photo operations
export const photoService = {
  // Upload photo
  async uploadPhoto(inspectionId: string, itemId: string | null, file: File, category: string, description?: string): Promise<InspectionPhoto> {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('category', category);
    if (description) {
      formData.append('description', description);
    }
    if (itemId) {
      formData.append('itemId', itemId);
    }

    const response = await inspectionApi.post(`/${inspectionId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete photo
  async deletePhoto(inspectionId: string, photoId: string): Promise<void> {
    await inspectionApi.delete(`/${inspectionId}/photos/${photoId}`);
  },

  // Get photos by inspection
  async getPhotosByInspection(inspectionId: string): Promise<InspectionPhoto[]> {
    const response = await inspectionApi.get(`/${inspectionId}/photos`);
    return response.data;
  }
};

// Inspector operations
export const inspectorService = {
  // Get all inspectors (optionally filter by role)
  async getInspectors(role?: string): Promise<Inspector[]> {
    const url = role ? `/inspectors?role=${encodeURIComponent(role)}` : '/inspectors';
    const response = await inspectionApi.get(url);
    return response.data;
  },

  // Get inspector by ID
  async getInspector(id: string): Promise<Inspector> {
    const response = await inspectionApi.get(`/inspectors/${id}`);
    return response.data;
  },

  // Create inspector
  async createInspector(data: Partial<Inspector>): Promise<Inspector> {
    const response = await inspectionApi.post('/inspectors', data);
    return response.data;
  },

  // Update inspector
  async updateInspector(id: string, data: Partial<Inspector>): Promise<Inspector> {
    const response = await inspectionApi.put(`/inspectors/${id}`, data);
    return response.data;
  },

  // Delete inspector
  async deleteInspector(id: string): Promise<void> {
    await inspectionApi.delete(`/inspectors/${id}`);
  },

  // Get available inspectors
  async getAvailableInspectors(date: string, location?: string): Promise<Inspector[]> {
    const params = new URLSearchParams({ date });
    if (location) {
      params.append('location', location);
    }
    const response = await inspectionApi.get(`/inspectors/available?${params.toString()}`);
    return response.data;
  }
};

export default inspectionService;
