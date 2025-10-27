import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronDown, Globe, Menu, X, Bot, Moon, Sun, Search, User, PlusCircle, Clock, TrendingUp } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useAdminSettingsContext } from '../../contexts/AdminSettingsContext';
import { useI18n } from '../../contexts/I18nContext';
import RealtimeNotifications from '../RealtimeNotifications';

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'rw', label: 'Kinyarwanda', flag: '🇷🇼' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'sw', label: 'Swahili', flag: '🇰🇪' },
];

const topCategories = [
  { id: 'vehicles', label: 'Vehicles' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'events', label: 'Events' },
  { id: 'tools', label: 'Tools' },
  { id: 'sports', label: 'Sports' },
  { id: 'photography', label: 'Photography' },
  { id: 'outdoor', label: 'Outdoor' },
];

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { settings } = useAdminSettingsContext();
  const { language, setLanguage, t } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Professional search state
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const searchTimeoutRef = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Integrated search state
  const params = new URLSearchParams(location.search);
  const [q, setQ] = useState<string>(params.get('q') || '');
  const [category, setCategory] = useState<string>(params.get('category') || 'all');
  const [checkIn, setCheckIn] = useState<string>(params.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState<string>(params.get('checkOut') || '');
  // Guests removed per business request
  const [nearMe, setNearMe] = useState<boolean>(params.get('nearMe') === 'true');
  const [lat, setLat] = useState<string>(params.get('lat') || '');
  const [lng, setLng] = useState<string>(params.get('lng') || '');
  const [radiusKm, setRadiusKm] = useState<number>(Number(params.get('radiusKm') || 25));
  const [priceMin, setPriceMin] = useState<string>(params.get('priceMin') || '');
  const [priceMax, setPriceMax] = useState<string>(params.get('priceMax') || '');

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    setQ(p.get('q') || '');
    setCategory(p.get('category') || 'all');
    setCheckIn(p.get('checkIn') || '');
    setCheckOut(p.get('checkOut') || '');
    setNearMe(p.get('nearMe') === 'true');
    setLat(p.get('lat') || '');
    setLng(p.get('lng') || '');
    setRadiusKm(Number(p.get('radiusKm') || 25));
    setPriceMin(p.get('priceMin') || '');
    setPriceMax(p.get('priceMax') || '');
  }, [location.search]);

  // Professional search functions
  const generateSearchSuggestions = useCallback((query: string): string[] => {
    if (!query || query.length < 2) return [];
    
    const suggestions = [
      // Category-based suggestions
      'camera rental', 'car rental', 'laptop rental', 'drone rental',
      'event equipment', 'photography gear', 'outdoor gear', 'tools rental',
      'party supplies', 'fitness equipment', 'travel gear', 'home appliances',
      
      // Brand-based suggestions
      'Canon camera', 'Nikon lens', 'DJI drone', 'MacBook Pro',
      'iPhone rental', 'iPad rental', 'Sony camera', 'GoPro',
      
      // Event-based suggestions
      'wedding photography', 'corporate events', 'birthday party',
      'conference equipment', 'trade show booth', 'exhibition setup',
      
      // Location-based suggestions
      'near me', 'downtown', 'city center', 'airport pickup',
      
      // Duration-based suggestions
      'daily rental', 'weekly rental', 'monthly rental', 'long term'
    ];
    
    return suggestions
      .filter(suggestion => 
        suggestion.toLowerCase().includes(query.toLowerCase()) ||
        query.toLowerCase().split(' ').some(word => 
          suggestion.toLowerCase().includes(word)
        )
      )
      .slice(0, 8);
  }, []);

  const debouncedSearch = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (query.length >= 2) {
        setIsSearching(true);
        setSearchSuggestions(generateSearchSuggestions(query));
        setShowSuggestions(true);
        
        // Auto-search after 1 second of no typing
        setTimeout(() => {
          performAutoSearch();
        }, 1000);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
      setIsSearching(false);
    }, 300);
  }, [generateSearchSuggestions]);

  const performAutoSearch = useCallback(() => {
    if (q.length >= 2) {
    const sp = new URLSearchParams();
    if (q) sp.set('q', q);
    if (category && category !== 'all') sp.set('category', category);
    if (priceMin) sp.set('priceMin', priceMin);
    if (priceMax) sp.set('priceMax', priceMax);
    if (checkIn) sp.set('checkIn', checkIn);
    if (checkOut) sp.set('checkOut', checkOut);
    if (nearMe && lat && lng) {
      sp.set('nearMe', 'true');
      sp.set('lat', lat);
      sp.set('lng', lng);
      if (radiusKm) sp.set('radiusKm', String(radiusKm));
    }
      
      // Add to recent searches
      const newRecentSearches = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5);
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
      
      // Check if we're on homepage - if so, trigger local search instead of navigation
      if (location.pathname === '/') {
        // Dispatch custom event for homepage search
        const searchEvent = new CustomEvent('homepageSearch', {
          detail: {
            query: q,
            category: category !== 'all' ? category : '',
            priceMin,
            priceMax,
            checkIn,
            checkOut,
            nearMe,
            lat,
            lng,
            radiusKm
          }
        });
        window.dispatchEvent(searchEvent);
        setShowSuggestions(false);
      } else {
        // Navigate to search page for other pages
    navigate(`/items/search${sp.toString() ? `?${sp.toString()}` : ''}`);
        setShowSuggestions(false);
      }
    }
  }, [q, category, priceMin, priceMax, checkIn, checkOut, nearMe, lat, lng, radiusKm, recentSearches, navigate, location.pathname]);

  const handleSearchInputChange = (value: string) => {
    setQ(value);
    debouncedSearch(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQ(suggestion);
    setShowSuggestions(false);
    performAutoSearch();
  };

  const submitSearch = () => {
    performAutoSearch();
    setIsMenuOpen(false);
  };

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    
    // Mock trending searches (in real app, fetch from API)
    setTrendingSearches([
      'camera rental', 'car rental', 'event equipment', 'drone rental',
      'photography gear', 'party supplies', 'tools rental', 'laptop rental'
    ]);
  }, []);

  // Handle clicks outside search suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Geolocation trigger
  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNearMe(true);
        setLat(String(pos.coords.latitude));
        setLng(String(pos.coords.longitude));
      },
      () => {
        alert('Unable to retrieve your location. Please allow location access.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if ((target as HTMLElement)?.closest?.('[data-sticky-portal]')) {
        return; // ignore clicks inside sticky portals (e.g., Notification modal)
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
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
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md dark:bg-gray-900/80 border-b border-platform-light-grey/80 dark:border-gray-700/60 shadow-sm w-full ml-0">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 lg:py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4 lg:space-x-8">
            <Link to="/" className="flex items-center space-x-2 lg:space-x-3">
              <div className="flex items-center">
                <img 
                  src={settings?.business?.companyLogo || settings?.platform?.logoUrl || '/assets/img/yacht/urutilogo2.png'} 
                  alt={settings?.business?.companyName || settings?.platform?.siteName || 'UrutiBz'} 
                  className="h-24 w-52  lg:w-auto object-contain opacity-100 flex-shrink-0 drop-shadow-sm" 
                />
              </div>
              {/* <div className="hidden md:flex items-center space-x-1 bg-gradient-to-r from-active/10 to-active/20 px-2 lg:px-3 py-1 rounded-full border border-active/20">
                <Bot className="h-3 w-3 lg:h-4 lg:w-4 text-active" />
                <span className="text-xs font-medium text-active">{settings?.platform?.siteTagline || 'AI-Powered'}</span>
              </div> */}
            </Link>

            {/* Main Navigation - Desktop */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <Link 
                to="/items" 
                className="nav-link text-sm xl:text-base"
              >
                Browse Items
              </Link>
              {/* Categories dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                  className="inline-flex items-center gap-1 nav-link text-sm xl:text-base"
                >
                  Categories
                  <ChevronDown className="h-4 w-4" />
                </button>
                {isCategoriesOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-platform shadow-platform-lg border border-platform-light-grey dark:border-gray-600 py-2 z-30">
                    {topCategories.map((c) => (
                      <Link
                        key={c.id}
                        to={`/items?category=${c.id}`}
                        onClick={() => setIsCategoriesOpen(false)}
                        className="block px-4 py-2 text-sm text-platform-grey dark:text-gray-300 hover:bg-platform-light-grey/50 dark:hover:bg-gray-700 hover:text-platform-dark-grey dark:hover:text-white transition-colors"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link 
                to="/create-listing" 
                className="inline-flex items-center gap-2 text-sm xl:text-base px-3 py-2 rounded-full border hover:border-[#01aaa7] text-[#01aaa7]"
              >
                <PlusCircle className="w-4 h-4" />
                List Item
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/favorites" 
                  className="nav-link text-sm xl:text-base"
                >
                  Favorites
                </Link>
              )}
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

            {/* Language / Theme */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center px-2 py-2 text-platform-grey dark:text-gray-300 hover:text-platform-dark-grey dark:hover:text-white hover:bg-platform-light-grey/50 dark:hover:bg-gray-700 rounded-platform transition-colors duration-200"
                aria-label="Select language"
              >
                <Globe className="h-4 w-4" />
                <ChevronDown className="h-3 w-3 ml-1" />
              </button>
              
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-platform shadow-platform-lg border border-platform-light-grey dark:border-gray-600 py-1 z-20">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as 'en' | 'fr' | 'rw');
                        setIsLanguageOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-2 text-sm hover:bg-platform-light-grey/50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                        language === lang.code 
                          ? 'text-platform-primary dark:text-[#01aaa7] font-medium' 
                          : 'text-platform-grey dark:text-gray-300 hover:text-platform-dark-grey dark:hover:text-white'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                  <hr className="my-1 border-platform-light-grey dark:border-gray-600" />
                  <button
                    onClick={() => { toggleDarkMode(); setIsLanguageOpen(false); }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-platform-grey dark:text-gray-300 hover:bg-platform-light-grey/50 dark:hover:bg-gray-700 hover:text-platform-dark-grey dark:hover:text-white transition-colors duration-200"
                  >
                    {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    <span>Toggle theme</span>
                  </button>
                </div>
              )}
            </div>

            {/* Authentication */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* My Account Button */}
                <Link 
                  to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                  className={`hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    user?.role === 'admin' 
                      ? 'btn-outline hover:bg-[#01aaa7] hover:text-white' 
                      : 'btn-outline hover:bg-[#01aaa7] hover:text-white'
                  }`}
                >
                  {user?.role === 'admin' ? 'Admin Dashboard' : 'My Account'}
                </Link>
                
                {/* User Profile Dropdown */}
                <div className="relative flex items-center gap-3">
                  <RealtimeNotifications />
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
                      <div className="h-8 w-8 rounded-full bg-[#01aaa7] flex items-center justify-center text-white">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    <ChevronDown className="h-4 w-4 text-platform-grey dark:text-gray-300" />
                  </button>
                  
                  {isProfileOpen && (
                    <div ref={profileRef} className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-platform shadow-platform-lg border border-platform-light-grey dark:border-gray-600 py-2 z-20">
                      <div className="px-4 py-2 border-b border-platform-light-grey dark:border-gray-600">
                          <p className="text-sm font-medium text-platform-dark-grey dark:text-white">{user?.name}</p>
                          <p className="text-xs text-platform-grey dark:text-gray-300">{user?.email}</p>
                          {user?.role && (
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === 'admin' 
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                                  : user.role === 'moderator'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                              }`}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-platform-grey dark:text-gray-300 hover:bg-platform-light-grey/50 dark:hover:bg-gray-700 hover:text-platform-dark-grey dark:hover:text-white transition-colors duration-200"
                      >
                        Profile Settings
                      </Link>
                      <Link 
                        to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                        className="block px-4 py-2 text-sm text-platform-grey dark:text-gray-300 hover:bg-platform-light-grey/50 dark:hover:bg-gray-700 hover:text-platform-dark-grey dark:hover:text-white transition-colors duration-200"
                      >
                        {user?.role === 'admin' ? 'Admin Dashboard' : 'My Account'}
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
                {(settings?.platform?.allowUserRegistration && (settings?.system as any)?.registrationEnabled) && (
                  <Link 
                    to="/register" 
                    className="inline-flex items-center px-4 py-2 text-sm font-medium bg-[#01aaa7] text-white rounded-platform hover:opacity-90"
                  >
                    Sign Up
                  </Link>
                )}
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

        {/* Professional Search Section */}
        <div className="hidden md:block pb-4">
          <div className="max-w-6xl mx-auto">
            {/* Main Search Bar */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 relative">
                <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 shadow-sm">
                  <Search className={`h-5 w-5 mr-3 ${isSearching ? 'text-[#01aaa7] animate-pulse' : 'text-gray-400'}`} />
                <input
                    ref={searchInputRef}
                  value={q}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && submitSearch()}
                    onFocus={() => setShowSuggestions(q.length >= 2 || recentSearches.length > 0)}
                    placeholder={t('header.searchPlaceholder')}
                    className="flex-1 text-sm outline-none placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-transparent"
                  />
                  {isSearching && (
                    <div className="ml-3 px-4 py-2 text-sm text-[#01aaa7] font-medium">
                      {t('header.searching')}
                    </div>
                  )}
                  {!isSearching && q.length >= 2 && (
                    <button
                      onClick={submitSearch}
                      className="ml-3 px-6 py-2 bg-[#01aaa7] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                    >
                      {t('common.search')}
                    </button>
                  )}
                </div>
              </div>
              </div>

            {/* Filter Row */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('header.category')}:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#01aaa7] focus:border-transparent"
                >
                  <option value="all">{t('header.allItems')}</option>
                  <option value="vehicles">🚗 Vehicles</option>
                  <option value="electronics">📱 Electronics</option>
                  <option value="tools">🔧 Tools</option>
                  <option value="photography">📷 Photography</option>
                  <option value="outdoor">⛺ Outdoor</option>
                  <option value="events">🎉 Events</option>
                  <option value="sports">⚽ Sports</option>
                  <option value="home">🏠 Home</option>
                  <option value="fashion">👕 Fashion</option>
                  <option value="fitness">💪 Fitness</option>
                  <option value="travel">✈️ Travel</option>
                  <option value="books">📚 Books</option>
                  <option value="art">🎨 Art</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('header.price')}:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder="Min"
                    className="w-20 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#01aaa7] focus:border-transparent"
                  />
                  <span className="text-gray-500 dark:text-gray-400">-</span>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder="Max"
                    className="w-20 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#01aaa7] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Date Range Filters */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('header.dates')}:</label>
                <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                    placeholder="Start date"
                    className="w-32 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#01aaa7] focus:border-transparent"
                  onFocus={(e) => { e.currentTarget.type = 'date'; }}
                  onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.type = 'text'; }}
                />
                  <span className="text-gray-500 dark:text-gray-400">to</span>
                <input
                  type="text"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                    placeholder="End date"
                    className="w-32 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#01aaa7] focus:border-transparent"
                  onFocus={(e) => { e.currentTarget.type = 'date'; }}
                  onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.type = 'text'; }}
                />
                </div>
              </div>

              {/* Location Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('header.location')}:</label>
                {nearMe && lat && lng ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700">
                      ✓ Location enabled
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(Number(e.target.value) || 25)}
                      className="w-16 px-2 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#01aaa7] focus:border-transparent"
                      placeholder="km"
                      title="Radius in kilometers"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={detectLocation}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-[#01aaa7] hover:text-[#008a87] border border-[#01aaa7] hover:border-[#008a87] rounded-lg hover:bg-[#01aaa7]/5 transition-colors"
                  >
                    <span aria-hidden>📍</span>
                    Use my location
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && (
          <div className="hidden md:block absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-full max-w-4xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
            {/* Recent Searches */}
            {recentSearches.length > 0 && !q && (
              <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  <Clock className="h-3 w-3" />
                  {t('header.recentSearches')}
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            )}

            {/* Trending Searches */}
            {!q && (
              <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  <TrendingUp className="h-3 w-3" />
                  {t('header.trendingSearches')}
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.slice(0, 6).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Suggestions */}
            {q.length >= 2 && searchSuggestions.length > 0 && (
              <div className="p-3">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  Suggestions
                </div>
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {q.length >= 2 && searchSuggestions.length === 0 && (
              <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                No suggestions found for "{q}"
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-600 py-4">
            <div className="space-y-2">
              <Link 
                to="/items" 
                className="block px-2 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                Browse Items
              </Link>
              {/* Top categories quick links */}
              <div className="grid grid-cols-2 gap-2 px-2">
                {topCategories.slice(0,6).map(c => (
                  <Link key={c.id} to={`/items?category=${c.id}`} className="text-sm px-3 py-2 rounded-lg border hover:border-[#01aaa7] text-gray-700 dark:text-gray-300">
                    {c.label}
                  </Link>
                ))}
              </div>
              <Link 
                to="/list-property" 
                className="block px-2 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                List Your Item
              </Link>
              {isAuthenticated && (
                <>
                  <Link 
                    to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                    className="block px-2 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <span>{user?.role === 'admin' ? 'Admin Dashboard' : 'My Account'}</span>
                      {user?.role === 'admin' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          Admin
                        </span>
                      )}
                    </div>
                  </Link>
                  <Link 
                    to="/favorites" 
                    className="block px-2 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    Favorites
                  </Link>
                </>
              )}
              
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