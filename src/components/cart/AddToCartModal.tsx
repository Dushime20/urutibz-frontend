import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, ShoppingCart, Clock } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useTranslation } from '../../hooks/useTranslation';
import { TranslatedText } from '../translated-text';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { calculateDeliveryFee } from '../../pages/booking-page/service/api';

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    image?: string;
    pricePerDay: number;
    currency: string;
    ownerId: string;
    categoryId?: string;
    pickupAvailable?: boolean;
    deliveryAvailable?: boolean;
  };
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({ isOpen, onClose, product }) => {
  const { addToCart } = useCart();
  const { tSync } = useTranslation();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(tomorrow);
  const [endDate, setEndDate] = useState(nextWeek);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery' | 'meet_public'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [meetPublicLocation, setMeetPublicLocation] = useState('');
  const [deliveryTimeWindow, setDeliveryTimeWindow] = useState<'morning' | 'afternoon' | 'evening' | 'flexible'>('flexible');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [loadingDeliveryFee, setLoadingDeliveryFee] = useState(false);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  };

  const totalDays = calculateDays();
  const basePrice = product.pricePerDay * totalDays;
  const totalPrice = basePrice + (deliveryFee || 0);

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

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      showToast(tSync('Please log in to add items to cart'), 'info');
      navigate('/login');
      onClose();
      return;
    }

    if (!startDate || !endDate) {
      showToast(tSync('Please select rental dates'), 'error');
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      showToast(tSync('End date must be after start date'), 'error');
      return;
    }

    if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) {
      showToast(tSync('Please provide delivery address'), 'error');
      return;
    }

    if (deliveryMethod === 'meet_public' && !meetPublicLocation.trim()) {
      showToast(tSync('Please provide meet location'), 'error');
      return;
    }

    addToCart({
      productId: product.id,
      productTitle: product.title,
      productImage: product.image,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      pricePerDay: product.pricePerDay,
      currency: product.currency,
      ownerId: product.ownerId,
      categoryId: product.categoryId,
      pickupMethod: deliveryMethod === 'pickup' ? 'pickup' : deliveryMethod === 'delivery' ? 'delivery' : 'meet_public',
      deliveryMethod: deliveryMethod,
      deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : undefined,
      meetPublicLocation: deliveryMethod === 'meet_public' ? meetPublicLocation : undefined,
      deliveryTimeWindow: deliveryTimeWindow,
      deliveryInstructions: deliveryInstructions || undefined,
      deliveryFee: deliveryFee || undefined,
      specialInstructions: specialInstructions || undefined,
    });

    showToast(tSync('Item added to cart'), 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 min-h-screen">
        <div
          className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100"
          style={{ 
            animation: 'slideUp 0.3s ease-out',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-slate-900 border-b-2 border-teal-200 dark:border-teal-800 p-6 flex items-center justify-between z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                <TranslatedText text="Add to Cart" />
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Product Info */}
            <div className="flex gap-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-200 dark:border-slate-700">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200 dark:border-slate-700"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-2 text-lg">
                  {product.title}
                </h3>
                <p className="text-xl font-bold text-teal-600 dark:text-teal-400">
                  {formatCurrency(product.pricePerDay, product.currency)} / <TranslatedText text="day" />
                </p>
              </div>
            </div>

            {/* Rental Dates */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900 dark:text-slate-100">
                <TranslatedText text="Rental Dates" />
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-slate-400 mb-1">
                    <TranslatedText text="Start Date" />
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    min={today}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (e.target.value >= endDate) {
                        const newEndDate = new Date(e.target.value);
                        newEndDate.setDate(newEndDate.getDate() + 1);
                        setEndDate(newEndDate.toISOString().split('T')[0]);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-slate-400 mb-1">
                    <TranslatedText text="End Date" />
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || today}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>
                  {totalDays} {totalDays === 1 ? tSync('day') : tSync('days')} • {formatCurrency(totalPrice, product.currency)}
                </span>
              </div>
            </div>

            {/* Delivery Method */}
            {(product.pickupAvailable || product.deliveryAvailable) && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900 dark:text-slate-100">
                  <TranslatedText text="Delivery Method" />
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {product.pickupAvailable && (
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod('pickup')}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        deliveryMethod === 'pickup'
                          ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                          : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:border-teal-400'
                      }`}
                    >
                      <MapPin className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-xs font-medium"><TranslatedText text="Pickup" /></span>
                    </button>
                  )}
                  {product.deliveryAvailable && (
                    <>
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('delivery')}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${
                          deliveryMethod === 'delivery'
                            ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                            : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:border-teal-400'
                        }`}
                      >
                        <MapPin className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs font-medium"><TranslatedText text="Delivery" /></span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('meet_public')}
                        className={`px-4 py-3 rounded-lg border-2 transition-all ${
                          deliveryMethod === 'meet_public'
                            ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                            : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:border-teal-400'
                        }`}
                      >
                        <MapPin className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs font-medium"><TranslatedText text="Meet Public" /></span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Time Window */}
            {(deliveryMethod === 'delivery' || deliveryMethod === 'meet_public') && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900 dark:text-slate-100">
                  <Clock className="w-4 h-4 inline mr-1" />
                  <TranslatedText text="Preferred Time Window" />
                </label>
                <select
                  value={deliveryTimeWindow}
                  onChange={(e) => setDeliveryTimeWindow(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                >
                  <option value="flexible"><TranslatedText text="Flexible" /></option>
                  <option value="morning"><TranslatedText text="Morning (8 AM - 12 PM)" /></option>
                  <option value="afternoon"><TranslatedText text="Afternoon (12 PM - 5 PM)" /></option>
                  <option value="evening"><TranslatedText text="Evening (5 PM - 9 PM)" /></option>
                </select>
              </div>
            )}

            {/* Delivery Address */}
            {deliveryMethod === 'delivery' && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-slate-100 mb-2">
                  <TranslatedText text="Delivery Address" />
                </label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder={tSync('Enter delivery address')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                />
              </div>
            )}

            {/* Meet Public Location */}
            {deliveryMethod === 'meet_public' && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-slate-100 mb-2">
                  <TranslatedText text="Meet Location" />
                </label>
                <textarea
                  value={meetPublicLocation}
                  onChange={(e) => setMeetPublicLocation(e.target.value)}
                  placeholder={tSync('Enter public meeting location (e.g., shopping mall, park)')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                />
              </div>
            )}

            {/* Delivery Instructions */}
            {(deliveryMethod === 'delivery' || deliveryMethod === 'meet_public') && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-slate-100 mb-2">
                  <TranslatedText text="Delivery Instructions" /> <span className="text-gray-400 text-xs font-normal">(<TranslatedText text="Optional" />)</span>
                </label>
                <textarea
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder={tSync('Gate codes, special notes, preferred location, etc.')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                />
              </div>
            )}

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-slate-100 mb-2">
                <TranslatedText text="Special Instructions" /> <span className="text-gray-400 text-xs font-normal">(<TranslatedText text="Optional" />)</span>
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder={tSync('Any special requests or instructions')}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
              />
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-xl p-5 border-2 border-teal-200 dark:border-teal-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-base font-semibold text-gray-700 dark:text-slate-300">
                  <TranslatedText text="Total" />
                </span>
                <span className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                  {formatCurrency(totalPrice, product.currency)}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">
                  {formatCurrency(product.pricePerDay, product.currency)} × {totalDays} {totalDays === 1 ? tSync('day') : tSync('days')}
                </p>
                {deliveryFee !== null && deliveryFee > 0 && (
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    + {formatCurrency(deliveryFee, product.currency)} <TranslatedText text="delivery fee" />
                    {loadingDeliveryFee && <span className="ml-2 text-xs">(<TranslatedText text="calculating..." />)</span>}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all font-semibold hover:scale-105 active:scale-95"
              >
                <TranslatedText text="Cancel" />
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                <ShoppingCart className="w-5 h-5" />
                <TranslatedText text="Add to Cart" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default AddToCartModal;



