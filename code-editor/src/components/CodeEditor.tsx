'use client';

import { useState, useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Button } from './ui/button';
import { getFileExtension } from '@/lib/piston';
import { Play, Loader2, Sparkles, Wand2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { SUPPORTED_LANGUAGES, DEFAULT_CODE_TEMPLATES } from '@/config/piston';
import { executeCode, getRuntimes } from '@/lib/piston';
import { AiInstructionInput } from './AiInstructionInput';

// Use the languages from our config
const supportedLanguages = SUPPORTED_LANGUAGES;

interface CodeEditorProps {
  code: string;
  onCodeChange?: (code: string) => void; // Made optional
  language: string;
  onLanguageChange?: (language: string) => void;
  onClearEditor?: () => void;
  // Internal state for when onLanguageChange is not provided
  _setLanguage?: (language: string) => void; // Internal use only
}

interface LanguageOption {
  value: string;
  label: string;
  runtime?: string;
  version: string;
}

export default function CodeEditor({
  code,
  onCodeChange,
  language,
  onLanguageChange,
  onClearEditor,
}: CodeEditorProps): React.ReactNode {
  // Internal state for managing language when onLanguageChange is not provided
  const [internalLanguage, setInternalLanguage] = useState(language);
  
  // Use the provided onLanguageChange or fall back to internal state
  const handleLanguageChange = (newLanguage: string) => {
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    } else {
      setInternalLanguage(newLanguage);
    }
  };
  
  // Handle language change
  const handleLanguageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    handleLanguageChange(newLanguage);
  };

  // Determine which language to use based on props and internal state
  const currentLanguage = onLanguageChange ? language : internalLanguage;
  const [output, setOutput] = useState('');
  const [aiResponse, setAiResponse] = useState('Run code to see output here');
  const outputRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [input, setInput] = useState<string>('');
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  
  // Initialize with default template if code is empty
  useEffect(() => {
    console.log('CodeEditor mounted or language changed. Language:', language, 'Current code length:', code?.length || 0);
    
    // Only set default template if code is empty or not provided
    if (language && 
        DEFAULT_CODE_TEMPLATES[language as keyof typeof DEFAULT_CODE_TEMPLATES] && 
        (!code || code.trim() === '') && 
        onCodeChange) {
      const defaultCode = DEFAULT_CODE_TEMPLATES[language as keyof typeof DEFAULT_CODE_TEMPLATES] || '';
      console.log('Setting default code for language:', language);
      onCodeChange(defaultCode);
    }
  }, [language]); // Removed code and onCodeChange from dependencies to prevent loops
  
  // Fetch available languages from Piston API
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const runtimes = await getRuntimes();
        if (runtimes && runtimes.length > 0) {
          // Create a map to ensure unique languages
          const langMap = new Map();
          
          runtimes.forEach(runtime => {
            if (SUPPORTED_LANGUAGES.some(sl => sl.value === runtime.language)) {
              const langKey = runtime.language.toLowerCase();
              if (!langMap.has(langKey)) {
                langMap.set(langKey, {
                  value: runtime.language,
                  label: runtime.language.charAt(0).toUpperCase() + runtime.language.slice(1),
                  runtime: runtime.runtime || runtime.language,
                  version: runtime.version,
                });
              }
            }
          });
          
          const availableLangs = Array.from(langMap.values());
          
          setLanguages(availableLangs);
          
          // Set default language if not set
          if (availableLangs.length > 0 && !language) {
            if (onLanguageChange) {
              onLanguageChange(availableLangs[0].value);
            } else {
              // If onLanguageChange is not provided, use the internal state
              setInternalLanguage(availableLangs[0].value);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching languages:', error);
        setLanguages(SUPPORTED_LANGUAGES as LanguageOption[]);
      }
    };
    
    fetchLanguages();
  }, [language, onLanguageChange]);

  const handleClearEditor = () => {
    if (onCodeChange) {
      onCodeChange('');
    }
    setInput('');
    // Call the prop if it exists
    if (onClearEditor) {
      onClearEditor();
    }
    // Focus the editor after clearing
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleCodeGenerated = (generatedCode: string) => {
    // Clean up the generated code by removing markdown code blocks and backticks
    const cleanedCode = generatedCode
      // Remove code block markers with optional language specifier
      .replace(/^```(?:\w+)?\s*([\s\S]*?)\s*```$/g, '$1')
      // Remove any remaining backticks
      .replace(/```/g, '')
      // Remove any remaining language specifiers
      .replace(/^\w+\n---\n/g, '')
      // Trim whitespace
      .trim();

    // Display the cleaned code in the output area
    setAiResponse(cleanedCode);
    
    // Also update the editor with the cleaned code if needed
    if (onCodeChange) {
      onCodeChange(cleanedCode);
    }
    // Focus the editor after code is generated
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      // Modern clipboard API method
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } 
      // Fallback method for non-secure contexts
      else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        return new Promise<void>((resolve, reject) => {
          const success = document.execCommand('copy');
          document.body.removeChild(textArea);
          if (!success) {
            reject(new Error('Copy command was unsuccessful'));
            return;
          }
          resolve();
        });
      }
      toast.success('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
      
      // Fallback: Show the text in an alert for manual copy
      alert('Please copy the following text manually:\n\n' + text);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (onCodeChange) {
      onCodeChange(value || '');
    }
  };

  // Fetch supported languages on component mount
  useEffect(() => {
    const fetchAvailableLanguages = async () => {
      console.log('[CodeEditor] Fetching available runtimes...');
      try {
        const runtimes = await getRuntimes();
        console.log('[CodeEditor] Available runtimes:', runtimes);
        
        // Filter our supported languages based on available runtimes
        const availableLangs = supportedLanguages.filter(lang => 
          runtimes.some(runtime => runtime.language === lang.runtime || runtime.aliases?.includes(lang.value))
        );
        
        if (availableLangs.length > 0) {
          setLanguages(availableLangs);
          
          // If current language is not available, switch to the first available one
          if (!availableLangs.some(lang => lang.value === currentLanguage)) {
            const newLanguage = availableLangs[0].value;
            handleLanguageChange(newLanguage);
            onCodeChange?.(DEFAULT_CODE_TEMPLATES[newLanguage] || '');
          }
        } else {
          console.warn('[CodeEditor] No supported languages found in available runtimes, using all supported languages');
          setLanguages(supportedLanguages);
        }
      } catch (error: unknown) {
        const errorObj = error as Error & { name?: string; code?: string };
        console.error('[CodeEditor] Failed to fetch runtimes:', {
          name: errorObj.name,
          message: errorObj.message,
          code: errorObj.code,
          stack: errorObj.stack
        });
        
        // Fallback to all supported languages if we can't fetch runtimes
        console.warn('[CodeEditor] Using all supported languages as fallback');
        setLanguages(supportedLanguages);
      }
    };
    
    fetchAvailableLanguages();
  }, [language, onLanguageChange, onCodeChange]);

  // Initialize code with default template when language changes
  useEffect(() => {
    const lang = onLanguageChange ? language : internalLanguage;
    if (lang && 
        DEFAULT_CODE_TEMPLATES[lang as keyof typeof DEFAULT_CODE_TEMPLATES] && 
        onCodeChange) {
      onCodeChange(DEFAULT_CODE_TEMPLATES[lang as keyof typeof DEFAULT_CODE_TEMPLATES] || '');
    }
  }, [language, internalLanguage, onLanguageChange, onCodeChange]);

  // Update internal language when language prop changes
  useEffect(() => {
    setInternalLanguage(language);
  }, [language]);

  const handleEditorDidMount: OnMount = (editor) => {
    console.log('Editor mounted, setting initial code');
    editorRef.current = editor;
    
    // Set the initial value
    if (code) {
      console.log('Setting initial code in editor');
      editor.setValue(code);
    }
  };

  // Update editor content when code prop changes
  useEffect(() => {
    if (editorRef.current && code !== undefined) {
      console.log('Code prop changed, updating editor');
      const editor = editorRef.current;
      const model = editor.getModel();
      if (model) {
        // Only update if the content is actually different
        const currentValue = model.getValue();
        if (currentValue !== code) {
          console.log('Updating editor content');
          editor.setValue(code);
          // Move cursor to the beginning
          editor.setPosition({ lineNumber: 1, column: 1 });
        }
      }
    }
  }, [code]);

  // Auto-scroll output to bottom when it updates
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleRunCode = async () => {
    if (!code.trim()) {
      setOutput('Error: No code to execute');
      return;
    }

    setIsLoading(true);
    setOutput('Executing code...');

    try {
      const langConfig = languages.find(l => l.value === language);
      if (!langConfig) {
        throw new Error(`Unsupported language: ${language}`);
      }
      
      console.log('Executing code with config:', {
        language: langConfig.runtime || language,
        version: langConfig.version || '*',
        codeLength: code.length,
        inputLength: input?.length || 0
      });
      
      console.log('Executing code with config:', {
        language: langConfig.runtime || language,
        version: langConfig.version || '*',
        codeLength: code.length,
        inputLength: input?.length || 0
      });
      
      const result = await executeCode({
        code: code,
        language: language,
        version: langConfig.version || '*',
        stdin: input,
        args: []
      });

      console.log('API Response:', result);

      // Process the execution result
      const outputLines: string[] = [];
      
      if (result) {
        console.log('Run result:', result.run);
        
        // If there's no output but the execution was successful, show a success message
        if ((!result.run?.stdout || result.run.stdout.trim() === '') && 
            (!result.run?.stderr || result.run.stderr.trim() === '') &&
            result.run?.code === 0) {
          outputLines.push('✅ Code executed successfully but produced no output');
          outputLines.push('Try adding some console.log() statements to see output');
        }
        if (result.compile && result.compile.output) {
          outputLines.push('Compilation Output:');
          outputLines.push(result.compile.output);
        }

        if (result.run) {
          outputLines.push('Execution Output:');
          if (result.run.output) {
            // Clean up the output by removing any undefined or null values
            const cleanOutput = result.run.output
              .split('\n')
              .filter((line: string) => line && line.trim() !== 'undefined')
              .join('\n');
            
            if (cleanOutput) {
              outputLines.push(cleanOutput);
            } else {
              outputLines.push('(No output to display)');
            }
          } else {
            outputLines.push('(No output)');
          }
          
          if (result.run.signal) {
            outputLines.push(`\nProcess was terminated by signal: ${result.run.signal}`);
          }
          
          // Only show exit code if it's non-zero
          if (result.run.code !== 0) {
            outputLines.push(`Exit Code: ${result.run.code}`);
          }
        }
        
        setOutput(outputLines.join('\n\n'));
      } else {
        setOutput('No execution result returned');
      }
    } catch (error: unknown) {
      const errorObj = error as Error & { name?: string; code?: string };
      console.error('Error in handleRunCode:', {
        name: errorObj.name,
        message: errorObj.message,
        code: errorObj.code,
        stack: errorObj.stack
      });
      
      let errorMessage = 'An unexpected error occurred';
      
      if (errorObj.name === 'AbortError') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (errorObj.message?.includes('Failed to fetch')) {
        errorMessage = 'Failed to connect to the Piston API. Please check your internet connection.';
      } else if (errorObj.message) {
        errorMessage = errorObj.message;
      }
      
      setOutput(`❌ Error: ${errorMessage}\n\nCheck browser console for more details.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeCode = async () => {
    setIsAnalyzing(true);
    setOutput('Analyzing code...');
    
    try {
      // Basic code analysis without backend
      const issues: string[] = [];
      const suggestions: string[] = [];
      const improvements: string[] = [];
      
      // Simple code analysis
      const lines = code.split('\n');
      const lineCount = lines.length;
      const charCount = code.length;
      
      // Check for common issues
      if (code.includes('eval(')) {
        issues.push('Use of eval() is generally not recommended due to security risks');
      }
      
      if (code.includes('setTimeout(') || code.includes('setInterval(')) {
        suggestions.push('Consider using requestAnimationFrame() for animations instead of setTimeout/setInterval');
      }
      
      if (lineCount > 50) {
        improvements.push('Consider breaking down this code into smaller functions for better maintainability');
      }
      
      // Calculate a simple score (just for demonstration)
      let score = 80; // Base score
      if (issues.length > 0) score -= 10 * issues.length;
      if (lineCount > 100) score -= Math.min(20, Math.floor(lineCount / 10));
      score = Math.max(0, Math.min(100, score)); // Keep score between 0-100
      
      // Format the analysis results
      const formattedOutput = [
        '=== Basic Code Analysis ===',
        `Score: ${score}/100`,
        `Lines: ${lineCount}, Characters: ${charCount}`,
        '\nIssues:',
        ...(issues.length > 0 ? issues.map(issue => `- ${issue}`) : ['- No major issues found']),
        '\nSuggestions:',
        ...(suggestions.length > 0 ? suggestions.map(suggestion => `- ${suggestion}`) : ['- No specific suggestions']),
        '\nImprovements:',
        ...(improvements.length > 0 ? improvements.map(improvement => `- ${improvement}`) : ['- Code structure looks good!']),
        '\nNote: This is a basic analysis. For more comprehensive analysis, consider using a dedicated code quality tool.'
      ].join('\n');
      
      setOutput(formattedOutput);
    } catch (error: any) {
      setOutput(`Error during analysis: ${error.message}\n\nFalling back to basic analysis.`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full gap-4">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="w-full sm:w-48">
          <label htmlFor="language-select" className="block text-sm font-medium mb-1">
            Language
          </label>
          <select
            id="language-select"
            value={language}
            onChange={(e) => onLanguageChange?.(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={handleAnalyzeCode}
            disabled={isLoading || isAnalyzing}
            variant="outline"
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </Button>
          <Button 
            onClick={handleRunCode} 
            disabled={isLoading || isAnalyzing}
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium !bg-black !text-white hover:!bg-gray-800"
          >
            {isLoading ? 'Running...' : 'Run Code'}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 h-[calc(100vh-200px)] min-h-[600px]">
        {/* Left Column - Editor */}
        <div className="flex-1 flex flex-col border rounded-lg overflow-hidden">
          <div className="p-2 text-sm font-medium border-b bg-gray-50">
            Editor
          </div>
          <div className="flex-1 overflow-hidden bg-white">
            <Editor
              height="100%"
              defaultLanguage={language}
              language={language}
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
                tabSize: 2,
              }}
              key={language} // Force re-render on language change
            />
          </div>
        </div>
        
        {/* Right Column - Output */}
        <div className="flex-1 flex flex-col border rounded-lg overflow-hidden">
          <div className="p-2 text-sm font-medium border-b bg-gray-50">
            Output
          </div>
          <div className="flex-1 p-4 overflow-auto bg-white">
            <div 
              ref={outputRef}
              className="relative font-mono text-sm whitespace-pre-wrap break-words bg-[#f8f9fa] rounded border border-[#dee2e6]"
              style={{ 
                minHeight: '200px',
                maxHeight: 'calc(100vh - 200px)',
                overflowY: 'auto',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                padding: '1rem',
              }}
            >
              {aiResponse ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-purple-700">AI Response:</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700"
                      onClick={() => copyToClipboard(aiResponse)}
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="whitespace-pre-wrap bg-white p-3 rounded border">
                    {aiResponse}
                  </div>
                  {output && (
                    <>
                      <div className="border-t border-gray-200 my-2"></div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-green-700">Program Output:</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700"
                          onClick={() => copyToClipboard(output)}
                        >
                          <Copy className="h-3.5 w-3.5 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <div className="whitespace-pre-wrap bg-white p-3 rounded border">
                        {output}
                      </div>
                    </>
                  )}
                </div>
              ) : output ? (
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-0 top-0 h-7 px-2 text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => copyToClipboard(output)}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copy
                  </Button>
                  <div className="whitespace-pre-wrap bg-white p-3 rounded border">
                    {output}
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 italic">Run your code to see the output here...</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - AI Assistant and Stdin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI Assistant */}
        <div>
            <AiInstructionInput 
              onCodeGenerated={handleCodeGenerated}
              onClearEditor={handleClearEditor}
              language={language}
              isLoading={isGenerating}
              setIsLoading={setIsGenerating}
            />
          </div>

        {/* Stdin Input */}
        <div className="border rounded-lg overflow-hidden">
          <div className="p-2 text-sm font-medium border-b bg-gray-50">
            Input (stdin)
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-3 font-mono text-sm bg-white focus:outline-none resize-none min-h-[120px]"
            placeholder="Enter input here..."
          />
        </div>
      </div>
    </div>
  );
}
