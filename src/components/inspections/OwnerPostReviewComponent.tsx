import React, { useState } from 'react';
import { CheckCircle, X, AlertTriangle, Image as ImageIcon, MapPin, Clock, Upload, AlertCircle } from 'lucide-react';
import { RenterPostInspectionData, OwnerPostReview, ItemCondition, DisputeType } from '../../types/inspection';

interface OwnerPostReviewComponentProps {
  inspectionId: string;
  renterPostInspection: RenterPostInspectionData;
  onSubmit: (review: OwnerPostReview) => Promise<void>;
  onCancel?: () => void;
}

const OwnerPostReviewComponent: React.FC<OwnerPostReviewComponentProps> = ({
  inspectionId,
  renterPostInspection,
  onSubmit,
  onCancel
}) => {
  const [accepted, setAccepted] = useState(false);
  const [disputeRaised, setDisputeRaised] = useState(false);
  const [disputeType, setDisputeType] = useState<DisputeType>(DisputeType.DAMAGE_ASSESSMENT);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState('');
  const [disputePhotos, setDisputePhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDisputePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setDisputePhotos([...disputePhotos, ...imageFiles]);
  };

  const removeDisputePhoto = (index: number) => {
    setDisputePhotos(disputePhotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!accepted && !disputeRaised) {
      setError('Please either accept the post-inspection or raise a dispute');
      return;
    }

    if (disputeRaised && !disputeReason.trim()) {
      setError('Please provide a reason for the dispute');
      return;
    }

    if (disputeRaised && !disputeType) {
      setError('Please select a dispute type');
      return;
    }

    const review: OwnerPostReview = {
      inspectionId,
      postInspection: renterPostInspection,
      ownerReview: {
        accepted: accepted && !disputeRaised,
        confirmedAt: accepted && !disputeRaised ? new Date().toISOString() : undefined,
        disputeRaised,
        disputeType: disputeRaised ? disputeType : undefined,
        disputeReason: disputeRaised ? disputeReason : undefined,
        disputeEvidence: disputeRaised ? disputeEvidence : undefined,
        disputePhotos: disputeRaised ? disputePhotos : undefined
      }
    };

    try {
      setLoading(true);
      await onSubmit(review);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const getConditionLabel = (condition: ItemCondition) => {
    const labels: Record<ItemCondition, string> = {
      [ItemCondition.EXCELLENT]: 'Excellent',
      [ItemCondition.GOOD]: 'Good',
      [ItemCondition.FAIR]: 'Fair',
      [ItemCondition.POOR]: 'Poor',
      [ItemCondition.DAMAGED]: 'Damaged'
    };
    return labels[condition];
  };

  const getConditionColor = (condition: ItemCondition) => {
    const colors: Record<ItemCondition, string> = {
      [ItemCondition.EXCELLENT]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      [ItemCondition.GOOD]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      [ItemCondition.FAIR]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      [ItemCondition.POOR]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      [ItemCondition.DAMAGED]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[condition];
  };

  const photoUrls = renterPostInspection.returnPhotos.filter(p => typeof p === 'string') as string[];
  const photoFiles = renterPostInspection.returnPhotos.filter(p => p instanceof File) as File[];

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Renter's Post-Inspection Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
          Renter's Post-Inspection Summary
        </h3>

        {/* Overall Condition */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Overall Return Condition</label>
          <div className="mt-1">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(renterPostInspection.condition.overallCondition)}`}>
              {getConditionLabel(renterPostInspection.condition.overallCondition)}
            </span>
          </div>
        </div>

        {/* Photos */}
        {(photoUrls.length > 0 || photoFiles.length > 0) && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">Return Photos</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photoUrls.slice(0, 8).map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Return photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-slate-700"
                  />
                </div>
              ))}
              {photoFiles.slice(0, Math.max(0, 8 - photoUrls.length)).map((file, index) => (
                <div key={`file-${index}`} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Return photo ${photoUrls.length + index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-slate-700"
                  />
                </div>
              ))}
              {(photoUrls.length + photoFiles.length) > 8 && (
                <div className="flex items-center justify-center w-full h-24 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
                  <span className="text-sm text-gray-600 dark:text-slate-400">
                    +{(photoUrls.length + photoFiles.length) - 8} more
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Items */}
        {renterPostInspection.condition.items.length > 0 && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">Product Components</label>
            <div className="space-y-2">
              {renterPostInspection.condition.items.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-slate-100">{item.itemName}</p>
                      <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">{item.description}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
                      {getConditionLabel(item.condition)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accessories */}
        {renterPostInspection.condition.accessories.length > 0 && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">Accessories & Included Items</label>
            <div className="space-y-1">
              {renterPostInspection.condition.accessories.map((accessory, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {accessory.included ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-gray-700 dark:text-slate-300">{accessory.name}</span>
                  {accessory.condition && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getConditionColor(accessory.condition)}`}>
                      {getConditionLabel(accessory.condition)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {renterPostInspection.notes && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">Renter's Notes</label>
            <p className="text-sm text-gray-600 dark:text-slate-400 whitespace-pre-wrap">{renterPostInspection.notes}</p>
          </div>
        )}

        {/* Location */}
        {renterPostInspection.returnLocation && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 mb-4">
            <MapPin className="h-4 w-4" />
            <span>
              {renterPostInspection.returnLocation.address || 
               `${renterPostInspection.returnLocation.latitude.toFixed(6)}, ${renterPostInspection.returnLocation.longitude.toFixed(6)}`}
            </span>
          </div>
        )}

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-500 pt-4 border-t border-gray-200 dark:border-slate-700">
          <Clock className="h-3 w-3" />
          <span>Submitted: {new Date(renterPostInspection.timestamp).toLocaleString()}</span>
        </div>
      </div>

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
          Your Review
        </h3>

        {/* Acceptance */}
        <div className="mb-4">
          <label className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
            <input
              type="checkbox"
              checked={accepted && !disputeRaised}
              onChange={(e) => {
                setAccepted(e.target.checked);
                if (e.target.checked) {
                  setDisputeRaised(false);
                }
              }}
              className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                I confirm there is no issue - everything is clear and acceptable
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                This will close the rental record automatically. All items are returned in good condition with no problems.
              </p>
            </div>
          </label>
        </div>

        {/* Dispute Option */}
        <div className="mb-4">
          <label className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 cursor-pointer hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors">
            <input
              type="checkbox"
              checked={disputeRaised}
              onChange={(e) => {
                setDisputeRaised(e.target.checked);
                if (e.target.checked) {
                  setAccepted(false);
                }
              }}
              className="mt-1 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-slate-100 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                I need to claim - there is an issue, problem, missing device, or damaged tools
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                If there are issues, problems, missing devices, damaged tools, or anything doesn't match the renter's description
              </p>
            </div>
          </label>
        </div>

        {/* Dispute Form */}
        {disputeRaised && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Dispute Type <span className="text-red-500">*</span>
              </label>
              <select
                value={disputeType}
                onChange={(e) => setDisputeType(e.target.value as DisputeType)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-800 dark:text-slate-100"
                required
              >
                <option value={DisputeType.DAMAGE_ASSESSMENT}>Damage Assessment</option>
                <option value={DisputeType.CONDITION_DISAGREEMENT}>Condition Disagreement</option>
                <option value={DisputeType.COST_DISPUTE}>Cost Dispute</option>
                <option value={DisputeType.PROCEDURE_VIOLATION}>Procedure Violation</option>
                <option value={DisputeType.OTHER}>Other</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Select the type of issue you're disputing
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Issue/Problem Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                rows={4}
                placeholder="Describe in detail: What issues did you find? What problems occurred? What devices/tools are missing? What items are damaged? How does it differ from the renter's description?"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-800 dark:text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Additional Information & Evidence Details
              </label>
              <textarea
                value={disputeEvidence}
                onChange={(e) => setDisputeEvidence(e.target.value)}
                rows={3}
                placeholder="Provide any additional details, context, or information that supports your claim. Include specific details about missing items, damage extent, repair costs, replacement needs, etc."
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 dark:bg-slate-800 dark:text-slate-100"
              />
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                Provide all necessary information and details. This will help inspectors resolve the claim effectively.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Evidence Photos
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-2">
                {disputePhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Dispute evidence ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => removeDisputePhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-yellow-500 dark:hover:border-yellow-400 transition-colors">
                  <ImageIcon className="h-5 w-5 text-gray-400 dark:text-slate-500 mb-1" />
                  <span className="text-xs text-gray-500 dark:text-slate-400 text-center px-2">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleDisputePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Upload photos showing damage, missing items, or any issues as proof. Include multiple angles and clear images.
              </p>
            </div>
          </div>
        )}

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
            className={`px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
              disputeRaised
                ? 'bg-yellow-600 hover:bg-yellow-700'
                : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : disputeRaised ? (
              <>
                <AlertTriangle className="h-4 w-4" />
                Submit Claim
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Confirm No Issue & Close Rental
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OwnerPostReviewComponent;

