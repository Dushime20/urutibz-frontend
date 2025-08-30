import React, { useEffect, useMemo, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Save, Trash2, Edit2, Search, Eye, RefreshCw, Plus } from 'lucide-react';
import type { Category, Country, CategoryRegulation, CreateCategoryRegulationInput } from '../interfaces';
import {
	fetchCountries,
	fetchCategories,
	fetchCategoryRegulations,
	createCategoryRegulation,
	updateCategoryRegulation,
	deleteCategoryRegulation,
	fetchCategoryRegulationById,
	fetchCategoryRegulationStats,
	checkCompliance
} from '../service';

type RegulationForm = CreateCategoryRegulationInput;

const emptyForm: RegulationForm = {
	category_id: '',
	country_id: '',
	regulation_type: 'LICENSING',
	title: '',
	description: '',
	requirements: [],
	compliance_deadline: '',
	penalties: [],
	is_active: true,
	priority: 'HIGH',
	enforcement_level: 'STRICT'
};

export default function CategoryRegulationsManagement() {
	const [items, setItems] = useState<CategoryRegulation[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [countries, setCountries] = useState<Country[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [search, setSearch] = useState('');
	const [countryFilter, setCountryFilter] = useState('');
	const [categoryFilter, setCategoryFilter] = useState('');
	const [stats, setStats] = useState<any>(null);

	const [showCreate, setShowCreate] = useState(false);
	const [form, setForm] = useState<RegulationForm>(emptyForm);
	const [requirementsInput, setRequirementsInput] = useState('');
	const [penaltiesInput, setPenaltiesInput] = useState('');

	const [showDetail, setShowDetail] = useState(false);
	const [detail, setDetail] = useState<CategoryRegulation | null>(null);
	const [loadingDetail, setLoadingDetail] = useState(false);
    const [lastDetailId, setLastDetailId] = useState<string | null>(null);

	const [showEdit, setShowEdit] = useState(false);
	const [editId, setEditId] = useState<string | null>(null);
	const [editForm, setEditForm] = useState<RegulationForm>(emptyForm);
	const [editReqInput, setEditReqInput] = useState('');
	const [editPenInput, setEditPenInput] = useState('');

	const [compCategory, setCompCategory] = useState('');
	const [compCountry, setCompCountry] = useState('');
	const [compResult, setCompResult] = useState<any>(null);

	const token = useMemo(() => localStorage.getItem('token') ?? undefined, []);

	const normalizeList = (res: any): CategoryRegulation[] => {
		if (Array.isArray(res)) return res;
		if (Array.isArray(res?.data)) return res.data;
		if (Array.isArray(res?.data?.items)) return res.data.items;
		if (Array.isArray(res?.regulations)) return res.regulations;
		return [];
	};

	const load = async () => {
		try {
			setLoading(true);
			setError(null);
					const params: any = { limit: 100 };
		if (search.trim()) params.search = search.trim();
		if (countryFilter) params.country_id = countryFilter;
		if (categoryFilter) params.category_id = categoryFilter;
			const res = await fetchCategoryRegulations(params, token);
			setItems(normalizeList(res));
		} catch (e: any) {
			setError(e?.message || 'Failed to load category regulations');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
		(async () => {
			try {
				const [cList, catList] = await Promise.all([fetchCountries(), fetchCategories()]);
				setCountries(cList || []);
				setCategories(catList || []);
				const s = await fetchCategoryRegulationStats({}, token);
				setStats(s?.data || s || null);
			} catch {}
		})();
	}, []);

	const openDetail = async (id: string) => {
		setLoadingDetail(true);
		setShowDetail(true);
		setLastDetailId(id);
		try {
			const res = await fetchCategoryRegulationById(id, token);
			const data = res?.data || res;
			setDetail(data || null);
		} catch (e: any) {
			const fallback = items.find(i => i.id === id) || null;
			setDetail(fallback);
			if (!fallback) setError(e?.message || 'Failed to load details');
		} finally {
			setLoadingDetail(false);
		}
	};

	const onCreateOpen = () => {
		setForm(emptyForm);
		setRequirementsInput('');
		setPenaltiesInput('');
		setShowCreate(true);
	};

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		const payload: RegulationForm = {
			...form,
			requirements: String(requirementsInput || '')
				.split(',')
				.map(s => s.trim())
				.filter(Boolean),
			penalties: String(penaltiesInput || '')
				.split(',')
				.map(s => s.trim())
				.filter(Boolean)
		};
		const res = await createCategoryRegulation(payload, token);
		const created = res?.data || res;
		if (!created) return;
		setShowCreate(false);
		await load();
	};

	const startEdit = (r: CategoryRegulation) => {
		setEditId(r.id);
		setEditForm({
			category_id: r.category_id,
			country_id: r.country_id,
			regulation_type: r.regulation_type as any,
			title: r.title,
			description: r.description,
			requirements: r.requirements || [],
			compliance_deadline: r.compliance_deadline,
			penalties: r.penalties || [],
			is_active: r.is_active,
			priority: r.priority as any,
			enforcement_level: r.enforcement_level as any
		});
		setEditReqInput((r.requirements || []).join(', '));
		setEditPenInput((r.penalties || []).join(', '));
		setShowEdit(true);
	};

	const saveEdit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editId) return;
		const payload: RegulationForm = {
			...editForm,
			requirements: String(editReqInput || '')
				.split(',')
				.map(s => s.trim())
				.filter(Boolean),
			penalties: String(editPenInput || '')
				.split(',')
				.map(s => s.trim())
				.filter(Boolean)
		};
		await updateCategoryRegulation(editId, payload, token);
		setShowEdit(false);
		setEditId(null);
		await load();
	};

	const handleDelete = async (id: string) => {
		await deleteCategoryRegulation(id, token);
		await load();
	};

	const doSearch = async () => {
		await load();
	};

	const doCheckCompliance = async () => {
		if (!compCategory || !compCountry) return;
		try {
			const res = await checkCompliance({
				category_id: compCategory,
				country_id: compCountry
			}, token);
			setCompResult(res?.data || res || null);
		} catch (e) {
			setCompResult(null);
		}
	};

	return (
		<div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
			<div className="flex items-center justify-between mb-6">
				<h3 className="text-xl font-bold text-gray-900">Category Regulations</h3>
				<div className="flex items-center gap-2">
					<select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2">
						<option value="">All Countries</option>
						{countries.map(c => (
							<option key={c.id} value={c.id}>{c.name}</option>
						))}
					</select>
					<select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2">
						<option value="">All Categories</option>
						{categories.map(c => (
							<option key={c.id} value={c.id}>{c.name}</option>
						))}
					</select>
					<input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search regulations..." className="rounded-lg border border-gray-200 px-3 py-2" />
					<button onClick={doSearch} className="inline-flex items-center px-3 py-2 rounded-lg bg-my-primary text-white hover:bg-my-primary/90"><Search className="w-4 h-4 mr-2"/>Search</button>
					<button onClick={onCreateOpen} className="inline-flex items-center px-3 py-2 rounded-lg bg-my-primary text-white hover:bg-my-primary/90"><Plus className="w-4 h-4 mr-2"/>Create Regulation</button>
				</div>
			</div>

			{stats && (
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
					<div className="bg-white border border-gray-100 rounded-xl p-4">
						<div className="text-xs text-gray-500">Total</div>
						<div className="text-2xl font-bold text-gray-900">{stats.total_regulations ?? 0}</div>
					</div>
					<div className="bg-white border border-gray-100 rounded-xl p-4">
						<div className="text-xs text-gray-500">Active</div>
						<div className="text-2xl font-bold text-gray-900">{stats.active_regulations ?? 0}</div>
					</div>
					<div className="bg-white border border-gray-100 rounded-xl p-4">
						<div className="text-xs text-gray-500">Compliance</div>
						<div className="text-2xl font-bold text-gray-900">{stats.compliance_rate != null ? `${Number(stats.compliance_rate).toFixed(0)}%` : '—'}</div>
					</div>
					<div className="bg-white border border-gray-100 rounded-xl p-4">
						<div className="text-xs text-gray-500">Upcoming Deadlines</div>
						<div className="text-2xl font-bold text-gray-900">{stats.upcoming_deadlines ?? 0}</div>
					</div>
				</div>
			)}

			{error && (
				<div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>
			)}

			<div className="bg-white rounded-3xl p-4 border border-gray-100 mb-8">
				<div className="flex items-center gap-2 mb-3">
					<div className="font-semibold text-gray-900">Compliance Check</div>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
					<select value={compCountry} onChange={e => setCompCountry(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2">
						<option value="" disabled>Country</option>
						{countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
					</select>
					<select value={compCategory} onChange={e => setCompCategory(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2">
						<option value="" disabled>Category</option>
						{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
					</select>
					<button onClick={doCheckCompliance} className="px-3 py-2 rounded-lg bg-my-primary text-white hover:bg-my-primary/90">Check</button>
				</div>
				{compResult && (
					<div className="mt-3 text-sm text-gray-700">
						<div>Status: <span className={`px-2 py-1 rounded-full text-xs ${compResult.is_compliant ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{compResult.is_compliant ? 'Compliant' : 'Not Compliant'}</span></div>
						{Array.isArray(compResult.missing_requirements) && compResult.missing_requirements.length > 0 && (
							<div className="mt-1">Missing: {compResult.missing_requirements.join(', ')}</div>
						)}
					</div>
				)}
			</div>

			<div>
				<h4 className="text-lg font-semibold text-gray-900 mb-3">Existing Regulations</h4>
				{loading ? (
					<div className="text-gray-500">Loading...</div>
				) : items.length === 0 ? (
					<div className="text-gray-500">No regulations found.</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
						{items.map(r => (
							<div key={r.id} className="border border-gray-100 rounded-2xl p-4">
								<div className="flex items-center justify-between mb-2">
									<div className="font-semibold text-gray-900">{r.title}</div>
									<div className="flex items-center gap-2">
										<button onClick={() => openDetail(r.id)} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"><Eye className="w-4 h-4"/></button>
										<button onClick={() => startEdit(r)} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200"><Edit2 className="w-4 h-4"/></button>
										<button onClick={() => handleDelete(r.id)} className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Trash2 className="w-4 h-4"/></button>
									</div>
								</div>
								<div className="text-xs text-gray-500 mb-2">{r.regulation_type} • {r.priority} • {r.enforcement_level}</div>
								<div className="text-sm text-gray-600">Country: {countries.find(c => c.id === r.country_id)?.name || r.country_id}</div>
								<div className="text-sm text-gray-600">Category: {categories.find(c => c.id === r.category_id)?.name || r.category_id}</div>
							</div>
						))}
					</div>
				)}
			</div>

			<Dialog open={showCreate} onClose={() => setShowCreate(false)} className="fixed inset-0 z-50 flex items-center justify-center">
				<div className="fixed inset-0 bg-black/30" aria-hidden="true" onClick={() => setShowCreate(false)} />
				<div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl mx-auto z-50 max-h-[90vh] overflow-y-auto">
					<div className="flex items-center justify-between mb-4">
						<h4 className="text-lg font-semibold text-gray-900">Create Regulation</h4>
						<button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
					</div>
					<form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm text-gray-600 mb-1">Country</label>
							<select value={form.country_id} onChange={e => setForm(prev => ({ ...prev, country_id: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" required>
								<option value="" disabled>Select a country</option>
								{countries.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
							</select>
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Category</label>
							<select value={form.category_id} onChange={e => setForm(prev => ({ ...prev, category_id: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" required>
								<option value="" disabled>Select a category</option>
								{categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
							</select>
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Title</label>
							<input value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" required />
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Regulation Type</label>
							<select value={form.regulation_type} onChange={e => setForm(prev => ({ ...prev, regulation_type: e.target.value as any }))} className="w-full rounded-lg border border-gray-200 px-3 py-2">
								<option value="LICENSING">LICENSING</option>
								<option value="SAFETY">SAFETY</option>
								<option value="ENVIRONMENTAL">ENVIRONMENTAL</option>
								<option value="FINANCIAL">FINANCIAL</option>
								<option value="OPERATIONAL">OPERATIONAL</option>
								<option value="COMPLIANCE">COMPLIANCE</option>
							</select>
						</div>
						<div className="md:col-span-2">
							<label className="block text-sm text-gray-600 mb-1">Description</label>
							<textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" rows={3} />
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Requirements (comma-separated)</label>
							<input value={requirementsInput} onChange={e => setRequirementsInput(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Penalties (comma-separated)</label>
							<input value={penaltiesInput} onChange={e => setPenaltiesInput(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Compliance Deadline</label>
							<input type="date" value={form.compliance_deadline} onChange={e => setForm(prev => ({ ...prev, compliance_deadline: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Priority</label>
							<select value={form.priority} onChange={e => setForm(prev => ({ ...prev, priority: e.target.value as any }))} className="w-full rounded-lg border border-gray-200 px-3 py-2">
								<option value="LOW">LOW</option>
								<option value="MEDIUM">MEDIUM</option>
								<option value="HIGH">HIGH</option>
								<option value="CRITICAL">CRITICAL</option>
							</select>
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Enforcement Level</label>
							<select value={form.enforcement_level} onChange={e => setForm(prev => ({ ...prev, enforcement_level: e.target.value as any }))} className="w-full rounded-lg border border-gray-200 px-3 py-2">
								<option value="LENIENT">LENIENT</option>
								<option value="MODERATE">MODERATE</option>
								<option value="STRICT">STRICT</option>
								<option value="VERY_STRICT">VERY_STRICT</option>
							</select>
						</div>
						<div className="flex items-center gap-2">
							<label className="text-sm text-gray-600">Active</label>
							<input type="checkbox" checked={!!form.is_active} onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))} />
						</div>
						<div className="md:col-span-2 flex items-center justify-end gap-2 mt-2">
							<button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Cancel</button>
							<button type="submit" className="inline-flex items-center px-4 py-2 rounded-lg bg-my-primary text-white hover:bg-my-primary/90"><Save className="w-4 h-4 mr-2"/>Create</button>
						</div>
					</form>
				</div>
			</Dialog>

			<Dialog open={showDetail} onClose={() => setShowDetail(false)} className="fixed inset-0 z-50 flex items-center justify-center">
				<div className="fixed inset-0 bg-black/30" aria-hidden="true" onClick={() => setShowDetail(false)} />
				<div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-3xl mx-auto z-50 max-h-[90vh] overflow-y-auto">
					<div className="flex items-center justify-between mb-4">
						<h4 className="text-lg font-semibold text-gray-900">Regulation Details</h4>
						<div className="flex items-center gap-2">
							{detail && (
								<button onClick={() => openDetail((detail as any).id as string)} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600" title="Refresh data">
									<RefreshCw className="w-4 h-4" />
								</button>
							)}
							<button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
						</div>
					</div>
					{loadingDetail ? (
						<div className="text-gray-500">Loading...</div>
					) : !detail ? (
						<div className="text-center py-8">
							<div className="text-gray-500 mb-4">No details available.</div>
							{error && (
								<div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">Error: {error}</div>
							)}
							<button onClick={() => detail && openDetail((detail as any).id as string)} className="mt-3 px-4 py-2 bg-my-primary text-white rounded-lg hover:bg-my-primary/90">Retry</button>
						</div>
					) : (
						<div className="space-y-4">
							<div className="space-y-2">
								<div className="text-xl font-semibold text-gray-900">{detail.title}</div>
								<div className="text-xs text-gray-500">{detail.regulation_type} • {detail.priority} • {detail.enforcement_level}</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-1 text-sm">
									<div className="font-medium text-gray-600">Country</div>
									<div className="text-gray-800">{countries.find(c => c.id === detail.country_id)?.name || detail.country_id}</div>
								</div>
								<div className="space-y-1 text-sm">
									<div className="font-medium text-gray-600">Category</div>
									<div className="text-gray-800">{categories.find(c => c.id === detail.category_id)?.name || detail.category_id}</div>
								</div>
							</div>
							<div className="space-y-1 text-sm">
								<div className="font-medium text-gray-600">Description</div>
								<div className="text-gray-800">{detail.description}</div>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-1 text-sm">
									<div className="font-medium text-gray-600">Requirements</div>
									<div className="text-gray-800">{Array.isArray(detail.requirements) ? detail.requirements.join(', ') : '—'}</div>
								</div>
								<div className="space-y-1 text-sm">
									<div className="font-medium text-gray-600">Penalties</div>
									<div className="text-gray-800">{Array.isArray(detail.penalties) ? detail.penalties.join(', ') : '—'}</div>
								</div>
							</div>
							<div className="space-y-1 text-sm">
								<div className="font-medium text-gray-600">Compliance Deadline</div>
								<div className="text-gray-800">{detail.compliance_deadline || '—'}</div>
							</div>
						</div>
					)}
				</div>
			</Dialog>

			<Dialog open={showEdit} onClose={() => setShowEdit(false)} className="fixed inset-0 z-50 flex items-center justify-center">
				<div className="fixed inset-0 bg-black/30" aria-hidden="true" onClick={() => setShowEdit(false)} />
				<div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl mx-auto z-50 max-h-[90vh] overflow-y-auto">
					<div className="flex items-center justify-between mb-4">
						<h4 className="text-lg font-semibold text-gray-900">Edit Regulation</h4>
						<button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
					</div>
					<form onSubmit={saveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className="block text-sm text-gray-600 mb-1">Country</label>
							<select value={editForm.country_id} onChange={e => setEditForm(prev => ({ ...prev, country_id: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" required>
								{countries.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
							</select>
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Category</label>
							<select value={editForm.category_id} onChange={e => setEditForm(prev => ({ ...prev, category_id: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" required>
								{categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
							</select>
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Title</label>
							<input value={editForm.title} onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" required />
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Regulation Type</label>
							<select value={editForm.regulation_type} onChange={e => setEditForm(prev => ({ ...prev, regulation_type: e.target.value as any }))} className="w-full rounded-lg border border-gray-200 px-3 py-2">
								<option value="LICENSING">LICENSING</option>
								<option value="SAFETY">SAFETY</option>
								<option value="ENVIRONMENTAL">ENVIRONMENTAL</option>
								<option value="FINANCIAL">FINANCIAL</option>
								<option value="OPERATIONAL">OPERATIONAL</option>
								<option value="COMPLIANCE">COMPLIANCE</option>
							</select>
						</div>
						<div className="md:col-span-2">
							<label className="block text-sm text-gray-600 mb-1">Description</label>
							<textarea value={editForm.description} onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" rows={3} />
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Requirements (comma-separated)</label>
							<input value={editReqInput} onChange={e => setEditReqInput(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Penalties (comma-separated)</label>
							<input value={editPenInput} onChange={e => setEditPenInput(e.target.value)} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Compliance Deadline</label>
							<input type="date" value={editForm.compliance_deadline} onChange={e => setEditForm(prev => ({ ...prev, compliance_deadline: e.target.value }))} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Priority</label>
							<select value={editForm.priority} onChange={e => setEditForm(prev => ({ ...prev, priority: e.target.value as any }))} className="w-full rounded-lg border border-gray-200 px-3 py-2">
								<option value="LOW">LOW</option>
								<option value="MEDIUM">MEDIUM</option>
								<option value="HIGH">HIGH</option>
								<option value="CRITICAL">CRITICAL</option>
							</select>
						</div>
						<div>
							<label className="block text-sm text-gray-600 mb-1">Enforcement Level</label>
							<select value={editForm.enforcement_level} onChange={e => setEditForm(prev => ({ ...prev, enforcement_level: e.target.value as any }))} className="w-full rounded-lg border border-gray-200 px-3 py-2">
								<option value="LENIENT">LENIENT</option>
								<option value="MODERATE">MODERATE</option>
								<option value="STRICT">STRICT</option>
								<option value="VERY_STRICT">VERY_STRICT</option>
							</select>
						</div>
						<div className="flex items-center gap-2">
							<label className="text-sm text-gray-600">Active</label>
							<input type="checkbox" checked={!!editForm.is_active} onChange={e => setEditForm(prev => ({ ...prev, is_active: e.target.checked }))} />
						</div>
						<div className="md:col-span-2 flex items-center justify-end gap-2 mt-2">
							<button type="button" onClick={() => setShowEdit(false)} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Cancel</button>
							<button type="submit" className="inline-flex items-center px-4 py-2 rounded-lg bg-my-primary text-white hover:bg-my-primary/90"><Save className="w-4 h-4 mr-2"/>Save</button>
						</div>
					</form>
				</div>
			</Dialog>
		</div>
	);
}


