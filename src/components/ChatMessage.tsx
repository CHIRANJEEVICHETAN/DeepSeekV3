import React, { useState, useRef } from 'react';
import { User, Bot, Copy, Check, Edit2, X, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { AudioMessage } from './AudioMessage';

interface ChatMessageProps {
  message: Message;
  isLatest: boolean;
  onEdit?: (messageId: number, newContent: string) => void;
  messageIndex: number;
}

export const ChatMessage = React.memo(({ message, isLatest, onEdit, messageIndex }: ChatMessageProps) => {
  const { content, isUser, type, mediaUrl } = message;
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const CodeBlock: React.FC<any> = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const codeRef = useRef<HTMLDivElement>(null);
    const [isCodeCopied, setIsCodeCopied] = useState(false);

    const handleCopyCode = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (codeRef.current) {
        try {
          // Get the actual code content without formatting
          const codeText = codeRef.current.querySelector('code')?.textContent || '';
          await navigator.clipboard.writeText(codeText);
          setIsCodeCopied(true);
          setTimeout(() => setIsCodeCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy code:', err);
        }
      }
    };

    if (!inline && match) {
      return (
        <div className="relative group" ref={codeRef}>
          <button
            onClick={handleCopyCode}
            className={`absolute top-2 right-2 p-1.5 rounded-lg ${
              isCodeCopied 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-gray-700/50 text-gray-400'
            } opacity-0 group-hover:opacity-100 hover:text-white transition-all duration-200 z-10`}
            title={isCodeCopied ? "Copied!" : "Copy code"}
          >
            {isCodeCopied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      );
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  };

  // Add typing indicator when it's the latest AI message and content is empty
  const showTypingIndicator = isLatest && !isUser && !content;

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditContent(content);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, 0);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() !== content && onEdit) {
      onEdit(messageIndex, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditContent(content);
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'image':
        return (
          <div className="max-w-lg">
            <img 
              src={mediaUrl} 
              alt={content}
              className="w-full h-auto rounded-lg shadow-lg object-contain bg-gray-800"
              loading="lazy"
              onError={(e) => {
                console.error('Image loading error:', e);
                const img = e.target as HTMLImageElement;
                img.onerror = null; // Prevent infinite loop
                img.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxsaW5lIHgxPSI2IiB5MT0iNiIgeDI9IjE4IiB5Mj0iMTgiPjwvbGluZT48bGluZSB4MT0iNiIgeTE9IjE4IiB4Mj0iMTgiIHkyPSI2Ij48L2xpbmU+PC9zdmc+'; // Show error icon
              }}
              style={{ minHeight: '200px', maxHeight: '512px' }}
            />
            <p className="mt-2 text-sm text-gray-400">{content}</p>
          </div>
        );
      case 'audio':
        return (
          <div className="w-full max-w-lg">
            <AudioMessage url={mediaUrl!} />
            <p className="mt-2 text-sm text-gray-400">{content}</p>
          </div>
        );
      default:
        return isUser ? (
          <p className="whitespace-pre-wrap">{content}</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: CodeBlock
            }}
          >
            {content}
          </ReactMarkdown>
        );
    }
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-messageIn`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-600' : 'bg-purple-600'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>
      <div
        className={`max-w-[80%] p-4 rounded-lg relative group ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-white'
        }`}
      >
        {isUser && !isEditing && (
          <button
            onClick={handleStartEdit}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 text-white/70 opacity-0 group-hover:opacity-100 hover:text-white transition-all"
            title="Edit message"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => {
                setEditContent(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent border border-white/20 rounded-lg p-2 focus:outline-none focus:border-white/40 resize-none"
              rows={1}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(content);
                }}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSaveEdit}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <>
            {showTypingIndicator ? (
              <div className="flex gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            ) : (
              <>
                {!isUser && (
                  <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-gray-700/50 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-white transition-all"
                    title="Copy message"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                )}
                <div className="prose prose-invert max-w-none">
                  {renderContent()}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
});