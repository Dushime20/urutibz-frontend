import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  ChevronDown,
  Globe,
  Menu,
  X,
  Moon,
  Sun,
  Search,
  User,
  PlusCircle,
  Clock,
  TrendingUp,
  MapPin,
  Calendar,
  Filter,
  Headphones,
  Phone,
  Sparkles
} from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useAdminSettingsContext } from '../../contexts/AdminSettingsContext';
import { useTranslation } from '../../hooks/useTranslation';
import { LanguageSwitcher } from '../language-switcher';
import { TranslatedText } from '../translated-text';
import RealtimeNotifications from '../RealtimeNotifications';
import axios from '../../lib/http';
import { API_BASE_URL } from '../../pages/admin/service/config';

type HeaderCategory = { id: string; label: string };

const primaryNavLinks = [
  { label: 'Marketplace', to: '/items' },
  { label: 'For Renters', to: '/favorites' },
  { label: 'For Suppliers', to: '/create-listing' },
  { label: 'Enterprise', to: '/risk-management' },
  { label: 'Support', to: '/faq' }
];

const quickFilterPresets = [
  { label: 'Instant book', value: 'instant', query: 'instant booking' },
  { label: 'Verified hosts', value: 'verified', query: 'verified host' },
  { label: 'Long term', value: 'long term', query: 'monthly rental' },
  { label: 'Premium gear', value: 'premium', query: 'pro equipment' }
];

const tickerMessages = [
  '45 countries onboarding new rental fleets this month',
  'New: AI condition reports now live in Spanish & French',
  'Enterprise SLA: 30-min global support, 24/7/365'
];

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { settings } = useAdminSettingsContext();
  const { language, tSync } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [topCategories, setTopCategories] = useState<HeaderCategory[]>([]);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const searchTimeoutRef = useRef<number | null>(null);
  const autoSearchTimeoutRef = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [tickerIndex, setTickerIndex] = useState(0);

  const roleDestination =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'inspector'
      ? '/inspector'
      : user?.role === 'moderator'
      ? '/moderator'
      : '/dashboard';

  const roleLinkLabel =
    user?.role === 'admin'
      ? 'Admin Console'
      : user?.role === 'inspector'
      ? 'Inspector Console'
      : user?.role === 'moderator'
      ? 'Moderator Console'
      : 'My Account';

  const params = new URLSearchParams(location.search);
  const [q, setQ] = useState<string>(params.get('q') || '');
  const [category, setCategory] = useState<string>(params.get('category') || 'all');
  const [checkIn, setCheckIn] = useState<string>(params.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState<string>(params.get('checkOut') || '');
  const [nearMe, setNearMe] = useState<boolean>(params.get('nearMe') === 'true');
  const [lat, setLat] = useState<string>(params.get('lat') || '');
  const [lng, setLng] = useState<string>(params.get('lng') || '');
  const [radiusKm, setRadiusKm] = useState<number>(Number(params.get('radiusKm') || 25));
  const [priceMin, setPriceMin] = useState<string>(params.get('priceMin') || '');
  const [priceMax, setPriceMax] = useState<string>(params.get('priceMax') || '');

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/categories`);
        const rows = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : [];
        const cats: HeaderCategory[] = rows.map((c: any) => ({ id: c.id || c.slug || c.name, label: c.name }));
        setTopCategories(cats.slice(0, 12));
      } catch {
        setTopCategories([]);
      }
    })();
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

  const generateSearchSuggestions = useCallback((query: string): string[] => {
    if (!query || query.length < 2) return [];

    const suggestions = [
      'camera rental',
      'car rental',
      'laptop rental',
      'drone rental',
      'event equipment',
      'photography gear',
      'outdoor gear',
      'tools rental',
      'party supplies',
      'fitness equipment',
      'travel gear',
      'home appliances',
      'Canon camera',
      'Nikon lens',
      'DJI drone',
      'MacBook Pro',
      'iPhone rental',
      'iPad rental',
      'Sony camera',
      'GoPro',
      'wedding photography',
      'corporate events',
      'birthday party',
      'conference equipment',
      'trade show booth',
      'exhibition setup',
      'near me',
      'downtown',
      'city center',
      'airport pickup',
      'daily rental',
      'weekly rental',
      'monthly rental',
      'long term'
    ];

    return suggestions
      .filter(
        (suggestion) =>
          suggestion.toLowerCase().includes(query.toLowerCase()) ||
          query
            .toLowerCase()
            .split(' ')
            .some((word) => suggestion.toLowerCase().includes(word))
      )
      .slice(0, 8);
  }, []);

  const buildSearchParams = useCallback(
    (overrides?: Partial<{ q: string; category: string; priceMin: string; priceMax: string; checkIn: string; checkOut: string; nearMe: boolean; lat: string; lng: string; radiusKm: number }>) => {
      const effective = {
        q,
        category,
        priceMin,
        priceMax,
        checkIn,
        checkOut,
        nearMe,
        lat,
        lng,
        radiusKm,
        ...overrides
      };
      const sp = new URLSearchParams();
      if (effective.q) sp.set('q', effective.q);
      if (effective.category && effective.category !== 'all') sp.set('category', effective.category);
      if (effective.priceMin) sp.set('priceMin', effective.priceMin);
      if (effective.priceMax) sp.set('priceMax', effective.priceMax);
      if (effective.checkIn) sp.set('checkIn', effective.checkIn);
      if (effective.checkOut) sp.set('checkOut', effective.checkOut);
      if (effective.nearMe && effective.lat && effective.lng) {
        sp.set('nearMe', 'true');
        sp.set('lat', effective.lat);
        sp.set('lng', effective.lng);
        if (effective.radiusKm) sp.set('radiusKm', String(effective.radiusKm));
      }
      return { params: sp, effective };
    },
    [q, category, priceMin, priceMax, checkIn, checkOut, nearMe, lat, lng, radiusKm]
  );

  const performAutoSearch = useCallback(
    (overrides?: Parameters<typeof buildSearchParams>[0]) => {
      const { params, effective } = buildSearchParams(overrides);
      const queryString = params.toString();
      const recentValue = overrides?.q ?? effective.q;
      if (recentValue && recentValue.length >= 2) {
        const newRecentSearches = [recentValue, ...recentSearches.filter((s) => s !== recentValue)].slice(0, 5);
        setRecentSearches(newRecentSearches);
        localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
      }
      navigate(`/items${queryString ? `?${queryString}` : ''}`);
      setShowSuggestions(false);
    },
    [buildSearchParams, navigate, recentSearches]
  );

  const handleCategoryChange = useCallback(
    (value: string) => {
      setCategory(value);
      performAutoSearch({ category: value });
    },
    [performAutoSearch]
  );

  const performQuickSearch = useCallback(
    (override: Partial<{ q: string; category: string }>) => {
      if (override.q !== undefined) setQ(override.q);
      if (override.category !== undefined) setCategory(override.category);
      performAutoSearch(override);
    },
    [performAutoSearch]
  );

  const performAutoSearchOnQuery = useCallback(() => {
    performAutoSearch();
    setIsMenuOpen(false);
  }, [performAutoSearch]);

  const debouncedSearch = useCallback(
    (query: string) => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (autoSearchTimeoutRef.current) clearTimeout(autoSearchTimeoutRef.current);

      searchTimeoutRef.current = window.setTimeout(() => {
        if (query.length >= 2) {
          setIsSearching(true);
          setSearchSuggestions(generateSearchSuggestions(query));
          setShowSuggestions(true);

          autoSearchTimeoutRef.current = window.setTimeout(() => {
            performAutoSearch();
          }, 1000);
        } else {
          setSearchSuggestions([]);
          setShowSuggestions(false);
        }
        setIsSearching(false);
      }, 300);
    },
    [generateSearchSuggestions, performAutoSearch]
  );

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (autoSearchTimeoutRef.current) clearTimeout(autoSearchTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const tickerInterval = window.setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickerMessages.length);
    }, 6000);
    return () => window.clearInterval(tickerInterval);
  }, []);

  const handleSearchInputChange = (value: string) => {
    setQ(value);
    debouncedSearch(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQ(suggestion);
    setShowSuggestions(false);
    performAutoSearch({ q: suggestion });
  };

  const submitSearch = () => {
    performAutoSearchOnQuery();
  };

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) setRecentSearches(JSON.parse(saved));
    setTrendingSearches([
      'camera rental',
      'car rental',
      'event equipment',
      'drone rental',
      'photography gear',
      'party supplies',
      'tools rental',
      'laptop rental'
    ]);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideInput = !!(searchInputRef.current && searchInputRef.current.contains(target));
      const insideSuggestions = !!(suggestionsRef.current && suggestionsRef.current.contains(target));
      if (insideInput || insideSuggestions) return;
      setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latitude = String(pos.coords.latitude);
        const longitude = String(pos.coords.longitude);
        setNearMe(true);
        setLat(latitude);
        setLng(longitude);
        performAutoSearch({ nearMe: true, lat: latitude, lng: longitude });
      },
      () => alert('Unable to retrieve your location. Please allow location access.'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if ((target as HTMLElement)?.closest?.('[data-sticky-portal]')) return;
      if (profileRef.current && !profileRef.current.contains(target as Node)) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  const normalizedCategories = React.useMemo(() => {
    const seen = new Set<string>();
    return topCategories
      .filter((c) => c?.label && c.label.trim().length > 0)
      .filter((c) => {
        const key = c.label.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [topCategories]);

  const displayCurrency = ((settings?.platform as any)?.defaultCurrency) || 'USD';

  return (
    <header className="sticky top-0 z-50 shadow-sm bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border-b border-white/20 dark:border-gray-700/60">
      {/* Global ticker */}
      <div className="hidden md:block bg-slate-900 text-white text-xs tracking-wide">
        <div className="max-w-9xl mx-auto px-6 lg:px-10 py-2 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2 uppercase">
            <Sparkles className="w-4 h-4 text-teal-300" />
            <span>{tSync(tickerMessages[tickerIndex])}</span>
          </div>
          <div className="flex items-center gap-5 text-white/80">
            <span className="inline-flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" />
              <span>+1 (415) 555-0112</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <Headphones className="w-3.5 h-3.5" />
              <TranslatedText text="24/7 Global Support" />
            </span>
            <span className="inline-flex items-center gap-2">
              <Globe className="w-3.5 h-3.5" />
              <span>{language?.toUpperCase() || 'EN'} · {displayCurrency}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4 py-3 lg:py-4">
            <div className="flex items-center gap-4 lg:gap-6">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src={settings?.business?.companyLogo || settings?.platform?.logoUrl || '/assets/img/yacht/urutilogo2.png'}
                  alt={settings?.business?.companyName || settings?.platform?.siteName || 'UrutiBz'}
                  className="h-12 lg:h-14 object-contain"
                />
                
              </Link>

              <nav className="hidden xl:flex items-center gap-6">
                <div className="relative">
                  <button
                    onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-200 hover:text-teal-600"
                  >
                    <TranslatedText text="Browse categories" />
                    <ChevronDown className="w-4 h-4" />
                  </button>
                {isCategoriesOpen && normalizedCategories.length > 0 && (
                  <div className="absolute left-0 mt-2 w-72 max-h-[420px] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-3 px-4 z-30">
                    {normalizedCategories.map((c) => (
                      <Link
                        key={c.id}
                        to={`/items?category=${encodeURIComponent(c.id)}`}
                        onClick={() => setIsCategoriesOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-100 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors"
                      >
                        <span className="inline-flex h-2 w-2 rounded-full bg-teal-500" />
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
                </div>
                {primaryNavLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`text-sm font-medium ${
                      location.pathname.startsWith(item.to)
                        ? 'text-teal-600'
                        : 'text-slate-600 dark:text-slate-300 hover:text-teal-600'
                    }`}
                  >
                    {tSync(item.label)}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center search bar */}
            <div className="hidden md:flex flex-1 min-w-[280px]">
              <div className="flex items-stretch flex-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="h-full rounded-l-full bg-gray-50 dark:bg-gray-900/40 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 border-r border-gray-200 dark:border-gray-700 focus:outline-none"
                  >
                    <option value="all">{tSync('All')}</option>
                    {topCategories.slice(0, 8).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </div>
                <div className="flex items-center flex-1 px-4">
                  <Search className={`w-4 h-4 mr-3 ${isSearching ? 'text-teal-500 animate-pulse' : 'text-slate-400'}`} />
                  <input
                    ref={searchInputRef}
                    value={q}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitSearch()}
                    onFocus={() => setShowSuggestions(q.length >= 2 || recentSearches.length > 0)}
                    placeholder={tSync('Search inventory, suppliers, SKU...')}
                    className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <button
                  onClick={submitSearch}
                  className="px-5 rounded-r-full bg-teal-600 text-white text-sm font-semibold hover:bg-teal-500 focus:ring-2 focus:ring-offset-1 focus:ring-teal-500"
                >
                  <TranslatedText text="Search" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-3 ml-auto">
              <button
                onClick={toggleDarkMode}
                className="inline-flex p-2 rounded-full border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-200 hover:text-teal-600 transition-colors"
                aria-label={tSync('Toggle theme')}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <div className="hidden md:block">
                <LanguageSwitcher buttonClassName="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-200 hover:text-teal-600 rounded-lg" />
              </div>

              <Link
                to="/create-listing"
                className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-teal-500 text-teal-600 font-semibold hover:bg-teal-50"
              >
                <PlusCircle className="w-4 h-4" />
                <TranslatedText text="List inventory" />
              </Link>

              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <RealtimeNotifications />
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 hover:border-teal-400"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center text-white">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <div className="hidden lg:flex flex-col items-start">
                      <span className="text-[0.6rem] text-slate-500 dark:text-slate-300 uppercase tracking-wide">
                        {user?.role === 'admin' ? tSync('Operator') : tSync('Member')}
                      </span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
                        {user?.name}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </button>

                  {isProfileOpen && (
                    <div
                      ref={profileRef}
                      className="absolute top-full right-6 mt-3 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-3 z-40"
                    >
                      <div className="px-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                      </div>
                      <div className="py-2">
                        {/* <Link to="/profile" className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-800">
                          <TranslatedText text="Profile" />
                        </Link> */}
                        <Link
                          to={roleDestination}
                          className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-800"
                        >
                          <TranslatedText text={roleLinkLabel} />
                        </Link>
                        {/* <Link to="/my-rentals" className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-800">
                          <TranslatedText text="Orders & inspections" />
                        </Link> */}
                      </div>
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                        <button
                          onClick={logout}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-2xl"
                        >
                          <TranslatedText text="Sign out" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-slate-600 hover:border-teal-400">
                    <TranslatedText text="Log in" />
                  </Link>
                  {(settings?.platform?.allowUserRegistration && (settings?.system as any)?.registrationEnabled) && (
                    <Link to="/register" className="px-4 py-2 rounded-full bg-gradient-to-r from-teal-500 to-sky-500 text-white text-sm font-semibold shadow-lg hover:opacity-90">
                      <TranslatedText text="Create account" />
                    </Link>
                  )}
                </div>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-full border border-gray-200 dark:border-gray-700"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Slim filter rail */}
          {/* <div className="hidden lg:flex items-center gap-3 border-t border-gray-100 dark:border-gray-800 pt-3 mt-2">
            <button
              type="button"
              onClick={detectLocation}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 hover:border-teal-400"
            >
              <MapPin className="w-3.5 h-3.5 text-teal-500" />
              {nearMe && lat && lng ? tSync('Near you') : tSync('Use location')}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300"
            >
              <Calendar className="w-3.5 h-3.5 text-teal-500" />
              {checkIn || checkOut ? `${checkIn || 'Start'} → ${checkOut || 'End'}` : tSync('Dates')}
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300"
            >
              <Filter className="w-3.5 h-3.5 text-teal-500" />
              <TranslatedText text="Filters" />
            </button>
            {quickFilterPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => performQuickSearch({ q: preset.query })}
                className="px-3 py-1.5 text-xs font-semibold rounded-full border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-300 hover:border-teal-400"
              >
                {tSync(preset.label)}
              </button>
            ))}
          </div> */}
        </div>

        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className="hidden md:block absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-full max-w-4xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {recentSearches.length > 0 && !q && (
              <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  <Clock className="h-3 w-3" />
                  <TranslatedText text="Recent Searches" />
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

            {!q && (
              <div className="p-3 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  <TrendingUp className="h-3 w-3" />
                  <TranslatedText text="Trending Searches" />
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

            {q.length >= 2 && searchSuggestions.length > 0 && (
              <div className="p-3">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  <TranslatedText text="Suggestions" />
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

            {q.length >= 2 && searchSuggestions.length === 0 && (
              <div className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
                <TranslatedText text="No suggestions for" /> "{q}"
              </div>
            )}
          </div>
        )}

        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-600 py-4 px-4">
            <div className="space-y-3">
              <Link
                to="/items"
                className="block px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-teal-500"
              >
                <TranslatedText text="Marketplace" />
              </Link>

              <div className="grid grid-cols-2 gap-2">
                {topCategories.slice(0, 6).map((c) => (
                  <Link
                    key={c.id}
                    to={`/items?category=${c.id}`}
                    className="text-sm px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>

              <Link
                to="/create-listing"
                className="block px-3 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-sky-500 text-white text-center font-semibold"
              >
                <TranslatedText text="List inventory" />
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                    className="block px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    {user?.role === 'admin' ? <TranslatedText text="Admin Console" /> : <TranslatedText text="My Account" />}
                  </Link>
                  <Link
                    to="/favorites"
                    className="block px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <TranslatedText text="Favorites" />
                  </Link>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-center"
                  >
                    <TranslatedText text="Log in" />
                  </Link>
                  {(settings?.platform?.allowUserRegistration && (settings?.system as any)?.registrationEnabled) && (
                    <Link
                      to="/register"
                      className="block px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center font-semibold"
                    >
                      <TranslatedText text="Create account" />
                    </Link>
                  )}
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

