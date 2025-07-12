import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Shield, 
  Smartphone, 
  User, 
  FileText, 
  Zap, 
  X, 
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Info,
  Award,
  Globe,
  Clock
} from 'lucide-react';
import WelcomeStep from './components/WelcomeStep';
import DocumentTypeStep from './components/DocumentTypeStep';
import DocumentUploadStep from './components/DocumentUploadStep';
import SelfieStep from './components/SelfieStep';
import PhoneStep from './components/PhoneStep';
import CompletionStep from './components/CompletionStep';
import ReviewAndSubmitStep from './components/ReviewAndSubmitStep';
import Tesseract from 'tesseract.js';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

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
  // Initialize verificationData state directly with default values
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
  const [aiProgress, setAiProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Add these state hooks near the top of the component
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);

  // Check for existing data and recreate File objects on component mount
  useEffect(() => {
    const stored = localStorage.getItem('verificationData');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.documentImage || parsed.selfieImage) {
          // setHasExistingData(true); // Removed as per edit hint
          
          // Recreate File objects from base64 images
          if (parsed.documentImage) {
            fetch(parsed.documentImage)
              .then(res => res.blob())
              .then(blob => {
                const file = new File([blob], 'document.jpg', { type: 'image/jpeg' });
                // setDocumentFile(file); // Removed as per edit hint
              })
              .catch(error => {
                console.error('Error recreating document file:', error);
              });
          }
          
          if (parsed.selfieImage) {
            fetch(parsed.selfieImage)
              .then(res => res.blob())
              .then(blob => {
                const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
                // setSelfieFile(file); // Removed as per edit hint
              })
              .catch(error => {
                console.error('Error recreating selfie file:', error);
              });
          }
        }
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    }
  }, []);


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
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showSubmitSelfie, setShowSubmitSelfie] = useState(false);
  
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
    { id: 5, title: 'AI Analysis', icon: Zap, description: 'AI verifying your information' },
    { id: 6, title: 'Complete', icon: Award, description: 'Verification successful' }
  ];

  const countries = [
    { code: 'RW', name: 'Rwanda', flag: '🇷🇼', documents: ['National ID', 'Passport', 'Driving License'] },
    { code: 'KE', name: 'Kenya', flag: '🇰🇪', documents: ['National ID', 'Passport', 'Huduma Namba'] },
    { code: 'UG', name: 'Uganda', flag: '🇺🇬', documents: ['National ID', 'Passport', 'Driving License'] },
    { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', documents: ['National ID', 'Passport', 'Voter ID'] }
  ];

  // Simulate AI processing
  const simulateAIProcessing = (duration = 3000) => {
    setIsProcessing(true);
    setAiProgress(0);
    
    const interval = setInterval(() => {
      setAiProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  // Remove old processDocumentOCR and replace with real API integration
  const processDocumentOCR = async (documentFile: File, selfieFile: File) => {
    setIsProcessing(true);
    setAiProgress(0);
    try {
      // Prepare FormData for backend
      const formData = new FormData();
      formData.append('documentImage', documentFile);
      formData.append('selfieImage', selfieFile);
      formData.append('verificationType', verificationData.documentType);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/user-verification/submit-documents`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Verification failed');
      const data = await response.json();
      setVerificationData(prev => ({
        ...prev,
        ocrResults: data.ocrResults || null,
        aiAnalysis: data.aiAnalysis || null,
      }));
      setAiProgress(100);
    } catch (error: any) {
      setErrors({ api: error.message || 'Verification failed' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Update handleFileUpload to run OCR and extract fields
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
        console.log('OCR TEXT:', text);
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
      } catch (err) {
        setErrors({ api: 'OCR failed. Please try again or enter details manually.' });
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

  // Handler for confirming the selfie (no API call)
  const handleConfirmSelfie = (base64Image: string) => {
    setVerificationData(prev => ({ ...prev, selfieImage: base64Image }));
    setCapturedSelfie(null);
    setShowSubmitSelfie(true);
  };

  // Handler for submitting the selfie to the backend (API call)
  const handleSubmitSelfie = async () => {
    try {
      setIsProcessing(true);
      setErrors({});
      const base64Image = verificationData.selfieImage;
      if (!base64Image) return;
      const blob = await (await fetch(base64Image)).blob();
      const selfie = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
      setSelfieFile(selfie);
      // saveFilesToStorage(); // Removed as per edit hint

      const formData = new FormData();
      formData.append('selfieImage', selfie);

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/user-verification/submit-documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to submit selfie');
      setShowSubmitSelfie(false);
      setCurrentStep(currentStep + 1);
    } catch (error: any) {
      setErrors({ selfie: error.message || 'Failed to submit selfie. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler for retaking the selfie (works for both preview and confirmed)
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

  // Update handleDocumentStepNext to store verification id
  const handleDocumentStepNext = async () => {
    if (currentStep !== 2) return;
    if (!documentFile) {
      setErrors({ document: 'Please upload a document image.' });
      return;
    }
    setIsProcessing(true);
    setErrors({});
    try {
      const formData = new FormData();
      formData.append('verificationType', verificationData.documentType);
      const extracted = verificationData.ocrResults?.extractedData || {};
      if (extracted.documentNumber) formData.append('documentNumber', extracted.documentNumber);
      if (extracted.addressLine) formData.append('addressLine', extracted.addressLine);
      if (extracted.city) formData.append('city', extracted.city);
      if (extracted.country) formData.append('country', extracted.country);
      if (extracted.district) formData.append('district', extracted.district);
      formData.append('documentImage', documentFile);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/v1/user-verification/submit-documents', {
        method: 'POST',
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const result = await response.json();
      if (!response.ok) {
        const errorData = result;
        throw new Error(errorData.message || 'Failed to submit document');
      }
      // Store verification id in localStorage
      if (result?.data?.verification?.id) {
        localStorage.setItem('verificationId', result.data.verification.id);
      }
      setToast('Document uploaded successfully!');
      setTimeout(() => setToast(null), 2000);
      setCurrentStep(currentStep + 1);
    } catch (error: any) {
      setErrors({ api: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // Add selfie step handler to PATCH selfie image
  const handleSelfieStepNext = async () => {
    if (currentStep !== 3) return;
    if (!selfieFile) {
      setErrors({ selfie: 'Please capture a selfie image.' });
      return;
    }
    setIsProcessing(true);
    setErrors({});
    try {
      const verificationId = localStorage.getItem('verificationId');
      if (!verificationId) throw new Error('Verification ID not found. Please restart the process.');
      const formData = new FormData();
      formData.append('selfieImage', selfieFile);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/v1/user-verification/${verificationId}`, {
        method: 'PUT',
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update verification with selfie');
      }
      setToast('Selfie uploaded successfully!');
      setTimeout(() => setToast(null), 2000);
      setCurrentStep(currentStep + 1);
    } catch (error: any) {
      setErrors({ api: error.message });
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
    if (currentStep === 3 && documentFile && selfieFile) {
      await processDocumentOCR(documentFile, selfieFile);
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(currentStep + 1);
    }
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

  // Verify phone number
  const verifyPhone = () => {
    if (verificationData.phoneNumber.length >= 10) {
      simulateAIProcessing(2000);
      setTimeout(() => {
        setCurrentStep(5);
      }, 2000);
    } else {
      setErrors({ phone: 'Please enter a valid phone number' });
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
  reviewData, setReviewData] = useState({
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

  // Handler for editing review fields
  const handleReviewChange = (field: string, value: string) => {
    setReviewData(prev => ({ ...prev, [field]: value }));
  };

  // Validate verification data before submission
  const validateVerificationData = () => {
    const errors: Record<string, string> = {};
    
    if (!verificationData.documentImage && !documentFile) {
      errors.documentFile = 'Document image is missing. Please upload or take a photo of your document.';
    }
    
    if (!verificationData.selfieImage && !selfieFile) {
      errors.selfieFile = 'Selfie image is missing. Please take a selfie photo.';
    }
    
    if (!verificationData.documentType) {
      errors.documentType = 'Document type is not selected.';
    }
    
    return errors;
  };

  // Normalize document type for backend
  const normalizeDocumentType = (docType: string): string => {
    const typeMap: Record<string, string> = {
      'National ID': 'national_id',
      'Passport': 'passport',
      'Driving License': 'driving_license',
      'Huduma Namba': 'huduma_namba',
      'Voter ID': 'voter_id'
    };
    return typeMap[docType] || docType.toLowerCase().replace(/\s+/g, '_');
  };

  // Handler for final submit
  // console.log(localStorage.getItem('document_image'),'document_image')
  const handleFinalSubmit = async () => {
    try {
      setIsProcessing(true);
      setErrors({});
      const validationErrors = validateVerificationData();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
      let docFileToSend: File | null = null;
      const documentImageBase64 = localStorage.getItem('document_image');
      if (documentImageBase64) {
        const blob = await (await fetch(documentImageBase64)).blob();
        docFileToSend = new File([blob], 'document.jpg', { type: 'image/jpeg' });
      }
      let selfieFileToSend: File | null = null;
      if (verificationData.selfieImage) {
        const blob = await (await fetch(verificationData.selfieImage)).blob();
        selfieFileToSend = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
      }
      if (!docFileToSend || docFileToSend.size === 0) {
        setErrors({ api: 'Document image is missing or invalid.' });
        setIsProcessing(false);
        return;
      }
      if (!selfieFileToSend || selfieFileToSend.size === 0) {
        setErrors({ api: 'Selfie image is missing or invalid.' });
        setIsProcessing(false);
        return;
      }
      let verificationType = verificationData.documentType || 'national_id';
      if (!verificationType || verificationType.trim() === '') {
        verificationType = 'national_id';
      }
      verificationType = normalizeDocumentType(verificationType);
      const formData = new FormData();
      formData.append('verificationType', verificationType);
      formData.append('documentNumber', reviewData.documentNumber || '');
      formData.append('addressLine', reviewData.addressLine || '');
      formData.append('city', reviewData.city || '');
      formData.append('country', reviewData.country || '');
      formData.append('district', reviewData.district || '');
      formData.append('selfieImage', selfieFileToSend);
      formData.append('documentImage', docFileToSend);
      console.log(formData,'form data')
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/user-verification/submit-documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json();
      // Remove from localStorage after successful submission
      localStorage.removeItem('document_image');
      setCurrentStep(currentStep + 1);
    } catch (error: any) {
      setErrors({ api: error.message || 'Failed to submit verification. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Add toast state
  const [toast, setToast] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">UrutiBz</h1>
                <p className="text-sm text-gray-500">Identity Verification</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Bank-level security</span>
              </div>
              {/* {currentStep > 0 && ( // Removed as per edit hint
                <button
                  onClick={resetVerification}
                  className="text-red-600 hover:text-red-700 transition-colors"
                  title="Start over"
                >
                  Reset
                </button>
              )} */}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      index <= currentStep
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'border-gray-300 text-gray-400'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-4 h-4" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${
                        index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`text-xs ${
                  index <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-400'
                }`}
                style={{ width: `${100 / steps.length}%` }}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* {hasExistingData && ( // Removed as per edit hint
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Info className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-medium">
                  Found existing verification data. You can continue where you left off or start over.
                </span>
              </div>
              <button
                onClick={resetVerification}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Start Over
              </button>
            </div>
          </div>
        )} */}
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
              verificationData={verificationData}
              showCamera={showCamera}
              setCameraMode={setCameraMode}
              startCamera={startCamera}
              capturedSelfie={capturedSelfie}
              handleRetakeSelfie={handleRetakeSelfie}
              nextStep={nextStep}
              errors={errors}
              setCapturedSelfie={setCapturedSelfie}
              onConfirmSelfie={handleConfirmSelfie}
              onSubmitSelfie={handleSubmitSelfie}
              showSubmitSelfie={showSubmitSelfie}
              isProcessing={isProcessing}
            />
          )}
          {currentStep === 4 && (
            <PhoneStep
              verificationData={verificationData}
              setVerificationData={setVerificationData}
              verifyPhone={verifyPhone}
              errors={errors}
            />
          )}
          {currentStep === 5 && (
            <ReviewAndSubmitStep
              extractedData={reviewData}
              documentImage={verificationData.documentImage}
              selfieImage={verificationData.selfieImage}
              isProcessing={isProcessing}
              errors={{
                ...errors,
                ...(documentFile ? {} : { documentFile: 'Document file is missing and will not be submitted!' })
              }}
              onChange={handleReviewChange}
              onSubmit={handleFinalSubmit}
            />
          )}
          {currentStep === 6 && <CompletionStep verificationData={verificationData} />}
        </div>

        {/* Navigation */}
        {currentStep > 0 && currentStep < 6 && (
          <div className="flex justify-between mt-6">
            <button
              onClick={prevStep}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            
            {currentStep < 5 && (
              <button
                onClick={handleNextStep}
                disabled={
                  (currentStep === 2 && !verificationData.documentImage) ||
                  (currentStep === 3 && !verificationData.selfieImage) ||
                  (currentStep === 4 && !verificationData.ocrResults)
                }
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>🔒 SSL Encrypted</span>
              <span>🛡️ GDPR Compliant</span>
              <span>🤖 AI-Powered</span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <a href="#" className="text-gray-600 hover:text-gray-800">Privacy Policy</a>
              <a href="#" className="text-gray-600 hover:text-gray-800">Terms of Service</a>
              <a href="#" className="text-gray-600 hover:text-gray-800">Support</a>
            </div>
          </div>
        </div>
      </div>
      {/* Toast notification */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, left: 0, right: 0, zIndex: 9999, display: 'flex', justifyContent: 'center' }}>
          <div className="bg-green-600 text-white px-6 py-3 rounded shadow-lg font-semibold animate-fade-in">
            {toast}
          </div>
        </div>
      )}
      {/* Loading message */}
      {isProcessing && (
        <div style={{ position: 'fixed', top: 70, left: 0, right: 0, zIndex: 9998, display: 'flex', justifyContent: 'center' }}>
          <div className="bg-blue-600 text-white px-6 py-3 rounded shadow font-medium animate-pulse">
            Uploading document, please wait...
          </div>
        </div>
      )}
    </div>
  );
};

export default UrutiBzVerification;