import React, { useState, useEffect } from 'react';
import { X, Calendar, AlertCircle, CheckCircle, Clock, Ban, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';
import { useToast } from '../../../contexts/ToastContext';

interface RemoveFromMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productTitle?: string;
  onSuccess?: () => void;
}

interface DateStatus {
  date: string;
  status: 'available' | 'booked' | 'in_progress' | 'maintenance' | 'unavailable';
  bookingId?: string;
  bookingStatus?: string;
}

const RemoveFromMarketModal: React.FC<RemoveFromMarketModalProps> = ({
  isOpen,
  onClose,
  productId,
  productTitle,
  onSuccess
}) => {
  const { tSync } = useTranslation();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchingDates, setFetchingDates] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [dateStatuses, setDateStatuses] = useState<DateStatus[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // Fetch product availability and bookings
  useEffect(() => {
    if (!isOpen || !productId) return;

    const fetchDateStatuses = async () => {
      setFetchingDates(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError(tSync('Authentication required'));
          return;
        }

        // Fetch product availability
        const availabilityRes = await fetch(
          `${API_BASE_URL}/products/${productId}/availability?start_date=${getStartOfMonth(currentMonth).toISOString().split('T')[0]}&end_date=${getEndOfMonth(currentMonth).toISOString().split('T')[0]}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // Fetch bookings for the product
        const bookingsRes = await fetch(
          `${API_BASE_URL}/bookings?product_id=${productId}&status=confirmed,in_progress,pending`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const availabilityData = await availabilityRes.json();
        const bookingsData = await bookingsRes.json();

        // Handle different response formats for bookings
        let bookings: any[] = [];
        if (Array.isArray(bookingsData)) {
          bookings = bookingsData;
        } else if (bookingsData?.data && Array.isArray(bookingsData.data)) {
          bookings = bookingsData.data;
        } else if (bookingsData?.bookings && Array.isArray(bookingsData.bookings)) {
          bookings = bookingsData.bookings;
        }

        // Handle different response formats for availability
        let availability: any[] = [];
        if (Array.isArray(availabilityData)) {
          availability = availabilityData;
        } else if (availabilityData?.data && Array.isArray(availabilityData.data)) {
          availability = availabilityData.data;
        } else if (availabilityData?.availability && Array.isArray(availabilityData.availability)) {
          availability = availabilityData.availability;
        }

        // Build date status map
        const statusMap = new Map<string, DateStatus>();

        // Process bookings
        if (Array.isArray(bookings)) {
          bookings.forEach((booking: any) => {
          const start = new Date(booking.start_date);
          const end = new Date(booking.end_date);
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const status = booking.status === 'in_progress' ? 'in_progress' : 'booked';
            statusMap.set(dateStr, {
              date: dateStr,
              status,
              bookingId: booking.id,
              bookingStatus: booking.status
            });
          }
          });
        }

        // Process availability records
        if (Array.isArray(availability)) {
          availability.forEach((avail: any) => {
          const dateStr = avail.date;
          if (dateStr) {
            const existing = statusMap.get(dateStr);
            if (!existing) {
              statusMap.set(dateStr, {
                date: dateStr,
                status: avail.availability_type === 'maintenance' ? 'maintenance' : 
                        avail.availability_type === 'unavailable' ? 'unavailable' : 'available'
              });
            }
          }
          });
        }

        // Generate all dates for current month
        const allDates: DateStatus[] = [];
        const start = getStartOfMonth(currentMonth);
        const end = getEndOfMonth(currentMonth);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          const dateObj = new Date(d);
          dateObj.setHours(0, 0, 0, 0);

          if (dateObj < today) continue; // Skip past dates

          const existing = statusMap.get(dateStr);
          if (existing) {
            allDates.push(existing);
          } else {
            allDates.push({
              date: dateStr,
              status: 'available'
            });
          }
        }

        setDateStatuses(allDates);
      } catch (err: any) {
        console.error('Error fetching date statuses:', err);
        setError(err.message || tSync('Failed to load availability data'));
      } finally {
        setFetchingDates(false);
      }
    };

    fetchDateStatuses();
  }, [isOpen, productId, currentMonth, tSync]);

  const getStartOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getEndOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  const isPastDate = (dateStr: string): boolean => {
    const dateObj = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);
    return dateObj < today;
  };

  const handleDateClick = (dateStr: string, status: string) => {
    // Prevent selecting past dates
    if (isPastDate(dateStr)) {
      showToast(tSync('Cannot select past dates'), 'warning');
      return;
    }

    // Only allow selection of available or unavailable dates
    if (status === 'available' || status === 'unavailable') {
      setSelectedDates(prev => {
        const newSet = new Set(prev);
        if (newSet.has(dateStr)) {
          newSet.delete(dateStr);
        } else {
          newSet.add(dateStr);
        }
        return newSet;
      });
    }
  };

  const handleRemoveFromMarket = async () => {
    if (selectedDates.size === 0) {
      showToast(tSync('Please select at least one date'), 'warning');
      return;
    }

    // Filter out past dates before submission
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const validDates = Array.from(selectedDates).filter(dateStr => {
      const dateObj = new Date(dateStr);
      dateObj.setHours(0, 0, 0, 0);
      return dateObj >= today;
    });

    if (validDates.length === 0) {
      showToast(tSync('Please select at least one future date'), 'warning');
      return;
    }

    // Filter to only available dates (not unavailable ones)
    const availableDates = validDates.filter(dateStr => {
      const status = getDateStatus(dateStr);
      return status?.status === 'available';
    });

    if (availableDates.length === 0) {
      showToast(tSync('Please select available dates to remove'), 'warning');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError(tSync('Authentication required'));
        return;
      }

      const datesArray = availableDates;
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/remove-from-market`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            dates: datesArray,
            reason: 'owner_removed'
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || tSync('Failed to remove product from market'));
      }

      showToast(tSync('Product removed from market for selected dates'), 'success');
      setSelectedDates(new Set());
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error removing from market:', err);
      setError(err.message || tSync('Failed to remove product from market'));
      showToast(err.message || tSync('Failed to remove product from market'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreToMarket = async () => {
    if (selectedDates.size === 0) {
      showToast(tSync('Please select at least one date'), 'warning');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError(tSync('Authentication required'));
        return;
      }

      const datesArray = Array.from(selectedDates);
      const response = await fetch(
        `${API_BASE_URL}/products/${productId}/restore-to-market`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            dates: datesArray
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || tSync('Failed to restore product to market'));
      }

      showToast(tSync('Product restored to market for selected dates'), 'success');
      setSelectedDates(new Set());
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error restoring to market:', err);
      setError(err.message || tSync('Failed to restore product to market'));
      showToast(err.message || tSync('Failed to restore product to market'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const getDateStatus = (dateStr: string): DateStatus | null => {
    return dateStatuses.find(d => d.date === dateStr) || null;
  };

  const getDateClassName = (dateStr: string, status: string): string => {
    const baseClasses = 'w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all cursor-pointer';
    const isSelected = selectedDates.has(dateStr);
    const dateObj = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = dateObj < today;

    if (isPast) {
      return `${baseClasses} bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600`;
    }

    if (status === 'booked' || status === 'in_progress') {
      return `${baseClasses} bg-red-100 text-red-700 cursor-not-allowed dark:bg-red-900/30 dark:text-red-400`;
    }

    if (status === 'maintenance') {
      return `${baseClasses} bg-yellow-100 text-yellow-700 cursor-not-allowed dark:bg-yellow-900/30 dark:text-yellow-400`;
    }

    if (status === 'unavailable') {
      return `${baseClasses} ${isSelected ? 'bg-orange-600 text-white ring-2 ring-orange-300' : 'bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50'}`;
    }

    // available
    return `${baseClasses} ${isSelected ? 'bg-teal-600 text-white ring-2 ring-teal-300' : 'bg-gray-50 text-gray-700 hover:bg-teal-50 hover:text-teal-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-teal-900/30'}`;
  };

  const renderCalendar = () => {
    const startDate = getStartOfMonth(currentMonth);
    const endDate = getEndOfMonth(currentMonth);
    const daysInMonth = endDate.getDate();
    const firstDayOfWeek = startDate.getDay();
    const days: (DateStatus | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const status = getDateStatus(dateStr);
      days.push(status || { date: dateStr, status: 'available' });
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-slate-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="w-10 h-10" />;
            }

            const status = day.status;
            const isPast = isPastDate(day.date);
            const isDisabled = isPast || status === 'booked' || status === 'in_progress' || status === 'maintenance';
            
            return (
              <button
                key={day.date}
                onClick={() => handleDateClick(day.date, status)}
                className={getDateClassName(day.date, status)}
                disabled={isDisabled}
                title={
                  isPast ? tSync('Past date - Cannot select') :
                  status === 'booked' ? tSync('Booked - Cannot remove') :
                  status === 'in_progress' ? tSync('In Progress - Cannot remove') :
                  status === 'maintenance' ? tSync('Maintenance - Cannot remove') :
                  status === 'unavailable' ? tSync('Currently removed from market - Click to restore') :
                  tSync('Available - Click to remove from market')
                }
              >
                {new Date(day.date).getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const getSelectedDatesInfo = () => {
    const availableDates = Array.from(selectedDates).filter(date => {
      const status = getDateStatus(date);
      return status?.status === 'available';
    });

    const unavailableDates = Array.from(selectedDates).filter(date => {
      const status = getDateStatus(date);
      return status?.status === 'unavailable';
    });

    return { availableDates, unavailableDates };
  };

  if (!isOpen) return null;

  const { availableDates, unavailableDates } = getSelectedDatesInfo();
  const canRemove = availableDates.length > 0;
  const canRestore = unavailableDates.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
              <TranslatedText text="Remove from Market" />
            </h2>
            {productTitle && (
              <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{productTitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 dark:bg-red-900/20 dark:border-red-800">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Info Banner */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3 dark:bg-blue-900/20 dark:border-blue-800">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1"><TranslatedText text="How it works" /></p>
              <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-400">
                <li><TranslatedText text="Select available dates to remove your product from the market" /></li>
                <li><TranslatedText text="Past dates cannot be selected or removed" /></li>
                <li><TranslatedText text="Dates with bookings or in-progress sessions cannot be removed" /></li>
                <li><TranslatedText text="You can restore removed dates back to market anytime" /></li>
                <li><TranslatedText text="Past unavailable dates are automatically restored" /></li>
              </ul>
            </div>
          </div>

          {/* Legend */}
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-gray-50 border border-gray-200 dark:bg-slate-800 dark:border-slate-700"></div>
              <span className="text-gray-700 dark:text-slate-300"><TranslatedText text="Available" /></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900/30"></div>
              <span className="text-gray-700 dark:text-slate-300"><TranslatedText text="Booked" /></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900/30"></div>
              <span className="text-gray-700 dark:text-slate-300"><TranslatedText text="Maintenance" /></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-orange-100 dark:bg-orange-900/30"></div>
              <span className="text-gray-700 dark:text-slate-300"><TranslatedText text="Removed" /></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-4 rounded bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-600"></div>
              <span className="text-gray-500 dark:text-slate-500"><TranslatedText text="Past Date" /></span>
            </div>
          </div>

          {/* Calendar */}
          {fetchingDates ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <span className="ml-3 text-gray-600 dark:text-slate-400"><TranslatedText text="Loading availability..." /></span>
            </div>
          ) : (
            renderCalendar()
          )}

          {/* Selected Dates Summary */}
          {selectedDates.size > 0 && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-slate-100 mb-2">
                <TranslatedText text="Selected Dates" /> ({selectedDates.size})
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.from(selectedDates)
                  .sort()
                  .slice(0, 10)
                  .map(date => (
                    <span
                      key={date}
                      className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs dark:bg-teal-900/30 dark:text-teal-400"
                    >
                      {new Date(date).toLocaleDateString()}
                    </span>
                  ))}
                {selectedDates.size > 10 && (
                  <span className="px-2 py-1 text-gray-600 dark:text-slate-400 text-xs">
                    +{selectedDates.size - 10} <TranslatedText text="more" />
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <TranslatedText text="Cancel" />
          </button>
          <div className="flex gap-3">
            {canRestore && (
              <button
                onClick={handleRestoreToMarket}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <TranslatedText text="Restore to Market" /> ({unavailableDates.length})
              </button>
            )}
            {canRemove && (
              <button
                onClick={handleRemoveFromMarket}
                disabled={loading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Ban className="w-4 h-4" />
                <TranslatedText text="Remove from Market" /> ({availableDates.length})
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveFromMarketModal;

