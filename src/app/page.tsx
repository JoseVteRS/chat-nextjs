'use client';

import { useState, useEffect } from 'react';
import NamePrompt from '../components/NamePrompt';
import ChatRoom from '../components/ChatRoom';
import { useSocket } from '../hooks/useSocket';

export default function Home() {
  const [username, setUsername] = useState<string>('');
  const [hasJoined, setHasJoined] = useState(false);
  const { messages, users, isConnected, joinChat, sendMessage } = useSocket();



  const handleNameSubmit = (name: string) => {
    setUsername(name);
    joinChat(name);
    setHasJoined(true);
  };

  const handleSendMessage = (message: string) => {
    sendMessage(message, username);
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
    />
  );
}
