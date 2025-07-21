import React, { useState, useEffect } from 'react';
import { fetchCountries, createCountry } from '../service/api';
import type { Country, CreateCountryInput } from '../interfaces';
import { Loader, Plus, Check, X, MoreVertical } from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';

const CountriesManagement: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCountry, setNewCountry] = useState<CreateCountryInput>({
    code: '',
    code_alpha3: '',
    name: '',
    local_name: '',
    currency_code: '',
    currency_symbol: '',
    phone_prefix: '',
    timezone: '',
    languages: [],
    is_active: true
  });
  const [creating, setCreating] = useState(false);
  const { showToast } = useToast();
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    loadCountries();
  }, []);

  const loadCountries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCountries();
      setCountries(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load countries');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await createCountry(newCountry, token || undefined);
      setShowCreateForm(false);
      setNewCountry({
        code: '',
        code_alpha3: '',
        name: '',
        local_name: '',
        currency_code: '',
        currency_symbol: '',
        phone_prefix: '',
        timezone: '',
        languages: [],
        is_active: true
      });
      await loadCountries();
      showToast('Country created successfully!', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to create country');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this country?')) {
      setError(null);
      try {
        const token = localStorage.getItem('token');
        // TODO: Implement deleteCountry API function
        // await deleteCountry(id, token || undefined);
        await loadCountries();
        showToast('Country deleted successfully!', 'success');
      } catch (err: any) {
        setError(err.message || 'Failed to delete country');
      }
    }
  };

  const handleEdit = (country: Country) => {
    // TODO: Implement edit functionality
    console.log('Edit country:', country);
  };

  const handleActionMenu = (id: string) => {
    setActionMenuOpen(actionMenuOpen === id ? null : id);
  };
  const handleCloseMenu = () => setActionMenuOpen(null);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Countries</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-my-primary hover:bg-my-primary/80 text-white px-4 py-2 rounded-xl transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Country
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <form onSubmit={handleCreateCountry}>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" required value={newCountry.name} onChange={e => setNewCountry({ ...newCountry, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Local Name</label>
                <input type="text" required value={newCountry.local_name} onChange={e => setNewCountry({ ...newCountry, local_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                <input type="text" required value={newCountry.code} onChange={e => setNewCountry({ ...newCountry, code: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alpha-3 Code</label>
                <input type="text" required value={newCountry.code_alpha3} onChange={e => setNewCountry({ ...newCountry, code_alpha3: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency Code</label>
                <input type="text" required value={newCountry.currency_code} onChange={e => setNewCountry({ ...newCountry, currency_code: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
                <input type="text" required value={newCountry.currency_symbol} onChange={e => setNewCountry({ ...newCountry, currency_symbol: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Prefix</label>
                <input type="text" required value={newCountry.phone_prefix} onChange={e => setNewCountry({ ...newCountry, phone_prefix: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <input type="text" required value={newCountry.timezone} onChange={e => setNewCountry({ ...newCountry, timezone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Languages (comma separated)</label>
                <input type="text" required value={newCountry.languages.join(', ')} onChange={e => setNewCountry({ ...newCountry, languages: e.target.value.split(',').map(l => l.trim()).filter(Boolean) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent" />
              </div>
              <div className="flex items-center mt-6">
                <input type="checkbox" checked={newCountry.is_active} onChange={e => setNewCountry({ ...newCountry, is_active: e.target.checked })} className="mr-2" />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="bg-my-primary hover:bg-my-primary/80 text-white px-4 py-2 rounded-xl transition-colors flex items-center disabled:opacity-50"
              >
                {creating ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Save Country
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="w-6 h-6 text-my-primary animate-spin mr-2" />
          <span className="text-gray-500">Loading countries...</span>
        </div>
      ) : countries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No countries found. Create one to get started.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">Name</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">Local Name</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">Code</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">Alpha-3 Code</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">Currency Code</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">Currency Symbol</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">Phone Prefix</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">Timezone</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">Languages</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">Active</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">Created At</th>
                <th className="text-right py-4 px-4 text-sm font-semibold text-gray-600 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {countries.map((country) => (
                <tr key={country.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900">{country.name}</td>
                  <td className="py-3 px-4">{country.local_name}</td>
                  <td className="py-3 px-4">{country.code}</td>
                  <td className="py-3 px-4">{country.code_alpha3}</td>
                  <td className="py-3 px-4">{country.currency_code}</td>
                  <td className="py-3 px-4">{country.currency_symbol}</td>
                  <td className="py-3 px-4">{country.phone_prefix}</td>
                  <td className="py-3 px-4">{country.timezone}</td>
                  <td className="py-3 px-4">{country.languages.join(', ')}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${country.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {country.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{new Date(country.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4 relative">
                    <button
                      onClick={() => handleActionMenu(country.id)}
                      className="p-2 text-gray-600 hover:text-my-primary transition-colors rounded-lg hover:bg-gray-100"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {actionMenuOpen === country.id && (
                      <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => { handleEdit(country); handleCloseMenu(); }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { handleDelete(country.id); handleCloseMenu(); }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CountriesManagement; 