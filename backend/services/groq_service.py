"""
Groq API service for code generation.
High-performance inference with Groq's LPU technology.
"""
import requests
import json
from typing import Dict, Optional
import os

class GroqCodeGenerator:
    """Code generation using Groq API."""
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or "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"
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
        
        # Available Groq models optimized for code generation
        self.models = {
            "python": "llama3-70b-8192",
            "javascript": "llama3-70b-8192", 
            "java": "llama3-70b-8192",
            "cpp": "llama3-70b-8192",
            "general": "llama3-70b-8192",
            "fast": "llama3-8b-8192"  # Faster alternative
        }
        
        # Headers for requests
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def generate_code(self, prompt: str, language: str = "python", context: str = "") -> Dict:
        """
        Generate code using Groq API.
        
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
            
            # Construct the system and user messages
            system_message, user_message = self._construct_messages(prompt, language, context)
            
            # Make request to Groq
            response = self._make_request(model_name, system_message, user_message)
            
            if response:
                # Parse the response
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
    
    def _construct_messages(self, prompt: str, language: str, context: str) -> tuple:
        """Construct system and user messages for code generation."""
        
        system_message = f"""You are an expert {language} programmer. Generate clean, efficient, and well-documented code.
Follow best practices and include necessary imports. Provide only the code without additional explanations unless specifically requested."""
        
        if context:
            user_message = f"""Task: {prompt}
Language: {language}
Additional Context: {context}

Please generate the code:"""
        else:
            user_message = f"""Task: {prompt}
Language: {language}

Please generate the code:"""
        
        return system_message, user_message
    
    def _make_request(self, model_name: str, system_message: str, user_message: str) -> Optional[str]:
        """Make request to Groq API."""
        
        payload = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            "temperature": 0.3,
            "max_tokens": 1024,
            "top_p": 0.9,
            "stream": False
        }
        
        try:
            response = requests.post(
                self.base_url,
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
            else:
                print(f"Groq API Error: {response.status_code} - {response.text}")
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
            return ""
        
        # Remove markdown code blocks if present
        lines = response.strip().split('\n')
        
        # Remove ```language and ``` markers
        if lines and lines[0].startswith('```'):
            lines = lines[1:]
        if lines and lines[-1].strip() == '```':
            lines = lines[:-1]
        
        # Join and clean up
        code = '\n'.join(lines).strip()
        
        # Ensure we have some code
        if not code or len(code) < 10:
            return self._generate_basic_template(language)
        
        return code
    
    def _generate_basic_template(self, language: str) -> str:
        """Generate a basic template when API fails."""
        templates = {
            "python": """# Generated Python code template
def main():
    # TODO: Implement your logic here
    pass

if __name__ == "__main__":
    main()""",
            
            "javascript": """// Generated JavaScript code template
function main() {
    // TODO: Implement your logic here
}

main();""",
            
            "java": """// Generated Java code template
public class Main {
    public static void main(String[] args) {
        // TODO: Implement your logic here
    }
}""",
            
            "cpp": """// Generated C++ code template
#include <iostream>

int main() {
    // TODO: Implement your logic here
    return 0;
}"""
        }
        
        return templates.get(language.lower(), "// TODO: Implement your code here")
    
    def _fallback_response(self, prompt: str, language: str, error: str = "") -> Dict:
        """Provide fallback response when API fails."""
        
        fallback_code = self._generate_basic_template(language)
        
        return {
            "code": fallback_code,
            "explanation": f"Fallback template for {language} (API unavailable)",
            "status": "fallback",
            "error": error,
            "model_used": "fallback"
        }

# Global instance
code_generator = GroqCodeGenerator()
