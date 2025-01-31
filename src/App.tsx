import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ExamplePrompts } from './components/ExamplePrompts';
import { Sidebar } from './components/Sidebar';
import { useChat } from './hooks/useChat';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Square } from 'lucide-react';
import { Chat } from './types';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { messages, isLoading, error, sendMessage, clearChat, stopGeneration, updateMessages, handleImageUpload } = useChat();
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
  const [showExamplePrompts, setShowExamplePrompts] = useState(true);
  const [showApiKeyAlert, setShowApiKeyAlert] = useState(
    !import.meta.env.VITE_DEEPSEEK_API_KEY && !localStorage.getItem('deepseek_api_key')
  );

  useEffect(() => {
    if (activeChat) {
      updateChat(activeChat, {
        messages: messages,
        lastUpdated: new Date()
      });
    }
  }, [messages, activeChat]);

  const handleSendMessage = (content: string) => {
    // Check for API key first
    if (!import.meta.env.VITE_DEEPSEEK_API_KEY && !localStorage.getItem('deepseek_api_key')) {
      setIsSidebarOpen(true);
      setShowApiKeyAlert(true);
      return;
    }

    if (!activeChat) {
      const newChatId = createNewChat();
      setActiveChat(newChatId);
    }
    setShowExamplePrompts(false);
    sendMessage(content);
  };

  const handleNewChat = () => {
    clearChat();
    createNewChat();
    setShowExamplePrompts(true);
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

  const handleUpdateChat = (chatId: string, updates: Partial<Chat>) => {
    updateChat(chatId, updates);
  };

  const handleEditMessage = (messageIndex: number, newContent: string) => {
    if (messages[messageIndex]?.isUser) {
      // Only update if content has changed
      if (messages[messageIndex].content !== newContent) {
        const updatedMessages = messages.slice(0, messageIndex + 1);
        updatedMessages[messageIndex] = {
          ...updatedMessages[messageIndex],
          content: newContent,
        };
        
        updateMessages(updatedMessages);
        sendMessage(newContent, true);
      }
    }
  };

  // Add theme-specific classes
  const themeClasses = {
    dark: 'bg-gray-900 text-white',
    light: 'bg-white text-gray-900',
  };

  return (
    <div className={`min-h-screen flex flex-col ${themeClasses[settings.theme]}`}>
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      
      {showApiKeyAlert && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-yellow-500/90 text-white px-6 py-3 rounded-lg shadow-lg backdrop-blur-sm flex items-center gap-3 animate-slideDown">
          <span>⚠️ Please set your API key in Settings to start chatting</span>
          <button 
            onClick={() => setShowApiKeyAlert(false)}
            className="text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

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
        onUpdateChat={handleUpdateChat}
      />
      
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 flex flex-col animate-fadeIn">
        <div className="flex-1 space-y-4 mb-4 relative">
          {messages.map((message, index) => (
            <ChatMessage 
              key={index} 
              message={message} 
              isLatest={index === messages.length - 1}
              onEdit={handleEditMessage}
              messageIndex={index}
            />
          ))}
          {isLoading && (
            <div className="flex items-center justify-center gap-4">
              <LoadingSpinner />
              <button
                onClick={stopGeneration}
                className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Stop generating
              </button>
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-900/50 text-red-200 rounded-lg border border-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-900 pt-4 space-y-4">
          <ExamplePrompts 
            onSelectPrompt={(prompt) => handleSendMessage(prompt)} 
            show={showExamplePrompts && (!messages.length || !activeChat)}
          />
          <ChatInput 
            onSend={handleSendMessage} 
            onImageUpload={handleImageUpload}
            disabled={isLoading} 
          />
        </div>
      </main>
    </div>
  );
}

export default App;