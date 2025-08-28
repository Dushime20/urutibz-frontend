import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SendNotificationInputSchema, SendTemplatedInputSchema } from '../schemas';
import { useSendNotificationMutation, useScheduleNotificationMutation, useSendTemplatedNotificationMutation } from '../queries';
import { useToast } from '../../../contexts/ToastContext';

export const SendNotificationForm: React.FC = () => {
  const [isTemplated, setIsTemplated] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [rows, setRows] = useState<Array<{ key: string; value: string }>>([
    { key: '', value: '' }
  ]);
  const [metadataRows, setMetadataRows] = useState<Array<{ key: string; value: string }>>([
    { key: '', value: '' }
  ]);
  const { showToast } = useToast();
  
  const sendMutation = useSendNotificationMutation();
  const scheduleMutation = useScheduleNotificationMutation();
  const templatedMutation = useSendTemplatedNotificationMutation();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(isTemplated ? SendTemplatedInputSchema : SendNotificationInputSchema),
    defaultValues: {
      channels: ['email'],
      priority: 'normal',
      scheduledAt: undefined,
      templateData: ''
    }
  });

  const scheduledAt = watch('scheduledAt');

  const rowsObject = useMemo(() => {
    const obj: Record<string, any> = {};
    for (const r of rows) {
      const k = (r.key || '').trim();
      if (!k) continue;
      // Try to parse value as JSON primitive, otherwise keep as string
      const v = (r.value || '').trim();
      if (v === '') { obj[k] = ''; continue; }
      try {
        obj[k] = JSON.parse(v);
      } catch {
        obj[k] = v;
      }
    }
    return obj;
  }, [rows]);

  useEffect(() => {
    if (isTemplated) {
      try {
        const json = JSON.stringify(rowsObject);
        setValue('templateData', json, { shouldValidate: false });
      } catch {
        // ignore; will be validated on submit
      }
    }
  }, [rowsObject, isTemplated, setValue]);

  const addRow = () => setRows((r) => [...r, { key: '', value: '' }]);
  const removeRow = (idx: number) => setRows((r) => r.filter((_, i) => i !== idx));
  const updateRow = (idx: number, field: 'key' | 'value', val: string) =>
    setRows((r) => r.map((row, i) => i === idx ? { ...row, [field]: val } : row));

  const addMetadataRow = () => setMetadataRows((r) => [...r, { key: '', value: '' }]);
  const removeMetadataRow = (idx: number) => setMetadataRows((r) => r.filter((_, i) => i !== idx));
  const updateMetadataRow = (idx: number, field: 'key' | 'value', val: string) =>
    setMetadataRows((r) => r.map((row, i) => i === idx ? { ...row, [field]: val } : row));

  const metadataObject = useMemo(() => {
    const obj: Record<string, any> = {};
    for (const r of metadataRows) {
      const k = (r.key || '').trim();
      if (!k) continue;
      const v = (r.value || '').trim();
      if (v === '') { obj[k] = ''; continue; }
      try {
        obj[k] = JSON.parse(v);
      } catch {
        obj[k] = v;
      }
    }
    return obj;
  }, [metadataRows]);

  useEffect(() => {
    if (!isTemplated) {
      try {
        const json = JSON.stringify(metadataObject);
        setValue('metadata', json, { shouldValidate: false });
      } catch {
        // ignore; will be validated on submit
      }
    }
  }, [metadataObject, isTemplated, setValue]);

  const onSubmit = async (values: any) => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      if (!token) {
        showToast('Not authenticated: missing token', 'error');
        return;
      }

      if (isTemplated) {
        // Ensure templateData is a valid JSON string or record
        let payload = { ...values };
        if (typeof values.templateData === 'string') {
          try {
            payload.templateData = JSON.parse(values.templateData);
          } catch (e) {
            showToast('Template data is not valid JSON. Fix the fields.', 'error');
            return;
          }
        }
        
        showToast('Sending templated notification...', 'info');
        await templatedMutation.mutateAsync(payload);
        showToast('Templated notification sent successfully', 'success');
      } else if (values.scheduledAt) {
        showToast('Scheduling notification...', 'info');
        await scheduleMutation.mutateAsync(values);
        showToast('Notification scheduled successfully', 'success');
      } else {
        showToast('Sending notification...', 'info');
        await sendMutation.mutateAsync(values);
        showToast('Notification sent successfully', 'success');
      }
      
      reset();
      setRows([{ key: '', value: '' }]);
    } catch (e: any) {
      const apiMsg = e?.response?.data?.message || e?.message || 'Failed to send notification';
      const status = e?.response?.status ? ` [${e.response.status}]` : '';
      const endpoint = isTemplated ? '/notifications/send-templated' : 
                      scheduledAt ? '/notifications/schedule' : '/notifications/send';
      showToast(`Request to ${endpoint}${status}: ${apiMsg}`, 'error');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Send Notification</h3>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isTemplated}
              onChange={(e) => setIsTemplated(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Use Template</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-600">Schedule</span>
          </label>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {isTemplated ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient ID *</label>
              <input
                {...register('recipientId')}
                type="text"
                placeholder="Enter recipient UUID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.recipientId && (
                <p className="text-red-500 text-sm mt-1">{String(errors.recipientId.message)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
              <input
                {...register('templateName')}
                type="text"
                placeholder="e.g., product approved"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.templateName && (
                <p className="text-red-500 text-sm mt-1">{String(errors.templateName.message)}</p>
              )}
            </div>

            {/* Hidden field that carries JSON string for schema validation */}
            <input type="hidden" {...register('templateData')} />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Template Data Fields</label>
                <button type="button" onClick={addRow} className="text-emerald-600 text-sm hover:underline">Add field</button>
              </div>
              <div className="space-y-2">
                {rows.map((row, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      value={row.key}
                      onChange={(e) => updateRow(idx, 'key', e.target.value)}
                      placeholder="key (e.g., recipientName)"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <input
                      value={row.value}
                      onChange={(e) => updateRow(idx, 'value', e.target.value)}
                      placeholder='value (text or JSON: "Emmy" or {"x":1})'
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      className="px-2 py-2 text-sm text-red-600 hover:underline"
                    >Remove</button>
                  </div>
                ))}
              </div>
              {errors.templateData && (
                <p className="text-red-500 text-sm mt-2">{String(errors.templateData.message)}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">Tip: numbers/booleans/objects are supported if you enter valid JSON; otherwise values are sent as text.</p>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient ID *</label>
              <input
                {...register('recipientId')}
                type="text"
                placeholder="Enter recipient UUID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.recipientId && (
                <p className="text-red-500 text-sm mt-1">{String(errors.recipientId.message)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select type</option>
                <option value="inspection_scheduled">Inspection Scheduled</option>
                <option value="inspection_started">Inspection Started</option>
                <option value="inspection_completed">Inspection Completed</option>
                <option value="dispute_raised">Dispute Raised</option>
                <option value="dispute_resolved">Dispute Resolved</option>
                <option value="reminder">Reminder</option>
              </select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{String(errors.type.message)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                {...register('title')}
                type="text"
                placeholder="Notification title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{String(errors.title.message)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea
                {...register('message')}
                placeholder="Notification message"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">{String(errors.message.message)}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metadata (JSON)</label>
              {isScheduled ? (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Add key-value pairs</span>
                    <button type="button" onClick={addMetadataRow} className="text-emerald-600 text-sm hover:underline">Add field</button>
                  </div>
                  <div className="space-y-2">
                    {metadataRows.map((row, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          value={row.key}
                          onChange={(e) => updateMetadataRow(idx, 'key', e.target.value)}
                          placeholder="key (e.g., note)"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <input
                          value={row.value}
                          onChange={(e) => updateMetadataRow(idx, 'value', e.target.value)}
                          placeholder='value (text or JSON: "hello" or true)'
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => removeMetadataRow(idx)}
                          className="px-2 py-2 text-sm text-red-600 hover:underline"
                        >Remove</button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Tip: numbers/booleans/objects are supported if you enter valid JSON; otherwise values are sent as text.</p>
                </>
              ) : (
                <textarea
                  {...register('metadata')}
                  placeholder='{"key": "value"} or plain text'
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              )}
              {errors.metadata && (
                <p className="text-red-500 text-sm mt-1">{String(errors.metadata.message)}</p>
              )}
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Channels *</label>
          <div className="space-y-2">
            {['email', 'sms', 'push', 'webhook', 'in_app'].map((channel) => (
              <label key={channel} className="flex items-center">
                <input
                  type="checkbox"
                  value={channel}
                  {...register('channels')}
                  className="mr-2"
                />
                <span className="text-sm text-gray-600 capitalize">{channel}</span>
              </label>
            ))}
          </div>
          {errors.channels && (
            <p className="text-red-500 text-sm mt-1">{String(errors.channels.message)}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            {...register('priority')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>

        {isScheduled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled At *</label>
            <input
              {...register('scheduledAt')}
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.scheduledAt && (
              <p className="text-red-500 text-sm mt-1">{String(errors.scheduledAt.message)}</p>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => { 
              reset(); 
              setRows([{ key: '', value: '' }]); 
              setMetadataRows([{ key: '', value: '' }]); 
            }}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : isTemplated ? 'Send Templated' : scheduledAt ? 'Schedule' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SendNotificationForm;


