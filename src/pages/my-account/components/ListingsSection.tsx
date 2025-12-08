import React, { useState, useMemo } from 'react';
import SkeletonMyListings from '../../../components/ui/SkeletonMyListings';
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';
import RemoveFromMarketModal from './RemoveFromMarketModal';
import { Filter, Package } from 'lucide-react';

interface Props {
  loading: boolean;
  myListings: any[];
  productImages: { [k: string]: any[] };
  onRequestInspection: (productId?: string) => void;
  onAddListing: () => void;
  onOpenListing: (id: string) => void;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  setSelectedProductId: (id: string | null) => void;
  setShowProductDetail: (open: boolean) => void;
  setEditProductId: (id: string | null) => void;
  setShowEditModal: (open: boolean) => void;
  onRefreshListings?: () => void;
}

const ListingsSection: React.FC<Props> = ({
  loading,
  myListings,
  productImages,
  onRequestInspection,
  onAddListing,
  onOpenListing,
  openMenuId,
  setOpenMenuId,
  setSelectedProductId,
  setShowProductDetail,
  setEditProductId,
  setShowEditModal,
  onRefreshListings,
}) => {
  const { tSync } = useTranslation();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedProductForRemove, setSelectedProductForRemove] = useState<{ id: string; title: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'inactive' | 'pending'>('all');

  // Filter listings by status
  const filteredListings = useMemo(() => {
    if (statusFilter === 'all') return myListings;
    return myListings.filter(listing => {
      const status = (listing.status || '').toLowerCase();
      switch (statusFilter) {
        case 'active':
          return status === 'active';
        case 'draft':
          return status === 'draft' || !status;
        case 'inactive':
          return status === 'inactive' || status === 'removed' || status === 'suspended';
        case 'pending':
          return status === 'pending' || status === 'review' || status === 'under_review';
        default:
          return true;
      }
    });
  }, [myListings, statusFilter]);

  // Calculate counts for each status
  const counts = useMemo(() => {
    const all = myListings.length;
    const active = myListings.filter(l => (l.status || '').toLowerCase() === 'active').length;
    const draft = myListings.filter(l => {
      const s = (l.status || '').toLowerCase();
      return s === 'draft' || !s;
    }).length;
    const inactive = myListings.filter(l => {
      const s = (l.status || '').toLowerCase();
      return s === 'inactive' || s === 'removed' || s === 'suspended';
    }).length;
    const pending = myListings.filter(l => {
      const s = (l.status || '').toLowerCase();
      return s === 'pending' || s === 'review' || s === 'under_review';
    }).length;
    return { all, active, draft, inactive, pending };
  }, [myListings]);

  if (loading) {
    return <SkeletonMyListings />;
  }

  if (myListings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-300 mb-6 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <div className="text-2xl font-bold text-gray-400 mb-2 dark:text-slate-300"><TranslatedText text="No listings yet" /></div>
        <div className="text-gray-500 mb-6 dark:text-slate-400"><TranslatedText text="You haven't created any product listings. Click below to get started!" /></div>
        <button onClick={onAddListing} className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors"><TranslatedText text="Add New Listing" /></button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 dark:bg-slate-900 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <Package className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              <TranslatedText text="My Listings" />
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              <TranslatedText text="Manage your product listings" />
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button 
              onClick={() => onRequestInspection()} 
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
            >
              <TranslatedText text="Request Inspection" />
            </button>
            <button 
              onClick={onAddListing} 
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
            >
              <TranslatedText text="Add New Listing" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 dark:bg-slate-900 dark:border-slate-700">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <TranslatedText text="All" /> ({counts.all})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'active'
                ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <TranslatedText text="Active" /> ({counts.active})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              statusFilter === 'draft'
                ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <TranslatedText text="Draft" /> ({counts.draft})
          </button>
          {counts.pending > 0 && (
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === 'pending'
                  ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <TranslatedText text="Pending" /> ({counts.pending})
            </button>
          )}
          {counts.inactive > 0 && (
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                statusFilter === 'inactive'
                  ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <TranslatedText text="Inactive" /> ({counts.inactive})
            </button>
          )}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 dark:bg-slate-900 dark:border-slate-700">
        {filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Package className="w-16 h-16 text-gray-300 mb-4 dark:text-slate-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">
              <TranslatedText text="No listings found" />
            </h3>
            <p className="text-gray-500 dark:text-slate-400 mb-6 text-center">
              {statusFilter === 'all' ? (
                <TranslatedText text="You don't have any listings yet." />
              ) : statusFilter === 'active' ? (
                <TranslatedText text="You don't have any active listings." />
              ) : statusFilter === 'draft' ? (
                <TranslatedText text="You don't have any draft listings." />
              ) : statusFilter === 'pending' ? (
                <TranslatedText text="You don't have any pending listings." />
              ) : (
                <TranslatedText text="You don't have any inactive listings." />
              )}
            </p>
            {statusFilter === 'all' && (
              <button 
                onClick={onAddListing} 
                className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
              >
                <TranslatedText text="Add New Listing" />
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="group relative bg-white rounded-3xl p-3 sm:p-4 border border-gray-100 cursor-pointer dark:bg-slate-900 dark:border-slate-700"
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('.more-menu')) return;
                  onOpenListing(listing.id);
                }}
              >
                {productImages[listing.id] && productImages[listing.id][0] ? (
                  <img src={productImages[listing.id][0].image_url} alt={productImages[listing.id][0].alt_text || listing.title} className="w-full h-40 sm:h-44 rounded-2xl object-cover mb-3" />
                ) : (
                  <div className="w-full h-44 rounded-2xl bg-gray-100 flex items-center justify-center mb-3 text-gray-400 dark:bg-slate-800 dark:text-slate-500"><TranslatedText text="No Image" /></div>
                )}
                <h4 className="font-semibold text-gray-900 mb-2 dark:text-slate-100 truncate">{listing.title}</h4>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-slate-100">{(listing.base_price_per_day != null && listing.base_currency) ? `${listing.base_price_per_day}/${listing.base_currency}` : <TranslatedText text="No price" />}</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium ${listing.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : listing.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>{listing.status || 'Draft'}</span>
                </div>
                <p className="text-sm text-gray-500 mb-4 dark:text-slate-400 truncate">{listing.bookings ? `${listing.bookings} ${tSync('bookings this month')}` : ''}</p>
                <div className='flex justify-between items-center'>
                  <p className="text-xs text-gray-500 dark:text-slate-400"><TranslatedText text="status" />: {listing.status || <TranslatedText text="Draft" />}</p>
                  <div className="relative inline-block text-left more-menu">
                    <button onClick={() => setOpenMenuId(openMenuId === listing.id ? null : listing.id)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">⋮</button>
                    {openMenuId === listing.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50 dark:bg-slate-900 dark:border-slate-700">
                        <button onClick={() => { setSelectedProductId(listing.id); setShowProductDetail(true); setOpenMenuId(null); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800"><TranslatedText text="View" /></button>
                        <button onClick={() => { setEditProductId(listing.id); setShowEditModal(true); setOpenMenuId(null); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800"><TranslatedText text="Edit" /></button>
                        <button onClick={() => { onRequestInspection(listing.id); setOpenMenuId(null); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800"><TranslatedText text="Request Inspection" /></button>
                        <button onClick={() => { setSelectedProductForRemove({ id: listing.id, title: listing.title || listing.name || '' }); setShowRemoveModal(true); setOpenMenuId(null); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800 text-orange-600 dark:text-orange-400"><TranslatedText text="Remove from Market" /></button>
                        <button onClick={() => { setOpenMenuId(null); }} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-red-900/20"><TranslatedText text="Delete" /></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
          ))}
          </div>
        )}
      </div>

      {/* Remove from Market Modal */}
      {selectedProductForRemove && (
        <RemoveFromMarketModal
          isOpen={showRemoveModal}
          onClose={() => {
            setShowRemoveModal(false);
            setSelectedProductForRemove(null);
          }}
          productId={selectedProductForRemove.id}
          productTitle={selectedProductForRemove.title}
          onSuccess={() => {
            onRefreshListings?.();
          }}
        />
      )}
    </div>
  );
};

export default ListingsSection;


