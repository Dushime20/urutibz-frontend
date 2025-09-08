// Handover Session Form Component
// Following the same patterns as RiskAssessmentForm.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { 
  Package, 
  MapPin, 
  FileText, 
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { useHandoverSession } from '../../../hooks/useHandoverSession';
import { useToast } from '../../../contexts/ToastContext';
import { CreateHandoverSessionRequest } from '../../../types/handoverReturn';
import ErrorBoundary from '../../../components/ErrorBoundary';
import { fetchUserBookings, getProductById } from '../../my-account/service/api';

interface HandoverSessionFormProps {
  onSessionCreated?: (sessionId: string) => void;
  className?: string;
}

const HandoverSessionForm: React.FC<HandoverSessionFormProps> = ({ 
  onSessionCreated, 
  className = '' 
}) => {
  const { showToast } = useToast();
  const { session, loading, error, createSession } = useHandoverSession();
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingSearch, setBookingSearch] = useState('');
  
  const [formData, setFormData] = useState<CreateHandoverSessionRequest>({
    bookingId: '',
    productId: '',
    renterId: '',
    ownerId: '',
    handoverType: 'meetup',
    scheduledDateTime: '',
    location: {
      latitude: 0,
      longitude: 0,
      address: '',
      city: '',
      country: ''
    },
    handoverNotes: ''
  });

  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  // Current user id (from localStorage auth info)
  const currentUserId = useMemo(() => {
    try {
      const rawUser = localStorage.getItem('user') || localStorage.getItem('authUser');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        return parsed?.id || parsed?.user?.id || '';
      }
    } catch {}
    return '';
  }, []);

  // Load user bookings for selection
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token') || null;
        const res = await fetchUserBookings(token);
        const baseList = (res?.data || res || []).map((b: any) => ({
          id: b.id || b.bookingId || b.uuid,
          bookingNumber: b.booking_number || b.bookingNumber,
          productId: b.productId || b.product_id,
          renterId: b.renterId || b.renter_id,
          ownerId: b.ownerId || b.owner_id,
          // Prefer product name for display in selector
          productName: b.productTitle || b.product_name || b.title || b.reference || `Booking ${String(b.id).slice(0,8)}`,
          title: b.title || b.reference || b.productTitle || b.product_name || `Booking ${String(b.id).slice(0,8)}`,
          createdAt: b.createdAt || b.created_at,
          status: b.status,
        }));
        // Enrich with authoritative product title
        const enriched = await Promise.all(
          baseList.map(async (b: any) => {
            try {
              if (!b.productId) return b;
              const p = await getProductById(b.productId);
              return { ...b, productName: p?.title || p?.name || b.productName };
            } catch {
              return b;
            }
          })
        );
        setBookings(enriched);
      } catch (e) {
        setBookings([]);
      }
    })();
  }, []);

  // Only allow handover creation for bookings where current user is the owner
  const ownerBookings = useMemo(() => {
    if (!currentUserId) return bookings;
    return bookings.filter(b => String(b.ownerId) === String(currentUserId));
  }, [bookings, currentUserId]);

  const filteredBookings = useMemo(() => {
    const source = ownerBookings;
    if (!bookingSearch.trim()) return source;
    const q = bookingSearch.toLowerCase();
    return source.filter(b => (b.title || '').toLowerCase().includes(q) || String(b.id).toLowerCase().includes(q));
  }, [ownerBookings, bookingSearch]);

  const handleSelectBooking = (id: string) => {
    const b = bookings.find(x => String(x.id) === String(id));
    if (!b) return;
    setFormData(prev => ({
      ...prev,
      bookingId: b.id,
      productId: b.productId || '',
      renterId: b.renterId || '',
      ownerId: b.ownerId || ''
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by this browser', 'error');
      return;
    }

    setLocationPermission(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: `${position.coords.latitude}, ${position.coords.longitude}`,
            city: 'Current Location',
            country: 'Unknown'
          }
        }));
        showToast('Location captured successfully', 'success');
      },
      (error) => {
        console.error('Error getting location:', error);
        showToast('Failed to get current location', 'error');
        setLocationPermission(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.bookingId.trim() || !formData.productId.trim() || 
        !formData.renterId.trim() || !formData.ownerId.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (!formData.handoverType || !formData.scheduledDateTime) {
      showToast('Please select handover type and scheduled date/time', 'error');
      return;
    }

    if (!formData.location.address.trim()) {
      showToast('Please provide handover location', 'error');
      return;
    }

    if (!currentUserId || String(formData.ownerId) !== String(currentUserId)) {
      showToast('You can only create handover sessions for your own items (owner role).', 'error');
      return;
    }

    try {
      await createSession(formData);
      if (onSessionCreated && session) {
        onSessionCreated(session.id);
      }
    } catch (err) {
      console.error('Failed to create handover session:', err);
    }
  };

  const handleClear = () => {
    setFormData({
      bookingId: '',
      productId: '',
      renterId: '',
      ownerId: '',
      handoverType: 'meetup',
      scheduledDateTime: '',
      location: {
        latitude: 0,
        longitude: 0,
        address: '',
        city: '',
        country: ''
      },
      handoverNotes: ''
    });
  };

  return (
    <ErrorBoundary>
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Create Handover Session</h2>
              <p className="text-sm text-gray-600 mt-1">
                Start a new handover session for product delivery
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {ownerBookings.length === 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
              You have no bookings where you are the owner. Handover sessions can only be created for your own items.
            </div>
          )}
          {/* Basic Information */}
          {/* Booking selection (searchable) */}
          <div>
            <label htmlFor="booking" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Booking *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 md:col-span-2"
                value={formData.bookingId}
                onChange={(e) => handleSelectBooking(e.target.value)}
                required
                disabled={loading || ownerBookings.length === 0}
              >
                <option value="">Select booking</option>
                {filteredBookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.productName || b.title}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search your bookings..."
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 md:col-span-1 md:justify-self-end"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                disabled={loading || ownerBookings.length === 0}
              />
            </div>
            {formData.bookingId && (
              <p className="text-xs text-gray-500 mt-2">Linked product, renter and owner were auto-filled from the booking.</p>
            )}
          </div>

          {/* Hidden auto-filled identifiers */}
          <input type="hidden" name="productId" value={formData.productId} />
          <input type="hidden" name="renterId" value={formData.renterId} />
          <input type="hidden" name="ownerId" value={formData.ownerId} />

          {/* Handover Type and Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="handoverType" className="block text-sm font-medium text-gray-700 mb-2">
                Handover Type *
              </label>
              <select
                id="handoverType"
                name="handoverType"
                value={formData.handoverType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                disabled={loading}
                required
              >
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
                <option value="meetup">Meetup</option>
              </select>
            </div>
            <div>
              <label htmlFor="scheduledDateTime" className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled Date & Time *
              </label>
              <input
                type="datetime-local"
                id="scheduledDateTime"
                name="scheduledDateTime"
                value={formData.scheduledDateTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Handover Location</h3>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={loading || locationPermission}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MapPin className="w-4 h-4 mr-1" />
                {locationPermission ? 'Location Captured' : 'Get Current Location'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="handoverLocation.address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  id="handoverLocation.address"
                name="location.address"
                value={formData.location.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter handover address"
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label htmlFor="handoverLocation.city" className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  id="handoverLocation.city"
                name="location.city"
                value={formData.location.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter city"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="handoverLocation.country" className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                id="handoverLocation.country"
                name="location.country"
                value={formData.location.country}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter country"
                disabled={loading}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="handoverNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Handover Notes
            </label>
            <textarea
              id="handoverNotes"
              name="handoverNotes"
              value={formData.handoverNotes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Add any additional notes for the handover..."
              disabled={loading}
            />
          </div>


          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading || ownerBookings.length === 0}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Handover Session
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ErrorBoundary>
  );
};

export default HandoverSessionForm;
