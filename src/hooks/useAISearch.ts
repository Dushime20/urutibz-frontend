import { useState } from 'react';
import axios from '../lib/http';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface AISearchResult {
  filters: {
    search?: string;
    category_id?: string;
    min_price?: number;
    max_price?: number;
    condition?: string;
    location?: string;
  };
  products: any[];
  total: number;
}

export const useAISearch = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchWithAI = async (prompt: string): Promise<AISearchResult | null> => {
    if (!prompt || prompt.length < 3) return null;

    setIsSearching(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/products`, {
        params: { prompt }
      });

      return {
        filters: response.data.filters || {},
        products: response.data.data || [],
        total: response.data.total || 0
      };
    } catch (err: any) {
      setError(err.message || 'Search failed');
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  return { searchWithAI, isSearching, error };
};
