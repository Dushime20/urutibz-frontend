import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Moon, Sun, Smartphone, HelpCircle } from 'lucide-react';
import { LanguageSwitcher } from '../../language-switcher';

interface TopBarProps {
    isAuthenticated: boolean;
    user: any;
    logout: () => void;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ isAuthenticated, user, logout, isDarkMode, toggleDarkMode }) => {
    return (
        <div className="bg-[#f2f3f7] dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-[12px] text-gray-600 dark:text-gray-400 py-1.5 px-4 hidden md:block">
            <div className="max-w-[1400px] mx-auto flex justify-between items-center">
                {/* Left Side */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-teal-600 transition-colors">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Deliver to: Rwanda</span>
                    </div>
                    <div className="flex items-center gap-1 cursor-pointer hover:text-teal-600 transition-colors">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Get the app</span>
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-6">
                    <LanguageSwitcher
                        buttonClassName="hover:text-teal-600 flex items-center gap-1"
                        showFlag={true}
                    />

                    <div className="h-3 w-[1px] bg-gray-300 dark:bg-gray-700"></div>

                    <div className="flex items-center gap-4">
                        <Link to="/help" className="hover:text-teal-600 flex items-center gap-1">
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>Help Center</span>
                        </Link>

                        <button onClick={toggleDarkMode} className="hover:text-teal-600 flex items-center gap-1">
                            {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                            <span>{isDarkMode ? 'Light' : 'Dark'} Mode</span>
                        </button>

                        <div className="h-3 w-[1px] bg-gray-300 dark:bg-gray-700"></div>

                        {!isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="font-semibold text-gray-800 dark:text-gray-200 hover:text-teal-600">Sign In</Link>
                                <Link to="/register" className="font-semibold text-gray-800 dark:text-gray-200 hover:text-teal-600 border border-gray-300 dark:border-gray-700 px-2 py-0.5 rounded-sm">Join Free</Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <span className="font-medium text-gray-800 dark:text-gray-200">Hi, {user?.name || 'User'}</span>
                                <button onClick={logout} className="hover:text-red-500 font-semibold">Sign Out</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
