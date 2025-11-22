import { useEffect, useRef, useState, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { useRealtime } from './useRealtime';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system' | 'audio' | 'video';
  is_read: boolean;
  created_at: string;
  updated_at: string;
  message_status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  delivered_at?: string;
  read_at?: string;
  attachments?: Array<{
    id?: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
    thumbnail_url?: string;
  }>;
  reply_to_message_id?: string;
  productContext?: {
    productId?: string;
    productTitle?: string;
    bookingId?: string;
  } | null;
}

export interface Chat {
  id: string;
  participant_ids: string[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
  product_id?: string;
  booking_id?: string;
  subject?: string;
  last_message_preview?: string;
  last_message_at?: string;
}

interface UseMessagingReturn {
  // Chat management
  chats: Chat[];
  currentChat: Chat | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  
  // Actions
  createOrGetChat: (participantId: string, productId?: string, bookingId?: string) => Promise<Chat | null>;
  loadChats: () => Promise<void>;
  loadMessages: (chatId: string, page?: number) => Promise<void>;
  sendMessage: (chatId: string, content: string, messageType?: string, replyToMessageId?: string, attachments?: any[]) => Promise<Message | null>;
  markAsRead: (messageId: string) => Promise<void>;
  markChatAsRead: (chatId: string) => Promise<void>;
  loadUnreadCount: () => Promise<void>;
  
  // Real-time features
  typingUsers: string[];
  setTyping: (chatId: string, isTyping: boolean) => void;
  isTyping: boolean;
  
  // Events
  onNewMessage: (callback: (message: Message) => void) => void;
  onMessageRead: (callback: (data: { messageId: string; readBy: string }) => void) => void;
  onUserTyping: (callback: (data: { userId: string; isTyping: boolean }) => void) => void;
}

export const useMessaging = (): UseMessagingReturn => {
  const { socket, isConnected, joinRoom, leaveRoom } = useRealtime();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  const messageCallbacksRef = useRef<Array<(message: Message) => void>>([]);
  const readCallbacksRef = useRef<Array<(data: { messageId: string; readBy: string }) => void>>([]);
  const typingCallbacksRef = useRef<Array<(data: { userId: string; isTyping: boolean }) => void>>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentChatIdRef = useRef<string | null>(null);

  // Set up Socket.IO event listeners
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for new messages (from other participants)
    const handleNewMessage = (data: { 
      chatId: string; 
      message: Message; 
      timestamp: string;
      productContext?: {
        productId?: string;
        productTitle?: string;
        bookingId?: string;
      } | null;
    }) => {
      if (data.chatId === currentChatIdRef.current) {
        setMessages(prev => {
          // First check by ID (most reliable)
          const existingById = prev.find(m => m.id === data.message.id);
          if (existingById) {
            // Message already exists, don't add duplicate
            return prev;
          }
          
          // Check for duplicate by content + sender + timestamp (fallback for edge cases)
          const duplicateByContent = prev.find(m => 
            m.content === data.message.content &&
            m.sender_id === data.message.sender_id &&
            Math.abs(new Date(m.created_at).getTime() - new Date(data.message.created_at).getTime()) < 2000
          );
          
          if (duplicateByContent) {
            // Don't add duplicate
            return prev;
          }
          
          // Add new message (only for messages from other participants)
          // Messages from current user are handled by handleMessageSent
          const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
          if (data.message.sender_id === user?.id) {
            // This is our own message, ignore it here (handled by message-sent)
            return prev;
          }
          
          // Add message with product context if available
          const messageWithContext = {
            ...data.message,
            productContext: data.productContext || null
          };
          
          return [...prev, messageWithContext].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        });
      }
      
      // Update chat list
      setChats(prev => prev.map(chat => 
        chat.id === data.chatId 
          ? { ...chat, last_message_preview: data.message.content.substring(0, 500), last_message_at: data.timestamp }
          : chat
      ));

      // Increment unread count for new messages from others
      const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
      if (data.message.sender_id !== user?.id) {
        setUnreadCount(prev => prev + 1);
      }

      // Call registered callbacks
      messageCallbacksRef.current.forEach(cb => cb(data.message));
    };

    // Listen for message-sent confirmation (for sender)
    const handleMessageSent = (data: { 
      chatId: string; 
      message: Message; 
      timestamp: string;
      productContext?: {
        productId?: string;
        productTitle?: string;
        bookingId?: string;
      } | null;
    }) => {
      if (data.chatId === currentChatIdRef.current) {
        setMessages(prev => {
          // Find and replace temp message with real message
          const tempMessage = prev.find(m => 
            m.id.startsWith('temp-') && 
            m.content === data.message.content &&
            m.sender_id === data.message.sender_id &&
            Math.abs(new Date(m.created_at).getTime() - new Date(data.message.created_at).getTime()) < 5000
          );
          
          if (tempMessage) {
            // Replace temp message with real one (include product context)
            const messageWithContext = {
              ...data.message,
              message_status: 'sent' as const,
              productContext: data.productContext || null
            };
            return prev.map(msg => 
              msg.id === tempMessage.id ? messageWithContext : msg
            ).sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          }
          
          // If no temp message found, check if message already exists
          if (prev.some(m => m.id === data.message.id)) {
            return prev;
          }
          
          // Add message if it doesn't exist (shouldn't happen, but safety check)
          const messageWithContext = {
            ...data.message,
            message_status: 'sent' as const,
            productContext: data.productContext || null
          };
          return [...prev, messageWithContext].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        });
      }
    };

    // Listen for message read receipts
    const handleMessageRead = (data: { messageId: string; chatId: string; readBy: string; readAt: string }) => {
      if (data.chatId === currentChatIdRef.current) {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, is_read: true, read_at: data.readAt, message_status: 'read' }
            : msg
        ));
      }

      readCallbacksRef.current.forEach(cb => cb({ messageId: data.messageId, readBy: data.readBy }));
    };

    // Listen for typing indicators
    const handleUserTyping = (data: { chatId: string; userId: string; isTyping: boolean; timestamp: string }) => {
      if (data.chatId === currentChatIdRef.current) {
        if (data.isTyping) {
          setTypingUsers(prev => {
            if (!prev.includes(data.userId)) {
              return [...prev, data.userId];
            }
            return prev;
          });
        } else {
          setTypingUsers(prev => prev.filter(id => id !== data.userId));
        }
      }

      typingCallbacksRef.current.forEach(cb => cb({ userId: data.userId, isTyping: data.isTyping }));
    };

    // Listen for chat read
    const handleChatRead = (data: { chatId: string; readBy: string; readAt: string }) => {
      if (data.chatId === currentChatIdRef.current) {
        setMessages(prev => prev.map(msg => 
          msg.sender_id !== data.readBy && !msg.is_read
            ? { ...msg, is_read: true, read_at: data.readAt, message_status: 'read' }
            : msg
        ));
      }
    };

    socket.on('new-message', handleNewMessage);
    socket.on('message-read-receipt', handleMessageRead);
    socket.on('user-typing', handleUserTyping);
    socket.on('chat-read', handleChatRead);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-sent', handleMessageSent);
      socket.off('message-read-receipt', handleMessageRead);
      socket.off('user-typing', handleUserTyping);
      socket.off('chat-read', handleChatRead);
    };
  }, [socket, isConnected]);

  // Clean up typing indicator when component unmounts or chat changes
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (currentChatIdRef.current && socket && isConnected) {
        socket.emit('typing', { chatId: currentChatIdRef.current, isTyping: false });
      }
    };
  }, [socket, isConnected]);

  // Load user's chats
  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/messaging/chats`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: 1, limit: 50 }
      });

      const chatsData = response.data?.data?.chats || response.data?.data || response.data || [];
      setChats(Array.isArray(chatsData) ? chatsData : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load chats');
      console.error('Error loading chats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create or get chat
  const createOrGetChat = useCallback(async (
    participantId: string,
    productId?: string,
    bookingId?: string
  ): Promise<Chat | null> => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_BASE_URL}/messaging/chats`,
        {
          participant_id: participantId,
          product_id: productId,
          booking_id: bookingId
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const chat = response.data?.data || response.data;
      if (chat) {
        // Join chat room for real-time updates
        if (socket && isConnected) {
          joinRoom(chat.id, 'chat');
          currentChatIdRef.current = chat.id;
        }
        setCurrentChat(chat);
        return chat;
      }
      return null;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create/get chat');
      console.error('Error creating/getting chat:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [socket, isConnected, joinRoom]);

  // Load messages for a chat
  const loadMessages = useCallback(async (chatId: string, page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      // Join chat room for real-time updates
      if (socket && isConnected) {
        joinRoom(chatId, 'chat');
        currentChatIdRef.current = chatId;
      }

      const response = await axios.get(`${API_BASE_URL}/messaging/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit: 50 }
      });

      const messagesData = response.data?.data?.messages || response.data?.data || response.data || [];
      
      // Set messages directly when loading (replace all, removing any temp messages)
      const cleanMessages = Array.isArray(messagesData) 
        ? messagesData.filter((msg: Message) => !msg.id.startsWith('temp-'))
        : [];
      
      // Deduplicate messages by ID
      const uniqueMessages = cleanMessages.reduce((acc: Message[], msg: Message) => {
        if (!acc.find(m => m.id === msg.id)) {
          acc.push(msg);
        }
        return acc;
      }, []);
      
      setMessages(uniqueMessages.sort((a: Message, b: Message) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load messages');
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  }, [socket, isConnected, joinRoom]);

  // Send message
  const sendMessage = useCallback(async (
    chatId: string,
    content: string,
    messageType: string = 'text',
    replyToMessageId?: string,
    attachments?: any[]
  ): Promise<Message | null> => {
    try {
      setError(null);
      const token = localStorage.getItem('token');

      // Create a consistent temp message ID
      const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;

      // Optimistically add message to UI
      const tempMessage: Message = {
        id: tempMessageId,
        chat_id: chatId,
        sender_id: user?.id || '',
        content,
        message_type: messageType as any,
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        message_status: 'sending',
        reply_to_message_id: replyToMessageId,
        attachments
      };

      setMessages(prev => {
        // Check if message already exists (avoid duplicates)
        if (prev.some(m => m.id === tempMessageId)) {
          return prev;
        }
        return [...prev, tempMessage];
      });

      // Send via Socket.IO only (backend handles persistence via MessagingService)
      // This prevents duplicate persistence and ensures real-time delivery
      if (socket && isConnected) {
        socket.emit('message', {
          chatId,
          content,
          messageType,
          replyToMessageId,
          attachments
        });
        
        // Return temp message - it will be replaced by 'message-sent' event from Socket.IO
        // The handleMessageSent will receive the message and replace the temp one
        return tempMessage;
      }

      // Fallback: If Socket.IO is not available, use REST API
      const response = await axios.post(
        `${API_BASE_URL}/messaging/chats/${chatId}/messages`,
        {
          content,
          message_type: messageType,
          reply_to_message_id: replyToMessageId,
          attachments
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const message = response.data?.data || response.data;
      
      // Replace temp message with real message
      if (message) {
        setMessages(prev => {
          // Remove temp message and check if real message already exists
          const filtered = prev.filter(msg => msg.id !== tempMessageId);
          // Check if message already exists
          if (filtered.some(m => m.id === message.id)) {
            return filtered;
          }
          // Add real message
          return [...filtered, { ...message, message_status: 'sent' }].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        });
        return message;
      }

      return null;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message');
      console.error('Error sending message:', err);
      
      // Remove temp message on error using the stored tempMessageId
      const tempMessageId = `temp-${Date.now()}`;
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
      return null;
    }
  }, [socket, isConnected]);

  // Load unread message count
  const loadUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `${API_BASE_URL}/messaging/unread-count`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const count = response.data?.data?.unreadCount || response.data?.unreadCount || 0;
      setUnreadCount(count);
    } catch (err: any) {
      console.error('Error loading unread count:', err);
    }
  }, []);

  // Mark message as read
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // Send via Socket.IO
      if (socket && isConnected && currentChatIdRef.current) {
        socket.emit('message-read', { messageId, chatId: currentChatIdRef.current });
      }

      // Also update via REST API
      await axios.patch(
        `${API_BASE_URL}/messaging/messages/${messageId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, is_read: true, read_at: new Date().toISOString(), message_status: 'read' }
          : msg
      ));
      
      // Reload unread count
      await loadUnreadCount();
    } catch (err: any) {
      console.error('Error marking message as read:', err);
    }
  }, [socket, isConnected, loadUnreadCount]);

  // Mark chat as read
  const markChatAsRead = useCallback(async (chatId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      // Send via Socket.IO
      if (socket && isConnected) {
        socket.emit('chat-read', { chatId });
      }

      // Also update via REST API
      await axios.patch(
        `${API_BASE_URL}/messaging/chats/${chatId}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update local state
      setMessages(prev => prev.map(msg => 
        !msg.is_read 
          ? { ...msg, is_read: true, read_at: new Date().toISOString(), message_status: 'read' }
          : msg
      ));
      
      // Reload unread count
      await loadUnreadCount();
    } catch (err: any) {
      console.error('Error marking chat as read:', err);
    }
  }, [socket, isConnected, loadUnreadCount]);

  // Set typing indicator
  const setTyping = useCallback((chatId: string, typing: boolean) => {
    if (!socket || !isConnected) return;

    setIsTyping(typing);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Send typing indicator
    socket.emit('typing', { chatId, isTyping: typing });

    // Auto-stop typing after 3 seconds
    if (typing) {
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { chatId, isTyping: false });
        setIsTyping(false);
      }, 3000);
    }
  }, [socket, isConnected]);

  // Event callbacks
  const onNewMessage = useCallback((callback: (message: Message) => void) => {
    messageCallbacksRef.current.push(callback);
    return () => {
      messageCallbacksRef.current = messageCallbacksRef.current.filter(cb => cb !== callback);
    };
  }, []);

  const onMessageRead = useCallback((callback: (data: { messageId: string; readBy: string }) => void) => {
    readCallbacksRef.current.push(callback);
    return () => {
      readCallbacksRef.current = readCallbacksRef.current.filter(cb => cb !== callback);
    };
  }, []);

  const onUserTyping = useCallback((callback: (data: { userId: string; isTyping: boolean }) => void) => {
    typingCallbacksRef.current.push(callback);
    return () => {
      typingCallbacksRef.current = typingCallbacksRef.current.filter(cb => cb !== callback);
    };
  }, []);

  // Load unread count on mount
  useEffect(() => {
    loadUnreadCount();
    // Refresh unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  return {
    chats,
    currentChat,
    messages,
    loading,
    error,
    unreadCount,
    createOrGetChat,
    loadChats,
    loadMessages,
    sendMessage,
    markAsRead,
    markChatAsRead,
    loadUnreadCount,
    typingUsers,
    setTyping,
    isTyping,
    onNewMessage,
    onMessageRead,
    onUserTyping,
  };
};

export default useMessaging;

