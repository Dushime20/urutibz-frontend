import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Bot, Sparkles, ArrowLeft } from 'lucide-react';
import logo from '.././../../public/assets/img/logo-2.svg';
import { loginUser, fetchUserProfile } from './service/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

// Simple custom toast component
function Toast({ message, onClose, type = 'error' }: { message: string; onClose: () => void; type?: 'error' | 'success' }) {
  const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
  return (
    <div className={`fixed top-6 right-6 z-50 ${bgColor} text-white px-6 py-3 rounded shadow-lg flex items-center space-x-4 animate-fadeIn`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white font-bold">&times;</button>
    </div>
  );
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';
  const { setAuthenticatedUser } = useAuth();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'error' | 'success'>('error');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setToast(null);

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
        showToast('Login successful!', 'success');
      }
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
      // setToast(err.message || 'Invalid email or password. Please try again.');
      // setToastType('error');
      showToast('Login failed. Please check your credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {toast && <Toast message={toast} onClose={() => setToast(null)} type={toastType} />}
      <div className="max-w-md w-full space-y-8">
        {/* Back Button */}
        <div className="flex items-center">
          <Link 
            to="/"
            className="flex items-center space-x-2 text-platform-grey hover:text-platform-dark-grey transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-6">
            <img 
              src={logo} 
              alt="UrutiBz" 
              className="h-8 w-8" 
            />
            <span className="text-2xl font-bold text-platform-dark-grey font-outfit">
              UrutiBz
            </span>
          </div>
          
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 shadow-sm mb-6">
            <Bot className="w-4 h-4 text-active" />
            <span className="text-sm font-medium text-active font-outfit">AI-Powered Platform</span>
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </div>

          <h2 className="text-3xl font-bold text-platform-dark-grey font-outfit">
            Welcome Back
          </h2>
          <p className="mt-2 text-platform-grey font-inter">
            Sign in to your account to continue renting and listing
          </p>
        </div>

        {/* Login Form */}
        <div className="card">
          <div className="p-6 sm:p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-platform text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-platform-dark-grey font-inter mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-platform-grey" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-platform-grey rounded-platform focus:outline-none focus:ring-2 focus:ring-active focus:border-active font-inter"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-platform-dark-grey font-inter mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-platform-grey" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-platform-grey rounded-platform focus:outline-none focus:ring-2 focus:ring-active focus:border-active font-inter"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-platform-grey hover:text-platform-dark-grey"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-platform-grey text-active focus:ring-active"
                  />
                  <span className="ml-2 text-sm text-platform-grey font-inter">Remember me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-active hover:text-active-dark font-inter"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 text-base font-outfit disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center">
          <p className="text-platform-grey font-inter">
            Don't have an account?{' '}
            <Link 
              to={`/register${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`} 
              className="text-active hover:text-active-dark font-medium"
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
