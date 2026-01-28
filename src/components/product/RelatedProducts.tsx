import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '../../pages/admin/interfaces';
import { fetchAvailableProducts, fetchProductPricesByProductId } from '../../pages/admin/service';
import { getProductImagesByProductId } from '../../pages/my-account/service/api';

interface RelatedProductsProps {
  currentProductId: string;
  categoryId?: string;
  onProductClick?: (productId: string) => void;
}

// Utility function to safely format prices
const formatPrice = (value: any, decimals: number = 2): string => {
  const num = Number(value);
  return isNaN(num) ? '0.00' : num.toFixed(decimals);
};

const RelatedProducts: React.FC<RelatedProductsProps> = ({
  currentProductId,
  categoryId,
  onProductClick
}) => {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [productImages, setProductImages] = useState<Record<string, string[]>>({});
  const [productPrices, setProductPrices] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || undefined;
        
        // Fetch all available products
        const result = await fetchAvailableProducts(token, true);
        const allProducts = result.data || [];

        // Filter products by category and exclude current product
        let filtered = allProducts.filter((product: any) => product.id !== currentProductId);
        
        // If we have a categoryId, prioritize products from the same category
        if (categoryId) {
          const sameCategoryProducts = filtered.filter((product: any) => 
            String(product.category_id || product.categoryId) === String(categoryId)
          );
          
          // If we have products from the same category, use them
          if (sameCategoryProducts.length > 0) {
            filtered = sameCategoryProducts;
          }
        }

        // Limit to 8 products for better performance
        const limitedProducts = filtered.slice(0, 8);
        setRelatedProducts(limitedProducts);

        // Fetch images for each product
        const imagesMap: Record<string, string[]> = {};
        const pricesMap: Record<string, any> = {};
        
        await Promise.all(
          limitedProducts.map(async (product: any) => {
            try {
              // Fetch images
              const imgs = await getProductImagesByProductId(product.id);
              const normalized: string[] = [];
              if (Array.isArray(imgs)) {
                imgs.forEach((img: any) => {
                  if (img && img.image_url) {
                    normalized.push(img.image_url);
                  }
                });
              }
              imagesMap[product.id] = normalized.length ? normalized : [];

              // Fetch pricing data
              const priceResult = await fetchProductPricesByProductId(product.id);
              if (priceResult.success && priceResult.data && priceResult.data.length > 0) {
                pricesMap[product.id] = priceResult.data[0];
              }
            } catch {
              imagesMap[product.id] = [];
              // Don't set price data if fetch fails - will fall back to product base price
            }
          })
        );

        setProductImages(imagesMap);
        setProductPrices(pricesMap);
      } catch (error) {
        console.error('Failed to fetch related products:', error);
        setRelatedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProductId, categoryId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded mb-3"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p>No related products found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600 dark:text-slate-300">
          {relatedProducts.length} {categoryId ? 'similar' : 'related'} products found
        </span>
        <Link 
          to={categoryId ? `/items?category=${categoryId}` : "/items"} 
          className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium text-sm flex items-center space-x-1"
        >
          <span>View all</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {relatedProducts.map((product, index) => {
          const productImage = productImages[product.id]?.[0];
          const productPriceData = productPrices[product.id];
          
          // Get price from pricing data first, then fall back to product base price
          const price = Number(
            productPriceData?.price_per_day || 
            product.base_price_per_day || 
            product.price || 
            0
          );
          
          // Get currency from pricing data first, then fall back to product currency
          const currency = productPriceData?.currency || 
                          product.base_currency || 
                          product.currency || 
                          'RWF';
          
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="group cursor-pointer"
              onClick={() => onProductClick?.(product.id)}
            >
              <Link to={`/alibaba/${product.id}`} className="block">
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded hover:shadow-md transition-shadow">
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gray-100 dark:bg-slate-800 overflow-hidden rounded-t">
                    {productImage ? (
                      <img
                        src={productImage}
                        alt={product.title || product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    
                    {/* No Image Fallback */}
                    <div className={`${productImage ? 'hidden' : ''} w-full h-full flex items-center justify-center`}>
                      <ShoppingBag className="w-8 h-8 text-gray-300 dark:text-slate-500" />
                    </div>
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Handle favorite toggle
                      }}
                      className="absolute top-2 right-2 p-1 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-slate-800"
                    >
                      <Heart className="w-3 h-3 text-gray-600 dark:text-slate-300 hover:text-red-500" />
                    </button>

                    {/* Featured Badge */}
                    {product.is_featured && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-tight">
                      {product.title || product.name}
                    </h4>
                    
                    {/* Price */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-sm font-bold text-red-600">
                          {currency} {formatPrice(price)}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-slate-400">/day</span>
                      </div>
                    </div>

                    {/* MOQ */}
                    <div className="text-xs text-gray-500 dark:text-slate-400 mb-2">
                      Min: 1 day rental
                    </div>

                    {/* Rating & Reviews */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-gray-700 dark:text-slate-300">
                          {product.average_rating || '0.0'}
                        </span>
                        <span className="text-gray-500 dark:text-slate-400">
                          ({product.review_count || 0})
                        </span>
                      </div>
                      
                      {/* Quick Contact Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Handle quick contact
                        }}
                        className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Contact
                      </button>
                    </div>

                    {/* Location */}
                    {(product.district || product.sector || product.address_line) && (
                      <div className="text-xs text-gray-500 dark:text-slate-400 mt-1 truncate">
                        📍 {product.district || product.sector || product.address_line}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* View More Button */}
      <div className="mt-6 text-center">
        <Link
          to={categoryId ? `/items?category=${categoryId}` : '/items'}
          className="inline-flex items-center space-x-2 px-6 py-2 border border-teal-500 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded transition-colors text-sm"
        >
          <span>View More {categoryId ? 'Similar' : 'Related'} Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default RelatedProducts;