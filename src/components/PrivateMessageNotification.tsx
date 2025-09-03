'use client';

import { useEffect, useState } from 'react';

interface PrivateMessageNotificationProps {
  notification: { user: string; message: string } | null;
  onClose: () => void;
}

export default function PrivateMessageNotification({ 
  notification, 
  onClose 
}: PrivateMessageNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      // Auto-ocultar después de 2.5 segundos
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Esperar a que termine la animación antes de llamar onClose
        setTimeout(onClose, 300);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
    }`}>
      <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          
                      <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-white truncate">
                  {notification.user}
                </p>
                <button
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                  }}
                  className="p-1 rounded-full hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-blue-400">
                Te ha enviado un mensaje privado
              </p>
            </div>
        </div>
      </div>
    </div>
  );
} 