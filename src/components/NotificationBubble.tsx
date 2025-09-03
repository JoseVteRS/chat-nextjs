'use client';

import { useEffect, useState } from 'react';

interface NotificationBubbleProps {
  show: boolean;
  count: number;
  animate?: boolean;
}

export default function NotificationBubble({ show, count, animate: shouldAnimate = false }: NotificationBubbleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (show && count > 0) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
      setAnimate(false);
    }
  }, [show, count]);

  useEffect(() => {
    if (shouldAnimate && show && count > 0) {
      setAnimate(true);
      
      // Quitar la animación después de 500ms
      const timer = setTimeout(() => {
        setAnimate(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [shouldAnimate, show, count]);

  if (!isVisible || count === 0) return null;

  return (
    <div className={`absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center transition-all duration-300 ${
      animate ? 'scale-125 animate-bounce' : 'scale-100'
    }`}>
      <span className="text-xs text-white font-medium">
        {count > 9 ? '9+' : count}
      </span>
      
      {/* Efecto de pulso cuando hay nuevos mensajes */}
      {animate && (
        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
      )}
    </div>
  );
} 