import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Calendar,
  DollarSign,
  Clock,
  Shield,
  TrendingUp,
  TrendingDown,
  Percent,
  Info,
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../../components/ui/DesignSystem';
import { usePriceCalculation } from '../hooks/usePriceCalculation';
import PricingService from '../service/pricingService';

interface RentalCalculatorProps {
  onCalculate?: (calculation: any) => void;
}

const RentalCalculator: React.FC<RentalCalculatorProps> = ({ onCalculate }) => {
  const {
    calculation,
    formData,
    isCalculating,
    error,
    calculatePrice,
    updateFormData,
    resetCalculation,
    clearError,
    formatPrice,
    calculateDuration,
    calculateDurationHours,
  } = usePriceCalculation();

  const [showBreakdown, setShowBreakdown] = useState(false);

  // Auto-calculate when form data changes
  useEffect(() => {
    if (formData.product_id && formData.country_id && formData.start_date && formData.end_date) {
      const timer = setTimeout(() => {
        calculatePrice();
      }, 500); // Debounce calculation

      return () => clearTimeout(timer);
    }
  }, [formData.product_id, formData.country_id, formData.start_date, formData.end_date, formData.quantity]);

  const handleInputChange = (field: string, value: any) => {
    updateFormData({ [field]: value });
  };

  const handleDateChange = (field: 'start_date' | 'end_date', value: string) => {
    updateFormData({ [field]: value });
    
    // Auto-adjust end date if start date is after end date
    if (field === 'start_date' && value > formData.end_date) {
      const startDate = new Date(value);
      const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // Add 1 day
      updateFormData({ end_date: endDate.toISOString().split('T')[0] });
    }
  };

  const getDurationText = () => {
    if (!formData.start_date || !formData.end_date) return '';
    
    const days = calculateDuration(formData.start_date, formData.end_date);
    const hours = calculateDurationHours(formData.start_date, formData.end_date);
    
    if (days === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (days === 1) {
      return '1 day';
    } else {
      return `${days} days`;
    }
  };

  const getDiscountPercentage = () => {
    if (!calculation) return 0;
    
    const totalDiscount = calculation.breakdown.duration_discount + calculation.breakdown.bulk_discount;
    return totalDiscount > 0 ? ((totalDiscount / calculation.base_price) * 100) : 0;
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-primary-600" />
            Rental Calculator
          </h3>
          <p className="text-gray-600">
            Calculate rental prices with real-time updates
          </p>
        </div>
        <Button
          variant="outline"
          onClick={resetCalculation}
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleDateChange('start_date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => handleDateChange('end_date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="flex items-center justify-center">
              <div className="text-sm text-gray-600">
                Duration: <span className="font-medium">{getDurationText()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.include_deposit}
                onChange={(e) => handleInputChange('include_deposit', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Include security deposit</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.apply_discounts}
                onChange={(e) => handleInputChange('apply_discounts', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Apply discounts</span>
            </label>
          </div>
        </div>

        {/* Calculation Results */}
        <div className="space-y-6">
          {isCalculating ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600">Calculating...</span>
            </div>
          ) : calculation ? (
            <>
              {/* Total Price */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-900">
                    {formatPrice(calculation.final_price, calculation.currency)}
                  </div>
                  <div className="text-sm text-primary-700 mt-1">Total Price</div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Base Price:</span>
                  <span className="font-medium">{formatPrice(calculation.base_price, calculation.currency)}</span>
                </div>

                {calculation.breakdown.duration_discount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Duration Discount:</span>
                    <span>-{formatPrice(calculation.breakdown.duration_discount, calculation.currency)}</span>
                  </div>
                )}

                {calculation.breakdown.bulk_discount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Bulk Discount:</span>
                    <span>-{formatPrice(calculation.breakdown.bulk_discount, calculation.currency)}</span>
                  </div>
                )}

                {calculation.breakdown.seasonal_adjustment !== 0 && (
                  <div className={`flex items-center justify-between ${
                    calculation.breakdown.seasonal_adjustment > 0 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    <span>Seasonal Adjustment:</span>
                    <span>
                      {calculation.breakdown.seasonal_adjustment > 0 ? '+' : ''}
                      {formatPrice(calculation.breakdown.seasonal_adjustment, calculation.currency)}
                    </span>
                  </div>
                )}

                {formData.include_deposit && calculation.security_deposit > 0 && (
                  <div className="flex items-center justify-between text-my-primary">
                    <span>Security Deposit:</span>
                    <span>+{formatPrice(calculation.security_deposit, calculation.currency)}</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between font-semibold text-lg">
                    <span>Final Total:</span>
                    <span>{formatPrice(calculation.final_price, calculation.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div>
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Info className="w-4 h-4" />
                  <span className="text-sm font-medium">Show detailed breakdown</span>
                  {showBreakdown ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                </button>

                {showBreakdown && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Hourly Rate:</span>
                        <div className="font-medium">{formatPrice(calculation.breakdown.hourly_rate, calculation.currency)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Daily Rate:</span>
                        <div className="font-medium">{formatPrice(calculation.breakdown.daily_rate, calculation.currency)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Weekly Rate:</span>
                        <div className="font-medium">{formatPrice(calculation.breakdown.weekly_rate, calculation.currency)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Monthly Rate:</span>
                        <div className="font-medium">{formatPrice(calculation.breakdown.monthly_rate, calculation.currency)}</div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        Duration: {calculation.duration_days} days ({calculation.duration_hours} hours)
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Discount: {getDiscountPercentage().toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Calculator className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Enter details to calculate price</p>
              <p className="text-sm">Fill in the product ID, country ID, and dates to see the calculation</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {calculation && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={resetCalculation}
            >
              Clear
            </Button>
            <Button
              onClick={() => onCalculate?.(calculation)}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Use This Price
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalCalculator; 