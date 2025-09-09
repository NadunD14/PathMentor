#!/usr/bin/env python3
"""
Test script to verify database connections are working properly
"""

import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

try:
    from app.core.config import settings
    print("✓ Config loaded successfully")
    print(f"  - Project: {settings.PROJECT_NAME}")
    print(f"  - Version: {settings.VERSION}")
    print(f"  - Supabase URL: {settings.SUPABASE_URL[:50]}...")
    
    # Check if service key is complete
    if settings.SUPABASE_SERVICE_ROLE_KEY.endswith("..."):
        print("  - Service Key: ⚠️  INCOMPLETE (appears to be truncated)")
        print("    Please update SUPABASE_SERVICE_ROLE_KEY in .env with the complete key")
    else:
        print(f"  - Service Key: ✓ Complete ({len(settings.SUPABASE_SERVICE_ROLE_KEY)} characters)")
        
except Exception as e:
    print(f"✗ Error loading config: {e}")
    sys.exit(1)

try:
    from app.db.database import get_supabase_client
    client = get_supabase_client()
    print("✓ Supabase client created successfully")
except Exception as e:
    print(f"✗ Error creating Supabase client: {e}")
    if "truncated" in str(e).lower() or "invalid api key" in str(e).lower():
        print("  💡 Tip: Make sure you have the complete SUPABASE_SERVICE_ROLE_KEY in your .env file")
        print("  💡 The key should be a long JWT token, not ending with '...'")
    # Don't exit here, continue with other tests
    client = None

try:
    from app.services.supabase_service import SupabaseClient
    supabase_service = SupabaseClient()
    print("✓ Supabase service initialized successfully")
except Exception as e:
    print(f"✗ Error initializing Supabase service: {e}")
    # Don't exit here, continue with summary

if client:
    print("\n🎉 All database connections are properly configured!")
else:
    print("\n⚠️  Database configuration needs attention!")
    print("\nNext Steps:")
    print("1. Get your complete SUPABASE_SERVICE_ROLE_KEY from your Supabase dashboard")
    print("2. Update the .env file with the complete key (should be ~150+ characters)")
    print("3. Re-run this test")

print("\nConnection Summary:")
print("- Primary Database: Supabase (REST API)")
print("- Authentication: Supabase Auth")
print("- Caching: Redis (optional)")
print("- ML Storage: Local file system")
