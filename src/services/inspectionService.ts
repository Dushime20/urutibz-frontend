import axios from 'axios';
import type {
  Inspection,
  InspectionFilters,
  InspectionStats,
  InspectionStatus,
  InspectionType,
  InspectionItem,
  InspectionPhoto,
  CreateInspectionRequest,
  UpdateInspectionRequest,
  StartInspectionRequest,
  CompleteInspectionRequest,
  CreateInspectionItemRequest,
  CreateDisputeRequest,
  ResolveDisputeRequest,
  Inspector,
  Dispute
} from '../../types/inspection';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

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
      localStorage.removeItem('authToken');
      window.location.href = '/login';
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

  // Get inspection by ID
  async getInspection(id: string): Promise<Inspection> {
    const response = await inspectionApi.get(`/${id}`);
    return response.data;
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

  // Create new inspection
  async createInspection(data: any): Promise<Inspection> {
    const payload = {
      productId: data.productId,
      bookingId: data.bookingId,
      inspectorId: data.inspectorId,
      inspectionType: data.inspectionType,
      scheduledAt: data.scheduledAt,
      inspectionLocation: data.location ?? data.inspectionLocation,
      generalNotes: data.notes ?? data.generalNotes,
    };
    const response = await inspectionApi.post('', payload);
    return response.data;
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
  }
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
