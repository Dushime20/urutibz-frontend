import React, { useRef } from 'react';
import { Search, Camera, Sparkles, ChevronDown, Package, LayoutGrid, ArrowRight } from 'lucide-react';

interface SearchBarProps {
    q: string;
    setQ: (q: string) => void;
    category: string;
    setCategory: (c: string) => void;
    onSearch: (q: string, c: string) => void;
    suggestions: any[];
    showSuggestions: boolean;
    setShowSuggestions: (s: boolean) => void;
    isAiMode: boolean;
    setIsAiMode: (a: boolean) => void;
    setIsImageSearchOpen: (o: boolean) => void;
    topCategories: any[];
}

const AlibabaSearchBar: React.FC<SearchBarProps> = ({
    q, setQ, category, setCategory, onSearch, suggestions,
    showSuggestions, setShowSuggestions, isAiMode, setIsAiMode,
    setIsImageSearchOpen, topCategories
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const activeCategoryLabel = topCategories.find(c => c.id === category)?.label || 'All Categories';

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onSearch(q, category);
        }
    };

    return (
        <div className="relative w-full">
            {/* Main Search Container */}
            <div className={`flex items-center h-12 border-2 rounded-full overflow-hidden transition-all duration-200 ${isAiMode
                ? 'border-teal-600 ring-2 ring-teal-100 dark:ring-teal-900/30'
                : 'border-teal-600'
                } bg-white dark:bg-gray-900`}>

                {/* Category Dropdown */}
                <div className="relative group hidden lg:block">
                    <button className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 h-full">
                        <span className="truncate max-w-[100px]">{activeCategoryLabel}</span>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>

                    <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-2 z-[60] hidden group-hover:block">
                        <button
                            onClick={() => setCategory('all')}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                        >
                            All Categories
                        </button>
                        {topCategories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setCategory(cat.id)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* AI Toggle Icon (Sparkles) */}
                <button
                    onClick={() => setIsAiMode(!isAiMode)}
                    className={`ml-3 p-1.5 rounded-full transition-all ${isAiMode ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    title={isAiMode ? "AI Search Active" : "Enable AI Search"}
                >
                    <Sparkles className="w-4 h-4" />
                </button>

                {/* Input Field */}
                <input
                    ref={inputRef}
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={isAiMode ? "Try: camera in Kigali under 30,000 RWF" : "Search products..."}
                    className="flex-1 px-4 py-2 text-sm bg-transparent border-none focus:ring-0 text-gray-900 dark:text-gray-100 placeholder-gray-500"
                />

                {/* Image Search Button */}
                <button
                    onClick={() => setIsImageSearchOpen(true)}
                    className="p-2.5 text-gray-500 hover:text-teal-600 dark:text-gray-400 dark:hover:text-teal-400 transition-colors"
                >
                    <Camera className="w-5.5 h-5.5" />
                </button>

                {/* Submit Search Button */}
                <button
                    onClick={() => onSearch(q, category)}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-8 h-full font-bold flex items-center gap-2 transition-colors transition-all active:scale-95"
                >
                    <Search className="w-5 h-5" />
                    <span className="hidden sm:inline">Search</span>
                </button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (q.length >= 2 || suggestions.length > 0) && (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl shadow-2xl overflow-hidden z-[70]">
                    <div className="p-4">
                        <div className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-wider px-2">
                            Suggestions
                        </div>
                        {suggestions.map((s, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-2xl cursor-pointer group transition-colors"
                                onClick={() => onSearch(s.queryText || s.name, s.categoryId || 'all')}
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.type === 'deep_search' ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {s.type === 'product' ? <Package className="w-4 h-4" /> :
                                        s.type === 'category' ? <LayoutGrid className="w-4 h-4" /> :
                                            <Sparkles className="w-4 h-4" />}
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{s.name}</div>
                                    {s.type === 'deep_search' && <div className="text-[11px] text-teal-600/70">AI-Powered deep search</div>}
                                </div>
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlibabaSearchBar;
