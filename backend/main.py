from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv
from typing import List, Dict, Any
import uuid
from datetime import datetime

# Import our models and services
from models import (
    LearningPathRequest, LearningPathResponse, LearningPath,
    UserLearningProfile, APIResponse
)
from services.query_generator import QueryGenerator
from services.scraper_manager import ScraperManager
from services.ranking_service import RankingService
from services.path_builder import PathBuilder
from database import db_manager

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="PathMentor Learning Path Generator API",
    description="A personalized learning path generator that fetches resources from YouTube, Udemy, and Reddit",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
query_generator = QueryGenerator()
scraper_manager = ScraperManager()
ranking_service = RankingService()
path_builder = PathBuilder()


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "PathMentor Learning Path Generator API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "generate_path": "/api/generate-learning-path",
            "get_path": "/api/learning-path/{path_id}",
            "user_paths": "/api/user/{user_id}/learning-paths",
            "health": "/health"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": "connected" if db_manager else "unavailable",
            "query_generator": "active",
            "scraper_manager": "active",
            "ranking_service": "active",
            "path_builder": "active"
        }
    }


@app.post("/api/generate-learning-path", response_model=LearningPathResponse)
async def generate_learning_path(
    request: LearningPathRequest,
    background_tasks: BackgroundTasks
):
    """
    Generate a personalized learning path based on user profile
    
    This endpoint:
    1. Takes user learning profile
    2. Generates targeted search queries
    3. Fetches resources from YouTube, Udemy, Reddit
    4. Ranks resources based on user preferences
    5. Builds a structured learning path
    6. Saves the path to database
    """
    try:
        user_profile = request.user_profile
        
        # Step 1: Generate search queries based on user profile
        queries = query_generator.generate_queries(user_profile)
        
        if not queries:
            raise HTTPException(
                status_code=400,
                detail="Unable to generate search queries from user profile"
            )
        
        # Step 2: Fetch resources from all sources
        raw_resources = await scraper_manager.fetch_all_resources(queries)
        
        # Combine all resources
        all_resources = []
        for source, resources in raw_resources.items():
            all_resources.extend(resources)
        
        if not all_resources:
            raise HTTPException(
                status_code=404,
                detail="No learning resources found for the given profile"
            )
        
        # Step 3: Rank resources based on user profile
        ranked_resources = ranking_service.rank_resources(all_resources, user_profile)
        
        # Step 4: Apply quality filters and diversification
        filtered_resources = ranking_service.filter_by_quality_threshold(ranked_resources, min_rating=2.0)
        diversified_resources = ranking_service.diversify_results(filtered_resources, max_per_source=5)
        
        # Step 5: Build the learning path
        learning_path = path_builder.build_learning_path(user_profile, diversified_resources)
        
        # Step 6: Save to database (in background)
        background_tasks.add_task(save_learning_path_async, learning_path.dict())
        
        # Step 7: Log the generation for analytics
        background_tasks.add_task(log_path_generation, user_profile.dict(), len(diversified_resources))
        
        return LearningPathResponse(
            success=True,
            learning_path=learning_path,
            message=f"Successfully generated learning path with {len(diversified_resources)} resources",
            path_id=learning_path.path_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating learning path: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.get("/api/learning-path/{path_id}")
async def get_learning_path(path_id: str):
    """Retrieve a specific learning path by ID"""
    try:
        path_data = await db_manager.get_learning_path(path_id)
        
        if not path_data:
            raise HTTPException(
                status_code=404,
                detail=f"Learning path with ID {path_id} not found"
            )
        
        return APIResponse(
            success=True,
            data=path_data,
            message="Learning path retrieved successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error retrieving learning path: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.get("/api/user/{user_id}/learning-paths")
async def get_user_learning_paths(user_id: str):
    """Get all learning paths for a specific user"""
    try:
        paths = await db_manager.get_user_learning_paths(user_id)
        
        return APIResponse(
            success=True,
            data={
                "user_id": user_id,
                "paths_count": len(paths),
                "learning_paths": paths
            },
            message=f"Retrieved {len(paths)} learning paths for user"
        )
        
    except Exception as e:
        print(f"Error retrieving user learning paths: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.post("/api/search-resources")
async def search_resources(
    query: str,
    source: str = "all",
    content_type: str = "all",
    limit: int = 10
):
    """Search for learning resources from a specific source"""
    try:
        if source == "all":
            # Search all sources
            from models import SearchQuery
            search_query = SearchQuery(
                query=query,
                source="youtube",  # Will be overridden
                difficulty="all",
                content_type=content_type
            )
            
            results = {}
            for src in ["youtube", "udemy", "reddit"]:
                search_query.source = src
                resources = await scraper_manager.fetch_specific_content(
                    src, query, content_type, limit
                )
                results[src] = resources
            
            # Combine results
            all_results = []
            for src_resources in results.values():
                all_results.extend(src_resources)
            
            return APIResponse(
                success=True,
                data={
                    "query": query,
                    "total_results": len(all_results),
                    "by_source": {k: len(v) for k, v in results.items()},
                    "resources": all_results[:limit]
                },
                message=f"Found {len(all_results)} resources"
            )
        else:
            # Search specific source
            resources = await scraper_manager.fetch_specific_content(
                source, query, content_type, limit
            )
            
            return APIResponse(
                success=True,
                data={
                    "query": query,
                    "source": source,
                    "total_results": len(resources),
                    "resources": resources
                },
                message=f"Found {len(resources)} resources from {source}"
            )
            
    except Exception as e:
        print(f"Error searching resources: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.get("/api/statistics")
async def get_api_statistics():
    """Get API usage statistics"""
    try:
        # This would fetch real statistics from the database
        # For now, return mock statistics
        stats = {
            "total_paths_generated": 1250,
            "total_users": 385,
            "popular_topics": [
                {"topic": "React", "count": 156},
                {"topic": "Python", "count": 134},
                {"topic": "Machine Learning", "count": 98},
                {"topic": "Node.js", "count": 87},
                {"topic": "Data Science", "count": 76}
            ],
            "resources_by_source": {
                "youtube": 4520,
                "udemy": 1870,
                "reddit": 2340
            },
            "average_path_rating": 4.3,
            "uptime": "99.8%"
        }
        
        return APIResponse(
            success=True,
            data=stats,
            message="API statistics retrieved successfully"
        )
        
    except Exception as e:
        print(f"Error retrieving statistics: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


# Background task functions
async def save_learning_path_async(learning_path_data: Dict[str, Any]):
    """Save learning path to database in background"""
    try:
        await db_manager.save_learning_path(learning_path_data)
        print(f"Successfully saved learning path {learning_path_data.get('path_id')}")
    except Exception as e:
        print(f"Error saving learning path: {str(e)}")


async def log_path_generation(user_profile_data: Dict[str, Any], resource_count: int):
    """Log path generation for analytics"""
    try:
        log_data = {
            "user_id": user_profile_data.get("user_id"),
            "topic": user_profile_data.get("topic"),
            "experience_level": user_profile_data.get("experience_level"),
            "goal": user_profile_data.get("goal"),
            "resource_count": resource_count,
            "timestamp": datetime.utcnow().isoformat()
        }
        # This would save to an analytics/logging table
        print(f"Path generation logged: {log_data}")
    except Exception as e:
        print(f"Error logging path generation: {str(e)}")


# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "message": "Request failed"
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "message": str(exc)
        }
    )


if __name__ == "__main__":
    # Run the application
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Enable auto-reload during development
        log_level="info"
    )
