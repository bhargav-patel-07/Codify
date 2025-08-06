'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Sparkles, Wand2 } from 'lucide-react';
import { generateCodeWithGroq } from '@/lib/groq';

interface AiInstructionInputProps {
  onCodeGenerated: (code: string) => void;
  onClearEditor: () => void;
  language: string;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export function AiInstructionInput({ 
  onCodeGenerated, 
  onClearEditor,
  language,
  isLoading,
  setIsLoading 
}: AiInstructionInputProps) {
  const [instruction, setInstruction] = useState('');
  const [error, setError] = useState('');

  const handleGenerateCode = async () => {
    if (!instruction.trim()) {
      setError('Please enter an instruction');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Clear the editor first
      onClearEditor();
      
      // Generate code using Groq API with instruction to include comments
      const prompt = `Generate a complete ${language} program that: ${instruction}\n` +
                   `Requirements:\n` +
                   `1. Include detailed comments explaining the code\n` +
                   `2. Follow best practices for ${language}\n` +
                   `3. Make sure the code is complete and runnable\n` +
                   `4. Include example usage if applicable`;
      
      const generatedCode = await generateCodeWithGroq(prompt, language);
      
      if (generatedCode) {
        onCodeGenerated(generatedCode);
        setInstruction('');
      } else {
        throw new Error('No code was generated. Please try again with a different prompt.');
      }
    } catch (error: unknown) {
      console.error('Error generating code:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate code';
      toast.error(errorMessage);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Wand2 className="h-5 w-5 text-purple-500" />
        </div>
        <Textarea
          placeholder={`Ask AI to generate code (e.g., "Create a ${language} function to sort an array")`}
          value={instruction}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInstruction(e.target.value)}
          className="min-h-[50px] pl-10 pr-24 py-2 text-sm bg-transparent border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleGenerateCode();
            }
          }}
        />
        <div className="absolute right-2 bottom-2 flex items-center gap-2">
          <Button 
            onClick={handleGenerateCode}
            disabled={isLoading || !instruction.trim()}
            className="h-9 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm flex items-start gap-2">
          <svg className="h-4 w-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
      
     
    </div>
  );
}
