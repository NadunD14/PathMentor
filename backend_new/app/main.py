"""
Main FastAPI application.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from core.config import settings
from core.logging import configure_logging, get_logger
from database import get_database
from api import api_router

# Configure logging
configure_logging("INFO" if not settings.debug else "DEBUG")
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("Starting PathMentor backend...")
    
    # Initialize database connection
    try:
        db = get_database()
        health_ok = await db.health_check()
        if health_ok:
            logger.info("Database connection established")
        else:
            logger.warning("Database health check failed")
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        # Don't raise - allow app to start even if DB is down
    
    yield
    
    # Shutdown
    logger.info("Shutting down PathMentor backend...")
    try:
        db = get_database()
        await db.close()
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    description="AI-powered personalized learning path generation service",
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "docs": "/docs"
    }


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler."""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )