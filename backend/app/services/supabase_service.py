from typing import List, Dict, Any, Optional
import httpx
import json
import logging
from app.core.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SupabaseClient:
    def __init__(self):
        self.url = settings.SUPABASE_URL
        self.service_role_key = settings.SUPABASE_SERVICE_ROLE_KEY
        self.headers = {
            "apikey": self.service_role_key,
            "Authorization": f"Bearer {self.service_role_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
        
        # Validate configuration
        if not self.url or not self.service_role_key:
            logger.error("Supabase configuration missing. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
            raise ValueError("Supabase configuration is required")

    async def fetch_user_answers(self, user_id: str) -> List[Dict[str, Any]]:
        """Fetch all user answers from Supabase"""
        try:
            logger.info(f"Fetching user answers for user_id: {user_id}")
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.url}/rest/v1/user_answers",
                    headers=self.headers,
                    params={
                        "user_id": f"eq.{user_id}",
                        "select": "*,general_questions(*),question_options(*),categories(*)"
                    }
                )
                response.raise_for_status()
                data = response.json()
                logger.info(f"Successfully fetched {len(data)} answers for user {user_id}")
                return data
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching user answers: {e.response.status_code} - {e.response.text}")
            return []
        except Exception as e:
            logger.error(f"Error fetching user answers: {e}")
            return []

    async def fetch_user_categories(self, user_id: str) -> List[Dict[str, Any]]:
        """Fetch user's selected categories from Supabase"""
        try:
            logger.info(f"Fetching user categories for user_id: {user_id}")
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.url}/rest/v1/user_category_selections",
                    headers=self.headers,
                    params={
                        "user_id": f"eq.{user_id}",
                        "select": "*,categories(*)"
                    }
                )
                response.raise_for_status()
                data = response.json()
                logger.info(f"Successfully fetched {len(data)} categories for user {user_id}")
                return data
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching user categories: {e.response.status_code} - {e.response.text}")
            return []
        except Exception as e:
            logger.error(f"Error fetching user categories: {e}")
            return []

    async def fetch_categories(self) -> List[Dict[str, Any]]:
        """Fetch all available categories"""
        try:
            logger.info("Fetching all categories")
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.url}/rest/v1/categories",
                    headers=self.headers,
                    params={"select": "*"}
                )
                response.raise_for_status()
                data = response.json()
                logger.info(f"Successfully fetched {len(data)} categories")
                return data
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching categories: {e.response.status_code} - {e.response.text}")
            return []
        except Exception as e:
            logger.error(f"Error fetching categories: {e}")
            return []

    async def fetch_questions(self, category_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Fetch questions, optionally filtered by category"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                if category_id:
                    logger.info(f"Fetching questions for category_id: {category_id}")
                    # For category-specific questions, use category_questions table
                    response = await client.get(
                        f"{self.url}/rest/v1/category_questions",
                        headers=self.headers,
                        params={
                            "category_id": f"eq.{category_id}",
                            "select": "*,general_questions(*,question_options(*))"
                        }
                    )
                else:
                    logger.info("Fetching general questions")
                    # For general questions
                    response = await client.get(
                        f"{self.url}/rest/v1/general_questions",
                        headers=self.headers,
                        params={"select": "*,question_options(*)"}
                    )
                response.raise_for_status()
                data = response.json()
                logger.info(f"Successfully fetched {len(data)} questions")
                return data
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching questions: {e.response.status_code} - {e.response.text}")
            return []
        except Exception as e:
            logger.error(f"Error fetching questions: {e}")
            return []

    async def create_user_progress(self, user_id: str, path_id: int, progress_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create initial user progress record"""
        try:
            logger.info(f"Creating user progress for user_id: {user_id}, path_id: {path_id}")
            async with httpx.AsyncClient(timeout=30.0) as client:
                data = {
                    "user_id": user_id,
                    "path_id": path_id,
                    "current_task_id": progress_data.get("current_task_id"),
                    "progress_percentage": progress_data.get("progress_percentage", 0),
                    "completion_status": progress_data.get("completion_status", "in_progress")
                }
                
                response = await client.post(
                    f"{self.url}/rest/v1/user_progress",
                    headers=self.headers,
                    json=data
                )
                response.raise_for_status()
                result = response.json()
                progress_record = result[0] if result else {}
                logger.info(f"Successfully created user progress record")
                return progress_record
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error creating user progress: {e.response.status_code} - {e.response.text}")
            return {}
        except Exception as e:
            logger.error(f"Error creating user progress: {e}")
            return {}

    async def fetch_paths_by_category(self, category_id: int) -> List[Dict[str, Any]]:
        """Fetch learning paths for a specific category"""
        try:
            logger.info(f"Fetching paths for category_id: {category_id}")
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(
                    f"{self.url}/rest/v1/paths",
                    headers=self.headers,
                    params={
                        "category_id": f"eq.{category_id}",
                        "select": "*,tasks(*)"
                    }
                )
                response.raise_for_status()
                data = response.json()
                logger.info(f"Successfully fetched {len(data)} paths for category {category_id}")
                return data
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching paths: {e.response.status_code} - {e.response.text}")
            return []
        except Exception as e:
            logger.error(f"Error fetching paths: {e}")
            return []

    async def test_connection(self) -> bool:
        """Test the Supabase connection"""
        try:
            logger.info("Testing Supabase connection")
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.url}/rest/v1/categories",
                    headers=self.headers,
                    params={"select": "count", "limit": 1}
                )
                response.raise_for_status()
                logger.info("Supabase connection test successful")
                return True
        except Exception as e:
            logger.error(f"Supabase connection test failed: {e}")
            return False


# Global instance
supabase_client = SupabaseClient()
