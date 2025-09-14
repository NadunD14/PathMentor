"""API endpoints package."""

from .health import router as health_router
from .learning_paths import router as learning_paths_router
from .feedback import router as feedback_router
from .ml import router as ml_router

__all__ = [
    "health_router",
    "learning_paths_router", 
    "feedback_router",
    "ml_router",
]