"""
Feedback submission endpoint.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any

from models.schemas import FeedbackRequest, FeedbackResponse
from database.repositories import FeedbackRepository
from services import MLPredictor
from core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/feedback", tags=["feedback"])


def get_feedback_repository() -> FeedbackRepository:
    return FeedbackRepository()


def get_ml_predictor() -> MLPredictor:
    return MLPredictor()


@router.post("/submit", response_model=FeedbackResponse)
async def submit_feedback(
    feedback: FeedbackRequest,
    feedback_repo: FeedbackRepository = Depends(get_feedback_repository),
    ml_predictor: MLPredictor = Depends(get_ml_predictor)
):
    """Submit user feedback for a task."""
    try:
        logger.info(f"Submitting feedback for user {feedback.user_id}, task {feedback.task_id}")
        
        # Save feedback to database
        feedback_data = {
            "user_id": feedback.user_id,
            "task_id": feedback.task_id,
            "feedback_type": feedback.feedback_type,
            "rating": feedback.rating,
            "time_spent_sec": feedback.time_spent_sec,
            "comments": feedback.comments
        }
        
        saved_feedback = await feedback_repo.create_feedback(feedback_data)
        
        # Update ML model with feedback (for future improvements)
        if feedback.rating and feedback.feedback_type:
            # This would typically update the recommendation model
            # For now, just log the feedback
            logger.info(f"Feedback received: rating={feedback.rating}, type={feedback.feedback_type}")
        
        return FeedbackResponse(
            success=True,
            message="Feedback submitted successfully",
            feedback_id=str(saved_feedback.get("feedback_id"))
        )
        
    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        return FeedbackResponse(
            success=False,
            message=f"Failed to submit feedback: {str(e)}"
        )


@router.get("/user/{user_id}", response_model=List[Dict[str, Any]])
async def get_user_feedback(
    user_id: str,
    feedback_repo: FeedbackRepository = Depends(get_feedback_repository)
):
    """Get all feedback submitted by a user."""
    try:
        feedback_list = await feedback_repo.get_user_feedback(user_id)
        return feedback_list
    except Exception as e:
        logger.error(f"Error getting user feedback: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve user feedback")


@router.get("/task/{task_id}/stats", response_model=Dict[str, Any])
async def get_task_feedback_stats(
    task_id: int,
    feedback_repo: FeedbackRepository = Depends(get_feedback_repository)
):
    """Get feedback statistics for a specific task."""
    try:
        stats = await feedback_repo.get_feedback_stats(task_id)
        return stats
    except Exception as e:
        logger.error(f"Error getting task feedback stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve feedback statistics")