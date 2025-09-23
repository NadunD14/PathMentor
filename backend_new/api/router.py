"""
Main API router configuration.
"""

from fastapi import APIRouter
from .v1 import health_router, learning_paths_router, feedback_router, users_router

# Create main API router
api_router = APIRouter(prefix="/api/v1")

# Include all endpoint routers
api_router.include_router(health_router)
api_router.include_router(learning_paths_router)
api_router.include_router(feedback_router)
api_router.include_router(users_router)