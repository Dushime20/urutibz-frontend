import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
      
      // Redirect to login after success
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Password reset successfully. Please sign in with your new password.' }
        });
      }, 2000);
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show error if no token
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-status-error/10 text-status-error rounded-full mb-6">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary mb-3">
              Invalid Reset Link
            </h1>
            <p className="text-text-secondary mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Link 
              to="/forgot-password"
              className="btn-primary inline-block"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {!isSuccess ? (
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
                  Reset Your Password
                </h1>
                <p className="text-text-secondary">
                  {email ? (
                    <>Reset password for <span className="font-medium text-text-primary">{email}</span></>
                  ) : (
                    'Enter your new password below'
                  )}
                </p>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-status-error/10 border border-status-error/20 text-status-error p-4 rounded-xl text-sm">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-text-tertiary" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="input-primary pl-10 pr-10"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 text-text-tertiary" /> : <Eye className="w-5 h-5 text-text-tertiary" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-text-tertiary">
                    Must be at least 8 characters long
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-text-tertiary" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="input-primary pl-10 pr-10"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5 text-text-tertiary" /> : <Eye className="w-5 h-5 text-text-tertiary" />}
                    </button>
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
                      Resetting Password...
                    </>
                  ) : (
                    'Reset Password'
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
                Password Reset Successfully
              </h2>
              
              <p className="text-text-secondary mb-6">
                Your password has been updated. You'll be redirected to the login page in a few seconds.
              </p>
              
              <Link 
                to="/login"
                className="btn-primary inline-block"
              >
                Continue to Login
              </Link>
            </div>
          )}
        </div>
        
        {/* Back to Login */}
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

export default ResetPasswordPage;
