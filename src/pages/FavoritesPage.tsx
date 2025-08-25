import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { getUserFavorites, removeUserFavorite, fetchProductImages } from './admin/service/api';

// Utility to normalize possible image shapes
function extractImageUrl(img: unknown): string | null {
  if (typeof img === 'string' && img.trim() !== '') return img;
  if (img && typeof img === 'object') {
    const possible = ['url', 'image_url', 'path'] as const;
    for (const key of possible) {
      const value = (img as Record<string, unknown>)[key];
      if (typeof value === 'string' && value.trim() !== '') return value;
    }
  }
  return null;
}

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [imagesByProductId, setImagesByProductId] = useState<Record<string, string[]>>({});
  const token = useMemo(() => localStorage.getItem('token') || undefined, []);

  useEffect(() => {
    let isMounted = true;
    async function loadFavorites() {
      if (!token) { setLoading(false); return; }
      try {
        const data = await getUserFavorites(token);
        if (!isMounted) return;
        setFavorites(Array.isArray(data) ? data : []);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadFavorites();
    return () => { isMounted = false; };
  }, [token]);

  // Load images for favorited products
  useEffect(() => {
    let isMounted = true;
    async function loadImages() {
      const map: Record<string, string[]> = {};
      await Promise.all(
        favorites.map(async (fav) => {
          const product = fav?.product || fav; // API returns nested product; fallback to flat
          const productId = product?.id || fav?.product_id;
          if (!productId) return;
          try {
            // Prefer product.images if present
            const imgs: string[] = [];
            if (Array.isArray(product?.images) && product.images.length) {
              product.images.forEach((i: unknown) => {
                const u = extractImageUrl(i);
                if (u) imgs.push(u);
              });
            }
            if (!imgs.length) {
              const fetched = await fetchProductImages(productId, token);
              if (Array.isArray(fetched)) {
                fetched.forEach((i: unknown) => {
                  const u = extractImageUrl(i);
                  if (u) imgs.push(u);
                });
              } else {
                const u = extractImageUrl(fetched);
                if (u) imgs.push(u);
              }
            }
            map[productId] = imgs.length ? imgs : ['/assets/img/placeholder-image1.png'];
          } catch {
            map[productId] = ['/assets/img/placeholder-image1.png'];
          }
        })
      );
      if (isMounted) setImagesByProductId(map);
    }
    if (favorites.length) loadImages();
    return () => { isMounted = false; };
  }, [favorites, token]);

  async function handleUnfavorite(productId: string) {
    if (!token) return;
    const prev = favorites.slice();
    // optimistic remove
    setFavorites(prev.filter((f) => (f?.product?.id || f?.product_id || f?.id) !== productId));
    try {
      await removeUserFavorite(productId, token);
    } catch {
      // revert on failure
      setFavorites(prev);
    }
  }

  if (!token) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-xl font-semibold mb-2">Favorites</h1>
        <p className="text-gray-600">Please log in to view your favorites.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-xl font-semibold mb-6">Favorites</h1>
        <p className="text-gray-600">Loading your favorites...</p>
      </div>
    );
  }

  return (
    <div className="max-w-9xl mx-auto px-8 sm:px-10 lg:px-12 xl:px-16 2xl:px-20 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-semibold">Your Favorites</h1>
        <span className="text-sm text-gray-600">{favorites.length} item(s)</span>
      </div>

      {favorites.length === 0 ? (
        <div className="text-gray-600">No favorites yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {favorites.map((fav) => {
            const product = fav?.product || fav;
            const productId = product?.id || fav?.product_id;
            if (!productId) return null;
            const image = imagesByProductId[productId]?.[0] || '/assets/img/placeholder-image1.png';
            return (
              <div key={productId} className="group bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <img
                    src={image}
                    alt={product?.title || product?.name || 'Favorite'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/placeholder-image1.png'; }}
                  />
                  <button
                    type="button"
                    aria-label="Remove from favorites"
                    className="absolute top-3 right-3 w-8 h-8 bg-black/20 hover:bg-black/40 rounded-full flex items-center justify-center transition-colors"
                    onClick={() => handleUnfavorite(productId)}
                  >
                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                  </button>
                </div>

                <div className="p-3 space-y-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-gray-900 text-sm leading-tight flex-1 pr-2">
                      <Link to={`/it/${productId}`} className="hover:underline">
                        {product?.title || product?.name || 'Untitled'}
                      </Link>
                    </h3>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <Star className="w-3 h-3 fill-current text-gray-900" />
                      <span className="text-sm text-gray-900">{product?.average_rating || '4.8'}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">{product?.description || ''}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;


