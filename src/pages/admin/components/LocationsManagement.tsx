import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Filter, 
  Plus, 
  Search, 
  MapPin, 
  Users, 
  Package, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  Calendar,
  Building
} from 'lucide-react';

interface Location {
  id: string;
  name: string;
  country: string;
  city: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'active' | 'inactive' | 'pending';
  totalUsers: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

interface LocationsManagementProps {
  // Add props for locations data as needed
}

const LocationsManagement: React.FC<LocationsManagementProps> = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockLocations: Location[] = [
      {
        id: '1',
        name: 'Kigali Central',
        country: 'Rwanda',
        city: 'Kigali',
        address: 'KG 123 St, Kacyiru',
        coordinates: { lat: -1.9441, lng: 30.0619 },
        status: 'active',
        totalUsers: 245,
        totalItems: 89,
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20'
      },
      {
        id: '2',
        name: 'Kampala Downtown',
        country: 'Uganda',
        city: 'Kampala',
        address: 'Plot 15, Nakasero Hill',
        coordinates: { lat: 0.3476, lng: 32.5825 },
        status: 'active',
        totalUsers: 189,
        totalItems: 67,
        createdAt: '2024-01-10',
        updatedAt: '2024-01-18'
      },
      {
        id: '3',
        name: 'Nairobi Westlands',
        country: 'Kenya',
        city: 'Nairobi',
        address: 'Westlands Business Park',
        coordinates: { lat: -1.2649, lng: 36.8029 },
        status: 'pending',
        totalUsers: 0,
        totalItems: 0,
        createdAt: '2024-01-25',
        updatedAt: '2024-01-25'
      },
      {
        id: '4',
        name: 'Dar es Salaam CBD',
        country: 'Tanzania',
        city: 'Dar es Salaam',
        address: 'Samora Avenue, CBD',
        coordinates: { lat: -6.7924, lng: 39.2083 },
        status: 'inactive',
        totalUsers: 156,
        totalItems: 43,
        createdAt: '2024-01-05',
        updatedAt: '2024-01-22'
      }
    ];

    setTimeout(() => {
      setLocations(mockLocations);
      setLoading(false);
    }, 1000);
  }, []);

  // Force dark mode for locations page
  useEffect(() => {
    document.documentElement.classList.add('dark');
    
    return () => {
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      if (!savedDarkMode) {
        document.documentElement.classList.remove('dark');
      }
    };
  }, []);

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || location.status === statusFilter;
    const matchesCountry = countryFilter === 'all' || location.country === countryFilter;
    
    return matchesSearch && matchesStatus && matchesCountry;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'inactive':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'inactive':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Loading locations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      {/* Header */}
    <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Locations</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage platform locations and regional settings
          </p>
        </div>
      <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl transition-colors flex items-center"
          >
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-xl transition-colors flex items-center"
          >
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </button>
      </div>
    </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Locations
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, city, or country..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country
              </label>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Countries</option>
                <option value="Rwanda">Rwanda</option>
                <option value="Uganda">Uganda</option>
                <option value="Kenya">Kenya</option>
                <option value="Tanzania">Tanzania</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex items-center">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <Globe className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Locations</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{locations.length}</p>
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
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {locations.filter(l => l.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {locations.filter(l => l.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Inactive</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {locations.filter(l => l.status === 'inactive').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Locations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLocations.map((location) => (
                <tr key={location.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg mr-3">
                        <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {location.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {location.city}, {location.country}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {location.address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(location.status)}`}>
                      {getStatusIcon(location.status)}
                      <span className="ml-1 capitalize">{location.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900 dark:text-white">
                      <Users className="w-4 h-4 mr-1 text-gray-400" />
                      {location.totalUsers.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900 dark:text-white">
                      <Package className="w-4 h-4 mr-1 text-gray-400" />
                      {location.totalItems.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(location.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedLocation(location)}
                        className="text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLocation(location);
                          setShowEditModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
    </div>
      </div>

      {/* Empty State */}
      {filteredLocations.length === 0 && (
        <div className="text-center py-12">
          <Globe className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No locations found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter !== 'all' || countryFilter !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by adding your first location.'}
          </p>
        </div>
      )}
  </div>
);
};

export default LocationsManagement; 