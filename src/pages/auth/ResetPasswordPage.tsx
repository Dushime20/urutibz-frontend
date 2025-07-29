import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, Shield, AlertTriangle, Check, X } from 'lucide-react';
import { resetPassword } from './service/api';
import { useToast } from '../../contexts/ToastContext';

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
  const { showToast } = useToast();
  
  // Password strength validation
  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    
    return {
      checks,
      score,
      strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong'
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  
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
    
    if (passwordStrength.score < 3) {
      setError('Please choose a stronger password with a mix of letters, numbers, and symbols.');
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
      await resetPassword(token, formData.password);
      setIsSuccess(true);
      showToast('Password reset successfully!', 'success');
      
      // Redirect to login after success
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Password reset successfully. Please sign in with your new password.' }
        });
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please try again.');
      showToast(err.message || 'Failed to reset password', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Show error if no token
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 text-red-600 rounded-full mb-6 shadow-lg">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-3">
              Invalid Reset Link
            </h1>
            <p className="text-slate-600 mb-6 leading-relaxed">
              This password reset link is invalid, expired, or has already been used.
            </p>
            <Link 
              to="/forgot-password"
              className="inline-block bg-gradient-to-r from-active to-active-dark hover:from-active-dark hover:to-active text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 transform transition-all duration-300 hover:shadow-3xl">
          {!isSuccess ? (
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
                  Reset Your Password
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  {email ? (
                    <>
                      Create a new secure password for{' '}
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">{email}</span>
                    </>
                  ) : (
                    'Enter your new password below to secure your account'
                  )}
                </p>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-sm flex items-start space-x-3 animate-in slide-in-from-top-2">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                    <AlertTriangle className="w-3 h-3 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Error</p>
                    <p className="text-red-600">{error}</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                    New Password
                  </label>
                                     <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                       <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-active transition-colors" />
                     </div>
                     <input
                       id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                                             className="w-full pl-12 pr-12 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-active focus:border-transparent transition-all duration-200 text-slate-800 placeholder-slate-400"
                      placeholder="Enter your new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Password Strength</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          passwordStrength.strength === 'weak' ? 'bg-red-100 text-red-700' :
                          passwordStrength.strength === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {passwordStrength.strength.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className={`flex items-center space-x-2 ${passwordStrength.checks.length ? 'text-green-600' : 'text-slate-400'}`}>
                          {passwordStrength.checks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>8+ characters</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${passwordStrength.checks.uppercase ? 'text-green-600' : 'text-slate-400'}`}>
                          {passwordStrength.checks.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>Uppercase</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${passwordStrength.checks.lowercase ? 'text-green-600' : 'text-slate-400'}`}>
                          {passwordStrength.checks.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>Lowercase</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${passwordStrength.checks.numbers ? 'text-green-600' : 'text-slate-400'}`}>
                          {passwordStrength.checks.numbers ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>Numbers</span>
                        </div>
                        <div className={`flex items-center space-x-2 col-span-2 ${passwordStrength.checks.special ? 'text-green-600' : 'text-slate-400'}`}>
                          {passwordStrength.checks.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          <span>Special characters (!@#$%^&*)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
                    Confirm New Password
                  </label>
                                     <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                       <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-active transition-colors" />
                     </div>
                     <input
                       id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className={`w-full pl-12 pr-12 py-4 bg-slate-50/50 border rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 text-slate-800 placeholder-slate-400 ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? 'border-red-300 focus:ring-red-500'
                          : formData.confirmPassword && formData.password === formData.confirmPassword
                          ? 'border-green-300 focus:ring-green-500'
                          : 'border-slate-200 focus:ring-active'
                      }`}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <div className={`flex items-center space-x-2 text-sm ${
                      formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formData.password === formData.confirmPassword ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      <span>
                        {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading || passwordStrength.score < 3 || formData.password !== formData.confirmPassword}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-slate-300 disabled:to-slate-400 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:-translate-y-0.5 disabled:transform-none disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Resetting Password...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      <span>Reset Password</span>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-6 animate-in fade-in-0 duration-500">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 text-green-600 rounded-full mb-6 shadow-lg">
                <CheckCircle className="w-10 h-10" />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-3">
                Password Reset Successfully
              </h2>
              
              <p className="text-slate-600 mb-6 leading-relaxed">
                Your password has been updated successfully. You'll be redirected to the login page in a few seconds.
              </p>
              
              <div className="bg-green-50 rounded-2xl p-4 mb-6 border border-green-200">
                <p className="text-sm text-green-700 font-medium">
                  🎉 Your account is now secure with your new password!
                </p>
              </div>
              
              <Link 
                to="/login"
                className="inline-block bg-gradient-to-r from-active to-active-dark hover:from-active-dark hover:to-active text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Continue to Login
              </Link>
            </div>
          )}
        </div>
        
        {/* Back to Login */}
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

export default ResetPasswordPage;
