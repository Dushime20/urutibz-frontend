import React from 'react';
import { Shield, Zap, Clock, Info } from 'lucide-react';

interface WelcomeStepProps {
  nextStep: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ nextStep }) => (
  <div className="text-center space-y-6">
    <div className="mx-auto w-24 h-24 btn-primary rounded-full flex items-center justify-center">
      <Shield className="w-12 h-12 text-white" />
    </div>
    <div className="space-y-4">
      <h2 className="text-3xl font-bold text-gray-900">Verify Your Identity</h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Complete your verification to unlock all UrutiBz features. Our AI-powered system ensures 
        secure and fast verification while protecting your privacy.
      </p>
    </div>
    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      <div className="bg-[#e0f7f6] p-6 rounded-xl">
        <Zap className="w-8 h-8 text-[#01aaa7] mx-auto mb-3" />
        <h3 className="font#e0f7f6-semibold text-gray-900 mb-2">AI-Powered</h3>
        <p className="text-sm text-gray-600">Advanced AI analyzes your documents for authenticity and accuracy</p>
      </div>
      <div className="bg-[#e0f7f6] p-6 rounded-xl">
        <Shield className="w-8 h-8 text-[#01aaa7] mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-2">Bank-Level Security</h3>
        <p className="text-sm text-gray-600">Your data is encrypted and protected with enterprise security</p>
      </div>
      <div className="bg-[#e0f7f6] p-6 rounded-xl">
        <Clock className="w-8 h-8 text-[#01aaa7] mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-2">Quick Process</h3>
        <p className="text-sm text-gray-600">Complete verification in under 5 minutes with our streamlined flow</p>
      </div>
    </div>
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-w-2xl mx-auto">
      <div className="flex items-start space-x-3">
        <Info className="w-5 h-5 text-amber-600 mt-0.5" />
        <div className="text-left">
          <p className="text-sm font-medium text-amber-800">What you'll need:</p>
          <ul className="text-sm text-amber-700 mt-1 space-y-1">
            <li>• Valid government-issued ID (National ID, Passport, or Driving License)</li>
            <li>• Access to your phone for SMS verification</li>
            <li>• Well-lit area for document and selfie photos</li>
          </ul>
        </div>
      </div>
    </div>
    <button
      onClick={nextStep}
      className="bg-[#01aaa7] text-white px-8 py-4 rounded-xl font-semibold hover:from-[#019c98] hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg"
    >
      Start Verification Process
    </button>
  </div>
);

export default WelcomeStep; 