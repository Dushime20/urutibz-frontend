import React from 'react';
import SkeletonMyListings from '../../../components/ui/SkeletonMyListings';

interface Props {
  loading: boolean;
  myListings: any[];
  productImages: { [k: string]: any[] };
  onRequestInspection: () => void;
  onAddListing: () => void;
  onOpenListing: (id: string) => void;
  openMenuId: string | null;
  setOpenMenuId: (id: string | null) => void;
  setSelectedProductId: (id: string | null) => void;
  setShowProductDetail: (open: boolean) => void;
  setEditProductId: (id: string | null) => void;
  setShowEditModal: (open: boolean) => void;
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
}) => {
  if (loading) {
    return <SkeletonMyListings />;
  }

  if (myListings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-300 mb-6 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <div className="text-2xl font-bold text-gray-400 mb-2 dark:text-slate-300">No listings yet</div>
        <div className="text-gray-500 mb-6 dark:text-slate-400">You haven't created any product listings. Click below to get started!</div>
        <button onClick={onAddListing} className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors">Add New Listing</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:bg-slate-900 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 hidden sm:block">My Listings</h3>
        <div className="flex gap-2 flex-wrap">
          <button onClick={onRequestInspection} className="bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700 rounded text-sm">Request Inspection</button>
          <button onClick={onAddListing} className="bg-teal-600 text-white px-3 py-2 rounded text-sm">Add New Listing</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myListings.map((listing) => (
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
              <div className="w-full h-44 rounded-2xl bg-gray-100 flex items-center justify-center mb-3 text-gray-400 dark:bg-slate-800 dark:text-slate-500">No Image</div>
            )}
            <h4 className="font-semibold text-gray-900 mb-2 dark:text-slate-100 truncate">{listing.title}</h4>
            <div className="flex justify-between items-center mb-2">
              <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-slate-100">{(listing.base_price_per_day != null && listing.base_currency) ? `${listing.base_price_per_day}/${listing.base_currency}` : 'No price'}</span>
              <span className={`px-3 py-1 rounded-lg text-xs font-medium ${listing.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{listing.status || 'Draft'}</span>
            </div>
            <p className="text-sm text-gray-500 mb-4 dark:text-slate-400 truncate">{listing.bookings ? `${listing.bookings} bookings this month` : ''}</p>
            <div className='flex justify-between items-center'>
              <p>status: {listing.status || 'Draft'}</p>
              <div className="relative inline-block text-left more-menu">
                <button onClick={() => setOpenMenuId(openMenuId === listing.id ? null : listing.id)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">⋮</button>
                {openMenuId === listing.id && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-50 dark:bg-slate-900 dark:border-slate-700">
                    <button onClick={() => { setSelectedProductId(listing.id); setShowProductDetail(true); setOpenMenuId(null); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800">View</button>
                    <button onClick={() => { setEditProductId(listing.id); setShowEditModal(true); setOpenMenuId(null); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-800">Edit</button>
                    <button onClick={() => { setOpenMenuId(null); }} className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-red-900/20">Delete</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListingsSection;


