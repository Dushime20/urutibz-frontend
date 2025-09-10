import React, { useEffect, useState } from 'react';
import { X, Smartphone, Monitor, Globe, Calendar, MapPin } from 'lucide-react';
import { fetchLoginHistory } from '../service/api';

interface LoginSession {
  id: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
}

interface LoginHistoryData {
  sessions: LoginSession[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  token: string;
}

const LoginHistoryModal: React.FC<Props> = ({ isOpen, onClose, token }) => {
  const [data, setData] = useState<LoginHistoryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, currentPage]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchLoginHistory(token, currentPage, 10);
      console.log('Login history response:', response); // Debug log
      if (response.success) {
        setData(response.data);
        console.log('Pagination data:', response.data.pagination); // Debug log
      } else {
        setError(response.message || 'Failed to fetch login history');
      }
    } catch (err) {
      console.error('Error fetching login history:', err); // Debug log
      setError('Failed to fetch login history');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return <Smartphone className="w-4 h-4" />;
    }
    return <Monitor className="w-4 h-4" />;
  };

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const isCurrentSession = (session: LoginSession) => {
    // Check if this session is still active (not expired)
    return new Date(session.expiresAt) > new Date();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Login History</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">View your recent login sessions</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-my-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 bg-my-primary text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : data?.sessions ? (
            <div className="space-y-4">
              {data.sessions.map((session) => (
                <div
                  key={session.id}
                  className={`border rounded-xl p-4 ${
                    isCurrentSession(session)
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                        {getDeviceIcon(session.userAgent)}
                        <span className="text-sm font-medium">{getBrowserInfo(session.userAgent)}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                          <span className="text-sm text-gray-600 dark:text-slate-400">
                            IP: {session.ipAddress}
                          </span>
                          {isCurrentSession(session) && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
                              Current Session
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(session.createdAt)}</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-400 dark:text-slate-500">
                          Expires: {formatDate(session.expiresAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-slate-400">No login history found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {data?.pagination && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-slate-700 flex-shrink-0 bg-white dark:bg-slate-900">
            <div className="text-sm text-gray-500 dark:text-slate-400">
              Page {data.pagination.page} of {data.pagination.totalPages} ({data.pagination.total} total sessions)
              {data.pagination.hasNext && <span className="ml-2 text-green-500">• Has Next</span>}
              {data.pagination.hasPrev && <span className="ml-2 text-blue-500">• Has Prev</span>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  console.log('Previous clicked, current page:', currentPage);
                  setCurrentPage(prev => Math.max(1, prev - 1));
                }}
                disabled={!data.pagination.hasPrev || loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-white bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  console.log('Next clicked, current page:', currentPage, 'hasNext:', data.pagination.hasNext);
                  setCurrentPage(prev => prev + 1);
                }}
                disabled={!data.pagination.hasNext || loading}
                className="px-4 py-2 text-sm font-medium text-white bg-my-primary hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginHistoryModal;
