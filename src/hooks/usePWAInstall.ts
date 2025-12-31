import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if already installed on iOS
    if (iOS && (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, we can always show install instructions
    if (iOS && !isInstalled) {
      setCanInstall(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isInstalled]);

  const handleInstall = async (): Promise<boolean> => {
    if (isInstalled) {
      return false;
    }

    if (deferredPrompt) {
      // Show the install prompt for Android/Desktop
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
          setCanInstall(false);
          setIsInstalled(true);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error showing install prompt:', error);
        return false;
      }
    } else if (isIOS) {
      // For iOS, we can't programmatically trigger install
      // But we can show instructions or return false to let the component handle it
      return false;
    }

    return false;
  };

  return {
    canInstall: canInstall && !isInstalled,
    isInstalled,
    isIOS,
    handleInstall,
  };
};

