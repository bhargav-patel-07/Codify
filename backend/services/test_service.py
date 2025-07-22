"""
Test service for automated testing and validation.
"""
import ast
import re
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from .piston_service import PistonService

@dataclass
class TestResult:
    passed: bool
    test_name: str
    output: str
    error: Optional[str] = None
    execution_time: float = 0.0

@dataclass
class TestSuite:
    name: str
    tests: List[TestResult]
    total_tests: int
    passed_tests: int
    failed_tests: int
    success_rate: float

class TestService:
    """Service for running and managing tests."""
    
    def __init__(self):
        self.piston_service = PistonService()
        self.test_frameworks = {
            'python': {
                'unittest': self._generate_unittest_template,
                'pytest': self._generate_pytest_template
            },
            'javascript': {
                'jest': self._generate_jest_template,
                'mocha': self._generate_mocha_template
            },
            'java': {
                'junit': self._generate_junit_template
            }
        }
    
    def run_tests(self, language: str, code: str, test_code: str, framework: str = 'default') -> TestSuite:
        """Run tests for the given code."""
        try:
            # Execute the test code
            result = self.piston_service.run_tests(language, code, test_code)
            
            # Parse test results
            test_results = self._parse_test_output(result.stdout, result.stderr, language, framework)
            
            # Calculate statistics
            total_tests = len(test_results)
            passed_tests = sum(1 for test in test_results if test.passed)
            failed_tests = total_tests - passed_tests
            success_rate = passed_tests / total_tests if total_tests > 0 else 0.0
            
            return TestSuite(
                name=f"{language}_tests",
                tests=test_results,
                total_tests=total_tests,
                passed_tests=passed_tests,
                failed_tests=failed_tests,
                success_rate=success_rate
            )
        except Exception as e:
            return TestSuite(
                name=f"{language}_tests",
                tests=[TestResult(
                    passed=False,
                    test_name="execution_error",
                    output="",
                    error=str(e)
                )],
                total_tests=1,
                passed_tests=0,
                failed_tests=1,
                success_rate=0.0
            )
    
    def generate_test_template(self, language: str, function_name: str, framework: str = 'default') -> str:
        """Generate a test template for a function."""
        if language in self.test_frameworks:
            frameworks = self.test_frameworks[language]
            if framework in frameworks:
                return frameworks[framework](function_name)
            else:
                # Use the first available framework as default
                default_framework = list(frameworks.keys())[0]
                return frameworks[default_framework](function_name)
        else:
            return self._generate_generic_test_template(language, function_name)
    
    def validate_test_code(self, language: str, test_code: str) -> Dict[str, Any]:
        """Validate test code syntax and structure."""
        try:
            # Check syntax using Piston service
            validation = self.piston_service.validate_code_syntax(language, test_code)
            
            # Additional validation for test structure
            structure_validation = self._validate_test_structure(language, test_code)
            
            return {
                "syntax_valid": validation["valid"],
                "syntax_errors": validation.get("errors"),
                "structure_valid": structure_validation["valid"],
                "structure_issues": structure_validation.get("issues", []),
                "test_count": structure_validation.get("test_count", 0)
            }
        except Exception as e:
            return {
                "syntax_valid": False,
                "syntax_errors": str(e),
                "structure_valid": False,
                "structure_issues": ["Validation failed"],
                "test_count": 0
            }
    
    def _parse_test_output(self, stdout: str, stderr: str, language: str, framework: str) -> List[TestResult]:
        """Parse test output to extract individual test results."""
        test_results = []
        
        if language == 'python':
            if 'unittest' in framework or 'unittest' in stdout:
                test_results = self._parse_unittest_output(stdout, stderr)
            elif 'pytest' in framework or 'pytest' in stdout:
                test_results = self._parse_pytest_output(stdout, stderr)
            else:
                test_results = self._parse_generic_python_output(stdout, stderr)
        elif language == 'javascript':
            if 'jest' in framework:
                test_results = self._parse_jest_output(stdout, stderr)
            else:
                test_results = self._parse_generic_js_output(stdout, stderr)
        else:
            test_results = self._parse_generic_output(stdout, stderr)
        
        return test_results
    
    def _parse_unittest_output(self, stdout: str, stderr: str) -> List[TestResult]:
        """Parse unittest output."""
        test_results = []
        
        # Look for test method results
        test_pattern = r'test_(\w+).*?(OK|FAIL|ERROR)'
        matches = re.findall(test_pattern, stdout + stderr, re.IGNORECASE)
        
        for test_name, status in matches:
            test_results.append(TestResult(
                passed=status.upper() == 'OK',
                test_name=f"test_{test_name}",
                output=stdout,
                error=stderr if status.upper() != 'OK' else None
            ))
        
        # If no specific tests found, create a general result
        if not test_results:
            passed = 'FAILED' not in stderr and 'ERROR' not in stderr
            test_results.append(TestResult(
                passed=passed,
                test_name="general_test",
                output=stdout,
                error=stderr if not passed else None
            ))
        
        return test_results
    
    def _parse_pytest_output(self, stdout: str, stderr: str) -> List[TestResult]:
        """Parse pytest output."""
        test_results = []
        
        # Look for pytest test results
        test_pattern = r'(\w+\.py::test_\w+)\s+(PASSED|FAILED)'
        matches = re.findall(test_pattern, stdout + stderr)
        
        for test_name, status in matches:
            test_results.append(TestResult(
                passed=status == 'PASSED',
                test_name=test_name,
                output=stdout,
                error=stderr if status == 'FAILED' else None
            ))
        
        return test_results
    
    def _parse_jest_output(self, stdout: str, stderr: str) -> List[TestResult]:
        """Parse Jest output."""
        test_results = []
        
        # Look for Jest test results
        test_pattern = r'✓\s+(.+)|✗\s+(.+)'
        matches = re.findall(test_pattern, stdout + stderr)
        
        for passed_test, failed_test in matches:
            if passed_test:
                test_results.append(TestResult(
                    passed=True,
                    test_name=passed_test.strip(),
                    output=stdout
                ))
            elif failed_test:
                test_results.append(TestResult(
                    passed=False,
                    test_name=failed_test.strip(),
                    output=stdout,
                    error=stderr
                ))
        
        return test_results
    
    def _parse_generic_python_output(self, stdout: str, stderr: str) -> List[TestResult]:
        """Parse generic Python test output."""
        return [TestResult(
            passed=not stderr and 'error' not in stdout.lower(),
            test_name="python_test",
            output=stdout,
            error=stderr if stderr else None
        )]
    
    def _parse_generic_js_output(self, stdout: str, stderr: str) -> List[TestResult]:
        """Parse generic JavaScript test output."""
        return [TestResult(
            passed=not stderr and 'error' not in stdout.lower(),
            test_name="javascript_test",
            output=stdout,
            error=stderr if stderr else None
        )]
    
    def _parse_generic_output(self, stdout: str, stderr: str) -> List[TestResult]:
        """Parse generic test output."""
        return [TestResult(
            passed=not stderr,
            test_name="generic_test",
            output=stdout,
            error=stderr if stderr else None
        )]
    
    def _validate_test_structure(self, language: str, test_code: str) -> Dict[str, Any]:
        """Validate the structure of test code."""
        if language == 'python':
            return self._validate_python_test_structure(test_code)
        elif language == 'javascript':
            return self._validate_js_test_structure(test_code)
        else:
            return {"valid": True, "test_count": 1}
    
    def _validate_python_test_structure(self, test_code: str) -> Dict[str, Any]:
        """Validate Python test structure."""
        try:
            tree = ast.parse(test_code)
            test_functions = []
            
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef) and node.name.startswith('test_'):
                    test_functions.append(node.name)
            
            return {
                "valid": len(test_functions) > 0,
                "test_count": len(test_functions),
                "issues": [] if test_functions else ["No test functions found"]
            }
        except SyntaxError as e:
            return {
                "valid": False,
                "test_count": 0,
                "issues": [f"Syntax error: {e}"]
            }
    
    def _validate_js_test_structure(self, test_code: str) -> Dict[str, Any]:
        """Validate JavaScript test structure."""
        # Simple regex-based validation for JS tests
        test_patterns = [
            r'test\s*\(',
            r'it\s*\(',
            r'describe\s*\('
        ]
        
        test_count = 0
        for pattern in test_patterns:
            test_count += len(re.findall(pattern, test_code))
        
        return {
            "valid": test_count > 0,
            "test_count": test_count,
            "issues": [] if test_count > 0 else ["No test functions found"]
        }
    
    def _generate_unittest_template(self, function_name: str) -> str:
        """Generate unittest template."""
        return f'''import unittest

class Test{function_name.title()}(unittest.TestCase):
    def test_{function_name}_basic(self):
        """Test basic functionality of {function_name}."""
        # TODO: Add test implementation
        result = {function_name}()
        self.assertIsNotNone(result)
    
    def test_{function_name}_edge_cases(self):
        """Test edge cases for {function_name}."""
        # TODO: Add edge case tests
        pass

if __name__ == '__main__':
    unittest.main()'''
    
    def _generate_pytest_template(self, function_name: str) -> str:
        """Generate pytest template."""
        return f'''import pytest

def test_{function_name}_basic():
    """Test basic functionality of {function_name}."""
    # TODO: Add test implementation
    result = {function_name}()
    assert result is not None

def test_{function_name}_edge_cases():
    """Test edge cases for {function_name}."""
    # TODO: Add edge case tests
    pass

def test_{function_name}_error_handling():
    """Test error handling for {function_name}."""
    # TODO: Add error handling tests
    pass'''
    
    def _generate_jest_template(self, function_name: str) -> str:
        """Generate Jest template."""
        return f'''describe('{function_name}', () => {{
    test('should work with basic input', () => {{
        // TODO: Add test implementation
        const result = {function_name}();
        expect(result).toBeDefined();
    }});
    
    test('should handle edge cases', () => {{
        // TODO: Add edge case tests
    }});
    
    test('should handle errors gracefully', () => {{
        // TODO: Add error handling tests
    }});
}});'''
    
    def _generate_mocha_template(self, function_name: str) -> str:
        """Generate Mocha template."""
        return f'''const assert = require('assert');

describe('{function_name}', function() {{
    it('should work with basic input', function() {{
        // TODO: Add test implementation
        const result = {function_name}();
        assert(result !== undefined);
    }});
    
    it('should handle edge cases', function() {{
        // TODO: Add edge case tests
    }});
}});'''
    
    def _generate_junit_template(self, function_name: str) -> str:
        """Generate JUnit template."""
        return f'''import org.junit.Test;
import static org.junit.Assert.*;

public class {function_name.title()}Test {{
    
    @Test
    public void test{function_name.title()}Basic() {{
        // TODO: Add test implementation
        // Example: assertEquals(expected, {function_name}());
    }}
    
    @Test
    public void test{function_name.title()}EdgeCases() {{
        // TODO: Add edge case tests
    }}
}}'''
    
    def _generate_generic_test_template(self, language: str, function_name: str) -> str:
        """Generate generic test template."""
        return f'''// Test template for {function_name} in {language}
// TODO: Implement tests for {function_name}

// Test 1: Basic functionality
// Test 2: Edge cases
// Test 3: Error handling'''
