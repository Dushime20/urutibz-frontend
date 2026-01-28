import React from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronRight, LogOut, User as UserIcon, MessageCircle, ClipboardList, Package, Heart, Settings, HelpCircle } from 'lucide-react';
import { User as AuthUser } from '../../../contexts/AuthContext';
import { HeaderCategory } from './AlibabaHeader';

interface MobileMenuDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    isAuthenticated: boolean;
    user: AuthUser | null;
    logout: () => void;
    topCategories: HeaderCategory[];
}

const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
    isOpen, onClose, isAuthenticated, user, logout, topCategories
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] md:hidden">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={onClose} 
            />
            
            {/* Drawer */}
            <div className="absolute inset-y-0 left-0 w-[85%] max-w-[320px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                
                {/* Drawer Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="/assets/img/urutibuz-logo.png"
                            alt="URUTIBUZ"
                            className="w-8 h-8 object-contain"
                        />
                        <span className="font-bold text-gray-900 dark:text-white">URUTIBUZ</span>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                    >
                        <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto py-4">
                    {/* User Section */}
                    <div className="px-4 mb-6">
                        {isAuthenticated ? (
                            <div className="bg-teal-50 dark:bg-teal-950/20 p-4 rounded-2xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 bg-teal-200 dark:bg-teal-800 rounded-full flex items-center justify-center text-teal-700 dark:text-teal-200">
                                        <UserIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{user?.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                                    </div>
                                </div>
                                <Link 
                                    to="/dashboard" 
                                    onClick={onClose}
                                    className="block w-full py-2 bg-teal-600 text-white text-center rounded-lg font-medium hover:bg-teal-700"
                                >
                                    View Dashboard
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3">
                                <Link 
                                    to="/login" 
                                    onClick={onClose}
                                    className="py-3 bg-teal-600 text-white rounded-xl text-center font-bold hover:bg-teal-700"
                                >
                                    Sign In
                                </Link>
                                <Link 
                                    to="/register" 
                                    onClick={onClose}
                                    className="py-3 border border-teal-600 text-teal-600 rounded-xl text-center font-bold hover:bg-teal-50 dark:hover:bg-teal-950/20"
                                >
                                    Join Free
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Main Navigation */}
                    <div className="space-y-1">
                        <p className="px-6 text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">
                            Shopping
                        </p>
                        
                        <Link 
                            to="/items" 
                            onClick={onClose} 
                            className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-900 dark:text-white">Marketplace</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                        </Link>

                        {isAuthenticated && (
                            <>
                                <Link 
                                    to="/favorites" 
                                    onClick={onClose} 
                                    className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    <div className="flex items-center gap-3">
                                        <Heart className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-900 dark:text-white">Favorites</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300" />
                                </Link>

                                <Link 
                                    to="/messages" 
                                    onClick={onClose} 
                                    className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    <div className="flex items-center gap-3">
                                        <MessageCircle className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-900 dark:text-white">Messages</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300" />
                                </Link>

                                <Link 
                                    to="/bookings" 
                                    onClick={onClose} 
                                    className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    <div className="flex items-center gap-3">
                                        <ClipboardList className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-900 dark:text-white">My Orders</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300" />
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Categories */}
                    <div className="mt-6 space-y-1">
                        <p className="px-6 text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">
                            Categories
                        </p>
                        {topCategories.slice(0, 8).map(cat => (
                            <Link
                                key={cat.id}
                                to={`/items?category=${cat.id}`}
                                onClick={onClose}
                                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <span className="text-gray-900 dark:text-white">{cat.label}</span>
                                <ChevronRight className="w-4 h-4 text-gray-300" />
                            </Link>
                        ))}
                        
                        <Link
                            to="/categories"
                            onClick={onClose}
                            className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                            <span className="text-teal-600 font-medium">View All Categories</span>
                            <ChevronRight className="w-4 h-4 text-teal-600" />
                        </Link>
                    </div>

                    {/* Support & Settings */}
                    {isAuthenticated && (
                        <div className="mt-6 space-y-1">
                            <p className="px-6 text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-2">
                                Account
                            </p>
                            
                            <Link 
                                to="/settings" 
                                onClick={onClose} 
                                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <div className="flex items-center gap-3">
                                    <Settings className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-900 dark:text-white">Settings</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300" />
                            </Link>

                            <Link 
                                to="/help" 
                                onClick={onClose} 
                                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <div className="flex items-center gap-3">
                                    <HelpCircle className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-900 dark:text-white">Help & Support</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300" />
                            </Link>
                        </div>
                    )}
                </div>

                {/* Drawer Footer */}
                {isAuthenticated && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            onClick={() => {
                                logout();
                                onClose();
                            }}
                            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MobileMenuDrawer;