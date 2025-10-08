import { PISTON_API_URL, SUPPORTED_LANGUAGES } from '@/config/piston';

interface PistonExecuteRequest {
  language: string;
  version: string;
  files: Array<{
    name?: string;
    content: string;
  }>;
  stdin?: string;
  args?: string[];
  compile_timeout?: number;
  run_timeout?: number;
  compile_memory_limit?: number;
  run_memory_limit?: number;
}

interface PistonExecuteResponse {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: string | null;
  };
  compile?: {
    stdout: string;
    stderr: string;
    output: string;
    code: number;
    signal: string | null;
  };
}

/**
 * Execute code using Piston API
 */
export const executeCode = async ({
  code,
  language,
  stdin = '',
  version = '*',
  args = [],
  timeout = 30000, // Increased timeout for API calls
}: {
  code: string;
  language: string;
  stdin?: string;
  version?: string;
  args?: string[];
  timeout?: number;
}): Promise<PistonExecuteResponse> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const langConfig = SUPPORTED_LANGUAGES.find(lang => lang.value === language);
    if (!langConfig) {
      throw new Error(`Unsupported language: ${language}`);
    }

    // Use our API route instead of calling Piston directly
    const response = await fetch('/api/piston', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        language: langConfig.runtime,
        // Forward the requested version directly (use '*' to let Piston choose latest)
        version: version || '*',
        stdin,
        args,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      // Try to parse JSON; if it fails, capture raw text for diagnostics
      let parsedError: any = null;
      let rawText = '';
      try {
        parsedError = await response.json();
      } catch {
        try {
          rawText = await response.text();
        } catch {}
      }
      console.error('API route error', {
        status: response.status,
        statusText: response.statusText,
        error: parsedError,
        body: rawText,
      });
      const message = (parsedError && (parsedError.error || parsedError.message))
        || rawText
        || `Failed to execute code (status ${response.status})`;
      throw new Error(message);
    }

    const data = await response.json();
    console.log('API response:', data);

    // Transform the response to match the expected format
    return {
      language: data.language || language,
      version: data.version || version,
      run: {
        stdout: data.run?.stdout || data.run?.output || '',
        stderr: data.run?.stderr || '',
        output: data.run?.output || data.run?.stdout || '',
        code: data.run?.code || (data.run?.stderr ? 1 : 0),
        signal: data.run?.signal || null,
      },
      compile: data.compile ? {
        stdout: data.compile.stdout || '',
        stderr: data.compile.stderr || '',
        output: data.compile.output || '',
        code: data.compile.code || 0,
        signal: data.compile.signal || null,
      } : undefined,
    };
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      // Re-throw the error with our enhanced message
      throw error;
    }
    throw new Error('An unknown error occurred while executing the code');
  }
}

/**
 * Get the latest runtimes from Piston API
 */
export const getRuntimes = async (): Promise<Array<{
  language: string;
  version: string;
  aliases: string[];
  runtime?: string;
}>> => {
  try {
    // Return the supported languages from our config
    return SUPPORTED_LANGUAGES.map(lang => ({
      language: lang.runtime || lang.value,
      version: lang.version,
      aliases: [lang.value],
      runtime: lang.runtime || lang.value,
    }));
  } catch (error) {
    console.error('Error getting runtimes, using defaults:', error);
    // Return a default set of runtimes if something goes wrong
    return SUPPORTED_LANGUAGES.map(lang => ({
      language: lang.runtime || lang.value,
      version: lang.version,
      aliases: [lang.value],
      runtime: lang.runtime || lang.value,
    }));
  }
}

/**
 * Get file extension for a programming language
 */
export function getFileExtension(language: string): string {
  // First check if we have the language in our SUPPORTED_LANGUAGES with an extension
  const langConfig = SUPPORTED_LANGUAGES.find(lang => 
    lang.value.toLowerCase() === language.toLowerCase() ||
    lang.runtime.toLowerCase() === language.toLowerCase()
  );

  if (langConfig && 'extension' in langConfig && langConfig.extension) {
    return langConfig.extension;
  }

  // Fallback to a default set of extensions
  const extensions: Record<string, string> = {
    python: 'py',
    javascript: 'js',
    typescript: 'ts',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    go: 'go',
    rust: 'rs',
    php: 'php',
    ruby: 'rb',
    swift: 'swift',
    kotlin: 'kt',
    csharp: 'cs',
    lua: 'lua',
    r: 'r',
    bash: 'sh',
    shell: 'sh',
    html: 'html',
    css: 'css',
    json: 'json',
    markdown: 'md',
    text: 'txt'
  };

  return extensions[language] || 'txt';
}
