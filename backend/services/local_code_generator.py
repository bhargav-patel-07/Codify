"""
Local rule-based code generator that works reliably without external APIs.
This provides immediate, working code generation while external APIs are unreliable.
"""
import re
from typing import Dict, List

class LocalCodeGenerator:
    """Generate code using local rules and templates."""
    
    def __init__(self):
        self.function_patterns = {
            # Math operations
            r'add|sum|plus': self._generate_add_function,
            r'subtract|minus|difference': self._generate_subtract_function,
            r'multiply|times|product': self._generate_multiply_function,
            r'divide|division': self._generate_divide_function,
            r'factorial': self._generate_factorial_function,
            r'fibonacci': self._generate_fibonacci_function,
            r'square|power': self._generate_square_function,
            
            # String operations
            r'reverse|backward': self._generate_reverse_function,
            r'uppercase|upper': self._generate_uppercase_function,
            r'lowercase|lower': self._generate_lowercase_function,
            r'palindrome': self._generate_palindrome_function,
            r'count|length': self._generate_count_function,
            
            # Array/List operations
            r'sort|order': self._generate_sort_function,
            r'search|find': self._generate_search_function,
            r'filter': self._generate_filter_function,
            r'maximum|max|largest': self._generate_max_function,
            r'minimum|min|smallest': self._generate_min_function,
            
            # Utility functions
            r'calculator': self._generate_calculator_class,
            r'hello|greet': self._generate_hello_function,
            r'random|generate': self._generate_random_function,
        }
    
    def generate_code(self, prompt: str, language: str = "python", context: str = "") -> Dict:
        """Generate code based on prompt using local rules."""
        
        prompt_lower = prompt.lower()
        
        # Find matching pattern
        for pattern, generator in self.function_patterns.items():
            if re.search(pattern, prompt_lower):
                code = generator(language, context)
                return {
                    "code": code,
                    "explanation": f"Generated {language} code for: {prompt}",
                    "status": "success",
                    "model_used": "local_generator"
                }
        
        # Default function generator
        return {
            "code": self._generate_generic_function(prompt, language, context),
            "explanation": f"Generated generic {language} template for: {prompt}",
            "status": "success", 
            "model_used": "local_generator"
        }
    
    def _generate_add_function(self, language: str, context: str) -> str:
        if language.lower() == "python":
            return '''def add_numbers(a: int, b: int) -> int:
    """Add two numbers and return the sum."""
    return a + b

# Example usage
result = add_numbers(5, 3)
print(f"5 + 3 = {result}")'''
        
        elif language.lower() == "javascript":
            return '''function addNumbers(a, b) {
    // Add two numbers and return the sum
    return a + b;
}

// Example usage
const result = addNumbers(5, 3);
console.log(`5 + 3 = ${result}`);'''
        
        else:
            return f"// {language} function to add two numbers\n// TODO: Implement addition function"
    
    def _generate_factorial_function(self, language: str, context: str) -> str:
        if language.lower() == "python":
            if "recursion" in context.lower():
                return '''def factorial(n: int) -> int:
    """Calculate factorial using recursion."""
    if n < 0:
        raise ValueError("Factorial is not defined for negative numbers")
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)

# Example usage
result = factorial(5)
print(f"5! = {result}")'''
            else:
                return '''def factorial(n: int) -> int:
    """Calculate factorial using iteration."""
    if n < 0:
        raise ValueError("Factorial is not defined for negative numbers")
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result

# Example usage
result = factorial(5)
print(f"5! = {result}")'''
        
        elif language.lower() == "javascript":
            return '''function factorial(n) {
    // Calculate factorial with error handling
    if (n < 0) {
        throw new Error("Factorial is not defined for negative numbers");
    }
    if (n === 0 || n === 1) {
        return 1;
    }
    
    let result = 1;
    for (let i = 1; i <= n; i++) {
        result *= i;
    }
    return result;
}

// Example usage
const result = factorial(5);
console.log(`5! = ${result}`);'''
        
        else:
            return f"// {language} function to calculate factorial\n// TODO: Implement factorial function"
    
    def _generate_reverse_function(self, language: str, context: str) -> str:
        if language.lower() == "python":
            return '''def reverse_string(text: str) -> str:
    """Reverse a string and return the result."""
    return text[::-1]

# Example usage
original = "hello world"
reversed_text = reverse_string(original)
print(f"'{original}' reversed is '{reversed_text}'")'''
        
        elif language.lower() == "javascript":
            return '''function reverseString(text) {
    // Reverse a string using modern ES6 syntax
    return text.split('').reverse().join('');
}

// Example usage
const original = "hello world";
const reversed = reverseString(original);
console.log(`'${original}' reversed is '${reversed}'`);'''
        
        else:
            return f"// {language} function to reverse a string\n// TODO: Implement string reversal"
    
    def _generate_calculator_class(self, language: str, context: str) -> str:
        if language.lower() == "python":
            return '''class Calculator:
    """Simple calculator class with basic operations."""
    
    def add(self, a: float, b: float) -> float:
        """Add two numbers."""
        return a + b
    
    def subtract(self, a: float, b: float) -> float:
        """Subtract second number from first."""
        return a - b
    
    def multiply(self, a: float, b: float) -> float:
        """Multiply two numbers."""
        return a * b
    
    def divide(self, a: float, b: float) -> float:
        """Divide first number by second."""
        if b == 0:
            raise ValueError("Cannot divide by zero")
        return a / b

# Example usage
calc = Calculator()
print(f"10 + 5 = {calc.add(10, 5)}")
print(f"10 - 5 = {calc.subtract(10, 5)}")
print(f"10 * 5 = {calc.multiply(10, 5)}")
print(f"10 / 5 = {calc.divide(10, 5)}")'''
        
        elif language.lower() == "javascript":
            return '''class Calculator {
    // Simple calculator class with basic operations
    
    add(a, b) {
        return a + b;
    }
    
    subtract(a, b) {
        return a - b;
    }
    
    multiply(a, b) {
        return a * b;
    }
    
    divide(a, b) {
        if (b === 0) {
            throw new Error("Cannot divide by zero");
        }
        return a / b;
    }
}

// Example usage
const calc = new Calculator();
console.log(`10 + 5 = ${calc.add(10, 5)}`);
console.log(`10 - 5 = ${calc.subtract(10, 5)}`);
console.log(`10 * 5 = ${calc.multiply(10, 5)}`);
console.log(`10 / 5 = ${calc.divide(10, 5)}`);'''
        
        else:
            return f"// {language} calculator class\n// TODO: Implement calculator operations"
    
    def _generate_fibonacci_function(self, language: str, context: str) -> str:
        if language.lower() == "python":
            return '''def fibonacci(n: int) -> int:
    """Generate nth Fibonacci number."""
    if n < 0:
        raise ValueError("Fibonacci is not defined for negative numbers")
    if n == 0:
        return 0
    if n == 1:
        return 1
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

# Example usage
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")'''
        
        else:
            return f"// {language} function to calculate Fibonacci numbers\n// TODO: Implement Fibonacci function"
    
    def _generate_sort_function(self, language: str, context: str) -> str:
        if language.lower() == "python":
            return '''def sort_array(arr: list) -> list:
    """Sort an array of numbers in ascending order."""
    return sorted(arr)

def bubble_sort(arr: list) -> list:
    """Sort using bubble sort algorithm."""
    arr_copy = arr.copy()
    n = len(arr_copy)
    
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr_copy[j] > arr_copy[j + 1]:
                arr_copy[j], arr_copy[j + 1] = arr_copy[j + 1], arr_copy[j]
    
    return arr_copy

# Example usage
numbers = [64, 34, 25, 12, 22, 11, 90]
print(f"Original: {numbers}")
print(f"Sorted: {sort_array(numbers)}")
print(f"Bubble sort: {bubble_sort(numbers)}")'''
        
        elif language.lower() == "javascript":
            return '''function sortArray(arr) {
    // Sort an array of numbers in ascending order
    return [...arr].sort((a, b) => a - b);
}

function bubbleSort(arr) {
    // Sort using bubble sort algorithm
    const arrCopy = [...arr];
    const n = arrCopy.length;
    
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arrCopy[j] > arrCopy[j + 1]) {
                [arrCopy[j], arrCopy[j + 1]] = [arrCopy[j + 1], arrCopy[j]];
            }
        }
    }
    
    return arrCopy;
}

// Example usage
const numbers = [64, 34, 25, 12, 22, 11, 90];
console.log(`Original: ${numbers}`);
console.log(`Sorted: ${sortArray(numbers)}`);
console.log(`Bubble sort: ${bubbleSort(numbers)}`);'''
        
        else:
            return f"// {language} function to sort an array\n// TODO: Implement sorting function"
    
    def _generate_generic_function(self, prompt: str, language: str, context: str) -> str:
        """Generate a generic function template."""
        
        # Extract potential function name from prompt
        words = re.findall(r'\b\w+\b', prompt.lower())
        function_name = "_".join(words[:3]) if words else "custom_function"
        
        if language.lower() == "python":
            return f'''def {function_name}():
    """
    {prompt}
    
    Context: {context if context else 'No additional context provided'}
    """
    # TODO: Implement the logic for: {prompt}
    pass

# Example usage
# result = {function_name}()
# print(result)'''
        
        elif language.lower() == "javascript":
            return f'''function {function_name}() {{
    // {prompt}
    // Context: {context if context else 'No additional context provided'}
    
    // TODO: Implement the logic for: {prompt}
    return null;
}}

// Example usage
// const result = {function_name}();
// console.log(result);'''
        
        else:
            return f'''// {language} function for: {prompt}
// Context: {context if context else 'No additional context provided'}
// TODO: Implement the logic'''
    
    # Helper methods for other patterns
    def _generate_subtract_function(self, language: str, context: str) -> str:
        if language.lower() == "python":
            return '''def subtract_numbers(a: int, b: int) -> int:
    """Subtract second number from first."""
    return a - b'''
        return f"// {language} subtraction function"
    
    def _generate_multiply_function(self, language: str, context: str) -> str:
        if language.lower() == "python":
            return '''def multiply_numbers(a: int, b: int) -> int:
    """Multiply two numbers."""
    return a * b'''
        return f"// {language} multiplication function"
    
    def _generate_divide_function(self, language: str, context: str) -> str:
        if language.lower() == "python":
            return '''def divide_numbers(a: float, b: float) -> float:
    """Divide first number by second with error handling."""
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b'''
        return f"// {language} division function"
    
    def _generate_square_function(self, language: str, context: str) -> str:
        if language.lower() == "python":
            return '''def square_number(n: int) -> int:
    """Calculate the square of a number."""
    return n ** 2'''
        return f"// {language} square function"
    
    def _generate_uppercase_function(self, language: str, context: str) -> str:
        if language.lower() == "python":
            return '''def to_uppercase(text: str) -> str:
    """Convert text to uppercase."""
    return text.upper()'''
        return f"// {language} uppercase function"
    
    def _generate_lowercase_function(self, language: str, context: str) -> str:
        if language.lower() == "python":
            return '''def to_lowercase(text: str) -> str:
    """Convert text to lowercase."""
    return text.lower()'''
        return f"// {language} lowercase function"
    
    def _generate_palindrome_function(self, language: str, context: str) -> str:
        if language.lower() == "python":
            return '''def is_palindrome(text: str) -> bool:
    """Check if text is a palindrome."""
    cleaned = text.lower().replace(" ", "")
    return cleaned == cleaned[::-1]'''
        return f"// {language} palindrome function"
    
    def _generate_count_function(self, language: str, context: str) -> str:
        if language.lower() == "python":
            return '''def count_characters(text: str) -> int:
    """Count characters in text."""
    return len(text)'''
        return f"// {language} count function"
    
    def _generate_search_function(self, language: str, context: str) -> str:
        if language.lower() == "python":
            return '''def search_array(arr: list, target) -> int:
    """Search for target in array, return index or -1."""
    try:
        return arr.index(target)
    except ValueError:
        return -1'''
        return f"// {language} search function"
    
    def _generate_filter_function(self, language: str, context: str) -> str:
        if language.lower() == "python":
            return '''def filter_even_numbers(numbers: list) -> list:
    """Filter even numbers from a list."""
    return [n for n in numbers if n % 2 == 0]'''
        return f"// {language} filter function"
    
    def _generate_max_function(self, language: str, context: str) -> str:
        if language.lower() == "python":
            return '''def find_maximum(numbers: list) -> int:
    """Find the maximum number in a list."""
    if not numbers:
        raise ValueError("List cannot be empty")
    return max(numbers)'''
        return f"// {language} max function"
    
    def _generate_min_function(self, language: str, context: str) -> str:
        if language.lower() == "python":
            return '''def find_minimum(numbers: list) -> int:
    """Find the minimum number in a list."""
    if not numbers:
        raise ValueError("List cannot be empty")
    return min(numbers)'''
        return f"// {language} min function"
    
    def _generate_hello_function(self, language: str, context: str) -> str:
        if language.lower() == "python":
            return '''def greet(name: str) -> str:
    """Generate a greeting message."""
    return f"Hello, {name}! Welcome to the AI Coding Agent!"'''
        return f"// {language} greeting function"
    
    def _generate_random_function(self, language: str, context: str) -> str:
        if language.lower() == "python":
            return '''import random

def generate_random_number(min_val: int = 1, max_val: int = 100) -> int:
    """Generate a random number between min and max values."""
    return random.randint(min_val, max_val)'''
        return f"// {language} random function"

# Global instance
local_code_generator = LocalCodeGenerator()
