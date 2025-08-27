import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Bot, Sparkles, ArrowLeft, Shield, Zap, Globe } from 'lucide-react';
// Logo reference updated to use urutbz.png
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
  // Add custom styles for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      .animate-fadeIn {
        animation: fadeIn 0.6s ease-out;
      }
      .animate-shake {
        animation: shake 0.5s ease-in-out;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
        if (data.user.role === "admin") {
          navigate("/admin");
        } else if (data.user.role === "inspector") {
          navigate("/inspector");
        } else {
          navigate("/dashboard");
        }
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Light Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        {/* Subtle Pattern Background */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20px 20px, rgba(59, 130, 246, 0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
        
        {/* Subtle Floating Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-active/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-active/3 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-active/3 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} type={toastType} />}
      
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-20 opacity-0'}`}>
            {/* Back Button */}
            <div className="absolute top-8 left-8">
              <Link 
                to="/"
                className="inline-flex items-center space-x-2 text-platform-dark-grey hover:text-active transition-all duration-300 group"
              >
                <div className="p-2 rounded-platform bg-white/70 backdrop-blur-sm group-hover:bg-active/10 transition-all duration-300 shadow-sm">
                  <ArrowLeft className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium font-inter">Back to Home</span>
              </Link>
            </div>

            <div className="max-w-md">
              {/* Logo */}
              <div className="flex items-center mb-8">
                <img src="/assets/img/yacht/urutilogo2.png" alt="UrutiBz" className="h-24 w-56" />
              </div>

              {/* Main Message */}
              <div className="space-y-6">
                <h2 className="text-4xl lg:text-5xl font-bold text-platform-dark-grey leading-tight font-outfit">
                  Welcome to the
                  <span className="bg-gradient-to-r from-active to-active-dark bg-clip-text text-transparent block">
                    Future of Rentals
                  </span>
                </h2>
                
                <p className="text-xl text-platform-dark-grey/80 leading-relaxed font-inter">
                  Experience seamless, AI-powered rental management with enterprise-grade security and global reach.
                </p>

                {/* Features */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-active/20 rounded-platform">
                      <Shield className="w-5 h-5 text-active" />
                    </div>
                    <span className="text-platform-dark-grey/80 font-inter">Enterprise Security</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-active/20 rounded-platform">
                      <Zap className="w-5 h-5 text-active" />
                    </div>
                    <span className="text-platform-dark-grey/80 font-inter">AI-Powered Insights</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-active/20 rounded-platform">
                      <Globe className="w-5 h-5 text-active" />
                    </div>
                    <span className="text-platform-dark-grey/80 font-inter">Global Platform</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <div className={`w-full max-w-md transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
            
            {/* Mobile Back Button */}
            <div className="lg:hidden mb-6">
              <Link 
                to="/"
                className="inline-flex items-center space-x-2 text-platform-dark-grey hover:text-active transition-all duration-300 group"
              >
                <div className="p-2 rounded-platform bg-white/70 backdrop-blur-sm group-hover:bg-active/10 transition-all duration-300 shadow-sm">
                  <ArrowLeft className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium font-inter">Back to Home</span>
              </Link>
            </div>

            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center">
                <img src="/assets/img/yacht/urutilogo2.png" alt="UrutiBz" className="h-20 w-48" />
              </div>
            </div>

            {/* Login Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8">
              {/* Header */}
              <div className="text-center space-y-4">
                <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-active/30">
                  <Bot className="w-4 h-4 text-active" />
                  <span className="text-sm font-semibold text-active font-outfit">AI-Powered Platform</span>
                  <Sparkles className="w-4 h-4 text-active" />
                </div>

                <h2 className="text-3xl font-bold text-platform-dark-grey font-outfit">
                  Welcome Back
                </h2>
                <p className="text-platform-grey font-inter">
                  Sign in to access your professional dashboard
                </p>
              </div>

              {/* Form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-platform text-sm animate-shake">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-platform-dark-grey font-inter">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-platform-grey group-focus-within:text-active transition-colors duration-200" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-platform-grey rounded-platform focus:outline-none focus:ring-2 focus:ring-active/20 focus:border-active transition-all duration-300 text-platform-dark-grey placeholder-platform-grey font-inter"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-platform-dark-grey font-inter">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-platform-grey group-focus-within:text-active transition-colors duration-200" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-platform-grey rounded-platform focus:outline-none focus:ring-2 focus:ring-active/20 focus:border-active transition-all duration-300 text-platform-dark-grey placeholder-platform-grey font-inter"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-platform-grey hover:text-platform-dark-grey transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-active border-platform-grey rounded focus:ring-active focus:ring-2"
                    />
                    <span className="text-sm text-platform-grey font-medium font-inter">Remember me</span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-active hover:text-active-dark font-semibold transition-colors duration-200 font-inter"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-4 px-6 text-base font-outfit shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Register Link */}
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-platform-grey font-inter">
                  Don't have an account?{' '}
                  <Link 
                    to={`/register${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`} 
                    className="text-active hover:text-active-dark font-semibold transition-colors duration-200"
                  >
                    Sign up now
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
