import React, { useState, useEffect } from 'react';
import { fetchCountries, createCountry, fetchCountryById, updateCountry, deleteCountry } from '../service';
import type { Country, CreateCountryInput } from '../interfaces';
import { Loader, Plus, Check, X, MoreVertical, Eye, Globe, MapPin, Clock, CreditCard, Phone, Flag, Edit, Trash, AlertTriangle } from 'lucide-react';
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
  
  // Country details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [countryDetails, setCountryDetails] = useState<Country | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Edit country modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [editCountryData, setEditCountryData] = useState<CreateCountryInput>({
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
  const [updating, setUpdating] = useState(false);
  
  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [countryToDelete, setCountryToDelete] = useState<Country | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = (country: Country) => {
    setCountryToDelete(country);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!countryToDelete) return;
    
    setDeleting(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await deleteCountry(countryToDelete.id, token || undefined);
      await loadCountries();
      showToast('Country deleted successfully!', 'success');
      setShowDeleteModal(false);
      setCountryToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Failed to delete country');
      showToast(err.message || 'Failed to delete country', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (country: Country) => {
    setEditingCountry(country);
    setEditCountryData({
      code: country.code,
      code_alpha3: country.code_alpha3,
      name: country.name,
      local_name: country.local_name,
      currency_code: country.currency_code,
      currency_symbol: country.currency_symbol,
      phone_prefix: country.phone_prefix,
      timezone: country.timezone,
      languages: country.languages,
      is_active: country.is_active
    });
    setShowEditModal(true);
  };

  const handleUpdateCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCountry) return;
    
    setUpdating(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      await updateCountry(editingCountry.id, editCountryData, token || undefined);
      setShowEditModal(false);
      setEditingCountry(null);
      await loadCountries();
      showToast('Country updated successfully!', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to update country');
    } finally {
      setUpdating(false);
    }
  };

  const handleViewDetails = async (countryId: string) => {
    setSelectedCountryId(countryId);
    setShowDetailsModal(true);
    setLoadingDetails(true);
    setCountryDetails(null);
    
    try {
      const token = localStorage.getItem('token');
      const countryData = await fetchCountryById(countryId, token || undefined);
      setCountryDetails(countryData);
    } catch (err: any) {
      showToast(err.message || 'Failed to load country details', 'error');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleActionMenu = (id: string) => {
    setActionMenuOpen(actionMenuOpen === id ? null : id);
  };
  const handleCloseMenu = () => setActionMenuOpen(null);

  return (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Countries</h3>
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
                <input type="text" required value={newCountry.languages?.join(', ') || ''} onChange={e => setNewCountry({ ...newCountry, languages: e.target.value.split(',').map(l => l.trim()).filter(Boolean) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent" />
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
                      <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => { handleViewDetails(country.id); handleCloseMenu(); }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                        <button
                          onClick={() => { handleEdit(country); handleCloseMenu(); }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => { handleDelete(country); handleCloseMenu(); }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <Trash className="w-4 h-4 mr-2" />
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

      {/* Country Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Globe className="w-6 h-6 text-my-primary mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">
                  {countryDetails?.name || 'Country Details'}
                </h2>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {loadingDetails ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 text-my-primary animate-spin mr-3" />
                  <span className="text-gray-500">Loading country details...</span>
                </div>
              ) : countryDetails ? (
                <div className="space-y-6">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className={`px-4 py-2 text-sm font-medium rounded-full ${countryDetails.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {countryDetails.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-sm text-gray-500">
                      ID: {countryDetails.id}
                    </span>
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Flag className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Country Name</h3>
                          <p className="text-gray-600">{countryDetails.name}</p>
                          <p className="text-sm text-gray-500 mt-1">Local: {countryDetails.local_name}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Country Codes</h3>
                          <p className="text-gray-600">ISO 2: {countryDetails.code}</p>
                          <p className="text-gray-600">ISO 3: {countryDetails.code_alpha3}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <CreditCard className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Currency</h3>
                          <p className="text-gray-600">{countryDetails.currency_code} ({countryDetails.currency_symbol})</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Phone className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Phone Prefix</h3>
                          <p className="text-gray-600">{countryDetails.phone_prefix}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Clock className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Timezone</h3>
                          <p className="text-gray-600">{countryDetails.timezone}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <Globe className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Languages</h3>
                          <div className="flex flex-wrap gap-1">
                            {countryDetails.languages.map((lang, index) => (
                              <span key={index} className="px-2 py-1 bg-my-primary/10 text-my-primary rounded text-sm">
                                {lang.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Launch Date */}
                  {countryDetails.launch_date && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Launch Information</h3>
                      <p className="text-gray-600">
                        Launch Date: {new Date(countryDetails.launch_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Record Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <p className="text-gray-700">
                          {new Date(countryDetails.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Updated:</span>
                        <p className="text-gray-700">
                          {new Date(countryDetails.updated_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">Failed to load country details</div>
                  <button
                    onClick={() => selectedCountryId && handleViewDetails(selectedCountryId)}
                    className="bg-my-primary hover:bg-my-primary/80 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Country Modal */}
      {showEditModal && editingCountry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Globe className="w-6 h-6 text-my-primary mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Edit Country: {editingCountry.name}
                </h2>
              </div>
              <button 
                onClick={() => setShowEditModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <form onSubmit={handleUpdateCountry}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input 
                      type="text" 
                      required 
                      value={editCountryData.name} 
                      onChange={e => setEditCountryData({ ...editCountryData, name: e.target.value })} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Local Name</label>
                    <input 
                      type="text" 
                      required 
                      value={editCountryData.local_name} 
                      onChange={e => setEditCountryData({ ...editCountryData, local_name: e.target.value })} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                    <input 
                      type="text" 
                      required 
                      value={editCountryData.code} 
                      onChange={e => setEditCountryData({ ...editCountryData, code: e.target.value })} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alpha-3 Code</label>
                    <input 
                      type="text" 
                      required 
                      value={editCountryData.code_alpha3} 
                      onChange={e => setEditCountryData({ ...editCountryData, code_alpha3: e.target.value })} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency Code</label>
                    <input 
                      type="text" 
                      required 
                      value={editCountryData.currency_code} 
                      onChange={e => setEditCountryData({ ...editCountryData, currency_code: e.target.value })} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
                    <input 
                      type="text" 
                      required 
                      value={editCountryData.currency_symbol} 
                      onChange={e => setEditCountryData({ ...editCountryData, currency_symbol: e.target.value })} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Prefix</label>
                    <input 
                      type="text" 
                      required 
                      value={editCountryData.phone_prefix} 
                      onChange={e => setEditCountryData({ ...editCountryData, phone_prefix: e.target.value })} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <input 
                      type="text" 
                      required 
                      value={editCountryData.timezone} 
                      onChange={e => setEditCountryData({ ...editCountryData, timezone: e.target.value })} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Languages (comma separated)</label>
                    <input 
                      type="text" 
                      required 
                      value={editCountryData.languages?.join(', ') || ''} 
                      onChange={e => setEditCountryData({ ...editCountryData, languages: e.target.value.split(',').map(l => l.trim()).filter(Boolean) })} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-transparent" 
                    />
                  </div>
                  <div className="flex items-center mt-6">
                    <input 
                      type="checkbox" 
                      checked={editCountryData.is_active} 
                      onChange={e => setEditCountryData({ ...editCountryData, is_active: e.target.checked })} 
                      className="mr-2" 
                    />
                    <label className="text-sm font-medium text-gray-700">Active</label>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>
                )}

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="bg-my-primary hover:bg-my-primary/80 text-white px-6 py-2 rounded-xl transition-colors flex items-center disabled:opacity-50"
                  >
                    {updating ? (
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    Update Country
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && countryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Delete Country</h2>
              </div>
              <button 
                onClick={() => setShowDeleteModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete <strong>{countryToDelete.name}</strong>?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-700 font-medium mb-1">Warning</p>
                      <p className="text-sm text-red-600">
                        This action cannot be undone. All data associated with this country will be permanently removed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl transition-colors flex items-center disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash className="w-4 h-4 mr-2" />
                  )}
                  {deleting ? 'Deleting...' : 'Delete Country'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountriesManagement; 