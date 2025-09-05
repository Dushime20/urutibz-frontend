import React from 'react';
import { Settings } from 'lucide-react';

const ComplianceSection: React.FC = () => {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <div className="text-gray-600 mb-4">
          <Settings className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Compliance Checking</h3>
        <p className="text-gray-500">Compliance checking system coming soon...</p>
      </div>
    </div>
  );
};

export default ComplianceSection;
