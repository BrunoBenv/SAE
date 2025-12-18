// frontend/src/types/ChatTypes.ts

export type Message = {
  id: number;
  role: 'user' | 'system';
  content: string;
  timestamp: string;
  mode: 'text' | 'call';
};

export type Chat = {
  id: number;
  name: string;
  messages: Message[];
  tokenUsage: {
    chat: number; // Tokens usados en API_CHAT
    call: number; // Tokens usados en API_CALL
  };
};

export type API_NAME = 'CHAT' | 'CALL';

export type SystemStatus = 'NORMAL' | 'CLOSING_INITIATED' | 'CLOSED';