import React from 'react';
import { Brain, Github, ExternalLink, Star, Coffee, Menu } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onMenuClick}
              className="p-2 text-white/80 hover:text-white transition-colors hover:bg-white/10 rounded-lg mr-2"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Brain className="w-6 h-6 text-white animate-pulse" />
              </div>
              <h1 className="text-xl font-bold text-white">ChiruChetan AI Chat</h1>
            </div>
            <span className="px-2 py-1 text-xs font-medium text-white/80 bg-white/10 rounded-full">
              v1.0.0
            </span>
          </div>

          {/* Center Stats */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors">
              <div className="p-1.5 bg-white/10 rounded-lg">
                <Coffee className="w-4 h-4" />
              </div>
              <span className="text-sm">Powered by DeepSeek-V3</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center space-x-2 text-white/80">
              <Star className="w-4 h-4" />
              <span className="text-sm">Model: 7B</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/CHIRANJEEVICHETAN/DeepSeekV3"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-white/80 hover:text-white transition-colors hover:bg-white/10 rounded-lg"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://www.deepseek.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center space-x-2 text-white/80 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
            >
              <span className="text-sm font-medium">DeepSeek AI</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};