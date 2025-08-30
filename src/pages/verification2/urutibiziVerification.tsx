import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  CheckCircle,
  Shield,
  Smartphone,
  User,
  FileText,
  ArrowRight,
  ArrowLeft,
  Award,
  Home
} from 'lucide-react';
import WelcomeStep from './components/WelcomeStep';
import DocumentTypeStep from './components/DocumentTypeStep';
import DocumentUploadStep from './components/DocumentUploadStep';
import SelfieStep from './components/SelfieStep';
import PhoneStep from './components/PhoneStep';
import CompletionStep from './components/CompletionStep';
import { useToast } from '../../contexts/ToastContext';
import { Link } from 'react-router-dom';

import Tesseract from 'tesseract.js';
import { submitDocumentStep, submitSelfieStep, requestPhoneOtp, verifyPhoneOtp } from './service/api';


// 1. Add types for verification data
interface AiChecks {
  documentAuthenticity: { status: string; confidence: number };
  imageQuality: { status: string; confidence: number };
  dataConsistency: { status: string; confidence: number };
  securityFeatures?: { status: string; confidence: number };
}
interface OcrResults {
  documentType?: string;
  extractedData?: {
    name?: string;
    documentNumber?: string;
    dateOfBirth?: string;
    expiryDate?: string;
    nationality?: string;
    addressLine?: string;
    city?: string;
    country?: string;
    district?: string;
  };
  confidence?: number;
  aiChecks?: AiChecks;
}
interface VerificationData {
  documentType: string;
  documentImage: string | null;
  selfieImage: string | null;
  phoneNumber: string;
  verificationCode: string;
  aiAnalysis: AiChecks | null;
  ocrResults: OcrResults | null;
}

// Rwanda ID OCR extraction helper
function extractRwandaIDFields(text: string) {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  let name = '';
  let dateOfBirth = '';
  let sex = '';
  let district = '';
  let documentNumber = '';

  for (let i = 0; i < lines.length; i++) {
    if (/Amazina.*Names/i.test(lines[i])) {
      name = lines[i + 1] || '';
    }
    if (/Date of Birth/i.test(lines[i])) {
      dateOfBirth = lines[i + 1] || '';
    }
    if (/Igitsina.*Sex/i.test(lines[i])) {
      const nextLine = lines[i + 1] || '';
      // Example: Gabo/M  Nyamagabe / Kitabi
      const sexMatch = nextLine.match(/([A-Za-z]+)\s*\/\s*([A-Za-z])/);
      if (sexMatch) {
        sex = sexMatch[1];
      }
      const districtMatch = nextLine.match(/([A-Za-z]+)\s*\/\s*[A-Za-z]+$/);
      if (districtMatch) {
        district = districtMatch[1];
      }
    }
    if (/ID No/i.test(lines[i])) {
      // The value may be on the same line after the label
      const idMatch = lines[i].match(/ID No\.\s*([0-9\. ]+)/i);
      if (idMatch && idMatch[1]) {
        documentNumber = idMatch[1].replace(/\s+/g, '').replace(/\./g, '');
      } else {
        documentNumber = lines[i + 1] || '';
      }
    }
  }

  return {
    name,
    dateOfBirth,
    sex,
    district,
    documentNumber
  };
}

const UrutiBzVerification = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const [verificationData, setVerificationData] = useState<VerificationData>({
    documentType: 'national_id',
    documentImage: null,
    selfieImage: null,
    phoneNumber: '',
    verificationCode: '',
    aiAnalysis: null,
    ocrResults: null
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Add these state hooks near the top of the component
  const [documentFile, setDocumentFile] = useState<File | null>(null);





  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save current state before page unload
      // saveToStorage(verificationData); // Removed as per edit hint
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [verificationData]);

  // Reset verification process
  const [showCamera, setShowCamera] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('RW');
  const [cameraMode, setCameraMode] = useState<'document' | 'selfie' | null>(null);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [, setCameraError] = useState<string | null>(null);
  const [, setShowSubmitSelfie] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Add cameraStream state
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const steps = [
    { id: 0, title: 'Get Started', icon: Shield, description: 'Begin verification process' },
    { id: 1, title: 'Document Type', icon: FileText, description: 'Select your ID document' },
    { id: 2, title: 'Upload Document', icon: Upload, description: 'Scan your ID with AI' },
    { id: 3, title: 'Selfie Verification', icon: User, description: 'Take a verification selfie' },
    { id: 4, title: 'Phone Verification', icon: Smartphone, description: 'Verify your phone number' },
    { id: 5, title: 'Complete', icon: Award, description: 'Verification successful' }
  ];

  const countries = [
    { code: 'RW', name: 'Rwanda', flag: '🇷🇼', documents: ['National ID', 'Passport', 'Driving License'] },
    { code: 'KE', name: 'Kenya', flag: '🇰🇪', documents: ['National ID', 'Passport', 'Huduma Namba'] },
    { code: 'UG', name: 'Uganda', flag: '🇺🇬', documents: ['National ID', 'Passport', 'Driving License'] },
    { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', documents: ['National ID', 'Passport', 'Voter ID'] }
  ];

  const { showToast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    setIsProcessing(true);
    setErrors({});
    setDocumentFile(file);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageDataUrl = e.target?.result as string;
      // Run OCR
      try {
        const { data: { text } } = await Tesseract.recognize(imageDataUrl, 'eng');
        const extracted = extractRwandaIDFields(text);
        setVerificationData(prev => ({
          ...prev,
          documentImage: imageDataUrl,
          ocrResults: {
            ...prev.ocrResults,
            extractedData: {
              ...prev.ocrResults?.extractedData,
              ...extracted
            }
          }
        }));
        showToast('Document uploaded and processed successfully!', 'success');
      } catch (err) {
        setErrors({ api: 'OCR failed. Please try again or enter details manually.' });
        showToast('Failed to process document. Please try again.', 'error');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // In capturePhoto, for document mode:
  const capturePhoto = () => {
    const video = videoRef.current as HTMLVideoElement | null;
    const canvas = canvasRef.current as HTMLCanvasElement | null;
    if (!video || !canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg');
    if (cameraMode === 'document') {
      setVerificationData(prev => ({ ...prev, documentImage: imageData }));
      localStorage.setItem('document_image', imageData); // Store in localStorage
      fetch(imageData)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], 'document.jpg', { type: 'image/jpeg' });
          setDocumentFile(file);
        });
    } else {
      setCapturedSelfie(imageData);
    }
    setShowCamera(false);
    const stream = video.srcObject as MediaStream | null;
    const tracks = stream?.getTracks();
    tracks?.forEach((track: MediaStreamTrack) => track.stop());
  };


  const handleConfirmSelfie = (base64Image: string) => {
    setVerificationData(prev => ({ ...prev, selfieImage: base64Image }));
  };


  const handleRetakeSelfie = () => {
    setCapturedSelfie(null);
    setVerificationData(prev => ({
      ...prev,
      selfieImage: null,
    }));
    setShowCamera(true);
    setCameraMode('selfie');
    setShowSubmitSelfie(false);
  };

  // Replace handleDocumentStepNext
  const handleDocumentStepNext = async () => {
    if (currentStep !== 2) return;
    if (!documentFile) {
      setErrors({ document: 'Please upload a document image.' });
      return;
    }
    setIsProcessing(true);
    setErrors({});
    try {
      const token = localStorage.getItem('token');
      const extracted = verificationData.ocrResults?.extractedData || {};
      const result = await submitDocumentStep(documentFile, verificationData.documentType, extracted, token);
      if (result?.data?.verification?.id) {
        localStorage.setItem('verificationId', result.data.verification.id);
      }
      showToast('Document uploaded successfully!', 'success');
      setCurrentStep(currentStep + 1);
    } catch (error: any) {
      setErrors({ api: error.message });
      showToast('Failed to upload document. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Replace handleSelfieStepNext
  const handleSelfieStepNext = async () => {
    if (currentStep !== 3) return;
    if (!verificationData.selfieImage) {
      setErrors({ selfie: 'Please capture a selfie image.' });
      return;
    }
    setIsProcessing(true);
    setErrors({});
    try {
      const verificationId = localStorage.getItem('verificationId');
      const token = localStorage.getItem('token');
      await submitSelfieStep(verificationData.selfieImage, verificationId, token);
      showToast('Selfie uploaded successfully!', 'success');
      setCurrentStep(currentStep + 1);
    } catch (error: any) {
      setErrors({ api: error.message });
      showToast('Failed to upload selfie. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Update handleNextStep to use selfie handler for step 3
  const handleNextStep = async () => {
    if (currentStep === 2) {
      await handleDocumentStepNext();
      return;
    }
    if (currentStep === 3) {
      await handleSelfieStepNext();
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  // Start camera
  const startCamera = async () => {
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });

      // Set the stream first
      setCameraStream(stream);

      // Then show the camera modal
      setShowCamera(true);

      // The video element will be assigned the stream via useEffect
    } catch (error) {
      setCameraError('Camera access denied. Please enable camera permissions and try again.');
    }
  };

  // Add OTP state
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  const handleRequestOtp = async () => {
    setIsProcessing(true);
    setErrors({});
    try {
      const token = localStorage.getItem('token');
      await requestPhoneOtp(verificationData.phoneNumber, token);
      setShowOtpInput(true);
      showToast('OTP sent to your phone!', 'success');
    } catch (error: any) {
      setErrors({ phone: error.message || 'Failed to request OTP' });
      showToast('Failed to request OTP. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsProcessing(true);
    setErrors({});
    try {
      const token = localStorage.getItem('token');
      await verifyPhoneOtp(verificationData.phoneNumber, otp, token);
      showToast('Phone verified!', 'success');
      setCurrentStep(currentStep + 1);
    } catch (error: any) {
      setErrors({ otp: error.message || 'Failed to verify OTP' });
      showToast('Failed to verify OTP. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };


  useEffect(() => {
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    const assignStream = () => {
      const videoCurrent = videoRef.current;
      if (showCamera && videoCurrent && cameraStream) {
        videoCurrent.srcObject = cameraStream;
      } else if (showCamera && cameraStream && !videoCurrent) {
        retryTimeout = setTimeout(assignStream, 30); // retry after 30ms
      } else {
        if (!showCamera) {
        }
        if (!cameraStream) {
        }
      }
    };
    assignStream();
    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [showCamera, cameraStream]);

  // Clean up stream when modal closes, with null checks
  useEffect(() => {
    if (!showCamera && cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [showCamera, cameraStream]);

  // Add state for editable extractedData
  const [
    , setReviewData] = useState({
      documentNumber: '',
      addressLine: '',
      city: '',
      country: '',
      district: '',
    });

  // When ocrResults are updated, sync to reviewData
  useEffect(() => {
    if (verificationData.ocrResults?.extractedData) {
      const extracted = verificationData.ocrResults.extractedData;
      setReviewData({
        documentNumber: extracted.documentNumber || '',
        addressLine: (extracted as any).addressLine || '',
        city: (extracted as any).city || '',
        country: extracted.nationality || '',
        district: (extracted as any).district || '',
      });
    }
  }, [verificationData.ocrResults]);


  return (
    <div className="min-h-screen bg-blue-50 to-purple-50">

      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Personalized Greeting */}

          
          {/* <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {verificationData.ocrResults?.extractedData?.name
                ? `Hi, ${verificationData.ocrResults.extractedData.name}! Let's verify your identity.`
                : 'Let’s verify your identity.'}
            </h1>
          </div> */}
          {/* Back to Home Button */}
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep + 1} of {steps.length}
              </span>
              <div className="text-sm text-gray-500">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              return (
                <div key={step.id} className="flex items-center flex-1 group relative">
                  <div
                    tabIndex={0}
                    aria-label={step.title}
                    aria-current={isActive ? 'step' : undefined}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300  focus:outline-none focus:ring-2 focus:ring-[#01aaa7]
                      ${isCompleted ? 'bg-green-400 border-green-400 text-white' :
                        isActive ? 'bg-[#01aaa7] border-[#01aaa7] text-white ring-4 ring-[#7de2d1]/30' :
                        'border-gray-300 text-gray-400'}
                    `}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  {/* Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 -top-10 z-10 px-3 py-1 rounded bg-gray-900 text-white text-xs opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">
                    {step.description}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded transition-all duration-300
                        ${isCompleted ? 'bg-green-300' : isActive ? 'bg-gradient-to-r from-[#01aaa7] to-[#7de2d1]' : 'bg-gray-200'}
                      `}
                      style={isActive ? { background: 'linear-gradient(90deg, #01aaa7 0%, #7de2d1 100%)' } : {}}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between mt-2">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              return (
                <div
                  key={step.id}
                  className={`text-xs
                    ${isCompleted ? 'text-[#01aaa7] font-medium' :
                      isActive ? 'text-[#01aaa7] font-medium' :
                      'text-gray-400'}
                  `}
                  style={{ width: `${100 / steps.length}%` }}
                >
                  {step.title}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {currentStep === 0 && <WelcomeStep nextStep={nextStep} />}
          {currentStep === 1 && (
            <DocumentTypeStep
              countries={countries}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              setVerificationData={setVerificationData}
              nextStep={nextStep}
            />
          )}
          {currentStep === 2 && (
            <DocumentUploadStep
              verificationData={verificationData}
              fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
              handleFileUpload={handleFileUpload}
              setCameraMode={setCameraMode}
              startCamera={startCamera}
              isProcessing={isProcessing}
              aiProgress={aiProgress}
              nextStep={nextStep}
              setVerificationData={setVerificationData}
              showCamera={showCamera}
              videoRef={videoRef as React.RefObject<HTMLVideoElement>}
              cameraStream={cameraStream}
              cameraMode={cameraMode}
              capturePhoto={capturePhoto}
              setShowCamera={setShowCamera}
              canvasRef={canvasRef as React.RefObject<HTMLCanvasElement>}
              capturedSelfie={capturedSelfie}
              handleRetakeSelfie={handleRetakeSelfie}
              errors={errors}
            />
          )}
          {currentStep === 3 && (
            <SelfieStep
              showCamera={showCamera}
              setShowCamera={setShowCamera}
              setCameraMode={setCameraMode}
              startCamera={startCamera}
              capturedSelfie={capturedSelfie}
              setCapturedSelfie={setCapturedSelfie}
              handleRetakeSelfie={handleRetakeSelfie}
              errors={errors}
              onConfirmSelfie={handleConfirmSelfie}
            />
          )}
          {currentStep === 4 && (
            <PhoneStep
              verificationData={verificationData}
              setVerificationData={setVerificationData}
              otp={otp}
              setOtp={setOtp}
              onRequestOtp={handleRequestOtp}
              onVerifyOtp={handleVerifyOtp}
              showOtpInput={showOtpInput}
              isProcessing={isProcessing}
              errors={errors}
            />
          )}
          {currentStep === 5 && <CompletionStep verificationData={verificationData} />}
        </div>

        {/* Navigation */}
        {currentStep > 0 && currentStep < 5 && (
          <div className="flex justify-between mt-6">
            <button
              onClick={prevStep}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentStep < 4 && (
              <button
                onClick={handleNextStep}
                disabled={
                  isProcessing ||
                  (currentStep === 2 && !verificationData.documentImage) ||
                  (currentStep === 3 && !verificationData.selfieImage) ||
                  (currentStep === 4 && !verificationData.ocrResults)
                }
                className={`flex items-center space-x-2 bg-[#01aaa7] text-white px-4 py-2 rounded-lg hover:bg-[#019c98] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ${isProcessing ? 'opacity-80' : ''}`}
              >
                {isProcessing && (
                  <svg className="animate-spin h-6 w-6 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#01aaa7" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="#01aaa7" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                <span>{isProcessing ? 'Processing...' : 'Next'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>


      {/* Toast notification */}
      {/* Loading message */}
      
    </div>
  );
};

export default UrutiBzVerification;