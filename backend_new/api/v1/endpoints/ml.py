"""
ML analysis endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from datetime import datetime

from models.schemas import MLCompleteSetupRequest, MLCompleteSetupResponse
from database.repositories import UserRepository
from core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/ml", tags=["ml"])


def get_user_repository() -> UserRepository:
    return UserRepository()


@router.post("/complete-setup", response_model=MLCompleteSetupResponse)
async def complete_ml_setup(
    request: MLCompleteSetupRequest,
    user_repo: UserRepository = Depends(get_user_repository)
):
    """
    Complete ML setup and analysis for a user.
    
    This endpoint:
    1. Fetches all user data from database
    2. Performs ML analysis on user preferences and answers
    3. Creates a user profile for path generation
    """

    try:
        logger.info(f"Starting ML setup for user {request.user_id}, category {request.category_id}")
        
        # Fetch user data
        user_data = await _fetch_user_data(request.user_id, request.category_id, user_repo)

        logger.info(f"Fetched user data: {user_data}")
        
        if not user_data:
            return MLCompleteSetupResponse(
                success=False,
                message="User data not found or incomplete"
            )
        
        # Perform ML analysis
        analysis_result = await _perform_ml_analysis(user_data)
        
        # Create user profile
        user_profile = await _create_user_profile(user_data, analysis_result)

        logger.info(f"user_profile: {user_profile}")
        
        return MLCompleteSetupResponse(
            success=True,
            message="ML setup completed successfully",
            analysis=analysis_result,
            user_profile=user_profile
        )
        
    except Exception as e:
        logger.error(f"Error in ML complete setup: {e}")
        return MLCompleteSetupResponse(
            success=False,
            message=f"Failed to complete ML setup: {str(e)}"
        )


async def _fetch_user_data(user_id: str, category_id: int, user_repo: UserRepository) -> Dict[str, Any]:
    """Fetch all necessary user data from database."""
    try:
        # Use the repository method to fetch complete user data
        user_data = await user_repo.get_user_complete_data(user_id, category_id)
        return user_data
    except Exception as e:
        logger.error(f"Error fetching user data: {e}")
        return None


async def _perform_ml_analysis(user_data: Dict[str, Any]) -> Dict[str, Any]:
    """Perform ML analysis on user data."""
    try:
        # Placeholder for ML analysis logic
        # This would analyze user answers, learning styles, etc.
        return {
            "recommended_learning_style": "visual",
            "experience_level": "beginner",
            "preferred_platforms": ["youtube", "udemy"],
            "confidence_scores": {
                "learning_style": 0.85,
                "experience_level": 0.78,
                "platform_preferences": 0.92
            }
        }
    except Exception as e:
        logger.error(f"Error in ML analysis: {e}")
        raise


async def _create_user_profile(user_data: Dict[str, Any], analysis: Dict[str, Any]) -> Dict[str, Any]:
    """Create user profile based on data and analysis."""
    try:
        return {
            "id": user_data["user_id"],
            "goal": f"Learn {user_data.get('category_info', {}).get('name', 'new skills')}",
            "experience_level": analysis.get("experience_level", "beginner"),
            "learning_style": analysis.get("recommended_learning_style", "visual"),
            "created_at": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Error creating user profile: {e}")
        raise