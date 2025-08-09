import { SUPPORTED_LANGUAGES } from '@/config/piston';

const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.warn('GROQ_API_KEY is not set. Code generation will not work.');
}

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function generateCodeWithGroq(instruction: string, language: string | undefined): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key is not configured');
  }

  // Default to python if language is not provided or not found in supported languages
  const defaultLanguage = 'python';
  const langToUse = language || defaultLanguage;
  
  const langConfig = SUPPORTED_LANGUAGES.find(lang => lang.value === langToUse);
  if (!langConfig) {
    console.warn(`Language '${langToUse}' not found in supported languages, defaulting to '${defaultLanguage}'`);
    // Fall back to python if the provided language is not supported
    return generateCodeWithGroq(instruction, defaultLanguage);
  }

  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: `You are a helpful coding assistant that generates clean, efficient, and well-commented code. 
      Respond with just the code, no additional explanations or markdown code blocks.`
    },
    {
      role: 'user',
      content: `Write a ${langToUse} program that: ${instruction}\n\n` +
        `Requirements:\n` +
        `1. Include detailed comments explaining the code\n` +
        `2. Follow best practices for ${langToUse}\n` +
        `3. Make sure the code is complete and runnable\n` +
        `4. Do not include any markdown code blocks or backticks`
    }
  ];

  console.log('Sending request to Groq API with messages:', JSON.stringify(messages, null, 2));

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to call Groq API...`);
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages,
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Groq API error:', errorText);
        
        // If it's a rate limit or server error, wait and retry
        if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Received response from Groq API:', JSON.stringify(data, null, 2));
      
      let generatedCode = data.choices[0]?.message?.content?.trim() || '';
      
      // Remove any markdown code blocks if present
      generatedCode = generatedCode.replace(/^```(?:\w+)?\n([\s\S]*?)\n```/g, '$1');
      
      console.log('Processed generated code:', generatedCode);
      return generatedCode;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed:`, error);
      
      // If it's not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  // If we get here, all attempts failed
  console.error('All attempts to call Groq API failed');
  throw lastError || new Error('Failed to generate code after multiple attempts');
}
