"""
Database connection management.
"""

import os
import logging
from typing import Optional
from supabase import create_client, Client

from core.config import settings
from core.logging import get_logger

logger = get_logger(__name__)


class DatabaseConnection:
    """Manages database connections and health checks."""
    
    def __init__(self):
        """Initialize database connection."""
        self.url = settings.supabase_url or os.getenv("SUPABASE_URL")
        self.key = (
            settings.supabase_service_role_key 
            or settings.supabase_anon_key
            or settings.supabase_key 
            or os.getenv("SUPABASE_SERVICE_ROLE_KEY") 
            or os.getenv("SUPABASE_ANON_KEY")
        )
        
        if not self.url or not self.key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured"
            )
        
        self._client: Optional[Client] = None
        
    @property
    def client(self) -> Client:
        """Get or create Supabase client."""
        if self._client is None:
            self._client = create_client(self.url, self.key)
            logger.info("Database connection established")
        return self._client
    
    async def health_check(self) -> bool:
        """Check database connection health."""
        try:
            result = self.client.table("users").select("user_id").limit(1).execute()
            logger.info("Database health check passed")
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False
    
    async def close(self) -> None:
        """Close database connection."""
        if self._client:
            # Supabase client doesn't have explicit close method
            self._client = None
            logger.info("Database connection closed")


# Global database connection instance
_db_connection: Optional[DatabaseConnection] = None


def get_database() -> DatabaseConnection:
    """Get global database connection instance."""
    global _db_connection
    if _db_connection is None:
        _db_connection = DatabaseConnection()
    return _db_connection