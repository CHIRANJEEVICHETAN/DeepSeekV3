import React, { useState } from 'react';
import { Settings, MessageCircle, ChevronLeft, Bell, BellOff, Volume2, VolumeX, Plus, Trash2, Edit2, Check } from 'lucide-react';
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
  onUpdateChat: (chatId: string, updatedChat: Partial<Chat>) => void;
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
  onUpdateChat,
}) => {
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('deepseek_api_key') || '');

  const handleEditStart = (chat: Chat) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleEditSave = () => {
    if (editingChatId && editTitle.trim()) {
      onUpdateChat(editingChatId, { title: editTitle.trim() });
      setEditingChatId(null);
    }
  };

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
              onClick={() => !editingChatId && onSelectChat(chat.id)}
            >
              {editingChatId === chat.id ? (
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditSave();
                      if (e.key === 'Escape') setEditingChatId(null);
                    }}
                    className="bg-gray-600 text-white px-2 py-1 rounded-md w-full"
                    autoFocus
                  />
                  <button
                    onClick={handleEditSave}
                    className="p-1 text-green-400 hover:text-green-300"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-medium truncate pr-16">{chat.title}</h3>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditStart(chat);
                      }}
                      className="p-1.5 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-blue-400 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      className="p-1.5 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
              <span className="text-xs text-gray-400 block mt-1">
                {chat.lastUpdated.toLocaleString()}
              </span>
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => onUpdateSettings({ theme: e.target.value as 'dark' | 'light' })}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>

            <button
              onClick={() => setIsApiModalOpen(true)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Set API Key
            </button>

            {isApiModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full space-y-4">
                  <h3 className="text-lg font-semibold text-white">Set DeepSeek API Key</h3>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsApiModalOpen(false)}
                      className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        localStorage.setItem('deepseek_api_key', apiKey);
                        setIsApiModalOpen(false);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};