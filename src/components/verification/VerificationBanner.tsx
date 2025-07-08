import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Card } from '../ui/DesignSystem';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  CheckCircle, 
  Mail, 
  Phone, 
  IdCard, 
  MapPin, 
  User, 
  Clock,
  ArrowRight
} from 'lucide-react';

const VerificationBanner: React.FC = () => {
  const { user, canListItems, canRentItems } = useAuth();

  if (!user) return null;

  const { verification } = user;

  // If fully verified, show success banner
  if (verification.isFullyVerified) {
    return (
      <Card className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-green-800">
              Verification Complete! 🎉
            </h3>
            <p className="text-green-700">
              Your account is fully verified. You can now list items and rent from others.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Get verification requirements
  const requirements = [
    {
      key: 'profile',
      label: 'Complete Profile',
      icon: User,
      completed: verification.isProfileComplete,
      link: '/verify/profile',
      description: 'Add your personal information'
    },
    {
      key: 'email',
      label: 'Verify Email',
      icon: Mail,
      completed: verification.isEmailVerified,
      link: '/verify/email',
      description: 'Confirm your email address'
    },
    {
      key: 'phone',
      label: 'Verify Phone',
      icon: Phone,
      completed: verification.isPhoneVerified,
      link: '/verify/phone',
      description: 'Add your phone number'
    },
    {
      key: 'id',
      label: 'Upload ID',
      icon: IdCard,
      completed: verification.isIdVerified,
      link: '/verify/id',
      description: 'Government-issued ID'
    },
    {
      key: 'address',
      label: 'Verify Address',
      icon: MapPin,
      completed: verification.isAddressVerified,
      link: '/verify/address',
      description: 'Confirm your location'
    }
  ];

  const completedCount = requirements.filter(req => req.completed).length;
  const nextStep = requirements.find(req => !req.completed);
  const canRent = canRentItems();
  const canList = canListItems();

  return (
    <Card className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
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
              <h3 className="text-lg font-semibold text-amber-800">
                Account Verification in Progress
              </h3>
              <p className="text-amber-700">
                Complete verification to unlock all features ({completedCount}/{requirements.length} steps complete)
              </p>
            </div>
            
            {nextStep && (
              <Link to={nextStep.link}>
                <Button variant="primary" className="bg-amber-600 hover:bg-amber-700">
                  Continue Setup
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-amber-700 mb-2">
              <span>Progress</span>
              <span>{Math.round((completedCount / requirements.length) * 100)}%</span>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-2">
              <div 
                className="bg-amber-600 h-2 rounded-full transition-all duration-300"
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
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-amber-200'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    req.completed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-amber-100 text-amber-600'
                  }`}>
                    {req.completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${
                      req.completed ? 'text-green-800' : 'text-slate-800'
                    }`}>
                      {req.label}
                    </p>
                    <p className={`text-xs ${
                      req.completed ? 'text-green-600' : 'text-slate-600'
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
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${canRent ? 'bg-green-500' : 'bg-gray-400'}`} />
              Renting: {canRent ? 'Enabled' : 'Requires profile + email verification'}
            </div>
            
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              canList 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              <div className={`w-2 h-2 rounded-full ${canList ? 'bg-green-500' : 'bg-gray-400'}`} />
              Listing: {canList ? 'Enabled' : 'Requires full verification'}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VerificationBanner;
