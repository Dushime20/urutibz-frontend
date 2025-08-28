import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Bot, Sparkles, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Toast({ message, onClose, type = 'error' }: { message: string; onClose: () => void; type?: 'error' | 'success' }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const icon = type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />;

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-4 py-3 rounded-lg shadow-xl flex items-center space-x-3 transition-all duration-300 transform ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    } max-w-sm`}>
      {icon}
      <span className="text-sm font-medium">{message}</span>
      <button 
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }} 
        className="ml-2 text-white/80 hover:text-white transition-colors"
      >
        ×
      </button>
    </div>
  );
}

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
            className={`h-1 flex-1 rounded ${
              level <= strength ? colors[strength - 1] : 'bg-gray-200'
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

  const { register,error } = useAuth();
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
    navigate('/dashboard');
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
        else if (value.length < 8) error = 'Password must be at least 8 characters';
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
      const name = `${firstName} ${lastName}`;
      await register(name, email, password);
      setToast('Account created successfully! Welcome to UrutiBz!');
      setToastType('success');

      setTimeout(() => {
        navigate('/dashboard');
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

    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      setToast(errorMessage);
      setToastType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {toast && <Toast message={toast} onClose={() => setToast(null)} type={toastType} />}
      
      <div className="w-full max-w-4xl mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-6">
          {/* Logo Section - Smaller and clickable */}
          <div className="flex justify-center mb-4">
            <button
              onClick={handleLogoClick}
              className="transition-all duration-300 hover:scale-105 hover:drop-shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-lg p-1"
              aria-label="Go to Dashboard"
            >
              <img 
                src="/assets/img/yacht/urutilogo2.png" 
                alt="UrutiBz" 
                className="h-16 w-40 sm:h-20 sm:w-48 object-contain cursor-pointer" 
              />
            </button>
          </div>

          {/* Compact AI Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200/60 shadow-md mb-4 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
              <Bot className="w-3 h-3 text-blue-600" />
            </div>
           <span className="text-sm font-semibold text-active font-outfit">AI-Powered Platform</span>
            <div className="flex items-center justify-center w-6 h-6 bg-yellow-100 rounded-full">
              <Sparkles className="w-3 h-3 text-yellow-600" />
            </div>
          </div>

          {/* Compact Main Heading */}
          <div className="space-y-2">
          <h1 className="text-3xl font-bold text-platform-dark-grey font-outfit">
              Create Your Account
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto leading-relaxed">
              Join UrutiBz to start renting and listing items with ease
            </p>
          </div>
        </div>

        {/* Compact Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      onBlur={() => handleBlur('firstName')}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                        errors.firstName && touched.firstName
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                      }`}
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
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={() => handleBlur('lastName')}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                      errors.lastName && touched.lastName
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    placeholder="Last name"
                  />
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
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur('email')}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                      errors.email && touched.email
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    }`}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={() => handleBlur('password')}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                        errors.password && touched.password
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="Create password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={() => handleBlur('confirmPassword')}
                      className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                        errors.confirmPassword && touched.confirmPassword
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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

              {/* Compact Terms Agreement */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start space-x-3">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    onBlur={() => handleBlur('agreeToTerms')}
                    className={`w-4 h-4 mt-0.5 rounded focus:ring-2 transition-colors ${
                      errors.agreeToTerms && touched.agreeToTerms
                        ? 'border-red-300 text-red-600 focus:ring-red-500'
                        : 'border-gray-300 text-blue-600 focus:ring-blue-500'
                    }`}
                  />
                  <div className="text-xs leading-relaxed">
                    <label htmlFor="agreeToTerms" className="text-gray-700 cursor-pointer">
                      I agree to the{' '}
                      <button type="button" className="text-blue-600 hover:text-blue-800 font-medium underline">
                        Terms of Service
                      </button>
                      {' '}and{' '}
                      <button type="button" className="text-blue-600 hover:text-blue-800 font-medium underline">
                        Privacy Policy
                      </button>
                    </label>
                    {errors.agreeToTerms && touched.agreeToTerms && (
                      <p className="mt-1 text-red-600 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {errors.agreeToTerms}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-4 px-6 text-base font-outfit shadow-lg hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
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
        {/* login link */}
                  <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-platform-grey font-inter">
                Already have an account?{' '}
                  <Link 
                    to={`/login${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`} 
                    className="text-active hover:text-active-dark font-semibold transition-colors duration-200"
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