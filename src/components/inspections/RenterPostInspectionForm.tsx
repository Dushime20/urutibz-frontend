import React, { useState } from 'react';
import { Upload, X, MapPin, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import { ItemCondition, GPSLocation, ConditionAssessment, RenterPostInspectionData } from '../../types/inspection';

interface RenterPostInspectionFormProps {
  inspectionId: string;
  productId: string;
  bookingId: string;
  onSubmit: (data: RenterPostInspectionData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<RenterPostInspectionData>;
}

const RenterPostInspectionForm: React.FC<RenterPostInspectionFormProps> = ({
  inspectionId,
  productId,
  bookingId,
  onSubmit,
  onCancel,
  initialData
}) => {
  // returnPhotos: File[] for newly selected files (to upload)
  // photoPreviews: string[] for already uploaded photos (URLs from server)
  const [returnPhotos, setReturnPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>(
    initialData?.returnPhotos?.filter(p => typeof p === 'string') as string[] || []
  );
  const [overallCondition, setOverallCondition] = useState<ItemCondition>(initialData?.condition?.overallCondition || ItemCondition.GOOD);
  const [items, setItems] = useState<ConditionAssessment['items']>(initialData?.condition?.items || []);
  const [accessories, setAccessories] = useState<ConditionAssessment['accessories']>(initialData?.condition?.accessories || []);
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [returnLocation, setReturnLocation] = useState<GPSLocation | null>(initialData?.returnLocation || null);
  const [confirmed, setConfirmed] = useState(initialData?.confirmed || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalPhotos = returnPhotos.length + photoPreviews.length;
    
    if (files.length + totalPhotos > 20) {
      setError('Maximum 20 photos allowed');
      return;
    }

    const newPhotos = files.filter(file => file.type.startsWith('image/'));
    setReturnPhotos([...returnPhotos, ...newPhotos]);
    setError(null); // Clear any previous errors
    
    // Reset input to allow selecting the same file again
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    if (index < returnPhotos.length) {
      // Remove from newly selected photos (File objects)
      setReturnPhotos(returnPhotos.filter((_, i) => i !== index));
    } else {
      // Remove from already uploaded photos (URLs)
      const previewIndex = index - returnPhotos.length;
      setPhotoPreviews(photoPreviews.filter((_, i) => i !== previewIndex));
    }
  };

  const addItem = () => {
    setItems([...items, {
      itemName: '',
      condition: ItemCondition.GOOD,
      description: '',
      photos: []
    }]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addAccessory = () => {
    setAccessories([...accessories, {
      name: '',
      included: true,
      condition: ItemCondition.GOOD
    }]);
  };

  const updateAccessory = (index: number, field: string, value: any) => {
    const updated = [...accessories];
    updated[index] = { ...updated[index], [field]: value };
    setAccessories(updated);
  };

  const removeAccessory = (index: number) => {
    setAccessories(accessories.filter((_, i) => i !== index));
  };

  const getCurrentLocation = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setError(null); // Clear any previous errors
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setReturnLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString()
        });
        setLoading(false);
      },
      (error) => {
        setError(`Failed to get location: ${error.message}`);
        setLoading(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (returnPhotos.length + photoPreviews.length < 2) {
      setError('Please upload at least 2 photos of the returned product');
      return;
    }

    if (!returnLocation) {
      setError('Please capture GPS location for return');
      return;
    }

    if (!confirmed) {
      setError('Please confirm that the information is accurate');
      return;
    }

    const condition: ConditionAssessment = {
      overallCondition,
      items: items.filter(item => item.itemName.trim() !== ''),
      accessories: accessories.filter(acc => acc.name.trim() !== ''),
      knownIssues: [],
      maintenanceHistory: undefined
    };

    // Only send File objects for upload, keep URLs in photoPreviews for display
    const data: RenterPostInspectionData = {
      inspectionId,
      returnPhotos: returnPhotos, // Only File objects for upload
      condition,
      notes,
      returnLocation,
      timestamp: new Date().toISOString(),
      confirmed
    };

    console.log('[RenterPostInspectionForm] Submitting post-inspection:', {
      inspectionId,
      photosCount: returnPhotos.length,
      hasCondition: !!condition,
      itemsCount: condition.items.length,
      accessoriesCount: condition.accessories.length,
      notesLength: notes.length,
      hasLocation: !!returnLocation,
      confirmed
    });

    try {
      setLoading(true);
      await onSubmit(data);
    } catch (err: any) {
      console.error('[RenterPostInspectionForm] Submit error:', err);
      setError(err.message || 'Failed to submit post-inspection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Return Photos Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          Return Photos <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">
          Upload photos showing the product's condition upon return (minimum 2, maximum 20)
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {/* Display newly selected photos (File objects) */}
          {returnPhotos.map((photo, index) => {
            const previewUrl = URL.createObjectURL(photo);
            return (
              <div key={`photo-${index}-${photo.name}-${photo.size}`} className="relative group">
                <img
                  src={previewUrl}
                  alt={`Return photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-slate-700"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Remove photo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
          
          {/* Display already uploaded photos (URLs from server) */}
          {photoPreviews.length > 0 && photoPreviews.map((preview, index) => (
            <div key={`preview-${index}-${preview.substring(0, 20)}`} className="relative group">
              <img
                src={preview}
                alt={`Uploaded Return photo ${returnPhotos.length + index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-slate-700"
              />
              <button
                type="button"
                onClick={() => removePhoto(returnPhotos.length + index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                title="Remove photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-teal-500 dark:hover:border-teal-400 transition-colors">
            <Upload className="h-6 w-6 text-gray-400 dark:text-slate-500 mb-2" />
            <span className="text-sm text-gray-500 dark:text-slate-400 text-center px-2">Add Photo</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-xs text-gray-500 dark:text-slate-400">
          {returnPhotos.length + photoPreviews.length} / 20 photos (minimum 2 required)
        </p>
      </div>

      {/* Overall Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          Overall Return Condition <span className="text-red-500">*</span>
        </label>
        <select
          value={overallCondition}
          onChange={(e) => setOverallCondition(e.target.value as ItemCondition)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value={ItemCondition.EXCELLENT}>Excellent - Same as received</option>
          <option value={ItemCondition.GOOD}>Good - Minor wear</option>
          <option value={ItemCondition.FAIR}>Fair - Noticeable wear</option>
          <option value={ItemCondition.POOR}>Poor - Significant wear</option>
          <option value={ItemCondition.DAMAGED}>Damaged - Requires repair</option>
        </select>
      </div>

      {/* Items List */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
            Product Components / Items Condition
          </label>
          <button
            type="button"
            onClick={addItem}
            className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
          >
            + Add Item
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg space-y-2">
              <div className="flex justify-between items-start">
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.itemName}
                  onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <select
                value={item.condition}
                onChange={(e) => updateItem(index, 'condition', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value={ItemCondition.EXCELLENT}>Excellent</option>
                <option value={ItemCondition.GOOD}>Good</option>
                <option value={ItemCondition.FAIR}>Fair</option>
                <option value={ItemCondition.POOR}>Poor</option>
                <option value={ItemCondition.DAMAGED}>Damaged</option>
              </select>
              <textarea
                placeholder="Description of item condition"
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Accessories */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
            Accessories & Included Items
          </label>
          <button
            type="button"
            onClick={addAccessory}
            className="text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
          >
            + Add Accessory
          </button>
        </div>
        <div className="space-y-2">
          {accessories.map((accessory, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 dark:border-slate-700 rounded-lg">
              <input
                type="text"
                placeholder="Accessory name"
                value={accessory.name}
                onChange={(e) => updateAccessory(index, 'name', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={accessory.included}
                  onChange={(e) => updateAccessory(index, 'included', e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                Included
              </label>
              <select
                value={accessory.condition || ItemCondition.GOOD}
                onChange={(e) => updateAccessory(index, 'condition', e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100 text-sm"
              >
                <option value={ItemCondition.EXCELLENT}>Excellent</option>
                <option value={ItemCondition.GOOD}>Good</option>
                <option value={ItemCondition.FAIR}>Fair</option>
                <option value={ItemCondition.POOR}>Poor</option>
                <option value={ItemCondition.DAMAGED}>Damaged</option>
              </select>
              <button
                type="button"
                onClick={() => removeAccessory(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          Return Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Describe any issues or damage, explain any wear or changes, note missing items (if any)..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      {/* GPS Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          Return GPS Location <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              getCurrentLocation(e);
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MapPin className="h-4 w-4" />
            {returnLocation ? 'Update Location' : 'Capture Location'}
          </button>
          {returnLocation && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>
                {returnLocation.latitude.toFixed(6)}, {returnLocation.longitude.toFixed(6)}
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
          Capture GPS location where the product is being returned
        </p>
      </div>

      {/* Confirmation */}
      <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
        <input
          type="checkbox"
          id="confirm"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
        />
        <label htmlFor="confirm" className="text-sm text-gray-700 dark:text-slate-300">
          I confirm that the returned product is the same as the rented product and I have accurately represented its condition in the post-inspection data.
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Submit Post-Inspection
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default RenterPostInspectionForm;

