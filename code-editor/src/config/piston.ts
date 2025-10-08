// Piston API URL - Using v3 for better JavaScript support
export const PISTON_API_URL = 'https://emkc.org/api/v3/piston';

// Supported languages with their Piston runtime names, versions, and file extensions
export const SUPPORTED_LANGUAGES = [
  { value: 'python', label: 'Python', runtime: 'python', version: '3.10.0', extension: 'py' },
  { value: 'javascript', label: 'JavaScript', runtime: 'javascript', version: '18.15.0', extension: 'js' },
  { value: 'java', label: 'Java (Beta)', runtime: 'java', version: '11.0.11', extension: 'java' },
  { value: 'csharp', label: 'C#', runtime: 'csharp', version: '6.12.0', extension: 'cs' },
  { value: 'go', label: 'Go', runtime: 'go', version: '1.16.2', extension: 'go' },
  { value: 'ruby', label: 'Ruby', runtime: 'ruby', version: '3.0.1', extension: 'rb' },
  { value: 'rust', label: 'Rust', runtime: 'rust', version: '1.68.2', extension: 'rs' },
  { value: 'php', label: 'PHP', runtime: 'php', version: '8.2.3', extension: 'php' },
  { value: 'swift', label: 'Swift', runtime: 'swift', version: '5.3.3', extension: 'swift' },
  { value: 'kotlin', label: 'Kotlin', runtime: 'kotlin', version: '1.8.20', extension: 'kt' },
  { value: 'lua', label: 'Lua', runtime: 'lua', version: '5.4.4', extension: 'lua' },
  { value: 'r', label: 'R', runtime: 'rscript', version: '4.1.1', extension: 'r' },
  { value: 'bash', label: 'Bash', runtime: 'bash', version: '5.2.0', extension: 'sh' },
];

// Default code templates for each language
export const DEFAULT_CODE_TEMPLATES: Record<string, string> = {
  python: '# Write your Python code here\nprint("Hello, World!")',
  javascript: '// Simple JavaScript example\nconsole.log("Hello, World!");\n\n// Basic arithmetic\nconst x = 10;\nconst y = 5;\nconsole.log(`${x} + ${y} = ${x + y}`);\n\n// Simple loop\nfor (let i = 0; i < 3; i++) {\n  console.log(`Iteration ${i + 1}`);\n}\n\n// Function example\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\nconsole.log(greet("User"));',
  java: '// Write your Java code here\npublic class Main {\n    public static void main(String[] args) {\n        try {\n            // Set a smaller heap size to avoid memory issues in container\n            long maxMemory = Runtime.getRuntime().maxMemory();\n            System.out.println("Starting Java program (Max Memory: " + (maxMemory / (1024 * 1024)) + "MB)");\n            \n            // Simple test program\n            System.out.println("Hello, World!");\n            \n            // Force garbage collection to help with memory\n            System.gc();\n        } catch (Exception e) {\n            System.err.println("Error: " + e.getMessage());\n            e.printStackTrace();\n        }\n    }\n}',
  csharp: '// Write your C# code here\nusing System;\n\nclass Program {\n    static void Main(string[] args) {\n        Console.WriteLine("Hello, World!");\n    }\n}',
  go: '// Write your Go code here\npackage main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}',
  ruby: '# Write your Ruby code here\nputs "Hello, World!"',
  rust: '// Write your Rust code here\nfn main() {\n    println!("Hello, World!");\n}',
  php: '<?php\n// Write your PHP code here\necho "Hello, World!";\n?>',
  swift: '// Write your Swift code here\nimport Foundation\nprint("Hello, World!")',
  kotlin: '// Write your Kotlin code here\nfun main() {\n    println("Hello, World!")\n}',
  lua: '-- Write your Lua code here\nprint("Hello, World!")',
  r: '# Write your R code here\nprint("Hello, World!")',
  bash: '#!/bin/bash\n# Write your Bash code here\necho "Hello, World!"',
};
