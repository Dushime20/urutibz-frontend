import React, { useState, useEffect } from 'react';
import { Plus, Filter, Eye, Edit3, MoreHorizontal, Star, X, Package } from 'lucide-react';
import type { Product, Owner, ItemCategory } from '../types';
import { fetchProductImages, getProductById, updateProduct } from '../service/api';
import { useToast } from '../../../contexts/ToastContext';

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
}> = ({ open, onClose, productId, onApproved }) => {
  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { showToast } = useToast();
  console.log(product,'product in detail model')
  useEffect(() => {
    if (!open || !productId) return;
    setLoading(true);
    setError(null);
    setCurrentImageIndex(0);
    getProductById(productId, localStorage.getItem('token') || undefined)
      .then(setProduct)
      .catch(() => setError('Failed to load product details.'));
    fetchProductImages(productId, localStorage.getItem('token') || undefined)
      .then(res => {
        setImages(res.data?.data || res.data || []);
        setCurrentImageIndex(0);
      })
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, [open, productId]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (images.length ? (prev + 1) % images.length : 0));
  };
  const prevImage = () => {
    setCurrentImageIndex((prev) => (images.length ? (prev - 1 + images.length) % images.length : 0));
  };

  const handleApprove = async () => {
    if (!product) return;
    setApproving(true);
    try {
      await updateProduct(productId, { status: 'active' }, localStorage.getItem('token') || undefined);
      showToast('Product approved!', 'success');
      onClose();
      if (onApproved) onApproved();
    } catch {
      showToast('Failed to approve product.', 'error');
    } finally {
      setApproving(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-cyan-600 px-6 py-4 text-white flex items-center justify-between">
          <h2 className="text-2xl font-bold">Product Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                <span className="text-gray-600 font-medium">Loading product details...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-red-500 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="font-medium">{error}</p>
              </div>
            </div>
          ) : product ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Images */}
              <div className="space-y-4">
                {images.length > 0 ? (
                  <>
                    {/* Main Image */}
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
                      <img
                        src={images[currentImageIndex]?.url || images[currentImageIndex]?.image_url || images[currentImageIndex]?.path}
                        alt={images[currentImageIndex]?.alt_text || `Product image ${currentImageIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Navigation arrows */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                          >
                            &#8592;
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                          >
                            &#8594;
                          </button>
                        </>
                      )}
                      {/* Image counter */}
                      {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                          {currentImageIndex + 1} / {images.length}
                        </div>
                      )}
                    </div>
                    {/* Thumbnails */}
                    {images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                              idx === currentImageIndex 
                                ? 'border-teal-500 ring-2 ring-teal-200' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={img.url || img.image_url || img.path}
                              alt={img.alt_text || `Thumbnail ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Package size={48} className="mx-auto mb-2" />
                      <p>No images available</p>
                    </div>
                  </div>
                )}
              </div>
              {/* Product Info */}
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
                <p className="text-gray-600">{product.description}</p>
                <div className="flex flex-col gap-2">
                  <span>
                    <b>Status:</b> 
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ml-2 ${
                      product.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {product.status}
                    </span>
                  </span>
                  <span><b>Category:</b> {product.category_id}</span>
                  <span><b>Price:</b> {product.base_price_per_day} {product.base_currency}</span>
                  <span><b>Owner:</b> {product.owner_id}</span>
                </div>
                <button
                  className="bg-teal-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl transition-colors font-semibold"
                  onClick={handleApprove}
                  disabled={approving || product.status === 'approved'}
                >
                  {approving ? 'Approving...' : product.status === 'approved' ? 'Approved' : 'Approve Product'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const ItemsManagement: React.FC<ItemsManagementProps> = ({
  products, owners, loading, itemCategories, itemFilter, setItemFilter,
  selectedLocation, selectedItems, setSelectedItems, Button, error
}) => {
  // State to hold images for each product
  const [productImages, setProductImages] = useState<{ [productId: string]: any[] }>({});
  const [imagesLoading, setImagesLoading] = useState(false);
  const [viewProductId, setViewProductId] = useState<string | null>(null);

  useEffect(() => {
    async function loadImages() {
      setImagesLoading(true);
      const token = localStorage.getItem('token') || undefined;
      const imagesMap: { [productId: string]: any[] } = {};
      await Promise.all(products.map(async (product) => {
        const { data, error } = await fetchProductImages(product.id, token);
        if (!error && data && Array.isArray(data.data)) {
          imagesMap[product.id] = data.data;
        } else if (!error && data && Array.isArray(data)) {
          imagesMap[product.id] = data;
        } else {
          imagesMap[product.id] = [];
        }
      }));
      setProductImages(imagesMap);
      setImagesLoading(false);
    }
    if (products.length) {
      loadImages();
    } else {
      setProductImages({});
    }
  }, [products]);

  // Optionally, you can manage error state here if not passed as prop
  // const [error, setError] = useState<string | null>(null);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Items Management</h3>
        <div className="flex items-center space-x-3">
          <select 
            value={itemFilter} 
            onChange={(e) => setItemFilter(e.target.value)}
            className="bg-gray-100 border-0 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {itemCategories.map((category: ItemCategory) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
          <Button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          {selectedItems.length > 0 && (
            <Button className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl transition-colors">
              Bulk Actions ({selectedItems.length})
            </Button>
          )}
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-colors flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>
      {/* Items Categories Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
        {itemCategories.slice(0, 10).map((category: ItemCategory) => (
          <div key={category.id} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 text-center hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-2xl mb-2">{category.icon}</div>
            <p className="text-sm font-medium text-gray-700">{category.name}</p>
            <p className="text-xs text-gray-600">{category.count} items</p>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        {loading || imagesLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-teal-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="text-gray-500 text-lg">Loading products...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8">
            <span className="text-red-500 text-lg">{error}</span>
          </div>
        ) : (
          products
            .filter((item: Product) => itemFilter === 'all' || item.category_id === itemFilter)
            .filter((item: Product) => selectedLocation === 'all' || item.location === selectedLocation)
            .map((item: Product) => (
              <div key={item.id} className="flex items-center space-x-4 p-6 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-center">
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
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 mr-4"
                  />
                  <div className="relative">
                    <img 
                      src={
                        productImages[item.id]?.[0]?.url ||
                        productImages[item.id]?.[0]?.image_url ||
                        item.image ||
                        item.images?.[0] ||
                        '/assets/img/placeholder-image.png'
                      } 
                      alt={item.title || item.name} 
                      className="w-20 h-16 rounded-xl object-cover" 
                    />
                    {/* Optionally render icon if available */}
                    {item.icon && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                        <span className="w-4 h-4 text-gray-600">{item.icon}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{item.title || item.name}</h4>
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${
                      item.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.status}
                    </span>
                    <span className="px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Owner: {owners[item.owner_id]?.name || 'Loading...'}
                  </p>
                  <p className="text-xs text-gray-400 mb-2">{item.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="font-semibold">${item.price}/day</span>
                    <span>{item.bookings} bookings</span>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span>{item.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" onClick={() => setViewProductId(item.id)}>
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
        )}
        <AdminProductDetailModal open={!!viewProductId} onClose={() => setViewProductId(null)} productId={viewProductId || ''} />
      </div>
    </div>
  );
};

export default ItemsManagement; 