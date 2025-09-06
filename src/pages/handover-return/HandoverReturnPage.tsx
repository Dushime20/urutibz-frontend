// Handover & Return Main Page
// Following the same patterns as RiskAssessmentPage.tsx

import React, { useState } from 'react';
import { 
  Package, 
  ArrowRightLeft, 
  TrendingUp,
  BarChart3,
  List
} from 'lucide-react';
import HandoverSessionForm from './components/HandoverSessionForm';
import ReturnSessionForm from './components/ReturnSessionForm';
import HandoverSessionsList from './components/HandoverSessionsList';
import ErrorBoundary from '../../components/ErrorBoundary';

const HandoverReturnPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'stats'>('sessions');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<'handover' | 'return'>('handover');

  const tabs = [
    {
      id: 'sessions',
      label: 'My Sessions',
      icon: List,
      description: 'View all your handover sessions'
    },
    {
      id: 'stats',
      label: 'Statistics',
      icon: BarChart3,
      description: 'View handover and return analytics'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sessions':
        return <HandoverSessionsList />;
      case 'stats':
        return (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Statistics Dashboard</h3>
              <p className="text-gray-600 mb-4">
                Comprehensive analytics for handover and return operations
              </p>
              <div className="text-sm text-gray-500">
                Coming soon - Real-time statistics and performance metrics
              </div>
            </div>
          </div>
        );
      default:
        return <HandoverSessionsList />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Handover & Return</h1>
                <p className="text-gray-600 mt-2">
                  Manage product handover and return sessions with comprehensive tracking
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setCreateType('handover');
                      setShowCreateModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    <Package className="w-4 h-4 mr-2" />
                    New Handover
                  </button>
                  <button
                    onClick={() => {
                      setCreateType('return');
                      setShowCreateModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    New Return
                  </button>
                </div>
                <Package className="w-8 h-8 text-teal-600" />
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
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
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {renderTabContent()}
          </div>

          {/* Quick Stats Overview */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="w-8 h-8 text-teal-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Handover Sessions</h3>
                  <p className="text-sm text-gray-600">Manage product handovers</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ArrowRightLeft className="w-8 h-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Return Sessions</h3>
                  <p className="text-sm text-gray-600">Manage product returns</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Success Rate</h3>
                  <p className="text-sm text-gray-600">Track completion rates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {createType === 'handover' ? 'Create Handover Session' : 'Create Return Session'}
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {createType === 'handover' ? (
                <HandoverSessionForm />
              ) : (
                <ReturnSessionForm />
              )}
            </div>
          </div>
        </div>
      )}
    </ErrorBoundary>
  );
};

export default HandoverReturnPage;
