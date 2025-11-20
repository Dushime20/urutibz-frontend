import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

interface ProductSwiperProps {
  title: string;
  products: any[];
  productImages: Record<string, string[]>;
  itemLocations: Record<string, { city: string | null; country: string | null }>;
  productPrices: Record<string, any>;
  favoriteMap: Record<string, boolean>;
  locationsLoading: Record<string, boolean>;
  onFavoriteToggle?: (productId: string, isFavorite: boolean) => void;
  onProductClick?: (productId: string, index: number) => void;
  formatCurrency: (amount: string, currency: string) => string;
  tSync: (text: string) => string;
  showNavigation?: boolean;
  autoplay?: boolean;
  slidesPerView?: number;
  spaceBetween?: number;
  autoplayDelay?: number;
}

const ProductSwiper: React.FC<ProductSwiperProps> = ({
  title,
  products,
  productImages,
  itemLocations,
  productPrices,
  favoriteMap,
  locationsLoading,
  onFavoriteToggle,
  onProductClick,
  formatCurrency,
  tSync,
  showNavigation = true,
  autoplay = true,
  slidesPerView = 4,
  spaceBetween = 20,
  autoplayDelay
}) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const nextButtonRef = useRef<HTMLButtonElement>(null);

  // Generate random delay between 5-10 seconds if not provided
  const delay = autoplayDelay || Math.floor(Math.random() * 5000) + 5000; // 5000-10000ms

  const handlePrev = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  if (products.length === 0) {
    return null;
  }

  const swiperModules = [Navigation, Pagination, Autoplay];

  return (
    <div className="w-full">
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
            {title}
          </h2>
        </div>
      )}
      
      <div className="relative group">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          modules={swiperModules}
          spaceBetween={spaceBetween}
          slidesPerView={1}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 16
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 20
            },
            1024: {
              slidesPerView: slidesPerView,
              spaceBetween: spaceBetween
            }
          }}
          navigation={false}
          pagination={{
            clickable: true,
            dynamicBullets: true
          }}
          autoplay={autoplay ? {
            delay: delay,
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          } : false}
          loop={products.length > slidesPerView}
          className="product-swiper"
        >
          {products.map((product, index) => (
            <SwiperSlide key={product.id}>
              <ProductCard
                product={product}
                productImages={productImages}
                itemLocations={itemLocations}
                productPrices={productPrices}
                favoriteMap={favoriteMap}
                locationsLoading={locationsLoading}
                onFavoriteToggle={onFavoriteToggle}
                onProductClick={onProductClick}
                index={index}
                formatCurrency={formatCurrency}
                tSync={tSync}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        {showNavigation && products.length > slidesPerView && (
          <>
            <button
              ref={prevButtonRef}
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-gray-200 dark:border-slate-700 flex items-center justify-center hover:bg-teal-50 dark:hover:bg-slate-700 hover:border-teal-500 dark:hover:border-teal-500 transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
            </button>
            <button
              ref={nextButtonRef}
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white dark:bg-slate-800 shadow-xl border border-gray-200 dark:border-slate-700 flex items-center justify-center hover:bg-teal-50 dark:hover:bg-slate-700 hover:border-teal-500 dark:hover:border-teal-500 transition-all duration-300 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6 text-gray-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductSwiper;

