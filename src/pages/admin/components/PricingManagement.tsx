import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Calculator, TrendingUp, Trash2, RefreshCw, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import { Button } from '../../../components/ui/DesignSystem';
import { useToast } from '../../../contexts/ToastContext';
import PricingTable from './PricingTable';
import ProductPricingForm from './ProductPricingForm';
import { usePricing } from '../hooks/usePricing';
import PricingService from '../service/pricingService';
import { fetchPricingStats, fetchCountries } from '../service/api';
import type { ProductPrice, CreateProductPriceRequest, UpdateProductPriceRequest, PriceFilters, RentalPriceCalculationRequest, RentalPriceCalculationResponse, PriceComparisonResponse } from '../types/pricing';

const PricingManagement: React.FC = () => {
  const { showToast } = useToast();
  const {
    prices,
    pagination,
    selectedPrice,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    fetchPrices,
    createPrice,
    updatePrice,
    deletePrice,
    selectPrice,
    clearError,
    refreshPrices,
  } = usePricing();

  // Local state
  const [activeView, setActiveView] = useState<'table' | 'form' | 'calculator' | 'stats' | 'rental-calc'>('table');
  const [isEditing, setIsEditing] = useState(false);
  const [pricingStats, setPricingStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [pricingStatsError, setPricingStatsError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Rental calculation state
  const [calculationForm, setCalculationForm] = useState<RentalPriceCalculationRequest>({
    product_id: '',
    country_id: '',
    currency: 'USD',
    rental_duration_hours: 24,
    quantity: 1
  });
  const [calculationResult, setCalculationResult] = useState<RentalPriceCalculationResponse | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const [availablePrices, setAvailablePrices] = useState<ProductPrice[]>([]);
  // Compare across countries state
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [compareResult, setCompareResult] = useState<PriceComparisonResponse | null>(null);
  const [countryNameById, setCountryNameById] = useState<Record<string, string>>({});

  // Fetch pricing statistics on component mount
  useEffect(() => {
    fetchPricingStatsData();
    // Preload countries for name mapping
    (async () => {
      try {
        const countries = await fetchCountries();
        const map: Record<string, string> = {};
        countries.forEach((c: any) => {
          if (c?.id) map[c.id] = c?.name || c?.country_name || c?.code || c?.id;
        });
        setCountryNameById(map);
      } catch {}
    })();
  }, []);

  const fetchPricingStatsData = async () => {
    setLoadingStats(true);
    setPricingStatsError(null);
    try {
      const token = localStorage.getItem('token');
      const result = await fetchPricingStats(token || undefined);
      if (result.error) {
        setPricingStatsError(result.error);
        setPricingStats(null);
      } else {
        setPricingStats(result.data);
        setPricingStatsError(null);
      }
    } catch (error: any) {
      console.error('Error fetching pricing stats:', error);
      setPricingStatsError('Failed to load pricing statistics');
      showToast('Failed to load pricing statistics', 'error');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleCreateNew = () => {
    selectPrice(null);
    setIsEditing(false);
    setActiveView('form');
  };

  const handleEdit = (price: ProductPrice) => {
    selectPrice(price);
    setIsEditing(true);
    setActiveView('form');
  };

  const handleView = (price: ProductPrice) => {
    selectPrice(price);
    // You could show a detailed view modal here
    showToast(`Viewing price for ${price.product_id}`, 'info');
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePrice(id);
      showToast('Price deleted successfully', 'success');
      setShowDeleteConfirm(null);
      await refreshPrices();
    } catch (error: any) {
      showToast('Failed to delete price', 'error');
    }
  };

  const handleSave = async (data: CreateProductPriceRequest | UpdateProductPriceRequest) => {
    try {
      if (isEditing) {
        await updatePrice(data as UpdateProductPriceRequest);
        showToast('Price updated successfully', 'success');
      } else {
        await createPrice(data as CreateProductPriceRequest);
        showToast('Price created successfully', 'success');
      }
      
      setActiveView('table');
      await refreshPrices();
      await fetchPricingStatsData();
    } catch (error: any) {
      showToast(isEditing ? 'Failed to update price' : 'Failed to create price', 'error');
    }
  };

  const handleFiltersChange = (filters: PriceFilters) => {
    fetchPrices(filters);
  };

  const handleCalculateRental = async () => {
    if (!calculationForm.product_id || !calculationForm.country_id) {
      setCalculationError('Product ID and Country ID are required');
      return;
    }

    setCalculating(true);
    setCalculationError(null);
    setCalculationResult(null);

    try {
      const token = localStorage.getItem('token');
      try {
        const { data } = await PricingService.getProductPricesByProductId(
          calculationForm.product_id,
          { page: 1, limit: 100 },
          token || undefined
        );
        setAvailablePrices(data);
        if (!data.some(p => p.country_id === calculationForm.country_id)) {
          const first = data.find(p => p.is_active);
          if (first) {
            setCalculationForm(prev => ({
              ...prev,
              country_id: first.country_id,
              currency: first.currency || prev.currency,
            }));
          }
        }
      } catch {}

      const result = await PricingService.calculateRentalPrice(calculationForm, token || undefined);
      
      if (result.error) {
        setCalculationError(result.error);
        setCalculationResult(null);
      } else {
        setCalculationResult(result.data);
        setCalculationError(null);
        showToast('Price calculation completed successfully!', 'success');
      }
    } catch (error: any) {
      setCalculationError('Failed to calculate rental price');
      console.error('Calculation error:', error);
    } finally {
      setCalculating(false);
    }
  };

  const handleComparePrices = async () => {
    if (!calculationForm.product_id) {
      setCompareError('Product ID is required');
      return;
    }
    setCompareLoading(true);
    setCompareError(null);
    setCompareResult(null);
    try {
      const token = localStorage.getItem('token');
      const result = await PricingService.comparePrices(
        calculationForm.product_id,
        { rental_duration_hours: calculationForm.rental_duration_hours, quantity: calculationForm.quantity },
        token || undefined
      );
      setCompareResult(result);
    } catch (err: any) {
      setCompareError(err?.message || 'Failed to compare prices');
    } finally {
      setCompareLoading(false);
    }
  };

  const renderStatsView = () => {
    if (pricingStatsError) {
      return (
        <div className="flex items-center justify-center h-32 text-red-500 bg-red-50 rounded-xl">
          <AlertCircle className="w-5 h-5 mr-2" />
          {pricingStatsError}
        </div>
      );
    }

    if (!pricingStats) {
      return (
        <div className="flex items-center justify-center h-32 text-gray-500">
          No pricing statistics available.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Price Records */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Price Records</p>
                <p className="text-2xl font-bold text-gray-900">{pricingStats.total_price_records}</p>
              </div>
                              <div className="p-3 rounded-full bg-my-primary/10">
                  <DollarSign className="w-6 h-6 text-my-primary" />
              </div>
            </div>
          </div>

          {/* Active Price Records */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Price Records</p>
                <p className="text-2xl font-bold text-gray-900">{pricingStats.active_price_records}</p>
              </div>
              <div className="p-3 rounded-full bg-green-50">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Countries with Pricing */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Countries with Pricing</p>
                <p className="text-2xl font-bold text-gray-900">{pricingStats.countries_with_pricing}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-50">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Currencies Supported */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Currencies Supported</p>
                <p className="text-2xl font-bold text-gray-900">{pricingStats.currencies_supported}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-50">
                <TrendingUp className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Price Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Price Range Distribution */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold mb-4">Price Range Distribution</h3>
            <div className="space-y-3">
              {Object.entries(pricingStats.price_distribution?.by_price_range || {}).map(([range, count]) => (
                <div key={range} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{range}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-my-primary h-2 rounded-full" 
                        style={{ width: `${(Number(count) / pricingStats.total_price_records) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{Number(count)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Currency Distribution */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-bold mb-4">Currency Distribution</h3>
            <div className="space-y-3">
              {Object.entries(pricingStats.price_distribution?.by_currency || {}).map(([currency, count]) => (
                <div key={currency} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{currency}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(Number(count) / pricingStats.total_price_records) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{Number(count)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Discount Analysis */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold mb-4">Discount Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-my-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-my-primary">{pricingStats.discount_analysis?.products_with_weekly_discount || 0}</div>
              <div className="text-sm text-gray-600">Weekly Discounts</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{pricingStats.discount_analysis?.products_with_monthly_discount || 0}</div>
              <div className="text-sm text-gray-600">Monthly Discounts</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{pricingStats.discount_analysis?.products_with_bulk_discount || 0}</div>
              <div className="text-sm text-gray-600">Bulk Discounts</div>
            </div>
          </div>
        </div>

        {/* Market Analysis */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold mb-4">Market Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-xl font-bold text-orange-600">{pricingStats.market_analysis?.auto_convert_adoption || 0}%</div>
              <div className="text-sm text-gray-600">Auto Convert Adoption</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-xl font-bold text-red-600">{pricingStats.market_analysis?.dynamic_pricing_adoption || 0}%</div>
              <div className="text-sm text-gray-600">Dynamic Pricing</div>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <div className="text-xl font-bold text-indigo-600">{pricingStats.market_analysis?.countries_with_premium_pricing || 0}</div>
              <div className="text-sm text-gray-600">Premium Countries</div>
            </div>
            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <div className="text-xl font-bold text-teal-600">{pricingStats.market_analysis?.countries_with_discount_pricing || 0}</div>
              <div className="text-sm text-gray-600">Discount Countries</div>
            </div>
          </div>
        </div>

        {/* Temporal Analysis */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold mb-4">Temporal Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-cyan-50 rounded-lg">
              <div className="text-xl font-bold text-cyan-600">{pricingStats.temporal_analysis?.recent_price_updates || 0}</div>
              <div className="text-sm text-gray-600">Recent Updates</div>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <div className="text-xl font-bold text-pink-600">{pricingStats.temporal_analysis?.upcoming_price_changes || 0}</div>
              <div className="text-sm text-gray-600">Upcoming Changes</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <div className="text-xl font-bold text-amber-600">{pricingStats.temporal_analysis?.expired_pricing || 0}</div>
              <div className="text-sm text-gray-600">Expired Pricing</div>
            </div>
            <div className="text-center p-4 bg-lime-50 rounded-lg">
              <div className="text-xl font-bold text-lime-600">{pricingStats.temporal_analysis?.average_pricing_duration_days || 0}</div>
              <div className="text-sm text-gray-600">Avg Duration (Days)</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pricing Management</h2>
          <p className="text-gray-600">Manage product pricing across all countries and currencies</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setActiveView('stats')}
            className={activeView === 'stats' ? 'bg-primary-50 border-primary-200' : ''}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Statistics
          </Button>
          <Button
            variant="outline"
            onClick={() => setActiveView('rental-calc')}
            className={activeView === 'rental-calc' ? 'bg-primary-50 border-primary-200' : ''}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Rental Calculator
          </Button>
          {activeView === 'stats' && (
            <Button
              variant="outline"
              onClick={fetchPricingStatsData}
              disabled={loadingStats}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} />
              Refresh Stats
            </Button>
          )}
          <Button
            onClick={handleCreateNew}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Price
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-700">{error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearError}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveView('table')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeView === 'table'
              ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Price Table
        </button>
        <button
          onClick={() => setActiveView('stats')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeView === 'stats'
              ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Statistics
        </button>
        <button
          onClick={() => setActiveView('rental-calc')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeView === 'rental-calc'
              ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Rental Calculator
        </button>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {activeView === 'table' && (
          <PricingTable
            prices={prices}
            pagination={pagination}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={(id) => setShowDeleteConfirm(id)}
            onView={handleView}
            onFiltersChange={handleFiltersChange}
            onCreateNew={handleCreateNew}
          />
        )}

        {activeView === 'form' && (
          <div className="max-w-4xl">
            <ProductPricingForm
              price={selectedPrice}
              onSave={handleSave}
              onCancel={() => setActiveView('table')}
              isLoading={isCreating || isUpdating}
            />
          </div>
        )}

        {activeView === 'rental-calc' && (
          <div className="max-w-4xl">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Rental Price Calculator</h3>
              
              {/* Calculation Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product ID
                  </label>
                  <input
                    type="text"
                    value={calculationForm.product_id}
                    onChange={(e) => setCalculationForm(prev => ({ ...prev, product_id: e.target.value }))}
                    placeholder="Enter product UUID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country ID
                  </label>
                  <input
                    type="text"
                    value={calculationForm.country_id}
                    onChange={(e) => setCalculationForm(prev => ({ ...prev, country_id: e.target.value }))}
                    placeholder="Enter country UUID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={calculationForm.currency}
                    onChange={(e) => setCalculationForm(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rental Duration (Hours)
                  </label>
                  <input
                    type="number"
                    value={calculationForm.rental_duration_hours}
                    onChange={(e) => setCalculationForm(prev => ({ ...prev, rental_duration_hours: parseInt(e.target.value) || 0 }))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={calculationForm.quantity}
                    onChange={(e) => setCalculationForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-my-primary focus:border-my-primary"
                  />
                </div>
              </div>
              
              {/* Calculate Button */}
              <div className="flex justify-center mb-6">
                <Button
                  onClick={handleCalculateRental}
                  disabled={calculating}
                  className="px-8 py-3 text-lg"
                >
                  {calculating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Calculating...
                    </>
                  ) : (
                    'Calculate Price'
                  )}
                </Button>
              </div>

              {/* Compare Across Countries */}
              <div className="bg-my-primary/10 border border-my-primary/20 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-my-primary font-semibold">Compare Across Countries</h4>
                    <p className="text-my-primary/80 text-sm">Use current duration and quantity to compare total prices in all countries with pricing.</p>
                  </div>
                  <Button onClick={handleComparePrices} disabled={compareLoading} variant="outline">
                    {compareLoading ? 'Comparing...' : 'Compare'}
                  </Button>
                </div>
              </div>

              {compareError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700">{compareError}</span>
                  </div>
                </div>
              )}

              {compareResult && (
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4">Country Price Comparison</h4>
                  <div className="text-sm text-gray-600 mb-4">
                    Base Duration: {compareResult.base_duration_hours} hours · Quantity: {compareResult.quantity}
                  </div>
                  <div className="space-y-3">
                    {compareResult.country_prices.map((cp) => (
                      <div key={cp.country_id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                        <div>
                          <div className="font-medium text-gray-900">{countryNameById[cp.country_id] || cp.country_name || cp.country_id}</div>
                          <div className="text-gray-600 text-sm">Currency: {cp.currency}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{cp.price_calculation.total_amount} {cp.price_calculation.currency}</div>
                          <div className="text-gray-600 text-sm">Base: {cp.price_calculation.base_rate} ({cp.price_calculation.base_rate_type})</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-700">Cheapest</div>
                      <div className="text-lg font-bold text-green-900">{compareResult.cheapest_country.total_amount} {compareResult.cheapest_country.currency}</div>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <div className="text-sm text-red-700">Most Expensive</div>
                      <div className="text-lg font-bold text-red-900">{compareResult.most_expensive_country.total_amount} {compareResult.most_expensive_country.currency}</div>
                    </div>
                                    <div className="p-4 bg-my-primary/10 rounded-lg">
                  <div className="text-sm text-my-primary">Average Price</div>
                  <div className="text-lg font-bold text-my-primary">{compareResult.average_price}</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Error Display */}
              {calculationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700">{calculationError}</span>
                  </div>
                </div>
              )}
              
              {/* Results Display */}
              {calculationResult && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h4 className="text-lg font-bold text-green-900 mb-4">Calculation Results</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold text-green-800 mb-2">Price Summary</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-green-700">Total Price:</span>
                          <span className="font-bold text-green-900">
                            {calculationResult.total_amount} {calculationResult.currency}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Base Amount:</span>
                          <span className="text-green-900">
                            {calculationResult.base_amount} {calculationResult.currency}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Duration:</span>
                          <span className="text-green-900">{calculationResult.rental_duration_hours} hours ({calculationResult.rental_duration_days} days)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Quantity:</span>
                          <span className="text-green-900">{calculationResult.quantity}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-semibold text-green-800 mb-2">Calculation Details</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-green-700">Base Rate:</span>
                          <span className="text-green-900">{calculationResult?.base_rate ?? '—'} {calculationResult?.currency ?? ''} ({calculationResult?.base_rate_type ?? '—'})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Base Amount:</span>
                          <span className="text-green-900">{calculationResult?.base_amount ?? '—'} {calculationResult?.currency ?? ''}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Subtotal:</span>
                          <span className="text-green-900">{calculationResult?.subtotal ?? '—'} {calculationResult?.currency ?? ''}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Security Deposit:</span>
                          <span className="text-green-900">{calculationResult?.security_deposit ?? '—'} {calculationResult?.currency ?? ''}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Total Amount:</span>
                          <span className="font-bold text-green-900">{calculationResult?.total_amount ?? '—'} {calculationResult?.currency ?? ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {Array.isArray(calculationResult?.discounts_applied) && calculationResult.discounts_applied.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-semibold text-green-800 mb-2">Applied Discounts</h5>
                      <div className="flex flex-wrap gap-2">
                        {calculationResult.discounts_applied.map((discount, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            {discount}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {Array.isArray(calculationResult?.notes) && calculationResult.notes.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-semibold text-green-800 mb-2">Notes</h5>
                      <ul className="list-disc pl-5 text-green-900 space-y-1">
                        {calculationResult.notes.map((n, i) => (
                          <li key={i}>{n}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'stats' && (
          loadingStats ? (
            <div className="flex items-center justify-center py-12">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-my-primary"></div>
              <span className="ml-3 text-gray-600">Loading statistics...</span>
            </div>
          ) : (
            renderStatsView()
          )
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Price</h3>
                <p className="text-gray-600">Are you sure you want to delete this price?</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone. The price will be permanently removed from the system.
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingManagement;