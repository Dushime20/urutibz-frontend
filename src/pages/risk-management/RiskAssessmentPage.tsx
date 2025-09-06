import React, { useState } from 'react';
import { 
  Shield, 
  BarChart3, 
  CheckCircle, 
  Package,
  AlertTriangle
} from 'lucide-react';
import RiskAssessmentForm from './components/RiskAssessmentForm';
import ComplianceChecker from './components/ComplianceChecker';
import ProductRiskProfile from './components/ProductRiskProfile';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useToast } from '../../contexts/ToastContext';

const RiskAssessmentPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'assessment' | 'compliance' | 'profile'>('assessment');

  const tabs = [
    {
      id: 'assessment',
      label: 'Risk Assessment',
      icon: BarChart3,
      description: 'Evaluate risk for product-renter combinations'
    },
    {
      id: 'compliance',
      label: 'Compliance Check',
      icon: CheckCircle,
      description: 'Check booking compliance status'
    },
    {
      id: 'profile',
      label: 'Product Profile',
      icon: Package,
      description: 'View product-specific risk information'
    }
  ];

  const handleAssessmentComplete = (assessment: any) => {
    console.log('Assessment completed:', assessment);
    showToast('Risk assessment completed successfully', 'success');
  };

  const handleComplianceChecked = (compliance: any) => {
    console.log('Compliance checked:', compliance);
    showToast('Compliance check completed', 'success');
  };

  const handleProfileLoaded = (profile: any) => {
    console.log('Profile loaded:', profile);
    showToast('Product risk profile loaded successfully', 'success');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'assessment':
        return (
          <RiskAssessmentForm 
            onAssessmentComplete={handleAssessmentComplete}
          />
        );
      case 'compliance':
        return (
          <ComplianceChecker 
            onComplianceChecked={handleComplianceChecked}
          />
        );
      case 'profile':
        return (
          <ProductRiskProfile 
            onProfileLoaded={handleProfileLoaded}
          />
        );
      default:
        return (
          <RiskAssessmentForm 
            onAssessmentComplete={handleAssessmentComplete}
          />
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Risk Assessment</h1>
                  <p className="mt-2 text-gray-600">
                    Comprehensive risk evaluation and compliance monitoring system
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Risk Management
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      isActive
                        ? 'border-teal-500 text-teal-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon
                      className={`-ml-0.5 mr-2 h-5 w-5 ${
                        isActive ? 'text-teal-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
          
          {/* Tab Description */}
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {renderTabContent()}
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="w-8 h-8 text-teal-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Risk Assessments</p>
                <p className="text-2xl font-semibold text-gray-900">1,247</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Compliant Bookings</p>
                <p className="text-2xl font-semibold text-gray-900">89.2%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Risk Profiles</p>
                <p className="text-2xl font-semibold text-gray-900">156</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">High Risk Items</p>
                <p className="text-2xl font-semibold text-gray-900">23</p>
              </div>
            </div>
          </div>
        </div>

        {/* Information Panel */}
        <div className="mt-8 bg-teal-50 border border-teal-200 rounded-lg p-6">
          <div className="flex">
            <Shield className="w-5 h-5 text-teal-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-teal-800">Risk Assessment System</h3>
              <div className="mt-2 text-sm text-teal-700">
                <p>
                  This system provides comprehensive risk evaluation for product-renter combinations, 
                  compliance checking for bookings, and detailed product risk profiles. All assessments 
                  are performed using advanced algorithms that consider multiple risk factors including 
                  product characteristics, renter history, booking patterns, and seasonal variations.
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li><strong>Risk Assessment:</strong> Evaluate overall risk score and get recommendations</li>
                  <li><strong>Compliance Check:</strong> Verify booking compliance with risk requirements</li>
                  <li><strong>Product Profile:</strong> View detailed risk information for specific products</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </ErrorBoundary>
  );
};

export default RiskAssessmentPage;
