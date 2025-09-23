"""
ML analysis endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional, List
from datetime import datetime

from models.schemas import MLCompleteSetupRequest, MLCompleteSetupResponse, GeneratePathFromUserRequest, UserProfile, ExperienceLevel, LearningStyle
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
        
        # Fetch user data (optionally filtered by assessment/session or explicit answers)
        user_data = await _fetch_user_data(
            request.user_id,
            request.category_id,
            user_repo,
            assessment_id=request.assessment_id,
            general_answer_ids=request.general_answer_ids,
            category_answer_ids=request.category_answer_ids,
        )

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
        
        # After ML analysis, automatically generate learning path
        path_result = await _generate_learning_path_for_user(request.user_id, request.category_id, user_profile)
        
        return MLCompleteSetupResponse(
            success=True,
            message="ML setup completed successfully and learning path generated",
            analysis=analysis_result,
            user_profile=user_profile
        )
        
    except Exception as e:
        logger.error(f"Error in ML complete setup: {e}")
        return MLCompleteSetupResponse(
            success=False,
            message=f"Failed to complete ML setup: {str(e)}"
        )


async def _fetch_user_data(
    user_id: str,
    category_id: int,
    user_repo: UserRepository,
    assessment_id: Optional[str] = None,
    general_answer_ids: Optional[List[int]] = None,
    category_answer_ids: Optional[List[int]] = None,
) -> Optional[Dict[str, Any]]:
    """Fetch all necessary user data from database."""
    try:
        # Use the repository method to fetch complete user data
        user_data = await user_repo.get_user_complete_data(
            user_id,
            category_id,
            assessment_id=assessment_id,
            general_answer_ids=general_answer_ids,
            category_answer_ids=category_answer_ids,
        )
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


async def _generate_learning_path_for_user(user_id: str, category_id: int, user_profile: Dict[str, Any]) -> Dict[str, Any]:
    """Generate learning path using the learning paths endpoint."""
    try:
        # Import here to avoid circular imports
        from .learning_paths import generate_learning_path_from_user
        from database.repositories import PathRepository, TaskRepository
        from services import LLMService, MLPredictor, YouTubeScraper, UdemyScraper, RedditScraper
        
        # Create dependencies
        user_repo = UserRepository()
        path_repo = PathRepository()
        task_repo = TaskRepository()
        llm_service = LLMService()
        ml_predictor = MLPredictor()
        youtube_scraper = YouTubeScraper()
        udemy_scraper = UdemyScraper()
        reddit_scraper = RedditScraper()
        
        # Create request object
        request = GeneratePathFromUserRequest(
            user_id=user_id,
            category_id=category_id,
            duration_preference="flexible"
        )
        
        # Call the learning path generation endpoint
        result = await generate_learning_path_from_user(
            request=request,
            user_repo=user_repo,
            path_repo=path_repo,
            task_repo=task_repo,
            llm_service=llm_service,
            ml_predictor=ml_predictor,
            youtube_scraper=youtube_scraper,
            udemy_scraper=udemy_scraper,
            reddit_scraper=reddit_scraper
        )
        
        logger.info(f"Learning path generation result: {result.success}")
        return {"success": result.success, "message": result.message, "path_id": result.path_id}
        
    except Exception as e:
        logger.error(f"Error generating learning path: {e}")
        return {"success": False, "message": f"Failed to generate learning path: {str(e)}"}