"""
Supabase client for PathMentor backend.
Updated to work with the existing Supabase schema.
"""

import os
import logging
from typing import Optional, Dict, Any, List
from supabase import create_client, Client
from datetime import datetime

logger = logging.getLogger(__name__)


class SupabaseClient:
    """
    Client for interacting with Supabase database using the existing schema.
    """
    
    def __init__(self):
        """Initialize Supabase client."""
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")
        
        if not self.url or not self.key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) must be set")
        
        self.client: Client = create_client(self.url, self.key)
        logger.info("Supabase client initialized")
    
    async def health_check(self) -> bool:
        """Check if the database connection is healthy."""
        try:
            # Simple query to test connection
            result = self.client.table("users").select("user_id").limit(1).execute()
            return True
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False
    
    # User operations
    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID."""
        try:
            result = self.client.table("users").select("*").eq("user_id", user_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting user: {e}")
            raise
    
    async def create_user(self, user_data: Dict[str, Any]) -> str:
        """Create a new user."""
        try:
            result = self.client.table("users").insert(user_data).execute()
            return result.data[0]["user_id"]
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            raise
    
    async def update_user(self, user_id: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user."""
        try:
            result = self.client.table("users").update(user_data).eq("user_id", user_id).execute()
            return result.data[0]
        except Exception as e:
            logger.error(f"Error updating user: {e}")
            raise
    
    # Learning path operations
    async def create_path(self, path_data: Dict[str, Any]) -> int:
        """Create a new learning path."""
        try:
            result = self.client.table("paths").insert(path_data).execute()
            return result.data[0]["path_id"]
        except Exception as e:
            logger.error(f"Error creating path: {e}")
            raise
    
    async def get_path(self, path_id: int) -> Optional[Dict[str, Any]]:
        """Get path by ID."""
        try:
            result = self.client.table("paths").select("*").eq("path_id", path_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting path: {e}")
            raise
    
    async def get_user_paths(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all paths for a user."""
        try:
            result = self.client.table("paths").select("*").eq("user_id", user_id).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting user paths: {e}")
            raise
    
    async def update_path(self, path_id: int, path_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a learning path."""
        try:
            path_data["updated_at"] = datetime.utcnow().isoformat()
            result = self.client.table("paths").update(path_data).eq("path_id", path_id).execute()
            return result.data[0]
        except Exception as e:
            logger.error(f"Error updating path: {e}")
            raise
    
    # Task operations
    async def create_task(self, task_data: Dict[str, Any]) -> int:
        """Create a new task."""
        try:
            result = self.client.table("tasks").insert(task_data).execute()
            return result.data[0]["task_id"]
        except Exception as e:
            logger.error(f"Error creating task: {e}")
            raise
    
    async def create_tasks(self, tasks_data: List[Dict[str, Any]]) -> List[int]:
        """Create multiple tasks."""
        try:
            result = self.client.table("tasks").insert(tasks_data).execute()
            return [task["task_id"] for task in result.data]
        except Exception as e:
            logger.error(f"Error creating tasks: {e}")
            raise
    
    async def get_path_tasks(self, path_id: int) -> List[Dict[str, Any]]:
        """Get all tasks for a path."""
        try:
            result = self.client.table("tasks").select("*").eq("path_id", path_id).order("task_order").execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting path tasks: {e}")
            raise
    
    async def update_task(self, task_id: int, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update a task."""
        try:
            result = self.client.table("tasks").update(task_data).eq("task_id", task_id).execute()
            return result.data[0]
        except Exception as e:
            logger.error(f"Error updating task: {e}")
            raise
    
    # Feedback operations
    async def create_task_feedback(self, feedback_data: Dict[str, Any]) -> int:
        """Create task feedback."""
        try:
            result = self.client.table("user_task_feedback").insert(feedback_data).execute()
            return result.data[0]["feedback_id"]
        except Exception as e:
            logger.error(f"Error creating task feedback: {e}")
            raise
    
    async def get_task_feedback(self, task_id: int) -> List[Dict[str, Any]]:
        """Get all feedback for a task."""
        try:
            result = self.client.table("user_task_feedback").select("*").eq("task_id", task_id).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting task feedback: {e}")
            raise
    
    async def get_user_feedback(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all feedback by user."""
        try:
            result = self.client.table("user_task_feedback").select("*").eq("user_id", user_id).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting user feedback: {e}")
            raise
    
    # Category operations
    async def get_categories(self) -> List[Dict[str, Any]]:
        """Get all categories."""
        try:
            result = self.client.table("categories").select("*").order("name").execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting categories: {e}")
            raise
    
    async def get_category(self, category_id: int) -> Optional[Dict[str, Any]]:
        """Get category by ID."""
        try:
            result = self.client.table("categories").select("*").eq("category_id", category_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting category: {e}")
            raise
    
    # Question and answer operations
    async def get_user_answers(self, user_id: str, category_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get user answers, optionally filtered by category."""
        try:
            query = self.client.table("user_answers").select("*").eq("user_id", user_id)
            if category_id:
                query = query.eq("category_id", category_id)
            result = query.execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting user answers: {e}")
            raise
    
    async def get_user_learning_styles(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user learning styles."""
        try:
            result = self.client.table("user_learning_styles").select("*").eq("user_id", user_id).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting user learning styles: {e}")
            raise
    
    # AI logging
    async def log_ai_interaction(self, log_data: Dict[str, Any]) -> int:
        """Log AI model interaction."""
        try:
            result = self.client.table("ai_model_logs").insert(log_data).execute()
            return result.data[0]["log_id"]
        except Exception as e:
            logger.error(f"Error logging AI interaction: {e}")
            raise
