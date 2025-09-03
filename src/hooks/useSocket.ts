import { useEffect, useRef, useState } from 'react';

export interface Message {
  id: string;
  message: string;
  username: string;
  timestamp: number;
}

export interface User {
  id: string;
  username: string;
}

export const useSocket = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const clientIdRef = useRef<string>(Math.random().toString(36).substring(7));

  useEffect(() => {
    // Crear conexión SSE
    const eventSource = new EventSource('/api/chat');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('Conectado al servidor');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'initial':
            setMessages(data.messages || []);
            setUsers(data.users || []);
            break;
          case 'message':
            setMessages(prev => [...prev, data.message]);
            break;
          case 'user-joined':
            setUsers(prev => [...prev, data.user]);
            break;
          case 'user-left':
            setUsers(prev => prev.filter(u => u.id !== data.user.id));
            break;
          case 'ping':
            // Ping para mantener la conexión
            break;
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = () => {
      console.log('Error de conexión');
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const joinChat = async (username: string) => {
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'join',
          data: {
            username,
            clientId: clientIdRef.current,
          },
        }),
      });
    } catch (error) {
      console.error('Error joining chat:', error);
    }
  };

  const sendMessage = async (message: string, username: string) => {
    if (message.trim()) {
      try {
        await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'message',
            data: {
              message: message.trim(),
              username,
              clientId: clientIdRef.current,
            },
          }),
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return {
    messages,
    users,
    isConnected,
    joinChat,
    sendMessage
  };
}; 