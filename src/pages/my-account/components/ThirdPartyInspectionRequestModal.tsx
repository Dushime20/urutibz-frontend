import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, FileText, DollarSign, AlertCircle, Loader2, User, Star, Award, MapPin as MapPinIcon } from 'lucide-react';
import { createThirdPartyInspection, getOwnerBookings, getAvailableInspectors, OwnerBooking, AvailableInspector } from '../service/thirdPartyInspectionApi';
import { getMyProducts } from '../service/api';

interface ThirdPartyInspectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (inspection: any) => void;
  onNavigateToPayment?: (inspection: any) => void; // Optional callback to navigate to payment
  productId?: string; // Pre-selected product
}

const ThirdPartyInspectionRequestModal: React.FC<ThirdPartyInspectionRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onNavigateToPayment,
  productId: preselectedProductId
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'form' | 'success'>('form');
  
  // Form state
  const [productId, setProductId] = useState<string>(preselectedProductId || '');
  const [categoryId, setCategoryId] = useState<string>('');
  const [bookingId, setBookingId] = useState<string>('');
  const [inspectorId, setInspectorId] = useState<string>('');
  const [inspectionTier, setInspectionTier] = useState<'standard' | 'advanced'>('standard');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>('normal');
  const [currency, setCurrency] = useState<string>('USD');
  
  // Data state
  const [products, setProducts] = useState<any[]>([]);
  const [bookings, setBookings] = useState<OwnerBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [availableInspectors, setAvailableInspectors] = useState<AvailableInspector[]>([]);
  const [loadingInspectors, setLoadingInspectors] = useState(false);
  const [createdInspection, setCreatedInspection] = useState<any>(null);
  
  const token = localStorage.getItem('token') || localStorage.getItem('authToken') || '';

  // Calculate inspection cost
  const inspectionCost = inspectionTier === 'standard' ? 50 : 100;

  // Load products on mount
  useEffect(() => {
    if (isOpen && !preselectedProductId) {
      loadProducts();
    }
  }, [isOpen, preselectedProductId]);

  // Load bookings when product is selected
  useEffect(() => {
    if (productId && isOpen) {
      loadBookings();
    } else {
      setBookings([]);
      setBookingId('');
    }
  }, [productId, isOpen]);

  // Set category when product is selected
  useEffect(() => {
    if (productId) {
      const product = products.find(p => p.id === productId);
      if (product?.category_id) {
        setCategoryId(product.category_id);
      }
    }
  }, [productId, products]);

  // Load available inspectors when category is selected
  useEffect(() => {
    if (categoryId && isOpen) {
      loadAvailableInspectors();
    } else {
      setAvailableInspectors([]);
      setInspectorId('');
    }
  }, [categoryId, isOpen]);

  const loadProducts = async () => {
    try {
      const response = await getMyProducts(token);
      const productList = response?.data || response || [];
      setProducts(productList);
      
      // If only one product, auto-select it
      if (productList.length === 1 && !preselectedProductId) {
        setProductId(productList[0].id);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadBookings = async () => {
    if (!productId || !token) return;
    
    setLoadingBookings(true);
    try {
      const bookingsList = await getOwnerBookings(productId, token);
      setBookings(bookingsList);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadAvailableInspectors = async () => {
    if (!categoryId || !token) return;
    
    setLoadingInspectors(true);
    try {
      console.log('Loading available inspectors for category:', categoryId);
      const inspectors = await getAvailableInspectors(categoryId, undefined, token);
      console.log('Received inspectors:', inspectors);
      setAvailableInspectors(inspectors || []);
      
      // Auto-select first inspector if only one available
      if (inspectors && inspectors.length === 1) {
        setInspectorId(inspectors[0].inspectorId);
      }
    } catch (error: any) {
      console.error('Error loading inspectors:', error);
      console.error('Error details:', error.response?.data || error.message);
      setAvailableInspectors([]);
    } finally {
      setLoadingInspectors(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productId || !categoryId || !scheduledAt || !bookingId) {
      setError('Please fill in all required fields: Product, Category, Booking, and Scheduled Date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request = {
        productId,
        categoryId,
        bookingId: bookingId, // Required for third-party inspections
        inspectorId: inspectorId || undefined, // Optional - will auto-assign if not provided
        scheduledAt: new Date(scheduledAt).toISOString(),
        location: location || undefined,
        notes: notes || undefined,
        priority,
        inspectionTier,
        currency
      };

      const inspection = await createThirdPartyInspection(request, token);
      setCreatedInspection(inspection);
      
      // If payment navigation callback is provided, navigate to payment immediately
      if (onNavigateToPayment) {
        handleClose();
        onNavigateToPayment(inspection);
      } else {
        // Otherwise show success message and call onSuccess
        setStep('success');
        setTimeout(() => {
          onSuccess(inspection);
          handleClose();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create inspection request');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setError(null);
    setProductId(preselectedProductId || '');
    setBookingId('');
    setInspectorId('');
    setScheduledAt('');
    setLocation('');
    setNotes('');
    setPriority('normal');
    setInspectionTier('standard');
    setCreatedInspection(null);
    setAvailableInspectors([]);
    onClose();
  };

  if (!isOpen) return null;

  // Success step
  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
        <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-md">
          <div className="p-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-center text-gray-900 dark:text-slate-100 mb-2">
              Inspection Request Created!
            </h3>
            <p className="text-center text-gray-600 dark:text-slate-400 mb-4">
              Your inspection request has been created. Payment is required to proceed.
            </p>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-slate-400">Inspection Cost:</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                  {currency} {inspectionCost}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-500">
                Status: <span className="font-medium text-yellow-600">Pending Payment</span>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
            Request Third-Party Inspection
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Product <span className="text-red-500">*</span>
            </label>
            {preselectedProductId ? (
              <div className="px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-sm text-gray-700 dark:text-slate-300">
                {products.find(p => p.id === preselectedProductId)?.title || 'Selected Product'}
              </div>
            ) : (
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title || product.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Booking Selection (Required) */}
          {productId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Booking <span className="text-red-500">*</span>
              </label>
              {loadingBookings ? (
                <div className="px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-sm text-gray-500 dark:text-slate-400">
                  Loading bookings...
                </div>
              ) : bookings.length === 0 ? (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-300">
                    No bookings found for this product. You need at least one booking to request a third-party inspection.
                  </p>
                </div>
              ) : (
                <select
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">Select a booking</option>
                  {bookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      #{booking.booking_number} - {booking.renter?.first_name} {booking.renter?.last_name} ({new Date(booking.start_date).toLocaleDateString()} to {new Date(booking.end_date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Inspector Selection */}
          {categoryId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                <User className="inline w-4 h-4 mr-1" />
                Select Inspector (Optional)
              </label>
              {loadingInspectors ? (
                <div className="px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-lg text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading available inspectors...
                </div>
              ) : availableInspectors.length === 0 ? (
                <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    No inspectors available for this category. An inspector will be auto-assigned if possible.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
                  <button
                    type="button"
                    onClick={() => setInspectorId('')}
                    className={`w-full p-3 border-2 rounded-lg transition-colors text-left ${
                      !inspectorId
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-slate-100">
                      Auto-assign (Recommended)
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      System will automatically select the best inspector
                    </div>
                  </button>
                  {availableInspectors.map((inspector) => (
                    <button
                      key={inspector.inspectorId}
                      type="button"
                      onClick={() => setInspectorId(inspector.inspectorId)}
                      className={`w-full p-3 border-2 rounded-lg transition-colors text-left ${
                        inspectorId === inspector.inspectorId
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-gray-600 dark:text-slate-400" />
                            <span className="font-medium text-gray-900 dark:text-slate-100">
                              {inspector.inspectorName}
                            </span>
                            {inspector.internationallyRecognized && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full dark:bg-blue-900/20 dark:text-blue-400">
                                International
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-slate-400 mt-1">
                            <div className="flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              <span className="capitalize">{inspector.certificationLevel}</span>
                            </div>
                            {inspector.averageRating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>{inspector.averageRating.toFixed(1)}</span>
                              </div>
                            )}
                            {inspector.totalInspections > 0 && (
                              <span>{inspector.totalInspections} inspections</span>
                            )}
                            {inspector.distance !== undefined && (
                              <div className="flex items-center gap-1">
                                <MapPinIcon className="w-3 h-3" />
                                <span>{inspector.distance.toFixed(1)} km</span>
                              </div>
                            )}
                          </div>
                          {inspector.specializations && inspector.specializations.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {inspector.specializations.slice(0, 3).map((spec, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 text-xs rounded"
                                >
                                  {spec}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {inspectorId === inspector.inspectorId && (
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 rounded-full bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center">
                              <X className="w-3 h-3 text-white rotate-45" />
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {availableInspectors.length > 0 && !inspectorId && (
                <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Leave unselected to let the system auto-assign the best inspector
                </p>
              )}
            </div>
          )}

          {/* Inspection Tier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Inspection Tier <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setInspectionTier('standard')}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  inspectionTier === 'standard'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-slate-100 mb-1">Standard</div>
                  <div className="text-sm text-gray-600 dark:text-slate-400 mb-2">120-point check</div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">${currency === 'USD' ? '50' : '50'}</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setInspectionTier('advanced')}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  inspectionTier === 'advanced'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <div className="font-semibold text-gray-900 dark:text-slate-100 mb-1">Advanced</div>
                  <div className="text-sm text-gray-600 dark:text-slate-400 mb-2">240-point check</div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">${currency === 'USD' ? '100' : '100'}</div>
                </div>
              </button>
            </div>
          </div>

          {/* Scheduled Date/Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Scheduled Date & Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
                min={new Date().toISOString().slice(0, 16)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              Location (Optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter inspection location"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              <FileText className="inline w-4 h-4 mr-1" />
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any special instructions or notes for the inspector..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'low' | 'normal' | 'high')}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Cost Summary */}
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Inspection Cost:</span>
              <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {currency} {inspectionCost}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Payment will be required after creating the request
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !productId || !categoryId || !scheduledAt}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  Create Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ThirdPartyInspectionRequestModal;

