import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, CreditCard, Calendar, Clock, MapPin, AlertCircle, CheckCircle, Smartphone, Wallet, Banknote, User, Mail, Phone } from 'lucide-react';
import Button from '../components/ui/Button';
import { formatPrice } from '../lib/utils';
import { mockCars } from '../data/mockData';
import { mockRentalItems } from '../data/mockRentalData';
import type { RentalItem } from '../types/rentalItem';

const BookingPage: React.FC = () => {
  const { carId, itemId } = useParams<{ carId?: string; itemId?: string }>();
  const navigate = useNavigate();
  
  // Support both legacy car bookings and new item bookings
  const bookingId = itemId || carId;
  const isLegacyCarBooking = !!carId && !itemId;
  
  // Find the item/car being booked
  let bookingItem: RentalItem | any = null;
  let isCarItem = false;
  
  if (isLegacyCarBooking) {
    // Legacy car booking - find in mockCars and convert to RentalItem format
    const car = mockCars.find(c => c.id === carId);
    if (car) {
      bookingItem = car;
      isCarItem = true;
    }
  } else {
    // New item booking - find in mockRentalItems
    bookingItem = mockRentalItems.find(item => item.id === itemId);
  }
  
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    startTime: '10:00',
    endTime: '10:00',
    pickupLocation: '',
    dropoffLocation: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    paymentMethod: 'credit-card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: '',
    mobileMoneyProvider: 'mtn',
    mobileMoneyNumber: '',
    agreeTerms: false
  });

  const [currentStep, setCurrentStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle case when item/car is not found
  if (!bookingItem) {
    const itemType = isLegacyCarBooking ? 'Car' : 'Item';
    const backLink = isLegacyCarBooking ? '/cars' : '/items';
    const backText = isLegacyCarBooking ? 'Back to Cars' : 'Back to Items';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">{itemType} Not Found</h2>
            <p className="text-gray-600 mb-8">The {itemType.toLowerCase()} you're looking for doesn't exist or has been removed.</p>
            <Link 
              to={backLink} 
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors"
            >
              {backText}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 'details') {
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      // Validate form based on payment method
      let errors: Record<string, string> = {};
      
      if (['mtn', 'airtel', 'mpesa', 'orange', 'wave', 'other-mobile'].includes(formData.paymentMethod)) {
        // Mobile money validation
        if (!formData.mobileMoneyNumber.trim()) {
          errors.mobileMoneyNumber = 'Mobile money number is required';
        } else if (!/^\+?[0-9]{10,15}$/.test(formData.mobileMoneyNumber.replace(/\s+/g, ''))) {
          errors.mobileMoneyNumber = 'Please enter a valid mobile number (10-15 digits)';
        }
      } else if (formData.paymentMethod === 'credit-card') {
        // Credit card validation
        if (!formData.cardNumber.trim()) {
          errors.cardNumber = 'Card number is required';
        }
        if (!formData.expiryDate.trim()) {
          errors.expiryDate = 'Expiry date is required';
        }
        if (!formData.cvv.trim()) {
          errors.cvv = 'CVV is required';
        }
        if (!formData.nameOnCard.trim()) {
          errors.nameOnCard = 'Name on card is required';
        }
      }
      
      // If there are validation errors, show them and don't proceed
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }
      
      // Clear any previous errors
      setValidationErrors({});
      setIsSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        setCurrentStep('confirmation');
      }, 1500);
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
  
  // Get pricing info - handle both car and item formats
  const itemPrice = isCarItem ? bookingItem.price : bookingItem.price;
  const rentalCost = itemPrice * rentalDays;
  const serviceFee = rentalCost * 0.1;
  const totalCost = rentalCost + serviceFee;

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
                  src={bookingItem.images[0]} 
                  alt={bookingItem.name}
                  className="w-8 h-8 object-cover rounded-lg mr-2 border border-gray-200 group-hover:border-primary-300 transition-colors"
                />
                <span className="font-medium truncate max-w-[150px]">{bookingItem.name}</span>
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
                          <p className="text-gray-600 text-sm">When do you need the {isCarItem ? 'car' : 'item'}?</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pickup Date & Time */}
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="startDate" className="block text-sm font-semibold text-gray-900 mb-3">
                              Pickup Date <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                              <div className="flex items-center border-2 border-gray-200 rounded-xl p-4 group-hover:border-primary-300 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100 transition-all duration-200">
                                <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center mr-3">
                                  <Calendar className="w-4 h-4 text-primary-600" />
                                </div>
                                <input
                                  id="startDate"
                                  name="startDate"
                                  type="date"
                                  value={formData.startDate}
                                  onChange={handleChange}
                                  required
                                  min={new Date().toISOString().split('T')[0]}
                                  className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 text-sm bg-transparent font-medium"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <label htmlFor="startTime" className="block text-sm font-semibold text-gray-900 mb-3">
                              Pickup Time <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center border-2 border-gray-200 rounded-xl p-4 hover:border-primary-300 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100 transition-all duration-200">
                              <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center mr-3">
                                <Clock className="w-4 h-4 text-primary-600" />
                              </div>
                              <input
                                id="startTime"
                                name="startTime"
                                type="time"
                                value={formData.startTime}
                                onChange={handleChange}
                                required
                                className="block w-full border-0 p-0 text-gray-900 focus:ring-0 text-sm bg-transparent font-medium"
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Return Date & Time */}
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="endDate" className="block text-sm font-semibold text-gray-900 mb-3">
                              Return Date <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center border-2 border-gray-200 rounded-xl p-4 hover:border-primary-300 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100 transition-all duration-200">
                              <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center mr-3">
                                <Calendar className="w-4 h-4 text-primary-600" />
                              </div>
                              <input
                                id="endDate"
                                name="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={handleChange}
                                required
                                min={formData.startDate || new Date().toISOString().split('T')[0]}
                                className="block w-full border-0 p-0 text-gray-900 focus:ring-0 text-sm bg-transparent font-medium"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label htmlFor="endTime" className="block text-sm font-semibold text-gray-900 mb-3">
                              Return Time <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center border-2 border-gray-200 rounded-xl p-4 hover:border-primary-300 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100 transition-all duration-200">
                              <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center mr-3">
                                <Clock className="w-4 h-4 text-primary-600" />
                              </div>
                              <input
                                id="endTime"
                                name="endTime"
                                type="time"
                                value={formData.endTime}
                                onChange={handleChange}
                                required
                                className="block w-full border-0 p-0 text-gray-900 focus:ring-0 text-sm bg-transparent font-medium"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Location Fields */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                        <div>
                          <label htmlFor="pickupLocation" className="block text-sm font-semibold text-gray-900 mb-3">
                            Pickup Location <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center border-2 border-gray-200 rounded-xl p-4 hover:border-primary-300 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100 transition-all duration-200">
                            <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center mr-3">
                              <MapPin className="w-4 h-4 text-primary-600" />
                            </div>
                            <input
                              id="pickupLocation"
                              name="pickupLocation"
                              type="text"
                              value={formData.pickupLocation}
                              onChange={handleChange}
                              placeholder="Enter pickup location"
                              required
                              className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 text-sm bg-transparent"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="dropoffLocation" className="block text-sm font-semibold text-gray-900 mb-3">
                            Dropoff Location <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center border-2 border-gray-200 rounded-xl p-4 hover:border-primary-300 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100 transition-all duration-200">
                            <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center mr-3">
                              <MapPin className="w-4 h-4 text-primary-600" />
                            </div>
                            <input
                              id="dropoffLocation"
                              name="dropoffLocation"
                              type="text"
                              value={formData.dropoffLocation}
                              onChange={handleChange}
                              placeholder="Enter dropoff location"
                              required
                              className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 text-sm bg-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Personal Information Section */}
                    <div>
                      <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                          <p className="text-gray-600 text-sm">We need this information for your booking</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-semibold text-gray-900 mb-3">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center border-2 border-gray-200 rounded-xl p-4 hover:border-primary-300 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100 transition-all duration-200">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <input
                              id="firstName"
                              name="firstName"
                              type="text"
                              value={formData.firstName}
                              onChange={handleChange}
                              placeholder="Enter your first name"
                              required
                              className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 text-sm bg-transparent"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-semibold text-gray-900 mb-3">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center border-2 border-gray-200 rounded-xl p-4 hover:border-primary-300 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100 transition-all duration-200">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <input
                              id="lastName"
                              name="lastName"
                              type="text"
                              value={formData.lastName}
                              onChange={handleChange}
                              placeholder="Enter your last name"
                              required
                              className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 text-sm bg-transparent"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-3">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center border-2 border-gray-200 rounded-xl p-4 hover:border-primary-300 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100 transition-all duration-200">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                              <Mail className="w-4 h-4 text-blue-600" />
                            </div>
                            <input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="Enter your email address"
                              required
                              className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 text-sm bg-transparent"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-3">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center border-2 border-gray-200 rounded-xl p-4 hover:border-primary-300 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100 transition-all duration-200">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                              <Phone className="w-4 h-4 text-blue-600" />
                            </div>
                            <input
                              id="phone"
                              name="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={handleChange}
                              placeholder="Enter your phone number"
                              required
                              className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 text-sm bg-transparent"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-10 pt-8 border-t border-gray-100">
                    <Button type="submit" className="w-full lg:w-auto px-12 py-4 text-lg font-semibold rounded-xl">
                      Continue to Payment
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {currentStep === 'payment' && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
                {/* Header */}
                <div className="p-8 border-b border-gray-100">
                  <h2 className="text-3xl font-bold text-gray-900">Payment Information</h2>
                  <p className="text-gray-600 mt-2">Choose your preferred payment method</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                  <div className="space-y-8">
                    {/* Payment Method Selection */}
                    <div>
                      <label className="block text-lg font-bold text-gray-900 mb-6">
                        Select Payment Method
                      </label>
                      
                      {/* Card Payment Options */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Card Payment</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[
                            { value: 'credit-card', label: 'Credit/Debit Card', icon: CreditCard },
                            { value: 'stripe', label: 'Stripe', icon: CreditCard },
                            { value: 'paypal', label: 'PayPal', icon: Wallet }
                          ].map((option) => (
                            <label key={option.value} className={`border-2 rounded-xl p-4 flex items-center cursor-pointer transition-all duration-200 hover:shadow-md ${
                              formData.paymentMethod === option.value 
                                ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100' 
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}>
                              <input
                                type="radio"
                                name="paymentMethod"
                                value={option.value}
                                checked={formData.paymentMethod === option.value}
                                onChange={handleChange}
                                className="sr-only"
                              />
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                                formData.paymentMethod === option.value ? 'bg-primary-100' : 'bg-gray-100'
                              }`}>
                                <option.icon className={`w-4 h-4 ${
                                  formData.paymentMethod === option.value ? 'text-primary-600' : 'text-gray-600'
                                }`} />
                              </div>
                              <span className={`text-sm font-medium ${
                                formData.paymentMethod === option.value ? 'text-primary-900' : 'text-gray-700'
                              }`}>
                                {option.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      {/* Mobile Money Options */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 mb-6">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                            <Smartphone className="w-5 h-5 text-green-600" />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">Mobile Money</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {[
                            { value: 'mtn', label: 'MTN MoMo', color: 'bg-yellow-400', textColor: 'text-black' },
                            { value: 'airtel', label: 'Airtel Money', color: 'bg-red-500', textColor: 'text-white' },
                            { value: 'mpesa', label: 'M-Pesa', color: 'bg-green-600', textColor: 'text-white' },
                            { value: 'orange', label: 'Orange Money', color: 'bg-orange-500', textColor: 'text-white' },
                            { value: 'wave', label: 'Wave', color: 'bg-blue-500', textColor: 'text-white' },
                            { value: 'other-mobile', label: 'Other Mobile', color: 'bg-purple-600', textColor: 'text-white' }
                          ].map((option) => (
                            <label key={option.value} className={`border-2 rounded-xl p-4 flex flex-col items-center cursor-pointer transition-all duration-200 hover:shadow-md ${
                              formData.paymentMethod === option.value 
                                ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100' 
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }`}>
                              <input
                                type="radio"
                                name="paymentMethod"
                                value={option.value}
                                checked={formData.paymentMethod === option.value}
                                onChange={handleChange}
                                className="sr-only"
                              />
                              <div className={`w-10 h-10 ${option.color} rounded-full flex items-center justify-center mb-2 ${option.textColor}`}>
                                {option.value === 'other-mobile' ? (
                                  <Wallet className="w-5 h-5" />
                                ) : (
                                  <Smartphone className="w-5 h-5" />
                                )}
                              </div>
                              <span className={`text-xs font-medium text-center ${
                                formData.paymentMethod === option.value ? 'text-primary-900' : 'text-gray-700'
                              }`}>
                                {option.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      {/* Cash Payment */}
                      <label className={`border-2 rounded-xl p-6 flex items-center cursor-pointer transition-all duration-200 hover:shadow-md ${
                        formData.paymentMethod === 'cash' 
                          ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-100' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash"
                          checked={formData.paymentMethod === 'cash'}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                          formData.paymentMethod === 'cash' ? 'bg-primary-100' : 'bg-gray-100'
                        }`}>
                          <Banknote className={`w-6 h-6 ${
                            formData.paymentMethod === 'cash' ? 'text-primary-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div>
                          <div className={`font-semibold ${
                            formData.paymentMethod === 'cash' ? 'text-primary-900' : 'text-gray-900'
                          }`}>
                            Cash on Pickup
                          </div>
                          <div className="text-sm text-gray-600">Pay when you collect the item</div>
                        </div>
                      </label>
                    </div>

                    {/* Credit Card Fields */}
                    {formData.paymentMethod === 'credit-card' && (
                      <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Card Details</h4>
                        
                        <div>
                          <label htmlFor="cardNumber" className="block text-sm font-semibold text-gray-900 mb-3">
                            Card Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="cardNumber"
                            name="cardNumber"
                            type="text"
                            value={formData.cardNumber}
                            onChange={(e) => {
                              handleChange(e);
                              if (validationErrors.cardNumber) {
                                setValidationErrors(prev => ({
                                  ...prev,
                                  cardNumber: ''
                                }));
                              }
                            }}
                            placeholder="1234 5678 9012 3456"
                            required
                            className={`block w-full border-2 rounded-xl p-4 text-gray-900 focus:ring-4 focus:ring-primary-100 transition-all duration-200 ${
                              validationErrors.cardNumber ? 'border-red-500' : 'border-gray-200 focus:border-primary-500'
                            }`}
                          />
                          {validationErrors.cardNumber && (
                            <p className="mt-2 text-sm text-red-600">{validationErrors.cardNumber}</p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="expiryDate" className="block text-sm font-semibold text-gray-900 mb-3">
                              Expiry Date <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="expiryDate"
                              name="expiryDate"
                              type="text"
                              value={formData.expiryDate}
                              onChange={(e) => {
                                handleChange(e);
                                if (validationErrors.expiryDate) {
                                  setValidationErrors(prev => ({
                                    ...prev,
                                    expiryDate: ''
                                  }));
                                }
                              }}
                              placeholder="MM/YY"
                              required
                              className={`block w-full border-2 rounded-xl p-4 text-gray-900 focus:ring-4 focus:ring-primary-100 transition-all duration-200 ${
                                validationErrors.expiryDate ? 'border-red-500' : 'border-gray-200 focus:border-primary-500'
                              }`}
                            />
                            {validationErrors.expiryDate && (
                              <p className="mt-2 text-sm text-red-600">{validationErrors.expiryDate}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="cvv" className="block text-sm font-semibold text-gray-900 mb-3">
                              CVV <span className="text-red-500">*</span>
                            </label>
                            <input
                              id="cvv"
                              name="cvv"
                              type="text"
                              value={formData.cvv}
                              onChange={(e) => {
                                handleChange(e);
                                if (validationErrors.cvv) {
                                  setValidationErrors(prev => ({
                                    ...prev,
                                    cvv: ''
                                  }));
                                }
                              }}
                              placeholder="123"
                              required
                              className={`block w-full border-2 rounded-xl p-4 text-gray-900 focus:ring-4 focus:ring-primary-100 transition-all duration-200 ${
                                validationErrors.cvv ? 'border-red-500' : 'border-gray-200 focus:border-primary-500'
                              }`}
                            />
                            {validationErrors.cvv && (
                              <p className="mt-2 text-sm text-red-600">{validationErrors.cvv}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label htmlFor="nameOnCard" className="block text-sm font-semibold text-gray-900 mb-3">
                            Name on Card <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="nameOnCard"
                            name="nameOnCard"
                            type="text"
                            value={formData.nameOnCard}
                            onChange={(e) => {
                              handleChange(e);
                              if (validationErrors.nameOnCard) {
                                setValidationErrors(prev => ({
                                  ...prev,
                                  nameOnCard: ''
                                }));
                              }
                            }}
                            placeholder="Enter name as on card"
                            required
                            className={`block w-full border-2 rounded-xl p-4 text-gray-900 focus:ring-4 focus:ring-primary-100 transition-all duration-200 ${
                              validationErrors.nameOnCard ? 'border-red-500' : 'border-gray-200 focus:border-primary-500'
                            }`}
                          />
                          {validationErrors.nameOnCard && (
                            <p className="mt-2 text-sm text-red-600">{validationErrors.nameOnCard}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Mobile Money Fields */}
                    {['mtn', 'airtel', 'mpesa', 'orange', 'wave', 'other-mobile'].includes(formData.paymentMethod) && (
                      <div className="bg-gray-50 rounded-2xl p-6 space-y-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Mobile Money Details</h4>
                        
                        {formData.paymentMethod === 'other-mobile' && (
                          <div>
                            <label htmlFor="mobileMoneyProvider" className="block text-sm font-semibold text-gray-900 mb-3">
                              Mobile Money Provider <span className="text-red-500">*</span>
                            </label>
                            <select
                              id="mobileMoneyProvider"
                              name="mobileMoneyProvider"
                              value={formData.mobileMoneyProvider}
                              onChange={handleChange}
                              required
                              className="block w-full border-2 border-gray-200 rounded-xl p-4 text-gray-900 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200"
                            >
                              <option value="mtn">MTN Mobile Money</option>
                              <option value="airtel">Airtel Money</option>
                              <option value="mpesa">M-Pesa</option>
                              <option value="orange">Orange Money</option>
                              <option value="wave">Wave</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        )}

                        <div>
                          <label htmlFor="mobileMoneyNumber" className="block text-sm font-semibold text-gray-900 mb-3">
                            Mobile Money Number <span className="text-red-500">*</span>
                          </label>
                          <div className={`flex items-center border-2 rounded-xl p-4 transition-all duration-200 ${
                            validationErrors.mobileMoneyNumber ? 'border-red-500' : 'border-gray-200 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100'
                          }`}>
                            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center mr-3">
                              <Smartphone className="w-4 h-4 text-green-600" />
                            </div>
                            <input
                              id="mobileMoneyNumber"
                              name="mobileMoneyNumber"
                              type="tel"
                              value={formData.mobileMoneyNumber}
                              onChange={(e) => {
                                handleChange(e);
                                if (validationErrors.mobileMoneyNumber) {
                                  setValidationErrors(prev => ({
                                    ...prev,
                                    mobileMoneyNumber: ''
                                  }));
                                }
                              }}
                              placeholder={`Enter your ${
                                formData.paymentMethod === 'mtn' ? 'MTN' : 
                                formData.paymentMethod === 'airtel' ? 'Airtel' : 
                                formData.paymentMethod === 'mpesa' ? 'M-Pesa' : 
                                formData.paymentMethod === 'orange' ? 'Orange' : 
                                formData.paymentMethod === 'wave' ? 'Wave' : 
                                'Mobile Money'
                              } number`}
                              required
                              className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 text-sm bg-transparent"
                            />
                          </div>
                          {validationErrors.mobileMoneyNumber ? (
                            <p className="mt-2 text-sm text-red-600">{validationErrors.mobileMoneyNumber}</p>
                          ) : (
                            <p className="mt-2 text-sm text-gray-600">
                              Enter your {
                                formData.paymentMethod === 'mtn' ? 'MTN' : 
                                formData.paymentMethod === 'airtel' ? 'Airtel Money' :
                                formData.paymentMethod === 'mpesa' ? 'M-Pesa' :
                                formData.paymentMethod === 'orange' ? 'Orange Money' :
                                formData.paymentMethod === 'wave' ? 'Wave' :
                                'mobile money'
                              } number including country code.
                            </p>
                          )}
                        </div>

                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                          <div className="flex items-start">
                            <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mr-3 mt-0.5">
                              <AlertCircle className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-blue-900 mb-2">Payment Instructions</h5>
                              <p className="text-sm text-blue-800 mb-2">
                                After submitting, you will receive a {
                                  formData.paymentMethod === 'mtn' ? 'MTN Mobile Money' : 
                                  formData.paymentMethod === 'airtel' ? 'Airtel Money' :
                                  formData.paymentMethod === 'mpesa' ? 'M-Pesa' :
                                  formData.paymentMethod === 'orange' ? 'Orange Money' :
                                  formData.paymentMethod === 'wave' ? 'Wave' :
                                  'mobile money'
                                } prompt on your phone.
                              </p>
                              <p className="text-sm font-medium text-blue-900">
                                Note: Please ensure your mobile money account is active and has sufficient funds.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Terms Agreement */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <div className="flex items-start">
                        <input
                          id="agreeTerms"
                          name="agreeTerms"
                          type="checkbox"
                          checked={formData.agreeTerms}
                          onChange={handleChange}
                          required
                          className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor="agreeTerms" className="ml-3 text-sm text-gray-700">
                          I agree to the{' '}
                          <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium underline">
                            terms and conditions
                          </Link>
                          {' '}and{' '}
                          <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium underline">
                            privacy policy
                          </Link>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Form Errors */}
                  {Object.keys(validationErrors).length > 0 && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-red-800 mb-2">Please correct the following errors:</p>
                          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                            {Object.values(validationErrors).map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep('details')}
                      className="px-8 py-4 text-lg font-semibold rounded-xl border-2"
                    >
                      Back to Details
                    </Button>
                    <Button
                      type="submit"
                      className="px-12 py-4 text-lg font-semibold rounded-xl"
                      disabled={!formData.agreeTerms || isSubmitting}
                    >
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
                          <p className="text-lg font-bold text-gray-900">ECAR-{Math.floor(Math.random() * 10000)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">{isLegacyCarBooking ? 'Car' : 'Item'}</p>
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
                            {formData.paymentMethod === 'credit-card' ? 'Credit/Debit Card' :
                             formData.paymentMethod === 'stripe' ? 'Stripe' :
                             formData.paymentMethod === 'paypal' ? 'PayPal' :
                             formData.paymentMethod === 'mtn' ? 'MTN Mobile Money' :
                             formData.paymentMethod === 'airtel' ? 'Airtel Money' :
                             formData.paymentMethod === 'mpesa' ? 'M-Pesa' :
                             formData.paymentMethod === 'orange' ? 'Orange Money' :
                             formData.paymentMethod === 'wave' ? 'Wave' :
                             formData.paymentMethod === 'other-mobile' ? 'Other Mobile Money' :
                             formData.paymentMethod === 'cash' ? 'Cash on Pickup' : 'Unknown'}
                          </p>
                        </div>

                        {['mtn', 'airtel', 'mpesa', 'orange', 'wave', 'other-mobile'].includes(formData.paymentMethod) && (
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Mobile Money Number</p>
                            <p className="text-lg font-semibold text-gray-900">{formData.mobileMoneyNumber}</p>
                          </div>
                        )}
                        
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Total Amount</p>
                          <p className="text-2xl font-bold text-primary-600">{formatPrice(totalCost)}</p>
                        </div>
                      </div>
                    </div>
                    
                    {['mtn', 'airtel', 'mpesa', 'orange', 'wave', 'other-mobile'].includes(formData.paymentMethod) && (
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
                      src={bookingItem.images[0]}
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
                        {isCarItem 
                          ? `${bookingItem.year} • ${bookingItem.transmission}` 
                          : `${bookingItem.category} • ${bookingItem.location.city}`
                        }
                      </span>
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-lg font-bold text-primary-600">{formatPrice(itemPrice)}</span>
                      <span className="text-sm text-gray-500 ml-1">/ {isCarItem ? 'day' : (bookingItem.priceUnit || 'day')}</span>
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
                  <span className="font-bold text-gray-900">{formatPrice(rentalCost)}</span>
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
    </div>
  );
}

export default BookingPage;