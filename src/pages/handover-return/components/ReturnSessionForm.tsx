// Return Session Form Component
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
import { useReturnSession } from '../../../hooks/useReturnSession';
import { useToast } from '../../../contexts/ToastContext';
import { CreateReturnSessionRequest } from '../../../types/handoverReturn';
import ErrorBoundary from '../../../components/ErrorBoundary';
import { fetchUserBookings, getProductById } from '../../my-account/service/api';
import handoverReturnService from '../../../services/handoverReturnService';

interface ReturnSessionFormProps {
  onSessionCreated?: (sessionId: string) => void;
  className?: string;
}

const ReturnSessionForm: React.FC<ReturnSessionFormProps> = ({ 
  onSessionCreated, 
  className = '' 
}) => {
  const { showToast } = useToast();
  const { session, loading, error, createSession } = useReturnSession();
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingSearch, setBookingSearch] = useState('');
  
  const [formData, setFormData] = useState<CreateReturnSessionRequest>({
    bookingId: '',
    productId: '',
    renterId: '',
    ownerId: '',
    handoverSessionId: '',
    returnType: 'meetup',
    scheduledDateTime: '',
    location: {
      latitude: 0,
      longitude: 0,
      address: '',
      city: '',
      country: ''
    },
    returnNotes: ''
  });

  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [handoverOptions, setHandoverOptions] = useState<any[]>([]);

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
          productName: b.productTitle || b.product_name || b.title || b.reference || `Booking ${String(b.id).slice(0,8)}`,
          createdAt: b.createdAt || b.created_at,
          status: b.status,
        }));
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

  // Only allow creation for bookings where current user is the owner
  const ownerBookings = useMemo(() => {
    if (!currentUserId) return bookings;
    return bookings.filter(b => String(b.ownerId) === String(currentUserId));
  }, [bookings, currentUserId]);

  const filteredBookings = useMemo(() => {
    const source = ownerBookings;
    if (!bookingSearch.trim()) return source;
    const q = bookingSearch.toLowerCase();
    return source.filter(b => (b.productName || '').toLowerCase().includes(q) || String(b.id).toLowerCase().includes(q));
  }, [ownerBookings, bookingSearch]);

  const handleSelectBooking = (id: string) => {
    const b = bookings.find(x => String(x.id) === String(id));
    if (!b) return;
    setFormData(prev => ({
      ...prev,
      bookingId: b.id,
      productId: b.productId || '',
      renterId: b.renterId || '',
      ownerId: b.ownerId || '',
      handoverSessionId: ''
    }));
  };

  // Load user's handover sessions and filter by selected booking
  useEffect(() => {
    const loadHandoverForBooking = async () => {
      try {
        setHandoverOptions([]);
        if (!currentUserId || !formData.bookingId) return;
        const res = await handoverReturnService.getHandoverSessionsByUser(currentUserId, 1, 100);
        const all = res?.data || [];
        const byBooking = all.filter((s: any) => String(s.bookingId) === String(formData.bookingId));
        setHandoverOptions(byBooking);
      } catch (e) {
        setHandoverOptions([]);
      }
    };
    loadHandoverForBooking();
  }, [currentUserId, formData.bookingId]);

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
        !formData.renterId.trim() || !formData.ownerId.trim() ||
        !formData.handoverSessionId.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (!formData.returnType || !formData.scheduledDateTime) {
      showToast('Please select return type and scheduled date/time', 'error');
      return;
    }

    if (!formData.location.address.trim()) {
      showToast('Please provide return location', 'error');
      return;
    }

    if (!currentUserId || String(formData.ownerId) !== String(currentUserId)) {
      showToast('You can only create return sessions for your own items (owner role).', 'error');
      return;
    }

    try {
      await createSession(formData);
      if (onSessionCreated && session) {
        onSessionCreated(session.id);
      }
    } catch (err) {
      console.error('Failed to create return session:', err);
    }
  };

  const handleClear = () => {
    setFormData({
      bookingId: '',
      productId: '',
      renterId: '',
      ownerId: '',
      handoverSessionId: '',
      returnType: 'meetup',
      scheduledDateTime: '',
      location: {
        latitude: 0,
        longitude: 0,
        address: '',
        city: '',
        country: ''
      },
      returnNotes: ''
    });
  };

  return (
    <ErrorBoundary>
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Create Return Session</h2>
              <p className="text-sm text-gray-600 mt-1">
                Start a new return session for product return
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Booking selection (searchable), IDs auto-filled and hidden */}
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
                    {b.productName}
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
            {ownerBookings.length === 0 && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 mt-2">You have no bookings where you are the owner. Return sessions can only be created for your own items.</p>
            )}
          </div>

          {/* Hidden auto-filled identifiers */}
          <input type="hidden" name="productId" value={formData.productId} />
          <input type="hidden" name="renterId" value={formData.renterId} />
          <input type="hidden" name="ownerId" value={formData.ownerId} />

          {/* Return Type and Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="returnType" className="block text-sm font-medium text-gray-700 mb-2">
                Return Type *
              </label>
              <select
                id="returnType"
                name="returnType"
                value={formData.returnType}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Linked Handover Session *
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              value={formData.handoverSessionId}
              onChange={(e) => setFormData(prev => ({ ...prev, handoverSessionId: e.target.value }))}
              disabled={loading || !formData.bookingId || handoverOptions.length === 0}
              required
            >
              <option value="">{handoverOptions.length ? 'Select handover session' : 'No handover sessions for this booking'}</option>
              {handoverOptions.map((s:any) => (
                <option key={s.id} value={s.id}>
                  {s.status} • {new Date(s.updatedAt || s.createdAt).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* Location Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Return Location</h3>
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
                <label htmlFor="returnLocation.address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  id="returnLocation.address"
                name="location.address"
                value={formData.location.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Enter return address"
                  disabled={loading}
                  required
                />
              </div>
              <div>
                <label htmlFor="returnLocation.city" className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  id="returnLocation.city"
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
              <label htmlFor="returnLocation.country" className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                id="returnLocation.country"
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
            <label htmlFor="returnNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Return Notes
            </label>
            <textarea
              id="returnNotes"
              name="returnNotes"
              value={formData.returnNotes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Add any additional notes for the return..."
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
              disabled={loading}
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
                  Create Return Session
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </ErrorBoundary>
  );
};

export default ReturnSessionForm;
