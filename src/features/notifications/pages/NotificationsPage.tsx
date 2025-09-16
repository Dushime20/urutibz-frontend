import React from 'react';
import { useNotificationsQuery, useMarkReadMutation } from '../queries';
import SendNotificationForm from '../components/SendNotificationForm';
import TemplatesManager from '../components/TemplatesManager';
import ChannelStatusWidget from '../components/ChannelStatusWidget';
import { useAuth } from '../../../contexts/AuthContext';

const NotificationsPage: React.FC = () => {
  const { data, isLoading, refetch } = useNotificationsQuery({ page: 1, limit: 50 });
  const markRead = useMarkReadMutation();
  const { user } = useAuth();
  const items = data?.items ?? [];

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      {user?.role === 'admin' && (
        <>
          <ChannelStatusWidget />
          <div className="rounded border p-4">
            <h2 className="font-semibold mb-3">Send Notification</h2>
            <SendNotificationForm />
          </div>
          <TemplatesManager />
        </>
      )}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">Showing {items.length} latest notifications</div>
        <button onClick={() => refetch()} className="text-sm px-3 py-1 rounded border hover:bg-gray-50">View all</button>
      </div>
      {items.length === 0 ? (
        <div className="text-gray-600">No notifications found.</div>
      ) : (
        <div className="space-y-3">
          {items.map((n: any) => (
            <div key={n.id} className="rounded border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{n.title}</div>
                  <div className="text-sm text-gray-700">{n.message}</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  {!n.read && (
                    <button onClick={() => markRead.mutate(n.id)} className="rounded bg-blue-600 text-white px-3 py-1 text-sm hover:bg-blue-700">
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;


