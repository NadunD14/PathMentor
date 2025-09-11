"""
Feedback endpoint for collecting user feedback on learning resources.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List
import logging
from datetime import datetime

from ..database.models import (
    FeedbackRequest,
    FeedbackResponse,
    UserFeedback,
    InteractionType
)
from ..database.repositories.feedback_repo import FeedbackRepository
from ..dependencies import get_feedback_repository, get_current_user_id

# Initialize router
router = APIRouter(prefix="/api/v1/feedback", tags=["feedback"])

# Initialize logger
logger = logging.getLogger(__name__)


@router.post("/submit", response_model=FeedbackResponse)
async def submit_feedback(
    request: FeedbackRequest,
    feedback_repo: FeedbackRepository = Depends(get_feedback_repository),
    current_user_id: str = Depends(get_current_user_id)
) -> FeedbackResponse:
    """
    Submit user feedback for a learning resource.
    
    This endpoint allows users to provide feedback on resources within their learning paths,
    which helps improve future recommendations and path generation.
    """
    try:
        logger.info(f"Submitting feedback for resource {request.resource_id} in path {request.path_id}")
        
        # Create feedback object
        feedback = UserFeedback(
            path_id=request.path_id,
            resource_id=request.resource_id,
            interaction_type=request.interaction_type,
            rating=request.rating,
            timestamp=datetime.utcnow()
        )
        
        # Save feedback to database
        feedback_id = await feedback_repo.create_feedback(feedback)
        
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


@router.get("/path/{path_id}", response_model=List[UserFeedback])
async def get_path_feedback(
    path_id: str,
    feedback_repo: FeedbackRepository = Depends(get_feedback_repository),
    current_user_id: str = Depends(get_current_user_id)
) -> List[UserFeedback]:
    """
    Get all feedback for a specific learning path.
    """
    try:
        logger.info(f"Retrieving feedback for path: {path_id}")
        
        feedback_list = await feedback_repo.get_feedback_by_path(path_id)
        
        logger.info(f"Retrieved {len(feedback_list)} feedback entries for path {path_id}")
        
        return feedback_list
        
    except Exception as e:
        logger.error(f"Error retrieving path feedback: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve feedback: {str(e)}"
        )


@router.get("/resource/{resource_id}", response_model=List[UserFeedback])
async def get_resource_feedback(
    resource_id: str,
    feedback_repo: FeedbackRepository = Depends(get_feedback_repository)
) -> List[UserFeedback]:
    """
    Get all feedback for a specific resource across all paths.
    """
    try:
        logger.info(f"Retrieving feedback for resource: {resource_id}")
        
        feedback_list = await feedback_repo.get_feedback_by_resource(resource_id)
        
        logger.info(f"Retrieved {len(feedback_list)} feedback entries for resource {resource_id}")
        
        return feedback_list
        
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
