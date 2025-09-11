"""
Quick environment setup verification script.
Run this first to ensure your environment is properly configured.
"""

import os
import sys
import importlib
from pathlib import Path

def check_python_version():
    """Check Python version."""
    version = sys.version_info
    print(f"🐍 Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major == 3 and version.minor >= 11:
        print("✅ Python version is compatible")
        return True
    else:
        print("❌ Python 3.11 or higher required")
        return False

def check_required_packages():
    """Check if required packages are installed."""
    required_packages = [
        "fastapi",
        "uvicorn", 
        "supabase",
        "openai",
        "pydantic",
        "python-dotenv"
    ]
    
    print("\n📦 Checking required packages...")
    missing_packages = []
    
    for package in required_packages:
        try:
            importlib.import_module(package.replace("-", "_"))
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} - Missing")
            missing_packages.append(package)
    
    return missing_packages

def check_environment_variables():
    """Check if environment variables are set."""
    required_vars = [
        "SUPABASE_URL",
        "SUPABASE_ANON_KEY",
        "OPENAI_API_KEY"
    ]
    
    print("\n🔧 Checking environment variables...")
    missing_vars = []
    
    for var in required_vars:
        value = os.getenv(var)
        if value:
            # Show first 10 chars for security
            masked_value = value[:10] + "..." if len(value) > 10 else value
            print(f"✅ {var}: {masked_value}")
        else:
            print(f"❌ {var}: Not set")
            missing_vars.append(var)
    
    return missing_vars

def check_project_structure():
    """Check if project structure is correct."""
    print("\n📁 Checking project structure...")
    
    required_paths = [
        "backend/main.py",
        "backend/database/supabase_client.py",
        "backend/api/endpoints/generate_path.py",
        "backend/llm_service/client.py",
        "frontend/package.json",
        "frontend/src/supabase-client.ts"
    ]
    
    missing_paths = []
    
    for path in required_paths:
        if Path(path).exists():
            print(f"✅ {path}")
        else:
            print(f"❌ {path} - Missing")
            missing_paths.append(path)
    
    return missing_paths

def main():
    """Run all environment checks."""
    print("🔍 PathMentor Environment Setup Verification")
    print("=" * 50)
    
    all_good = True
    
    # Check Python version
    if not check_python_version():
        all_good = False
    
    # Check packages
    missing_packages = check_required_packages()
    if missing_packages:
        all_good = False
        print(f"\n📥 Install missing packages with:")
        print(f"pip install {' '.join(missing_packages)}")
    
    # Check environment variables
    missing_vars = check_environment_variables()
    if missing_vars:
        all_good = False
        print(f"\n🔧 Set missing environment variables in .env file:")
        for var in missing_vars:
            print(f"   {var}=your_{var.lower()}_here")
    
    # Check project structure
    missing_paths = check_project_structure()
    if missing_paths:
        all_good = False
        print(f"\n📁 Missing project files - ensure you're in the correct directory")
    
    print("\n" + "=" * 50)
    if all_good:
        print("🎉 Environment setup is complete!")
        print("You can now run the database and integration tests.")
    else:
        print("⚠️ Environment setup needs attention.")
        print("Please resolve the issues above before running tests.")
    
    return all_good

if __name__ == "__main__":
    main()
