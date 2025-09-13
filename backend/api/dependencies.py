"""
FastAPI dependencies for PathMentor backend.
"""

from fastapi import Depends, HTTPException, status
from typing import Optional
import os
import logging

from database.supabase_client import SupabaseClient
from database.repositories.user_repo import UserRepository
from database.repositories.feedback_repo import FeedbackRepository
from rl_service.predictor import RLPredictor
from llm_service.client import LLMClient

logger = logging.getLogger(__name__)

# Global service instances (consider using dependency injection framework for production)
_supabase_client: Optional[SupabaseClient] = None
_rl_predictor: Optional[RLPredictor] = None
_llm_client: Optional[LLMClient] = None


def get_supabase_client() -> SupabaseClient:
    """Get Supabase client dependency."""
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = SupabaseClient()
    return _supabase_client


def get_user_repository(
    supabase_client: SupabaseClient = Depends(get_supabase_client)
) -> UserRepository:
    """Get user repository dependency."""
    return UserRepository(supabase_client)


def get_feedback_repository(
    supabase_client: SupabaseClient = Depends(get_supabase_client)
) -> FeedbackRepository:
    """Get feedback repository dependency."""
    return FeedbackRepository(supabase_client)


def get_rl_predictor() -> RLPredictor:
    """Get RL predictor dependency."""
    global _rl_predictor
    if _rl_predictor is None:
        _rl_predictor = RLPredictor()
    return _rl_predictor


def get_llm_client() -> LLMClient:
    """Get LLM client dependency."""
    global _llm_client
    if _llm_client is None:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            logger.warning("GROQ_API_KEY not set; LLM client will use fallback behavior.")
        _llm_client = LLMClient(api_key=api_key)
    return _llm_client


async def verify_api_key(api_key: Optional[str] = None) -> bool:
    """Verify API key for protected endpoints (optional)."""
    if not api_key:
        return True  # Allow without API key for now
    
    # Add your API key verification logic here
    return True


def get_current_user_id(user_id: Optional[str] = None) -> str:
    """Get current user ID (placeholder for authentication)."""
    # This would normally extract user ID from JWT token or session
    # For now, return a default or use the provided user_id
    return user_id or "anonymous_user"
