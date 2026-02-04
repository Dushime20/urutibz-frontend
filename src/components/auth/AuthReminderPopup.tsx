import React, { useState, useEffect } from 'react';
import { X, Shield, Star, Users, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoginSignupModal from './LoginSignupModal';

interface AuthReminderPopupProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'browse' | 'cart' | 'contact' | 'favorite';
  autoHideAfter?: number; // Auto-hide after X seconds
}

const AuthReminderPopup: React.FC<AuthReminderPopupProps> = ({ 
  isOpen, 
  onClose, 
  trigger = 'browse',
  autoHideAfter = 8
}) => {
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(autoHideAfter);

  // Countdown timer for auto-hide
  useEffect(() => {
    if (!isOpen || autoHideAfter <= 0) return;

    setTimeLeft(autoHideAfter);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, autoHideAfter, onClose]);

  // Don't show if user is already authenticated
  if (isAuthenticated || !isOpen) return null;

  const getTriggerContent = () => {
    switch (trigger) {
      case 'cart':
        return {
          title: 'Sign in to save items and checkout',
          subtitle: 'Keep your cart secure and checkout when ready',
          icon: '🛒',
          highlight: 'Save your cart'
        };
      case 'contact':
        return {
          title: 'Sign in to connect with owners',
          subtitle: 'Message owners directly and start renting',
          icon: '💬',
          highlight: 'Connect instantly'
        };
      case 'favorite':
        return {
          title: 'Sign in to save your favorites',
          subtitle: 'Never lose track of products you love',
          icon: '❤️',
          highlight: 'Save favorites'
        };
      default:
        return {
          title: 'Join URUTIBUZ today',
          subtitle: 'Unlock the full rental experience with thousands of products',
          icon: '🚀',
          highlight: 'Start renting'
        };
    }
  };

  const content = getTriggerContent();
  const progressPercentage = ((autoHideAfter - timeLeft) / autoHideAfter) * 100;

  return (
    <>
      {/* Subtle Backdrop - Top Right Positioning */}
      <div
        className="fixed inset-0 z-[9999] pointer-events-none"
      >
        {/* Reminder Card - Top Right Corner */}
        <div
          className="absolute top-4 right-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-80 overflow-hidden transform transition-all duration-300 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Auto-hide Progress Bar */}
          {autoHideAfter > 0 && (
            <div className="h-1 bg-gray-200 dark:bg-gray-700">
              <div 
                className="h-full bg-teal-500 transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}

          {/* Header */}
          <div className="relative p-4 pb-3">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
            
            {/* URUTIBUZ Logo */}
            {/* <div className="flex items-center gap-2 mb-3">
              <img
                src="/assets/img/urutibuz-logo.png"
                alt="URUTIBUZ"
                className="w-6 h-6 object-contain"
              />
              <span className="text-lg font-bold text-teal-600">URUTIBUZ</span>
            </div> */}
          </div>

          {/* Content */}
          <div className="px-4 pb-4">
            {/* Icon and Title */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">{content.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {content.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {content.subtitle}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Benefits */}
            <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Shield className="w-3 h-3 text-teal-500" />
                <span>Secure rentals</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Star className="w-3 h-3 text-teal-500" />
                <span>Verified owners</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users className="w-3 h-3 text-teal-500" />
                <span>Trusted community</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Zap className="w-3 h-3 text-teal-500" />
                <span>Instant booking</span>
              </div>
            </div>

            {/* Action Buttons - Compact */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowLoginModal(true);
                  onClose();
                }}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-3 rounded-lg transition-colors text-sm"
              >
                Sign In
              </button>
              
              <button
                onClick={() => {
                  setShowLoginModal(true);
                  onClose();
                }}
                className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium py-2.5 px-3 rounded-lg transition-colors text-sm"
              >
                Sign Up
              </button>
            </div>

            {/* Auto-hide indicator */}
            {autoHideAfter > 0 && (
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Auto-closing in {timeLeft}s
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login/Signup Modal */}
      <LoginSignupModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
        }}
      />
    </>
  );
};

export default AuthReminderPopup;