import React, { useState } from 'react';
import { User, Shield, CheckCircle, AlertCircle, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import Button from '../ui/Button';

interface DemoUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  verification: {
    isProfileComplete: boolean;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    isIdVerified: boolean;
    isAddressVerified: boolean;
    isFullyVerified: boolean;
  };
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  user: DemoUser | null;
  isAuthenticated: boolean;
  color: string;
  icon: React.ReactNode;
}

const BookingFlowDemo: React.FC = () => {
  const [currentScenario, setCurrentScenario] = useState<string>('1');
  const [showModals, setShowModals] = useState(false);

  const scenarios: Scenario[] = [
    {
      id: '1',
      title: 'User Without Account',
      description: 'A visitor who hasn\'t created an account yet',
      user: null,
      isAuthenticated: false,
      color: 'red',
      icon: <User className="w-5 h-5" />
    },
    {
      id: '2',
      title: 'Unverified User',
      description: 'A user with an account but no verification steps completed',
      user: {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatar: '/api/placeholder/32/32',
        verification: {
          isProfileComplete: false,
          isEmailVerified: false,
          isPhoneVerified: false,
          isIdVerified: false,
          isAddressVerified: false,
          isFullyVerified: false
        }
      },
      isAuthenticated: true,
      color: 'orange',
      icon: <AlertCircle className="w-5 h-5" />
    },
    {
      id: '3',
      title: 'Partially Verified User',
      description: 'A user with some verification steps completed',
      user: {
        id: '3',
        name: 'Robert Chen',
        email: 'robert@example.com',
        avatar: '/api/placeholder/32/32',
        verification: {
          isProfileComplete: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          isIdVerified: false,
          isAddressVerified: false,
          isFullyVerified: false
        }
      },
      isAuthenticated: true,
      color: 'yellow',
      icon: <AlertCircle className="w-5 h-5" />
    },
    {
      id: '4',
      title: 'Fully Verified User',
      description: 'A user with complete account verification',
      user: {
        id: '4',
        name: 'John Doe',
        email: 'john@example.com',
        avatar: '/api/placeholder/32/32',
        verification: {
          isProfileComplete: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          isIdVerified: true,
          isAddressVerified: true,
          isFullyVerified: true
        }
      },
      isAuthenticated: true,
      color: 'green',
      icon: <CheckCircle className="w-5 h-5" />
    }
  ];

  const currentScenarioData = scenarios.find(s => s.id === currentScenario)!;

  const getVerificationSteps = (verification: any) => {
    return [
      { name: 'Profile Complete', completed: verification.isProfileComplete },
      { name: 'Email Verified', completed: verification.isEmailVerified },
      { name: 'Phone Verified', completed: verification.isPhoneVerified },
      { name: 'ID Verified', completed: verification.isIdVerified },
      { name: 'Address Verified', completed: verification.isAddressVerified }
    ];
  };

  const renderBookingFlow = () => {
    const scenario = currentScenarioData;

    if (!scenario.isAuthenticated) {
      // Scenario 1: Not authenticated
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Flow: User Without Account</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">User clicks "Book Now"</p>
                  <p className="text-sm text-gray-600">On any item details page</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Authentication Modal Appears</p>
                  <p className="text-sm text-gray-600">User sees login/register options</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">User chooses Login or Register</p>
                  <p className="text-sm text-gray-600">Redirect preserves booking intent</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Return to Item & Continue</p>
                  <p className="text-sm text-gray-600">After auth, user returns to original item</p>
                </div>
              </div>
            </div>

            {showModals && (
              <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center space-x-3">
                  <User className="w-8 h-8 text-red-500" />
                  <div>
                    <h4 className="font-semibold text-red-900">Account Required</h4>
                    <p className="text-sm text-red-700">Please log in or create an account to book items.</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button className="w-full bg-blue-600 text-white">
                    <LogIn className="w-4 h-4 mr-2" />
                    Log In
                  </Button>
                  <Button variant="outline" className="w-full border-blue-600 text-blue-600">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } else if (scenario.id === '2') {
      // Scenario 2: Authenticated but not verified at all
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Flow: Completely Unverified User</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">User clicks "Book Now"</p>
                  <p className="text-sm text-gray-600">User is authenticated but not verified</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Verification Modal Appears</p>
                  <p className="text-sm text-gray-600">Shows current verification status</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Continue Verification Process</p>
                  <p className="text-sm text-gray-600">User completes missing verification steps</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Access Booking Page</p>
                  <p className="text-sm text-gray-600">After verification, proceed to booking</p>
                </div>
              </div>
            </div>

            {showModals && (
              <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                  <div>
                    <h4 className="font-semibold text-orange-900">Account Verification Required</h4>
                    <p className="text-sm text-orange-700">Complete verification to book items safely.</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h5 className="font-medium text-orange-900 mb-2">Verification Status:</h5>
                  <div className="space-y-1">
                    {getVerificationSteps(scenario.user!.verification).map((step, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {step.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                        )}
                        <span className={`text-sm ${step.completed ? 'text-green-700' : 'text-gray-600'}`}>
                          {step.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full mt-4 bg-orange-600 text-white">
                  Continue Verification
                </Button>
              </div>
            )}
          </div>
        </div>
      );
    } else if (scenario.id === '3') {
      // Scenario 3: Partially verified user
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Flow: Partially Verified User</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">User clicks "Book Now"</p>
                  <p className="text-sm text-gray-600">User is authenticated with partial verification</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Verification Modal Appears</p>
                  <p className="text-sm text-gray-600">Shows current verification progress (60%)</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Continue Remaining Verification Steps</p>
                  <p className="text-sm text-gray-600">User completes ID and address verification</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Access Booking Page</p>
                  <p className="text-sm text-gray-600">After full verification, proceed to booking</p>
                </div>
              </div>
            </div>

            {showModals && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="w-8 h-8 text-yellow-500" />
                  <div>
                    <h4 className="font-semibold text-yellow-900">Verification In Progress</h4>
                    <p className="text-sm text-yellow-700">Almost there! Complete the remaining steps.</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h5 className="font-medium text-yellow-900 mb-2">Verification Status (60%):</h5>
                  <div className="space-y-1">
                    {getVerificationSteps(scenario.user!.verification).map((step, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        {step.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                        )}
                        <span className={`text-sm ${step.completed ? 'text-green-700' : 'text-gray-600'}`}>
                          {step.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full mt-4 bg-yellow-600 text-white">
                  Complete Remaining Steps
                </Button>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      // Scenario 4: Fully verified
      return (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Flow: Fully Verified User</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-medium text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">User clicks "Book Now"</p>
                  <p className="text-sm text-gray-600">User is authenticated and verified</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Direct to Booking Page</p>
                  <p className="text-sm text-gray-600">No interruptions - seamless experience</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <h4 className="font-semibold text-green-900">Ready to Book!</h4>
                  <p className="text-sm text-green-700">Account fully verified - proceed directly to booking.</p>
                </div>
              </div>
              
              <div className="mt-4">
                <h5 className="font-medium text-green-900 mb-2">Verification Complete:</h5>
                <div className="grid grid-cols-2 gap-2">
                  {getVerificationSteps(scenario.user!.verification).map((step, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-700">{step.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button className="w-full mt-4 bg-green-600 text-white">
                Continue to Booking
              </Button>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Booking Flow Demo
        </h1>
        <p className="text-lg text-gray-600">
          Explore how our platform handles different user scenarios during the booking process
        </p>
      </div>

      {/* Scenario Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => setCurrentScenario(scenario.id)}
            className={`p-4 rounded-xl border-2 transition-all ${
              currentScenario === scenario.id
                ? `border-${scenario.color}-500 bg-${scenario.color}-50`
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className={`p-2 rounded-lg bg-${scenario.color}-100 text-${scenario.color}-600`}>
                {scenario.icon}
              </div>
              <h3 className="font-semibold text-gray-900">{scenario.title}</h3>
            </div>
            <p className="text-sm text-gray-600 text-left">{scenario.description}</p>
            
            {scenario.user && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">{scenario.user.name}</p>
                    <p className="text-xs text-gray-600">{scenario.user.email}</p>
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Verification</span>
                    <span className={`font-medium ${
                      scenario.user.verification.isFullyVerified ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {scenario.user.verification.isFullyVerified ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      className={`h-1.5 rounded-full ${
                        scenario.user.verification.isFullyVerified ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                      style={{
                        width: `${(Object.values(scenario.user.verification).filter(v => v === true).length - 1) / 5 * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Current User Status */}
      <div className="bg-white rounded-xl p-6 border shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Scenario</h2>
        
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-lg bg-${currentScenarioData.color}-100 text-${currentScenarioData.color}-600`}>
            {currentScenarioData.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{currentScenarioData.title}</h3>
            <p className="text-gray-600 mb-3">{currentScenarioData.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Authentication:</span>
                <span className={`ml-2 ${currentScenarioData.isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                  {currentScenarioData.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                </span>
              </div>
              {currentScenarioData.user && (
                <div>
                  <span className="font-medium text-gray-700">Verification:</span>
                  <span className={`ml-2 ${currentScenarioData.user.verification.isFullyVerified ? 'text-green-600' : 'text-orange-600'}`}>
                    {currentScenarioData.user.verification.isFullyVerified ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Demo Controls */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Interactive Demo</h2>
        <Button
          onClick={() => setShowModals(!showModals)}
          variant="outline"
          className="flex items-center space-x-2"
        >
          {showModals ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{showModals ? 'Hide' : 'Show'} Modals</span>
        </Button>
      </div>

      {/* Booking Flow Demonstration */}
      {renderBookingFlow()}

      {/* Key Features */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Key Features of Our Booking Flow</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Security First</h4>
              <p className="text-sm text-blue-700">Multi-step verification ensures safe transactions</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Seamless Experience</h4>
              <p className="text-sm text-blue-700">Verified users get direct access to booking</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <User className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Intent Preservation</h4>
              <p className="text-sm text-blue-700">Redirects maintain user's booking intentions</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Clear Communication</h4>
              <p className="text-sm text-blue-700">Users always know what's required next</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFlowDemo;
