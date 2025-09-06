// Custom hook for handover session management
// Following the same patterns as useRiskAssessment.ts

import { useState, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import handoverReturnService from '../services/handoverReturnService';
import { 
  HandoverSession,
  CreateHandoverSessionRequest,
  CompleteHandoverRequest,
  UploadPhotoRequest,
  UseHandoverSessionReturn
} from '../types/handoverReturn';

export const useHandoverSession = (): UseHandoverSessionReturn => {
  const { showToast } = useToast();
  const [session, setSession] = useState<HandoverSession | null>(null);
  const [sessions, setSessions] = useState<HandoverSession[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async (data: CreateHandoverSessionRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await handoverReturnService.createHandoverSession(data);
      setSession(response.data.session);
      showToast('Handover session created successfully', 'success');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create handover session';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const getSession = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const sessionData = await handoverReturnService.getHandoverSession(sessionId);
      setSession(sessionData);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch handover session';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const getSessionsByUser = useCallback(async (userId: string, page: number = 1, limit: number = 20) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await handoverReturnService.getHandoverSessionsByUser(userId, page, limit);
      setSessions(result.data);
      setMeta(result.meta);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch handover sessions';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const updateSession = useCallback(async (sessionId: string, data: Partial<HandoverSession>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedSession = await handoverReturnService.updateHandoverSession(sessionId, data);
      setSession(updatedSession);
      showToast('Handover session updated successfully', 'success');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update handover session';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const completeSession = useCallback(async (data: CompleteHandoverRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await handoverReturnService.completeHandoverSession(data);
      setSession(response.data.session);
      showToast('Handover session completed successfully', 'success');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to complete handover session';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const uploadPhoto = useCallback(async (data: UploadPhotoRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await handoverReturnService.uploadHandoverPhoto(data);
      if (session) {
        setSession({
          ...session,
          handoverPhotos: [...session.handoverPhotos, response.data.photo]
        });
      }
      showToast('Photo uploaded successfully', 'success');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload photo';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [session, showToast]);

  return {
    session,
    sessions,
    meta,
    loading,
    error,
    createSession,
    getSession,
    getSessionsByUser,
    updateSession,
    completeSession,
    uploadPhoto
  };
};
