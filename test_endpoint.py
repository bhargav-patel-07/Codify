#!/usr/bin/env python3
"""
Test script for the Coding Agent API endpoint.
"""
import requests
import json

def test_coding_agent():
    """Test the /api/generate endpoint."""
    
    # API endpoint
    url = "http://localhost:8000/api/generate"
    
    # Test data
    test_requests = [
        {
            "prompt": "Create a Python function to add two numbers",
            "language": "python",
            "context": "Simple addition with type hints"
        },
        {
            "prompt": "Create a JavaScript function to reverse a string", 
            "language": "javascript",
            "context": "Use modern ES6 syntax"
        },
        {
            "prompt": "Create a function to calculate fibonacci numbers",
            "language": "python",
            "context": "Use recursion and memoization"
        }
    ]
    
    print("🧪 Testing Coding Agent API Endpoint")
    print("=" * 50)
    
    for i, test_data in enumerate(test_requests, 1):
        print(f"\n📝 Test {i}: {test_data['prompt']}")
        print("-" * 40)
        
        try:
            response = requests.post(url, json=test_data, timeout=10)
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Status: SUCCESS")
                print(f"📄 Generated Code:\n{result['code']}")
                print(f"💡 Explanation: {result['explanation']}")
                print(f"🔧 Status: {result['status']}")
            else:
                print(f"❌ HTTP Error {response.status_code}")
                print(f"Response: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print("❌ Connection Error: Server not running or wrong URL")
            print("💡 Make sure server is running with: python start.py")
            break
        except requests.exceptions.Timeout:
            print("❌ Timeout Error: Request took too long")
        except Exception as e:
            print(f"❌ Unexpected Error: {e}")

def test_health_check():
    """Test the health check endpoint."""
    print("\n🏥 Testing Health Check Endpoint")
    print("=" * 40)
    
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            result = response.json()
            print("✅ Health Check: PASSED")
            print(f"📊 Status: {json.dumps(result, indent=2)}")
        else:
            print(f"❌ Health Check Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health Check Error: {e}")

if __name__ == "__main__":
    # Test health check first
    test_health_check()
    
    # Test code generation endpoint
    test_coding_agent()
    
    print("\n🎉 Testing Complete!")
    print("💡 If you see placeholder responses, that's normal - the AI model isn't connected yet.")
