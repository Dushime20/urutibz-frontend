import { useState } from 'react';
import { useHandoverMessages } from '../../hooks/useHandoverMessages';
import { useHandoverNotifications } from '../../hooks/useHandoverNotifications';

function HandoverReturnDemoPage() {
  const [bookingId, setBookingId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [senderId, setSenderId] = useState('');
  const [message, setMessage] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [scheduleIso, setScheduleIso] = useState('');
  const [note, setNote] = useState('');
  const [channel, setChannel] = useState('email');

  const { messages, sendMessage, refreshMessages, loading: messagesLoading } = useHandoverMessages(sessionId || undefined, bookingId || undefined);
  const { notifications, schedule, refreshNotifications, loading: notifLoading } = useHandoverNotifications(undefined, bookingId || undefined);

  const handleSendMessage = async () => {
    if (bookingId) {
      await sendMessage({
        bookingId,
        senderId,
        message,
        attachments: attachmentUrl ? [{ type: 'image', url: attachmentUrl }] : undefined,
      });
    } else if (sessionId) {
      await sendMessage({
        sessionId,
        receiverId: 'receiver-id',
        messageType: 'text',
        content: message,
      });
    }
    await refreshMessages();
  };

  const handleSchedule = async () => {
    if (!bookingId || !scheduleIso) return;
    await schedule({
      bookingId,
      type: 'handover',
      scheduledAt: scheduleIso,
      payload: { note, channel },
    });
    await refreshNotifications();
  };

  return (
    <div className="container py-4">
      <h2>Handover/Return Demo</h2>
      <div className="grid" style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <h3>Messages</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            <input placeholder="Booking ID (optional if using session)" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
            <input placeholder="Session ID (optional if using booking)" value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
            <input placeholder="Sender ID" value={senderId} onChange={(e) => setSenderId(e.target.value)} />
            <textarea placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
            <input placeholder="Attachment URL (image)" value={attachmentUrl} onChange={(e) => setAttachmentUrl(e.target.value)} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSendMessage} disabled={messagesLoading || (!bookingId && !sessionId)}>Send</button>
              <button onClick={refreshMessages} disabled={messagesLoading || (!bookingId && !sessionId)}>Refresh</button>
            </div>
          </div>
          <ul style={{ marginTop: 12 }}>
            {messages.map((m) => (
              <li key={m.id}>
                <strong>{m.messageType}</strong>: {m.content} <em>at {new Date(m.sentAt).toLocaleString()}</em>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Notifications</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            <input placeholder="Booking ID" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
            <input placeholder="ScheduledAt (ISO)" value={scheduleIso} onChange={(e) => setScheduleIso(e.target.value)} />
            <input placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} />
            <select value={channel} onChange={(e) => setChannel(e.target.value)}>
              <option value="email">email</option>
              <option value="sms">sms</option>
              <option value="push">push</option>
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSchedule} disabled={notifLoading || !bookingId || !scheduleIso}>Schedule</button>
              <button onClick={refreshNotifications} disabled={notifLoading || !bookingId}>Refresh</button>
            </div>
          </div>
          <ul style={{ marginTop: 12 }}>
            {notifications.map((n) => (
              <li key={n.id}>
                <strong>{n.type}</strong>: {n.title || n.message} <em>at {new Date(n.createdAt).toLocaleString()}</em>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default HandoverReturnDemoPage;


