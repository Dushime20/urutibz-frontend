import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Save, Trash2, Edit2, Search, Eye, Plus, Network, MapPin } from 'lucide-react';
import type { Country, AdministrativeDivision, CreateAdministrativeDivisionInput, AdministrativeDivisionStats, AdministrativeDivisionTree } from '../interfaces';
import {
  fetchAdministrativeDivisions,
  searchAdministrativeDivisions,
  fetchAdministrativeDivisionTree,
  fetchAdministrativeDivisionById,
  fetchAdministrativeDivisionStats,
  createAdministrativeDivision,
  updateAdministrativeDivision,
  deleteAdministrativeDivision,
  toggleAdministrativeDivisionStatus
} from '../service/api';

type DivisionForm = CreateAdministrativeDivisionInput;

const emptyForm: DivisionForm = {
  country_id: '',
  parent_id: '',
  level: 1,
  name: '',
  local_name: '',
  type: 'province',
  code: '',
  population: undefined,
  area_km2: undefined,
  coordinates: undefined,
  is_active: true
};

const divisionTypes = [
  { value: 'province', label: 'Province' },
  { value: 'district', label: 'District' },
  { value: 'sector', label: 'Sector' },
  { value: 'cell', label: 'Cell' },
  { value: 'village', label: 'Village' }
];

const divisionLevels = [
  { value: 1, label: 'Level 1 (Province)' },
  { value: 2, label: 'Level 2 (District)' },
  { value: 3, label: 'Level 3 (Sector)' },
  { value: 4, label: 'Level 4 (Cell)' },
  { value: 5, label: 'Level 5 (Village)' }
];

export default function AdministrativeDivisionsManagement() {
  const [items, setItems] = useState<AdministrativeDivision[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | ''>('');
  const [typeFilter, setTypeFilter] = useState('');
  const [stats, setStats] = useState<AdministrativeDivisionStats | null>(null);
  const [treeData, setTreeData] = useState<AdministrativeDivisionTree | null>(null);
  const [showTree, setShowTree] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<DivisionForm>(emptyForm);
  const [showCoordinates, setShowCoordinates] = useState(false);

  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail] = useState<AdministrativeDivision | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<DivisionForm>(emptyForm);



  const token = useMemo(() => localStorage.getItem('token') ?? undefined, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: any = { limit: 100 };
      if (countryFilter) filters.country_id = countryFilter;
      if (levelFilter !== '') filters.level = levelFilter;
      if (typeFilter) filters.type = typeFilter;
      if (search.trim()) {
        const searchResult = await searchAdministrativeDivisions(search.trim(), filters, token);
        setItems(searchResult.divisions || []);
      } else {
        const data = await fetchAdministrativeDivisions(filters, token);
        setItems(data);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load administrative divisions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    // fetch countries for dropdowns - using the same pattern as PaymentProvidersManagement
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
    // fetch stats separately
    (async () => {
      try {
        const statsData = await fetchAdministrativeDivisionStats(undefined, token);
        setStats(statsData || null);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    })();
  }, [token]);

  // Debug modal state changes
  useEffect(() => {
    console.log('Modal state changed - showDetail:', showDetail, 'detail:', detail);
  }, [showDetail, detail]);

  const doSearch = async () => {
    await load();
  };

  const onCreateOpen = () => {
    setForm(emptyForm);
    setShowCoordinates(false);
    setShowCreate(true);
  };

  const loadTree = async () => {
    try {
      const tree = await fetchAdministrativeDivisionTree(countryFilter || undefined, 3, token);
      setTreeData(tree);
    } catch (e: any) {
      setError(e?.message || 'Failed to load tree structure');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate required fields
    if (!form.country_id || !form.name || !form.code) {
      setError('Country, Name, and Code are required fields');
      return;
    }
    
    // Prepare coordinates if both lat and lng are provided
    const formData = { ...form };
    if (formData.coordinates && (!formData.coordinates.latitude || !formData.coordinates.longitude)) {
      formData.coordinates = undefined;
    }
    
    // Convert empty strings to undefined for optional fields
    if (formData.parent_id === '') {
      formData.parent_id = undefined;
    }
    
    // Ensure country_id is not empty string
    if (formData.country_id === '') {
      setError('Please select a country');
      return;
    }
    
    const res = await createAdministrativeDivision(formData, token);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.data) {
      setShowCreate(false);
      await load();
    }
  };

  const handleView = async (id: string) => {
    try {
      console.log('Opening detail modal for ID:', id);
      setLoadingDetail(true);
      setError(null);
      const division = await fetchAdministrativeDivisionById(id, undefined, token);
      console.log('Fetched division data:', division);
      setDetail(division);
      setShowDetail(true);
      console.log('Modal state set to show:', true);
    } catch (e: any) {
      console.error('Error in handleView:', e);
      setError(e?.message || 'Failed to load division details');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      setLoadingDetail(true);
      setError(null);
      const division = await fetchAdministrativeDivisionById(id, undefined, token);
      setEditForm({
        country_id: division.country_id,
        parent_id: division.parent_id || '',
        level: division.level,
        name: division.name,
        local_name: division.local_name || '',
        type: division.type,
        code: division.code,
        population: division.population,
        area_km2: division.area_km2,
        coordinates: division.coordinates,
        is_active: division.is_active
      });
      setEditId(id);
      setShowEdit(true);
    } catch (e: any) {
      setError(e?.message || 'Failed to load division for editing');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    
    setError(null);
    
    // Validate required fields
    if (!editForm.country_id || !editForm.name || !editForm.code) {
      setError('Country, Name, and Code are required fields');
      return;
    }
    
    // Prepare coordinates if both lat and lng are provided
    const formData = { ...editForm };
    if (formData.coordinates && (!formData.coordinates.latitude || !formData.coordinates.longitude)) {
      formData.coordinates = undefined;
    }
    
    // Convert empty strings to undefined for optional fields
    if (formData.parent_id === '') {
      formData.parent_id = undefined;
    }
    
    try {
      const res = await updateAdministrativeDivision(editId, formData, token);
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.data) {
        setShowEdit(false);
        await load();
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to update division');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this division?')) return;
    
    try {
      setError(null);
      const res = await deleteAdministrativeDivision(id, token);
      if (!res.success) {
        setError(res.error || 'Failed to delete division');
        return;
      }
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete division');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      setError(null);
      const currentDivision = items.find(item => item.id === id);
      if (!currentDivision) return;
      
      const res = await toggleAdministrativeDivisionStatus(id, { is_active: !currentDivision.is_active }, token);
      if (res.error) {
        setError(res.error);
        return;
      }
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to toggle division status');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Administrative Divisions</h3>
                 <div className="flex items-center gap-2">
          <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2">
            <option value="">All Countries ({countries.length})</option>
            {countries.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={levelFilter} onChange={e => setLevelFilter(e.target.value === '' ? '' : Number(e.target.value))} className="rounded-lg border border-gray-200 px-3 py-2">
            <option value="">All Levels</option>
            {divisionLevels.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2">
            <option value="">All Types</option>
            {divisionTypes.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search divisions..." className="rounded-lg border border-gray-200 px-1 py-2" />
          <button onClick={doSearch} className="inline-flex items-center px-3 py-2 rounded-lg bg-my-primary text-white hover:bg-my-primary/90"><Search className="w-4 h-4 mr-2"/>Search</button>
          <button onClick={() => { setShowTree(true); loadTree(); }} className="inline-flex items-center px-1 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"><Network className="w-4 h-4 mr-2"/>Tree</button>
                     <button onClick={onCreateOpen} className="inline-flex items-center px-1 py-2 rounded-lg bg-my-primary text-white hover:bg-my-primary/90"><Plus className="w-4 h-4 mr-2"/>Create</button>
        </div>
      </div>
      
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="text-xs text-gray-500">Total Divisions</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_divisions ?? 0}</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="text-xs text-gray-500">Active</div>
            <div className="text-2xl font-bold text-gray-900">{stats.active_divisions ?? 0}</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="text-xs text-gray-500">Total Population</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_population ? (stats.total_population / 1000000).toFixed(1) + 'M' : '—'}</div>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="text-xs text-gray-500">Total Area</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_area_km2 ? (stats.total_area_km2 / 1000).toFixed(1) + 'K km²' : '—'}</div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}

      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Existing Divisions</h4>
        {loading ? (
          <div className="text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-500">No administrative divisions found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map(d => (
              <div key={d.id} className="border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-900">{d.name}</div>
                                   <div className="flex items-center gap-2">
                   <button onClick={() => handleView(d.id)} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"><Eye className="w-4 h-4"/></button>
                   <button onClick={() => handleEdit(d.id)} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"><Edit2 className="w-4 h-4"/></button>
                   <button onClick={() => handleToggleStatus(d.id)} className={`p-2 rounded-lg ${d.is_active ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>
                     {d.is_active ? '✓' : '✗'}
                   </button>
                   <button onClick={() => handleDelete(d.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4"/></button>
                 </div>
                </div>
                <div className="text-xs text-gray-500 mb-2">{d.type} • Level {d.level} • {d.code}</div>
                {d.local_name && <div className="text-sm text-gray-600 mb-2">{d.local_name}</div>}
                <div className="text-sm text-gray-600">Country: {countries.find(c => c.id === d.country_id)?.name || d.country_id}</div>
                {d.population && <div className="text-sm text-gray-600">Population: {d.population.toLocaleString()}</div>}
                {d.area_km2 && <div className="text-sm text-gray-600">Area: {d.area_km2} km²</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreate} onClose={() => setShowCreate(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <DialogTitle as="div" className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Create Administrative Division</h4>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </DialogTitle>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
               <label className="block text-sm text-gray-600 mb-1">Country</label>
              <select value={form.country_id} onChange={e => setForm(prev => ({ ...prev, country_id: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" required>
                <option value="" disabled>Select a country</option>
                {countries.length > 0 ? (
                  countries.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))
                ) : (
                  <option value="" disabled>Loading countries...</option>
                )}
              </select>
              
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Parent Division (Optional)</label>
              <select value={form.parent_id} onChange={e => setForm(prev => ({ ...prev, parent_id: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2">
                <option value="">No Parent</option>
                {items.filter(d => d.country_id === form.country_id).map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.type})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Level</label>
              <select value={form.level} onChange={e => setForm(prev => ({ ...prev, level: Number(e.target.value) }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" required>
                {divisionLevels.map(l => (<option key={l.value} value={l.value}>{l.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" required>
                {divisionTypes.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Name</label>
              <input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Local Name</label>
              <input value={form.local_name || ''} onChange={e => setForm(prev => ({ ...prev, local_name: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Code</label>
              <input value={form.code} onChange={e => setForm(prev => ({ ...prev, code: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Population</label>
              <input type="number" value={form.population || ''} onChange={e => setForm(prev => ({ ...prev, population: e.target.value === '' ? undefined : Number(e.target.value) }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Area (km²)</label>
              <input type="number" step="0.1" value={form.area_km2 || ''} onChange={e => setForm(prev => ({ ...prev, area_km2: e.target.value === '' ? undefined : Number(e.target.value) }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            </div>
            <div className="md:col-span-2">
              <button type="button" onClick={() => setShowCoordinates(!showCoordinates)} className="flex items-center gap-2 text-sm text-my-primary hover:text-my-primary/80">
                <MapPin className="w-4 h-4" />
                {showCoordinates ? 'Hide' : 'Add'} Coordinates
              </button>
            </div>
            {showCoordinates && (
              <>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Latitude</label>
                  <input type="number" step="0.0001" value={form.coordinates?.latitude || ''} onChange={e => setForm(prev => ({ ...prev, coordinates: { ...prev.coordinates, latitude: Number(e.target.value) } }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Longitude</label>
                  <input type="number" step="0.0001" value={form.coordinates?.longitude || ''} onChange={e => setForm(prev => ({ ...prev, coordinates: { ...prev.coordinates, longitude: Number(e.target.value) } }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Active</label>
              <input type="checkbox" checked={!!form.is_active} onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))} />
            </div>
            <div className="md:col-span-2 flex items-center justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Cancel</button>
              <button type="submit" className="inline-flex items-center px-4 py-2 rounded-lg bg-my-primary text-white hover:bg-my-primary/90"><Save className="w-4 h-4 mr-2"/>Create</button>
            </div>
          </form>
          </DialogPanel>
        </div>
      </Dialog>

             {/* Detail Modal */}
       <Dialog open={showDetail} onClose={() => setShowDetail(false)} className="relative z-50">
         <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
         <div className="fixed inset-0 flex items-center justify-center p-4">
           <DialogPanel className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
             <DialogTitle as="div" className="flex items-center justify-between mb-4">
               <h4 className="text-lg font-semibold text-gray-900">Division Details</h4>
               <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
             </DialogTitle>
             {loadingDetail ? (
               <div className="text-gray-500">Loading...</div>
             ) : detail ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm text-gray-600 mb-1">Name</label>
                   <div className="text-gray-900 font-medium">{detail.name}</div>
                 </div>
                 <div>
                   <label className="block text-sm text-gray-600 mb-1">Local Name</label>
                   <div className="text-gray-900">{detail.local_name || '—'}</div>
                 </div>
                 <div>
                   <label className="block text-sm text-gray-600 mb-1">Code</label>
                   <div className="text-gray-900 font-medium">{detail.code}</div>
                 </div>
                 <div>
                   <label className="block text-sm text-gray-600 mb-1">Type</label>
                   <div className="text-gray-900">{detail.type}</div>
                 </div>
                 <div>
                   <label className="block text-sm text-gray-600 mb-1">Level</label>
                   <div className="text-gray-900">{detail.level}</div>
                 </div>
                 <div>
                   <label className="block text-sm text-gray-600 mb-1">Country</label>
                   <div className="text-gray-900">{countries.find(c => c.id === detail.country_id)?.name || detail.country_id}</div>
                 </div>
                 <div>
                   <label className="block text-sm text-gray-600 mb-1">Parent Division</label>
                   <div className="text-gray-900">{detail.parent_id ? items.find(d => d.id === detail.parent_id)?.name || detail.parent_id : '—'}</div>
                 </div>
                 <div>
                   <label className="block text-sm text-gray-600 mb-1">Population</label>
                   <div className="text-gray-900">{detail.population ? detail.population.toLocaleString() : '—'}</div>
                 </div>
                 <div>
                   <label className="block text-sm text-gray-600 mb-1">Area (km²)</label>
                   <div className="text-gray-900">{detail.area_km2 ? detail.area_km2.toLocaleString() : '—'}</div>
                 </div>
                 {detail.coordinates && (
                   <>
                     <div>
                       <label className="block text-sm text-gray-600 mb-1">Latitude</label>
                       <div className="text-gray-900">{detail.coordinates.latitude}</div>
                     </div>
                     <div>
                       <label className="block text-sm text-gray-600 mb-1">Longitude</label>
                       <div className="text-gray-900">{detail.coordinates.longitude}</div>
                     </div>
                   </>
                 )}
                 <div>
                   <label className="block text-sm text-gray-600 mb-1">Status</label>
                   <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${detail.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                     {detail.is_active ? 'Active' : 'Inactive'}
                   </div>
                 </div>
               </div>
             ) : (
               <div className="text-gray-500">No details available.</div>
             )}
           </DialogPanel>
         </div>
       </Dialog>

       {/* Edit Modal */}
       <Dialog open={showEdit} onClose={() => setShowEdit(false)} className="relative z-50">
         <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
         <div className="fixed inset-0 flex items-center justify-center p-4">
           <DialogPanel className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
             <DialogTitle as="div" className="flex items-center justify-between mb-4">
               <h4 className="text-lg font-semibold text-gray-900">Edit Administrative Division</h4>
               <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
             </DialogTitle>
           <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm text-gray-600 mb-1">Country</label>
               <select value={editForm.country_id} onChange={e => setEditForm(prev => ({ ...prev, country_id: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" required>
                 <option value="" disabled>Select a country</option>
                 {countries.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
               </select>
             </div>
             <div>
               <label className="block text-sm text-gray-600 mb-1">Parent Division (Optional)</label>
               <select value={editForm.parent_id} onChange={e => setEditForm(prev => ({ ...prev, parent_id: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2">
                 <option value="">No Parent</option>
                 {items.filter(d => d.country_id === editForm.country_id).map(d => (
                   <option key={d.id} value={d.id}>{d.name} ({d.type})</option>
                 ))}
               </select>
             </div>
             <div>
               <label className="block text-sm text-gray-600 mb-1">Level</label>
               <select value={editForm.level} onChange={e => setEditForm(prev => ({ ...prev, level: Number(e.target.value) }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" required>
                 {divisionLevels.map(l => (<option key={l.value} value={l.value}>{l.label}</option>))}
               </select>
             </div>
             <div>
               <label className="block text-sm text-gray-600 mb-1">Type</label>
               <select value={editForm.type} onChange={e => setEditForm(prev => ({ ...prev, type: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" required>
                 {divisionTypes.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
               </select>
             </div>
             <div>
               <label className="block text-sm text-gray-600 mb-1">Name</label>
               <input value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" required />
             </div>
             <div>
               <label className="block text-sm text-gray-600 mb-1">Local Name</label>
               <input value={editForm.local_name || ''} onChange={e => setEditForm(prev => ({ ...prev, local_name: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
             </div>
             <div>
               <label className="block text-sm text-gray-600 mb-1">Code</label>
               <input value={editForm.code} onChange={e => setEditForm(prev => ({ ...prev, code: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" required />
             </div>
             <div>
               <label className="block text-sm text-gray-600 mb-1">Population</label>
               <input type="number" value={editForm.population || ''} onChange={e => setEditForm(prev => ({ ...prev, population: e.target.value === '' ? undefined : Number(e.target.value) }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
             </div>
             <div>
               <label className="block text-sm text-gray-600 mb-1">Area (km²)</label>
               <input type="number" step="0.1" value={editForm.area_km2 || ''} onChange={e => setEditForm(prev => ({ ...prev, area_km2: e.target.value === '' ? undefined : Number(e.target.value) }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
             </div>
             <div className="flex items-center gap-2">
               <label className="text-sm text-gray-600">Active</label>
               <input type="checkbox" checked={!!editForm.is_active} onChange={e => setEditForm(prev => ({ ...prev, is_active: e.target.checked }))} />
             </div>
             <div className="md:col-span-2 flex items-center justify-end gap-2 mt-2">
               <button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Cancel</button>
               <button type="submit" className="inline-flex items-center px-4 py-2 rounded-lg bg-my-primary text-white hover:bg-my-primary/90"><Save className="w-4 h-4 mr-2"/>Update</button>
             </div>
           </form>
           </DialogPanel>
         </div>
       </Dialog>

       {/* Tree View Modal */}
       <Dialog open={showTree} onClose={() => setShowTree(false)} className="relative z-50">
         <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
         <div className="fixed inset-0 flex items-center justify-center p-4">
           <DialogPanel className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
             <DialogTitle as="div" className="flex items-center justify-between mb-4">
               <h4 className="text-lg font-semibold text-gray-900">Administrative Divisions Tree</h4>
               <button onClick={() => setShowTree(false)} className="text-gray-400 hover:text-gray-200">&times;</button>
             </DialogTitle>
           {treeData ? (
             <div>
               <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                 <h5 className="font-medium text-gray-900">{treeData.country?.name || 'Unknown Country'}</h5>
               </div>
               <div className="space-y-2">
                 {treeData.divisions.map(division => (
                   <div key={division.id} className="ml-4">
                     <div className="flex items-center gap-2 py-1">
                       <div className="w-2 h-2 bg-my-primary rounded-full"></div>
                       <span className="text-sm font-medium">{division.name}</span>
                       <span className="text-xs text-gray-500">({division.type} - Level {division.level})</span>
                     </div>
                     {division.children && division.children.length > 0 && (
                       <div className="ml-4">
                         {division.children.map(child => (
                           <div key={child.id} className="ml-4">
                             <div className="flex items-center gap-2 py-1">
                               <div className="w-2 h-2 bg-my-primary rounded-full"></div>
                               <span className="text-sm font-medium">{child.name}</span>
                               <span className="text-xs text-gray-500">({child.type} - Level {child.level})</span>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 ))}
               </div>
             </div>
                        ) : (
             <div className="text-gray-500">Loading tree structure...</div>
           )}
           </DialogPanel>
         </div>
       </Dialog>
    </div>
  );
}
