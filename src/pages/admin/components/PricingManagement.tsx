import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Calculator,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  BarChart3,
  Filter,
  Search,
  Download,
  Upload,
} from 'lucide-react';
import { Button } from '../../../components/ui/DesignSystem';
import { useToast } from '../../../contexts/ToastContext';
import PricingTable from './PricingTable';
import ProductPricingForm from './ProductPricingForm';
import RentalCalculator from './RentalCalculator';
import { usePricing } from '../hooks/usePricing';
import { usePriceCalculation } from '../hooks/usePriceCalculation';
import PricingService, {
  ProductPrice,
  CreateProductPriceRequest,
  UpdateProductPriceRequest,
  PricingStats,
  PriceFilters,
} from '../service/pricingService';

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
  const [activeView, setActiveView] = useState<'table' | 'form' | 'calculator' | 'stats'>('table');
  const [isEditing, setIsEditing] = useState(false);
  const [pricingStats, setPricingStats] = useState<PricingStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Fetch pricing statistics on component mount
  useEffect(() => {
    fetchPricingStats();
  }, []);

  const fetchPricingStats = async () => {
    setLoadingStats(true);
    try {
      const token = localStorage.getItem('token');
      const stats = await PricingService.getPricingStats(token || undefined);
      setPricingStats(stats);
    } catch (error: any) {
      console.error('Error fetching pricing stats:', error);
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
      await fetchPricingStats();
    } catch (error: any) {
      showToast(isEditing ? 'Failed to update price' : 'Failed to create price', 'error');
    }
  };

  const handleFiltersChange = (filters: PriceFilters) => {
    fetchPrices(filters);
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    color: string;
  }> = ({ title, value, icon: Icon, change, trend = 'neutral', color }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <div className={`flex items-center text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'up' && <TrendingUp className="w-4 h-4 mr-1" />}
            {change}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{title}</div>
      </div>
    </div>
  );

  const renderStatsView = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Prices"
          value={pricingStats?.total_prices || 0}
          icon={DollarSign}
          color="bg-primary-500"
        />
        <StatCard
          title="Active Prices"
          value={pricingStats?.active_prices || 0}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Avg Daily Rate"
          value={pricingStats?.average_daily_rate ? `$${pricingStats.average_daily_rate.toFixed(2)}` : '$0.00'}
          icon={BarChart3}
          color="bg-blue-500"
        />
        <StatCard
          title="Top Currency"
          value={pricingStats?.top_currencies?.[0]?.currency || 'N/A'}
          icon={TrendingUp}
          color="bg-purple-500"
        />
      </div>

      {/* Price Distribution */}
      {pricingStats?.price_distribution && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Price Distribution</h3>
          <div className="space-y-3">
            {pricingStats.price_distribution.map((range, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{range.range}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: `${range.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {range.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Changes */}
      {pricingStats?.recent_changes && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Changes</h3>
          <div className="space-y-3">
            {pricingStats.recent_changes.slice(0, 5).map((change) => (
              <div key={change.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    change.change_type === 'created' ? 'bg-green-500' :
                    change.change_type === 'updated' ? 'bg-blue-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {change.product_id}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({change.country_id})
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                    change.change_type === 'created' ? 'bg-green-100 text-green-700' :
                    change.change_type === 'updated' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {change.change_type}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(change.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

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
            onClick={() => setActiveView('calculator')}
            className={activeView === 'calculator' ? 'bg-primary-50 border-primary-200' : ''}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Calculator
          </Button>
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
          onClick={() => setActiveView('calculator')}
          className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeView === 'calculator'
              ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          Calculator
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

        {activeView === 'calculator' && (
          <div className="max-w-4xl">
            <RentalCalculator
              onCalculate={(calculation) => {
                showToast('Price calculation completed', 'success');
                console.log('Calculation result:', calculation);
              }}
            />
          </div>
        )}

        {activeView === 'stats' && (
          loadingStats ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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
                variant="destructive"
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