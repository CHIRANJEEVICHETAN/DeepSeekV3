import React from 'react';
import { Settings, MessageCircle, ChevronLeft, Moon, Sun, Bell, BellOff, Volume2, VolumeX, Plus, Trash2 } from 'lucide-react';
import { Chat } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Chat[];
  activeChat: string | null;
  settings: {
    theme: 'dark' | 'light';
    notifications: boolean;
    soundEnabled: boolean;
  };
  onCreateNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onUpdateSettings: (settings: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  chats,
  activeChat,
  settings,
  onCreateNewChat,
  onSelectChat,
  onDeleteChat,
  onUpdateSettings,
}) => {
  return (
    <div
      className={`fixed inset-y-0 left-0 w-80 bg-gray-800 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } z-50`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Chats
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={onCreateNewChat}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`p-3 rounded-lg cursor-pointer group relative ${
                chat.id === activeChat
                  ? 'bg-blue-600/20 text-blue-100'
                  : 'bg-gray-700/50 text-gray-200 hover:bg-gray-700'
              }`}
              onClick={() => onSelectChat(chat.id)}
            >
              <h3 className="font-medium truncate pr-8">{chat.title}</h3>
              <span className="text-xs text-gray-400 block mt-1">
                {chat.lastUpdated.toLocaleString()}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5" />
            Settings
          </h3>
          <div className="space-y-4">
            <button
              onClick={() =>
                onUpdateSettings({
                  theme: settings.theme === 'dark' ? 'light' : 'dark',
                })
              }
              className="w-full p-2 flex items-center justify-between text-gray-300 hover:text-white transition-colors"
            >
              <span>Theme</span>
              {settings.theme === 'dark' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() =>
                onUpdateSettings({ notifications: !settings.notifications })
              }
              className="w-full p-2 flex items-center justify-between text-gray-300 hover:text-white transition-colors"
            >
              <span>Notifications</span>
              {settings.notifications ? (
                <Bell className="w-5 h-5" />
              ) : (
                <BellOff className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() =>
                onUpdateSettings({ soundEnabled: !settings.soundEnabled })
              }
              className="w-full p-2 flex items-center justify-between text-gray-300 hover:text-white transition-colors"
            >
              <span>Sound</span>
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};