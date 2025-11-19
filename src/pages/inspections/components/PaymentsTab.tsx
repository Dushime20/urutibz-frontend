import React from 'react';
import { DollarSign, Wallet, CreditCard, TrendingUp, Calendar, CheckCircle2, Clock, Loader2, Smartphone } from 'lucide-react';
import { formatCurrency } from '../../../lib/utils';
import { useTranslation } from '../../../hooks/useTranslation';
import { TranslatedText } from '../../../components/translated-text';

interface PaymentsTabProps {
  payments: any[];
  paymentsLoading: boolean;
  paymentsStats: {
    totalEarnings: number;
    pendingPayments: number;
    completedPayments: number;
    thisMonth: number;
  };
  formatDate: (date: string) => string;
  preferredCurrency: string;
}

const PaymentsTab: React.FC<PaymentsTabProps> = ({
  payments,
  paymentsLoading,
  paymentsStats,
  formatDate,
  preferredCurrency
}) => {
  const { tSync } = useTranslation();
  return (
    <div className="space-y-6">
      {/* Payment Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {formatCurrency(paymentsStats.totalEarnings, 'en-US', preferredCurrency || 'USD')}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium"><TranslatedText text="Total Earnings" /></div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {paymentsStats.completedPayments}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium"><TranslatedText text="Completed Payments" /></div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {paymentsStats.pendingPayments}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium"><TranslatedText text="Pending Payments" /></div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {formatCurrency(paymentsStats.thisMonth, 'en-US', preferredCurrency || 'USD')}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium"><TranslatedText text="This Month" /></div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            <TranslatedText text="Payment History" /> ({payments.length})
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            <TranslatedText text="All inspection fee payments made to you" />
          </p>
        </div>
        
        <div className="p-6">
          {paymentsLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-my-primary mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400"><TranslatedText text="Loading payments..." /></p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2"><TranslatedText text="No payments yet" /></h3>
              <p className="text-gray-500 dark:text-gray-400">
                <TranslatedText text="Payments will appear here once inspections are completed and paid" />
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                          <TranslatedText text="Inspection Fee Payment" />
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'completed' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : payment.status === 'pending'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        {payment.metadata?.inspection_id && (
                          <span><TranslatedText text="Inspection" />: {payment.metadata.inspection_id.substring(0, 8)}...</span>
                        )}
                        {payment.processed_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(payment.processed_at)}</span>
                          </div>
                        )}
                        {payment.provider && (
                          <span className="capitalize">{payment.provider.replace(/_/g, ' ')}</span>
                        )}
                      </div>
                      {/* Payment Method Details */}
                      {payment.paymentMethod && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            {payment.paymentMethod.type === 'card' ? (
                              <>
                                <CreditCard className="w-3 h-3" />
                                <span>
                                  {payment.paymentMethod.card_brand || <TranslatedText text="Card" />}
                                  {payment.paymentMethod.last_four && ` •••• ${payment.paymentMethod.last_four}`}
                                  {payment.paymentMethod.exp_month && payment.paymentMethod.exp_year && 
                                    ` • ${tSync('Expires')} ${payment.paymentMethod.exp_month}/${payment.paymentMethod.exp_year}`
                                  }
                                </span>
                              </>
                            ) : payment.paymentMethod.type === 'mobile_money' ? (
                              <>
                                <Smartphone className="w-3 h-3" />
                                <span>
                                  {payment.paymentMethod.provider ? 
                                    payment.paymentMethod.provider.replace(/_/g, ' ').toUpperCase() : 
                                    'Mobile Money'
                                  }
                                  {payment.paymentMethod.phone_number && 
                                    ` • ${payment.paymentMethod.phone_number}`
                                  }
                                </span>
                              </>
                            ) : (
                              <>
                                <CreditCard className="w-3 h-3" />
                                <span className="capitalize">
                                  {payment.paymentMethod.type?.replace(/_/g, ' ') || <TranslatedText text="Payment Method" />}
                                  {payment.paymentMethod.provider && 
                                    ` • ${payment.paymentMethod.provider.replace(/_/g, ' ')}`
                                  }
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(Number(payment.amount) || 0, 'en-US', payment.currency || preferredCurrency || 'USD')}
                    </div>
                    {payment.currency && payment.currency !== preferredCurrency && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {payment.currency}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsTab;

