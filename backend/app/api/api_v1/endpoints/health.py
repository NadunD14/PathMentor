from fastapi import APIRouter, HTTPException
from app.services.supabase_service import supabase_client

router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {"status": "healthy", "service": "PathMentor Backend"}


@router.get("/health/database")
async def database_health_check():
    """Check Supabase database connection"""
    try:
        is_connected = await supabase_client.test_connection()
        if is_connected:
            return {
                "status": "healthy", 
                "database": "connected",
                "type": "supabase"
            }
        else:
            raise HTTPException(status_code=503, detail="Database connection failed")
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Database health check failed: {str(e)}")


@router.get("/health/ml")
async def ml_health_check():
    """Check ML service availability"""
    try:
        from app.services.ml_service import MLService
        ml_service = MLService()
        
        # Test embeddings generation
        test_embeddings = ml_service.generate_embeddings("test")
        
        return {
            "status": "healthy",
            "ml_service": "available",
            "embeddings_model": "loaded" if len(test_embeddings) > 0 else "fallback",
            "embedding_dimension": len(test_embeddings)
        }
    except Exception as e:
        return {
            "status": "degraded",
            "ml_service": "limited",
            "error": str(e)
        }
