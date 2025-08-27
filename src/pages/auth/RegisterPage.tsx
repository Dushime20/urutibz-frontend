import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Bot, Sparkles, ArrowLeft, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

// Password strength indicator
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
    <div className="mt-2">
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
        Password strength: <span className={`font-medium ${strength > 2 ? 'text-green-600' : 'text-orange-600'}`}>
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'error' | 'success'>('error');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

    
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field as keyof typeof formData]);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      {toast && <Toast message={toast} onClose={() => setToast(null)} type={toastType} />}
      
      <div className="w-full max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="flex items-center mb-6">
          <button className="group flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all duration-200 text-sm font-medium">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Bot className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          
          <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 shadow-sm mb-6">
            <Bot className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">AI-Powered Platform</span>
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600">
            Join UrutiBz to start renting and listing items with ease
          </p>
        </div>
        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mx-auto">
          <div className="p-8 sm:p-12">
            <div className="max-w-3xl mx-auto">
              <div className="space-y-8">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-3">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        onBlur={() => handleBlur('firstName')}
                        className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-base ${
                          errors.firstName && touched.firstName
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                            : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="Enter first name"
                        aria-describedby={errors.firstName && touched.firstName ? 'firstName-error' : undefined}
                      />
                    </div>
                    {errors.firstName && touched.firstName && (
                      <p id="firstName-error" className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-3">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      onBlur={() => handleBlur('lastName')}
                      className={`w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-base ${
                        errors.lastName && touched.lastName
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="Enter last name"
                      aria-describedby={errors.lastName && touched.lastName ? 'lastName-error' : undefined}
                    />
                    {errors.lastName && touched.lastName && (
                      <p id="lastName-error" className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur('email')}
                      className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-base ${
                        errors.email && touched.email
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                          : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="Enter your email address"
                      aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
                    />
                  </div>
                  {errors.email && touched.email && (
                    <p id="email-error" className="mt-2 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={() => handleBlur('password')}
                        className={`w-full pl-12 pr-14 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-base ${
                          errors.password && touched.password
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                            : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="Create a strong password"
                        aria-describedby={errors.password && touched.password ? 'password-error' : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <PasswordStrength password={formData.password} />
                    {errors.password && touched.password && (
                      <p id="password-error" className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-3">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={() => handleBlur('confirmPassword')}
                        className={`w-full pl-12 pr-14 py-4 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 text-base ${
                          errors.confirmPassword && touched.confirmPassword
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                            : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="Confirm your password"
                        aria-describedby={errors.confirmPassword && touched.confirmPassword ? 'confirmPassword-error' : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <p id="confirmPassword-error" className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center h-6 mt-1">
                      <input
                        id="agreeToTerms"
                        name="agreeToTerms"
                        type="checkbox"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        onBlur={() => handleBlur('agreeToTerms')}
                        className={`w-5 h-5 rounded focus:ring-2 transition-colors ${
                          errors.agreeToTerms && touched.agreeToTerms
                            ? 'border-red-300 text-red-600 focus:ring-red-500'
                            : 'border-gray-300 text-blue-600 focus:ring-blue-500'
                        }`}
                        aria-describedby={errors.agreeToTerms && touched.agreeToTerms ? 'terms-error' : undefined}
                      />
                    </div>
                    <div className="text-sm">
                      <label htmlFor="agreeToTerms" className="text-gray-700 leading-relaxed">
                        I agree to the{' '}
                        <button className="text-blue-600 hover:text-blue-800 font-medium underline">
                          Terms of Service
                        </button>
                        {' '}and{' '}
                        <button className="text-blue-600 hover:text-blue-800 font-medium underline">
                          Privacy Policy
                        </button>
                      </label>
                      {errors.agreeToTerms && touched.agreeToTerms && (
                        <p id="terms-error" className="mt-2 text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.agreeToTerms}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full btn-primary py-4 px-6 text-base font-outfit hover:from-blue-700 hover:to-indigo-700 text-white py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center space-x-3"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowLeft className="w-5 h-5 rotate-180" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-base">
            Already have an account?{' '}
            <button className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;