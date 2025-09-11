import React, { useEffect, useState } from 'react';
import { fetchPaymentMethods } from '../service';
import type { PaymentMethod } from '../interfaces';
import { Loader } from 'lucide-react';

const PaymentMethodsManagement: React.FC = () => {
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
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">Payment Methods</h3>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader className="animate-spin w-6 h-6 mr-2 text-my-primary" /> <span className="text-gray-600 dark:text-gray-300">Loading...</span>
        </div>
      ) : error ? (
        <div className="text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-center py-4">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Type</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Provider</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Phone/Card</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Currency</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Default</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Verified</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {methods.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{m.type}</td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100">{m.provider}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{m.phone_number || m.last_four || '-'}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{m.currency}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{m.is_default ? 'Yes' : 'No'}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{m.is_verified ? 'Yes' : 'No'}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{new Date(m.created_at).toLocaleDateString()}</td>
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