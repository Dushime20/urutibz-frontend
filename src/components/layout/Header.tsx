import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronDown, Globe, Menu, X, Bot, Moon, Sun, Search, User, PlusCircle } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

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
  const [, setLanguage] = useState(languages[0]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

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

  const submitSearch = () => {
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
    // Navigate to search page with parameters
    navigate(`/items/search${sp.toString() ? `?${sp.toString()}` : ''}`);
    setIsMenuOpen(false);
  };

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
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md dark:bg-gray-900/80 border-b border-platform-light-grey/80 dark:border-gray-700/60 shadow-sm">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 lg:py-4">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4 lg:space-x-8">
            <Link to="/" className="flex items-center space-x-2 lg:space-x-3">
              <div className="flex items-center">
                <img 
                  src="/assets/img/yacht/urutilogo2.png" 
                  alt="UrutiBz" 
                  className="h-24 w-52  lg:w-auto object-contain opacity-100 flex-shrink-0 drop-shadow-sm" 
                />
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
                        setLanguage(lang);
                        setIsLanguageOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-platform-grey dark:text-gray-300 hover:bg-platform-light-grey/50 dark:hover:bg-gray-700 hover:text-platform-dark-grey dark:hover:text-white transition-colors duration-200"
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
                <Link 
                  to="/register" 
                  className="inline-flex items-center px-4 py-2 text-sm font-medium bg-[#01aaa7] text-white rounded-platform hover:opacity-90"
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

        {/* Full-width Search Row (desktop) */}
        <div className="hidden md:block pb-3">
          <div className="flex items-center justify-center">
            <div className="flex items-stretch divide-x divide-gray-200 dark:divide-slate-600 border border-gray-200 dark:border-slate-600 rounded-full overflow-hidden bg-white dark:bg-slate-800 w-full max-w-4xl">
              {/* What */}
              <div className="px-5 py-3 text-left">
                <div className="text-xs font-semibold text-gray-700 dark:text-slate-300">What</div>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && submitSearch()}
                  placeholder="Search items, categories..."
                  className="mt-0.5 text-sm outline-none placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-100 bg-transparent w-56"
                />
              </div>

              {/* Category */}
              <div className="px-5 py-3 text-left">
                <div className="text-xs font-semibold text-gray-700 dark:text-slate-300">Category</div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-0.5 text-sm outline-none text-gray-900 dark:text-slate-100 bg-transparent w-32 border-none"
                >
                  <option value="all">All Items</option>
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

              {/* Price Range */}
              <div className="px-5 py-3 text-left">
                <div className="text-xs font-semibold text-gray-700 dark:text-slate-300">Price Range</div>
                <div className="mt-0.5 flex items-center gap-1">
                  <input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder="Min"
                    className="text-sm outline-none placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-100 bg-transparent w-16 border-none"
                  />
                  <span className="text-gray-500 dark:text-slate-400">-</span>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder="Max"
                    className="text-sm outline-none placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-100 bg-transparent w-16 border-none"
                  />
                </div>
              </div>

              {/* Start Date */}
              <div className="px-5 py-3 text-left">
                <div className="text-xs font-semibold text-gray-700 dark:text-slate-300">Start Date</div>
                <input
                  type="text"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  placeholder="When do you need it?"
                  className="mt-0.5 text-sm outline-none placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-100 bg-transparent w-36"
                  onFocus={(e) => { e.currentTarget.type = 'date'; }}
                  onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.type = 'text'; }}
                />
              </div>

              {/* End Date */}
              <div className="px-5 py-3 text-left">
                <div className="text-xs font-semibold text-gray-700 dark:text-slate-300">End Date</div>
                <input
                  type="text"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  placeholder="Return date"
                  className="mt-0.5 text-sm outline-none placeholder-gray-500 dark:placeholder-slate-400 text-gray-900 dark:text-slate-100 bg-transparent w-36"
                  onFocus={(e) => { e.currentTarget.type = 'date'; }}
                  onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.type = 'text'; }}
                />
              </div>

              {/* Near me */}
              <div className="px-5 py-3 text-left">
                <div className="text-xs font-semibold text-gray-700 dark:text-slate-300">Near me</div>
                {nearMe && lat && lng ? (
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700">
                      ✓ Using location
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(Number(e.target.value) || 25)}
                      className="text-sm outline-none w-24 border border-gray-200 dark:border-slate-600 rounded-full px-3 py-1 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100"
                      placeholder="km"
                      title="Radius in kilometers"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={detectLocation}
                    className="mt-0.5 inline-flex items-center gap-1 text-sm text-my-primary dark:text-teal-400 hover:underline"
                  >
                    <span aria-hidden>📍</span>
                    Use current location
                  </button>
                )}
              </div>

              {/* Search icon */}
              <div className="flex items-center px-3">
                <button
                  onClick={submitSearch}
                  aria-label="Search"
                  className="h-10 w-10 rounded-full bg-my-primary dark:bg-teal-500 text-white hover:opacity-90 flex items-center justify-center"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

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