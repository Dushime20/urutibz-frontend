import React from 'react';

interface NewListingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  isSubmitting: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const NewListingModal: React.FC<NewListingModalProps> = ({ open, onClose, onSubmit, form, setForm, isSubmitting, handleInputChange }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-md shadow-2xl p-8 max-w-4xl w-full relative max-h-[95vh] overflow-y-auto">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-[#01aaa7]">Add New Listing</h2>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <input name="alt_text" value={form.alt_text} onChange={handleInputChange} required placeholder="Image Alt Text" className="w-full border rounded-lg px-4 py-2" />
            <input name="sort_order" value={form.sort_order} onChange={handleInputChange} required placeholder="Sort Order" className="w-full border rounded-lg px-4 py-2" />
            <input name="isPrimary" value={form.isPrimary} onChange={handleInputChange} required placeholder="Is Primary (true/false)" className="w-full border rounded-lg px-4 py-2" />
            <input name="product_id" value={form.product_id} readOnly placeholder="Product ID (auto)" className="w-full border rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed" />
            <input name="images" type="file" accept="image/*" multiple onChange={e => {
              const input = e.target as HTMLInputElement;
              const newFiles = input.files ? Array.from(input.files) : [];
              setForm((prev: any) => {
                // Avoid duplicates by file name
                const existingNames = prev.images.map((f: File) => f.name);
                const filteredNew = newFiles.filter(f => !existingNames.includes(f.name));
                return { ...prev, images: [...prev.images, ...filteredNew] };
              });
            }} required className="w-full border rounded-lg px-4 py-2" />
            <p className="text-xs text-gray-500">You can select multiple images.</p>
            {/* Preview selected images with remove option */}
            {form.images && form.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.images.map((file: File, idx: number) => (
                  <div key={idx} className="relative w-20 h-20 border rounded overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="object-cover w-full h-full"
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-white bg-opacity-80 text-red-500 rounded-bl px-1 py-0.5 text-xs hover:bg-red-100"
                      onClick={() => {
                        const newImages = form.images.filter((_: File, i: number) => i !== idx);
                        setForm((prev: any) => ({ ...prev, images: newImages }));
                      }}
                    >
                      &times;
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
              {isSubmitting ? 'Submitting...' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewListingModal; 