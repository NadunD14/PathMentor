"""
Main FastAPI application for PathMentor backend.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import os
from contextlib import asynccontextmanager

from database.supabase_client import SupabaseClient

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("Starting PathMentor backend...")
    
    # Initialize database connection
    try:
        supabase_client = SupabaseClient()
        await supabase_client.health_check()
        logger.info("Database connection established")
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down PathMentor backend...")


# Create FastAPI application
app = FastAPI(
    title="PathMentor API",
    description="AI-powered personalized learning path generation service",
    version="1.0.0",
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

# Include routers; attempt each independently so one bad import doesn't block others
try:
    from api.endpoints import ml_setup
    app.include_router(ml_setup.router)
    logger.info("Registered ml_setup router")
except Exception as e:
    logger.warning(f"Failed to register ml_setup router: {e}")

try:
    from api.endpoints import feedback
    app.include_router(feedback.router)
    logger.info("Registered feedback router")
except Exception as e:
    logger.warning(f"Failed to register feedback router: {e}")

try:
    from api.endpoints import generate_path
    app.include_router(generate_path.router)
    logger.info("Registered generate_path router")
except Exception as e:
    logger.warning(f"Failed to register generate_path router: {e}")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to PathMentor API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "PathMentor Backend",
        "version": "1.0.0"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler."""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    )
