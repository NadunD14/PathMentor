"""
User and question management endpoints.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from models.schemas import (
    QuestionOptionSchema, 
    CategoryQuestionSchema, 
    CategoryOptionSchema,
    UserAnswerSchema,
    UserCategoryAnswerSchema,
    UserCategorySelectionSchema
)
from database.repositories.user import UserRepository
from core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/users", tags=["users"])


async def get_user_repository() -> UserRepository:
    """Dependency to get user repository."""
    return UserRepository()


@router.get("/questions/general")
async def get_general_questions(
    user_repo: UserRepository = Depends(get_user_repository)
):
    """Get all general questions with their options."""
    try:
        questions = await user_repo.get_general_questions()
        return {
            "success": True,
            "questions": questions
        }
    except Exception as e:
        logger.error(f"Error getting general questions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/questions/category/{category_id}")
async def get_category_questions(
    category_id: int,
    user_repo: UserRepository = Depends(get_user_repository)
):
    """Get questions for a specific category with their options."""
    try:
        questions = await user_repo.get_category_questions(category_id)
        return {
            "success": True,
            "questions": questions
        }
    except Exception as e:
        logger.error(f"Error getting category questions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/answers/general")
async def save_general_answer(
    answer_data: UserAnswerSchema,
    user_repo: UserRepository = Depends(get_user_repository)
):
    """Save a user's answer to a general question."""
    try:
        result = await user_repo.save_user_answer(
            user_id=answer_data.user_id,
            question_id=answer_data.question_id,
            category_id=answer_data.category_id,
            answer_text=answer_data.answer_text,
            option_id=answer_data.option_id
        )
        
        if not result:
            raise HTTPException(status_code=400, detail="Failed to save answer")
            
        return {
            "success": True,
            "answer": result
        }
    except Exception as e:
        logger.error(f"Error saving general answer: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/answers/category")
async def save_category_answer(
    answer_data: UserCategoryAnswerSchema,
    user_repo: UserRepository = Depends(get_user_repository)
):
    """Save a user's answer to a category-specific question."""
    try:
        result = await user_repo.save_user_category_answer(
            user_id=answer_data.user_id,
            category_question_id=answer_data.category_question_id,
            answer_text=answer_data.answer_text,
            option_id=answer_data.option_id
        )
        
        if not result:
            raise HTTPException(status_code=400, detail="Failed to save category answer")
            
        return {
            "success": True,
            "answer": result
        }
    except Exception as e:
        logger.error(f"Error saving category answer: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/category-selection")
async def save_category_selection(
    selection_data: UserCategorySelectionSchema,
    user_repo: UserRepository = Depends(get_user_repository)
):
    """Save a user's category selection."""
    try:
        result = await user_repo.save_user_category_selection(
            user_id=selection_data.user_id,
            category_id=selection_data.category_id
        )
        
        if not result:
            raise HTTPException(status_code=400, detail="Failed to save category selection")
            
        return {
            "success": True,
            "selection": result
        }
    except Exception as e:
        logger.error(f"Error saving category selection: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/answers/general")
async def get_user_general_answers(
    user_id: str,
    user_repo: UserRepository = Depends(get_user_repository)
):
    """Get all general answers for a user."""
    try:
        answers = await user_repo.get_user_answers(user_id)
        return {
            "success": True,
            "answers": answers
        }
    except Exception as e:
        logger.error(f"Error getting user general answers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/answers/category")
async def get_user_category_answers(
    user_id: str,
    category_id: Optional[int] = None,
    user_repo: UserRepository = Depends(get_user_repository)
):
    """Get category answers for a user, optionally filtered by category."""
    try:
        answers = await user_repo.get_user_category_answers(user_id, category_id)
        return {
            "success": True,
            "answers": answers
        }
    except Exception as e:
        logger.error(f"Error getting user category answers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}/profile/{category_id}")
async def get_user_complete_profile(
    user_id: str,
    category_id: int,
    user_repo: UserRepository = Depends(get_user_repository)
):
    """Get complete user profile for a specific category."""
    try:
        profile = await user_repo.get_user_complete_profile(user_id, category_id)
        
        if not profile:
            raise HTTPException(status_code=404, detail="User profile not found")
            
        return {
            "success": True,
            "profile": profile
        }
    except Exception as e:
        logger.error(f"Error getting user complete profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))