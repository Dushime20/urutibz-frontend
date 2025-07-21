import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, CreditCard, Calendar, Clock, MapPin, AlertCircle, CheckCircle, Smartphone, Wallet, Banknote, User, Mail, Phone } from 'lucide-react';
import Button from '../../components/ui/Button';
import { formatPrice } from '../../lib/utils';
import { getProductById, fetchProductImages } from '../admin/service/api'; // adjust path as needed
import { wkbHexToLatLng, getCityFromCoordinates } from '../../lib/utils';
import AddPaymentMethod from './components/AddPaymentMethod';
import PaymentStepper from './components/PaymentStepper';
import { createBooking, fetchPaymentMethods, processPaymentTransaction } from './service/api'; // Assuming createBooking is in this file
import { useToast } from '../../contexts/ToastContext';

const BookingPage: React.FC = () => {
  const { carId, itemId } = useParams<{ carId?: string; itemId?: string }>();
  const navigate = useNavigate();
  
  // Support both legacy car bookings and new item bookings
  const bookingId = itemId || carId;
  const isLegacyCarBooking = !!carId && !itemId;
  
  // Find the item/car being booked
  const [bookingItem, setBookingItem] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemLocation, setItemLocation] = useState<{ city: string | null, country: string | null }>({ city: null, country: null });
  console.log(bookingItem,'booked item')
  useEffect(() => {
    if (!itemId) return;
    setLoading(true);
    const token = localStorage.getItem('token') || undefined;
    getProductById(itemId, token).then(result => {
      let product = null;
      if (result) {
        product = result;

      } else if (result.data && result.data.data && result.data.data.status === 'active') {
        product = result.data.data;
      }
      setBookingItem(product);
      setLoading(false);
      if (product && product.id) {
        fetchProductImages(product.id, token).then(({ data, error }) => {
          let imgs: any[] = [];
          if (!error && data && Array.isArray(data.data)) {
            imgs = data.data;
          } else if (!error && data && Array.isArray(data)) {
            imgs = data;
          }
          setImages(Array.isArray(imgs) ? imgs : []);
        });
        // Fetch city/country for location
        if (product.location) {
          let lat, lng;
          if (typeof product.location === 'string') {
            const coords = wkbHexToLatLng(product.location);
            if (coords) {
              lat = coords.lat;
              lng = coords.lng;
            }
          } else if (
            product.location &&
            typeof product.location === 'object' &&
            ('lat' in product.location || 'latitude' in product.location) &&
            ('lng' in product.location || 'longitude' in product.location)
          ) {
            lat = (product.location as any).lat ?? (product.location as any).latitude;
            lng = (product.location as any).lng ?? (product.location as any).longitude;
          }
          if (lat !== undefined && lng !== undefined) {
            getCityFromCoordinates(lat, lng).then(({ city, country }) => {
              setItemLocation({ city, country });
            });
          } else if (
            product.location &&
            typeof product.location === 'object' &&
            'city' in product.location
          ) {
            setItemLocation({ city: (product.location as any).city, country: null });
          } else {
            setItemLocation({ city: null, country: null });
          }
        } else {
          setItemLocation({ city: null, country: null });
        }
      } else {
        setImages([]);
        setItemLocation({ city: null, country: null });
      }
    });
  }, [itemId]);
  
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    startTime: '10:00',
    endTime: '10:00',
    pickupMethod: 'pickup',
    renterNotes: '',
    agreeTerms: false,
    paymentMethod: '',
  });

  const [currentStep, setCurrentStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  
  const { showToast } = useToast();

  const fetchAndSetPaymentMethods = () => {
    const token = localStorage.getItem('token') || undefined;
    fetchPaymentMethods(token)
      .then((res) => {
        setPaymentMethods(res.data?.data || res.data || []);
      })
      .catch(() => setPaymentMethods([]));
  };

  useEffect(() => {
    fetchAndSetPaymentMethods();
  }, []);

  // Handle case when item/car is not found
  if (loading) {
    return <div>Loading...</div>;
  }
 
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 'details') {
      setIsSubmitting(true);
      setValidationErrors({});
      try {
        const token = localStorage.getItem('token') || '';
        const bookingPayload = {
          product_id: bookingItem?.id,
          owner_id: bookingItem?.owner_id,
          start_date: formData.startDate,
          end_date: formData.endDate,
          pickup_time: formData.startTime,
          return_time: formData.endTime,
          pickup_method: formData.pickupMethod,
          renter_notes: formData.renterNotes,
        };
        // @ts-ignore
        await createBooking(bookingPayload, token);
        showToast('Booking successful!', 'success');
        setCurrentStep('payment');
      } catch (error) {
        setValidationErrors({ api: 'Booking failed. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep === 'payment') {
      let errors: Record<string, string> = {};
      
      // No specific validation for pickupMethod or renterNotes as they are not required
      
      // If there are validation errors, show them and don't proceed
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
      
      // Clear any previous errors
      setValidationErrors({});
      setIsSubmitting(true);
      
      try {
        const token = localStorage.getItem('token') || '';
        const bookingPayload = {
          product_id: bookingItem?.id,
          owner_id: bookingItem?.owner_id,
          start_date: formData.startDate,
          end_date: formData.endDate,
          pickup_time: formData.startTime,
          return_time: formData.endTime,
          pickup_method: formData.pickupMethod,
          renter_notes: formData.renterNotes,
        };
        // @ts-ignore
        await createBooking(bookingPayload, token);
        setCurrentStep('confirmation');
      } catch (error) {
        setValidationErrors({ api: 'Booking failed. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep === 'confirmation') {
      navigate('/dashboard');
    }
  };

  // Calculate rental duration and cost
  const startDate = formData.startDate ? new Date(formData.startDate) : null;
  const endDate = formData.endDate ? new Date(formData.endDate) : null;
  
  let rentalDays = 0;
  if (startDate && endDate) {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    rentalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (rentalDays === 0) rentalDays = 1; // Minimum 1 day
  }
  
  const itemPrice = bookingItem.base_price_per_day;
  const amount = itemPrice * rentalDays;
  const serviceFee = amount * 0.1;
  const totalCost = amount + serviceFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      {/* Enhanced Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center text-sm">
            <Link to="/" className="group flex items-center text-gray-600 hover:text-primary-600 transition-all duration-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-2 group-hover:bg-primary-100 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="font-medium">Home</span>
              </div>
            </Link>
            <ChevronRight className="w-4 h-4 mx-3 text-gray-300" />
            <Link to={isLegacyCarBooking ? "/cars" : "/items"} className="group flex items-center text-gray-600 hover:text-primary-600 transition-all duration-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-2 group-hover:bg-primary-100 transition-colors">
                  {isLegacyCarBooking ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2.586a2 2 0 01.586-1.414L12 10V7a1 1 0 011-1h2a1 1 0 011 1v3l2.414 2.586A2 2 0 0119 14.414V17M9 17h10M9 17l-3 3M19 17l3 3" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                </div>
                <span className="font-medium">{isLegacyCarBooking ? "Cars" : "Items"}</span>
              </div>
            </Link>
            <ChevronRight className="w-4 h-4 mx-3 text-gray-300" />
            <Link 
              to={isLegacyCarBooking ? `/cars/${bookingId}` : `/items/${bookingId}`} 
              className="group flex items-center text-gray-600 hover:text-primary-600 transition-all duration-200"
            >
              <div className="flex items-center">
                <img 
                  src={images[0]?.url || images[0]?.image_url || images[0]?.path || '/assets/img/placeholder-image.png'} 
                  alt={bookingItem.name}
                  className="w-8 h-8 object-cover rounded-lg mr-2 border border-gray-200 group-hover:border-primary-300 transition-colors"
                />
                <span className="font-medium truncate max-w-[150px]">{bookingItem.title}</span>
              </div>
            </Link>
            <ChevronRight className="w-4 h-4 mx-3 text-gray-300" />
            <div className="flex items-center text-primary-600 font-semibold">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-2">
                <Calendar className="w-4 h-4" />
              </div>
              <span>Book Now</span>
            </div>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Progress Steps */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 rounded-full">
              <div 
                className={`h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-700 ease-out ${
                  currentStep === 'details' ? 'w-0' : 
                  currentStep === 'payment' ? 'w-1/2' : 'w-full'
                }`} 
              />
            </div>
            
            <div className="relative flex justify-between">
              {/* Step 1: Details */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-3 transition-all duration-300 ${
                  currentStep === 'details' 
                    ? 'border-primary-600 bg-white shadow-lg shadow-primary-200' 
                    : currentStep === 'payment' || currentStep === 'confirmation'
                    ? 'border-green-500 bg-green-500 shadow-lg shadow-green-200'
                    : 'border-gray-200 bg-white'
                } relative z-10`}>
                  {currentStep === 'payment' || currentStep === 'confirmation' ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <Calendar className={`w-6 h-6 ${currentStep === 'details' ? 'text-primary-600' : 'text-gray-400'}`} />
                  )}
                </div>
                <div className="mt-3 text-center">
                  <div className={`font-semibold text-sm ${
                    currentStep === 'details' ? 'text-primary-600' : 
                    currentStep === 'payment' || currentStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    Rental Details
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Enter booking info</div>
                </div>
              </div>
              
              {/* Step 2: Payment */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-3 transition-all duration-300 ${
                  currentStep === 'payment'
                    ? 'border-primary-600 bg-white shadow-lg shadow-primary-200'
                    : currentStep === 'confirmation'
                    ? 'border-green-500 bg-green-500 shadow-lg shadow-green-200'
                    : 'border-gray-200 bg-white'
                } relative z-10`}>
                  {currentStep === 'confirmation' ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <CreditCard className={`w-6 h-6 ${currentStep === 'payment' ? 'text-primary-600' : 'text-gray-400'}`} />
                  )}
                </div>
                <div className="mt-3 text-center">
                  <div className={`font-semibold text-sm ${
                    currentStep === 'payment' ? 'text-primary-600' : 
                    currentStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    Payment
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Choose payment method</div>
                </div>
              </div>
              
              {/* Step 3: Confirmation */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-3 transition-all duration-300 ${
                  currentStep === 'confirmation'
                    ? 'border-primary-600 bg-white shadow-lg shadow-primary-200'
                    : 'border-gray-200 bg-white'
                } relative z-10`}>
                  <CheckCircle className={`w-6 h-6 ${currentStep === 'confirmation' ? 'text-primary-600' : 'text-gray-400'}`} />
                </div>
                <div className="mt-3 text-center">
                  <div className={`font-semibold text-sm ${currentStep === 'confirmation' ? 'text-primary-600' : 'text-gray-400'}`}>
                    Confirmation
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Booking complete</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2">
            {currentStep === 'details' && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
                {/* Header */}
                <div className="p-8 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Rental Details</h2>
                      <p className="text-gray-600 mt-2">Please provide your booking information</p>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Takes ~2 mins</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                  <div className="space-y-10">
                    {/* Rental Period Section */}
                    <div>
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
                          <Calendar className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Rental Period</h3>
                          <p className="text-gray-600 text-sm">When do you need the {bookingItem.type === 'car' ? 'car' : 'item'}?</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pickup Date & Time */}
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="startDate" className="block text-sm font-semibold text-gray-900 mb-3">
                              Pickup Date <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="startDate"
                              name="startDate"
                              type="date"
                              value={formData.startDate}
                              onChange={handleChange}
                              required
                              min={new Date().toISOString().split('T')[0]}
                              className="block w-full border-2 rounded-xl p-4 text-gray-900 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label htmlFor="startTime" className="block text-sm font-semibold text-gray-900 mb-3">
                              Pickup Time <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="startTime"
                              name="startTime"
                              type="time"
                              value={formData.startTime}
                              onChange={handleChange}
                              required
                              className="block w-full border-2 rounded-xl p-4 text-gray-900 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                            />
                          </div>
                        </div>
                        {/* Return Date & Time */}
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="endDate" className="block text-sm font-semibold text-gray-900 mb-3">
                              Return Date <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="endDate"
                              name="endDate"
                              type="date"
                              value={formData.endDate}
                              onChange={handleChange}
                              required
                              min={formData.startDate || new Date().toISOString().split('T')[0]}
                              className="block w-full border-2 rounded-xl p-4 text-gray-900 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                            />
                          </div>
                          <div>
                            <label htmlFor="endTime" className="block text-sm font-semibold text-gray-900 mb-3">
                              Return Time <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="endTime"
                              name="endTime"
                              type="time"
                              value={formData.endTime}
                              onChange={handleChange}
                              required
                              className="block w-full border-2 rounded-xl p-4 text-gray-900 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Pickup Method */}
                    <div>
                      <label htmlFor="pickupMethod" className="block text-sm font-semibold text-gray-900 mb-3">
                        Pickup Method <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="pickupMethod"
                        name="pickupMethod"
                        value={formData.pickupMethod}
                        onChange={handleChange}
                        required
                        className="block w-full border-2 rounded-xl p-4 text-gray-900 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                      >
                        <option value="pickup">Pickup</option>
                        <option value="delivery">Delivery</option>
                      </select>
                    </div>
                    {/* Renter Notes */}
                    <div>
                      <label htmlFor="renterNotes" className="block text-sm font-semibold text-gray-900 mb-3">
                        Notes for Owner (optional)
                      </label>
                      <textarea
                        id="renterNotes"
                        name="renterNotes"
                        value={formData.renterNotes}
                        onChange={handleChange}
                        rows={3}
                        className="block w-full border-2 rounded-xl p-4 text-gray-900 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                        placeholder="Please call me when you arrive for pickup."
                      />
                    </div>
                  </div>
                  <div className="mt-10 pt-8 border-t border-gray-100">
                    <Button type="submit" className="w-full lg:w-auto px-12 py-4 text-lg font-semibold rounded-xl">
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        'Complete Booking'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {currentStep === 'payment' && (
              <PaymentStepper
                bookingId={bookingItem.id}
                amount={amount}
                currency={paymentMethods[0]?.currency || 'RWF'}
                onSuccess={() => setCurrentStep('confirmation')}
              />
            )}

            {currentStep === 'confirmation' && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 text-center">
                <div className="p-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Booking Confirmed!</h2>
                  <p className="text-lg text-gray-600 mb-8">
                    Your booking has been confirmed. You will receive a confirmation email shortly.
                  </p>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 mb-8 text-left">
                    <div className="flex items-center mb-6">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Booking Details</h3>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Booking ID</p>
                          <p className="text-lg font-bold text-gray-900">{bookingItem?.booking_id || bookingItem?.id || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">{bookingItem.type === 'car' ? 'Car' : 'Item'}</p>
                          <p className="text-lg font-bold text-gray-900">{bookingItem.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Pickup Date & Time</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'N/A'}, {formData.startTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Return Date & Time</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formData.endDate ? new Date(formData.endDate).toLocaleDateString() : 'N/A'}, {formData.endTime}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Payment Method</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {bookingItem?.payment_method || 'Unknown'}
                          </p>
                        </div>
                        {bookingItem?.mobile_money_number && (
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Mobile Money Number</p>
                            <p className="text-lg font-semibold text-gray-900">{bookingItem.phone_number}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Total Amount</p>
                          <p className="text-2xl font-bold text-primary-600">{bookingItem.base_price_per_day}</p>
                        </div>
                      </div>
                    </div>
                    {['mtn', 'airtel', 'mpesa', 'orange', 'wave', 'other-mobile'].includes(bookingItem?.payment_method || '') && (
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <Smartphone className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-blue-900 mb-2">Payment Status</h4>
                            <p className="text-sm text-blue-800">
                              A payment request has been sent to your mobile money account.
                              Please check your phone for the payment prompt and follow the instructions to complete the payment.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={() => navigate('/dashboard')} 
                    className="px-12 py-4 text-lg font-semibold rounded-xl"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Enhanced Order Summary */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 sticky top-32">
              {/* Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>
                  <div className="flex items-center text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4 mr-1" />
                    {rentalDays || 0} {rentalDays === 1 ? 'day' : 'days'}
                  </div>
                </div>
              </div>
              
              {/* Item Details */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start space-x-4">
                  <div className="relative">
                    <img
                      src={images[0]?.url || images[0]?.image_url || images[0]?.path || '/assets/img/placeholder-image.png'}
                      alt={bookingItem.name}
                      className="w-20 h-16 object-cover rounded-xl shadow-md border border-gray-200"
                    />
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">1</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 mb-1 truncate">{bookingItem.name}</h4>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">
                        {bookingItem.type === 'car' 
                          ? `${bookingItem.year} • ${bookingItem.transmission}` 
                          : `${bookingItem.category} • ${itemLocation.city || 'Unknown'}${itemLocation.country ? `, ${itemLocation.country}` : ''}`
                        }
                      </span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-lg font-bold text-primary-600">{formatPrice(itemPrice)}</span>
                      <span className="text-sm text-gray-500 ml-1">/ {bookingItem.type === 'car' ? 'day' : (bookingItem.priceUnit || 'day')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Cost Breakdown */}
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">Rental Cost</p>
                    <p className="text-xs text-gray-500">{rentalDays || 0} {rentalDays === 1 ? 'day' : 'days'} × {formatPrice(itemPrice)}</p>
                  </div>
                  <span className="font-bold text-gray-900">{formatPrice(amount)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900">Service Fee</p>
                    <p className="text-xs text-gray-500">Platform service charge (10%)</p>
                  </div>
                  <span className="font-bold text-gray-900">{formatPrice(serviceFee)}</span>
                </div>

                <div className="border-t border-dashed border-gray-300 my-4"></div>
                
                <div className="flex justify-between items-center py-2 bg-primary-50 rounded-xl px-4">
                  <div>
                    <p className="font-bold text-lg text-gray-900">Total Amount</p>
                    <p className="text-xs text-gray-600">Including all fees</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-2xl text-primary-600">{formatPrice(totalCost)}</span>
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              <div className="p-6 border-t border-gray-100">
                {currentStep === 'details' && (
                  <div className="bg-primary-50 border border-primary-200 text-primary-800 p-4 rounded-xl">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                        <AlertCircle className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Secure your booking now</p>
                        <p className="text-sm">Fill in the required information to proceed with your rental request.</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentStep === 'payment' && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Secure Payment</p>
                        <p className="text-sm">
                          Your payment information is secure and encrypted. We do not store your card details.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {currentStep === 'confirmation' && (
                  <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">Booking Confirmed</p>
                        <p className="text-sm">
                          Your booking has been successfully confirmed. Check your email for details.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowAddPaymentModal(false)}
            >
              &times;
            </button>
            <AddPaymentMethod
              onSuccess={() => {
                setShowAddPaymentModal(false);
                fetchAndSetPaymentMethods();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingPage;