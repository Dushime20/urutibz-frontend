import React, { useState, useEffect } from 'react';
import { Upload, X, MapPin, Calendar, CheckCircle, AlertCircle, User, FileText } from 'lucide-react';
import { ItemCondition, GPSLocation, ConditionAssessment, OwnerPreInspectionData, InspectionType } from '../../types/inspection';
import { getMyProducts, fetchUserBookings, getProductById } from '../../pages/my-account/service/api';
import { inspectionService, inspectorService } from '../../services/inspectionService';
import type { Inspector } from '../../types/inspection';

interface OwnerPreInspectionFormCombinedProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialInspectionData?: {
    productId?: string;
    bookingId?: string;
    inspectionType?: InspectionType;
  };
}

const OwnerPreInspectionFormCombined: React.FC<OwnerPreInspectionFormCombinedProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialInspectionData
}) => {
  // Step 1: Inspection Creation Fields
  const [productId, setProductId] = useState<string>(initialInspectionData?.productId || '');
  const [bookingId, setBookingId] = useState<string>(initialInspectionData?.bookingId || '');
  const [selectedBooking, setSelectedBooking] = useState<any>(null); // Store selected booking data
  const [inspectionType, setInspectionType] = useState<InspectionType>(initialInspectionData?.inspectionType || InspectionType.PRE_RENTAL);
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [locationText, setLocationText] = useState<string>('');
  const [inspectorId, setInspectorId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Step 2: Pre-Inspection Data Fields
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [overallCondition, setOverallCondition] = useState<ItemCondition>(ItemCondition.GOOD);
  const [items, setItems] = useState<ConditionAssessment['items']>([]);
  const [accessories, setAccessories] = useState<ConditionAssessment['accessories']>([]);
  const [knownIssues, setKnownIssues] = useState<string[]>([]);
  const [newIssue, setNewIssue] = useState('');
  const [maintenanceHistory, setMaintenanceHistory] = useState('');
  const [preInspectionNotes, setPreInspectionNotes] = useState('');
  const [gpsLocation, setGpsLocation] = useState<GPSLocation | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorGuidance, setErrorGuidance] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1); // 1: Create Inspection, 2: Pre-Inspection Data

  // Autocomplete states
  const [productQuery, setProductQuery] = useState('');
  const [bookingQuery, setBookingQuery] = useState('');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [showProductOptions, setShowProductOptions] = useState(false);
  const [showBookingOptions, setShowBookingOptions] = useState(false);
  const [loadingInspectors, setLoadingInspectors] = useState(false);

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadProducts();
      loadBookings();
      loadInspectors();
      // Reset form
      resetForm();
    }
  }, [isOpen]);

  // Helper function to format date in human-readable format
  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Helper function to format date for datetime-local input
  const formatDateForInput = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Helper function to parse backend errors and provide guidance
  const parseErrorAndProvideGuidance = (errorMessage: string): { error: string; guidance: string | null } => {
    const now = new Date();
    const booking = selectedBooking || allBookings.find((b: any) => String(b.id) === bookingId);
    
    if (!booking) {
      return { error: errorMessage, guidance: null };
    }

    const bookingStartDate = booking.start_date || booking.startDate || booking.rental_start_date;
    const bookingEndDate = booking.end_date || booking.endDate || booking.rental_end_date;

    // Check for date-related errors
    if (errorMessage.includes('cannot be scheduled in the past') || 
        errorMessage.includes('scheduled in the past')) {
      // Pre-rental: scheduledAt must be >= now
      if (inspectionType === InspectionType.PRE_RENTAL) {
        const minDate = now;
        const maxDate = bookingStartDate ? new Date(bookingStartDate) : null;
        
        if (maxDate && maxDate < minDate) {
          // Booking has already started
          return {
            error: errorMessage,
            guidance: `⚠️ This booking has already started. The booking start date (${formatDate(bookingStartDate)}) is in the past. Pre-rental inspections can only be scheduled for future bookings. Please select a different booking.`
          };
        } else if (maxDate) {
          // Valid range exists
          return {
            error: errorMessage,
            guidance: `📅 Valid date range: ${formatDate(minDate)} to ${formatDate(maxDate)}. Please select a date within this range.`
          };
        } else {
          return {
            error: errorMessage,
            guidance: `📅 Please select a date on or after ${formatDate(minDate)}.`
          };
        }
      }
    }

    if (errorMessage.includes('must be before rental start date') || 
        errorMessage.includes('before rental start date')) {
      // Pre-rental: scheduledAt must be <= startDate
      if (inspectionType === InspectionType.PRE_RENTAL && bookingStartDate) {
        const maxDate = new Date(bookingStartDate);
        const minDate = now;
        
        if (maxDate < minDate) {
          // Booking has already started
          return {
            error: errorMessage,
            guidance: `⚠️ This booking has already started. The booking start date (${formatDate(bookingStartDate)}) is in the past. Pre-rental inspections can only be scheduled for future bookings. Please select a different booking.`
          };
        } else {
          // Valid range exists
          return {
            error: errorMessage,
            guidance: `📅 Valid date range: ${formatDate(minDate)} to ${formatDate(maxDate)}. Please select a date within this range.`
          };
        }
      }
    }

    if (errorMessage.includes('cannot be scheduled before rental end date') || 
        errorMessage.includes('before rental end date')) {
      // Post-return: scheduledAt must be >= endDate
      if (inspectionType === InspectionType.POST_RETURN && bookingEndDate) {
        const minDate = new Date(bookingEndDate);
        return {
          error: errorMessage,
          guidance: `📅 Please select a date on or after ${formatDate(minDate)} (the rental end date).`
        };
      }
    }

    // Default: return error without guidance
    return { error: errorMessage, guidance: null };
  };

  const resetForm = () => {
    setProductId(initialInspectionData?.productId || '');
    setBookingId(initialInspectionData?.bookingId || '');
    setSelectedBooking(null);
    setInspectionType(initialInspectionData?.inspectionType || InspectionType.PRE_RENTAL);
    setScheduledAt('');
    setLocationText('');
    setInspectorId('');
    setNotes('');
    setPhotos([]);
    setPhotoPreviews([]);
    setOverallCondition(ItemCondition.GOOD);
    setItems([]);
    setAccessories([]);
    setKnownIssues([]);
    setNewIssue('');
    setMaintenanceHistory('');
    setPreInspectionNotes('');
    setGpsLocation(null);
    setConfirmed(false);
    setStep(1);
    setError(null);
    setErrorGuidance(null);
  };

  const loadProducts = async () => {
    try {
      const products = await getMyProducts();
      const normalized = Array.isArray(products) ? products : (products?.data || products?.items || []);
      setAllProducts(normalized);
    } catch {
      setAllProducts([]);
    }
  };

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetchUserBookings(token || undefined);
      const bookings = (res?.data || []) as any[];
      // Filter only confirmed bookings (pre-inspection only on confirmed bookings)
      const confirmedBookings = bookings.filter((b: any) => {
        const status = b.status || b.booking_status || '';
        return status.toLowerCase() === 'confirmed';
      });
      const enriched = await Promise.all(confirmedBookings.map(async (b: any) => {
        try {
          const pid = b.product_id || b.productId;
          if (pid) {
            const prod = await getProductById(pid);
            return { ...b, product: prod };
          }
        } catch {}
        return b;
      }));
      setAllBookings(enriched);
    } catch {
      setAllBookings([]);
    }
  };

  const loadInspectors = async () => {
    try {
      setLoadingInspectors(true);
      const byRole = await inspectorService.getInspectors('inspector');
      let normalized: Inspector[] = Array.isArray(byRole as any)
        ? byRole
        : ((byRole as any)?.inspectors ?? (byRole as any)?.data ?? (byRole as any)?.items ?? []);

      if (!Array.isArray(normalized) || normalized.length === 0) {
        const all = await inspectorService.getInspectors();
        normalized = Array.isArray(all as any)
          ? all
          : ((all as any)?.inspectors ?? (all as any)?.data ?? (all as any)?.items ?? []);
      }

      setInspectors(Array.isArray(normalized) ? normalized : []);
    } catch (error) {
      console.error('Error loading inspectors:', error);
      setInspectors([]);
    } finally {
      setLoadingInspectors(false);
    }
  };

  // Photo handlers
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentTotal = photos.length + photoPreviews.length;
    
    if (files.length + currentTotal > 20) {
      setError('Maximum 20 photos allowed');
      setErrorGuidance(null);
      e.target.value = ''; // Reset input
      return;
    }

    const newPhotos = files.filter(file => file.type.startsWith('image/'));
    
    if (newPhotos.length === 0) {
      setError('Please select valid image files');
      setErrorGuidance(null);
      e.target.value = ''; // Reset input
      return;
    }

    // Add photos to state immediately
    setPhotos(prev => [...prev, ...newPhotos]);
    setError(null); // Clear any previous errors

    // Note: We don't need to create photoPreviews for newly selected files
    // photoPreviews should only be used for already uploaded photos (URLs from server)
    // New files are displayed using URL.createObjectURL directly

    // Reset input to allow selecting same file again
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    // If removing from photos array (File objects - newly selected)
    if (index < photos.length) {
      setPhotos(photos.filter((_, i) => i !== index));
      // Don't remove from photoPreviews - those are for already uploaded photos (URLs)
    } else {
      // If removing from photoPreviews array (URLs from server - already uploaded)
      const previewIndex = index - photos.length;
      setPhotoPreviews(photoPreviews.filter((_, i) => i !== previewIndex));
    }
  };

  // Item handlers
  const addItem = () => {
    setItems([...items, {
      itemName: '',
      condition: ItemCondition.GOOD,
      description: '',
      photos: []
    }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Accessory handlers
  const addAccessory = () => {
    setAccessories([...accessories, {
      name: '',
      included: true,
      condition: ItemCondition.GOOD
    }]);
  };

  const updateAccessory = (index: number, field: string, value: any) => {
    const updated = [...accessories];
    updated[index] = { ...updated[index], [field]: value };
    setAccessories(updated);
  };

  const removeAccessory = (index: number) => {
    setAccessories(accessories.filter((_, i) => i !== index));
  };

  // Issue handlers
  const addIssue = () => {
    if (newIssue.trim()) {
      setKnownIssues([...knownIssues, newIssue.trim()]);
      setNewIssue('');
    }
  };

  const removeIssue = (index: number) => {
    setKnownIssues(knownIssues.filter((_, i) => i !== index));
  };

  // GPS Location handler
  const getCurrentLocation = (e?: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent form submission if button is clicked
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setErrorGuidance(null);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString()
        });
        setLoading(false);
        setError(null);
      setErrorGuidance(null); // Clear any previous errors
      },
      (error) => {
        setError(`Failed to get location: ${error.message}`);
        setErrorGuidance(null);
        setLoading(false);
      }
    );
  };

  // Step 1: Validate and create inspection
  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation - Booking is required for pre-inspection
    if (!bookingId) {
      setError('Please select a confirmed booking (pre-inspection can only be done on confirmed bookings)');
      setErrorGuidance(null);
      return;
    }

    if (!scheduledAt) {
      setError('Please select a scheduled date and time');
      setErrorGuidance(null);
      return;
    }

    // Let backend validate the date - we'll show backend errors if there are conflicts
    // Removed frontend date validation to allow users to select any date

    if (!locationText.trim()) {
      setError('Please enter a location');
      setErrorGuidance(null);
      return;
    }

    try {
      setLoading(true);
      // Create inspection - Get productId from selected booking (booking is required)
      const selectedBooking = allBookings.find((b: any) => String(b.id) === bookingId);
      const finalProductId = selectedBooking?.product_id || selectedBooking?.productId || selectedBooking?.product?.id || productId;
      
      const inspectionData = {
        mode: 'owner' as const,
        productId: finalProductId || undefined, // Auto-populated from booking
        bookingId: bookingId, // Required
        inspectorId: inspectorId || undefined, // Optional
        inspectionType,
        scheduledAt,
        location: locationText,
        notes: notes || undefined
      };

      const createdInspection = await inspectionService.createInspection(inspectionData as any);
      
      // Move to step 2
      setStep(2);
      setError(null);
      setErrorGuidance(null);
    } catch (err: any) {
      // Extract backend error message
      const errorMessage = err?.response?.data?.message 
        || err?.response?.data?.error 
        || err?.message 
        || 'Failed to create inspection';
      
      // Parse error and provide guidance
      const { error, guidance } = parseErrorAndProvideGuidance(errorMessage);
      setError(error);
      setErrorGuidance(guidance);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit pre-inspection data
  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation - Minimum 2 photos (some products can't have 10 without repetition)
    if (photos.length + photoPreviews.length < 2) {
      setError('Please upload at least 2 photos');
      setErrorGuidance(null);
      return;
    }

    if (!gpsLocation) {
      setError('Please capture GPS location');
      setErrorGuidance(null);
      return;
    }

    if (!confirmed) {
      setError('Please confirm that the information is accurate');
      setErrorGuidance(null);
      return;
    }

    // Get the created inspection ID from step 1
    // In a real implementation, we'd store this after step 1
    // For now, we'll need to get it from the last created inspection
    // This is a limitation - we should store inspectionId after step 1
    
    try {
      setLoading(true);
      
      const condition: ConditionAssessment = {
        overallCondition,
        items: items.filter(item => item.itemName.trim() !== ''),
        accessories: accessories.filter(acc => acc.name.trim() !== ''),
        knownIssues,
        maintenanceHistory: maintenanceHistory || undefined
      };

      const preInspectionData: OwnerPreInspectionData = {
        photos: photos, // Only File objects - photoPreviews are just for UI display
        condition,
        notes: preInspectionNotes,
        location: gpsLocation,
        timestamp: new Date().toISOString(),
        confirmed
      };

      // TODO: Get inspection ID from step 1
      // For now, we'll need to create inspection with pre-inspection data in one API call
      // Or store inspectionId after step 1
      
      // This is a workaround - we need to refactor to store inspectionId
      // For now, let's assume we can get it from the response in step 1
      
      setError('Inspection ID not available. Please refactor to store inspection ID after step 1.');
      setErrorGuidance(null);
      
    } catch (err: any) {
      setError(err?.message || 'Failed to submit pre-inspection');
      setErrorGuidance(null);
    } finally {
      setLoading(false);
    }
  };

  // Combined submit handler (creates inspection and submits pre-inspection in one call)
  const handleCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Step 1 validation - Booking is required for pre-inspection
    if (!bookingId) {
      setError('Please select a confirmed booking (pre-inspection can only be done on confirmed bookings)');
      setErrorGuidance(null);
      return;
    }

    if (!scheduledAt) {
      setError('Please select a scheduled date and time');
      setErrorGuidance(null);
      return;
    }

    // Let backend validate the date - we'll show backend errors if there are conflicts
    // Removed frontend date validation to allow users to select any date

    if (!locationText.trim()) {
      setError('Please enter a location');
      setErrorGuidance(null);
      return;
    }

    // Step 2 validation - Minimum 2 photos (some products can't have 10 without repetition)
    if (photos.length + photoPreviews.length < 2) {
      setError('Please upload at least 2 photos');
      setErrorGuidance(null);
      return;
    }

    if (!gpsLocation) {
      setError('Please capture GPS location');
      setErrorGuidance(null);
      return;
    }

    if (!confirmed) {
      setError('Please confirm that the information is accurate');
      setErrorGuidance(null);
      return;
    }

    try {
      setLoading(true);

      const condition: ConditionAssessment = {
        overallCondition,
        items: items.filter(item => item.itemName.trim() !== ''),
        accessories: accessories.filter(acc => acc.name.trim() !== ''),
        knownIssues,
        maintenanceHistory: maintenanceHistory || undefined
      };

      const preInspectionData: OwnerPreInspectionData = {
        photos: photos, // Only File objects - photoPreviews are just for UI display
        condition,
        notes: preInspectionNotes,
        location: gpsLocation,
        timestamp: new Date().toISOString(),
        confirmed
      };

      // Create inspection with pre-inspection data
      // Get productId from selected booking (booking is required)
      const selectedBooking = allBookings.find((b: any) => String(b.id) === bookingId);
      const finalProductId = selectedBooking?.product_id || selectedBooking?.productId || selectedBooking?.product?.id || productId;
      
      const inspectionData = {
        mode: 'owner' as const,
        productId: finalProductId || undefined, // Auto-populated from booking
        bookingId: bookingId, // Required
        inspectorId: inspectorId || undefined,
        inspectionType,
        scheduledAt,
        location: locationText,
        notes: notes || undefined,
        ownerPreInspectionData: preInspectionData
      };

      await inspectionService.createInspection(inspectionData as any);
      
      // Success
      resetForm();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      // Extract backend error message
      const errorMessage = err?.response?.data?.message 
        || err?.response?.data?.error 
        || err?.message 
        || 'Failed to create inspection with pre-inspection data';
      
      // Parse error and provide guidance
      const { error, guidance } = parseErrorAndProvideGuidance(errorMessage);
      setError(error);
      setErrorGuidance(guidance);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500/60 dark:bg-black/60 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-lg bg-white dark:bg-slate-900 text-left shadow-xl transition-all border border-gray-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gray-50 dark:bg-slate-900 px-4 py-3 sm:px-6 border-b border-gray-200 dark:border-slate-700 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">
                  Create Pre-Inspection
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                  Provide inspection details and product condition data
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-md bg-white dark:bg-slate-900 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleCompleteSubmit} className="px-4 py-5 sm:p-6">
            {error && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
                </div>
                {errorGuidance && (
                  <div className="ml-8 mt-2">
                    <p className="text-sm text-red-700 dark:text-red-300">{errorGuidance}</p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-6">
              {/* Step 1: Inspection Details */}
              <div className="border-b border-gray-200 dark:border-slate-700 pb-6">
                <h4 className="text-md font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Inspection Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Product <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={productQuery}
                        onChange={(e) => {
                          setProductQuery(e.target.value);
                          setShowProductOptions(true);
                          setProductId('');
                        }}
                        onFocus={() => setShowProductOptions(true)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
                        placeholder="Search product by name"
                      />
                      {showProductOptions && (
                        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white dark:bg-slate-900 py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-slate-700">
                          {allProducts
                            .filter((p: any) => (p.title || p.name || '').toLowerCase().includes(productQuery.toLowerCase()))
                            .slice(0, 20)
                            .map((p: any) => (
                              <li
                                key={p.id}
                                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setProductQuery(p.title || p.name || `Product ${p.id.slice(0,8)}`);
                                  setProductId(String(p.id));
                                  setShowProductOptions(false);
                                }}
                              >
                                <div className="font-medium text-gray-900 dark:text-slate-100">{p.title || p.name}</div>
                                <div className="text-xs text-gray-500 dark:text-slate-400">ID: {p.id}</div>
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Booking ID - Required (Pre-inspection only on confirmed bookings) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Booking <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 dark:text-slate-400 ml-2">(Confirmed bookings only)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={bookingQuery}
                        onChange={(e) => {
                          setBookingQuery(e.target.value);
                          setShowBookingOptions(true);
                          setBookingId('');
                        }}
                        onFocus={() => setShowBookingOptions(true)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
                        placeholder="Search booking by reference"
                      />
                      {showBookingOptions && (
                        <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white dark:bg-slate-900 py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-slate-700">
                          {allBookings
                            .filter((b: any) => {
                              const match = (b.reference || b.code || b.bookingCode || '').toLowerCase().includes(bookingQuery.toLowerCase());
                              const productTitle = (bookingQuery || '').toLowerCase();
                              const productName = (b.product?.title || b.product?.name || '').toLowerCase();
                              return match || (productTitle && productName.includes(productTitle));
                            })
                            .slice(0, 20)
                            .map((b: any) => (
                              <li
                                key={b.id}
                                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const productLabel = b.product?.title || b.product?.name || '';
                                  const refLabel = b.reference || b.code || b.bookingCode || `Booking ${String(b.id).slice(0,8)}`;
                                  const label = productLabel ? `${productLabel} (${refLabel})` : refLabel;
                                  setBookingQuery(label);
                                  setBookingId(String(b.id));
                                  // Store selected booking data for date validation
                                  setSelectedBooking(b);
                                  // Auto-populate productId from booking
                                  const pid = b.product_id || b.productId || b.product?.id;
                                  if (pid) {
                                    setProductId(String(pid));
                                  }
                                  // Auto-populate scheduled date based on inspection type and booking dates
                                  const now = new Date();
                                  const bookingStartDate = b.start_date || b.startDate || b.rental_start_date;
                                  const bookingEndDate = b.end_date || b.endDate || b.rental_end_date;
                                  
                                  if (inspectionType === InspectionType.PRE_RENTAL) {
                                    // Pre-rental: default to booking start date (or now if booking start is in past)
                                    if (bookingStartDate) {
                                      const startDate = new Date(bookingStartDate);
                                      // Use booking start date if it's in the future, otherwise use now
                                      const defaultDate = startDate > now ? startDate : now;
                                      // Set to start of day for better date selection
                                      defaultDate.setHours(12, 0, 0, 0); // Set to noon for better UX
                                      setScheduledAt(defaultDate.toISOString().slice(0, 16));
                                    } else {
                                      // No booking start date, use now (noon)
                                      const defaultDate = new Date(now);
                                      defaultDate.setHours(12, 0, 0, 0);
                                      setScheduledAt(defaultDate.toISOString().slice(0, 16));
                                    }
                                  } else if (inspectionType === InspectionType.POST_RENTAL) {
                                    // Post-return: default to booking end date (or now if booking end is in past)
                                    if (bookingEndDate) {
                                      const endDate = new Date(bookingEndDate);
                                      // Use booking end date if it's in the future, otherwise use now
                                      const defaultDate = endDate > now ? endDate : now;
                                      // Set to start of day for better date selection
                                      defaultDate.setHours(12, 0, 0, 0); // Set to noon for better UX
                                      setScheduledAt(defaultDate.toISOString().slice(0, 16));
                                    } else {
                                      // No booking end date, use now (noon)
                                      const defaultDate = new Date(now);
                                      defaultDate.setHours(12, 0, 0, 0);
                                      setScheduledAt(defaultDate.toISOString().slice(0, 16));
                                    }
                                  } else {
                                    // Other inspection types: use now (noon)
                                    const defaultDate = new Date(now);
                                    defaultDate.setHours(12, 0, 0, 0);
                                    setScheduledAt(defaultDate.toISOString().slice(0, 16));
                                  }
                                  setShowBookingOptions(false);
                                }}
                              >
                                <div className="font-medium text-gray-900 dark:text-slate-100">{b.product?.title || b.product?.name || 'Booking'}</div>
                                <div className="text-xs text-gray-500 dark:text-slate-400">{b.reference || b.code || b.bookingCode || ''}</div>
                              </li>
                            ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Inspection Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Inspection Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={inspectionType}
                      onChange={(e) => {
                        const newType = e.target.value as InspectionType;
                        setInspectionType(newType);
                        // Auto-update scheduled date based on new inspection type and booking dates
                        if (selectedBooking) {
                          const now = new Date();
                          const bookingStartDate = selectedBooking.start_date || selectedBooking.startDate || selectedBooking.rental_start_date;
                          const bookingEndDate = selectedBooking.end_date || selectedBooking.endDate || selectedBooking.rental_end_date;
                          
                          if (newType === InspectionType.PRE_RENTAL) {
                            // Pre-rental: default to booking start date (or now if booking start is in past)
                            if (bookingStartDate) {
                              const startDate = new Date(bookingStartDate);
                              const defaultDate = startDate > now ? startDate : now;
                              setScheduledAt(defaultDate.toISOString().slice(0, 16));
                            } else {
                              setScheduledAt(now.toISOString().slice(0, 16));
                            }
                          } else if (newType === InspectionType.POST_RENTAL) {
                            // Post-return: default to booking end date (or now if booking end is in past)
                            if (bookingEndDate) {
                              const endDate = new Date(bookingEndDate);
                              const defaultDate = endDate > now ? endDate : now;
                              setScheduledAt(defaultDate.toISOString().slice(0, 16));
                            } else {
                              setScheduledAt(now.toISOString().slice(0, 16));
                            }
                          } else {
                            // Other inspection types: use now
                            setScheduledAt(now.toISOString().slice(0, 16));
                          }
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value={InspectionType.PRE_RENTAL}>Pre-Rental</option>
                      <option value={InspectionType.POST_RENTAL}>Post-Rental</option>
                      <option value={InspectionType.DAMAGE_ASSESSMENT}>Damage Assessment</option>
                      <option value={InspectionType.QUALITY_VERIFICATION}>Quality Verification</option>
                    </select>
                  </div>

                  {/* Scheduled Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Scheduled Date & Time <span className="text-red-500">*</span>
                      {selectedBooking && (() => {
                        const now = new Date();
                        const bookingStartDate = selectedBooking.start_date || selectedBooking.startDate || selectedBooking.rental_start_date;
                        const bookingEndDate = selectedBooking.end_date || selectedBooking.endDate || selectedBooking.rental_end_date;
                        
                        if (inspectionType === InspectionType.PRE_RENTAL) {
                          // Pre-rental: between now and booking.startDate (matching backend logic)
                          const maxDate = bookingStartDate ? new Date(bookingStartDate) : null;
                          return (
                            <span className="text-xs text-gray-500 dark:text-slate-400 ml-2 font-normal">
                              {maxDate ? (
                                <>Between now and {maxDate.toLocaleDateString()} {maxDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                              ) : (
                                <>After {now.toLocaleDateString()} {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</>
                              )}
                            </span>
                          );
                        } else if (inspectionType === InspectionType.POST_RENTAL) {
                          // Post-return: after booking.endDate (matching backend logic - POST_RETURN)
                          const minDate = bookingEndDate ? new Date(bookingEndDate) : null;
                          return minDate ? (
                            <span className="text-xs text-gray-500 dark:text-slate-400 ml-2 font-normal">
                              After {minDate.toLocaleDateString()} {minDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          ) : null;
                        }
                        return null;
                      })()}
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        disabled={!selectedBooking}
                        className={`w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100 ${
                          !selectedBooking ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-slate-700' : ''
                        }`}
                        required
                        title={(() => {
                          if (!selectedBooking) {
                            return 'Please select a booking first to enable date selection';
                          }
                          if (inspectionType === InspectionType.PRE_RENTAL) {
                            const bookingStartDate = selectedBooking.start_date || selectedBooking.startDate || selectedBooking.rental_start_date;
                            return `Select any date. Backend will validate: Pre-rental should be between today and booking start date (${bookingStartDate ? new Date(bookingStartDate).toLocaleDateString() : 'N/A'})`;
                          } else if (inspectionType === InspectionType.POST_RENTAL) {
                            const bookingEndDate = selectedBooking.end_date || selectedBooking.endDate || selectedBooking.rental_end_date;
                            return `Select any date. Backend will validate: Post-return should be after booking end date (${bookingEndDate ? new Date(bookingEndDate).toLocaleDateString() : 'N/A'})`;
                          }
                          return 'Select scheduled date and time (backend will validate the date)';
                        })()}
                      />
                    </div>
                    {!selectedBooking && (
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                        Please select a booking first to enable date selection
                      </p>
                    )}
                    {selectedBooking && scheduledAt && (() => {
                      const now = new Date();
                      const scheduled = new Date(scheduledAt);
                      const bookingStartDate = selectedBooking.start_date || selectedBooking.startDate || selectedBooking.rental_start_date;
                      const bookingEndDate = selectedBooking.end_date || selectedBooking.endDate || selectedBooking.rental_end_date;

                      if (inspectionType === InspectionType.PRE_RENTAL) {
                        // Pre-rental: scheduledAt must be >= now AND <= booking.startDate (matching backend)
                        if (scheduled < now) {
                          return (
                            <p className="text-xs text-red-500 mt-1">
                              Pre-rental inspection cannot be scheduled in the past
                            </p>
                          );
                        }
                        if (bookingStartDate) {
                          const startDate = new Date(bookingStartDate);
                          if (scheduled > startDate) {
                            return (
                              <p className="text-xs text-red-500 mt-1">
                                Pre-rental inspection must be before rental start date ({startDate.toLocaleDateString()})
                              </p>
                            );
                          }
                        }
                      } else if (inspectionType === InspectionType.POST_RENTAL) {
                        // Post-return: scheduledAt must be >= booking.endDate (matching backend - POST_RETURN)
                        if (bookingEndDate) {
                          const endDate = new Date(bookingEndDate);
                          if (scheduled < endDate) {
                            return (
                              <p className="text-xs text-red-500 mt-1">
                                Post-return inspection cannot be scheduled before rental end date ({endDate.toLocaleDateString()})
                              </p>
                            );
                          }
                        }
                      }
                      return null;
                    })()}
                  </div>

                  {/* Location Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Location (Address) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={locationText}
                        onChange={(e) => setLocationText(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
                        placeholder="Enter inspection location address"
                        required
                      />
                    </div>
                  </div>

                  {/* Inspector (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Inspector (Optional)
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        value={inspectorId}
                        onChange={(e) => setInspectorId(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
                      >
                        <option value="">
                          {loadingInspectors ? 'Loading...' : 'No inspector (optional)'}
                        </option>
                        {inspectors.map((inspector: any) => {
                          const fullName = inspector.name || inspector.userId || '';
                          const firstName = fullName ? String(fullName).trim().split(/\s+/)[0] : '';
                          const emailUser = inspector.email ? String(inspector.email).split('@')[0] : '';
                          const label = firstName || emailUser || `Inspector ${inspector.id}`;
                          return (
                            <option key={inspector.id} value={inspector.id}>
                              {label}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
                      placeholder="Any additional notes about the inspection..."
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Pre-Inspection Data */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Product Condition Data
                </h4>

                {/* Photos Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Product Photos <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">
                    Upload 2-20 photos showing the product from all angles (minimum 2, maximum 20)
                  </p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                    {/* Display newly selected photos (File objects) */}
                    {photos.map((photo, index) => {
                      const previewUrl = URL.createObjectURL(photo);
                      return (
                        <div key={`photo-${index}-${photo.name}-${photo.size}`} className="relative group">
                          <img
                            src={previewUrl}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-slate-700"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Remove photo"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                    
                    {/* Display already uploaded photos (URLs from server) - only if photoPreviews exist */}
                    {photoPreviews.length > 0 && photoPreviews.map((preview, index) => (
                      <div key={`preview-${index}-${preview.substring(0, 20)}`} className="relative group">
                        <img
                          src={preview}
                          alt={`Uploaded Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(photos.length + index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                          title="Remove photo"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Add Photo Button - only show if under limit */}
                    {photos.length + photoPreviews.length < 20 && (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-teal-500 dark:hover:border-teal-400 transition-colors bg-gray-50 dark:bg-slate-800/50">
                        <Upload className="h-6 w-6 text-gray-400 dark:text-slate-500 mb-2" />
                        <span className="text-sm text-gray-500 dark:text-slate-400 text-center px-2">Add Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handlePhotoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {photos.length + photoPreviews.length} / 20 photos (minimum 2, maximum 20)
                  </p>
                </div>

                {/* Overall Condition */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Overall Condition <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={overallCondition}
                    onChange={(e) => setOverallCondition(e.target.value as ItemCondition)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value={ItemCondition.EXCELLENT}>Excellent</option>
                    <option value={ItemCondition.GOOD}>Good</option>
                    <option value={ItemCondition.FAIR}>Fair</option>
                    <option value={ItemCondition.POOR}>Poor</option>
                    <option value={ItemCondition.DAMAGED}>Damaged</option>
                  </select>
                </div>

                {/* Items List */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Product Components / Items
                    </label>
                    <button
                      type="button"
                      onClick={addItem}
                      className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                    >
                      + Add Item
                    </button>
                  </div>
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <input
                            type="text"
                            placeholder="Item name"
                            value={item.itemName}
                            onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
                          />
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                        <select
                          value={item.condition}
                          onChange={(e) => updateItem(index, 'condition', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
                        >
                          <option value={ItemCondition.EXCELLENT}>Excellent</option>
                          <option value={ItemCondition.GOOD}>Good</option>
                          <option value={ItemCondition.FAIR}>Fair</option>
                          <option value={ItemCondition.POOR}>Poor</option>
                          <option value={ItemCondition.DAMAGED}>Damaged</option>
                        </select>
                        <textarea
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accessories */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                      Accessories & Included Items
                    </label>
                    <button
                      type="button"
                      onClick={addAccessory}
                      className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                    >
                      + Add Accessory
                    </button>
                  </div>
                  <div className="space-y-2">
                    {accessories.map((accessory, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 dark:border-slate-700 rounded-lg">
                        <input
                          type="text"
                          placeholder="Accessory name"
                          value={accessory.name}
                          onChange={(e) => updateAccessory(index, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
                        />
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={accessory.included}
                            onChange={(e) => updateAccessory(index, 'included', e.target.checked)}
                            className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          />
                          Included
                        </label>
                        <button
                          type="button"
                          onClick={() => removeAccessory(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Known Issues */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Known Issues or Defects
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newIssue}
                      onChange={(e) => setNewIssue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIssue())}
                      placeholder="Add an issue"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={addIssue}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1">
                    {knownIssues.map((issue, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-slate-300">{issue}</span>
                        <button
                          type="button"
                          onClick={() => removeIssue(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Maintenance History */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Maintenance History (Optional)
                  </label>
                  <textarea
                    value={maintenanceHistory}
                    onChange={(e) => setMaintenanceHistory(e.target.value)}
                    rows={3}
                    placeholder="Describe any maintenance or repairs done..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* Pre-Inspection Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    value={preInspectionNotes}
                    onChange={(e) => setPreInspectionNotes(e.target.value)}
                    rows={4}
                    placeholder="Any additional information about the product condition, usage instructions, special handling requirements..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* GPS Location */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    GPS Location <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        getCurrentLocation(e);
                      }}
                      disabled={loading}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <MapPin className="h-4 w-4" />
                      {gpsLocation ? 'Update Location' : 'Capture Location'}
                    </button>
                    {gpsLocation && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>
                          {gpsLocation.latitude.toFixed(6)}, {gpsLocation.longitude.toFixed(6)}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Capture GPS location for verification
                  </p>
                </div>

                {/* Confirmation */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    id="confirm"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="confirm" className="text-sm text-gray-700 dark:text-slate-300">
                    I confirm that the information and photos provided accurately represent the product's current condition.
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Create Inspection & Submit Pre-Inspection
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

export default OwnerPreInspectionFormCombined;

