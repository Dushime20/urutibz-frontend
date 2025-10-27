import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { X, AlertTriangle, User, Calendar, Search, Check } from 'lucide-react';
import axios from 'axios';
import { riskManagementService } from '../../../services/riskManagementService';
import type { CreateViolationRequest } from '../../../types/riskManagement';
import { ViolationType, ViolationSeverity } from '../../../types/riskManagement';

interface CreateViolationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateViolationModal: React.FC<CreateViolationModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<CreateViolationRequest>({
    bookingId: '',
    productId: '',
    renterId: '',
    violationType: ViolationType.MISSING_INSURANCE,
    severity: ViolationSeverity.LOW,
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // Autocomplete state
  const [bookingSearch, setBookingSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [renterSearch, setRenterSearch] = useState('');
  const [showBookingDropdown, setShowBookingDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showRenterDropdown, setShowRenterDropdown] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{ id: string; title: string } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; title: string } | null>(null);
  const [selectedRenter, setSelectedRenter] = useState<{ id: string; name: string } | null>(null);

  const queryClient = useQueryClient();

  const createViolationMutation = useMutation({
    mutationFn: riskManagementService.createViolation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['violations'] });
      onClose();
      setFormData({
        bookingId: '',
        productId: '',
        renterId: '',
        violationType: ViolationType.MISSING_INSURANCE,
        severity: ViolationSeverity.LOW,
        description: ''
      });
      setErrors({});
      // Reset autocomplete state
      setBookingSearch('');
      setProductSearch('');
      setRenterSearch('');
      setSelectedBooking(null);
      setSelectedProduct(null);
      setSelectedRenter(null);
    },
    onError: (error: any) => {
      console.error('Error creating violation:', error);
      setErrors({ general: 'Failed to create violation. Please try again.' });
    }
  });

  // Fetch bookings for autocomplete
  const { data: bookingsData, isLoading: bookingsLoading, error: bookingsError } = useQuery({
    queryKey: ['all-bookings', bookingSearch],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      
      // Fetch all bookings (both as renter and owner)
      const [renterResponse, ownerResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/bookings?role=renter&page=1&limit=100`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/bookings?role=owner&page=1&limit=100`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      let allBookings: any[] = [];
      
      // Extract bookings from renter response
      if (renterResponse.data?.data?.data && Array.isArray(renterResponse.data.data.data)) {
        allBookings = [...allBookings, ...renterResponse.data.data.data];
      } else if (renterResponse.data?.data && Array.isArray(renterResponse.data.data)) {
        allBookings = [...allBookings, ...renterResponse.data.data];
      }
      
      // Extract bookings from owner response
      if (ownerResponse.data?.data?.data && Array.isArray(ownerResponse.data.data.data)) {
        allBookings = [...allBookings, ...ownerResponse.data.data.data];
      } else if (ownerResponse.data?.data && Array.isArray(ownerResponse.data.data)) {
        allBookings = [...allBookings, ...ownerResponse.data.data];
      }
      
      // Remove duplicates based on booking ID
      const uniqueBookings = allBookings.filter((booking, index, self) => 
        index === self.findIndex(b => b.id === booking.id)
      );
      
      // Filter bookings that match the search term if provided
      let filteredBookings = uniqueBookings;
      if (bookingSearch && bookingSearch.length > 0) {
        filteredBookings = uniqueBookings.filter((booking: any) => 
          booking.id?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
          booking.product?.title?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
          booking.product_id?.toLowerCase().includes(bookingSearch.toLowerCase())
        );
      }
      
      return { data: filteredBookings };
    },
    enabled: true, // Always fetch all bookings
  });

  // Fetch products for autocomplete
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products', productSearch],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.get(`${API_BASE_URL}/products?search=${productSearch}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let products = [];
      if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
        products = response.data.data.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        products = response.data.data;
      } else if (Array.isArray(response.data)) {
        products = response.data;
      }
      
      // Filter products that match the search term
      if (productSearch && products.length > 0) {
        products = products.filter((product: any) => 
          product.title?.toLowerCase().includes(productSearch.toLowerCase()) ||
          product.id?.toLowerCase().includes(productSearch.toLowerCase())
        );
      }
      
      return { data: products };
    },
    enabled: productSearch.length > 2,
  });

  // Fetch users for autocomplete
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['all-users', renterSearch],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      console.log('Fetching users with token:', token ? 'Present' : 'Missing');
      
      try {
        const response = await axios.get(`${API_BASE_URL}/admin/users?page=1&limit=100`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Users API Response:', response.data);
        
        let allUsers: any[] = [];
        // Use the same structure as user management: response.data.data.items
        if (response.data?.data?.items && Array.isArray(response.data.data.items)) {
          allUsers = response.data.data.items;
          console.log('Found users in response.data.data.items:', allUsers.length);
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          allUsers = response.data.data;
          console.log('Found users in response.data.data:', allUsers.length);
        } else if (Array.isArray(response.data)) {
          allUsers = response.data;
          console.log('Found users in response.data:', allUsers.length);
        } else {
          console.log('No users found in response structure');
        }
        
        // Filter users that match the search term if provided
        let filteredUsers = allUsers;
        if (renterSearch && renterSearch.length > 0) {
          filteredUsers = allUsers.filter((user: any) => 
            user.first_name?.toLowerCase().includes(renterSearch.toLowerCase()) ||
            user.last_name?.toLowerCase().includes(renterSearch.toLowerCase()) ||
            user.email?.toLowerCase().includes(renterSearch.toLowerCase()) ||
            user.id?.toLowerCase().includes(renterSearch.toLowerCase())
          );
          console.log('Filtered users for search:', filteredUsers.length);
        }
        
        console.log('Returning users:', filteredUsers.length);
        return { data: filteredUsers };
      } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
      }
    },
    enabled: true, // Always fetch all users
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.bookingId.trim()) {
      newErrors.bookingId = 'Booking ID is required';
    }
    if (!formData.productId.trim()) {
      newErrors.productId = 'Product ID is required';
    }
    if (!formData.renterId.trim()) {
      newErrors.renterId = 'Renter ID is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      await createViolationMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Error creating violation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Debug users data
  useEffect(() => {
    console.log('Users state changed - loading:', usersLoading, 'error:', usersError, 'data:', usersData);
  }, [usersLoading, usersError, usersData]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setShowBookingDropdown(false);
        setShowProductDropdown(false);
        setShowRenterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autocomplete handlers
  const handleBookingSelect = (booking: { id: string; title: string }) => {
    setSelectedBooking(booking);
    setFormData(prev => ({ ...prev, bookingId: booking.id }));
    setBookingSearch(booking.title);
    setShowBookingDropdown(false);
  };

  const handleProductSelect = (product: { id: string; title: string }) => {
    setSelectedProduct(product);
    setFormData(prev => ({ ...prev, productId: product.id }));
    setProductSearch(product.title);
    setShowProductDropdown(false);
  };

  const handleRenterSelect = (user: { id: string; name: string; email: string }) => {
    const displayName = user.name || user.email || 'Unknown User';
    setSelectedRenter({ id: user.id, name: displayName });
    setFormData(prev => ({ ...prev, renterId: user.id }));
    setRenterSearch(displayName);
    setShowRenterDropdown(false);
  };

  const handleInputChange = (field: keyof CreateViolationRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const violationTypes = [
    { value: ViolationType.MISSING_INSURANCE, label: 'Missing Insurance', icon: '🛡️' },
    { value: ViolationType.MISSING_INSPECTION, label: 'Missing Inspection', icon: '🔍' },
    { value: ViolationType.INADEQUATE_COVERAGE, label: 'Inadequate Coverage', icon: '⚠️' },
    { value: ViolationType.EXPIRED_COMPLIANCE, label: 'Expired Compliance', icon: '📄' }
  ];

  const severityLevels = [
    { value: ViolationSeverity.LOW, label: 'Low', color: 'text-green-600' },
    { value: ViolationSeverity.MEDIUM, label: 'Medium', color: 'text-yellow-600' },
    { value: ViolationSeverity.HIGH, label: 'High', color: 'text-orange-600' },
    { value: ViolationSeverity.CRITICAL, label: 'Critical', color: 'text-red-600' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 sm:top-20 mx-auto p-4 sm:p-5 border border-gray-200 dark:border-slate-600 w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-slate-800 max-h-[95vh] overflow-y-auto">
        <div className="mt-3">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg mr-3">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Record New Violation</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 hidden sm:block">Create a new policy violation record</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 self-end sm:self-auto"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-400 dark:text-red-500" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800 dark:text-red-200">{errors.general}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Required Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Booking *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={(e) => {
                      setBookingSearch(e.target.value);
                      setShowBookingDropdown(true);
                      if (!e.target.value) {
                        setSelectedBooking(null);
                        setFormData(prev => ({ ...prev, bookingId: '' }));
                      }
                    }}
                    onFocus={() => setShowBookingDropdown(true)}
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${
                      errors.bookingId ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'
                    }`}
                    placeholder="Search for booking..."
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                </div>
                
                {/* Booking Dropdown */}
                {showBookingDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {bookingsLoading ? (
                      <div className="px-4 py-2 text-sm text-gray-500 dark:text-slate-400 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600 mr-2"></div>
                        Loading bookings...
                      </div>
                    ) : bookingsError ? (
                      <div className="px-4 py-2 text-sm text-red-500 dark:text-red-400">
                        Error loading bookings: {bookingsError.message}
                      </div>
                    ) : bookingsData?.data && bookingsData.data.length > 0 ? (
                      bookingsData.data.map((booking: any) => (
                        <div
                          key={booking.id}
                          onClick={() => handleBookingSelect({ id: booking.id, title: booking.product?.title || `Booking ${booking.id}` })}
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                              {booking.product?.title || `Booking ${booking.id}`}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-slate-400">ID: {booking.id}</div>
                          </div>
                          {selectedBooking?.id === booking.id && (
                            <Check className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500 dark:text-slate-400">
                        {bookingSearch ? `No bookings found for "${bookingSearch}"` : 'No bookings available'}
                      </div>
                    )}
                  </div>
                )}
                
                {selectedBooking && (
                  <div className="mt-2 p-2 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 rounded-lg">
                    <div className="text-sm text-teal-800 dark:text-teal-200">
                      <strong>Selected:</strong> {selectedBooking.title}
                    </div>
                  </div>
                )}
                
                {errors.bookingId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bookingId}</p>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Product *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductDropdown(true);
                      if (!e.target.value) {
                        setSelectedProduct(null);
                        setFormData(prev => ({ ...prev, productId: '' }));
                      }
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                    className={`w-full px-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${
                      errors.productId ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'
                    }`}
                    placeholder="Search for product..."
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                </div>
                
                {/* Product Dropdown */}
                {showProductDropdown && productSearch.length > 2 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {productsLoading ? (
                      <div className="px-4 py-2 text-sm text-gray-500 dark:text-slate-400 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600 mr-2"></div>
                        Loading products...
                      </div>
                    ) : productsError ? (
                      <div className="px-4 py-2 text-sm text-red-500 dark:text-red-400">
                        Error loading products: {productsError.message}
                      </div>
                    ) : productsData?.data && productsData.data.length > 0 ? (
                      productsData.data.map((product: any) => (
                        <div
                          key={product.id}
                          onClick={() => handleProductSelect({ id: product.id, title: product.title })}
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-slate-100">{product.title}</div>
                            <div className="text-xs text-gray-500 dark:text-slate-400">ID: {product.id}</div>
                          </div>
                          {selectedProduct?.id === product.id && (
                            <Check className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500 dark:text-slate-400">
                        No products found for "{productSearch}"
                      </div>
                    )}
                  </div>
                )}
                
                {selectedProduct && (
                  <div className="mt-2 p-2 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 rounded-lg">
                    <div className="text-sm text-teal-800 dark:text-teal-200">
                      <strong>Selected:</strong> {selectedProduct.title}
                    </div>
                  </div>
                )}
                
                {errors.productId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.productId}</p>
                )}
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Renter *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={renterSearch}
                    onChange={(e) => {
                      setRenterSearch(e.target.value);
                      setShowRenterDropdown(true);
                      if (!e.target.value) {
                        setSelectedRenter(null);
                        setFormData(prev => ({ ...prev, renterId: '' }));
                      }
                    }}
                    onFocus={() => setShowRenterDropdown(true)}
                    className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${
                      errors.renterId ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'
                    }`}
                    placeholder="Search for user..."
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
                </div>
                
                {/* Renter Dropdown */}
                {showRenterDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {usersLoading ? (
                      <div className="px-4 py-2 text-sm text-gray-500 dark:text-slate-400 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600 mr-2"></div>
                        Loading users...
                      </div>
                    ) : usersError ? (
                      <div className="px-4 py-2 text-sm text-red-500 dark:text-red-400">
                        Error loading users: {usersError.message}
                      </div>
                    ) : usersData?.data && usersData.data.length > 0 ? (
                      usersData.data.map((user: any) => (
                        <div
                          key={user.id}
                          onClick={() => handleRenterSelect({ 
                            id: user.id, 
                            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email, 
                            email: user.email 
                          })}
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-600 cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                              {`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-slate-400">{user.email}</div>
                          </div>
                          {selectedRenter?.id === user.id && (
                            <Check className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500 dark:text-slate-400">
                        {renterSearch ? `No users found for "${renterSearch}"` : 'No users available'}
                      </div>
                    )}
                  </div>
                )}
                
                {selectedRenter && (
                  <div className="mt-2 p-2 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-700 rounded-lg">
                    <div className="text-sm text-teal-800 dark:text-teal-200">
                      <strong>Selected:</strong> {selectedRenter.name}
                    </div>
                  </div>
                )}
                
                {errors.renterId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.renterId}</p>
                )}
              </div>
            </div>

            {/* Violation Type and Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Violation Type *
                </label>
                <select
                  value={formData.violationType}
                  onChange={(e) => handleInputChange('violationType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                >
                  {violationTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Severity *
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => handleInputChange('severity', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                >
                  {severityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                placeholder="Describe the violation..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 ${
                  errors.description ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-slate-600'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-200 dark:border-slate-600">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" />
                    Create Violation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateViolationModal;
