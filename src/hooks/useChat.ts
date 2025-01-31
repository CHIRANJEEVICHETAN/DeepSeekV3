import { useState, useRef, useCallback } from 'react';
import { Message } from '../types';
import { fetchDeepSeekResponse, generateImage, generateAudio, analyzeImage } from '../services/api';

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

  const generateImageMessage = async (prompt: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add user message
      setMessages(prev => [...prev, {
        content: `/image ${prompt}`,
        type: 'text',
        isUser: true,
        timestamp: new Date()
      }]);

      console.log('Starting image generation for prompt:', prompt);
      const imageUrl = await generateImage(prompt);
      console.log('Received image URL:', imageUrl);
      
      // Add AI response with image
      setMessages(prev => [...prev, {
        content: `Generated image for: ${prompt}`,
        type: 'image',
        mediaUrl: imageUrl,
        mediaType: imageUrl.includes('image/png') ? 'image/png' : 'image/jpeg',
        isUser: false,
        timestamp: new Date()
      }]);
    } catch (error: any) {
      console.error('Image generation error:', error);
      setError(error.message || 'Failed to generate image. Please try again later.');
      // Remove any partial messages
      setMessages(prev => prev.filter(msg => msg.content !== ''));
    } finally {
      setIsLoading(false);
    }
  };

  const generateAudioMessage = async (text: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Add user message
      setMessages(prev => [...prev, {
        content: `/audio ${text}`,
        type: 'text',
        isUser: true,
        timestamp: new Date()
      }]);

      console.log('Generating audio for text:', text);
      const audioUrl = await generateAudio(text);
      console.log('Received audio URL:', audioUrl);

      // Add AI response with audio
      setMessages(prev => [...prev, {
        content: text,
        type: 'audio',
        mediaUrl: audioUrl,
        mediaType: 'audio/mpeg',
        isUser: false,
        timestamp: new Date()
      }]);
    } catch (error: any) {
      console.error('Audio generation error:', error);
      setError(error.message || 'Failed to generate audio. Please try again.');
      // Remove any partial messages
      setMessages(prev => prev.filter(msg => msg.content !== ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = useCallback(async (file: File, imageUrl: string) => {
    try {
      // Convert File to base64 for reliable URL handling
      const base64Image = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      setMessages(prev => [...prev, {
        content: 'Image uploaded. Use /vision followed by your question to analyze this image.',
        type: 'image',
        mediaUrl: base64Image, // Use base64 instead of blob URL
        mediaType: 'image/png',
        isUser: true,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error processing image:', error);
      setError('Failed to process image. Please try again.');
    }
  }, []);

  const analyzeLastImage = async (question: string) => {
    try {
      setIsLoading(true);
      
      const lastImage = [...messages].reverse().find(m => m.type === 'image');
      if (!lastImage?.mediaUrl) {
        setError('Please upload an image first');
        return;
      }

      // Add the user's question
      setMessages(prev => [...prev, {
        content: `/vision ${question}`,
        type: 'text',
        isUser: true,
        timestamp: new Date()
      }]);

      console.log('Analyzing image with URL:', lastImage.mediaUrl); // Debug log
      const analysis = await analyzeImage(lastImage.mediaUrl, question);
      
      setMessages(prev => [...prev, {
        content: analysis,
        type: 'text',
        isUser: false,
        timestamp: new Date()
      }]);

    } catch (error: any) {
      console.error('Image analysis error:', error);
      setError(`Failed to analyze image: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Update sendMessage to handle /vision command
  const sendMessage = useCallback(async (content: string, isEdited = false) => {
    if (!content.trim() || isLoading) return;

    if (content.toLowerCase().startsWith('/image')) {
      const prompt = content.slice(7);
      if (!prompt.trim()) {
        setError('Please provide a prompt for image generation');
        return;
      }
      await generateImageMessage(prompt);
      return;
    }

    if (content.toLowerCase().startsWith('/vision')) {
      const question = content.slice(8);
      if (!question.trim()) {
        setError('Please provide a question to analyze the image');
        return;
      }
      await analyzeLastImage(question);
      return;
    }

    if (content.toLowerCase().startsWith('/audio')) {
      const text = content.slice(7);
      if (!text.trim()) {
        setError('Please provide text for audio generation');
        return;
      }
      await generateAudioMessage(text);
      return;
    }

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
  }, [isLoading, messages]);

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
    handleImageUpload,
  };
};