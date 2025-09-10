import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, User, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Inspector } from '../../types/inspection';
import { InspectionType } from '../../types/inspection';
import { inspectorService } from '../../services/inspectionService';
import { getMyProducts, fetchUserBookings, getProductById } from '../../pages/my-account/service/api';

const createInspectionSchema = z.object({
  mode: z.enum(['owner', 'renter']).default('owner'),
  productId: z.string().optional(),
  bookingId: z.string().optional(),
  inspectorId: z.string().min(1, 'Inspector is required'),
  inspectionType: z.nativeEnum(InspectionType),
  scheduledAt: z.string().min(1, 'Scheduled date is required'),
  location: z.string().min(1, 'Location is required'),
  notes: z.string().optional()
}).refine((data) => !!(data.productId || data.bookingId), {
  message: 'Provide at least product or booking ID',
  path: ['productId'],
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
    setValue,
    watch,
  } = useForm<CreateInspectionFormData>({
    resolver: zodResolver(createInspectionSchema) as any,
    defaultValues: {
      mode: 'owner',
      inspectionType: InspectionType.PRE_RENTAL
    }
  });

  const mode = watch('mode');
  const [productQuery, setProductQuery] = useState('');
  const [bookingQuery, setBookingQuery] = useState('');
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [showProductOptions, setShowProductOptions] = useState(false);
  const [showBookingOptions, setShowBookingOptions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadInspectors();
      reset();
      // preload products and bookings for autocomplete
      (async () => {
        try {
          const products = await getMyProducts();
          const normalized = Array.isArray(products) ? products : (products?.data || products?.items || []);
          setAllProducts(normalized);
        } catch {
          setAllProducts([]);
        }
        try {
          const token = localStorage.getItem('token');
          const res = await fetchUserBookings(token || undefined);
          const bookings = (res?.data || []) as any[];
          // Enrich each booking with product title like in My Bookings list
          const enriched = await Promise.all(bookings.map(async (b: any) => {
            try {
              const pid = b.product_id || b.productId;
              if (pid) {
                const prod = await getProductById(pid);
                return { ...b, product: prod };
              }
            } catch {}
            return b;
          }));
          setAllBookings(enriched);
        } catch {
          setAllBookings([]);
        }
      })();
    }
  }, [isOpen, reset]);

  const loadInspectors = async () => {
    try {
      setLoadingInspectors(true);
      // Try fetching inspectors by role first
      const byRole = await inspectorService.getInspectors('inspector');
      let normalized: Inspector[] = Array.isArray(byRole as any)
        ? byRole
        : ((byRole as any)?.inspectors ?? (byRole as any)?.data ?? (byRole as any)?.items ?? []);

      // Fallback: fetch all inspectors if none returned with role filter
      if (!Array.isArray(normalized) || normalized.length === 0) {
        const all = await inspectorService.getInspectors();
        normalized = Array.isArray(all as any)
          ? all
          : ((all as any)?.inspectors ?? (all as any)?.data ?? (all as any)?.items ?? []);
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
          className="fixed inset-0 bg-gray-500/60 dark:bg-black/60 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-slate-900 text-left shadow-xl transition-all border border-gray-200 dark:border-slate-700">
          {/* Header */}
          <div className="bg-gray-50 dark:bg-slate-900 px-4 py-3 sm:px-6 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">
                Create New Inspection
              </h3>
              <button
                onClick={handleClose}
                className="rounded-md bg-white dark:bg-slate-900 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(handleFormSubmit)} className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              {/* Mode selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">Request For</label>
                <div className="flex gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
                    <input type="radio" value="owner" {...register('mode')} className="text-teal-600" defaultChecked />
                    My item (owner)
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
                    <input type="radio" value="renter" {...register('mode')} className="text-teal-600" />
                    My rental (renter)
                  </label>
                </div>
              </div>
              {/* Product ID (visible in all modes) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
                  Product ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={productQuery}
                    onChange={(e) => {
                      setProductQuery(e.target.value);
                      setShowProductOptions(true);
                      setValue('productId', undefined as any);
                    }}
                    onFocus={() => setShowProductOptions(true)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                    placeholder="Search product by name"
                  />
                  {showProductOptions && (
                    <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white dark:bg-slate-900 py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-slate-700">
                      {allProducts
                        .filter((p: any) => (p.title || p.name || '').toLowerCase().includes(productQuery.toLowerCase()))
                        .slice(0, 20)
                        .map((p: any) => (
                          <li
                            key={p.id}
                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setProductQuery(p.title || p.name || `Product ${p.id.slice(0,8)}`);
                              setValue('productId', String(p.id));
                              setShowProductOptions(false);
                            }}
                          >
                            <div className="font-medium text-gray-900 dark:text-slate-100">{p.title || p.name}</div>
                            <div className="text-xs text-gray-500 dark:text-slate-400">ID: {p.id}</div>
                          </li>
                        ))}
                      {allProducts.length === 0 && (
                        <li className="px-3 py-2 text-gray-500 dark:text-slate-400">No products</li>
                      )}
                    </ul>
                  )}
                </div>
                {errors.productId && (
                  <p className="mt-1 text-sm text-red-600">{errors.productId.message}</p>
                )}
              </div>

              {/* Booking ID (visible in all modes) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
                  Booking ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={bookingQuery}
                    onChange={(e) => {
                      setBookingQuery(e.target.value);
                      setShowBookingOptions(true);
                      setValue('bookingId', undefined as any);
                    }}
                    onFocus={() => setShowBookingOptions(true)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                    placeholder="Search booking by reference/code"
                  />
                  {showBookingOptions && (
                    <ul className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white dark:bg-slate-900 py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 border border-gray-200 dark:border-slate-700">
                      {allBookings
                        .filter((b: any) => {
                          const match = (b.reference || b.code || b.bookingCode || '').toLowerCase().includes(bookingQuery.toLowerCase());
                          const productTitle = (bookingQuery || '').toLowerCase();
                          const productName = (b.product?.title || b.product?.name || '').toLowerCase();
                          return match || (productTitle && productName.includes(productTitle));
                        })
                        .slice(0, 20)
                        .map((b: any) => (
                          <li
                            key={b.id}
                            className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              const productLabel = b.product?.title || b.product?.name || '';
                              const refLabel = b.reference || b.code || b.bookingCode || `Booking ${String(b.id).slice(0,8)}`;
                              const label = productLabel ? `${productLabel} (${refLabel})` : refLabel;
                              setBookingQuery(label);
                              setValue('bookingId', String(b.id));
                              setShowBookingOptions(false);
                            }}
                          >
                            <div className="font-medium text-gray-900 dark:text-slate-100">{b.product?.title || b.product?.name || 'Booking'}</div>
                            <div className="text-xs text-gray-500 dark:text-slate-400">{b.reference || b.code || b.bookingCode || ''}</div>
                            <div className="text-xs text-gray-500 dark:text-slate-400">ID: {b.id}</div>
                          </li>
                        ))}
                      {allBookings.length === 0 && (
                        <li className="px-3 py-2 text-gray-500 dark:text-slate-400">No bookings</li>
                      )}
                    </ul>
                  )}
                </div>
                {errors.bookingId && (
                  <p className="mt-1 text-sm text-red-600">{errors.bookingId.message}</p>
                )}
              </div>

              {/* Inspector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
                  Inspector
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    {...register('inspectorId')}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
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
                    <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">No inspectors available right now. Please try again later.</p>
                  )}
                </div>
                {errors.inspectorId && (
                  <p className="mt-1 text-sm text-red-600">{errors.inspectorId.message}</p>
                )}
              </div>

              {/* Inspection Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
                  Inspection Type
                </label>
                <select
                  {...register('inspectionType')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                >
                  <option value={InspectionType.PRE_RENTAL}>Pre-Rental</option>
                  <option value={InspectionType.POST_RENTAL}>Post-Rental</option>
                  <option value={InspectionType.DAMAGE_ASSESSMENT}>Damage Assessment</option>
                  {/* <option value={InspectionType.MAINTENANCE_CHECK}>Maintenance Check</option> */}
                  <option value={InspectionType.QUALITY_VERIFICATION}>Quality Verification</option>
                </select>
                {errors.inspectionType && (
                  <p className="mt-1 text-sm text-red-600">{errors.inspectionType.message}</p>
                )}
              </div>

              {/* Scheduled Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
                  Scheduled Date & Time
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="datetime-local"
                    {...register('scheduledAt')}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                  />
                </div>
                {errors.scheduledAt && (
                  <p className="mt-1 text-sm text-red-600">{errors.scheduledAt.message}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    {...register('location')}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
                    placeholder="Enter inspection location"
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-slate-300">
                  Notes
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100"
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
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="inline-flex justify-center rounded-md border border-transparent bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
