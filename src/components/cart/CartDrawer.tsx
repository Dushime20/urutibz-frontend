import React, { useState } from 'react';
import { X, ShoppingCart, Calendar, MapPin, Trash2, Plus, Minus, ArrowRight, Package } from 'lucide-react';
import { useCart, CartItem } from '../../contexts/CartContext';
import { useTranslation } from '../../hooks/useTranslation';
import { TranslatedText } from '../translated-text';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, removeFromCart, updateCartItem, clearCart, getTotalPrice } = useCart();
  const { tSync } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [editingItem, setEditingItem] = useState<string | null>(null);

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

  const handleCheckout = () => {
    if (!isAuthenticated) {
      showToast(tSync('Please log in to checkout'), 'info');
      navigate('/login');
      onClose();
      return;
    }

    if (items.length === 0) {
      showToast(tSync('Your cart is empty'), 'info');
      return;
    }

    // Navigate to checkout page (we'll create this)
    navigate('/cart/checkout');
    onClose();
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
    showToast(tSync('Item removed from cart'), 'success');
  };

  const handleUpdateDates = (itemId: string, startDate: string, endDate: string) => {
    if (new Date(endDate) <= new Date(startDate)) {
      showToast(tSync('End date must be after start date'), 'error');
      return;
    }
    updateCartItem(itemId, { startDate, endDate });
    setEditingItem(null);
    showToast(tSync('Rental dates updated'), 'success');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-96 lg:w-[28rem] bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
              <TranslatedText text="Shopping Cart" />
            </h2>
            {items.length > 0 && (
              <span className="px-2 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-xs font-semibold rounded-full">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Package className="w-16 h-16 text-gray-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                <TranslatedText text="Your cart is empty" />
              </h3>
              <p className="text-gray-500 dark:text-slate-400 mb-6">
                <TranslatedText text="Add items to your cart to get started" />
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
              >
                <TranslatedText text="Continue Shopping" />
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700"
              >
                {/* Product Image and Title */}
                <div className="flex gap-4 mb-3">
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
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100 text-sm mb-1 line-clamp-2">
                      {item.productTitle}
                    </h3>
                    <p className="text-lg font-bold text-teal-600 dark:text-teal-400">
                      {formatCurrency(item.totalPrice, item.currency)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {formatCurrency(item.pricePerDay, item.currency)} / <TranslatedText text="day" />
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>

                {/* Rental Dates */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(item.startDate)} - {formatDate(item.endDate)}
                    </span>
                    <span className="text-xs bg-gray-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                      {item.totalDays} {item.totalDays === 1 ? tSync('day') : tSync('days')}
                    </span>
                  </div>

                  {editingItem === item.id ? (
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={item.startDate.split('T')[0]}
                        onChange={(e) => {
                          const newStartDate = e.target.value;
                          const currentEndDate = item.endDate.split('T')[0];
                          if (newStartDate && currentEndDate) {
                            handleUpdateDates(item.id, newStartDate, currentEndDate);
                          }
                        }}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                      />
                      <input
                        type="date"
                        value={item.endDate.split('T')[0]}
                        onChange={(e) => {
                          const newEndDate = e.target.value;
                          const currentStartDate = item.startDate.split('T')[0];
                          if (newEndDate && currentStartDate) {
                            handleUpdateDates(item.id, currentStartDate, newEndDate);
                          }
                        }}
                        min={item.startDate.split('T')[0]}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700"
                      />
                      <button
                        onClick={() => setEditingItem(null)}
                        className="px-2 py-1 text-xs bg-gray-200 dark:bg-slate-700 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingItem(item.id)}
                      className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      <TranslatedText text="Edit dates" />
                    </button>
                  )}

                  {item.pickupMethod && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                      <MapPin className="w-3 h-3" />
                      <span>{item.pickupMethod}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Total and Checkout */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 dark:border-slate-700 p-6 space-y-4 bg-gray-50 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                <TranslatedText text="Total" />
              </span>
              <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {items.length > 0 && formatCurrency(getTotalPrice(), items[0].currency)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <TranslatedText text="Proceed to Checkout" />
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={clearCart}
              className="w-full py-2 text-sm text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <TranslatedText text="Clear Cart" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;

