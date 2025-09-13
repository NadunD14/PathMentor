"""
Base repository class for database operations.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, Type, TypeVar
import logging

from database.connection import get_database
from core.logging import get_logger

logger = get_logger(__name__)

T = TypeVar('T')


class BaseRepository(ABC):
    """Base repository class for database operations."""
    
    def __init__(self, table_name: str):
        """Initialize repository with table name."""
        self.table_name = table_name
        self.db = get_database()
    
    @property
    def table(self):
        """Get table reference."""
        return self.db.client.table(self.table_name)
    
    async def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new record."""
        try:
            result = self.table.insert(data).execute()
            if result.data:
                logger.info(f"Created record in {self.table_name}")
                return result.data[0]
            raise Exception("No data returned from insert")
        except Exception as e:
            logger.error(f"Error creating record in {self.table_name}: {e}")
            raise
    
    async def get_by_id(self, id_field: str, id_value: Any) -> Optional[Dict[str, Any]]:
        """Get record by ID."""
        try:
            result = self.table.select("*").eq(id_field, id_value).execute()
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error getting record from {self.table_name}: {e}")
            raise
    
    async def get_all(self, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Get all records with optional filters."""
        try:
            query = self.table.select("*")
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            result = query.execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting records from {self.table_name}: {e}")
            raise
    
    async def update(self, id_field: str, id_value: Any, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update record by ID."""
        try:
            result = self.table.update(data).eq(id_field, id_value).execute()
            if result.data:
                logger.info(f"Updated record in {self.table_name}")
                return result.data[0]
            raise Exception("No data returned from update")
        except Exception as e:
            logger.error(f"Error updating record in {self.table_name}: {e}")
            raise
    
    async def delete(self, id_field: str, id_value: Any) -> bool:
        """Delete record by ID."""
        try:
            result = self.table.delete().eq(id_field, id_value).execute()
            logger.info(f"Deleted record from {self.table_name}")
            return True
        except Exception as e:
            logger.error(f"Error deleting record from {self.table_name}: {e}")
            raise