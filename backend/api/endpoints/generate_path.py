"""
Main endpoint for generating personalized learning paths.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
import logging
from datetime import datetime

from ..database.models import (
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
from ..database.repositories.user_repo import UserRepository
from ..database.repositories.feedback_repo import FeedbackRepository
from ..rl_service.predictor import RLPredictor
from ..llm_service.client import LLMClient
from ..scrapers.youtube_client import YouTubeClient
from ..scrapers.udemy_client import UdemyClient
from ..scrapers.reddit_scraper import RedditScraper

# Initialize router
router = APIRouter(prefix="/api/v1", tags=["learning_paths"])

# Initialize logger
logger = logging.getLogger(__name__)

# Initialize services (these would normally be dependency injected)
rl_predictor = RLPredictor()
llm_client = LLMClient()
youtube_client = YouTubeClient()
udemy_client = UdemyClient()
reddit_scraper = RedditScraper()

# Initialize repositories
user_repo = UserRepository()
feedback_repo = FeedbackRepository()


@router.post("/generate-path", response_model=GeneratePathResponse)
async def generate_learning_path(
    request: GeneratePathRequest,
    user_repo: UserRepository = Depends(),
    feedback_repo: FeedbackRepository = Depends()
) -> GeneratePathResponse:
    """
    Generate a personalized learning path based on user profile and preferences.
    
    This endpoint orchestrates the entire learning path generation process:
    1. Get platform recommendations from RL service
    2. Generate search queries using LLM service
    3. Fetch resources from external APIs using scrapers
    4. Synthesize learning path using LLM service
    5. Save the generated path to database
    6. Return the structured learning path
    """
    try:
        logger.info(f"Starting path generation for topic: {request.topic}")
        
        # Step 1: Save or update user profile
        user_profile = await _save_user_profile(request.user_profile, user_repo)
        logger.info(f"User profile processed for user: {user_profile.id}")
        
        # Step 2: Get platform recommendations from RL service
        platform_recommendations = await _get_platform_recommendations(
            user_profile, request.topic, request.platform_preferences
        )
        logger.info(f"Received {len(platform_recommendations)} platform recommendations")
        
        # Step 3: Generate search queries using LLM service
        search_queries = await _generate_search_queries(
            user_profile, platform_recommendations, request.topic
        )
        logger.info(f"Generated {sum(len(queries) for queries in search_queries.values())} search queries")
        
        # Step 4: Fetch resources from external APIs
        resources = await _fetch_resources(search_queries)
        logger.info(f"Fetched {len(resources)} resources from external APIs")
        
        # Step 5: Synthesize learning path using LLM service
        learning_path = await _synthesize_learning_path(
            resources, user_profile, request.topic, request.duration_preference
        )
        logger.info(f"Synthesized learning path with {len(learning_path.steps)} steps")
        
        # Step 6: Save the generated path to database
        saved_path_id = await _save_learning_path(learning_path, user_profile.id, user_repo)
        learning_path.id = saved_path_id
        logger.info(f"Saved learning path with ID: {saved_path_id}")
        
        return GeneratePathResponse(
            success=True,
            learning_path=learning_path,
            message="Learning path generated successfully",
            path_id=saved_path_id
        )
        
    except Exception as e:
        logger.error(f"Error generating learning path: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate learning path: {str(e)}"
        )


async def _save_user_profile(user_profile: UserProfile, user_repo: UserRepository) -> UserProfile:
    """Save or update user profile in the database."""
    try:
        if user_profile.id:
            # Update existing user
            return await user_repo.update_user(user_profile)
        else:
            # Create new user
            return await user_repo.create_user(user_profile)
    except Exception as e:
        logger.error(f"Error saving user profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save user profile")


async def _get_platform_recommendations(
    user_profile: UserProfile,
    topic: str,
    platform_preferences: List[Platform] = None
) -> List[PlatformRecommendation]:
    """Get platform recommendations from the RL service."""
    try:
        # Call RL service to get platform recommendations
        recommendations = await rl_predictor.predict_platforms(
            user_profile=user_profile,
            topic=topic,
            platform_preferences=platform_preferences
        )
        return recommendations
    except Exception as e:
        logger.error(f"Error getting platform recommendations: {str(e)}")
        # Fallback to default platforms if RL service fails
        default_platforms = [
            PlatformRecommendation(platform=Platform.YOUTUBE, confidence_score=0.8),
            PlatformRecommendation(platform=Platform.UDEMY, confidence_score=0.7),
            PlatformRecommendation(platform=Platform.REDDIT, confidence_score=0.6)
        ]
        return default_platforms


async def _generate_search_queries(
    user_profile: UserProfile,
    platform_recommendations: List[PlatformRecommendation],
    topic: str
) -> Dict[str, List[str]]:
    """Generate search queries using the LLM service."""
    try:
        # Extract platform names from recommendations
        platforms = [rec.platform.value for rec in platform_recommendations]
        
        # Call LLM service to generate search queries
        queries = await llm_client.generate_search_queries(
            user_profile=user_profile,
            platforms=platforms,
            topic=topic
        )
        return queries
    except Exception as e:
        logger.error(f"Error generating search queries: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate search queries")


async def _fetch_resources(search_queries: Dict[str, List[str]]) -> List[Resource]:
    """Fetch resources from external APIs using the appropriate scrapers."""
    resources = []
    
    try:
        # Fetch from each platform
        for platform, queries in search_queries.items():
            platform_resources = []
            
            if platform == Platform.YOUTUBE.value:
                for query in queries:
                    youtube_resources = await youtube_client.search_videos(
                        query=query,
                        max_results=5
                    )
                    platform_resources.extend(youtube_resources)
                    
            elif platform == Platform.UDEMY.value:
                for query in queries:
                    udemy_resources = await udemy_client.search_courses(
                        query=query,
                        max_results=3
                    )
                    platform_resources.extend(udemy_resources)
                    
            elif platform == Platform.REDDIT.value:
                for query in queries:
                    reddit_resources = await reddit_scraper.search_posts(
                        query=query,
                        max_results=5
                    )
                    platform_resources.extend(reddit_resources)
            
            resources.extend(platform_resources)
            logger.info(f"Fetched {len(platform_resources)} resources from {platform}")
            
        return resources
        
    except Exception as e:
        logger.error(f"Error fetching resources: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch learning resources")


async def _synthesize_learning_path(
    resources: List[Resource],
    user_profile: UserProfile,
    topic: str,
    duration_preference: str = None
) -> LearningPath:
    """Synthesize a structured learning path using the LLM service."""
    try:
        # Call LLM service to synthesize the learning path
        path_steps = await llm_client.synthesize_learning_path(
            resources=resources,
            user_profile=user_profile,
            topic=topic,
            duration_preference=duration_preference
        )
        
        # Create the complete learning path object
        learning_path = LearningPath(
            title=f"Personalized Learning Path: {topic}",
            description=f"A customized learning journey for {topic} tailored to your {user_profile.learning_style} learning style and {user_profile.experience_level} level",
            total_duration=_calculate_total_duration(path_steps),
            difficulty=user_profile.experience_level,
            steps=path_steps,
            created_at=datetime.utcnow()
        )
        
        return learning_path
        
    except Exception as e:
        logger.error(f"Error synthesizing learning path: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to synthesize learning path")


async def _save_learning_path(
    learning_path: LearningPath,
    user_id: str,
    user_repo: UserRepository
) -> str:
    """Save the generated learning path to the database."""
    try:
        # Convert learning path to JSON format for database storage
        path_data = {
            "title": learning_path.title,
            "description": learning_path.description,
            "total_duration": learning_path.total_duration,
            "difficulty": learning_path.difficulty.value,
            "steps": [step.dict() for step in learning_path.steps],
            "created_at": learning_path.created_at.isoformat()
        }
        
        # Save to database
        path_id = await user_repo.save_learning_path(
            user_id=user_id,
            path_data=path_data
        )
        
        return path_id
        
    except Exception as e:
        logger.error(f"Error saving learning path: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save learning path")


def _calculate_total_duration(path_steps: List[PathStep]) -> str:
    """Calculate the total estimated duration for the learning path."""
    # This is a simplified calculation - in reality, you'd parse duration strings
    # and perform proper time arithmetic
    total_hours = 0
    
    for step in path_steps:
        # Simple heuristic: extract numbers from duration strings
        try:
            duration_str = step.estimated_duration.lower()
            if "hour" in duration_str:
                hours = float(duration_str.split()[0])
                total_hours += hours
            elif "minute" in duration_str:
                minutes = float(duration_str.split()[0])
                total_hours += minutes / 60
            elif "day" in duration_str:
                days = float(duration_str.split()[0])
                total_hours += days * 8  # Assume 8 hours per day
        except:
            # If parsing fails, add a default estimate
            total_hours += 2
    
    if total_hours < 1:
        return f"{int(total_hours * 60)} minutes"
    elif total_hours < 24:
        return f"{int(total_hours)} hours"
    else:
        days = total_hours / 8
        return f"{int(days)} days"


# Health check endpoint
@router.get("/health")
async def health_check():
    """Health check endpoint to verify the service is running."""
    return {"status": "healthy", "service": "PathMentor Learning Path Generator"}
