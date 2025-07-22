#!/usr/bin/env python3
"""
Quick test script for the /api/generate endpoint.
"""
import requests
import json

def test_generate_endpoint():
    """Test the code generation endpoint."""
    
    print("🧪 Testing /api/generate endpoint")
    print("=" * 40)
    
    # Test data
    test_request = {
        "prompt": "create a function to reverse a string",
        "language": "python",
        "context": "make it simple and efficient"
    }
    
    url = "http://localhost:8000/api/generate"
    
    print(f"📤 Sending request to: {url}")
    print(f"📝 Request data: {json.dumps(test_request, indent=2)}")
    print("\n⏳ Waiting for response...")
    
    try:
        response = requests.post(
            url, 
            json=test_request, 
            timeout=30,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\n📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCESS!")
            print(f"\n📝 Generated Code:\n{result['code']}")
            print(f"\n💡 Explanation: {result['explanation']}")
            print(f"\n🔧 Status: {result['status']}")
        else:
            print("❌ FAILED!")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR!")
        print("Make sure server is running: python start.py")
    except requests.exceptions.Timeout:
        print("❌ TIMEOUT ERROR!")
        print("Request took too long - server might be busy")
    except Exception as e:
        print(f"❌ ERROR: {e}")

if __name__ == "__main__":
    test_generate_endpoint()
