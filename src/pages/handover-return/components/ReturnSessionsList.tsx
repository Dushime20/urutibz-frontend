import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Eye, ArrowRightLeft } from 'lucide-react';
import { useReturnSession } from '../../../hooks/useReturnSession';
import { useAuth } from '../../../contexts/AuthContext';
import { ReturnSession } from '../../../types/handoverReturn';

const ReturnSessionsList: React.FC = () => {
  const { user } = useAuth();
  const { sessions, meta, loading, error, getSessionsByUser } = useReturnSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    if (user?.id) {
      getSessionsByUser(user.id, currentPage, limit);
    }
  }, [user?.id, currentPage, limit, getSessionsByUser]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'in_progress':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading && sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Sessions</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Return Sessions</h2>
            <p className="text-sm text-gray-500 mt-1">
              {meta?.total || 0} total sessions
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Page {currentPage} of {meta?.pages || 1}
            </span>
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="divide-y divide-gray-200">
        {sessions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ArrowRightLeft className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Return Sessions Found</h3>
            <p className="text-gray-500">You don't have any return sessions yet.</p>
          </div>
        ) : (
          sessions.map((session: ReturnSession) => (
            <div key={session.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(session.status)}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        Return #{session.id.slice(0, 8)}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Booking: {session.bookingId.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {formatDate(session.scheduledDateTime)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 capitalize">
                        {session.returnType}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {session.estimatedDurationMinutes} min
                      </span>
                    </div>
                  </div>
                  
                  {session.location?.address && (
                    <div className="mt-2 text-sm text-gray-500">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      {session.location.address}
                    </div>
                  )}

                  {session.handoverSessionId && (
                    <div className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">Handover Session:</span> {session.handoverSessionId.slice(0, 8)}...
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                    {session.status.replace('_', ' ')}
                  </span>
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {session.returnCode && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Return Code:</span>
                    <span className="text-lg font-mono font-bold text-gray-900">
                      {session.returnCode}
                    </span>
                  </div>
                </div>
              )}

              {session.conditionComparison && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Condition Change:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      session.conditionComparison.overallConditionChange === 'same' 
                        ? 'bg-green-100 text-green-800'
                        : session.conditionComparison.overallConditionChange === 'improved'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {session.conditionComparison.overallConditionChange}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {meta && meta.pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, meta.total)} of {meta.total} results
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              
              <span className="px-3 py-1 text-sm text-gray-700">
                {currentPage} / {meta.pages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === meta.pages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnSessionsList;
