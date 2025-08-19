import React, { useState, useEffect } from 'react';
import {
  Save,
  X,
  DollarSign,
  Percent,
  Settings,
  Calendar,
  Shield,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Info,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { Button } from '../../../components/ui/DesignSystem';
import PricingService from '../service/pricingService';
import type { ProductPrice, CreateProductPriceRequest, UpdateProductPriceRequest } from '../types/pricing';

interface ProductPricingFormProps {
  price?: ProductPrice | null;
  onSave: (data: CreateProductPriceRequest | UpdateProductPriceRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ProductPricingForm: React.FC<ProductPricingFormProps> = ({
  price,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const isEditing = !!price?.id;
  
  const [formData, setFormData] = useState<CreateProductPriceRequest>({
    product_id: '',
    country_id: '',
    currency: 'USD',
    price_per_hour: 0,
    price_per_day: 0,
    price_per_week: 0,
    price_per_month: 0,
    security_deposit: 0,
    market_adjustment_factor: 1.0,
    weekly_discount_percentage: 0.1,
    monthly_discount_percentage: 0.2,
    bulk_discount_threshold: 3,
    bulk_discount_percentage: 0.15,
    dynamic_pricing_enabled: false,
    peak_season_multiplier: 1.25,
    off_season_multiplier: 0.85,
    is_active: true,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Initialize form with existing data when editing
  useEffect(() => {
    if (price) {
      setFormData({
        product_id: price.product_id,
        country_id: price.country_id,
        currency: price.currency,
        price_per_hour: price.price_per_hour,
        price_per_day: price.price_per_day,
        price_per_week: price.price_per_week,
        price_per_month: price.price_per_month,
        security_deposit: price.security_deposit,
        market_adjustment_factor: price.market_adjustment_factor,
        weekly_discount_percentage: price.weekly_discount_percentage,
        monthly_discount_percentage: price.monthly_discount_percentage,
        bulk_discount_threshold: price.bulk_discount_threshold,
        bulk_discount_percentage: price.bulk_discount_percentage,
        dynamic_pricing_enabled: price.dynamic_pricing_enabled,
        peak_season_multiplier: price.peak_season_multiplier,
        off_season_multiplier: price.off_season_multiplier,
        is_active: price.is_active,
      });
    }
  }, [price]);

  const handleInputChange = (field: keyof CreateProductPriceRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = (): boolean => {
    const validationErrors = PricingService.validatePriceData(formData);
    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing) {
        await onSave({ id: price!.id!, ...formData });
      } else {
        await onSave(formData);
      }
    } catch (error) {
      console.error('Error saving price:', error);
    }
  };

  const handleAutoCalculate = () => {
    // Auto-calculate weekly and monthly prices based on daily price
    const dailyPrice = formData.price_per_day;
    const weeklyPrice = dailyPrice * 7 * (1 - formData.weekly_discount_percentage);
    const monthlyPrice = dailyPrice * 30 * (1 - formData.monthly_discount_percentage);
    
    setFormData(prev => ({
      ...prev,
      price_per_week: Math.round(weeklyPrice * 100) / 100,
      price_per_month: Math.round(monthlyPrice * 100) / 100,
    }));
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'RWF', name: 'Rwandan Franc' },
    { code: 'KES', name: 'Kenyan Shilling' },
    { code: 'UGX', name: 'Ugandan Shilling' },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Product Price' : 'Create Product Price'}
          </h3>
          <p className="text-gray-600">
            {isEditing ? 'Update the pricing information' : 'Set up pricing for a product'}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h4 className="font-semibold text-red-900">Please fix the following errors:</h4>
          </div>
          <ul className="list-disc list-inside text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product ID *
            </label>
            <input
              type="text"
              value={formData.product_id}
              onChange={(e) => handleInputChange('product_id', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter product ID"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country ID *
            </label>
            <input
              type="text"
              value={formData.country_id}
              onChange={(e) => handleInputChange('country_id', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter country ID"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency *
            </label>
            <select
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary-600" />
            Pricing Information
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Hour
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price_per_hour}
                onChange={(e) => handleInputChange('price_per_hour', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Day *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price_per_day}
                onChange={(e) => handleInputChange('price_per_day', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Week
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price_per_week}
                onChange={(e) => handleInputChange('price_per_week', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Month
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price_per_month}
                onChange={(e) => handleInputChange('price_per_month', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleAutoCalculate}
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Auto-calculate Weekly/Monthly
            </Button>
          </div>
        </div>

        {/* Security Deposit */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-600" />
            Security Deposit
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Deposit Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.security_deposit}
                onChange={(e) => handleInputChange('security_deposit', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Market Adjustment Factor
              </label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                value={formData.market_adjustment_factor}
                onChange={(e) => handleInputChange('market_adjustment_factor', parseFloat(e.target.value) || 1.0)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="1.0"
              />
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="border-t border-gray-200 pt-6">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Advanced Settings</span>
            {showAdvanced ? (
              <TrendingDown className="w-4 h-4" />
            ) : (
              <TrendingUp className="w-4 h-4" />
            )}
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-6">
              {/* Discounts */}
              <div>
                <h5 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-primary-600" />
                  Discount Settings
                </h5>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weekly Discount (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.weekly_discount_percentage * 100}
                      onChange={(e) => handleInputChange('weekly_discount_percentage', (parseFloat(e.target.value) || 0) / 100)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Discount (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.monthly_discount_percentage * 100}
                      onChange={(e) => handleInputChange('monthly_discount_percentage', (parseFloat(e.target.value) || 0) / 100)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bulk Discount (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.bulk_discount_percentage * 100}
                      onChange={(e) => handleInputChange('bulk_discount_percentage', (parseFloat(e.target.value) || 0) / 100)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="15"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bulk Discount Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.bulk_discount_threshold}
                    onChange={(e) => handleInputChange('bulk_discount_threshold', parseInt(e.target.value) || 3)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="3"
                  />
                </div>
              </div>

              {/* Dynamic Pricing */}
              <div>
                <h5 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary-600" />
                  Dynamic Pricing
                </h5>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.dynamic_pricing_enabled}
                      onChange={(e) => handleInputChange('dynamic_pricing_enabled', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Enable dynamic pricing</span>
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Peak Season Multiplier
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        value={formData.peak_season_multiplier}
                        onChange={(e) => handleInputChange('peak_season_multiplier', parseFloat(e.target.value) || 1.25)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="1.25"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Off Season Multiplier
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        value={formData.off_season_multiplier}
                        onChange={(e) => handleInputChange('off_season_multiplier', parseFloat(e.target.value) || 0.85)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="0.85"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Update Price' : 'Create Price'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductPricingForm; 