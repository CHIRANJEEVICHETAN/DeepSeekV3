import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { StoredData, Chat, Message, Settings } from '../types';

const STORAGE_KEY = 'chat_data';
const MAX_CHATS = 50;

const defaultSettings: Settings = {
  theme: 'dark',
  notifications: true,
  soundEnabled: true,
};

export const useLocalStorage = () => {
  const [data, setData] = useState<StoredData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    return { 
      chats: [], 
      settings: defaultSettings, 
      activeChat: null 
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [data]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      lastUpdated: new Date(),
    };

    setData(prev => {
      const chats = [newChat, ...prev.chats].slice(0, MAX_CHATS);
      return {
        ...prev,
        chats,
        activeChat: newChat.id,
      };
    });

    return newChat.id;
  };

  const updateChat = (chatId: string, messages: Message[]) => {
    setData(prev => {
      const chats = prev.chats.map(chat => {
        if (chat.id === chatId) {
          const title = messages[0]?.content.slice(0, 30) + '...' || 'New Chat';
          return {
            ...chat,
            title,
            messages,
            lastUpdated: new Date().toISOString(),
          };
        }
        return chat;
      });
      return { ...prev, chats };
    });
  };

  const setActiveChat = (chatId: string) => {
    setData(prev => ({ ...prev, activeChat: chatId }));
  };

  const deleteChat = (chatId: string) => {
    setData(prev => {
      const chats = prev.chats.filter(chat => chat.id !== chatId);
      const activeChat = prev.activeChat === chatId ? null : prev.activeChat;
      return { ...prev, chats, activeChat };
    });
  };

  const updateSettings = (settings: Partial<Settings>) => {
    setData(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings },
    }));
  };

  return {
    chats: data.chats.map(chat => ({
      ...chat,
      lastUpdated: new Date(chat.lastUpdated),
    })),
    activeChat: data.activeChat,
    settings: data.settings,
    createNewChat,
    updateChat,
    setActiveChat,
    deleteChat,
    updateSettings,
  };
};