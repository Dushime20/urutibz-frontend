import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowLeft, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { loginUser, fetchUserProfile } from './service/api';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminSettingsContext } from '../../contexts/AdminSettingsContext';
import { useToast } from '../../contexts/ToastContext';


const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthenticatedUser } = useAuth();
  const { settings } = useAdminSettingsContext();
  const { showToast } = useToast();
  const [attempts, setAttempts] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // If registration is required to be verified before login (example gate)
    if (settings?.platform?.requireEmailVerification && !formData.email) {
      setIsLoading(false);
      setError('Please verify your email before logging in.');
      return;
    }
    // Enforce max login attempts (frontend guard)
    const storedMax = Number(localStorage.getItem('security.maxLoginAttempts') || '0');
    const maxAttempts = (settings?.security?.maxLoginAttempts || settings?.system?.maxLoginAttempts || storedMax || 3);
    const key = 'loginAttempts';
    const map = JSON.parse(localStorage.getItem(key) || '{}');
    const current = Number(map[formData.email] || 0);
    if (maxAttempts > 0 && current >= maxAttempts) {
      setIsLoading(false);
      const message = 'Too many failed attempts. Please try again later.';
      setError(message);
      return;
    }

    try {
      const data = await loginUser(formData.email, formData.password);
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        if (data.user) {
          setAuthenticatedUser(data.user);
        } else {
          // Fetch user profile using the token if not returned by login
          const userProfile = await fetchUserProfile(data.token);
          setAuthenticatedUser(userProfile);
        }
        // reset attempts on success
        const key = 'loginAttempts';
        const map = JSON.parse(localStorage.getItem(key) || '{}');
        map[formData.email] = 0;
        localStorage.setItem(key, JSON.stringify(map));
        setSuccessMsg('User logged in successfully!');
      }
      setTimeout(() => {
        if (data.user.role === "admin") {
          navigate("/admin");
        } else if (data.user.role === "inspector") {
          navigate("/inspector");
        } else {
          navigate("/dashboard");
        }
      }, 1500);
    } catch (err: any) {
      const message = err?.message || 'Invalid email or password. Please try again.';
      // track attempt
      map[formData.email] = current + 1;
      localStorage.setItem(key, JSON.stringify(map));
      setAttempts(current + 1);
      // If threshold reached, show lockout message
      if (maxAttempts > 0 && map[formData.email] >= maxAttempts) {
        const lockMsg = 'Too many failed attempts. Please try again later.';
        setError(lockMsg);
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4 overflow-hidden">
      
      <div className="w-full max-w-md mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          {/* Logo and AI Badge in One Row */}
          <div className="flex justify-center items-center space-x-4 mb-2 mt-12">
            <div className="bg-white dark:bg-slate-800 px-6 py-3 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
              <span className="text-2xl font-bold text-gray-800 dark:text-white">UrutiBiz</span>
            </div>

            {/* AI Platform Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Platform</span>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 mt-[-10px]">
          <div className="px-8 py-4">
            {/* Form Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600 dark:text-slate-400 text-sm">
                Sign in to access your professional dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {successMsg && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/40 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>{successMsg}</span>
                </div>
              )}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-sm placeholder-gray-400 dark:placeholder-slate-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-sm placeholder-gray-400 dark:placeholder-slate-500"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-slate-300 font-medium">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 font-semibold transition-colors duration-200"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center mt-6">
          <p className="text-gray-600 dark:text-slate-400 text-sm">
            Don't have an account?{' '}
            <Link 
              to={`/register${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`} 
              className="text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 font-medium underline transition-colors duration-200"
            >
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
