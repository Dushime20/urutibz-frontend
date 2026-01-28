import React, { useState } from 'react';
import { X, ShoppingCart, Calendar, MapPin, Trash2, Plus, Minus, ArrowRight, Package, Heart, Star, Shield, Truck, Clock, Edit3 } from 'lucide-react';
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

    // Navigate to checkout page
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

  const handleSaveForLater = (itemId: string) => {
    // TODO: Implement save for later functionality
    showToast(tSync('Saved for later'), 'success');
  };

  const totalItems = items.length;
  const subtotal = getTotalPrice();
  const estimatedTax = subtotal * 0.08; // 8% tax estimate
  const estimatedTotal = subtotal + estimatedTax;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Amazon-Style Cart Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[420px] lg:w-[480px] bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        {/* Amazon-Style Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  <TranslatedText text="Shopping Cart" />
                </h2>
                <p className="text-teal-100 text-sm">
                  {totalItems} {totalItems === 1 ? tSync('item') : tSync('items')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close cart"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Cart Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            /* Empty Cart State - Amazon Style */
            <div className="flex flex-col items-center justify-center h-full text-center py-12 px-6">
              <div className="w-24 h-24 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <ShoppingCart className="w-12 h-12 text-gray-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-2">
                <TranslatedText text="Your cart is empty" />
              </h3>
              <p className="text-gray-600 dark:text-slate-400 mb-6 max-w-sm">
                <TranslatedText text="Browse our marketplace and add items to your cart to get started" />
              </p>
              <button
                onClick={() => {
                  onClose();
                  navigate('/items');
                }}
                className="px-8 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-colors shadow-lg"
              >
                <TranslatedText text="Start Shopping" />
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Amazon-Style Cart Items */}
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className={`bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow ${
                    index !== items.length - 1 ? 'border-b-2 border-gray-100 dark:border-slate-700' : ''
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-24 h-24 rounded-lg bg-gray-100 dark:bg-slate-700 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-slate-600">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt={item.productTitle}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => navigate(`/items/${item.productId}`)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400 dark:text-slate-500" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      {/* Product Title */}
                      <h3 
                        className="font-semibold text-gray-900 dark:text-slate-100 text-base mb-2 line-clamp-2 hover:text-teal-600 cursor-pointer transition-colors"
                        onClick={() => navigate(`/items/${item.productId}`)}
                      >
                        {item.productTitle}
                      </h3>

                      {/* Availability Status */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                          <TranslatedText text="Available" />
                        </span>
                      </div>

                      {/* Rental Dates */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                            <TranslatedText text="Rental Period" />
                          </span>
                        </div>
                        
                        {editingItem === item.id ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs text-blue-700 dark:text-blue-300 mb-1">
                                  <TranslatedText text="Start" />
                                </label>
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
                                  className="w-full px-2 py-1 text-xs border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-blue-700 dark:text-blue-300 mb-1">
                                  <TranslatedText text="End" />
                                </label>
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
                                  className="w-full px-2 py-1 text-xs border border-blue-300 dark:border-blue-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingItem(null)}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                <TranslatedText text="Save" />
                              </button>
                              <button
                                onClick={() => setEditingItem(null)}
                                className="px-3 py-1 text-xs bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-slate-300 rounded hover:bg-gray-400 dark:hover:bg-slate-500 transition-colors"
                              >
                                <TranslatedText text="Cancel" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                                {formatDate(item.startDate)} - {formatDate(item.endDate)}
                              </p>
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                {item.totalDays} {item.totalDays === 1 ? tSync('day') : tSync('days')}
                              </p>
                            </div>
                            <button
                              onClick={() => setEditingItem(item.id)}
                              className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                            >
                              <Edit3 className="w-3 h-3" />
                              <TranslatedText text="Edit" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Delivery Method */}
                      {item.pickupMethod && (
                        <div className="flex items-center gap-2 mb-3">
                          <Truck className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                          <span className="text-sm text-gray-600 dark:text-slate-400 capitalize">
                            {item.pickupMethod.replace('_', ' ')}
                          </span>
                        </div>
                      )}

                      {/* Price */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xl font-bold text-gray-900 dark:text-slate-100">
                            {formatCurrency(item.totalPrice, item.currency)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-slate-400">
                            {formatCurrency(item.pricePerDay, item.currency)} × {item.totalDays} {item.totalDays === 1 ? tSync('day') : tSync('days')}
                          </p>
                        </div>
                      </div>

                      {/* Amazon-Style Action Buttons */}
                      <div className="flex items-center gap-4 text-sm">
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium transition-colors"
                        >
                          <TranslatedText text="Delete" />
                        </button>
                        <button
                          onClick={() => handleSaveForLater(item.id)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                        >
                          <TranslatedText text="Save for later" />
                        </button>
                        <button
                          onClick={() => navigate(`/items/${item.productId}`)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors"
                        >
                          <TranslatedText text="See more like this" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Amazon-Style Recommendations */}
              <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mt-6">
                <h4 className="font-semibold text-gray-900 dark:text-slate-100 mb-3">
                  <TranslatedText text="Frequently bought together" />
                </h4>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  <TranslatedText text="Customers who rented items in your cart also rented:" />
                </p>
                {/* TODO: Add recommended items */}
              </div>
            </div>
          )}
        </div>

        {/* Amazon-Style Checkout Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            {/* Order Summary */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">
                  <TranslatedText text="Subtotal" /> ({totalItems} {totalItems === 1 ? tSync('item') : tSync('items')}):
                </span>
                <span className="font-semibold text-gray-900 dark:text-slate-100">
                  {formatCurrency(subtotal, items[0].currency)}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-400">
                  <TranslatedText text="Estimated tax" />:
                </span>
                <span className="text-gray-900 dark:text-slate-100">
                  {formatCurrency(estimatedTax, items[0].currency)}
                </span>
              </div>

              <div className="border-t border-gray-200 dark:border-slate-700 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900 dark:text-slate-100">
                    <TranslatedText text="Order total" />:
                  </span>
                  <span className="text-xl font-bold text-teal-600 dark:text-teal-400">
                    {formatCurrency(estimatedTotal, items[0].currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Checkout Buttons */}
            <div className="p-4 space-y-3 bg-gray-50 dark:bg-slate-800">
              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <TranslatedText text="Proceed to checkout" />
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span><TranslatedText text="Secure checkout" /></span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span><TranslatedText text="Quick booking" /></span>
                </div>
              </div>

              <button
                onClick={clearCart}
                className="w-full py-2 text-sm text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <TranslatedText text="Clear entire cart" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;



