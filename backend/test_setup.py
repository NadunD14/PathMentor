#!/usr/bin/env python3
"""
Quick setup test script for PathMentor backend with Supabase
"""

import asyncio
import sys
import os
from pathlib import Path

# Add the app directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

async def test_supabase_connection():
    """Test Supabase connection and basic functionality"""
    try:
        from app.services.supabase_service import supabase_client
        
        print("🔍 Testing Supabase connection...")
        
        # Test basic connection
        is_connected = await supabase_client.test_connection()
        if is_connected:
            print("✅ Supabase connection successful!")
        else:
            print("❌ Supabase connection failed!")
            return False
        
        # Test fetching categories
        print("🔍 Testing categories fetch...")
        categories = await supabase_client.fetch_categories()
        print(f"📊 Found {len(categories)} categories")
        
        if categories:
            print("Categories:")
            for cat in categories[:3]:  # Show first 3
                print(f"  - {cat.get('name', 'Unknown')} (ID: {cat.get('category_id')})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing Supabase: {e}")
        return False

async def test_ml_service():
    """Test ML service functionality"""
    try:
        from app.services.ml_service import MLService
        
        print("\n🧠 Testing ML service...")
        ml_service = MLService()
        
        # Test embeddings
        test_text = "This is a test for embeddings generation"
        embeddings = ml_service.generate_embeddings(test_text)
        
        print(f"✅ Embeddings generated: {len(embeddings)} dimensions")
        
        # Test analysis with dummy data
        print("🔍 Testing progress analysis...")
        dummy_answers = [
            {"answer_text": "I prefer hands-on learning", "question_id": 1},
            {"option_id": 2, "question_id": 2}
        ]
        
        analysis = await ml_service._analyze_user_answers(1, dummy_answers)
        print(f"✅ Analysis completed. Overall score: {analysis.overall_score:.2f}")
        print(f"   Strengths: {', '.join(analysis.strengths[:2])}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing ML service: {e}")
        return False

def check_environment():
    """Check if required environment variables are set"""
    print("🔍 Checking environment configuration...")
    
    required_vars = [
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        print("💡 Please copy .env.example to .env and fill in your Supabase credentials")
        return False
    
    print("✅ Environment configuration looks good!")
    return True

async def main():
    """Main test function"""
    print("🚀 PathMentor Backend Setup Test")
    print("=" * 40)
    
    # Check environment
    if not check_environment():
        return False
    
    # Test Supabase
    supabase_ok = await test_supabase_connection()
    
    # Test ML service
    ml_ok = await test_ml_service()
    
    print("\n" + "=" * 40)
    if supabase_ok and ml_ok:
        print("🎉 All tests passed! Backend is ready to go.")
        print("\n💡 Next steps:")
        print("   1. Start the backend: uvicorn app.main:app --reload")
        print("   2. Test the health endpoint: http://localhost:8000/api/v1/health")
        print("   3. Start your frontend and complete a questionnaire!")
        return True
    else:
        print("❌ Some tests failed. Please check the errors above.")
        return False

if __name__ == "__main__":
    try:
        # Load environment variables
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        print("💡 Consider installing python-dotenv: pip install python-dotenv")
    
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
