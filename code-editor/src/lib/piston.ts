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
export async function executeCode({
  code,
  language,
  stdin = '',
  version = '*',
  args = []
}: {
  code: string;
  language: string;
  stdin?: string;
  version?: string;
  args?: string[];
}): Promise<PistonExecuteResponse> {
  // Find the runtime for the selected language
  const langConfig = SUPPORTED_LANGUAGES.find(lang => lang.value === language);
  if (!langConfig) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const payload: PistonExecuteRequest = {
    language: langConfig.runtime,
    version: langConfig.version || '*',
    files: [
      {
        name: `main.${getFileExtension(language)}`,
        content: code
      }
    ],
    stdin,
    args,
    compile_timeout: 10000, // 10 seconds
    run_timeout: 10000, // 10 seconds
    run_memory_limit: 1024 * 1024 * 100, // 100MB
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

  try {
    // First check if the runtime is available
    const runtimes = await getRuntimes();
    const runtimeAvailable = runtimes.some(
      r => r.language === langConfig.runtime && r.version === langConfig.version
    );

    if (!runtimeAvailable) {
      const availableVersions = runtimes
        .filter(r => r.language === langConfig.runtime)
        .map(r => r.version);
      
      if (availableVersions.length > 0) {
        throw new Error(
          `Runtime ${langConfig.runtime} ${langConfig.version} is not available. ` +
          `Available versions: ${availableVersions.join(', ')}`
        );
      } else {
        throw new Error(
          `Runtime ${langConfig.runtime} is not available on this server. ` +
          `Available runtimes: ${[...new Set(runtimes.map(r => r.language))].join(', ')}`
        );
      }
    }

    const response = await fetch(`${PISTON_API_URL}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.text().catch(() => 'Unknown error');
      let errorMessage = `API error: ${response.status} - ${error}`;
      
      // Add more user-friendly error messages for common issues
      if (response.status === 400 && error.includes('runtime is unknown')) {
        errorMessage = `The selected runtime (${langConfig.runtime} ${langConfig.version}) is not available. ` +
                      `Please try a different language or version.`;
      }
      
      throw new Error(errorMessage);
    }

    return await response.json();
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
export async function getRuntimes(): Promise<Array<{
  language: string;
  version: string;
  aliases: string[];
  runtime?: string;
}>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const response = await fetch(`${PISTON_API_URL}/runtimes`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch runtimes: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Error fetching runtimes:', error);
    // Return a default set of runtimes if the API is not available
    return SUPPORTED_LANGUAGES.map(lang => ({
      language: lang.runtime,
      version: 'latest',
      aliases: [lang.value],
      runtime: lang.runtime,
    }));
  }
}

/**
 * Get file extension for a programming language
 */
export function getFileExtension(language: string): string {
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
    kotlin: 'kt'
  };

  return extensions[language] || 'txt';
}
