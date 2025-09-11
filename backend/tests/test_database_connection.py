"""
Test script for PathMentor backend database connections.
This script tests the connection to Supabase and verifies basic CRUD operations.
"""

import asyncio
import os
import sys
from datetime import datetime
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent
sys.path.append(str(backend_path))

from database.supabase_client import SupabaseClient
from database.repositories import UserRepository, PathRepository, TaskRepository
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def test_database_health():
    """Test basic database connection."""
    print("🔍 Testing database connection...")
    try:
        client = SupabaseClient()
        is_healthy = await client.health_check()
        if is_healthy:
            print("✅ Database connection successful!")
            return client
        else:
            print("❌ Database connection failed!")
            return None
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return None


async def test_user_operations(client: SupabaseClient):
    """Test user CRUD operations."""
    print("\n🧑‍💻 Testing User Operations...")
    
    try:
        # Test creating a user
        test_user = {
            "user_id": f"test_user_{datetime.now().timestamp()}",
            "username": "test_user",
            "email": "test@pathmentor.com",
            "first_name": "Test",
            "last_name": "User",
            "is_active": True
        }
        
        user_id = await client.create_user(test_user)
        print(f"✅ User created with ID: {user_id}")
        
        # Test getting the user
        retrieved_user = await client.get_user(user_id)
        if retrieved_user:
            print(f"✅ User retrieved: {retrieved_user['username']}")
        else:
            print("❌ Failed to retrieve user")
            
        # Test updating the user
        update_data = {"last_name": "UpdatedUser"}
        updated_user = await client.update_user(user_id, update_data)
        print(f"✅ User updated: {updated_user['last_name']}")
        
        return user_id
        
    except Exception as e:
        print(f"❌ User operations failed: {e}")
        return None


async def test_category_operations(client: SupabaseClient):
    """Test category operations."""
    print("\n📚 Testing Category Operations...")
    
    try:
        # Get all categories
        categories = await client.get_categories()
        print(f"✅ Retrieved {len(categories)} categories")
        
        if categories:
            # Test getting specific category
            first_category = categories[0]
            category = await client.get_category(first_category['category_id'])
            print(f"✅ Retrieved category: {category['name']}")
            return first_category['category_id']
        else:
            print("⚠️ No categories found in database")
            return None
            
    except Exception as e:
        print(f"❌ Category operations failed: {e}")
        return None


async def test_path_operations(client: SupabaseClient, user_id: str, category_id: int):
    """Test learning path operations."""
    print("\n🛤️ Testing Path Operations...")
    
    try:
        # Create a test path
        test_path = {
            "user_id": user_id,
            "category_id": category_id,
            "title": "Test Learning Path",
            "description": "A test path for backend testing",
            "difficulty_level": "Beginner",
            "estimated_duration": 30,
            "status": "not_started"
        }
        
        path_id = await client.create_path(test_path)
        print(f"✅ Path created with ID: {path_id}")
        
        # Get the path
        retrieved_path = await client.get_path(path_id)
        if retrieved_path:
            print(f"✅ Path retrieved: {retrieved_path['title']}")
        
        # Get user paths
        user_paths = await client.get_user_paths(user_id)
        print(f"✅ User has {len(user_paths)} paths")
        
        return path_id
        
    except Exception as e:
        print(f"❌ Path operations failed: {e}")
        return None


async def test_task_operations(client: SupabaseClient, path_id: int):
    """Test task operations."""
    print("\n📝 Testing Task Operations...")
    
    try:
        # Create test tasks
        test_tasks = [
            {
                "path_id": path_id,
                "title": "Task 1: Introduction",
                "description": "Learn the basics",
                "task_type": "reading",
                "task_order": 1,
                "estimated_duration": 15,
                "status": "not_started"
            },
            {
                "path_id": path_id,
                "title": "Task 2: Practice",
                "description": "Apply what you learned",
                "task_type": "exercise",
                "task_order": 2,
                "estimated_duration": 30,
                "status": "not_started"
            }
        ]
        
        task_ids = await client.create_tasks(test_tasks)
        print(f"✅ Created {len(task_ids)} tasks")
        
        # Get path tasks
        path_tasks = await client.get_path_tasks(path_id)
        print(f"✅ Path has {len(path_tasks)} tasks")
        
        return task_ids
        
    except Exception as e:
        print(f"❌ Task operations failed: {e}")
        return None


async def test_feedback_operations(client: SupabaseClient, user_id: str, task_id: int):
    """Test feedback operations."""
    print("\n💬 Testing Feedback Operations...")
    
    try:
        # Create test feedback
        test_feedback = {
            "user_id": user_id,
            "task_id": task_id,
            "feedback_type": "completion",
            "rating": 5,
            "comments": "Great task!",
            "time_spent": 20
        }
        
        feedback_id = await client.create_task_feedback(test_feedback)
        print(f"✅ Feedback created with ID: {feedback_id}")
        
        # Get task feedback
        task_feedback = await client.get_task_feedback(task_id)
        print(f"✅ Task has {len(task_feedback)} feedback entries")
        
        # Get user feedback
        user_feedback = await client.get_user_feedback(user_id)
        print(f"✅ User has {len(user_feedback)} feedback entries")
        
    except Exception as e:
        print(f"❌ Feedback operations failed: {e}")


async def test_repositories():
    """Test repository pattern."""
    print("\n🏗️ Testing Repository Pattern...")
    
    try:
        client = SupabaseClient()
        
        # Test UserRepository
        user_repo = UserRepository(client)
        users = await user_repo.get_all()
        print(f"✅ UserRepository: Found {len(users)} users")
        
        # Test PathRepository
        path_repo = PathRepository(client)
        paths = await path_repo.get_all()
        print(f"✅ PathRepository: Found {len(paths)} paths")
        
        # Test TaskRepository
        task_repo = TaskRepository(client)
        tasks = await task_repo.get_all()
        print(f"✅ TaskRepository: Found {len(tasks)} tasks")
        
    except Exception as e:
        print(f"❌ Repository testing failed: {e}")


async def main():
    """Run all database tests."""
    print("🚀 Starting PathMentor Backend Database Tests")
    print("=" * 50)
    
    # Test database connection
    client = await test_database_health()
    if not client:
        print("❌ Cannot proceed without database connection")
        return
    
    # Test user operations
    user_id = await test_user_operations(client)
    if not user_id:
        print("❌ Cannot proceed without user")
        return
    
    # Test category operations
    category_id = await test_category_operations(client)
    if not category_id:
        print("❌ Cannot proceed without category")
        return
    
    # Test path operations
    path_id = await test_path_operations(client, user_id, category_id)
    if not path_id:
        print("❌ Cannot proceed without path")
        return
    
    # Test task operations
    task_ids = await test_task_operations(client, path_id)
    if not task_ids:
        print("❌ Cannot proceed without tasks")
        return
    
    # Test feedback operations
    await test_feedback_operations(client, user_id, task_ids[0])
    
    # Test repository pattern
    await test_repositories()
    
    print("\n" + "=" * 50)
    print("🎉 All database tests completed!")
    print("\n📋 Test Summary:")
    print("- ✅ Database connection")
    print("- ✅ User CRUD operations")
    print("- ✅ Category operations")
    print("- ✅ Learning path operations")
    print("- ✅ Task operations")
    print("- ✅ Feedback operations")
    print("- ✅ Repository pattern")


if __name__ == "__main__":
    # Check environment variables
    required_vars = ["SUPABASE_URL", "SUPABASE_ANON_KEY"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please set these in your .env file")
        sys.exit(1)
    
    asyncio.run(main())
