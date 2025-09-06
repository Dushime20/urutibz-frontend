// Custom hook for handover messages management
// Following the same patterns as useRiskAssessment.ts

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import handoverReturnService from '../services/handoverReturnService';
import { 
  HandoverMessage,
  SendMessageRequest,
  UseHandoverMessagesReturn
} from '../types/handoverReturn';

export const useHandoverMessages = (sessionId?: string): UseHandoverMessagesReturn => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<HandoverMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshMessages = useCallback(async () => {
    if (!sessionId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const messagesData = await handoverReturnService.getSessionMessages(sessionId);
      setMessages(messagesData);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch messages';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [sessionId, showToast]);

  const sendMessage = useCallback(async (data: SendMessageRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await handoverReturnService.sendMessage(data);
      setMessages(prev => [...prev, response.data.message]);
      showToast('Message sent successfully', 'success');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send message';
      setError(errorMessage);
      showToast(errorMessage, 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await handoverReturnService.markMessageAsRead(messageId);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isRead: true, readAt: new Date().toISOString() }
            : msg
        )
      );
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to mark message as read';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    }
  }, [showToast]);

  // Auto-refresh messages when sessionId changes
  useEffect(() => {
    if (sessionId) {
      refreshMessages();
    }
  }, [sessionId, refreshMessages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    refreshMessages
  };
};
