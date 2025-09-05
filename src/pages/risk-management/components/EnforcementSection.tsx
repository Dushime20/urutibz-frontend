import React from 'react';
import { CheckCircle } from 'lucide-react';

const EnforcementSection: React.FC = () => {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <div className="text-green-600 mb-4">
          <CheckCircle className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Enforcement Actions</h3>
        <p className="text-gray-500">Enforcement actions panel coming soon...</p>
      </div>
    </div>
  );
};

export default EnforcementSection;
