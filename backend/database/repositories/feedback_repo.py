"""
Feedback repository for handling feedback-related database operations.
"""

import logging
from typing import List, Dict, Any
from datetime import datetime

from ..supabase_client import SupabaseClient
from ..models import UserFeedback, InteractionType

logger = logging.getLogger(__name__)


class FeedbackRepository:
    """Repository for feedback-related database operations."""
    
    def __init__(self, supabase_client: SupabaseClient = None):
        """Initialize feedback repository."""
        self.supabase = supabase_client or SupabaseClient()
    
    async def create_feedback(self, feedback: UserFeedback) -> str:
        """Create new user feedback."""
        try:
            feedback_data = {
                "path_id": feedback.path_id,
                "resource_id": feedback.resource_id,
                "interaction_type": feedback.interaction_type.value,
                "rating": feedback.rating,
                "timestamp": feedback.timestamp.isoformat() if feedback.timestamp else datetime.utcnow().isoformat()
            }
            
            feedback_id = await self.supabase.create_feedback(feedback_data)
            
            logger.info(f"Created feedback with ID: {feedback_id}")
            return feedback_id
            
        except Exception as e:
            logger.error(f"Error creating feedback: {e}")
            raise
    
    async def get_feedback_by_path(self, path_id: str) -> List[UserFeedback]:
        """Get all feedback for a specific learning path."""
        try:
            feedback_data_list = await self.supabase.get_feedback_by_path(path_id)
            
            feedback_list = []
            for feedback_data in feedback_data_list:
                feedback = UserFeedback(
                    id=feedback_data["id"],
                    path_id=feedback_data["path_id"],
                    resource_id=feedback_data["resource_id"],
                    interaction_type=InteractionType(feedback_data["interaction_type"]),
                    rating=feedback_data.get("rating"),
                    timestamp=datetime.fromisoformat(feedback_data["timestamp"])
                )
                feedback_list.append(feedback)
            
            logger.info(f"Retrieved {len(feedback_list)} feedback entries for path: {path_id}")
            return feedback_list
            
        except Exception as e:
            logger.error(f"Error getting feedback by path: {e}")
            raise
    
    async def get_feedback_by_resource(self, resource_id: str) -> List[UserFeedback]:
        """Get all feedback for a specific resource."""
        try:
            feedback_data_list = await self.supabase.get_feedback_by_resource(resource_id)
            
            feedback_list = []
            for feedback_data in feedback_data_list:
                feedback = UserFeedback(
                    id=feedback_data["id"],
                    path_id=feedback_data["path_id"],
                    resource_id=feedback_data["resource_id"],
                    interaction_type=InteractionType(feedback_data["interaction_type"]),
                    rating=feedback_data.get("rating"),
                    timestamp=datetime.fromisoformat(feedback_data["timestamp"])
                )
                feedback_list.append(feedback)
            
            logger.info(f"Retrieved {len(feedback_list)} feedback entries for resource: {resource_id}")
            return feedback_list
            
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
