/**
 * Smart Search Utility
 * Parses natural language queries into structured search filters.
 */

// Simple Category interface to avoid circular dependencies
interface SearchCategory {
  id: string;
  name: string;
}

interface ParsedSearch {
  q: string;
  filters: {
    minPrice?: number;
    maxPrice?: number;
    category?: string;
    condition?: string;
    sort?: string;
  };
}

export const parseSearchQuery = (query: string, categories: SearchCategory[] = []): ParsedSearch => {
  let searchTerms = query.toLowerCase();
  const filters: ParsedSearch['filters'] = {};

  // 1. Extract Price Ranges
  // Pattern: "under 500", "below $500", "< 500", "max 500"
  const maxPriceMatch = searchTerms.match(/(?:under|below|<|max)\s?\$?(\d+)/i);
  if (maxPriceMatch) {
    filters.maxPrice = parseInt(maxPriceMatch[1]);
    searchTerms = searchTerms.replace(maxPriceMatch[0], '');
  }

  // Pattern: "over 100", "above $100", "> 100", "min 100"
  const minPriceMatch = searchTerms.match(/(?:over|above|>|min)\s?\$?(\d+)/i);
  if (minPriceMatch) {
    filters.minPrice = parseInt(minPriceMatch[1]);
    searchTerms = searchTerms.replace(minPriceMatch[0], '');
  }

  // Pattern: "100-500", "$100 to $500"
  const rangePriceMatch = searchTerms.match(/\$?(\d+)\s?(?:-|to)\s?\$?(\d+)/i);
  if (rangePriceMatch) {
    filters.minPrice = parseInt(rangePriceMatch[1]);
    filters.maxPrice = parseInt(rangePriceMatch[2]);
    searchTerms = searchTerms.replace(rangePriceMatch[0], '');
  }

  // 2. Match Categories
  let matchedCategory: SearchCategory | null = null;
  let maxLen = 0;

  for (const cat of categories) {
    const catName = cat.name.toLowerCase();
    // Use word boundary to avoid partial matches
    const regex = new RegExp(`\\b${catName}\\b`, 'i');
    if (regex.test(searchTerms)) {
      if (catName.length > maxLen) {
        matchedCategory = cat;
        maxLen = catName.length;
      }
    }
  }

  if (matchedCategory) {
    filters.category = matchedCategory.id;
    // Remove the category name from search terms
    const regex = new RegExp(`\\b${matchedCategory.name.toLowerCase()}\\b`, 'i');
    searchTerms = searchTerms.replace(regex, '');
  } else {
    // Fallback static mappings
    const categoryMappings: Record<string, string> = {
      'laptop': 'electronics', // Approximate IDs, will rely on actual DB category IDs usually
      'phone': 'electronics',
      'car': 'vehicles',
      'house': 'real_estate'
    };
    // We can't map to IDs if we don't know them, so we skip static mapping 
    // unless we want to try to match names in the passed categories list again.
    // Ideally, the passed `categories` list covers everything.
  }

  // 3. Extract Condition
  const conditions = ['new', 'like new', 'good', 'fair', 'poor', 'used', 'refurbished', 'second hand'];
  for (const cond of conditions) {
    const regex = new RegExp(`\\b${cond}\\b`, 'i');
    if (regex.test(searchTerms)) {
      if (cond === 'used' || cond === 'second hand') {
        filters.condition = 'good';
      } else if (cond === 'refurbished') {
        filters.condition = 'like_new';
      } else {
        const mapped = cond.replace(' ', '_');
        if (['new', 'like_new', 'good', 'fair', 'poor'].includes(mapped)) {
          filters.condition = mapped;
        }
      }
      searchTerms = searchTerms.replace(regex, '');
      break;
    }
  }

  // 4. Sort Intent
  if (/\b(cheap|lowest price|budget)\b/i.test(query)) { // Check original query for intent
     filters.sort = 'price_asc';
  } else if (/\b(expensive|highest price|luxury|premium)\b/i.test(query)) {
     filters.sort = 'price_desc';
  } else if (/\b(newest|latest|recent)\b/i.test(query)) {
     filters.sort = 'newest';
  }

  // 5. Cleanup
  searchTerms = searchTerms
    .replace(/\b(i want|i need|looking for|find me|buy|cheap|expensive|budget|sort by)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    q: searchTerms,
    filters
  };
};
