"""
Dependency injection configuration.
"""

from functools import lru_cache

from database import (
    get_database,
    UserRepository,
    FeedbackRepository,
    PathRepository,
    TaskRepository
)
from services import (
    LLMService,
    MLPredictor,
    YouTubeScraper,
    UdemyScraper,
    RedditScraper
)


# Database dependencies
@lru_cache()
def get_user_repository() -> UserRepository:
    """Get user repository instance."""
    return UserRepository()


@lru_cache()
def get_feedback_repository() -> FeedbackRepository:
    """Get feedback repository instance."""
    return FeedbackRepository()


@lru_cache()
def get_path_repository() -> PathRepository:
    """Get path repository instance."""
    return PathRepository()


@lru_cache()
def get_task_repository() -> TaskRepository:
    """Get task repository instance."""
    return TaskRepository()


# Service dependencies
@lru_cache()
def get_llm_service() -> LLMService:
    """Get LLM service instance."""
    return LLMService()


@lru_cache()
def get_ml_predictor() -> MLPredictor:
    """Get ML predictor instance."""
    return MLPredictor()


@lru_cache()
def get_youtube_scraper() -> YouTubeScraper:
    """Get YouTube scraper instance."""
    return YouTubeScraper()


@lru_cache()
def get_udemy_scraper() -> UdemyScraper:
    """Get Udemy scraper instance."""
    return UdemyScraper()


@lru_cache()
def get_reddit_scraper() -> RedditScraper:
    """Get Reddit scraper instance."""
    return RedditScraper()