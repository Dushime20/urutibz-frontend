import React, { createContext, useState, useContext, useEffect, type ReactNode } from 'react';
import { useAdminSettingsContext } from './AdminSettingsContext';

// Define verification status
export interface VerificationStatus {
  isProfileComplete: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isIdVerified: boolean;
  isAddressVerified: boolean;
  isFullyVerified: boolean;
  verificationStep: 'profile' | 'email' | 'phone' | 'id' | 'address' | 'complete';
}

// Define user type
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  verification: VerificationStatus;
  joinedDate: string;
  kyc_status?: string;
  role?: 'user' | 'admin' | 'moderator' | 'inspector';
}

// Define context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateVerificationStatus: (updates: Partial<VerificationStatus>) => void;
  canListItems: () => boolean;
  canRentItems: () => boolean;
  isAdmin: () => boolean;
  isModerator: () => boolean;
  isInspector: () => boolean;
  error: string | null;
  setAuthenticatedUser: (user: User) => void;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  logout: () => {},
  updateUser: () => {},
  updateVerificationStatus: () => {},
  canListItems: () => false,
  canRentItems: () => false,
  isAdmin: () => false,
  isModerator: () => false,
  isInspector: () => false,
  error: null,
  setAuthenticatedUser: () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { settings } = useAdminSettingsContext();

  // Check for existing user session on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        // If we have a token but no user, or if we have a user, try to verify/refresh
        if (token) {
          // If we have stored user, use it immediately for faster UI
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              
              // Ensure verification object has all required properties
              if (parsedUser.verification) {
                const verification = parsedUser.verification;
                
                // Set default values for missing verification properties
                verification.isProfileComplete = verification.isProfileComplete ?? false;
                verification.isEmailVerified = verification.isEmailVerified ?? false;
                verification.isPhoneVerified = verification.isPhoneVerified ?? false;
                verification.isIdVerified = verification.isIdVerified ?? false;
                verification.isAddressVerified = verification.isAddressVerified ?? false;
                
                // Calculate isFullyVerified if not present
                if (verification.isFullyVerified === undefined) {
                  verification.isFullyVerified = (
                    verification.isProfileComplete &&
                    verification.isEmailVerified &&
                    verification.isPhoneVerified &&
                    verification.isIdVerified &&
                    verification.isAddressVerified
                  );
                }
                
                // Set default verification step if not present
                if (!verification.verificationStep) {
                  if (verification.isFullyVerified) {
                    verification.verificationStep = 'complete';
                  } else if (!verification.isProfileComplete) {
                    verification.verificationStep = 'profile';
                  } else if (!verification.isEmailVerified) {
                    verification.verificationStep = 'email';
                  } else if (!verification.isPhoneVerified) {
                    verification.verificationStep = 'phone';
                  } else if (!verification.isIdVerified) {
                    verification.verificationStep = 'id';
                  } else if (!verification.isAddressVerified) {
                    verification.verificationStep = 'address';
                  } else {
                    verification.verificationStep = 'profile';
                  }
                }
              }
              
              // Ensure KYC status is set
              if (!parsedUser.kyc_status) {
                parsedUser.kyc_status = 'pending';
              }
              
              // Set user immediately from localStorage
              setUser(parsedUser);
              console.log('✅ [AuthContext] User loaded from localStorage:', { id: parsedUser.id, role: parsedUser.role });
              
              // Optionally verify token with backend (non-blocking)
              try {
                const { fetchUserProfile } = await import('../pages/auth/service/api');
                const profileRes: any = await fetchUserProfile(token);
                const userObj = profileRes?.data ?? profileRes;
                if (userObj && userObj.id) {
                  // Update user with fresh data from backend
                  setUser(userObj);
                  localStorage.setItem('user', JSON.stringify(userObj));
                  console.log('✅ [AuthContext] User profile refreshed from backend:', { id: userObj.id, role: userObj.role });
                }
              } catch (profileError: any) {
                // Only clear user if it's a 401 (unauthorized) - token is invalid
                // For other errors (network, 500, etc.), keep using cached user
                if (profileError?.response?.status === 401) {
                  console.warn('⚠️ [AuthContext] Token invalid (401), clearing auth:', profileError);
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  setUser(null);
                } else {
                  console.warn('⚠️ [AuthContext] Failed to refresh user profile, using cached data:', profileError);
                  // Keep using cached user if refresh fails for non-auth reasons
                }
              }
            } catch (parseError) {
              console.error('❌ [AuthContext] Error parsing stored user:', parseError);
              localStorage.removeItem('user');
            }
          } else {
            // No stored user but have token - try to fetch user profile
            try {
              const { fetchUserProfile } = await import('../pages/auth/service/api');
              const profileRes: any = await fetchUserProfile(token);
              const userObj = profileRes?.data ?? profileRes;
              if (userObj && userObj.id) {
                setUser(userObj);
                localStorage.setItem('user', JSON.stringify(userObj));
                console.log('✅ [AuthContext] User profile loaded from backend:', { id: userObj.id, role: userObj.role });
              }
            } catch (profileError: any) {
              // Only clear token if it's a 401 (unauthorized)
              // For other errors, keep the token and let the user try again
              if (profileError?.response?.status === 401) {
                console.warn('⚠️ [AuthContext] Token invalid (401), clearing:', profileError);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
              } else {
                console.warn('⚠️ [AuthContext] Failed to fetch user profile (non-auth error), keeping token:', profileError);
              }
            }
          }
        } else if (storedUser) {
          // No token but have stored user - clear it (invalid state)
          console.warn('⚠️ [AuthContext] Found stored user but no token, clearing user');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('❌ [AuthContext] Authentication error:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Auto-logout on inactivity based on admin security/session settings
  useEffect(() => {
    if (!user) return;
    // Read from security first, then system, then fallback to localStorage persisted value
    const storedTimeout = (() => {
      try { return parseInt(localStorage.getItem('security.sessionTimeout') || '0') || 0; } catch { return 0; }
    })();
    const timeoutSec = settings?.security?.sessionTimeout || settings?.system?.sessionTimeout || storedTimeout || 0;
    
    // Only enable auto-logout if timeout is explicitly set and is reasonable (at least 5 minutes)
    if (!timeoutSec || timeoutSec < 300) {
      console.log('ℹ️ [AuthContext] Auto-logout disabled (timeout not set or too short)');
      return;
    }

    console.log(`⏰ [AuthContext] Auto-logout enabled: ${timeoutSec} seconds (${Math.round(timeoutSec / 60)} minutes)`);

    let timer: number | undefined;
    const resetTimer = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        console.warn(`⚠️ [AuthContext] Session timeout reached (${timeoutSec}s), logging out user`);
        try { 
          localStorage.removeItem('user'); 
          localStorage.removeItem('token');
        } catch {}
        setUser(null);
      }, timeoutSec * 1000);
    };

    // Track more activity events to prevent premature logout
    const onActivity = () => {
      resetTimer();
    };
    
    resetTimer();
    
    // Add more activity listeners
    window.addEventListener('mousemove', onActivity);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('click', onActivity);
    window.addEventListener('scroll', onActivity, { passive: true });
    window.addEventListener('touchstart', onActivity, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('click', onActivity);
      window.removeEventListener('scroll', onActivity);
      window.removeEventListener('touchstart', onActivity);
      if (timer) window.clearTimeout(timer);
    };
  }, [user, settings?.security?.sessionTimeout, settings?.system?.sessionTimeout]);

  // Mock login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This is a mock implementation
      // In a real app, you would call your API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Multiple mock users with different verification statuses
             if (email === 'verified@example.com' && password === 'password') {
         // Fully verified user (admin)
         const mockUser: User = {
           id: '1',
           name: 'John Doe',
           email: 'verified@example.com',
           avatar: '/assets/img/profiles/avatar-01.jpg',
           phone: '+256 712 345 678',
           dateOfBirth: '1990-05-15',
           address: {
             street: '123 Main Street',
             city: 'Kampala',
             state: 'Central Region',
             country: 'Uganda',
             zipCode: '00000'
           },
           verification: {
             isProfileComplete: true,
             isEmailVerified: true,
             isPhoneVerified: true,
             isIdVerified: true,
             isAddressVerified: true,
             isFullyVerified: true,
             verificationStep: 'complete'
           },
           role: 'admin',
           joinedDate: '2023-01-15'
         };
        
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        return true;
      } else if (email === 'partial@example.com' && password === 'password') {
        // Partially verified user
        const mockUser: User = {
          id: '2',
          name: 'Robert Chen',
          email: 'partial@example.com',
          avatar: '/assets/img/profiles/avatar-02.jpg',
          phone: '+256 712 345 679',
          dateOfBirth: '1992-08-22',
          verification: {
            isProfileComplete: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            isIdVerified: false,
            isAddressVerified: false,
            isFullyVerified: false,
            verificationStep: 'id'
          },
          joinedDate: '2023-05-20'
        };
        
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        return true;
      } else if (email === 'unverified@example.com' && password === 'password') {
        // Completely unverified user
        const mockUser: User = {
          id: '3',
          name: 'Jane Smith',
          email: 'unverified@example.com',
          avatar: '/assets/img/profiles/avatar-03.jpg',
          verification: {
            isProfileComplete: false,
            isEmailVerified: false,
            isPhoneVerified: false,
            isIdVerified: false,
            isAddressVerified: false,
            isFullyVerified: false,
            verificationStep: 'profile'
          },
          joinedDate: '2023-06-30'
        };
        
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        return true;
             } else if (email === 'user@example.com' && password === 'password') {
         // Original user (keeping for backward compatibility)
         const mockUser: User = {
           id: '4',
           name: 'John Smith',
           email: 'user@example.com',
           avatar: '/assets/img/profiles/avatar-04.jpg',
           verification: {
             isProfileComplete: false,
             isEmailVerified: false,
             isPhoneVerified: false,
             isIdVerified: false,
             isAddressVerified: false,
             isFullyVerified: false,
             verificationStep: 'profile'
           },
           joinedDate: new Date().toISOString()
         };
         
         localStorage.setItem('user', JSON.stringify(mockUser));
         setUser(mockUser);
         return true;
       } else if (email === 'kycverified@example.com' && password === 'password') {
         // KYC verified user - can list items immediately
         const mockUser: User = {
           id: '5',
           name: 'KYC Verified User',
           email: 'kycverified@example.com',
           avatar: '/assets/img/profiles/avatar-05.jpg',
           verification: {
             isProfileComplete: false,
             isEmailVerified: false,
             isPhoneVerified: false,
             isIdVerified: false,
             isAddressVerified: false,
             isFullyVerified: false,
             verificationStep: 'profile'
           },
           kyc_status: 'verified',
           joinedDate: new Date().toISOString()
         };
         
         localStorage.setItem('user', JSON.stringify(mockUser));
         setUser(mockUser);
         return true;
       }
      
      setError('Invalid email or password');
      return false;
    } catch (err) {
      setError('An error occurred during login. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This is a mock implementation
      // In a real app, you would call your API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      // Simple validation
      if (email && password && name) {
        const mockUser: User = {
          id: '2', // In a real app, this would be generated by the backend
          name,
          email,
          avatar: '/assets/img/profiles/avatar-02.jpg', // Default avatar
          verification: {
            isProfileComplete: false,
            isEmailVerified: false,
            isPhoneVerified: false,
            isIdVerified: false,
            isAddressVerified: false,
            isFullyVerified: false,
            verificationStep: 'profile'
          },
          joinedDate: new Date().toISOString()
        };
        
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        return true;
      }
      
      setError('All fields are required');
      return false;
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Update user function
  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Update verification status function
  const updateVerificationStatus = (updates: Partial<VerificationStatus>) => {
    if (user) {
      const updatedVerification = { ...user.verification, ...updates };
      
      // Auto-calculate isFullyVerified based on individual verification states
      const isFullyVerified = 
        updatedVerification.isProfileComplete &&
        updatedVerification.isEmailVerified &&
        updatedVerification.isPhoneVerified &&
        updatedVerification.isIdVerified &&
        updatedVerification.isAddressVerified;

      updatedVerification.isFullyVerified = isFullyVerified;
      
      // Update verification step based on completion
      if (isFullyVerified) {
        updatedVerification.verificationStep = 'complete';
      } else if (!updatedVerification.isProfileComplete) {
        updatedVerification.verificationStep = 'profile';
      } else if (!updatedVerification.isEmailVerified) {
        updatedVerification.verificationStep = 'email';
      } else if (!updatedVerification.isPhoneVerified) {
        updatedVerification.verificationStep = 'phone';
      } else if (!updatedVerification.isIdVerified) {
        updatedVerification.verificationStep = 'id';
      } else if (!updatedVerification.isAddressVerified) {
        updatedVerification.verificationStep = 'address';
      }

      updateUser({ verification: updatedVerification });
    }
  };

  // Check if user can list items (KYC verified users can list immediately, others need full verification)
  const canListItems = (): boolean => {
    if (!user || !user.verification) return false;
    
    // Check KYC status first - if verified, allow listing immediately
    const kycStatus = user.kyc_status || 'pending';
    if (kycStatus === 'verified') return true;
    
    // For non-verified KYC users, require full verification
    if (kycStatus !== 'approved') return false;
    
    // Check if isFullyVerified exists, otherwise calculate it
    if (user.verification.isFullyVerified !== undefined) {
      return user.verification.isFullyVerified;
    }
    
    // Calculate verification status if not explicitly set
    return (
      user.verification.isProfileComplete &&
      user.verification.isEmailVerified &&
      user.verification.isPhoneVerified &&
      user.verification.isIdVerified &&
      user.verification.isAddressVerified
    );
  };

  // Check if user can rent items (requires basic verification: profile + email)
  const canRentItems = (): boolean => {
    if (!user || !user.verification) return false;
    return user.verification.isProfileComplete && user.verification.isEmailVerified;
  };

  // Check if user is an admin
  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  // Check if user is a moderator
  const isModerator = (): boolean => {
    return user?.role === 'moderator';
  };

  // Check if user is an inspector
  const isInspector = (): boolean => {
    return user?.role === 'inspector';
  };

  const setAuthenticatedUser = (user: User) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    setIsLoading(false); // Ensure loading is false when user is set
    console.log('✅ [AuthContext] setAuthenticatedUser called:', { id: user.id, role: user.role });
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    updateVerificationStatus,
    canListItems,
    canRentItems,
    isAdmin,
    isModerator,
    isInspector,
    error,
    setAuthenticatedUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
