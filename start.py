#!/usr/bin/env python3
"""
Startup script for the Coding Agent application.
"""
import sys
import os
import subprocess

def check_dependencies():
    """Check if required dependencies are installed."""
    try:
        import fastapi
        import uvicorn
        import pydantic
        import requests
        print("✓ All required dependencies are installed")
        return True
    except ImportError as e:
        print(f"✗ Missing dependency: {e}")
        print("Please run: pip install -r requirements.txt")
        return False

def check_environment():
    """Check if environment is properly configured."""
    env_file = ".env"
    if os.path.exists(env_file):
        print("✓ Environment file found")
        return True
    else:
        print("✗ .env file not found")
        print("Please create a .env file with your configuration")
        return False

def start_server():
    """Start the FastAPI server."""
    print("Starting Coding Agent server...")
    try:
        # Add the project root to Python path
        project_root = os.path.dirname(os.path.abspath(__file__))
        sys.path.insert(0, project_root)
        
        # Import and run the main application
        import uvicorn
        
        # Use import string for reload functionality
        uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
    except Exception as e:
        print(f"Failed to start server: {e}")
        return False

def main():
    """Main startup function."""
    print("🤖 Coding Agent Startup")
    print("=" * 30)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check environment
    if not check_environment():
        print("Warning: Environment not fully configured, using defaults")
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()
