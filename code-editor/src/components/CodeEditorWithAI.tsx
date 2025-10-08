'use client';

import { useState } from 'react';
import CodeEditor from './CodeEditor';
import { AiInstructionInput } from './AiInstructionInput';

export function CodeEditorWithAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');

  const handleCodeGenerated = (generatedCode: string) => {
    console.log('handleCodeGenerated called with code:', generatedCode);
    
    // Clean up the code by removing any markdown code blocks
    let cleanCode = generatedCode
      // Remove code block markers
      .replace(/^```(?:\w+)?\s*([\s\S]*?)\s*```$/g, '$1')
      // Remove any remaining ```
      .replace(/```/g, '')
      // Trim whitespace
      .trim();
      
    console.log('Cleaned code:', cleanCode);
    
    // Update the editor with the cleaned code
    setCode(cleanCode);
    
    // Force a re-render to ensure the editor updates
    setTimeout(() => {
      setCode(prev => prev.trim());
    }, 50);
  };

  const handleClearEditor = () => {
    setCode('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <AiInstructionInput
          onCodeGenerated={handleCodeGenerated}
          onClearEditor={handleClearEditor}
          language={language}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </div>
      <div className="flex-1 min-h-0">
        <CodeEditor
          code={code}
          onCodeChange={setCode}
          language={language}
          onLanguageChange={setLanguage}
          onClearEditor={handleClearEditor}
        />
      </div>
    </div>
  );
}
