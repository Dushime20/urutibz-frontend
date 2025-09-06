import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';
import RiskProfilesSection from './components/RiskProfilesSection';
import ViolationsSection from './components/ViolationsSection';
import EnforcementSection from './components/EnforcementSection';
import StatisticsSection from './components/StatisticsSection';

const RiskManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('profiles');

  // Check if user has admin privileges
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isInspector = user?.role === 'inspector';

  const tabs = [
    {
      id: 'profiles',
      label: 'Risk Profiles',
      icon: Shield,
      adminOnly: true,
      description: 'Manage risk profiles for products'
    },
    {
      id: 'violations',
      label: 'Violations',
      icon: AlertTriangle,
      adminOnly: false,
      inspectorAccess: true,
      description: 'Track and manage policy violations'
    },
    {
      id: 'enforcement',
      label: 'Enforcement',
      icon: CheckCircle,
      adminOnly: true,
      description: 'Manage enforcement actions'
    },
    {
      id: 'statistics',
      label: 'Statistics',
      icon: BarChart3,
      adminOnly: true,
      description: 'View risk management analytics'
    },
  ];

  // Filter tabs based on user role
  const availableTabs = tabs.filter(tab => {
    if (tab.adminOnly && !isAdmin) return false;
    if (tab.inspectorAccess && !isInspector && !isAdmin) return false;
    return true;
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profiles':
        return <RiskProfilesSection />;
      case 'violations':
        return <ViolationsSection />;
      case 'enforcement':
        return <EnforcementSection />;
      case 'statistics':
        return <StatisticsSection />;
      default:
        return <RiskProfilesSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Risk Management</h1>
                <p className="mt-2 text-gray-600">
                  Comprehensive risk management and compliance monitoring system
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Role: <span className="font-medium capitalize">{user?.role}</span>
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
              {availableTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
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
      </div>
    </div>
  );
};

export default RiskManagementPage;
