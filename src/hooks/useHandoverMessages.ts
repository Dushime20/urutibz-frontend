// Custom hook for handover messages management
// Following the same patterns as useRiskAssessment.ts

import { useState, useCallback, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import handoverReturnService from '../services/handoverReturnService';
import { 
  HandoverMessage,
  SendMessageRequest,
  SendPlainMessageRequest,
  UseHandoverMessagesReturn
} from '../types/handoverReturn';

// View-focused: fetch by handoverSessionId or returnSessionId per backend API
export const useHandoverMessages = (initialHandoverSessionId?: string, initialReturnSessionId?: string): UseHandoverMessagesReturn => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<HandoverMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentHandoverId, setCurrentHandoverId] = useState<string | undefined>(initialHandoverSessionId);
  const [currentReturnId, setCurrentReturnId] = useState<string | undefined>(initialReturnSessionId);

  const refreshMessages = useCallback(async (handoverSessionId?: string, returnSessionId?: string) => {
    // Allow caller to override which session id to fetch
    const hId = handoverSessionId ?? currentHandoverId;
    const rId = returnSessionId ?? currentReturnId;
    if (!hId && !rId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (hId) {
        const res = await handoverReturnService.getMessages({ handoverSessionId: hId, page: 1, limit: 50 });
        const mapped: HandoverMessage[] = (res.data || []).map((m: any) => ({
          id: m.id,
          sessionId: hId!,
          senderId: m.senderId,
          senderType: m.senderType,
          receiverId: '',
          messageType: (m.messageType || 'text') as any,
          content: m.message,
          metadata: undefined,
          isRead: Array.isArray(m.readBy) ? m.readBy.length > 0 : false,
          sentAt: m.timestamp,
          readAt: undefined,
        }));
        setMessages(mapped);
      } else if (rId) {
        const res = await handoverReturnService.getMessages({ returnSessionId: rId, page: 1, limit: 50 });
        const mapped: HandoverMessage[] = (res.data || []).map((m: any) => ({
          id: m.id,
          sessionId: rId!,
          senderId: m.senderId,
          senderType: m.senderType,
          receiverId: '',
          messageType: (m.messageType || 'text') as any,
          content: m.message,
          metadata: undefined,
          isRead: Array.isArray(m.readBy) ? m.readBy.length > 0 : false,
          sentAt: m.timestamp,
          readAt: undefined,
        }));
        setMessages(mapped);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch messages';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [currentHandoverId, currentReturnId, showToast]);

  const sendMessage = useCallback(async (data: SendMessageRequest | SendPlainMessageRequest) => {
    setLoading(true);
    setError(null);
    
    try {
      if ((data as SendPlainMessageRequest).bookingId) {
        const createdResponse = await handoverReturnService.sendPlainMessage(data as SendPlainMessageRequest);
        setMessages(prev => [...prev, createdResponse.data.message]);
      } else {
        const response = await handoverReturnService.sendMessage(data as SendMessageRequest);
        setMessages(prev => [...prev, response.data.message]);
      }
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
    setCurrentHandoverId(initialHandoverSessionId);
    setCurrentReturnId(initialReturnSessionId);
  }, [initialHandoverSessionId, initialReturnSessionId]);

  useEffect(() => {
    if (currentHandoverId || currentReturnId) {
      refreshMessages();
    }
  }, [currentHandoverId, currentReturnId, refreshMessages]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    markAsRead,
    refreshMessages
  };
};
