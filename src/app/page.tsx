'use client';

import { useState, useEffect } from 'react';
import NamePrompt from '../components/NamePrompt';
import ChatRoom from '../components/ChatRoom';
import { useSocket, User } from '../hooks/useSocket';

export default function Home() {
  const [username, setUsername] = useState<string>('');
  const [hasJoined, setHasJoined] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { 
    messages, 
    users, 
    isConnected, 
    currentPrivateChat,
    setCurrentPrivateChat,
    hasNewMessage,
    joinChat, 
    sendMessage, 
    sendPrivateMessage,
    getPrivateMessagesWithUser,
    getCurrentUser,
    getTotalUnreadPrivateMessages,
    getUnreadCountForUser,
    markPrivateMessagesAsRead,
    clientId
  } = useSocket();

  // Buscar el usuario actual en la lista de usuarios
  useEffect(() => {
    if (hasJoined && users.length > 0) {
      const user = getCurrentUser(username);
      if (user) {
        setCurrentUser(user);
      }
    }
  }, [users, username, hasJoined, getCurrentUser]);

  const handleNameSubmit = (name: string) => {
    setUsername(name);
    joinChat(name);
    setHasJoined(true);
  };

  const handleSendMessage = (message: string) => {
    sendMessage(message, username);
  };

  const handleSendPrivateMessage = (message: string, recipient: User) => {
    sendPrivateMessage(message, username, recipient);
  };

  const getPrivateMessages = (userId: string) => {
    return getPrivateMessagesWithUser(userId, username);
  };

  if (!hasJoined) {
    return <NamePrompt onNameSubmit={handleNameSubmit} />;
  }

  return (
        <ChatRoom
      messages={messages}
      users={users}
      username={username}
      isConnected={isConnected}
      onSendMessage={handleSendMessage}
      currentPrivateChat={currentPrivateChat}
      setCurrentPrivateChat={setCurrentPrivateChat}
      onSendPrivateMessage={handleSendPrivateMessage}
      getPrivateMessagesWithUser={getPrivateMessages}
      currentUser={currentUser || undefined}
      getTotalUnreadPrivateMessages={getTotalUnreadPrivateMessages}
      getUnreadCountForUser={getUnreadCountForUser}
      markPrivateMessagesAsRead={markPrivateMessagesAsRead}
      hasNewMessage={hasNewMessage}
    />
  );
}
