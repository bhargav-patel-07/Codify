"""
Code analysis and review service for the Coding Agent.
"""
import ast
import re
from typing import Dict, List, Any
from dataclasses import dataclass

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
        self.python_patterns = {
            'long_lines': r'.{120,}',
            'todo_comments': r'#\s*(TODO|FIXME|HACK)',
            'print_statements': r'print\s*\(',
            'global_vars': r'global\s+\w+',
            'bare_except': r'except\s*:',
        }
    
    def analyze_code(self, code: str, language: str = "python") -> Dict[str, Any]:
        """
        Analyze code and return comprehensive analysis.
        
        Args:
            code: Source code to analyze
            language: Programming language
            
        Returns:
            Dict with analysis results
        """
        try:
            if language.lower() == "python":
                return self._analyze_python_code(code)
            else:
                return self._analyze_generic_code(code, language)
        except Exception as e:
            return {
                "issues": [CodeIssue("error", 0, f"Analysis failed: {str(e)}", "high")],
                "metrics": CodeMetrics(0, 0, 0, 0, 0),
                "suggestions": ["Code analysis failed - please check syntax"],
                "score": 0
            }
    
    def _analyze_python_code(self, code: str) -> Dict[str, Any]:
        """Analyze Python code specifically."""
        issues = []
        suggestions = []
        
        # Basic metrics
        lines = code.split('\n')
        metrics = CodeMetrics(
            lines_of_code=len([line for line in lines if line.strip()]),
            complexity_score=self._calculate_complexity(code),
            functions_count=len(re.findall(r'def\s+\w+', code)),
            classes_count=len(re.findall(r'class\s+\w+', code)),
            imports_count=len(re.findall(r'import\s+\w+|from\s+\w+', code))
        )
        
        # Check for common issues
        for i, line in enumerate(lines, 1):
            # Long lines
            if len(line) > 120:
                issues.append(CodeIssue("warning", i, "Line too long (>120 chars)", "medium"))
            
            # Print statements (might be debug code)
            if re.search(self.python_patterns['print_statements'], line):
                issues.append(CodeIssue("suggestion", i, "Consider using logging instead of print", "low"))
            
            # Bare except clauses
            if re.search(self.python_patterns['bare_except'], line):
                issues.append(CodeIssue("warning", i, "Bare except clause - specify exception type", "high"))
            
            # TODO comments
            if re.search(self.python_patterns['todo_comments'], line):
                issues.append(CodeIssue("suggestion", i, "TODO comment found", "low"))
        
        # Try to parse AST for deeper analysis
        try:
            tree = ast.parse(code)
            ast_issues = self._analyze_ast(tree)
            issues.extend(ast_issues)
        except SyntaxError as e:
            issues.append(CodeIssue("error", e.lineno or 0, f"Syntax error: {e.msg}", "high"))
        
        # Generate suggestions
        suggestions = self._generate_suggestions(code, issues, metrics)
        
        # Calculate overall score
        score = self._calculate_score(issues, metrics)
        
        return {
            "issues": [issue.__dict__ for issue in issues],
            "metrics": metrics.__dict__,
            "suggestions": suggestions,
            "score": score
        }
    
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
    
    def _analyze_ast(self, tree: ast.AST) -> List[CodeIssue]:
        """Analyze Python AST for deeper issues."""
        issues = []
        
        for node in ast.walk(tree):
            # Check for nested functions (complexity)
            if isinstance(node, ast.FunctionDef):
                for child in ast.walk(node):
                    if isinstance(child, ast.FunctionDef) and child != node:
                        issues.append(CodeIssue(
                            "suggestion", 
                            getattr(child, 'lineno', 0),
                            "Nested function found - consider refactoring",
                            "medium"
                        ))
            
            # Check for long parameter lists
            if isinstance(node, ast.FunctionDef):
                if len(node.args.args) > 5:
                    issues.append(CodeIssue(
                        "warning",
                        getattr(node, 'lineno', 0),
                        f"Function has {len(node.args.args)} parameters - consider reducing",
                        "medium"
                    ))
        
        return issues
    
    def _calculate_complexity(self, code: str) -> int:
        """Calculate cyclomatic complexity score."""
        # Simple complexity based on control structures
        complexity_keywords = ['if', 'elif', 'for', 'while', 'try', 'except', 'with']
        complexity = 1  # Base complexity
        
        for keyword in complexity_keywords:
            complexity += len(re.findall(rf'\b{keyword}\b', code))
        
        return min(complexity, 20)  # Cap at 20
    
    def _generate_suggestions(self, code: str, issues: List[CodeIssue], metrics: CodeMetrics) -> List[str]:
        """Generate improvement suggestions."""
        suggestions = []
        
        # Based on metrics
        if metrics.lines_of_code > 100:
            suggestions.append("Consider breaking this into smaller functions or modules")
        
        if metrics.complexity_score > 10:
            suggestions.append("High complexity detected - consider simplifying logic")
        
        if metrics.functions_count == 0 and metrics.lines_of_code > 10:
            suggestions.append("Consider organizing code into functions")
        
        # Based on issues
        error_count = len([i for i in issues if i.type == "error"])
        warning_count = len([i for i in issues if i.type == "warning"])
        
        if error_count > 0:
            suggestions.append("Fix syntax errors before proceeding")
        
        if warning_count > 3:
            suggestions.append("Address warnings to improve code quality")
        
        # General suggestions
        if "import" not in code and metrics.lines_of_code > 20:
            suggestions.append("Consider using appropriate libraries to simplify code")
        
        if not re.search(r'""".*?"""', code, re.DOTALL) and metrics.functions_count > 0:
            suggestions.append("Add docstrings to functions for better documentation")
        
        return suggestions[:5]  # Limit to 5 suggestions
    
    def _calculate_score(self, issues: List[CodeIssue], metrics: CodeMetrics) -> int:
        """Calculate overall code quality score (0-100)."""
        base_score = 100
        
        # Deduct points for issues
        for issue in issues:
            if issue.severity == "high":
                base_score -= 15
            elif issue.severity == "medium":
                base_score -= 10
            else:
                base_score -= 5
        
        # Bonus for good practices
        if metrics.functions_count > 0:
            base_score += 5
        
        if metrics.complexity_score < 5:
            base_score += 5
        
        return max(0, min(100, base_score))

# Global instance
code_analyzer = CodeAnalyzer()
