/**
 * Delivery Tracking Component
 * 
 * Displays real-time delivery tracking information including:
 * - Current delivery status
 * - GPS location (if available)
 * - ETA
 * - Tracking updates timeline
 */

import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Package, CheckCircle, XCircle, AlertCircle, Navigation } from 'lucide-react';
import { getDeliveryTracking, updateDeliveryStatus } from '../../pages/booking-page/service/api';
import { useTranslation } from '../../hooks/useTranslation';
import { TranslatedText } from '../translated-text';
import type { DeliveryTracking as DeliveryTrackingType } from '../../pages/booking-page/service/api';

interface DeliveryTrackingProps {
  bookingId: string;
  isOwner?: boolean;
  onStatusUpdate?: (status: string) => void;
}

const DeliveryTracking: React.FC<DeliveryTrackingProps> = ({ 
  bookingId, 
  isOwner = false,
  onStatusUpdate 
}) => {
  const { tSync } = useTranslation();
  const [tracking, setTracking] = useState<DeliveryTrackingType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || '';
        if (!token) {
          setError('Authentication required');
          return;
        }

        const result = await getDeliveryTracking(bookingId, token);
        if (result.success && result.data) {
          setTracking(result.data);
          if (onStatusUpdate) {
            onStatusUpdate(result.data.status);
          }
        } else {
          setError(result.error || 'Failed to load tracking information');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load tracking information');
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchTracking, 30000);
    return () => clearInterval(interval);
  }, [bookingId, onStatusUpdate]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!isOwner) return; // Only owners can update status
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('token') || '';
      const result = await updateDeliveryStatus(
        bookingId,
        { status: newStatus as any },
        token
      );

      if (result.success && result.data) {
        setTracking(result.data);
        if (onStatusUpdate) {
          onStatusUpdate(result.data.status);
        }
      }
    } catch (err: any) {
      console.error('Error updating delivery status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'out_for_delivery':
      case 'in_transit':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-teal-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'out_for_delivery':
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'confirmed':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-gray-600 dark:text-slate-400">
            <TranslatedText text="Loading tracking information..." />
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-red-200 dark:border-red-900/30">
        <div className="flex items-center text-red-600 dark:text-red-400">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!tracking) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 space-y-6">
      {/* Current Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon(tracking.status)}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              <TranslatedText text="Delivery Status" />
            </h3>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-1 ${getStatusColor(tracking.status)}`}>
              {formatStatus(tracking.status)}
            </span>
          </div>
        </div>
        
        {isOwner && (
          <select
            value={tracking.status}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            disabled={updating}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 text-sm"
          >
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        )}
      </div>

      {/* ETA */}
      {tracking.eta && (
        <div className="flex items-center gap-3 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
          <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <div>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              <TranslatedText text="Estimated Arrival" />
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {new Date(tracking.eta).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Tracking Number */}
      {tracking.trackingNumber && (
        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
          <Package className="w-5 h-5 text-gray-600 dark:text-slate-400" />
          <div>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              <TranslatedText text="Tracking Number" />
            </p>
            <p className="font-mono font-semibold text-gray-900 dark:text-white">
              {tracking.trackingNumber}
            </p>
          </div>
        </div>
      )}

      {/* Driver Contact */}
      {tracking.driverContact && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Navigation className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              <TranslatedText text="Driver Contact" />
            </p>
            <a 
              href={`tel:${tracking.driverContact}`}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {tracking.driverContact}
            </a>
          </div>
        </div>
      )}

      {/* Current Location */}
      {tracking.currentLocation && (
        <div className="p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
              <TranslatedText text="Current Location" />
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            {tracking.currentLocation.lat.toFixed(6)}, {tracking.currentLocation.lng.toFixed(6)}
          </p>
          <a
            href={`https://www.google.com/maps?q=${tracking.currentLocation.lat},${tracking.currentLocation.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 dark:text-teal-400 hover:underline text-sm mt-1 inline-block"
          >
            <TranslatedText text="View on Map" />
          </a>
        </div>
      )}

      {/* Updates Timeline */}
      {tracking.updates && tracking.updates.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
            <TranslatedText text="Tracking Updates" />
          </h4>
          <div className="space-y-3">
            {tracking.updates.map((update, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
              >
                <div className="mt-1">
                  {getStatusIcon(update.status)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${getStatusColor(update.status)} px-2 py-1 rounded`}>
                      {formatStatus(update.status)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {new Date(update.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {update.notes && (
                    <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                      {update.notes}
                    </p>
                  )}
                  {update.location && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      {update.location.lat.toFixed(4)}, {update.location.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryTracking;

