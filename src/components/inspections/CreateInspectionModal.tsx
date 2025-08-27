import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, User, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Inspector } from '../../types/inspection';
import { InspectionType } from '../../types/inspection';
import { inspectorService } from '../../services/inspectionService';

const createInspectionSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  bookingId: z.string().min(1, 'Booking ID is required'),
  inspectorId: z.string().min(1, 'Inspector is required'),
  inspectionType: z.nativeEnum(InspectionType),
  scheduledAt: z.string().min(1, 'Scheduled date is required'),
  location: z.string().min(1, 'Location is required'),
  notes: z.string().optional()
});

type CreateInspectionFormData = z.infer<typeof createInspectionSchema>;

interface CreateInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInspectionFormData) => void;
}

const CreateInspectionModal: React.FC<CreateInspectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingInspectors, setLoadingInspectors] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<CreateInspectionFormData>({
    resolver: zodResolver(createInspectionSchema),
    defaultValues: {
      inspectionType: InspectionType.PRE_RENTAL
    }
  });

  const watchedInspectorId = watch('inspectorId');

  useEffect(() => {
    if (isOpen) {
      loadInspectors();
      reset();
    }
  }, [isOpen, reset]);

  const loadInspectors = async () => {
    try {
      setLoadingInspectors(true);
      // Try fetching inspectors by role first
      const byRole = await inspectorService.getInspectors('inspector');
      let normalized: Inspector[] = Array.isArray(byRole)
        ? byRole
        : (byRole?.inspectors ?? byRole?.data ?? byRole?.items ?? []);

      // Fallback: fetch all inspectors if none returned with role filter
      if (!Array.isArray(normalized) || normalized.length === 0) {
        const all = await inspectorService.getInspectors();
        normalized = Array.isArray(all)
          ? all
          : (all?.inspectors ?? all?.data ?? all?.items ?? []);
      }

      setInspectors(Array.isArray(normalized) ? normalized : []);
    } catch (error) {
      console.error('Error loading inspectors:', error);
      setInspectors([]);
    } finally {
      setLoadingInspectors(false);
    }
  };

  const handleFormSubmit = async (data: CreateInspectionFormData) => {
    try {
      setLoading(true);
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating inspection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all">
          {/* Header */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Create New Inspection
              </h3>
              <button
                onClick={handleClose}
                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              {/* Product ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product ID
                </label>
                <input
                  type="text"
                  {...register('productId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product ID"
                />
                {errors.productId && (
                  <p className="mt-1 text-sm text-red-600">{errors.productId.message}</p>
                )}
              </div>

              {/* Booking ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Booking ID
                </label>
                <input
                  type="text"
                  {...register('bookingId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter booking ID"
                />
                {errors.bookingId && (
                  <p className="mt-1 text-sm text-red-600">{errors.bookingId.message}</p>
                )}
              </div>

              {/* Inspector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inspector
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    {...register('inspectorId')}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">
                      {loadingInspectors ? 'Loading inspectors...' : 'Select an inspector'}
                    </option>
                    {Array.isArray(inspectors) && inspectors.length > 0 ? (
                      inspectors.map((inspector: any) => {
                        const fullName = inspector.name || inspector.userId || '';
                        const firstName = fullName ? String(fullName).trim().split(/\s+/)[0] : '';
                        const emailUser = inspector.email ? String(inspector.email).split('@')[0] : '';
                        const label = firstName || emailUser || `Inspector ${inspector.id}`;
                        return (
                          <option key={inspector.id} value={inspector.id}>
                            {label}
                          </option>
                        );
                      })
                    ) : !loadingInspectors ? (
                      <option value="" disabled>
                        No inspectors available
                      </option>
                    ) : null}
                  </select>
                  {!loadingInspectors && (!Array.isArray(inspectors) || inspectors.length === 0) && (
                    <p className="mt-2 text-sm text-gray-500">No inspectors available right now. Please try again later.</p>
                  )}
                </div>
                {errors.inspectorId && (
                  <p className="mt-1 text-sm text-red-600">{errors.inspectorId.message}</p>
                )}
              </div>

              {/* Inspection Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inspection Type
                </label>
                <select
                  {...register('inspectionType')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={InspectionType.PRE_RENTAL}>Pre-Rental</option>
                  <option value={InspectionType.POST_RENTAL}>Post-Rental</option>
                  <option value={InspectionType.DAMAGE_ASSESSMENT}>Damage Assessment</option>
                  <option value={InspectionType.MAINTENANCE_CHECK}>Maintenance Check</option>
                  <option value={InspectionType.QUALITY_VERIFICATION}>Quality Verification</option>
                </select>
                {errors.inspectionType && (
                  <p className="mt-1 text-sm text-red-600">{errors.inspectionType.message}</p>
                )}
              </div>

              {/* Scheduled Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scheduled Date & Time
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="datetime-local"
                    {...register('scheduledAt')}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {errors.scheduledAt && (
                  <p className="mt-1 text-sm text-red-600">{errors.scheduledAt.message}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    {...register('location')}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter inspection location"
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add any additional notes..."
                  />
                </div>
                {errors.notes && (
                  <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting || loading ? 'Creating...' : 'Create Inspection'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateInspectionModal;
