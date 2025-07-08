import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card, Input } from '../../components/ui/DesignSystem';
import VerificationLayout from '../../components/verification/VerificationLayout';
import { Navigate, useNavigate } from 'react-router-dom';
import { Phone, MessageSquare } from 'lucide-react';

const PhoneVerificationPage: React.FC = () => {
  const { user, updateVerificationStatus } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');

  // Redirect if email not verified
  if (!user?.verification.isEmailVerified) {
    return <Navigate to="/verify/email" replace />;
  }

  // Redirect if already verified
  if (user?.verification.isPhoneVerified) {
    return <Navigate to="/verify/id" replace />;
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!phoneNumber.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call to send SMS
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStep('code');
    } catch (error) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (verificationCode.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call to verify code
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, accept any 6-digit code
      updateVerificationStatus({
        isPhoneVerified: true
      });

      // Navigate to next step
      navigate('/verify/id');
    } catch (error) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Code resent
    } catch (error) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VerificationLayout
      currentStep="phone"
      title="Verify Your Phone Number"
      description="We'll send you a verification code to confirm your phone number."
    >
      <Card className="p-8">
        {step === 'phone' ? (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Enter Your Phone Number
              </h3>
              <p className="text-slate-600">
                We'll send a 6-digit verification code to this number
              </p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
                error={error}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              className="w-full"
            >
              {isLoading ? 'Sending Code...' : 'Send Verification Code'}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-sm text-slate-600 hover:text-slate-800 underline"
              >
                Skip for now
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Enter Verification Code
              </h3>
              <p className="text-slate-600">
                We sent a 6-digit code to <span className="font-medium">{phoneNumber}</span>
              </p>
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-2">
                Verification Code
              </label>
              <Input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                error={error}
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                className="w-full"
              >
                {isLoading ? 'Verifying...' : 'Verify Phone Number'}
              </Button>

              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-slate-600 hover:text-slate-800 underline"
                >
                  Change number
                </button>
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  Resend code
                </button>
              </div>
            </div>
          </form>
        )}
      </Card>
    </VerificationLayout>
  );
};

export default PhoneVerificationPage;
