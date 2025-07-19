import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import axios from 'axios';

interface PaymentStepperProps {
  bookingId: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
}

const PaymentStepper: React.FC<PaymentStepperProps> = ({ bookingId, amount, currency, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<'card' | 'mobile_money' | ''>('');
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setError(null);
  }, [step]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setType(e.target.value as 'card' | 'mobile_money');
    setForm({});
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreatePaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Remove try/catch/finally for debugging
    const token = localStorage.getItem('token');
    let payload: any = { ...form, type, is_default: true, currency, metadata: { description: form.description || '' } };
    if (type === 'card') {
      payload = {
        ...payload,
        provider: form.provider,
        last_four: form.last_four,
        card_brand: form.card_brand,
        exp_month: Number(form.exp_month),
        exp_year: Number(form.exp_year),
      };
    } else if (type === 'mobile_money') {
      payload = {
        type: 'mobile_money',
        provider: form.provider,
        phone_number: form.phone_number,
        is_default: true,
        currency,
        metadata: { description: form.description || '' }
      };
    }
    const response = await axios.post('http://localhost:3000/api/v1/payment-methods', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(response, 'response');
    // Fetch updated payment methods
    const res = await axios.get('http://localhost:3000/api/v1/payment-methods', {
      headers: { Authorization: `Bearer ${token}` },
    });
    let methods = [];
    if (Array.isArray(res.data?.data?.data)) {
      methods = res.data.data.data;
    } else if (Array.isArray(res.data?.data)) {
      methods = res.data.data;
    } else if (res.data?.data && typeof res.data.data === 'object') {
      methods = [res.data.data];
    } else if (Array.isArray(res.data)) {
      methods = res.data;
    } else if (res.data && typeof res.data === 'object') {
      methods = [res.data];
    } else {
      methods = [];
    }
    setPaymentMethods(methods);
    const newMethod = methods.length > 0 ? methods[methods.length - 1] : null;
    setSelectedMethod(newMethod);
    setError(null);
    setStep(3);
    setLoading(false);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!selectedMethod?.id) {
        console.error('No payment_method_id found in selectedMethod:', selectedMethod);
        setError('No payment method selected. Please try again.');
        setLoading(false);
        return;
      }
      const paymentPayload = {
        booking_id: bookingId,
        payment_method_id: selectedMethod.id,
        amount: amount,
        currency: currency,
        transaction_type: 'booking_payment',
        metadata: {
          description: `Payment for booking #${bookingId}`,
        },
      };
      console.log('Sending transaction payload:', paymentPayload);
      const response = await axios.post('http://localhost:3000/api/v1/payment-transactions/process', paymentPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Transaction response:', response);
      setSuccess(true);
      onSuccess();
    } catch (err: any) {
      console.error('Transaction error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to process payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Payment</h2>
      <div className="mb-6 flex items-center justify-between">
        <div className={`font-bold ${step === 1 ? 'text-primary-600' : 'text-gray-400'}`}>1. Choose Type</div>
        <div className={`font-bold ${step === 2 ? 'text-primary-600' : 'text-gray-400'}`}>2. Enter Details</div>
        <div className={`font-bold ${step === 3 ? 'text-primary-600' : 'text-gray-400'}`}>3. Confirm</div>
      </div>
      {step === 1 && (
        <div className="mb-4">
          <label className="mr-4">
            <input type="radio" name="type" value="card" checked={type === 'card'} onChange={handleTypeChange} /> Card
          </label>
          <label>
            <input type="radio" name="type" value="mobile_money" checked={type === 'mobile_money'} onChange={handleTypeChange} /> Mobile Money
          </label>
          <div className="mt-6">
            <Button type="button" className="w-full" disabled={!type} onClick={() => setStep(2)}>
              Next
            </Button>
          </div>
        </div>
      )}
      {step === 2 && (
        <form onSubmit={handleCreatePaymentMethod} className="space-y-4">
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
          <div className="flex gap-2">
            <Button type="button" className="w-1/2" onClick={() => setStep(1)} disabled={loading}>Back</Button>
            <Button type="submit" className="w-1/2" disabled={loading}>{loading ? 'Adding...' : 'Add & Continue'}</Button>
          </div>
        </form>
      )}
      {step === 3 && (
        (() => {
          console.log('step:', step, 'selectedMethod:', selectedMethod);
          if (!selectedMethod) {
            return <div className="text-red-600">No payment method selected. Please try again.</div>;
          }
          return (
            <div>
              <h3 className="font-semibold mb-2">Confirm Payment Method</h3>
              <div className="p-4 border rounded mb-4">
                {selectedMethod.type === 'card' ? (
                  <>
                    <div><b>Card:</b> {selectedMethod.card_brand?.toUpperCase()} •••• {selectedMethod.last_four}</div>
                    <div><b>Exp:</b> {selectedMethod.exp_month}/{selectedMethod.exp_year}</div>
                    <div><b>Description:</b> {selectedMethod.metadata?.description}</div>
                  </>
                ) : (
                  <>
                    <div><b>Provider:</b> {selectedMethod.provider?.replace(/_/g, ' ').toUpperCase()}</div>
                    <div><b>Phone:</b> {selectedMethod.phone_number}</div>
                    <div><b>Description:</b> {selectedMethod.metadata?.description}</div>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" className="w-1/2" onClick={() => setStep(2)} disabled={loading}>Back</Button>
                <Button type="button" className="w-1/2" onClick={handleConfirm} disabled={loading}>{loading ? 'Processing...' : 'Confirm & Pay'}</Button>
              </div>
              {error && <div className="text-red-600 mt-2">{error}</div>}
            </div>
          );
        })()
      )}
      {success && (
        <div className="text-green-600 mt-4 font-bold">Payment successful!</div>
      )}
    </div>
  );
};

export default PaymentStepper; 