import { useState, useCallback } from 'react';
import { riskManagementService } from '../../../services/riskManagementService';
import { ComplianceCheckRequest, ComplianceCheckResponse } from '../../../types/riskManagement';
import { useToast } from '../../../contexts/ToastContext';

interface UseComplianceCheckReturn {
  compliance: ComplianceCheckResponse['data'] | null;
  loading: boolean;
  error: string | null;
  checkCompliance: (data: ComplianceCheckRequest) => Promise<void>;
  getBookingCompliance: (bookingId: string) => Promise<void>;
  clearCompliance: () => void;
}

export const useComplianceCheck = (): UseComplianceCheckReturn => {
  const { showToast } = useToast();
  const [compliance, setCompliance] = useState<ComplianceCheckResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkCompliance = useCallback(async (data: ComplianceCheckRequest) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Checking compliance for booking:', data.bookingId);
      const response = await riskManagementService.checkCompliance(data);
      
      setCompliance(response.data);
      
      const status = response.data.isCompliant ? 'compliant' : 'non-compliant';
      console.log('✅ Compliance check completed successfully');
      showToast(`Compliance check completed: ${status}`, 'success');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to check compliance';
      setError(errorMessage);
      console.error('❌ Compliance check failed:', err);
      
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const getBookingCompliance = useCallback(async (bookingId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Getting compliance status for booking:', bookingId);
      const response = await riskManagementService.getBookingCompliance(bookingId);
      
      setCompliance(response.data);
      
      const status = response.data.isCompliant ? 'compliant' : 'non-compliant';
      console.log('✅ Booking compliance status retrieved successfully');
      showToast(`Compliance status: ${status}`, 'success');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to get booking compliance status';
      setError(errorMessage);
      console.error('❌ Failed to get booking compliance status:', err);
      
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const clearCompliance = useCallback(() => {
    setCompliance(null);
    setError(null);
  }, []);

  return {
    compliance,
    loading,
    error,
    checkCompliance,
    getBookingCompliance,
    clearCompliance
  };
};
