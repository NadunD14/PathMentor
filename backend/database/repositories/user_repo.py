"""
User repository for handling user-related database operations.
"""

import logging
from typing import Optional, Dict, Any
from datetime import datetime

from ..supabase_client import SupabaseClient
from ..models import UserProfile, GeneratedPath

logger = logging.getLogger(__name__)


class UserRepository:
    """Repository for user-related database operations."""
    
    def __init__(self, supabase_client: Optional[SupabaseClient] = None):
        """Initialize user repository."""
        self.supabase = supabase_client or SupabaseClient()
    
    async def create_user(self, user_profile: UserProfile) -> UserProfile:
        """Create a new user profile."""
        try:
            user_data = {
                "goal": user_profile.goal,
                "experience_level": user_profile.experience_level.value,
                "learning_style": user_profile.learning_style.value,
                "created_at": datetime.utcnow().isoformat()
            }
            
            user_id = await self.supabase.create_user_profile(user_data)
            user_profile.id = user_id
            user_profile.created_at = datetime.utcnow()
            
            logger.info(f"Created user profile with ID: {user_id}")
            return user_profile
            
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise
    
    async def get_user(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile by ID."""
        try:
            user_data = await self.supabase.get_user_profile(user_id)
            
            if not user_data:
                return None
            
            return UserProfile(
                id=user_data["id"],
                goal=user_data["goal"],
                experience_level=user_data["experience_level"],
                learning_style=user_data["learning_style"],
                created_at=datetime.fromisoformat(user_data["created_at"])
            )
            
        except Exception as e:
            logger.error(f"Error getting user: {e}")
            raise
    
    async def update_user(self, user_profile: UserProfile) -> UserProfile:
        """Update existing user profile."""
        try:
            user_data = {
                "goal": user_profile.goal,
                "experience_level": user_profile.experience_level.value,
                "learning_style": user_profile.learning_style.value
            }
            
            updated_data = await self.supabase.update_user_profile(user_profile.id, user_data)
            
            return UserProfile(
                id=updated_data["id"],
                goal=updated_data["goal"],
                experience_level=updated_data["experience_level"],
                learning_style=updated_data["learning_style"],
                created_at=datetime.fromisoformat(updated_data["created_at"])
            )
            
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            raise
    
    async def save_learning_path(self, user_id: str, path_data: Dict[str, Any]) -> str:
        """Save a generated learning path for a user."""
        try:
            path_record = {
                "user_id": user_id,
                "path_data": path_data,
                "created_at": datetime.utcnow().isoformat()
            }
            
            path_id = await self.supabase.create_generated_path(path_record)
            
            logger.info(f"Saved learning path with ID: {path_id} for user: {user_id}")
            return path_id
            
        except Exception as e:
            logger.error(f"Error saving learning path: {e}")
            raise
    
    async def get_learning_path(self, path_id: str) -> Optional[GeneratedPath]:
        """Get a generated learning path by ID."""
        try:
            path_data = await self.supabase.get_generated_path(path_id)
            
            if not path_data:
                return None
            
            return GeneratedPath(
                id=path_data["id"],
                user_id=path_data["user_id"],
                path_data=path_data["path_data"],
                created_at=datetime.fromisoformat(path_data["created_at"])
            )
            
        except Exception as e:
            logger.error(f"Error getting learning path: {e}")
            raise
