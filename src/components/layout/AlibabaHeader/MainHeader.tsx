import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Store, TreePalm } from 'lucide-react';
import { User } from '../../../contexts/AuthContext';
import SearchBar from './AlibabaSearchBar';
import CartIcon from '../../cart/CartIcon';

interface MainHeaderProps {
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
    setIsCartOpen: (o: boolean) => void;
    topCategories: any[];
    isAuthenticated: boolean;
    user: User | null;
    logout: () => void;
    onOpenMenu: () => void;
}

const MainHeader: React.FC<MainHeaderProps> = ({
    q, setQ, category, setCategory, onSearch, suggestions,
    showSuggestions, setShowSuggestions, isAiMode, setIsAiMode,
    setIsImageSearchOpen, setIsCartOpen, topCategories, isAuthenticated, user, logout, onOpenMenu
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 py-4 px-4 border-b border-gray-100 dark:border-gray-700">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-8">

                {/* Logo - Always Visible */}
                <Link to="/" className="flex items-center gap-3 flex-shrink-0">
<div className="bg-teal-600 font-bold text-white w-8 h-8 rounded-md flex items-center justify-center">
                    U
                   </div>
                    <span className="font-bold text-xl text-teal-600 hidden lg:block whitespace-nowrap">URUTIBUZ</span>
                </Link>
                                  

                {/* Search Bar - Visible on All Devices */}
                <div className="flex-1 max-w-[800px]">
                    <SearchBar
                        q={q}
                        setQ={setQ}
                        category={category}
                        setCategory={setCategory}
                        onSearch={onSearch}
                        suggestions={suggestions}
                        showSuggestions={showSuggestions}
                        setShowSuggestions={setShowSuggestions}
                        isAiMode={isAiMode}
                        setIsAiMode={setIsAiMode}
                        setIsImageSearchOpen={setIsImageSearchOpen}
                        topCategories={topCategories}
                    />
                </div>

                {/* User Actions - Hidden on Mobile, Visible on Desktop */}
                <div className="hidden md:flex items-center gap-4 lg:gap-8 flex-shrink-0">


                    {/* Cart */}
                    <div className="flex flex-col items-center group cursor-pointer relative">
                        <CartIcon onClick={() => setIsCartOpen(true)} />
                        <span className="text-[11px] text-gray-600 dark:text-gray-400 group-hover:text-teal-600 transition-colors mt-0.5">Cart</span>
                    </div>

                    {/* User / Login */}
                    {!isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="font-semibold text-gray-900 dark:text-gray-200 hover:text-teal-600 ">Sign In</Link>
                            <Link to="/register" className="font-semibold text-white bg-teal-600 px-2 py-0.5 rounded-md">Join Free</Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-800 dark:text-gray-200">Hi, {user?.name || 'User'}</span>
                            <button onClick={logout} className="hover:text-red-500 font-semibold">Sign Out</button>
                        </div>
                    )}






                </div>

                {/* Mobile Menu Icon - Hidden */}
                <button onClick={onOpenMenu} className="hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                    <Menu className="w-7 h-7 text-gray-700 dark:text-gray-200" />
                </button>

            </div>
        </div>
    );
};

export default MainHeader;
