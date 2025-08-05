// Piston API configuration
export const PISTON_API_URL = 'https://emkc.org/api/v2/piston';

// Supported languages with their Piston runtime names and versions
export const SUPPORTED_LANGUAGES = [
  { value: 'python', label: 'Python', runtime: 'python', version: '3.10.0' },
  { value: 'javascript', label: 'JavaScript', runtime: 'javascript', version: '18.15.0' },
  { value: 'java', label: 'Java (Beta)', runtime: 'java', version: '11.0.11' },
  { value: 'csharp', label: 'C#', runtime: 'csharp', version: '6.12.0' },
  { value: 'go', label: 'Go', runtime: 'go', version: '1.16.2' },
  { value: 'ruby', label: 'Ruby', runtime: 'ruby', version: '3.0.1' },
  { value: 'rust', label: 'Rust', runtime: 'rust', version: '1.68.2' },
  { value: 'php', label: 'PHP', runtime: 'php', version: '8.2.3' },
  { value: 'swift', label: 'Swift', runtime: 'swift', version: '5.3.3' },
  { value: 'kotlin', label: 'Kotlin', runtime: 'kotlin', version: '1.8.20' },
  { value: 'lua', label: 'Lua', runtime: 'lua', version: '5.4.4' },
  { value: 'r', label: 'R', runtime: 'rscript', version: '4.1.1' },
  { value: 'bash', label: 'Bash', runtime: 'bash', version: '5.2.0' },
];

// Default code templates for each language
export const DEFAULT_CODE_TEMPLATES: Record<string, string> = {
  python: '# Write your Python code here\nprint("Hello, World!")',
  javascript: '// Write your JavaScript code here\nconsole.log("Hello, World!");',
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
