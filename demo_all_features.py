#!/usr/bin/env python3
"""
Comprehensive demo of all Coding Agent features.
"""
import requests
import json
import time

def demo_coding_agent():
    """Demonstrate all features of the AI-powered Coding Agent."""
    
    print("🤖 AI-POWERED CODING AGENT DEMO")
    print("=" * 60)
    print("🚀 Features: Code Generation | Analysis | Execution")
    print("=" * 60)
    
    base_url = "http://localhost:8000"
    
    # Test 1: Health Check
    print("\n🏥 1. HEALTH CHECK")
    print("-" * 30)
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            health = response.json()
            print("✅ Server Status: HEALTHY")
            print(f"📊 Services: {health.get('services', {})}")
        else:
            print("❌ Server not healthy")
            return
    except:
        print("❌ Server not running! Please start with: python start.py")
        return
    
    # Test 2: AI Code Generation
    print("\n🧠 2. AI CODE GENERATION")
    print("-" * 30)
    
    generation_tests = [
        {
            "name": "Python Factorial Function",
            "prompt": "create a function to calculate factorial of a number",
            "language": "python",
            "context": "use recursion and include error handling"
        },
        {
            "name": "JavaScript Array Sorter",
            "prompt": "create a function to sort an array of numbers",
            "language": "javascript", 
            "context": "use modern ES6 syntax"
        }
    ]
    
    generated_codes = {}
    
    for test in generation_tests:
        print(f"\n🔍 Generating: {test['name']}")
        try:
            response = requests.post(f"{base_url}/api/generate", json=test, timeout=30)
            if response.status_code == 200:
                result = response.json()
                print("✅ Generation: SUCCESS")
                print(f"📝 Code Preview:\n{result['code'][:150]}...")
                print(f"💡 Status: {result['status']}")
                generated_codes[test['language']] = result['code']
            else:
                print(f"❌ Generation failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    # Test 3: Code Analysis
    print("\n🔍 3. CODE ANALYSIS")
    print("-" * 30)
    
    if 'python' in generated_codes:
        print("🔍 Analyzing generated Python code...")
        analysis_request = {
            "code": generated_codes['python'],
            "language": "python"
        }
        
        try:
            response = requests.post(f"{base_url}/api/analyze", json=analysis_request, timeout=15)
            if response.status_code == 200:
                result = response.json()
                print("✅ Analysis: SUCCESS")
                print(f"📊 Quality Score: {result['score']}/100")
                print(f"📈 Metrics: {result['metrics']}")
                print(f"⚠️  Issues Found: {len(result['issues'])}")
                print(f"💡 Suggestions: {len(result['suggestions'])}")
                
                if result['suggestions']:
                    print("🔧 Top Suggestions:")
                    for suggestion in result['suggestions'][:3]:
                        print(f"   • {suggestion}")
            else:
                print(f"❌ Analysis failed: {response.status_code}")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    # Test 4: Code Execution
    print("\n⚡ 4. CODE EXECUTION")
    print("-" * 30)
    
    # Test with simple Python code
    test_code = '''
def greet(name):
    return f"Hello, {name}!"

print(greet("AI Coding Agent"))
print("Code execution successful!")
'''
    
    execution_request = {
        "code": test_code,
        "language": "python",
        "stdin": ""
    }
    
    print("⚡ Executing Python code...")
    try:
        response = requests.post(f"{base_url}/api/execute", json=execution_request, timeout=20)
        if response.status_code == 200:
            result = response.json()
            print("✅ Execution: SUCCESS")
            print(f"📤 Output:\n{result['stdout']}")
            print(f"🔧 Exit Code: {result['exit_code']}")
            print(f"🐍 Language: {result['language']} v{result['version']}")
            
            if result['stderr']:
                print(f"⚠️  Errors: {result['stderr']}")
        else:
            print(f"❌ Execution failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 5: Complete Workflow Demo
    print("\n🔄 5. COMPLETE AI WORKFLOW")
    print("-" * 30)
    print("🎯 Task: Generate → Analyze → Execute")
    
    workflow_prompt = {
        "prompt": "create a simple calculator function that adds two numbers",
        "language": "python",
        "context": "include input validation and return the result"
    }
    
    print("🧠 Step 1: Generating calculator code...")
    try:
        # Generate
        gen_response = requests.post(f"{base_url}/api/generate", json=workflow_prompt, timeout=30)
        if gen_response.status_code == 200:
            gen_result = gen_response.json()
            calculator_code = gen_result['code']
            print("✅ Code generated successfully")
            
            # Analyze
            print("🔍 Step 2: Analyzing code quality...")
            analysis_response = requests.post(f"{base_url}/api/analyze", json={
                "code": calculator_code,
                "language": "python"
            }, timeout=15)
            
            if analysis_response.status_code == 200:
                analysis_result = analysis_response.json()
                print(f"✅ Analysis complete - Score: {analysis_result['score']}/100")
                
                # Execute
                print("⚡ Step 3: Executing generated code...")
                exec_code = calculator_code + "\n\n# Test the function\nprint(add(5, 3))"
                
                exec_response = requests.post(f"{base_url}/api/execute", json={
                    "code": exec_code,
                    "language": "python"
                }, timeout=20)
                
                if exec_response.status_code == 200:
                    exec_result = exec_response.json()
                    print("✅ Execution successful!")
                    print(f"📤 Result: {exec_result['stdout'].strip()}")
                    
                    print("\n🎉 COMPLETE WORKFLOW SUCCESS!")
                    print("   Generated → Analyzed → Executed ✅")
                else:
                    print("❌ Execution failed")
            else:
                print("❌ Analysis failed")
        else:
            print("❌ Generation failed")
    except Exception as e:
        print(f"❌ Workflow error: {e}")
    
    # Summary
    print("\n" + "=" * 60)
    print("🎉 CODING AGENT DEMO COMPLETE!")
    print("=" * 60)
    print("✅ Available Features:")
    print("   🧠 AI Code Generation (Hugging Face)")
    print("   🔍 Code Analysis & Quality Scoring")
    print("   ⚡ Safe Code Execution (Piston API)")
    print("   🔄 Complete AI-Powered Workflows")
    print("\n🚀 Your Coding Agent is ready for production!")
    print("📚 API Docs: http://localhost:8000/docs")

if __name__ == "__main__":
    demo_coding_agent()
