import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import axios from '../../../lib/http';
import { API_BASE_URL } from '../../../pages/admin/service/config';
import { fetchAvailableProducts } from '../../../pages/admin/service';
import TopBar from './TopBar';
import MainHeader from './MainHeader';
import NavBar from './NavBar';
import MobileHeader from './MobileHeader';
import MobileMenuDrawer from './MobileMenuDrawer';
import CartDrawer from '../../cart/CartDrawer';
import ImageSearchModal from '../../products/ImageSearchModal';
import { ImageSearchResult } from '../../../pages/admin/service/imageSearch';
import { X, UserIcon, Package, ChevronRight, MessageCircle, ClipboardList, LogOut } from 'lucide-react';

export type HeaderCategory = { id: string; label: string };

const AlibabaHeader: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const navigate = useNavigate();
    const location = useLocation();

    // Search States
    const params = new URLSearchParams(location.search);
    const [q, setQ] = useState<string>(params.get('q') || '');
    const [category, setCategory] = useState<string>(params.get('category') || 'all');
    const [isAiMode, setIsAiMode] = useState(true);
    const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // UI States
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [topCategories, setTopCategories] = useState<HeaderCategory[]>([]);
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [allProducts, setAllProducts] = useState<any[]>([]);

    // Fetch Categories & Products
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, prodRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/categories`),
                    fetchAvailableProducts(undefined, true)
                ]);

                const catRows = Array.isArray(catRes.data?.data) ? catRes.data.data : Array.isArray(catRes.data) ? catRes.data : [];
                const cats: HeaderCategory[] = catRows.map((c: any) => ({ id: c.id || c.slug || c.name, label: c.name }));
                setTopCategories(cats.slice(0, 12));
                setAllCategories(catRows);
                setAllProducts((prodRes.data || []).slice(0, 100));
            } catch (err) {
                console.error('Error fetching header data:', err);
            }
        };
        fetchData();
    }, []);

    // Sticky Effect
    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Sync Search Query with URL
    useEffect(() => {
        const p = new URLSearchParams(location.search);
        setQ(p.get('q') || '');
        setCategory(p.get('category') || 'all');
    }, [location.search]);

    const generateSuggestions = useCallback((query: string) => {
        if (!query || query.length < 2) return [];
        const queryLower = query.toLowerCase();

        const suggests: any[] = [];

        // Enhanced AI/Deep Search Detection
        const hasNaturalLanguageKeywords = /\b(in|at|from|near|least|most|cost|price|minimum|maximum|under|over|between|rwf|usd|frw|which|that|where|when|how|what|find|show|get|need|want|looking|search)\b/i.test(query);
        const hasNumericPrice = /\d+\s*(rwf|usd|frw|k|thousand|million)/i.test(query);
        const hasLocationKeywords = /\b(kigali|rwanda|nyarugenge|gasabo|kicukiro|musanze|huye|rubavu|muhanga|karongi|rusizi|bugesera|rwamagana|kayonza|kirehe|ngoma|nyagatare|gatsibo|gicumbi|rulindo|gakenke|ngororero|kamonyi|ruhango|nyanza|gisagara|nyamagabe|nyaruguru|burera|rutsiro|nyamasheke)\b/i.test(query);
        const hasComparisonWords = /\b(best|cheapest|affordable|expensive|quality|top|better|worse|compare|versus|vs)\b/i.test(query);
        const isQuestion = /^(what|where|when|how|which|who|why)\b/i.test(query);
        
        // Trigger AI search for complex queries
        if (
            query.length >= 10 || 
            hasNaturalLanguageKeywords || 
            hasNumericPrice || 
            (hasLocationKeywords && query.split(' ').length >= 3) ||
            hasComparisonWords ||
            isQuestion
        ) {
            suggests.push({ 
                type: 'deep_search', 
                name: `🔍 AI Deep Search: "${query}"`, 
                queryText: query,
                description: 'Smart search with natural language understanding'
            });
        }

        // Product matches
        const prodMatches = allProducts
            .filter(p => (p.title || p.name || '').toLowerCase().includes(queryLower))
            .slice(0, 3)
            .map(p => ({ 
                type: 'product', 
                name: p.title || p.name, 
                id: p.id,
                price: p.base_price_per_day || p.price,
                currency: p.base_currency || p.currency || 'RWF'
            }));
        suggests.push(...prodMatches);

        // Category matches
        const catMatches = allCategories
            .filter(c => (c.name || '').toLowerCase().includes(queryLower))
            .slice(0, 3)
            .map(c => ({ 
                type: 'category', 
                name: c.name, 
                id: c.id || c.slug,
                count: c.product_count || 0
            }));
        suggests.push(...catMatches);

        // Smart suggestions based on query patterns
        if (hasNumericPrice && !suggests.some(s => s.type === 'deep_search')) {
            suggests.unshift({ 
                type: 'deep_search', 
                name: `💰 Price-based search: "${query}"`, 
                queryText: query,
                description: 'Find products within your budget'
            });
        }

        if (hasLocationKeywords && !suggests.some(s => s.type === 'deep_search')) {
            suggests.unshift({ 
                type: 'deep_search', 
                name: `📍 Location search: "${query}"`, 
                queryText: query,
                description: 'Find products near you'
            });
        }

        return suggests;
    }, [allProducts, allCategories]);

    // Debounced Suggestions
    useEffect(() => {
        const timer = setTimeout(() => {
            if (q.length >= 2) {
                setSearchSuggestions(generateSuggestions(q));
            } else {
                setSearchSuggestions([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [q, generateSuggestions]);

    const handleSearch = (query: string, categoryId: string = 'all') => {
        // Enhanced natural language detection
        const hasNaturalLanguageKeywords = /\b(in|at|from|near|least|most|cost|price|minimum|maximum|under|over|between|rwf|usd|frw|which|that|where|when|how|what|find|show|get|need|want|looking|search)\b/i.test(query);
        const hasNumericPrice = /\d+\s*(rwf|usd|frw|k|thousand|million)/i.test(query);
        const hasLocationKeywords = /\b(kigali|rwanda|nyarugenge|gasabo|kicukiro|musanze|huye|rubavu)\b/i.test(query);
        const hasComparisonWords = /\b(best|cheapest|affordable|expensive|quality|top|better|worse|compare)\b/i.test(query);
        const isQuestion = /^(what|where|when|how|which|who|why)\b/i.test(query);
        
        const isNaturalLanguage = 
            hasNaturalLanguageKeywords || 
            hasNumericPrice || 
            hasLocationKeywords || 
            hasComparisonWords || 
            isQuestion ||
            query.split(' ').length >= 4; // 4+ words likely natural language

        if (isAiMode || isNaturalLanguage) {
            const sp = new URLSearchParams();
            sp.set('prompt', query);
            sp.set('searchType', 'ai');
            navigate(`/items?${sp.toString()}`);
        } else {
            const sp = new URLSearchParams();
            if (query) sp.set('q', query);
            if (categoryId !== 'all') sp.set('category', categoryId);
            navigate(`/items?${sp.toString()}`);
        }
        setShowSuggestions(false);
        setIsMenuOpen(false);
    };

    const handleImageSearchResults = (results: ImageSearchResult[]) => {
        navigate('/items', { state: { imageSearchResults: results, searchMode: 'image' } });
        setIsMenuOpen(false);
    };

    return (
        <>
            <div className={`w-full z-50 ${isSticky ? 'fixed top-0 shadow-md animate-in slide-in-from-top duration-300' : 'relative'}`}>
                <TopBar
                    isAuthenticated={isAuthenticated}
                    user={user}
                    logout={logout}
                    isDarkMode={isDarkMode}
                    toggleDarkMode={toggleDarkMode}
                />
                <MainHeader
                    q={q}
                    setQ={setQ}
                    category={category}
                    setCategory={setCategory}
                    onSearch={handleSearch}
                    suggestions={searchSuggestions}
                    showSuggestions={showSuggestions}
                    setShowSuggestions={setShowSuggestions}
                    isAiMode={isAiMode}
                    setIsAiMode={setIsAiMode}
                    setIsImageSearchOpen={setIsImageSearchOpen}
                    setIsCartOpen={setIsCartOpen}
                    topCategories={topCategories}
                    isAuthenticated={isAuthenticated}
                    user={user}
                    logout={logout}
                    onOpenMenu={() => setIsMenuOpen(true)}
                />
                <NavBar
                    topCategories={topCategories}
                    allCategories={allCategories}
                    allProducts={allProducts}
                />

                <ImageSearchModal
                    isOpen={isImageSearchOpen}
                    onClose={() => setIsImageSearchOpen(false)}
                    onSearchComplete={handleImageSearchResults}
                    onNavigateToResults={handleImageSearchResults}
                />
                <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
            </div>

            {/* Mobile Menu Drawer */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[100] md:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
                    <div className="absolute inset-y-0 left-0 w-[85%] max-w-[320px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">

                                              {/* Drawer Header */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-teal-600 rounded flex items-center justify-center text-white font-bold">U</div>
                                <span className="font-bold dark:text-white">URUTIBIZ</span>
                            </div>
                            <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full dark:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>


                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto py-4">
                            {/* User Section */}
                            <div className="px-4 mb-6">
                                {isAuthenticated ? (
                                    <div className="bg-teal-50 dark:bg-teal-950/20 p-4 rounded-2xl flex items-center gap-3">
                                        <div className="w-12 h-12 bg-teal-200 dark:bg-teal-800 rounded-full flex items-center justify-center text-teal-700 dark:text-teal-200">
                                            <UserIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{user?.name}</p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        <Link to="/login" className="py-3 bg-teal-600 text-white rounded-xl text-center font-bold">Sign In</Link>
                                        <Link to="/register" className="py-3 border border-teal-600 text-teal-600 rounded-xl text-center font-bold">Join Free</Link>
                                    </div>
                                )}
                            </div>

                            {/* Navigation */}
                            <div className="space-y-1">
                                <p className="px-6 text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Shopping</p>
                                <Link to="/items" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                                    <div className="flex items-center gap-3"><Package className="w-5 h-5 text-gray-400" /> Marketplace</div>
                                    <ChevronRight className="w-4 h-4 text-gray-300" />
                                </Link>
                                <Link to="/favorites" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                                    <div className="flex items-center gap-3"><MessageCircle className="w-5 h-5 text-gray-400" /> Messages</div>
                                    <ChevronRight className="w-4 h-4 text-gray-300" />
                                </Link>
                                <Link to="/bookings" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                                    <div className="flex items-center gap-3"><ClipboardList className="w-5 h-5 text-gray-400" /> Orders</div>
                                    <ChevronRight className="w-4 h-4 text-gray-300" />
                                </Link>
                                
                                {/* Dashboard Link - Role Based */}
                                {isAuthenticated && (
                                    <>
                                        <div className="h-[1px] bg-gray-100 dark:bg-gray-800 mx-6 my-2"></div>
                                        <p className="px-6 text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Dashboard</p>
                                        {user?.role === 'admin' && (
                                            <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                                                <div className="flex items-center gap-3"><UserIcon className="w-5 h-5 text-teal-500" /> Admin Panel</div>
                                                <ChevronRight className="w-4 h-4 text-gray-300" />
                                            </Link>
                                        )}
                                        {user?.role === 'moderator' && (
                                            <Link to="/moderator" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                                                <div className="flex items-center gap-3"><UserIcon className="w-5 h-5 text-blue-500" /> Moderator Panel</div>
                                                <ChevronRight className="w-4 h-4 text-gray-300" />
                                            </Link>
                                        )}
                                        {user?.role === 'inspector' && (
                                            <Link to="/inspector" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                                                <div className="flex items-center gap-3"><UserIcon className="w-5 h-5 text-purple-500" /> Inspector Panel</div>
                                                <ChevronRight className="w-4 h-4 text-gray-300" />
                                            </Link>
                                        )}
                                        {(!user?.role || user?.role === 'user') && (
                                            <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white">
                                                <div className="flex items-center gap-3"><UserIcon className="w-5 h-5 text-gray-500" /> My Dashboard</div>
                                                <ChevronRight className="w-4 h-4 text-gray-300" />
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="mt-6 space-y-1">
                                <p className="px-6 text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">Categories</p>
                                {topCategories.map(cat => (
                                    <Link
                                        key={cat.id}
                                        to={`/items?category=${cat.id}`}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white"
                                    >
                                        <span>{cat.label}</span>
                                        <ChevronRight className="w-4 h-4 text-gray-300" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        {isAuthenticated && (
                            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <LogOut className="w-5 h-5" /> Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default AlibabaHeader;
