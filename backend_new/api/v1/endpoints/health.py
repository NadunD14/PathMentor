"""
Health check endpoint.
"""

from fastapi import APIRouter
from datetime import datetime

from models.schemas import HealthResponse
from database import get_database
from core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    try:
        # Test database connection
        db = get_database()
        db_healthy = await db.health_check()
        
        if db_healthy:
            return HealthResponse(
                status="healthy",
                service="PathMentor Backend",
                version="1.0.0"
            )
        else:
            return HealthResponse(
                status="unhealthy",
                service="PathMentor Backend",
                version="1.0.0"
            )
            
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="unhealthy",
            service="PathMentor Backend",
            version="1.0.0"
        )