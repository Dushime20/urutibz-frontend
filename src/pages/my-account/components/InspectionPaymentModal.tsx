import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { X, CreditCard, Smartphone, CheckCircle, AlertCircle, Loader2, ArrowUpDown, Info, Check } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { processInspectionPayment } from '../service/thirdPartyInspectionApi';
import { fetchPaymentMethods, PaymentMethodRecord, convertCurrencyLive, fetchPaymentProviders, addPaymentMethod } from '../../booking-page/service/api';
import { convertCurrency, formatCurrency, getMobileMoneyProviderCurrency, needsCurrencyConversion } from '../../../lib/utils';

interface InspectionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  inspection: {
    id: string;
    inspectionCost: number;
    currency: string;
    inspectionTier: 'standard' | 'advanced';
    scheduledAt: string;
    productId?: string;
    bookingId?: string;
  };
}

// Available currencies for selection
const AVAILABLE_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'RF' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
];

// Tier pricing (base in USD)
const TIER_PRICING = {
  standard: 50,
  advanced: 100,
};

const InspectionPaymentModal: React.FC<InspectionPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  inspection
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRecord[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodRecord | null>(null);
  const [loadingMethods, setLoadingMethods] = useState(true);
  
  // Payment type selection (like booking payment)
  const [paymentType, setPaymentType] = useState<'card' | 'mobile_money' | ''>('');
  const [showMethodSelection, setShowMethodSelection] = useState(false);
  const [showNewMethodForm, setShowNewMethodForm] = useState(false);
  
  // Providers and form for new payment method
  const [providers, setProviders] = useState<{ id: string; provider_name: string; provider_type: string; display_name?: string; is_active?: boolean }[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [newMethodForm, setNewMethodForm] = useState<any>({});
  
  // Currency selection
  const [selectedCurrency, setSelectedCurrency] = useState<string>(inspection.currency || 'USD');
  const [conversionInfo, setConversionInfo] = useState<{
    amount: number;
    currency: string;
    exchangeRate: number;
    isConverted: boolean;
  } | null>(null);
  const [convertingCurrency, setConvertingCurrency] = useState(false);

  // Calculate base amount from tier
  const baseAmount = useMemo(() => {
    return TIER_PRICING[inspection.inspectionTier] || TIER_PRICING.standard;
  }, [inspection.inspectionTier]);

  // Calculate amount in selected currency
  const displayAmount = useMemo(() => {
    if (conversionInfo && conversionInfo.isConverted) {
      return conversionInfo.amount;
    }
    if (selectedCurrency === 'USD') {
      return baseAmount;
    }
    // Use static conversion as fallback
    return convertCurrency(baseAmount, 'USD', selectedCurrency);
  }, [baseAmount, selectedCurrency, conversionInfo]);

  const token = localStorage.getItem('token') || localStorage.getItem('authToken') || '';

  useEffect(() => {
    if (isOpen) {
      loadPaymentMethods();
      loadPaymentProviders();
      setSelectedCurrency(inspection.currency || 'USD');
      setConversionInfo(null);
      setPaymentType('');
      setShowMethodSelection(false);
      setShowNewMethodForm(false);
      setSelectedMethod(null);
      setNewMethodForm({});
    }
  }, [isOpen, inspection.currency]);

  const loadPaymentProviders = async () => {
    setLoadingProviders(true);
    try {
      const providersList = await fetchPaymentProviders(token || undefined);
      // Filter only active providers from database
      const activeProviders = (providersList || []).filter((p: any) => p.is_active !== false);
      setProviders(activeProviders);
      console.log('Loaded payment providers from database:', activeProviders);
    } catch (error) {
      console.error('Error loading payment providers:', error);
      setProviders([]);
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleCurrencyConversion = useCallback(async (targetCurrency: string) => {
    if (targetCurrency === 'USD') {
      setConversionInfo(null);
      return;
    }

    setConvertingCurrency(true);
    try {
      const live = await convertCurrencyLive(
        { from: 'USD', to: targetCurrency, amount: baseAmount },
        token || undefined
      );
      setConversionInfo({
        amount: live.amount,
        currency: targetCurrency,
        exchangeRate: live.rate,
        isConverted: true
      });
    } catch (e) {
      // Fallback to static conversion
      const fallbackAmount = convertCurrency(baseAmount, 'USD', targetCurrency);
      setConversionInfo({
        amount: fallbackAmount,
        currency: targetCurrency,
        exchangeRate: fallbackAmount / baseAmount,
        isConverted: false
      });
    } finally {
      setConvertingCurrency(false);
    }
  }, [baseAmount, token]);

  // Convert currency when selection changes
  useEffect(() => {
    if (isOpen && selectedCurrency && selectedCurrency !== 'USD') {
      handleCurrencyConversion(selectedCurrency);
    } else if (selectedCurrency === 'USD') {
      setConversionInfo(null);
    }
  }, [selectedCurrency, isOpen, handleCurrencyConversion]);

  const loadPaymentMethods = async () => {
    setLoadingMethods(true);
    setError(null);
    try {
      const methodsResponse = await fetchPaymentMethods(token || undefined);
      // Use same pattern as booking payment: check both nested and flat structure
      const methods = methodsResponse.data?.data || methodsResponse.data || [];
      console.log('Loaded payment methods:', methods);
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      setError('Failed to load payment methods. Please try again.');
    } finally {
      setLoadingMethods(false);
    }
  };

  const handlePaymentTypeSelect = (type: 'card' | 'mobile_money') => {
    setPaymentType(type);
    setShowMethodSelection(true);
    setError(null);
    setNewMethodForm({});
    
    // For mobile money, always show form to enter phone number
    if (type === 'mobile_money') {
      setSelectedMethod(null);
      setShowNewMethodForm(true);
    } else {
      // For cards, show existing methods if available
      const methodsOfType = paymentMethods.filter(m => m.type === type);
      if (methodsOfType.length > 0) {
        setSelectedMethod(methodsOfType[0]);
        setShowNewMethodForm(false);
      } else {
        setSelectedMethod(null);
        setShowNewMethodForm(true); // Show form if no existing methods
      }
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewMethodForm({ ...newMethodForm, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  // Filter payment methods by selected type (exclude mobile_money - always require new entry)
  const filteredPaymentMethods = paymentType 
    ? paymentMethods.filter(m => m.type === paymentType && m.type !== 'mobile_money')
    : paymentMethods.filter(m => m.type !== 'mobile_money');

  const handlePayment = async () => {
    // For mobile money, always require form entry (no existing methods allowed)
    if (paymentType === 'mobile_money') {
      if (!newMethodForm.provider || !newMethodForm.phone_number) {
        setError('Please fill in mobile money provider and phone number');
        return;
      }
    }
    
    // For cards, check if using new method form or existing method
    if (paymentType === 'card') {
    if (showNewMethodForm) {
      // Validate new card form
      if (!newMethodForm.provider || !newMethodForm.card_number || !newMethodForm.card_brand || !newMethodForm.exp_month || !newMethodForm.exp_year || !newMethodForm.cvv) {
        setError('Please fill in all required fields for card');
        return;
      }
      // For now, show error that user needs to use existing method or add one first
      setError('Please use an existing payment method or add a new one in your account settings first');
      return;
    } else {
      if (!selectedMethod) {
        setError('Please select a payment method');
        return;
        }
      }
    }

    setLoading(true);
    setError(null);

    try {
      let paymentMethodId: string;
      let paymentProvider: string | undefined;

      // For mobile money, create a payment method first
      if (paymentType === 'mobile_money') {
        try {
          const paymentMethodPayload = {
            type: 'mobile_money',
            provider: newMethodForm.provider,
            phone_number: newMethodForm.phone_number,
            currency: selectedCurrency,
            is_default: false,
            metadata: { description: `Mobile Money - ${newMethodForm.phone_number}` }
          };

          const addMethodResponse = await addPaymentMethod(paymentMethodPayload, token);
          
          // Extract payment method ID from response
          if (addMethodResponse?.data?.id) {
            paymentMethodId = addMethodResponse.data.id;
          } else if (addMethodResponse?.id) {
            paymentMethodId = addMethodResponse.id;
          } else {
            throw new Error('Failed to create payment method. Please try again.');
          }
          
          paymentProvider = newMethodForm.provider;
        } catch (err: any) {
          setError(err.response?.data?.message || err.message || 'Failed to create payment method. Please try again.');
          setLoading(false);
          return;
        }
      } else {
        // For cards, use selected method
        if (!selectedMethod) {
          setError('Please select a payment method');
          setLoading(false);
          return;
        }
        paymentMethodId = selectedMethod.id;
        paymentProvider = selectedMethod.provider;
      }

      // Use converted amount and currency if conversion was applied
      const finalAmount = conversionInfo && conversionInfo.isConverted 
        ? conversionInfo.amount 
        : displayAmount;
      const finalCurrency = conversionInfo && conversionInfo.isConverted
        ? conversionInfo.currency
        : selectedCurrency;

      // Check if currency conversion is needed for mobile money
      let paymentAmount = finalAmount;
      let paymentCurrency = finalCurrency;

      if (paymentType === 'mobile_money' && paymentProvider) {
        const providerCurrency = getMobileMoneyProviderCurrency(paymentProvider);
        if (needsCurrencyConversion(paymentCurrency, paymentProvider)) {
          try {
            const conversion = await convertCurrencyLive(
              { from: paymentCurrency, to: providerCurrency, amount: paymentAmount },
              token || undefined
            );
            paymentAmount = conversion.amount;
            paymentCurrency = providerCurrency;
          } catch (e) {
            // Fallback to static conversion
            paymentAmount = convertCurrency(paymentAmount, paymentCurrency, providerCurrency);
            paymentCurrency = providerCurrency;
          }
        }
      } else if (selectedMethod && selectedMethod.type === 'mobile_money' && selectedMethod.provider) {
        const providerCurrency = getMobileMoneyProviderCurrency(selectedMethod.provider);
        if (needsCurrencyConversion(paymentCurrency, selectedMethod.provider)) {
          try {
            const conversion = await convertCurrencyLive(
              { from: paymentCurrency, to: providerCurrency, amount: paymentAmount },
              token || undefined
            );
            paymentAmount = conversion.amount;
            paymentCurrency = providerCurrency;
          } catch (e) {
            // Fallback to static conversion
            paymentAmount = convertCurrency(paymentAmount, paymentCurrency, providerCurrency);
            paymentCurrency = providerCurrency;
          }
        }
      }

      await processInspectionPayment(
        inspection.id,
        {
          paymentMethodId: paymentMethodId,
          amount: paymentAmount,
          currency: paymentCurrency,
          provider: paymentProvider
        },
        token
      );

      setSuccess(true);
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError(null);
    setSelectedMethod(null);
    setSelectedCurrency(inspection.currency || 'USD');
    setConversionInfo(null);
    onClose();
  };

  if (!isOpen) return null;

  // Success state
  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
        <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-slate-700">
          <div className="p-8">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/20 rounded-full">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-slate-100 mb-3">
              Payment Successful!
            </h3>
            <p className="text-center text-gray-600 dark:text-slate-400 mb-2">
              Your inspection payment has been processed successfully.
            </p>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 mt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-slate-400">Amount Paid:</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(
                    conversionInfo && conversionInfo.isConverted ? conversionInfo.amount : displayAmount,
                    'en-US',
                    conversionInfo && conversionInfo.isConverted ? conversionInfo.currency : selectedCurrency
                  )}
                </span>
              </div>
              {conversionInfo && conversionInfo.isConverted && (
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                  <span className="text-xs text-gray-500 dark:text-slate-500">Original:</span>
                  <span className="text-xs text-gray-500 dark:text-slate-500">
                    {formatCurrency(baseAmount, 'en-US', 'USD')} (Rate: {conversionInfo.exchangeRate.toFixed(4)})
                  </span>
                </div>
              )}
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-slate-400">
              The inspection is now pending and will be assigned to an inspector.
            </p>
            <button
              onClick={handleClose}
              className="w-full mt-6 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl border border-gray-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-6 py-5 flex items-center justify-between z-10">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Pay Inspection Fee</h2>
            <p className="text-gray-600 dark:text-slate-400">Complete your payment to proceed</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Inspection Summary */}
          <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Inspection Details</h3>
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full capitalize">
                {inspection.inspectionTier} Tier
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-slate-400">Type</span>
                <span className="text-sm font-medium text-gray-900 dark:text-slate-100 capitalize">
                  {inspection.inspectionTier === 'standard' ? 'Standard (120-point)' : 'Advanced (240-point)'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-slate-400">Scheduled Date</span>
                <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  {new Date(inspection.scheduledAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900 dark:text-slate-100">Total Amount</span>
                  <div className="text-right">
                    {convertingCurrency ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        <span className="text-sm text-gray-500">Converting...</span>
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(displayAmount, 'en-US', selectedCurrency)}
                      </span>
                    )}
                  </div>
                </div>
                {conversionInfo && conversionInfo.isConverted && (
                  <div className="flex items-center justify-end gap-2 mt-1">
                    <span className="text-xs text-gray-500 dark:text-slate-500">
                      ≈ {formatCurrency(baseAmount, 'en-US', 'USD')} USD
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Currency Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-4">Currency</label>
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_CURRENCIES.map((curr) => (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => setSelectedCurrency(curr.code)}
                  disabled={convertingCurrency}
                  className={`px-3 py-2.5 border-2 rounded-xl transition-all duration-200 text-center ${
                    selectedCurrency === curr.code
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-600 dark:text-slate-300'
                  } ${convertingCurrency ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="font-semibold text-sm">{curr.code}</div>
                  <div className="text-xs opacity-75 mt-0.5">{curr.symbol}</div>
                </button>
              ))}
            </div>
            {conversionInfo && conversionInfo.isConverted && (
              <div className="mt-3 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                <Info className="w-4 h-4" />
                <span>Converted using live exchange rates</span>
              </div>
            )}
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-4">Payment Method</label>
            
            {loadingMethods ? (
              <div className="px-4 py-12 bg-gray-50 dark:bg-slate-800 rounded-xl flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-3 text-sm text-gray-500 dark:text-slate-400">Loading payment methods...</span>
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">No payment methods available. Please add a payment method.</span>
              </div>
            ) : !showMethodSelection ? (
              // Step 1: Choose Payment Type (matching AddPaymentMethod style)
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handlePaymentTypeSelect('card')}
                  className={`p-4 border-2 rounded-xl transition-all duration-200 flex flex-col items-center gap-2 ${
                    paymentType === 'card'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-600 dark:text-slate-300'
                  }`}
                >
                  <CreditCard className="w-6 h-6" />
                  <span className="font-medium text-sm">Credit Card</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handlePaymentTypeSelect('mobile_money')}
                  className={`p-4 border-2 rounded-xl transition-all duration-200 flex flex-col items-center gap-2 ${
                    paymentType === 'mobile_money'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-600 dark:text-slate-300'
                  }`}
                >
                  <Smartphone className="w-6 h-6" />
                  <span className="font-medium text-sm">Mobile Money</span>
                </button>
              </div>
            ) : (
              // Step 2: Select or Enter Payment Method
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMethodSelection(false);
                      setPaymentType('');
                      setSelectedMethod(null);
                      setShowNewMethodForm(false);
                      setNewMethodForm({});
                    }}
                    className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Change Payment Type
                  </button>
                  {/* Only show toggle for cards, not mobile money */}
                  {paymentType === 'card' && filteredPaymentMethods.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewMethodForm(!showNewMethodForm);
                        setSelectedMethod(null);
                        setNewMethodForm({});
                      }}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                    >
                      {showNewMethodForm ? 'Use Existing' : 'Enter New Details'}
                    </button>
                  )}
                </div>

                {/* For mobile money, always show form. For cards, show form or existing methods */}
                {(showNewMethodForm || paymentType === 'mobile_money') ? (
                  // Form to enter new payment method details
                  <div className="space-y-4">
                    {paymentType === 'mobile_money' && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Mobile Money Provider</label>
                          {loadingProviders ? (
                            <div className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                              <span className="text-sm text-gray-500 dark:text-slate-400">Loading providers...</span>
                            </div>
                          ) : (
                            <select
                              name="provider"
                              value={newMethodForm.provider || ''}
                              onChange={handleFormChange}
                              required
                              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200 dark:bg-slate-800 dark:text-slate-100"
                            >
                              <option value="">Select Provider</option>
                              {providers.filter(p => p.provider_type === 'mobile_money').map(p => (
                                <option key={p.id} value={p.provider_name}>
                                  {p.display_name || p.provider_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </option>
                              ))}
                            </select>
                          )}
                          {!loadingProviders && providers.filter(p => p.provider_type === 'mobile_money').length === 0 && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">No mobile money providers available in database</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Phone Number</label>
                          <input
                            name="phone_number"
                            type="tel"
                            value={newMethodForm.phone_number || ''}
                            onChange={handleFormChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200 dark:bg-slate-800 dark:text-slate-100"
                            placeholder="e.g. +250781234567"
                          />
                        </div>
                      </>
                    )}

                    {paymentType === 'card' && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Card Provider</label>
                          {loadingProviders ? (
                            <div className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                              <span className="text-sm text-gray-500 dark:text-slate-400">Loading providers...</span>
                            </div>
                          ) : (
                            <select
                              name="provider"
                              value={newMethodForm.provider || ''}
                              onChange={handleFormChange}
                              required
                              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200 dark:bg-slate-800 dark:text-slate-100"
                            >
                              <option value="">Select Provider</option>
                              {providers.filter(p => p.provider_type === 'card').map(p => (
                                <option key={p.id} value={p.provider_name}>
                                  {p.display_name || p.provider_name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </option>
                              ))}
                            </select>
                          )}
                          {!loadingProviders && providers.filter(p => p.provider_type === 'card').length === 0 && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">No card providers available in database</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Card Number</label>
                          <input
                            name="card_number"
                            type="text"
                            value={newMethodForm.card_number || ''}
                            onChange={handleFormChange}
                            required
                            maxLength={19}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200 dark:bg-slate-800 dark:text-slate-100"
                            placeholder="1234 5678 9012 3456"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Card Brand</label>
                          <input
                            name="card_brand"
                            type="text"
                            value={newMethodForm.card_brand || ''}
                            onChange={handleFormChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200 dark:bg-slate-800 dark:text-slate-100"
                            placeholder="e.g. visa, mastercard"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Exp Month</label>
                            <input
                              name="exp_month"
                              type="number"
                              min={1}
                              max={12}
                              value={newMethodForm.exp_month || ''}
                              onChange={handleFormChange}
                              required
                              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200 dark:bg-slate-800 dark:text-slate-100"
                              placeholder="MM"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Exp Year</label>
                            <input
                              name="exp_year"
                              type="number"
                              min={2024}
                              max={2100}
                              value={newMethodForm.exp_year || ''}
                              onChange={handleFormChange}
                              required
                              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200 dark:bg-slate-800 dark:text-slate-100"
                              placeholder="YYYY"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">CVV</label>
                          <input
                            name="cvv"
                            type="text"
                            value={newMethodForm.cvv || ''}
                            onChange={handleFormChange}
                            required
                            maxLength={4}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200 dark:bg-slate-800 dark:text-slate-100"
                            placeholder="123"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ) : filteredPaymentMethods.length === 0 ? (
                  <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-yellow-700 dark:text-yellow-300">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">
                      No credit card payment methods available. Please enter your details above.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPaymentMethods.map((method) => {
                      const methodCurrency = method.type === 'mobile_money' && method.provider
                        ? getMobileMoneyProviderCurrency(method.provider)
                        : selectedCurrency;
                      
                      const needsConversion = method.type === 'mobile_money' && method.provider
                        ? needsCurrencyConversion(selectedCurrency, method.provider)
                        : false;

                      const isSelected = selectedMethod?.id === method.id;

                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedMethod(method)}
                          className={`w-full p-4 border-2 rounded-xl transition-all duration-200 text-left ${
                            isSelected
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                          }`}
                        >
                          {method.type === 'card' ? (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                                <CreditCard className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {method.card_brand?.toUpperCase() || 'CARD'} •••• {method.last_four || ''}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-slate-400">
                                  {method.exp_month && method.exp_year ? `Expires ${method.exp_month}/${method.exp_year}` : ''}
                                </div>
                                {method.metadata?.description && (
                                  <div className="text-sm text-gray-500 dark:text-slate-400">{method.metadata.description}</div>
                                )}
                              </div>
                              {isSelected && (
                                <div className="flex-shrink-0">
                                  <Check className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                                <Smartphone className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {method.provider ? method.provider.replace(/_/g, ' ').toUpperCase() : 'MOBILE MONEY'}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-slate-400">
                                  {method.phone_number || ''}
                                </div>
                                {needsConversion && (
                                  <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1">
                                    <ArrowUpDown className="w-3 h-3" />
                                    Will convert to {methodCurrency}
                                  </div>
                                )}
                                {method.metadata?.description && (
                                  <div className="text-sm text-gray-500 dark:text-slate-400">{method.metadata.description}</div>
                                )}
                              </div>
                              {isSelected && (
                                <div className="flex-shrink-0">
                                  <Check className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                </div>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={handlePayment}
              disabled={loading || !showMethodSelection || (paymentType === 'mobile_money' && (!newMethodForm.provider || !newMethodForm.phone_number)) || (paymentType === 'card' && !selectedMethod && !showNewMethodForm) || (paymentType === 'card' && showNewMethodForm && (!newMethodForm.provider || !newMethodForm.card_number || !newMethodForm.card_brand || !newMethodForm.exp_month || !newMethodForm.exp_year || !newMethodForm.cvv)) || convertingCurrency}
              loading={loading}
            >
              {loading ? 'Processing...' : `Pay ${formatCurrency(displayAmount, 'en-US', selectedCurrency)}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
    );
};

export default InspectionPaymentModal;
