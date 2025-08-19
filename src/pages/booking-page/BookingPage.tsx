import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  CreditCard as CreditCardIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  MapPin as MapPinIcon,
  Clock,
  User,
  MessageSquare,
  TrendingUp,
  Shield,
} from 'react-feather';
import { createBooking } from './service/api';
import { fetchProductImages, getProductById } from '../admin/service/api';
import { useToast } from '../../contexts/ToastContext';
import ReviewForm from './components/ReviewForm';
import PaymentStepper from './components/PaymentStepper';
import Button from '../../components/ui/Button';

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

  // State
  const [bookingItem, setBookingItem] = useState<any>(null);
  const [images, setImages] = useState<string[]>(['/assets/img/placeholder-image.png']);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    pickupTime: '10:00',
    returnTime: '10:00',
    pickupMethod: 'pickup',
    renterNotes: '',
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Rental calculation
  const rentalDetails = useMemo(() => {
    const startDate = formData.startDate ? new Date(formData.startDate) : null;
    const endDate = formData.endDate ? new Date(formData.endDate) : null;
    let rentalDays = 0;
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (rentalDays === 0) rentalDays = 1;
    }
    const itemPrice = bookingItem?.base_price_per_day || 0;
    const amount = itemPrice * rentalDays;
    const serviceFee = amount * 0.1;
    const totalCost = amount + serviceFee;
    return { rentalDays, itemPrice, amount, serviceFee, totalCost };
  }, [formData, bookingItem]);

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

  // Debugging: log currentStep and bookingId
  useEffect(() => {
    console.log('Current Step:', currentStep, 'Booking ID:', bookingId);
  }, [currentStep, bookingId]);

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
    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      errors.dates = 'Return date must be after pickup date';
    }
    if (!formData.pickupTime) errors.pickupTime = 'Pickup time is required';
    if (!formData.returnTime) errors.returnTime = 'Return time is required';
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      return;
    }
    try {
      const token = localStorage.getItem('token') || '';
      const bookingPayload = {
        product_id: bookingItem?.id,
        owner_id: bookingItem?.owner_id,
        start_date: formData.startDate,
        end_date: formData.endDate,
        pickup_time: formData.pickupTime,
        return_time: formData.returnTime,
        pickup_method: formData.pickupMethod,
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
        const errMsg = (response as any)?.error || (response as any)?.message || 'Failed to create booking';
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
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
                <span className="text-xs text-gray-500 hidden sm:block leading-tight">
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Details</h2>
            <p className="text-gray-600">Please provide your rental preferences and schedule</p>
          </div>
          
          <form onSubmit={handleSubmitBookingDetails} className="space-y-8">
            {/* Rental Period */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-[#00aaa9]" />
                Rental Period
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Date
                    </label>
                    <input 
                      type="date" 
                      name="startDate" 
                      value={formData.startDate} 
                      onChange={handleChange}
                      className={`
                        w-full px-4 py-3 border rounded-xl transition-all duration-200
                        focus:ring-2 focus:ring-[#00aaa9] focus:border-[#00aaa9] outline-none
                        ${validationErrors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Time
                    </label>
                    <input 
                      type="time" 
                      name="pickupTime" 
                      value={formData.pickupTime} 
                      onChange={handleChange}
                      className={`
                        w-full px-4 py-3 border rounded-xl transition-all duration-200
                        focus:ring-2 focus:ring-[#00aaa9] focus:border-[#00aaa9] outline-none
                        ${validationErrors.pickupTime ? 'border-red-300 bg-red-50' : 'border-gray-300'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return Date
                    </label>
                    <input 
                      type="date" 
                      name="endDate" 
                      value={formData.endDate} 
                      onChange={handleChange}
                      className={`
                        w-full px-4 py-3 border rounded-xl transition-all duration-200
                        focus:ring-2 focus:ring-[#00aaa9] focus:border-[#00aaa9] outline-none
                        ${validationErrors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Return Time
                    </label>
                    <input 
                      type="time" 
                      name="returnTime" 
                      value={formData.returnTime} 
                      onChange={handleChange}
                      className={`
                        w-full px-4 py-3 border rounded-xl transition-all duration-200
                        focus:ring-2 focus:ring-[#00aaa9] focus:border-[#00aaa9] outline-none
                        ${validationErrors.returnTime ? 'border-red-300 bg-red-50' : 'border-gray-300'}
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

            {/* Pickup Method */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <MapPinIcon className="w-5 h-5 mr-2 text-[#00aaa9]" />
                Pickup Method
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`
                  relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                  ${formData.pickupMethod === 'pickup' 
                    ? 'border-[#00aaa9] bg-[#00aaa9]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}>
                  <input
                    type="radio"
                    name="pickupMethod"
                    value="pickup"
                    checked={formData.pickupMethod === 'pickup'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`
                    w-4 h-4 rounded-full border-2 mr-3 transition-all duration-200
                    ${formData.pickupMethod === 'pickup'
                      ? 'border-[#00aaa9] bg-[#00aaa9] shadow-sm'
                      : 'border-gray-300'
                    }
                  `}>
                    {formData.pickupMethod === 'pickup' && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Pickup at Location</span>
                    <p className="text-sm text-gray-600">Meet the owner at their location</p>
                  </div>
                </label>
                <label className={`
                  relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200
                  ${formData.pickupMethod === 'delivery' 
                    ? 'border-[#00aaa9] bg-[#00aaa9]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}>
                  <input
                    type="radio"
                    name="pickupMethod"
                    value="delivery"
                    checked={formData.pickupMethod === 'delivery'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`
                    w-4 h-4 rounded-full border-2 mr-3 transition-all duration-200
                    ${formData.pickupMethod === 'delivery'
                      ? 'border-[#00aaa9] bg-[#00aaa9] shadow-sm'
                      : 'border-gray-300'
                    }
                  `}>
                    {formData.pickupMethod === 'delivery' && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                    )}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Delivery</span>
                    <p className="text-sm text-gray-600">Have it delivered to you</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-[#00aaa9]" />
                Additional Information
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea 
                  name="renterNotes" 
                  value={formData.renterNotes} 
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl transition-all duration-200 focus:ring-2 focus:ring-[#00aaa9] focus:border-[#00aaa9] outline-none resize-none"
                  rows={4} 
                  placeholder="Any special requests or instructions for the owner..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Secure Payment</h2>
            <p className="text-gray-600">Complete your booking with our secure payment system</p>
          </div>
          <PaymentStepper
            bookingId={bookingId}
            amount={rentalDetails.totalCost}
            currency={bookingItem?.base_currency || "USD"}
            onSuccess={handlePaymentSuccess}
          />
        </div>
      );
    }
    
    if (currentStep === 2) {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircleIcon className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md">
              🎉 Your booking was successful! You'll receive a confirmation email shortly.
            </p>
            
            {/* Booking Summary Card */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8 w-full max-w-md">
              <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID</span>
                  <span className="font-medium">{bookingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{rentalDetails.rentalDays} {rentalDetails.rentalDays === 1 ? 'day' : 'days'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Paid</span>
                  <span className="font-medium text-[#00aaa9]">
                    {rentalDetails.totalCost}/{bookingItem.base_currency}
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Your Experience</h2>
            <p className="text-gray-600">Help others by sharing your experience with this rental</p>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {renderStepper()}
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Enhanced Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
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
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPinIcon className="w-4 h-4 mr-2" />
                    <span className="text-sm">
                      {bookingItem?.location?.city || 'Unknown'}, {bookingItem?.location?.country || ''}
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
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Price Breakdown</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Daily Rate</span>
                      <span className="font-medium">
                        {rentalDetails.itemPrice.toLocaleString('en-US', { 
                          style: 'currency', 
                          currency: bookingItem?.base_currency || 'USD' 
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">
                        {rentalDetails.rentalDays} {rentalDetails.rentalDays === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        {rentalDetails.amount.toLocaleString('en-US', { 
                          style: 'currency', 
                          currency: bookingItem?.base_currency || 'USD' 
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Fee (10%)</span>
                      <span className="font-medium">
                        {rentalDetails.serviceFee.toLocaleString('en-US', { 
                          style: 'currency', 
                          currency: bookingItem?.base_currency || 'USD' 
                        })}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="font-bold text-xl text-[#00aaa9]">
                          {rentalDetails.totalCost.toLocaleString('en-US', { 
                            style: 'currency', 
                            currency: bookingItem?.base_currency || 'USD' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Trust Indicators */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 mt-2">
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