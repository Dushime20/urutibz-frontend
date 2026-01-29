import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UseAuthReminderOptions {
  interval?: number; // Interval between reminders (in ms)
  initialDelay?: number; // Initial delay before first reminder (in ms)
  maxReminders?: number; // Maximum reminders per session
  autoHide?: number; // Auto-hide after X seconds (0 = manual close only)
}

export const useAuthReminder = (options: UseAuthReminderOptions = {}) => {
  const { isAuthenticated } = useAuth();
  const { 
    interval = 30000,      // 30 seconds between reminders
    initialDelay = 30000,  // 30 seconds initial delay
    maxReminders = 5,      // Max 5 reminders per session
    autoHide = 8000        // Auto-hide after 8 seconds
  } = options;
  
  const [showPopup, setShowPopup] = useState(false);
  const [reminderCount, setReminderCount] = useState(0);
  const [currentTrigger, setCurrentTrigger] = useState<'browse' | 'cart' | 'contact' | 'favorite'>('browse');

  // Auto-show reminders - immediate first show, then at regular intervals
  useEffect(() => {
    if (isAuthenticated || reminderCount >= maxReminders) return;

    // Show immediately on first load
    if (reminderCount === 0) {
      setShowPopup(true);
      setReminderCount(1);
      setCurrentTrigger('browse');
    }

    // Then continue with interval-based reminders
    const intervalTimer = setInterval(() => {
      if (!isAuthenticated && reminderCount < maxReminders && !showPopup) {
        setShowPopup(true);
        setReminderCount(prev => prev + 1);
        
        // Rotate through different trigger types for variety
        const triggers: Array<'browse' | 'cart' | 'contact' | 'favorite'> = ['browse', 'cart', 'contact', 'favorite'];
        setCurrentTrigger(triggers[reminderCount % triggers.length]);
      }
    }, interval);

    return () => {
      clearInterval(intervalTimer);
    };
  }, [isAuthenticated, reminderCount, maxReminders, interval, showPopup]);

  // Auto-hide popup after specified time
  useEffect(() => {
    if (showPopup && autoHide > 0) {
      const hideTimer = setTimeout(() => {
        setShowPopup(false);
      }, autoHide);

      return () => clearTimeout(hideTimer);
    }
  }, [showPopup, autoHide]);

  // Reset counters when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      setShowPopup(false);
      setReminderCount(0);
    }
  }, [isAuthenticated]);

  const closePopup = () => {
    setShowPopup(false);
  };

  // Manual trigger for specific actions (optional)
  const triggerAuthReminder = (trigger: 'browse' | 'cart' | 'contact' | 'favorite' = 'browse') => {
    if (isAuthenticated || reminderCount >= maxReminders) return false;
    
    setShowPopup(true);
    setCurrentTrigger(trigger);
    setReminderCount(prev => prev + 1);
    return true;
  };

  return {
    showPopup,
    closePopup,
    triggerAuthReminder,
    currentTrigger,
    reminderCount,
    canShowMore: reminderCount < maxReminders
  };
};