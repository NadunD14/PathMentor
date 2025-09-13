"""
Learning path generation endpoint.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from datetime import datetime

from models.schemas import (
    GeneratePathRequest,
    GeneratePathResponse,
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


@router.post("/generate", response_model=GeneratePathResponse)
async def generate_learning_path(
    request: GeneratePathRequest,
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
    Generate a personalized learning path.
    
    This is the main endpoint that orchestrates the entire path generation process:
    1. Get platform recommendations using ML
    2. Generate search queries using LLM
    3. Fetch resources from different platforms
    4. Synthesize learning path using LLM
    5. Save path to database
    """
    try:
        logger.info(f"Generating learning path for topic: {request.topic}")
        
        # Step 1: Get platform recommendations
        platform_recommendations = await ml_predictor.predict_platforms(
            user_profile=request.user_profile,
            topic=request.topic,
            platform_preferences=request.platform_preferences
        )
        
        # Extract top platforms
        top_platforms = [rec.platform for rec in platform_recommendations[:3]]
        logger.info(f"Recommended platforms: {[p.value for p in top_platforms]}")
        
        # Step 2: Generate search queries
        search_queries = await llm_service.generate_search_queries(
            user_profile=request.user_profile,
            topic=request.topic,
            platforms=top_platforms
        )
        
        # Step 3: Fetch resources from different platforms
        all_resources = []
        
        # YouTube resources
        if Platform.YOUTUBE in top_platforms:
            youtube_queries = [q.query for q in search_queries if q.platform == Platform.YOUTUBE]
            for query in youtube_queries[:2]:  # Limit queries per platform
                youtube_resources = await youtube_scraper.search_videos(query, max_results=3)
                all_resources.extend(youtube_resources)
        
        # Udemy resources
        if Platform.UDEMY in top_platforms:
            udemy_queries = [q.query for q in search_queries if q.platform == Platform.UDEMY]
            for query in udemy_queries[:2]:
                udemy_resources = await udemy_scraper.search_courses(query, max_results=3)
                all_resources.extend(udemy_resources)
        
        # Reddit resources
        if Platform.REDDIT in top_platforms:
            reddit_queries = [q.query for q in search_queries if q.platform == Platform.REDDIT]
            for query in reddit_queries[:1]:
                reddit_resources = await reddit_scraper.search_posts(query, max_results=2)
                all_resources.extend(reddit_resources)
        
        logger.info(f"Found {len(all_resources)} total resources")
        
        if not all_resources:
            return GeneratePathResponse(
                success=False,
                message="No resources found for the given topic. Please try a different topic or check your internet connection.",
                learning_path=None
            )
        
        # Step 4: Synthesize learning path
        learning_path = await llm_service.synthesize_learning_path(
            user_profile=request.user_profile,
            topic=request.topic,
            resources=all_resources,
            duration_preference=request.duration_preference
        )
        
        # Step 5: Save path to database (if user profile has ID)
        path_id = None
        if request.user_profile.id:
            try:
                path_data = {
                    "user_id": request.user_profile.id,
                    "title": learning_path.title,
                    "description": learning_path.description,
                    "status": "in-progress",
                    "ai_generated": True
                }
                
                # Save path
                saved_path = await path_repo.create_path(path_data)
                path_id = str(saved_path.get("path_id"))
                
                # Save tasks for each step
                for step in learning_path.steps:
                    for resource in step.resources:
                        task_data = {
                            "path_id": saved_path["path_id"],
                            "title": resource.title,
                            "description": resource.description or step.description,
                            "task_type": "resource",
                            "resource_url": resource.url,
                            "source_platform": resource.platform.value,
                            "estimated_duration_min": _parse_duration_to_minutes(resource.duration),
                            "status": "not-started",
                            "task_order": step.step_number
                        }
                        await task_repo.create_task(task_data)
                
                logger.info(f"Saved learning path with ID: {path_id}")
                
            except Exception as e:
                logger.error(f"Error saving path to database: {e}")
                # Continue without saving if database save fails
        
        return GeneratePathResponse(
            success=True,
            learning_path=learning_path,
            message=f"Successfully generated learning path for {request.topic}",
            path_id=path_id
        )
        
    except Exception as e:
        logger.error(f"Error generating learning path: {e}")
        return GeneratePathResponse(
            success=False,
            message=f"Failed to generate learning path: {str(e)}",
            learning_path=None
        )


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