import React, { useState } from 'react';
import { Star, Heart, MapPin, User, CheckCircle, AlertCircle, LogIn, UserPlus, Play, Pause } from 'lucide-react';
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

const InteractiveBookingDemo: React.FC = () => {
  const [currentScenario, setCurrentScenario] = useState<string>('1');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Sample item for demonstration
  const sampleItem = {
    id: '1',
    title: 'Canon EOS R5 Camera',
    category: 'Electronics',
    price: 45,
    location: 'Downtown Seattle',
    rating: 4.8,
    reviews: 42,
    image: '/api/placeholder/400/300',
    owner: {
      name: 'Sarah Photography',
      avatar: '/api/placeholder/40/40',
      rating: 4.9
    }
  };

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
    },      {
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

  const getStepsForScenario = (scenario: Scenario) => {
    if (!scenario.isAuthenticated) {
      // Scenario 1: User without account
      return [
        'User sees item details',
        'User clicks "Book Now"',
        'Authentication modal appears',
        'User chooses login/register',
        'After auth, returns to item'
      ];
    } else if (scenario.id === '2') {
      // Scenario 2: Unverified user (no steps completed)
      return [
        'User sees item details',
        'User clicks "Book Now"',
        'Verification modal appears',
        'User begins verification process',
        'Proceeds to booking after completion'
      ];
    } else if (scenario.id === '3') {
      // Scenario 3: Partially verified user
      return [
        'User sees item details',
        'User clicks "Book Now"',
        'Verification modal shows progress',
        'User completes remaining steps',
        'Proceeds to booking'
      ];
    } else {
      // Scenario 4: Fully verified user
      return [
        'User sees item details',
        'User clicks "Book Now"',
        'Direct to booking page'
      ];
    }
  };

  const handleBookNow = () => {
    if (!currentScenarioData.isAuthenticated) {
      // Scenario 1: User without account
      setShowAuthModal(true);
    } else if (!currentScenarioData.user?.verification.isFullyVerified) {
      // Scenario 2 & 3: Unverified or partially verified users
      setShowVerificationModal(true);
    } else {
      // Scenario 4: Fully verified user
      alert('✅ Success! Proceeding to booking page...');
    }
  };

  const getVerificationSteps = (verification: any) => {
    return [
      { name: 'Profile Complete', completed: verification.isProfileComplete },
      { name: 'Email Verified', completed: verification.isEmailVerified },
      { name: 'Phone Verified', completed: verification.isPhoneVerified },
      { name: 'ID Verified', completed: verification.isIdVerified },
      { name: 'Address Verified', completed: verification.isAddressVerified }
    ];
  };

  const steps = getStepsForScenario(currentScenarioData);

  const playDemo = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    
    const playSteps = () => {
      let step = 0;
      const interval = setInterval(() => {
        step++;
        setCurrentStep(step);
        
        if (step === 2 && !currentScenarioData.isAuthenticated) {
          setTimeout(() => setShowAuthModal(true), 500);
        } else if (step === 2 && !currentScenarioData.user?.verification.isFullyVerified) {
          setTimeout(() => setShowVerificationModal(true), 500);
        }
        
        if (step >= steps.length - 1) {
          clearInterval(interval);
          setIsPlaying(false);
        }
      }, 2000);
    };
    
    playSteps();
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setShowAuthModal(false);
    setShowVerificationModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Interactive Booking Flow Demo
        </h1>
        <p className="text-lg text-gray-600">
          Experience how our platform handles different user scenarios during booking
        </p>
      </div>

      {/* Scenario Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => {
              setCurrentScenario(scenario.id);
              resetDemo();
            }}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
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
            <p className="text-sm text-gray-600">{scenario.description}</p>
            
            {scenario.user && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{scenario.user.name}</p>
                    <p className="text-xs text-gray-600">{scenario.user.email}</p>
                  </div>
                </div>
                
                <div className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-600">Verification</span>
                    <span className={`font-medium ${
                      scenario.user.verification.isFullyVerified ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {scenario.user.verification.isFullyVerified ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Item Card Demo */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="relative">
              <img 
                src={sampleItem.image} 
                alt={sampleItem.title}
                className="w-full h-48 object-cover"
              />
              <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{sampleItem.title}</h3>
                  <p className="text-gray-600 text-sm">{sampleItem.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">${sampleItem.price}</p>
                  <p className="text-sm text-gray-600">per day</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{sampleItem.rating}</span>
                  <span className="text-sm text-gray-600">({sampleItem.reviews} reviews)</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{sampleItem.location}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 mb-6">
                <img 
                  src={sampleItem.owner.avatar} 
                  alt={sampleItem.owner.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">{sampleItem.owner.name}</p>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-600">{sampleItem.owner.rating}</span>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleBookNow}
                className={`w-full py-3 font-semibold rounded-xl ${
                  currentStep >= 1 ? 'animate-pulse bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                Book Now
              </Button>
            </div>
          </div>
        </div>

        {/* Flow Demonstration */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Demo Flow</h3>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={playDemo}
                  disabled={isPlaying}
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Play className="w-4 h-4" />
                  <span>Play Demo</span>
                </Button>
                <Button
                  onClick={resetDemo}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Pause className="w-4 h-4" />
                  <span>Reset</span>
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className={`flex items-start space-x-3 transition-all duration-500 ${
                    index <= currentStep ? 'opacity-100' : 'opacity-30'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    index < currentStep 
                      ? 'bg-green-100 border-2 border-green-500' 
                      : index === currentStep
                      ? 'bg-blue-100 border-2 border-blue-500 animate-pulse'
                      : 'bg-gray-100 border-2 border-gray-300'
                  }`}>
                    {index < currentStep ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <span className={`text-sm font-medium ${
                        index === currentStep ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${
                      index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step}
                    </p>
                    {index === currentStep && isPlaying && (
                      <p className="text-sm text-blue-600 mt-1">In progress...</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Current Status */}
          <div className={`bg-${currentScenarioData.color}-50 rounded-xl p-4 border border-${currentScenarioData.color}-200`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg bg-${currentScenarioData.color}-100 text-${currentScenarioData.color}-600`}>
                {currentScenarioData.icon}
              </div>
              <div>
                <h4 className={`font-semibold text-${currentScenarioData.color}-900`}>
                  {currentScenarioData.title}
                </h4>
                <p className={`text-sm text-${currentScenarioData.color}-700`}>
                  {currentScenarioData.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="text-center">
              <User className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Required</h3>
              <p className="text-gray-600 mb-6">
                Please log in or create an account to book items on our platform.
              </p>
              
              <div className="space-y-3 mb-6">
                <Button 
                  onClick={() => {
                    setShowAuthModal(false);
                    alert('Redirecting to login page...');
                  }}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Log In
                </Button>
                <Button 
                  onClick={() => {
                    setShowAuthModal(false);
                    alert('Redirecting to registration page...');
                  }}
                  variant="outline"
                  className="w-full py-3 border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </Button>
                <Button 
                  onClick={() => setShowAuthModal(false)}
                  variant="outline"
                  className="w-full py-3"
                >
                  Cancel
                </Button>
              </div>
              
              <p className="text-xs text-gray-500">
                Join thousands of users renting safely on our platform.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      {showVerificationModal && currentScenarioData.user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fadeIn">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Verification Required</h3>
              <p className="text-gray-600 mb-6">
                To book items on our platform, please complete your account verification process.
              </p>
              
              <div className="mb-6">
                <h5 className="font-medium text-gray-900 mb-3">Verification Status:</h5>
                <div className="space-y-2">
                  {getVerificationSteps(currentScenarioData.user.verification).map((step, index) => (
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
              
              <div className="space-y-3">
                <Button 
                  onClick={() => {
                    setShowVerificationModal(false);
                    alert('Redirecting to verification page...');
                  }}
                  className="w-full py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700"
                >
                  Continue Verification
                </Button>
                <Button 
                  onClick={() => setShowVerificationModal(false)}
                  variant="outline"
                  className="w-full py-3"
                >
                  Cancel
                </Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                You can continue verification in your account dashboard at any time.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveBookingDemo;
