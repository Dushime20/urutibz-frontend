import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Calendar, Car, Users, Globe, MessageSquare, Bell } from 'lucide-react';

const DemoNavigationSection: React.FC = () => {
  const demoSections = [
    {
      title: 'Homepage',
      description: 'Modern landing page with AI-powered features',
      path: '/',
      icon: Globe,
      color: 'bg-blue-500'
    },
    {
      title: 'Admin Dashboard',
      description: 'Comprehensive admin panel with global management',
      path: '/admin',
      icon: Shield,
      color: 'bg-purple-500'
    },
    {
      title: 'Advanced Booking',
      description: 'Multi-step booking system with AI recommendations',
      path: '/booking',
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      title: 'Item Listings',
      description: 'Browse available rental items across all categories',
      path: '/items',
      icon: Car,
      color: 'bg-red-500'
    },
    {
      title: 'User Dashboard',
      description: 'Customer dashboard and profile management',
      path: '/dashboard',
      icon: Users,
      color: 'bg-orange-500'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-my-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">🚀 Live Demo</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore the world-class features of our AI-powered, international rental platform.
            Click on any section below to experience the comprehensive functionality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {demoSections.map((section) => (
            <Link
              key={section.path}
              to={section.path}
              className="group bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className={`p-3 rounded-xl ${section.color} text-white group-hover:scale-110 transition-transform`}>
                  <section.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{section.description}</p>
              <div className="mt-4 text-blue-600 text-sm font-medium group-hover:text-blue-700">
                Explore →
              </div>
            </Link>
          ))}
        </div>

        {/* Key Features Highlight */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Key Platform Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-50 p-4 rounded-xl mb-3">
                <Globe className="w-8 h-8 text-blue-600 mx-auto" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Global Platform</h4>
              <p className="text-sm text-gray-600">Multi-location, multi-language, multi-currency support</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-50 p-4 rounded-xl mb-3">
                <MessageSquare className="w-8 h-8 text-purple-600 mx-auto" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AI-Powered</h4>
              <p className="text-sm text-gray-600">Smart recommendations, fraud detection, predictive analytics</p>
            </div>
            <div className="text-center">
              <div className="bg-green-50 p-4 rounded-xl mb-3">
                <Calendar className="w-8 h-8 text-green-600 mx-auto" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Advanced Booking</h4>
              <p className="text-sm text-gray-600">5-step booking flow with real-time availability</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-50 p-4 rounded-xl mb-3">
                <Bell className="w-8 h-8 text-orange-600 mx-auto" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Enterprise Grade</h4>
              <p className="text-sm text-gray-600">Comprehensive admin dashboard and management tools</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoNavigationSection;
