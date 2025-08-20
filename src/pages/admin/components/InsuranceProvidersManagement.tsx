import React, { useEffect, useMemo, useState } from 'react';
import { Save, Trash2, Edit2, Search, Eye, RefreshCw } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import {
  fetchInsuranceProviders,
  createInsuranceProvider,
  deleteInsuranceProvider,
  updateInsuranceProvider,
  fetchInsuranceProviderById
} from '../service/api';
import { fetchCountries } from '../service/api';
import type { Country, CreateInsuranceProviderInput, InsuranceProvider } from '../interfaces';

const emptyForm: CreateInsuranceProviderInput = {
  country_id: '',
  provider_name: '',
  display_name: '',
  logo_url: '',
  contact_info: { phone: '', email: '', website: '', address: { line1: '', city: '' } },
  supported_categories: [],
  api_endpoint: '',
  api_credentials: { key: '', secret: '' },
  is_active: true,
  provider_type: 'TRADITIONAL',
  license_number: '',
  rating: 0,
  coverage_types: [],
  min_coverage_amount: undefined,
  max_coverage_amount: undefined,
  deductible_options: [],
  processing_time_days: undefined,
  languages_supported: [],
  commission_rate: undefined,
  integration_status: 'TESTING'
};

export default function InsuranceProvidersManagement() {
  const [items, setItems] = useState<InsuranceProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateInsuranceProviderInput>(emptyForm);
  const [showCreate, setShowCreate] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [search, setSearch] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CreateInsuranceProviderInput>(emptyForm);
  const token = useMemo(() => localStorage.getItem('token') ?? undefined, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchInsuranceProviders({ page: 1, limit: 50 }, token);
      const data = res?.data ?? res ?? [];
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load insurance providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    (async () => {
      try {
        const c = await fetchCountries();
        setCountries(c);
      } catch {}
    })();
  }, []);

  const handleChange = (path: string, value: any) => {
    setForm(prev => {
      const draft: any = { ...prev };
      const keys = path.split('.');
      let cur = draft;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]] ||= {};
      cur[keys[keys.length - 1]] = value;
      return draft as CreateInsuranceProviderInput;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload: CreateInsuranceProviderInput = {
      ...form,
      supported_categories: form.supported_categories || [],
      coverage_types: (form.coverage_types || []).filter(Boolean),
      languages_supported: (form.languages_supported || []).filter(Boolean),
    };
    const { data, error } = await createInsuranceProvider(payload, token);
    setSubmitting(false);
    if (error) return setError(error);
    if (data) {
      setShowCreate(false);
      setForm(emptyForm);
      await load();
    }
  };

  const handleDelete = async (id: string) => {
    await deleteInsuranceProvider(id, token);
    await load();
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetchInsuranceProviders({ search, limit: 50 }, token);
      const data = res?.data ?? res ?? [];
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (id: string) => {
    setLoadingDetail(true);
    setShowDetail(true);
    try {
      const res = await fetchInsuranceProviderById(id, { include_stats: true }, token);
      console.log('API Response:', res); // Debug log
      
      // Handle different response structures
      let data = null;
      if (res?.success && res?.data) {
        data = res.data;
      } else if (res?.data) {
        data = res.data;
      } else if (res && typeof res === 'object' && !Array.isArray(res)) {
        data = res;
      }
      
      if (data) {
        setDetail(data);
      } else {
        console.error('No valid data found in response:', res);
        // Fallback: try to find the provider in the existing list
        const existingProvider = items.find(item => item.id === id);
        if (existingProvider) {
          console.log('Using existing provider data as fallback');
          setDetail(existingProvider);
        } else {
          setError('Failed to load provider details');
          setDetail(null);
        }
      }
    } catch (e: any) {
      console.error('Error fetching provider details:', e);
      // Fallback: try to find the provider in the existing list
      const existingProvider = items.find(item => item.id === id);
      if (existingProvider) {
        console.log('Using existing provider data as fallback due to API error');
        setDetail(existingProvider);
      } else {
        setError(e?.message || 'Failed to load provider details');
        setDetail(null);
      }
    } finally {
      setLoadingDetail(false);
    }
  };

  const startEdit = (p: InsuranceProvider) => {
    setEditId(p.id);
    setEditForm({
      country_id: p.country_id,
      provider_name: p.provider_name,
      display_name: p.display_name,
      logo_url: p.logo_url || '',
      contact_info: p.contact_info || { phone: '', email: '', website: '', address: { line1: '', city: '' } },
      supported_categories: p.supported_categories || [],
      api_endpoint: p.api_endpoint || '',
      api_credentials: (p as any).api_credentials || { key: '', secret: '' },
      is_active: p.is_active,
      provider_type: p.provider_type || 'TRADITIONAL',
      license_number: p.license_number || '',
      rating: Number(p.rating || 0),
      coverage_types: p.coverage_types || [],
      min_coverage_amount: p.min_coverage_amount ? Number(p.min_coverage_amount) : undefined,
      max_coverage_amount: p.max_coverage_amount ? Number(p.max_coverage_amount) : undefined,
      deductible_options: Array.isArray(p.deductible_options) ? p.deductible_options.map((d:any)=>Number(d)) : [],
      processing_time_days: p.processing_time_days,
      languages_supported: p.languages_supported || [],
      commission_rate: p.commission_rate ? Number(p.commission_rate) : undefined,
      integration_status: p.integration_status || 'TESTING'
    });
    setShowEdit(true);
  };

  const handleEditChange = (path: string, value: any) => {
    setEditForm(prev => {
      const draft: any = { ...prev };
      const keys = path.split('.');
      let cur = draft;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]] ||= {};
      cur[keys[keys.length - 1]] = value;
      return draft as CreateInsuranceProviderInput;
    });
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setSubmitting(true);
    try {
      await updateInsuranceProvider(editId, editForm, token);
      setShowEdit(false);
      setEditId(null);
      await load();
    } catch (e:any) {
      setError(e?.message || 'Failed to update insurance provider');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Insurance Providers</h3>
        <div className="flex items-center gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="rounded-lg border border-gray-200 px-3 py-2"/>
          <button onClick={handleSearch} className="inline-flex items-center px-3 py-2 rounded-lg bg-my-primary text-white hover:bg-my-primary/90"><Search className="w-4 h-4 mr-2"/>Search</button>
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center px-3 py-2 rounded-lg bg-my-primary text-white hover:bg-my-primary/90">Create Insurance</button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}

      <div>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500">No insurance providers found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map(p => (
              <div key={p.id} className="border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-900">{p.display_name}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openDetail(p.id)} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"><Eye className="w-4 h-4"/></button>
                    <button onClick={() => startEdit(p)} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-2">{p.provider_name} • {p.provider_type}</div>
                {p.logo_url && (<img src={p.logo_url} alt={p.display_name} className="h-8 object-contain mb-2" />)}
                <div className="text-sm text-gray-600">Coverage: {Array.isArray(p.coverage_types) ? p.coverage_types.join(', ') : ''}</div>
                <div className="text-sm text-gray-600">Rating: {p.rating ?? '—'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreate} onClose={() => setShowCreate(false)} className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" onClick={() => setShowCreate(false)} />
        <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl mx-auto z-50 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Create Insurance Provider</h4>
            <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Country</label>
              <select value={form.country_id} onChange={e => handleChange('country_id', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" required>
                <option value="" disabled>Select a country</option>
                {countries.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Provider Name</label>
              <input value={form.provider_name} onChange={e => handleChange('provider_name', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Display Name</label>
              <input value={form.display_name} onChange={e => handleChange('display_name', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Logo URL</label>
              <input value={form.logo_url || ''} onChange={e => handleChange('logo_url', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone</label>
                <input value={form.contact_info?.phone || ''} onChange={e => handleChange('contact_info.phone', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input value={form.contact_info?.email || ''} onChange={e => handleChange('contact_info.email', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Website</label>
                <input value={form.contact_info?.website || ''} onChange={e => handleChange('contact_info.website', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Address Line 1</label>
                  <input value={form.contact_info?.address?.line1 || ''} onChange={e => handleChange('contact_info.address.line1', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">City</label>
                  <input value={form.contact_info?.address?.city || ''} onChange={e => handleChange('contact_info.address.city', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Supported Categories (IDs, comma-separated)</label>
              <input value={(form.supported_categories || []).join(', ')} onChange={e => handleChange('supported_categories', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">API Endpoint</label>
              <input value={form.api_endpoint || ''} onChange={e => handleChange('api_endpoint', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">API Key</label>
                <input value={(form.api_credentials as any)?.key || ''} onChange={e => handleChange('api_credentials.key', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">API Secret</label>
                <input value={(form.api_credentials as any)?.secret || ''} onChange={e => handleChange('api_credentials.secret', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Provider Type</label>
              <input value={form.provider_type || ''} onChange={e => handleChange('provider_type', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">License Number</label>
              <input value={form.license_number || ''} onChange={e => handleChange('license_number', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Rating</label>
              <input type="number" step="0.1" value={Number(form.rating ?? 0)} onChange={e => handleChange('rating', Number(e.target.value))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Coverage Types (comma)</label>
              <input value={(form.coverage_types || []).join(', ')} onChange={e => handleChange('coverage_types', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Min Coverage</label>
                <input type="number" value={Number(form.min_coverage_amount ?? 0) || ''} onChange={e => handleChange('min_coverage_amount', e.target.value === '' ? undefined : Number(e.target.value))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Coverage</label>
                <input type="number" value={Number(form.max_coverage_amount ?? 0) || ''} onChange={e => handleChange('max_coverage_amount', e.target.value === '' ? undefined : Number(e.target.value))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Deductible Options (comma)</label>
              <input value={(form.deductible_options || []).join(', ')} onChange={e => handleChange('deductible_options', e.target.value.split(',').map(s => Number(s.trim())).filter(n => !Number.isNaN(n)))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Processing Time (days)</label>
              <input type="number" value={Number(form.processing_time_days ?? 0) || ''} onChange={e => handleChange('processing_time_days', e.target.value === '' ? undefined : Number(e.target.value))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Languages Supported (comma)</label>
              <input value={(form.languages_supported || []).join(', ')} onChange={e => handleChange('languages_supported', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Commission Rate</label>
              <input type="number" step="0.001" value={Number(form.commission_rate ?? 0) || ''} onChange={e => handleChange('commission_rate', e.target.value === '' ? undefined : Number(e.target.value))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Integration Status</label>
              <input value={form.integration_status || ''} onChange={e => handleChange('integration_status', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div className="md:col-span-2 flex items-center justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Cancel</button>
              <button type="submit" disabled={submitting} className="inline-flex items-center px-4 py-2 rounded-lg bg-my-primary text-white hover:bg-my-primary/90 disabled:opacity-50"><Save className="w-4 h-4 mr-2"/>Create</button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={showDetail} onClose={() => setShowDetail(false)} className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" onClick={() => setShowDetail(false)} />
        <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-3xl mx-auto z-50 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Insurance Provider Details</h4>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => detail && openDetail(detail.id)} 
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
                title="Refresh data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
          </div>
          {loadingDetail ? (
            <div className="text-gray-500">Loading...</div>
          ) : !detail ? (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">No details available.</div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  Error: {error}
                </div>
              )}
              <button 
                onClick={() => detail && openDetail(detail.id)} 
                className="mt-3 px-4 py-2 bg-my-primary text-white rounded-lg hover:bg-my-primary/90"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header with Logo */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                {detail.logo_url && (
                  <img src={detail.logo_url} alt={detail.display_name} className="h-16 w-16 object-contain rounded-lg border border-gray-200"/>
                )}
                <div>
                  <h5 className="text-xl font-semibold text-gray-900">{detail.display_name}</h5>
                  <p className="text-sm text-gray-600">{detail.provider_name} • {detail.provider_type}</p>
                  <p className="text-xs text-gray-500">License: {detail.license_number || 'N/A'}</p>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h6 className="font-medium text-gray-900 border-b border-gray-100 pb-1">Basic Information</h6>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium text-gray-600">Country ID:</span> <span className="text-gray-800">{detail.country_id}</span></div>
                    <div><span className="font-medium text-gray-600">Status:</span> <span className={`px-2 py-1 rounded-full text-xs ${detail.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{detail.is_active ? 'Active' : 'Inactive'}</span></div>
                    <div><span className="font-medium text-gray-600">Rating:</span> <span className="text-gray-800">{detail.rating || '—'}</span></div>
                    <div><span className="font-medium text-gray-600">Integration:</span> <span className="text-gray-800">{detail.integration_status}</span></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h6 className="font-medium text-gray-900 border-b border-gray-100 pb-1">Coverage & Limits</h6>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium text-gray-600">Coverage Types:</span> <span className="text-gray-800">{Array.isArray(detail.coverage_types) ? detail.coverage_types.join(', ') : 'N/A'}</span></div>
                    <div><span className="font-medium text-gray-600">Min Coverage:</span> <span className="text-gray-800">{detail.min_coverage_amount ? `$${Number(detail.min_coverage_amount).toLocaleString()}` : 'N/A'}</span></div>
                    <div><span className="font-medium text-gray-600">Max Coverage:</span> <span className="text-gray-800">{detail.max_coverage_amount ? `$${Number(detail.max_coverage_amount).toLocaleString()}` : 'N/A'}</span></div>
                    <div><span className="font-medium text-gray-600">Processing Time:</span> <span className="text-gray-800">{detail.processing_time_days ? `${detail.processing_time_days} days` : 'N/A'}</span></div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h6 className="font-medium text-gray-900 border-b border-gray-100 pb-1">Contact Information</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium text-gray-600">Email:</span> <span className="text-gray-800">{detail.contact_info?.email || 'N/A'}</span></div>
                  <div><span className="font-medium text-gray-600">Phone:</span> <span className="text-gray-800">{detail.contact_info?.phone || 'N/A'}</span></div>
                  <div><span className="font-medium text-gray-600">Website:</span> <span className="text-gray-800">{detail.contact_info?.website ? <a href={detail.contact_info.website} target="_blank" rel="noopener noreferrer" className="text-my-primary hover:underline">{detail.contact_info.website}</a> : 'N/A'}</span></div>
                  <div><span className="font-medium text-gray-600">Address:</span> <span className="text-gray-800">{detail.contact_info?.address?.line1 && detail.contact_info?.address?.city ? `${detail.contact_info.address.line1}, ${detail.contact_info.address.city}` : 'N/A'}</span></div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h6 className="font-medium text-gray-900 border-b border-gray-100 pb-1">Additional Details</h6>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium text-gray-600">Supported Categories:</span> <span className="text-gray-800">{Array.isArray(detail.supported_categories) ? detail.supported_categories.join(', ') : 'N/A'}</span></div>
                    <div><span className="font-medium text-gray-600">Deductible Options:</span> <span className="text-gray-800">{Array.isArray(detail.deductible_options) ? detail.deductible_options.map((d: any) => `$${Number(d).toLocaleString()}`).join(', ') : 'N/A'}</span></div>
                    <div><span className="font-medium text-gray-600">Languages:</span> <span className="text-gray-800">{Array.isArray(detail.languages_supported) ? detail.languages_supported.join(', ') : 'N/A'}</span></div>
                    <div><span className="font-medium text-gray-600">Commission Rate:</span> <span className="text-gray-800">{detail.commission_rate ? `${(Number(detail.commission_rate) * 100).toFixed(1)}%` : 'N/A'}</span></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h6 className="font-medium text-gray-900 border-b border-gray-100 pb-1">API Information</h6>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium text-gray-600">API Endpoint:</span> <span className="text-gray-800">{detail.api_endpoint || 'N/A'}</span></div>
                    <div><span className="font-medium text-gray-600">API Credentials:</span> <span className="text-gray-800">{detail.api_credentials && Object.keys(detail.api_credentials).length > 0 ? 'Configured' : 'Not configured'}</span></div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="space-y-3 pt-2 border-t border-gray-200">
                <h6 className="font-medium text-gray-900 border-b border-gray-100 pb-1">Timestamps</h6>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium text-gray-600">Created:</span> <span className="text-gray-800">{detail.created_at ? new Date(detail.created_at).toLocaleDateString() : 'N/A'}</span></div>
                  <div><span className="font-medium text-gray-600">Updated:</span> <span className="text-gray-800">{detail.updated_at ? new Date(detail.updated_at).toLocaleDateString() : 'N/A'}</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEdit} onClose={() => setShowEdit(false)} className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" onClick={() => setShowEdit(false)} />
        <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl mx-auto z-50 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Edit Insurance Provider</h4>
            <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          <form onSubmit={saveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Country</label>
              <select value={editForm.country_id} onChange={e => handleEditChange('country_id', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" required>
                {countries.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Provider Name</label>
              <input value={editForm.provider_name} onChange={e => handleEditChange('provider_name', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Display Name</label>
              <input value={editForm.display_name} onChange={e => handleEditChange('display_name', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Logo URL</label>
              <input value={editForm.logo_url || ''} onChange={e => handleEditChange('logo_url', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">License Number</label>
              <input value={editForm.license_number || ''} onChange={e => handleEditChange('license_number', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Provider Type</label>
              <select value={editForm.provider_type || ''} onChange={e => handleEditChange('provider_type', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2">
                <option value="TRADITIONAL">Traditional</option>
                <option value="DIGITAL">Digital</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Rating</label>
              <input type="number" step="0.1" min="0" max="5" value={Number(editForm.rating ?? 0)} onChange={e => handleEditChange('rating', Number(e.target.value))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Integration Status</label>
              <select value={editForm.integration_status || ''} onChange={e => handleEditChange('integration_status', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2">
                <option value="TESTING">Testing</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone</label>
                <input value={editForm.contact_info?.phone || ''} onChange={e => handleEditChange('contact_info.phone', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input value={editForm.contact_info?.email || ''} onChange={e => handleEditChange('contact_info.email', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Website</label>
                <input value={editForm.contact_info?.website || ''} onChange={e => handleEditChange('contact_info.website', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Address Line 1</label>
                <input value={editForm.contact_info?.address?.line1 || ''} onChange={e => handleEditChange('contact_info.address.line1', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">City</label>
                <input value={editForm.contact_info?.address?.city || ''} onChange={e => handleEditChange('contact_info.address.city', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Supported Categories (IDs, comma-separated)</label>
              <input value={(editForm.supported_categories || []).join(', ')} onChange={e => handleEditChange('supported_categories', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">API Endpoint</label>
              <input value={editForm.api_endpoint || ''} onChange={e => handleEditChange('api_endpoint', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">API Key</label>
                <input value={(editForm.api_credentials as any)?.key || ''} onChange={e => handleEditChange('api_credentials.key', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">API Secret</label>
                <input value={(editForm.api_credentials as any)?.secret || ''} onChange={e => handleEditChange('api_credentials.secret', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Coverage Types (comma-separated)</label>
              <input value={(editForm.coverage_types || []).join(', ')} onChange={e => handleEditChange('coverage_types', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Min Coverage Amount</label>
                <input type="number" value={Number(editForm.min_coverage_amount ?? 0) || ''} onChange={e => handleEditChange('min_coverage_amount', e.target.value === '' ? undefined : Number(e.target.value))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Max Coverage Amount</label>
                <input type="number" value={Number(editForm.max_coverage_amount ?? 0) || ''} onChange={e => handleEditChange('max_coverage_amount', e.target.value === '' ? undefined : Number(e.target.value))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Deductible Options (comma-separated)</label>
              <input value={(editForm.deductible_options || []).join(', ')} onChange={e => handleEditChange('deductible_options', e.target.value.split(',').map(s => Number(s.trim())).filter(n => !Number.isNaN(n)))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Processing Time (days)</label>
              <input type="number" value={Number(editForm.processing_time_days ?? 0) || ''} onChange={e => handleEditChange('processing_time_days', e.target.value === '' ? undefined : Number(e.target.value))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Languages Supported (comma-separated)</label>
              <input value={(editForm.languages_supported || []).join(', ')} onChange={e => handleEditChange('languages_supported', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Commission Rate</label>
              <input type="number" step="0.001" min="0" max="1" value={Number(editForm.commission_rate ?? 0) || ''} onChange={e => handleEditChange('commission_rate', e.target.value === '' ? undefined : Number(e.target.value))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div className="md:col-span-2 flex items-center justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Cancel</button>
              <button type="submit" disabled={submitting} className="inline-flex items-center px-4 py-2 rounded-lg bg-my-primary text-white hover:bg-my-primary/90 disabled:opacity-50"><Save className="w-4 h-4 mr-2"/>Save</button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}


