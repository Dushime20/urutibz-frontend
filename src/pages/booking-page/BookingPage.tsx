import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  CreditCard as CreditCardIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  MapPin as MapPinIcon,
  
  MessageSquare,
  Shield,
  Clock,
} from 'react-feather';
import { createBooking, fetchBookingById, calculateDeliveryFee, getAvailableTimeWindows } from './service/api';
import { fetchProductImages, getProductById, fetchProductPricesByProductId } from '../admin/service';
import { useToast } from '../../contexts/ToastContext';
import ReviewForm from './components/ReviewForm';
import PaymentStepper from './components/PaymentStepper';
import Button from '../../components/ui/Button';
import { getCityFromCoordinates, wkbHexToLatLng } from '../../lib/utils';
import { useAdminSettingsContext } from '../../contexts/AdminSettingsContext';

const steps = [
  { label: 'Booking Details', icon: CalendarIcon, description: 'Select dates and preferences' },
  { label: 'Payment', icon: CreditCardIcon, description: 'Secure payment processing' },
  { label: 'Confirmation', icon: CheckCircleIcon, description: 'Booking confirmed' },
  { label: 'Review', icon: StarIcon, description: 'Share your experience' },
];

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const { itemId } = useParams<{ itemId: string }>();
  const { showToast } = useToast();
  const { formatCurrency } = useAdminSettingsContext();

  // State
  const [bookingItem, setBookingItem] = useState<any>(null);
  const [images, setImages] = useState<string[]>(['/assets/img/placeholder-image.png']);
  const [loading, setLoading] = useState(true);
  const [itemLocation, setItemLocation] = useState<{ city: string | null; country: string | null }>({ city: null, country: null });
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    pickupTime: '',
    returnTime: '',
    pickupMethod: '',
    deliveryMethod: '' as 'pickup' | 'delivery' | 'meet_public' | '',
    deliveryAddress: '',
    meetPublicLocation: '',
    deliveryTimeWindow: 'flexible' as 'morning' | 'afternoon' | 'evening' | 'flexible',
    deliveryInstructions: '',
    renterNotes: '',
  });
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [loadingDeliveryFee, setLoadingDeliveryFee] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [existingBooking, setExistingBooking] = useState<any>(null);
  const [ownerStatusOverride, setOwnerStatusOverride] = useState<'pending' | 'confirmed' | 'rejected' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [productPricing, setProductPricing] = useState<any>(null); // Add pricing state

  const normalizeDateInput = (value?: string | null) => {
    if (!value) return '';
    if (typeof value === 'string') {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toISOString().slice(0, 10);
        }
      } catch {
        // Ignore parsing errors and fallback to substring
      }
      return value.length >= 10 ? value.slice(0, 10) : '';
    }
    return '';
  };

  const extractTimeInput = (value?: string | null) => {
    if (!value || typeof value !== 'string') return '';
    if (value.includes('T')) {
      return value.slice(11, 16);
    }
    return value.length >= 5 ? value.slice(0, 5) : '';
  };

  // Fetch product pricing when product is loaded
  useEffect(() => {
    const fetchPricing = async () => {
      if (bookingItem?.id) {
        try {
          const pricingResult = await fetchProductPricesByProductId(bookingItem.id, { page: 1, limit: 1 });
          if (pricingResult.success && pricingResult.data && pricingResult.data.length > 0) {
            setProductPricing(pricingResult.data[0]); // Get first active pricing
          }
        } catch (error) {
          console.error('Error fetching product pricing:', error);
        }
      }
    };
    fetchPricing();
  }, [bookingItem?.id]);

  // Updated rental calculation with flexible pricing
  const rentalDetails = useMemo(() => {
    if (!formData.startDate || !formData.endDate) {
      return { 
        rentalDays: 0, 
        rentalHours: 0, 
        totalDays: 0,
        remainingHours: 0,
        itemPrice: 0, 
        amount: 0, 
        serviceFee: 0, 
        totalCost: 0, 
        pricingType: 'daily',
        currency: bookingItem?.base_currency || 'RWF',
        baseRate: 0,
        unitsUsed: 0,
        hasHourlyPricing: false
      };
    }

    // Helper function to combine date and time
    const combineDateTime = (dateStr: string, timeStr?: string): Date => {
      const time = timeStr || '00:00';
      const timeParts = time.split(':');
      const hours = timeParts[0] || '00';
      const minutes = timeParts[1] || '00';
      const seconds = timeParts[2] || '00';
      const combinedDateTime = `${dateStr}T${hours}:${minutes}:${seconds}.000Z`;
      return new Date(combinedDateTime);
    };

    // Calculate exact timestamps if times are provided, otherwise use dates only
    const startDateTime = formData.pickupTime 
      ? combineDateTime(formData.startDate, formData.pickupTime)
      : new Date(formData.startDate);
    const endDateTime = formData.returnTime 
      ? combineDateTime(formData.endDate, formData.returnTime)
      : new Date(formData.endDate);

    // Calculate exact duration in hours
    const durationMs = endDateTime.getTime() - startDateTime.getTime();
    const totalHours = durationMs / (1000 * 60 * 60); // Convert milliseconds to hours
    const totalDays = Math.floor(totalHours / 24); // Full days
    const remainingHours = totalHours % 24; // Remaining hours after full days
    const totalDaysForTier = Math.ceil(totalHours / 24); // For tier selection

    // Get pricing from product_prices or fallback to product.base_price_per_day
    const pricePerDay = productPricing?.price_per_day 
      ? parseFloat(productPricing.price_per_day) 
      : (bookingItem?.base_price_per_day || 0);
    const pricePerHour = productPricing?.price_per_hour 
      ? parseFloat(productPricing.price_per_hour) 
      : null;
    const pricePerWeek = productPricing?.price_per_week 
      ? parseFloat(productPricing.price_per_week) 
      : null;
    const pricePerMonth = productPricing?.price_per_month 
      ? parseFloat(productPricing.price_per_month) 
      : null;
    const currency = productPricing?.currency || bookingItem?.base_currency || 'RWF';
    const marketAdjustment = productPricing?.market_adjustment_factor 
      ? parseFloat(productPricing.market_adjustment_factor) 
      : 1;

    const hasHourlyPricing = pricePerHour && pricePerHour > 0;
    let baseAmount = 0;
    let baseRate: number;
    let unitsUsed: number;
    let pricingType: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'mixed';

    // Apply pricing logic (same as backend)
    if (hasHourlyPricing) {
      if (totalHours < 24) {
        // Less than 24 hours: charge hourly only
        baseRate = pricePerHour!;
        unitsUsed = totalHours;
        baseAmount = baseRate * unitsUsed;
        pricingType = 'hourly';
      } else {
        // 24 hours or more: charge daily for full days + hourly for remaining hours
        baseRate = pricePerDay;
        unitsUsed = totalDays;
        const dailyAmount = baseRate * unitsUsed;
        const hourlyAmount = remainingHours > 0 ? pricePerHour! * remainingHours : 0;
        baseAmount = dailyAmount + hourlyAmount;
        pricingType = 'mixed';
      }
    } else {
      // No hourly pricing available: use daily/weekly/monthly pricing tiers only
      const rentalDays = totalDaysForTier;
      
      if (rentalDays >= 30 && pricePerMonth) {
        baseRate = pricePerMonth;
        unitsUsed = Math.ceil(rentalDays / 30);
        pricingType = 'monthly';
      } else if (rentalDays >= 7 && pricePerWeek) {
        baseRate = pricePerWeek;
        unitsUsed = Math.ceil(rentalDays / 7);
        pricingType = 'weekly';
      } else {
        // Always use daily rate as minimum (minimum 1 day)
        baseRate = pricePerDay;
        unitsUsed = Math.max(1, Math.ceil(rentalDays));
        pricingType = 'daily';
      }
      
      baseAmount = baseRate * unitsUsed;
    }

    // Apply market adjustment
    baseAmount *= marketAdjustment;

    // Calculate fees
    const subtotal = baseAmount;
    const serviceFee = subtotal * 0.1; // 10% service fee
    const totalCost = subtotal + serviceFee;

    return {
      rentalDays: totalDaysForTier,
      rentalHours: totalHours,
      totalDays: totalDays,
      remainingHours: remainingHours,
      itemPrice: baseRate,
      amount: subtotal,
      serviceFee,
      totalCost,
      pricingType,
      currency,
      baseRate,
      unitsUsed,
      hasHourlyPricing,
      pricePerHour: pricePerHour || 0
    };
  }, [formData, bookingItem, productPricing]);

  const paymentAmount = useMemo(() => {
    if (existingBooking) {
      const total =
        existingBooking.total_amount ??
        existingBooking.totalAmount ??
        existingBooking.pricing?.total_amount ??
        existingBooking.pricing?.totalAmount;
      const parsedTotal = typeof total === 'string' ? parseFloat(total) : total;
      if (parsedTotal && !isNaN(parsedTotal)) {
        return parsedTotal;
      }
    }
    return rentalDetails.totalCost;
  }, [existingBooking, rentalDetails.totalCost]);

  const paymentCurrency = useMemo(() => {
    if (existingBooking) {
      return (
        existingBooking.currency ||
        existingBooking.pricing?.currency ||
        existingBooking.currency_code ||
        existingBooking.currencyCode ||
        rentalDetails.currency ||
        bookingItem?.base_currency ||
        'USD'
      );
    }
    return rentalDetails.currency || bookingItem?.base_currency || 'USD';
  }, [existingBooking, rentalDetails.currency, bookingItem?.base_currency]);

  // Fetch item and images
  console.log(bookingItem,'data to check why booking item not visible')
  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        const token = localStorage.getItem('token') || undefined;
        if (itemId) {
          const productDetails = await getProductById(itemId, token);
          setBookingItem(productDetails);
          const productImages = await fetchProductImages(itemId, token);
          const normalizedImages = Array.isArray(productImages)
            ? productImages
            : (productImages && Array.isArray((productImages as any).data) ? (productImages as any).data : []);
          setImages(normalizedImages.length > 0 ? normalizedImages : ['/assets/img/placeholder-image.png']);
        }
      } catch (error) {
        showToast('Failed to load item details', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchItemDetails();
  }, [itemId, showToast]);

  // Resolve real city/country like ItemDetailsPage
  useEffect(() => {
    if (!bookingItem) return;
    let isMounted = true;
    async function loadLocation() {
      try {
        let lat: number | undefined;
        let lng: number | undefined;

        const sources = [bookingItem.location, (bookingItem as any).geometry];
        for (const source of sources) {
          if (!source) continue;
          if (typeof source === 'string') {
            // Handle WKB hex like ItemDetailsPage
            const coords = wkbHexToLatLng(source);
            if (coords) {
              lat = coords.lat;
              lng = coords.lng;
              break;
            }
            // Fallback: attempt to parse JSON string if present
            try {
              const parsed = JSON.parse(source);
              if (parsed && typeof parsed === 'object') {
                lat = parsed.lat ?? parsed.latitude ?? parsed.y;
                lng = parsed.lng ?? parsed.longitude ?? parsed.x;
                if (Array.isArray(parsed.coordinates) && parsed.coordinates.length >= 2) {
                  lng = parsed.coordinates[0];
                  lat = parsed.coordinates[1];
                }
              }
            } catch {}
          } else if (typeof source === 'object') {
            lat = (source as any).lat ?? (source as any).latitude ?? (source as any).y;
            lng = (source as any).lng ?? (source as any).longitude ?? (source as any).x;
            if ((source as any).coordinates && Array.isArray((source as any).coordinates)) {
              const coords = (source as any).coordinates;
              if (coords.length >= 2) {
                lng = coords[0];
                lat = coords[1];
              }
            }
          }
          if (lat != null && lng != null) break;
        }

        if (lat != null && lng != null) {
          try {
            const { city, country } = await getCityFromCoordinates(lat, lng);
            if (isMounted) setItemLocation({ city, country });
          } catch {
            if (isMounted) setItemLocation({ city: null, country: null });
          }
        } else {
          if (isMounted) setItemLocation({ city: null, country: null });
        }
      } finally {
        // no-op
      }
    }
    loadLocation();
    return () => { isMounted = false; };
  }, [bookingItem]);

  // Debugging: log currentStep and bookingId
  useEffect(() => {
    console.log('Current Step:', currentStep, 'Booking ID:', bookingId);
  }, [currentStep, bookingId]);

  // Handle URL parameters for skipping to payment step
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlBookingId = searchParams.get('bookingId');
    const stepParam = searchParams.get('step');
    const ownerConfirmedParam = searchParams.get('ownerConfirmed');
    const ownerStatusParam = searchParams.get('ownerStatus');
    
    if (urlBookingId) {
      setBookingId(urlBookingId);
      // If step parameter is provided, set the current step
      if (stepParam) {
        const stepNumber = parseInt(stepParam, 10);
        if (!isNaN(stepNumber) && stepNumber >= 0 && stepNumber < steps.length) {
          setCurrentStep(stepNumber);
        }
      }
    }

    if (ownerStatusParam) {
      const normalized = ownerStatusParam.toLowerCase() as 'pending' | 'confirmed' | 'rejected';
      setOwnerStatusOverride(normalized);
    } else if (ownerConfirmedParam) {
      const normalizedBool = ownerConfirmedParam === 'true' || ownerConfirmedParam === '1';
      if (normalizedBool) setOwnerStatusOverride('confirmed');
    }
  }, []);

  useEffect(() => {
    const loadExistingBooking = async () => {
      if (!bookingId) {
        setExistingBooking(null);
        return;
      }

      console.log('[BookingPage] loading existing booking for bookingId:');

      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await fetchBookingById(bookingId, token);
        if (response.success && response.data) {
          const bookingData = response.data;
          setExistingBooking(bookingData);
          try {
            console.log('[BookingPage] existing booking data:', bookingData);
            console.log('[BookingPage] owner_confirmed:', bookingData.owner_confirmed);
            console.log('[BookingPage] owner_confirmation_status:', bookingData.owner_confirmation_status);
            (window as any).__bookingData = bookingData;
          } catch {}
          setFormData(prev => ({
            ...prev,
            startDate: normalizeDateInput(bookingData.start_date) || prev.startDate,
            endDate: normalizeDateInput(bookingData.end_date) || prev.endDate,
            pickupTime: bookingData.pickup_time || extractTimeInput(bookingData.start_time) || prev.pickupTime,
            returnTime: bookingData.return_time || extractTimeInput(bookingData.end_time) || prev.returnTime,
            pickupMethod: bookingData.pickup_method || prev.pickupMethod,
            deliveryMethod: bookingData.delivery_method || prev.deliveryMethod || '',
            deliveryAddress: bookingData.delivery_address || prev.deliveryAddress || '',
            meetPublicLocation: bookingData.meet_public_location || prev.meetPublicLocation || '',
            deliveryTimeWindow: bookingData.delivery_time_window || prev.deliveryTimeWindow || 'flexible',
            deliveryInstructions: bookingData.delivery_instructions || prev.deliveryInstructions || '',
            renterNotes: bookingData.renter_notes || prev.renterNotes,
          }));
        }
      } catch (error) {
        console.error('Failed to load existing booking for payment:', error);
      }
    };

    loadExistingBooking();
  }, [bookingId]);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmitBookingDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setValidationErrors({});
    const errors: Record<string, string> = {};
    if (!formData.startDate) errors.startDate = 'Pickup date is required';
    if (!formData.endDate) errors.endDate = 'Return date is required';
    
    // Validate dates are not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      startDate.setHours(0, 0, 0, 0);
      if (startDate < today) {
        errors.startDate = 'Start date cannot be in the past. Please select a future date.';
      }
    }
    
    if (formData.endDate) {
      const endDate = new Date(formData.endDate);
      endDate.setHours(0, 0, 0, 0);
      if (endDate < today) {
        errors.endDate = 'End date cannot be in the past. Please select a future date.';
      }
    }
    
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      errors.dates = 'Return date must be after pickup date';
    }
    
    // Validate time range (1am to 23:00 / 11pm)
    if (!formData.pickupTime) {
      errors.pickupTime = 'Pickup time is required';
    } else {
      const [hours, minutes] = formData.pickupTime.split(':').map(Number);
      if (hours < 1 || hours > 23 || (hours === 23 && minutes > 0)) {
        errors.pickupTime = 'Pickup time must be between 1:00 AM and 11:00 PM (23:00).';
      }
    }
    
    if (!formData.returnTime) {
      errors.returnTime = 'Return time is required';
    } else {
      const [hours, minutes] = formData.returnTime.split(':').map(Number);
      if (hours < 1 || hours > 23 || (hours === 23 && minutes > 0)) {
        errors.returnTime = 'Return time must be between 1:00 AM and 11:00 PM (23:00).';
      }
    }
    
    // Validate pickup method is selected
    const deliveryMethod = formData.deliveryMethod || formData.pickupMethod;
    if (!deliveryMethod) {
      errors.pickupMethod = 'Delivery method is required';
    }

    if (deliveryMethod === 'delivery' && !formData.deliveryAddress.trim()) {
      errors.deliveryAddress = 'Delivery address is required';
    }

    if (deliveryMethod === 'meet_public' && !formData.meetPublicLocation.trim()) {
      errors.meetPublicLocation = 'Meet location is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      return;
    }
    try {
      const token = localStorage.getItem('token') || '';
      const deliveryMethod = formData.deliveryMethod || formData.pickupMethod;
      const bookingPayload = {
        product_id: bookingItem?.id,
        owner_id: bookingItem?.owner_id,
        start_date: formData.startDate,
        end_date: formData.endDate,
        pickup_time: formData.pickupTime,
        return_time: formData.returnTime,
        pickup_method: formData.pickupMethod,
        delivery_method: deliveryMethod,
        delivery_address: deliveryMethod === 'delivery' ? formData.deliveryAddress : undefined,
        meet_public_location: deliveryMethod === 'meet_public' ? formData.meetPublicLocation : undefined,
        delivery_time_window: (deliveryMethod === 'delivery' || deliveryMethod === 'meet_public') ? formData.deliveryTimeWindow : undefined,
        delivery_instructions: (deliveryMethod === 'delivery' || deliveryMethod === 'meet_public') ? formData.deliveryInstructions : undefined,
        renter_notes: formData.renterNotes,
      };
      const response = await createBooking(bookingPayload, token);
      
      console.log('Booking creation response:', response);
      console.log('Booking ID from response:', response.data?.data?.id);
      
      if (response.success && response.data?.data?.id) {
        setBookingId(response.data.data.id);
        setCurrentStep(1);
        showToast('Booking details confirmed', 'success');
      } else {
        // Extract actual error message - prioritize errors array, then error field, then message
        const errMsg = (response as any)?.errors?.[0]?.message || 
                       (response as any)?.error || 
                       (response as any)?.message || 
                       'Failed to create booking';
        showToast(errMsg, 'error');
      }
    } catch {
      showToast('Booking failed. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    setCurrentStep(2);
    showToast('Payment successful!', 'success');
  };

  const handleReviewSubmitted = () => {
    showToast('Thank you for your review!', 'success');
    navigate('/dashboard');
  };

  // Enhanced Stepper UI
  const renderStepper = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
          <div 
            className="h-full bg-[#00aaa9] transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>
        
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isActive = currentStep === idx;
          const isCompleted = currentStep > idx;
          
          return (
            <div key={step.label} className="flex flex-col items-center relative z-10">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all duration-300
                ${isActive 
                  ? 'bg-[#00aaa9] text-white shadow-lg shadow-[#00aaa9]/25' 
                  : isCompleted 
                    ? 'bg-[#00aaa9] text-white' 
                    : 'bg-gray-100 text-gray-400'
                }
              `}>
                <StepIcon className="w-5 h-5" />
              </div>
              <div className="text-center max-w-24">
                <span className={`
                  block text-sm font-semibold mb-1 transition-colors
                  ${isActive ? 'text-[#00aaa9]' : isCompleted ? 'text-gray-700' : 'text-gray-400'}
                `}>
                  {step.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-slate-400 hidden sm:block leading-tight">
                  {step.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Enhanced Step Content
  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Booking Details</h2>
            <p className="text-gray-600 dark:text-slate-400">Please provide your rental preferences and schedule</p>
          </div>
          
          <form onSubmit={handleSubmitBookingDetails} className="space-y-8">
            {/* Rental Period */}
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-[#00aaa9]" />
                Rental Period
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Pickup Date
                    </label>
                    <input 
                      type="date" 
                      name="startDate" 
                      value={formData.startDate} 
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={`
                        w-full px-4 py-3 border rounded-xl transition-all duration-200 dark:bg-slate-900 dark:text-slate-100
                        focus:ring-2 focus:ring-[#00aaa9] focus:border-[#00aaa9] outline-none
                        ${validationErrors.startDate ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-slate-700'}
                      `}
                      required 
                    />
                    {validationErrors.startDate && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {validationErrors.startDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Pickup Time
                    </label>
                    <input 
                      type="time" 
                      name="pickupTime" 
                      value={formData.pickupTime} 
                      onChange={handleChange}
                      min="01:00"
                      max="23:00"
                      className={`
                        w-full px-4 py-3 border rounded-xl transition-all duration-200 dark:bg-slate-900 dark:text-slate-100
                        focus:ring-2 focus:ring-[#00aaa9] focus:border-[#00aaa9] outline-none
                        ${validationErrors.pickupTime ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-slate-700'}
                      `}
                      required 
                    />
                    {validationErrors.pickupTime && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {validationErrors.pickupTime}
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Return Date
                    </label>
                    <input 
                      type="date" 
                      name="endDate" 
                      value={formData.endDate} 
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={`
                        w-full px-4 py-3 border rounded-xl transition-all duration-200 dark:bg-slate-900 dark:text-slate-100
                        focus:ring-2 focus:ring-[#00aaa9] focus:border-[#00aaa9] outline-none
                        ${validationErrors.endDate ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-slate-700'}
                      `}
                      required 
                    />
                    {validationErrors.endDate && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {validationErrors.endDate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Return Time
                    </label>
                    <input 
                      type="time" 
                      name="returnTime" 
                      value={formData.returnTime} 
                      onChange={handleChange}
                      min="01:00"
                      max="23:00"
                      className={`
                        w-full px-4 py-3 border rounded-xl transition-all duration-200 dark:bg-slate-900 dark:text-slate-100
                        focus:ring-2 focus:ring-[#00aaa9] focus:border-[#00aaa9] outline-none
                        ${validationErrors.returnTime ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-slate-700'}
                      `}
                      required 
                    />
                    {validationErrors.returnTime && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <span className="w-4 h-4 mr-1">⚠</span>
                        {validationErrors.returnTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {validationErrors.dates && (
                <p className="text-red-500 text-sm mt-4 flex items-center bg-red-50 p-3 rounded-lg">
                  <span className="w-4 h-4 mr-2">⚠</span>
                  {validationErrors.dates}
                </p>
              )}
            </div>


            {/* Additional Notes */}
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-[#00aaa9]" />
                Additional Information
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea 
                  name="renterNotes" 
                  value={formData.renterNotes} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#00aaa9] focus:border-[#00aaa9] outline-none resize-none"
                  rows={4} 
                  placeholder="Any special requests or instructions for the owner..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-slate-700">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-[#00aaa9] hover:bg-[#008b8a] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                aria-label="Continue to Payment"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Payment
                    <CreditCardIcon className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      );
    }
    
    if (currentStep === 1 && bookingId) {
      return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Secure Payment</h2>
            <p className="text-gray-600 dark:text-slate-400">Complete your booking with our secure payment system</p>
          </div>
          <PaymentStepper
            bookingId={bookingId}
            amount={paymentAmount}
            currency={paymentCurrency}
            onSuccess={handlePaymentSuccess}
            initialBookingData={existingBooking}
            ownerConfirmationOverride={ownerStatusOverride}
          />
        </div>
      );
    }
    
    if (currentStep === 2) {
      return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircleIcon className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Booking Confirmed!</h2>
            <p className="text-lg text-gray-600 dark:text-slate-400 mb-8 max-w-md">
              🎉 Your booking was successful! You'll receive a confirmation email shortly.
            </p>
            
            {/* Booking Summary Card */}
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6 mb-8 w-full max-w-md">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Booking ID</span>
                  <span className="font-medium">{bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Duration</span>
                  <span className="font-medium">{rentalDetails.rentalDays} {rentalDetails.rentalDays === 1 ? 'day' : 'days'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Total Paid</span>
                  <span className="font-medium text-[#00aaa9]">
                    {formatCurrency(
                      paymentAmount || rentalDetails.totalCost,
                      paymentCurrency || rentalDetails.currency || bookingItem?.base_currency || 'RWF'
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
              <Button
                onClick={() => setCurrentStep(3)}
                className="flex-1 flex items-center justify-center gap-2 bg-[#00aaa9] hover:bg-[#008b8a] text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                aria-label="Leave a Review"
              >
                <StarIcon className="w-5 h-5" />
                Leave a Review
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                className="flex-1 flex items-center justify-center gap-2 border-2 border-[#00aaa9] text-[#00aaa9] bg-white font-semibold py-3 px-6 rounded-xl hover:bg-[#00aaa9] hover:text-white transition-all duration-200"
                aria-label="Go to Dashboard"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    if (currentStep === 3 && bookingId) {
      console.log('Rendering Review step with bookingId:', bookingId);
      console.log('Owner ID from bookingItem:', bookingItem?.owner_id);
      return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Share Your Experience</h2>
            <p className="text-gray-600 dark:text-slate-400">Help others by sharing your experience with this rental</p>
          </div>
          <ReviewForm 
            bookingId={bookingId} 
            ownerId={bookingItem?.owner_id}
            onReviewSubmitted={handleReviewSubmitted} 
          />
        </div>
      );
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-12 h-12 border-4 border-[#00aaa9] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {renderStepper()}
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Enhanced Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 sticky top-8">
                <div className="relative mb-6">
                  <img 
                    src={images[0]} 
                    alt={bookingItem?.name || bookingItem?.title} 
                    className="w-full h-48 rounded-xl object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-[#00aaa9]">
                      Featured
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {bookingItem?.title || bookingItem?.name}
                  </h3>
                  <div className="flex items-center text-gray-600 dark:text-slate-400 mb-3">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {(itemLocation.city || bookingItem?.location?.city || 'Unknown')}, {(itemLocation.country || bookingItem?.location?.country || '')}
                    </span>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{bookingItem?.average_rating || '0.00'}</span>
                    <span className="text-xs text-gray-500">({bookingItem?.review_count || 0} reviews)</span>
                  </div>
                </div>
                
                {/* Price Breakdown */}
                <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Price Breakdown</h4>
                  <div className="space-y-3 text-sm">
                    {/* Show pricing type */}
                    {rentalDetails.pricingType === 'hourly' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-slate-400">
                          Hourly Rate ({rentalDetails.rentalHours.toFixed(2)} hours)
                        </span>
                        <span className="font-medium">
                          {formatCurrency(rentalDetails.itemPrice ?? 0, rentalDetails.currency)} × {rentalDetails.unitsUsed.toFixed(2)} hrs
                        </span>
                      </div>
                    )}
                    {rentalDetails.pricingType === 'mixed' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-slate-400">
                            Daily Rate ({rentalDetails.totalDays} {rentalDetails.totalDays === 1 ? 'day' : 'days'})
                          </span>
                          <span className="font-medium">
                            {formatCurrency(rentalDetails.baseRate ?? 0, rentalDetails.currency)} × {rentalDetails.totalDays}
                          </span>
                        </div>
                        {rentalDetails.remainingHours > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-slate-400">
                              Additional Hours ({rentalDetails.remainingHours.toFixed(2)} hrs)
                            </span>
                            <span className="font-medium">
                              {formatCurrency(rentalDetails.pricePerHour || 0, rentalDetails.currency)} × {rentalDetails.remainingHours.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    {(rentalDetails.pricingType === 'daily' || rentalDetails.pricingType === 'weekly' || rentalDetails.pricingType === 'monthly') && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-slate-400">
                          {rentalDetails.pricingType === 'monthly' ? 'Monthly' : rentalDetails.pricingType === 'weekly' ? 'Weekly' : 'Daily'} Rate ({rentalDetails.rentalDays} {rentalDetails.rentalDays === 1 ? 'day' : 'days'})
                        </span>
                        <span className="font-medium">
                          {formatCurrency(rentalDetails.itemPrice ?? 0, rentalDetails.currency)} × {rentalDetails.unitsUsed}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">Subtotal</span>
                      <span className="font-medium">
                        {formatCurrency(rentalDetails.amount, rentalDetails.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">Service Fee (10%)</span>
                      <span className="font-medium">
                        {formatCurrency(rentalDetails.serviceFee, rentalDetails.currency)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-slate-700 pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-900 dark:text-white">Total</span>
                        <span className="font-bold text-xl text-[#00aaa9]">
                          {formatCurrency(rentalDetails.totalCost, rentalDetails.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Trust Indicators */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400 mt-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span>Verified Owner</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="lg:col-span-2">
              {renderStepContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;