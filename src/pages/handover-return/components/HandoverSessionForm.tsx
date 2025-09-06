// Handover Session Form Component
// Following the same patterns as RiskAssessmentForm.tsx

import React, { useState } from 'react';
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
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="bookingId" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Booking ID *
              </label>
              <input
                type="text"
                id="bookingId"
                name="bookingId"
                value={formData.bookingId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter booking UUID"
                disabled={loading}
                required
              />
            </div>
            <div>
              <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="w-4 h-4 inline mr-2" />
                Product ID *
              </label>
              <input
                type="text"
                id="productId"
                name="productId"
                value={formData.productId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter product UUID"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="renterId" className="block text-sm font-medium text-gray-700 mb-2">
                Renter ID *
              </label>
              <input
                type="text"
                id="renterId"
                name="renterId"
                value={formData.renterId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter renter UUID"
                disabled={loading}
                required
              />
            </div>
            <div>
              <label htmlFor="ownerId" className="block text-sm font-medium text-gray-700 mb-2">
                Owner ID *
              </label>
              <input
                type="text"
                id="ownerId"
                name="ownerId"
                value={formData.ownerId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter owner UUID"
                disabled={loading}
                required
              />
            </div>
          </div>

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
