// Custom hook for return session management
// Following the same patterns as useRiskAssessment.ts

import { useState, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import handoverReturnService from '../services/handoverReturnService';
import { 
  ReturnSession,
  CreateReturnSessionRequest,
  CompleteReturnRequest,
  UploadPhotoRequest,
  UseReturnSessionReturn
} from '../types/handoverReturn';

export const useReturnSession = (): UseReturnSessionReturn => {
  const { showToast } = useToast();
  const [session, setSession] = useState<ReturnSession | null>(null);
  const [sessions, setSessions] = useState<ReturnSession[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = useCallback(async (data: CreateReturnSessionRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await handoverReturnService.createReturnSession(data);
      setSession(response.data.session);
      showToast('Return session created successfully', 'success');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create return session';
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
      const sessionData = await handoverReturnService.getReturnSession(sessionId);
      setSession(sessionData);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch return session';
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
      const result = await handoverReturnService.getReturnSessionsByUser(userId, page, limit);
      setSessions(result.data);
      setMeta(result.meta);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch return sessions';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const updateSession = useCallback(async (sessionId: string, data: Partial<ReturnSession>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedSession = await handoverReturnService.updateReturnSession(sessionId, data);
      setSession(updatedSession);
      showToast('Return session updated successfully', 'success');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update return session';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const completeSession = useCallback(async (data: CompleteReturnRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await handoverReturnService.completeReturnSession(data);
      setSession(response.data.session);
      showToast('Return session completed successfully', 'success');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to complete return session';
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
      const response = await handoverReturnService.uploadReturnPhoto(data);
      if (session) {
        setSession({
          ...session,
          returnPhotos: [...session.returnPhotos, response.data.photo]
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
