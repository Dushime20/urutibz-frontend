import React from 'react';
import { useChannelStatusQuery } from '../queries';

const ChannelStatusWidget: React.FC = () => {
  const { data, isLoading } = useChannelStatusQuery();
  const status = data || {};

  return (
    <div className="rounded border p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Channel Status</h2>
        <span className="text-xs text-gray-500">Auto-refresh 30s</span>
      </div>
      {isLoading ? (
        <div className="text-sm text-gray-600 mt-2">Loading status...</div>
      ) : (
        <>
          {status?.timestamp && (
            <div className="text-xs text-gray-500 mt-2">Last updated: {new Date(status.timestamp).toLocaleString()}</div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {Object.keys(status).filter((k) => k !== 'timestamp').length === 0 ? (
              <div className="text-sm text-gray-600">No status available.</div>
            ) : (
              Object.entries(status)
                .filter(([channel]) => channel !== 'timestamp')
                .map(([channel, value]: any) => (
                  <div key={channel} className="rounded border p-3">
                    <div className="text-sm font-medium capitalize">{channel.replace('_',' ')}</div>
                    <div className={`text-xs mt-1 ${value?.connected ? 'text-green-600' : 'text-red-600'}`}>
                      {value?.connected ? 'Connected' : 'Disconnected'}
                    </div>
                  </div>
                ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChannelStatusWidget;


