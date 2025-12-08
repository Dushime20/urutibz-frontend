import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Shield, 
  TrendingUp, 
  Users, 
  Globe, 
  CreditCard, 
  FileText, 
  Award,
  ArrowRight,
  Package,
  DollarSign,
  BarChart3,
  Headphones,
  Sparkles
} from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { TranslatedText } from '../components/translated-text';

const SuppliersPage: React.FC = () => {
  const { tSync } = useTranslation();

  const requirements = [
    {
      icon: Shield,
      title: 'Business Verification',
      description: 'Provide valid business registration documents and tax identification numbers. We verify all suppliers to ensure marketplace integrity.',
      details: [
        'Valid business license or registration certificate',
        'Tax identification number (TIN)',
        'Proof of business address',
        'Identity verification of business owner/authorized representative'
      ]
    },
    {
      icon: Package,
      title: 'Quality Inventory',
      description: 'List high-quality, well-maintained equipment that meets our marketplace standards. All items must be in working condition.',
      details: [
        'Items must be in good working condition',
        'Clear, high-quality product images required',
        'Accurate product descriptions and specifications',
        'Regular inventory updates and availability management'
      ]
    },
    {
      icon: DollarSign,
      title: 'Pricing & Terms',
      description: 'Set competitive, transparent pricing with clear rental terms. We help you optimize pricing based on market demand.',
      details: [
        'Competitive daily, weekly, and monthly rates',
        'Clear security deposit requirements',
        'Transparent cancellation and refund policies',
        'Flexible pricing for long-term rentals'
      ]
    },
    {
      icon: FileText,
      title: 'Legal Compliance',
      description: 'Adhere to local regulations, insurance requirements, and platform policies. We provide compliance guidance and support.',
      details: [
        'Valid insurance coverage for listed items',
        'Compliance with local rental regulations',
        'Clear terms of service and rental agreements',
        'Data protection and privacy compliance'
      ]
    },
    {
      icon: Users,
      title: 'Customer Service',
      description: 'Maintain excellent customer service standards. Respond promptly to inquiries and provide support throughout the rental period.',
      details: [
        'Response time: within 24 hours for inquiries',
        'Professional communication with renters',
        'Support during handover and return processes',
        'Quick resolution of issues and disputes'
      ]
    },
    {
      icon: BarChart3,
      title: 'Performance Metrics',
      description: 'Maintain good performance ratings and reviews. Track your metrics through our supplier dashboard.',
      details: [
        'Minimum 4.0 average rating',
        'On-time delivery and pickup',
        'Low cancellation rate (<5%)',
        'Positive customer feedback'
      ]
    }
  ];

  const benefits = [
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Access renters in 45+ countries through our international marketplace platform.'
    },
    {
      icon: TrendingUp,
      title: 'Revenue Growth',
      description: 'Increase your equipment utilization rates and generate additional income from idle inventory.'
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Matching',
      description: 'Our intelligent system matches your inventory with the right renters, maximizing bookings.'
    },
    {
      icon: Award,
      title: 'Trust & Credibility',
      description: 'Build trust with verified badges, secure payments, and comprehensive insurance coverage.'
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      description: 'Get paid securely through our escrow system with automated payouts and fraud protection.'
    },
    {
      icon: Headphones,
      title: '24/7 Support',
      description: 'Access our dedicated supplier support team for assistance with listings, bookings, and issues.'
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: 'Sign Up',
      description: 'Create your supplier account and complete your business profile with basic information.'
    },
    {
      step: 2,
      title: 'Verification',
      description: 'Submit required documents for business verification. Our team reviews applications within 2-3 business days.'
    },
    {
      step: 3,
      title: 'Onboarding',
      description: 'Complete supplier onboarding training and familiarize yourself with our platform tools and policies.'
    },
    {
      step: 4,
      title: 'List Inventory',
      description: 'Start listing your equipment with high-quality photos, detailed descriptions, and competitive pricing.'
    },
    {
      step: 5,
      title: 'Go Live',
      description: 'Once approved, your listings go live and become visible to renters worldwide. Start receiving bookings!'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative text-gray-900 dark:text-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <TranslatedText text="Become a Supplier" />
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              <TranslatedText text="Join our global marketplace and monetize your equipment inventory. Reach renters in 45+ countries and grow your business." />
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-teal-700 transition-colors"
              >
                <TranslatedText text="Get Started" />
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl font-semibold text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <TranslatedText text="Contact Sales" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <TranslatedText text="Requirements to Become a Supplier" />
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              <TranslatedText text="To ensure quality and trust in our marketplace, all suppliers must meet these requirements:" />
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {requirements.map((req, index) => {
              const Icon = req.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl">
                      <Icon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      <TranslatedText text={req.title} />
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    <TranslatedText text={req.description} />
                  </p>
                  <ul className="space-y-2">
                    {req.details.map((detail, idx) => (
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
              <TranslatedText text="Why Become a Supplier?" />
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              <TranslatedText text="Join thousands of suppliers already growing their business on our platform" />
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-xl w-fit mb-4">
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

      {/* Process Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              <TranslatedText text="How to Get Started" />
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              <TranslatedText text="Follow these simple steps to start listing your equipment" />
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-300 dark:bg-gray-600 hidden lg:block"></div>
            <div className="space-y-8 lg:space-y-0">
              {processSteps.map((step, index) => (
                <div
                  key={index}
                  className={`flex flex-col lg:flex-row items-center gap-6 ${
                    index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-teal-600 dark:bg-teal-700 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {step.step}
                    </div>
                  </div>
                  <div className={`flex-1 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${
                    index % 2 === 0 ? 'lg:mr-auto lg:max-w-md' : 'lg:ml-auto lg:max-w-md'
                  }`}>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      <TranslatedText text={step.title} />
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      <TranslatedText text={step.description} />
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            <TranslatedText text="Ready to Start?" />
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            <TranslatedText text="Join our marketplace today and start monetizing your equipment inventory" />
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-teal-700 transition-colors"
            >
              <TranslatedText text="Create Supplier Account" />
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

export default SuppliersPage;

