import React, { useState } from 'react';
import { CreditCard, Smartphone, Check, AlertCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { addPaymentMethod } from '../service/api';

interface AddPaymentMethodProps {
  onSuccess: () => void;
}

const AddPaymentMethod: React.FC<AddPaymentMethodProps> = ({ onSuccess }) => {
  const [type, setType] = useState<'card' | 'mobile_money' | ''>('');
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleTypeChange = (selectedType: 'card' | 'mobile_money') => {
    setType(selectedType);
    setForm({});
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError(null); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      let payload: any = { 
        ...form, 
        type, 
        is_default: true, 
        currency: 'RWF', 
        metadata: { description: form.description || '' } 
      };
      
      if (type === 'card') {
        payload = {
          ...payload,
          last_four: form.last_four,
          card_brand: form.card_brand,
          exp_month: Number(form.exp_month),
          exp_year: Number(form.exp_year),
        };
      } else if (type === 'mobile_money') {
        payload = {
          ...payload,
          provider: form.provider,
          phone_number: form.phone_number,
        };
      }
      
      await addPaymentMethod(payload, token || '');
      setError(null);
      setSuccess(true);
      setTimeout(() => onSuccess(), 1500); // Show success message briefly
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Method Added!</h2>
          <p className="text-gray-600">Your payment method has been successfully added and is ready to use.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Payment Method</h2>
        <p className="text-gray-600">Choose your preferred payment option</p>
      </div>

      {/* Payment Type Selection */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-4">Payment Type</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleTypeChange('card')}
            className={`p-4 border-2 rounded-xl transition-all duration-200 flex flex-col items-center gap-2 ${
              type === 'card'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <CreditCard className="w-6 h-6" />
            <span className="font-medium text-sm">Credit Card</span>
          </button>
          
          <button
            type="button"
            onClick={() => handleTypeChange('mobile_money')}
            className={`p-4 border-2 rounded-xl transition-all duration-200 flex flex-col items-center gap-2 ${
              type === 'mobile_money'
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-600'
            }`}
          >
            <Smartphone className="w-6 h-6" />
            <span className="font-medium text-sm">Mobile Money</span>
          </button>
        </div>
      </div>

      {/* Payment Form */}
      {type && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {type === 'card' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Card Provider</label>
                <select 
                  name="provider" 
                  value={form.provider || ''} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200"
                >
                  <option value="">Select Provider</option>
                  <option value="visa">Visa</option>
                  <option value="mastercard">MasterCard</option>
                  <option value="amex">American Express</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Card Brand</label>
                <input 
                  name="card_brand" 
                  value={form.card_brand || ''} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200" 
                  placeholder="e.g. visa" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Four Digits</label>
                <input 
                  name="last_four" 
                  value={form.last_four || ''} 
                  onChange={handleChange} 
                  required 
                  maxLength={4} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200" 
                  placeholder="1234" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Exp Month</label>
                  <input 
                    name="exp_month" 
                    type="number" 
                    min={1} 
                    max={12} 
                    value={form.exp_month || ''} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200" 
                    placeholder="MM" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Exp Year</label>
                  <input 
                    name="exp_year" 
                    type="number" 
                    min={2023} 
                    max={2100} 
                    value={form.exp_year || ''} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200" 
                    placeholder="YYYY" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                <input 
                  name="description" 
                  value={form.description || ''} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200" 
                  placeholder="e.g. My Visa card" 
                />
              </div>
            </>
          )}

          {type === 'mobile_money' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Money Provider</label>
                <select 
                  name="provider" 
                  value={form.provider || ''} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200"
                >
                  <option value="">Select Provider</option>
                  <option value="mtn_momo">MTN Mobile Money</option>
                  <option value="airtel_money">Airtel Money</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input 
                  name="phone_number" 
                  value={form.phone_number || ''} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200" 
                  placeholder="e.g. +250781234567" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description (Optional)</label>
                <input 
                  name="description" 
                  value={form.description || ''} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200" 
                  placeholder="e.g. My MTN MoMo" 
                />
              </div>
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
            loading={loading}
            aria-label="Add Payment Method"
          >
            {loading ? 'Adding Payment Method...' : 'Add Payment Method'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default AddPaymentMethod; 