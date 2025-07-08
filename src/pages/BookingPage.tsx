import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, CreditCard, Calendar, Clock, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { formatPrice } from '../lib/utils';
import { mockCars } from '../data/mockData';

const BookingPage: React.FC = () => {
  const { carId } = useParams<{ carId: string }>();
  const navigate = useNavigate();
  const car = mockCars.find(c => c.id === carId);
  
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
    agreeTerms: false
  });

  const [currentStep, setCurrentStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle case when car is not found
  if (!car) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          <h2 className="text-2xl font-bold mb-2">Car Not Found</h2>
          <p className="mb-4">The car you're looking for doesn't exist or has been removed.</p>
          <Link to="/cars" className="text-blue-600 hover:underline">
            Back to Cars
          </Link>
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep === 'details') {
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
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
  
  const rentalCost = car.price * rentalDays;
  const serviceFee = rentalCost * 0.1;
  const totalCost = rentalCost + serviceFee;

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-gray-100 py-4">
        <div className="container mx-auto px-4">
          <nav className="flex items-center text-sm">
            <Link to="/" className="text-gray-600 hover:text-primary-600">Home</Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <Link to="/cars" className="text-gray-600 hover:text-primary-600">Cars</Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <Link to={`/cars/${carId}`} className="text-gray-600 hover:text-primary-600">{car.name}</Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-primary-600 font-medium">Book Now</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-10">
          <div className={`flex flex-col items-center ${currentStep === 'details' ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep === 'details' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'} mb-2`}>
              <span className="font-semibold">1</span>
            </div>
            <span className="text-sm font-medium">Rental Details</span>
          </div>
          <div className={`w-16 h-0.5 ${currentStep !== 'details' ? 'bg-primary-600' : 'bg-gray-200'} mx-4`}></div>
          <div className={`flex flex-col items-center ${currentStep === 'payment' ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep === 'payment' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'} mb-2`}>
              <span className="font-semibold">2</span>
            </div>
            <span className="text-sm font-medium">Payment</span>
          </div>
          <div className={`w-16 h-0.5 ${currentStep === 'confirmation' ? 'bg-primary-600' : 'bg-gray-200'} mx-4`}></div>
          <div className={`flex flex-col items-center ${currentStep === 'confirmation' ? 'text-primary-600' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${currentStep === 'confirmation' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'} mb-2`}>
              <span className="font-semibold">3</span>
            </div>
            <span className="text-sm font-medium">Confirmation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 'details' && (
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Rental Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* Pickup Date */}
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Date <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-lg p-2">
                      <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                      <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Return Date */}
                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Return Date <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-lg p-2">
                      <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                      <input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                        className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Pickup Time */}
                  <div>
                    <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Time <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-lg p-2">
                      <Clock className="w-5 h-5 text-gray-400 mr-2" />
                      <input
                        id="startTime"
                        name="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={handleChange}
                        required
                        className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Return Time */}
                  <div>
                    <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Return Time <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-lg p-2">
                      <Clock className="w-5 h-5 text-gray-400 mr-2" />
                      <input
                        id="endTime"
                        name="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={handleChange}
                        required
                        className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Pickup Location */}
                  <div>
                    <label htmlFor="pickupLocation" className="block text-sm font-medium text-gray-700 mb-1">
                      Pickup Location <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-lg p-2">
                      <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                      <input
                        id="pickupLocation"
                        name="pickupLocation"
                        type="text"
                        value={formData.pickupLocation}
                        onChange={handleChange}
                        placeholder="Enter pickup location"
                        required
                        className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Dropoff Location */}
                  <div>
                    <label htmlFor="dropoffLocation" className="block text-sm font-medium text-gray-700 mb-1">
                      Dropoff Location <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-lg p-2">
                      <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                      <input
                        id="dropoffLocation"
                        name="dropoffLocation"
                        type="text"
                        value={formData.dropoffLocation}
                        onChange={handleChange}
                        placeholder="Enter dropoff location"
                        required
                        className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="block w-full border border-gray-300 rounded-lg p-2.5 text-gray-900"
                    />
                  </div>
                  
                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="block w-full border border-gray-300 rounded-lg p-2.5 text-gray-900"
                    />
                  </div>
                  
                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="block w-full border border-gray-300 rounded-lg p-2.5 text-gray-900"
                    />
                  </div>
                  
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="block w-full border border-gray-300 rounded-lg p-2.5 text-gray-900"
                    />
                  </div>
                </div>
                
                <div className="mt-8">
                  <Button type="submit" className="w-full md:w-auto px-8">
                    Continue to Payment
                  </Button>
                </div>
              </form>
            )}

            {currentStep === 'payment' && (
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Information</h2>
                
                <div className="space-y-6 mb-8">
                  {/* Payment Methods */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className={`border rounded-lg p-4 flex items-center cursor-pointer ${formData.paymentMethod === 'credit-card' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="credit-card"
                          checked={formData.paymentMethod === 'credit-card'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <CreditCard className="w-5 h-5 mr-2" />
                        <span>Credit Card</span>
                      </label>
                      <label className={`border rounded-lg p-4 flex items-center cursor-pointer ${formData.paymentMethod === 'paypal' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="paypal"
                          checked={formData.paymentMethod === 'paypal'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span>PayPal</span>
                      </label>
                      <label className={`border rounded-lg p-4 flex items-center cursor-pointer ${formData.paymentMethod === 'stripe' ? 'border-primary-600 bg-primary-50' : 'border-gray-200'}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="stripe"
                          checked={formData.paymentMethod === 'stripe'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span>Stripe</span>
                      </label>
                    </div>
                  </div>

                  {formData.paymentMethod === 'credit-card' && (
                    <>
                      {/* Card Number */}
                      <div>
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="cardNumber"
                          name="cardNumber"
                          type="text"
                          value={formData.cardNumber}
                          onChange={handleChange}
                          placeholder="1234 5678 9012 3456"
                          required
                          className="block w-full border border-gray-300 rounded-lg p-2.5 text-gray-900"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        {/* Expiry Date */}
                        <div>
                          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="expiryDate"
                            name="expiryDate"
                            type="text"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            placeholder="MM/YY"
                            required
                            className="block w-full border border-gray-300 rounded-lg p-2.5 text-gray-900"
                          />
                        </div>

                        {/* CVV */}
                        <div>
                          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                            CVV <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="cvv"
                            name="cvv"
                            type="text"
                            value={formData.cvv}
                            onChange={handleChange}
                            placeholder="123"
                            required
                            className="block w-full border border-gray-300 rounded-lg p-2.5 text-gray-900"
                          />
                        </div>
                      </div>

                      {/* Name on Card */}
                      <div>
                        <label htmlFor="nameOnCard" className="block text-sm font-medium text-gray-700 mb-1">
                          Name on Card <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="nameOnCard"
                          name="nameOnCard"
                          type="text"
                          value={formData.nameOnCard}
                          onChange={handleChange}
                          required
                          className="block w-full border border-gray-300 rounded-lg p-2.5 text-gray-900"
                        />
                      </div>
                    </>
                  )}

                  {/* Terms Agreement */}
                  <div className="flex items-start">
                    <input
                      id="agreeTerms"
                      name="agreeTerms"
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      required
                      className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="agreeTerms" className="ml-2 text-sm text-gray-600">
                      I agree to the <Link to="/terms" className="text-primary-600 hover:underline">terms and conditions</Link> and <Link to="/privacy" className="text-primary-600 hover:underline">privacy policy</Link>
                    </label>
                  </div>
                </div>
                
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep('details')}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="px-8"
                    disabled={!formData.agreeTerms || isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Complete Booking'}
                  </Button>
                </div>
              </form>
            )}

            {currentStep === 'confirmation' && (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="mb-6">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-600 mb-6">
                  Your booking has been confirmed. You will receive a confirmation email shortly.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8 text-left">
                  <h3 className="font-semibold text-gray-900 mb-2">Booking Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Booking ID</p>
                      <p className="font-medium">ECAR-{Math.floor(Math.random() * 10000)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Car</p>
                      <p className="font-medium">{car.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pickup Date & Time</p>
                      <p className="font-medium">
                        {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'N/A'}, {formData.startTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Return Date & Time</p>
                      <p className="font-medium">
                        {formData.endDate ? new Date(formData.endDate).toLocaleDateString() : 'N/A'}, {formData.endTime}
                      </p>
                    </div>
                  </div>
                </div>
                <Button onClick={() => navigate('/dashboard')} className="px-8">
                  Go to Dashboard
                </Button>
              </div>
            )}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="flex items-center mb-6">
                <img
                  src={car.images[0]}
                  alt={car.name}
                  className="w-20 h-16 object-cover rounded-md mr-4"
                />
                <div>
                  <h4 className="font-medium text-gray-900">{car.name}</h4>
                  <p className="text-sm text-gray-600">{car.year} • {car.transmission}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 pb-2">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Rental Rate</span>
                  <span className="font-medium">{formatPrice(car.price)} / day</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{rentalDays || 0} days</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Rental Cost</span>
                  <span className="font-medium">{formatPrice(rentalCost)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-medium">{formatPrice(serviceFee)}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-2">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-xl">{formatPrice(totalCost)}</span>
                </div>
              </div>
              
              {currentStep === 'details' && (
                <div className="mt-6 bg-blue-50 text-blue-700 p-3 rounded-md flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">
                    Please fill in all the required fields to proceed with your booking.
                  </p>
                </div>
              )}
              
              {currentStep === 'payment' && (
                <div className="mt-6 bg-blue-50 text-blue-700 p-3 rounded-md flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">
                    Your payment information is secure and encrypted. We do not store your credit card details.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingPage;
