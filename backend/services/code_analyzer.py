"""
Code analysis and review service for the Coding Agent.
Optimized for performance and comprehensive analysis.
"""
import ast
import re
import logging
from typing import Dict, List, Any, Optional, Set
from dataclasses import dataclass
from functools import lru_cache
from concurrent.futures import ThreadPoolExecutor
import time

@dataclass
class CodeIssue:
    type: str  # 'error', 'warning', 'suggestion'
    line: int
    message: str
    severity: str  # 'high', 'medium', 'low'

@dataclass
class CodeMetrics:
    lines_of_code: int
    complexity_score: int
    functions_count: int
    classes_count: int
    imports_count: int

class CodeAnalyzer:
    """Analyze code for issues, metrics, and improvements."""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        
        # Compiled regex patterns for better performance
        self.python_patterns = {
            'long_lines': re.compile(r'.{120,}'),
            'todo_comments': re.compile(r'#\s*(TODO|FIXME|HACK)', re.IGNORECASE),
            'print_statements': re.compile(r'print\s*\('),
            'global_vars': re.compile(r'global\s+\w+'),
            'bare_except': re.compile(r'except\s*:'),
            'function_def': re.compile(r'def\s+\w+'),
            'class_def': re.compile(r'class\s+\w+'),
            'imports': re.compile(r'import\s+\w+|from\s+\w+'),
            'docstrings': re.compile(r'""".*?"""', re.DOTALL),
            'complexity_keywords': re.compile(r'\b(if|elif|for|while|try|except|with)\b')
        }
        
        # Cache for AST parsing results
        self._ast_cache = {}
        self._max_cache_size = 100
    
    def analyze_code(self, code: str, language: str = "python") -> Dict[str, Any]:
        """
        Analyze code and return comprehensive analysis.
        
        Args:
            code: Source code to analyze
            language: Programming language
            
        Returns:
            Dict with analysis results
        """
        start_time = time.time()
        
        if not code or not code.strip():
            return self._empty_analysis_result()
        
        try:
            # Normalize language input
            language = language.lower().strip()
            
            if language == "python":
                result = self._analyze_python_code(code)
            else:
                result = self._analyze_generic_code(code, language)
            
            # Add analysis metadata
            result["analysis_time"] = round(time.time() - start_time, 3)
            result["language"] = language
            
            return result
            
        except Exception as e:
            self.logger.error(f"Code analysis failed: {str(e)}")
            return {
                "issues": [CodeIssue("error", 0, f"Analysis failed: {str(e)}", "high")],
                "metrics": CodeMetrics(0, 0, 0, 0, 0),
                "suggestions": ["Code analysis failed - please check syntax"],
                "score": 0,
                "analysis_time": round(time.time() - start_time, 3),
                "language": language
            }
    
    def _empty_analysis_result(self) -> Dict[str, Any]:
        """Return empty analysis result for empty code."""
        return {
            "issues": [],
            "metrics": CodeMetrics(0, 0, 0, 0, 0),
            "suggestions": ["No code provided for analysis"],
            "score": 0,
            "analysis_time": 0.0,
            "language": "unknown"
        }
    
    def _analyze_python_code(self, code: str) -> Dict[str, Any]:
        """Analyze Python code specifically with optimized performance."""
        issues = []
        lines = code.split('\n')
        
        # Calculate metrics efficiently
        metrics = self._calculate_python_metrics(code, lines)
        
        # Parallel analysis of different aspects
        with ThreadPoolExecutor(max_workers=3) as executor:
            # Submit different analysis tasks
            line_issues_future = executor.submit(self._analyze_lines, lines)
            ast_issues_future = executor.submit(self._get_ast_analysis, code)
            
            # Collect results
            line_issues = line_issues_future.result()
            ast_issues = ast_issues_future.result()
        
        issues.extend(line_issues)
        issues.extend(ast_issues)
        
        # Generate suggestions based on analysis
        suggestions = self._generate_suggestions(code, issues, metrics)
        
        # Calculate overall score
        score = self._calculate_score(issues, metrics)
        
        return {
            "issues": [issue.__dict__ for issue in issues],
            "metrics": metrics.__dict__,
            "suggestions": suggestions,
            "score": score
        }
    
    def _calculate_python_metrics(self, code: str, lines: List[str]) -> CodeMetrics:
        """Calculate Python code metrics efficiently."""
        return CodeMetrics(
            lines_of_code=sum(1 for line in lines if line.strip()),
            complexity_score=self._calculate_complexity_optimized(code),
            functions_count=len(self.python_patterns['function_def'].findall(code)),
            classes_count=len(self.python_patterns['class_def'].findall(code)),
            imports_count=len(self.python_patterns['imports'].findall(code))
        )
    
    def _analyze_lines(self, lines: List[str]) -> List[CodeIssue]:
        """Analyze individual lines for issues."""
        issues = []
        
        for i, line in enumerate(lines, 1):
            # Skip empty lines for performance
            if not line.strip():
                continue
                
            # Long lines
            if len(line) > 120:
                issues.append(CodeIssue("warning", i, "Line too long (>120 chars)", "medium"))
            
            # Print statements (might be debug code)
            if self.python_patterns['print_statements'].search(line):
                issues.append(CodeIssue("suggestion", i, "Consider using logging instead of print", "low"))
            
            # Bare except clauses
            if self.python_patterns['bare_except'].search(line):
                issues.append(CodeIssue("warning", i, "Bare except clause - specify exception type", "high"))
            
            # TODO comments
            if self.python_patterns['todo_comments'].search(line):
                issues.append(CodeIssue("suggestion", i, "TODO comment found", "low"))
            
            # Global variables
            if self.python_patterns['global_vars'].search(line):
                issues.append(CodeIssue("warning", i, "Global variable usage - consider alternatives", "medium"))
        
        return issues
    
    @lru_cache(maxsize=128)
    def _get_ast_analysis(self, code: str) -> List[CodeIssue]:
        """Get AST analysis with caching for repeated code."""
        try:
            # Use hash for cache key to handle large code blocks
            code_hash = hash(code)
            if code_hash in self._ast_cache:
                return self._ast_cache[code_hash]
            
            tree = ast.parse(code)
            issues = self._analyze_ast_optimized(tree)
            
            # Manage cache size
            if len(self._ast_cache) >= self._max_cache_size:
                # Remove oldest entry
                oldest_key = next(iter(self._ast_cache))
                del self._ast_cache[oldest_key]
            
            self._ast_cache[code_hash] = issues
            return issues
            
        except SyntaxError as e:
            return [CodeIssue("error", e.lineno or 0, f"Syntax error: {e.msg}", "high")]
        except Exception as e:
            self.logger.warning(f"AST analysis failed: {str(e)}")
            return []
    
    def _analyze_generic_code(self, code: str, language: str) -> Dict[str, Any]:
        """Basic analysis for non-Python languages."""
        lines = code.split('\n')
        issues = []
        
        # Basic checks
        for i, line in enumerate(lines, 1):
            if len(line) > 120:
                issues.append(CodeIssue("warning", i, "Line too long", "medium"))
            
            if "TODO" in line or "FIXME" in line:
                issues.append(CodeIssue("suggestion", i, "TODO comment found", "low"))
        
        metrics = CodeMetrics(
            lines_of_code=len([line for line in lines if line.strip()]),
            complexity_score=min(len(lines) // 10, 10),
            functions_count=len(re.findall(r'function\s+\w+|def\s+\w+', code)),
            classes_count=len(re.findall(r'class\s+\w+', code)),
            imports_count=len(re.findall(r'import\s+|#include\s+', code))
        )
        
        suggestions = [
            f"Code appears to be {language}",
            "Consider adding more comments for clarity",
            "Follow language-specific best practices"
        ]
        
        score = max(100 - len(issues) * 10, 0)
        
        return {
            "issues": [issue.__dict__ for issue in issues],
            "metrics": metrics.__dict__,
            "suggestions": suggestions,
            "score": score
        }
    
    def _analyze_ast_optimized(self, tree: ast.AST) -> List[CodeIssue]:
        """Analyze Python AST for deeper issues with optimized traversal."""
        issues = []
        function_nodes = []
        class_nodes = []
        
        # Single traversal to collect all relevant nodes
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                function_nodes.append(node)
            elif isinstance(node, ast.ClassDef):
                class_nodes.append(node)
        
        # Analyze function-specific issues
        issues.extend(self._analyze_functions(function_nodes))
        
        # Analyze class-specific issues
        issues.extend(self._analyze_classes(class_nodes))
        
        return issues
    
    def _analyze_functions(self, function_nodes: List[ast.FunctionDef]) -> List[CodeIssue]:
        """Analyze function-specific issues."""
        issues = []
        function_names = set()
        
        for func in function_nodes:
            lineno = getattr(func, 'lineno', 0)
            
            # Check for long parameter lists
            param_count = len(func.args.args)
            if param_count > 5:
                issues.append(CodeIssue(
                    "warning",
                    lineno,
                    f"Function has {param_count} parameters - consider reducing",
                    "medium"
                ))
            
            # Check for duplicate function names
            if func.name in function_names:
                issues.append(CodeIssue(
                    "warning",
                    lineno,
                    f"Duplicate function name: {func.name}",
                    "high"
                ))
            function_names.add(func.name)
            
            # Check for missing docstrings
            if not ast.get_docstring(func):
                issues.append(CodeIssue(
                    "suggestion",
                    lineno,
                    f"Function '{func.name}' missing docstring",
                    "low"
                ))
            
            # Check for nested functions
            for child in ast.walk(func):
                if isinstance(child, ast.FunctionDef) and child != func:
                    issues.append(CodeIssue(
                        "suggestion",
                        getattr(child, 'lineno', 0),
                        "Nested function found - consider refactoring",
                        "medium"
                    ))
        
        return issues
    
    def _analyze_classes(self, class_nodes: List[ast.ClassDef]) -> List[CodeIssue]:
        """Analyze class-specific issues."""
        issues = []
        class_names = set()
        
        for cls in class_nodes:
            lineno = getattr(cls, 'lineno', 0)
            
            # Check for duplicate class names
            if cls.name in class_names:
                issues.append(CodeIssue(
                    "warning",
                    lineno,
                    f"Duplicate class name: {cls.name}",
                    "high"
                ))
            class_names.add(cls.name)
            
            # Check for missing docstrings
            if not ast.get_docstring(cls):
                issues.append(CodeIssue(
                    "suggestion",
                    lineno,
                    f"Class '{cls.name}' missing docstring",
                    "low"
                ))
            
            # Count methods
            method_count = sum(1 for node in cls.body if isinstance(node, ast.FunctionDef))
            if method_count > 20:
                issues.append(CodeIssue(
                    "warning",
                    lineno,
                    f"Class '{cls.name}' has {method_count} methods - consider splitting",
                    "medium"
                ))
        
        return issues
    
    @lru_cache(maxsize=256)
    def _calculate_complexity_optimized(self, code: str) -> int:
        """Calculate cyclomatic complexity score with optimized regex."""
        # Use pre-compiled regex for better performance
        matches = self.python_patterns['complexity_keywords'].findall(code)
        complexity = 1 + len(matches)  # Base complexity + control structures
        
        return min(complexity, 20)  # Cap at 20
    
    def _generate_suggestions(self, code: str, issues: List[CodeIssue], metrics: CodeMetrics) -> List[str]:
        """Generate improvement suggestions with priority ranking."""
        suggestions = []
        
        # Categorize issues for better suggestions
        issue_counts = {
            "error": sum(1 for i in issues if i.type == "error"),
            "warning": sum(1 for i in issues if i.type == "warning"),
            "suggestion": sum(1 for i in issues if i.type == "suggestion")
        }
        
        # Priority suggestions based on errors
        if issue_counts["error"] > 0:
            suggestions.append(f"Fix {issue_counts['error']} syntax error(s) before proceeding")
        
        # Code structure suggestions
        if metrics.lines_of_code > 200:
            suggestions.append("Consider breaking this into smaller modules (>200 lines)")
        elif metrics.lines_of_code > 100:
            suggestions.append("Consider breaking this into smaller functions (>100 lines)")
        
        if metrics.complexity_score > 15:
            suggestions.append("Very high complexity detected - urgent refactoring needed")
        elif metrics.complexity_score > 10:
            suggestions.append("High complexity detected - consider simplifying logic")
        
        # Function organization
        if metrics.functions_count == 0 and metrics.lines_of_code > 10:
            suggestions.append("Consider organizing code into functions for better structure")
        
        # Documentation suggestions
        has_docstrings = bool(self.python_patterns['docstrings'].search(code))
        if not has_docstrings and metrics.functions_count > 0:
            suggestions.append("Add docstrings to functions for better documentation")
        
        # Quality improvements
        if issue_counts["warning"] > 5:
            suggestions.append(f"Address {issue_counts['warning']} warning(s) to improve code quality")
        
        # Import suggestions
        if metrics.imports_count == 0 and metrics.lines_of_code > 20:
            suggestions.append("Consider using appropriate libraries to simplify code")
        
        # Performance suggestions
        if "print(" in code:
            suggestions.append("Replace print statements with logging for better debugging")
        
        return suggestions[:7]  # Return top 7 suggestions
    
    def _calculate_score(self, issues: List[CodeIssue], metrics: CodeMetrics) -> int:
        """Calculate overall code quality score (0-100) with improved weighting."""
        base_score = 100
        
        # Deduct points for issues with improved weighting
        severity_weights = {"high": 20, "medium": 10, "low": 3}
        
        for issue in issues:
            deduction = severity_weights.get(issue.severity, 5)
            base_score -= deduction
        
        # Bonus for good practices (improved scoring)
        if metrics.functions_count > 0:
            base_score += min(metrics.functions_count * 2, 10)  # Up to 10 bonus points
        
        if metrics.complexity_score < 5:
            base_score += 10
        elif metrics.complexity_score < 10:
            base_score += 5
        
        # Bonus for reasonable code size
        if 20 <= metrics.lines_of_code <= 100:
            base_score += 5
        
        # Penalty for extremely long files
        if metrics.lines_of_code > 500:
            base_score -= 15
        elif metrics.lines_of_code > 200:
            base_score -= 10
        
        # Ensure score stays within bounds
        return max(0, min(100, base_score))

# Global instance
code_analyzer = CodeAnalyzer()
