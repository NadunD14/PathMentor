"""
ML setup endpoint for completing user questionnaire analysis.
"""

from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime
from pydantic import BaseModel, Field

# Initialize router
router = APIRouter(prefix="/api/v1/ml", tags=["ml"])

# Initialize logger
logger = logging.getLogger(__name__)


class UserAnswer(BaseModel):
    """User answer data from frontend."""
    answer_id: int
    question_id: int
    answer_text: Optional[str] = None
    option_id: Optional[int] = None
    category_id: Optional[int] = None
    created_at: str
    general_questions: Optional[Dict[str, Any]] = None
    question_options: Optional[Dict[str, Any]] = None


class UserCategory(BaseModel):
    """User category selection data from frontend."""
    selection_id: int
    category_id: int
    created_at: str
    categories: Optional[Dict[str, Any]] = None


class MLCompleteSetupRequest(BaseModel):
    """Request model for ML complete setup."""
    user_id: str = Field(..., description="User ID")
    answers: List[UserAnswer] = Field(..., description="User's questionnaire answers")
    selected_categories: List[UserCategory] = Field(..., description="User's selected categories")
    timestamp: str = Field(..., description="Request timestamp")


class MLCompleteSetupResponse(BaseModel):
    """Response model for ML complete setup."""
    success: bool
    analysis: Dict[str, Any]
    learning_profile: Dict[str, Any]
    recommendations: List[Dict[str, Any]]
    message: str


@router.post("/complete-setup", response_model=MLCompleteSetupResponse)
async def complete_ml_setup(request: MLCompleteSetupRequest) -> MLCompleteSetupResponse:
    """
    Complete ML setup analysis based on user questionnaire responses.
    
    This endpoint processes user answers and category selections to:
    1. Analyze learning preferences and style
    2. Generate learning profile recommendations
    3. Create initial learning path suggestions
    """
    try:
        logger.info(f"Processing ML setup for user: {request.user_id}")
        
        # Analyze user responses
        learning_profile = analyze_learning_profile(request.answers, request.selected_categories)
        
        # Generate recommendations based on analysis
        recommendations = generate_recommendations(learning_profile, request.selected_categories)
        
        # Create analysis summary
        analysis = {
            "user_id": request.user_id,
            "processed_at": datetime.utcnow().isoformat(),
            "answers_count": len(request.answers),
            "categories_count": len(request.selected_categories),
            "learning_style": learning_profile.get("primary_learning_style"),
            "experience_level": learning_profile.get("experience_level"),
            "preferred_duration": learning_profile.get("preferred_session_duration"),
            "confidence_score": learning_profile.get("confidence_score", 0.85)
        }
        
        logger.info(f"ML analysis completed for user {request.user_id}")
        
        return MLCompleteSetupResponse(
            success=True,
            analysis=analysis,
            learning_profile=learning_profile,
            recommendations=recommendations,
            message="ML analysis completed successfully"
        )
        
    except Exception as e:
        logger.error(f"Error in ML setup: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to complete ML setup: {str(e)}"
        )


def analyze_learning_profile(answers: List[UserAnswer], categories: List[UserCategory]) -> Dict[str, Any]:
    """
    Analyze user answers to determine learning profile.
    
    This is a simplified version - in production this would use ML models.
    """
    
    # Extract learning style preferences from answers
    learning_styles = {"visual": 0, "auditory": 0, "kinesthetic": 0, "reading_writing": 0}
    experience_levels = {"beginner": 0, "intermediate": 0, "advanced": 0}
    session_durations = {"short": 0, "medium": 0, "long": 0}
    
    for answer in answers:
        answer_text = answer.answer_text or ""
        
        # Simple keyword-based analysis (replace with actual ML in production)
        if any(word in answer_text.lower() for word in ["visual", "see", "watch", "diagram", "chart"]):
            learning_styles["visual"] += 1
        elif any(word in answer_text.lower() for word in ["listen", "audio", "hear", "explain"]):
            learning_styles["auditory"] += 1
        elif any(word in answer_text.lower() for word in ["practice", "hands-on", "try", "do"]):
            learning_styles["kinesthetic"] += 1
        elif any(word in answer_text.lower() for word in ["read", "text", "book", "article"]):
            learning_styles["reading_writing"] += 1
            
        # Analyze experience level
        if any(word in answer_text.lower() for word in ["beginner", "new", "start", "basic"]):
            experience_levels["beginner"] += 1
        elif any(word in answer_text.lower() for word in ["intermediate", "some", "familiar"]):
            experience_levels["intermediate"] += 1
        elif any(word in answer_text.lower() for word in ["advanced", "expert", "experienced"]):
            experience_levels["advanced"] += 1
            
        # Analyze session duration preferences
        if any(word in answer_text.lower() for word in ["short", "quick", "15", "20", "30"]):
            session_durations["short"] += 1
        elif any(word in answer_text.lower() for word in ["hour", "60", "90"]):
            session_durations["medium"] += 1
        elif any(word in answer_text.lower() for word in ["long", "2", "3", "hours"]):
            session_durations["long"] += 1
    
    # Determine primary preferences
    primary_learning_style = max(learning_styles, key=learning_styles.get)
    primary_experience_level = max(experience_levels, key=experience_levels.get)
    preferred_duration = max(session_durations, key=session_durations.get)
    
    # Calculate confidence based on answer consistency
    total_answers = len(answers)
    confidence_score = min(0.95, 0.5 + (total_answers * 0.05))
    
    return {
        "primary_learning_style": primary_learning_style,
        "learning_style_distribution": learning_styles,
        "experience_level": primary_experience_level,
        "experience_distribution": experience_levels,
        "preferred_session_duration": preferred_duration,
        "duration_distribution": session_durations,
        "confidence_score": confidence_score,
        "total_answers_analyzed": total_answers,
        "selected_categories": [cat.category_id for cat in categories]
    }


def generate_recommendations(learning_profile: Dict[str, Any], categories: List[UserCategory]) -> List[Dict[str, Any]]:
    """
    Generate learning recommendations based on profile analysis.
    """
    recommendations = []
    
    learning_style = learning_profile.get("primary_learning_style", "visual")
    experience_level = learning_profile.get("experience_level", "beginner")
    
    # Platform recommendations based on learning style
    if learning_style == "visual":
        recommendations.append({
            "type": "platform",
            "title": "YouTube Learning",
            "description": "Video-based learning content matches your visual learning preference",
            "platform": "youtube",
            "priority": "high",
            "reasoning": "Visual learners benefit from video demonstrations and tutorials"
        })
    elif learning_style == "auditory":
        recommendations.append({
            "type": "platform", 
            "title": "Podcast Learning",
            "description": "Audio-based content suits your auditory learning style",
            "platform": "podcast",
            "priority": "high",
            "reasoning": "Auditory learners excel with spoken explanations and discussions"
        })
    elif learning_style == "kinesthetic":
        recommendations.append({
            "type": "platform",
            "title": "Interactive Coding Platforms",
            "description": "Hands-on practice aligns with your kinesthetic learning style",
            "platform": "interactive",
            "priority": "high",
            "reasoning": "Kinesthetic learners need practical, hands-on experiences"
        })
    else:  # reading_writing
        recommendations.append({
            "type": "platform",
            "title": "Documentation and Articles",
            "description": "Text-based resources match your reading/writing preference",
            "platform": "articles",
            "priority": "high",
            "reasoning": "Reading/writing learners prefer detailed written content"
        })
    
    # Experience level recommendations
    if experience_level == "beginner":
        recommendations.append({
            "type": "content",
            "title": "Fundamentals First",
            "description": "Start with foundational concepts and basic tutorials",
            "priority": "high",
            "reasoning": "Building strong fundamentals is crucial for beginners"
        })
    elif experience_level == "intermediate":
        recommendations.append({
            "type": "content",
            "title": "Project-Based Learning",
            "description": "Apply knowledge through practical projects and challenges",
            "priority": "high",
            "reasoning": "Intermediate learners benefit from applying existing knowledge"
        })
    else:  # advanced
        recommendations.append({
            "type": "content",
            "title": "Advanced Topics and Specialization",
            "description": "Focus on advanced concepts and specialized domains",
            "priority": "high",
            "reasoning": "Advanced learners need challenging, specialized content"
        })
    
    # Category-specific recommendations
    for category in categories:
        category_name = category.categories.get("name", "Unknown") if category.categories else "Unknown"
        recommendations.append({
            "type": "category",
            "title": f"{category_name} Learning Path",
            "description": f"Personalized learning path for {category_name}",
            "category_id": category.category_id,
            "priority": "medium",
            "reasoning": f"Based on your selection of {category_name} as an area of interest"
        })
    
    return recommendations