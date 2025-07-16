import React, { useState } from 'react';

type FormState = {
  title: string;
  slug: string;
  description: string;
  category_id: string;
  condition: string;
  base_price_per_day: string;
  base_currency: string;
  base_price_per_week?: string;
  base_price_per_month?: string;
  pickup_methods: string[];
  country_id: string;
  specifications: { [key: string]: string };
  features?: string[];
  images: File[];
  alt_text: string;
  sort_order: string;
  isPrimary: string;
  product_id: string;
  location: { latitude: string; longitude: string };
};

interface NewListingModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  isSubmitting: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const NewListingModal: React.FC<NewListingModalProps> = ({ open, onClose, onSubmit, form, setForm, isSubmitting, handleInputChange }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-md shadow-2xl p-8 max-w-5xl w-full relative max-h-[95vh] overflow-y-auto">
        <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold mb-4 text-[#01aaa7]">Add New Listing</h2>
        {/* <button onClick={onClose}>&times</button> */}
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <input name="title" value={form.title} onChange={handleInputChange} required placeholder="Title" className="w-full border rounded-lg px-4 py-2" />
            <textarea name="description" value={form.description} onChange={handleInputChange} required placeholder="Description" className="w-full border rounded-lg px-4 py-2" />
            <input name="category_id" value={form.category_id} onChange={handleInputChange} required placeholder="Category ID" className="w-full border rounded-lg px-4 py-2" />
            <select name="condition" value={form.condition} onChange={handleInputChange} className="w-full border rounded-lg px-4 py-2">
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
            <input name="base_price_per_day" value={form.base_price_per_day} onChange={handleInputChange} required placeholder="Price per day" type="number" className="w-full border rounded-lg px-4 py-2" />
            <input name="base_currency" value={form.base_currency} onChange={handleInputChange} required placeholder="Currency" className="w-full border rounded-lg px-4 py-2" />
            <input
              name="base_price_per_week"
              value={form.base_price_per_week}
              onChange={handleInputChange}
              placeholder="Price per week"
              type="number"
              className="w-full border rounded-lg px-4 py-2"
            />
            <input
              name="base_price_per_month"
              value={form.base_price_per_month}
              onChange={handleInputChange}
              placeholder="Price per month"
              type="number"
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>
          <div className="space-y-4">
            <select name="pickup_methods" multiple value={form.pickup_methods} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange(e)} className="w-full border rounded-lg px-4 py-2">
              <option value="pickup">Pickup</option>
              <option value="delivery">Delivery</option>
            </select>
            <input name="country_id" value={form.country_id} onChange={handleInputChange} required placeholder="Country ID" className="w-full border rounded-lg px-4 py-2" />
            {/* Specifications UI (custom only) */}
            <div className="space-y-2">
              <label className="block font-semibold">Specifications</label>
              {Object.entries(form.specifications).length === 0 && (
                <div className="flex gap-2 mb-2">
                  <input
                    value=""
                    onChange={e => {
                      const newKey = e.target.value;
                      if (newKey) {
                        setForm((f: FormState) => ({
                          ...f,
                          specifications: { ...f.specifications, [newKey]: '' }
                        }));
                      }
                    }}
                    placeholder="Key (e.g. Color)"
                    className="border rounded px-2 py-1"
                  />
                  <input
                    value=""
                    onChange={e => {}}
                    placeholder="Value (e.g. Red)"
                    className="border rounded px-2 py-1"
                    disabled
                  />
                  <button type="button" disabled>Remove</button>
                </div>
              )}
              {Object.entries(form.specifications).map(([key, value], idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    value={key}
                    onChange={e => {
                      const newKey = e.target.value;
                      setForm((f: FormState) => {
                        const entries = Object.entries(f.specifications);
                        // Replace the key at idx with the newKey, keep value
                        const newEntries = entries.map(([k, v], i) =>
                          i === idx ? [newKey, v] : [k, v]
                        );
                        // Do not filter out empty keys here
                        const newSpecs = Object.fromEntries(newEntries);
                        return { ...f, specifications: newSpecs };
                      });
                    }}
                    placeholder="Key (e.g. Color)"
                    className="border rounded px-2 py-1"
                  />
                  <input
                    value={value}
                    onChange={e => {
                      setForm((f: FormState) => {
                        const entries = Object.entries(f.specifications);
                        const newEntries = entries.map(([k, v], i) =>
                          i === idx ? [k, e.target.value] : [k, v]
                        );
                        return { ...f, specifications: Object.fromEntries(newEntries) };
                      });
                    }}
                    placeholder="Value (e.g. Red)"
                    className="border rounded px-2 py-1"
                    disabled={!key}
                  />
                  <button type="button" onClick={() => {
                    setForm((f: FormState) => {
                      const entries = Object.entries(f.specifications);
                      const newEntries = entries.filter((_, i) => i !== idx);
                      return { ...f, specifications: Object.fromEntries(newEntries) };
                    });
                  }}>Remove</button>
                </div>
              ))}
              {/* Always show an extra empty row for adding a new specification */}
              <div className="flex gap-2 mb-2">
                <input
                  value=""
                  onChange={e => {
                    const newKey = e.target.value;
                    if (newKey) {
                      setForm((f: FormState) => ({
                        ...f,
                        specifications: { ...f.specifications, [newKey]: '' }
                      }));
                    }
                  }}
                  placeholder="Key (e.g. Color)"
                  className="border rounded px-2 py-1"
                />
                <input
                  value=""
                  onChange={() => {}}
                  placeholder="Value (e.g. Red)"
                  className="border rounded px-2 py-1"
                  disabled
                />
                <button type="button" disabled>Remove</button>
              </div>
              <button
                type="button"
                onClick={() => setForm((f: FormState) => ({
                  ...f,
                  specifications: { ...f.specifications, [`spec${Object.keys(f.specifications).length + 1}`]: '' }
                }))}
                className="text-xs text-[#01aaa7] underline"
              >
                Add Specification
              </button>
            </div>
            {/* Features UI (custom only) */}
            <div className="space-y-2 mt-4">
              <label className="block font-semibold">Features</label>
              {(Array.isArray(form.features) ? form.features : []).map((feature: string, idx: number) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    value={feature}
                    onChange={e => {
                      const features = Array.isArray(form.features) ? [...form.features] : [];
                      features[idx] = e.target.value;
                      setForm((f: FormState) => ({ ...f, features }));
                    }}
                    placeholder="Feature (e.g. Waterproof)"
                    className="border rounded px-2 py-1"
                  />
                  <button type="button" onClick={() => {
                    setForm((f: FormState) => ({ ...f, features: (Array.isArray(f.features) ? f.features : []).filter((_: any, i: number) => i !== idx) }));
                  }}>Remove</button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setForm((f: FormState) => ({ ...f, features: [...(Array.isArray(f.features) ? f.features : []), ''] }))}
                className="text-xs text-[#01aaa7] underline"
              >
                Add Feature
              </button>
            </div>
            <input name="alt_text" value={form.alt_text} onChange={handleInputChange} required placeholder="Image Alt Text" className="w-full border rounded-lg px-4 py-2" />
            <input name="sort_order" value={form.sort_order} onChange={handleInputChange} required placeholder="Sort Order" className="w-full border rounded-lg px-4 py-2" />
            <input name="isPrimary" value={form.isPrimary} onChange={handleInputChange} required placeholder="Is Primary (true/false)" className="w-full border rounded-lg px-4 py-2" />
            <input name="product_id" value={form.product_id} readOnly placeholder="Product ID (auto)" className="w-full border rounded-lg px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed" />
            <input name="images" type="file" accept="image/*" multiple onChange={e => {
              const input = e.target as HTMLInputElement;
              const newFiles = input.files ? Array.from(input.files) : [];
              setForm((prev: FormState) => {
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
                        setForm((prev: FormState) => ({ ...prev, images: newImages }));
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2 mt-4">
              <label className="block font-semibold">Location</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={form.location?.latitude || ''}
                  onChange={e => setForm((f: FormState) => ({
                    ...f,
                    location: { ...(f.location || { latitude: '', longitude: '' }), latitude: e.target.value }
                  }))}
                  placeholder="Latitude"
                  className="w-full border rounded-lg px-4 py-2"
                />
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={form.location?.longitude || ''}
                  onChange={e => setForm((f: FormState) => ({
                    ...f,
                    location: { ...(f.location || { latitude: '', longitude: '' }), longitude: e.target.value }
                  }))}
                  placeholder="Longitude"
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
            </div>
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