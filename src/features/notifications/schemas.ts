import { z } from 'zod';

export const NotificationChannel = z.enum(['email','sms','push','webhook','in_app']);
export type NotificationChannel = z.infer<typeof NotificationChannel>;

export const NotificationPriority = z.enum(['low','normal','high']);
export type NotificationPriority = z.infer<typeof NotificationPriority>;

export const NotificationType = z.enum([
  'inspection_scheduled',
  'inspection_started',
  'inspection_completed',
  'dispute_raised',
  'dispute_resolved',
  'reminder'
]);
export type NotificationType = z.infer<typeof NotificationType>;

export const PaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number().optional(),
  totalPages: z.number().optional(),
});
export type Pagination = z.infer<typeof PaginationSchema>;

export type Paginated<T> = {
  items: T[];
  pagination: Pagination;
};

export const NotificationSchema = z.object({
  id: z.string(),
  recipientId: z.string(),
  type: NotificationType,
  // Backend may return plain strings; accept any string channel
  channels: z.array(z.string()),
  priority: NotificationPriority.optional().default('normal'),
  title: z.string().min(1),
  message: z.string().min(1),
  // Some responses set metadata to null
  metadata: z.union([z.record(z.any()), z.null()]).optional(),
  read: z.boolean().default(false),
  createdAt: z.string(),
});
export type Notification = z.infer<typeof NotificationSchema>;

export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  type: NotificationType,
  channels: z.array(NotificationChannel).optional().default(['in_app']),
  title: z.string().min(1),
  content: z.string().min(1),
  variables: z.array(z.string()).optional().default([]),
  priority: NotificationPriority.optional().default('normal'),
  isActive: z.boolean().optional().default(true),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Template = z.infer<typeof TemplateSchema>;

export const SendNotificationInputSchema = z.object({
  recipientId: z.string(),
  type: NotificationType,
  channels: z.array(NotificationChannel).min(1),
  priority: NotificationPriority.optional().default('normal'),
  title: z.string().min(1),
  message: z.string().min(1),
  metadata: z.union([z.record(z.any()), z.string()]).optional(),
});
export type SendNotificationInput = z.infer<typeof SendNotificationInputSchema>;

export const ScheduleNotificationInputSchema = SendNotificationInputSchema.extend({
  scheduledAt: z.string(),
});
export type ScheduleNotificationInput = z.infer<typeof ScheduleNotificationInputSchema>;

export const SendTemplatedInputSchema = z.object({
  recipientId: z.string().uuid(),
  templateName: z.string(),
  templateData: z.union([z.record(z.any()), z.string().min(1)]),
  channels: z.array(NotificationChannel),
  priority: NotificationPriority.optional().default('normal')
});

export type SendTemplatedInput = z.infer<typeof SendTemplatedInputSchema>;


