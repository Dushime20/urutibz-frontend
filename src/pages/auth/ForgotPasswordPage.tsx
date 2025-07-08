import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call with delay
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Back to Login Link */}
        <div className="flex items-center">
          <Link 
            to="/login" 
            className="flex items-center space-x-2 text-platform-grey hover:text-platform-dark-grey transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Login</span>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex justify-center items-center space-x-2 mb-6">
                  <img 
                    src="/assets/img/urutibz-logo.svg" 
                    alt="UrutiBz" 
                    className="h-8 w-8" 
                  />
                  <span className="text-2xl font-bold bg-gradient-to-r from-platform-primary to-platform-accent bg-clip-text text-transparent">
                    UrutiBz
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3">
                  Forgot Your Password?
                </h1>
                <p className="text-text-secondary">
                  Enter your email address and we'll send you a link to reset your password
                </p>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-status-error/10 border border-status-error/20 text-status-error p-4 rounded-xl text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-text-tertiary" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="input-primary pl-10"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full"
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current mr-2"></span>
                      Processing...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-status-success/10 text-status-success rounded-full mb-6">
                <CheckCircle className="w-8 h-8" />
              </div>
              
              <h2 className="text-2xl font-bold text-text-primary mb-3">
                Check Your Email
              </h2>
              
              <p className="text-text-secondary mb-6">
                We've sent a password reset link to{' '}
                <span className="font-medium text-text-primary">{email}</span>
              </p>
              
              <div className="bg-surface-secondary rounded-xl p-4 text-sm text-text-secondary">
                <p className="mb-2">Didn't receive an email?</p>
                <ul className="space-y-1 text-left">
                  <li>• Check your spam or junk folder</li>
                  <li>• Make sure the email address is correct</li>
                  <li>
                    • Or{' '}
                    <button 
                      onClick={() => setIsSubmitted(false)} 
                      className="text-primary-600 hover:text-primary-700 font-medium underline"
                    >
                      try again
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
        
        {/* Additional Help */}
        <div className="text-center">
          <p className="text-sm text-text-secondary">
            Remember your password?{' '}
            <Link 
              to="/login" 
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
