import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Chat, Message, SystemStatus, API_NAME, API_KEY_ID } from '../types/ChatTypes';
import { closeInitiationMessage, finalGoodbyeMessage } from '../services/promptService';
import { generateGeminiResponse } from '../services/GeminiService';

// --- CONFIGURACIÓN CRÍTICA DE LÍMITES ---
const MAX_DAILY_TOKENS = 75000; 
const THRESHOLD_PERCENT = 0.9; 
const HARD_TOKEN_LIMIT = MAX_DAILY_TOKENS * THRESHOLD_PERCENT; 
const MAX_CLOSURE_EXCHANGES = 2; 

interface ChatContextType {
  user: { id: number; username: string } | null;
  chats: Chat[];
  selectedChat: Chat | null;
  systemStatus: SystemStatus;
  
  selectChat: (chat: Chat) => void;
  createNewChat: (name: string) => void;
  deleteChat: (chatId: number) => void;
  renameChat: (chatId: number, newName: string) => void; // <--- NUEVA FUNCIÓN
  sendMessage: (content: string, mode: 'text' | 'call') => Promise<string | undefined>;
  login: (username: string) => void;
  logout: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const stickyValue = window.localStorage.getItem(key);
    return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useStickyState<{ id: number; username: string } | null>(null, 'sae-user');
  const [chats, setChats] = useStickyState<Chat[]>([], 'sae-chats');
  const [globalTokenUsage, setGlobalTokenUsage] = useStickyState<{ chat: number, call: number }>({ chat: 0, call: 0 }, 'sae-token-usage');
  const [systemStatus, setSystemStatus] = useStickyState<SystemStatus>('NORMAL', 'sae-system-status');
  const [closureExchanges, setClosureExchanges] = useStickyState<number>(0, 'sae-closure-exchanges');

  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  
  useEffect(() => {
      if (!selectedChat && chats.length > 0) {
         // Lógica opcional
      }
  }, [chats, selectedChat]);

  const checkTokenLimit = (api: API_KEY_ID, tokensUsed: number): boolean => {
    const currentUsage = globalTokenUsage[api] + tokensUsed;
    return currentUsage >= HARD_TOKEN_LIMIT; 
  };

  const getActiveAPI = (tokensForRequest: number): API_NAME | 'CLOSED' => {
    if (!checkTokenLimit('chat', tokensForRequest)) return 'CHAT';
    if (!checkTokenLimit('call', tokensForRequest)) return 'CALL';
    return 'CLOSED';
  };
  
  const login = (username: string) => {
    setUser({ id: username === 'estela' ? 1 : 2, username });
  };

  const logout = () => {
    setUser(null);
    setSelectedChat(null);
  };

  const createNewChat = (name: string) => {
    const newChat: Chat = {
      id: Date.now(),
      name,
      messages: [],
      tokenUsage: { chat: 0, call: 0 }
    };
    setChats(prev => [...prev, newChat]);
    setSelectedChat(newChat);
  };

  const deleteChat = (chatId: number) => {
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      if (selectedChat && selectedChat.id === chatId) {
          setSelectedChat(null);
      }
  };

  // --- LÓGICA DE RENOMBRAR ---
  const renameChat = (chatId: number, newName: string) => {
      setChats(prevChats => 
        prevChats.map(chat => 
            chat.id === chatId ? { ...chat, name: newName } : chat
        )
      );
      // Si el chat renombrado es el actual, actualizamos también el seleccionado
      if (selectedChat && selectedChat.id === chatId) {
          setSelectedChat(prev => prev ? { ...prev, name: newName } : null);
      }
  };

  const updateChatMessages = (chatId: number, newMessage: Message, tokensSpent: number, apiUsed: API_NAME) => {
    setChats(prevChats => 
        prevChats.map(chat => 
            chat.id === chatId ? { ...chat, messages: [...chat.messages, newMessage] } : chat
        )
    );

    if (selectedChat && selectedChat.id === chatId) {
        setSelectedChat(prev => prev ? { ...prev, messages: [...prev.messages, newMessage] } : null);
    }

    if (tokensSpent > 0) {
        setGlobalTokenUsage(prev => ({
            ...prev,
            [apiUsed.toLowerCase() as API_KEY_ID]: prev[apiUsed.toLowerCase() as API_KEY_ID] + tokensSpent
        }));
    }
  };
  
  const sendMessage = async (content: string, mode: 'text' | 'call'): Promise<string | undefined> => {
      if (!selectedChat || !user) return;
      
      const tokensEstimate = mode === 'call' ? 400 : 800;

      if (systemStatus === 'CLOSED') {
          if (closureExchanges >= MAX_CLOSURE_EXCHANGES) return; 
          const systemResponse: Message = { id: Date.now() + 1, role: 'system', content: finalGoodbyeMessage, timestamp: new Date().toISOString(), mode };
          updateChatMessages(selectedChat.id, systemResponse, 0, 'CHAT'); 
          setClosureExchanges(MAX_CLOSURE_EXCHANGES); 
          return finalGoodbyeMessage;
      }
      
      const userMessage: Message = { id: Date.now(), role: 'user', content, timestamp: new Date().toISOString(), mode };
      updateChatMessages(selectedChat.id, userMessage, 0, 'CHAT'); 

      const activeAPI = getActiveAPI(tokensEstimate);
      let systemResponseContent = "";
      let tokensUsed = 0;
      let apiUsed: API_NAME = activeAPI !== 'CLOSED' ? activeAPI : 'CHAT'; 

      if (activeAPI === 'CLOSED' && systemStatus === 'NORMAL') {
          systemResponseContent = closeInitiationMessage;
          setSystemStatus('CLOSING_INITIATED');
          tokensUsed = 0;
      } else if (activeAPI === 'CLOSED' && systemStatus === 'CLOSING_INITIATED') {
           setClosureExchanges(prev => prev + 1);
           if (closureExchanges < MAX_CLOSURE_EXCHANGES) {
              const response = await generateGeminiResponse(selectedChat.messages, content, 'CHAT', 'CLOSING_INITIATED');
              systemResponseContent = response.responseText;
              tokensUsed = response.tokensUsed;
           } else {
              systemResponseContent = finalGoodbyeMessage;
              setSystemStatus('CLOSED');
              tokensUsed = 0;
           }
      } else if (activeAPI !== 'CLOSED') {
          const response = await generateGeminiResponse(selectedChat.messages, content, activeAPI, 'NORMAL');
          systemResponseContent = response.responseText;
          tokensUsed = response.tokensUsed;
          apiUsed = activeAPI;
      }
      
      const systemMessage: Message = { id: Date.now() + 2, role: 'system', content: systemResponseContent, timestamp: new Date().toISOString(), mode };
      updateChatMessages(selectedChat.id, systemMessage, tokensUsed, apiUsed);
      return systemResponseContent;
  };

  return (
    <ChatContext.Provider value={{
      user, chats, selectedChat, systemStatus,
      selectChat: setSelectedChat, createNewChat, deleteChat, renameChat, sendMessage, login, logout
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};