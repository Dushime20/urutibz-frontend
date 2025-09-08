import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHandoverMessages } from '../../hooks/useHandoverMessages';
import handoverReturnService from '../../services/handoverReturnService';

const SessionMessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { type, id } = useParams<{ type: 'handover' | 'return'; id: string }>();

  const isHandover = type === 'handover';
  const currentUserId = useMemo(() => {
    try {
      const raw = localStorage.getItem('user') || localStorage.getItem('authUser');
      const u = raw ? JSON.parse(raw) : {};
      return u?.id || u?.userId || '';
    } catch { return ''; }
  }, []);
  const { messages, loading, error, refreshMessages } = useHandoverMessages(
    isHandover ? id : undefined,
    !isHandover ? id : undefined
  );
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'messages' | 'notifications'>('messages');
  const [stats, setStats] = useState<any | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    refreshMessages(isHandover ? id : undefined, !isHandover ? id : undefined);
    const loadNotifs = async () => {
      if (!id) return;
      setNotifLoading(true);
      setNotifError(null);
      try {
        const res = await handoverReturnService.getSessionNotifications({
          handoverSessionId: isHandover ? id : undefined,
          returnSessionId: !isHandover ? id : undefined,
          page: 1,
          limit: 50,
        });
        setNotifications(res.data || []);
      } catch (e: any) {
        setNotifError(e?.message || 'Failed to load notifications');
      } finally {
        setNotifLoading(false);
      }
    };
    loadNotifs();
    const loadStats = async () => {
      try {
        const res = await handoverReturnService.getHandoverReturnStats();
        setStats(res?.data || null);
      } catch (e: any) {
        setStatsError(e?.message || 'Failed to load stats');
      }
    };
    loadStats();
  }, [id, isHandover, refreshMessages]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-teal-50/30">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50" onClick={() => navigate(-1)}>Back</button>
            <div>
              <div className="text-sm text-gray-500">Session</div>
              <div className="text-base font-medium text-gray-900 capitalize">
                {isHandover ? 'handover' : 'return'}
                <span className="ml-2 text-xs text-gray-500 font-normal">#{id?.slice(0,8)}…</span>
              </div>
            </div>
          </div>
          <button className="px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700" onClick={() => refreshMessages(isHandover ? id : undefined, !isHandover ? id : undefined)}>Refresh</button>
        </div>

        {/* Tabs */}
        <div className="mb-4">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            {(['messages','notifications'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md text-sm ${activeTab===tab ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {tab === 'messages' ? 'Messages' : 'Notifications'}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Panel */}
        {activeTab === 'messages' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <span className="text-xs px-2 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">Live</span>
          </div>

          <div className="p-5">
            {loading && <div className="text-sm text-gray-500">Loading…</div>}
            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="space-y-4">
              {messages.length === 0 && !loading && (
                <div className="text-sm text-gray-500">No messages yet for this session.</div>
              )}

              {messages.map((m) => {
                const mine = m.senderId === currentUserId;
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm border ${mine ? 'bg-teal-600 text-white border-teal-700' : 'bg-gray-50 text-gray-900 border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs uppercase tracking-wide opacity-80">{m.messageType || 'text'}</div>
                        {m.senderType && (
                          <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full border ${mine ? 'bg-teal-700/40 text-white border-teal-500' : 'bg-white text-teal-700 border-teal-300'}`}>
                            {m.senderType}
                          </span>
                        )}
                      </div>
                      <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                      <div className={`mt-2 text-xs ${mine ? 'text-teal-100' : 'text-gray-500'}`}>{new Date(m.sentAt).toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        )}

        {/* Notifications Panel */}
        {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
          </div>
          <div className="p-5">
            {notifLoading && <div className="text-sm text-gray-500">Loading…</div>}
            {notifError && <div className="text-sm text-red-600">{notifError}</div>}
            <ul className="space-y-3">
              {notifications.length === 0 && !notifLoading && (
                <li className="text-sm text-gray-500">No notifications for this session.</li>
              )}
              {notifications.map((n) => (
                <li key={n.id} className="text-sm text-gray-800 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">{n.type}</span>
                      <span className="text-xs text-gray-500">{n.channel}</span>
                    </div>
                    <span className="text-xs text-gray-500">{new Date(n.scheduledAt).toLocaleString()}</span>
                  </div>
                  <div className="font-medium text-gray-900">{n.message || n.title}</div>
                  {n.priority && <div className="text-xs text-gray-500 mt-1">Priority: {n.priority}</div>}
                  {n.status && <div className="text-xs text-gray-500">Status: {n.status}</div>}
                </li>
              ))}
            </ul>
          </div>
        </div>
        )}

        {/* Stats Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Handover & Return Stats</h2>
          </div>
          <div className="p-5">
            {statsError && <div className="text-sm text-red-600 mb-2">{statsError}</div>}
            {stats ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-xs text-gray-500">Total Handovers</div>
                  <div className="text-xl font-semibold text-gray-900">{stats.totalHandovers}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-xs text-gray-500">Total Returns</div>
                  <div className="text-xl font-semibold text-gray-900">{stats.totalReturns}</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-xs text-gray-500">Handover Success</div>
                  <div className="text-xl font-semibold text-gray-900">{stats.handoverSuccessRate}%</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-xs text-gray-500">Return On-Time</div>
                  <div className="text-xl font-semibold text-gray-900">{stats.returnOnTimeRate}%</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-xs text-gray-500">Avg Handover Time</div>
                  <div className="text-xl font-semibold text-gray-900">{stats.averageHandoverTime} min</div>
                </div>
                <div className="rounded-lg border border-gray-200 p-4">
                  <div className="text-xs text-gray-500">Avg Return Processing</div>
                  <div className="text-xl font-semibold text-gray-900">{stats.averageReturnProcessingTime} min</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Loading stats…</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionMessagesPage;


