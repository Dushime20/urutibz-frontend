import React, { useState, useEffect } from 'react';
import { Plus, Filter, MoreHorizontal, X, Package } from 'lucide-react';
import type { Product, Owner, ItemCategory } from '../types';
import { fetchProductImages, getProductById, fetchUserById } from '../service/api';
import { fetchProductAvailability } from '../service/api';
import { type ProductAvailability } from '../interfaces';
import { fetchCategoryById } from '../service/api';
import { fetchCategories } from '../service/api';
import type { Category } from '../interfaces';
import SkeletonTable from './SkeletonTable';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';

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
}

const AdminProductDetailModal: React.FC<{
  open: boolean;
  onClose: () => void;
  productId: string;
  onApproved?: () => void;
}> = ({ open, onClose, productId }) => {
  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [moderateOpen, setModerateOpen] = useState(false);
  
  // New state for category and owner details
  const [categoryName, setCategoryName] = useState<string>('N/A');
  const [ownerName, setOwnerName] = useState<string>('Unknown');

  useEffect(() => {
    if (!open || !productId) return;
    
    setLoading(true);
    setError(null);
    setCurrentImageIndex(0);
    
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

  if (!open) return null;

  // Determine image URL with multiple fallback options
  const currentImageUrl = 
    images[currentImageIndex]?.url || 
    images[currentImageIndex]?.image_url || 
    images[currentImageIndex] || 
    '/assets/img/placeholder-image.png';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto overflow-hidden grid grid-cols-1 md:grid-cols-2 max-h-[90vh]">
        {/* Image Section */}
        <div className="relative bg-gray-100 flex items-center justify-center p-6">
          {images.length > 0 ? (
            <div className="relative w-full aspect-square max-h-[500px]">
              <img
                src={currentImageUrl}
                alt={`Product image ${currentImageIndex + 1}`}
                className="w-full h-full object-contain rounded-xl"
                onError={(e) => {
                  console.error('Image load error:', currentImageUrl);
                  (e.target as HTMLImageElement).src = '/assets/img/placeholder-image.png';
                }}
              />
              {images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage} 
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white shadow-md rounded-full p-2 z-10"
                  >
                    &#8592;
                  </button>
                  <button 
                    onClick={nextImage} 
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white shadow-md rounded-full p-2 z-10"
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
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <Package className="w-16 h-16 mb-4" />
              <p>No images available</p>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="p-6 overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{product?.title || 'Product Title'}</h2>
              <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                product?.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {product?.status || 'Status'}
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <p className="text-gray-600">{product?.description || 'No description available'}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Category</div>
                <div className="font-medium text-gray-800">{categoryName}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Price</div>
                <div className="font-semibold text-my-primary">
                  {product?.base_price_per_day} {product?.base_currency || 'USD'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Owner</div>
                <div className="text-gray-800">{ownerName}</div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button 
              onClick={() => setModerateOpen(true)}
              className="w-full bg-my-primary text-white px-6 py-2 rounded-lg hover:bg-my-primary/90 transition-colors"
            >
              Moderate Product
            </button>
          </div>
        </div>

        {/* Moderate Product Modal */}
        {moderateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold mb-4">Moderate Product</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Action</label>
                  <select className="w-full border rounded px-3 py-2">
                    <option>Approve</option>
                    <option>Reject</option>
                    <option>Flag</option>
                    <option>Quarantine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reason (Optional)</label>
                  <textarea 
                    className="w-full border rounded px-3 py-2 h-24" 
                    placeholder="Enter reason for moderation"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button 
                    onClick={() => setModerateOpen(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 bg-my-primary text-white rounded-lg hover:bg-my-primary/90"
                  >
                    Submit
                  </button>
                </div>
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
  selectedLocation, selectedItems, setSelectedItems, Button, error
}) => {
  // State to hold images for each product
  const [productImages, setProductImages] = useState<{ [productId: string]: any[] }>({});
  const [imagesLoading, setImagesLoading] = useState(false);
  const [viewProductId, setViewProductId] = useState<string | null>(null);
  const [productAvailability, setProductAvailability] = useState<{ [productId: string]: ProductAvailability[] }>({});
  const [categoryNames, setCategoryNames] = useState<{ [id: string]: string }>({});
  const [categories, setCategories] = useState<Category[]>([]);
  // Add action menu state and click-away handler
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    console.log('Products received:', products);
  }, [products]);

  useEffect(() => {
    async function loadImages() {
      setImagesLoading(true);
      const token = localStorage.getItem('token') || undefined;
      const imagesMap: { [productId: string]: any[] } = {};
      
      const PLACEHOLDER_IMAGE = '/assets/img/placeholder-image.png';
      
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

  // Optionally, you can manage error state here if not passed as prop
  // const [error, setError] = useState<string | null>(null);

  if (loading || imagesLoading) {
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
  const PLACEHOLDER_IMAGE = '/assets/img/placeholder-image.png';

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
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.516 7.548c.436-.446 1.144-.446 1.58 0L10 10.42l2.904-2.872c.436-.446 1.144-.446 1.58 0 .436.446.436 1.17 0 1.616l-3.694 3.664c-.436.446-1.144.446-1.58 0L5.516 9.164c-.436-.446-.436-1.17 0-1.616z"/></svg>
            </div>
          </div>
          <Button className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-xl transition-colors flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-my-primary hover:bg-my-primary/90 text-white px-6 py-2 rounded-xl transition-colors flex items-center shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>
      {/* Items Categories Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
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
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
            <tr>
              <th scope="col" className="w-12 px-6 py-3 text-left">
                <input type="checkbox" className="w-4 h-4 text-my-primary rounded border-gray-300 focus:ring-my-primary" />
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Item
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Owner
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
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
                .map((item: Product, idx: number) => (
                  <tr key={item.id} className={`transition cursor-pointer ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-gray-50 dark:hover:bg-gray-800`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, item.id]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== item.id));
                          }
                        }}
                        className="w-4 h-4 text-my-primary rounded border-gray-300 focus:ring-my-primary"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                      <img
                        key={item.id}  // Add key to help React manage image rendering
                        className="h-12 w-12 rounded-md object-cover"
                        src={getProductImageUrl(item, productImages)}
                        alt={item.title || item.name || 'Product Image'}
                        onError={(e) => {
                          console.error('Image load error for product:', item.id);
                          console.log('Product images:', productImages[item.id]);
                          console.log('Fallback images:', item.image, item.images);
                          
                          // Ensure we always have a valid image
                          const target = e.target as HTMLImageElement;
                          target.src = PLACEHOLDER_IMAGE;
                          target.onerror = null; // Prevent infinite error loop
                        }}
                      />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{item.title || item.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{categoryNames[item.category_id ?? ''] || 'Loading...'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{owners[item.owner_id]?.name || 'Loading...'}</span>
                      <span className="block text-xs text-gray-400">{owners[item.owner_id]?.email || ''}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.status}</span>
                    </td>
                    <td className="px-6 py-4  text-gray-900 dark:text-gray-100 text-md">
                      {item.base_price_per_day}{item.base_currency}/day
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {productAvailability[item.id] && productAvailability[item.id].length > 0 
                        ? (productAvailability[item.id].some(a => a.availability_type === 'unavailable')
                          ? (
                            <div className="flex flex-col">
                              {productAvailability[item.id]
                                .filter(a => a.availability_type === 'unavailable')
                                .slice(0, 2)
                                .map((availability, index) => (
                                  <div 
                                    key={index} 
                                    className="text-xs text-gray-600 mb-1 flex items-center"
                                  >
                                    <span 
                                      className="mr-2 w-2 h-2 rounded-full bg-red-500"
                                    />
                                    <span>
                                      {`${new Date(availability.date).toLocaleDateString('en-US', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                      })} (${availability.notes || 'Booked'})`}
                                    </span>
                                  </div>
                                ))
                              }
                              {productAvailability[item.id].filter(a => a.availability_type === 'unavailable').length > 2 && (
                                <span className="text-xs text-gray-400">
                                  +{productAvailability[item.id].filter(a => a.availability_type === 'unavailable').length - 2} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-green-600">Available</span>
                          )
                        ) : (
                          <span className="text-xs text-green-600">Available</span>
                        )
                      }
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
                          <div className="absolute left-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            <button
                              onClick={() => {
                                setActionMenuOpen(null);
                                setViewProductId(item.id);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              View
                            </button>
                            <button
                              onClick={() => {
                                setActionMenuOpen(null);
                                // You can add edit logic here
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                            >
                              Edit
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
        <AdminProductDetailModal open={!!viewProductId} onClose={() => setViewProductId(null)} productId={viewProductId || ''} />
      </div>
    </div>
  );
};

export default ItemsManagement; 