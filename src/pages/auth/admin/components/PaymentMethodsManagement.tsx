import React, { useEffect, useState } from 'react';
import { fetchPaymentMethods } from '../service';
import type { PaymentMethod } from '../interfaces';
import { Loader } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';

const PaymentMethodsManagement: React.FC = () => {
  const { tSync } = useTranslation();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    fetchPaymentMethods(token || undefined)
      .then(setMethods)
      .catch((err) => setError(err.message || 'Failed to fetch payment methods'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold mb-6"><TranslatedText text="Payment Methods" /></h3>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="animate-spin w-6 h-6 mr-2 text-my-primary" /> <TranslatedText text="Loading..." />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap"><TranslatedText text="Type" /></th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap"><TranslatedText text="Provider" /></th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap"><TranslatedText text="Phone/Card" /></th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap"><TranslatedText text="Currency" /></th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap"><TranslatedText text="Default" /></th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap"><TranslatedText text="Verified" /></th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 whitespace-nowrap"><TranslatedText text="Created At" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {methods.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">{m.type}</td>
                  <td className="py-3 px-4">{m.provider}</td>
                  <td className="py-3 px-4">{m.phone_number || m.last_four || '-'}</td>
                  <td className="py-3 px-4">{m.currency}</td>
                  <td className="py-3 px-4">{m.is_default ? 'Yes' : 'No'}</td>
                  <td className="py-3 px-4">{m.is_verified ? 'Yes' : 'No'}</td>
                  <td className="py-3 px-4">{new Date(m.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsManagement; 