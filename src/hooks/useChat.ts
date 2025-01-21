import { useState, useRef, useCallback } from 'react';
import { Message } from '../types';
import { fetchDeepSeekResponse } from '../services/api';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messageQueueRef = useRef<string[]>([]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
      // Remove error message when manually stopped
      setError(null);
    }
  }, []);

  const updateMessages = useCallback((newMessages: Message[] | ((prev: Message[]) => Message[])) => {
    if (typeof newMessages === 'function') {
      setMessages(newMessages);
    } else {
      setMessages(newMessages);
    }
  }, []);

  const sendMessage = useCallback(async (content: string, isEdited = false) => {
    if (!content.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    abortControllerRef.current = new AbortController();

    // Only add user message if it's not an edit
    if (!isEdited) {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.isUser && lastMessage.content === content) {
          return prev;
        }
        
        return [...prev, {
          content,
          isUser: true,
          timestamp: new Date(),
        }];
      });
    }

    // Add AI message placeholder
    setMessages(prev => [...prev, {
      content: '',
      isUser: false,
      timestamp: new Date(),
    }]);

    try {
      let lastUpdateTime = Date.now();
      const updateThrottleMs = 50;

      await fetchDeepSeekResponse(
        content,
        (partial) => {
          const now = Date.now();
          if (now - lastUpdateTime >= updateThrottleMs) {
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: partial,
              };
              return updated;
            });
            lastUpdateTime = now;
          }
        },
        abortControllerRef.current.signal
      );
    } catch (err: any) {
      console.error('Error in sendMessage:', err);
      if (err.message === 'AbortError') {
        setError('Generation stopped by user');
      } else {
        setError('Failed to get response. Please try again.');
        setMessages(prev => prev.slice(0, -1));
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isLoading]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    messageQueueRef.current = [];
    stopGeneration();
  }, [stopGeneration]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    stopGeneration,
    updateMessages,
  };
};