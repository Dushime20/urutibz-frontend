import React, { useMemo, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationsQuery, useMarkReadMutation } from '../queries';
import Portal from '../../../components/ui/Portal';

const NotificationBell: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalPage, setModalPage] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { data, isLoading } = useNotificationsQuery({ page: 1, limit: 10 });
  const modalQuery = useNotificationsQuery({ page: modalPage, limit: 50 });
  const markRead = useMarkReadMutation();

  const items = (
    (data as any)?.items ??
    (data as any)?.data?.items ??
    (data as any)?.data?.data ??
    (Array.isArray(data) ? data : [])
  ) as any[];
  const unread = useMemo(() => items.filter((n: any) => (n.read === false) || (n.is_read === false)).length, [items]);

  const modalItems = (
    (modalQuery.data as any)?.items ??
    (modalQuery.data as any)?.data?.items ??
    (modalQuery.data as any)?.data?.data ??
    (Array.isArray(modalQuery.data) ? modalQuery.data : [])
  ) as any[];

  // No dropdown; bell opens the modal directly.

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => { setShowModal(true); }}
        className="relative p-2 rounded hover:bg-gray-100"
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={showModal}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5">
            {unread}
          </span>
        )}
      </button>

      {/* Dropdown removed; bell opens modal directly */}

      {showModal && (
        <Portal>
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 h-screen bg-black/50" data-sticky-portal>
          <div className="fixed inset-0 bg-black/30"></div>
          <div className="relative z-[2001] bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-6 max-h-[80vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">All Notifications</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-600 dark:text-slate-300 hover:text-gray-800 dark:hover:text-slate-100">Close</button>
            </div>
            {modalQuery.isLoading ? (
              <div className="text-center py-12 text-gray-700 dark:text-slate-300">Loading...</div>
            ) : modalItems.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 dark:text-slate-300">No notifications yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {modalItems.map((n: any) => (
                  <li 
                    key={n.id} 
                    className="py-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg p-2"
                    onClick={() => {
                      if (!(n.read ?? n.is_read)) {
                        markRead.mutate(n.id);
                      }
                    }}
                  >
                    <div className={`mt-1 w-2 h-2 rounded-full ${ (n.read ?? n.is_read) ? 'bg-gray-300' : 'bg-emerald-500'}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 dark:text-slate-100 truncate">{n.title || n.type || 'Notification'}</h4>
                        {(!(n.read ?? n.is_read)) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markRead.mutate(n.id);
                            }}
                            className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                          >Mark read</button>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-slate-300 mt-1 whitespace-pre-line break-words">{n.message || n.content || n.body || n.description || ''}</p>
                      <div className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                        {new Date(n.createdAt || n.scheduledAt || n.created_at || n.sent_at || Date.now()).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex justify-between">
              <button onClick={() => setModalPage(p => Math.max(1, p - 1))} className="text-sm px-3 py-1 rounded border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800">Prev</button>
              <button onClick={() => setModalPage(p => p + 1)} className="text-sm px-3 py-1 rounded border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800">Next</button>
            </div>
          </div>
        </div>
        </Portal>
      )}
    </div>
  );
};

export default NotificationBell;


