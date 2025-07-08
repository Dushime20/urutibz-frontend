import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card } from '../../components/ui/DesignSystem';
import VerificationLayout from '../../components/verification/VerificationLayout';
import { Navigate, useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, RefreshCw } from 'lucide-react';

const EmailVerificationPage: React.FC = () => {
  const { user, updateVerificationStatus } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Redirect if profile not complete
  if (!user?.verification.isProfileComplete) {
    return <Navigate to="/verify/profile" replace />;
  }

  // Redirect if already verified
  if (user?.verification.isEmailVerified) {
    return <Navigate to="/verify/phone" replace />;
  }

  useEffect(() => {
    // Auto-send verification email on page load
    if (!emailSent) {
      sendVerificationEmail();
    }
  }, []);

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendVerificationEmail = async () => {
    setIsResending(true);
    
    try {
      // Simulate API call to send verification email
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEmailSent(true);
      setCountdown(60); // 60 second cooldown
    } catch (error) {
      console.error('Failed to send verification email:', error);
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyEmail = async () => {
    setIsLoading(true);

    try {
      // Simulate email verification check
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, you would verify with your backend
      // For demo purposes, we'll simulate successful verification
      updateVerificationStatus({
        isEmailVerified: true
      });

      // Navigate to next step
      navigate('/verify/phone');
    } catch (error) {
      console.error('Email verification failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipForNow = () => {
    // For demo purposes, allow skipping but mark as not verified
    navigate('/dashboard');
  };

  return (
    <VerificationLayout
      currentStep="email"
      title="Verify Your Email"
      description="We've sent a verification email to your address. Please check your inbox and click the verification link."
    >
      <Card className="p-8 text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            Check Your Email
          </h3>
          
          <p className="text-slate-600 mb-4">
            We've sent a verification link to:
          </p>
          
          <p className="text-primary-600 font-medium bg-primary-50 px-4 py-2 rounded-lg">
            {user?.email}
          </p>
        </div>

        <div className="space-y-4">
          {emailSent && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Email sent successfully!</span>
              </div>
              <p className="text-green-600 text-sm mt-1">
                Please check your inbox and spam folder
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleVerifyEmail}
              variant="primary"
              loading={isLoading}
              className="w-full"
            >
              {isLoading ? 'Checking Verification...' : 'I\'ve Verified My Email'}
            </Button>

            <Button
              onClick={sendVerificationEmail}
              variant="outline"
              loading={isResending}
              disabled={countdown > 0}
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                'Resend Verification Email'
              )}
            </Button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-500 mb-4">
            Not seeing the email? Check your spam folder or try a different email address.
          </p>
          
          <button
            onClick={handleSkipForNow}
            className="text-sm text-slate-600 hover:text-slate-800 underline"
          >
            Skip for now (you can verify later)
          </button>
        </div>
      </Card>
    </VerificationLayout>
  );
};

export default EmailVerificationPage;
