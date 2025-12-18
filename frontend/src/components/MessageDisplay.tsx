// frontend/src/components/MessageDisplay.tsx

import React from 'react';
import { Message } from '../types/ChatTypes';

interface MessageDisplayProps {
  message: Message;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ message }) => {
  const isSystem = message.role === 'system';
  
  // Función para formatear el timestamp a una hora legible
  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex mb-4 ${isSystem ? 'justify-start' : 'justify-end'}`}>
      <div 
        className={`max-w-[70%] p-4 rounded-xl shadow-sm transition-all duration-300 ${
          isSystem 
            ? 'bg-gray-100 text-therapy-text rounded-tl-none' 
            : 'bg-therapy-primary text-white rounded-tr-none'
        }`}
      >
        <p className={`text-md whitespace-pre-wrap`}>
            {message.content}
        </p>
        <span className={`text-xs block mt-1 ${isSystem ? 'text-gray-500' : 'text-gray-200'}`}>
             {formatTime(message.timestamp)}
             {message.mode === 'call' && (
                 <span className="ml-2 font-semibold italic text-xs"> (Voz)</span>
             )}
        </span>
      </div>
    </div>
  );
};

export default MessageDisplay;