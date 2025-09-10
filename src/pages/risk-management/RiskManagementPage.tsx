import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, AlertTriangle, CheckCircle, BarChart3, TrendingUp, Package } from 'lucide-react';
import RiskProfilesSection from './components/RiskProfilesSection';
import ViolationsSection from './components/ViolationsSection';
import EnforcementSection from './components/EnforcementSection';
import StatisticsSection from './components/StatisticsSection';
import RiskAssessmentForm from './components/RiskAssessmentForm';
import ComplianceChecker from './components/ComplianceChecker';
import ProductRiskProfile from './components/ProductRiskProfile';

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
    {
      id: 'assessment',
      label: 'Risk Assessment',
      icon: TrendingUp,
      adminOnly: false,
      description: 'Evaluate risk for product-renter combinations'
    },
    {
      id: 'compliance',
      label: 'Compliance Check',
      icon: CheckCircle,
      adminOnly: false,
      description: 'Check booking compliance status'
    },
    {
      id: 'profile',
      label: 'Product Profile',
      icon: Package,
      adminOnly: false,
      description: 'View product-specific risk information'
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
      case 'assessment':
        return <RiskAssessmentForm />;
      case 'compliance':
        return <ComplianceChecker />;
      case 'profile':
        return <ProductRiskProfile />;
      default:
        return <RiskProfilesSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Risk Management</h1>
                <p className="mt-2 text-gray-600 dark:text-slate-400">
                  Comprehensive risk management and compliance monitoring system
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500 dark:text-slate-400">
                  Role: <span className="font-medium capitalize text-gray-900 dark:text-slate-100">{user?.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-slate-700">
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
                        ? 'border-teal-500 dark:border-teal-400 text-teal-600 dark:text-teal-400'
                        : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <Icon
                      className={`-ml-0.5 mr-2 h-5 w-5 ${
                        isActive ? 'text-teal-500 dark:text-teal-400' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-500 dark:group-hover:text-slate-400'
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
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default RiskManagementPage;
