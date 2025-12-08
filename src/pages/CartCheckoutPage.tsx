import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, CheckCircle, XCircle, Loader2, AlertCircle,
  Calendar, MapPin, Package, ArrowRight
} from 'lucide-react';
import { useCart, CartItem } from '../contexts/CartContext';
import { useTranslation } from '../hooks/useTranslation';
import { TranslatedText } from '../components/translated-text';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { createBooking } from './booking-page/service/api';
import Button from '../components/ui/Button';

interface BookingStatus {
  itemId: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  bookingId?: string;
  error?: string;
}

const CartCheckoutPage: React.FC = () => {
  const { items, clearCart } = useCart();
  const { tSync } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [bookingStatuses, setBookingStatuses] = useState<BookingStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }

    // Initialize booking statuses
    setBookingStatuses(
      items.map(item => ({
        itemId: item.id,
        status: 'pending'
      }))
    );
  }, [items, navigate]);

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
        // Prepare booking data
        const bookingData = {
          product_id: item.productId,
          renter_id: user.id,
          owner_id: item.ownerId,
          start_date: new Date(item.startDate).toISOString(),
          end_date: new Date(item.endDate).toISOString(),
          pickup_method: item.pickupMethod || 'pickup',
          delivery_address: item.deliveryAddress,
          special_instructions: item.specialInstructions,
          // Calculate total amount
          total_amount: item.totalPrice,
          currency: item.currency,
        };

        // Create booking
        const result = await createBooking(bookingData, token);

        if (result.success && result.data) {
          // Update status to success
          setBookingStatuses(prev =>
            prev.map(status =>
              status.itemId === item.id
                ? {
                    ...status,
                    status: 'success',
                    bookingId: result.data?.data?.id || result.data?.id
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

    // Show completion message
    if (completedCount === items.length) {
      showToast(tSync('All bookings created successfully!'), 'success');
      clearCart();
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } else if (completedCount > 0) {
      showToast(
        `${completedCount} ${tSync('of')} ${items.length} ${tSync('bookings created successfully')}`,
        'info'
      );
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
          {items.map((item, index) => {
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
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          {!isProcessing && !allCompleted && (
            <Button
              onClick={processBookings}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <TranslatedText text="Confirm and Book All Items" />
              <ArrowRight className="w-5 h-5" />
            </Button>
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

