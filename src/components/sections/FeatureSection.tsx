import React from 'react';
import { 
  Bot, Globe, Shield, Users, Zap, MessageCircle, 
  TrendingUp, Heart, Sparkles, CheckCircle, Lock, Headphones 
} from 'lucide-react';
import { Button, Badge, Card, AIBadge } from '../ui/DesignSystem';

const FeatureSection: React.FC = () => {
  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Smart Matching',
      description: 'Our advanced AI analyzes 50+ factors to find perfect matches with 96.8% accuracy. Get exactly what you need, when you need it.',
      highlight: '96.8% accuracy',
      gradient: 'from-blue-100 to-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      icon: Globe,
      title: 'Global Community Network',
      description: 'Connect with verified community members across 40+ countries. Real-time translation breaks down language barriers.',
      highlight: '40+ countries',
      gradient: 'from-green-100 to-green-200',
      iconColor: 'text-green-600'
    },
    {
      icon: Shield,
      title: 'AI-Verified Trust & Safety',
      description: 'Multi-layered AI verification, comprehensive insurance, and secure escrow payments protect every transaction.',
      highlight: '99.2% safe transactions',
      gradient: 'from-purple-100 to-purple-200',
      iconColor: 'text-purple-600'
    },
    {
      icon: Users,
      title: 'Thriving Peer-to-Peer Community',
      description: 'Join 12,000+ active members sharing everything from tools to vehicles. Build lasting neighborhood connections.',
      highlight: '12K+ members',
      gradient: 'from-pink-100 to-pink-200',
      iconColor: 'text-pink-600'
    },
    {
      icon: Zap,
      title: 'Instant AI Recommendations',
      description: 'Get personalized suggestions in real-time. Our AI learns your preferences and predicts what you\'ll need next.',
      highlight: '<2 second response',
      gradient: 'from-yellow-100 to-yellow-200',
      iconColor: 'text-yellow-600'
    },
    {
      icon: MessageCircle,
      title: 'Smart Communication Tools',
      description: 'Built-in chat with auto-translation, smart notifications, and AI-assisted scheduling for seamless coordination.',
      highlight: 'Auto-translation',
      gradient: 'from-indigo-100 to-indigo-200',
      iconColor: 'text-indigo-600'
    },
    {
      icon: TrendingUp,
      title: 'AI-Optimized Pricing',
      description: 'Dynamic pricing based on demand, location, and market trends. Maximize earnings or find the best deals automatically.',
      highlight: 'Smart pricing',
      gradient: 'from-emerald-100 to-emerald-200',
      iconColor: 'text-emerald-600'
    },
    {
      icon: Heart,
      title: 'Community-First Platform',
      description: 'Built by the community, for the community. Every feature is designed to strengthen local connections and trust.',
      highlight: '4.8/5 satisfaction',
      gradient: 'from-red-100 to-red-200',
      iconColor: 'text-red-600'
    },
    {
      icon: Lock,
      title: 'Enterprise-Grade Security',
      description: 'Bank-level encryption, fraud detection AI, and secure payment processing protect your data and transactions.',
      highlight: 'Bank-level security',
      gradient: 'from-slate-100 to-slate-200',
      iconColor: 'text-slate-600'
    }
  ];

  const stats = [
    { value: '47K+', label: 'Items Available', icon: Sparkles },
    { value: '40+', label: 'Countries Active', icon: Globe },
    { value: '96.8%', label: 'AI Match Accuracy', icon: Bot },
    { value: '99.2%', label: 'Successful Rentals', icon: CheckCircle }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-gradient-surface-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <AIBadge className="mb-6">
            Platform Advantages
          </AIBadge>
          
          <h2 className="heading-2 text-text-primary mb-4">
            Why Choose Our <span className="text-primary">AI-Powered Platform?</span>
          </h2>
          <p className="body-large text-text-secondary max-w-2xl mx-auto">
            Experience the future of sharing with intelligent matching, global connectivity, and community-driven trust. Our AI doesn't just connect you with items – it builds lasting relationships.
          </p>
        </div>

        {/* Stats Bar */}
        <Card className="glass-card p-6 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <IconComponent className="w-5 h-5 text-primary" />
                    <div className="heading-3 text-text-primary">{stat.value}</div>
                  </div>
                  <div className="body-small text-text-secondary">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </Card>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index} 
                className="glass-card p-8 text-center hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 relative overflow-hidden"
              >
                {/* Background Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300 from-primary to-secondary"></div>
                
                {/* Icon */}
                <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <IconComponent className={`w-10 h-10 ${feature.iconColor}`} />
                </div>
                
                {/* Content */}
                <h3 className="heading-4 text-text-primary mb-3 group-hover:text-primary transition-colors duration-200">
                  {feature.title}
                </h3>
                <p className="body-medium text-text-secondary mb-4">
                  {feature.description}
                </p>
                
                {/* Highlight Badge */}
                <Badge variant="success" className="inline-flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>{feature.highlight}</span>
                </Badge>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <Card className="glass-card p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div>
                <h3 className="heading-3 text-text-primary mb-3">
                  Ready to Experience the Future of Sharing?
                </h3>
                <p className="body-large text-text-secondary">
                  Join thousands of community members who are already earning money from unused items and finding exactly what they need, when they need it. Our AI makes it effortless.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="body-small text-text-secondary">Join in under 2 minutes with AI-assisted setup</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="body-small text-text-secondary">Start earning immediately or find items nearby</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span className="body-small text-text-secondary">Full protection and 24/7 AI-powered support</span>
                </div>
              </div>
            </div>
            
            {/* Right Content - Support Info */}
            <Card className="bg-gradient-to-br from-primary to-secondary p-6 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-white" />
              </div>
              
              <h4 className="heading-4 text-white mb-2">24/7 AI-Powered Support</h4>
              <p className="body-medium text-white/80 mb-4">
                Get instant help from our AI assistant or connect with human experts in 40+ languages.
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="heading-5 text-white">{'< 2 min'}</div>
                  <div className="body-xs text-white/70">Average response</div>
                </div>
                <div>
                  <div className="heading-5 text-white">97%</div>
                  <div className="body-xs text-white/70">Satisfaction rate</div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Bottom Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button variant="primary" size="lg" className="flex items-center justify-center space-x-2">
              <Bot className="w-5 h-5" />
              <span>Start with AI Setup</span>
            </Button>
            <Button variant="secondary" size="lg" className="flex items-center justify-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Join Community</span>
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default FeatureSection;