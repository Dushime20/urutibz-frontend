import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, CheckCircle, XCircle, Loader2, AlertCircle,
  Calendar, MapPin, Package, ArrowRight, Trash2, X
} from 'lucide-react';
import { useCart, CartItem } from '../contexts/CartContext';
import { useTranslation } from '../hooks/useTranslation';
import { TranslatedText } from '../components/translated-text';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { createBooking, processPaymentTransaction, fetchPaymentMethods, fetchDefaultPaymentMethods, PaymentMethodRecord, addPaymentMethod } from './booking-page/service/api';
import Button from '../components/ui/Button';
import { CreditCard, Smartphone } from 'lucide-react';

interface BookingStatus {
  itemId: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  bookingId?: string;
  error?: string;
  paymentStatus?: 'pending' | 'processing' | 'success' | 'error';
  paymentError?: string;
  transactionId?: string;
}

const CartCheckoutPage: React.FC = () => {
  const { items, clearCart, removeFromCart } = useCart();
  const { tSync } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [bookingStatuses, setBookingStatuses] = useState<BookingStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRecord[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showPaymentSelection, setShowPaymentSelection] = useState(false);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'bookings' | 'payment-type' | 'payment-details' | 'processing'>('bookings');
  const [selectedPaymentType, setSelectedPaymentType] = useState<'card' | 'mobile_money' | null>(null);
  const [paymentDetails, setPaymentDetails] = useState({
    phoneNumber: '',
    provider: 'mtn_momo',
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  const [allBookingsCreated, setAllBookingsCreated] = useState(false);
  const [itemsByOwner, setItemsByOwner] = useState<Record<string, CartItem[]>>({});
  const [hasMultipleOwners, setHasMultipleOwners] = useState(false);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    // Group items by owner
    const grouped: Record<string, CartItem[]> = {};
    items.forEach(item => {
      if (!grouped[item.ownerId]) {
        grouped[item.ownerId] = [];
      }
      grouped[item.ownerId].push(item);
    });

    setItemsByOwner(grouped);
    const ownerIds = Object.keys(grouped);
    const multipleOwners = ownerIds.length > 1;
    setHasMultipleOwners(multipleOwners);

    // If multiple owners, don't allow checkout
    // User will need to remove items from other owners
    if (multipleOwners) {
      setSelectedOwnerId(null); // Don't allow checkout
    } else {
      setSelectedOwnerId(ownerIds[0] || null);
    }

    // Initialize booking statuses only for single owner's items
    const itemsToProcess = multipleOwners ? [] : items;
    setBookingStatuses(
      itemsToProcess.map(item => ({
        itemId: item.id,
        status: 'pending',
        paymentStatus: 'pending'
      }))
    );
  }, [items, navigate]);

  const loadPaymentMethods = async () => {
    setLoadingPaymentMethods(true);
    try {
      const token = localStorage.getItem('token');
      const methods = await fetchDefaultPaymentMethods(token || undefined);
      setPaymentMethods(methods);
      if (methods.length > 0) {
        const defaultMethod = methods.find(m => m.is_default) || methods[0];
        setSelectedPaymentMethod(defaultMethod.id);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const formatCurrency = (amount: number, currency: string): string => {
    const currencySymbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
      'CHF': 'CHF',
      'CNY': '¥',
      'INR': '₹',
      'RWF': 'RWF'
    };
    
    const symbol = currencySymbols[currency] || currency;
    return symbol === currency ? `${currency} ${amount.toFixed(2)}` : `${symbol}${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const processBookings = async () => {
    if (!user) {
      showToast(tSync('Please log in to checkout'), 'error');
      navigate('/login');
      return;
    }

    // Prevent checkout if multiple owners
    if (hasMultipleOwners) {
      showToast(tSync('Cannot checkout items from multiple owners. Please remove items from other owners first.'), 'error');
      return;
    }

    setIsProcessing(true);
    setCurrentIndex(0);
    setCompletedCount(0);
    setFailedCount(0);

    const token = localStorage.getItem('token');
    if (!token) {
      showToast(tSync('Authentication required'), 'error');
      navigate('/login');
      return;
    }

    // Process each item sequentially
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      setCurrentIndex(i);

      // Update status to processing
      setBookingStatuses(prev =>
        prev.map(status =>
          status.itemId === item.id
            ? { ...status, status: 'processing' }
            : status
        )
      );

      try {
        // Prepare booking data - ensure dates are in correct format and times are provided
        const startDate = new Date(item.startDate);
        const endDate = new Date(item.endDate);
        
        // Format dates as YYYY-MM-DD (not ISO string with time)
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        const bookingData = {
          product_id: item.productId,
          renter_id: user.id,
          owner_id: item.ownerId,
          start_date: startDateStr, // YYYY-MM-DD format only
          end_date: endDateStr, // YYYY-MM-DD format only
          pickup_method: item.pickupMethod || 'pickup',
          pickup_time: '09:00', // Default pickup time in HH:MM format
          return_time: '17:00', // Default return time in HH:MM format
          delivery_address: item.deliveryAddress,
          special_instructions: item.specialInstructions,
          // Calculate total amount
          total_amount: item.totalPrice,
          currency: item.currency,
        };

        // Create booking
        const result = await createBooking(bookingData, token);

        if (result.success && result.data) {
          const bookingId = result.data?.data?.id || result.data?.id;
          
          // Update status to success (booking created)
          setBookingStatuses(prev =>
            prev.map(status =>
              status.itemId === item.id
                ? {
                    ...status,
                    status: 'success',
                    bookingId,
                    paymentStatus: 'processing'
                  }
                : status
            )
          );

          setCompletedCount(prev => prev + 1);
        } else {
          // Update status to error
          setBookingStatuses(prev =>
            prev.map(status =>
              status.itemId === item.id
                ? {
                    ...status,
                    status: 'error',
                    error: result.error || tSync('Failed to create booking')
                  }
                : status
            )
          );
          setFailedCount(prev => prev + 1);
          showToast(
            `${tSync('Failed to book')} ${item.productTitle}: ${result.error || tSync('Unknown error')}`,
            'error'
          );
        }
      } catch (error: any) {
        // Update status to error
        setBookingStatuses(prev =>
          prev.map(status =>
            status.itemId === item.id
              ? {
                  ...status,
                  status: 'error',
                  error: error.message || tSync('Network error')
                }
              : status
          )
        );
        setFailedCount(prev => prev + 1);
        showToast(
          `${tSync('Error booking')} ${item.productTitle}`,
          'error'
        );
      }

      // Small delay between bookings to avoid overwhelming the server
      if (i < items.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setIsProcessing(false);
    
    // Check if all bookings were created successfully
    const allSuccess = bookingStatuses.every(s => s.status === 'success');
    if (allSuccess) {
      setAllBookingsCreated(true);
      setCheckoutStep('payment-type');
      showToast(tSync('All bookings created! Please proceed with payment.'), 'success');
    }
  };

  const handlePaymentTypeSelect = (type: 'card' | 'mobile_money') => {
    setSelectedPaymentType(type);
    setCheckoutStep('payment-details');
    setPaymentDetails({
      phoneNumber: '',
      provider: type === 'mobile_money' ? 'mtn_momo' : '',
      cardNumber: '',
      cardHolderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: ''
    });
  };

  const handleCreatePaymentMethodAndProcess = async () => {
    if (!selectedPaymentType) {
      showToast(tSync('Please select a payment type'), 'error');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      showToast(tSync('Authentication required'), 'error');
      navigate('/login');
      return;
    }

    setIsProcessing(true);
    setCheckoutStep('processing');

    try {
      let paymentMethodPayload: any = {
        type: selectedPaymentType,
        is_default: true,
        currency: items[0]?.currency || 'RWF'
      };

      if (selectedPaymentType === 'mobile_money') {
        if (!paymentDetails.phoneNumber.trim()) {
          showToast(tSync('Please enter your phone number'), 'error');
          setIsProcessing(false);
          setCheckoutStep('payment-details');
          return;
        }
        paymentMethodPayload = {
          ...paymentMethodPayload,
          provider: paymentDetails.provider,
          phone_number: paymentDetails.phoneNumber.trim()
        };
      } else if (selectedPaymentType === 'card') {
        if (!paymentDetails.cardNumber || !paymentDetails.cardHolderName || !paymentDetails.expiryMonth || !paymentDetails.expiryYear || !paymentDetails.cvv) {
          showToast(tSync('Please fill in all card details'), 'error');
          setIsProcessing(false);
          setCheckoutStep('payment-details');
          return;
        }
        // Extract last 4 digits
        const lastFour = paymentDetails.cardNumber.replace(/\s/g, '').slice(-4);
        // Determine card brand from first digit
        const firstDigit = paymentDetails.cardNumber.replace(/\s/g, '')[0];
        let cardBrand = 'visa';
        if (firstDigit === '4') cardBrand = 'visa';
        else if (firstDigit === '5') cardBrand = 'mastercard';
        else if (firstDigit === '3') cardBrand = 'amex';
        
        paymentMethodPayload = {
          ...paymentMethodPayload,
          provider: cardBrand,
          last_four: lastFour,
          card_brand: cardBrand,
          exp_month: parseInt(paymentDetails.expiryMonth),
          exp_year: parseInt(paymentDetails.expiryYear)
        };
      }

      // Create payment method
      const methodResult = await addPaymentMethod(paymentMethodPayload, token);
      const newPaymentMethodId = methodResult.data?.id || methodResult.data?.data?.id;

      if (!newPaymentMethodId) {
        throw new Error('Failed to create payment method');
      }

      // Process payment for all bookings
      const successfulBookings = bookingStatuses.filter(s => s.status === 'success' && s.bookingId);
      
      for (const bookingStatus of successfulBookings) {
        const item = items.find(i => i.id === bookingStatus.itemId);
        if (!item || !bookingStatus.bookingId) continue;

        // Update status to processing payment
        setBookingStatuses(prev =>
          prev.map(status =>
            status.itemId === item.id
              ? { ...status, paymentStatus: 'processing' }
              : status
          )
        );

        try {
          const paymentPayload = {
            booking_id: bookingStatus.bookingId,
            payment_method_id: newPaymentMethodId,
            amount: item.totalPrice,
            currency: item.currency,
            transaction_type: 'booking_payment',
            provider: selectedPaymentType === 'mobile_money' ? paymentDetails.provider : undefined,
            metadata: {
              description: `Payment for booking #${bookingStatus.bookingId}`,
              product_title: item.productTitle,
              rental_days: item.totalDays,
            },
          };

          const paymentResult = await processPaymentTransaction(paymentPayload, token);

          if (paymentResult.success) {
            setBookingStatuses(prev =>
              prev.map(status =>
                status.itemId === item.id
                  ? {
                      ...status,
                      paymentStatus: 'success',
                      transactionId: paymentResult.transaction_id || paymentResult.data?.id
                    }
                  : status
              )
            );
          } else {
            setBookingStatuses(prev =>
              prev.map(status =>
                status.itemId === item.id
                  ? {
                      ...status,
                      paymentStatus: 'error',
                      paymentError: paymentResult.error || tSync('Payment failed')
                    }
                  : status
              )
            );
          }
        } catch (error: any) {
          setBookingStatuses(prev =>
            prev.map(status =>
              status.itemId === item.id
                ? {
                    ...status,
                    paymentStatus: 'error',
                    paymentError: error.message || tSync('Payment processing error')
                  }
                : status
            )
          );
        }

        // Small delay between payments
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      setIsProcessing(false);

      // Check results
      const allPaymentsSuccess = bookingStatuses.every(s => 
        s.status === 'success' && (s.paymentStatus === 'success' || s.paymentStatus === 'processing')
      );
      const hasPaymentErrors = bookingStatuses.some(s => s.paymentStatus === 'error');

      if (allPaymentsSuccess) {
        showToast(tSync('All bookings and payments processed successfully!'), 'success');
        clearCart();
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else if (hasPaymentErrors) {
        showToast(
          tSync('Some payments failed. Please check your payment details.'),
          'error'
        );
      }
    } catch (error: any) {
      setIsProcessing(false);
      showToast(error.message || tSync('Failed to process payment'), 'error');
      setCheckoutStep('payment-details');
    }
  };

  const getStatusIcon = (status: BookingStatus['status']) => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default:
        return <Package className="w-5 h-5 text-gray-400 dark:text-slate-500" />;
    }
  };

  const getStatusText = (status: BookingStatus['status']) => {
    switch (status) {
      case 'processing':
        return tSync('Processing...');
      case 'success':
        return tSync('Booked');
      case 'error':
        return tSync('Failed');
      default:
        return tSync('Pending');
    }
  };

  const allCompleted = bookingStatuses.length > 0 && bookingStatuses.every(s => s.status === 'success' || s.status === 'error');
  const hasErrors = bookingStatuses.some(s => s.status === 'error');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="w-8 h-8 text-teal-600 dark:text-teal-400" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
              <TranslatedText text="Checkout" />
            </h1>
          </div>
          <p className="text-gray-600 dark:text-slate-400">
            <TranslatedText text="Review and confirm your bookings" />
          </p>
        </div>

        {/* Multiple Owners Warning */}
        {hasMultipleOwners && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  <TranslatedText text="Multiple Owners Detected" />
                </h3>
                <p className="text-yellow-800 dark:text-yellow-200 mb-4">
                  <TranslatedText text="You cannot checkout items from different owners at the same time. Each owner needs to confirm their booking separately. Please remove items from other owners to proceed." />
                </p>
                <div className="space-y-3">
                  {Object.entries(itemsByOwner).map(([ownerId, ownerItems]) => (
                    <div key={ownerId} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-slate-100">
                          <TranslatedText text="Owner" /> {ownerId.substring(0, 8)}... ({ownerItems.length} {ownerItems.length === 1 ? tSync('item') : tSync('items')})
                        </span>
                        {selectedOwnerId !== ownerId && (
                          <button
                            onClick={() => {
                              ownerItems.forEach(item => removeFromCart(item.id));
                              showToast(tSync('Items removed from cart'), 'info');
                            }}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-2 text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            <TranslatedText text="Remove All" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-1">
                        {ownerItems.map(item => (
                          <div key={item.id} className="text-sm text-gray-600 dark:text-slate-400 flex items-center justify-between">
                            <span>{item.productTitle}</span>
                            {selectedOwnerId !== ownerId && (
                              <button
                                onClick={() => {
                                  removeFromCart(item.id);
                                  showToast(tSync('Item removed from cart'), 'info');
                                }}
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                aria-label={tSync('Remove item')}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong><TranslatedText text="Tip" />:</strong> <TranslatedText text="Remove items from other owners, then return to checkout. You can checkout items from each owner separately." />
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Type Selection */}
        {checkoutStep === 'payment-type' && allBookingsCreated && !isProcessing && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
              <TranslatedText text="Select Payment Method Type" />
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handlePaymentTypeSelect('card')}
                className="p-6 border-2 border-gray-200 dark:border-slate-700 rounded-xl hover:border-teal-600 dark:hover:border-teal-500 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">
                      <TranslatedText text="Credit/Debit Card" />
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      <TranslatedText text="Pay with your card" />
                    </p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => handlePaymentTypeSelect('mobile_money')}
                className="p-6 border-2 border-gray-200 dark:border-slate-700 rounded-xl hover:border-teal-600 dark:hover:border-teal-500 transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Smartphone className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">
                      <TranslatedText text="Mobile Money" />
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      <TranslatedText text="Pay with mobile money" />
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Payment Details Form */}
        {checkoutStep === 'payment-details' && !isProcessing && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
              {selectedPaymentType === 'mobile_money' ? (
                <TranslatedText text="Enter Mobile Money Details" />
              ) : (
                <TranslatedText text="Enter Card Details" />
              )}
            </h2>
            
            {selectedPaymentType === 'mobile_money' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <TranslatedText text="Provider" />
                  </label>
                  <select
                    value={paymentDetails.provider}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, provider: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  >
                    <option value="mtn_momo">MTN Mobile Money</option>
                    <option value="airtel_money">Airtel Money</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <TranslatedText text="Phone Number" />
                  </label>
                  <input
                    type="tel"
                    value={paymentDetails.phoneNumber}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, phoneNumber: e.target.value })}
                    placeholder={tSync('Enter your phone number')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <TranslatedText text="Card Number" />
                  </label>
                  <input
                    type="text"
                    value={paymentDetails.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                      const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                      setPaymentDetails({ ...paymentDetails, cardNumber: formatted });
                    }}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    <TranslatedText text="Cardholder Name" />
                  </label>
                  <input
                    type="text"
                    value={paymentDetails.cardHolderName}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, cardHolderName: e.target.value })}
                    placeholder={tSync('Name on card')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      <TranslatedText text="Month" />
                    </label>
                    <select
                      value={paymentDetails.expiryMonth}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryMonth: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    >
                      <option value=""><TranslatedText text="MM" /></option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month.toString().padStart(2, '0')}>
                          {month.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      <TranslatedText text="Year" />
                    </label>
                    <select
                      value={paymentDetails.expiryYear}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryYear: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    >
                      <option value=""><TranslatedText text="YYYY" /></option>
                      {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i).map(year => (
                        <option key={year} value={year.toString()}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      <TranslatedText text="CVV" />
                    </label>
                    <input
                      type="text"
                      value={paymentDetails.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setPaymentDetails({ ...paymentDetails, cvv: value });
                      }}
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setCheckoutStep('payment-type')}
                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800"
              >
                <TranslatedText text="Back" />
              </Button>
              <Button
                onClick={handleCreatePaymentMethodAndProcess}
                className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold"
              >
                <TranslatedText text="Confirm and Pay" />
              </Button>
            </div>
          </div>
        )}

        {/* Progress Summary */}
        {isProcessing && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                <TranslatedText text="Processing Bookings" />
              </h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700 dark:text-blue-300">
                  <TranslatedText text="Progress" />
                </span>
                <span className="text-blue-900 dark:text-blue-100 font-semibold">
                  {currentIndex + 1} / {items.length}
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div
                  className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Booking Items */}
        <div className="space-y-4 mb-6">
          {(hasMultipleOwners ? (selectedOwnerId ? itemsByOwner[selectedOwnerId] || [] : []) : items).map((item, index) => {
            const status = bookingStatuses.find(s => s.itemId === item.id);
            const isCurrent = index === currentIndex && isProcessing;

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 p-6 ${
                  isCurrent
                    ? 'border-blue-500 dark:border-blue-400'
                    : status?.status === 'success'
                    ? 'border-green-500 dark:border-green-400'
                    : status?.status === 'error'
                    ? 'border-red-500 dark:border-red-400'
                    : 'border-gray-200 dark:border-slate-700'
                }`}
              >
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400 dark:text-slate-500" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-1">
                          {item.productTitle}
                        </h3>
                        <p className="text-xl font-bold text-teal-600 dark:text-teal-400">
                          {formatCurrency(item.totalPrice, item.currency)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {status && getStatusIcon(status.status)}
                        <span className={`text-sm font-medium ${
                          status?.status === 'success'
                            ? 'text-green-600 dark:text-green-400'
                            : status?.status === 'error'
                            ? 'text-red-600 dark:text-red-400'
                            : status?.status === 'processing'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-slate-400'
                        }`}>
                          {status ? getStatusText(status.status) : tSync('Pending')}
                        </span>
                      </div>
                    </div>

                    {/* Rental Dates */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDate(item.startDate)} - {formatDate(item.endDate)}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-xs">
                        {item.totalDays} {item.totalDays === 1 ? tSync('day') : tSync('days')}
                      </span>
                    </div>

                    {item.pickupMethod && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>{item.pickupMethod}</span>
                      </div>
                    )}

                    {/* Error Message */}
                    {status?.status === 'error' && status.error && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{status.error}</span>
                        </div>
                      </div>
                    )}

                    {/* Success Message */}
                    {status?.status === 'success' && status.bookingId && (
                      <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-300 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            <TranslatedText text="Booking ID" />: {status.bookingId.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Payment Status */}
                    {status?.status === 'success' && checkoutStep !== 'bookings' && (
                      <div className="mt-2 space-y-2">
                        {status.paymentStatus === 'processing' && (
                          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span><TranslatedText text="Processing payment..." /></span>
                          </div>
                        )}
                        {status.paymentStatus === 'success' && (
                          <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-300 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              <span><TranslatedText text="Payment successful" /></span>
                            </div>
                          </div>
                        )}
                        {status.paymentStatus === 'error' && status.paymentError && (
                          <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <div className="flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              <span>{status.paymentError}</span>
                            </div>
                          </div>
                        )}
                        {status.paymentStatus === 'pending' && (
                          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 text-sm">
                              <AlertCircle className="w-4 h-4" />
                              <span><TranslatedText text="Payment pending" /></span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          {checkoutStep === 'bookings' && !isProcessing && !allCompleted && (
            <Button
              onClick={processBookings}
              disabled={hasMultipleOwners}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TranslatedText text="Confirm and Create Bookings" />
              <ArrowRight className="w-5 h-5" />
            </Button>
          )}

          {hasMultipleOwners && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <p className="text-sm text-gray-600 dark:text-slate-400 text-center">
                <TranslatedText text="Please remove items from other owners to proceed with checkout." />
              </p>
            </div>
          )}

          {allCompleted && (
            <div className="space-y-4">
              <div className="text-center">
                {hasErrors ? (
                  <div className="mb-4">
                    <AlertCircle className="w-12 h-12 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                    <p className="text-gray-700 dark:text-slate-300">
                      {completedCount} {tSync('of')} {items.length} {tSync('bookings completed')}
                    </p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <p className="text-gray-700 dark:text-slate-300">
                      <TranslatedText text="All bookings created successfully!" />
                    </p>
                  </div>
                )}
              </div>
              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors"
              >
                <TranslatedText text="Go to Dashboard" />
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="text-center text-gray-600 dark:text-slate-400">
              <TranslatedText text="Please wait while we process your bookings..." />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartCheckoutPage;

