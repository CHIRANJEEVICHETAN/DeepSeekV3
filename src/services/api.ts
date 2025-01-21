import { ChatResponse } from '../types';

export const fetchDeepSeekResponse = async (input: string): Promise<string> => {
  const url = 'https://api.hyperbolic.xyz/v1/chat/completions';
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjaGlyYW5qZWV2aWNoZXRhbjE5OTZAZ21haWwuY29tIiwiaWF0IjoxNzM1NDUxNTQxfQ.acTOnzAIChARt5pOClNFY5pSiM1mF3SF69ojQ7p3-3c',
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3',
        messages: [
          {
            role: 'user',
            content: input,
          },
        ],
        max_tokens: 512,
        temperature: 0.1,
        top_p: 0.9,
        stream: false,
      }),
    });
    const json = await response.json();
    return json.choices[0].message.content;
  } catch (error) {
    console.error('Error fetching DeepSeek-V3 response:', error);
    return 'Error: Unable to process your request.';
  }
};