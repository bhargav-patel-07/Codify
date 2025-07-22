"""
Coder agent for generating and manipulating code.
"""
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from .prompt_parser import ParsedPrompt, TaskType
import ast
import re

@dataclass
class CodeResult:
    code: str
    explanation: str
    tests: Optional[str] = None
    documentation: Optional[str] = None
    dependencies: List[str] = None

class CoderAgent:
    """Agent responsible for code generation, analysis, and manipulation."""
    
    def __init__(self):
        self.language_templates = {
            'python': {
                'function': 'def {name}({params}):\n    """{docstring}"""\n    {body}',
                'class': 'class {name}:\n    """{docstring}"""\n    \n    def __init__(self):\n        {init_body}',
                'imports': 'import {module}',
                'test': 'def test_{name}():\n    """{docstring}"""\n    {body}'
            },
            'javascript': {
                'function': 'function {name}({params}) {{\n    // {docstring}\n    {body}\n}}',
                'class': 'class {name} {{\n    // {docstring}\n    constructor() {{\n        {init_body}\n    }}\n}}',
                'imports': 'const {module} = require(\'{module}\');',
                'test': 'test(\'{name}\', () => {{\n    // {docstring}\n    {body}\n}});'
            }
        }
    
    def generate_code(self, parsed_prompt: ParsedPrompt) -> CodeResult:
        """Generate code based on parsed prompt."""
        if parsed_prompt.task_type == TaskType.CODE_GENERATION:
            return self._generate_new_code(parsed_prompt)
        elif parsed_prompt.task_type == TaskType.CODE_REVIEW:
            return self._review_code(parsed_prompt)
        elif parsed_prompt.task_type == TaskType.DEBUGGING:
            return self._debug_code(parsed_prompt)
        elif parsed_prompt.task_type == TaskType.REFACTORING:
            return self._refactor_code(parsed_prompt)
        elif parsed_prompt.task_type == TaskType.TESTING:
            return self._generate_tests(parsed_prompt)
        elif parsed_prompt.task_type == TaskType.DOCUMENTATION:
            return self._generate_documentation(parsed_prompt)
        else:
            return self._generate_new_code(parsed_prompt)
    
    def _generate_new_code(self, parsed_prompt: ParsedPrompt) -> CodeResult:
        """Generate new code from scratch."""
        language = parsed_prompt.language
        description = parsed_prompt.description
        
        # Extract function/class name from description
        name = self._extract_name_from_description(description)
        
        # Generate basic structure
        if 'class' in description.lower():
            code = self._generate_class_template(name, language, description)
        else:
            code = self._generate_function_template(name, language, description)
        
        # Generate tests if requested
        tests = None
        if parsed_prompt.complexity in ['medium', 'high']:
            tests = self._generate_basic_tests(name, language)
        
        return CodeResult(
            code=code,
            explanation=f"Generated {language} code for: {description}",
            tests=tests,
            dependencies=self._extract_dependencies(description)
        )
    
    def _review_code(self, parsed_prompt: ParsedPrompt) -> CodeResult:
        """Review existing code and provide suggestions."""
        return CodeResult(
            code="# Code review functionality will be implemented",
            explanation="Code review analysis will be provided here",
            dependencies=[]
        )
    
    def _debug_code(self, parsed_prompt: ParsedPrompt) -> CodeResult:
        """Debug code and provide fixes."""
        return CodeResult(
            code="# Debugging fixes will be provided",
            explanation="Debug analysis and fixes will be shown here",
            dependencies=[]
        )
    
    def _refactor_code(self, parsed_prompt: ParsedPrompt) -> CodeResult:
        """Refactor code for better structure/performance."""
        return CodeResult(
            code="# Refactored code will be provided",
            explanation="Refactoring improvements will be explained here",
            dependencies=[]
        )
    
    def _generate_tests(self, parsed_prompt: ParsedPrompt) -> CodeResult:
        """Generate test cases."""
        language = parsed_prompt.language
        
        if language == 'python':
            test_code = """import unittest

class TestExample(unittest.TestCase):
    def setUp(self):
        pass
    
    def test_example(self):
        # Test implementation will be added
        self.assertTrue(True)
    
    def tearDown(self):
        pass

if __name__ == '__main__':
    unittest.main()"""
        else:
            test_code = "// Test implementation for " + language
        
        return CodeResult(
            code=test_code,
            explanation="Generated test template",
            dependencies=['unittest'] if language == 'python' else []
        )
    
    def _generate_documentation(self, parsed_prompt: ParsedPrompt) -> CodeResult:
        """Generate documentation."""
        return CodeResult(
            code="# Documentation will be generated",
            explanation="Documentation generation functionality",
            dependencies=[]
        )
    
    def _extract_name_from_description(self, description: str) -> str:
        """Extract function/class name from description."""
        # Look for quoted names or common patterns
        quoted_match = re.search(r'["\']([a-zA-Z_][a-zA-Z0-9_]*)["\']', description)
        if quoted_match:
            return quoted_match.group(1)
        
        # Look for function/class keywords followed by names
        func_match = re.search(r'(?:function|def|class)\s+([a-zA-Z_][a-zA-Z0-9_]*)', description, re.IGNORECASE)
        if func_match:
            return func_match.group(1)
        
        # Default name
        return "example_function"
    
    def _generate_function_template(self, name: str, language: str, description: str) -> str:
        """Generate a function template."""
        if language == 'python':
            return f'''def {name}():
    """
    {description}
    
    Returns:
        None: Function implementation needed
    """
    # TODO: Implement function logic
    pass'''
        elif language == 'javascript':
            return f'''function {name}() {{
    // {description}
    // TODO: Implement function logic
}}'''
        else:
            return f"// {name} function for {language}\n// TODO: Implement"
    
    def _generate_class_template(self, name: str, language: str, description: str) -> str:
        """Generate a class template."""
        if language == 'python':
            return f'''class {name}:
    """
    {description}
    """
    
    def __init__(self):
        """Initialize the {name} instance."""
        # TODO: Add initialization logic
        pass
    
    def example_method(self):
        """Example method for the class."""
        # TODO: Implement method logic
        pass'''
        elif language == 'javascript':
            return f'''class {name} {{
    // {description}
    
    constructor() {{
        // TODO: Add initialization logic
    }}
    
    exampleMethod() {{
        // TODO: Implement method logic
    }}
}}'''
        else:
            return f"// {name} class for {language}\n// TODO: Implement"
    
    def _generate_basic_tests(self, name: str, language: str) -> str:
        """Generate basic test structure."""
        if language == 'python':
            return f'''import unittest

class Test{name.title()}(unittest.TestCase):
    def test_{name}(self):
        """Test {name} functionality."""
        # TODO: Add test implementation
        pass

if __name__ == '__main__':
    unittest.main()'''
        elif language == 'javascript':
            return f'''test('{name}', () => {{
    // TODO: Add test implementation
    expect(true).toBe(true);
}});'''
        else:
            return f"// Tests for {name}"
    
    def _extract_dependencies(self, description: str) -> List[str]:
        """Extract potential dependencies from description."""
        common_deps = {
            'requests': ['http', 'api', 'request', 'web'],
            'numpy': ['array', 'math', 'scientific', 'numerical'],
            'pandas': ['data', 'csv', 'dataframe', 'analysis'],
            'flask': ['web', 'server', 'api', 'route'],
            'django': ['web', 'framework', 'model', 'view'],
            'pytest': ['test', 'testing', 'unit test']
        }
        
        dependencies = []
        description_lower = description.lower()
        
        for dep, keywords in common_deps.items():
            if any(keyword in description_lower for keyword in keywords):
                dependencies.append(dep)
        
        return dependencies
