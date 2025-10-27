import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Check, AlertCircle, CheckCircle, ArrowUpDown } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { processPaymentTransaction, fetchPaymentMethods, convertCurrencyLive, fetchPaymentProvidersByCountry, CountryPaymentProvidersResponse, fetchPaymentProviders, fetchDefaultPaymentMethods, PaymentMethodRecord } from '../service/api';
import axios from 'axios';
import { API_BASE_URL } from '../service/api';
import { 
  convertToMobileMoneyAmount, 
  needsCurrencyConversion, 
  formatCurrency, 
  getMobileMoneyProviderCurrency 
} from '../../../lib/utils';

interface PaymentStepperProps {
  bookingId: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
}

// Country code mapping with validation rules
const countryCodes: Record<string, { code: string; name: string; flag: string; pattern: RegExp; minLength: number; maxLength: number; example: string; mustStartWith?: string }> = {
  'RW': { code: '+250', name: 'Rwanda', flag: '🇷🇼', pattern: /^7[0-9]{8}$/, minLength: 9, maxLength: 9, example: '788123456', mustStartWith: '7' },
  'KE': { code: '+254', name: 'Kenya', flag: '🇰🇪', pattern: /^7[0-9]{8}$/, minLength: 9, maxLength: 9, example: '712345678' },
  'UG': { code: '+256', name: 'Uganda', flag: '🇺🇬', pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, example: '701234567' },
  'TZ': { code: '+255', name: 'Tanzania', flag: '🇹🇿', pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, example: '712345678' },
};

const PaymentStepper: React.FC<PaymentStepperProps> = ({ bookingId, amount, currency, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<'card' | 'mobile_money' | ''>('');
  const [form, setForm] = useState<any>({});
  const [phoneError, setPhoneError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const [conversionInfo, setConversionInfo] = useState<{
    amount: number;
    currency: string;
    exchangeRate: number;
    isConverted: boolean;
  } | null>(null);
  const [countryProviders, setCountryProviders] = useState<CountryPaymentProvidersResponse | null>(null);
  const [availableCardProviders, setAvailableCardProviders] = useState<string[]>([]);
  const [availableMobileMoneyProviders, setAvailableMobileMoneyProviders] = useState<string[]>([]);
  
  // Phone input state
  const [selectedCountryCode, setSelectedCountryCode] = useState('+250');
  const [phoneNumber, setPhoneNumber] = useState('');

  const steps = [
    { id: 1, title: 'Choose Type', description: 'Select payment method' },
    { id: 2, title: 'Enter Details', description: 'Provide payment information' },
    { id: 3, title: 'Confirm Payment', description: 'Review and complete' }
  ];

  useEffect(() => {
    const fetchInitialPaymentMethods = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        let countryId: string | null = null;
        try {
          if (storedUser) countryId = JSON.parse(storedUser)?.countryId || null;
        } catch {}
        const methodsResponse = await fetchPaymentMethods(token || undefined);
        
        const methods = methodsResponse.data?.data || methodsResponse.data || [];
        console.log('Initial payment methods:', methods);
        
        setPaymentMethods(methods);
        
        if (methods.length > 0) {
          setSelectedMethod(methods[0]);
        }

        // Fetch real providers by user's country if available; else fall back to global
        let cards: string[] = [];
        let momos: string[] = [];
        if (countryId) {
          const providers = await fetchPaymentProvidersByCountry(countryId, token || undefined);
          setCountryProviders(providers);
          if (providers) {
            cards = (providers.card_providers || providers.providers || [])
              .filter((p: any) => p.provider_type === 'card')
              .map((p: any) => p.provider_name);
            momos = (providers.mobile_money_providers || providers.providers || [])
              .filter((p: any) => p.provider_type === 'mobile_money')
              .map((p: any) => p.provider_name);
          }
        }

        // Fallback to global providers if lists are empty
        if (cards.length === 0 || momos.length === 0) {
          const globalProviders = await fetchPaymentProviders(token || undefined);
          if (Array.isArray(globalProviders)) {
            if (cards.length === 0) {
              cards = globalProviders
                .filter((p: any) => p.provider_type === 'card')
                .map((p: any) => p.provider_name);
            }
            if (momos.length === 0) {
              momos = globalProviders
                .filter((p: any) => p.provider_type === 'mobile_money')
                .map((p: any) => p.provider_name);
            }
          }
        }

        setAvailableCardProviders(Array.from(new Set(cards)));
        setAvailableMobileMoneyProviders(Array.from(new Set(momos)));
      } catch (error) {
        console.error('Error fetching initial payment methods:', error);
        setError('Failed to fetch payment methods');
      }
    };

    fetchInitialPaymentMethods();
  }, []);

  useEffect(() => {
    setError(null);
  }, [step]);

  const handleTypeChange = (selectedType: 'card' | 'mobile_money') => {
    setType(selectedType);
    setForm({});
    setError(null);
  };

  const getCurrentCountryRules = () => {
    const countryKey = Object.keys(countryCodes).find(key => 
      countryCodes[key].code === selectedCountryCode
    );
    return countryKey ? countryCodes[countryKey] : countryCodes.RW;
  };

  const validatePhoneNumber = (phone: string): { isValid: boolean; message?: string } => {
    const countryRules = getCurrentCountryRules();
    
    if (!phone) {
      return { isValid: false, message: 'Phone number is required' };
    }

    if (phone.length < countryRules.minLength) {
      return { 
        isValid: false, 
        message: `${countryRules.name} phone numbers must be at least ${countryRules.minLength} digits` 
      };
    }

    if (phone.length > countryRules.maxLength) {
      return { 
        isValid: false, 
        message: `${countryRules.name} phone numbers must be at most ${countryRules.maxLength} digits` 
      };
    }

    // Check if number must start with specific digit - only validate when at full length
    if (countryRules.mustStartWith && phone.length === countryRules.minLength && !phone.startsWith(countryRules.mustStartWith)) {
      return { 
        isValid: false, 
        message: `${countryRules.name} phone numbers must start with ${countryRules.mustStartWith}. Example: ${countryRules.example}` 
      };
    }

    if (!countryRules.pattern.test(phone)) {
      return { 
        isValid: false, 
        message: `Invalid ${countryRules.name} phone number format. Example: ${countryRules.example}` 
      };
    }

    return { isValid: true };
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null);
    
    // Validate phone number for mobile money
    if (e.target.name === 'phone_number' && type === 'mobile_money') {
      const phone = e.target.value;
      if (phone) {
        const validation = validatePhoneNumber(phone);
        setPhoneError(validation.isValid ? '' : validation.message || 'Please enter a valid phone number');
      } else {
        setPhoneError('');
      }
    }
    
    // Handle currency conversion when mobile money provider is selected
    if (e.target.name === 'provider' && type === 'mobile_money') {
      const provider = e.target.value;
      console.log(`🔄 Currency conversion check:`, {
        provider,
        bookingCurrency: currency,
        bookingAmount: amount,
        needsConversion: needsCurrencyConversion(currency, provider)
      });
      
      if (provider) {
        // Try to auto-fill phone number from user's default payment methods
        try {
          const token = localStorage.getItem('token') || undefined;
          const defaults: PaymentMethodRecord[] = await fetchDefaultPaymentMethods(token);
          const match = defaults.find(m => m.type === 'mobile_money' && m.provider === provider && m.phone_number);
          if (match?.phone_number) {
            setForm((prev: any) => ({ ...prev, phone_number: match.phone_number }));
          }
        } catch {}
      }

      if (provider && needsCurrencyConversion(currency, provider)) {
        const targetCurrency = getMobileMoneyProviderCurrency(provider);
        const token = localStorage.getItem('token') || undefined;
        try {
          const live = await convertCurrencyLive({ from: currency, to: targetCurrency, amount }, token);
          console.log('💱 Live conversion applied:', live);
          setConversionInfo({ amount: live.amount, currency: targetCurrency, exchangeRate: live.rate, isConverted: true });
        } catch (e) {
          // Fallback to local static conversion if live fails
          const fallback = convertToMobileMoneyAmount(amount, currency, provider);
          console.warn('Live conversion failed, using fallback:', e);
          setConversionInfo({ ...fallback, isConverted: true });
        }
      } else {
        console.log(`✅ No conversion needed`);
        setConversionInfo(null);
      }
    }
  };

  // Phone number input handlers
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    const countryRules = getCurrentCountryRules();
    
    // Limit input length based on country rules
    if (value.length <= countryRules.maxLength) {
      setPhoneNumber(value);
      
      // Validate phone number
      if (value.length > 0) {
        const validation = validatePhoneNumber(value);
        setPhoneError(validation.isValid ? '' : validation.message || 'Please enter a valid phone number');
      } else {
        setPhoneError('');
      }
      
      // Update form with full phone number
      const fullPhoneNumber = selectedCountryCode + value;
      setForm((prev: any) => ({ ...prev, phone_number: fullPhoneNumber }));
    }
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountryCode(e.target.value);
    setPhoneNumber(''); // Clear phone number when country changes
    setPhoneError('');
    setForm((prev: any) => ({ ...prev, phone_number: '' }));
  };

  const handleCreatePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate phone number for mobile money
    if (type === 'mobile_money') {
      if (!phoneNumber || phoneNumber.length === 0) {
        setError('Please enter a phone number');
        setLoading(false);
        return;
      }
      // Validate the local phone number (without country code)
      const validation = validatePhoneNumber(phoneNumber);
      if (!validation.isValid) {
        setError(validation.message || 'Please enter a valid phone number');
        setLoading(false);
        return;
      }
    }
    
    const token = localStorage.getItem('token');
    let payload: any = { 
      ...form, 
      type, 
      is_default: true, 
      currency, 
      metadata: { description: form.description || '' } 
    };
    
    if (type === 'card') {
      payload = {
        ...payload,
        provider: form.provider,
        last_four: form.last_four,
        card_brand: form.card_brand,
        exp_month: Number(form.exp_month),
        exp_year: Number(form.exp_year),
      };
    } else if (type === 'mobile_money') {
      payload = {
        type: 'mobile_money',
        provider: form.provider,
        phone_number: form.phone_number,
        is_default: true,
        currency,
        metadata: { description: form.description || '' }
      };
    }
    
    try {
      console.log('Creating payment method with payload:', payload);

      const createResponse = await axios.post(`${API_BASE_URL}/payment-methods`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Payment method creation response:', createResponse.data);

      const methodsResponse = await fetchPaymentMethods(token || undefined);
      const methods = methodsResponse.data?.data || methodsResponse.data || [];

      let newMethod = null;
      
      for (const method of methods) {
        if (
          method.type === type && 
          (type === 'card' 
            ? method.last_four === form.last_four 
            : method.phone_number === form.phone_number)
        ) {
          newMethod = method;
          break;
        }
      }

      if (newMethod) {
        setSelectedMethod(newMethod);
        setPaymentMethods(methods);
        setError(null);
        setStep(3);
      } else {
        const fallbackMethod = methods[methods.length - 1] || methods[0];
        if (fallbackMethod) {
          setSelectedMethod(fallbackMethod);
          setPaymentMethods(methods);
          setError(null);
          setStep(3);
        } else {
          setError('Failed to find the newly created payment method');
        }
      }
    } catch (err: any) {
      console.error('Error creating/fetching payment methods:', err);
      setError(err.response?.data?.message || 'Failed to create payment method');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      const paymentMethodId = selectedMethod?.id || 
        (paymentMethods.length > 0 ? paymentMethods[0].id : null);
      
      if (!paymentMethodId) {
        setError('No payment method available. Please add a payment method.');
        setLoading(false);
        return;
      }

      // Use converted amount and currency if conversion was applied
      const finalAmount = conversionInfo ? conversionInfo.amount : amount;
      const finalCurrency = conversionInfo ? conversionInfo.currency : currency;

      const paymentPayload = {
        booking_id: bookingId,
        payment_method_id: paymentMethodId,
        amount: finalAmount,
        currency: finalCurrency,
        transaction_type: 'booking_payment',
        // Explicitly include channel/type so not all are treated as Stripe
        payment_method_type: selectedMethod?.type || type,
        provider: selectedMethod?.provider || selectedMethod?.provider_name || undefined,
        metadata: {
          description: `Payment for booking #${bookingId}`,
          original_amount: amount,
          original_currency: currency,
          exchange_rate: conversionInfo?.exchangeRate || 1,
          is_converted: conversionInfo?.isConverted || false,
        },
      };
      
      console.log('Sending transaction payload:', paymentPayload);
      await processPaymentTransaction(paymentPayload, token || undefined);
      setSuccess(true);
      setTimeout(() => onSuccess(), 2000);
    } catch (err: any) {
      console.error('Transaction error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700">
        <div className="text-center">
          <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-success-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Payment Successful!</h2>
          <p className="text-gray-600 dark:text-slate-300 mb-2">
            Your payment of <span className="font-semibold text-primary-600">
              {conversionInfo ? `${conversionInfo.amount} ${conversionInfo.currency}` : `${amount} ${currency}`}
            </span> has been processed.
            {conversionInfo && conversionInfo.isConverted && (
              <span className="text-sm text-gray-500 dark:text-slate-400 block mt-1">
                (Converted from {amount} {currency})
              </span>
            )}
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-400">Redirecting you back to your booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700">
      {/* Enhanced Stepper */}
      <div className="mb-10">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-slate-700 -z-10">
            <div 
              className="h-full bg-primary-500 transition-all duration-500 ease-out"
              style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
          
          {steps.map((stepItem) => {
            const isActive = step === stepItem.id;
            const isCompleted = step > stepItem.id;
            
            return (
              <div key={stepItem.id} className="flex flex-col items-center relative z-10">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-all duration-300 font-bold
                  ${isActive 
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                    : isCompleted 
                      ? 'bg-primary-500 text-white' 
                      : 'bg-gray-100 text-gray-400'
                  }
                `}>
                  {isCompleted ? <Check className="w-5 h-5" /> : stepItem.id}
                </div>
                <div className="text-center max-w-24">
                  <span className={`
                    block text-sm font-semibold mb-1 transition-colors
                    ${isActive ? 'text-primary-600' : isCompleted ? 'text-gray-700' : 'text-gray-400'}
                  `}>
                    {stepItem.title}
                  </span>
                  <span className="text-xs text-gray-500 hidden sm:block leading-tight">
                    {stepItem.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Payment Type Selection */}
      {step === 1 && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Choose Payment Method</h2>
            <p className="text-gray-600 dark:text-slate-400">Select your preferred payment option</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              type="button"
              onClick={() => handleTypeChange('card')}
              className={`p-6 border-2 rounded-2xl transition-all duration-200 flex flex-col items-center gap-4 ${
                type === 'card'
                  ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-lg'
                  : 'border-gray-200 dark:border-slate-700 dark:hover:border-slate-600 hover:border-gray-300 hover:shadow-md text-gray-600 dark:text-slate-300'
              }`}
            >
              <CreditCard className="w-12 h-12" />
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-1">Credit Card</h3>
                <p className="text-sm opacity-75">Visa, MasterCard, Amex</p>
              </div>
            </button>
            
            <button
              type="button"
              onClick={() => handleTypeChange('mobile_money')}
              className={`p-6 border-2 rounded-2xl transition-all duration-200 flex flex-col items-center gap-4 ${
                type === 'mobile_money'
                  ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-lg'
                  : 'border-gray-200 dark:border-slate-700 dark:hover:border-slate-600 hover:border-gray-300 hover:shadow-md text-gray-600 dark:text-slate-300'
              }`}
            >
              <Smartphone className="w-12 h-12" />
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-1">Mobile Money</h3>
                <p className="text-sm opacity-75">MTN MoMo, Airtel Money</p>
              </div>
            </button>
          </div>
          
          <div className="flex justify-end">
            <Button
              type="button"
              variant="primary"
              disabled={!type}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Payment Details Form */}
      {step === 2 && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Details</h2>
            <p className="text-gray-600 dark:text-slate-400">Enter your {type === 'card' ? 'card' : 'mobile money'} information</p>
          </div>
          
          <form onSubmit={handleCreatePaymentMethod} className="space-y-6">
            {type === 'card' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Card Provider</label>
                    <select 
                      name="provider" 
                      value={form.provider || ''} 
                      onChange={handleChange} 
                      required 
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200 placeholder-gray-400 dark:placeholder-slate-500 shadow-sm"
                    >
                      <option value="">Select Provider</option>
                      {availableCardProviders.length > 0 ? (
                        availableCardProviders.map((p) => (
                          <option key={p} value={p}>{p.replace(/_/g,' ').toUpperCase()}</option>
                        ))
                      ) : (
                        <>
                          <option value="visa">Visa</option>
                          <option value="mastercard">MasterCard</option>
                          <option value="amex">American Express</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Card Brand</label>
                    <input 
                      name="card_brand" 
                      value={form.card_brand || ''} 
                      onChange={handleChange} 
                      required 
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200 placeholder-gray-400 dark:placeholder-slate-500 shadow-sm" 
                      placeholder="e.g. visa" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Last Four Digits</label>
                  <input 
                    name="last_four" 
                    value={form.last_four || ''} 
                    onChange={handleChange} 
                    required 
                    maxLength={4} 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200 placeholder-gray-400 dark:placeholder-slate-500 shadow-sm" 
                    placeholder="1234" 
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
                      value={form.exp_month || ''} 
                      onChange={handleChange} 
                      required 
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200 placeholder-gray-400 dark:placeholder-slate-500 shadow-sm" 
                      placeholder="MM" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Exp Year</label>
                    <input 
                      name="exp_year" 
                      type="number" 
                      min={2023} 
                      max={2100} 
                      value={form.exp_year || ''} 
                      onChange={handleChange} 
                      required 
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200 placeholder-gray-400 dark:placeholder-slate-500 shadow-sm" 
                      placeholder="YYYY" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Description (Optional)</label>
                  <input 
                    name="description" 
                    value={form.description || ''} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200 placeholder-gray-400 dark:placeholder-slate-500 shadow-sm" 
                    placeholder="e.g. My Visa card" 
                  />
                </div>
              </>
            )}

            {type === 'mobile_money' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Mobile Money Provider</label>
                  <select 
                    name="provider" 
                    value={form.provider || ''} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200 placeholder-gray-400 dark:placeholder-slate-500 shadow-sm"
                  >
                    <option value="">Select Provider</option>
                    {(availableMobileMoneyProviders.length > 0
                      ? availableMobileMoneyProviders
                      : ['mtn_momo','airtel_money','mpesa','mtn_uganda']
                    ).map((p) => (
                      <option key={p} value={p}>
                        {p.replace(/_/g,' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Currency Conversion Display */}
                {conversionInfo && conversionInfo.isConverted && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/40 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <ArrowUpDown className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-800">Currency Conversion</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-slate-400">Original Amount:</span>
                        <span className="font-medium">{formatCurrency(amount, 'en-US', currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-slate-400">Exchange Rate:</span>
                        <span className="font-medium">1 {currency} = {conversionInfo.exchangeRate.toFixed(2)} {conversionInfo.currency}</span>
                      </div>
                      <div className="flex justify-between border-t border-blue-200 pt-2">
                        <span className="text-blue-800 dark:text-blue-300 font-semibold">Amount to Pay:</span>
                        <span className="text-blue-800 dark:text-blue-300 font-bold">{formatCurrency(conversionInfo.amount, 'en-US', conversionInfo.currency)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Phone Number</label>
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedCountryCode}
                      onChange={handleCountryCodeChange}
                      className="border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-3 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-[120px]"
                      disabled={loading}
                    >
                      {Object.entries(countryCodes).map(([code, data]) => (
                        <option key={code} value={data.code}>
                          {data.flag} {data.code}
                        </option>
                      ))}
                    </select>
                    <input 
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      required 
                      placeholder={`Phone Number (${getCurrentCountryRules().minLength}-${getCurrentCountryRules().maxLength} digits${getCurrentCountryRules().mustStartWith ? `, starts with ${getCurrentCountryRules().mustStartWith}` : ''})`}
                      maxLength={getCurrentCountryRules().maxLength}
                      className={`flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:border-primary-500 outline-none transition-all duration-200 placeholder-gray-400 dark:placeholder-slate-500 shadow-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white ${
                        phoneError 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 dark:border-slate-700 focus:ring-primary-500'
                      }`}
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                    Full number: {selectedCountryCode}{phoneNumber || 'XXXXXXXX'}
                    {getCurrentCountryRules().mustStartWith && (
                      <span className="block">Format: {getCurrentCountryRules().minLength}-{getCurrentCountryRules().maxLength} digits, starts with {getCurrentCountryRules().mustStartWith} | Example: {getCurrentCountryRules().example}</span>
                    )}
                  </div>
                  {phoneError && (
                    <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                  )}
                </div>

                {/* <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                  <input 
                    name="description" 
                    value={form.description || ''} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200" 
                    placeholder="e.g. My MTN MoMo" 
                  />
                </div> */}
              </>
            )}

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                loading={loading}
              >
                {loading ? 'Adding Method...' : 'Add & Continue'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: Payment Confirmation */}
      {step === 3 && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Confirm Payment</h2>
            <p className="text-gray-600 dark:text-slate-400">Review your payment details and confirm</p>
          </div>

          {paymentMethods.length === 0 ? (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">No payment methods available. Please add a payment method.</span>
            </div>
          ) : (
            <>
              {/* Payment Summary */}
              <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Payment Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Booking ID</span>
                    <span className="font-medium">{bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">
                      {conversionInfo?.isConverted ? 'Original Amount' : 'Amount'}
                    </span>
                    <span className="font-medium">{amount} {currency}</span>
                  </div>
                  
                  {/* Show conversion details if applicable */}
                  {conversionInfo && conversionInfo.isConverted && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-slate-400">Exchange Rate</span>
                        <span className="font-medium">1 {currency} = {conversionInfo.exchangeRate.toFixed(2)} {conversionInfo.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-slate-400">Converted Amount</span>
                        <span className="font-medium">{conversionInfo.amount} {conversionInfo.currency}</span>
                      </div>
                    </>
                  )}
                  
                  <div className="border-t border-gray-200 dark:border-slate-700 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">Total to Pay</span>
                      <span className="font-bold text-xl text-primary-600">
                        {conversionInfo ? `${conversionInfo.amount} ${conversionInfo.currency}` : `${amount} ${currency}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method Details */}
              <div className="border border-gray-200 dark:border-slate-700 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h3>
                {selectedMethod?.type === 'card' ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <div className="font-medium">{selectedMethod.card_brand?.toUpperCase()} •••• {selectedMethod.last_four}</div>
                      <div className="text-sm text-gray-600 dark:text-slate-400">Expires {selectedMethod.exp_month}/{selectedMethod.exp_year}</div>
                      {selectedMethod.metadata?.description && (
                        <div className="text-sm text-gray-500 dark:text-slate-400">{selectedMethod.metadata.description}</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <div className="font-medium">{selectedMethod?.provider?.replace(/_/g, ' ').toUpperCase()}</div>
                      <div className="text-sm text-gray-600 dark:text-slate-400">{selectedMethod?.phone_number}</div>
                      {selectedMethod?.metadata?.description && (
                        <div className="text-sm text-gray-500 dark:text-slate-400">{selectedMethod.metadata.description}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleConfirm}
                  disabled={loading || !selectedMethod}
                  loading={loading}
                >
                  {loading ? 'Processing...' : `Pay ${amount} ${currency}`}
                </Button>
              </div>
            </>
          )}

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentStepper; 