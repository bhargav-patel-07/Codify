"""
Code execution service using Piston API for safe code execution.
"""
import requests
import json
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

@dataclass
class ExecutionResult:
    stdout: str
    stderr: str
    exit_code: int
    execution_time: float
    language: str
    version: str

class CodeExecutor:
    """Execute code safely using Piston API."""
    
    def __init__(self):
        self.base_url = "https://emkc.org/api/v2/piston"
        self.headers = {"Content-Type": "application/json"}
        
        # Language mappings
        self.language_map = {
            "python": "python",
            "javascript": "javascript", 
            "js": "javascript",
            "java": "java",
            "cpp": "cpp",
            "c++": "cpp",
            "c": "c",
            "go": "go",
            "rust": "rust",
            "php": "php"
        }
    
    def execute_code(self, code: str, language: str, stdin: str = "") -> ExecutionResult:
        """
        Execute code using Piston API.
        
        Args:
            code: Source code to execute
            language: Programming language
            stdin: Standard input for the program
            
        Returns:
            ExecutionResult with execution details
        """
        try:
            # Map language to Piston format
            piston_language = self.language_map.get(language.lower(), language.lower())
            
            # Prepare execution request
            payload = {
                "language": piston_language,
                "version": "*",  # Use latest version
                "files": [
                    {
                        "name": f"main.{self._get_file_extension(piston_language)}",
                        "content": code
                    }
                ],
                "stdin": stdin,
                "args": [],
                "compile_timeout": 10000,
                "run_timeout": 3000,
                "compile_memory_limit": -1,
                "run_memory_limit": -1
            }
            
            # Execute code
            response = requests.post(
                f"{self.base_url}/execute",
                headers=self.headers,
                json=payload,
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                return self._parse_execution_result(result, piston_language)
            else:
                return ExecutionResult(
                    stdout="",
                    stderr=f"Execution service error: {response.status_code}",
                    exit_code=1,
                    execution_time=0.0,
                    language=piston_language,
                    version="unknown"
                )
                
        except requests.exceptions.Timeout:
            return ExecutionResult(
                stdout="",
                stderr="Execution timeout - code took too long to run",
                exit_code=1,
                execution_time=3.0,
                language=language,
                version="unknown"
            )
        except Exception as e:
            return ExecutionResult(
                stdout="",
                stderr=f"Execution error: {str(e)}",
                exit_code=1,
                execution_time=0.0,
                language=language,
                version="unknown"
            )
    
    def get_supported_languages(self) -> List[Dict[str, str]]:
        """Get list of supported programming languages."""
        try:
            response = requests.get(f"{self.base_url}/runtimes", timeout=10)
            if response.status_code == 200:
                runtimes = response.json()
                return [
                    {
                        "language": runtime["language"],
                        "version": runtime["version"],
                        "aliases": runtime.get("aliases", [])
                    }
                    for runtime in runtimes
                ]
            else:
                return self._get_default_languages()
        except:
            return self._get_default_languages()
    
    def test_code_with_cases(self, code: str, language: str, test_cases: List[Dict]) -> Dict[str, Any]:
        """
        Test code with multiple test cases.
        
        Args:
            code: Source code to test
            language: Programming language
            test_cases: List of test cases with 'input' and 'expected_output'
            
        Returns:
            Dict with test results
        """
        results = []
        passed = 0
        total = len(test_cases)
        
        for i, test_case in enumerate(test_cases):
            stdin = test_case.get("input", "")
            expected = test_case.get("expected_output", "").strip()
            
            result = self.execute_code(code, language, stdin)
            actual = result.stdout.strip()
            
            test_passed = actual == expected
            if test_passed:
                passed += 1
            
            results.append({
                "test_case": i + 1,
                "input": stdin,
                "expected": expected,
                "actual": actual,
                "passed": test_passed,
                "stderr": result.stderr,
                "execution_time": result.execution_time
            })
        
        return {
            "total_tests": total,
            "passed_tests": passed,
            "failed_tests": total - passed,
            "success_rate": (passed / total * 100) if total > 0 else 0,
            "results": results
        }
    
    def _parse_execution_result(self, result: Dict, language: str) -> ExecutionResult:
        """Parse Piston API response."""
        run_result = result.get("run", {})
        
        return ExecutionResult(
            stdout=run_result.get("stdout", ""),
            stderr=run_result.get("stderr", ""),
            exit_code=run_result.get("code", 0),
            execution_time=0.0,  # Piston doesn't provide execution time
            language=language,
            version=result.get("version", "unknown")
        )
    
    def _get_file_extension(self, language: str) -> str:
        """Get file extension for language."""
        extensions = {
            "python": "py",
            "javascript": "js",
            "java": "java",
            "cpp": "cpp",
            "c": "c",
            "go": "go",
            "rust": "rs",
            "php": "php"
        }
        return extensions.get(language, "txt")
    
    def _get_default_languages(self) -> List[Dict[str, str]]:
        """Get default supported languages."""
        return [
            {"language": "python", "version": "3.10.0", "aliases": ["py"]},
            {"language": "javascript", "version": "18.15.0", "aliases": ["js"]},
            {"language": "java", "version": "15.0.2", "aliases": []},
            {"language": "cpp", "version": "10.2.0", "aliases": ["c++"]},
            {"language": "c", "version": "10.2.0", "aliases": []},
            {"language": "go", "version": "1.16.2", "aliases": []},
            {"language": "rust", "version": "1.68.2", "aliases": ["rs"]},
            {"language": "php", "version": "8.2.3", "aliases": []}
        ]

# Global instance
code_executor = CodeExecutor()
