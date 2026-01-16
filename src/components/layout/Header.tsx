import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  Headphones,
  Phone,
  Sparkles,
  LayoutGrid,
  Tag,
  ArrowRight,
  Camera,
  Package
} from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useAdminSettingsContext } from '../../contexts/AdminSettingsContext';
import { useTranslation } from '../../hooks/useTranslation';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useToast } from '../../contexts/ToastContext';
import { LanguageSwitcher } from '../language-switcher';
import { TranslatedText } from '../translated-text';
import RealtimeNotifications from '../RealtimeNotifications';
import axios from '../../lib/http';
import { API_BASE_URL } from '../../pages/admin/service/config';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
// @ts-ignore - CSS import for Swiper
import 'swiper/css';
import { fetchAvailableProducts } from '../../pages/admin/service';
import { getProductImagesByProductId } from '../../pages/my-account/service/api';
import ImageSearchModal from '../products/ImageSearchModal';
import { ImageSearchResult } from '../../pages/admin/service/imageSearch';
import CartIcon from '../cart/CartIcon';
import CartDrawer from '../cart/CartDrawer';
import AIChatbotModal from './AIChatbotModal';
import { parseSearchQuery } from '../../utils/smartSearch';

type HeaderCategory = { id: string; label: string };

const primaryNavLinks = [
  { label: 'Marketplace', to: '/items' },
  { label: 'Favorites', to: '/favorites' },
  { label: 'For Suppliers', to: '/suppliers' },
  { label: 'Enterprise', to: '/enterprise' },
  { label: 'Support', to: '/faq' }
];

const primaryNavItems = [
  { label: 'Marketplace', to: '/items', icon: LayoutGrid },
  { label: 'Favorites', to: '/favorites', icon: Tag },
  { label: 'For Suppliers', to: '/suppliers', icon: PlusCircle },
  { label: 'Enterprise', to: '/enterprise', icon: TrendingUp },
  { label: 'Support', to: '/faq', icon: Headphones }
];

// Removed hardcoded mobileUtilityChips and quickFilterPresets - now using categories from database

// Ticker messages will be translated when displayed
const tickerMessages = [
  '45 countries onboarding new rental fleets this month',
  'New: AI condition reports now live in Spanish & French',
  'Enterprise SLA: 30-min global support, 24/7/365'
];

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { settings } = useAdminSettingsContext();
  const { language, tSync, t } = useTranslation();
  const { canInstall, isIOS, handleInstall } = usePWAInstall();
  const { showToast } = useToast();

  useEffect(() => {
    console.log('[Header Debug] Full Settings:', settings);
    console.log('[Header Debug] Business Logo:', settings?.business?.companyLogo);
    console.log('[Header Debug] Platform Logo:', settings?.platform?.logoUrl);
    console.log('[Header Debug] Company Name:', settings?.business?.companyName);
    console.log('[Header Debug] Site Name:', settings?.platform?.siteName);
  }, [settings]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const [topCategories, setTopCategories] = useState<HeaderCategory[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
  const [categoryProductImages, setCategoryProductImages] = useState<Record<string, string[]>>({});
  const [loadingCategoryProducts, setLoadingCategoryProducts] = useState(false);
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [searchSuggestions, setSearchSuggestions] = useState<Array<{ type: 'product' | 'category'; name: string; id?: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const searchTimeoutRef = useRef<number | null>(null);
  const autoSearchTimeoutRef = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Translated attributes for accessibility
  const [translatedAttrs, setTranslatedAttrs] = useState<Record<string, string>>({});

  // Translate attribute strings on language change
  useEffect(() => {
    const translateAttrs = async () => {
      const attrs = {
        'Search inventory': await t('Search inventory'),
        'Toggle theme': await t('Toggle theme'),
        'Toggle menu': await t('Toggle menu'),
        'Search by image': await t('Search by image'),
        'Search': await t('Search'),
        'Browse categories': await t('Browse categories'),
        'Navigation menu': await t('Navigation menu'),
        'Close menu': await t('Close menu'),
        'Close search': await t('Close search'),
        'Search inventory, suppliers, SKU...': await t('Search inventory, suppliers, SKU...'),
      };
      setTranslatedAttrs(attrs);
    };
    translateAttrs();
  }, [language, t]);

  const roleDestination =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'inspector'
        ? '/inspector'
        : user?.role === 'moderator'
          ? '/moderator'
          : '/dashboard';

  const roleLinkLabel = useMemo(() => {
    if (user?.role === 'admin') return 'Admin Console';
    if (user?.role === 'inspector') return 'Inspector Console';
    if (user?.role === 'moderator') return 'Moderator Console';
    return 'My Account';
  }, [user?.role]);

  const mobileBottomNavItems = useMemo(
    () => [
      { key: 'explore', label: 'Explore', to: '/items', icon: LayoutGrid },
      { key: 'trips', label: 'Trips', to: '/bookings', icon: Clock },
      { key: 'list', label: 'List', to: '/create-listing', icon: PlusCircle },
      { key: 'support', label: 'Support', to: '/support', icon: Headphones },
      { key: 'account', label: isAuthenticated ? 'Account' : 'Login', to: isAuthenticated ? roleDestination : '/login', icon: User }
    ],
    [isAuthenticated, roleDestination]
  );

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
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

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
        setAllCategories(rows);
      } catch {
        setTopCategories([]);
        setAllCategories([]);
      }
    })();

    // Fetch products for search suggestions
    (async () => {
      try {
        const token = localStorage.getItem('token') || undefined;
        const result = await fetchAvailableProducts(token, true);
        const products = result.data || [];
        // Limit to first 100 products for performance
        setAllProducts(products.slice(0, 100));
      } catch {
        setAllProducts([]);
      }
    })();
    const p = new URLSearchParams(location.search);
    const urlQuery = p.get('q') || '';
    setQ(urlQuery);
    setCategory(p.get('category') || 'all');
    setCheckIn(p.get('checkIn') || '');
    setCheckOut(p.get('checkOut') || '');
    setNearMe(p.get('nearMe') === 'true');
    setLat(p.get('lat') || '');
    setLng(p.get('lng') || '');
    setRadiusKm(Number(p.get('radiusKm') || 25));
    setPriceMin(p.get('priceMin') || '');
    setPriceMax(p.get('priceMax') || '');

    // Clear suggestions when URL changes - they'll be regenerated on focus/type
    if (urlQuery.length < 2) {
      setSearchSuggestions([]);
    }
  }, [location.search]);

  const generateSearchSuggestions = useCallback((query: string): Array<{ type: 'product' | 'category'; name: string; id?: string }> => {
    if (!query || query.length < 2) return [];

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ').filter(w => w.length > 0);

    const suggestions: Array<{ type: 'product' | 'category'; name: string; id?: string }> = [];

    // Search in product names
    const productMatches = allProducts
      .filter((product: any) => {
        const productName = (product.title || product.name || '').toString().toLowerCase();
        return productName.includes(queryLower) ||
          queryWords.some((word) => productName.includes(word));
      })
      .slice(0, 5)
      .map((product: any) => ({
        type: 'product' as const,
        name: product.title || product.name || 'Product',
        id: product.id
      }));

    suggestions.push(...productMatches);

    // Search in category names
    const categoryMatches = allCategories
      .filter((category: any) => {
        const categoryName = (category.name || category.label || '').toString().toLowerCase();
        return categoryName.includes(queryLower) ||
          queryWords.some((word) => categoryName.includes(word));
      })
      .slice(0, 3)
      .map((category: any) => ({
        type: 'category' as const,
        name: category.name || category.label || 'Category',
        id: category.id || category.slug
      }));

    suggestions.push(...categoryMatches);

    // Remove duplicates and limit to 8 suggestions
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) =>
        index === self.findIndex((s) => s.name.toLowerCase() === suggestion.name.toLowerCase())
      )
      .slice(0, 8);

    return uniqueSuggestions;
  }, [allProducts, allCategories, tSync]);

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
    (overrides?: Parameters<typeof buildSearchParams>[0], keepSuggestionsOpen: boolean = false) => {
      const { params, effective } = buildSearchParams(overrides);
      const queryString = params.toString();
      const recentValue = overrides?.q ?? effective.q;
      if (recentValue && recentValue.length >= 2) {
        const newRecentSearches = [recentValue, ...recentSearches.filter((s) => s !== recentValue)].slice(0, 5);
        setRecentSearches(newRecentSearches);
        localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
      }
      navigate(`/items${queryString ? `?${queryString}` : ''}`);
      // Only close suggestions if explicitly requested
      if (!keepSuggestionsOpen) {
        setShowSuggestions(false);
      }
    },
    [buildSearchParams, navigate, recentSearches]
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
          // Removed auto-search - users will manually trigger search or click suggestions
        } else if (query.length === 0) {
          setSearchSuggestions([]);
          setShowSuggestions(false);
        } else {
          // For single character, keep suggestions hidden
          setSearchSuggestions([]);
          setShowSuggestions(false);
        }
        setIsSearching(false);
      }, 300);
    },
    [generateSearchSuggestions]
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

  const openMobileSearch = useCallback(() => {
    setIsMobileSearchOpen(true);
  }, []);

  const closeMobileSearch = useCallback(() => {
    setIsMobileSearchOpen(false);
    setShowSuggestions(false);
  }, []);

  const handleSuggestionClick = (e: React.MouseEvent, suggestion: string | { type: 'product' | 'category'; name: string; id?: string }) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof suggestion === 'string') {
      setQ(suggestion);
      setShowSuggestions(false);
      // Navigate to search results
      performAutoSearch({ q: suggestion }, false);
    } else {
      if (suggestion.type === 'category' && suggestion.id) {
        setQ(suggestion.name);
        setCategory(suggestion.id);
        setShowSuggestions(false);
        performAutoSearch({ q: suggestion.name, category: suggestion.id }, false);
      } else if (suggestion.type === 'product' && suggestion.id) {
        // For products, navigate directly to product page
        setShowSuggestions(false);
        navigate(`/it/${suggestion.id}`);
      } else {
        setQ(suggestion.name);
        setShowSuggestions(false);
        performAutoSearch({ q: suggestion.name }, false);
      }
    }

    if (isMobileSearchOpen) {
      closeMobileSearch();
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                             Search Logic                                   */
  /* -------------------------------------------------------------------------- */
  const submitSearch = () => {
    if (q.length >= 2) {
      performAutoSearchOnQuery();
      // After navigation, refocus input to allow continued searching
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          // Show suggestions again for the current query
          setSearchSuggestions(generateSearchSuggestions(q));
          setShowSuggestions(true);
        }
      }, 300);
    } else {
      performAutoSearchOnQuery();
    }
  };

  const renderSuggestionContent = (variant: 'dropdown' | 'full') => {
    const sectionPadding = variant === 'dropdown' ? 'p-3' : 'p-4';
    const borderClass = 'border-b border-gray-100 dark:border-gray-700';
    return (
      <>
        {recentSearches.length > 0 && !q && (
          <div className={`${sectionPadding} ${borderClass}`}>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              <Clock className="h-3 w-3" />
              <TranslatedText text="Recent Searches" />
            </div>
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onMouseDown={(e) => handleSuggestionClick(e, search)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {search}
              </button>
            ))}
          </div>
        )}

        {!q && (
          <div className={`${sectionPadding} ${borderClass}`}>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              <TrendingUp className="h-3 w-3" />
              <TranslatedText text="Trending Searches" />
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.slice(0, 6).map((search, index) => (
                <button
                  key={index}
                  onMouseDown={(e) => handleSuggestionClick(e, search)}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {q.length >= 2 && searchSuggestions.length > 0 && (
          <div className={sectionPadding}>
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              <TranslatedText text="Suggestions" />
            </div>
            {searchSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onMouseDown={(e) => handleSuggestionClick(e, suggestion)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
              >
                {suggestion.type === 'product' ? (
                  <>
                    <Package className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                    <span className="flex-1"><TranslatedText text={suggestion.name} /></span>
                    <span className="text-xs text-gray-500 dark:text-gray-400"><TranslatedText text="Product" /></span>
                  </>
                ) : (
                  <>
                    <LayoutGrid className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="flex-1"><TranslatedText text={suggestion.name} /></span>
                    <span className="text-xs text-gray-500 dark:text-gray-400"><TranslatedText text="Category" /></span>
                  </>
                )}
              </button>
            ))}
          </div>
        )}

        {q.length >= 2 && searchSuggestions.length === 0 && (
          <div className={`${sectionPadding} text-center text-sm text-gray-500 dark:text-gray-400`}>
            <TranslatedText text="No suggestions for" /> "{q}"
          </div>
        )}
      </>
    );
  };

  const handleImageSearchResults = (results: ImageSearchResult[]) => {
    // Navigate to search page with image search results
    navigate('/items', {
      state: { imageSearchResults: results, searchMode: 'image' }
    });
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

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      const msg = await t('Geolocation is not supported by your browser.');
      alert(msg);
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
      async () => {
        const msg = await t('Unable to retrieve your location. Please allow location access.');
        alert(msg);
      },
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

  useEffect(() => {
    if (isMenuOpen || isMobileSearchOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
    return undefined;
  }, [isMenuOpen, isMobileSearchOpen]);

  useEffect(() => {
    if (isMobileSearchOpen) {
      const timer = window.setTimeout(() => {
        searchInputRef.current?.focus();
      }, 200);
      setShowSuggestions(true);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [isMobileSearchOpen]);

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

  useEffect(() => {
    if (isCategoriesOpen && normalizedCategories.length > 0) {
      setActiveCategoryId((prev) => prev ?? normalizedCategories[0].id);
    }
  }, [isCategoriesOpen, normalizedCategories]);

  useEffect(() => {
    if (!isCategoriesOpen) {
      setActiveCategoryId(null);
      setCategoryProducts([]);
      setCategoryProductImages({});
    }
  }, [isCategoriesOpen]);

  // Fetch products when category is hovered
  useEffect(() => {
    if (!activeCategoryId || !isCategoriesOpen) {
      setCategoryProducts([]);
      setCategoryProductImages({});
      return;
    }

    let isMounted = true;
    const fetchCategoryProducts = async () => {
      try {
        setLoadingCategoryProducts(true);
        const token = localStorage.getItem('token') || undefined;

        // Fetch all products
        const result = await fetchAvailableProducts(token, true);
        const allProducts = result.data || [];

        // Filter products by category
        const filtered = allProducts.filter((p: any) => {
          const categoryId = p.category_id || p.categoryId;
          return categoryId && String(categoryId) === String(activeCategoryId);
        }).slice(0, 12); // Limit to 12 products

        if (isMounted) {
          setCategoryProducts(filtered);

          // Fetch images for products
          const imagesMap: Record<string, string[]> = {};
          await Promise.all(
            filtered.map(async (product: any) => {
              try {
                const imgs = await getProductImagesByProductId(product.id);
                const normalized: string[] = [];
                if (Array.isArray(imgs)) {
                  imgs.forEach((img: any) => {
                    if (img && img.image_url) {
                      normalized.push(img.image_url);
                    }
                  });
                }
                imagesMap[product.id] = normalized.length ? normalized : [];
              } catch {
                imagesMap[product.id] = [];
              }
            })
          );

          if (isMounted) {
            setCategoryProductImages(imagesMap);
          }
        }
      } catch (error) {
        console.error('Failed to fetch category products:', error);
        if (isMounted) {
          setCategoryProducts([]);
        }
      } finally {
        if (isMounted) {
          setLoadingCategoryProducts(false);
        }
      }
    };

    fetchCategoryProducts();

    return () => {
      isMounted = false;
    };
  }, [activeCategoryId, isCategoriesOpen]);

  const activeCategory = useMemo(
    () => normalizedCategories.find((c) => c.id === activeCategoryId) || null,
    [normalizedCategories, activeCategoryId]
  );

  const displayCurrency = ((settings?.platform as any)?.defaultCurrency) || 'USD';

  const isNavItemActive = useCallback(
    (path: string) => {
      const current = location.pathname || '/';
      if (path === '/items') {
        return current === '/' || current.startsWith('/items');
      }
      if (path === '/bookings') {
        return current.startsWith('/bookings');
      }
      if (path === '/support') {
        return current.startsWith('/support') || current.startsWith('/faq');
      }
      return current.startsWith(path);
    },
    [location.pathname]
  );

  return (
    <>
      <header className="sticky top-0 z-50 shadow-sm bg-white/90 dark:bg-gray-900/80 backdrop-blur-md border-b border-white/20 dark:border-gray-700/60">
        {/* Global ticker - Mobile version */}
        <div className="md:hidden bg-slate-900 text-white text-xs tracking-wide">
          <div className="max-w-9xl mx-auto px-4 py-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <Sparkles className="w-3 h-3 text-teal-300 flex-shrink-0" />
                <span className="truncate uppercase text-[10px] sm:text-xs">
                  <TranslatedText text={tickerMessages[tickerIndex]} />
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {canInstall && (
                  <button
                    onClick={async () => {
                      const installed = await handleInstall();
                      if (!installed && isIOS) {
                        // For iOS, show toast with instructions
                        showToast('Tap Share button (□↑) → Add to Home Screen', 'info');
                      } else if (installed) {
                        showToast('App installed successfully!', 'success');
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white transition-colors active:scale-95"
                    title={isIOS ? 'Add to Home Screen' : 'Install App'}
                    aria-label={isIOS ? 'Add to Home Screen' : 'Install App'}
                  >
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                      style={{ color: 'white' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    <span className="text-[10px] text-white sm:text-xs sm:inline">Install</span>
                  </button>
                )}
                <span className="inline-flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span className="text-[10px] sm:text-xs">{language?.toUpperCase() || 'EN'}</span>

                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global ticker - Desktop version */}
        <div className="hidden md:block bg-slate-900 text-white text-xs tracking-wide">
          <div className="max-w-9xl mx-auto px-6 lg:px-20 py-2 flex items-center justify-between gap-6">
            <div className="flex items-center gap-2 uppercase">
              <Sparkles className="w-4 h-4 text-teal-300" />
              <span><TranslatedText text={tickerMessages[tickerIndex]} /></span>
            </div>
            <div className="flex items-center gap-5 text-white/80">
              {canInstall && (
                <button
                  onClick={async () => {
                    const installed = await handleInstall();
                    if (!installed && isIOS) {
                      // For iOS, show toast with instructions
                      showToast('Tap Share button (□↑) → Add to Home Screen', 'info');
                    } else if (installed) {
                      showToast('App installed successfully!', 'success');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-teal-600 hover:bg-teal-700 text-white transition-colors font-medium active:scale-95"
                  title={isIOS ? 'Add to Home Screen' : 'Install App'}
                  aria-label={isIOS ? 'Add to Home Screen' : 'Install App'}
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    style={{ color: 'white' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  <span className="text-xs text-white">{isIOS ? 'Add to Home' : 'Install App'}</span>
                </button>
              )}
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
          <div className="w-full px-6 lg:px-20 mx-auto">
            <div className="py-6 lg:py-4 space-y-3 md:space-y-0">
              {/* Mobile compact header - Only for small mobile devices */}
              {/* Mobile Header Layout */}
              <div className="md:hidden flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Link to="/" className="block w-20 h-20 bg-red-500">
                    <img
                      src={
                        settings?.business?.companyLogo ||
                        settings?.platform?.logoUrl ||
                        '/assets/img/yacht/urutilogo2.png'
                      }
                      alt={
                        settings?.business?.companyName ||
                        settings?.platform?.siteName ||
                        'UrutiBz'
                      }
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={openMobileSearch}
                      className="p-2 rounded-full border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-200 hover:text-teal-600 transition-colors"
                      aria-label={translatedAttrs['Search inventory'] || 'Search inventory'}
                    >
                      <Search className="w-4 h-4" />
                    </button>
                    {isAuthenticated && (
                      <div className="flex items-center gap-3">
                        <CartIcon onClick={() => setIsCartOpen(true)} />
                        <RealtimeNotifications />
                      </div>
                    )}
                    <button
                      onClick={toggleDarkMode}
                      className="p-2 rounded-full border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-200 hover:text-teal-600 transition-colors"
                      aria-label={translatedAttrs['Toggle theme'] || 'Toggle theme'}
                    >
                      {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="p-2 rounded-full border border-gray-200 dark:border-gray-700"
                      aria-label={translatedAttrs['Toggle menu'] || 'Toggle menu'}
                    >
                      {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

              </div>

              <div className="hidden md:grid w-full grid-cols-1 gap-4 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-4 lg:gap-6">
                {/* Logo section */}
                <div className="flex items-center gap-4 lg:gap-6 justify-between lg:justify-start">
                  <Link to="/" className="block w-20 h-20  ">
                    <img
                      src={
                        settings?.business?.companyLogo ||
                        settings?.platform?.logoUrl ||
                        '/assets/img/yacht/urutilogo2.png'
                      }
                      alt={
                        settings?.business?.companyName ||
                        settings?.platform?.siteName ||
                        'UrutiBz'
                      }
                      className="w-18 h-18 object-cover"
                    />
                  </Link>
                </div>

                {/* <Link to="/" className="flex items-center gap-3 h-16">
                  <div className="h-full w-16">
                    <img
                      src={
                        settings?.business?.companyLogo ||
                        settings?.platform?.logoUrl ||
                        '/assets/img/yacht/urutilogo2.png'
                      }
                      alt={
                        settings?.business?.companyName ||
                        settings?.platform?.siteName ||
                        'UrutiBz'
                      }
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {settings?.business?.companyName && (
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {settings.business.companyName}
                    </span>
                  )}
                </Link> */}


                {/* Search section - Hidden on mobile, handled separately below */}
                <div className="hidden md:flex w-full px-0 justify-center relative">
                  <div className="w-full max-w-3xl mx-auto flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm hover:shadow-md focus-within:shadow-[0_1px_6px_rgba(32,33,36,0.28)] transition-all duration-200 px-4 h-12 relative">
                    {/* Visual AI Toggle */}
                    <button
                      onClick={() => setIsAiModalOpen(true)}
                      className="mr-2 p-1.5 rounded-full text-teal-600 hover:bg-teal-50 hover:scale-110 transition-all"
                      title="AI Smart Search"
                    >
                      <Sparkles className="w-5 h-5 fill-teal-100" />
                    </button>
                    <input
                      ref={searchInputRef}
                      value={q}
                      onChange={(e) => handleSearchInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          submitSearch();
                        } else if (e.key === 'Escape') {
                          setShowSuggestions(false);
                        }
                      }}
                      onFocus={() => {
                        if (q.length >= 2) {
                          setSearchSuggestions(generateSearchSuggestions(q));
                        }
                        setShowSuggestions(q.length >= 2 || recentSearches.length > 0);
                      }}
                      onBlur={(e) => {
                        const relatedTarget = e.relatedTarget as Node;
                        if (suggestionsRef.current && relatedTarget && suggestionsRef.current.contains(relatedTarget)) {
                          return;
                        }
                        setTimeout(() => {
                          if (document.activeElement !== searchInputRef.current &&
                            (!suggestionsRef.current || !suggestionsRef.current.contains(document.activeElement))) {
                            setShowSuggestions(false);
                          }
                        }, 300);
                      }}
                      placeholder={translatedAttrs['Search inventory...'] || 'Search inventory...'}
                      className="flex-1 bg-transparent text-[16px] text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none h-full ml-1"
                    />

                    {/* Right Actions Container */}
                    <div className="flex items-center gap-1.5 h-full">
                      {q && (
                        <>
                          <button
                            onClick={() => {
                              setQ('');
                              handleSearchInputChange('');
                              searchInputRef.current?.focus();
                            }}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors focus:outline-none mr-1"
                            aria-label="Clear search"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => setIsImageSearchOpen(true)}
                        className="p-2 text-teal-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus:outline-none"
                        aria-label={translatedAttrs['Search by image'] || 'Search by image'}
                        title={translatedAttrs['Search by image'] || 'Search by image'}
                      >
                        <Camera className="w-5 h-5" />
                      </button>

                      <button
                        onClick={submitSearch}
                        className="p-2 text-teal-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors focus:outline-none rounded-full ml-1"
                        aria-label={translatedAttrs['Search'] || 'Search'}
                      >
                        <Search className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Search Suggestions Dropdown */}
                    {showSuggestions && (
                      <div
                        ref={suggestionsRef}
                        className="absolute top-full left-0 right-0 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto"
                      >
                        {renderSuggestionContent('dropdown')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right section - Hidden on mobile, visible on tablet and desktop */}
                <div className="hidden md:flex items-center gap-2 lg:gap-3 justify-end order-3">
                  <button
                    onClick={toggleDarkMode}
                    className="inline-flex p-2 rounded-full border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-200 hover:text-teal-600 transition-colors"
                    aria-label={translatedAttrs['Toggle theme'] || 'Toggle theme'}
                  >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </button>

                  <div className="hidden sm:block">
                    <LanguageSwitcher buttonClassName="px-2 md:px-3 py-2 text-xs md:text-sm font-medium text-slate-600 dark:text-slate-200 hover:text-teal-600 rounded-lg" />
                  </div>

                  {isAuthenticated ? (
                    <div className="hidden sm:flex items-center gap-2 md:gap-3">
                      <CartIcon onClick={() => setIsCartOpen(true)} />
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
                        <div className="hidden md:flex flex-col items-start">
                          <span className="text-[0.6rem] text-slate-500 dark:text-slate-300 uppercase tracking-wide">
                            {user?.role === 'admin' ? <TranslatedText text="Operator" /> : <TranslatedText text="Member" />}
                          </span>
                          <span className="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-1 max-w-[120px] md:max-w-none">
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

                            <Link
                              to={roleDestination}
                              className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-gray-800"
                            >
                              <TranslatedText text={roleLinkLabel} />
                            </Link>

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
                      <Link to="/login" className="px-3 md:px-4 py-2 rounded-full border border-gray-200 text-xs md:text-sm font-semibold text-slate-600 hover:border-teal-400 whitespace-nowrap">
                        <TranslatedText text="Log in" />
                      </Link>
                      {(settings?.platform?.allowUserRegistration && (settings?.system as any)?.registrationEnabled) && (
                        <Link to="/register" className="px-3 md:px-4 py-2 rounded-full bg-gradient-to-r from-teal-500 to-sky-500 text-white text-xs md:text-sm font-semibold shadow-lg hover:opacity-90 whitespace-nowrap">
                          <TranslatedText text="Create account" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Primary Navigation - Visible on tablets and desktop, hidden on mobile */}
          <div className="hidden md:flex items-center justify-center gap-3 md:gap-4 lg:gap-6 m-2 border-gray-100 dark:border-gray-800 pt-3 mt-4 text-sm md:text-base lg:text-lg font-semibold text-slate-600 dark:text-slate-200 relative flex-wrap">
            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCategoriesOpen((prev) => !prev)}
                className={`group inline-flex items-center gap-2 rounded-2xl border px-3 md:px-4 py-2 text-xs md:text-sm font-semibold transition-all ${isCategoriesOpen
                  ? 'text-white border-teal-500 bg-teal-600 shadow-[0_15px_35px_-25px_rgba(13,148,136,0.8)]'
                  : 'text-slate-600 dark:text-slate-200 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:text-teal-600 hover:border-teal-200'
                  }`}
                aria-haspopup="true"
                aria-expanded={isCategoriesOpen}
                aria-label={translatedAttrs['Browse categories'] || 'Browse categories'}
              >
                <span className={`flex h-6 w-6 md:h-7 md:w-7 items-center justify-center rounded-xl transition-all ${isCategoriesOpen
                  ? 'bg-white/20 text-white shadow-inner shadow-teal-900/30'
                  : 'bg-teal-50 text-teal-500 group-hover:text-teal-600 group-hover:bg-teal-50'
                  }`}>
                  <LayoutGrid className="w-3 h-3 md:w-4 md:h-4" />
                </span>
                <span className="tracking-tight hidden sm:inline"><TranslatedText text="Category" /></span>
                <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${isCategoriesOpen ? 'rotate-180 text-white' : 'text-slate-400 group-hover:text-teal-500'}`} />
              </button>
              <div
                className={`absolute left-0 top-full mt-3 w-[min(90vw,920px)] max-w-7xl rounded-3xl border border-slate-200/70 dark:border-slate-700/60 bg-white/95 dark:bg-gray-900/95 shadow-2xl shadow-slate-900/10 backdrop-blur-xl p-5 transition-all duration-200 origin-top z-50 ${normalizedCategories.length && isCategoriesOpen
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 -translate-y-2 pointer-events-none'
                  }`}
              >
                {normalizedCategories.length > 0 && (
                  <div className="flex flex-col gap-6 lg:flex-row">
                    <div className="w-full lg:w-72 max-h-[360px] overflow-y-auto pr-3 border-r border-slate-100 dark:border-slate-800/70">
                      <p className="px-3 pb-1 text-[11px] uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
                        <TranslatedText text="Browse by category" />
                      </p>
                      {normalizedCategories.map((cat) => {
                        const isActive = activeCategory?.id === cat.id;
                        return (
                          <button
                            key={cat.id}
                            onMouseEnter={() => setActiveCategoryId(cat.id)}
                            onFocus={() => setActiveCategoryId(cat.id)}
                            onClick={() => {
                              navigate(`/items?category=${encodeURIComponent(cat.id)}`);
                              setIsCategoriesOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-2xl flex items-center justify-between gap-2 text-sm font-medium transition-all ${isActive
                              ? 'bg-gradient-to-r from-emerald-50 via-white to-transparent text-teal-700 dark:from-emerald-900/30 dark:via-gray-900 dark:to-transparent shadow-sm'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
                              }`}
                          >
                            <span className="truncate"><TranslatedText text={cat.label} /></span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${isActive ? 'rotate-90 text-teal-500' : 'text-slate-400'}`} />
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex-1 bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800/80 rounded-3xl p-6 border border-slate-100 dark:border-gray-800 overflow-hidden relative">
                      <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.35),_transparent_60%)]" />
                      <div className="relative h-full flex flex-col">
                        <div className="mb-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-gray-900/60 text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-600 dark:text-emerald-300 shadow-sm">
                            <Sparkles className="w-3 h-3" />
                            {activeCategory ? <TranslatedText text={activeCategory.label} /> : <TranslatedText text="Spotlight" />}
                          </span>
                          <h3 className="text-xl font-semibold text-slate-900 dark:text-white tracking-tight mt-2">
                            <TranslatedText text="Featured Products" />
                          </h3>
                        </div>

                        {loadingCategoryProducts ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-2"></div>
                              <p className="text-sm text-slate-600 dark:text-slate-400"><TranslatedText text="Loading products..." /></p>
                            </div>
                          </div>
                        ) : categoryProducts.length > 0 ? (
                          <div className="flex-1 overflow-hidden">
                            <Swiper
                              modules={[Autoplay]}
                              spaceBetween={16}
                              slidesPerView={2}
                              autoplay={{
                                delay: 3000,
                                disableOnInteraction: false
                              }}
                              className="h-full"
                            >
                              {categoryProducts.map((product) => (
                                <SwiperSlide key={product.id}>
                                  <Link
                                    to={`/it/${product.id}`}
                                    onClick={() => setIsCategoriesOpen(false)}
                                    className="block group"
                                  >
                                    <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-slate-700 h-full flex flex-col">
                                      {/* Product Image */}
                                      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-slate-700">
                                        {categoryProductImages[product.id]?.[0] ? (
                                          <img
                                            src={categoryProductImages[product.id][0]}
                                            alt={product.title || product.name ? (product.title || product.name) : 'Product'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-slate-500">
                                            <Package className="w-12 h-12" />
                                          </div>
                                        )}
                                      </div>
                                      {/* Product Name */}
                                      <div className="p-3">
                                        <h4 className="font-medium text-sm text-gray-900 dark:text-slate-100 line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                          {product.title || product.name ? <TranslatedText text={product.title || product.name} /> : <TranslatedText text="Product" />}
                                        </h4>
                                      </div>
                                    </div>
                                  </Link>
                                </SwiperSlide>
                              ))}
                            </Swiper>
                          </div>
                        ) : activeCategoryId ? (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-slate-500 dark:text-slate-400"><TranslatedText text="No products found in this category" /></p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-slate-500 dark:text-slate-400"><TranslatedText text="Hover over a category to see products" /></p>
                          </div>
                        )}

                        {categoryProducts.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Link
                              to={activeCategoryId ? `/items?category=${encodeURIComponent(activeCategoryId)}` : '/items'}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition w-full justify-center"
                              onClick={() => setIsCategoriesOpen(false)}
                            >
                              <TranslatedText text="View All Products" />
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {primaryNavLinks.map((link) => (
              <Link
                key={`${link.to}-${language}`}
                to={link.to}
                className="hover:text-teal-600 transition-colors px-2 py-1 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 whitespace-nowrap"
              >
                <TranslatedText text={link.label} />
              </Link>
            ))}
            <Link
              to="/create-listing"
              className="hover:text-teal-600 transition-colors inline-flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 whitespace-nowrap"
            >
              <PlusCircle className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline"><TranslatedText text="List inventory" /></span>
              <span className="sm:hidden"><TranslatedText text="List" /></span>
            </Link>
          </div>

          {isMenuOpen && (
            <div className="md:hidden fixed inset-0 z-[20]" role="dialog" aria-modal="true" aria-label={translatedAttrs['Navigation menu'] || 'Navigation menu'}>
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute inset-0 h-screen">
                <div className="h-full bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl border border-white/20 dark:border-gray-800 pt-4 pb-48 px-4 overflow-y-auto safe-area-bottom space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto" />
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="p-2 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                      aria-label={translatedAttrs['Close menu'] || 'Close menu'}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">
                      <TranslatedText text="Navigation" />
                    </p>
                    <div className="space-y-2">
                      {primaryNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={`${item.to}-${language}`}
                            to={item.to}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:border-teal-400 dark:hover:border-teal-500 transition-colors"
                          >
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300">
                              <Icon className="w-4 h-4" />
                            </span>
                            <span><TranslatedText text={item.label} key={`${item.label}-${language}`} /></span>
                            <ArrowRight className="ml-auto w-4 h-4 text-gray-400" />
                          </Link>
                        );
                      })}
                      <Link
                        to="/create-listing"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-800 dark:text-gray-100 hover:border-teal-400 dark:hover:border-teal-500 transition-colors"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300">
                          <PlusCircle className="w-4 h-4" />
                        </span>
                        <span><TranslatedText text="List inventory" /></span>
                        <ArrowRight className="ml-auto w-4 h-4 text-gray-400" />
                      </Link>
                    </div>
                  </div>

                  {topCategories.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 dark:text-gray-500">
                          <TranslatedText text="Categories" />
                        </p>
                        <button
                          onClick={() => {
                            navigate('/categories');
                            setIsMenuOpen(false);
                          }}
                          className="text-xs font-semibold text-teal-600 dark:text-teal-400"
                        >
                          <TranslatedText text="View all" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {topCategories.map((cat) => (
                          <Link
                            key={cat.id}
                            to={`/items?category=${encodeURIComponent(cat.id)}`}
                            onClick={() => setIsMenuOpen(false)}
                            className="px-3 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/60 text-sm text-gray-800 dark:text-gray-100 hover:border-teal-400 dark:hover:border-teal-500 transition-colors"
                          >
                            <TranslatedText text={cat.label} />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <button
                        onClick={() => setIsMobileProfileOpen((prev) => !prev)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      >
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.name} className="h-11 w-11 rounded-full object-cover" />
                        ) : (
                          <div className="h-11 w-11 rounded-full bg-teal-500 text-white flex items-center justify-center">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                        <div className="flex-1 text-left">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isMobileProfileOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isMobileProfileOpen && (
                        <div className="space-y-2">
                          <Link
                            to={roleDestination}
                            onClick={() => {
                              setIsMenuOpen(false);
                              setIsMobileProfileOpen(false);
                            }}
                            className="block px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-800 dark:text-gray-200 hover:border-teal-400 dark:hover:border-teal-500"
                          >
                            <TranslatedText text={roleLinkLabel} />
                          </Link>
                          <button
                            onClick={() => {
                              logout();
                              setIsMenuOpen(false);
                              setIsMobileProfileOpen(false);
                            }}
                            className="w-full px-4 py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40"
                          >
                            <TranslatedText text="Sign out" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-center text-sm font-semibold text-gray-800 dark:text-gray-200 hover:border-teal-400 dark:hover:border-teal-500"
                      >
                        <TranslatedText text="Log in" />
                      </Link>
                      {(settings?.platform?.allowUserRegistration && (settings?.system as any)?.registrationEnabled) && (
                        <Link
                          to="/register"
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-4 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-sky-500 text-white text-center font-semibold shadow-lg"
                        >
                          <TranslatedText text="Create account" />
                        </Link>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <LanguageSwitcher
                        buttonClassName="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:text-teal-600 rounded-lg border border-gray-200 dark:border-gray-700"
                        showFlag={true}
                        showNativeName={false}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{displayCurrency}</span>
                    </div>
                    <button onClick={toggleDarkMode} className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:text-teal-600 rounded-lg border border-gray-200 dark:border-gray-700">
                      {isDarkMode ? <Sun className="w-4 h-4" /> : <TranslatedText text="Light" />}
                      <span className="hidden sm:inline">{isDarkMode ? <TranslatedText text="Light" /> : <TranslatedText text="Dark" />}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>



      {/* Mobile search overlay */}
      {isMobileSearchOpen && (
        <div className="md:hidden fixed inset-0 z-[75]" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={closeMobileSearch} />
          <div className="absolute inset-x-0 top-0 bottom-0 flex flex-col">
            <div className="mt-[max(env(safe-area-inset-top),1rem)] mx-4 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-4 flex flex-col h-[calc(100%-max(env(safe-area-inset-top),1rem)-env(safe-area-inset-bottom))]">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={closeMobileSearch}
                  className="p-2 rounded-full border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-slate-200"
                  aria-label={translatedAttrs['Close search'] || 'Close search'}
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Mobile Search "Pill" inside Modal */}
                <div className="flex-1 flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm focus-within:shadow-[0_1px_6px_rgba(32,33,36,0.28)] transition-all duration-200 px-4 h-12 relative">
                  {/* AI Smart Search Button */}
                  <button
                    onClick={() => {
                      setIsAiModalOpen(true);
                      closeMobileSearch();
                    }}
                    className="mr-2 p-1 rounded-full text-teal-600 hover:bg-teal-50 transition-all"
                    title="AI Smart Search"
                  >
                    <Sparkles className="w-4 h-4 fill-teal-100" />
                  </button>

                  <input
                    ref={searchInputRef}
                    value={q}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        submitSearch();
                        closeMobileSearch();
                      } else if (e.key === 'Escape') {
                        setShowSuggestions(false);
                        closeMobileSearch();
                      }
                    }}
                    onFocus={() => {
                      if (q.length >= 2) {
                        setSearchSuggestions(generateSearchSuggestions(q));
                      }
                      setShowSuggestions(q.length >= 2 || recentSearches.length > 0);
                    }}
                    placeholder={translatedAttrs['Search inventory...'] || 'Search inventory...'}
                    className="flex-1 bg-transparent text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none"
                  />

                  {/* Right Actions Container in Pill */}
                  <div className="flex items-center gap-1 h-full">
                    {q && (
                      <button
                        onClick={() => {
                          setQ('');
                          handleSearchInputChange('');
                          searchInputRef.current?.focus();
                        }}
                        className="p-2 text-gray-500"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setIsImageSearchOpen(true);
                        closeMobileSearch();
                      }}
                      className="p-2 text-teal-600"
                      aria-label={translatedAttrs['Search by image'] || 'Search by image'}
                    >
                      <Camera className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        submitSearch();
                        closeMobileSearch();
                      }}
                      className="p-2 text-teal-600"
                      aria-label={translatedAttrs['Search'] || 'Search'}
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto border border-gray-100 dark:border-gray-800 rounded-2xl">
                {renderSuggestionContent('full')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Search Modal */}
      <ImageSearchModal
        isOpen={isImageSearchOpen}
        onClose={() => setIsImageSearchOpen(false)}
        onSearchComplete={handleImageSearchResults}
        onNavigateToResults={handleImageSearchResults}
      />

      <AIChatbotModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Header;