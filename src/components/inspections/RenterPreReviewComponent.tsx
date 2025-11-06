import React, { useState } from 'react';
import { CheckCircle, X, AlertTriangle, Image as ImageIcon, MapPin, Clock } from 'lucide-react';
import { OwnerPreInspectionData, RenterPreReview, ItemCondition } from '../../types/inspection';

interface RenterPreReviewComponentProps {
  inspectionId: string;
  ownerPreInspection: OwnerPreInspectionData;
  onSubmit: (review: RenterPreReview) => Promise<void>;
  onReportDiscrepancy?: (discrepancy: { issues: string[]; notes: string; photos: File[] }) => Promise<void>;
  onCancel?: () => void;
  showDiscrepancyFormInitially?: boolean;
}

const RenterPreReviewComponent: React.FC<RenterPreReviewComponentProps> = ({
  inspectionId,
  ownerPreInspection,
  onSubmit,
  onReportDiscrepancy,
  onCancel,
  showDiscrepancyFormInitially = false
}) => {
  const [accepted, setAccepted] = useState(false);
  const [concerns, setConcerns] = useState<string[]>([]);
  const [newConcern, setNewConcern] = useState('');
  const [additionalRequests, setAdditionalRequests] = useState<string[]>([]);
  const [newRequest, setNewRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDiscrepancyForm, setShowDiscrepancyForm] = useState(showDiscrepancyFormInitially);
  const [discrepancyIssues, setDiscrepancyIssues] = useState<string[]>([]);
  const [discrepancyIssueInput, setDiscrepancyIssueInput] = useState('');
  const [discrepancyNote, setDiscrepancyNote] = useState('');
  const [discrepancyPhotos, setDiscrepancyPhotos] = useState<File[]>([]);

  const addConcern = () => {
    if (newConcern.trim()) {
      setConcerns([...concerns, newConcern.trim()]);
      setNewConcern('');
    }
  };

  const removeConcern = (index: number) => {
    setConcerns(concerns.filter((_, i) => i !== index));
  };

  const addRequest = () => {
    if (newRequest.trim()) {
      setAdditionalRequests([...additionalRequests, newRequest.trim()]);
      setNewRequest('');
    }
  };

  const removeRequest = (index: number) => {
    setAdditionalRequests(additionalRequests.filter((_, i) => i !== index));
  };

  const handleDiscrepancyPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    setDiscrepancyPhotos([...discrepancyPhotos, ...imageFiles]);
  };

  const removeDiscrepancyPhoto = (index: number) => {
    setDiscrepancyPhotos(discrepancyPhotos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!accepted && concerns.length === 0 && additionalRequests.length === 0) {
      setError('Please either accept the pre-inspection or add concerns/requests');
      return;
    }

    const review: RenterPreReview = {
      inspectionId,
      accepted,
      concerns: concerns.length > 0 ? concerns : undefined,
      additionalRequests: additionalRequests.length > 0 ? additionalRequests : undefined,
      timestamp: new Date().toISOString()
    };

    console.log('[RenterPreReviewComponent] Submitting review:', review);

    try {
      setLoading(true);
      await onSubmit(review);
    } catch (err: any) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const handleDiscrepancySubmit = async () => {
    if (!discrepancyIssues.length || !discrepancyNote.trim()) {
      setError('Please provide issues and notes for the discrepancy');
      return;
    }

    if (!onReportDiscrepancy) {
      setError('Discrepancy reporting is not available');
      return;
    }

    try {
      setLoading(true);
      await onReportDiscrepancy({
        issues: discrepancyIssues,
        notes: discrepancyNote,
        photos: discrepancyPhotos
      });
      setShowDiscrepancyForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to report discrepancy');
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

  const photoUrls = ownerPreInspection.photos.filter(p => typeof p === 'string') as string[];
  const photoFiles = ownerPreInspection.photos.filter(p => p instanceof File) as File[];

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Owner's Pre-Inspection Summary */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
          Owner's Pre-Inspection Summary
        </h3>

        {/* Overall Condition */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Overall Condition</label>
          <div className="mt-1">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(ownerPreInspection.condition.overallCondition)}`}>
              {getConditionLabel(ownerPreInspection.condition.overallCondition)}
            </span>
          </div>
        </div>

        {/* Photos */}
        {photoUrls.length > 0 && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">Product Photos</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photoUrls.slice(0, 8).map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Product photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-slate-700"
                  />
                </div>
              ))}
              {photoUrls.length > 8 && (
                <div className="flex items-center justify-center w-full h-24 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700">
                  <span className="text-sm text-gray-600 dark:text-slate-400">+{photoUrls.length - 8} more</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Items */}
        {ownerPreInspection.condition.items.length > 0 && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">Product Components</label>
            <div className="space-y-2">
              {ownerPreInspection.condition.items.map((item, index) => (
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
        {ownerPreInspection.condition.accessories.length > 0 && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">Accessories & Included Items</label>
            <div className="space-y-1">
              {ownerPreInspection.condition.accessories.map((accessory, index) => (
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

        {/* Known Issues */}
        {ownerPreInspection.condition.knownIssues.length > 0 && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">Known Issues</label>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-slate-400">
              {ownerPreInspection.condition.knownIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Notes */}
        {ownerPreInspection.notes && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 block">Owner's Notes</label>
            <p className="text-sm text-gray-600 dark:text-slate-400 whitespace-pre-wrap">{ownerPreInspection.notes}</p>
          </div>
        )}

        {/* Location */}
        {ownerPreInspection.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
            <MapPin className="h-4 w-4" />
            <span>
              {ownerPreInspection.location.address || 
               `${ownerPreInspection.location.latitude.toFixed(6)}, ${ownerPreInspection.location.longitude.toFixed(6)}`}
            </span>
          </div>
        )}

        {/* Timestamp */}
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-500 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <Clock className="h-3 w-3" />
          <span>Submitted: {new Date(ownerPreInspection.timestamp).toLocaleString()}</span>
        </div>
      </div>

      {/* Discrepancy Report Form */}
      {showDiscrepancyForm && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
            Report Discrepancy
          </h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
            If the product you received differs from the owner's description, please report it here.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Issues Found <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {discrepancyIssues.map((issue, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                    <span className="flex-1 text-sm text-gray-700 dark:text-slate-300">{issue}</span>
                    <button
                      type="button"
                      onClick={() => setDiscrepancyIssues(discrepancyIssues.filter((_, i) => i !== index))}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  value={discrepancyIssueInput}
                  onChange={(e) => setDiscrepancyIssueInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && discrepancyIssueInput.trim()) {
                      e.preventDefault();
                      if (!discrepancyIssues.includes(discrepancyIssueInput.trim())) {
                        setDiscrepancyIssues([...discrepancyIssues, discrepancyIssueInput.trim()]);
                        setDiscrepancyIssueInput('');
                      }
                    }
                  }}
                  placeholder="Describe the issue and press Enter"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Detailed Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                value={discrepancyNote}
                onChange={(e) => setDiscrepancyNote(e.target.value)}
                rows={4}
                placeholder="Provide detailed description of the discrepancies..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Photos of Discrepancies
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-2">
                {discrepancyPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Discrepancy ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => removeDiscrepancyPhoto(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-teal-500 dark:hover:border-teal-400 transition-colors">
                  <ImageIcon className="h-5 w-5 text-gray-400 dark:text-slate-500 mb-1" />
                  <span className="text-xs text-gray-500 dark:text-slate-400 text-center px-2">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleDiscrepancyPhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
              onClick={() => {
                setShowDiscrepancyForm(false);
                setDiscrepancyIssues([]);
                setDiscrepancyIssueInput('');
                setDiscrepancyNote('');
                setDiscrepancyPhotos([]);
              }}
                className="px-4 py-2 text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDiscrepancySubmit}
                disabled={loading}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Discrepancy Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      {!showDiscrepancyForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
            Your Review
          </h3>

          {/* Acceptance */}
          <div className="mb-4">
            <label className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                  I accept the owner's pre-inspection and agree with the condition assessment
                </p>
              </div>
            </label>
          </div>

          {/* Concerns */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Concerns (Optional)
            </label>
            <div className="space-y-2 mb-2">
              {concerns.map((concern, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <span className="flex-1 text-sm text-gray-700 dark:text-slate-300">{concern}</span>
                  <button
                    type="button"
                    onClick={() => removeConcern(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newConcern}
                  onChange={(e) => setNewConcern(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addConcern())}
                  placeholder="Add a concern"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={addConcern}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Additional Requests */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Additional Information Requests (Optional)
            </label>
            <div className="space-y-2 mb-2">
              {additionalRequests.map((request, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <span className="flex-1 text-sm text-gray-700 dark:text-slate-300">{request}</span>
                  <button
                    type="button"
                    onClick={() => removeRequest(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRequest}
                  onChange={(e) => setNewRequest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequest())}
                  placeholder="Request additional information"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={addRequest}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setShowDiscrepancyForm(true)}
              className="px-4 py-2 text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Report Discrepancy
            </button>
            <div className="flex gap-3">
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
                    Submit Review
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default RenterPreReviewComponent;

