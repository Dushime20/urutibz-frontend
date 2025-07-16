import React, { useEffect, useState } from 'react';
import { getProductById, updateProduct, createProductImage, getProductImagesByProductId, updateProductImage } from '../service/api';
import { useToast } from '../../../contexts/ToastContext';

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
}

const EditProductModal: React.FC<EditProductModalProps> = ({ open, onClose, productId }) => {
  const [form, setForm] = useState<any>(null);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditImageModal, setShowEditImageModal] = useState(false);
  const [editingImage, setEditingImage] = useState<any>(null);
  const [imageEditForm, setImageEditForm] = useState<any>({});
  const [imageEditLoading, setImageEditLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!open || !productId) return;
    setLoading(true);
    setError(null);
    getProductById(productId)
      .then(product => {
        setForm({ ...product });
      })
      .catch(() => setError('Failed to load product details.'));
    getProductImagesByProductId(productId)
      .then(imgs => setExistingImages(imgs || []))
      .catch(() => setExistingImages([]))
      .finally(() => setLoading(false));
  }, [open, productId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file' && e.target instanceof HTMLInputElement) {
      const input = e.target as HTMLInputElement;
      setImages(input.files ? Array.from(input.files) : []);
    } else if (name.startsWith('specifications.')) {
      const specKey = name.split('.')[1];
      setForm((prev: any) => ({ ...prev, specifications: { ...prev.specifications, [specKey]: value } }));
    } else if (name === 'pickup_methods') {
      setForm((prev: any) => ({ ...prev, pickup_methods: Array.from((e.target as HTMLSelectElement).selectedOptions, (option) => option.value) }));
    } else {
      setForm((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      // Update product info
      const productPayload = { ...form };
      // Remove base_price if present, ensure base_price_per_day is used
      delete productPayload.base_price;
      await updateProduct(productId, productPayload);
      // Upload new images if any
      if (images && images.length > 0) {
        const imagePayload = {
          images,
          product_id: productId,
          alt_text: form.alt_text || '',
          sort_order: form.sort_order || '1',
          isPrimary: 'true',
        };
        await createProductImage(imagePayload);
      }
      showToast('Product updated!', 'success');
      onClose();
    } catch (err) {
      setError('Failed to update product.');
      showToast('Failed to update product.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white  shadow-md p-8 max-w-4xl w-full relative max-h-[96vh] overflow-y-auto">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-[#01aaa7]">Edit Product</h2>
        {loading || !form ? (
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin h-6 w-6 text-[#01aaa7] mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span>Loading product...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <input name="title" value={form.title} onChange={handleInputChange} required placeholder="Title" className="w-full border rounded-lg px-4 py-2" />
              <input name="slug" value={form.slug} onChange={handleInputChange} required placeholder="Slug" className="w-full border rounded-lg px-4 py-2" />
              <textarea name="description" value={form.description} onChange={handleInputChange} required placeholder="Description" className="w-full border rounded-lg px-4 py-2" />
              <input name="category_id" value={form.category_id} onChange={handleInputChange} required placeholder="Category ID" className="w-full border rounded-lg px-4 py-2" />
              <select name="condition" value={form.condition} onChange={handleInputChange} className="w-full border rounded-lg px-4 py-2">
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
              <input name="base_price_per_day" value={form.base_price_per_day} onChange={handleInputChange} required placeholder="Price per day" type="number" className="w-full border rounded-lg px-4 py-2" />
              <input name="base_currency" value={form.base_currency} onChange={handleInputChange} required placeholder="Currency" className="w-full border rounded-lg px-4 py-2" />
            </div>
            <div className="space-y-4">
              <select name="pickup_methods" multiple value={form.pickup_methods} onChange={handleInputChange} className="w-full border rounded-lg px-4 py-2">
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </select>
              <input name="country_id" value={form.country_id} onChange={handleInputChange} required placeholder="Country ID" className="w-full border rounded-lg px-4 py-2" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input name="specifications.processor" value={form.specifications.processor} onChange={handleInputChange} required placeholder="Processor" className="border rounded-lg px-4 py-2" />
                <input name="specifications.memory" value={form.specifications.memory} onChange={handleInputChange} required placeholder="Memory" className="border rounded-lg px-4 py-2" />
                <input name="specifications.storage" value={form.specifications.storage} onChange={handleInputChange} required placeholder="Storage" className="border rounded-lg px-4 py-2" />
              </div>
              <input name="alt_text" value={form.alt_text || ''} onChange={handleInputChange} placeholder="Image Alt Text" className="w-full border rounded-lg px-4 py-2" />
              <input name="sort_order" value={form.sort_order || '1'} onChange={handleInputChange} placeholder="Sort Order" className="w-full border rounded-lg px-4 py-2" />
              <input name="isPrimary" value={form.isPrimary || 'true'} onChange={handleInputChange} placeholder="Is Primary (true/false)" className="w-full border rounded-lg px-4 py-2" />
              <input name="product_id" value={form.product_id} readOnly placeholder="Product ID (auto)" className="w-full border rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed" />
              <input name="images" type="file" accept="image/*" multiple onChange={handleInputChange} className="w-full border rounded-lg px-4 py-2" />
              <p className="text-xs text-gray-500">You can select multiple images. Uploading new images will add to existing ones.</p>
              {/* Preview new images */}
              {images && images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {images.map((file: File, idx: number) => (
                    <div key={idx} className="relative w-20 h-20 border rounded overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        className="absolute top-0 right-0 bg-white bg-opacity-80 text-red-500 rounded-bl px-1 py-0.5 text-xs hover:bg-red-100"
                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* Show existing images with Edit button */}
              {existingImages && existingImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {existingImages.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 border rounded overflow-hidden">
                      <img
                        src={img.url || img.image_url || img.path}
                        alt={img.alt_text || `Product image ${idx + 1}`}
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        className="absolute bottom-1 right-1 bg-white bg-opacity-80 text-blue-500 rounded px-1 py-0.5 text-xs hover:bg-blue-100"
                        onClick={() => {
                          setEditingImage(img);
                          setImageEditForm({ alt_text: img.alt_text || '', image: null });
                          setShowEditImageModal(true);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="col-span-1 md:col-span-2">
              <button type="submit" disabled={isSubmitting} className="w-full bg-[#01aaa7] text-white py-3 rounded-lg font-semibold hover:bg-[#019c98] transition-colors flex items-center justify-center gap-2">
                {isSubmitting && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                )}
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            </div>
          </form>
        )}
      </div>
      {/* Dedicated modal for editing a product image */}
      {showEditImageModal && editingImage && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={() => setShowEditImageModal(false)}>&times;</button>
            <h3 className="text-xl font-bold mb-4 text-[#01aaa7]">Edit Image</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setImageEditLoading(true);
                showToast('Updating image...');
                try {
                  await updateProductImage(editingImage.id, imageEditForm);
                  showToast('Image updated!', 'success');
                  setShowEditImageModal(false);
                  setEditingImage(null);
                  // Refresh images
                  const imgs = await getProductImagesByProductId(productId);
                  setExistingImages(imgs || []);
                } catch {
                  showToast('Failed to update image.', 'error');
                } finally {
                  setImageEditLoading(false);
                }
              }}
            >
              <img src={editingImage.url || editingImage.image_url || editingImage.path} alt="Current" className="w-32 h-32 object-cover rounded mb-4 mx-auto" />
              <input
                type="file"
                accept="image/*"
                onChange={e => setImageEditForm((f: any) => ({ ...f, image: e.target.files?.[0] || null }))}
                className="mb-2 w-full"
              />
              <input
                type="text"
                value={imageEditForm.alt_text}
                onChange={e => setImageEditForm((f: any) => ({ ...f, alt_text: e.target.value }))}
                placeholder="Alt text"
                className="mb-2 px-2 py-1 border rounded w-full"
              />
              <button type="submit" className="bg-[#01aaa7] text-white px-4 py-2 rounded text-sm font-semibold mt-2 w-full" disabled={imageEditLoading}>
                {imageEditLoading ? 'Saving...' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProductModal; 