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
  processingProgress?: number;
  processingStage?: string;
  nextStep: () => void;
  confirmDocument?: () => Promise<void> | void; // unused when hideInlineNext is true; global button handles submission
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
  hideInlineNext?: boolean;
}

const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({
  verificationData,
  fileInputRef,
  handleFileUpload,
  setCameraMode,
  startCamera,
  isProcessing,
  aiProgress,
  processingProgress,
  processingStage,
  nextStep,
  confirmDocument,
  setVerificationData,
  hideInlineNext}) => (
  <div className="space-y-6">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Upload Your {verificationData.documentType}</h2>
      <p className="text-gray-600 dark:text-slate-400">Our AI will automatically extract and verify your information</p>
    </div>
    {!verificationData.documentImage ? (
      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-[#01aaa7] dark:hover:border-[#01aaa7] transition-colors bg-white dark:bg-slate-900">
          <Upload className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Upload Document Photo</h3>
          <p className="text-gray-600 dark:text-slate-400 mb-4">Take a clear photo or upload from your device</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => (fileInputRef.current as HTMLInputElement | null)?.click()}
              className="bg-[#01aaa7] text-white px-6 py-3 rounded-lg hover:bg-[#019c98] transition-colors"
            >
              <Upload className="w-5 h-5 inline mr-2" />
              Upload File
            </button>
            <button
              onClick={() => { setCameraMode('document'); startCamera(); }}
              className="bg-gray-600 dark:bg-slate-700 text-white px-6 py-3 rounded-lg hover:bg-gray-700 dark:hover:bg-slate-600 transition-colors"
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
        <div className="bg-[#e0f7f6] dark:bg-slate-800/60 border border-[#01aaa7] rounded-lg p-4">
          <h4 className="font-medium text-[#01aaa7] mb-2">Tips for best results:</h4>
          <ul className="text-sm text-[#019c98] dark:text-teal-300 space-y-1">
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
          <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-gray-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="animate-spin">
                <RefreshCw className="w-6 h-6 text-[#01aaa7]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {processingStage || 'AI Analyzing Document...'}
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="dark:text-slate-300">Processing Progress</span>
                <span>{Math.round(processingProgress || aiProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#01aaa7] to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress || aiProgress}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600 dark:text-slate-400 space-y-1">
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
          <div className="bg-green-50 dark:bg-emerald-900/20 border border-green-200 dark:border-emerald-900/40 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900 dark:text-emerald-300">Document Verified Successfully</h3>
            </div>
            <p className="text-sm text-gray-700 dark:text-slate-300">
              Your document photo looks valid. You can proceed to the next step.
            </p>
            {!hideInlineNext && (
              <div className="mt-4 flex justify-end">
                <button onClick={() => { if (confirmDocument) { Promise.resolve(confirmDocument()); } else { nextStep(); } }} className="px-6 py-2 rounded-lg bg-[#01aaa7] text-white hover:bg-[#019c98]">
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )}
    {/* Camera modal and selfie preview logic would be handled in the parent or a shared component */}
  </div>
);

export default DocumentUploadStep; 