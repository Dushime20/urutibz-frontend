import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { TranslatedText } from '../translated-text';
import AlibabaModal from '../cart/AlibabaModal';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

interface ProductCardProps {
  product: any;
  productImages: Record<string, string[]>;
  itemLocations: Record<string, { city: string | null; country: string | null }>;
  productPrices: Record<string, any>;
  favoriteMap: Record<string, boolean>;
  locationsLoading: Record<string, boolean>;
  onFavoriteToggle?: (productId: string, isFavorite: boolean) => void;
  onProductClick?: (productId: string, index: number) => void;
  index?: number;
  formatCurrency: (amount: string, currency: string) => string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  productImages,
  itemLocations,
  productPrices,
  favoriteMap,
  locationsLoading,
  onFavoriteToggle,
  onProductClick,
  index = 0,
  formatCurrency
}) => {
  const [showAddToCartModal, setShowAddToCartModal] = useState(false);
  const { isInCart } = useCart();
  const { isAuthenticated } = useAuth();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(product.id, Boolean(favoriteMap[product.id]));
    }
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setShowAddToCartModal(true);
  };

  const handleProductClick = () => {
    if (onProductClick) {
      onProductClick(product.id, index);
    }
  };

  const pricePerDay = productPrices[product.id]?.price_per_day || product.base_price_per_day || 0;
  const currency = productPrices[product.id]?.currency || product.base_currency || 'USD';
  const productImage = productImages[product.id]?.[0];

  return (
    <>
      <Link
        to={`/it/${product.id}`}
        className="group block h-full w-full"
        onClick={handleProductClick}
      >
        <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden hover:shadow-lg dark:hover:shadow-slate-900/50 transition-all duration-300 border border-gray-100 dark:border-slate-700 flex flex-col w-full h-full">
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
            {productImages[product.id]?.[0] ? (
              <img
                src={productImages[product.id][0]}
                alt={product.title || product.name || 'Product listing'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            {/* No Image Icon */}
            <div className={`${productImages[product.id]?.[0] ? 'hidden' : ''} flex flex-col items-center justify-center text-gray-400 dark:text-slate-500`}>
              <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium"><TranslatedText text="No Image" /></span>
            </div>
            {/* Action Buttons */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-10 pointer-events-none">
              {/* Heart Icon - Favorites */}
              <button
                type="button"
                aria-label={favoriteMap[product.id] ? 'Remove from favorites' : 'Add to favorites'}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg pointer-events-auto cursor-pointer ${favoriteMap[product.id]
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-sm'
                  }`}
                onClick={handleFavoriteClick}
              >
                <Heart className={`w-5 h-5 transition-all ${favoriteMap[product.id]
                  ? 'text-white fill-current'
                  : 'text-gray-700 dark:text-slate-300'
                  }`} />
              </button>
              {/* Add to Cart Icon - Only show for authenticated users */}
              {pricePerDay > 0 && isAuthenticated && (
                <button
                  type="button"
                  aria-label="Add to cart"
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg pointer-events-auto cursor-pointer ${isInCart(product.id)
                    ? 'bg-teal-600 hover:bg-teal-700'
                    : 'bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-sm'
                    }`}
                  onClick={handleAddToCartClick}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseUp={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <ShoppingCart className={`w-5 h-5 transition-all ${isInCart(product.id)
                    ? 'text-white fill-current'
                    : 'text-gray-700 dark:text-slate-300'
                    }`} />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-3 space-y-1 flex flex-col overflow-hidden">
            {/* Title and Rating */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-gray-900 dark:text-slate-100 text-sm leading-tight flex-1 line-clamp-1">
                <TranslatedText text={product.title || product.name || 'Product'} />
              </h3>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <Star className="w-3 h-3 fill-current text-yellow-400" />
                <span className="text-sm text-gray-900 dark:text-slate-100">
                  {product.average_rating || '4.8'}
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="text-gray-600 dark:text-slate-400 text-sm line-clamp-1">
              {locationsLoading[product.id] ? (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 border border-gray-300 dark:border-slate-500 border-t-gray-600 dark:border-t-slate-300 rounded-full animate-spin inline-block"></span>
                  <TranslatedText text="Loading location..." />
                </span>
              ) : (
                <>
                  {itemLocations[product.id]?.city || product.address_line || <TranslatedText text="Unknown Location" />}
                  {itemLocations[product.id]?.country ? `, ${itemLocations[product.id]?.country}` : ''}
                </>
              )}
            </div>

            {/* Price */}
            <div className="text-gray-900 dark:text-slate-100 pt-1">
              {productPrices[product.id]?.price_per_day ? (
                <>
                  <span className="font-semibold">
                    {formatCurrency(productPrices[product.id].price_per_day, productPrices[product.id].currency)}
                  </span>
                  <span className="text-sm"> / <TranslatedText text="per day" /></span>
                </>
              ) : product.base_price_per_day != null ? (
                <>
                  <span className="font-semibold">${product.base_price_per_day}</span>
                  <span className="text-sm"> / <TranslatedText text="per day" /></span>
                </>
              ) : (
                <span className="font-semibold"><TranslatedText text="Price on Request" /></span>
              )}
            </div>
          </div>
        </div>
      </Link>
      {showAddToCartModal && pricePerDay > 0 && typeof document !== 'undefined' && createPortal(
        <AlibabaModal
          isOpen={showAddToCartModal}
          onClose={() => setShowAddToCartModal(false)}
          product={{
            id: product.id,
            title: product.title || product.name || '',
            image: productImage,
            pricePerDay: typeof pricePerDay === 'string' ? parseFloat(pricePerDay) : pricePerDay,
            currency,
            ownerId: product.owner_id || '',
            categoryId: product.category_id,
            pickupAvailable: product.pickup_available !== false,
            deliveryAvailable: product.delivery_available === true,
            pickup_methods: product.pickup_methods,
            address_line: product.address_line,
            location: product.location,
          }}
        />,
        document.body
      )}
    </>
  );
};

export default ProductCard;

