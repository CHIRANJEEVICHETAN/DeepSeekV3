// Cache implementation
const responseCache = new Map<string, string>();
const CACHE_SIZE = 100;

const addToCache = (key: string, value: string) => {
  if (responseCache.size >= CACHE_SIZE) {
    // Remove oldest entry
    const firstKey = responseCache.keys().next().value;
    responseCache.delete(firstKey);
  }
  responseCache.set(key, value);
};

// Debounce function
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    return new Promise((resolve) => {
      timeout = setTimeout(() => resolve(func(...args)), wait);
    });
  };
};

export const fetchDeepSeekResponse = async (
  input: string,
  onPartialResponse: (partial: string) => void,
  signal?: AbortSignal
): Promise<string> => {
  // Check cache first
  const cachedResponse = responseCache.get(input);
  if (cachedResponse) {
    onPartialResponse(cachedResponse);
    return cachedResponse;
  }

  const url = 'https://api.hyperbolic.xyz/v1/chat/completions';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY || localStorage.getItem('deepseek_api_key')}`,
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: [{ role: 'user', content: input }],
        max_tokens: 512,
        temperature: 0.7,
        top_p: 0.9,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            if (line === 'data: [DONE]') continue;
            try {
              const data = JSON.parse(line.slice(5));
              const content = data.choices[0]?.delta?.content || '';
              if (content) {
                fullResponse += content;
                onPartialResponse(fullResponse.trim());
              }
            } catch (e) {
              console.warn('Failed to parse streaming response:', e);
            }
          }
        }
      }
    }

    // Add to cache
    addToCache(input, fullResponse.trim());
    return fullResponse.trim();
  } catch (error: any) {
    if (error.name === 'AbortError' || error.message === 'AbortError') {
      throw new Error('AbortError');
    }
    console.error('Error fetching DeepSeek-V3 response:', error);
    throw error;
  }
};

// Debounced version for rapid inputs
export const debouncedFetchResponse = debounce(fetchDeepSeekResponse, 300);