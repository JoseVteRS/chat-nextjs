'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, User } from '../hooks/useSocket';

interface PrivateChatProps {
  messages: Message[];
  recipient: User;
  currentUsername: string;
  onSendMessage: (message: string, recipient: User) => void;
  onClose: () => void;
}

export default function PrivateChat({ 
  messages, 
  recipient, 
  currentUsername, 
  onSendMessage, 
  onClose 
}: PrivateChatProps) {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 96) + 'px';
    }
  }, [newMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage, recipient);
      setNewMessage('');
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 rounded-t-2xl p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
              style={{ backgroundColor: recipient.color }}
            >
              {recipient.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-white font-semibold">{recipient.username}</h3>
              <p className="text-xs text-gray-400">Chat privado</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No hay mensajes aún</p>
              <p className="text-gray-600 text-xs mt-1">Inicia la conversación</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.username === currentUsername ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.username === currentUsername ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`px-3 py-2 rounded-2xl shadow-sm ${
                      message.username === currentUsername
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md'
                        : 'bg-gray-800 text-white rounded-bl-md border border-gray-700'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.username === currentUsername ? 'text-blue-100' : 'text-gray-400'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-gray-800 rounded-b-2xl border-t border-gray-700">
          <form onSubmit={handleSubmit} className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Mensaje para ${recipient.username}...`}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none min-h-[40px] max-h-20 text-sm"
                maxLength={500}
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-700 disabled:to-gray-700 rounded-full transition-all duration-200 disabled:cursor-not-allowed active:scale-95"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 