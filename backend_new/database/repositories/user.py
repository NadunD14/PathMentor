"""
User repository for database operations.
"""

from typing import List, Optional, Dict, Any

from .base import BaseRepository
from models.database import User
from core.logging import get_logger

logger = get_logger(__name__)


class UserRepository(BaseRepository):
    """Repository for user operations."""
    
    def __init__(self):
        """Initialize user repository."""
        super().__init__("users")
    
    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID."""
        return await self.get_by_id("user_id", user_id)
    
    async def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new user."""
        return await self.create(user_data)
    
    async def update_user(self, user_id: str, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user."""
        return await self.update("user_id", user_id, user_data)
    
    async def get_user_learning_styles(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's learning styles."""
        try:
            result = self.db.client.table("user_learning_styles").select(
                "learning_style, preference_level"
            ).eq("user_id", user_id).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting user learning styles: {e}")
            raise
    
    async def get_user_answers(self, user_id: str) -> List[Dict[str, Any]]:
        """Get user's assessment answers with question text."""
        try:
            result = self.db.client.table("user_answers").select("""
                answer_text,
                option_id,
                created_at,
                general_questions (
                    question_id,
                    question,
                    question_type
                ),
                question_options (
                    option_id,
                    option_text
                )
            """).eq("user_id", user_id).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting user answers: {e}")
            raise
    
    async def get_category_info(self, category_id: int) -> Optional[Dict[str, Any]]:
        """Get category information."""
        try:
            result = self.db.client.table("categories").select(
                "category_id, name, description, image_url"
            ).eq("category_id", category_id).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting category info: {e}")
            return None
    
    async def get_user_category_answers(self, user_id: str, category_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Get user's category-specific answers with question text."""
        try:
            query = self.db.client.table("user_category_answers").select("""
                answer_text,
                option_id,
                created_at,
                category_questions (
                    category_question_id,
                    category_id,
                    question_type,
                    context_for_ai
                ),
                category_options (
                    option_id,
                    option_text
                )
            """).eq("user_id", user_id)
            
            result = query.execute()
            
            # Filter by category if provided
            if category_id is not None:
                filtered_data = []
                for answer in result.data or []:
                    if (answer.get("category_questions") and 
                        answer["category_questions"].get("category_id") == category_id):
                        filtered_data.append(answer)
                return filtered_data
            
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting user category answers: {e}")
            raise
    
    async def get_category_questions(self, category_id: int) -> List[Dict[str, Any]]:
        """Get questions for a specific category with their options."""
        try:
            result = self.db.client.table("category_questions").select("""
                category_question_id,
                category_id,
                question_id,
                question_type,
                context_for_ai,
                category_options (
                    option_id,
                    option_text
                )
            """).eq("category_id", category_id).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting category questions: {e}")
            raise

    async def get_general_questions(self) -> List[Dict[str, Any]]:
        """Get all general questions with their options."""
        try:
            result = self.db.client.table("general_questions").select("""
                question_id,
                question,
                question_type,
                context_for_ai,
                question_options (
                    option_id,
                    option_text
                )
            """).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting general questions: {e}")
            raise

    async def get_user_complete_profile(self, user_id: str, category_id: int) -> Optional[Dict[str, Any]]:
        """
        Get complete user profile data including:
        - user_id, category_id, category name
        - learning styles
        - user answers with question text
        - user category answers with question text
        """
        try:
            # Get basic user info
            user = await self.get_user(user_id)
            if not user:
                logger.warning(f"User not found: {user_id}")
                return None

            # Get category information
            category_info = await self.get_category_info(category_id)
            if not category_info:
                logger.warning(f"Category not found: {category_id}")
                return None

            # Get user learning styles
            learning_styles_raw = await self.get_user_learning_styles(user_id)
            learning_styles = [
                {
                    "learning_style": style["learning_style"],
                    "preference_level": style["preference_level"]
                }
                for style in learning_styles_raw
            ]

            # Get user general answers with question text
            user_answers_raw = await self.get_user_answers(user_id)
            formatted_user_answers = []
            
            for answer in user_answers_raw:
                question_info = answer.get("general_questions", {})
                option_info = answer.get("question_options", {})
                
                formatted_answer = {
                    "question_id": question_info.get("question_id"),
                    "question_text": question_info.get("question"),
                    "question_type": question_info.get("question_type"),
                    "answer_text": answer.get("answer_text"),
                    "selected_option": {
                        "option_id": option_info.get("option_id"),
                        "option_text": option_info.get("option_text")
                    } if option_info.get("option_id") else None,
                    "created_at": answer.get("created_at")
                }
                formatted_user_answers.append(formatted_answer)

            # Get user category-specific answers with question text
            category_answers_raw = await self.get_user_category_answers(user_id, category_id)
            formatted_category_answers = []
            
            for answer in category_answers_raw:
                category_question = answer.get("category_questions", {})
                option_info = answer.get("category_options", {})
                
                formatted_answer = {
                    "category_question_id": category_question.get("category_question_id"),
                    "question_type": category_question.get("question_type"),
                    "context_for_ai": category_question.get("context_for_ai"),
                    "answer_text": answer.get("answer_text"),
                    "selected_option": {
                        "option_id": option_info.get("option_id"),
                        "option_text": option_info.get("option_text")
                    } if option_info.get("option_id") else None,
                    "created_at": answer.get("created_at")
                }
                formatted_category_answers.append(formatted_answer)

            return {
                "user_id": user_id,
                "category_id": category_id,
                "category_name": category_info["name"],
                "category_description": category_info.get("description"),
                "learning_styles": learning_styles,
                "user_answers": formatted_user_answers,
                "user_category_answers": formatted_category_answers,
                "total_general_answers": len(formatted_user_answers),
                "total_category_answers": len(formatted_category_answers)
            }

        except Exception as e:
            logger.error(f"Error getting user complete profile: {e}")
            return None

    async def get_all_user_categories_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get complete user profile data for ALL categories the user has selected.
        Returns data for each category separately.
        """
        try:
            # Get basic user info
            user = await self.get_user(user_id)
            if not user:
                logger.warning(f"User not found: {user_id}")
                return None

            # Get all categories the user has selected
            user_categories_result = self.db.client.table("user_category_selections").select(
                "category_id, categories(category_id, name, description)"
            ).eq("user_id", user_id).execute()

            if not user_categories_result.data:
                logger.warning(f"No category selections found for user: {user_id}")
                return None

            # Get user learning styles (same for all categories)
            learning_styles_raw = await self.get_user_learning_styles(user_id)
            learning_styles = [
                {
                    "learning_style": style["learning_style"],
                    "preference_level": style["preference_level"]
                }
                for style in learning_styles_raw
            ]

            # Get user general answers (same for all categories)
            user_answers_raw = await self.get_user_answers(user_id)
            formatted_user_answers = []
            
            for answer in user_answers_raw:
                question_info = answer.get("general_questions", {})
                option_info = answer.get("question_options", {})
                
                formatted_answer = {
                    "question_id": question_info.get("question_id"),
                    "question_text": question_info.get("question"),
                    "question_type": question_info.get("question_type"),
                    "answer_text": answer.get("answer_text"),
                    "selected_option": {
                        "option_id": option_info.get("option_id"),
                        "option_text": option_info.get("option_text")
                    } if option_info.get("option_id") else None,
                    "created_at": answer.get("created_at")
                }
                formatted_user_answers.append(formatted_answer)

            # Process each category
            categories_data = []
            for category_selection in user_categories_result.data:
                category_info = category_selection.get("categories", {})
                category_id = category_info.get("category_id")
                
                if not category_id:
                    continue

                # Get category-specific data
                category_profile = await self.get_user_complete_profile(user_id, category_id)
                if category_profile:
                    categories_data.append(category_profile)

            return {
                "user_id": user_id,
                "learning_styles": learning_styles,
                "general_answers": formatted_user_answers,
                "categories": categories_data,
                "total_categories": len(categories_data)
            }

        except Exception as e:
            logger.error(f"Error getting all user categories profile: {e}")
            return None

    # DEPRECATED: Use get_user_complete_profile instead
    async def get_user_complete_data(self, user_id: str, category_id: int) -> Optional[Dict[str, Any]]:
        
        try:
            # Get user basic info
            user = await self.get_user(user_id)
            if not user:
                return None
            
            # Get category info
            category_result = self.db.client.table("categories").select("*").eq("category_id", category_id).execute()
            category_info = category_result.data[0] if category_result.data else None
            
            # Get user answers with related data
            user_answers_result = self.db.client.table("user_answers").select("""
                *,
                general_questions (*),
                question_options (*)
            """).eq("user_id", user_id).execute()
            
            # Get user learning styles
            learning_styles = await self.get_user_learning_styles(user_id)
            
            # Get user category selections
            category_selections_result = self.db.client.table("user_category_selections").select("""
                *,
                categories (*)
            """).eq("user_id", user_id).execute()
            
            # Get general questions
            general_questions_result = self.db.client.table("general_questions").select("*").execute()
            
            # Get category-specific questions
            category_questions = await self.get_category_questions(category_id)
            
            # Get user category answers
            user_category_answers = await self.get_user_category_answers(user_id, category_id)
            
            return {
                "user_id": user_id,
                "category_id": category_id,
                "user_info": user,
                "category_info": category_info,
                "user_answers": user_answers_result.data or [],
                "learning_styles": learning_styles,
                "category_selections": category_selections_result.data or [],
                "general_questions": general_questions_result.data or [],
                "category_questions": category_questions,
                "user_category_answers": user_category_answers
            }
            
        except Exception as e:
            logger.error(f"Error getting user complete data: {e}")
            return None

    async def save_user_answer(self, user_id: str, question_id: int, category_id: Optional[int] = None, 
                              answer_text: Optional[str] = None, option_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
        """Save a user's answer to a general question."""
        try:
            answer_data = {
                "user_id": user_id,
                "question_id": question_id,
                "category_id": category_id,
                "answer_text": answer_text,
                "option_id": option_id
            }
            
            result = self.db.client.table("user_answers").insert(answer_data).execute()
            return result.data[0] if result.data else None
            
        except Exception as e:
            logger.error(f"Error saving user answer: {e}")
            return None

    async def save_user_category_answer(self, user_id: str, category_question_id: int, 
                                       answer_text: Optional[str] = None, option_id: Optional[int] = None) -> Optional[Dict[str, Any]]:
        """Save a user's answer to a category-specific question."""
        try:
            answer_data = {
                "user_id": user_id,
                "category_question_id": category_question_id,
                "answer_text": answer_text,
                "option_id": option_id
            }
            
            result = self.db.client.table("user_category_answers").insert(answer_data).execute()
            return result.data[0] if result.data else None
            
        except Exception as e:
            logger.error(f"Error saving user category answer: {e}")
            return None

    async def save_user_category_selection(self, user_id: str, category_id: int) -> Optional[Dict[str, Any]]:
        """Save a user's category selection."""
        try:
            selection_data = {
                "user_id": user_id,
                "category_id": category_id
            }
            
            result = self.db.client.table("user_category_selections").insert(selection_data).execute()
            return result.data[0] if result.data else None
            
        except Exception as e:
            logger.error(f"Error saving user category selection: {e}")
            return None