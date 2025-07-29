import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronDown, Globe, Menu, X, Bot, Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'sw', label: 'Swahili', flag: '🇰🇪' },
];

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [language, setLanguage] = useState(languages[0]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-platform-light-grey dark:border-gray-700 shadow-platform">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 lg:h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4 lg:space-x-8">
            <Link to="/" className="flex items-center space-x-2 lg:space-x-3">
              <div className="flex items-center space-x-1.5 lg:space-x-2">
                <img 
                  src="/assets/img/urutibz-logo.svg" 
                  alt="UrutiBz" 
                  className="h-6 w-6 lg:h-8 lg:w-8" 
                />
                <span className="text-lg lg:text-2xl font-bold text-platform-dark-grey dark:text-white tracking-tight font-outfit">
                  UrutiBz
                </span>
              </div>
              <div className="hidden md:flex items-center space-x-1 bg-gradient-to-r from-active/10 to-active/20 px-2 lg:px-3 py-1 rounded-full border border-active/20">
                <Bot className="h-3 w-3 lg:h-4 lg:w-4 text-active" />
                <span className="text-xs font-medium text-active">AI-Powered</span>
              </div>
            </Link>

            {/* Main Navigation - Desktop */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <Link 
                to="/items" 
                className="nav-link text-sm xl:text-base"
              >
                Browse Items
              </Link>
              <Link 
                to="/create-listing" 
                className="nav-link text-sm xl:text-base"
              >
                List Your Item
              </Link>
              <Link 
                to="/how-it-works" 
                className="nav-link text-sm xl:text-base"
              >
                How It Works
              </Link>
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-platform-grey dark:text-gray-300 hover:text-platform-dark-grey dark:hover:text-white hover:bg-platform-light-grey/50 dark:hover:bg-gray-700 rounded-platform transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-2 px-3 py-2 text-platform-grey dark:text-gray-300 hover:text-platform-dark-grey dark:hover:text-white hover:bg-platform-light-grey/50 dark:hover:bg-gray-700 rounded-platform transition-colors duration-200"
                aria-label="Select language"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline text-sm font-medium">
                  {language.flag} {language.label}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-platform shadow-platform-lg border border-platform-light-grey dark:border-gray-600 py-1 z-20">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang);
                        setIsLanguageOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-platform-grey dark:text-gray-300 hover:bg-platform-light-grey/50 dark:hover:bg-gray-700 hover:text-platform-dark-grey dark:hover:text-white transition-colors duration-200"
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Authentication */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/dashboard" 
                  className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium nav-link"
                >
                  Dashboard
                </Link>
                
                {/* User Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-platform-light-grey/50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="h-8 w-8 rounded-full object-cover border-2 border-platform-light-grey" 
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-active to-active-dark flex items-center justify-center text-white font-semibold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                    <ChevronDown className="h-4 w-4 text-platform-grey dark:text-gray-300" />
                  </button>
                  
                  {isProfileOpen && (
                    <div ref={profileRef} className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-platform shadow-platform-lg border border-platform-light-grey dark:border-gray-600 py-2 z-20">
                                              <div className="px-4 py-2 border-b border-platform-light-grey dark:border-gray-600">
                          <p className="text-sm font-medium text-platform-dark-grey dark:text-white">{user?.name}</p>
                          <p className="text-xs text-platform-grey dark:text-gray-300">{user?.email}</p>
                        </div>
                      <Link 
                        to="/dashboard" 
                        className="block px-4 py-2 text-sm text-platform-grey dark:text-gray-300 hover:bg-platform-light-grey/50 dark:hover:bg-gray-700 hover:text-platform-dark-grey dark:hover:text-white transition-colors duration-200"
                      >
                        Dashboard
                      </Link>
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-platform-grey dark:text-gray-300 hover:bg-platform-light-grey/50 dark:hover:bg-gray-700 hover:text-platform-dark-grey dark:hover:text-white transition-colors duration-200"
                      >
                        Profile Settings
                      </Link>
                      <Link 
                        to="/my-rentals" 
                        className="block px-4 py-2 text-sm text-platform-grey dark:text-gray-300 hover:bg-platform-light-grey/50 dark:hover:bg-gray-700 hover:text-platform-dark-grey dark:hover:text-white transition-colors duration-200"
                      >
                        My Rentals
                      </Link>
                      <hr className="my-1 border-platform-light-grey dark:border-gray-600" />
                      <button 
                        onClick={logout} 
                        className="block w-full text-left px-4 py-2 text-sm text-platform-grey dark:text-gray-300 hover:bg-platform-light-grey/50 dark:hover:bg-gray-700 hover:text-platform-dark-grey dark:hover:text-white transition-colors duration-200"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium btn-outline"
                >
                  Log In
                </Link>
                <Link 
                  to="/register" 
                  className="inline-flex items-center px-4 py-2 text-sm font-medium btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-platform-grey dark:text-gray-300 hover:text-platform-dark-grey dark:hover:text-white hover:bg-platform-light-grey/50 dark:hover:bg-gray-700 rounded-platform transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-600 py-4">
            <div className="space-y-2">
                              <Link 
                  to="/browse" 
                  className="block px-2 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  Browse
                </Link>
                <Link 
                  to="/list-property" 
                  className="block px-2 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  List Your Item
                </Link>
                <Link 
                  to="/how-it-works" 
                  className="block px-2 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                >
                  How It Works
                </Link>
              
              {!isAuthenticated && (
                <div className="pt-2 space-y-2">
                                      <Link 
                      to="/login" 
                      className="block px-2 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                      Log In
                    </Link>
                  <Link 
                    to="/register" 
                    className="block px-2 py-2 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all duration-200 text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
