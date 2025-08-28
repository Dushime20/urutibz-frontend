import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMyNotifications,
  getTemplates,
  getChannelStatus,
  getStats,
  markRead,
  sendNotification,
  sendTemplatedNotification,
  scheduleNotification,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from './api';
import type { SendNotificationInput, SendTemplatedInput, ScheduleNotificationInput } from './schemas';

export function useNotificationsQuery(params?: {
  page?: number;
  limit?: number;
  type?: string;
  channel?: string;
  since?: string;
}) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => getMyNotifications(params),
  });
}

export function useTemplatesQuery() {
  return useQuery({
    queryKey: ['notifications', 'templates'],
    queryFn: () => getTemplates(),
  });
}

export function useChannelStatusQuery() {
  return useQuery({
    queryKey: ['notifications', 'status'],
    queryFn: () => getChannelStatus(),
    refetchInterval: 30000,
  });
}

export function useNotificationStatsQuery() {
  return useQuery({
    queryKey: ['notifications', 'statistics'],
    queryFn: () => getStats(),
    refetchInterval: 60000,
  });
}

export function useMarkReadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useSendNotificationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SendNotificationInput) => sendNotification(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export const useSendTemplatedNotificationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendTemplatedNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export function useScheduleNotificationMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ScheduleNotificationInput) => scheduleNotification(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useCreateTemplateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: any) => createTemplate(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', 'templates'] });
    },
  });
}

export function useUpdateTemplateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => updateTemplate(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', 'templates'] });
    },
  });
}

export function useDeleteTemplateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', 'templates'] });
    },
  });
}


