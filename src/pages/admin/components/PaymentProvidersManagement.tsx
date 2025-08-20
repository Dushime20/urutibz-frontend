import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Save, Trash2, Search, Edit2, Calculator, BarChart3 } from 'lucide-react';
import { 
  createPaymentProvider, 
  deletePaymentProvider, 
  fetchPaymentProviders,
  fetchPaymentProviderStats,
  searchPaymentProviders,
  fetchPaymentProvidersByCountry,
  calculateFeesForCountry,
  compareProvidersForCountry,
  bulkUpdatePaymentProviders,
  updatePaymentProvider
} from '../service/api';
import type { CreatePaymentProviderInput, PaymentProvider, PaymentProviderStats, FeeCalculationResult, Country } from '../interfaces';
import { Dialog } from '@headlessui/react';

const emptyForm: CreatePaymentProviderInput = {
  country_id: '',
  provider_name: '',
  provider_type: 'mobile_money',
  display_name: '',
  logo_url: '',
  supported_currencies: [],
  min_amount: undefined,
  max_amount: undefined,
  fee_percentage: undefined,
  fee_fixed: undefined,
  supports_refunds: true,
  supports_recurring: false,
  processing_time_minutes: 2,
  description: '',
  settings: {
    public_key: '',
    secret_key: '',
    webhook_secret: ''
  },
  api_endpoint: ''
};

export default function PaymentProvidersManagement() {
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreatePaymentProviderInput>(emptyForm);
  const [stats, setStats] = useState<PaymentProviderStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [calcAmount, setCalcAmount] = useState<number | ''>('');
  const [calcCurrency, setCalcCurrency] = useState('RWF');
  const [calcType, setCalcType] = useState<string>('mobile_money');
  const [calcResults, setCalcResults] = useState<FeeCalculationResult[] | null>(null);
  const [compareItems, setCompareItems] = useState<FeeCalculationResult[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [bulkFeePct, setBulkFeePct] = useState<number | ''>('');
  const [bulkFeeFixed, setBulkFeeFixed] = useState<number | ''>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editLogoUrl, setEditLogoUrl] = useState('');
  const [editProcessingTime, setEditProcessingTime] = useState<number | ''>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [supportedCurrenciesInput, setSupportedCurrenciesInput] = useState('');

  const token = useMemo(() => localStorage.getItem('token') ?? undefined, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = countryFilter
        ? await fetchPaymentProvidersByCountry(countryFilter, token)
        : await fetchPaymentProviders(token);
      setProviders(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load payment providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const s = await fetchPaymentProviderStats(token);
        setStats(s);
      } catch {}
    };
    loadStats();
  }, []);

  useEffect(() => {
    // fetch countries for dropdowns
    (async () => {
      try {
        const list = await (await import('../service/api')).fetchCountries();
        setCountries(list);
      } catch (e) {
        // silently ignore
      }
    })();
  }, []);

  useEffect(() => {
    if (showCreateModal) {
      const initial = Array.isArray(form.supported_currencies)
        ? form.supported_currencies.join(', ')
        : String(form.supported_currencies || '');
      setSupportedCurrenciesInput(initial);
    }
  }, [showCreateModal]);

  const handleChange = (field: keyof CreatePaymentProviderInput, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSettingsChange = (field: keyof NonNullable<CreatePaymentProviderInput['settings']>, value: string) => {
    setForm(prev => ({ ...prev, settings: { ...(prev.settings || {}), [field]: value } }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload: CreatePaymentProviderInput = {
      ...form,
      supported_currencies: String(supportedCurrenciesInput || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
    };
    const { data, error } = await createPaymentProvider(payload, token);
    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    if (data) {
      setProviders(prev => [data, ...prev]);
      setForm(emptyForm);
    }
  };

  const handleDelete = async (id: string) => {
    const res = await deletePaymentProvider(id, token);
    if (res.success) setProviders(prev => prev.filter(p => p.id !== id));
    else setError(res.error);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadProviders();
      return;
    }
    try {
      setLoading(true);
      const results = await searchPaymentProviders(searchQuery.trim(), token);
      setProviders(results);
    } catch (e: any) {
      setError(e?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCountryFilter = async () => {
    await loadProviders();
  };

  const handleCalculate = async () => {
    if (!countryFilter || calcAmount === '' || !calcCurrency) return;
    try {
      const res = await calculateFeesForCountry({ countryId: countryFilter, amount: Number(calcAmount), currency: calcCurrency, provider_type: calcType }, token);
      setCalcResults(res);
    } catch (e: any) {
      setError(e?.message || 'Fee calculation failed');
    }
  };

  const handleCompare = async () => {
    if (!countryFilter || calcAmount === '' || !calcCurrency) return;
    try {
      const res = await compareProvidersForCountry({ countryId: countryFilter, amount: Number(calcAmount), currency: calcCurrency, provider_type: calcType }, token);
      setCompareItems(res.items as any);
    } catch (e: any) {
      setError(e?.message || 'Comparison failed');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBulkUpdate = async () => {
    const ids = Object.keys(selectedIds).filter(id => selectedIds[id]);
    if (ids.length === 0) return;
    const updates: any = {};
    if (bulkFeePct !== '') updates.fee_percentage = Number(bulkFeePct);
    if (bulkFeeFixed !== '') updates.fee_fixed = Number(bulkFeeFixed);
    if (Object.keys(updates).length === 0) return;
    const res = await bulkUpdatePaymentProviders({ ids, updates }, token);
    if (res.success) {
      setBulkFeePct('');
      setBulkFeeFixed('');
      await loadProviders();
    } else {
      setError(res.error);
    }
  };

  const startEdit = (p: PaymentProvider) => {
    setEditingId(p.id);
    setEditDisplayName(p.display_name);
    setEditLogoUrl(p.logo_url || '');
    setEditProcessingTime(p.processing_time_minutes ?? '');
  };

  const saveEdit = async (id: string) => {
    const payload: any = {
      display_name: editDisplayName,
      logo_url: editLogoUrl,
      processing_time_minutes: editProcessingTime === '' ? undefined : Number(editProcessingTime)
    };
    const { error } = await updatePaymentProvider(id, payload, token);
    if (!error) {
      setEditingId(null);
      await loadProviders();
    } else {
      setError(error);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Payment Providers</h3>
        <div className="flex items-center gap-2">
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search providers..."
            className="rounded-lg border border-gray-200 px-3 py-2"
          />
          <button onClick={handleSearch} className="inline-flex items-center px-3 py-2 rounded-lg bg-my-primary text-white hover:bg-my-primary/90"><Search className="w-4 h-4 mr-2"/>Search</button>
          <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2">
            <option value="">All Countries</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button onClick={handleCountryFilter} className="inline-flex items-center px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800">
            <RefreshCw className="w-4 h-4 mr-2" /> Filter
          </button>
          <button onClick={() => setShowCreateModal(true)} className="inline-flex items-center px-3 py-2 rounded-lg bg-my-primary text-white hover:bg-my-primary/90">Create Provider</button>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="text-xs text-gray-500">Total Providers</div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalProviders ?? 0}</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="text-xs text-gray-500">Active Providers</div>
            <div className="text-2xl font-bold text-gray-900">{stats.activeProviders ?? 0}</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="text-xs text-gray-500">Avg Fee %</div>
            <div className="text-2xl font-bold text-gray-900">{stats.avgFeePercentage != null ? stats.avgFeePercentage.toFixed(2) : '—'}%</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="text-xs text-gray-500">Types</div>
            <div className="text-sm text-gray-700">{stats.byType ? Object.entries(stats.byType).map(([k,v]) => `${k}:${v}`).join(', ') : '—'}</div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}

      <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)} className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" onClick={() => setShowCreateModal(false)} />
        <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-3xl mx-auto z-50 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Create Payment Provider</h4>
            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Country</label>
          <select value={form.country_id} onChange={e => handleChange('country_id', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" required>
            <option value="" disabled>Select a country</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Provider Name</label>
          <input value={form.provider_name} onChange={e => handleChange('provider_name', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" placeholder="mtn_momo" required />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Provider Type</label>
          <select value={form.provider_type} onChange={e => handleChange('provider_type', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2">
            <option value="mobile_money">Mobile Money</option>
            <option value="card">Card</option>
            <option value="bank">Bank</option>
            <option value="wallet">Wallet</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Display Name</label>
          <input value={form.display_name} onChange={e => handleChange('display_name', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Logo URL</label>
          <input value={form.logo_url} onChange={e => handleChange('logo_url', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Supported Currencies (comma-separated)</label>
          <input value={supportedCurrenciesInput} onChange={e => setSupportedCurrenciesInput(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" placeholder="RWF, USD" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Min Amount</label>
          <input type="number" value={form.min_amount ?? ''} onChange={e => handleChange('min_amount', e.target.value ? Number(e.target.value) : undefined)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Max Amount</label>
          <input type="number" value={form.max_amount ?? ''} onChange={e => handleChange('max_amount', e.target.value ? Number(e.target.value) : undefined)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Fee Percentage</label>
          <input type="number" step="0.001" value={form.fee_percentage ?? ''} onChange={e => handleChange('fee_percentage', e.target.value ? Number(e.target.value) : undefined)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Fee Fixed</label>
          <input type="number" value={form.fee_fixed ?? ''} onChange={e => handleChange('fee_fixed', e.target.value ? Number(e.target.value) : undefined)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Supports Refunds</label>
          <input type="checkbox" checked={!!form.supports_refunds} onChange={e => handleChange('supports_refunds', e.target.checked)} />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Supports Recurring</label>
          <input type="checkbox" checked={!!form.supports_recurring} onChange={e => handleChange('supports_recurring', e.target.checked)} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Processing Time (minutes)</label>
          <input type="number" value={form.processing_time_minutes ?? ''} onChange={e => handleChange('processing_time_minutes', e.target.value ? Number(e.target.value) : undefined)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">Description</label>
          <textarea value={form.description} onChange={e => handleChange('description', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" rows={3} />
        </div>
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Public Key</label>
            <input value={form.settings?.public_key || ''} onChange={e => handleSettingsChange('public_key', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Secret Key</label>
            <input value={form.settings?.secret_key || ''} onChange={e => handleSettingsChange('secret_key', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Webhook Secret</label>
            <input value={form.settings?.webhook_secret || ''} onChange={e => handleSettingsChange('webhook_secret', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">API Endpoint</label>
          <input value={form.api_endpoint || ''} onChange={e => handleChange('api_endpoint', e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
        </div>
        <div className="md:col-span-2 flex items-center justify-end gap-2">
          <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Cancel</button>
          <button type="submit" disabled={submitting} className="inline-flex items-center px-4 py-2 rounded-lg bg-my-primary text-white hover:bg-my-primary/90 disabled:opacity-50">
            <Save className="w-4 h-4 mr-2" /> {submitting ? 'Saving...' : 'Create Provider'}
          </button>
        </div>
          </form>
        </div>
      </Dialog>

      {/* Country Fee Tools */}
      <div className="bg-white rounded-3xl p-4 border border-gray-100 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-4 h-4 text-my-primary"/>
          <div className="font-semibold text-gray-900">Fees & Comparison (by Country)</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input value={countryFilter} onChange={e => setCountryFilter(e.target.value)} placeholder="Country ID" className="rounded-lg border border-gray-200 px-3 py-2" />
          <input type="number" value={calcAmount} onChange={e => setCalcAmount(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Amount" className="rounded-lg border border-gray-200 px-3 py-2" />
          <input value={calcCurrency} onChange={e => setCalcCurrency(e.target.value)} placeholder="Currency" className="rounded-lg border border-gray-200 px-3 py-2" />
          <select value={calcType} onChange={e => setCalcType(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2">
            <option value="mobile_money">mobile_money</option>
            <option value="card">card</option>
            <option value="bank">bank</option>
            <option value="wallet">wallet</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleCalculate} type="button" className="px-3 py-2 rounded-lg bg-my-primary text-white hover:bg-my-primary/90">Calculate</button>
            <button onClick={handleCompare} type="button" className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Compare</button>
          </div>
        </div>
        {calcResults && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2 pr-4">Provider</th>
                  <th className="py-2 pr-4">Currency</th>
                  <th className="py-2 pr-4">Fee %</th>
                  <th className="py-2 pr-4">Fee Fixed</th>
                  <th className="py-2 pr-4">Total Fee</th>
                  <th className="py-2 pr-4">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {calcResults.map((r, idx) => (
                  <tr key={idx} className="border-t border-gray-100">
                    <td className="py-2 pr-4">{r.provider_name}</td>
                    <td className="py-2 pr-4">{r.currency}</td>
                    <td className="py-2 pr-4">{r.fee_percentage != null ? (r.fee_percentage * 100).toFixed(2) + '%' : '—'}</td>
                    <td className="py-2 pr-4">{r.fee_fixed ?? 0}</td>
                    <td className="py-2 pr-4">{r.total_fee}</td>
                    <td className="py-2 pr-4">{r.total_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {compareItems && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-my-primary"/><div className="text-sm text-gray-600">Comparison</div></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {compareItems.map((c, idx) => (
                <div key={idx} className="border border-gray-100 rounded-xl p-3">
                  <div className="font-medium text-gray-900">{(c as any).display_name || c.provider_name}</div>
                  <div className="text-xs text-gray-500">{c.provider_type} • {c.currency}</div>
                  <div className="text-sm text-gray-700 mt-1">Fee: {(c.fee_percentage != null ? (c.fee_percentage*100).toFixed(2)+'%' : '—')} + {c.fee_fixed ?? 0}</div>
                  <div className="text-sm text-gray-700">Total: {c.total_amount}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Existing Providers</h4>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : providers.length === 0 ? (
          <div className="text-gray-500">No payment providers found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {providers.map(p => (
              <div key={p.id} className="border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={!!selectedIds[p.id]} onChange={() => toggleSelect(p.id)} />
                    <div className="font-semibold text-gray-900">{p.display_name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingId === p.id ? (
                      <button onClick={() => saveEdit(p.id)} className="px-3 py-1 rounded-lg bg-my-primary text-white hover:bg-my-primary/90 text-xs">Save</button>
                    ) : (
                      <button onClick={() => startEdit(p)} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"><Edit2 className="w-4 h-4"/></button>
                    )}
                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-2">{p.provider_name} • {p.provider_type}</div>
                {editingId === p.id ? (
                  <div className="space-y-2 mb-2">
                    <input value={editDisplayName} onChange={e => setEditDisplayName(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
                    <input value={editLogoUrl} onChange={e => setEditLogoUrl(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" placeholder="Logo URL" />
                    <input type="number" value={editProcessingTime} onChange={e => setEditProcessingTime(e.target.value === '' ? '' : Number(e.target.value))} className="w-full rounded-lg border border-gray-200 px-3 py-2" placeholder="Processing minutes" />
                  </div>
                ) : p.logo_url ? (
                  <img src={p.logo_url} alt={p.display_name} className="h-8 object-contain mb-2" />
                ) : null}
                <div className="text-sm text-gray-600">Currencies: {p.supported_currencies?.join(', ')}</div>
                {p.fee_percentage != null && (
                  <div className="text-sm text-gray-600">Fees: {(p.fee_percentage * 100).toFixed(2)}% + {p.fee_fixed || 0}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Update */}
      <div className="mt-8 bg-white rounded-3xl p-4 border border-gray-100">
        <div className="font-semibold text-gray-900 mb-3">Bulk Update Selected</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input type="number" step="0.001" value={bulkFeePct} onChange={e => setBulkFeePct(e.target.value === '' ? '' : Number(e.target.value))} placeholder="fee_percentage (e.g., 0.02)" className="rounded-lg border border-gray-200 px-3 py-2" />
          <input type="number" value={bulkFeeFixed} onChange={e => setBulkFeeFixed(e.target.value === '' ? '' : Number(e.target.value))} placeholder="fee_fixed" className="rounded-lg border border-gray-200 px-3 py-2" />
          <button onClick={handleBulkUpdate} className="px-4 py-2 rounded-lg bg-my-primary text-white hover:bg-my-primary/90">Apply</button>
        </div>
      </div>
    </div>
  );
}


