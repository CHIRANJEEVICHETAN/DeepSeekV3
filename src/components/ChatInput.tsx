import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { ImageUpload } from './ImageUpload';

interface ChatInputProps {
  onSend: (message: string) => void;
  onImageUpload: (file: File, imageUrl: string) => void;
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onImageUpload, disabled }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
      setSelectedImage(null);
      setIsExpanded(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-gray-700/50 relative">
        {isExpanded && (
          <ImageUpload
            onImageUpload={onImageUpload}
            selectedImage={selectedImage}
            onClearImage={() => setSelectedImage(null)}
          />
        )}
        <div className="flex gap-2 items-start">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setIsExpanded(true)}
              placeholder="Type your message here... Use /image for image generation, /audio for audio generation, and /vision for vision capabilities."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-700/50 text-white placeholder-gray-400 
                border border-gray-600/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 
                resize-none min-h-[56px] max-h-[200px] transition-all shadow-inner
                backdrop-blur-sm"
              disabled={disabled}
              rows={1}
            />
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 
                hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-600/30"
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="px-5 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
              transition-all disabled:opacity-50 disabled:cursor-not-allowed 
              flex items-center justify-center min-w-[56px] h-[56px]
              shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 
              active:translate-y-0.5 active:shadow-md
              disabled:shadow-none disabled:hover:bg-blue-600
              border border-blue-500/50 hover:border-blue-400/50
              bg-gradient-to-b from-blue-500 to-blue-600
              -mt-0.4"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </form>
  );
};