import React from 'react';
import { Brain } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full bg-gradient-to-r from-blue-600 to-purple-600 p-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-2">
        <Brain className="w-8 h-8 text-white" />
        <h1 className="text-2xl font-bold text-white">DeepSeek Chat</h1>
      </div>
    </header>
  );
};