import { ref, onMounted, onUnmounted } from 'vue';

/**
 * Composable for WebSocket connection to receive real-time appointment updates.
 * @param {string} token JWT token for authentication
 */
export function useAppointmentWebSocket(token) {
  const connectionStatus = ref('disconnected'); // connecting, connected, disconnected, failed
  let socket = null;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;
  const reconnectDelays = [1000, 2000, 4000, 8000, 16000];
  
  const onMessageCallbacks = [];

  const connect = () => {
    if (!token) {
      connectionStatus.value = 'failed';
      console.error('No token provided for WebSocket connection');
      return;
    }

    connectionStatus.value = 'connecting';
    
    // Construct WebSocket URL (assuming same host as API for now)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws/appointments/${token}`;

    console.log('Connecting to WebSocket:', wsUrl);
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log('WebSocket connected');
      connectionStatus.value = 'connected';
      reconnectAttempts = 0;
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        onMessageCallbacks.forEach(callback => callback(data));
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e);
      }
    };

    socket.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      
      if (connectionStatus.value !== 'disconnected' && reconnectAttempts < maxReconnectAttempts) {
        connectionStatus.value = 'connecting';
        const delay = reconnectDelays[reconnectAttempts];
        console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
        
        setTimeout(() => {
          reconnectAttempts++;
          connect();
        }, delay);
      } else if (reconnectAttempts >= maxReconnectAttempts) {
        connectionStatus.value = 'failed';
      } else {
        connectionStatus.value = 'disconnected';
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      // onclose will be called automatically after onerror
    };
  };

  const disconnect = () => {
    const prevStatus = connectionStatus.value;
    connectionStatus.value = 'disconnected';
    if (socket) {
      socket.close();
    }
  };

  const onMessage = (callback) => {
    onMessageCallbacks.push(callback);
  };

  onMounted(() => {
    connect();
  });

  onUnmounted(() => {
    disconnect();
  });

  return {
    connectionStatus,
    onMessage,
    connect,
    disconnect
  };
}
