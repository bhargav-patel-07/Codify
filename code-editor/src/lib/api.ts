// Update with your actual backend URL
const API_BASE_URL = 'http://localhost:8000';

// Helper function to handle API responses
async function handleResponse(response: Response) {
  console.log(`[API] ${response.url} - Status: ${response.status}`);
  
  // Clone the response so we can read it multiple times if needed
  const responseClone = response.clone();
  
  // First, try to parse the response as JSON
  try {
    const data = await responseClone.json();
    if (!response.ok) {
      console.error('[API Error]', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        data
      });
      throw new Error(data.detail || data.message || 'An error occurred');
    }
    return data;
  } catch (e) {
    // If JSON parsing fails, try to read as text
    try {
      const text = await response.text();
      console.error('[API Error - Non-JSON Response]', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        responseText: text
      });
      throw new Error(`Request failed with status ${response.status}: ${text}`);
    } catch (textError) {
      console.error('[API Error - Failed to read response]', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        error: textError
      });
      throw new Error(`Request failed with status ${response.status}: Failed to read response`);
    }
  }
  console.log(`API Response - Status: ${response.status} ${response.statusText}`);
  
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    let errorDetails: Record<string, unknown> = {};
    
    try {
      const errorData = await response.json().catch(() => ({}));
      errorMessage = errorData.detail || errorData.message || errorMessage;
      errorDetails = errorData;
    } catch (e) {
      const text = await response.text();
      console.error('Failed to parse error response:', e, 'Response text:', text);
    }
    
    const error = new Error(errorMessage);
    (error as any).response = {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      data: errorDetails
    };
    
    console.error('API Error:', {
      message: error.message,
      ...(error as any).response
    });
    
    throw error;
  }
  
  try {
    const data = await response.json();
    console.log('API Response Data:', data);
    return data;
  } catch (e) {
    console.error('Failed to parse successful response:', e);
    throw new Error('Failed to parse server response');
  }
}

export interface TaskRequest {
  description: string;
  language?: string;
  files?: string[];
  requirements?: string;
}

export interface TaskResponse {
  task_id: string;
  status: string;
  message: string;
}

export interface CodeAnalysisRequest {
  code: string;
  language: string;
  analysis_type?: string;
}

export interface CodeAnalysisResponse {
  suggestions: string[];
  issues: string[];
  improvements: string[];
  score: number;
}

export const api = {
  // Get supported programming languages
  async getLanguages(): Promise<string[]> {
    const url = `${API_BASE_URL}/api/languages`;
    console.log(`[API] Fetching languages from: ${url}`);
    
    try {
      // First check if we can even reach the server
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        cache: 'no-cache',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('[API] Raw response:', response);
      const data = await handleResponse(response);
      console.log('[API] Languages received:', data);
      
      // Ensure we return an array of strings
      if (Array.isArray(data)) {
        return data.filter(item => typeof item === 'string');
      }
      
      console.warn('[API] Expected array of languages but got:', data);
      return [];
    } catch (error: unknown) {
      const errorObj = error as Error & { name: string; message: string; stack?: string };
      const isNetworkError = errorObj.name === 'AbortError' || errorObj.message.includes('Failed to fetch');
      
      console.error('[API] Error in getLanguages:', {
        name: errorObj.name,
        message: errorObj.message,
        stack: errorObj.stack,
        isNetworkError
      });
      
      // If it's a network error or timeout, return default languages
      if (isNetworkError) {
        console.warn('[API] Using default languages due to network error');
        return ['python', 'javascript', 'typescript', 'java', 'cpp', 'c', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin'];
      }
      
      throw error;
    }
  },

  // Create a new coding task
  async createTask(task: TaskRequest): Promise<TaskResponse> {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create task');
    }
    
    return response.json();
  },

  // Get task status
  async getTaskStatus(taskId: string): Promise<TaskResponse> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response) as Promise<TaskResponse>;
  },

  // Analyze code
  async analyzeCode(request: CodeAnalysisRequest): Promise<CodeAnalysisResponse> {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to analyze code');
    }
    
    return response.json();
  },
};
