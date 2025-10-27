import React, { useState, useEffect } from 'react';

interface PhoneStepProps {
  verificationData: any;
  setVerificationData: (fn: (prev: any) => any) => void;
  otp: string;
  setOtp: (otp: string) => void;
  onRequestOtp: () => void;
  onVerifyOtp: () => void;
  showOtpInput: boolean;
  isProcessing: boolean;
  errors: Record<string, string>;
  selectedCountry?: string;
}

// Country code mapping with validation rules
const countryCodes = {
  'RW': { code: '+250', name: 'Rwanda', flag: '🇷🇼', pattern: /^7[0-9]{8}$/, minLength: 9, maxLength: 9, example: '788123456', mustStartWith: '7' },
  'KE': { code: '+254', name: 'Kenya', flag: '🇰🇪', pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, example: '712345678' },
  'UG': { code: '+256', name: 'Uganda', flag: '🇺🇬', pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, example: '701234567' },
  'TZ': { code: '+255', name: 'Tanzania', flag: '🇹🇿', pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, example: '712345678' },
  'US': { code: '+1', name: 'United States', flag: '🇺🇸', pattern: /^[0-9]{10}$/, minLength: 10, maxLength: 10, example: '5551234567' },
  'GB': { code: '+44', name: 'United Kingdom', flag: '🇬🇧', pattern: /^[0-9]{10,11}$/, minLength: 10, maxLength: 11, example: '7123456789' },
  'FR': { code: '+33', name: 'France', flag: '🇫🇷', pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, example: '612345678' },
  'DE': { code: '+49', name: 'Germany', flag: '🇩🇪', pattern: /^[0-9]{10,12}$/, minLength: 10, maxLength: 12, example: '15123456789' },
  'IT': { code: '+39', name: 'Italy', flag: '🇮🇹', pattern: /^[0-9]{9,10}$/, minLength: 9, maxLength: 10, example: '3123456789' },
  'ES': { code: '+34', name: 'Spain', flag: '🇪🇸', pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, example: '612345678' },
  'CA': { code: '+1', name: 'Canada', flag: '🇨🇦', pattern: /^[0-9]{10}$/, minLength: 10, maxLength: 10, example: '5551234567' },
  'AU': { code: '+61', name: 'Australia', flag: '🇦🇺', pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, example: '412345678' },
  'ZA': { code: '+27', name: 'South Africa', flag: '🇿🇦', pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, example: '821234567' },
  'NG': { code: '+234', name: 'Nigeria', flag: '🇳🇬', pattern: /^[0-9]{10}$/, minLength: 10, maxLength: 10, example: '8012345678' },
  'EG': { code: '+20', name: 'Egypt', flag: '🇪🇬', pattern: /^[0-9]{10}$/, minLength: 10, maxLength: 10, example: '1012345678' },
  'MA': { code: '+212', name: 'Morocco', flag: '🇲🇦', pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, example: '612345678' },
  'GH': { code: '+233', name: 'Ghana', flag: '🇬🇭', pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, example: '201234567' },
  'ET': { code: '+251', name: 'Ethiopia', flag: '🇪🇹', pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, example: '911234567' },
  'BD': { code: '+880', name: 'Bangladesh', flag: '🇧🇩', pattern: /^[0-9]{10}$/, minLength: 10, maxLength: 10, example: '1712345678' },
  'IN': { code: '+91', name: 'India', flag: '🇮🇳', pattern: /^[0-9]{10}$/, minLength: 10, maxLength: 10, example: '9876543210' },
  'PK': { code: '+92', name: 'Pakistan', flag: '🇵🇰', pattern: /^[0-9]{10}$/, minLength: 10, maxLength: 10, example: '3012345678' },
  'CN': { code: '+86', name: 'China', flag: '🇨🇳', pattern: /^[0-9]{11}$/, minLength: 11, maxLength: 11, example: '13812345678' },
  'JP': { code: '+81', name: 'Japan', flag: '🇯🇵', pattern: /^[0-9]{10,11}$/, minLength: 10, maxLength: 11, example: '9012345678' },
  'KR': { code: '+82', name: 'South Korea', flag: '🇰🇷', pattern: /^[0-9]{10,11}$/, minLength: 10, maxLength: 11, example: '1012345678' },
  'BR': { code: '+55', name: 'Brazil', flag: '🇧🇷', pattern: /^[0-9]{10,11}$/, minLength: 10, maxLength: 11, example: '11987654321' },
  'MX': { code: '+52', name: 'Mexico', flag: '🇲🇽', pattern: /^[0-9]{10}$/, minLength: 10, maxLength: 10, example: '5512345678' },
  'AR': { code: '+54', name: 'Argentina', flag: '🇦🇷', pattern: /^[0-9]{10}$/, minLength: 10, maxLength: 10, example: '9112345678' },
  'RU': { code: '+7', name: 'Russia', flag: '🇷🇺', pattern: /^[0-9]{10}$/, minLength: 10, maxLength: 10, example: '9123456789' },
  'TR': { code: '+90', name: 'Turkey', flag: '🇹🇷', pattern: /^[0-9]{10}$/, minLength: 10, maxLength: 10, example: '5012345678' },
  'SA': { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦', pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, example: '501234567' },
  'AE': { code: '+971', name: 'UAE', flag: '🇦🇪', pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, example: '501234567' },
  'IL': { code: '+972', name: 'Israel', flag: '🇮🇱', pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, example: '501234567' },
  'TH': { code: '+66', name: 'Thailand', flag: '🇹🇭', pattern: /^[0-9]{9}$/, minLength: 9, maxLength: 9, example: '812345678' },
  'VN': { code: '+84', name: 'Vietnam', flag: '🇻🇳', pattern: /^[0-9]{9,10}$/, minLength: 9, maxLength: 10, example: '912345678' },
  'ID': { code: '+62', name: 'Indonesia', flag: '🇮🇩', pattern: /^[0-9]{10,12}$/, minLength: 10, maxLength: 12, example: '81234567890' },
  'MY': { code: '+60', name: 'Malaysia', flag: '🇲🇾', pattern: /^[0-9]{9,10}$/, minLength: 9, maxLength: 10, example: '123456789' },
  'SG': { code: '+65', name: 'Singapore', flag: '🇸🇬', pattern: /^[0-9]{8}$/, minLength: 8, maxLength: 8, example: '81234567' },
  'PH': { code: '+63', name: 'Philippines', flag: '🇵🇭', pattern: /^[0-9]{10}$/, minLength: 10, maxLength: 10, example: '9171234567' }
};

const PhoneStep: React.FC<PhoneStepProps> = ({
  verificationData,
  setVerificationData,
  otp,
  setOtp,
  onRequestOtp,
  onVerifyOtp,
  showOtpInput,
  isProcessing,
  errors,
  selectedCountry = 'RW'
}) => {
  const [selectedCountryCode, setSelectedCountryCode] = useState(countryCodes[selectedCountry as keyof typeof countryCodes]?.code || '+250');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Get current country validation rules
  const getCurrentCountryRules = () => {
    const countryKey = Object.keys(countryCodes).find(key => 
      countryCodes[key as keyof typeof countryCodes].code === selectedCountryCode
    );
    return countryCodes[countryKey as keyof typeof countryCodes];
  };

  // Validate phone number based on country rules
  const validatePhoneNumber = (number: string) => {
    const countryRules = getCurrentCountryRules();
    if (!countryRules) return { isValid: false, message: 'Invalid country code' };

    if (number.length < countryRules.minLength) {
      return { 
        isValid: false, 
        message: `${countryRules.name} phone numbers must be at least ${countryRules.minLength} digits` 
      };
    }

    if (number.length > countryRules.maxLength) {
      return { 
        isValid: false, 
        message: `${countryRules.name} phone numbers must be at most ${countryRules.maxLength} digits` 
      };
    }

    // Check if number must start with specific digit - only validate when at full length
    if (countryRules.mustStartWith && number.length === countryRules.minLength && !number.startsWith(countryRules.mustStartWith)) {
      return { 
        isValid: false, 
        message: `${countryRules.name} phone numbers must start with ${countryRules.mustStartWith}. Example: ${countryRules.example}` 
      };
    }

    if (!countryRules.pattern.test(number)) {
      return { 
        isValid: false, 
        message: `Invalid ${countryRules.name} phone number format. Example: ${countryRules.example}` 
      };
    }

    return { isValid: true, message: '' };
  };

  // Update country code when selectedCountry changes
  useEffect(() => {
    const countryCode = countryCodes[selectedCountry as keyof typeof countryCodes];
    if (countryCode) {
      setSelectedCountryCode(countryCode.code);
      setPhoneError(''); // Clear error when country changes
    }
  }, [selectedCountry]);

  // Update verification data when phone number changes
  useEffect(() => {
    const fullPhoneNumber = selectedCountryCode + phoneNumber;
    setVerificationData((prev: any) => ({ ...prev, phoneNumber: fullPhoneNumber }));
  }, [selectedCountryCode, phoneNumber, setVerificationData]);

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    const countryRules = getCurrentCountryRules();
    
    // Limit input length based on country rules
    if (value.length <= countryRules.maxLength) {
      setPhoneNumber(value);
      
      // Validate phone number
      if (value.length > 0) {
        const validation = validatePhoneNumber(value);
        setPhoneError(validation.isValid ? '' : validation.message);
      } else {
        setPhoneError('');
      }
    }
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountryCode(e.target.value);
    setPhoneError(''); // Clear error when country code changes
  };

  const currentCountryRules = getCurrentCountryRules();
  const isPhoneValid = phoneNumber.length > 0 && !phoneError;

  return (
  <div className="space-y-6">
    <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Phone Verification</h2>
        <p className="text-gray-600 dark:text-slate-400">Enter your phone number to receive a verification code</p>
    </div>
    <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-2 w-80">
          <select
            value={selectedCountryCode}
            onChange={handleCountryCodeChange}
            className="border border-gray-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#01aaa7] min-w-[120px]"
            disabled={isProcessing}
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
            placeholder={`Phone Number (${currentCountryRules.minLength}-${currentCountryRules.maxLength} digits${currentCountryRules.mustStartWith ? `, starts with ${currentCountryRules.mustStartWith}` : ''})`}
            className={`border rounded-lg px-4 py-2 flex-1 text-lg focus:outline-none focus:ring-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-white ${
              phoneError 
                ? 'border-red-500 focus:ring-red-500' 
                : isPhoneValid 
                  ? 'border-green-500 focus:ring-green-500' 
                  : 'border-gray-300 dark:border-slate-700 focus:ring-[#01aaa7]'
            }`}
        disabled={isProcessing}
            maxLength={currentCountryRules.maxLength}
          />
        </div>
        <div className="text-sm text-gray-500 dark:text-slate-400 text-center">
          <div>Full number: {selectedCountryCode}{phoneNumber || 'XXXXXXXX'}</div>
          <div className="text-xs mt-1">
            Format: {currentCountryRules.minLength}-{currentCountryRules.maxLength} digits{currentCountryRules.mustStartWith ? `, starts with ${currentCountryRules.mustStartWith}` : ''} | 
            Example: {currentCountryRules.example}
          </div>
        </div>
        
        {/* Validation error */}
        {phoneError && (
          <div className="text-red-600 text-sm text-center bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">
            {phoneError}
          </div>
        )}
        
        {/* Phone error from parent */}
        {errors.phone && (
          <div className="text-red-600 text-sm text-center bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">
            {errors.phone}
          </div>
        )}
        
      <button
        onClick={onRequestOtp}
          className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${
            isPhoneValid && !isProcessing
              ? 'bg-[#01aaa7] text-white hover:bg-[#019c98]'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
          disabled={isProcessing || !isPhoneValid}
      >
        {isProcessing ? 'Sending...' : 'Send Verification Code'}
      </button>
      {showOtpInput && (
        <>
          <input
            type="text"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            placeholder="Enter OTP"
              className="border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2 w-64 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            disabled={isProcessing}
          />
          {errors.otp && <div className="text-red-600 text-sm">{errors.otp}</div>}
          <button
            onClick={onVerifyOtp}
            className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 hover:scale-105 shadow-lg"
            disabled={isProcessing}
          >
            {isProcessing ? 'Verifying...' : 'Verify OTP'}
          </button>
        </>
      )}
    </div>
  </div>
);
};

export default PhoneStep; 