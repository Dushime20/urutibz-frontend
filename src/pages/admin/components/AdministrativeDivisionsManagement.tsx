import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { 
  Save, 
  Trash2, 
  Edit2, 
  Search, 
  Eye, 
  Plus, 
  Network, 
  MapPin,
  Building,
  Users,
  Map,
  CheckCircle,
  XCircle
} from 'lucide-react';
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
} from '../service';

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
  const [showFilters, setShowFilters] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<DivisionForm>(emptyForm);
  const [showCoordinates, setShowCoordinates] = useState(false);

  const [showDetail, setShowDetail] = useState(false);
  const [detail, setDetail] = useState<AdministrativeDivision | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<DivisionForm>(emptyForm);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  const token = useMemo(() => localStorage.getItem('token') ?? undefined, []);

  // Respect global theme; no forced dark mode here
  useEffect(() => {
    // no-op
  }, []);

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

  // Auto-apply filters when they change
  useEffect(() => {
    load();
  }, [countryFilter, levelFilter, typeFilter]);

  // Debounced search
  useEffect(() => {
    const handle = setTimeout(() => {
      load();
    }, 400);
    return () => clearTimeout(handle);
  }, [search]);

  useEffect(() => {
    // fetch countries for dropdowns - using the same pattern as PaymentProvidersManagement
    (async () => {
      try {
        const list = await (await import('../service')).fetchCountries();
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
      const tree = await fetchAdministrativeDivisionTree(countryFilter || undefined, token);
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
      const division = await fetchAdministrativeDivisionById(id, token);
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
      const division = await fetchAdministrativeDivisionById(id, token);
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

  const openDeleteConfirm = (id: string, name: string) => {
    setDeleteId(id);
    setDeleteName(name);
    setShowDeleteConfirm(true);
  };

  const closeDeleteConfirm = () => {
    if (!isDeleting) {
      setShowDeleteConfirm(false);
      setDeleteId(null);
      setDeleteName('');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      setIsDeleting(true);
      setError(null);
      const res = await deleteAdministrativeDivision(deleteId, token);
      if (!res.success) {
        setError(res.error || 'Failed to delete division');
        setIsDeleting(false);
        return;
      }
      setShowDeleteConfirm(false);
      setDeleteId(null);
      setDeleteName('');
      await load();
    } catch (e: any) {
      setError(e?.message || 'Failed to delete division');
    } finally {
      setIsDeleting(false);
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

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading administrative divisions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Administrative Divisions</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage hierarchical administrative structures and regions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search divisions..."
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-64"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl transition-colors flex items-center"
          >
            <Search className="w-4 h-4 mr-2" />
            Filter
          </button>
          <button 
            onClick={() => { setShowTree(true); loadTree(); }} 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition-colors flex items-center"
          >
            <Network className="w-4 h-4 mr-2" />
            Tree
          </button>
          <button 
            onClick={onCreateOpen} 
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country
              </label>
              <select 
                value={countryFilter} 
                onChange={e => setCountryFilter(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">All Countries ({countries.length})</option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Level
              </label>
              <select 
                value={levelFilter} 
                onChange={e => setLevelFilter(e.target.value === '' ? '' : Number(e.target.value))} 
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">All Levels</option>
                {divisionLevels.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select 
                value={typeFilter} 
                onChange={e => setTypeFilter(e.target.value)} 
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">All Types</option>
                {divisionTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button 
              onClick={() => { setCountryFilter(''); setLevelFilter(''); setTypeFilter(''); setSearch(''); load(); }} 
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl transition-colors"
            >
              Clear
            </button>
            <button 
              onClick={doSearch} 
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl transition-colors flex items-center"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </button>
          </div>
        </div>
      )}
      
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <div className="flex items-center">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                <Building className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Divisions</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total_divisions ?? 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.active_divisions ?? 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Population</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total_population ? (stats.total_population / 1000000).toFixed(1) + 'M' : '—'}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Map className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Area</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total_area_km2 ? (stats.total_area_km2 / 1000).toFixed(1) + 'K km²' : '—'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">{error}</div>
      )}

      {/* Divisions Grid */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Existing Divisions</h4>
        {items.length === 0 ? (
          <div className="text-center py-12">
            <Building className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No administrative divisions found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {search || countryFilter || levelFilter !== '' || typeFilter
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first administrative division.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map(d => (
              <div key={d.id} className="border border-gray-200 dark:border-gray-600 rounded-2xl p-4 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-900 dark:text-white">{d.name}</div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleView(d.id)} 
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 transition-colors"
                    >
                      <Eye className="w-4 h-4"/>
                    </button>
                    <button 
                      onClick={() => handleEdit(d.id)} 
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 transition-colors"
                    >
                      <Edit2 className="w-4 h-4"/>
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(d.id)} 
                      className={`p-2 rounded-lg transition-colors ${
                        d.is_active 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                      }`}
                    >
                      {d.is_active ? <CheckCircle className="w-4 h-4"/> : <XCircle className="w-4 h-4"/>}
                    </button>
                    <button 
                      onClick={() => openDeleteConfirm(d.id, d.name)} 
                      className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{d.type} • Level {d.level} • {d.code}</div>
                {d.local_name && <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">{d.local_name}</div>}
                <div className="text-sm text-gray-600 dark:text-gray-300">Country: {countries.find(c => c.id === d.country_id)?.name || d.country_id}</div>
                {d.population && <div className="text-sm text-gray-600 dark:text-gray-300">Population: {d.population.toLocaleString()}</div>}
                {d.area_km2 && <div className="text-sm text-gray-600 dark:text-gray-300">Area: {d.area_km2} km²</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreate} onClose={() => setShowCreate(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <DialogTitle as="div" className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Create Administrative Division</h4>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl">&times;</button>
            </DialogTitle>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
              <select 
                value={form.country_id} 
                onChange={e => setForm(prev => ({ ...prev, country_id: e.target.value }))} 
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                required
              >
                <option value="" disabled>Select a country</option>
                {countries.length > 0 ? (
                  countries.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))
                ) : (
                  <option value="" disabled>Loading countries...</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Parent Division (Optional)</label>
              <select 
                value={form.parent_id} 
                onChange={e => setForm(prev => ({ ...prev, parent_id: e.target.value }))} 
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">No Parent</option>
                {items.filter(d => d.country_id === form.country_id).map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.type})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Level</label>
              <select 
                value={form.level} 
                onChange={e => setForm(prev => ({ ...prev, level: Number(e.target.value) }))} 
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                required
              >
                {divisionLevels.map(l => (<option key={l.value} value={l.value}>{l.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <select 
                value={form.type} 
                onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))} 
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                required
              >
                {divisionTypes.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
              <input 
                value={form.name} 
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} 
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Local Name</label>
              <input 
                value={form.local_name || ''} 
                onChange={e => setForm(prev => ({ ...prev, local_name: e.target.value }))} 
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Code</label>
              <input 
                value={form.code} 
                onChange={e => setForm(prev => ({ ...prev, code: e.target.value }))} 
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Population</label>
              <input 
                type="number" 
                value={form.population || ''} 
                onChange={e => setForm(prev => ({ ...prev, population: e.target.value === '' ? undefined : Number(e.target.value) }))} 
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Area (km²)</label>
              <input 
                type="number" 
                step="0.1" 
                value={form.area_km2 || ''} 
                onChange={e => setForm(prev => ({ ...prev, area_km2: e.target.value === '' ? undefined : Number(e.target.value) }))} 
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
              />
            </div>
            <div className="md:col-span-2">
              <button 
                type="button" 
                onClick={() => setShowCoordinates(!showCoordinates)} 
                className="flex items-center gap-2 text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
              >
                <MapPin className="w-4 h-4" />
                {showCoordinates ? 'Hide' : 'Add'} Coordinates
              </button>
            </div>
            {showCoordinates && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Latitude</label>
                  <input 
                    type="number" 
                    step="0.0001" 
                    value={form.coordinates?.latitude || ''} 
                    onChange={e => setForm(prev => ({ ...prev, coordinates: { ...prev.coordinates, latitude: Number(e.target.value) } }))} 
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Longitude</label>
                  <input 
                    type="number" 
                    step="0.0001" 
                    value={form.coordinates?.longitude || ''} 
                    onChange={e => setForm(prev => ({ ...prev, coordinates: { ...prev.coordinates, longitude: Number(e.target.value) } }))} 
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                  />
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
              <input 
                type="checkbox" 
                checked={!!form.is_active} 
                onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))} 
                className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 bg-white dark:bg-gray-700"
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-end gap-2 mt-2">
              <button 
                type="button" 
                onClick={() => setShowCreate(false)} 
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="inline-flex items-center px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2"/>
                Create
              </button>
            </div>
          </form>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Detail Modal */}
      <Dialog open={showDetail} onClose={() => setShowDetail(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <DialogTitle as="div" className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Division Details</h4>
              <button onClick={() => setShowDetail(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl">&times;</button>
            </DialogTitle>
            {loadingDetail ? (
              <div className="text-gray-500 dark:text-gray-400">Loading...</div>
            ) : detail ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                  <div className="text-gray-900 dark:text-white font-medium">{detail.name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Local Name</label>
                  <div className="text-gray-900 dark:text-white">{detail.local_name || '—'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Code</label>
                  <div className="text-gray-900 dark:text-white font-medium">{detail.code}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <div className="text-gray-900 dark:text-white">{detail.type}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Level</label>
                  <div className="text-gray-900 dark:text-white">{detail.level}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
                  <div className="text-gray-900 dark:text-white">{countries.find(c => c.id === detail.country_id)?.name || detail.country_id}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Parent Division</label>
                  <div className="text-gray-900 dark:text-white">{detail.parent_id ? items.find(d => d.id === detail.parent_id)?.name || detail.parent_id : '—'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Population</label>
                  <div className="text-gray-900 dark:text-white">{detail.population ? detail.population.toLocaleString() : '—'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Area (km²)</label>
                  <div className="text-gray-900 dark:text-white">{detail.area_km2 ? detail.area_km2.toLocaleString() : '—'}</div>
                </div>
                {detail.coordinates && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Latitude</label>
                      <div className="text-gray-900 dark:text-white">{detail.coordinates.latitude}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Longitude</label>
                      <div className="text-gray-900 dark:text-white">{detail.coordinates.longitude}</div>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    detail.is_active 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                  }`}>
                    {detail.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 dark:text-gray-400">No details available.</div>
            )}
          </DialogPanel>
        </div>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEdit} onClose={() => setShowEdit(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <DialogTitle as="div" className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Administrative Division</h4>
              <button onClick={() => setShowEdit(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl">&times;</button>
            </DialogTitle>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
              <select 
                value={editForm.country_id} 
                onChange={e => setEditForm(prev => ({ ...prev, country_id: e.target.value }))} 
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                required
              >
                <option value="" disabled>Select a country</option>
                {countries.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Parent Division (Optional)</label>
              <select 
                value={editForm.parent_id} 
                onChange={e => setEditForm(prev => ({ ...prev, parent_id: e.target.value }))} 
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">No Parent</option>
                {items.filter(d => d.country_id === editForm.country_id).map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.type})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Level</label>
              <select 
                value={editForm.level} 
                onChange={e => setEditForm(prev => ({ ...prev, level: Number(e.target.value) }))} 
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                required
              >
                {divisionLevels.map(l => (<option key={l.value} value={l.value}>{l.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <select 
                value={editForm.type} 
                onChange={e => setEditForm(prev => ({ ...prev, type: e.target.value }))} 
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                required
              >
                {divisionTypes.map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
              <input 
                value={editForm.name} 
                onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} 
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Local Name</label>
              <input 
                value={editForm.local_name || ''} 
                onChange={e => setEditForm(prev => ({ ...prev, local_name: e.target.value }))} 
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Code</label>
              <input 
                value={editForm.code} 
                onChange={e => setEditForm(prev => ({ ...prev, code: e.target.value }))} 
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Population</label>
              <input 
                type="number" 
                value={editForm.population || ''} 
                onChange={e => setEditForm(prev => ({ ...prev, population: e.target.value === '' ? undefined : Number(e.target.value) }))} 
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Area (km²)</label>
              <input 
                type="number" 
                step="0.1" 
                value={editForm.area_km2 || ''} 
                onChange={e => setEditForm(prev => ({ ...prev, area_km2: e.target.value === '' ? undefined : Number(e.target.value) }))} 
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
              <input 
                type="checkbox" 
                checked={!!editForm.is_active} 
                onChange={e => setEditForm(prev => ({ ...prev, is_active: e.target.checked }))} 
                className="w-4 h-4 text-teal-600 border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 bg-white dark:bg-gray-700"
              />
            </div>
            <div className="md:col-span-2 flex items-center justify-end gap-2 mt-2">
              <button 
                type="button" 
                onClick={() => setShowEdit(false)} 
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="inline-flex items-center px-4 py-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2"/>
                Update
              </button>
            </div>
          </form>
           </DialogPanel>
         </div>
       </Dialog>

      {/* Tree View Modal */}
      <Dialog open={showTree} onClose={() => setShowTree(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <DialogTitle as="div" className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Administrative Divisions Tree</h4>
              <button onClick={() => setShowTree(false)} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
            </DialogTitle>
            {treeData ? (
              <div>
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h5 className="font-medium text-gray-900 dark:text-white">{treeData.country?.name || 'Unknown Country'}</h5>
                </div>
                <div className="space-y-2">
                  {treeData.divisions.map(division => (
                    <div key={division.id} className="ml-4">
                      <div className="flex items-center gap-2 py-1">
                        <div className="w-2 h-2 bg-teal-600 dark:bg-teal-400 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{division.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">({division.type} - Level {division.level})</span>
                      </div>
                      {division.children && division.children.length > 0 && (
                        <div className="ml-4">
                          {division.children.map(child => (
                            <div key={child.id} className="ml-4">
                              <div className="flex items-center gap-2 py-1">
                                <div className="w-2 h-2 bg-teal-600 dark:bg-teal-400 rounded-full"></div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{child.name}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">({child.type} - Level {child.level})</span>
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
              <div className="text-gray-500 dark:text-gray-400">Loading tree structure...</div>
            )}
          </DialogPanel>
        </div>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirm} onClose={closeDeleteConfirm} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <DialogTitle as="div" className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Confirm Delete</h4>
              <button 
                onClick={closeDeleteConfirm} 
                disabled={isDeleting}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-xl disabled:opacity-50"
              >
                &times;
              </button>
            </DialogTitle>
            
            <div className="mb-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-center text-lg font-medium text-gray-900 dark:text-white mb-2">
                Are you sure you want to delete this division?
              </h3>
              <p className="text-center text-gray-600 dark:text-gray-400">
                The division <span className="font-semibold text-gray-900 dark:text-white">"{deleteName}"</span> will be permanently deleted.
              </p>
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  ⚠️ <strong>Warning:</strong> This action cannot be undone. If this division has child divisions, the deletion will fail.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={closeDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Division
                  </>
                )}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
