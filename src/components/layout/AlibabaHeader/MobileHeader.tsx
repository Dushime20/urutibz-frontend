import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, ShoppingCart, User } from 'lucide-react';
import { User as AuthUser } from '../../../contexts/AuthContext';
import CartIcon from '../../cart/CartIcon';

interface MobileHeaderProps {
    q: string;
    setQ: (q: string) => void;
    onSearch: (q: string, c: string) => void;
    setIsImageSearchOpen: (o: boolean) => void;
    setIsCartOpen: (o: boolean) => void;
    isAuthenticated: boolean;
    user: AuthUser | null;
    onOpenMenu: () => void;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({
    q, setQ, onSearch, setIsImageSearchOpen, setIsCartOpen,
    isAuthenticated, user, onOpenMenu
}) => {
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (q.trim()) {
            onSearch(q.trim(), 'all');
        }
    };

    return (
        <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            {/* Top Row: Logo + Actions */}
            <div className="flex items-center justify-between px-4 py-3">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <img
                        src="/assets/img/urutibuz-logo.png"
                        alt="URUTIBUZ"
                        className="w-8 h-8 object-contain"
                    />
                    <span className="font-bold text-lg text-teal-600">URUTIBUZ</span>
                </Link>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    {/* Image Search */}
                    <button
                        onClick={() => setIsImageSearchOpen(true)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        title="Search by image"
                    >
                        <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>

                 
                </div>
            </div>

            {/* ========== SEARCH SECTION STARTS HERE ========== */}
            {/* Search Bar Row */}
            <div className="px-4 pb-3">
                <form onSubmit={handleSearchSubmit} className="relative">
                    <div className="relative flex items-center bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <input
                            type="text"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Search for anything..."
                            className="flex-1 px-4 py-3 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-sm"
                        />
                        <button
                            type="submit"
                            className="px-4 py-3 bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>

          
        </div>
    );
};

export default MobileHeader;