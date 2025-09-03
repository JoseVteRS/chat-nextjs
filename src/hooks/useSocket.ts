import { useEffect, useRef, useState } from 'react';

export interface Message {
  id: string;
  message: string;
  username: string;
  timestamp: number;
  isPrivate?: boolean;
  recipientId?: string;
  recipientUsername?: string;
}

export interface User {
  id: string;
  username: string;
  color: string;
}

export const useSocket = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [privateMessages, setPrivateMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentPrivateChat, setCurrentPrivateChat] = useState<User | null>(null);
  const [unreadPrivateMessages, setUnreadPrivateMessages] = useState<{ [userId: string]: number }>({});
  const [hasNewMessage, setHasNewMessage] = useState(false);
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
            setMessages(data.messages?.filter((msg: Message) => !msg.isPrivate) || []);
            setUsers(data.users || []);
            // Actualizar el clientId con el que envía el servidor
            if (data.clientId) {
              clientIdRef.current = data.clientId;
              console.log('ClientId actualizado desde servidor:', data.clientId);
            }
            break;
          case 'message':
            setMessages(prev => [...prev, data.message]);
            break;
          case 'private-message':
            setPrivateMessages(prev => [...prev, data.message]);
            
            // Solo procesar notificaciones para mensajes dirigidos a nosotros (no enviados por nosotros)
            if (data.message.recipientId === clientIdRef.current) {
              console.log('Mensaje privado recibido de:', data.message.username, 'para:', clientIdRef.current);
              
              // Verificar si el chat privado con este usuario está abierto
              const isChatOpen = currentPrivateChat?.username === data.message.username;
              
              if (!isChatOpen) {
                // Solo incrementar contador si el chat no está abierto
                const senderKey = data.message.username;
                
                setUnreadPrivateMessages(prev => ({
                  ...prev,
                  [senderKey]: (prev[senderKey] || 0) + 1
                }));
              
                              // Activar animación de nuevo mensaje
                setHasNewMessage(true);
                setTimeout(() => setHasNewMessage(false), 1000);
                
                // Reproducir sonido sutil (opcional)
                try {
                  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2H0fPSfSkELYPQ8tiJOQcZZ7zv45xKEQ1QqOPxtmQcBDuS2vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2H0fPSfSkELYPQ8tiJOQcZZ7zv45xKEQ1QqOPxtmQcBDuS2vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2H0fPSfSkELYPQ8tiJOQcZZ7zv45xKEQ1QqOPxtmQcBDuS2vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2H0fPSfSkELYPQ8tiJOQcZZ7zv45xKEQ1QqOPxtmQcBDuS2vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2H0fPSfSkELYPQ8tiJOQcZZ7zv45xKEQ1QqOPxtmQcBDuS2vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2H0fPSfSkELYPQ8tiJOQcZZ7zv45xKEQ1QqOPxtmQcBDuS2vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2H0fPSfSkELYPQ8tiJOQcZZ7zv45xKEQ1QqOPxtmQcBDuS2vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2H0fPSfSkELYPQ8tiJOQcZZ7zv45xKEQ1QqOPxtmQcBDuS2vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2H0fPSfSkELYPQ8tiJOQcZZ7zv45xKEQ1QqOPxtmQcBDuS2vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2H0fPSfSkELYPQ8tiJOQcZZ7zv45xKEQ1QqOPxtmQcBDuS2vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2H0fPSfSkELYPQ8tiJOQcZZ7zv45xKEQ1QqOPxtmQcBDuS2vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2H0fPSfSkELYPQ8tiJOQcZZ7zv45xKEQ1QqOPxtmQcBDuS2vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2H0fPSfSkELYPQ8tiJOQcZZ7zv45xKEQ1QqOPxtmQcBDuS2vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2H0fPSfSkELYPQ8tiJOQcZZ7zv45xKEQ1QqOPxtmQcBDuS2vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2H0fPSfSkELYPQ8tiJOQcZZ7zv45xKEQ1QqOPxtmQcBDuS2vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2H0fPSfSkELYPQ8tiJOQcZZ7zv45xKEQ1QqOPxtmQcBDuS2vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2H0fPSfSkELYPQ8tiJOQcZZ7zv45xKEQ1QqOPxtmQcBDuS2vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2H0fPSfSkELYPQ8tiJOQcZZ7zv45xKEQ1QqOPxtmQcBDuS2vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2H0fPSfSkELYPQ8tiJOQcZZ7zv45xKEQ1QqOPxtmQcBDuS2vLNeSsFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBz2H0fPSfSkE=');
                  audio.volume = 0.3;
                  audio.play().catch(() => {}); // Ignorar errores si no se puede reproducir
                } catch {
                  // Ignorar errores de audio
                }
              }
            }
            break;
          case 'user-joined':
            setUsers(prev => {
              // Evitar duplicados
              const exists = prev.find(u => u.id === data.user.id);
              if (exists) return prev;
              return [...prev, data.user];
            });
            break;
          case 'users-update':
            setUsers(data.users || []);
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
      console.log('Intentando join con clientId:', clientIdRef.current);
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

  const sendPrivateMessage = async (message: string, username: string, recipient: User) => {
    if (message.trim()) {
      try {
        await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'private-message',
            data: {
              message: message.trim(),
              username,
              clientId: clientIdRef.current,
              recipientId: recipient.id,
              recipientUsername: recipient.username,
            },
          }),
        });
      } catch (error) {
        console.error('Error sending private message:', error);
      }
    }
  };

  const getPrivateMessagesWithUser = (userId: string, currentUsername: string) => {
    return privateMessages.filter(msg => 
      (msg.recipientId === userId && msg.username === currentUsername) || 
      (msg.recipientId === clientIdRef.current && users.find(u => u.id === userId)?.username === msg.username)
    );
  };

  const getCurrentUser = (currentUsername: string) => {
    return users.find(u => u.username === currentUsername);
  };

  const markPrivateMessagesAsRead = (username: string) => {
    setUnreadPrivateMessages(prev => ({
      ...prev,
      [username]: 0
    }));
  };

  const getTotalUnreadPrivateMessages = () => {
    return Object.values(unreadPrivateMessages).reduce((total, count) => total + count, 0);
  };

  const getUnreadCountForUser = (username: string) => {
    return unreadPrivateMessages[username] || 0;
  };

  return {
    messages,
    privateMessages,
    users,
    isConnected,
    currentPrivateChat,
    setCurrentPrivateChat,
    unreadPrivateMessages,
    hasNewMessage,
    joinChat,
    sendMessage,
    sendPrivateMessage,
    getPrivateMessagesWithUser,
    getCurrentUser,
    markPrivateMessagesAsRead,
    getTotalUnreadPrivateMessages,
    getUnreadCountForUser,
    clientId: clientIdRef.current
  };
}; 