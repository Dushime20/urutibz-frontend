import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button, Card } from '../ui/DesignSystem';
import { Link } from 'react-router-dom';

interface VerificationGuardProps {
  children: React.ReactNode;
  action: 'rent' | 'list';
  fallback?: React.ReactNode;
}

const VerificationGuard: React.FC<VerificationGuardProps> = ({ 
  children, 
  action, 
  fallback 
}) => {
  const { user, canListItems, canRentItems } = useAuth();

  if (!user) {
    return (
      <Card className="p-8 text-center">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          Authentication Required
        </h3>
        <p className="text-slate-600 mb-6">
          You must be logged in to {action} items.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/login">
            <Button variant="primary">
              Log In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="outline">
              Sign Up
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  const canProceed = action === 'rent' ? canRentItems() : canListItems();

  if (canProceed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default verification prompt
  const getVerificationPrompt = () => {
    const { verification } = user;

    if (action === 'rent') {
      return {
        title: 'Complete Your Profile to Start Renting',
        description: 'To rent items, you need to complete your profile and verify your email address.',
        requirements: [
          { 
            text: 'Complete profile information', 
            completed: verification.isProfileComplete,
            action: '/verify/profile'
          },
          { 
            text: 'Verify email address', 
            completed: verification.isEmailVerified,
            action: '/verify/email'
          }
        ]
      };
    }

    return {
      title: 'Complete Verification to Start Listing',
      description: 'To list items for rent, you must complete our full verification process for safety and trust.',
      requirements: [
        { 
          text: 'Complete profile information', 
          completed: verification.isProfileComplete,
          action: '/verify/profile'
        },
        { 
          text: 'Verify email address', 
          completed: verification.isEmailVerified,
          action: '/verify/email'
        },
        { 
          text: 'Verify phone number', 
          completed: verification.isPhoneVerified,
          action: '/verify/phone'
        },
        { 
          text: 'Upload government ID', 
          completed: verification.isIdVerified,
          action: '/verify/id'
        },
        { 
          text: 'Verify address', 
          completed: verification.isAddressVerified,
          action: '/verify/address'
        }
      ]
    };
  };

  const prompt = getVerificationPrompt();
  const nextIncompleteStep = prompt.requirements.find(req => !req.completed);

  return (
    <Card className="p-8">
      <div className="text-center mb-8">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          {prompt.title}
        </h3>
        <p className="text-slate-600">
          {prompt.description}
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {prompt.requirements.map((requirement, index) => (
          <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
            {requirement.completed ? (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0" />
            )}
            <span className={`flex-1 ${
              requirement.completed ? 'text-green-700' : 'text-slate-700'
            }`}>
              {requirement.text}
            </span>
            {requirement.completed && (
              <span className="text-sm text-green-600 font-medium">Complete</span>
            )}
          </div>
        ))}
      </div>

      <div className="text-center">
        {nextIncompleteStep ? (
          <Link to={nextIncompleteStep.action}>
            <Button 
              variant="primary"
              className="mb-4"
            >
              Continue Verification
            </Button>
          </Link>
        ) : (
          <Link to="/dashboard">
            <Button 
              variant="primary"
              className="mb-4"
            >
              Go to Dashboard
            </Button>
          </Link>
        )}
        
        <p className="text-sm text-slate-500">
          Need help? <Link to="/support" className="text-primary-600 hover:text-primary-700">Contact Support</Link>
        </p>
      </div>
    </Card>
  );
};

export default VerificationGuard;
