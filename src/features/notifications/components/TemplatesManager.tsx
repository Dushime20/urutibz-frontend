import React, { useMemo, useState } from 'react';
import { useTemplatesQuery, useCreateTemplateMutation, useUpdateTemplateMutation, useDeleteTemplateMutation } from '../queries';
import { NotificationChannel, NotificationPriority, NotificationType } from '../schemas';

const emptyForm = {
  name: '',
  type: NotificationType.options[0],
  channels: ['in_app'] as string[],
  title: '',
  content: '',
  variables: '' as any,
  priority: 'normal',
  isActive: true,
};

const TemplatesManager: React.FC = () => {
  const { data, isLoading } = useTemplatesQuery();
  const createMutation = useCreateTemplateMutation();
  const updateMutation = useUpdateTemplateMutation();
  const deleteMutation = useDeleteTemplateMutation();
  const templates = data ?? [];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, updates: form });
      setEditingId(null);
    } else {
      await createMutation.mutateAsync(form);
    }
    setForm(emptyForm);
  };

  const onEdit = (tpl: any) => {
    setEditingId(tpl.id);
    setForm({
      name: tpl.name || '',
      type: tpl.type,
      channels: tpl.channels || ['in_app'],
      title: tpl.title || '',
      content: tpl.content || '',
      variables: Array.isArray(tpl.variables) ? tpl.variables.join(',') : '',
      priority: tpl.priority || 'normal',
      isActive: tpl.isActive ?? true,
    });
  };

  const onDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
  };

  return (
    <div className="rounded border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Templates</h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input className="w-full rounded border px-3 py-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm mb-1">Type</label>
            <select className="w-full rounded border px-3 py-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {NotificationType.options.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Channels</label>
            <select multiple className="w-full rounded border px-3 py-2" value={form.channels} onChange={(e) => setForm({ ...form, channels: Array.from(e.target.selectedOptions).map(o => o.value) })}>
              {NotificationChannel.options.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input className="w-full rounded border px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm mb-1">Variables (comma-separated)</label>
            <input className="w-full rounded border px-3 py-2" value={form.variables} onChange={(e) => setForm({ ...form, variables: e.target.value })} placeholder="recipientName,productName,startedAt" />
          </div>
          <div>
            <label className="block text-sm mb-1">Priority</label>
            <select className="w-full rounded border px-3 py-2" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {['low','normal','high'].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input id="isActive" type="checkbox" className="rounded border" checked={!!form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            <label htmlFor="isActive" className="text-sm">Active</label>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Content</label>
          <textarea className="w-full rounded border px-3 py-2" rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
        </div>

        <div className="flex items-center gap-2">
          <button type="submit" className="rounded bg-blue-600 text-white px-3 py-2 hover:bg-blue-700">
            {editingId ? 'Update' : 'Create'} Template
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="rounded border px-3 py-2">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="border-t pt-4">
        {isLoading ? (
          <div className="text-sm text-gray-600">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="text-sm text-gray-600">No templates.</div>
        ) : (
          <div className="space-y-2">
            {templates.map((tpl: any) => (
              <div key={tpl.id} className="rounded border p-3 flex items-start justify-between">
                <div>
                  <div className="font-medium">{tpl.name}</div>
                  <div className="text-xs text-gray-600">{tpl.type} · {tpl.channels?.join(', ')} · {tpl.priority || 'normal'} {tpl.isActive === false ? '· inactive' : ''}</div>
                  <div className="text-sm">{tpl.title}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onEdit(tpl)} className="rounded border px-3 py-1 text-sm">Edit</button>
                  <button onClick={() => onDelete(tpl.id)} className="rounded bg-red-600 text-white px-3 py-1 text-sm hover:bg-red-700">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesManager;


