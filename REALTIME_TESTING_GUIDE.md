# Testing Real-Time Socket Connection

## To Check if Socket is Connected

### 1. Backend Console Output
When you start the backend server and a client connects, you should see:

```
🔐 ========== SOCKET AUTH ATTEMPT ==========
📋 Socket ID: <socket-id>
🔑 Token provided: true
✅ Authentication successful
👤 User ID: <user-id>
🎭 User Role: <user-role>
🔐 =======================================

🔌 ========== SOCKET CONNECTED ==========
📋 Socket ID: <socket-id>
👤 User ID: <user-id>
🎭 User Role: <user-role>
🌐 Handshake Query: {...}
🔑 Handshake Auth: {...}
✅ ======================================
```

### 2. Frontend Browser Console
Open the browser console (F12) and look for:

```javascript
✅ Socket.IO connected
```

Or if there's an error:
```javascript
❌ Socket.IO disconnected
Socket connection error: ...
```

### 3. Test the Connection

#### Option A: Add to Your Header Component
```tsx
// In your Header.tsx or navigation component
import RealtimeNotifications from '../components/RealtimeNotifications';

// Add to your JSX:
<RealtimeNotifications />
```

#### Option B: Quick Test Component
Create a test file to verify the connection:

```tsx
// src/pages/TestSocket.tsx
import React, { useEffect } from 'react';
import { useRealtime } from '../hooks/useRealtime';

const TestSocket = () => {
  const { socket, isConnected } = useRealtime();

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        console.log('✅ Connected to server');
      });
      
      socket.on('disconnect', () => {
        console.log('❌ Disconnected from server');
      });
    }
  }, [socket]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Socket Test</h1>
      <div className="space-y-2">
        <p>Status: <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
          {isConnected ? 'Connected ✅' : 'Disconnected ❌'}
        </span></p>
        <p>Socket ID: {socket?.id || 'Not connected'}</p>
      </div>
    </div>
  );
};

export default TestSocket;
```

Then add a route to test it:
```tsx
// In your App.tsx or router file
import TestSocket from './pages/TestSocket';
<Route path="/test-socket" element={<TestSocket />} />
```

### 4. What to Check

1. **Backend is running** on `http://localhost:3000`
2. **Frontend is running** on `http://localhost:5173` (or your Vite port)
3. **User is logged in** (has a valid JWT token in localStorage)
4. **Token is being sent** correctly in the socket handshake

### 5. Common Issues

#### Issue: "No token provided"
**Solution**: Make sure user is logged in and token exists in localStorage

#### Issue: "Authentication error: Invalid token"
**Solution**: Check that JWT_SECRET in backend matches the secret used to create tokens

#### Issue: Connection refused
**Solution**: 
- Backend is not running
- CORS configuration is blocking the connection
- Wrong WebSocket URL

### 6. Expected Behavior

When everything works:
- ✅ User logs in → Token saved to localStorage
- ✅ Page loads → Socket connects automatically
- ✅ Backend console shows authentication logs
- ✅ Frontend console shows "Socket.IO connected"
- ✅ User can see notifications (if any)
- ✅ Real-time updates work

### 7. Debug Commands

Check if backend is running:
```bash
curl http://localhost:3000/health
```

Check if socket is accessible:
```bash
curl http://localhost:3000/socket.io/
```

Check localStorage for token:
```javascript
// In browser console
console.log('Token:', localStorage.getItem('token'));
```

## Next Steps

Once you confirm the connection is working:
1. Add `RealtimeNotifications` component to your header
2. Test sending a message between two users
3. Test booking status updates
4. Monitor both backend and frontend consoles for events

