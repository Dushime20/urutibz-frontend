import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById } from '../../pages/admin/service';
import { Product } from '../../pages/admin/interfaces';
import { 
  Heart, 
  Share2, 
  MapPin, 
  Shield, 
  Star, 
  Truck, 
  Plus,
  Minus,
  CheckCircle,
  Menu,
  Search,
  User,
  ShoppingCart
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { motion } from 'framer-motion';
import ProductImageGallery from './ProductImageGallery';
import SupplierCard from './SupplierCard';
import ProductTabs from './ProductTabs';
import RelatedProducts from './RelatedProducts';
import LoginSignupModal from '../auth/LoginSignupModal';
import MessagingModal from '../messaging/MessagingModal';
import { getProductImagesByProductId } from '../../pages/my-account/service/api';
import { fetchProductPricesByProductId, fetchUserById } from '../../pages/admin/service';

// Utility function to safely format prices
const formatPrice = (value: any, decimals: number = 2): string => {
  const num = Number(value);
  return isNaN(num) ? '0.00' : num.toFixed(decimals);
};

const AlibabaProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'specifications' | 'reviews' | 'shipping' | 'faq'>('overview');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState<any>(null);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [productPrices, setProductPrices] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMessagingModal, setShowMessagingModal] = useState(false);
  const [showStickyAddToCart, setShowStickyAddToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const token = localStorage.getItem('token') || undefined;
        const data = await getProductById(id, token);
        setProduct(data);
        
        if (data && data.id) {
          // Fetch product images
          const rawImages = await getProductImagesByProductId(data.id);
          const normalizedImages: string[] = [];
          
          if (Array.isArray(rawImages)) {
            rawImages.forEach((img: any) => {
              if (img && img.image_url) {
                normalizedImages.push(img.image_url);
              }
            });
          }
          
          setImages(normalizedImages.length > 0 ? normalizedImages : []);
        }
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch owner information when product is loaded
  useEffect(() => {
    if (!product?.owner_id) return;

    const fetchOwnerInfo = async () => {
      setOwnerLoading(true);
      try {
        const token = localStorage.getItem('token') || undefined;
        const result = await fetchUserById(product.owner_id, token);

        if (result.data) {
          const owner = result.data;
          const ownerName = owner.first_name && owner.last_name
            ? `${owner.first_name} ${owner.last_name}`
            : owner.email || 'Product Owner';

          setOwnerInfo({
            id: owner.id,
            name: ownerName,
            email: owner.email,
            phone: owner.phone || owner.phone_number,
            avatar: owner.profile_image_url || owner.profileImageUrl,
            bio: owner.bio,
            location: owner.district || owner.sector || 'Rwanda',
            kycStatus: owner.kyc_status,
            emailVerified: owner.email_verified,
            phoneVerified: owner.phone_verified,
            createdAt: owner.created_at,
            lastLoginAt: owner.last_login_at
          });
        }
      } catch (err) {
        console.error('Error fetching owner info:', err);
      } finally {
        setOwnerLoading(false);
      }
    };

    fetchOwnerInfo();
  }, [product?.owner_id]);

  // Fetch product prices
  useEffect(() => {
    if (!product?.id) return;

    const fetchPrices = async () => {
      try {
        const result = await fetchProductPricesByProductId(product.id);
        if (result.success && result.data && result.data.length > 0) {
          setProductPrices(result.data[0]);
        }
      } catch (error) {
        console.error('Error fetching product prices:', error);
      }
    };

    fetchPrices();
  }, [product?.id]);

  // Sticky Add to Cart - Show when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const shouldShow = scrollY > 400; // Show after scrolling 400px
      setShowStickyAddToCart(shouldShow);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleImageSelect = (image: string, index: number) => {
    setSelectedImageIndex(index);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (product) {
      addToCart({
        productId: product.id,
        productTitle: product.title,
        productImage: images[selectedImageIndex] || images[0],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        pricePerDay: price,
        currency: currency,
        ownerId: product.owner_id,
        categoryId: product.category_id
      });
      showToast('Added to cart successfully!', 'success');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.title,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    }
  };

  const toggleFavorite = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setIsFavorite(!isFavorite);
    showToast(isFavorite ? 'Removed from favorites' : 'Added to favorites', 'success');
  };

  const handleContactSupplier = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    setShowMessagingModal(true);
  };

  const handleCallSupplier = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!ownerInfo?.phone) {
      showToast('Owner phone number not available', 'error');
      return;
    }

    // Clean phone number (remove any non-digit characters except +)
    const cleanPhone = ownerInfo.phone.replace(/[^\d+]/g, '');
    
    // Create professional WhatsApp message
    const productName = product?.title || product?.name || 'Product';
    const message = `Hello! I'm interested in renting your "${productName}" listed on URUTIBUZ. Could you please provide more details about availability and rental terms? Thank you!`;
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
    
    showToast('Redirecting to WhatsApp...', 'success');
  };

  const handleTabChange = (tab: 'overview' | 'specifications' | 'reviews' | 'shipping' | 'faq') => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-lg shadow-sm dark:border dark:border-slate-700 text-center max-w-md">
          <Shield className="w-16 h-16 text-gray-300 dark:text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Product Not Found</h2>
          <Link to="/items" className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold">
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const price = Number(productPrices?.price_per_day || product?.base_price_per_day || product?.price || 0);
  const currency = productPrices?.currency || product?.base_currency || product?.currency || 'RWF';
  const securityDeposit = Number(productPrices?.security_deposit || product?.security_deposit || 0);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Breadcrumb Navigation - Alibaba Style */}
      <div className="hidden lg:block bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <nav className="flex items-center space-x-1 text-xs text-gray-600 dark:text-slate-300">
            <Link to="/" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Home</Link>
            <span className="text-gray-400 dark:text-slate-500">&gt;</span>
            <Link to="/items" className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">All Categories</Link>
            <span className="text-gray-400 dark:text-slate-500">&gt;</span>
            <span className="text-gray-900 dark:text-slate-100 capitalize">{product.category_name || product.category_id || 'Products'}</span>
            <span className="text-gray-400 dark:text-slate-500">&gt;</span>
            <span className="text-gray-900 dark:text-slate-100 font-medium truncate">{product.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {/* Product Header Section - Alibaba Style */}
        <motion.div 
          className="mb-4 lg:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white mb-2 lg:mb-3 leading-tight">{product.title || product.name}</h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-slate-300 mb-2">
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.average_rating || '0.0'}</span>
                  <span className="text-gray-500 dark:text-slate-400">({product.review_count || 0} Reviews)</span>
                </div>
                <span className="text-gray-400 dark:text-slate-500 hidden sm:inline">|</span>
                <span className="text-gray-600 dark:text-slate-300">{product.view_count || 0} Views</span>
                <span className="text-gray-400 dark:text-slate-500 hidden sm:inline">|</span>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{product.district || product.sector || product.address_line || 'Rwanda'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-2 lg:mt-0 w-full lg:w-auto">
              <motion.button
                onClick={toggleFavorite}
                className={`flex items-center space-x-1 px-3 py-1.5 text-xs sm:text-sm border rounded transition-colors flex-1 lg:flex-none justify-center ${
                  isFavorite 
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' 
                    : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:border-teal-300 dark:hover:border-teal-600 hover:text-teal-600 dark:hover:text-teal-400'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isFavorite ? 'fill-current' : ''}`} />
                <span>Favorite</span>
              </motion.button>
              <motion.button
                onClick={handleShare}
                className="flex items-center space-x-1 px-3 py-1.5 text-xs sm:text-sm border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors flex-1 lg:flex-none justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Share</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Main Product Section - 3 Column Layout like your ItemDetailsPage */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-8">
          {/* Left Column - Images and Details (2/3 width) */}
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            {/* Image Gallery */}
            <motion.div 
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-3 lg:p-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <ProductImageGallery
                images={images}
                productTitle={product.title}
                selectedIndex={selectedImageIndex}
                onImageSelect={handleImageSelect}
              />
            </motion.div>

            {/* Product Details Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <ProductTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
                product={product}
              />
            </motion.div>
          </div>

          {/* Right Column - Pricing & Supplier (1/3 width) */}
          <div className="lg:col-span-1">
            <div className="space-y-3 lg:space-y-4">
              {/* Sticky Pricing Section Only - Always visible */}
              <div className="lg:sticky lg:top-8">
                <motion.div 
                  className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg p-4 lg:p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {/* Price Section */}
                  <div className="mb-4 lg:mb-6">
                    <div className="flex items-baseline space-x-2 mb-2">
                      <span className="text-2xl lg:text-3xl font-bold text-red-600">
                        {currency} {formatPrice(price)}
                      </span>
                      <span className="text-gray-500 dark:text-slate-400 text-sm">/ day</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-300 mb-3 lg:mb-4">
                      <span className="font-medium">MOQ:</span> 1 day
                    </div>
                    
                    {/* Price Range Table */}
                    <div className="border border-gray-200 dark:border-slate-600 rounded text-sm mb-4 lg:mb-6">
                      <div className="bg-gray-50 dark:bg-slate-800 px-3 py-2 border-b border-gray-200 dark:border-slate-600 font-medium text-gray-700 dark:text-slate-300">
                        Rental Duration Pricing
                      </div>
                      <div className="divide-y divide-gray-200 dark:divide-slate-600">
                        <div className="flex justify-between px-3 py-2">
                          <span className="text-gray-600 dark:text-slate-300">1-6 days</span>
                          <span className="font-medium dark:text-white">{currency} {formatPrice(price)}/day</span>
                        </div>
                        {productPrices?.price_per_week && !isNaN(Number(productPrices.price_per_week)) && (
                          <div className="flex justify-between px-3 py-2">
                            <span className="text-gray-600 dark:text-slate-300">7+ days (weekly)</span>
                            <span className="font-medium dark:text-white">{currency} {formatPrice(Number(productPrices.price_per_week) / 7)}/day</span>
                          </div>
                        )}
                        {productPrices?.price_per_month && !isNaN(Number(productPrices.price_per_month)) && (
                          <div className="flex justify-between px-3 py-2">
                            <span className="text-gray-600 dark:text-slate-300">30+ days (monthly)</span>
                            <span className="font-medium dark:text-white">{currency} {formatPrice(Number(productPrices.price_per_month) / 30)}/day</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex items-center space-x-3 lg:space-x-4">
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300 min-w-[60px]">Days:</span>
                      <div className="flex items-center border border-gray-300 dark:border-slate-600 rounded">
                        <motion.button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-2 lg:px-3 py-1 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-r border-gray-300 dark:border-slate-600"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Minus className="w-4 h-4" />
                        </motion.button>
                        <input 
                          type="number" 
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-12 lg:w-16 px-2 py-1 text-center border-0 focus:outline-none bg-transparent dark:text-white text-sm"
                        />
                        <motion.button
                          onClick={() => setQuantity(quantity + 1)}
                          className="px-2 lg:px-3 py-1 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-l border-gray-300 dark:border-slate-600"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Plus className="w-4 h-4" />
                        </motion.button>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-slate-400">days rental</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <motion.button
                        onClick={handleAddToCart}
                        disabled={isInCart(product.id)}
                        className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white font-medium py-2.5 lg:py-3 px-4 rounded transition-colors text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isInCart(product.id) ? 'In Cart' : 'Add to Cart'}
                      </motion.button>
                      <motion.button 
                        onClick={handleContactSupplier}
                        className="w-full border border-teal-500 text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 font-medium py-2.5 lg:py-3 px-4 rounded transition-colors text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Contact Supplier
                      </motion.button>
                    </div>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-4 lg:mt-6 pt-4 border-t border-gray-200 dark:border-slate-600">
                    <div className="grid grid-cols-1 gap-2 text-xs text-gray-600 dark:text-slate-300">
                      {product.is_featured && (
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>Featured Product</span>
                        </div>
                      )}
                      {product.delivery_available && (
                        <div className="flex items-center space-x-2">
                          <Truck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span>Delivery available</span>
                        </div>
                      )}
                      {product.pickup_available && (
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>Pickup available</span>
                        </div>
                      )}
                      {securityDeposit > 0 && (
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4 text-teal-600 flex-shrink-0" />
                          <span>Security deposit: {currency} {formatPrice(securityDeposit, 0)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Supplier Card - Not sticky, scrolls normally */}
              {ownerInfo ? (
                <SupplierCard
                  supplierId={ownerInfo.id}
                  supplierName={ownerInfo.name}
                  rating={4.5} // TODO: Calculate from owner reviews
                  reviewCount={0} // TODO: Count owner reviews
                  responseTime="< 24 hours"
                  isVerified={ownerInfo.kycStatus === 'verified'}
                  location={ownerInfo.location}
                  yearsInBusiness={ownerInfo.createdAt ? Math.max(1, new Date().getFullYear() - new Date(ownerInfo.createdAt).getFullYear()) : 1}
                  totalProducts={1} // TODO: Count owner's products
                  avatar={ownerInfo.avatar}
                  bio={ownerInfo.bio}
                  emailVerified={ownerInfo.emailVerified}
                  phoneVerified={ownerInfo.phoneVerified}
                  onContactSupplier={handleContactSupplier}
                  onCallSupplier={handleCallSupplier}
                />
              ) : ownerLoading ? (
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded p-4">
                  <div className="animate-pulse">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded"></div>
                      <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <SupplierCard
                  supplierId={product.owner_id}
                  supplierName="Product Owner"
                  rating={4.0}
                  reviewCount={0}
                  responseTime="< 24 hours"
                  isVerified={false}
                  location="Rwanda"
                  yearsInBusiness={1}
                  totalProducts={1}
                  onContactSupplier={handleContactSupplier}
                  onCallSupplier={handleCallSupplier}
                />
              )}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="mt-8 lg:mt-12"
        >
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg">
            <div className="px-4 lg:px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">You May Also Like</h3>
            </div>
            <div className="p-4 lg:p-6">
              <RelatedProducts
                currentProductId={product.id}
                categoryId={product.category_id}
                onProductClick={(productId) => navigate(`/alibaba/${productId}`)}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sticky Add to Cart Modal - Shows when scrolling */}
      {showStickyAddToCart && product && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              {/* Product Info */}
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                  {images[selectedImageIndex] ? (
                    <img 
                      src={images[selectedImageIndex]} 
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {product.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-red-600">
                      {currency} {formatPrice(price)}
                    </span>
                    <span className="text-gray-500 dark:text-slate-400 text-xs">/ day</span>
                    <span className="text-gray-400 dark:text-slate-500">•</span>
                    <span className="text-xs text-gray-600 dark:text-slate-300">MOQ: 1 day</span>
                  </div>
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                {/* Quantity Selector */}
                <div className="flex items-center border border-gray-300 dark:border-slate-600 rounded">
                  <motion.button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-2 py-1 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-r border-gray-300 dark:border-slate-600"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Minus className="w-3 h-3" />
                  </motion.button>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 px-2 py-1 text-center border-0 focus:outline-none bg-transparent dark:text-white text-sm"
                  />
                  <motion.button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-2 py-1 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-l border-gray-300 dark:border-slate-600"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Plus className="w-3 h-3" />
                  </motion.button>
                </div>

                {/* Add to Cart Button */}
                <motion.button
                  onClick={handleAddToCart}
                  disabled={isInCart(product.id)}
                  className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition-colors text-sm flex items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{isInCart(product.id) ? 'In Cart' : 'Add to Cart'}</span>
                </motion.button>

                {/* Contact Supplier Button - Hidden on small screens */}
                <motion.button 
                  onClick={handleContactSupplier}
                  className="hidden sm:flex border border-teal-500 text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 font-medium py-2 px-4 rounded transition-colors text-sm items-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <User className="w-4 h-4" />
                  <span>Contact</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Login/Signup Modal */}
      <LoginSignupModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          showToast('Welcome! You can now continue with your rental.', 'success');
        }}
      />

      {/* Messaging Modal */}
      {product && ownerInfo && (
        <MessagingModal
          isOpen={showMessagingModal}
          onClose={() => setShowMessagingModal(false)}
          productId={product.id}
          productTitle={product.title || product.name || ''}
          ownerId={ownerInfo.id}
          ownerName={ownerInfo.name}
          ownerAvatar={ownerInfo.avatar}
          productImage={images[0]}
          productPrice={productPrices?.price_per_day && productPrices?.currency
            ? `${productPrices.currency} ${productPrices.price_per_day}/day`
            : product.base_price_per_day
              ? `${product.base_price_per_day} ${product.base_currency}/day`
              : undefined
          }
        />
      )}
    </div>
  );
};

export default AlibabaProductDetail;