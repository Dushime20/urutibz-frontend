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

// Generic extractor to be used if country-specific one fails
function extractGenericFields(rawText: string, countryCode: string) {
  const text = (rawText || '').replace(/\r/g, '');
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let name: string | undefined;
  const nameIdx = lines.findIndex(l => /(AMAZINA|NAMES)/i.test(l));
  if (nameIdx >= 0 && lines[nameIdx + 1]) name = lines[nameIdx + 1].replace(/^[^A-Z]*:/i, '').trim();
  if (!name) {
    const cand = lines.find(l => /[A-Za-z]{2,}\s+[A-Za-z]{2,}/.test(l) && l.length <= 40);
    if (cand) name = cand.trim();
  }
  let dob = (text.match(/(\d{2})[\/-](\d{2})[\/-](\d{4})/) || [])[0];
  const allDigits = text.replace(/[^0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);
  let documentNumber = allDigits[0] || '';
  if (countryCode === 'RW' && documentNumber && documentNumber.length < 12 && allDigits[1]) documentNumber = (documentNumber + allDigits[1]).replace(/\s+/g, '');
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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [aiProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasAddress, setHasAddress] = useState(false);
  const [hasDocument, setHasDocument] = useState(false);
  const [hasSelfie, setHasSelfie] = useState(false);
  const [selfieRejected, setSelfieRejected] = useState(false);

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

  // Detect if user already has address details to skip the step
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        const has = Boolean(
          u?.province || u?.address_line || u?.district || u?.sector || u?.cell || u?.village ||
          (u?.location && (u.location.lat != null && u.location.lng != null))
        );
        setHasAddress(has);
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
        setHasDocument(Boolean(latest?.document_image_url));
        const selfieUrl = latest?.selfie_image_url;
        const status = (latest?.verification_status || '').toLowerCase();
        const rejected = status === 'rejected';
        setSelfieRejected(rejected);
        // If rejected, force user to retake selfie (do not skip the step)
        setHasSelfie(Boolean(selfieUrl) && !rejected);
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
          // Rwanda National ID: often shown as grouped digits. Normalize and check length.
          const digits = text.replace(/[^0-9]/g, '');
          if (digits.length >= 12) return { ok: true };
          // Also accept presence of local labels
          if (/INDANGAMUNTU|REPUBLIC OF RWANDA|REPUBLIK|RWANDA/.test(text)) return { ok: true };
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
    setErrors({});
    setDocumentFile(file);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageDataUrl = e.target?.result as string;
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
        // Simple preprocessing: upscale, grayscale + threshold to boost OCR
        const maxW = 1600;
        const scale = Math.min(1, maxW / img.width) || 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * (scale < 1 ? scale : 1));
        canvas.height = Math.round(img.height * (scale < 1 ? scale : 1));
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const px = data.data;
          for (let i = 0; i < px.length; i += 4) {
            const r = px[i], g = px[i + 1], b = px[i + 2];
            const gray = (r * 0.299 + g * 0.587 + b * 0.114) | 0;
            const v = gray > 160 ? 255 : 0; // hard threshold
            px[i] = px[i + 1] = px[i + 2] = v;
          }
          ctx.putImageData(data, 0, 0);
        }
        // Use preprocessed image if available
        (window as any).__ocrSource = canvas.toDataURL('image/png');
      } catch {}
      // Run OCR
      try {
        const pre = (window as any).__ocrSource as string | undefined;
        const { data: { text } } = await Tesseract.recognize(pre || imageDataUrl, 'eng+fra');
        // Quick content validation: expect some digits and uppercase letters typical for IDs
        const hasDigits = /\d{3,}/.test(text || '');
        const hasWords = /[A-Z]{2,}/.test((text || '').toUpperCase());
        if (!hasDigits || !hasWords) {
          throw new Error('Not enough document-like text detected');
        }
        // Country/type specific validation
        const countryCheck = validateDocumentByCountry(verificationData.documentType, selectedCountry, text);
        if (!countryCheck.ok) {
          throw new Error(countryCheck.reason || 'Document does not match the selected country/type');
        }
        let extracted: any = extractRwandaIDFields(text);
        if ((!extracted?.name || extracted.name.length < 3) && (!extracted?.documentNumber || extracted.documentNumber.length < 8)) {
          extracted = extractGenericFields(text, selectedCountry);
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
        showToast('Document uploaded and processed successfully!', 'success');
      } catch (err) {
        setErrors({ api: 'OCR failed. Please try again or enter details manually.' });
        showToast('Failed to detect a valid document. Please upload a clearer document photo.', 'error');
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
    if (currentStep !== 3) return;
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
      showToast('Selfie uploaded successfully!', 'success');
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
    if (currentStep === 1) {
      await submitAddress();
      return;
    }
    if (currentStep === 2) {
      // Country selected but no document type shouldn't proceed
      if (!verificationData.documentType || String(verificationData.documentType).trim() === '') {
        setErrors({ documentType: 'Please select a document type.' });
        showToast('Please select a document type to continue.', 'error');
        return;
      }
    }
    if (currentStep === 3) {
      await handleDocumentStepNext();
      return;
    }
    if (currentStep === 4) {
      await handleSelfieStepNext();
      return;
    }
    if (currentStep === 6) {
      if (!emailVerified) {
        showToast('Please verify your email to continue.', 'error');
        return;
      }
    }
    // Block progression from Selfie to Phone if the latest status is rejected
    if (currentStep === 4 && selfieRejected) {
      showToast('Your last selfie was rejected. Please retake a selfie to continue.', 'error');
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
  const [email, setEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);

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

  const handleRequestEmailOtp = async () => {
    setIsProcessing(true);
    setErrors({});
    try {
      const token = localStorage.getItem('token');
      const targetEmail = email || JSON.parse(localStorage.getItem('user') || '{}')?.email || '';
      if (!targetEmail) {
        setErrors({ email: 'Email required' });
        setIsProcessing(false);
        return;
      }
      await requestEmailOtp(targetEmail, token);
      showToast('Email OTP sent!', 'success');
    } catch (error: any) {
      setErrors({ email: error.message || 'Failed to request email OTP' });
      showToast('Failed to request email OTP. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    setIsProcessing(true);
    setErrors({});
    try {
      const token = localStorage.getItem('token');
      const targetEmail = email || JSON.parse(localStorage.getItem('user') || '{}')?.email || '';
      if (!targetEmail) {
        setErrors({ email: 'Email required' });
        setIsProcessing(false);
        return;
      }
      await verifyEmailOtp(targetEmail, emailOtp, token);
      showToast('Email verified!', 'success');
      setEmailVerified(true);
      setCurrentStep(currentStep + 1);
    } catch (error: any) {
      setErrors({ emailOtp: error.message || 'Failed to verify email OTP' });
      showToast('Failed to verify email OTP. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Address form state
  const [addressForm, setAddressForm] = useState({
    firstName: '',
    lastName: '',
    date_of_birth: '',
    gender: '',
    province: '',
    address_line: '',
    district: '',
    sector: '',
    cell: '',
    village: '',
    location_lat: '',
    location_lng: '',
  });

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by this browser.', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setAddressForm(prev => ({ ...prev, location_lat: String(latitude), location_lng: String(longitude) }));
        showToast('Location detected', 'success');
      },
      () => showToast('Unable to fetch location. Please allow permission.', 'error'),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const submitAddress = async () => {
    try {
      // Validate required address fields
      const fieldErrors: Record<string, string> = {};
      const requiredFields: Array<keyof typeof addressForm> = [
        'firstName', 'lastName', 'province', 'address_line', 'district', 'sector', 'cell', 'village'
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
        province: addressForm.province || undefined,
        address_line: addressForm.address_line || undefined,
        district: addressForm.district || undefined,
        sector: addressForm.sector || undefined,
        cell: addressForm.cell || undefined,
        village: addressForm.village || undefined,
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
      if (next === 1 && hasAddress) next = 2;
      // Skip upload document if already present
      if (next === 3 && hasDocument) next = 4;
      // Skip selfie if already present and not rejected
      if (next === 4 && hasSelfie) next = 5;
      setCurrentStep(next);
      setErrors({});
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      let prev = currentStep - 1;
      // Skip completed steps when navigating backwards
      // Loop to handle multiple consecutive completed steps
      // 4: Selfie, 3: Upload Document, 1: Address Details
      let adjusted = true;
      while (adjusted) {
        adjusted = false;
        if (prev === 4 && hasSelfie) { prev = 3; adjusted = true; }
        if (prev === 3 && hasDocument) { prev = 2; adjusted = true; }
        if (prev === 1 && hasAddress) { prev = 0; adjusted = true; }
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
          {currentStep === 0 && <WelcomeStep nextStep={nextStep} />}
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
              nextStep={nextStep}
              confirmDocument={async () => {
                try {
                  if (!documentFile) return nextStep();
                  setIsProcessing(true);
                  const token = localStorage.getItem('token');
                  const extracted = verificationData.ocrResults?.extractedData || {};
                  const result = await submitDocumentStep(documentFile, verificationData.documentType, extracted, token);
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
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Address Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <input className={`px-3 py-2 rounded-md border ${errors.firstName ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-slate-700'} dark:bg-slate-800 dark:text-slate-100`} placeholder="First Name" value={addressForm.firstName} onChange={e=>setAddressForm({...addressForm, firstName:e.target.value})} />
                <input className={`px-3 py-2 rounded-md border ${errors.lastName ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-slate-700'} dark:bg-slate-800 dark:text-slate-100`} placeholder="Last Name" value={addressForm.lastName} onChange={e=>setAddressForm({...addressForm, lastName:e.target.value})} />
                <input type="date" className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="Date of Birth" value={addressForm.date_of_birth} onChange={e=>setAddressForm({...addressForm, date_of_birth:e.target.value})} />
                <select className="px-3 py-2 rounded-md border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" value={addressForm.gender} onChange={e=>setAddressForm({...addressForm, gender:e.target.value})}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                <input className={`px-3 py-2 rounded-md border ${errors.province ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-slate-700'} dark:bg-slate-800 dark:text-slate-100`} placeholder="Province" value={addressForm.province} onChange={e=>setAddressForm({...addressForm, province:e.target.value})} />
                <input className={`px-3 py-2 rounded-md border ${errors.address_line ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-slate-700'} dark:bg-slate-800 dark:text-slate-100`} placeholder="Address Line" value={addressForm.address_line} onChange={e=>setAddressForm({...addressForm, address_line:e.target.value})} />
                <input className={`px-3 py-2 rounded-md border ${errors.district ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-slate-700'} dark:bg-slate-800 dark:text-slate-100`} placeholder="District" value={addressForm.district} onChange={e=>setAddressForm({...addressForm, district:e.target.value})} />
                <input className={`px-3 py-2 rounded-md border ${errors.sector ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-slate-700'} dark:bg-slate-800 dark:text-slate-100`} placeholder="Sector" value={addressForm.sector} onChange={e=>setAddressForm({...addressForm, sector:e.target.value})} />
                <input className={`px-3 py-2 rounded-md border ${errors.cell ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-slate-700'} dark:bg-slate-800 dark:text-slate-100`} placeholder="Cell" value={addressForm.cell} onChange={e=>setAddressForm({...addressForm, cell:e.target.value})} />
                <input className={`px-3 py-2 rounded-md border ${errors.village ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-slate-700'} dark:bg-slate-800 dark:text-slate-100`} placeholder="Village" value={addressForm.village} onChange={e=>setAddressForm({...addressForm, village:e.target.value})} />
                <input className={`px-3 py-2 rounded-md border ${errors.location_lat ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-slate-700'} dark:bg-slate-800 dark:text-slate-100`} placeholder="Latitude" value={addressForm.location_lat} onChange={e=>setAddressForm({...addressForm, location_lat:e.target.value})} />
                <input className={`px-3 py-2 rounded-md border ${errors.location_lng ? 'border-red-400 dark:border-red-500' : 'border-gray-300 dark:border-slate-700'} dark:bg-slate-800 dark:text-slate-100`} placeholder="Longitude" value={addressForm.location_lng} onChange={e=>setAddressForm({...addressForm, location_lng:e.target.value})} />
              </div>
              <div>
                <button type="button" onClick={useCurrentLocation} className="px-4 py-2 rounded-md border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800">
                  Use current location
                </button>
              </div>
              {/* Submit handled by global Next button to keep controls in one row */}
            </div>
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
                  (currentStep === 3 && !verificationData.documentImage) ||
                  (currentStep === 4 && !verificationData.selfieImage)
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
      
    </div>
  );
};

export default UrutiBzVerification;