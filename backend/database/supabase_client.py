"""
Supabase client for PathMentor backend.
"""

import os
import logging
from typing import Optional, Dict, Any, List
from supabase import create_client, Client
from datetime import datetime

logger = logging.getLogger(__name__)


class SupabaseClient:
    """
    Client for interacting with Supabase database.
    """
    
    def __init__(self):
        """Initialize Supabase client."""
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_ANON_KEY")
        
        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY must be set")
        
        self.client: Client = create_client(self.url, self.key)
        logger.info("Supabase client initialized")
    
    async def health_check(self) -> bool:
        """Check if the database connection is healthy."""
        try:
            # Simple query to test connection
            result = self.client.table("user_profiles").select("id").limit(1).execute()
            return True
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False
    
    async def create_user_profile(self, user_data: Dict[str, Any]) -> str:
        """Create a new user profile."""
        try:
            result = self.client.table("user_profiles").insert(user_data).execute()
            return result.data[0]["id"]
        except Exception as e:
            logger.error(f"Error creating user profile: {e}")
            raise
    
    async def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile by ID."""
        try:
            result = self.client.table("user_profiles").select("*").eq("id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting user profile: {e}")
            raise
    
    async def update_user_profile(self, user_id: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user profile."""
        try:
            result = self.client.table("user_profiles").update(user_data).eq("id", user_id).execute()
            return result.data[0]
        except Exception as e:
            logger.error(f"Error updating user profile: {e}")
            raise
    
    async def create_generated_path(self, path_data: Dict[str, Any]) -> str:
        """Create a new generated learning path."""
        try:
            result = self.client.table("generated_paths").insert(path_data).execute()
            return result.data[0]["id"]
        except Exception as e:
            logger.error(f"Error creating generated path: {e}")
            raise
    
    async def get_generated_path(self, path_id: str) -> Optional[Dict[str, Any]]:
        """Get generated path by ID."""
        try:
            result = self.client.table("generated_paths").select("*").eq("id", path_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting generated path: {e}")
            raise
    
    async def create_feedback(self, feedback_data: Dict[str, Any]) -> str:
        """Create user feedback."""
        try:
            result = self.client.table("user_feedback").insert(feedback_data).execute()
            return result.data[0]["id"]
        except Exception as e:
            logger.error(f"Error creating feedback: {e}")
            raise
    
    async def get_feedback_by_path(self, path_id: str) -> List[Dict[str, Any]]:
        """Get all feedback for a specific path."""
        try:
            result = self.client.table("user_feedback").select("*").eq("path_id", path_id).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error getting feedback by path: {e}")
            raise
    
    async def get_feedback_by_resource(self, resource_id: str) -> List[Dict[str, Any]]:
        """Get all feedback for a specific resource."""
        try:
            result = self.client.table("user_feedback").select("*").eq("resource_id", resource_id).execute()
            return result.data
        except Exception as e:
            logger.error(f"Error getting feedback by resource: {e}")
            raise
