import React, { useState } from 'react';
import { Check, Bot, Crown, Shield, Globe, Heart, Star, Users, TrendingUp } from 'lucide-react';
import Button from '../ui/Button';

const PricingSection: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Community',
      description: 'Perfect for occasional renters and first-time listers',
      price: { monthly: 0, yearly: 0 },
      commission: '15%',
      icon: Heart,
      features: [
        'List up to 5 items',
        'Basic AI matching',
        'Standard verification',
        'Community support',
        'Basic insurance coverage',
        'Mobile app access',
        'Payment protection'
      ],
      limitations: [
        'Limited AI insights',
        'Standard response priority'
      ],
      popular: false,
      color: 'from-blue-100 to-blue-200',
      buttonStyle: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    {
      name: 'Creator',
      description: 'Ideal for active community members and small businesses',
      price: { monthly: 19, yearly: 180 },
      commission: '12%',
      icon: Star,
      features: [
        'Unlimited item listings',
        'Advanced AI matching',
        'Priority verification',
        'Enhanced insurance',
        'AI pricing optimization',
        'Performance analytics',
        'Multi-language support',
        'International rentals',
        'Priority customer support',
        'Featured listing spots'
      ],
      limitations: [],
      popular: true,
      color: 'from-purple-100 to-purple-200',
      buttonStyle: 'bg-purple-600 hover:bg-purple-700 text-white'
    },
    {
      name: 'Business',
      description: 'For rental businesses and power users maximizing earnings',
      price: { monthly: 49, yearly: 480 },
      commission: '8%',
      icon: Crown,
      features: [
        'Everything in Creator',
        'Lowest platform fees',
        'Dedicated account manager',
        'Advanced AI insights',
        'Bulk listing tools',
        'API access',
        'Custom branding',
        'Revenue optimization',
        'Priority dispute resolution',
        'White-glove onboarding',
        'Advanced analytics dashboard',
        'Inventory management tools'
      ],
      limitations: [],
      popular: false,
      color: 'from-amber-100 to-amber-200',
      buttonStyle: 'bg-amber-600 hover:bg-amber-700 text-white'
    }
  ];

  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Everything',
      description: 'Smart matching, pricing optimization, and predictive insights'
    },
    {
      icon: Shield,
      title: 'Complete Protection',
      description: 'Comprehensive insurance, secure payments, and fraud prevention'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Rent and list across 40+ countries with automatic translation'
    },
    {
      icon: Users,
      title: 'Thriving Community',
      description: 'Connect with 12,000+ verified members worldwide'
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200 shadow-sm mb-6">
            <Crown className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Membership Plans</span>
            <Bot className="w-4 h-4 text-yellow-500" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            Simple, <span className="text-blue-600">Transparent</span> Membership
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Join our AI-powered community with plans designed for every type of user. Start free, upgrade as you grow, and maximize your earning potential.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-2 border border-white/50 shadow-lg">
            <div className="flex space-x-2">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  billingCycle === 'monthly'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 relative ${
                  billingCycle === 'yearly'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                Yearly
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  20% off
                </span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            const currentPrice = plan.price[billingCycle];
            
            return (
              <div
                key={index}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 relative ${
                  plan.popular ? 'ring-2 ring-blue-500 transform scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}
                
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="w-8 h-8 text-slate-700" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">{plan.name}</h3>
                  <p className="text-slate-600 text-sm mb-4">{plan.description}</p>
                  
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-4xl font-bold text-slate-800">
                      ${currentPrice}
                    </span>
                    {currentPrice > 0 && (
                      <span className="ml-1 text-slate-600">
                        /{billingCycle === 'yearly' ? 'year' : 'month'}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-center">
                    <span className="text-sm text-slate-600">Platform fee: </span>
                    <span className="font-semibold text-blue-600">{plan.commission}</span>
                    <span className="text-sm text-slate-600"> per transaction</span>
                  </div>
                  
                  {billingCycle === 'yearly' && currentPrice > 0 && (
                    <div className="text-xs text-green-600 mt-1">
                      Save ${(plan.price.monthly * 12) - plan.price.yearly} annually
                    </div>
                  )}
                </div>
                
                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 mr-3 text-green-600 flex-shrink-0" />
                      <span className="text-slate-700 text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations.map((limitation, limitIndex) => (
                    <div key={limitIndex} className="flex items-center">
                      <div className="w-5 h-5 mr-3 flex-shrink-0">
                        <div className="w-3 h-3 bg-slate-300 rounded-full mx-auto"></div>
                      </div>
                      <span className="text-slate-500 text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>
                
                {/* CTA Button */}
                <Button className={`w-full py-4 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 ${plan.buttonStyle}`}>
                  {currentPrice === 0 ? 'Start Free' : 'Upgrade Now'}
                </Button>
                
                {currentPrice === 0 && (
                  <p className="text-center text-xs text-slate-500 mt-3">
                    No credit card required
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Platform Features */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-8 border border-white/50 shadow-lg mb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-3">
              All Plans Include Core Platform Features
            </h3>
            <p className="text-slate-600">
              Every membership level gets access to our essential tools and community features.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-2 text-sm">{feature.title}</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick FAQ */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg">
            <h4 className="text-lg font-bold text-slate-800 mb-4">Frequently Asked</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-slate-800">Can I change plans anytime?</p>
                <p className="text-xs text-slate-600">Yes, upgrade or downgrade instantly. No contracts.</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">What's included in insurance?</p>
                <p className="text-xs text-slate-600">Full damage protection, theft coverage, and liability insurance.</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">How do international rentals work?</p>
                <p className="text-xs text-slate-600">Automatic currency conversion and translation in 40+ languages.</p>
              </div>
            </div>
          </div>

          {/* Success Stats */}
          <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/50 shadow-lg">
            <h4 className="text-lg font-bold text-slate-800 mb-4">Platform Success</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">$450+</div>
                <div className="text-xs text-slate-600">Avg monthly earnings</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">96.8%</div>
                <div className="text-xs text-slate-600">Successful rentals</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">40+</div>
                <div className="text-xs text-slate-600">Countries active</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">4.8/5</div>
                <div className="text-xs text-slate-600">User satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;