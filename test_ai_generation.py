#!/usr/bin/env python3
"""
Quick test script for AI code generation functionality.
"""
import requests
import json

def test_ai_code_generation():
    """Test the AI-powered code generation endpoint."""
    
    print("🤖 Testing AI Code Generation")
    print("=" * 50)
    
    # Test cases
    test_cases = [
        {
            "name": "Simple Python Function",
            "prompt": "create a function to calculate factorial",
            "language": "python",
            "context": "use recursion"
        },
        {
            "name": "JavaScript Function", 
            "prompt": "create a function to reverse a string",
            "language": "javascript",
            "context": "use modern ES6 syntax"
        },
        {
            "name": "Python Class",
            "prompt": "create a calculator class",
            "language": "python", 
            "context": "include basic math operations"
        }
    ]
    
    url = "http://localhost:8000/api/generate"
    
    for i, test in enumerate(test_cases, 1):
        print(f"\n🔍 Test {i}: {test['name']}")
        print("-" * 30)
        
        try:
            response = requests.post(url, json=test, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                print("✅ SUCCESS!")
                print(f"📝 Generated Code:\n{result['code'][:200]}...")
                print(f"💡 Status: {result['status']}")
                
                if len(result['code']) > 50:
                    print("✅ AI generated substantial code!")
                else:
                    print("⚠️  Short response - might be fallback")
                    
            else:
                print(f"❌ HTTP Error: {response.status_code}")
                print(f"Response: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Connection Error: Make sure server is running!")
            print("Run: python start.py")
            break
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print("\n🎉 Testing Complete!")

if __name__ == "__main__":
    test_ai_code_generation()
