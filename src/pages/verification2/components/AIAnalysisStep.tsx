import React from 'react';

interface AIAnalysisStepProps {
  verificationData: any;
  isProcessing: boolean;
  aiProgress: number;
  nextStep: () => void;
}

const AIAnalysisStep: React.FC<AIAnalysisStepProps> = ({
  verificationData,
  isProcessing,
  aiProgress,
  nextStep
}) => (
  <div className="space-y-6 text-center">
    <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Analysis</h2>
    <p className="text-gray-600 mb-4">Our AI is verifying your information. This may take a few moments.</p>
    <div className="flex flex-col items-center space-y-4">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg p-6 border shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <div className="animate-spin">
              <span className="inline-block w-6 h-6 bg-blue-600 rounded-full"></span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">AI Analyzing...</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Processing Progress</span>
              <span>{Math.round(aiProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${aiProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      {!isProcessing && (
        <button
          onClick={nextStep}
          className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 hover:scale-105 shadow-lg"
        >
          Continue
        </button>
      )}
    </div>
  </div>
);

export default AIAnalysisStep; 