import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ExamplePrompts } from './components/ExamplePrompts';
import { Sidebar } from './components/Sidebar';
import { useChat } from './hooks/useChat';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Menu } from 'lucide-react';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { messages, isLoading, error, sendMessage, clearChat } = useChat();
  const {
    chats,
    activeChat,
    settings,
    createNewChat,
    updateChat,
    setActiveChat,
    deleteChat,
    updateSettings,
  } = useLocalStorage();

  useEffect(() => {
    if (activeChat) {
      updateChat(activeChat, messages);
    }
  }, [messages, activeChat]);

  const handleSendMessage = (content: string, image?: File) => {
    if (!activeChat) {
      const newChatId = createNewChat();
      setActiveChat(newChatId);
    }
    sendMessage(content);
  };

  const handleNewChat = () => {
    clearChat();
    createNewChat();
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChat(chatId);
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      clearChat();
      chat.messages.forEach(msg => sendMessage(msg.content));
    }
    setIsSidebarOpen(false);
  };

  return (
    <div className={`min-h-screen bg-gray-900 flex flex-col ${settings.theme}`}>
      <Header />
      
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed left-4 top-20 p-3 bg-gray-800 rounded-lg text-gray-300 hover:text-white transition-colors z-40"
      >
        <Menu className="w-5 h-5" />
      </button>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        chats={chats}
        activeChat={activeChat}
        settings={settings}
        onCreateNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={deleteChat}
        onUpdateSettings={updateSettings}
      />
      
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col">
        <div className="flex-1 space-y-4 mb-4">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {isLoading && <LoadingSpinner />}
          {error && (
            <div className="p-4 bg-red-900/50 text-red-200 rounded-lg border border-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-900 pt-4 space-y-4">
          <ExamplePrompts onSelectPrompt={(prompt) => handleSendMessage(prompt)} />
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </main>
    </div>
  );
}

export default App;