import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { getProductById, getProductImagesByProductId } from '../service/api';

interface ProductDetailModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ open, onClose, productId }) => {
  const [images, setImages] = useState<any[]>([]);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !productId) return;
    setLoading(true);
    setError(null);
    let productDone = false;
    let imagesDone = false;

    getProductById(productId)
      .then(product => setProduct(product))
      .catch(() => setError('Failed to load product details.'))
      .finally(() => {
        productDone = true;
        if (imagesDone) setLoading(false);
      });
    getProductImagesByProductId(productId)
      .then(images => setImages(images || []))
      .catch(() => setError('Failed to load product images.'))
      .finally(() => {
        imagesDone = true;
        if (productDone) setLoading(false);
      });
  }, [open, productId]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full relative min-h-[95vh] overflow-y-auto">
          <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
          <div className="text-2xl font-bold text-[#01aaa7] mb-4">Product Details</div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <svg className="animate-spin h-6 w-6 text-[#01aaa7] mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              <span>Loading product and images...</span>
            </div>
          ) : error ? (
            <div className="text-red-500 py-4">{error}</div>
          ) : (
            <>
              {product && (
                <div className="mb-6">
                  <div className="text-xl font-semibold text-gray-900 mb-1">{product.title}</div>
                  <div className="text-gray-700 mb-2">{product.description}</div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-2">
                    <span><b className="text-[#01aaa7]">Category:</b> {product.category_id}</span>
                    <span><b className="text-[#01aaa7]">Condition:</b> {product.condition}</span>
                    <span><b className="text-[#01aaa7]">Price:</b> {product.base_price_per_day} {product.base_currency}</span>
                    <span><b className="text-[#01aaa7]">Country:</b> {product.country_id}</span>
                  </div>
                  {product.specifications && (
                    <div className="text-xs text-gray-500 mb-2">
                      <b className="text-[#01aaa7]">Specs:</b> {Object.entries(product.specifications).map(([k, v]) => `${k}: ${v}`).join(', ')}
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.length === 0 ? (
                  <div className="col-span-2 text-gray-500">No images found for this product.</div>
                ) : (
                  images.map((img, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg hover:scale-105 transition-transform duration-150 bg-white flex flex-col items-center h-[300px]"
                      onClick={() => setSelectedImage(img.url || img.image_url || img.path)}
                    >
                      <img
                        src={img.url || img.image_url || img.path}
                        alt={img.alt_text || `Product image ${idx + 1}`}
                        className="object-cover w-full h-[300px]"
                      />
                      {img.alt_text && <div className="p-2 text-xs text-gray-600 text-center">{img.alt_text}</div>}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
      {/* Lightbox for full image view using React Portal */}
      {selectedImage && ReactDOM.createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setSelectedImage(null)}>
          <div className="relative">
            <img src={selectedImage} alt="Full size" className="max-h-[80vh] max-w-4xl rounded shadow-lg" />
            <button
              className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full p-1 text-gray-700 hover:text-red-500"
              onClick={e => { e.stopPropagation(); setSelectedImage(null); }}
            >
              &times;
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ProductDetailModal; 