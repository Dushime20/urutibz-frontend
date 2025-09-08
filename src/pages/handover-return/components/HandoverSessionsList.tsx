import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, CheckCircle, XCircle, AlertCircle, Eye, Package, ArrowRightLeft, Edit } from 'lucide-react';
import { useHandoverSession } from '../../../hooks/useHandoverSession';
import { useReturnSession } from '../../../hooks/useReturnSession';
import { useAuth } from '../../../contexts/AuthContext';
import { HandoverSession, ReturnSession } from '../../../types/handoverReturn';
import SessionDetailModal from './SessionDetailModal';

const HandoverSessionsList: React.FC = () => {
  const { user } = useAuth();
  const { sessions: handoverSessions, meta: handoverMeta, loading: handoverLoading, error: handoverError, getSessionsByUser: getHandoverSessions } = useHandoverSession();
  const { sessions: returnSessions, meta: returnMeta, loading: returnLoading, error: returnError, getSessionsByUser: getReturnSessions } = useReturnSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [activeTab, setActiveTab] = useState<'all' | 'handover' | 'return'>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [selectedSessionType, setSelectedSessionType] = useState<'handover' | 'return'>('handover');

  useEffect(() => {
    if (user?.id) {
      getHandoverSessions(user.id, currentPage, limit);
      getReturnSessions(user.id, currentPage, limit);
    }
  }, [user?.id, currentPage, limit, getHandoverSessions, getReturnSessions]);

  // Combine sessions for "all" view
  const allSessions = [
    ...handoverSessions.map(session => ({ ...session, type: 'handover' as const })),
    ...returnSessions.map(session => ({ ...session, type: 'return' as const }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const loading = handoverLoading || returnLoading;
  const error = handoverError || returnError;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'in_progress':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-teal-500" />;
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
        return 'bg-teal-100 text-teal-800';
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

  const handleViewSession = (sessionId: string, sessionType: 'handover' | 'return') => {
    setSelectedSessionId(sessionId);
    setSelectedSessionType(sessionType);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedSessionId('');
  };

  const getCurrentSessions = () => {
    switch (activeTab) {
      case 'handover':
        return handoverSessions.map(session => ({ ...session, type: 'handover' as const }));
      case 'return':
        return returnSessions.map(session => ({ ...session, type: 'return' as const }));
      default:
        return allSessions;
    }
  };

  const getCurrentMeta = () => {
    switch (activeTab) {
      case 'handover':
        return handoverMeta;
      case 'return':
        return returnMeta;
      default:
        return { total: allSessions.length, pages: 1 };
    }
  };

  const currentSessions = getCurrentSessions();
  const currentMeta = getCurrentMeta();

  if (loading && currentSessions.length === 0) {
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">My Sessions</h2>
            <p className="text-sm text-gray-500 mt-1">
              {currentMeta?.total || 0} total sessions
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              Page {currentPage} of {currentMeta?.pages || 1}
            </span>
          </div>
        </div>

        {/* Session Type Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'all', label: 'All Sessions', icon: Calendar },
            { id: 'handover', label: 'Handover', icon: Package },
            { id: 'return', label: 'Return', icon: ArrowRightLeft }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sessions List */}
      <div className="divide-y divide-gray-200">
        {currentSessions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Found</h3>
            <p className="text-gray-500">You don't have any {activeTab === 'all' ? '' : activeTab} sessions yet.</p>
          </div>
        ) : (
          currentSessions.map((session: any) => (
            <div key={session.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getStatusIcon(session.status)}
                    <div className="flex items-center space-x-2">
                      {session.type === 'handover' ? (
                        <Package className="w-4 h-4 text-teal-500" />
                      ) : (
                        <ArrowRightLeft className="w-4 h-4 text-teal-500" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {session.type === 'handover' ? 'Handover' : 'Return'} #{session.id.slice(0, 8)}
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
                        {session.type === 'handover' ? session.handoverType : session.returnType}
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
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                    {session.status.replace('_', ' ')}
                  </span>
                  
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleViewSession(session.id, session.type)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleViewSession(session.id, session.type)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit Session"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {(session.handoverCode || session.returnCode) && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {session.type === 'handover' ? 'Handover' : 'Return'} Code:
                    </span>
                    <span className="text-lg font-mono font-bold text-gray-900">
                      {session.type === 'handover' ? session.handoverCode : session.returnCode}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {currentMeta && currentMeta.pages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, currentMeta.total)} of {currentMeta.total} results
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
                {currentPage} / {currentMeta.pages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === currentMeta.pages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Detail Modal */}
      <SessionDetailModal
        isOpen={showDetailModal}
        onClose={handleCloseModal}
        sessionId={selectedSessionId}
        sessionType={selectedSessionType}
      />
    </div>
  );
};

export default HandoverSessionsList;
