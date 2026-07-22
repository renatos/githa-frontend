import { ref } from 'vue';

// Global state shared across all hook instances (Singleton Pattern)
const connectionStatus = ref('disconnected'); // connecting, connected, disconnected, failed
let socket = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectDelays = [1000, 2000, 4000, 8000, 16000];

let currentToken = null;
const onMessageCallbacks = new Set();

/**
 * Composable for WebSocket connection to receive real-time notifications.
 * @param {string} [initialToken] JWT token for authentication
 */
export function useNotificationWebSocket(initialToken) {
  if (initialToken) {
    currentToken = initialToken;
  }

  const connect = (newToken) => {
    if (newToken) {
      currentToken = newToken;
    } else if (!currentToken) {
      currentToken = localStorage.getItem('token');
    }

    if (!currentToken) {
      connectionStatus.value = 'failed';
      console.error('No token provided for WebSocket connection');
      return;
    }

    // If socket is already open or connecting, reuse it and do not open a new one
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      console.warn('WebSocket connection already active or connecting.');
      if (socket.readyState === WebSocket.OPEN) {
        connectionStatus.value = 'connected';
      } else {
        connectionStatus.value = 'connecting';
      }
      return;
    }

    // Clean up any existing closed/closing socket
    if (socket) {
      try {
        socket.close();
      } catch {
        // ignore
      }
    }

    connectionStatus.value = 'connecting';
    
    // Construct WebSocket URL using the current browser's host
    // This allows the Vite proxy (vite.config.js) to handle the /ws mapping
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/notifications/${currentToken}`;

    console.warn('Connecting to WebSocket:', wsUrl);
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.warn('WebSocket connected');
      connectionStatus.value = 'connected';
      reconnectAttempts = 0;
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.type === 'PING') {
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
          }
          return;
        }
        onMessageCallbacks.forEach(callback => callback(data));
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    socket.onclose = (event) => {
      console.warn('WebSocket closed:', event.code, event.reason);
      
      // If we disconnected intentionally, do not try to reconnect
      if (connectionStatus.value === 'disconnected') {
        return;
      }

      // Refresh token from storage for reconnection attempt
      const freshToken = localStorage.getItem('token');
      if (freshToken) {
        currentToken = freshToken;
      }

      if (reconnectAttempts < maxReconnectAttempts) {
        connectionStatus.value = 'connecting';
        const delay = reconnectDelays[reconnectAttempts];
        console.warn(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
        
        setTimeout(() => {
          reconnectAttempts++;
          connect();
        }, delay);
      } else {
        connectionStatus.value = 'failed';
      }
    };


    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      // onclose will be called automatically after onerror
    };
  };

  const disconnect = () => {
    connectionStatus.value = 'disconnected';
    if (socket) {
      socket.close();
      socket = null;
    }
    reconnectAttempts = 0;
  };

  const onMessage = (callback) => {
    onMessageCallbacks.add(callback);
    // Return a cleanup function to unsubscribe
    return () => {
      onMessageCallbacks.delete(callback);
    };
  };

  return {
    connectionStatus,
    onMessage,
    connect,
    disconnect
  };
}

