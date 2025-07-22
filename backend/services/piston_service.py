"""
Piston API service for code execution.
"""
import requests
from typing import Dict, List, Optional, Any
from dataclasses import dataclass

@dataclass
class ExecutionResult:
    stdout: str
    stderr: str
    exit_code: int
    execution_time: float
    memory_usage: Optional[int] = None

@dataclass
class Language:
    name: str
    version: str
    aliases: List[str]

class PistonService:
    """Service for executing code using Piston API."""
    
    def __init__(self, base_url: str = "https://emkc.org/api/v2/piston"):
        self.base_url = base_url
        self.headers = {
            "Content-Type": "application/json"
        }
    
    def get_supported_languages(self) -> List[Language]:
        """Get list of supported programming languages."""
        url = f"{self.base_url}/runtimes"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            runtimes = response.json()
            return [
                Language(
                    name=runtime["language"],
                    version=runtime["version"],
                    aliases=runtime.get("aliases", [])
                )
                for runtime in runtimes
            ]
        else:
            raise Exception(f"Failed to fetch supported languages: {response.status_code}")
    
    def execute_code(self, language: str, code: str, stdin: str = "", args: List[str] = None) -> ExecutionResult:
        """Execute code in the specified language."""
        url = f"{self.base_url}/execute"
        
        payload = {
            "language": language,
            "version": "*",  # Use latest version
            "files": [
                {
                    "name": f"main.{self._get_file_extension(language)}",
                    "content": code
                }
            ],
            "stdin": stdin,
            "args": args or [],
            "compile_timeout": 10000,
            "run_timeout": 3000,
            "compile_memory_limit": -1,
            "run_memory_limit": -1
        }
        
        response = requests.post(url, json=payload, headers=self.headers)
        
        if response.status_code == 200:
            result = response.json()
            
            # Handle both compile and run results
            run_result = result.get("run", {})
            compile_result = result.get("compile", {})
            
            stdout = run_result.get("stdout", "")
            stderr = run_result.get("stderr", "")
            
            # Include compile errors if present
            if compile_result.get("stderr"):
                stderr = compile_result["stderr"] + "\n" + stderr
            
            return ExecutionResult(
                stdout=stdout,
                stderr=stderr,
                exit_code=run_result.get("code", 0),
                execution_time=run_result.get("time", 0.0)
            )
        else:
            raise Exception(f"Failed to execute code: {response.status_code}")
    
    def _get_file_extension(self, language: str) -> str:
        """Get file extension for a programming language."""
        extensions = {
            "python": "py",
            "javascript": "js",
            "typescript": "ts",
            "java": "java",
            "cpp": "cpp",
            "c": "c",
            "go": "go",
            "rust": "rs",
            "php": "php",
            "ruby": "rb",
            "swift": "swift",
            "kotlin": "kt",
            "scala": "scala",
            "perl": "pl",
            "lua": "lua",
            "r": "r",
            "bash": "sh"
        }
        return extensions.get(language.lower(), "txt")
    
    def validate_code_syntax(self, language: str, code: str) -> Dict[str, Any]:
        """Validate code syntax without execution."""
        try:
            # For now, we'll use execution with empty stdin to check syntax
            result = self.execute_code(language, code, "")
            
            return {
                "valid": result.exit_code == 0 and not result.stderr,
                "errors": result.stderr if result.stderr else None,
                "warnings": []
            }
        except Exception as e:
            return {
                "valid": False,
                "errors": str(e),
                "warnings": []
            }
    
    def run_tests(self, language: str, code: str, test_code: str) -> ExecutionResult:
        """Run test code against the main code."""
        combined_code = f"{code}\n\n{test_code}"
        return self.execute_code(language, combined_code)
    
    def benchmark_code(self, language: str, code: str, iterations: int = 5) -> Dict[str, Any]:
        """Benchmark code execution performance."""
        results = []
        
        for _ in range(iterations):
            try:
                result = self.execute_code(language, code)
                if result.exit_code == 0:
                    results.append(result.execution_time)
            except Exception:
                continue
        
        if results:
            avg_time = sum(results) / len(results)
            min_time = min(results)
            max_time = max(results)
            
            return {
                "average_time": avg_time,
                "min_time": min_time,
                "max_time": max_time,
                "iterations": len(results),
                "success_rate": len(results) / iterations
            }
        else:
            return {
                "error": "All benchmark runs failed",
                "success_rate": 0.0
            }
