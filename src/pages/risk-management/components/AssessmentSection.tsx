import React from 'react';
import { FileText } from 'lucide-react';

const AssessmentSection: React.FC = () => {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <div className="text-purple-600 mb-4">
          <FileText className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Risk Assessment</h3>
        <p className="text-gray-500">Risk assessment interface coming soon...</p>
      </div>
    </div>
  );
};

export default AssessmentSection;
