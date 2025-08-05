import { SUPPORTED_LANGUAGES } from '@/config/piston';

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.warn('GROQ_API_KEY is not set. Code generation will not work.');
}

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function generateCodeWithGroq(instruction: string, language: string): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key is not configured');
  }

  const langConfig = SUPPORTED_LANGUAGES.find(lang => lang.value === language);
  if (!langConfig) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: `You are a helpful coding assistant that generates clean, efficient, and well-commented code. 
      Always respond with just the code, no additional explanations or markdown code blocks.`
    },
    {
      role: 'user',
      content: `Write a ${language} program that: ${instruction}\n\n` +
        `Requirements:\n` +
        `1. Include detailed comments explaining the code\n` +
        `2. Follow best practices for ${language}\n` +
        `3. Make sure the code is complete and runnable`
    }
  ];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages,
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw new Error('Failed to generate code. Please try again later.');
  }
}
