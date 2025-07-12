import React from 'react';
import { Upload, X, RefreshCw, CheckCircle, Camera } from 'lucide-react';

interface DocumentUploadStepProps {
  verificationData: any;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setCameraMode: (mode: 'document' | 'selfie' | null) => void;
  startCamera: () => void;
  isProcessing: boolean;
  aiProgress: number;
  nextStep: () => void;
  setVerificationData: (fn: (prev: any) => any) => void;
  showCamera: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraStream: MediaStream | null;
  cameraMode: 'document' | 'selfie' | null;
  capturePhoto: () => void;
  setShowCamera: (show: boolean) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  capturedSelfie: string | null;
  handleRetakeSelfie: () => void;
  errors: Record<string, string>;
}

const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({
  verificationData,
  fileInputRef,
  handleFileUpload,
  setCameraMode,
  startCamera,
  isProcessing,
  aiProgress,
  nextStep,
  setVerificationData}) => (
  <div className="space-y-6">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your {verificationData.documentType}</h2>
      <p className="text-gray-600">Our AI will automatically extract and verify your information</p>
    </div>
    {!verificationData.documentImage ? (
      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Document Photo</h3>
          <p className="text-gray-600 mb-4">Take a clear photo or upload from your device</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => (fileInputRef.current as HTMLInputElement | null)?.click()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-5 h-5 inline mr-2" />
              Upload File
            </button>
            <button
              onClick={() => { setCameraMode('document'); startCamera(); }}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Camera className="w-5 h-5 inline mr-2" />
              Take Photo
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Tips for best results:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Ensure good lighting without shadows</li>
            <li>• Keep the document flat and fully visible</li>
            <li>• Avoid glare and reflections</li>
            <li>• Make sure all text is clear and readable</li>
          </ul>
        </div>
      </div>
    ) : (
      <div className="space-y-6">
        <div className="relative">
          <img
            src={verificationData.documentImage}
            alt="Uploaded document"
            className="w-full max-w-md mx-auto rounded-lg shadow-lg"
          />
          <button
            onClick={() => setVerificationData((prev: any) => ({ ...prev, documentImage: null, ocrResults: null }))}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {isProcessing && (
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="animate-spin">
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">AI Analyzing Document...</h3>
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
              <div className="text-sm text-gray-600 space-y-1">
                <div className={aiProgress > 20 ? 'text-green-600' : ''}>
                  ✓ OCR text extraction {aiProgress > 20 && '(Complete)'}
                </div>
                <div className={aiProgress > 50 ? 'text-green-600' : ''}>
                  ✓ Document authenticity check {aiProgress > 50 && '(Complete)'}
                </div>
                <div className={aiProgress > 80 ? 'text-green-600' : ''}>
                  ✓ Security features verification {aiProgress > 80 && '(Complete)'}
                </div>
              </div>
            </div>
          </div>
        )}
        {verificationData.ocrResults && !isProcessing && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">Document Verified Successfully</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-900">Extracted Information:</p>
                <ul className="mt-2 space-y-1 text-gray-700">
                  <li>Name: {verificationData.ocrResults?.extractedData?.name ?? 'N/A'}</li>
                  <li>Document #: {verificationData.ocrResults?.extractedData?.documentNumber ?? 'N/A'}</li>
                  <li>Date of Birth: {verificationData.ocrResults?.extractedData?.dateOfBirth ?? 'N/A'}</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-900">AI Verification Status:</p>
                <ul className="mt-2 space-y-1 text-gray-700">
                  <li>Authenticity: {verificationData.ocrResults?.aiChecks?.documentAuthenticity?.confidence !== undefined ? (verificationData.ocrResults.aiChecks.documentAuthenticity.confidence * 100).toFixed(0) + '%' : 'N/A'}</li>
                  <li>Image Quality: {verificationData.ocrResults?.aiChecks?.imageQuality?.confidence !== undefined ? (verificationData.ocrResults.aiChecks.imageQuality.confidence * 100).toFixed(0) + '%' : 'N/A'}</li>
                  <li>Overall Confidence: {verificationData.ocrResults?.confidence !== undefined ? (verificationData.ocrResults.confidence * 100).toFixed(0) + '%' : 'N/A'}</li>
                </ul>
              </div>
            </div>
            {/* <button
              onClick={nextStep}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue to Selfie Verification
            </button> */}
          </div>
        )}
      </div>
    )}
    {/* Camera modal and selfie preview logic would be handled in the parent or a shared component */}
  </div>
);

export default DocumentUploadStep; 