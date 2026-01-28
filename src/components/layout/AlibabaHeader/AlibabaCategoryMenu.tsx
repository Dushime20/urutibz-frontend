import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Menu,
    ChevronRight,
    Smartphone,
    Shirt,
    Home as HomeIcon,
    Sparkles,
    Trophy,
    Settings,
    Car,
    LayoutGrid,
    Scissors,
    Watch,
    Camera,
    ShoppingBag,
    Baby,
    Dog,
    Hammer,
    TrendingUp
} from 'lucide-react';

interface Category {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    imageUrl?: string | null;
    iconName?: string | null;
}

interface Product {
    id: string;
    title?: string;
    name?: string;
    price?: number;
    imageUrl?: string;
    image?: string; // Add support for 'image' field
    images?: string[] | any[]; // Allow for objects
    categoryId?: string;
    category_id?: string;
    category?: string | any;
}

interface AlibabaCategoryMenuProps {
    allCategories: Category[];
    allProducts?: Product[];
}

// Helper to map category names to Lucide icons
const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('electronic')) return Smartphone;
    if (n.includes('apparel') || n.includes('fashion') || n.includes('clothe')) return Shirt;
    if (n.includes('home') || n.includes('garden') || n.includes('furniture')) return HomeIcon;
    if (n.includes('beauty') || n.includes('care') || n.includes('health')) return Sparkles;
    if (n.includes('sport') || n.includes('outdoor')) return Trophy;
    if (n.includes('industr') || n.includes('machin')) return Settings;
    if (n.includes('auto') || n.includes('vehicle') || n.includes('car')) return Car;
    if (n.includes('toy') || n.includes('baby')) return Baby;
    if (n.includes('pet')) return Dog;
    if (n.includes('tool') || n.includes('hardwar')) return Hammer;
    if (n.includes('jewelry') || n.includes('watch')) return Watch;
    if (n.includes('camera') || n.includes('photo')) return Camera;
    if (n.includes('bag') || n.includes('luggage')) return ShoppingBag;
    if (n.includes('beauty')) return Scissors;
    return LayoutGrid;
};

const AlibabaCategoryMenu: React.FC<AlibabaCategoryMenuProps> = ({ allCategories, allProducts = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

    // Filter top level categories
    const topLevelCategories = useMemo(() =>
        allCategories.filter(c => !c.parentId || c.parentId === '0' || c.parentId === ''),
        [allCategories]);

    // Get ALL products for active category
    const categoryMatches = useMemo(() => {
        if (!activeCategoryId || !allProducts.length) return [];

        // Find the active category
        const activeCategory = topLevelCategories.find(c => c.id === activeCategoryId);

        // Prepare active category matchers (lowercase for case-insensitive comparison)
        const activeId = (activeCategoryId || '').toString().toLowerCase();
        const activeName = (activeCategory?.name || '').toString().toLowerCase();
        const activeSlug = (activeCategory?.slug || activeName.replace(/\s+/g, '-')).toString().toLowerCase();

        // Filter products that match
        const filtered = allProducts.filter(p => {
            // Product attributes to check against
            let pCategoryId = (p.categoryId || p.category_id || '').toString().toLowerCase();
            let pCategoryName = '';

            if (typeof p.category === 'string') {
                pCategoryName = p.category.toLowerCase();
            } else if (p.category && typeof p.category === 'object') {
                if (p.category.id) pCategoryId = p.category.id.toString().toLowerCase();
                if (p.category.name) pCategoryName = p.category.name.toString().toLowerCase();
            }

            // Check if any product attribute matches any active category attribute
            // Match ID
            if (pCategoryId === activeId) return true;

            // Match Name
            if (activeName && pCategoryName === activeName) return true;

            // Match Slug/Name cross-reference (e.g. product categoryId is actually a slug "electronics")
            if (activeSlug && pCategoryId === activeSlug) return true;
            if (activeName && pCategoryId === activeName) return true;

            // Reverse check: product category name matches active ID (rare but possible)
            if (pCategoryName === activeId) return true;

            return false;
        });

        return filtered;
    }, [activeCategoryId, allProducts, topLevelCategories, allCategories]);

    // Slice for the main grid
    const activeCategoryProducts = useMemo(() => {
        return categoryMatches.slice(0, 6);
    }, [categoryMatches]);

    // Slice for "Popular" section (taking next 4, or just reusing if few products)
    // We want to show "Popular in this Category"
    const popularProducts = useMemo(() => {
        if (categoryMatches.length <= 6) return []; // If few products, don't show separate popular section to avoid duplication/clutter

        // Take products 6-10 if available, so they are distinct from the main grid
        return categoryMatches.slice(6, 10);
    }, [categoryMatches]);



    const handleMouseEnterTrigger = () => setIsOpen(true);
    const handleMouseLeaveMenu = () => {
        setIsOpen(false);
        setActiveCategoryId(null);
    };

    const handleCategoryHover = (id: string) => {
        setActiveCategoryId(id);
    };

    // Helper to get product image
    const getProductImage = (product: Product) => {
        if (product.imageUrl) return product.imageUrl;
        if (product.image) return product.image;
        if (product.images && product.images.length > 0) {
            const firstImg = product.images[0];
            if (typeof firstImg === 'string') return firstImg;
            if (typeof firstImg === 'object' && firstImg !== null) {
                return firstImg.image_url || firstImg.url || null;
            }
        }
        return null;
    };

    // Helper to format price
    const formatPrice = (price?: number) => {
        if (!price) return 'Contact for price';
        return `RWF ${price.toLocaleString()}`;
    };

    return (
        <div
            className="relative"
            onMouseLeave={handleMouseLeaveMenu}
        >
            {/* All Categories Trigger - Alibaba Style */}
            <button
                onMouseEnter={handleMouseEnterTrigger}
                className={`flex items-center gap-2 px-1 py-2.5 text-[14px] font-semibold transition-all duration-200 ${isOpen
                    ? 'text-teal-600 dark:text-teal-500'
                    : 'text-gray-900 dark:text-gray-100 hover:text-teal-600 dark:hover:text-teal-500'
                    }`}
            >
                <Menu className="w-[18px] h-[18px]" />
                <span>All Categories</span>
            </button>

            {/* Mega Menu Panel - Alibaba Style - Two Column Layout */}
            {isOpen && (
                <div
                    className="absolute top-full left-0 mt-0 flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden z-[100] transition-all duration-300 ease-in-out"
                    style={{
                        minHeight: '450px',
                        maxHeight: '600px',
                        width: '900px' // Fixed width for two-column layout
                    }}
                >
                    {/* Left Side: Scrollable Categories - Alibaba Style */}
                    <div className="w-[280px] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 py-2 overflow-y-auto flex-shrink-0 scrollbar-thin">
                        {topLevelCategories.map((cat) => {
                            const Icon = getCategoryIcon(cat.name);
                            const isActive = activeCategoryId === cat.id;

                            return (
                                <Link
                                    key={cat.id}
                                    to={`/items?category=${cat.id}`}
                                    onMouseEnter={() => handleCategoryHover(cat.id)}
                                    className={`group flex items-center justify-between px-4 py-3 cursor-pointer transition-all duration-150 ${isActive
                                        ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-500'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-teal-600 dark:hover:text-teal-500'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className={`flex-shrink-0 w-[20px] h-[20px] flex items-center justify-center transition-colors ${isActive ? 'text-teal-600 dark:text-teal-500' : 'text-gray-400 group-hover:text-teal-600'
                                            }`}>
                                            <Icon className="w-full h-full" />
                                        </div>
                                        <span className="text-[14px] font-normal leading-tight truncate">{cat.name}</span>
                                    </div>
                                    <ChevronRight className={`flex-shrink-0 w-4 h-4 ml-2 transition-all duration-150 ${isActive
                                        ? 'translate-x-0.5 text-teal-600 dark:text-teal-500'
                                        : 'text-gray-300 dark:text-gray-600 group-hover:text-teal-600'
                                        }`} />
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Side: Products Panel - Alibaba Style - Always Visible */}
                    <div className="flex-1 bg-white dark:bg-gray-800 p-6 flex flex-col overflow-y-auto scrollbar-thin">
                        {activeCategoryId ? (
                            <div className="animate-fadeIn flex flex-col h-full">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100 dark:border-gray-700">
                                    <h3 className="text-[16px] font-semibold text-gray-900 dark:text-white">
                                        {topLevelCategories.find(c => c.id === activeCategoryId)?.name}
                                    </h3>
                                    <Link
                                        to={`/items?category=${activeCategoryId}`}
                                        className="text-[13px] text-teal-600 dark:text-teal-500 hover:text-teal-700 dark:hover:text-teal-400 font-medium hover:underline transition-colors"
                                    >
                                        View All →
                                    </Link>
                                </div>


                                {/* Products Grid - Alibaba Style */}
                                {activeCategoryProducts.length > 0 ? (
                                    <div className="flex flex-col gap-4 flex-1">
                                        {/* Category Products */}
                                        <div>
                                            <h4 className="text-[13px] font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                                Products in this category
                                            </h4>
                                            <div className="grid grid-cols-3 gap-3">
                                                {activeCategoryProducts.map((product) => {
                                                    const productImage = getProductImage(product);
                                                    const productName = product.title || product.name || 'Unnamed Product';

                                                    return (
                                                        <Link
                                                            key={product.id}
                                                            to={`/items/${product.id}`}
                                                            className="group flex flex-col"
                                                        >
                                                            <div className="flex flex-col gap-2 p-2 -m-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-all duration-150">
                                                                {/* Product Image */}
                                                                <div className="w-full aspect-square rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                                                                    {productImage ? (
                                                                        <img
                                                                            src={productImage}
                                                                            alt={productName}
                                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center">
                                                                            <ShoppingBag className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Product Info */}
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200 group-hover:text-teal-600 dark:group-hover:text-teal-500 transition-colors line-clamp-2 leading-tight">
                                                                        {productName}
                                                                    </span>
                                                                    <span className="text-[12px] font-semibold text-teal-600 dark:text-teal-500">
                                                                        {formatPrice(product.price)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Trending Products Section */}
                                        {popularProducts.length > 0 && (
                                            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <TrendingUp className="w-4 h-4 text-teal-600 dark:text-teal-500" />
                                                    <h4 className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">
                                                        Trending Products
                                                    </h4>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {popularProducts.map((product) => {
                                                        const productImage = getProductImage(product);
                                                        const productName = product.title || product.name || 'Unnamed Product';

                                                        return (
                                                            <Link
                                                                key={product.id}
                                                                to={`/items/${product.id}`}
                                                                className="group flex gap-3 p-2 -m-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/10 transition-all duration-150"
                                                            >
                                                                {/* Product Image - Smaller */}
                                                                <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex-shrink-0">
                                                                    {productImage ? (
                                                                        <img
                                                                            src={productImage}
                                                                            alt={productName}
                                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center">
                                                                            <ShoppingBag className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Product Info */}
                                                                <div className="flex flex-col gap-1 flex-1 min-w-0">
                                                                    <span className="text-[12px] font-medium text-gray-800 dark:text-gray-200 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors line-clamp-2 leading-tight">
                                                                        {productName}
                                                                    </span>
                                                                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-500">
                                                                        {formatPrice(product.price)}
                                                                    </span>
                                                                </div>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                                        <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                                        <p className="text-[14px] text-gray-500 dark:text-gray-400 font-medium">
                                            No products available in this category
                                        </p>
                                        <Link
                                            to={`/items?category=${activeCategoryId}`}
                                            className="mt-3 text-[13px] text-teal-600 dark:text-teal-500 hover:text-teal-700 dark:hover:text-teal-400 font-medium hover:underline"
                                        >
                                            Browse all categories →
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Default state when no category is hovered
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mb-4">
                                    <ShoppingBag className="w-10 h-10 text-teal-600 dark:text-teal-500" />
                                </div>
                                <h3 className="text-[16px] font-semibold text-gray-900 dark:text-white mb-2">
                                    Browse Our Products
                                </h3>
                                <p className="text-[13px] text-gray-500 dark:text-gray-400 max-w-[280px]">
                                    Hover over a category on the left to see available products
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlibabaCategoryMenu;
