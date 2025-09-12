"""
Feedback endpoint for collecting user feedback on learning resources.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List
import logging
from datetime import datetime

from database.models import (
    FeedbackRequest,
    FeedbackResponse,
)
from database.repositories.feedback_repo import FeedbackRepository
from api.dependencies import get_feedback_repository

# Initialize router
router = APIRouter(prefix="/api/v1/feedback", tags=["feedback"])

# Initialize logger
logger = logging.getLogger(__name__)


@router.post("/submit", response_model=FeedbackResponse)
async def submit_feedback(
    request: FeedbackRequest,
    feedback_repo: FeedbackRepository = Depends(get_feedback_repository),
) -> FeedbackResponse:
    """
    Submit user feedback for a learning resource.
    
    This endpoint allows users to provide feedback on resources within their learning paths,
    which helps improve future recommendations and path generation.
    """
    try:
        logger.info(f"Submitting feedback for task {request.task_id} by user {request.user_id}")
        
        # Save feedback to database (pass dict matching schema)
        feedback_id = await feedback_repo.create_feedback({
            "user_id": request.user_id,
            "task_id": request.task_id,
            "feedback_type": request.feedback_type,
            "rating": request.rating,
            "time_spent_sec": request.time_spent_sec,
            "comments": request.comments,
            "created_at": datetime.utcnow().isoformat()
        })
        
        logger.info(f"Feedback submitted successfully with ID: {feedback_id}")
        
        return FeedbackResponse(
            success=True,
            message="Feedback submitted successfully",
            feedback_id=feedback_id
        )
        
    except Exception as e:
        logger.error(f"Error submitting feedback: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to submit feedback: {str(e)}"
        )


@router.get("/task/{task_id}")
async def get_path_feedback(
    task_id: int,
    feedback_repo: FeedbackRepository = Depends(get_feedback_repository)
):
    """Get all feedback for a specific task."""
    try:
        logger.info(f"Retrieving feedback for task: {task_id}")
        feedback_list = await feedback_repo.get_task_feedback(task_id)
        logger.info(f"Retrieved {len(feedback_list)} feedback entries for task {task_id}")
        return {"items": feedback_list}
        
    except Exception as e:
        logger.error(f"Error retrieving path feedback: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve feedback: {str(e)}"
        )


@router.get("/user/{user_id}")
async def get_resource_feedback(
    user_id: str,
    feedback_repo: FeedbackRepository = Depends(get_feedback_repository)
):
    """Get all feedback provided by a user."""
    try:
        logger.info(f"Retrieving feedback for user: {user_id}")
        feedback_list = await feedback_repo.get_user_feedback(user_id)
        logger.info(f"Retrieved {len(feedback_list)} feedback entries for user {user_id}")
        return {"items": feedback_list}
        
    except Exception as e:
        logger.error(f"Error retrieving resource feedback: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve feedback: {str(e)}"
        )


@router.get("/analytics/interaction-types")
async def get_interaction_analytics(
    feedback_repo: FeedbackRepository = Depends(get_feedback_repository)
):
    """
    Get analytics on different interaction types.
    """
    try:
        logger.info("Retrieving interaction analytics")
        
        analytics = await feedback_repo.get_interaction_analytics()
        
        return {
            "success": True,
            "data": analytics
        }
        
    except Exception as e:
        logger.error(f"Error retrieving analytics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve analytics: {str(e)}"
        )
