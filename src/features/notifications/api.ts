import axios from 'axios';
import { clearAuthAndRedirect } from '../../lib/utils';
import {
  NotificationSchema,
  TemplateSchema,
  SendNotificationInput,
  ScheduleNotificationInput,
  SendTemplatedInput,
  type Notification,
  type Template,
  type Paginated,
  PaginationSchema,
} from './schemas';

// Match admin service base URL
const API_BASE_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: `${API_BASE_URL}/notifications`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuthAndRedirect();
    }
    return Promise.reject(error);
  }
);

function normalizePaginated<T>(data: any, itemParser: (i: any) => T): Paginated<T> {
  const itemsRaw = data?.items ?? data?.data ?? data?.results ?? [];
  const paginationRaw = data?.pagination ?? data?.meta ?? {
    page: data?.page ?? 1,
    limit: data?.limit ?? 20,
    total: data?.total,
    totalPages: data?.totalPages,
  };
  const items = Array.isArray(itemsRaw) ? itemsRaw.map(itemParser) : [];
  const pagination = PaginationSchema.safeParse(paginationRaw).success
    ? (paginationRaw as any)
    : { page: 1, limit: 20, total: items.length, totalPages: 1 };
  return { items, pagination };
}

export async function sendNotification(payload: SendNotificationInput): Promise<Notification> {
  const { data } = await api.post('/send', payload);
  const parsed = NotificationSchema.safeParse(data?.data ?? data);
  return parsed.success ? parsed.data : (data?.data ?? data);
}

export const sendTemplatedNotification = async (payload: SendTemplatedInput): Promise<Notification> => {
  const { data } = await api.post('/send-templated', payload);
  return data;
};

export async function scheduleNotification(payload: ScheduleNotificationInput): Promise<Notification> {
  const { data } = await api.post('/schedule', payload);
  const parsed = NotificationSchema.safeParse(data?.data ?? data);
  return parsed.success ? parsed.data : (data?.data ?? data);
}

export async function sendBulk(payload: { notifications: SendNotificationInput[] }): Promise<{ count: number }>
{
  const { data } = await api.post('/bulk', payload);
  return data?.data ?? data;
}

export async function getMyNotifications(params?: {
  page?: number;
  limit?: number;
  type?: string;
  channel?: string;
  since?: string;
}): Promise<any[]> {
  const { data } = await api.get('/my', { params });
  const container = data?.data ?? data;
  const rawItems = container?.data ?? container?.items ?? [];
  const items = Array.isArray(rawItems) ? rawItems : [];
  return items;
}

export async function markRead(id: string): Promise<{ success: boolean }>{
  const { data } = await api.put(`/${id}/read`);
  return data?.data ?? data ?? { success: true };
}

export async function getStats(): Promise<any> {
  const { data } = await api.get('/statistics');
  return data?.data ?? data;
}

export async function getTemplates(): Promise<Template[]> {
  const { data } = await api.get('/templates');
  const items = (data?.data ?? data)?.items ?? data?.data ?? data ?? [];
  return (Array.isArray(items) ? items : []).map((t: any) => {
    // Normalize backend 'message' to 'content'
    const normalized = {
      ...t,
      content: t?.content ?? t?.message ?? '',
    };
    const parsed = TemplateSchema.safeParse(normalized);
    return parsed.success ? parsed.data : normalized;
  });
}

export async function createTemplate(input: any): Promise<Template> {
  // Map UI 'content' to backend 'message' and split variables if provided as CSV
  const payload: any = {
    ...input,
    message: input?.content,
  };
  if (typeof input?.variables === 'string') {
    payload.variables = input.variables
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
  }
  delete payload.content;
  const { data } = await api.post('/templates', payload);
  const parsed = TemplateSchema.safeParse(data?.data ?? data);
  return parsed.success ? parsed.data : (data?.data ?? data);
}

export async function updateTemplate(id: string, updates: any): Promise<Template> {
  const payload: any = {
    ...updates,
    message: updates?.content ?? updates?.message,
  };
  if (typeof updates?.variables === 'string') {
    payload.variables = updates.variables
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
  }
  delete payload.content;
  const { data } = await api.put(`/templates/${id}`, payload);
  const parsed = TemplateSchema.safeParse(data?.data ?? data);
  return parsed.success ? parsed.data : (data?.data ?? data);
}

export async function deleteTemplate(id: string): Promise<{ success: boolean }>{
  const { data } = await api.delete(`/templates/${id}`);
  return data?.data ?? data ?? { success: true };
}

export async function getChannelStatus(): Promise<Record<string, any>> {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  const { data } = await api.get('/status', token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
  return data?.data ?? data ?? {};
}


