import React from 'react';
import { Award } from 'lucide-react';

interface CompletionStepProps {
  verificationData: any;
}

const CompletionStep: React.FC<CompletionStepProps> = ({ verificationData }) => (
  <div className="space-y-8 text-center">
    <div className="mx-auto w-24 h-24 bg-gradient-to-r from-green-400 to-[#01aaa7] rounded-full flex items-center justify-center">
      <Award className="w-12 h-12 text-white" />
    </div>
    <h2 className="text-3xl font-bold text-green-800">Verification Complete!</h2>
    <p className="text-lg text-gray-700 max-w-2xl mx-auto">
      Congratulations, your identity has been successfully verified. You now have full access to all UrutiBz features.
    </p>
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg mx-auto mt-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Summary</h3>
      <ul className="text-left text-gray-700 space-y-2">
        <li><strong>Document Type:</strong> {verificationData.documentType}</li>
        <li><strong>Name:</strong> {verificationData.ocrResults?.extractedData?.name}</li>
        <li><strong>Document #:</strong> {verificationData.ocrResults?.extractedData?.documentNumber}</li>
        <li><strong>Phone:</strong> {verificationData.phoneNumber}</li>
      </ul>
    </div>
  </div>
);

export default CompletionStep; 