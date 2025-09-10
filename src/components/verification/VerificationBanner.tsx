import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card } from '../ui/DesignSystem';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle, 
  Phone, 
  IdCard, 
  Clock,
  ArrowRight,
  Camera
} from 'lucide-react';

// Helper function to fetch real user profile for verification status
const fetchUserProfile = async (token: string) => {
  try {
    // Extract user ID from JWT token
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const userId = tokenPayload.sub || tokenPayload.userId || tokenPayload.id;
    
    if (!userId) return null;

    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api/v1';
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.data || data;
  } catch (error) {
    console.error('Failed to fetch user profile for verification:', error);
    return null;
  }
};

const VerificationBanner: React.FC = () => {
  const { user, canListItems, canRentItems } = useAuth();
  const [realUserData, setRealUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real user data for verification status
  useEffect(() => {
    const loadRealUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const userData = await fetchUserProfile(token);
        if (userData) {
          console.log('Real user data for verification:', userData);
          console.log('KYC Status:', userData.kyc_status);
          console.log('Email verified:', userData.email_verified_at);
          console.log('Phone verified:', userData.phone_verified_at);
        }
        setRealUserData(userData);
      } catch (error) {
        console.error('Error loading user data for verification:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRealUserData();
  }, []);

  if (!user) return null;

  // Create verification object from real user data if available, otherwise use auth context
  const verification = realUserData ? {
    isProfileComplete: !!(realUserData.first_name && realUserData.last_name),
    isEmailVerified: !!realUserData.email_verified_at,
    isPhoneVerified: !!realUserData.phone_verified_at,
    isIdVerified: realUserData.kyc_status === 'verified' || realUserData.kyc_status === 'approved',
    isAddressVerified: !!(realUserData.address || realUserData.city || realUserData.country),
    isFullyVerified: realUserData.kyc_status === 'verified' || realUserData.kyc_status === 'approved',
    verificationStep: (realUserData.kyc_status === 'verified' || realUserData.kyc_status === 'approved') ? 'complete' : 
                     (!realUserData.first_name || !realUserData.last_name) ? 'profile' :
                     (!realUserData.email_verified_at) ? 'email' :
                     (!realUserData.phone_verified_at) ? 'phone' :
                     (!realUserData.kyc_status || realUserData.kyc_status === 'pending') ? 'id' : 'address'
  } : user.verification;

  if (!verification) return null;

  // Show loading state while fetching real data
  if (isLoading) {
    return (
      <Card className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 dark:from-slate-900 dark:to-slate-900 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center animate-pulse dark:bg-slate-700">
            <Clock className="w-6 h-6 text-gray-500 dark:text-slate-300" />
          </div>
          <div className="flex-1">
            <div className="h-5 bg-gray-300 rounded mb-2 w-48 animate-pulse dark:bg-slate-700"></div>
            <div className="h-4 bg-gray-200 rounded w-64 animate-pulse dark:bg-slate-600"></div>
          </div>
        </div>
      </Card>
    );
  }

  // If fully verified, show success banner
  if (verification.isFullyVerified) {
    const userName = realUserData ? 
      `${realUserData.first_name || ''} ${realUserData.last_name || ''}`.trim() || realUserData.email :
      user.name;
      
    return (
      <Card className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 dark:from-slate-900 dark:to-slate-900 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
              Verification Complete! 🎉
            </h3>
            <p className="text-green-700 dark:text-slate-300">
              Welcome {userName}! Your account is fully verified. You can now list items and rent from others.
            </p>
            {realUserData && (
              <div className="mt-2 text-sm text-green-600 dark:text-slate-400">
                ✓ KYC Status: {realUserData.kyc_status} | Email: {realUserData.email}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Get verification requirements with real user data context
  const requirements = [
    {
      key: 'phone',
      label: 'Verify Phone',
      icon: Phone,
      completed: verification.isPhoneVerified,
      link: '/verify/phone',
      description: realUserData ? 
        `${realUserData.phone || 'No phone'} ${realUserData.phone_verified_at ? '(Verified)' : '(Unverified)'}` :
        'Add your phone number'
    },
    {
      key: 'id',
      label: 'Upload ID',
      icon: IdCard,
      completed: verification.isIdVerified,
      link: '/verify/id',
      description: realUserData ? 
        `KYC Status: ${realUserData.kyc_status || 'pending'}` :
        'Government-issued ID'
    },
    {
      key: 'selfie',
      label: 'Selfie Verification',
      icon: Camera,
      completed: verification.isFullyVerified,
      link: '/verify/id',
      description: 'Take a selfie to match your ID'
    }
  ];

  const completedCount = requirements.filter(req => req.completed).length;
  const nextStep = requirements.find(req => !req.completed);
  
  // Use real verification data for capabilities
  const canRent = realUserData ? 
    (verification.isProfileComplete && verification.isEmailVerified) : 
    canRentItems();
  const canList = realUserData ? 
    verification.isFullyVerified : 
    canListItems();

  return (
    <Card className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 dark:from-slate-900 dark:to-slate-900 dark:border-slate-700">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
          {nextStep ? (
            <Clock className="w-6 h-6 text-white" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-white" />
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300">
                Account Verification in Progress
              </h3>
              <p className="text-amber-700 dark:text-slate-300">
                Complete verification to unlock all features ({completedCount}/{requirements.length} steps complete)
                {realUserData && (
                  <span className="block mt-1 text-sm text-amber-700 dark:text-slate-400">
                    Current KYC Status: {realUserData.kyc_status || 'pending'}
                  </span>
                )}
              </p>
            </div>
            
            {nextStep && (
              <Link to="/verify/id">
                <Button variant="primary" className="bg-amber-600 hover:bg-amber-700 px-1 py-1 dark:bg-amber-500 dark:hover:bg-amber-600">
                  Continue Setup
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-amber-700 mb-2 dark:text-slate-300">
              <span>Progress</span>
              <span>{Math.round((completedCount / requirements.length) * 100)}%</span>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-2 dark:bg-slate-700">
              <div 
                className="bg-amber-600 h-2 rounded-full transition-all duration-300 dark:bg-amber-500"
                style={{ width: `${(completedCount / requirements.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Requirements checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {requirements.map((req) => {
              const Icon = req.icon;
              return (
                <div 
                  key={req.key}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    req.completed 
                      ? 'bg-green-50 border-green-200 dark:bg-slate-800 dark:border-slate-700' 
                      : 'bg-white border-amber-200 dark:bg-slate-900 dark:border-slate-700'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    req.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300'
                  }`}>
                    {req.completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${
                      req.completed ? 'text-green-800 dark:text-green-300' : 'text-slate-800 dark:text-slate-200'
                    }`}>
                      {req.label}
                    </p>
                    <p className={`text-xs ${
                      req.completed ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {req.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current capabilities */}
          <div className="flex gap-4 text-sm">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              canRent 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300'
            }`}>
              <div className={`w-2 h-2 rounded-full ${canRent ? 'bg-green-500' : 'bg-gray-400 dark:bg-slate-500'}`} />
              Renting: {canRent ? 'Enabled' : 'Requires profile + email verification'}
            </div>
            
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              canList 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300'
            }`}>
              <div className={`w-2 h-2 rounded-full ${canList ? 'bg-green-500' : 'bg-gray-400 dark:bg-slate-500'}`} />
              Listing: {canList ? 'Enabled' : 'Requires full verification'}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VerificationBanner;
