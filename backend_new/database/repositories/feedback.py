"""
Feedback repository for database operations.
"""

from typing import List, Dict, Any
from datetime import datetime

from .base import BaseRepository
from core.logging import get_logger

logger = get_logger(__name__)


class FeedbackRepository(BaseRepository):
    """Repository for feedback operations."""
    
    def __init__(self):
        """Initialize feedback repository."""
        super().__init__("user_task_feedback")
    
    async def create_feedback(self, feedback_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new feedback."""
        feedback_data["created_at"] = datetime.now().isoformat()
        return await self.create(feedback_data)
    
    async def get_user_feedback(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all feedback for a user."""
        return await self.get_all({"user_id": user_id})
    
    async def get_task_feedback(self, task_id: int) -> List[Dict[str, Any]]:
        """Get all feedback for a task."""
        return await self.get_all({"task_id": task_id})
    
    async def get_feedback_stats(self, task_id: int) -> Dict[str, Any]:
        """Get feedback statistics for a task."""
        try:
            feedbacks = await self.get_task_feedback(task_id)
            
            if not feedbacks:
                return {
                    "total_feedback": 0,
                    "average_rating": 0,
                    "average_time_spent": 0
                }
            
            ratings = [f["rating"] for f in feedbacks if f.get("rating")]
            times = [f["time_spent_sec"] for f in feedbacks if f.get("time_spent_sec")]
            
            stats = {
                "total_feedback": len(feedbacks),
                "average_rating": sum(ratings) / len(ratings) if ratings else 0,
                "average_time_spent": sum(times) / len(times) if times else 0
            }
            
            return stats
        except Exception as e:
            logger.error(f"Error getting feedback stats: {e}")
            raise


class PathRepository(BaseRepository):
    """Repository for learning path operations."""
    
    def __init__(self):
        """Initialize path repository."""
        super().__init__("paths")
    
    async def create_path(self, path_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new learning path."""
        path_data["created_at"] = datetime.now().isoformat()
        path_data["updated_at"] = datetime.now().isoformat()
        return await self.create(path_data)
    
    async def get_path(self, path_id: int) -> Dict[str, Any]:
        """Get path by ID."""
        return await self.get_by_id("path_id", path_id)
    
    async def get_user_paths(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all paths for a user."""
        return await self.get_all({"user_id": user_id})
    
    async def update_path_status(self, path_id: int, status: str) -> Dict[str, Any]:
        """Update path status."""
        update_data = {
            "status": status,
            "updated_at": datetime.now().isoformat()
        }
        return await self.update("path_id", path_id, update_data)


class TaskRepository(BaseRepository):
    """Repository for task operations."""
    
    def __init__(self):
        """Initialize task repository."""
        super().__init__("tasks")
    
    async def create_task(self, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create new task."""
        task_data["created_at"] = datetime.now().isoformat()
        return await self.create(task_data)
    
    async def get_path_tasks(self, path_id: int) -> List[Dict[str, Any]]:
        """Get all tasks for a path."""
        try:
            result = self.db.client.table(self.table_name).select("*").eq("path_id", path_id).order("task_order").execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting path tasks: {e}")
            raise
    
    async def update_task_status(self, task_id: int, status: str) -> Dict[str, Any]:
        """Update task status."""
        return await self.update("task_id", task_id, {"status": status})