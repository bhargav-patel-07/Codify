import { SUPPORTED_LANGUAGES } from '@/config/piston';

// Using OpenRouter API with Grok model
const API_KEY = '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';
const MODEL = 'x-ai/grok-4-fast:free';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

if (!API_KEY) {
  console.warn('API key is not set. Code generation will not work.');
}

export interface AIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function generateCodeWithGroq(instruction: string, language: string = 'python'): Promise<string> {
  if (!API_KEY) {
    throw new Error('API key is not configured');
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

  const messages: AIChatMessage[] = [
    {
      role: 'system',
      content: `You are a helpful coding assistant that generates clean, efficient, and well-commented code. 
      The user wants to write code in ${langToUse}. 
      Only respond with the code, no explanations or markdown formatting.`
    },
    {
      role: 'user',
      content: instruction
    }
  ];

  console.log('Sending request to AI API with messages:', JSON.stringify(messages, null, 2));

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to call AI API...`);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'HTTP-Referer': 'https://your-site.com', // Required for OpenRouter
          'X-Title': 'Code Editor' // Optional, shown in OpenRouter logs
        },
        body: JSON.stringify({
          model: MODEL,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2048
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API error:', errorText);
        
        // If it's a rate limit or server error, wait and retry
        if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        throw new Error(`AI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Received response from AI API:', JSON.stringify(data, null, 2));
      
      // Handle OpenRouter response format
      let generatedCode = data.choices?.[0]?.message?.content?.trim() || '';
      
      generatedCode = generatedCode
        .replace(/^```(?:\w+)?\s*([\s\S]*?)\s*```$/g, '$1')
        .replace(/```/g, '')
        .trim();
      
      // If the code is empty or too short, it might be an error
      if (!generatedCode || generatedCode.length < 5) {
        throw new Error('Generated code is empty or too short');
      }
      
      return generatedCode;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      lastError = error as Error;
      
      // If this is the last attempt, don't wait before retrying
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  // If we get here, all attempts failed
  console.error('All attempts to call AI API failed');
  throw lastError || new Error('Failed to generate code after multiple attempts');
}
