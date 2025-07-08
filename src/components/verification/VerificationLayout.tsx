import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle, Circle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface VerificationLayoutProps {
  children: React.ReactNode;
  currentStep: 'profile' | 'email' | 'phone' | 'id' | 'address';
  title: string;
  description: string;
  showBackButton?: boolean;
  backTo?: string;
}

const VerificationLayout: React.FC<VerificationLayoutProps> = ({
  children,
  currentStep,
  title,
  description,
  showBackButton = true,
  backTo = '/dashboard'
}) => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const steps = [
    { 
      key: 'profile' as const, 
      label: 'Profile', 
      completed: user.verification.isProfileComplete 
    },
    { 
      key: 'email' as const, 
      label: 'Email', 
      completed: user.verification.isEmailVerified 
    },
    { 
      key: 'phone' as const, 
      label: 'Phone', 
      completed: user.verification.isPhoneVerified 
    },
    { 
      key: 'id' as const, 
      label: 'ID', 
      completed: user.verification.isIdVerified 
    },
    { 
      key: 'address' as const, 
      label: 'Address', 
      completed: user.verification.isAddressVerified 
    },
  ];

  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
      <div className="content-grid py-8 sm:py-12">
        <div className="content">
          {/* Header */}
          <div className="mb-8">
            {showBackButton && (
              <Link to={backTo} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            )}
            
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{title}</h1>
              <p className="text-slate-600 max-w-2xl mx-auto">{description}</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center max-w-4xl mx-auto">
              {steps.map((step, index) => (
                <React.Fragment key={step.key}>
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200
                      ${step.completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : step.key === currentStep
                          ? 'bg-primary-500 border-primary-500 text-white'
                          : 'bg-white border-slate-300 text-slate-400'
                      }
                    `}>
                      {step.completed ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`
                      mt-2 text-sm font-medium
                      ${step.completed 
                        ? 'text-green-600' 
                        : step.key === currentStep
                          ? 'text-primary-600'
                          : 'text-slate-400'
                      }
                    `}>
                      {step.label}
                    </span>
                  </div>
                  
                  {index < steps.length - 1 && (
                    <div className={`
                      h-0.5 w-12 mx-4 transition-all duration-200
                      ${steps[index + 1].completed || (currentStepIndex > index)
                        ? 'bg-green-500' 
                        : 'bg-slate-300'
                      }
                    `} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="max-w-2xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationLayout;
