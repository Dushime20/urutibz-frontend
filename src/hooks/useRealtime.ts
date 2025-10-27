import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseRealtimeReturn {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (data: { chatId: string; message: string; toUserId: string }) => void;
  joinRoom: (room: string, type?: string) => void;
  leaveRoom: (room: string, type?: string) => void;
  sendNotification: (data: { toUserId: string; type: string; message: string; data?: any }) => void;
  updateBooking: (data: { bookingId: string; status: string; toUserId?: string; notification?: { message: string } }) => void;
}

export const useRealtime = (): UseRealtimeReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found, skipping socket connection');
      return;
    }

    // Initialize socket connection
    const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace('/api/v1', '') || 'http://localhost:5000';
    console.log('🔌 Connecting to Socket.IO server:', backendUrl);
    
    const newSocket = io(backendUrl, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Socket.IO connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  // Send message function
  const sendMessage = useCallback((data: { chatId: string; message: string; toUserId: string }) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('message', data);
    }
  }, [isConnected]);

  // Join room function
  const joinRoom = useCallback((room: string, type?: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join', { room, type });
    }
  }, [isConnected]);

  // Leave room function
  const leaveRoom = useCallback((room: string, type?: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave', { room, type });
    }
  }, [isConnected]);

  // Send notification function
  const sendNotification = useCallback((data: { toUserId: string; type: string; message: string; data?: any }) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send-notification', data);
    }
  }, [isConnected]);

  // Update booking function
  const updateBooking = useCallback((data: { bookingId: string; status: string; toUserId?: string; notification?: { message: string } }) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('booking-update', data);
    }
  }, [isConnected]);

  return {
    socket,
    isConnected,
    sendMessage,
    joinRoom,
    leaveRoom,
    sendNotification,
    updateBooking,
  };
};

export default useRealtime;

