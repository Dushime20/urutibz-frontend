import React, { useState } from 'react';
import Button from '../ui/Button';
import axios from 'axios';

interface AddPaymentMethodProps {
  onSuccess: () => void;
}

const AddPaymentMethod: React.FC<AddPaymentMethodProps> = ({ onSuccess }) => {
  const [type, setType] = useState<'card' | 'mobile_money' | ''>('');
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setType(e.target.value as 'card' | 'mobile_money');
    setForm({});
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      let payload: any = { ...form, type, is_default: true, currency: 'RWF', metadata: { description: form.description || '' } };
      if (type === 'card') {
        payload = {
          ...payload,
          // provider: form.provider,
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
      const res=await axios.post('http://localhost:3000/api/v1/payment-methods', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res,'response')
      setError(null);
      setSuccess(true);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add payment method');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Add Payment Method</h2>
      <div className="mb-4">
        <label className="mr-4">
          <input type="radio" name="type" value="card" checked={type === 'card'} onChange={handleTypeChange} /> Card
        </label>
        <label>
          <input type="radio" name="type" value="mobile_money" checked={type === 'mobile_money'} onChange={handleTypeChange} /> Mobile Money
        </label>
      </div>
      {type && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'card' && (
            <>
              <div>
                <label className="block font-medium mb-1">Provider</label>
                <select name="provider" value={form.provider || ''} onChange={handleChange} required className="w-full border rounded p-2">
                  <option value="">Select</option>
                  <option value="visa">Visa</option>
                  <option value="mastercard">MasterCard</option>
                  <option value="amex">Amex</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Card Brand</label>
                <input name="card_brand" value={form.card_brand || ''} onChange={handleChange} required className="w-full border rounded p-2" placeholder="e.g. visa" />
              </div>
              <div>
                <label className="block font-medium mb-1">Last Four Digits</label>
                <input name="last_four" value={form.last_four || ''} onChange={handleChange} required maxLength={4} className="w-full border rounded p-2" placeholder="1234" />
              </div>
              <div className="flex gap-2">
                <div>
                  <label className="block font-medium mb-1">Exp Month</label>
                  <input name="exp_month" type="number" min={1} max={12} value={form.exp_month || ''} onChange={handleChange} required className="w-full border rounded p-2" placeholder="MM" />
                </div>
                <div>
                  <label className="block font-medium mb-1">Exp Year</label>
                  <input name="exp_year" type="number" min={2023} max={2100} value={form.exp_year || ''} onChange={handleChange} required className="w-full border rounded p-2" placeholder="YYYY" />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Description</label>
                <input name="description" value={form.description || ''} onChange={handleChange} className="w-full border rounded p-2" placeholder="e.g. My Visa card" />
              </div>
            </>
          )}
          {type === 'mobile_money' && (
            <>
              <div>
                <label className="block font-medium mb-1">Provider</label>
                <select name="provider" value={form.provider || ''} onChange={handleChange} required className="w-full border rounded p-2">
                  <option value="">Select</option>
                  <option value="mtn_momo">MTN MoMo</option>
                  <option value="airtel_money">Airtel Money</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Phone Number</label>
                <input name="phone_number" value={form.phone_number || ''} onChange={handleChange} required className="w-full border rounded p-2" placeholder="e.g. +250781234567" />
              </div>
              <div>
                <label className="block font-medium mb-1">Description</label>
                <input name="description" value={form.description || ''} onChange={handleChange} className="w-full border rounded p-2" placeholder="e.g. My MTN MoMo" />
              </div>
            </>
          )}
          {!success && error && <div className="text-red-600">{error}</div>}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Adding...' : 'Add Payment Method'}</Button>
        </form>
      )}
      {success && <div className="text-green-600 mt-4">Payment method added successfully!</div>}
    </div>
  );
};

export default AddPaymentMethod; 