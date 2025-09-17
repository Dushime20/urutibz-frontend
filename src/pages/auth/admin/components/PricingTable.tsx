import React, { useState } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Eye, DollarSign, CheckCircle, XCircle, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '../../../../components/ui/DesignSystem';
import PricingService from '../service/pricingService';
import type { ProductPrice, PriceFilters } from '../types/pricing';

interface PricingTableProps {
  prices: ProductPrice[];
  pagination: any;
  isLoading: boolean;
  onEdit: (price: ProductPrice) => void;
  onDelete: (id: string) => void;
  onView: (price: ProductPrice) => void;
  onFiltersChange: (filters: PriceFilters) => void;
  onCreateNew: () => void;
}

const PricingTable: React.FC<PricingTableProps> = ({
  prices,
  pagination,
  isLoading,
  onEdit,
  onDelete,
  onView,
  onFiltersChange,
  onCreateNew,
}) => {
  const [filters, setFilters] = useState<PriceFilters>({
    product_id: '',
    country_id: '',
    currency: '',
    is_active: undefined,
    min_price: undefined,
    max_price: undefined,
    page: 1,
    limit: 20,
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  const [showFilters, setShowFilters] = useState(false);
  // const [selectedPrice, setSelectedPrice] = useState<ProductPrice | null>(null);

  const handleFilterChange = (field: keyof PriceFilters, value: any) => {
    const newFilters = { ...filters, [field]: value, page: 1 };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSort = (field: string) => {
    const newSortOrder: 'asc' | 'desc' =
      filters.sort_by === field && filters.sort_order === 'asc' ? 'desc' : 'asc';
    const newFilters: PriceFilters = { ...filters, sort_by: field, sort_order: newSortOrder, page: 1 } as PriceFilters;
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const formatPrice = (price: number, currency: string): string => {
    return PricingService.formatPrice(price, currency);
  };

  const getStatusBadge = (isActive: boolean) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isActive
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800'
    }`}>
      {isActive ? (
        <>
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </>
      ) : (
        <>
          <XCircle className="w-3 h-3 mr-1" />
          Inactive
        </>
      )}
    </span>
  );

  const SortIcon: React.FC<{ field: string }> = ({ field }) => {
    if (filters.sort_by !== field) {
      return <SortAsc className="w-4 h-4 text-gray-400" />;
    }
    return filters.sort_order === 'asc' ? (
      <SortAsc className="w-4 h-4 text-primary-600" />
    ) : (
      <SortDesc className="w-4 h-4 text-primary-600" />
    );
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'RWF', name: 'Rwandan Franc' },
    { code: 'KES', name: 'Kenyan Shilling' },
    { code: 'UGX', name: 'Ugandan Shilling' },
  ];

  // Map of country_id => readable name (populated from prices payload fallbacks)
  const countryNameById = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of prices) {
      const id = (p as any).country_id;
      const name = (p as any).country_name || (p as any).country || (p as any).countryCode || '';
      if (id && name && !map[id]) map[id] = String(name);
    }
    return map;
  }, [prices]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">Product Pricing</h3>
            <p className="text-gray-600 dark:text-slate-400">
              Manage pricing for all products across different countries
            </p>
          </div>
          <Button
            onClick={onCreateNew}
            className="flex items-center gap-2 py-1 px-2"
          >
            <Plus className="w-4 h-4" />
            Add Price
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by product ID or country ID..."
                value={filters.product_id || filters.country_id || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  handleFilterChange('product_id', value);
                  handleFilterChange('country_id', value);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Currency
                </label>
                <select
                  value={filters.currency || ''}
                  onChange={(e) => handleFilterChange('currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                >
                  <option value="">All Currencies</option>
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.is_active === undefined ? '' : filters.is_active.toString()}
                  onChange={(e) => handleFilterChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Min Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={filters.min_price || ''}
                  onChange={(e) => handleFilterChange('min_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Max Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={filters.max_price || ''}
                  onChange={(e) => handleFilterChange('max_price', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                  placeholder="1000.00"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('country_id')}
                  className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-100 transition-colors"
                >
                  Country
                  <SortIcon field="country_id" />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                Currency
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('price_per_day')}
                  className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-100 transition-colors"
                >
                  Daily Price
                  <SortIcon field="price_per_day" />
                </button>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                Weekly Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                Monthly Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                Deposit
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-slate-300">Loading prices...</span>
                  </div>
                </td>
              </tr>
            ) : prices.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="text-gray-500 dark:text-slate-400">
                    <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-slate-600" />
                    <p className="text-lg font-medium dark:text-slate-200">No prices found</p>
                    <p className="text-sm">Create your first product price to get started</p>
                  </div>
                </td>
              </tr>
            ) : (
              prices.map((price) => (
                <tr key={price.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-300">
                    {countryNameById[price.country_id] || (price as any).country_name || (price as any).name || price.country_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-300">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-my-primary/10 text-my-primary dark:bg-blue-900/30 dark:text-blue-300">
                      {price.currency}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-slate-100 font-medium">
                    {formatPrice(price.price_per_day, price.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-300">
                    {formatPrice(price.price_per_week, price.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-300">
                    {formatPrice(price.price_per_month, price.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-300">
                    {formatPrice(price.security_deposit, price.currency)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(price.is_active)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onView(price)}
                        className="p-1 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(price)}
                        className="p-1 text-gray-400 dark:text-slate-400 hover:text-my-primary transition-colors"
                        title="Edit price"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(price.id!)}
                        className="p-1 text-gray-400 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete price"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-slate-300">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                size="sm"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700 dark:text-slate-300">
                Page {pagination.page} of {pagination.total_pages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.total_pages}
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingTable; 