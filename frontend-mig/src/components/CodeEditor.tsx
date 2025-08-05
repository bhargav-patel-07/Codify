'use client';

import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from './ui/button';
import { Play, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES, DEFAULT_CODE_TEMPLATES } from '@/config/piston';
import { executeCode, getRuntimes } from '@/lib/piston';
import { AiInstructionInput } from './AiInstructionInput';

// Use the languages from our config
const supportedLanguages = SUPPORTED_LANGUAGES;

export default function CodeEditor() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('Run code to see output here');
  const outputRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [input, setInput] = useState('');
  const [languages, setLanguages] = useState<typeof SUPPORTED_LANGUAGES>([]);
  const editorRef = useRef<any>(null);
  
  // Initialize code with default template when language changes
  useEffect(() => {
    if (language && DEFAULT_CODE_TEMPLATES[language]) {
      setCode(DEFAULT_CODE_TEMPLATES[language]);
    }
  }, [language]);

  const handleClearEditor = () => {
    setCode('');
    setOutput('Run code to see output here');
    setInput('');
    // Focus the editor after clearing
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleCodeGenerated = (generatedCode: string) => {
    setCode(generatedCode);
    // Focus the editor after code is generated
    if (editorRef.current) {
      editorRef.current.focus();
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
          if (!availableLangs.some(lang => lang.value === language)) {
            setLanguage(availableLangs[0].value);
            setCode(DEFAULT_CODE_TEMPLATES[availableLangs[0].value] || '');
          }
        } else {
          console.warn('[CodeEditor] No supported languages found in available runtimes, using all supported languages');
          setLanguages(supportedLanguages);
        }
      } catch (error) {
        const errorObj = error as Error;
        console.error('[CodeEditor] Failed to fetch runtimes:', {
          name: errorObj.name,
          message: errorObj.message,
          stack: errorObj.stack
        });
        
        // Fallback to all supported languages if we can't fetch runtimes
        console.warn('[CodeEditor] Using all supported languages as fallback');
        setLanguages(supportedLanguages);
      }
    };
    
    fetchAvailableLanguages();
  }, []);

  // Initialize code with default template when language changes
  useEffect(() => {
    if (language && DEFAULT_CODE_TEMPLATES[language as keyof typeof DEFAULT_CODE_TEMPLATES]) {
      setCode(DEFAULT_CODE_TEMPLATES[language as keyof typeof DEFAULT_CODE_TEMPLATES] || '');
    }
  }, [language]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  // Auto-scroll output to bottom when it updates
  useEffect(() => {
    console.log('Output updated:', output);
    if (outputRef.current) {
      console.log('Scrolling output to bottom');
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleRunCode = async () => {
    setIsLoading(true);
    setOutput('Running...');
    console.log('Running code with language:', language);

    try {
      const result = await executeCode({
        code,
        language,
        stdin: input
      });
      
      console.log('Piston API Response:', JSON.stringify(result, null, 2));
      
      const output = [];
      
      // Debug: Log the raw output
      if (result.run?.output) {
        console.log('Raw output:', result.run.output);
        console.log('Output type:', typeof result.run.output);
        console.log('Output length:', result.run.output.length);
      }
      
      // Handle compilation output if present
      if (result.compile && result.compile.stderr) {
        output.push('❌ Compilation Error');
        output.push(result.compile.stderr);
      } 
      
      // Handle runtime output
      if (result.run) {
        if (result.run.stderr) {
          output.push('❌ Runtime Error');
          output.push(result.run.stderr);
        } else {
          output.push('✅ Execution Successful');
          if (result.run.output) {
            // Clean up the output by removing any undefined or null values
            const cleanOutput = result.run.output
              .split('\n')
              .filter(line => line && line.trim() !== 'undefined')
              .join('\n');
            
            if (cleanOutput) {
              output.push(cleanOutput);
            } else {
              output.push('(No output to display)');
            }
          } else {
            output.push('(No output)');
          }
        }
        
        if (result.run.signal) {
          output.push(`\nProcess was terminated by signal: ${result.run.signal}`);
        }
        
        // Only show exit code if it's non-zero
        if (result.run.code !== 0) {
          output.push(`Exit Code: ${result.run.code}`);
        }
      }
      
      setOutput(output.join('\n'));
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
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full text-sm rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-gray-800"
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
            className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium"
          >
            {isLoading ? 'Running...' : 'Run Code'}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 h-[calc(100vh-200px)] min-h-[600px]">
        {/* Left Column - Editor */}
        <div className="flex-1 flex flex-col border rounded-lg overflow-hidden">
          <div className="p-2 text-sm font-medium border-b bg-gray-50 dark:bg-gray-800">
            Editor
          </div>
          <div className="flex-1 overflow-hidden bg-white dark:bg-gray-900">
            <Editor
              height="100%"
              defaultLanguage={language}
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </div>
        </div>
        
        {/* Right Column - Output */}
        <div className="flex-1 flex flex-col border rounded-lg overflow-hidden">
          <div className="p-2 text-sm font-medium border-b bg-gray-50 dark:bg-gray-800">
            Output
          </div>
          <div className="flex-1 p-4 overflow-auto bg-white dark:bg-gray-900">
            <div 
              ref={outputRef}
              className="font-mono text-sm whitespace-pre-wrap break-words"
              style={{ 
                minHeight: '200px',
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #dee2e6',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {output || 'Run your code to see the output here...'}
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
          <div className="p-2 text-sm font-medium border-b bg-gray-50 dark:bg-gray-800">
            Input (stdin)
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-3 font-mono text-sm bg-white dark:bg-gray-900 focus:outline-none resize-none min-h-[120px]"
            placeholder="Enter input here..."
          />
        </div>
      </div>
    </div>
  );
}
