"""
User repository for database operations.
"""

from typing import List, Optional, Dict, Any

from .base import BaseRepository
from models.database import User
from core.logging import get_logger

logger = get_logger(__name__)


class UserRepository(BaseRepository):
    """Repository for user operations."""
    
    def __init__(self):
        """Initialize user repository."""
        super().__init__("users")
    
    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID."""
        return await self.get_by_id("user_id", user_id)
    
    async def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user."""
        return await self.create(user_data)
    
    async def update_user(self, user_id: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user."""
        return await self.update("user_id", user_id, user_data)
    
    async def get_user_learning_styles(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's learning styles."""
        try:
            result = self.db.client.table("user_learning_styles").select("*").eq("user_id", user_id).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting user learning styles: {e}")
            raise
    
    async def save_user_learning_style(self, style_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save user learning style."""
        try:
            result = self.db.client.table("user_learning_styles").insert(style_data).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Error saving user learning style: {e}")
            raise
    
    async def get_user_answers(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's assessment answers."""
        try:
            result = self.db.client.table("user_answers").select("*").eq("user_id", user_id).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting user answers: {e}")
            raise
    
    async def save_user_answer(self, answer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save user assessment answer."""
        try:
            result = self.db.client.table("user_answers").insert(answer_data).execute()
            return result.data[0] if result.data else {}
        except Exception as e:
            logger.error(f"Error saving user answer: {e}")
            raise