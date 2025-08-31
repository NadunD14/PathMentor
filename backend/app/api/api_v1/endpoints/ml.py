from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from app.schemas.ml import (
    RecommendationRequest, 
    RecommendationResponse, 
    ProgressAnalysis,
    CompleteSetupRequest,
    CompleteSetupResponse
)
from app.services.ml_service import MLService

router = APIRouter()
ml_service = MLService()


@router.post("/complete-setup", response_model=CompleteSetupResponse)
async def complete_setup_analysis(request: CompleteSetupRequest):
    """Process user's completed questionnaire and perform ML analysis"""
    try:
        result = await ml_service.complete_setup_analysis(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"ML analysis failed: {str(e)}")


@router.post("/recommendations", response_model=List[RecommendationResponse])
async def get_recommendations(request: RecommendationRequest):
    """Get ML-powered learning recommendations"""
    try:
        recommendations = ml_service.get_recommendations(
            user_id=request.user_id,
            learning_goals=request.learning_goals,
            skill_level=request.current_skill_level
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendations failed: {str(e)}")


@router.post("/analyze-progress", response_model=ProgressAnalysis)
async def analyze_progress(user_id: int, user_answers: List[Dict[str, Any]] = None):
    """Analyze user's learning progress using ML"""
    try:
        analysis = ml_service.analyze_progress(user_id, user_answers or [])
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Progress analysis failed: {str(e)}")


@router.post("/chat-response")
async def get_chat_response(message: str, context: Dict[str, Any] = None):
    """Get AI chatbot response"""
    # TODO: Implement AI chat logic
    return {"response": "This is a placeholder response", "confidence": 0.8}


@router.post("/embeddings")
async def generate_embeddings(text: str):
    """Generate embeddings for text content"""
    try:
        embeddings = ml_service.generate_embeddings(text)
        return {"embeddings": embeddings, "dimension": len(embeddings)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embeddings generation failed: {str(e)}")
