from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, Union
from app.db.database import get_db
from app.services.learning_service import LearningService
from app.schemas.learning import (
    UserLearningProfile,
    UserLearningProfileCreate,
    UserLearningProfileUpdate,
    BaseActivityResult,
    MemoryChallengeResult,
    ProblemSolvingResult,
    AudioVisualResult,
    ReadingWritingResult,
    LearningType,
    LearningTypePrediction,
    PersonalizedRecommendations,
    BehaviorTrackingData
)

router = APIRouter(prefix="/learning", tags=["learning"])

@router.post("/profile", response_model=UserLearningProfile)
async def create_learning_profile(
    profile_data: UserLearningProfileCreate,
    db: Session = Depends(get_db)
):
    """Create a new user learning profile."""
    learning_service = LearningService(db)
    try:
        profile = learning_service.create_user_profile(profile_data)
        return profile
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create learning profile: {str(e)}"
        )

@router.get("/profile/{user_id}", response_model=UserLearningProfile)
async def get_learning_profile(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get user learning profile by ID."""
    learning_service = LearningService(db)
    profile = learning_service.get_user_profile(user_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning profile not found"
        )
    
    return profile

@router.put("/profile", response_model=UserLearningProfile)
async def update_learning_profile(
    profile_update: UserLearningProfileUpdate,
    user_id: str,
    db: Session = Depends(get_db)
):
    """Update user learning profile."""
    learning_service = LearningService(db)
    updated_profile = learning_service.update_user_profile(user_id, profile_update)
    
    if not updated_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Learning profile not found"
        )
    
    return updated_profile

@router.post("/activity-result")
async def save_activity_result(
    result: Union[MemoryChallengeResult, ProblemSolvingResult, AudioVisualResult, ReadingWritingResult],
    db: Session = Depends(get_db)
):
    """Save activity result and update learning scores."""
    learning_service = LearningService(db)
    
    try:
        success = learning_service.save_activity_result(result)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save activity result"
            )
        
        return {"message": "Activity result saved successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving activity result: {str(e)}"
        )

@router.post("/predict-learning-type", response_model=LearningTypePrediction)
async def predict_learning_type(
    behavior_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Get ML model prediction for learning type."""
    learning_service = LearningService(db)
    
    try:
        prediction = learning_service.predict_learning_type(behavior_data)
        return prediction
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to predict learning type: {str(e)}"
        )

@router.get("/recommendations", response_model=PersonalizedRecommendations)
async def get_personalized_recommendations(
    user_id: str,
    learning_type: LearningType,
    current_path: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get personalized content recommendations."""
    learning_service = LearningService(db)
    
    try:
        recommendations = learning_service.get_personalized_recommendations(
            user_id, learning_type, current_path
        )
        return recommendations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get recommendations: {str(e)}"
        )

@router.post("/track-behavior")
async def track_user_behavior(
    tracking_data: BehaviorTrackingData,
    db: Session = Depends(get_db)
):
    """Track user behavior for ML model improvement."""
    learning_service = LearningService(db)
    
    try:
        success = learning_service.track_user_behavior(tracking_data.dict())
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to track user behavior"
            )
        
        return {"message": "User behavior tracked successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error tracking behavior: {str(e)}"
        )

@router.post("/training-data")
async def send_training_data(
    training_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Send training data to ML model."""
    # This would typically send data to an ML training pipeline
    # For now, just acknowledge receipt
    
    try:
        # Process training data
        data_count = len(training_data.get("trainingData", []))
        
        return {
            "message": f"Training data received successfully",
            "data_points": data_count,
            "status": "queued_for_training"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing training data: {str(e)}"
        )

@router.get("/learning-type-description")
async def get_learning_type_description(
    learning_type: LearningType,
    db: Session = Depends(get_db)
):
    """Get description and characteristics of a learning type."""
    learning_service = LearningService(db)
    
    try:
        description = learning_service.get_learning_type_description(learning_type)
        if not description:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Learning type description not found"
            )
        
        return description
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error getting learning type description: {str(e)}"
        )

@router.get("/assessment-config")
async def get_assessment_config():
    """Get configuration for learning type assessment activities."""
    from app.schemas.learning import ActivityConfig, ActivityType
    
    configs = [
        ActivityConfig(
            id="memory_challenge",
            type=ActivityType.MEMORY_CHALLENGE,
            title="Memory Challenge",
            description="Test your visual memory with patterns and shapes",
            estimated_duration=7,
            difficulty=2,
            required_for_assessment=True
        ),
        ActivityConfig(
            id="problem_solving",
            type=ActivityType.PROBLEM_SOLVING,
            title="Interactive Puzzle",
            description="Solve problems using hands-on interaction",
            estimated_duration=10,
            difficulty=3,
            required_for_assessment=True
        ),
        ActivityConfig(
            id="audio_visual",
            type=ActivityType.AUDIO_VISUAL,
            title="Audio-Visual Learning",
            description="Learn from multimedia content",
            estimated_duration=8,
            difficulty=2,
            required_for_assessment=True
        ),
        ActivityConfig(
            id="reading_writing",
            type=ActivityType.READING_WRITING,
            title="Reading & Writing",
            description="Engage with text-based materials",
            estimated_duration=12,
            difficulty=3,
            required_for_assessment=True
        )
    ]
    
    return {"activities": configs}

@router.get("/statistics/{user_id}")
async def get_user_learning_statistics(
    user_id: str,
    db: Session = Depends(get_db)
):
    """Get user learning statistics and progress."""
    learning_service = LearningService(db)
    profile = learning_service.get_user_profile(user_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found"
        )
    
    # Calculate statistics
    total_score = (
        profile.learning_type_scores.visual +
        profile.learning_type_scores.auditory +
        profile.learning_type_scores.kinesthetic +
        profile.learning_type_scores.reading_writing
    )
    
    score_percentages = {
        "visual": round((profile.learning_type_scores.visual / total_score) * 100) if total_score > 0 else 0,
        "auditory": round((profile.learning_type_scores.auditory / total_score) * 100) if total_score > 0 else 0,
        "kinesthetic": round((profile.learning_type_scores.kinesthetic / total_score) * 100) if total_score > 0 else 0,
        "reading_writing": round((profile.learning_type_scores.reading_writing / total_score) * 100) if total_score > 0 else 0
    }
    
    return {
        "user_id": user_id,
        "primary_learning_type": profile.primary_learning_type,
        "confidence": profile.confidence,
        "assessment_complete": profile.assessment_complete,
        "activities_completed": len(profile.activities_completed),
        "total_activities": profile.total_activities,
        "progress_percentage": round((len(profile.activities_completed) / profile.total_activities) * 100),
        "score_percentages": score_percentages,
        "last_updated": profile.last_updated
    }
