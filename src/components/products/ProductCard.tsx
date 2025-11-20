import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { TranslatedText } from '../translated-text';

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
  tSync: (text: string) => string;
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
  formatCurrency,
  tSync
}) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(product.id, Boolean(favoriteMap[product.id]));
    }
  };

  const handleProductClick = () => {
    if (onProductClick) {
      onProductClick(product.id, index);
    }
  };

  return (
    <Link
      to={`/it/${product.id}`}
      className="group block"
      onClick={handleProductClick}
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden hover:shadow-lg dark:hover:shadow-slate-900/50 transition-all duration-300 border border-gray-100 dark:border-slate-700 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
          {productImages[product.id]?.[0] ? (
            <img
              src={productImages[product.id][0]}
              alt={product.title || product.name || tSync('Product listing')}
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
          {/* Heart Icon */}
          <button
            type="button"
            aria-label={tSync('Add to favorites')}
            className="absolute top-3 right-3 w-8 h-8 bg-black/20 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40 rounded-full flex items-center justify-center transition-colors z-10"
            onClick={handleFavoriteClick}
          >
            <Heart className={`w-4 h-4 ${favoriteMap[product.id] ? 'text-red-500 fill-current' : 'text-white dark:text-slate-200'}`} />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 space-y-1 flex-1 flex flex-col">
          {/* Title and Rating */}
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-gray-900 dark:text-slate-100 text-sm leading-tight flex-1 pr-2">
              {product.title || product.name}
            </h3>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Star className="w-3 h-3 fill-current text-yellow-400" />
              <span className="text-sm text-gray-900 dark:text-slate-100">
                {product.average_rating || '4.8'}
              </span>
            </div>
          </div>
          
          {/* Location */}
          <p className="text-gray-600 dark:text-slate-400 text-sm">
            {locationsLoading[product.id] ? (
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 border border-gray-300 dark:border-slate-500 border-t-gray-600 dark:border-t-slate-300 rounded-full animate-spin"></div>
                <TranslatedText text="Loading location..." />
              </span>
            ) : (
              <>
                {itemLocations[product.id]?.city || <TranslatedText text="Unknown Location" />}
                {itemLocations[product.id]?.country ? `, ${itemLocations[product.id]?.country}` : ''}
              </>
            )}
          </p>
          
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
  );
};

export default ProductCard;

