"""
Learning path generation endpoint.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from datetime import datetime

from models.schemas import (
    GeneratePathFromUserRequest,
    GeneratePathResponse,
    MLCompleteSetupRequest,
    MLCompleteSetupResponse,
    UserProfile,
    LearningPath,
    Resource,
    Platform,
    PlatformRecommendation,
    SearchQuery,
    PathStep
)
from database.repositories import UserRepository, PathRepository, TaskRepository
from services import LLMService, MLPredictor, YouTubeScraper, UdemyScraper, RedditScraper
from core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/learning-paths", tags=["learning_paths"])


# Dependency functions
def get_user_repository() -> UserRepository:
    return UserRepository()


def get_path_repository() -> PathRepository:
    return PathRepository()


def get_task_repository() -> TaskRepository:
    return TaskRepository()


def get_llm_service() -> LLMService:
    return LLMService()


def get_ml_predictor() -> MLPredictor:
    return MLPredictor()


def get_youtube_scraper() -> YouTubeScraper:
    return YouTubeScraper()


def get_udemy_scraper() -> UdemyScraper:
    return UdemyScraper()


def get_reddit_scraper() -> RedditScraper:
    return RedditScraper()


# Helpers
def _platform_to_str(p) -> str:
    """Return platform as string whether it's an Enum or already a string."""
    try:
        # Enum-like objects have a 'value' attribute
        return p.value  # type: ignore[attr-defined]
    except Exception:
        return str(p)


@router.post("/complete-setup", response_model=MLCompleteSetupResponse)
async def complete_setup(
    request: MLCompleteSetupRequest,
    user_repo: UserRepository = Depends(get_user_repository),
    path_repo: PathRepository = Depends(get_path_repository),
    task_repo: TaskRepository = Depends(get_task_repository),
    llm_service: LLMService = Depends(get_llm_service),
    ml_predictor: MLPredictor = Depends(get_ml_predictor),
    youtube_scraper: YouTubeScraper = Depends(get_youtube_scraper),
    udemy_scraper: UdemyScraper = Depends(get_udemy_scraper),
    reddit_scraper: RedditScraper = Depends(get_reddit_scraper)
):
    """
    Complete ML setup and analysis for a user, then generate a learning path.

    This endpoint consolidates the ML setup previously under /ml into learning_paths:
    1) Fetch user data (optionally filtered by assessment/session or explicit answers)
    2) Perform ML analysis on user preferences and answers
    3) Create a user profile for path generation
    4) Generate a learning path and persist it when possible
    """
    try:
        logger.info(f"Starting ML setup for user {request.user_id}, category {request.category_id}")

        # Fetch user data using the consolidated complete profile API
        user_data = await _fetch_user_complete_data(request.user_id, request.category_id, user_repo)

        logger.info(f"Fetched user data: {user_data}")

        if not user_data:
            return MLCompleteSetupResponse(
                success=False,
                message="User data not found or incomplete"
            )

        # Create UserProfile from fetched data (simple heuristics)
        user_profile_model = await _create_user_profile_from_data(user_data)
        # Prefer the normalized field from complete profile; fall back to nested if present
        topic = user_data.get('category_name') or user_data.get('category_info', {}).get('name', 'General Skills')

        logger.info(f"UserProfile: {user_profile_model}")

        # Atomic idempotency guard: check for existing path more thoroughly
        try:
            existing_paths = await path_repo.get_user_paths(request.user_id)
            existing_ai_for_category = next((p for p in (existing_paths or [])
                                             if str(p.get('category_id')) == str(request.category_id)
                                             and (p.get('ai_generated') is True or str(p.get('ai_generated')).lower() == 'true')),
                                            None)
            
            # Double-check during concurrent requests by re-querying right before creation
            if not existing_ai_for_category:
                # Small delay to let any concurrent path creation complete
                import asyncio
                await asyncio.sleep(0.1)
                
                # Re-check after brief delay
                existing_paths_recheck = await path_repo.get_user_paths(request.user_id)
                existing_ai_for_category = next((p for p in (existing_paths_recheck or [])
                                                 if str(p.get('category_id')) == str(request.category_id)
                                                 and (p.get('ai_generated') is True or str(p.get('ai_generated')).lower() == 'true')),
                                                None)
        except Exception as e:
            logger.error(f"Error checking existing paths for idempotency: {e}")
            existing_ai_for_category = None

        if existing_ai_for_category and not getattr(request, 'force', False):
            logger.info(f"Existing AI-generated path found (ID: {existing_ai_for_category.get('path_id')}) for user/category; skipping regeneration")
            analysis_result = {
                "recommended_learning_style": str(getattr(user_profile_model.learning_style, 'value', user_profile_model.learning_style)),
                "experience_level": str(getattr(user_profile_model.experience_level, 'value', user_profile_model.experience_level)),
                "preferred_platforms": [],
            }
            return MLCompleteSetupResponse(
                success=True,
                message="Learning path already exists for this category; skipped regeneration",
                analysis=analysis_result,
                user_profile={
                    "id": user_profile_model.id,
                    "goal": user_profile_model.goal,
                    "experience_level": str(getattr(user_profile_model.experience_level, 'value', user_profile_model.experience_level)),
                    "learning_style": str(getattr(user_profile_model.learning_style, 'value', user_profile_model.learning_style)),
                    "created_at": datetime.now().isoformat()
                }
            )

        # Platform recommendations
        platform_recommendations = await ml_predictor.predict_platforms(
            user_profile=user_profile_model,
            topic=topic,
            platform_preferences=getattr(request, 'platform_preferences', None)
        )

        top_platforms = [rec.platform for rec in platform_recommendations[:3]]
        logger.info(f"Recommended platforms: {[ _platform_to_str(p) for p in top_platforms ]}")

        # Generate search queries
        search_queries = await llm_service.generate_search_queries(
            user_profile=user_profile_model,
            topic=topic,
            platforms=top_platforms
        )
        logger.info(f"Generated {search_queries} search queries")

        # Fetch resources from different platforms
        all_resources = []
        top_platform_names = { _platform_to_str(p) for p in top_platforms }

        # YouTube resources
        if Platform.YOUTUBE.value in top_platform_names or "youtube" in top_platform_names:
            youtube_queries = [q.query for q in search_queries if _platform_to_str(q.platform) == Platform.YOUTUBE.value]
            for query in youtube_queries[:2]:
                youtube_resources = await youtube_scraper.search_videos(query, max_results=3)
                all_resources.extend(youtube_resources)

        # Udemy resources (optional; commented to reduce external calls if desired)
        # if Platform.UDEMY.value in top_platform_names or "udemy" in top_platform_names:
        #     udemy_queries = [q.query for q in search_queries if _platform_to_str(q.platform) == Platform.UDEMY.value]
        #     for query in udemy_queries[:2]:
        #         udemy_resources = await udemy_scraper.search_courses(query, max_results=3)
        #         all_resources.extend(udemy_resources)

        # Reddit resources (optional)
        # if Platform.REDDIT.value in top_platform_names or "reddit" in top_platform_names:
        #     reddit_queries = [q.query for q in search_queries if _platform_to_str(q.platform) == Platform.REDDIT.value]
        #     for query in reddit_queries[:1]:
        #         reddit_resources = await reddit_scraper.search_posts(query, max_results=2)
        #         all_resources.extend(reddit_resources)

        logger.info(f"Found {len(all_resources)} total resources")

        if not all_resources:
            return MLCompleteSetupResponse(
                success=False,
                message="No resources found for the given topic. Please try a different topic or check your internet connection.",
            )

        # Synthesize learning path
        learning_path = await llm_service.synthesize_learning_path(
            user_profile=user_profile_model,
            topic=topic,
            resources=all_resources,
            duration_preference=getattr(request, 'duration_preference', 'flexible')
        )

        # Save path to database with additional race condition protection
        try:
            # Final check before saving to handle race conditions
            final_check_paths = await path_repo.get_user_paths(request.user_id)
            final_existing = next((p for p in (final_check_paths or [])
                                   if str(p.get('category_id')) == str(request.category_id)
                                   and (p.get('ai_generated') is True or str(p.get('ai_generated')).lower() == 'true')),
                                  None)
            
            if final_existing and not getattr(request, 'force', False):
                logger.info(f"Race condition detected: path {final_existing.get('path_id')} created concurrently; skipping save")
                # Return success but indicate we used existing path
                analysis_result = {
                    "recommended_learning_style": str(getattr(user_profile_model.learning_style, 'value', user_profile_model.learning_style)),
                    "experience_level": str(getattr(user_profile_model.experience_level, 'value', user_profile_model.experience_level)),
                    "preferred_platforms": [ _platform_to_str(p) for p in top_platforms ],
                }
                return MLCompleteSetupResponse(
                    success=True,
                    message="ML setup completed successfully, used existing concurrent path generation",
                    analysis=analysis_result,
                    user_profile={
                        "id": user_profile_model.id,
                        "goal": user_profile_model.goal,
                        "experience_level": str(getattr(user_profile_model.experience_level, 'value', user_profile_model.experience_level)),
                        "learning_style": str(getattr(user_profile_model.learning_style, 'value', user_profile_model.learning_style)),
                        "created_at": datetime.now().isoformat()
                    }
                )
            
            path_data = {
                "user_id": request.user_id,
                "category_id": request.category_id,
                "title": learning_path.title,
                "description": learning_path.description,
                "status": "in-progress",
                "ai_generated": True
            }

            # Save path
            saved_path = await path_repo.create_path(path_data)
            logger.info(f"Successfully created new path with ID: {saved_path.get('path_id')}")

            # Save tasks for each step
            for step in learning_path.steps:
                for resource in step.resources:
                    task_data = {
                        "path_id": saved_path["path_id"],
                        "title": resource.title,
                        "description": resource.description or step.description,
                        "task_type": "resource",
                        "resource_url": resource.url,
                        "task_link": resource.url,
                        "source_platform": _platform_to_str(resource.platform),
                        "estimated_duration_min": _parse_duration_to_minutes(resource.duration),
                        "status": "not-started",
                        "task_order": step.step_number
                    }
                    await task_repo.create_task(task_data)
        except Exception as e:
            logger.error(f"Error saving path to database: {e}")
            # Check if error might be due to constraint violation (duplicate)
            if "unique" in str(e).lower() or "duplicate" in str(e).lower():
                logger.info("Detected database constraint violation, likely due to concurrent creation")
                # Return success indicating the path exists
                analysis_result = {
                    "recommended_learning_style": str(getattr(user_profile_model.learning_style, 'value', user_profile_model.learning_style)),
                    "experience_level": str(getattr(user_profile_model.experience_level, 'value', user_profile_model.experience_level)),
                    "preferred_platforms": [ _platform_to_str(p) for p in top_platforms ],
                }
                return MLCompleteSetupResponse(
                    success=True,
                    message="ML setup completed successfully, path already exists from concurrent request",
                    analysis=analysis_result,
                    user_profile={
                        "id": user_profile_model.id,
                        "goal": user_profile_model.goal,
                        "experience_level": str(getattr(user_profile_model.experience_level, 'value', user_profile_model.experience_level)),
                        "learning_style": str(getattr(user_profile_model.learning_style, 'value', user_profile_model.learning_style)),
                        "created_at": datetime.now().isoformat()
                    }
                )
            # Re-raise if it's a different kind of error
            raise

        # Build analysis result (consolidated, non-duplicate)
        analysis_result = {
            "recommended_learning_style": str(getattr(user_profile_model.learning_style, 'value', user_profile_model.learning_style)),
            "experience_level": str(getattr(user_profile_model.experience_level, 'value', user_profile_model.experience_level)),
            "preferred_platforms": [ _platform_to_str(p) for p in top_platforms ],
        }

        return MLCompleteSetupResponse(
            success=True,
            message="ML setup completed successfully and learning path generated",
            analysis=analysis_result,
            user_profile={
                "id": user_profile_model.id,
                "goal": user_profile_model.goal,
                "experience_level": str(getattr(user_profile_model.experience_level, 'value', user_profile_model.experience_level)),
                "learning_style": str(getattr(user_profile_model.learning_style, 'value', user_profile_model.learning_style)),
                "created_at": datetime.now().isoformat()
            }
        )

    except Exception as e:
        logger.error(f"Error in ML complete setup: {e}")
        return MLCompleteSetupResponse(
            success=False,
            message=f"Failed to complete ML setup: {str(e)}"
        )

    # Removed: consolidated into complete-setup endpoint to avoid duplicate flows


# Removed duplicate ML analysis/profile helpers; using unified flow in complete-setup


@router.get("/user/{user_id}", response_model=List[Dict[str, Any]])
async def get_user_paths(
    user_id: str,
    path_repo: PathRepository = Depends(get_path_repository)
):
    """Get all learning paths for a specific user."""
    try:
        paths = await path_repo.get_user_paths(user_id)
        return paths
    except Exception as e:
        logger.error(f"Error getting user paths: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve user paths")


@router.get("/{path_id}/tasks", response_model=List[Dict[str, Any]])
async def get_path_tasks(
    path_id: int,
    task_repo: TaskRepository = Depends(get_task_repository)
):
    """Get all tasks for a specific learning path."""
    try:
        tasks = await task_repo.get_path_tasks(path_id)
        return tasks
    except Exception as e:
        logger.error(f"Error getting path tasks: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve path tasks")


@router.put("/{path_id}/status")
async def update_path_status(
    path_id: int,
    status: str,
    path_repo: PathRepository = Depends(get_path_repository)
):
    """Update the status of a learning path."""
    try:
        updated_path = await path_repo.update_path_status(path_id, status)
        return {"success": True, "path": updated_path}
    except Exception as e:
        logger.error(f"Error updating path status: {e}")
        raise HTTPException(status_code=500, detail="Failed to update path status")


def _parse_duration_to_minutes(duration_str: str) -> int:
    """Parse duration string to minutes."""
    if not duration_str:
        return 30  # Default 30 minutes
    
    duration_lower = duration_str.lower()
    
    # Extract number and unit
    if "hour" in duration_lower:
        try:
            hours = float(duration_lower.split()[0].split("-")[0])
            return int(hours * 60)
        except:
            return 60
    elif "minute" in duration_lower:
        try:
            minutes = float(duration_lower.split()[0].split("-")[0])
            return int(minutes)
        except:
            return 30
    else:
        return 30  # Default


async def _fetch_user_complete_data(user_id: str, category_id: int, user_repo: UserRepository) -> dict:
    """Fetch all user data needed for path generation from database."""
    try:
        # Use the repository method to fetch complete user profile (new API)
        user_data = await user_repo.get_user_complete_profile(user_id, category_id)
        return user_data
        
    except Exception as e:
        logger.error(f"Error fetching user complete data: {e}")
        return None


async def _create_user_profile_from_data(user_data: dict) -> UserProfile:
    """Create UserProfile object from fetched user data."""
    try:
        from models.schemas import ExperienceLevel, LearningStyle
        
        # Analyze user answers to determine experience level and learning style
        # This is simplified logic - in reality would use ML analysis
        
        # Default values
        experience_level = ExperienceLevel.BEGINNER
        learning_style = LearningStyle.VISUAL
        
        # Analyze learning styles from user data
        if user_data.get('learning_styles'):
            # Get the learning style with highest preference level
            top_style = max(user_data['learning_styles'], key=lambda x: x.get('preference_level', 0))
            style_name = top_style.get('learning_style', '').lower()
            
            # Map to enum values
            if 'visual' in style_name:
                learning_style = LearningStyle.VISUAL
            elif 'auditory' in style_name:
                learning_style = LearningStyle.AUDITORY
            elif 'kinesthetic' in style_name:
                learning_style = LearningStyle.KINESTHETIC
            elif 'reading' in style_name or 'writing' in style_name:
                learning_style = LearningStyle.READING_WRITING
            elif 'multimodal' in style_name:
                learning_style = LearningStyle.MULTIMODAL
        
        # Analyze experience level from user answers
        # This would typically involve ML analysis of answers
        # For now, use simple heuristics or default
        
        category_name = user_data.get('category_name') or user_data.get('category_info', {}).get('name', 'General Skills')
        
        user_profile = UserProfile(
            id=user_data["user_id"],
            goal=f"Learn {category_name}",
            experience_level=experience_level,
            learning_style=learning_style
        )
        
        return user_profile
        
    except Exception as e:
        logger.error(f"Error creating user profile from data: {e}")
        raise