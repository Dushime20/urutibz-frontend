import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Calendar, MapPin, Trash2, ArrowLeft, ArrowRight, Package, Edit2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useTranslation } from '../hooks/useTranslation';
import { TranslatedText } from '../components/translated-text';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import AddToCartModal from '../components/cart/AddToCartModal';

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateCartItem, clearCart, getTotalPrice } = useCart();
  const { tSync } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);

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
      return;
    }

    if (items.length === 0) {
      showToast(tSync('Your cart is empty'), 'info');
      return;
    }

    // Navigate to checkout (we can create a checkout page later)
    // For now, we'll create individual bookings
    navigate('/cart/checkout');
  };

  const handleEditItem = (item: any) => {
    setEditingProduct({
      id: item.productId,
      title: item.productTitle,
      image: item.productImage,
      pricePerDay: item.pricePerDay,
      currency: item.currency,
      ownerId: item.ownerId,
      categoryId: item.categoryId,
      pickupAvailable: true,
      deliveryAvailable: item.pickupMethod === 'delivery',
    });
    setEditingItem(item.id);
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
    showToast(tSync('Item removed from cart'), 'success');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Link
            to="/items"
            className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <TranslatedText text="Continue Shopping" />
          </Link>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-12 text-center">
            <Package className="w-20 h-20 text-gray-300 dark:text-slate-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-3">
              <TranslatedText text="Your cart is empty" />
            </h2>
            <p className="text-gray-600 dark:text-slate-400 mb-8">
              <TranslatedText text="Add items to your cart to get started" />
            </p>
            <Link
              to="/items"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              <TranslatedText text="Browse Products" />
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/items"
            className="inline-flex items-center gap-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <TranslatedText text="Continue Shopping" />
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-3">
                <ShoppingCart className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                <TranslatedText text="Shopping Cart" />
              </h1>
              <p className="text-gray-600 dark:text-slate-400 mt-2">
                {items.length} {items.length === 1 ? tSync('item') : tSync('items')}
              </p>
            </div>
            <button
              onClick={clearCart}
              className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <TranslatedText text="Clear Cart" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6"
              >
                <div className="flex gap-6">
                  {/* Product Image */}
                  <Link
                    to={`/it/${item.productId}`}
                    className="w-32 h-32 rounded-lg bg-gray-100 dark:bg-slate-700 overflow-hidden flex-shrink-0"
                  >
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400 dark:text-slate-500" />
                      </div>
                    )}
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <Link
                          to={`/it/${item.productId}`}
                          className="text-lg font-semibold text-gray-900 dark:text-slate-100 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        >
                          {item.productTitle}
                        </Link>
                        <p className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1">
                          {formatCurrency(item.totalPrice, item.currency)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                          {formatCurrency(item.pricePerDay, item.currency)} / <TranslatedText text="day" />
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          aria-label="Edit item"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600 dark:text-slate-400" />
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>

                    {/* Rental Dates */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {formatDate(item.startDate)} - {formatDate(item.endDate)}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-xs">
                          {item.totalDays} {item.totalDays === 1 ? tSync('day') : tSync('days')}
                        </span>
                      </div>

                      {item.pickupMethod && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                          <MapPin className="w-4 h-4" />
                          <span className="capitalize">{item.pickupMethod}</span>
                        </div>
                      )}

                      {item.deliveryAddress && (
                        <div className="text-sm text-gray-600 dark:text-slate-400">
                          <span className="font-medium"><TranslatedText text="Delivery:" /></span> {item.deliveryAddress}
                        </div>
                      )}

                      {item.specialInstructions && (
                        <div className="text-sm text-gray-600 dark:text-slate-400">
                          <span className="font-medium"><TranslatedText text="Notes:" /></span> {item.specialInstructions}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">
                <TranslatedText text="Order Summary" />
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-slate-400">
                  <span><TranslatedText text="Subtotal" /></span>
                  <span className="font-semibold">
                    {items.length > 0 && formatCurrency(getTotalPrice(), items[0].currency)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-slate-400">
                  <span><TranslatedText text="Items" /></span>
                  <span className="font-semibold">{items.length}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-slate-100">
                      <TranslatedText text="Total" />
                    </span>
                    <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                      {items.length > 0 && formatCurrency(getTotalPrice(), items[0].currency)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <TranslatedText text="Proceed to Checkout" />
                <ArrowRight className="w-5 h-5" />
              </button>

              <Link
                to="/items"
                className="block w-full mt-4 text-center text-sm text-gray-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
              >
                <TranslatedText text="Continue Shopping" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Item Modal */}
      {editingProduct && editingItem && (
        <AddToCartModal
          isOpen={!!editingProduct}
          onClose={() => {
            setEditingProduct(null);
            setEditingItem(null);
          }}
          product={editingProduct}
        />
      )}
    </div>
  );
};

export default CartPage;
