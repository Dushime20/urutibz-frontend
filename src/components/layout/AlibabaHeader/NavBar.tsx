import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Globe, Briefcase } from 'lucide-react';
import AlibabaCategoryMenu from './AlibabaCategoryMenu';

interface NavBarProps {
    topCategories: any[];
    allCategories: any[];
    allProducts?: any[];
}

const NavBar: React.FC<NavBarProps> = ({ topCategories, allCategories, allProducts = [] }) => {
    return (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 py-1 hidden md:block">
            <div className="max-w-[1400px] mx-auto flex items-center gap-8 px-4">

                {/* All Categories Trigger & Panel */}
                <AlibabaCategoryMenu allCategories={allCategories} allProducts={allProducts} />

                {/* Dynamic Links */}
                <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-2">

                    <Link to="/items" className="text-[14px] font-semibold text-gray-800 dark:text-gray-200 hover:text-teal-600 whitespace-nowrap transition-colors flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-gray-400" />
                        Featured
                    </Link>



                </div>

                {/* Extra Actions */}
                <div className="ml-auto flex items-center gap-6">
                    <Link to="/suppliers" className="text-[14px] font-semibold text-gray-800 dark:text-gray-200 hover:text-teal-600 whitespace-nowrap transition-colors flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        Manufacturers
                    </Link>
                    <Link to="/enterprise" className="text-[14px] font-semibold text-gray-800 dark:text-gray-200 hover:text-teal-600 whitespace-nowrap transition-colors">Enterprise</Link>
                    <Link to="/faq" className="text-[14px] font-semibold text-gray-800 dark:text-gray-200 hover:text-teal-600 whitespace-nowrap transition-colors">Support</Link>
                    <Link to="/create-listing" className="text-[14px] font-semibold text-gray-800 dark:text-gray-200 hover:text-teal-600 whitespace-nowrap transition-colors">Rent on Urutibiz</Link>

                </div>

            </div>
        </div>
    );
};

export default NavBar;
