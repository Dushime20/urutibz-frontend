import React, { useState } from 'react';
import { X, Calendar, MapPin, ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useTranslation } from '../../hooks/useTranslation';
import { TranslatedText } from '../translated-text';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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
  const [pickupMethod, setPickupMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  };

  const totalDays = calculateDays();
  const totalPrice = product.pricePerDay * totalDays;

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

    if (pickupMethod === 'delivery' && !deliveryAddress.trim()) {
      showToast(tSync('Please provide delivery address'), 'error');
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
      pickupMethod: pickupMethod === 'pickup' ? 'pickup' : 'delivery',
      deliveryAddress: pickupMethod === 'delivery' ? deliveryAddress : undefined,
      specialInstructions: specialInstructions || undefined,
    });

    showToast(tSync('Item added to cart'), 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                <TranslatedText text="Add to Cart" />
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-slate-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Product Info */}
            <div className="flex gap-4">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-slate-100 mb-1">
                  {product.title}
                </h3>
                <p className="text-lg font-bold text-teal-600 dark:text-teal-400">
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

            {/* Pickup Method */}
            {(product.pickupAvailable || product.deliveryAvailable) && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900 dark:text-slate-100">
                  <TranslatedText text="Pickup Method" />
                </label>
                <div className="flex gap-3">
                  {product.pickupAvailable && (
                    <button
                      type="button"
                      onClick={() => setPickupMethod('pickup')}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                        pickupMethod === 'pickup'
                          ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                          : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:border-teal-400'
                      }`}
                    >
                      <MapPin className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium"><TranslatedText text="Pickup" /></span>
                    </button>
                  )}
                  {product.deliveryAvailable && (
                    <button
                      type="button"
                      onClick={() => setPickupMethod('delivery')}
                      className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                        pickupMethod === 'delivery'
                          ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                          : 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:border-teal-400'
                      }`}
                    >
                      <MapPin className="w-5 h-5 mx-auto mb-1" />
                      <span className="text-sm font-medium"><TranslatedText text="Delivery" /></span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Address */}
            {pickupMethod === 'delivery' && (
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
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-slate-400">
                  <TranslatedText text="Total" />
                </span>
                <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {formatCurrency(totalPrice, product.currency)}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-500">
                {formatCurrency(product.pricePerDay, product.currency)} × {totalDays} {totalDays === 1 ? tSync('day') : tSync('days')}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors font-medium"
              >
                <TranslatedText text="Cancel" />
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-1 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <TranslatedText text="Add to Cart" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddToCartModal;

