import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Globe, 
  Shield, 
  TrendingUp, 
  BarChart3,
  Zap,
  Lock,
  Headphones,
  ArrowRight,
  CheckCircle2,
  Settings,
  FileText,
  CreditCard,
  Sparkles,
  Network,
  Target,
  Award
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { TranslatedText } from '../components/translated-text';

const EnterprisePage: React.FC = () => {
  const { tSync } = useTranslation();

  const features = [
    {
      icon: Building2,
      title: 'Multi-Location Management',
      description: 'Manage your rental operations across multiple locations, countries, and time zones from a single unified dashboard.',
      details: [
        'Centralized inventory management',
        'Location-based analytics and reporting',
        'Multi-currency pricing and billing',
        'Regional compliance and regulations'
      ]
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Enable seamless collaboration across your organization with role-based access control and team management.',
      details: [
        'Role-based permissions and access control',
        'Team member management and assignments',
        'Shared calendars and scheduling',
        'Internal communication tools'
      ]
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Get comprehensive insights into your rental business with real-time analytics, forecasting, and business intelligence.',
      details: [
        'Real-time revenue and booking analytics',
        'Demand forecasting and trend analysis',
        'Customer behavior insights',
        'Custom reports and data exports'
      ]
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with advanced encryption, compliance certifications, and dedicated security support.',
      details: [
        'SOC 2 Type II compliance',
        'End-to-end encryption',
        'Regular security audits',
        'Dedicated security team support'
      ]
    },
    {
      icon: Zap,
      title: 'API Integration',
      description: 'Integrate our platform with your existing systems through our comprehensive REST API and webhooks.',
      details: [
        'Full REST API access',
        'Real-time webhook notifications',
        'Custom integration support',
        'Developer documentation and SDKs'
      ]
    },
    {
      icon: Settings,
      title: 'White-Label Solutions',
      description: 'Customize the platform with your branding, domain, and business rules to match your enterprise needs.',
      details: [
        'Custom branding and domain',
        'Tailored business rules and workflows',
        'Customizable user interface',
        'Dedicated account management'
      ]
    },
    {
      icon: Network,
      title: 'Multi-Channel Distribution',
      description: 'Distribute your inventory across multiple channels including your website, mobile apps, and partner platforms.',
      details: [
        'Multi-channel inventory sync',
        'Channel-specific pricing rules',
        'Unified booking management',
        'Cross-channel analytics'
      ]
    },
    {
      icon: Target,
      title: 'Risk Management',
      description: 'Advanced risk assessment and management tools to protect your business and optimize rental decisions.',
      details: [
        'AI-powered risk scoring',
        'Automated compliance checking',
        'Fraud detection and prevention',
        'Insurance integration and management'
      ]
    }
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Scale Your Business',
      description: 'Grow your rental operations without limits. Our platform scales with your business needs.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Expand to new markets with multi-language, multi-currency, and multi-location support.'
    },
    {
      icon: Headphones,
      title: 'Dedicated Support',
      description: 'Get 24/7 priority support with dedicated account managers and SLA guarantees.'
    },
    {
      icon: Award,
      title: 'Proven Results',
      description: 'Join leading enterprises already using our platform to transform their rental operations.'
    }
  ];

  const useCases = [
    {
      title: 'Equipment Rental Companies',
      description: 'Manage large fleets of construction equipment, vehicles, and machinery across multiple locations.',
      industries: ['Construction', 'Event Management', 'Film Production', 'Logistics']
    },
    {
      title: 'Fleet Management',
      description: 'Optimize fleet utilization, reduce downtime, and maximize revenue from underutilized assets.',
      industries: ['Transportation', 'Delivery Services', 'Corporate Fleets']
    },
    {
      title: 'Marketplace Platforms',
      description: 'Power your own rental marketplace with our white-label solution and API infrastructure.',
      industries: ['E-commerce', 'Marketplace', 'Platform Businesses']
    },
    {
      title: 'Property Management',
      description: 'Manage short-term and long-term property rentals with advanced scheduling and automation.',
      industries: ['Real Estate', 'Hospitality', 'Vacation Rentals']
    }
  ];

  const integrationOptions = [
    {
      icon: FileText,
      title: 'ERP Integration',
      description: 'Connect with SAP, Oracle, Microsoft Dynamics, and other enterprise systems.'
    },
    {
      icon: CreditCard,
      title: 'Payment Gateways',
      description: 'Integrate with Stripe, PayPal, Adyen, and other payment processors.'
    },
    {
      icon: Settings,
      title: 'CRM Systems',
      description: 'Sync with Salesforce, HubSpot, and other customer relationship management platforms.'
    },
    {
      icon: BarChart3,
      title: 'Business Intelligence',
      description: 'Export data to Tableau, Power BI, and other analytics platforms.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative text-gray-900 dark:text-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 mb-6">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">Enterprise Solutions</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <TranslatedText text="Enterprise Rental Platform" />
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              <TranslatedText text="Power your rental business with enterprise-grade tools, advanced analytics, and seamless integrations. Scale globally with confidence." />
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-teal-700 transition-colors"
              >
                <TranslatedText text="Contact Sales" />
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <TranslatedText text="Start Free Trial" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <TranslatedText text="Enterprise Features" />
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              <TranslatedText text="Everything you need to run a world-class rental operation at scale" />
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl w-fit mb-4">
                    <Icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    <TranslatedText text={feature.title} />
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                    <TranslatedText text={feature.description} />
                  </p>
                  <ul className="space-y-2">
                    {feature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 mt-0.5 flex-shrink-0" />
                        <span><TranslatedText text={detail} /></span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <TranslatedText text="Why Choose Enterprise?" />
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              <TranslatedText text="Join leading enterprises transforming their rental operations" />
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 text-center"
                >
                  <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl w-fit mx-auto mb-4">
                    <Icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    <TranslatedText text={benefit.title} />
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    <TranslatedText text={benefit.description} />
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <TranslatedText text="Perfect For Your Industry" />
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              <TranslatedText text="Enterprise solutions tailored to your business needs" />
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                  <TranslatedText text={useCase.title} />
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  <TranslatedText text={useCase.description} />
                </p>
                <div className="flex flex-wrap gap-2">
                  {useCase.industries.map((industry, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-full text-sm font-medium"
                    >
                      {industry}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <TranslatedText text="Seamless Integrations" />
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              <TranslatedText text="Connect with your existing business tools and workflows" />
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {integrationOptions.map((integration, index) => {
              const Icon = integration.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 text-center"
                >
                  <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-xl w-fit mx-auto mb-4">
                    <Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    <TranslatedText text={integration.title} />
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <TranslatedText text={integration.description} />
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            <TranslatedText text="Ready to Transform Your Rental Business?" />
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            <TranslatedText text="Schedule a demo with our enterprise team and see how we can help scale your operations" />
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-teal-700 transition-colors"
            >
              <TranslatedText text="Schedule a Demo" />
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link
              to="/faq"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <TranslatedText text="Learn More" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default EnterprisePage;

