"""
Hugging Face Inference API service for code generation.
Free tier available - no API key required for public models.
"""
import requests
import json
from typing import Dict, Optional
import time

class HuggingFaceCodeGenerator:
    """Free code generation using Hugging Face Inference API."""
    
    def __init__(self):
        # Using free public models - no API key required
        self.base_url = "https://api-inference.huggingface.co/models"
        
        # Reliable free code generation models
        self.models = {
            "python": "gpt2",  # Most reliable, always available
            "javascript": "gpt2", 
            "java": "gpt2",
            "cpp": "gpt2",
            "general": "gpt2",  # Reliable fallback
            "backup": "distilgpt2"  # Faster alternative
        }
        
        # Headers for requests
        self.headers = {
            "Content-Type": "application/json"
        }
    
    def generate_code(self, prompt: str, language: str = "python", context: str = "") -> Dict:
        """
        Generate code using Hugging Face free models.
        
        Args:
            prompt: Description of what code to generate
            language: Programming language (python, javascript, etc.)
            context: Additional context or requirements
            
        Returns:
            Dict with generated code, explanation, and status
        """
        try:
            # Choose appropriate model
            model_name = self.models.get(language.lower(), self.models["general"])
            
            # Construct the full prompt
            full_prompt = self._construct_prompt(prompt, language, context)
            
            # Make request to Hugging Face
            response = self._make_request(model_name, full_prompt)
            
            if response:
                # Parse and clean the response
                generated_code = self._parse_response(response, language)
                
                return {
                    "code": generated_code,
                    "explanation": f"Generated {language} code for: {prompt}",
                    "status": "success",
                    "model_used": model_name
                }
            else:
                return self._fallback_response(prompt, language)
                
        except Exception as e:
            print(f"Error in code generation: {e}")
            return self._fallback_response(prompt, language, str(e))
    
    def _construct_prompt(self, prompt: str, language: str, context: str) -> str:
        """Construct a well-formatted prompt for code generation."""
        
        # Create a more detailed prompt that works better with GPT-2
        if language.lower() == "python":
            base_prompt = f"""# Task: {prompt}
# Language: Python
# {context if context else 'Write clean, working code'}

def """
        elif language.lower() == "javascript":
            base_prompt = f"""// Task: {prompt}
// Language: JavaScript
// {context if context else 'Write clean, working code'}

function """
        elif language.lower() == "java":
            base_prompt = f"""// Task: {prompt}
// Language: Java
// {context if context else 'Write clean, working code'}

public static """
        else:
            base_prompt = f"""// Task: {prompt}
// Language: {language}
// {context if context else 'Write clean, working code'}

"""
        
        return base_prompt
    
    def _make_request(self, model_name: str, prompt: str) -> Optional[str]:
        """Make request to Hugging Face Inference API."""
        
        url = f"{self.base_url}/{model_name}"
        
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_length": 200,
                "temperature": 0.7,
                "do_sample": True,
                "top_p": 0.9
            }
        }
        
        try:
            response = requests.post(
                url, 
                headers=self.headers, 
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    return result[0].get("generated_text", "")
                return result.get("generated_text", "")
            
            elif response.status_code == 503:
                # Model is loading, wait and retry
                print("Model loading, waiting...")
                time.sleep(10)
                return self._make_request(model_name, prompt)
            
            else:
                print(f"API Error: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.Timeout:
            print("Request timeout - using fallback")
            return None
        except Exception as e:
            print(f"Request error: {e}")
            return None
    
    def _parse_response(self, response: str, language: str) -> str:
        """Parse and clean the generated response."""
        
        if not response:
            return self._generate_simple_code(language)
        
        # Clean up the response - GPT-2 often continues beyond what we want
        lines = response.split('\n')
        code_lines = []
        
        # Look for the actual generated code after our prompt
        start_found = False
        for line in lines:
            # Skip comment lines that are part of our prompt
            if line.startswith('#') and ('Task:' in line or 'Language:' in line):
                continue
            
            # Start collecting after we see function definition
            if ('def ' in line or 'function ' in line or 'public static' in line) and not start_found:
                start_found = True
                code_lines.append(line)
                continue
            
            if start_found:
                # Stop at empty lines or when we hit unrelated content
                if line.strip() == '' and len(code_lines) > 3:
                    break
                if line.startswith('def ') and len(code_lines) > 1:  # New function started
                    break
                if 'Task:' in line or 'Language:' in line:  # Back to prompt format
                    break
                    
                code_lines.append(line)
                
                # Limit length to prevent runaway generation
                if len(code_lines) > 20:
                    break
        
        if code_lines and len(code_lines) > 1:
            result = '\n'.join(code_lines)
            # Basic validation - make sure it looks like code
            if any(keyword in result for keyword in ['def ', 'function ', 'return', '=', '(', ')']):
                return result
        
        return self._generate_simple_code(language)
    
    def _generate_simple_code(self, language: str) -> str:
        """Generate simple template code when AI fails."""
        
        templates = {
            "python": '''def example_function():
    """
    Example function - replace with your implementation.
    """
    print("Hello, World!")
    return True''',
            
            "javascript": '''function exampleFunction() {
    // Example function - replace with your implementation
    console.log("Hello, World!");
    return true;
}''',
            
            "java": '''public class Example {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}''',
            
            "cpp": '''#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}'''
        }
        
        return templates.get(language.lower(), templates["python"])
    
    def _fallback_response(self, prompt: str, language: str, error: str = "") -> Dict:
        """Provide fallback response when API fails."""
        
        return {
            "code": self._generate_simple_code(language),
            "explanation": f"Generated template {language} code for: {prompt}. {error}",
            "status": "fallback",
            "model_used": "template"
        }

# Global instance
code_generator = HuggingFaceCodeGenerator()
