import React from 'react';

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
}

const PhoneStep: React.FC<PhoneStepProps> = ({
  verificationData,
  setVerificationData,
  otp,
  setOtp,
  onRequestOtp,
  onVerifyOtp,
  showOtpInput,
  isProcessing,
  errors
}) => (
  <div className="space-y-6">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Phone Verification</h2>
      <p className="text-gray-600">Enter your phone number to receive a verification code</p>
    </div>
    <div className="flex flex-col items-center space-y-4">
      <input
        type="tel"
        value={verificationData.phoneNumber}
        onChange={e => setVerificationData((prev: any) => ({ ...prev, phoneNumber: e.target.value }))}
        placeholder="Phone Number"
        className="border border-gray-300 rounded-lg px-4 py-2 w-64 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isProcessing}
      />
      {errors.phone && <div className="text-red-600 text-sm">{errors.phone}</div>}
      <button
        onClick={onRequestOtp}
        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg"
        disabled={isProcessing}
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
            className="border border-gray-300 rounded-lg px-4 py-2 w-64 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

export default PhoneStep; 