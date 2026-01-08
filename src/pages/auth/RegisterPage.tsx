import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowLeft, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { registerUser } from './service/api';
import { useAdminSettingsContext } from '../../contexts/AdminSettingsContext';

// Compact Password strength indicator
function PasswordStrength({ password }: { password: string }) {
  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;

  return (
    <div className="mt-1.5">
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded ${level <= strength ? colors[strength - 1] : 'bg-gray-200'
              } transition-colors duration-300`}
          />
        ))}
      </div>
      <p className="text-xs mt-1 text-gray-600">
        <span className={`font-medium ${strength > 2 ? 'text-green-600' : 'text-orange-600'}`}>
          {labels[strength - 1] || 'Too short'}
        </span>
      </p>
    </div>
  );
}

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'error' | 'success'>('error');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { settings } = useAdminSettingsContext();

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field as keyof typeof formData]);
  };

  const handleLogoClick = () => {
    navigate('/login');
  };

  const validateField = (field: string, value: any) => {
    let error = '';

    switch (field) {
      case 'firstName':
        if (!value.toString().trim()) error = 'First name is required';
        else if (value.toString().trim().length < 2) error = 'First name must be at least 2 characters';
        break;
      case 'lastName':
        if (!value.toString().trim()) error = 'Last name is required';
        else if (value.toString().trim().length < 2) error = 'Last name must be at least 2 characters';
        break;
      case 'email':
        if (!value.toString().trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email address';
        break;
      case 'password':
        if (!value) error = 'Password is required';
        else {
          const policy = settings?.security?.passwordPolicy;
          const minLen = policy?.minLength ?? 8;
          const requireUpper = policy?.requireUppercase ?? true;
          const requireNumbers = policy?.requireNumbers ?? true;
          const requireSymbols = policy?.requireSymbols ?? true;
          if (value.length < minLen) error = `Password must be at least ${minLen} characters`;
          else if (requireUpper && !/[A-Z]/.test(value)) error = 'Password must include an uppercase letter';
          else if (requireNumbers && !/[0-9]/.test(value)) error = 'Password must include a number';
          else if (requireSymbols && !/[^A-Za-z0-9]/.test(value)) error = 'Password must include a symbol';
        }
        break;
      case 'confirmPassword':
        if (!value) error = 'Please confirm your password';
        else if (value !== formData.password) error = 'Passwords do not match';
        break;
      case 'agreeToTerms':
        if (!value) error = 'You must agree to the terms and conditions';
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return error === '';
  };

  const validateForm = () => {
    const fields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'agreeToTerms'];
    let isValid = true;

    fields.forEach(field => {
      const fieldValid = validateField(field, formData[field as keyof typeof formData]);
      if (!fieldValid) isValid = false;
    });

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Block registration if disabled in platform settings
    // If settings are not available (no token), allow registration by default
    const allow = settings?.platform?.allowUserRegistration !== false; // Default to true if undefined
    const sysAllow = (settings?.system as any)?.registrationEnabled !== false; // Default to true if undefined

    // Only block if explicitly disabled
    if (settings && (!allow || !sysAllow)) {
      const msg = 'User registration is currently disabled by the administrator.';
      setToast(msg);
      setToastType('error');
      return;
    }

    const allFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'agreeToTerms'];
    setTouched(Object.fromEntries(allFields.map(field => [field, true])));

    if (!validateForm()) {
      const firstError = Object.values(errors).find(error => error !== '');
      if (firstError) {
        setToast(firstError);
        setToastType('error');
      }
      return;
    }

    setIsLoading(true);

    try {
      const { firstName, lastName, email, password } = formData;

      // Call the API directly
      console.log('Calling registration API...');
      const response = await registerUser({
        firstName,
        lastName,
        email,
        password
      });

      console.log('Registration API response:', response);

      if (response.success) {
        // Inline success message banner
        setToast('User registered successfully!');
        setToastType('success');
        // Success handled by redirection below

        // Store user data if returned
        if (response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('access_token', response.data.token);
        }

        setTimeout(() => {
          navigate('/login');
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            agreeToTerms: false,
          });
          setTouched({});
          setErrors({});
        }, 2000);
      } else {
        const msg = (response as any)?.message || 'Registration failed. Please try again.';
        setToast(msg);
        setToastType('error');
      }

    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err?.message || 'Registration failed. Please try again.';
      setToast(errorMessage);
      setToastType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-xl md:max-w-xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          {/* Logo and AI Badge in One Row */}
          <div className="flex justify-center items-center space-x-4 mb-2 mt-8">
            <button
              onClick={handleLogoClick}
              className="transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-200 rounded-lg p-1"
              aria-label="Go to Dashboard"
            >
              <div className="bg-white dark:bg-slate-800 px-6 py-3 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
                <span className="text-2xl font-bold text-gray-800 dark:text-white">UrutiBiz</span>
              </div>
            </button>

            {/* AI Platform Badge */}
            <div className="inline-flex items-center space-x-2 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors" style={{ backgroundColor: '#0c9488' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0a7a70'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0c9488'}>
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Platform</span>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 mt-[-10px]">
          <div className="p-12">
            {toast && (
              <div className={`${toastType === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'} px-4 py-3 rounded-lg mb-4 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  {toastType === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span className="text-sm font-medium">{toast}</span>
                </div>
                <button className="text-current/70 hover:text-current" onClick={() => setToast(null)}>×</button>
              </div>
            )}
            {/* Form Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Create Your Account
              </h1>
              <p className="text-gray-600 dark:text-slate-400 text-sm">
                Join UrutiBiz to start renting and listing items with ease
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    First Name
                  </label>
                  <div className={`flex items-center border rounded-lg px-2 py-1 focus-within:ring-2 transition-all duration-200 ${errors.firstName && touched.firstName
                    ? 'border-red-300 dark:border-red-500/50 focus-within:ring-red-500 focus-within:border-red-500'
                    : 'border-gray-300 dark:border-slate-700 dark:bg-slate-800 focus-within:ring-teal-500'
                    }`}>
                    <User className={`w-4 h-4 mr-4 flex-shrink-0 ${errors.firstName && touched.firstName ? 'text-red-400' : 'text-gray-400 dark:text-slate-500'}`} />
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={() => handleBlur('firstName')}
                      className="flex-1 bg-transparent text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none dark:text-slate-100"
                      placeholder="First name"
                    />
                  </div>
                  {errors.firstName && touched.firstName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Last Name
                  </label>
                  <div className={`flex items-center border rounded-lg px-2 py-1 focus-within:ring-2 transition-all duration-200 ${errors.lastName && touched.lastName
                    ? 'border-red-300 dark:border-red-500/50 focus-within:ring-red-500 focus-within:border-red-500'
                    : 'border-gray-300 dark:border-slate-700 dark:bg-slate-800 focus-within:ring-teal-500'
                    }`}>
                    <User className={`w-4 h-4 mr-4 flex-shrink-0 ${errors.lastName && touched.lastName ? 'text-red-400' : 'text-gray-400 dark:text-slate-500'}`} />
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={() => handleBlur('lastName')}
                      className="flex-1 bg-transparent text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none dark:text-slate-100"
                      placeholder="Last name"
                    />
                  </div>
                  {errors.lastName && touched.lastName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <div className={`flex items-center border rounded-lg px-2 py-1 focus-within:ring-2 transition-all duration-200 ${errors.email && touched.email
                  ? 'border-red-300 dark:border-red-500/50 focus-within:ring-red-500 focus-within:border-red-500'
                  : 'border-gray-300 dark:border-slate-700 dark:bg-slate-800 focus-within:ring-teal-500'
                  }`}>
                  <Mail className={`w-4 h-4 mr-4 flex-shrink-0 ${errors.email && touched.email ? 'text-red-400' : 'text-gray-400 dark:text-slate-500'}`} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    className="flex-1 bg-transparent text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none dark:text-slate-100"
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && touched.email && (
                  <p className="mt-1 text-xs text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Password
                  </label>
                  <div className={`relative flex items-center border rounded-lg px-2 py-1 focus-within:ring-2 transition-all duration-200 ${errors.password && touched.password
                    ? 'border-red-300 dark:border-red-500/50 focus-within:ring-red-500 focus-within:border-red-500'
                    : 'border-gray-300 dark:border-slate-700 dark:bg-slate-800 focus-within:ring-teal-500'
                    }`}>
                    <Lock className={`w-4 h-4 mr-4 flex-shrink-0 ${errors.password && touched.password ? 'text-red-400' : 'text-gray-400 dark:text-slate-500'}`} />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={() => handleBlur('password')}
                      placeholder="Create password"
                      className="flex-1 bg-transparent text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none dark:text-slate-100 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-4 transition-colors ${errors.password && touched.password ? 'text-red-400 hover:text-red-600' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'}`}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={formData.password} />
                  {errors.password && touched.password && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Confirm Password
                  </label>
                  <div className={`relative flex items-center border rounded-lg px-2 py-1 focus-within:ring-2 transition-all duration-200 ${errors.confirmPassword && touched.confirmPassword
                    ? 'border-red-300 dark:border-red-500/50 focus-within:ring-red-500 focus-within:border-red-500'
                    : 'border-gray-300 dark:border-slate-700 dark:bg-slate-800 focus-within:ring-teal-500'
                    }`}>
                    <Lock className={`w-4 h-4 mr-4 flex-shrink-0 ${errors.confirmPassword && touched.confirmPassword ? 'text-red-400' : 'text-gray-400 dark:text-slate-500'}`} />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={() => handleBlur('confirmPassword')}
                      className="flex-1 bg-transparent text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none dark:text-slate-100 pr-10"
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute right-4 transition-colors ${errors.confirmPassword && touched.confirmPassword ? 'text-red-400 hover:text-red-600' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'}`}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-3">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  onBlur={() => handleBlur('agreeToTerms')}
                  className={`w-4 h-4 mt-0.5 rounded focus:ring-2 transition-colors ${errors.agreeToTerms && touched.agreeToTerms
                    ? 'border-red-300 text-red-600 focus:ring-red-500'
                    : 'border-gray-300 text-teal-600 focus:ring-teal-500'
                    }`}
                />
                <div className="text-sm leading-relaxed">
                  <label htmlFor="agreeToTerms" className="text-gray-700 dark:text-slate-300 cursor-pointer">
                    I agree to the{' '}
                    <button type="button" className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 font-medium underline">
                      Terms of Service
                    </button>
                    {' '}and{' '}
                    <button type="button" className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 font-medium underline">
                      Privacy Policy
                    </button>
                  </label>
                  {errors.agreeToTerms && touched.agreeToTerms && (
                    <p className="mt-1 text-red-600 flex items-center text-xs">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.agreeToTerms}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                style={{ backgroundColor: '#0c9488' }}
                onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#0a7a70')}
                onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#0c9488')}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Sign In Link */}
        <div className="text-center mt-2">
          <p className="text-gray-600 dark:text-slate-400 text-sm">
            Already have an account?{' '}
            <Link
              to={`/login${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`}
              className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 font-medium underline transition-colors duration-200"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;