"""
Quick start script for PathMentor testing.
This script provides a simple interface to run all tests.
"""

import asyncio
import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and return success status."""
    print(f"\n🚀 {description}")
    print(f"Command: {command}")
    print("-" * 50)
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ {description} - Success")
            if result.stdout:
                print(result.stdout)
            return True
        else:
            print(f"❌ {description} - Failed")
            if result.stderr:
                print(f"Error: {result.stderr}")
            if result.stdout:
                print(f"Output: {result.stdout}")
            return False
            
    except Exception as e:
        print(f"❌ {description} - Exception: {e}")
        return False

def check_prerequisites():
    """Check if prerequisites are met."""
    print("🔍 Checking Prerequisites")
    print("=" * 50)
    
    # Check if .env file exists
    env_file = Path("backend/.env")
    if not env_file.exists():
        print("❌ Backend .env file not found")
        print("   Please copy backend/.env.example to backend/.env and fill in your values")
        return False
    
    print("✅ Backend .env file found")
    
    # Check if frontend .env.local exists
    frontend_env = Path("frontend/.env.local")
    if not frontend_env.exists():
        print("❌ Frontend .env.local file not found")
        print("   Please create frontend/.env.local with your Supabase credentials")
        return False
    
    print("✅ Frontend .env.local file found")
    return True

def install_dependencies():
    """Install all dependencies."""
    print("\n📦 Installing Dependencies")
    print("=" * 50)
    
    success = True
    
    # Install backend dependencies
    if not run_command("cd backend && pip install -r requirements.txt", "Installing backend dependencies"):
        success = False
    
    # Install test dependencies
    if not run_command("cd backend && pip install -r requirements-test.txt", "Installing test dependencies"):
        success = False
    
    # Install frontend dependencies
    if not run_command("cd frontend && npm install", "Installing frontend dependencies"):
        success = False
    
    return success

def run_environment_test():
    """Run environment verification test."""
    return run_command("cd backend && python tests/test_environment.py", "Environment verification")

def run_database_tests():
    """Run database connection tests."""
    return run_command("cd backend && python tests/test_database_connection.py", "Database connection tests")

def start_backend_server():
    """Start the backend server."""
    print("\n🚀 Starting Backend Server")
    print("=" * 50)
    print("Starting FastAPI server on http://localhost:8000")
    print("Press Ctrl+C to stop the server")
    print("Open http://localhost:8000/docs to view API documentation")
    
    try:
        subprocess.run("cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000", shell=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")

def start_frontend_server():
    """Start the frontend server."""
    print("\n🚀 Starting Frontend Server")
    print("=" * 50)
    print("Starting Next.js server on http://localhost:3000")
    print("Press Ctrl+C to stop the server")
    
    try:
        subprocess.run("cd frontend && npm run dev", shell=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")

def run_integration_tests():
    """Run integration tests."""
    print("\n⚠️ Make sure the backend server is running on http://localhost:8000")
    input("Press Enter when the backend server is ready...")
    
    return run_command("cd backend && python tests/test_integration.py", "Frontend-Backend integration tests")

def main():
    """Main menu for testing."""
    print("🎯 PathMentor Testing Quick Start")
    print("=" * 60)
    
    while True:
        print("\nChoose an option:")
        print("1. Check prerequisites")
        print("2. Install dependencies")
        print("3. Run environment verification")
        print("4. Run database tests")
        print("5. Start backend server")
        print("6. Start frontend server")
        print("7. Run integration tests")
        print("8. Run all tests (automated)")
        print("9. Exit")
        
        choice = input("\nEnter your choice (1-9): ").strip()
        
        if choice == "1":
            check_prerequisites()
        
        elif choice == "2":
            install_dependencies()
        
        elif choice == "3":
            run_environment_test()
        
        elif choice == "4":
            run_database_tests()
        
        elif choice == "5":
            start_backend_server()
        
        elif choice == "6":
            start_frontend_server()
        
        elif choice == "7":
            run_integration_tests()
        
        elif choice == "8":
            print("\n🔄 Running All Tests (Automated)")
            print("=" * 50)
            
            if not check_prerequisites():
                print("❌ Prerequisites not met")
                continue
            
            if not install_dependencies():
                print("❌ Dependency installation failed")
                continue
            
            if not run_environment_test():
                print("❌ Environment verification failed")
                continue
            
            if not run_database_tests():
                print("❌ Database tests failed")
                continue
            
            print("\n✅ All automated tests passed!")
            print("📝 To complete testing:")
            print("   1. Start backend server (option 5)")
            print("   2. In another terminal, run integration tests (option 7)")
            print("   3. Start frontend server (option 6) to test the UI")
        
        elif choice == "9":
            print("👋 Goodbye!")
            break
        
        else:
            print("❌ Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
