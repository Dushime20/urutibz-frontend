// API service for verification2
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export async function submitDocumentOCR(
  documentFile: File,
  selfieFile: File,
  documentType: string,
  token: string | null
): Promise<any> {
  const formData = new FormData();
  formData.append('documentImage', documentFile);
  formData.append('selfieImage', selfieFile);
  formData.append('verificationType', documentType);
  const response = await fetch(`${API_BASE_URL}/user-verification/submit-documents`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) throw new Error('Verification failed');
  return response.json();
}

export interface ExtractedData {
  documentNumber?: string;
  addressLine?: string;
  city?: string;
  country?: string;
  district?: string;
}

export async function submitDocumentStep(
  documentFile: File,
  documentType: string,
  extracted: ExtractedData,
  token: string | null
): Promise<any> {
  const formData = new FormData();
  formData.append('verificationType', documentType);
  if (extracted.documentNumber) formData.append('documentNumber', extracted.documentNumber);
  if (extracted.addressLine) formData.append('addressLine', extracted.addressLine);
  if (extracted.city) formData.append('city', extracted.city);
  if (extracted.country) formData.append('country', extracted.country);
  if (extracted.district) formData.append('district', extracted.district);
  formData.append('documentImage', documentFile);
  const response = await fetch(`${API_BASE_URL}/user-verification/submit-documents`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const result = await response.json();
  if (!response.ok) {
    const errorData = result;
    throw new Error(errorData.message || 'Failed to submit document');
  }
  return result;
}

export async function submitSelfieStep(
  selfieBase64: string,
  verificationId: string | null,
  token: string | null
): Promise<any> {
  if (!verificationId) throw new Error('Verification ID is required');
  const blob = await (await fetch(selfieBase64)).blob();
  const selfieFile = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('selfieImage', selfieFile);
  const response = await fetch(`${API_BASE_URL}/user-verification/${verificationId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update verification with selfie');
  }
  return response.json();
}

export interface ReviewData {
  documentNumber?: string;
  addressLine?: string;
  city?: string;
  country?: string;
  district?: string;
}

export interface FinalVerificationArgs {
  documentImageBase64: string;
  selfieImageBase64: string;
  verificationType: string;
  reviewData: ReviewData;
  token: string | null;
}

export async function submitFinalVerification({
  documentImageBase64,
  selfieImageBase64,
  verificationType,
  reviewData,
  token
}: FinalVerificationArgs): Promise<any> {
  const docBlob = await (await fetch(documentImageBase64)).blob();
  const docFile = new File([docBlob], 'document.jpg', { type: 'image/jpeg' });
  const selfieBlob = await (await fetch(selfieImageBase64)).blob();
  const selfieFile = new File([selfieBlob], 'selfie.jpg', { type: 'image/jpeg' });
  const formData = new FormData();
  formData.append('verificationType', verificationType);
  formData.append('documentNumber', reviewData.documentNumber || '');
  formData.append('addressLine', reviewData.addressLine || '');
  formData.append('city', reviewData.city || '');
  formData.append('country', reviewData.country || '');
  formData.append('district', reviewData.district || '');
  formData.append('selfieImage', selfieFile);
  formData.append('documentImage', docFile);
  const response = await fetch(`${API_BASE_URL}/user-verification/submit-documents`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export async function requestPhoneOtp(
  phoneNumber: string,
  token: string | null
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/user-verification/request-phone-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ phoneNumber }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to request OTP');
  }
  return result;
}

export async function verifyPhoneOtp(
  phoneNumber: string,
  otp: string,
  token: string | null
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/user-verification/verify-phone-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ phoneNumber, otp }),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to verify OTP');
  }
  return result;
} 