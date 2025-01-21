import React, { useRef, useEffect } from 'react';
import { Lightbulb } from 'lucide-react';

const examplePrompts = [
  "Tell me about the latest advancements in AI",
  "How does quantum computing work?",
  "Explain the theory of relativity",
  "What are the best practices in software development?",
  "Describe the process of photosynthesis",
  "What are the key principles of machine learning?",
  "How do black holes work?",
  "Explain blockchain technology",
];

interface ExamplePromptsProps {
  onSelectPrompt: (prompt: string) => void;
  show: boolean; // New prop to control visibility
}

export const ExamplePrompts: React.FC<ExamplePromptsProps> = ({
  onSelectPrompt,
  show,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show) return;

    const scroll = () => {
      if (scrollRef.current) {
        if (
          scrollRef.current.scrollLeft >=
          scrollRef.current.scrollWidth - scrollRef.current.clientWidth
        ) {
          scrollRef.current.scrollLeft = 0;
        } else {
          scrollRef.current.scrollLeft += 1;
        }
      }
    };

    const interval = setInterval(scroll, 50);
    return () => clearInterval(interval);
  }, [show]);

  if (!show) return null;

  return (
    <div className="bg-gray-800/50 p-3 rounded-lg mb-4 animate-fadeIn">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-5 h-5 text-yellow-500 animate-pulse" />
        <span className="text-gray-300 text-sm">Example prompts</span>
      </div>
      <div
        ref={scrollRef}
        className="overflow-x-hidden whitespace-nowrap"
        style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
      >
        <div className="inline-flex gap-4 py-2">
          {[...examplePrompts, ...examplePrompts].map((prompt, index) => (
            <button
              key={index}
              onClick={() => onSelectPrompt(prompt)}
              className="px-4 py-2 bg-gray-700/50 text-gray-300 rounded-full hover:bg-blue-600/20 hover:text-blue-200 transition-all duration-200 whitespace-nowrap flex-shrink-0 hover:scale-105 transform"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};