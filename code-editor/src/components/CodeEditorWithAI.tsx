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
    setCode(generatedCode);
    // Force a re-render by updating the state again in the next tick
    setTimeout(() => {
      console.log('Forcing state update...');
      setCode(prev => prev);
    }, 100);
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
