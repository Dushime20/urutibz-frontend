import React from 'react';

interface ReviewAndSubmitStepProps {
  extractedData: {
    documentNumber: string;
    addressLine: string;
    city: string;
    country: string;
    stateProvince: string;
  };
  documentImage: string | null;
  selfieImage: string | null;
  isProcessing: boolean;
  errors: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onDebug?: () => void;
}

const ReviewAndSubmitStep: React.FC<ReviewAndSubmitStepProps> = ({
  extractedData,
  documentImage,
  selfieImage,
  isProcessing,
  errors,
  onChange,
  onSubmit,
  onDebug
}) => (
  <div className="space-y-8">
    <h2 className="text-2xl font-bold text-center">Review & Confirm Your Details</h2>
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <label className="block">
          <span className="font-medium">Document Number</span>
          <input
            type="text"
            value={extractedData.documentNumber}
            onChange={e => onChange('documentNumber', e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="font-medium">Address Line</span>
          <input
            type="text"
            value={extractedData.addressLine}
            onChange={e => onChange('addressLine', e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="font-medium">City</span>
          <input
            type="text"
            value={extractedData.city}
            onChange={e => onChange('city', e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="font-medium">Country</span>
          <input
            type="text"
            value={extractedData.country}
            onChange={e => onChange('country', e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="font-medium">State/Province</span>
          <input
            type="text"
            value={extractedData.stateProvince}
            onChange={e => onChange('stateProvince', e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </label>
        {errors.api && <div className="text-red-600 text-sm mt-2 font-medium">{errors.api}</div>}
        {errors.documentFile && <div className="text-red-600 text-sm mt-2 font-medium">{errors.documentFile}</div>}
        {errors.selfieFile && <div className="text-red-600 text-sm mt-2 font-medium">{errors.selfieFile}</div>}
      </div>
      <div className="space-y-6 flex flex-col items-center">
        <div>
          <span className="font-medium block mb-2">Document Image</span>
          {documentImage ? (
            <img src={documentImage} alt="Document" className="w-64 rounded-lg shadow" />
          ) : (
            <div className="text-gray-400">No document image</div>
          )}
        </div>
        <div>
          <span className="font-medium block mb-2">Selfie Image</span>
          {selfieImage ? (
            <img src={selfieImage} alt="Selfie" className="w-40 h-40 object-cover rounded-full shadow" />
          ) : (
            <div className="text-gray-400">No selfie image</div>
          )}
        </div>
      </div>
    </div>
    <div className="text-center mt-8">
      {errors.documentFile && (
        <div className="text-red-600 text-base mb-4 font-semibold">{errors.documentFile}</div>
      )}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {onDebug && (
          <button
            onClick={onDebug}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Debug State
          </button>
        )}
        <button
          onClick={onSubmit}
          className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 hover:scale-105 shadow-lg"
          disabled={isProcessing}
        >
          {isProcessing ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  </div>
);

export default ReviewAndSubmitStep; 