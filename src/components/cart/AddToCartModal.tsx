import React, { useState } from 'react';
import { X, Calendar, MapPin, ShoppingCart, Clock, Shield, Truck, Star, CheckCircle, Info } from 'lucide-react';
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
    pickup_methods?: string[] | any;
    address_line?: string;
    location?: { address?: string };
  };
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({ isOpen, onClose, product }) => {
  const { addToCart } = useCart();
  const { tSync } = useTranslation();
  const { showToast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Debug log to verify the new version is loading
  console.log('🛒 AddToCartModal loaded - Full Alibaba version', { product, isOpen });

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(tomorrow);
  const [endDate, setEndDate] = useState(nextWeek);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery' | 'meet_public' | 'visit'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [meetPublicLocation, setMeetPublicLocation] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  };

  const totalDays = calculateDays();
  const basePrice = product.pricePerDay * totalDays;
  const totalPrice = basePrice;

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

    if (deliveryMethod === 'visit') {
      const visitLocation = meetPublicLocation || product.address_line || product.location?.address || '';
      if (!visitLocation.trim()) {
        showToast(tSync('Visit location is required (product address not available)'), 'error');
        return;
      }
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
      pickupMethod: deliveryMethod,
      deliveryMethod: deliveryMethod,
      deliveryAddress: deliveryMethod === 'delivery' ? deliveryAddress : undefined,
      meetPublicLocation: (deliveryMethod === 'meet_public' || deliveryMethod === 'visit') 
        ? (meetPublicLocation || product.address_line || product.location?.address || '') 
        : undefined,
      deliveryInstructions: deliveryInstructions || undefined,
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
        className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Alibaba-Style Right Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-[500px] lg:w-[600px] bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        {/* Alibaba-Style Header */}
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700 p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  <TranslatedText text="Add to Cart" />
                </h2>
                <p className="text-teal-100 text-sm">
                  <TranslatedText text="Configure your rental details" />
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/20 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Alibaba-Style Product Card */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 border border-gray-200 dark:border-slate-600">
              <div className="flex gap-4">
                {product.image && (
                  <div className="relative flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-24 h-24 rounded-xl object-cover border-4 border-white dark:border-slate-600 shadow-lg"
                    />
                    <div className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      <TranslatedText text="Available" />
                    </div>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-slate-100 leading-tight line-clamp-2">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-lg flex-shrink-0 ml-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">4.8</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        <TranslatedText text="Verified Seller" />
                      </span>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-slate-400">
                            <TranslatedText text="Price per day" />
                          </p>
                          <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                            {formatCurrency(product.pricePerDay, product.currency)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-slate-400">
                            <TranslatedText text="Min rental" />
                          </p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                            1 <TranslatedText text="day" />
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alibaba-Style Date Selection */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-slate-100">
                    <TranslatedText text="Rental Period" />
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    <TranslatedText text="Select your rental dates" />
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
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
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                    <TranslatedText text="End Date" />
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || today}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 transition-all"
                  />
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                      <TranslatedText text="Rental Duration" />: {totalDays} {totalDays === 1 ? tSync('day') : tSync('days')}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      <TranslatedText text="Total cost" />: {formatCurrency(totalPrice, product.currency)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alibaba-Style Delivery Options */}
            {(() => {
              // Get available delivery methods from product
              const productPickupMethods = product.pickup_methods || [];
              let availableMethods: string[] = [];
              
              if (Array.isArray(productPickupMethods)) {
                availableMethods = productPickupMethods;
              } else if (typeof productPickupMethods === 'string') {
                try {
                  if (productPickupMethods.includes('[')) {
                    availableMethods = JSON.parse(productPickupMethods);
                  } else {
                    availableMethods = [productPickupMethods];
                  }
                } catch {
                  availableMethods = [productPickupMethods];
                }
              }
              
              // Fallback to boolean flags if pickup_methods not available (backward compatibility)
              if (availableMethods.length === 0) {
                if (product.pickupAvailable !== false) availableMethods.push('pickup');
                if (product.deliveryAvailable === true) {
                  availableMethods.push('delivery');
                  availableMethods.push('meet_public');
                }
              }
              
              // Always include pickup as default if no methods specified
              if (availableMethods.length === 0) {
                availableMethods = ['pickup'];
              }
              
              // Handle legacy 'both' option
              if (availableMethods.includes('both')) {
                const bothIndex = availableMethods.indexOf('both');
                availableMethods.splice(bothIndex, 1);
                if (!availableMethods.includes('pickup')) availableMethods.push('pickup');
                if (!availableMethods.includes('delivery')) availableMethods.push('delivery');
              }
              
              if (availableMethods.length === 0) return null;
              
              return (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <Truck className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900 dark:text-slate-100">
                        <TranslatedText text="Delivery Method" />
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-slate-400">
                        <TranslatedText text="Choose how you want to receive the item" />
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {availableMethods.includes('pickup') && (
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('pickup')}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          deliveryMethod === 'pickup'
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 shadow-lg'
                            : 'border-gray-300 dark:border-slate-600 hover:border-teal-400 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            deliveryMethod === 'pickup' 
                              ? 'bg-teal-500 text-white' 
                              : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                          }`}>
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold ${
                              deliveryMethod === 'pickup' 
                                ? 'text-teal-700 dark:text-teal-300' 
                                : 'text-gray-900 dark:text-slate-100'
                            }`}>
                              <TranslatedText text="Pickup" />
                            </p>
                            <p className="text-xs text-gray-600 dark:text-slate-400">
                              <TranslatedText text="Collect from seller" />
                            </p>
                          </div>
                          {deliveryMethod === 'pickup' && (
                            <CheckCircle className="w-5 h-5 text-teal-500" />
                          )}
                        </div>
                      </button>
                    )}
                    
                    {availableMethods.includes('delivery') && (
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('delivery')}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          deliveryMethod === 'delivery'
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 shadow-lg'
                            : 'border-gray-300 dark:border-slate-600 hover:border-teal-400 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            deliveryMethod === 'delivery' 
                              ? 'bg-teal-500 text-white' 
                              : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                          }`}>
                            <Truck className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold ${
                              deliveryMethod === 'delivery' 
                                ? 'text-teal-700 dark:text-teal-300' 
                                : 'text-gray-900 dark:text-slate-100'
                            }`}>
                              <TranslatedText text="Delivery" />
                            </p>
                            <p className="text-xs text-gray-600 dark:text-slate-400">
                              <TranslatedText text="Delivered to your address" />
                            </p>
                          </div>
                          {deliveryMethod === 'delivery' && (
                            <CheckCircle className="w-5 h-5 text-teal-500" />
                          )}
                        </div>
                      </button>
                    )}
                    
                    {availableMethods.includes('meet_public') && (
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('meet_public')}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          deliveryMethod === 'meet_public'
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 shadow-lg'
                            : 'border-gray-300 dark:border-slate-600 hover:border-teal-400 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            deliveryMethod === 'meet_public' 
                              ? 'bg-teal-500 text-white' 
                              : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                          }`}>
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold ${
                              deliveryMethod === 'meet_public' 
                                ? 'text-teal-700 dark:text-teal-300' 
                                : 'text-gray-900 dark:text-slate-100'
                            }`}>
                              <TranslatedText text="Meet Public" />
                            </p>
                            <p className="text-xs text-gray-600 dark:text-slate-400">
                              <TranslatedText text="Meet at public location" />
                            </p>
                          </div>
                          {deliveryMethod === 'meet_public' && (
                            <CheckCircle className="w-5 h-5 text-teal-500" />
                          )}
                        </div>
                      </button>
                    )}
                    
                    {availableMethods.includes('visit') && (
                      <button
                        type="button"
                        onClick={() => {
                          const productAddress = product.address_line || product.location?.address || '';
                          setDeliveryMethod('visit');
                          if (productAddress) {
                            setMeetPublicLocation(productAddress);
                          }
                        }}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                          deliveryMethod === 'visit'
                            ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 shadow-lg'
                            : 'border-gray-300 dark:border-slate-600 hover:border-teal-400 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            deliveryMethod === 'visit' 
                              ? 'bg-teal-500 text-white' 
                              : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                          }`}>
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className={`font-semibold ${
                              deliveryMethod === 'visit' 
                                ? 'text-teal-700 dark:text-teal-300' 
                                : 'text-gray-900 dark:text-slate-100'
                            }`}>
                              <TranslatedText text="Visit" />
                            </p>
                            <p className="text-xs text-gray-600 dark:text-slate-400">
                              <TranslatedText text="Visit seller location" />
                            </p>
                          </div>
                          {deliveryMethod === 'visit' && (
                            <CheckCircle className="w-5 h-5 text-teal-500" />
                          )}
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Address/Location Fields */}
            {deliveryMethod === 'visit' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                <h4 className="font-bold text-lg text-gray-900 dark:text-slate-100 mb-4">
                  <TranslatedText text="Visit Location" />
                </h4>
                <input
                  type="text"
                  value={meetPublicLocation || product.address_line || product.location?.address || ''}
                  readOnly
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-100 cursor-not-allowed"
                  placeholder={tSync('Product location will be used automatically')}
                />
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                  <TranslatedText text="This location is automatically set from the product's address" />
                </p>
              </div>
            )}

            {deliveryMethod === 'meet_public' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                <h4 className="font-bold text-lg text-gray-900 dark:text-slate-100 mb-4">
                  <TranslatedText text="Meet Location" />
                </h4>
                <textarea
                  value={meetPublicLocation}
                  onChange={(e) => setMeetPublicLocation(e.target.value)}
                  placeholder={tSync('Enter public meeting location (e.g., shopping mall, park)')}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 transition-all"
                />
              </div>
            )}

            {deliveryMethod === 'delivery' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                <h4 className="font-bold text-lg text-gray-900 dark:text-slate-100 mb-4">
                  <TranslatedText text="Delivery Address" />
                </h4>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder={tSync('Enter delivery address')}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 transition-all"
                />
              </div>
            )}

            {/* Instructions */}
            {(deliveryMethod === 'delivery' || deliveryMethod === 'meet_public' || deliveryMethod === 'visit') && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
                <h4 className="font-bold text-lg text-gray-900 dark:text-slate-100 mb-4">
                  {deliveryMethod === 'delivery' ? tSync('Delivery Instructions') :
                   deliveryMethod === 'meet_public' ? tSync('Meeting Instructions') :
                   tSync('Visit Instructions')} <span className="text-gray-400 text-sm font-normal">(<TranslatedText text="Optional" />)</span>
                </h4>
                <textarea
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder={
                    deliveryMethod === 'delivery' ? tSync('Gate codes, special notes, preferred location...') :
                    deliveryMethod === 'meet_public' ? tSync('Meeting point details, landmarks, contact information...') :
                    tSync('Special notes for your visit, access instructions...')
                  }
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 transition-all"
                />
              </div>
            )}

            {/* Special Instructions */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
              <h4 className="font-bold text-lg text-gray-900 dark:text-slate-100 mb-4">
                <TranslatedText text="Special Instructions" /> <span className="text-gray-400 text-sm font-normal">(<TranslatedText text="Optional" />)</span>
              </h4>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder={tSync('Any special requests or instructions')}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-800 transition-all"
              />
            </div>

            {/* Order Summary */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-4">
                <TranslatedText text="Order Summary" />
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-slate-400">
                    <TranslatedText text="Base price" />
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">
                    {formatCurrency(product.pricePerDay, product.currency)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-slate-400">
                    <TranslatedText text="Duration" />
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">
                    {totalDays} {totalDays === 1 ? tSync('day') : tSync('days')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-slate-400">
                    <TranslatedText text="Subtotal" />
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-slate-100">
                    {formatCurrency(basePrice, product.currency)}
                  </span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900 dark:text-slate-100">
                      <TranslatedText text="Total" />
                    </span>
                    <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                      {formatCurrency(totalPrice, product.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
              <h4 className="font-bold text-lg text-gray-900 dark:text-slate-100 mb-4">
                <TranslatedText text="Why choose us?" />
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    <TranslatedText text="Secure payment protection" />
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    <TranslatedText text="Verified sellers only" />
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-gray-700 dark:text-slate-300">
                    <TranslatedText text="24/7 customer support" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Actions */}
        <div className="flex-shrink-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 p-6 space-y-3">
          <button
            onClick={handleAddToCart}
            className="w-full py-4 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShoppingCart className="w-6 h-6" />
            <TranslatedText text="Add to Cart" />
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-2xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
          >
            <TranslatedText text="Continue Shopping" />
          </button>

          {/* Additional Info */}
          <div className="text-center text-xs text-gray-500 dark:text-slate-400 space-y-1 pt-2">
            <p><TranslatedText text="Free cancellation within 24 hours" /></p>
            <p><TranslatedText text="Instant booking confirmation" /></p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddToCartModal;