import React from 'react';
import { FileText } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  flag: string;
  documents: string[];
}

interface DocumentTypeStepProps {
  countries: Country[];
  selectedCountry: string;
  setSelectedCountry: (code: string) => void;
  setVerificationData: (fn: (prev: any) => any) => void;
  nextStep: () => void;
}

const DocumentTypeStep: React.FC<DocumentTypeStepProps> = ({ countries, selectedCountry, setSelectedCountry, setVerificationData, nextStep }) => (
  <div className="space-y-6">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Country</h2>
      <p className="text-gray-600">Choose your country to see available document types</p>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {countries.map((country) => (
        <button
          key={country.code}
          onClick={() => setSelectedCountry(country.code)}
          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
            selectedCountry === country.code
              ? 'border-[#01aaa7] bg-[#e0f7f6] shadow-lg scale-105'
              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
          }`}
        >
          <div className="text-3xl mb-2">{country.flag}</div>
          <div className="font-medium text-gray-900">{country.name}</div>
        </button>
      ))}
    </div>
    {selectedCountry && (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">Select Document Type</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {countries.find(c => c.code === selectedCountry)?.documents.map((docType) => (
            <button
              key={docType}
              onClick={() => {
                console.log('Setting document type to:', docType);
                setVerificationData((prev: any) => {
                  const updated = { ...prev, documentType: docType };
                  console.log('Updated verification data:', updated);
                  return updated;
                });
                nextStep();
              }}
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-[#01aaa7] hover:bg-[#e0f7f6] transition-all duration-300 hover:scale-105"
            >
              <FileText className="w-8 h-8 text-[#01aaa7] mx-auto mb-3" />
              <div className="font-medium text-gray-900">{docType}</div>
              <div className="text-sm text-gray-500 mt-1">
                {docType === 'National ID' && 'Government-issued ID card'}
                {docType === 'Passport' && 'International travel document'}
                {docType === 'Driving License' && 'Valid driving permit'}
                {docType === 'Huduma Namba' && 'Kenya digital ID'}
                {docType === 'Voter ID' && 'Electoral commission ID'}
              </div>
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default DocumentTypeStep; 