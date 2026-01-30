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
import EmailStep from './components/EmailStep';
import CompletionStep from './components/CompletionStep';
import AddressStep from './components/AddressStep';
import LocationPermissionDialog from '../../components/LocationPermissionDialog';
import { useToast } from '../../contexts/ToastContext';
import { Link } from 'react-router-dom';

import Tesseract from 'tesseract.js';
import { submitDocumentStep, submitSelfieStep, requestPhoneOtp, verifyPhoneOtp } from './service/api';
import { requestEmailOtp, verifyEmailOtp } from './service/verifications';
import { updateUser, API_BASE_URL } from '../my-account/service/api';
import axios from 'axios';


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
    // Look for Amazina (Names) - can be on same line or next line
    if (/Amazina/i.test(lines[i])) {
      // Check if name is on same line after "Amazina"
      const nameMatch = lines[i].match(/Amazina[:\s]*([A-Za-z\s]+)/i);
      if (nameMatch && nameMatch[1]) {
        name = nameMatch[1].trim();
      } else {
        name = lines[i + 1] || '';
      }
    }
    // Look for Itariki yavutseho (Date of Birth)
    if (/Itariki.*yavutseho/i.test(lines[i])) {
      const dobMatch = lines[i].match(/Itariki.*yavutseho[:\s]*([0-9\/\-\.\s]+)/i);
      if (dobMatch && dobMatch[1]) {
        dateOfBirth = dobMatch[1].trim();
      } else {
        dateOfBirth = lines[i + 1] || '';
      }
    }
    // Look for Igitsina (Sex) - can contain district info
    if (/Igitsina/i.test(lines[i])) {
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
    // Look for Indangamuntu / National ID No.
    if (/Indangamuntu.*National.*ID/i.test(lines[i])) {
      // Extract ID number from same line or next line
      const idMatch = lines[i].match(/Indangamuntu.*National.*ID.*No[:\s]*([0-9\s\.]+)/i);
      if (idMatch && idMatch[1]) {
        // Keep spaces in ID number as they are part of the format
        documentNumber = idMatch[1].trim();
      } else {
        documentNumber = lines[i + 1] || '';
      }
    }
    // Fallback: look for any long number pattern that could be an ID
    if (!documentNumber) {
      const numberMatch = lines[i].match(/([0-9\s]{12,})/);
      if (numberMatch && numberMatch[1]) {
        documentNumber = numberMatch[1].trim();
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

// Generic extractor to be used if country-specific one fails
function extractGenericFields(rawText: string, countryCode: string) {
  const text = (rawText || '').replace(/\r/g, '');
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let name: string | undefined;
  
  // Look for name patterns - try multiple approaches
  const nameIdx = lines.findIndex(l => /(AMAZINA|NAMES|NAME)/i.test(l));
  if (nameIdx >= 0 && lines[nameIdx + 1]) {
    name = lines[nameIdx + 1].replace(/^[^A-Z]*:/i, '').trim();
  }
  
  // Fallback: look for any line with 2+ words that could be a name
  if (!name) {
    const cand = lines.find(l => /[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(l) && l.length <= 40 && !/[0-9]/.test(l));
    if (cand) name = cand.trim();
  }
  
  // Extract date of birth
  let dob = (text.match(/(\d{2})[\/-](\d{2})[\/-](\d{4})/) || [])[0];
  
  // Extract document number - handle spaced format for Rwanda
  const allDigits = text.replace(/[^0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  
  let documentNumber = allDigits[0] || '';
  
  // For Rwanda, try to reconstruct the spaced ID format
  if (countryCode === 'RW' && documentNumber && documentNumber.length < 12) {
    // Look for the spaced pattern in original text
    const spacedMatch = text.match(/([0-9\s]{12,})/);
    if (spacedMatch) {
      documentNumber = spacedMatch[1].trim();
    } else if (allDigits[1]) {
      documentNumber = (documentNumber + allDigits[1]).replace(/\s+/g, '');
    }
  }
  
  return { name, dateOfBirth: dob, documentNumber };
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
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStage, setProcessingStage] = useState('');
  
  // Simple cache to avoid reprocessing the same image
  const [processedImagesCache, setProcessedImagesCache] = useState<Map<string, any>>(new Map());
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [aiProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [hasAddress, setHasAddress] = useState(false);
  const [selfieRejected, setSelfieRejected] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  
  // Phone and Email verification states
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [email, setEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');

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

  // Detect if user already has address details and verification status
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        const has = Boolean(
          u?.street_address || u?.city || u?.state_province || u?.country ||
          (u?.location && (u.location.lat != null && u.location.lng != null))
        );
        setHasAddress(has);
        
        // Check verification status
        setPhoneVerified(Boolean(u?.phone_verified));
        setEmailVerified(Boolean(u?.email_verified));
      }
    } catch {}
  }, []);

  // Fetch existing verification documents to skip steps if already provided
  useEffect(() => {
    (async () => {
      try {
        setIsInitialLoading(true);
        const token = localStorage.getItem('token');
        if (!token) return;
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.sub || payload.userId || payload.id;
        if (!userId) return;
        const res = await axios.get(`${API_BASE_URL}/users/${userId}/verifications/documents`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = res.data?.data?.verifications || [];
        // Consider only National ID verifications; prefer entries that have both document & selfie
        const nationalOnly = Array.isArray(list)
          ? list.filter((v: any) => {
              const t = (v?.verification_type || '').toString().toLowerCase();
              return t === 'national id' || t === 'national_id' || t === 'nationalid' || t === 'national-id';
            })
          : [];

        // Sort ascending and take the last as the latest chronologically
        const sortedAsc = [...nationalOnly].sort((a: any, b: any) => {
          const ta = new Date(a?.submitted_at || 0).getTime();
          const tb = new Date(b?.submitted_at || 0).getTime();
          return ta - tb;
        });

        const latest = sortedAsc.length > 0 ? sortedAsc[sortedAsc.length - 1] : null;
        const status = (latest?.verification_status || '').toLowerCase();
        const rejected = status === 'rejected';
        setSelfieRejected(rejected);
      } catch (e) {
        // ignore fetch errors; user may not have any verification record yet
      } finally {
        setIsInitialLoading(false);
      }
    })();
  }, []);

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
    { id: 1, title: 'Address Details', icon: Home, description: 'Confirm your address' },
    { id: 2, title: 'Document Type', icon: FileText, description: 'Select your ID document' },
    { id: 3, title: 'Upload Document', icon: Upload, description: 'Scan your ID with AI' },
    { id: 4, title: 'Selfie Verification', icon: User, description: 'Take a verification selfie' },
    { id: 5, title: 'Phone Verification', icon: Smartphone, description: 'Verify your phone number' },
    { id: 6, title: 'Email Verification', icon: Smartphone, description: 'Verify your email' },
    { id: 7, title: 'Complete', icon: Award, description: 'Verification successful' }
  ];

  const countries = [
    { code: 'RW', name: 'Rwanda', flag: '🇷🇼', documents: ['National ID', 'Passport', 'Driving License'] },
    { code: 'KE', name: 'Kenya', flag: '🇰🇪', documents: ['National ID', 'Passport', 'Huduma Namba'] },
    { code: 'UG', name: 'Uganda', flag: '🇺🇬', documents: ['National ID', 'Passport', 'Driving License'] },
    { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', documents: ['National ID', 'Passport', 'Voter ID'] }
  ];

  const { showToast } = useToast();
  
  // Phone verification handlers
  const handleRequestOtp = async () => {
    if (!verificationData.phoneNumber) {
      showToast('Please enter a phone number', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await requestPhoneOtp(verificationData.phoneNumber, token);
      setShowOtpInput(true);
      showToast('OTP sent to your phone', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to send OTP', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      showToast('Please enter the OTP', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await verifyPhoneOtp(verificationData.phoneNumber, otp, token);
      setPhoneVerified(true);
      showToast('Phone number verified successfully!', 'success');
      nextStep();
    } catch (error: any) {
      showToast(error.message || 'Failed to verify OTP', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Email verification handlers
  const handleRequestEmailOtp = async () => {
    if (!email) {
      showToast('Please enter an email address', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await requestEmailOtp(email, token);
      showToast('OTP sent to your email', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to send email OTP', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp) {
      showToast('Please enter the email OTP', 'error');
      return;
    }
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      await verifyEmailOtp(email, emailOtp, token);
      setEmailVerified(true);
      showToast('Email verified successfully!', 'success');
      nextStep();
    } catch (error: any) {
      showToast(error.message || 'Failed to verify email OTP', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Very lightweight country/type heuristics to validate the image contents
  function validateDocumentByCountry(documentType: string, countryCode: string, ocrText: string): { ok: boolean; reason?: string } {
    const text = (ocrText || '').toUpperCase().replace(/\s+/g, ' ');
    const type = (documentType || '').toLowerCase();
    // Generic passports: look for MRZ marker or the word PASSPORT
    if (type.includes('passport')) {
      if (text.includes('P<') || /PASSPORT/.test(text)) return { ok: true };
      return { ok: false, reason: 'Passport markers not detected' };
    }
    // Driving license generic cue
    if (type.includes('driving')) {
      if (/DRIV(ING)? LICEN[CS]E/.test(text)) return { ok: true };
      // fallback: require at least 2 labels typical of licenses
      if (/CLASS|CATEGORY|ISSUE|EXPIRY/.test(text)) return { ok: true };
      return { ok: false, reason: 'Driving license labels not detected' };
    }
    // National ID: country-specific simple patterns
    if (type.includes('national')) {
      switch (countryCode) {
        case 'RW': {
          // Rwanda National ID: Check for spaced format like "1 2002 8 0081987 0 69"
          const spacedIdMatch = text.match(/([0-9\s]{12,})/);
          if (spacedIdMatch) {
            const digits = spacedIdMatch[1].replace(/[^0-9]/g, '');
            if (digits.length >= 12) return { ok: true };
          }
          // Also check for continuous digits
          const digits = text.replace(/[^0-9]/g, '');
          if (digits.length >= 12) return { ok: true };
          // Accept presence of local labels
          if (/INDANGAMUNTU|REPUBLIC OF RWANDA|REPUBLIK|RWANDA|REPUBULIKA Y'U RWANDA/.test(text)) return { ok: true };
          return { ok: false, reason: 'Rwanda ID markers not detected' };
        }
        case 'KE': {
          // Kenya ID often 7–8 digits
          if (/\b\d{7,8}\b/.test(text)) return { ok: true };
          return { ok: false, reason: 'Kenya ID should contain 7–8 digits' };
        }
        case 'UG':
        case 'TZ': {
          // Basic: require a long number (8+)
          if (/\b\d{8,}\b/.test(text)) return { ok: true };
          return { ok: false, reason: 'National ID number pattern not detected' };
        }
      }
    }
    // Fallback generic: must contain at least one long number and uppercase words
    if (/\d{6,}/.test(text) && /[A-Z]{2,}/.test(text)) return { ok: true };
    return { ok: false, reason: 'Document-like patterns not detected' };
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    // Basic file type/size validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Please upload a valid document photo (JPEG/PNG/HEIC).', 'error');
      return;
    }
    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      showToast('File is too large. Max 10MB.', 'error');
      return;
    }
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStage('Preparing image...');
    setErrors({});
    setDocumentFile(file);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageDataUrl = e.target?.result as string;
      
      // Check cache first to avoid reprocessing
      const imageHash = imageDataUrl.substring(0, 100); // Simple hash based on first 100 chars
      if (processedImagesCache.has(imageHash)) {
        const cachedResult = processedImagesCache.get(imageHash);
        setVerificationData(prev => ({
          ...prev,
          documentImage: imageDataUrl,
          ocrResults: cachedResult
        }));
        setIsProcessing(false);
        showToast('Document processed successfully!', 'success');
        return;
      }
      
      // Heuristic checks to reduce non-document images
      try {
        const img = new Image();
        img.src = imageDataUrl;
        await new Promise((res, rej) => { img.onload = () => res(null); img.onerror = rej; });
        const aspect = img.width / img.height;
        // Reject extreme aspect ratios unlikely for IDs/passports
        if (aspect < 0.4 || aspect > 3.0) {
          setIsProcessing(false);
          showToast('Photo does not look like a document. Please upload a clear document image.', 'error');
          return;
        }
        // Optimized preprocessing: reduce image size for faster OCR
        const maxW = 800; // Reduced from 1600 for faster processing
        const scale = Math.min(1, maxW / img.width) || 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // Simplified preprocessing - just resize, skip heavy threshold processing
          // The OCR engine handles grayscale conversion internally
        }
        // Use preprocessed image if available
        (window as any).__ocrSource = canvas.toDataURL('image/jpeg', 0.8); // JPEG with compression for speed
        setProcessingProgress(20);
        setProcessingStage('Image prepared, starting OCR...');
      } catch {}
      // Run OCR
      try {
        const pre = (window as any).__ocrSource as string | undefined;
        let ocrResult;
        
        // Optimized OCR configuration for speed
        try {
          // Use English only for faster processing, add other languages only if needed
          ocrResult = await Tesseract.recognize(pre || imageDataUrl, 'eng');
        } catch (engError) {
          console.warn('English-only OCR failed, trying with multiple languages:', engError);
          // Fallback to multiple languages if English-only fails
          try {
            ocrResult = await Tesseract.recognize(pre || imageDataUrl, 'eng+fra+kin');
          } catch (kinError) {
            console.warn('Multi-language OCR failed, falling back to English+French:', kinError);
            ocrResult = await Tesseract.recognize(pre || imageDataUrl, 'eng+fra');
          }
        }
        
        const { data: { text } } = ocrResult;
        
        setProcessingProgress(80);
        setProcessingStage('Validating document...');
        
        // Debug: Log OCR results for troubleshooting
        console.log('OCR Extracted Text:', text);
        console.log('Text Length:', text?.length || 0);
        
        // Quick content validation: expect some digits and uppercase letters typical for IDs
        const hasDigits = /\d{3,}/.test(text || '');
        const hasWords = /[A-Z]{2,}/.test((text || '').toUpperCase());
        
        console.log('OCR Validation - Has Digits:', hasDigits, 'Has Words:', hasWords);
        
        if (!hasDigits || !hasWords) {
          throw new Error('Not enough document-like text detected');
        }
        // Country/type specific validation
        const countryCheck = validateDocumentByCountry(verificationData.documentType, selectedCountry, text);
        console.log('Country Validation:', countryCheck);
        
        if (!countryCheck.ok) {
          throw new Error(countryCheck.reason || 'Document does not match the selected country/type');
        }
        let extracted: any = extractRwandaIDFields(text);
        console.log('Rwanda ID Extraction Result:', extracted);
        
        // For Rwanda, be more lenient with validation - check if we got any meaningful data
        const hasValidData = extracted?.name?.length >= 2 || 
                           extracted?.documentNumber?.length >= 8 || 
                           extracted?.dateOfBirth || 
                           extracted?.sex;
        
        console.log('Has Valid Data:', hasValidData);
        
        if (!hasValidData) {
          extracted = extractGenericFields(text, selectedCountry);
          console.log('Generic Extraction Result:', extracted);
        }
        // If Rwanda, also try to parse date (dd/mm/yyyy or dd-mm-yyyy)
        if (selectedCountry === 'RW' && (!extracted.dateOfBirth || extracted.dateOfBirth === '')) {
          const dobMatch = text.match(/(\d{2})[\/-](\d{2})[\/-](\d{4})/);
          if (dobMatch) {
            (extracted as any).dateOfBirth = `${dobMatch[1]}/${dobMatch[2]}/${dobMatch[3]}`;
          }
        }
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
        
        console.log('Document processed successfully, documentImage set:', !!imageDataUrl);
        
        // Cache the result for future use
        setProcessedImagesCache(prev => {
          const newCache = new Map(prev);
          newCache.set(imageHash, {
            extractedData: extracted
          });
          return newCache;
        });
        
        setProcessingProgress(100);
        setProcessingStage('Complete!');
        showToast('Document uploaded and processed successfully!', 'success');
      } catch (err) {
        console.error('OCR Processing Error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setErrors({ api: `OCR failed: ${errorMessage}. Please try again or enter details manually.` });
        
        // More specific error messages based on the error type
        if (errorMessage.includes('Not enough document-like text detected')) {
          showToast('Document text is not clear enough for processing. Please ensure the document is well-lit and all text is readable.', 'error');
        } else if (errorMessage.includes('Rwanda ID markers not detected')) {
          showToast('Rwanda ID markers not found. Please ensure you selected "Rwanda" as the country and uploaded a valid Rwanda National ID.', 'error');
        } else if (errorMessage.includes('Document does not match')) {
          showToast('Document does not match the selected type. Please verify your document type and country selection.', 'error');
        } else {
          showToast('Failed to detect a valid document. Please upload a clearer document photo.', 'error');
        }
      } finally {
        setIsProcessing(false);
        setProcessingProgress(0);
        setProcessingStage('');
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
    setSelfieRejected(false); // Reset rejection state when retaking
    setShowCamera(true);
    setCameraMode('selfie');
    setShowSubmitSelfie(false);
  };

  // Replace handleDocumentStepNext
  const handleDocumentStepNext = async () => {
    if (currentStep !== 3) return;
    
    // Check if we have either a document file or a processed document image
    if (!documentFile && !verificationData.documentImage) {
      setErrors({ document: 'Please upload a document image.' });
      return;
    }
    
    setIsProcessing(true);
    setErrors({});
    try {
      const token = localStorage.getItem('token');
      const extracted = verificationData.ocrResults?.extractedData || {};
      
      // If we have a documentFile, use it; otherwise, we need to create a file from the image
      let fileToSubmit = documentFile;
      
      if (!fileToSubmit && verificationData.documentImage) {
        // Convert base64 image to File
        const response = await fetch(verificationData.documentImage);
        const blob = await response.blob();
        fileToSubmit = new File([blob], 'document.jpg', { type: 'image/jpeg' });
      }
      
      if (!fileToSubmit) {
        throw new Error('No document file available for submission');
      }
      
      const result = await submitDocumentStep(fileToSubmit, verificationData.documentType, extracted, token);
      if (result?.data?.verification?.id) {
        localStorage.setItem('verificationId', result.data.verification.id);
      }
      showToast('Document uploaded successfully!', 'success');
      console.log('Document step completed, advancing to step:', currentStep + 1);
      console.log('Current verificationData:', verificationData);
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
    if (currentStep !== 4) return;
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
      // Refetch latest verifications to respect rejection gating
      try {
        const payload = token ? JSON.parse(atob(token.split('.')[1])) : {};
        const userId = payload.sub || payload.userId || payload.id;
        if (userId) {
          const res = await axios.get(`${API_BASE_URL}/users/${userId}/verifications/documents`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const list = res.data?.data?.verifications || [];
          const nationalOnly = Array.isArray(list)
            ? list.filter((v: any) => {
                const t = (v?.verification_type || '').toString().toLowerCase();
                return t === 'national id' || t === 'national_id' || t === 'nationalid' || t === 'national-id';
              })
            : [];
          const sortedAsc = [...nationalOnly].sort((a: any, b: any) => {
            const ta = new Date(a?.submitted_at || 0).getTime();
            const tb = new Date(b?.submitted_at || 0).getTime();
            return ta - tb;
          });
          const latest = sortedAsc.length > 0 ? sortedAsc[sortedAsc.length - 1] : null;
          const status = (latest?.verification_status || '').toLowerCase();
          if (status === 'rejected') {
            setSelfieRejected(true);
            showToast('Selfie was rejected by the system. Please retake a selfie to continue.', 'error');
            return; // do not advance
          }
          setSelfieRejected(false);
        }
      } catch {}
      // Only show success and advance if not rejected
      showToast('Selfie uploaded successfully!', 'success');
      setCurrentStep(currentStep + 1);
    } catch (error: any) {
      setErrors({ api: error.message });
      showToast('Failed to upload selfie. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Update handleNextStep to handle all steps properly
  const handleNextStep = async () => {
    console.log('handleNextStep called, currentStep:', currentStep);
    console.log('verificationData.documentImage:', !!verificationData.documentImage);
    console.log('documentFile:', !!documentFile);
    
    // Step 0: Welcome - just proceed
    if (currentStep === 0) {
      nextStep();
      return;
    }
    
    // Step 1: Address Details - skip if user has address, otherwise proceed
    if (currentStep === 1) {
      if (hasAddress) {
        nextStep(); // Skip to step 2
      } else {
        await submitAddress();
      }
      return;
    }
    
    // Step 2: Document Type - validate selection
    if (currentStep === 2) {
      if (!verificationData.documentType || String(verificationData.documentType).trim() === '') {
        setErrors({ documentType: 'Please select a document type.' });
        showToast('Please select a document type to continue.', 'error');
        return;
      }
      nextStep();
      return;
    }
    
    // Step 3: Document Upload - handle document submission
    if (currentStep === 3) {
      // Check if document has been processed successfully
      if (verificationData.documentImage || documentFile) {
        await handleDocumentStepNext();
      } else {
        showToast('Please upload and process a document first.', 'error');
      }
      return;
    }
    
    // Step 4: Selfie Verification - handle selfie submission
    if (currentStep === 4) {
      // Block progression if selfie was rejected
      if (selfieRejected) {
        showToast('Your last selfie was rejected. Please retake a selfie to continue.', 'error');
        return;
      }
      await handleSelfieStepNext();
      return;
    }
    
    // Step 5: Phone Verification - proceed if phone is verified
    if (currentStep === 5) {
      nextStep();
      return;
    }
    
    // Step 6: Email Verification - validate email verification
    if (currentStep === 6) {
      if (!emailVerified) {
        showToast('Please verify your email to continue.', 'error');
        return;
      }
      nextStep();
      return;
    }
    
    // Default: just proceed to next step
    nextStep();
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

  // Address form state
  const [addressForm, setAddressForm] = useState({
    firstName: '',
    lastName: '',
    date_of_birth: '',
    gender: '',
    street_address: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: '',
    location_lat: '',
    location_lng: '',
  });

  const checkLocationPermission = async () => {
    if (!navigator.permissions) {
      return 'unknown';
    }
    
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state; // 'granted', 'denied', or 'prompt'
    } catch (error) {
      console.warn('Could not check geolocation permission:', error);
      return 'unknown';
    }
  };

  // Force location access with multiple fallback methods
  const forceLocationAccess = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by this browser.', 'error');
      return;
    }

    showToast('Forcing location access...', 'info');

    // Method 1: High accuracy, no cache, long timeout
    const highAccuracyOptions = {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0
    };

    // Method 2: Lower accuracy, shorter timeout as fallback
    const fallbackOptions = {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 60000 // 1 minute cache
    };

    let attemptCount = 0;
    const maxAttempts = 3;

    const tryGetLocation = (options: PositionOptions, method: string) => {
      attemptCount++;
      console.log(`Attempting location access (${method}, attempt ${attemptCount})`);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`Location obtained: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
          
          setAddressForm(prev => ({ 
            ...prev, 
            location_lat: String(latitude), 
            location_lng: String(longitude) 
          }));
          
          showToast(`Location detected! Accuracy: ${Math.round(accuracy)}m`, 'success');
        },
        (error) => {
          console.error(`Location error (${method}, attempt ${attemptCount}):`, error);
          
          if (error.code === error.PERMISSION_DENIED) {
            if (attemptCount === 1) {
              // First attempt denied, show dialog
              setShowLocationDialog(true);
            } else {
              showToast('Location access denied. Please enable location permissions.', 'error');
            }
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            if (attemptCount < maxAttempts) {
              // Try with fallback options
              setTimeout(() => tryGetLocation(fallbackOptions, 'fallback'), 2000);
              showToast(`Location unavailable, trying alternative method... (${attemptCount}/${maxAttempts})`, 'info');
            } else {
              showToast('Unable to determine location. Please check your GPS settings.', 'error');
            }
          } else if (error.code === error.TIMEOUT) {
            if (attemptCount < maxAttempts) {
              // Retry with same options
              setTimeout(() => tryGetLocation(options, method), 1000);
              showToast(`Location timeout, retrying... (${attemptCount}/${maxAttempts})`, 'info');
            } else {
              showToast('Location request timed out. Please try again.', 'error');
            }
          } else {
            showToast('Location error. Please try again or enter manually.', 'error');
          }
        },
        options
      );
    };

    // Start with high accuracy method
    tryGetLocation(highAccuracyOptions, 'high-accuracy');
  };

  const useCurrentLocation = forceLocationAccess;

  const submitAddress = async () => {
    try {
      // Validate required address fields
      const fieldErrors: Record<string, string> = {};
      const requiredFields: Array<keyof typeof addressForm> = [
        'firstName', 'lastName', 'street_address', 'city', 'state_province', 'country'
      ];
      requiredFields.forEach((k) => {
        const v = (addressForm as any)[k];
        if (!v || String(v).trim() === '') fieldErrors[k] = 'Required';
      });
      // Latitude/Longitude validation (both or none)
      const hasLat = addressForm.location_lat.trim() !== '';
      const hasLng = addressForm.location_lng.trim() !== '';
      if (hasLat !== hasLng) {
        fieldErrors['location_lat'] = 'Provide both latitude and longitude or leave both empty';
        fieldErrors['location_lng'] = 'Provide both latitude and longitude or leave both empty';
      }
      if (hasLat && hasLng) {
        const lat = Number(addressForm.location_lat);
        const lng = Number(addressForm.location_lng);
        if (Number.isNaN(lat) || lat < -90 || lat > 90) fieldErrors['location_lat'] = 'Invalid latitude';
        if (Number.isNaN(lng) || lng < -180 || lng > 180) fieldErrors['location_lng'] = 'Invalid longitude';
      }
      if (Object.keys(fieldErrors).length) {
        setErrors(fieldErrors);
        showToast('Please fill required address fields correctly.', 'error');
        return;
      }
      setIsProcessing(true);
      const token = localStorage.getItem('token') || '';
      const payload: any = {
        firstName: addressForm.firstName || undefined,
        lastName: addressForm.lastName || undefined,
        date_of_birth: addressForm.date_of_birth || undefined,
        gender: addressForm.gender || undefined,
        street_address: addressForm.street_address || undefined,
        city: addressForm.city || undefined,
        state_province: addressForm.state_province || undefined,
        postal_code: addressForm.postal_code || undefined,
        country: addressForm.country || undefined,
        location: (addressForm.location_lat && addressForm.location_lng)
          ? { lat: Number(addressForm.location_lat), lng: Number(addressForm.location_lng) }
          : undefined,
      };
      const userStr = localStorage.getItem('user');
      const userId = userStr ? (JSON.parse(userStr)?.id || JSON.parse(userStr)?.user?.id) : undefined;
      if (!userId) throw new Error('Missing user');
      const res = await updateUser(userId, payload, token);
      if (!res.success) throw new Error(res.error || 'Failed to update');
      // Cache merge
      try {
        if (userStr) {
          const u = JSON.parse(userStr);
          const merged = { ...u, ...payload, location: payload.location || u.location };
          localStorage.setItem('user', JSON.stringify(merged));
        }
      } catch {}
      showToast('Address details saved', 'success');
      setCurrentStep(currentStep + 1);
    } catch (e: any) {
      showToast(e.message || 'Failed to save address', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      let next = currentStep + 1;
      // Skip address step if user already has address
      if (next === 1 && hasAddress) {
        next = 2;
      }
      setCurrentStep(next);
      setErrors({});
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      let prev = currentStep - 1;
      // Skip address step when navigating backwards if user already has address
      if (prev === 1 && hasAddress) {
        prev = 0;
      }
      setCurrentStep(prev);
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
      stateProvince: '',
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
        stateProvince: (extracted as any).stateProvince || '',
      });
    }
  }, [verificationData.ocrResults]);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">

      <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700">
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
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="">Back to Home</span>
            </Link>
            <div className="text-right">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                Step {currentStep + 1} of {steps.length}
              </span>
              <div className="text-sm text-gray-500 dark:text-slate-400">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto md:overflow-visible py-2">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              return (
                <div key={step.id} className="flex items-center flex-1 min-w-[68px] group relative pr-2">
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

          <div className="flex justify-between mt-2 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              return (
                <div
                  key={step.id}
                  className={`text-[10px] md:text-xs whitespace-nowrap pr-3 md:pr-4 tracking-wide ${isCompleted ? 'text-[#01aaa7] font-medium' : isActive ? 'text-[#01aaa7] font-medium' : 'text-gray-400 dark:text-slate-500'}`}
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

        {isInitialLoading && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
            <svg className="animate-spin h-10 w-10 text-[#01aaa7] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <div className="text-gray-700 dark:text-slate-300">Loading your verification progress…</div>
          </div>
        )}

        {!isInitialLoading && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100 dark:border-slate-700">
          {(() => { console.log('Rendering step:', currentStep); return null; })()}
          {currentStep === 0 && <WelcomeStep nextStep={nextStep} />}
          {currentStep === 1 && (
            <AddressStep
              addressForm={addressForm}
              setAddressForm={setAddressForm}
              errors={errors}
              onUseCurrentLocation={useCurrentLocation}
            />
          )}
          {currentStep === 2 && (
            <DocumentTypeStep
              countries={countries}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              setVerificationData={setVerificationData}
              nextStep={nextStep}
              errors={errors}
            />
          )}
          {currentStep === 3 && (
            <DocumentUploadStep
              verificationData={verificationData}
              fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
              handleFileUpload={handleFileUpload}
              setCameraMode={setCameraMode}
              startCamera={startCamera}
              isProcessing={isProcessing}
              aiProgress={aiProgress}
              processingProgress={processingProgress}
              processingStage={processingStage}
              nextStep={nextStep}
              confirmDocument={async () => {
                try {
                  if (!documentFile && !verificationData.documentImage) return nextStep();
                  setIsProcessing(true);
                  const token = localStorage.getItem('token');
                  const extracted = verificationData.ocrResults?.extractedData || {};
                  
                  // If we have a documentFile, use it; otherwise, create a file from the image
                  let fileToSubmit = documentFile;
                  if (!fileToSubmit && verificationData.documentImage) {
                    const response = await fetch(verificationData.documentImage);
                    const blob = await response.blob();
                    fileToSubmit = new File([blob], 'document.jpg', { type: 'image/jpeg' });
                  }
                  
                  const result = await submitDocumentStep(fileToSubmit!, verificationData.documentType, extracted, token);
                  if (result?.data?.verification?.id) {
                    localStorage.setItem('verificationId', result.data.verification.id);
                  }
                  showToast('Document saved', 'success');
                  nextStep();
                } catch (e: any) {
                  showToast(e?.message || 'Failed to save document', 'error');
                } finally {
                  setIsProcessing(false);
                }
              }}
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
              hideInlineNext
            />
          )}
          {currentStep === 4 && (
            <>
              {selfieRejected && (
                <div className="mb-4 p-3 rounded-md border border-red-300 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/30 dark:text-red-200">
                  Your last selfie was rejected. Please retake a clear selfie to continue.
                </div>
              )}
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
                isProcessing={isProcessing}
              />
            </>
          )}
          {currentStep === 5 && (
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
              selectedCountry={selectedCountry}
            />
          )}
          {currentStep === 6 && (
            <EmailStep
              email={email}
              setEmail={setEmail}
              emailOtp={emailOtp}
              setEmailOtp={setEmailOtp}
              onRequestEmailOtp={handleRequestEmailOtp}
              onVerifyEmailOtp={handleVerifyEmailOtp}
              isProcessing={isProcessing}
              errors={errors}
            />
          )}
          {currentStep === 7 && <CompletionStep verificationData={verificationData} />}
        </div>
        )}

        {/* Navigation */}
        {currentStep > 0 && currentStep < 7 && (
          <div className="flex justify-between items-center mt-6 gap-3">
            <button
              onClick={prevStep}
              className="flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors border border-gray-300 dark:border-slate-700 rounded-lg px-6 py-2 min-w-[140px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentStep < 6 && (
              <button
                onClick={handleNextStep}
                disabled={
                  isProcessing ||
                  (currentStep === 2 && (!verificationData.documentType || String(verificationData.documentType).trim() === '')) ||
                  (currentStep === 3 && (!verificationData.documentImage && !documentFile)) ||
                  (currentStep === 4 && !verificationData.selfieImage) ||
                  (currentStep === 5 && !phoneVerified) ||
                  (currentStep === 6 && !emailVerified)
                }
                className={`flex items-center justify-center space-x-2 bg-[#01aaa7] text-white px-6 py-2 rounded-lg hover:bg-[#019c98] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed min-w-[160px] ${isProcessing ? 'opacity-80' : ''}`}
              >
                {isProcessing && (
                  <svg className="animate-spin h-6 w-6 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#01aaa7" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="#01aaa7" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                <span>{isProcessing ? (currentStep === 1 ? 'Saving...' : 'Processing...') : 'Next'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>


      {/* Toast notification */}
      {/* Loading message */}
      
      {/* Location Permission Dialog */}
      <LocationPermissionDialog
        isOpen={showLocationDialog}
        onClose={() => setShowLocationDialog(false)}
        onRetry={useCurrentLocation}
      />
    </div>
  );
};

export default UrutiBzVerification;