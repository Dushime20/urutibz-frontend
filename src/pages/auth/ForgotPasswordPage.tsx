import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle, Shield, Clock, HelpCircle } from 'lucide-react';
import { forgotPassword } from './service/api';
import { useToast } from '../../contexts/ToastContext';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await forgotPassword(email);
      setIsSubmitted(true);
      showToast('Password reset email sent successfully!', 'success');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      showToast(err.message || 'Failed to send reset email', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Back to Login Link */}
        <div className="flex items-center">
          <Link 
            to="/login" 
            className="group flex items-center space-x-2 text-slate-600 hover:text-slate-800 transition-all duration-200 hover:transform hover:translate-x-1"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Back to Login</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 transform transition-all duration-300 hover:shadow-3xl">
          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center items-center space-x-3 mb-6">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center shadow-lg">
                      <Shield className="w-6 h-6 text-slate-600" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-active rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      UrutiBz
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">Security Center</p>
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold text-slate-800 mb-3">
                  Forgot Your Password?
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  No worries! Enter your email address and we'll send you a secure link to reset your password.
                </p>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm flex items-start space-x-3 animate-in slide-in-from-top-2">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                    <HelpCircle className="w-3 h-3 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Error</p>
                    <p className="text-red-600">{error}</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-active transition-colors" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-active focus:border-transparent transition-all duration-200 text-slate-800 placeholder-slate-400"
                      placeholder="Enter your email address"
                    />
                  </div>
                  <p className="text-xs text-slate-500 ml-1">
                    We'll send reset instructions to this email
                  </p>
                </div>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-active to-active-dark hover:from-active-dark hover:to-active disabled:from-slate-300 disabled:to-slate-400 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending Reset Link...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>
              </form>

              {/* Security Notice */}
              <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-slate-500 mt-0.5" />
                  <div className="text-sm text-slate-600">
                    <p className="font-medium mb-1">Security Notice</p>
                    <p className="text-xs leading-relaxed">
                      For your security, reset links expire after 1 hour and can only be used once.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-6 animate-in fade-in-0 duration-500">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 text-green-600 rounded-full mb-6 shadow-lg">
                <CheckCircle className="w-10 h-10" />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                Check Your Email
              </h2>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                We've sent a password reset link to{' '}
                <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">{email}</span>
              </p>
              
              <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-4">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">Next steps:</span>
                  </p>
                </div>
                
                <ul className="space-y-3 text-sm text-slate-600 ml-8">
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2"></div>
                    <span>Check your email inbox and spam folder</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2"></div>
                    <span>Click the reset link (expires in 1 hour)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2"></div>
                    <span>Create your new secure password</span>
                  </li>
                </ul>
                
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 mb-3">Didn't receive an email?</p>
                  <button 
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail('');
                    }} 
                    className="w-full bg-white hover:bg-slate-50 text-slate-700 font-medium py-2 px-4 rounded-xl border border-slate-200 transition-colors duration-200 text-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Additional Help */}
        <div className="text-center">
          <p className="text-sm text-slate-600">
            Remember your password?{' '}
            <Link 
              to="/login" 
              className="text-active hover:text-active-dark font-semibold transition-colors duration-200 hover:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
