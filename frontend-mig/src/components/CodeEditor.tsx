'use client';

import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import Split from 'react-split';
import { Sparkles, Wand2 } from 'lucide-react';
import { Button } from './ui/button';
import { api, CodeAnalysisRequest } from '@/lib/api';
import { AiInstructionInput } from './AiInstructionInput';


const supportedLanguages = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
];

const DEFAULT_CODE = {
  python: '# Write your Python code here\nprint("Hello, World!")',
  javascript: '// Write your JavaScript code here\nconsole.log("Hello, World!");',
  java: '// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  cpp: '// Write your C++ code here\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
  c: '// Write your C code here\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
  go: '// Write your Go code here\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
  rust: '// Write your Rust code here\nfn main() {\n    println!("Hello, World!");\n}',
  php: '<?php\n// Write your PHP code here\necho "Hello, World!";\n?>',
};

export default function CodeEditor() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(DEFAULT_CODE['python']);
  const [output, setOutput] = useState('Run code to see output here');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [input, setInput] = useState('');
  const [languages, setLanguages] = useState<Array<{value: string; label: string}>>(supportedLanguages);
  const editorRef = useRef<any>(null);

  const handleCodeGenerated = (generatedCode: string) => {
    setCode(generatedCode);
    // Focus the editor after code is generated
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Fetch supported languages on component mount
  useEffect(() => {
    const fetchLanguages = async () => {
      console.log('[CodeEditor] Starting to fetch supported languages...');
      try {
        // First, try to get languages from the API
        const supportedLangs = await api.getLanguages();
        console.log('[CodeEditor] Received languages from API:', supportedLangs);
        
        // If we got an empty array or invalid response, log it and use default languages
        if (!Array.isArray(supportedLangs) || supportedLangs.length === 0) {
          console.warn('[CodeEditor] Received empty or invalid languages array from API, using default languages');
          setLanguages(supportedLanguages);
          return;
        }
        
        // Filter our supported languages based on what the API returned
        const filteredLangs = supportedLanguages.filter((lang: {value: string; label: string}) => 
          supportedLangs.includes(lang.value)
        );
        
        console.log('[CodeEditor] Filtered languages:', filteredLangs);
        
        // If no languages matched, use all supported languages as fallback
        if (filteredLangs.length === 0) {
          console.warn('[CodeEditor] No matching languages found, using all supported languages');
          setLanguages(supportedLanguages);
        } else {
          setLanguages(filteredLangs);
        }
      } catch (error: any) {
        console.error('[CodeEditor] Failed to fetch languages:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          response: error.response
        });
        
        // Fallback to default languages
        console.warn('[CodeEditor] Using default languages as fallback');
        setLanguages(supportedLanguages);
      }
    };
    
    fetchLanguages().catch(error => {
      console.error('[CodeEditor] Unhandled error in fetchLanguages:', error);
    });
  }, []);

  useEffect(() => {
    setCode(DEFAULT_CODE[language as keyof typeof DEFAULT_CODE] || '');
  }, [language]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleRunCode = async () => {
    setIsLoading(true);
    setOutput('Running...');
    console.log('Running code with language:', language);
    console.log('Code content:', code);

    try {
      console.log('Creating task...');
      const task = await api.createTask({
        description: 'Code execution',
        language,
        files: [code],
      });
      console.log('Task created:', task);
      
      if (!task?.task_id) {
        throw new Error('No task ID received from the server');
      }
      
      console.log('Fetching task status for task ID:', task.task_id);
      const result = await api.getTaskStatus(task.task_id);
      console.log('Task status:', result);
      setOutput(JSON.stringify(result, null, 2));
    } catch (error: any) {
      console.error('Error in handleRunCode:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      setOutput(`Error: ${error.message}\n\nCheck browser console for more details.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeCode = async () => {
    setIsAnalyzing(true);
    setOutput('Analyzing code...');

    try {
      const request: CodeAnalysisRequest = {
        code,
        language,
        analysis_type: 'review'
      };
      
      const result = await api.analyzeCode(request);
      
      // Format the analysis results
      const formattedOutput = [
        '=== Analysis Results ===',
        `Score: ${result.score}/100`,
        '\nIssues:',
        ...result.issues.map(issue => `- ${issue}`),
        '\nSuggestions:',
        ...result.suggestions.map(suggestion => `- ${suggestion}`),
        '\nImprovements:',
        ...result.improvements.map(improvement => `- ${improvement}`),
      ].join('\n');
      
      setOutput(formattedOutput);
    } catch (error: any) {
      setOutput(`Error during analysis: ${error.message}`);
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
            <div className="font-mono text-sm whitespace-pre break-words">{output}</div>
          </div>
        </div>
      </div>

      {/* Bottom Section - AI Assistant and Stdin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI Assistant */}
        <div>
            <AiInstructionInput 
              onCodeGenerated={handleCodeGenerated}
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
