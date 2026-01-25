import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { toast as sonnerToast } from 'sonner';

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode; }) {
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) => {
    const options = { duration };

    switch (type) {
      case 'success':
        sonnerToast.success(message, options);
        break;
      case 'error':
        sonnerToast.error(message, options);
        break;
      case 'info':
      default:
        sonnerToast.info(message, options);
        break;
    }
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
