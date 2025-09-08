import React, { useEffect, useState } from 'react';
import { useHandoverMessages } from '../../../hooks/useHandoverMessages';
import { useToast } from '../../../contexts/ToastContext';
import handoverReturnService from '../../../services/handoverReturnService';
import { useNavigate } from 'react-router-dom';

interface Props {
  userId?: string;
}

const HandoverReturnAccountSection: React.FC<Props> = ({ userId }) => {
  const { showToast } = useToast();
  // Prefer stored user object, fallback to JWT
  const derivedUserId = React.useMemo(() => {
    if (userId) return userId;
    try {
      const rawUser = localStorage.getItem('user') || localStorage.getItem('authUser');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        if (u && typeof u === 'object') {
          return u.id || u.userId || '';
        }
      }
    } catch {}
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) return '';
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      return payload.sub || payload.userId || payload.id || '';
    } catch {
      return '';
    }
  }, [userId]);
  const [handoverSessionId, setHandoverSessionId] = useState<string>('');
  const [returnSessionId, setReturnSessionId] = useState<string>('');
  const [linkingSessions, setLinkingSessions] = useState<boolean>(false);
  const [handoverSessionsForBooking, setHandoverSessionsForBooking] = useState<any[]>([]);
  const [returnSessionsForBooking, setReturnSessionsForBooking] = useState<any[]>([]);
  const [showComposer, setShowComposer] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [senderType, setSenderType] = useState<'renter' | 'owner'>('renter');
  const [scheduledAt, setScheduledAt] = useState('');
  const [channel, setChannel] = useState<'email' | 'sms' | 'push'>('email');
  const [note, setNote] = useState('');
  const [activeTab, setActiveTab] = useState<'handover' | 'return'>('handover');
  const [composeSessionId, setComposeSessionId] = useState<string>('');
  const [scheduleSessionId, setScheduleSessionId] = useState<string>('');
  const [scheduleMessage, setScheduleMessage] = useState<string>('');
  const [stats, setStats] = useState<any | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  const { refreshMessages } = useHandoverMessages(
    handoverSessionId || undefined,
    returnSessionId || undefined
  );
  const navigate = useNavigate();

  // Load all sessions for user
  useEffect(() => {
    const linkSessions = async () => {
      const effectiveUserId = derivedUserId || userId;
      if (!effectiveUserId) return;
      setLinkingSessions(true);
      try {
        const [handoverRes, returnRes] = await Promise.all([
          handoverReturnService.getHandoverSessionsByUser(effectiveUserId, 1, 100),
          handoverReturnService.getReturnSessionsByUser(effectiveUserId, 1, 100)
        ]);

        const allHandover = handoverRes.data || [];
        const allReturn = returnRes.data || [];
        setHandoverSessionsForBooking(allHandover);
        setReturnSessionsForBooking(allReturn);
        // Default select newest one
        const newestH = [...allHandover].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())[0];
        if (newestH) {
          setHandoverSessionId(newestH.id);
          setReturnSessionId('');
        } else if (allReturn[0]) {
          const newestR = [...allReturn].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())[0];
          setReturnSessionId(newestR?.id || '');
        }
        await refreshMessages();
      } catch (err: any) {
        showToast(err?.message || 'Failed to load sessions', 'error');
      } finally {
        setLinkingSessions(false);
      }
    };

    linkSessions();
  }, [derivedUserId, userId, refreshMessages, showToast]);

  // Load overall handover/return stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await handoverReturnService.getHandoverReturnStats();
        setStats(res?.data || null);
      } catch (e: any) {
        setStatsError(e?.message || 'Failed to load stats');
      }
    };
    loadStats();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Handover & Return</h3>
            <p className="text-sm text-gray-500">View conversation for a session.</p>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              onClick={() => setShowComposer(true)}
              disabled={!handoverSessionId && !returnSessionId}
            >
              New Message
            </button>
            <button
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => setShowScheduler(true)}
              disabled={!handoverSessionId && !returnSessionId}
            >
              Schedule Notification
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Session & Messages</h4>
          <div className="space-y-3">
            {/* Tabs */}
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg w-max">
              {(['handover','return'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-md text-sm ${activeTab === tab ? 'bg-white text-teal-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  {tab === 'handover' ? 'Handover messages' : 'Return messages'}
                </button>
              ))}
            </div>

            {/* All sessions list - click to load conversation */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">Your Sessions</label>
              <div className="max-h-56 overflow-auto border border-gray-200 rounded-md divide-y">
                {(activeTab === 'handover'
                  ? handoverSessionsForBooking.map((s: any) => ({ ...s, _type: 'handover' as const }))
                  : returnSessionsForBooking.map((s: any) => ({ ...s, _type: 'return' as const }))
                )
                  .sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
                  .map((s: any) => (
                    <button
                      key={s.id}
                      onClick={async () => {
                        if (s._type === 'handover') { navigate(`/my-account/messages/handover/${s.id}`); }
                        else { navigate(`/my-account/messages/return/${s.id}`); }
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                        (handoverSessionId === s.id && s._type === 'handover') || (returnSessionId === s.id && s._type === 'return')
                          ? 'bg-teal-50'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-900">
                          {s._type === 'handover' ? 'Handover' : 'Return'} • {s.status}
                        </div>
                        <div className="text-xs text-gray-500">{new Date(s.updatedAt || s.createdAt).toLocaleString()}</div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {activeTab === 'handover' ? (
                <div className="col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Handover Session</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    value={handoverSessionId}
                    onChange={async (e) => { const id=e.target.value; setHandoverSessionId(id); setReturnSessionId(''); navigate(`/my-account/messages/handover/${id}`); }}
                  >
                    <option value="">Select handover session</option>
                    {handoverSessionsForBooking.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.status} • {new Date(s.updatedAt || s.createdAt).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="col-span-2">
                  <label className="block text-sm text-gray-700 mb-1">Return Session</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    value={returnSessionId}
                    onChange={async (e) => { const id=e.target.value; setReturnSessionId(id); setHandoverSessionId(''); navigate(`/my-account/messages/return/${id}`); }}
                  >
                    <option value="">Select return session</option>
                    {returnSessionsForBooking.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.status} • {new Date(s.updatedAt || s.createdAt).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {linkingSessions && (
              <p className="text-xs text-gray-500">Loading your sessions…</p>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Handover & Return Stats</h2>
            </div>
            <div className="p-5">
              {statsError && <div className="text-sm text-red-600 mb-2">{statsError}</div>}
              {stats ? (
                <div className="grid grid-cols-2 gap-4">
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
                    <div className="text-xl font-semibold text-teal-600">{stats.handoverSuccessRate}%</div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="text-xs text-gray-500">Return On-Time</div>
                    <div className="text-xl font-semibold text-teal-600">{stats.returnOnTimeRate}%</div>
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

      {/* New Message Modal */}
      {showComposer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowComposer(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">New Message</h4>
            <div className="mb-3">
              <label className="block text-sm text-gray-700 mb-1">Select Session</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={composeSessionId}
                onChange={(e) => setComposeSessionId(e.target.value)}
              >
                <option value="">{activeTab === 'handover' ? 'Select handover session' : 'Select return session'}</option>
                {(activeTab === 'handover' ? handoverSessionsForBooking : returnSessionsForBooking).map((s:any)=> (
                  <option key={s.id} value={s.id}>{s.status} • {new Date(s.updatedAt || s.createdAt).toLocaleString()}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm text-gray-700 mb-1">Sender Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md" value={senderType} onChange={(e)=> setSenderType(e.target.value as any)}>
                <option value="renter">renter</option>
                <option value="owner">owner</option>
              </select>
            </div>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              rows={4}
              placeholder="Write your message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-2 border border-gray-300 rounded-md" onClick={() => setShowComposer(false)}>Cancel</button>
              <button
                className="px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
                disabled={!messageText.trim() || !composeSessionId}
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
                    if (!token) throw new Error('Not authenticated');
                    const rawUser = localStorage.getItem('user') || localStorage.getItem('authUser');
                    const u = rawUser ? JSON.parse(rawUser) : {};
                    const senderId = u?.id || u?.userId || '';
                    await handoverReturnService.sendPlainMessage({
                      senderId,
                      senderType,
                      message: messageText,
                      messageType: 'text',
                      attachments: [],
                      handoverSessionId: activeTab === 'handover' ? composeSessionId : null,
                      returnSessionId: activeTab === 'return' ? composeSessionId : null,
                    } as any);
                    setMessageText('');
                    setComposeSessionId('');
                    setShowComposer(false);
                    if (activeTab === 'handover') {
                      await refreshMessages(composeSessionId, undefined);
                    } else {
                      await refreshMessages(undefined, composeSessionId);
                    }
                  } catch (e: any) {
                    showToast(e?.message || 'Failed to send message', 'error');
                  }
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Notification Modal */}
      {showScheduler && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowScheduler(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Schedule Notification</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Select Session</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={scheduleSessionId}
                  onChange={(e) => setScheduleSessionId(e.target.value)}
                >
                  <option value="">{activeTab === 'handover' ? 'Select handover session' : 'Select return session'}</option>
                  {(activeTab === 'handover' ? handoverSessionsForBooking : returnSessionsForBooking).map((s:any)=> (
                    <option key={s.id} value={s.id}>{s.status} • {new Date(s.updatedAt || s.createdAt).toLocaleString()}</option>
                  ))}
                </select>
              </div>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md" value={channel} onChange={(e) => setChannel(e.target.value as any)}>
                <option value="email">email</option>
                <option value="sms">sms</option>
                <option value="push">push</option>
              </select>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Title / Note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Message"
                rows={3}
                value={scheduleMessage}
                onChange={(e) => setScheduleMessage(e.target.value)}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-2 border border-gray-300 rounded-md" onClick={() => setShowScheduler(false)}>Cancel</button>
              <button
                className="px-3 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50"
                disabled={!scheduledAt.trim() || !scheduleSessionId || !scheduleMessage.trim()}
                onClick={async () => {
                  try {
                    const iso = new Date(scheduledAt).toISOString();
                    const userIdVal = derivedUserId || userId || (()=>{ try { const raw=localStorage.getItem('user')||localStorage.getItem('authUser'); const u=raw?JSON.parse(raw):{}; return u?.id||u?.userId||''; } catch { return ''; } })();
                    const body:any = {
                      userId: userIdVal,
                      type: activeTab === 'handover' ? 'handover' : 'return',
                      channel,
                      message: scheduleMessage,
                      scheduledAt: iso,
                      handoverSessionId: activeTab === 'handover' ? scheduleSessionId : null,
                      returnSessionId: activeTab === 'return' ? scheduleSessionId : null
                    };
                    await handoverReturnService.scheduleNotification(body as any);
                    setShowScheduler(false);
                    setScheduledAt('');
                    setNote('');
                    setScheduleMessage('');
                    setScheduleSessionId('');
                    showToast('Notification scheduled', 'success');
                  } catch (e: any) {
                    showToast(e?.message || 'Failed to schedule', 'error');
                  }
                }}
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HandoverReturnAccountSection;


