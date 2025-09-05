import React from 'react';
import { BarChart3 } from 'lucide-react';

const StatisticsSection: React.FC = () => {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <div className="text-blue-600 mb-4">
          <BarChart3 className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Risk Management Statistics</h3>
        <p className="text-gray-500">Comprehensive statistics dashboard coming soon...</p>
      </div>
    </div>
  );
};

export default StatisticsSection;
