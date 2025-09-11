import React from 'react';

interface EmailStepProps {
  email: string;
  setEmail: (v: string) => void;
  emailOtp: string;
  setEmailOtp: (v: string) => void;
  onRequestEmailOtp: () => void;
  onVerifyEmailOtp: () => void;
  isProcessing: boolean;
  errors: Record<string, string>;
}

const EmailStep: React.FC<EmailStepProps> = ({
  email,
  setEmail,
  emailOtp,
  setEmailOtp,
  onRequestEmailOtp,
  onVerifyEmailOtp,
  isProcessing,
  errors,
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Email Verification</h2>
        <p className="text-gray-600 dark:text-slate-400">Enter your email to receive a verification code</p>
      </div>
      <div className="flex flex-col items-center space-y-4">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email address"
          className="border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2 w-72 text-lg focus:outline-none focus:ring-2 focus:ring-[#01aaa7] dark:bg-slate-800 dark:text-slate-100"
          disabled={isProcessing}
        />
        {errors.email && <div className="text-red-600 text-sm">{errors.email}</div>}
        <button
          onClick={onRequestEmailOtp}
          className="bg-[#01aaa7] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#019c98] transition-all duration-300 shadow-lg"
          disabled={isProcessing}
        >
          {isProcessing ? 'Sending...' : 'Send Verification Code'}
        </button>
        <input
          type="text"
          value={emailOtp}
          onChange={e => setEmailOtp(e.target.value)}
          placeholder="Enter email OTP"
          className="border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2 w-72 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100"
          disabled={isProcessing}
        />
        {errors.emailOtp && <div className="text-red-600 text-sm">{errors.emailOtp}</div>}
        <button
          onClick={onVerifyEmailOtp}
          className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg"
          disabled={isProcessing}
        >
          {isProcessing ? 'Verifying...' : 'Verify Email OTP'}
        </button>
      </div>
    </div>
  );
};

export default EmailStep;


