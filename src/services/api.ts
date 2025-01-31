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
        messages: [
          { role: 'system', content: "As an advanced AI language model, you are to employ a structured 'Think-Plan-Execute' methodology for each task or query presented. This approach involves:\n\nThink: Begin by thoroughly analyzing the problem at hand. Consider all relevant factors, constraints, and potential challenges. Reflect on prior knowledge and experiences that may inform your understanding of the task.\n\nPlan: Develop a detailed and logical plan to address the problem. Outline the necessary steps in a coherent sequence, ensuring that each step logically follows from the previous one. Anticipate possible obstacles and incorporate strategies to overcome them.\n\nExecute: Implement the plan step-by-step. For each step, provide clear explanations and justifications for the actions taken. Ensure that the execution is thorough and aligns with the outlined plan.\n\nThis structured methodology is designed to enhance your reasoning capabilities, ensuring comprehensive and accurate responses. By following this approach, you will emulate the reasoning process characteristic of the DeepSeek R1 model, which emphasizes systematic analysis, meticulous planning, and deliberate execution in problem-solving." },
          { role: 'user', content: input }
        ],
        max_tokens: 131072,
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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export const generateImage = async (
  prompt: string,
  options = {
    steps: 30,
    cfg_scale: 5,
    enable_refiner: false,
    height: 1024,
    width: 1024,
  }
): Promise<string> => {
  const url = 'https://api.hyperbolic.xyz/v1/image/generation';
  let retryCount = 0;
  
  while (retryCount < MAX_RETRIES) {
    try {
      console.log('Generating image with prompt:', prompt);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY || localStorage.getItem('deepseek_api_key')}`,
        },
        body: JSON.stringify({
          model_name: 'FLUX.1-dev',
          prompt,
          steps: options.steps,
          cfg_scale: options.cfg_scale,
          enable_refiner: options.enable_refiner,
          height: options.height,
          width: options.width,
          backend: 'auto'
        }),
      });

      if (response.status === 429) {
        retryCount++;
        const retryAfter = response.headers.get('Retry-After');
        const delayMs = retryAfter ? parseInt(retryAfter) * 1000 : INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`Rate limited. Retrying in ${delayMs/1000} seconds...`);
        await sleep(delayMs);
        continue;
      }

      const responseData = await response.json();
      console.log('Image generation response:', responseData);

      if (!response.ok) {
        throw new Error(`Failed to generate image: ${response.status} - ${responseData.error?.message || 'Unknown error'}`);
      }

      // Extract image data from response
      if (responseData.images?.[0]) {
        const imageData = responseData.images[0];
        
        // If it's a base64 string directly
        if (typeof imageData === 'string') {
          return `data:image/png;base64,${imageData}`;
        }
        
        // If it's an object with image property (base64)
        if (imageData.image) {
          return `data:image/png;base64,${imageData.image}`;
        }

        console.log('Received image data:', imageData);
        throw new Error('No image data found in response');
      }

      throw new Error('No images in response');

    } catch (error) {
      if (error instanceof Error && error.message.includes('429')) {
        retryCount++;
        const delayMs = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`Rate limited. Retrying in ${delayMs/1000} seconds...`);
        await sleep(delayMs);
        continue;
      }
      console.error('Image generation error:', error);
      throw error;
    }
  }

  throw new Error('Max retries exceeded. Please try again later.');
};

export const generateAudio = async (
  text: string,
  speed = 1
): Promise<string> => {
  const url = 'https://api.hyperbolic.xyz/v1/audio/generation';
  
  try {
    console.log('Generating audio for:', text);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY || localStorage.getItem('deepseek_api_key')}`,
      },
      body: JSON.stringify({
        text,
        speed
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Audio Generation API Error:', errorData);
      throw new Error(`Failed to generate audio: ${response.status}`);
    }

    const json = await response.json();
    console.log('Audio generation response:', json);

    if (!json.audio) {
      throw new Error('No audio data in response');
    }

    // Convert the audio data to a data URL
    return `data:audio/mp3;base64,${json.audio}`;
  } catch (error) {
    console.error('Audio generation error:', error);
    throw error;
  }
};

export const analyzeImage = async (
  imageUrl: string,
  question: string
): Promise<string> => {
  const url = 'https://api.hyperbolic.xyz/v1/chat/completions';
  
  try {
    console.log('Analyzing image:', { imageUrl, question }); // Debug log

    const requestBody = {
      model: 'Qwen/Qwen2-VL-72B-Instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: "text", text: question },
            { 
              type: "image_url", 
              image_url: { 
                url: imageUrl,
                detail: "high"
              } 
            }
          ]
        }
      ],
      max_tokens: 2048,
      temperature: 0.7,
      top_p: 0.9,
      stream: false
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2)); // Debug log

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY || localStorage.getItem('deepseek_api_key')}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();
    console.log('API Response:', responseData); // Debug log

    if (!response.ok) {
      console.error('Vision API Error:', responseData);
      throw new Error(`Vision analysis failed: ${response.status} - ${responseData.error?.message || 'Unknown error'}`);
    }

    if (!responseData.choices?.[0]?.message?.content) {
      console.error('Invalid response format:', responseData);
      throw new Error('No analysis was generated');
    }

    return responseData.choices[0].message.content;
  } catch (error) {
    console.error('Vision analysis error:', error);
    throw error;
  }
};