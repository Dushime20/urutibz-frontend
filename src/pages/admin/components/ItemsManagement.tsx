import React, { useState, useEffect } from 'react';
import { Plus, Filter, MoreHorizontal, X, Package, Check, Shield } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';
import type { Product, Owner, ItemCategory } from '../types';
import { fetchProductImages, getProductById, fetchUserById } from '../service';
import { fetchProductAvailability } from '../service';
import { type ProductAvailability } from '../interfaces';
import { filterCurrentAndFutureAvailability } from '../../../lib/utils';
import { fetchCategoryById } from '../service';
import { wkbHexToLatLng, getCityFromCoordinates } from '../../../lib/utils';
import { fetchProductPricesByProductId } from '../../my-account/service/api';
import { fetchCategories } from '../service';
import type { Category } from '../interfaces';
import SkeletonTable from './SkeletonTable';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import { moderateAdminProduct, softDeleteProduct } from '../service';
import ProductModerationHistory from './ProductModerationHistory';
import { PricingService } from '../service/pricingService';
import type { ProductPrice } from '../types/pricing';
import Pagination from '../../../components/ui/Pagination';

interface ItemsManagementProps {
  products: Product[];
  owners: Record<string, Owner>;
  loading: boolean;
  itemCategories: ItemCategory[];
  itemFilter: string;
  setItemFilter: (val: string) => void;
  selectedLocation: string;
  selectedItems: string[];
  setSelectedItems: (ids: string[]) => void;
  Button: React.FC<any>;
  error?: string;
  availabilityFilter?: string;
  setAvailabilityFilter?: (val: string) => void;
  // Optional pagination props
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onRefresh?: () => void;
}

const AdminProductDetailModal: React.FC<{
  open: boolean;
  onClose: () => void;
  productId: string;
  onApproved?: () => void;
  productPrices: { [productId: string]: ProductPrice[] };
  productAvailability: { [productId: string]: ProductAvailability[] };
}> = ({ open, onClose, productId, onApproved, productPrices, productAvailability }) => {
  const { tSync } = useTranslation();
  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [moderateOpen, setModerateOpen] = useState(false);

  // New state for category and owner details
  const [categoryName, setCategoryName] = useState<string>('N/A');
  const [ownerName, setOwnerName] = useState<string>('Unknown');
  const [resolvedLocation, setResolvedLocation] = useState<string>('N/A');

  // Add moderation state
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject' | 'flag' | 'quarantine'>('approve');
  const [moderationReason, setModerationReason] = useState('');
  const [moderateLoading, setModerateLoading] = useState(false);
  const [moderateError, setModerateError] = useState<string | null>(null);
  const [moderationSuccess, setModerationSuccess] = useState(false);

  // Handle ESC key for moderation modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && moderateOpen && !moderateLoading && !moderationSuccess) {
        setModerateOpen(false);
        // Reset form when closing
        setModerationAction('approve');
        setModerationReason('');
        setModerateError(null);
      }
    };

    if (moderateOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [moderateOpen, moderateLoading, moderationSuccess]);

  useEffect(() => {
    if (!open || !productId) return;

    setLoading(true);
    setError(null);
    setCurrentImageIndex(0);

    // Reset moderation form state
    setModerationAction('approve');
    setModerationReason('');
    setModerateError(null);
    setModerationSuccess(false);

    const token = localStorage.getItem('token') || undefined;

    console.group('Product Details Fetch');
    console.log('Product ID:', productId);
    console.log('Token:', token ? 'Present' : 'Not provided');

    Promise.all([
      getProductById(productId, token),
      fetchProductImages(productId, token)
    ])
      .then(async ([productData, imagesData]) => {
        console.log('Raw Product Data:', JSON.stringify(productData, null, 2));
        console.log('Raw Images Data:', JSON.stringify(imagesData, null, 2));

        setProduct(productData);

        // Resolve human-readable location from WKB hex if available
        try {
          const rawLocation = (productData as any)?.location;
          if (typeof rawLocation === 'string' && rawLocation.length > 0) {
            const latlng = wkbHexToLatLng(rawLocation);
            if (latlng && Number.isFinite(latlng.lat) && Number.isFinite(latlng.lng)) {
              const { city, country } = await getCityFromCoordinates(latlng.lat, latlng.lng);
              if (city || country) {
                setResolvedLocation([city, country].filter(Boolean).join(', '));
              } else {
                setResolvedLocation('Unknown');
              }
            } else {
              setResolvedLocation('Unknown');
            }
          } else {
            setResolvedLocation('Unknown');
          }
        } catch (e) {
          console.warn('Failed to resolve product location', e);
          setResolvedLocation('Unknown');
        }

        // Fetch pricing for product and attach for display (daily/weekly/monthly, currency)
        try {
          const priceList = await fetchProductPricesByProductId(productId);
          const firstPrice = Array.isArray(priceList?.data) ? priceList.data[0] : null;
          if (firstPrice) {
            setProduct((prev: any) => ({
              ...prev,
              base_price_per_day: firstPrice.price_per_day ?? prev?.base_price_per_day ?? null,
              base_price_per_week: firstPrice.price_per_week ?? null,
              base_price_per_month: firstPrice.price_per_month ?? null,
              base_currency: firstPrice.currency ?? prev?.base_currency ?? null,
            }));
          }
        } catch (e) {
          console.warn('Failed to fetch product pricing for detail modal', e);
        }

        // Normalize image data
        let productImages: any[] = [];
        if (Array.isArray(imagesData)) {
          productImages = imagesData;
        } else if (imagesData && typeof imagesData === 'object') {
          // Check for nested data structures
          productImages =
            (imagesData as any).data?.data ||
            (imagesData as any).data ||
            imagesData;
        }

        // Ensure productImages is an array
        if (!Array.isArray(productImages)) {
          productImages = [];
        }

        // Normalize image URLs
        productImages = productImages.map((img: any) =>
          img?.url || img?.image_url || img?.src || img
        ).filter(Boolean);

        console.log('Normalized Product Images:', JSON.stringify(productImages, null, 2));
        setImages(productImages);

        // Fetch category name
        if (productData.category_id) {
          try {
            const categoryData = await fetchCategoryById(productData.category_id, token);
            setCategoryName(categoryData.name || 'N/A');
          } catch (err) {
            console.error('Error fetching category:', err);
            setCategoryName('N/A');
          }
        }

        // Fetch owner name
        if (productData.owner_id) {
          console.log('Attempting to fetch owner with ID:', productData.owner_id);
          try {
            const userData = await fetchUserById(productData.owner_id, token);
            console.log('Raw User Data:', JSON.stringify(userData, null, 2));

            // More robust name extraction
            const firstName = userData.data?.first_name || userData.data?.email?.split('@')[0] || 'Unknown';
            const lastName = userData.data?.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim() || 'Unknown';

            console.log('Extracted User Details:', {
              firstName,
              lastName,
              fullName,
              email: userData.data?.email
            });

            console.log('Constructed Full Name:', fullName);

            setOwnerName(fullName);
          } catch (err: any) {
            console.error('Detailed error fetching owner:', err);
            console.error('Error details:', {
              message: err?.message,
              response: JSON.stringify(err?.response?.data, null, 2),
              status: err?.response?.status
            });
            setOwnerName('Unknown');
          }
        } else {
          console.warn('No owner_id found in product data:', JSON.stringify(productData, null, 2));
          setOwnerName('Unknown');
        }
      })
      .catch((err) => {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details.');
      })
      .finally(() => {
        setLoading(false);
        console.groupEnd();
      });
  }, [open, productId]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (images.length ? (prev + 1) % images.length : 0));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (images.length ? (prev - 1 + images.length) % images.length : 0));
  };

  // Moderate handler
  const handleModerate = async () => {
    setModerateLoading(true);
    setModerateError(null);
    try {
      const token = localStorage.getItem('token') || undefined;
      await moderateAdminProduct(productId, { action: moderationAction, reason: moderationReason }, token);

      // Show success message
      setModerationSuccess(true);

      // Wait a moment to show success, then close all modals
      setTimeout(() => {
        setModerationSuccess(false);
        setModerateOpen(false);
        onClose();

        // Optionally refresh product list or show a toast
        if (onApproved) {
          onApproved();
        }
      }, 1500);

    } catch (err: any) {
      setModerateError(err.message || 'Failed to moderate product');
    } finally {
      setModerateLoading(false);
    }
  };

  if (!open) return null;

  // Determine image URL with multiple fallback options
  const currentImageUrl =
    images[currentImageIndex]?.url ||
    images[currentImageIndex]?.image_url ||
    images[currentImageIndex] ||
    '/assets/img/404.png';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full mx-auto overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {product?.title || product?.name || tSync('Product Details')}
            </h2>
            <div className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-2 ${product?.status === 'active'
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
              }`}>
              {product?.status || 'Unknown'}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={moderateLoading || moderationSuccess}
            className={`text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors ${moderateLoading || moderationSuccess ? 'opacity-50 cursor-not-allowed' : ''
              }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Product Images</h3>
              {images.length > 0 ? (
                <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
                  <div className="relative w-full aspect-square max-h-[400px]">
                    <img
                      src={currentImageUrl}
                      alt={`Product image ${currentImageIndex + 1}`}
                      className="w-full h-full object-contain rounded-lg"
                      onError={(e) => {
                        console.error('Image load error:', currentImageUrl);
                        (e.target as HTMLImageElement).src = '/assets/img/placeholder-image.png';
                      }}
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white dark:bg-gray-700 dark:hover:bg-gray-600 shadow-md rounded-full p-2 z-10"
                        >
                          &#8592;
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white dark:bg-gray-700 dark:hover:bg-gray-600 shadow-md rounded-full p-2 z-10"
                        >
                          &#8594;
                        </button>
                      </>
                    )}
                    {images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
                  <div className="relative w-full aspect-square max-h-[400px] flex items-center justify-center">
                    <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                      <Package className="w-16 h-16 mb-3" />
                      <p className="text-sm">No images available</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3>

                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Product ID</div>
                      <div className="font-mono text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        {product?.id || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Category</div>
                      <div className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        {categoryName}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</div>
                    <div className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-3 rounded min-h-[60px]">
                      {typeof product?.description === 'string'
                        ? product.description
                        : typeof product?.description === 'object'
                          ? JSON.stringify(product.description, null, 2)
                          : 'No description available'
                      }
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Owner</div>
                      <div className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        {ownerName}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Location</div>
                      <div className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        {resolvedLocation || 'Unknown'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Condition</div>
                      <div className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        {typeof product?.condition === 'string' ? product.condition : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Brand</div>
                      <div className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        {typeof product?.brand === 'string' ? product.brand : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Model</div>
                      <div className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        {typeof product?.model === 'string' ? product.model : 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Created At</div>
                      <div className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        {product?.created_at ? new Date(product.created_at).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Updated At</div>
                      <div className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        {product?.updated_at ? new Date(product.updated_at).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Width Sections */}
          <div className="mt-8 space-y-6">

            {/* Pricing Information */}
            <div>
              <div className="text-xs text-gray-500 uppercase mb-3">Pricing Details</div>
              <div className="bg-gray-50 p-4 rounded-lg">
                {productPrices[productId]?.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-gray-600 font-medium">Daily Rate:</span>
                        <div className="text-lg font-semibold text-my-primary">
                          {productPrices[productId][0].price_per_day} {productPrices[productId][0].currency}
                        </div>
                      </div>
                      {productPrices[productId][0].price_per_week && (
                        <div>
                          <span className="text-gray-600 font-medium">Weekly Rate:</span>
                          <div className="text-lg font-semibold text-my-primary">
                            {productPrices[productId][0].price_per_week} {productPrices[productId][0].currency}
                          </div>
                        </div>
                      )}
                      {productPrices[productId][0].price_per_month && (
                        <div>
                          <span className="text-gray-600 font-medium">Monthly Rate:</span>
                          <div className="text-lg font-semibold text-my-primary">
                            {productPrices[productId][0].price_per_month} {productPrices[productId][0].currency}
                          </div>
                        </div>
                      )}
                    </div>
                    {productPrices[productId][0].security_deposit > 0 && (
                      <div className="border-t pt-3">
                        <span className="text-gray-600 font-medium">Security Deposit:</span>
                        <div className="text-lg font-semibold text-orange-600">
                          {productPrices[productId][0].security_deposit} {productPrices[productId][0].currency}
                        </div>
                      </div>
                    )}
                    {productPrices[productId].length > 1 && (
                      <div className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-full inline-block">
                        Available in {productPrices[productId].length} countries
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">No pricing data available</div>
                )}
              </div>
            </div>

            {/* Availability Information */}
            <div>
              <div className="text-xs text-gray-500 uppercase mb-3"><TranslatedText text="Availability Status" /></div>
              <div className="bg-gray-50 p-4 rounded-lg">
                {(() => {
                  const currentUnavailableDates = productAvailability[productId]
                    ? filterCurrentAndFutureAvailability(productAvailability[productId], 'unavailable')
                    : [];

                  if (currentUnavailableDates.length > 0) {
                    return (
                      <div className="space-y-3">
                        <div className="text-red-600 font-medium"><TranslatedText text="Currently Booked" /> ({currentUnavailableDates.length} <TranslatedText text="dates" />)</div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {currentUnavailableDates.map((availability, index) => (
                            <div key={index} className="text-sm text-gray-600 flex items-center justify-between bg-white p-2 rounded">
                              <div className="flex items-center">
                                <span className="mr-2 w-2 h-2 rounded-full bg-red-500" />
                                <span>
                                  {new Date(availability.date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                              {availability.notes && (
                                <span className="text-xs text-gray-500">({availability.notes})</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  } else {
                    return <span className="text-green-600 font-medium"><TranslatedText text="Available for booking" /></span>;
                  }
                })()}
              </div>
            </div>

            {/* Additional Product Details */}
            {(product?.features || product?.specifications || product?.tags) && (
              <div>
                <div className="text-xs text-gray-500 uppercase mb-3"><TranslatedText text="Additional Details" /></div>
                <div className="space-y-6">
                  {/* Features */}
                  {product?.features && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><TranslatedText text="Features" /></div>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                        {(() => {
                          try {
                            const raw = product.features as any;
                            if (Array.isArray(raw)) {
                              return raw.map((f: any, i: number) => (
                                <li key={i}>{typeof f === 'string' ? f : String(f)}</li>
                              ));
                            }
                            if (typeof raw === 'string') {
                              // Try to parse JSON array
                              const trimmed = raw.trim();
                              if ((trimmed.startsWith('[') && trimmed.endsWith(']'))) {
                                const arr = JSON.parse(trimmed);
                                if (Array.isArray(arr)) {
                                  return arr.map((f: any, i: number) => (
                                    <li key={i}>{typeof f === 'string' ? f : String(f)}</li>
                                  ));
                                }
                              }
                              // Fallback: split by comma
                              return trimmed.split(',').map((part, i) => (
                                <li key={i}>{part.replace(/[\[\]"]+/g, '').trim()}</li>
                              ));
                            }
                            if (typeof raw === 'object') {
                              return Object.values(raw).map((v: any, i: number) => (
                                <li key={i}>{typeof v === 'string' ? v : String(v)}</li>
                              ));
                            }
                            return <li>{String(raw)}</li>;
                          } catch (e) {
                            return <li>{String((product as any).features)}</li>;
                          }
                        })()}
                      </ul>
                    </div>
                  )}

                  {/* Specifications */}
                  {product?.specifications && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specifications</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-gray-700 dark:text-gray-300">
                        {(() => {
                          try {
                            const raw = (product as any).specifications;
                            // If string, attempt to parse JSON-like strings; otherwise split by ',' with key:value
                            if (typeof raw === 'string') {
                              const trimmed = raw.trim();
                              if ((trimmed.startsWith('{') && trimmed.endsWith('}'))) {
                                const obj = JSON.parse(trimmed.replace(/:(\s*)"/g, ': "'));
                                return Object.entries(obj).map(([k, v], i) => (
                                  <div key={i} className="flex">
                                    <span className="w-36 text-gray-500 dark:text-gray-400">{k.replace(/[:]/g, '').trim()}:</span>
                                    <span className="flex-1 font-medium">{typeof v === 'string' ? v : String(v)}</span>
                                  </div>
                                ));
                              }
                              // Fallback: split by commas and then by ':'
                              return trimmed.split(',').map((pair, i) => {
                                const [k, ...rest] = pair.split(':');
                                const v = rest.join(':');
                                return (
                                  <div key={i} className="flex">
                                    <span className="w-36 text-gray-500 dark:text-gray-400">{k.replace(/[\{\}"]+/g, '').trim()}:</span>
                                    <span className="flex-1 font-medium">{v.replace(/[\{\}"]+/g, '').trim()}</span>
                                  </div>
                                );
                              });
                            }
                            if (typeof raw === 'object') {
                              const obj = raw as Record<string, any>;
                              return Object.entries(obj).map(([k, v], i) => (
                                <div key={i} className="flex">
                                  <span className="w-36 text-gray-500 dark:text-gray-400">{k.replace(/[:]/g, '').trim()}:</span>
                                  <span className="flex-1 font-medium">{typeof v === 'string' ? v : String(v)}</span>
                                </div>
                              ));
                            }
                            return <div>—</div>;
                          } catch (e) {
                            return <div className="text-gray-600">{String((product as any).specifications)}</div>;
                          }
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {product?.tags && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</div>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray((product as any).tags) ? (product as any).tags.map((tag: any, index: number) => (
                          <span key={index} className="px-2 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full text-xs">
                            {typeof tag === 'string' ? tag : String(tag)}
                          </span>
                        )) : (
                          <span className="px-2 py-1 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-full text-xs">
                            {typeof (product as any).tags === 'string' ? (product as any).tags : String((product as any).tags)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setModerateOpen(true)}
              className="flex-1 bg-my-primary text-white px-6 py-3 rounded-lg hover:bg-my-primary/90 transition-colors font-medium"
            >
              Moderate Product
            </button>
            <button
              onClick={() => {
                onClose();
                // Open moderation history for this product
                setTimeout(() => {
                  // Use a timeout to ensure the current modal closes first
                  const event = new CustomEvent('openModerationHistory', {
                    detail: { productId, productTitle: product?.title || 'Product' }
                  });
                  window.dispatchEvent(event);
                }, 100);
              }}
              className="px-6 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center font-medium"
            >
              <Shield className="w-4 h-4 mr-2" />
              History
            </button>
          </div>
        </div>

        {/* Moderate Product Modal */}
        {moderateOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget && !moderateLoading && !moderationSuccess) {
                setModerateOpen(false);
                // Reset form when closing
                setModerationAction('approve');
                setModerationReason('');
                setModerateError(null);
              }
            }}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Moderate Product</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Action</label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={moderationAction}
                    onChange={e => setModerationAction(e.target.value as any)}
                    disabled={moderationSuccess}
                  >
                    <option value="approve"><TranslatedText text="Approve" /></option>
                    <option value="reject"><TranslatedText text="Reject" /></option>
                    <option value="flag">Flag</option>
                    <option value="quarantine">Quarantine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reason (Optional)</label>
                  <textarea
                    className="w-full border rounded px-3 py-2 h-24"
                    placeholder="Enter reason for moderation"
                    value={moderationReason}
                    onChange={e => setModerationReason(e.target.value)}
                    disabled={moderationSuccess}
                  />
                </div>
                {moderationSuccess ? (
                  <div className="text-center py-4">
                    <div className="flex items-center justify-center text-green-600 text-lg font-semibold mb-2">
                      <Check className="w-6 h-6 mr-2" />
                      Product moderated successfully!
                    </div>
                    <div className="text-gray-600 text-sm">
                      Closing in a moment...
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setModerateOpen(false);
                          // Reset form when closing
                          setModerationAction('approve');
                          setModerationReason('');
                          setModerateError(null);
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        disabled={moderateLoading}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleModerate}
                        disabled={moderateLoading || moderationSuccess}
                        className={`px-4 py-2 rounded-lg transition-colors ${moderateLoading || moderationSuccess
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-my-primary hover:bg-my-primary/90 text-white'
                          }`}
                      >
                        {moderateLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting...
                          </div>
                        ) : (
                          'Submit'
                        )}
                      </button>
                    </div>
                    {moderateError && <div className="text-red-600 mt-2">{moderateError}</div>}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ItemsManagement: React.FC<ItemsManagementProps> = ({
  products, owners, loading, itemFilter, setItemFilter,
  selectedLocation, selectedItems, setSelectedItems, Button, error,
  availabilityFilter = 'all', setAvailabilityFilter,
  page = 1, limit = 20, total = 0, totalPages = 1, hasNext = false, hasPrev = false,
  onPageChange,
  onLimitChange,
  onRefresh
}) => {
  const { tSync } = useTranslation();
  // Derive pagination state if parent didn't pass explicit flags
  const computedTotalPages = (typeof totalPages === 'number' && totalPages > 0)
    ? totalPages
    : (typeof total === 'number' && total > 0 ? Math.max(1, Math.ceil(total / (limit || 20))) : 1);
  const canPrev = !!hasPrev || page > 1;
  const canNext = !!hasNext || page < computedTotalPages;
  // State to hold images for each product
  const [productImages, setProductImages] = useState<{ [productId: string]: any[] }>({});
  const [imagesLoading, setImagesLoading] = useState(false);
  const [viewProductId, setViewProductId] = useState<string | null>(null);
  const [productAvailability, setProductAvailability] = useState<{ [productId: string]: ProductAvailability[] }>({});
  const [categoryNames, setCategoryNames] = useState<{ [id: string]: string }>({});
  const [categories, setCategories] = useState<Category[]>([]);
  // Add action menu state and click-away handler
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  // Add moderation history modal state
  const [moderationHistoryProductId, setModerationHistoryProductId] = useState<string | null>(null);
  // Add pricing state
  const [productPrices, setProductPrices] = useState<{ [productId: string]: ProductPrice[] }>({});
  const [pricesLoading, setPricesLoading] = useState(false);
  // Add soft delete state
  const [softDeleteLoading, setSoftDeleteLoading] = useState<string | null>(null);
  const [softDeleteError, setSoftDeleteError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Products received:', products);
    console.log('Current itemFilter:', itemFilter);
    console.log('Current selectedLocation:', selectedLocation);

    // Debug filtering
    const filteredByCategory = products.filter((item: Product) => itemFilter === 'all' || item.category_id === itemFilter);
    const filteredByLocation = filteredByCategory.filter((item: Product) => selectedLocation === 'all' || item.location === selectedLocation);

    console.log('Total products:', products.length);
    console.log('After category filter:', filteredByCategory.length);
    console.log('After location filter:', filteredByLocation.length);

    // Log some sample products to see their structure
    if (products.length > 0) {
      console.log('Sample product:', products[0]);
      console.log('Sample product category_id:', products[0].category_id);
      console.log('Sample product location:', products[0].location);
    }
  }, [products, itemFilter, selectedLocation]);

  useEffect(() => {
    async function loadImages() {
      setImagesLoading(true);
      const token = localStorage.getItem('token') || undefined;
      const imagesMap: { [productId: string]: any[] } = {};

      const PLACEHOLDER_IMAGE = '/assets/img/404.png';

      console.group('Image Loading Process');
      console.log('Total Products:', products.length);

      // Log product details before image fetching
      products.forEach(product => {
        console.log(`Product Details:`, {
          id: product.id,
          title: product.title,
          image: product.image,
          images: product.images
        });
      });

      await Promise.all(products.map(async (product) => {
        try {
          console.log(`Fetching images for product: ${product.id}`);

          const imagesResponse = await fetchProductImages(product.id, token);

          console.log(`Raw Images for product ${product.id}:`, imagesResponse);

          // Normalize image data
          const productImages = imagesResponse.map((img: any) => {
            // Extract URL from different possible structures
            const imageUrl =
              img?.url ||
              img?.image_url ||
              img?.src ||
              img;

            console.log(`Processed image for product ${product.id}:`, imageUrl);

            return imageUrl;
          }).filter(Boolean); // Remove any falsy values

          // Combine API images with product-level images
          const combinedImages = [
            ...productImages,
            ...(product.image ? [product.image] : []),
            ...(product.images || [])
          ].filter(Boolean); // Remove any falsy values

          console.log(`Combined images for product ${product.id}:`, combinedImages);

          imagesMap[product.id] = combinedImages.length > 0
            ? combinedImages
            : [PLACEHOLDER_IMAGE];
        } catch (error) {
          console.error(`Error fetching images for product ${product.id}:`, error);

          // Fallback to product-level images or placeholder
          imagesMap[product.id] = [
            ...(product.image ? [product.image] : []),
            ...(product.images || []),
            PLACEHOLDER_IMAGE
          ].filter(Boolean);
        }
      }));

      console.log('Final Images Map:', imagesMap);
      console.groupEnd();

      setProductImages(imagesMap);
      setImagesLoading(false);
    }

    if (products.length) {
      loadImages();
    } else {
      setProductImages({});
    }
  }, [products]);

  useEffect(() => {
    async function loadAvailability() {
      console.group('Product Availability Fetching');
      console.log('Total Products:', products.length);

      const token = localStorage.getItem('token') || undefined;
      const availabilityMap: { [productId: string]: ProductAvailability[] } = {};

      await Promise.all(products.map(async (product) => {
        try {
          console.log(`Fetching availability for product: ${product.id}`);
          const data = await fetchProductAvailability(product.id, token);

          console.log(`Availability data for product ${product.id}:`, data);

          availabilityMap[product.id] = data;
        } catch (error) {
          console.error(`Error fetching availability for product ${product.id}:`, error);
          availabilityMap[product.id] = [];
        }
      }));

      console.log('Final Availability Map:', availabilityMap);
      console.groupEnd();

      setProductAvailability(availabilityMap);
    }

    if (products.length) {
      loadAvailability();
    } else {
      setProductAvailability({});
    }
  }, [products]);

  useEffect(() => {
    async function loadCategories() {
      const token = localStorage.getItem('token') || undefined;
      const map: { [id: string]: string } = {};
      await Promise.all(products.map(async (product) => {
        if (product.category_id && !map[product.category_id]) {
          try {
            const res = await fetchCategoryById(product.category_id, token);
            map[product.category_id] = res.name;
          } catch {
            map[product.category_id] = 'Unknown';
          }
        }
      }));
      setCategoryNames(map);
    }
    if (products.length) loadCategories();
  }, [products]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest('.relative')) {
        setActionMenuOpen(null);
      }
    }
    if (actionMenuOpen) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [actionMenuOpen]);

  // Listen for custom event to open moderation history
  useEffect(() => {
    const handleOpenModerationHistory = (event: CustomEvent) => {
      const { productId } = event.detail;
      setModerationHistoryProductId(productId);
    };

    window.addEventListener('openModerationHistory', handleOpenModerationHistory as EventListener);

    return () => {
      window.removeEventListener('openModerationHistory', handleOpenModerationHistory as EventListener);
    };
  }, []);

  // Fetch pricing for all products
  useEffect(() => {
    async function loadProductPrices() {
      if (!products.length) return;

      setPricesLoading(true);
      const token = localStorage.getItem('token') || undefined;
      const pricesMap: { [productId: string]: ProductPrice[] } = {};

      try {
        await Promise.all(products.map(async (product) => {
          try {
            const { data } = await PricingService.getProductPricesByProductId(
              product.id,
              { page: 1, limit: 10 },
              token
            );
            pricesMap[product.id] = data || [];
          } catch (error) {
            console.warn(`Failed to fetch pricing for product ${product.id}:`, error);
            pricesMap[product.id] = [];
          }
        }));

        setProductPrices(pricesMap);
      } catch (error) {
        console.error('Error loading product prices:', error);
      } finally {
        setPricesLoading(false);
      }
    }

    loadProductPrices();
  }, [products]);

  // Optionally, you can manage error state here if not passed as prop
  // const [error, setError] = useState<string | null>(null);

  // Handle soft delete
  const handleSoftDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to soft delete "${productName}"? This will hide it from all public pages.`)) {
      return;
    }

    setSoftDeleteLoading(productId);
    setSoftDeleteError(null);
    setActionMenuOpen(null);

    try {
      const token = localStorage.getItem('token') || undefined;
      await softDeleteProduct(productId, token);
      
      // Show success message
      alert('Product soft deleted successfully!');
      
      // Refresh the product list
      if (onRefresh) {
        onRefresh();
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to soft delete product';
      setSoftDeleteError(errorMsg);
      alert(`Error: ${errorMsg}`);
    } finally {
      setSoftDeleteLoading(null);
    }
  };

  if (loading || imagesLoading || pricesLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <SkeletonTable columns={6} rows={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
        <EmptyState icon={<Package />} title="No items found" message="There are currently no items in the system. New items will appear here as they are added." />
      </div>
    );
  }

  // Modify the image rendering logic
  const PLACEHOLDER_IMAGE = '/assets/img/404.png';

  const getProductImageUrl = (item: Product, productImages: { [productId: string]: any[] }) => {
    // Comprehensive image source prioritization
    const imageSources = [
      // 1. API-fetched images
      ...(productImages[item.id] || []),

      // 2. Product-level image properties
      item.image,
      ...(item.images || []),

      // 3. Hardcoded fallback
      PLACEHOLDER_IMAGE
    ];

    // Find the first valid, non-empty image URL
    const validImageUrl = imageSources.find(
      (url) => url &&
        typeof url === 'string' &&
        url.trim() !== '' &&
        !url.includes('undefined')
    );

    console.log(`Image sources for product ${item.id}:`, {
      apiImages: productImages[item.id],
      productImage: item.image,
      productImages: item.images,
      selectedUrl: validImageUrl,
      placeholderImage: PLACEHOLDER_IMAGE
    });

    return validImageUrl || PLACEHOLDER_IMAGE;
  };

  // Helper function to determine if a product is currently available or booked
  const isProductAvailable = (productId: string) => {
    const availability = productAvailability[productId] || [];
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Check if there are any unavailable dates from today onwards
    const futureUnavailableDates = availability.filter(av =>
      av.availability_type === 'unavailable' && av.date >= currentDate
    );

    return futureUnavailableDates.length === 0;
  };

  // Calculate availability counts for the filter dropdown
  const getAvailabilityCounts = () => {
    const availableCount = products.filter(item => isProductAvailable(item.id)).length;
    const bookedCount = products.filter(item => !isProductAvailable(item.id)).length;
    return { availableCount, bookedCount };
  };

  const { availableCount, bookedCount } = getAvailabilityCounts();

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Items Management</h3>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <select
              value={itemFilter}
              onChange={(e) => setItemFilter(e.target.value)}
              className="appearance-none bg-gray-100 dark:bg-gray-800 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-my-primary"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.516 7.548c.436-.446 1.144-.446 1.58 0L10 10.42l2.904-2.872c.436-.446 1.144-.446 1.58 0 .436.446.436 1.17 0 1.616l-3.694 3.664c-.436.446-1.144.446-1.58 0L5.516 9.164c-.436-.446-.436-1.17 0-1.616z" /></svg>
            </div>
          </div>
          {/* Status Filter */}
          <div className="relative">
            <select
              value={(undefined as any)}
              onChange={() => { }}
              className="appearance-none bg-gray-100 dark:bg-gray-800 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-my-primary hidden"
            />
          </div>
          <div className="relative">
            <select
              onChange={(e) => (window as any).__setItemStatus?.(e.target.value)}
              className="appearance-none bg-gray-100 dark:bg-gray-800 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-my-primary"
              defaultValue="all"
            >
              <option value="all"><TranslatedText text="All Status" /></option>
              <option value="active"><TranslatedText text="Active" /></option>
              <option value="draft"><TranslatedText text="Draft" /></option>
              <option value="pending"><TranslatedText text="Pending" /></option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.516 7.548c.436-.446 1.144-.446 1.58 0L10 10.42l2.904-2.872c.436-.446 1.144-.446 1.58 0 .436.446.436 1.17 0 1.616l-3.694 3.664c-.436.446-1.144.446-1.58 0L5.516 9.164c-.436-.446-.436-1.17 0-1.616z" /></svg>
            </div>
          </div>
          {/* Availability Filter */}
          <div className="relative">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter?.(e.target.value)}
              className="appearance-none bg-gray-100 dark:bg-gray-800 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-my-primary"
            >
              <option value="all">All Availability ({products.length})</option>
              <option value="available">Available ({availableCount})</option>
              <option value="booked">Booked ({bookedCount})</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.516 7.548c.436-.446 1.144-.446 1.58 0L10 10.42l2.904-2.872c.436-.446 1.144-.446 1.58 0 .436.446.436 1.17 0 1.616l-3.694 3.664c-.436.446-1.144.446-1.58 0L5.516 9.164c-.436-.446-.436-1.17 0-1.616z" /></svg>
            </div>
          </div>
          {/* Sort */}
          <div className="relative">
            <select
              onChange={(e) => (window as any).__setItemSort?.(e.target.value)}
              className="appearance-none bg-gray-100 dark:bg-gray-800 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-my-primary"
              defaultValue="newest"
            >
              <option value="newest"><TranslatedText text="Newest" /></option>
              <option value="oldest"><TranslatedText text="Oldest" /></option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.516 7.548c.436-.446 1.144-.446 1.58 0L10 10.42l2.904-2.872c.436-.446 1.144-.446 1.58 0 .436.446.436 1.17 0 1.616l-3.694 3.664c-.436.446-1.144.446-1.58 0L5.516 9.164c-.436-.446-.436-1.17 0-1.616z" /></svg>
            </div>
          </div>
          <Button
            onClick={() => {
              setItemFilter('all');
              setAvailabilityFilter?.('all');
              // Reset other filters if available
            }}
            className="bg-red-100 hover:bg-red-200 border border-red-200 text-red-700 px-4 py-2 rounded-xl transition-colors flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            <TranslatedText text="Reset Filters" />
          </Button>
          <Button
            onClick={() => {
              // Try opening if My Account dashboard is active; else route to My Account with query to auto-open
              const openListingModal = (window as any).__openNewListingModal;
              if (typeof openListingModal === 'function') {
                openListingModal();
              } else {
                window.location.href = '/my-account?new-listing=1';
              }
            }}
            className="bg-my-primary hover:bg-my-primary/90 text-white px-6 py-2 rounded-xl transition-colors flex items-center shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            <TranslatedText text="Add Item" />
          </Button>
        </div>
      </div>
      {/* Items Categories Overview */}
      {/* <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        {categories.slice(0, 10).map((category) => (
          <div 
            key={category.id} 
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer
              ${itemFilter === category.id 
                ? 'bg-my-primary/10 border-my-primary shadow-sm' 
                : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-sm'}`
            }
            onClick={() => setItemFilter(category.id)}
          >
            <div className="text-3xl mb-2">{category.iconName || '📦'}</div>
            <p className="text-sm font-medium text-center text-gray-800 dark:text-gray-100">{category.name}</p>
          </div>
        ))}
      </div> */}

      {/* Filter Status Indicator */}
      {(itemFilter !== 'all' || selectedLocation !== 'all' || availabilityFilter !== 'all') && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <Filter className="w-4 h-4" />
              <span><TranslatedText text="Active filters" />:</span>
              {itemFilter !== 'all' && (
                <span className="px-2 py-1 bg-blue-100 rounded-full text-xs">
                  <TranslatedText text="Category" />: {categories.find(c => c.id === itemFilter)?.name || itemFilter}
                </span>
              )}
              {selectedLocation !== 'all' && (
                <span className="px-2 py-1 bg-blue-100 rounded-full text-xs">
                  <TranslatedText text="Location" />: {selectedLocation}
                </span>
              )}
              {availabilityFilter !== 'all' && (
                <span className="px-2 py-1 bg-blue-100 rounded-full text-xs">
                  <TranslatedText text="Availability" />: {availabilityFilter === 'available' ? tSync('Available') : tSync('Booked')}
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setItemFilter('all');
                setAvailabilityFilter?.('all');
                // Reset location filter if available through props
              }}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              <TranslatedText text="Clear all filters" />
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Item
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Owner
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <TranslatedText text="Status" />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Availability
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {products
              .filter((item: Product) => itemFilter === 'all' || item.category_id === itemFilter)
              .filter((item: Product) => selectedLocation === 'all' || item.location === selectedLocation)
              .filter((item: Product) => {
                if (availabilityFilter === 'all') return true;
                if (availabilityFilter === 'available') return isProductAvailable(item.id);
                if (availabilityFilter === 'booked') return !isProductAvailable(item.id);
                return true;
              })
              .map((item: Product, idx: number) => (
                <tr key={item.id} className="bg-white dark:bg-gray-900">
                  <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                    {(() => {
                      const src = getProductImageUrl(item, productImages);
                      const noImage = !src || src.includes('404.png') || src.includes('placeholder');
                      if (noImage) {
                        return (
                          <div className="h-12 w-12 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
                            <Package className="w-5 h-5" />
                          </div>
                        );
                      }
                      return (
                        <img
                          key={item.id}
                          className="h-12 w-12 rounded-md object-cover"
                          src={src}
                          alt={item.title || item.name || 'Product Image'}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      );
                    })()}
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{item.title || item.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{categoryNames[item.category_id ?? ''] || 'Loading...'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900 dark:text-gray-100">{owners[item.owner_id]?.firstName || 'Loading...'}</span>
                    {/* <span className="font-medium text-gray-900 dark:text-gray-100">{owners[item.owner_id]?.lastName || 'Loading...'}</span> */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.status}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-gray-100 text-md">
                    <div className="space-y-1">
                      {pricesLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-my-primary"></div>
                          <span className="text-sm text-gray-500">Loading prices...</span>
                        </div>
                      ) : productPrices[item.id]?.length > 0 ? (
                        <>
                          {/* Primary Price (Daily) */}
                          <div className=" flex items-center">
                            {/* <DollarSign className="w-4 h-4 text-green-600" /> */}
                            <span>
                              {productPrices[item.id][0].price_per_day} {productPrices[item.id][0].currency}/day
                            </span>
                          </div>

                          {/* Multiple Countries Indicator */}
                          {productPrices[item.id].length > 1 && (
                            <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                              +{productPrices[item.id].length - 1} more countries
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-gray-500 italic text-center">-</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      // Filter only current and future unavailable dates using utility function
                      const currentUnavailableDates = productAvailability[item.id]
                        ? filterCurrentAndFutureAvailability(productAvailability[item.id], 'unavailable')
                        : [];

                      if (currentUnavailableDates.length > 0) {
                        return <span className="text-xs text-red-600 font-medium">Booked</span>;
                      } else {
                        return <span className="text-xs text-green-600">Available</span>;
                      }
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 text-gray-400 hover:text-my-primary rounded-lg hover:bg-my-primary/10 transition-colors"
                        aria-label="More actions"
                        onClick={() => setActionMenuOpen(actionMenuOpen === item.id ? null : item.id)}
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      {actionMenuOpen === item.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => {
                              setActionMenuOpen(null);
                              setViewProductId(item.id);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            <TranslatedText text="View Details" />
                          </button>
                          <button
                            onClick={() => {
                              setActionMenuOpen(null);
                              setModerationHistoryProductId(item.id);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center"
                          >
                            <Shield className="w-4 h-4 mr-2" />
                            Moderation History
                          </button>
                          <button
                            onClick={() => handleSoftDelete(item.id, item.title || item.name)}
                            disabled={softDeleteLoading === item.id}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center disabled:opacity-50 disabled:cursor-not-allowed border-t border-gray-100"
                          >
                            {softDeleteLoading === item.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <X className="w-4 h-4 mr-2" />
                                <TranslatedText text="Soft Delete" />
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
          {/* Items per page selector */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Items per page:</span>
            <select
              className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm"
              value={limit}
              onChange={(e) => onLimitChange && onLimitChange(Number(e.target.value))}
            >
              {[10, 20, 30, 50, 100].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Pagination Component */}
          {onPageChange && (
            <Pagination
              currentPage={page}
              totalPages={computedTotalPages}
              onPageChange={onPageChange}
              totalItems={total}
              itemsPerPage={limit}
              showItemCount={true}
            />
          )}
        </div>

        <AdminProductDetailModal
          open={!!viewProductId}
          onClose={() => setViewProductId(null)}
          productId={viewProductId || ''}
          productPrices={productPrices}
          productAvailability={productAvailability}
          onApproved={() => {
            setViewProductId(null);
            if (onRefresh) {
              onRefresh();
            }
          }}
        />

        {/* Moderation History Modal */}
        {moderationHistoryProductId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <ProductModerationHistory
                productId={moderationHistoryProductId}
                productTitle={products.find(p => p.id === moderationHistoryProductId)?.title || 'Product'}
                onClose={() => setModerationHistoryProductId(null)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemsManagement; 