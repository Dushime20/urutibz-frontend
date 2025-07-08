import React, { useState } from 'react';
import { 
  Search, Bot, HandHeart, CheckCircle, Camera, Shield, 
  Sparkles, Star, ArrowRight, Users, Globe
} from 'lucide-react';

const HowItWorksSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'renting' | 'listing'>('renting');

  const rentingSteps = [
    {
      icon: Search,
      title: 'Describe What You Need',
      description: 'Tell our AI what you need, when, and where. Get intelligent suggestions and see perfect matches in your area with real-time availability.',
      step: '01',
      details: ['AI analyzes 50+ factors', 'Instant matches nearby', 'Smart price comparison']
    },
    {
      icon: Bot,
      title: 'AI Finds Perfect Matches',
      description: 'Our AI considers location, reviews, availability, and your preferences to suggest the best options with 96.8% accuracy.',
      step: '02',
      details: ['Verified owners only', 'Quality predictions', 'Compatibility scoring']
    },
    {
      icon: HandHeart,
      title: 'Connect & Book Securely',
      description: 'Chat with owners, ask questions, and book instantly. Payments are secure and held until successful rental completion.',
      step: '03',
      details: ['Instant messaging', 'Secure escrow payments', 'Insurance included']
    },
    {
      icon: CheckCircle,
      title: 'Enjoy & Return',
      description: 'Pick up your item, use it with confidence, and return it. Rate your experience to help the community grow stronger.',
      step: '04',
      details: ['24/7 support', 'Damage protection', 'Community feedback']
    }
  ];

  const listingSteps = [
    {
      icon: Camera,
      title: 'List Your Items',
      description: 'Take photos, add descriptions, and set availability. Our AI suggests optimal pricing and helps you reach the right renters.',
      step: '01',
      details: ['AI pricing optimization', 'Photo quality tips', 'Category suggestions']
    },
    {
      icon: Shield,
      title: 'Get AI Verification',
      description: 'Our AI verifies your identity and items for trust. Get verified badges that increase booking rates by 340%.',
      step: '02',
      details: ['Identity verification', 'Item authentication', 'Trust badges earned']
    },
    {
      icon: Users,
      title: 'Connect with Renters',
      description: 'Receive booking requests, chat with potential renters, and approve rentals. Build lasting community relationships.',
      step: '03',
      details: ['Smart notifications', 'Renter screening', 'Flexible scheduling']
    },
    {
      icon: Star,
      title: 'Earn & Build Reputation',
      description: 'Get paid automatically, receive reviews, and watch your reputation grow. Top hosts earn $450+ monthly.',
      step: '04',
      details: ['Automatic payments', 'Performance insights', 'Growth opportunities']
    }
  ];

  const currentSteps = activeTab === 'renting' ? rentingSteps : listingSteps;

  return (
    <section className="py-12 sm:py-16 lg:py-20 xl:py-24" style={{ backgroundColor: 'var(--background-color)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-teal-200 shadow-sm mb-6">
            <Bot className="w-4 h-4 text-active" />
            <span className="text-sm font-medium text-active font-outfit">AI-Simplified Process</span>
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold font-outfit mb-4" style={{ color: 'var(--foreground-color)' }}>
            How Our <span className="text-active">AI-Powered Platform</span> Works
          </h2>
          <p className="text-platform-grey max-w-2xl mx-auto text-lg leading-relaxed font-inter">
            Whether you're renting items or sharing your unused belongings, our AI makes the entire process seamless, secure, and rewarding for everyone.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2 border border-white/50 shadow-lg">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('renting')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === 'renting'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>For Renters</span>
              </button>
              <button
                onClick={() => setActiveTab('listing')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  activeTab === 'listing'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>For Item Owners</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {currentSteps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="text-center relative group">
                <div className="relative">
                  {/* Main Icon Circle */}
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  
                  {/* Step Number */}
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-sm font-bold text-slate-800 shadow-lg">
                    {step.step}
                  </div>
                  
                  {/* Connection Line */}
                  {index < currentSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-blue-300 to-transparent transform -translate-x-1/2 z-0">
                      <ArrowRight className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-4 h-4 text-blue-400" />
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-4 text-sm">{step.description}</p>
                  
                  {/* Details */}
                  <div className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center text-xs text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3 mr-2" />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Key Features Section */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 border border-white/50 shadow-lg">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-3">
              Why Choose Our AI-Powered Platform?
            </h3>
            <p className="text-slate-600">
              Advanced technology meets human community to create the safest, smartest rental experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* AI-Powered */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto">
                <Bot className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-2">AI-Powered Matching</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  96.8% accuracy in finding perfect matches. Our AI learns from millions of successful rentals.
                </p>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Match accuracy</span>
                    <span className="font-semibold text-green-600">96.8%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Response time</span>
                    <span className="font-semibold text-green-600">&lt; 2 seconds</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Global Community */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-2">Global Community</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Connect with trusted community members across 40+ countries with automatic translation.
                </p>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Active countries</span>
                    <span className="font-semibold text-green-600">40+</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Languages supported</span>
                    <span className="font-semibold text-green-600">40+</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust & Safety */}
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-slate-800 mb-2">Trust & Safety</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  AI-powered verification, secure payments, and comprehensive insurance on every rental.
                </p>
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Verified users</span>
                    <span className="font-semibold text-green-600">100%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Successful transactions</span>
                    <span className="font-semibold text-green-600">99.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Start Renting Now</span>
              </button>
              <button className="border-2 border-slate-300 bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white hover:border-slate-400 font-semibold py-4 px-8 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2">
                <Camera className="w-5 h-5" />
                <span>List Your Items</span>
              </button>
            </div>
            
            <p className="text-slate-500 text-sm mt-4">
              Join 12,000+ community members • No setup fees • Start earning today
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;