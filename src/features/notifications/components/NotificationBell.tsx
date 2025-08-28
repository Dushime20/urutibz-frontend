import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationsQuery, useMarkReadMutation } from '../queries';

const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useNotificationsQuery({ page: 1, limit: 10 });
  const markRead = useMarkReadMutation();

  const items = (
    (data as any)?.items ??
    (data as any)?.data?.items ??
    (data as any)?.data?.data ??
    (Array.isArray(data) ? data : [])
  ) as any[];
  const unread = useMemo(() => items.filter((n: any) => (n.read === false) || (n.is_read === false)).length, [items]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded hover:bg-gray-100"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-40">
          <div className="px-4 py-2 border-b">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Notifications</span>
              <button onClick={() => { setShowModal(true); setOpen(false); }} className="text-sm text-emerald-600 hover:underline">See all</button>
            </div>
          </div>
          <div className="max-h-96 overflow-auto">
            {isLoading ? (
              <div className="p-4 text-sm text-gray-600">Loading...</div>
            ) : items.length === 0 ? (
              <div className="p-4 text-sm text-gray-600">No notifications</div>
            ) : (
              items.map((n: any) => (
                <div 
                  key={n.id} 
                  className="px-4 py-3 border-b last:border-0 cursor-pointer hover:bg-gray-50"
                  onClick={() => {
                    if (!(n.read ?? n.is_read)) {
                      markRead.mutate(n.id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium">{n.title}</div>
                      <div className="text-xs text-gray-600">{n.message}</div>
                      <div className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt || n.scheduledAt || n.created_at || n.sent_at || Date.now()).toLocaleString()}</div>
                    </div>
                    {(!(n.read ?? n.is_read)) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markRead.mutate(n.id);
                        }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 h-screen bg-black/50">
          <div className="fixed inset-0 bg-black/30" onClick={() => setShowModal(false)}></div>
          <div className="relative z-10 bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-gray-100 p-6 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">All Notifications</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>
            {isLoading ? (
              <div className="text-center py-12">Loading...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No notifications yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {items.map((n: any) => (
                  <li 
                    key={n.id} 
                    className="py-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50 rounded-lg p-2"
                    onClick={() => {
                      if (!(n.read ?? n.is_read)) {
                        markRead.mutate(n.id);
                      }
                    }}
                  >
                    <div className={`mt-1 w-2 h-2 rounded-full ${ (n.read ?? n.is_read) ? 'bg-gray-300' : 'bg-emerald-500'}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 truncate">{n.title || n.type}</h4>
                        {(!(n.read ?? n.is_read)) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markRead.mutate(n.id);
                            }}
                            className="text-xs text-emerald-600 hover:underline"
                          >Mark read</button>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{n.message}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        {new Date(n.createdAt || n.scheduledAt || n.created_at || n.sent_at || Date.now()).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;


