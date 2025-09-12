"""
Feedback repository for handling feedback-related database operations.
"""

import logging
from typing import List, Dict, Any
from datetime import datetime

from ..supabase_client import SupabaseClient
from ..models import InteractionType

logger = logging.getLogger(__name__)


class FeedbackRepository:
    """Repository for feedback-related database operations."""
    
    def __init__(self, supabase_client: SupabaseClient = None):
        """Initialize feedback repository."""
        self.supabase = supabase_client or SupabaseClient()
    
    async def create_feedback(self, feedback: Dict[str, Any]) -> int:
        """Create new user task feedback (user_task_feedback table)."""
        try:
            feedback_id = await self.supabase.create_task_feedback(feedback)
            
            logger.info(f"Created feedback with ID: {feedback_id}")
            return feedback_id
            
        except Exception as e:
            logger.error(f"Error creating feedback: {e}")
            raise
    
    async def get_task_feedback(self, task_id: int) -> List[Dict[str, Any]]:
        """Get all feedback for a specific task."""
        try:
            feedback_data_list = await self.supabase.get_task_feedback(task_id)
            logger.info(f"Retrieved {len(feedback_data_list)} feedback entries for task: {task_id}")
            return feedback_data_list
            
        except Exception as e:
            logger.error(f"Error getting feedback by path: {e}")
            raise
    
    async def get_user_feedback(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all feedback for a user."""
        try:
            feedback_data_list = await self.supabase.get_user_feedback(user_id)
            logger.info(f"Retrieved {len(feedback_data_list)} feedback entries for user: {user_id}")
            return feedback_data_list
            
        except Exception as e:
            logger.error(f"Error getting feedback by resource: {e}")
            raise
    
    async def get_interaction_analytics(self) -> Dict[str, Any]:
        """Get analytics on interaction types and ratings."""
        try:
            # This would be implemented with proper SQL aggregation queries
            # For now, return a placeholder structure
            
            analytics = {
                "interaction_counts": {
                    "completed": 0,
                    "skipped": 0,
                    "bookmarked": 0,
                    "started": 0,
                    "liked": 0,
                    "disliked": 0
                },
                "average_ratings": {
                    "overall": 0.0,
                    "by_platform": {},
                    "by_difficulty": {}
                },
                "completion_rate": 0.0,
                "most_popular_resources": [],
                "least_popular_resources": []
            }
            
            logger.info("Retrieved interaction analytics")
            return analytics
            
        except Exception as e:
            logger.error(f"Error getting interaction analytics: {e}")
            raise
