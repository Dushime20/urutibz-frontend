import React, { createContext, useState, ReactNode, useCallback, useContext } from 'react';

// Define toast type
export interface Toast {
  id?: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Define context type
export interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: number) => void;
  showToast: (message: string, type?: Toast['type']) => void;
}

// Create context with default value
export const ToastContext = createContext<ToastContextType>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
  showToast: () => {}
});

// Hook to use toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Provider component
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now();
    const newToast: Toast = { ...toast, id };
    
    setToasts(prevToasts => [...prevToasts, newToast]);

    // Auto-remove toast after duration (default 5 seconds)
    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    addToast({ message, type });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ 
      toasts, 
      addToast, 
      removeToast, 
      showToast 
    }}>
      {children}
    </ToastContext.Provider>
  );
}; 